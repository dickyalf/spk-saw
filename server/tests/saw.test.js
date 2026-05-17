const {
  normalisasiBobot,
  normalisasiMatriks,
  hitungSAW,
} = require('../services/sawService');

describe('SAW Service', () => {
  test('normalisasi bobot menjadi total 1', () => {
    const k = [
      { kode: 'C1', bobot: 5, tipe: 'benefit' },
      { kode: 'C2', bobot: 3, tipe: 'benefit' },
      { kode: 'C3', bobot: 2, tipe: 'benefit' },
    ];
    const r = normalisasiBobot(k);
    const total = r.reduce((s, x) => s + x.bobot, 0);
    expect(total).toBeCloseTo(1, 5);
  });
 
  test('normalisasi matriks benefit: rij = Xij / max', () => {
    const m = [
      [80, 70],
      [60, 90],
    ];
    const k = [{ tipe: 'benefit' }, { tipe: 'benefit' }];
    const r = normalisasiMatriks(m, k);
    expect(r[0][0]).toBeCloseTo(80 / 80);
    expect(r[1][0]).toBeCloseTo(60 / 80);
    expect(r[0][1]).toBeCloseTo(70 / 90);
    expect(r[1][1]).toBeCloseTo(90 / 90);
  });

  test('normalisasi matriks cost: rij = min / Xij', () => {
    const m = [
      [5, 100],
      [10, 200],
    ];
    const k = [{ tipe: 'cost' }, { tipe: 'cost' }];
    const r = normalisasiMatriks(m, k);
    expect(r[0][0]).toBeCloseTo(5 / 5);
    expect(r[1][0]).toBeCloseTo(5 / 10);
    expect(r[0][1]).toBeCloseTo(100 / 100);
    expect(r[1][1]).toBeCloseTo(100 / 200);
  });

  test('hitungSAW menghasilkan ranking benar (contoh seleksi karyawan)', () => {
    // 3 kandidat, 4 kriteria: Pendidikan (S1=5,S2=6), Pengalaman tahun,
    // Nilai tes, Wawancara. Semua benefit.
    const alternatif = [
      { id: 'A1', nama: 'Andi', nilai: [5, 3, 80, 85] },
      { id: 'A2', nama: 'Budi', nilai: [6, 1, 90, 80] },
      { id: 'A3', nama: 'Citra', nilai: [5, 5, 70, 90] },
    ];
    const kriteria = [
      { kode: 'C1', nama: 'Pendidikan', bobot: 0.2, tipe: 'benefit' },
      { kode: 'C2', nama: 'Pengalaman', bobot: 0.3, tipe: 'benefit' },
      { kode: 'C3', nama: 'Tes', bobot: 0.25, tipe: 'benefit' },
      { kode: 'C4', nama: 'Wawancara', bobot: 0.25, tipe: 'benefit' },
    ];
    const hasil = hitungSAW(alternatif, kriteria);
    expect(hasil).toHaveLength(3);
    expect(hasil[0].ranking).toBe(1);
    // Skor pasti di antara 0 dan 1
    hasil.forEach((h) => {
      expect(h.skor).toBeGreaterThanOrEqual(0);
      expect(h.skor).toBeLessThanOrEqual(1);
    });
  });

  test('hitungSAW: lempar error bila kriteria kosong', () => {
    expect(() =>
      hitungSAW([{ id: 'A1', nama: 'x', nilai: [1] }], [])
    ).toThrow();
  });

  test('hitungSAW: cost kriteria membuat nilai kecil unggul', () => {
    const alternatif = [
      { id: 'A1', nama: 'Murah', nilai: [100] },
      { id: 'A2', nama: 'Mahal', nilai: [500] },
    ];
    const kriteria = [{ kode: 'C1', nama: 'Gaji', bobot: 1, tipe: 'cost' }];
    const hasil = hitungSAW(alternatif, kriteria);
    expect(hasil[0].nama).toBe('Murah');
  });
});
