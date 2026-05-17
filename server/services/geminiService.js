/**
 * Service untuk parsing CV menggunakan Google Gemini API.
 * Bila GEMINI_API_KEY tidak tersedia, fallback ke regex parser sederhana.
 */
const fs = require('fs');
const pdfParse = require('pdf-parse');

let genAI = null;
try {
  const { GoogleGenerativeAI } = require('@google/generative-ai');
  if (process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
} catch (_) {
  /* package belum di-install atau tidak tersedia */
}

const PROMPT = `Kamu adalah ekstraktor data CV. Dari teks CV berikut, ekstrak ke JSON dengan struktur:
{
  "ringkasan": "1-2 kalimat tentang kandidat",
  "pendidikan": [{ "jenjang": "SD|SMP|SMA/SMK|D3|S1|S2|S3", "institusi": "...", "jurusan": "...", "tahunMasuk": 2018, "tahunLulus": 2022, "ipk": 3.5 }],
  "pengalaman": [{ "perusahaan": "...", "posisi": "...", "tahunMulai": 2022, "tahunSelesai": 2024, "deskripsi": "..." }],
  "skills": [{ "nama": "JavaScript", "level": "advanced" }],
  "sertifikat": [{ "nama": "...", "penerbit": "...", "tahun": 2024 }],
  "bahasa": ["Indonesia", "Inggris"]
}
Hanya keluarkan JSON valid, tanpa markdown atau komentar.

Teks CV:
---
{TEXT}
---`;

async function ekstrakTeksDariFile(filePath) {
  if (filePath.toLowerCase().endsWith('.pdf')) {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    return data.text;
  }
  // Fallback: baca sebagai teks
  return fs.readFileSync(filePath, 'utf8');
}

function parseFallbackRegex(text) {
  const skills = [];
  const skillKeywords = [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'PHP', 'Go', 'Rust',
    'React', 'Vue', 'Angular', 'Node.js', 'Express', 'Django', 'Laravel',
    'MongoDB', 'MySQL', 'PostgreSQL', 'Docker', 'Kubernetes', 'AWS', 'GCP',
    'Figma', 'Photoshop', 'Excel', 'Word', 'PowerPoint',
  ];
  for (const s of skillKeywords) {
    if (new RegExp(`\\b${s.replace('.', '\\.')}\\b`, 'i').test(text)) {
      skills.push({ nama: s, level: 'intermediate' });
    }
  }

  // Pendidikan sederhana
  const jenjangMap = ['S3', 'S2', 'S1', 'D3', 'SMA/SMK', 'SMA', 'SMK', 'SMP', 'SD'];
  const pendidikan = [];
  for (const j of jenjangMap) {
    if (new RegExp(`\\b${j}\\b`, 'i').test(text)) {
      pendidikan.push({
        jenjang: j === 'SMA' || j === 'SMK' ? 'SMA/SMK' : j,
        institusi: '',
        jurusan: '',
      });
      break;
    }
  }

  // Tahun pengalaman dari pola "20XX - 20YY" / "20XX - sekarang"
  const pengalaman = [];
  const rangeMatches = text.match(/(19|20)\d{2}\s*[-–]\s*((19|20)\d{2}|sekarang|present)/gi) || [];
  rangeMatches.slice(0, 5).forEach((m) => {
    const parts = m.split(/[-–]/).map((s) => s.trim().toLowerCase());
    const mulai = parseInt(parts[0], 10);
    const selesai =
      parts[1].includes('sekarang') || parts[1].includes('present')
        ? new Date().getFullYear()
        : parseInt(parts[1], 10);
    pengalaman.push({ perusahaan: '', posisi: '', tahunMulai: mulai, tahunSelesai: selesai });
  });

  return {
    ringkasan: '(diparsing dengan regex sederhana — silakan lengkapi manual)',
    pendidikan,
    pengalaman,
    skills,
    sertifikat: [],
    bahasa: [],
  };
}

async function parseCVdariFile(filePath) {
  const text = await ekstrakTeksDariFile(filePath);
  if (!text || text.trim().length < 20) {
    throw Object.assign(new Error('File CV kosong atau tidak terbaca'), { status: 400 });
  }

  if (!genAI) {
    console.warn('⚠️  GEMINI_API_KEY tidak ada, pakai regex fallback');
    return { sumber: 'manual', ...parseFallbackRegex(text) };
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = PROMPT.replace('{TEXT}', text.slice(0, 15000));
    const result = await model.generateContent(prompt);
    const respText = result.response.text().trim();
    // Bersihkan potensi markdown fence
    const jsonText = respText.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
    const parsed = JSON.parse(jsonText);
    return { sumber: 'ai_parsed', ...parsed };
  } catch (err) {
    console.error('Gemini parse error, fallback regex:', err.message);
    return { sumber: 'manual', ...parseFallbackRegex(text) };
  }
}

module.exports = { parseCVdariFile, ekstrakTeksDariFile };
