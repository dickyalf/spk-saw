const Wawancara = require('../models/Wawancara');
const Lamaran = require('../models/Lamaran');
const { buatNotifikasi } = require('../services/notifikasiService');

/** Perusahaan: jadwalkan wawancara */
exports.jadwalkan = async (req, res, next) => {
  try {
    const lamaran = await Lamaran.findById(req.params.lamaranId).populate({
      path: 'pelamar',
      populate: { path: 'user' },
    });
    if (!lamaran) return res.status(404).json({ message: 'Lamaran tidak ditemukan' });

    const { mode, tanggal, lokasi, linkMeeting, pewawancara } = req.body;
    const w = await Wawancara.findOneAndUpdate(
      { lamaran: lamaran._id },
      { mode, tanggal, lokasi, linkMeeting, pewawancara, status: 'terjadwal' },
      { upsert: true, new: true }
    );

    lamaran.wawancara = {
      status: 'sedang',
      catatan: `Dijadwalkan ${mode} pada ${new Date(tanggal).toLocaleString('id-ID')}`,
      diperbaruiPada: new Date(),
    };
    await lamaran.save();

    await buatNotifikasi({
      userId: lamaran.pelamar.user._id,
      email: lamaran.pelamar.user.email,
      judul: 'Undangan Wawancara',
      pesan:
        mode === 'online'
          ? `Anda diundang wawancara online pada ${new Date(tanggal).toLocaleString('id-ID')}. Link: ${linkMeeting}`
          : `Anda diundang wawancara offline pada ${new Date(tanggal).toLocaleString('id-ID')} di ${lokasi}`,
      tipe: 'info',
      link: `/pelamar/lamaran/${lamaran._id}`,
    });

    res.json(w);
  } catch (err) {
    next(err);
  }
};

/** Perusahaan: input nilai wawancara */
exports.nilai = async (req, res, next) => {
  try {
    const { skorTeknis, skorKomunikasi, skorAttitude, skorMotivasi, catatan } = req.body;
    const scores = [skorTeknis, skorKomunikasi, skorAttitude, skorMotivasi].filter(
      (s) => s != null
    );
    const skorAkhir =
      scores.length > 0
        ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100) / 100
        : null;

    const w = await Wawancara.findOneAndUpdate(
      { lamaran: req.params.lamaranId },
      {
        skorTeknis,
        skorKomunikasi,
        skorAttitude,
        skorMotivasi,
        skorAkhir,
        catatan,
        status: 'selesai',
      },
      { new: true }
    );
    if (!w) return res.status(404).json({ message: 'Wawancara belum dijadwalkan' });

    // Sync ke lamaran
    const lamaran = await Lamaran.findById(req.params.lamaranId);
    lamaran.wawancara = {
      status: 'lolos', // perusahaan dapat menolak via update terpisah
      nilai: skorAkhir,
      catatan,
      diperbaruiPada: new Date(),
    };
    lamaran.statusKeseluruhan = 'ranking';
    await lamaran.save();

    res.json({ wawancara: w, lamaran });
  } catch (err) {
    next(err);
  }
};

/** Get info wawancara untuk satu lamaran (perusahaan atau pelamar) */
exports.detail = async (req, res, next) => {
  try {
    const w = await Wawancara.findOne({ lamaran: req.params.lamaranId });
    res.json(w);
  } catch (err) {
    next(err);
  }
};
