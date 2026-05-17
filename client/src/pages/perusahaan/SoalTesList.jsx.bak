import { useEffect, useState } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, X } from 'lucide-react';

export default function SoalTesList() {
  const [items, setItems] = useState([]);
  const [editor, setEditor] = useState(null);

  const load = () => api.get('/soal-tes').then((r) => setItems(r.data));
  useEffect(() => {
    load();
  }, []);

  const buatBaru = () =>
    setEditor({
      pertanyaan: '',
      jenis: 'pilihan_ganda',
      kategori: 'umum',
      bobotNilai: 1,
      pilihan: [
        { teks: '', kunci: true },
        { teks: '', kunci: false },
        { teks: '', kunci: false },
        { teks: '', kunci: false },
      ],
    });

  const hapus = async (id) => {
    if (!confirm('Hapus soal ini?')) return;
    await api.delete(`/soal-tes/${id}`);
    toast.success('Dihapus');
    load();
  };

  const simpan = async () => {
    try {
      if (editor._id) await api.put(`/soal-tes/${editor._id}`, editor);
      else await api.post('/soal-tes', editor);
      toast.success('Tersimpan');
      setEditor(null);
      load();
    } catch (e) {
      toast.error('Gagal menyimpan');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Bank Soal Tes</h1>
        <button onClick={buatBaru} className="btn-primary">
          <Plus size={16} /> Tambah Soal
        </button>
      </div>

      <div className="space-y-2">
        {items.map((s) => (
          <div key={s._id} className="card flex justify-between items-start">
            <div className="flex-1">
              <div className="text-xs uppercase text-slate-400 mb-1">
                {s.jenis} · {s.kategori} · bobot {s.bobotNilai}
              </div>
              <div className="font-medium">{s.pertanyaan}</div>
              {s.jenis === 'pilihan_ganda' && (
                <ul className="text-sm text-slate-600 mt-2 space-y-0.5">
                  {s.pilihan.map((p, i) => (
                    <li key={i} className={p.kunci ? 'text-emerald-600 font-medium' : ''}>
                      {String.fromCharCode(65 + i)}. {p.teks} {p.kunci && '✓'}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="space-x-1">
              <button onClick={() => setEditor(s)} className="btn-secondary py-1 px-2">
                <Edit size={14} />
              </button>
              <button onClick={() => hapus(s._id)} className="btn-danger py-1 px-2">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="text-center text-slate-500 py-8">Belum ada soal</div>
        )}
      </div>

      {editor && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-semibold">{editor._id ? 'Edit Soal' : 'Tambah Soal'}</h3>
              <button onClick={() => setEditor(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="label">Pertanyaan</label>
                <textarea
                  rows={3}
                  className="input"
                  value={editor.pertanyaan}
                  onChange={(e) => setEditor({ ...editor, pertanyaan: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="label">Jenis</label>
                  <select
                    className="input"
                    value={editor.jenis}
                    onChange={(e) => setEditor({ ...editor, jenis: e.target.value })}
                  >
                    <option value="pilihan_ganda">Pilihan Ganda</option>
                    <option value="esai">Esai</option>
                  </select>
                </div>
                <div>
                  <label className="label">Kategori</label>
                  <input
                    className="input"
                    value={editor.kategori}
                    onChange={(e) => setEditor({ ...editor, kategori: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Bobot Nilai</label>
                  <input
                    type="number"
                    className="input"
                    value={editor.bobotNilai}
                    onChange={(e) => setEditor({ ...editor, bobotNilai: Number(e.target.value) })}
                  />
                </div>
              </div>
              {editor.jenis === 'pilihan_ganda' && (
                <div>
                  <label className="label">Pilihan Jawaban (centang yang benar)</label>
                  <div className="space-y-2">
                    {editor.pilihan.map((p, i) => (
                      <div key={i} className="flex gap-2 items-center">
                        <input
                          type="radio"
                          name="kunci"
                          checked={p.kunci}
                          onChange={() =>
                            setEditor({
                              ...editor,
                              pilihan: editor.pilihan.map((x, j) => ({ ...x, kunci: i === j })),
                            })
                          }
                        />
                        <input
                          className="input"
                          placeholder={`Pilihan ${String.fromCharCode(65 + i)}`}
                          value={p.teks}
                          onChange={(e) => {
                            const next = [...editor.pilihan];
                            next[i] = { ...next[i], teks: e.target.value };
                            setEditor({ ...editor, pilihan: next });
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 p-4 border-t">
              <button onClick={() => setEditor(null)} className="btn-secondary">
                Batal
              </button>
              <button onClick={simpan} className="btn-primary">
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
