const PDFDocument = require('pdfkit');

/**
 * Buat PDF stream berisi laporan hasil seleksi SAW.
 */
function streamLaporanSAW({ lowongan, perusahaan, kriteria, hasil }, res) {
  const doc = new PDFDocument({ margin: 50, size: 'A4' });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `inline; filename="laporan-seleksi-${lowongan._id}.pdf"`
  );
  doc.pipe(res);

  // Header
  doc.fontSize(16).text('LAPORAN HASIL SELEKSI KARYAWAN', { align: 'center' });
  doc.fontSize(11).text('Metode: Simple Additive Weighting (SAW)', { align: 'center' });
  doc.moveDown();

  doc.fontSize(11);
  doc.text(`Perusahaan : ${perusahaan?.namaPerusahaan || '-'}`);
  doc.text(`Lowongan   : ${lowongan.judul} (${lowongan.posisi})`);
  doc.text(`Tanggal    : ${new Date().toLocaleString('id-ID')}`);
  doc.moveDown();

  // Kriteria & bobot
  doc.fontSize(12).text('Kriteria & Bobot', { underline: true });
  doc.fontSize(10);
  kriteria.forEach((k) => {
    doc.text(`  ${k.kode}. ${k.nama}  (bobot=${k.bobot}, tipe=${k.tipe})`);
  });
  doc.moveDown();

  // Tabel ranking
  doc.fontSize(12).text('Ranking Pelamar', { underline: true });
  doc.moveDown(0.5);

  const startX = 50;
  let y = doc.y;
  const colWidths = [40, 160, 160, 80, 60];
  const headers = ['Rank', 'Nama', 'Email', 'Skor SAW', 'Status'];

  doc.fontSize(10).font('Helvetica-Bold');
  let x = startX;
  headers.forEach((h, i) => {
    doc.text(h, x, y, { width: colWidths[i] });
    x += colWidths[i];
  });
  doc.moveTo(startX, y + 15).lineTo(550, y + 15).stroke();
  y += 22;
  doc.font('Helvetica');

  hasil.forEach((h) => {
    if (y > 760) {
      doc.addPage();
      y = 50;
    }
    x = startX;
    const row = [
      String(h.ranking),
      h.nama || '-',
      h.email || '-',
      h.skor.toFixed(4),
      h.statusKeseluruhan,
    ];
    row.forEach((cell, i) => {
      doc.text(cell, x, y, { width: colWidths[i] });
      x += colWidths[i];
    });
    y += 20;
  });

  doc.moveDown(2);
  doc.fontSize(9).text('— Dihasilkan otomatis oleh Sistem Pendukung Keputusan SAW —', {
    align: 'center',
  });

  doc.end();
}

module.exports = { streamLaporanSAW };
