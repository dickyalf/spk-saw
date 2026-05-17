const Lamaran = require('../models/Lamaran');
const Lowongan = require('../models/Lowongan');
const SoalTes = require('../models/SoalTes');
const JawabanTes = require('../models/JawabanTes');
const Pelamar = require('../models/Pelamar');

/** Pelamar: ambil soal tes untuk lamaran tertentu */
exports.ambilSoal = async (req, res, next) => {
  try {
    const pelamar = await Pelamar.findOne({ user: req.user._id });
    const lamaran = await Lamaran.findOne({ _id: req.params.lamaranId, pelamar: pelamar._id });
    if (!lamaran) return res.status(404).json({ message: 'Lamaran tidak ditemukan' });

    if (lamaran.statusKeseluruhan !== 'tes' && lamaran.tes?.status !== 'sedang')
      return res.status(400).json({
        message: 'Anda belum diperbolehkan mengikuti tes pada tahap ini',
      });

    const lowongan = await Lowongan.findById(lamaran.lowongan).populate('soalTes');
    // Soal yang dikirim ke FE TIDAK menyertakan kunci
    const soalUntukUser = (lowongan.soalTes || []).map((s) => ({
      _id: s._id,
      pertanyaan: s.pertanyaan,
      jenis: s.jenis,
      pilihan: s.pilihan.map((p) => ({ teks: p.teks })),
      kategori: s.kategori,
      bobotNilai: s.bobotNilai,
    }));

    res.json({
      lowongan: { judul: lowongan.judul, durasiTesMenit: lowongan.durasiTesMenit },
      soal: soalUntukUser,
    });
  } catch (err) {
    next(err);
  }
};

/** Pelamar: submit jawaban (auto-grade pilihan ganda) */
exports.submit = async (req, res, next) => {
  try {
    const pelamar = await Pelamar.findOne({ user: req.user._id });
    const lamaran = await Lamaran.findOne({ _id: req.params.lamaranId, pelamar: pelamar._id });
    if (!lamaran) return res.status(404).json({ message: 'Lamaran tidak ditemukan' });

    const { jawaban } = req.body; // [{ soalId, pilihanIndex?, teksJawaban? }]
    if (!Array.isArray(jawaban) || jawaban.length === 0)
      return res.status(400).json({ message: 'Jawaban tidak boleh kosong' });

    const soalIds = jawaban.map((j) => j.soalId);
    const soalList = await SoalTes.find({ _id: { $in: soalIds } });
    const soalMap = new Map(soalList.map((s) => [s._id.toString(), s]));

    let totalBobot = 0;
    let totalSkor = 0;
    const upserts = [];

    for (const j of jawaban) {
      const soal = soalMap.get(j.soalId);
      if (!soal) continue;
      totalBobot += soal.bobotNilai;
      let benar = null;
      let nilai = 0;

      if (soal.jenis === 'pilihan_ganda') {
        const kunciIdx = soal.pilihan.findIndex((p) => p.kunci);
        benar = j.pilihanIndex === kunciIdx;
        nilai = benar ? soal.bobotNilai : 0;
      } else {
        // esai: dapat poin penuh, harus dinilai manual oleh perusahaan
        nilai = 0;
      }
      totalSkor += nilai;
      upserts.push(
        JawabanTes.findOneAndUpdate(
          { lamaran: lamaran._id, soal: soal._id },
          {
            pilihanIndex: j.pilihanIndex ?? null,
            teksJawaban: j.teksJawaban || '',
            benar,
            nilai,
          },
          { upsert: true, new: true }
        )
      );
    }
    await Promise.all(upserts);

    // Hitung nilai 0-100
    const lowongan = await Lowongan.findById(lamaran.lowongan);
    const nilaiAkhir = totalBobot > 0 ? (totalSkor / totalBobot) * 100 : 0;
    const lolos = nilaiAkhir >= (lowongan.nilaiMinimumTes || 60);

    lamaran.tes = {
      status: lolos ? 'lolos' : 'tidak_lolos',
      nilai: Math.round(nilaiAkhir * 100) / 100,
      catatan: 'Auto-grade pilihan ganda',
      diperbaruiPada: new Date(),
    };
    if (lolos) lamaran.statusKeseluruhan = 'wawancara';
    else lamaran.statusKeseluruhan = 'ditolak';
    await lamaran.save();

    res.json({
      message: 'Jawaban diterima',
      nilai: lamaran.tes.nilai,
      lolos,
      lamaran,
    });
  } catch (err) {
    next(err);
  }
};

/** Perusahaan: lihat jawaban pelamar */
exports.jawabanPelamar = async (req, res, next) => {
  try {
    const jawaban = await JawabanTes.find({ lamaran: req.params.lamaranId })
      .populate('soal');
    res.json(jawaban);
  } catch (err) {
    next(err);
  }
};
