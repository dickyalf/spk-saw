const Lamaran = require('../models/Lamaran');
const Kriteria = require('../models/Kriteria');
const CV = require('../models/CV');
const Wawancara = require('../models/Wawancara');
const { hitungSAW } = require('./sawService');

/**
 * Ambil nilai mentah pelamar berdasarkan kategori kriteria.
 */
async function ambilNilai(lamaran, kriteria) {
  const cv = await CV.findById(lamaran.cvSnapshot);

  switch (kriteria.kategori) {
    case 'pendidikan':
      return cv ? cv.skorPendidikan() : 0;

    case 'pengalaman':
      return cv ? cv.totalPengalamanTahun() : 0;

    case 'tes':
      return lamaran?.tes?.nilai ?? 0;

    case 'wawancara': {
      if (lamaran?.wawancara?.nilai != null) return lamaran.wawancara.nilai;
      const w = await Wawancara.findOne({ lamaran: lamaran._id });
      return w?.skorAkhir ?? 0;
    }

    case 'custom':
    default:
      // Bisa dihitung dari catatan / penilaian manual jika dibutuhkan
      return 0;
  }
}

/**
 * Hitung ranking SAW untuk seluruh pelamar di sebuah lowongan.
 * @returns {Array} hasil ranking dengan info kandidat
 */
async function rankingLowongan(lowonganId) {
  const kriteria = await Kriteria.find({ lowongan: lowonganId }).sort({ kode: 1 });
  if (!kriteria.length) {
    throw Object.assign(new Error('Belum ada kriteria SAW untuk lowongan ini'), {
      status: 400,
    });
  }

  // Hanya pelamar yang sudah selesai semua tahap, atau yang punya nilai sebagian
  const lamaran = await Lamaran.find({
    lowongan: lowonganId,
    statusKeseluruhan: { $nin: ['ditolak'] },
  }).populate({
    path: 'pelamar',
    populate: { path: 'user', select: 'email' },
  });

  if (!lamaran.length) return { kriteria, hasil: [] };

  // Bangun alternatif
  const alternatif = [];
  for (const lam of lamaran) {
    const nilai = [];
    for (const k of kriteria) nilai.push(await ambilNilai(lam, k));
    alternatif.push({
      id: lam._id.toString(),
      lamaranId: lam._id,
      nama: lam.pelamar?.namaLengkap || '(tanpa nama)',
      email: lam.pelamar?.user?.email,
      statusKeseluruhan: lam.statusKeseluruhan,
      nilai,
    });
  }

  const hasil = hitungSAW(
    alternatif,
    kriteria.map((k) => ({
      kode: k.kode,
      nama: k.nama,
      bobot: k.bobot,
      tipe: k.tipe,
      kategori: k.kategori,
    }))
  );

  // Cache hasil ke Lamaran
  await Promise.all(
    hasil.map((h) =>
      Lamaran.findByIdAndUpdate(h.lamaranId, {
        skorSAW: h.skor,
        rankingSAW: h.ranking,
      })
    )
  );

  return { kriteria, hasil };
}

module.exports = { rankingLowongan, ambilNilai };
