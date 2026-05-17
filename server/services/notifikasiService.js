const Notifikasi = require('../models/Notifikasi');
const { kirimEmail } = require('./emailService');

async function buatNotifikasi({ userId, judul, pesan, tipe = 'info', link, email }) {
  const notif = await Notifikasi.create({
    user: userId,
    judul,
    pesan,
    tipe,
    link,
  });
  if (email) {
    kirimEmail({
      to: email,
      subject: judul,
      html: `<h3>${judul}</h3><p>${pesan}</p>${
        link ? `<p><a href="${process.env.CLIENT_URL}${link}">Buka aplikasi</a></p>` : ''
      }`,
    }).catch((e) => console.error('Email gagal:', e.message));
  }
  return notif;
}

module.exports = { buatNotifikasi };
