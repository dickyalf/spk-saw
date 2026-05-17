/**
 * Service: Simple Additive Weighting (SAW)
 *
 * Langkah metode SAW:
 *  1. Tentukan kriteria (Cj) dan bobot (Wj). Bobot dinormalisasi sehingga Σ Wj = 1.
 *  2. Susun matriks keputusan X (alternatif x kriteria), nilai Xij.
 *  3. Normalisasi:
 *      - Bila kriteria BENEFIT: rij = Xij / max(Xj)
 *      - Bila kriteria COST   : rij = min(Xj) / Xij
 *  4. Hitung nilai preferensi: Vi = Σ (Wj * rij)
 *  5. Alternatif dengan Vi terbesar = terbaik.
 *
 * Modul ini PURE FUNCTION — tidak mengakses database, sehingga mudah di-unit-test.
 * Pemetaan data DB -> matriks dilakukan di rankingService.js
 */

/**
 * Normalisasi bobot agar total = 1
 * @param {Array<{kode:string, bobot:number, tipe:'benefit'|'cost'}>} kriteria
 */
function normalisasiBobot(kriteria) {
  const total = kriteria.reduce((s, k) => s + (k.bobot || 0), 0);
  if (total === 0) {
    // Bagi rata jika semua bobot 0
    const eq = 1 / kriteria.length;
    return kriteria.map((k) => ({ ...k, bobot: eq }));
  }
  return kriteria.map((k) => ({ ...k, bobot: k.bobot / total }));
}

/**
 * Normalisasi matriks keputusan (rij).
 * @param {number[][]} matriks - baris=alternatif, kolom=kriteria
 * @param {Array<{tipe:'benefit'|'cost'}>} kriteria
 */
function normalisasiMatriks(matriks, kriteria) {
  if (matriks.length === 0) return [];
  const jumlahKriteria = kriteria.length;
  // Ambil max & min tiap kolom
  const maxKol = Array(jumlahKriteria).fill(-Infinity);
  const minKol = Array(jumlahKriteria).fill(Infinity);
  for (const row of matriks) {
    for (let j = 0; j < jumlahKriteria; j++) {
      const v = Number(row[j]) || 0;
      if (v > maxKol[j]) maxKol[j] = v;
      if (v > 0 && v < minKol[j]) minKol[j] = v;
    }
  }
  // Handle kolom yang semua nol
  for (let j = 0; j < jumlahKriteria; j++) {
    if (maxKol[j] === -Infinity) maxKol[j] = 0;
    if (minKol[j] === Infinity) minKol[j] = 0;
  }
  return matriks.map((row) =>
    row.map((val, j) => {
      const x = Number(val) || 0;
      if (kriteria[j].tipe === 'cost') {
        if (x === 0) return 0;
        return (minKol[j] || 0) / x;
      }
      // benefit
      if (maxKol[j] === 0) return 0;
      return x / maxKol[j];
    })
  );
}

/**
 * Hitung nilai preferensi Vi = Σ Wj * rij
 */
function hitungPreferensi(matriksNormal, bobot) {
  return matriksNormal.map((row) =>
    row.reduce((acc, rij, j) => acc + rij * bobot[j], 0)
  );
}

/**
 * Pipeline lengkap SAW.
 * @param {Array} alternatif    - array obyek alternatif (mis. { id, nama, nilai: [..] })
 * @param {Array} kriteriaRaw   - [{ kode, nama, bobot, tipe }]
 * @returns {Array} hasil       - alternatif diurutkan menurun by skor, plus ranking
 */
function hitungSAW(alternatif, kriteriaRaw) {
  if (!Array.isArray(alternatif) || alternatif.length === 0) return [];
  if (!Array.isArray(kriteriaRaw) || kriteriaRaw.length === 0)
    throw new Error('Kriteria tidak boleh kosong');

  const kriteria = normalisasiBobot(kriteriaRaw);
  const matriks = alternatif.map((a) => a.nilai);
  const normal = normalisasiMatriks(matriks, kriteria);
  const skor = hitungPreferensi(normal, kriteria.map((k) => k.bobot));

  const hasil = alternatif.map((a, i) => ({
    ...a,
    nilaiNormalisasi: normal[i],
    skor: Number(skor[i].toFixed(6)),
  }));

  hasil.sort((a, b) => b.skor - a.skor);
  hasil.forEach((h, idx) => (h.ranking = idx + 1));
  return hasil;
}

module.exports = {
  normalisasiBobot,
  normalisasiMatriks,
  hitungPreferensi,
  hitungSAW,
};
