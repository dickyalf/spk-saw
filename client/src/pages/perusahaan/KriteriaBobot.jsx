import { useEffect, useState } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Plus, Trash2 } from 'lucide-react';

export default function KriteriaBobot() {
  const [lowonganList, setLowonganList] = useState([]);
  const [lowonganId, setLowonganId] = useState('');
  const [items, setItems] = useState([]);

  useEffect(() => {
    api.get('/lowongan/saya/list').then((r) => {
      setLowonganList(r.data);
      if (r.data.length && !lowonganId) setLowonganId(r.data[0]._id);
    });
  }, []);

  useEffect(() => {
    if (!lowonganId) return;
    api.get('/kriteria', { params: { lowonganId } }).then((r) => setItems(r.data));
  }, [lowonganId]);

  const total = items.reduce((s, k) => s + Number(k.bobot || 0), 0);

  const updateField = (i, k, v) => {
    const next = [...items];
    next[i] = { ...next[i], [k]: v };
    setItems(next);
  };

  const tambah = async () => {
    const r = await api.post('/kriteria', {
      lowongan: lowonganId,
      kode: `C${items.length + 1}`,
      nama: 'Kriteria Baru',
      bobot: 0.1,
      tipe: 'benefit',
      kategori: 'custom',
    });
    setItems([...items, r.data]);
  };

  const hapus = async (id) => {
    if (!confirm('Hapus kriteria ini?')) return;
    await api.delete(`/kriteria/${id}`);
    setItems(items.filter((x) => x._id !== id));
    toast.success('Dihapus');
  };

  const simpanSemua = async () => {
    try {
      // Update field-by-field
      await Promise.all(
        items.map((k) =>
          api.put(`/kriteria/${k._id}`, {
            nama: k.nama,
            kode: k.kode,
            bobot: Number(k.bobot),
            tipe: k.tipe,
            kategori: k.kategori,
          })
        )
      );
      toast.success('Tersimpan');
    } catch (e) {
      toast.error('Gagal menyimpan');
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Kriteria & Bobot Penilaian SAW</h1>

      <div className="card">
        <label className="label">Pilih Lowongan</label>
        <select
          className="input"
          value={lowonganId}
          onChange={(e) => setLowonganId(e.target.value)}
        >
          {lowonganList.map((l) => (
            <option key={l._id} value={l._id}>
              {l.judul}
            </option>
          ))}
        </select>
      </div>

      <div className="card">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold">Daftar Kriteria</h3>
          <button onClick={tambah} className="btn-secondary">
            <Plus size={16} /> Tambah Kriteria
          </button>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500 border-b">
              <th className="py-2 w-16">Kode</th>
              <th>Nama Kriteria</th>
              <th className="w-32">Kategori</th>
              <th className="w-24">Tipe</th>
              <th className="w-32">Bobot</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((k, i) => (
              <tr key={k._id} className="border-b last:border-0">
                <td className="py-2">
                  <input
                    className="input py-1 px-2"
                    value={k.kode}
                    onChange={(e) => updateField(i, 'kode', e.target.value)}
                  />
                </td>
                <td>
                  <input
                    className="input py-1 px-2"
                    value={k.nama}
                    onChange={(e) => updateField(i, 'nama', e.target.value)}
                  />
                </td>
                <td>
                  <select
                    className="input py-1 px-2"
                    value={k.kategori}
                    onChange={(e) => updateField(i, 'kategori', e.target.value)}
                  >
                    <option value="pendidikan">Pendidikan</option>
                    <option value="pengalaman">Pengalaman</option>
                    <option value="tes">Hasil Tes</option>
                    <option value="wawancara">Wawancara</option>
                    <option value="custom">Custom</option>
                  </select>
                </td>
                <td>
                  <select
                    className="input py-1 px-2"
                    value={k.tipe}
                    onChange={(e) => updateField(i, 'tipe', e.target.value)}
                  >
                    <option value="benefit">Benefit</option>
                    <option value="cost">Cost</option>
                  </select>
                </td>
                <td>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    className="input py-1 px-2"
                    value={k.bobot}
                    onChange={(e) => updateField(i, 'bobot', e.target.value)}
                  />
                </td>
                <td>
                  <button onClick={() => hapus(k._id)} className="btn-danger py-1 px-2">
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-between items-center mt-4">
          <div className="text-sm">
            Total bobot:{' '}
            <span
              className={`font-bold ${
                Math.abs(total - 1) < 0.001 ? 'text-emerald-600' : 'text-amber-600'
              }`}
            >
              {total.toFixed(2)}
            </span>{' '}
            <span className="text-slate-500">
              (idealnya 1.00, namun akan dinormalisasi otomatis)
            </span>
          </div>
          <button onClick={simpanSemua} className="btn-primary">
            Simpan Semua
          </button>
        </div>
      </div>

      <div className="card text-sm text-slate-600">
        <h4 className="font-semibold mb-1">Catatan tentang SAW:</h4>
        <ul className="list-disc pl-5 space-y-1">
          <li><b>Benefit</b>: semakin besar nilai, semakin baik (mis. nilai tes).</li>
          <li><b>Cost</b>: semakin kecil nilai, semakin baik (mis. gaji minimum yang diminta).</li>
          <li>Bobot akan dinormalisasi otomatis saat perhitungan (Σ Wj = 1).</li>
          <li>Nilai per kriteria diambil otomatis dari CV / hasil tes / penilaian wawancara.</li>
        </ul>
      </div>
    </div>
  );
}
