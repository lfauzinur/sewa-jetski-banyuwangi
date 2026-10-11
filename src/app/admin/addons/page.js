'use client';
import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Camera, Check, X, Sparkles, CheckCircle2 } from 'lucide-react';
import { getAddons, upsertAddon, deleteAddon } from '@/lib/supabase-data';
import { formatCurrency } from '@/lib/data';

export default function AdminAddonsPage() {
  const [addons, setAddons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentAddon, setCurrentAddon] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    fetchAddons();
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const fetchAddons = async () => {
    setLoading(true);
    const data = await getAddons();
    setAddons(data || []);
    setLoading(false);
  };

  const handleEdit = (addon) => {
    setCurrentAddon({ ...addon });
    setIsEditing(true);
  };

  const handleAddNew = () => {
    setCurrentAddon({ name: '', description: '', price: '', active: true });
    setIsEditing(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!currentAddon.name?.trim()) {
      alert('Nama Add-on wajib diisi');
      return;
    }

    const numericPrice = typeof currentAddon.price === 'string' 
      ? parseInt(currentAddon.price.replace(/\D/g, ''), 10) || 0 
      : parseInt(currentAddon.price, 10) || 0;

    setIsSaving(true);

    try {
      const payload = {
        ...currentAddon,
        price: numericPrice,
      };

      const saved = await upsertAddon(payload);
      if (saved) {
        setIsEditing(false);
        setCurrentAddon(null);
        await fetchAddons();
        showToast('✓ Add-on berhasil disimpan!');
      } else {
        alert('Gagal menyimpan Add-on. Silakan coba kembali.');
      }
    } catch (err) {
      console.error('Error saving addon:', err);
      alert('Terjadi kesalahan saat menyimpan add-on.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Yakin ingin menghapus add-on ini?')) {
      const deleted = await deleteAddon(id);
      if (deleted) {
        await fetchAddons();
        showToast('✓ Add-on berhasil dihapus');
      } else {
        alert('Gagal menghapus');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 font-bold text-sm animate-fade-in-up">
          <CheckCircle2 size={18} />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900">Kelola Add-ons Media & Lainnya</h2>
          <p className="text-gray-500 text-sm mt-1">Tambahkan opsi sewa kamera (GoPro/Insta360), drone, atau asuransi tambahan.</p>
        </div>
        <button 
          onClick={handleAddNew} 
          className="bg-[var(--royal)] hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-md transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus size={18} /> Tambah Add-on
        </button>
      </div>

      {/* Form Card (Tambah / Edit) */}
      {isEditing && currentAddon && (
        <div className="bg-white p-6 sm:p-7 rounded-3xl shadow-md border border-gray-200/80 transition-all animate-fadeIn">
          <div className="flex items-center justify-between mb-5 pb-3 border-b border-gray-100">
            <div>
              <h3 className="text-lg font-black text-gray-900">{currentAddon.id ? 'Edit Add-on' : 'Tambah Add-on Baru'}</h3>
              <p className="text-xs text-gray-500">Lengkapi detail opsi sewa tambahan untuk pelanggan.</p>
            </div>
            <button 
              type="button" 
              onClick={() => setIsEditing(false)} 
              className="w-8 h-8 rounded-full bg-gray-100 text-gray-400 hover:text-gray-700 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                  Nama Add-on <span className="text-rose-500">*</span>
                </label>
                <input 
                  type="text" 
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-medium focus:border-[var(--cyan)] focus:ring-2 focus:ring-[var(--cyan)]/20 outline-none transition-all" 
                  value={currentAddon.name} 
                  onChange={e => setCurrentAddon({...currentAddon, name: e.target.value})}
                  placeholder="Misal: GoPro Hero 11"
                />
              </div>

              {/* Harga Sewa - Input langsung ketik angka tanpa tombol panah spinner */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                  Harga Sewa (Rp) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm select-none">
                    Rp
                  </span>
                  <input 
                    type="text" 
                    inputMode="numeric"
                    required
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:border-[var(--cyan)] focus:ring-2 focus:ring-[var(--cyan)]/20 outline-none transition-all placeholder:text-gray-300" 
                    value={
                      currentAddon.price !== '' && currentAddon.price !== null && currentAddon.price !== undefined
                        ? (typeof currentAddon.price === 'number' 
                            ? currentAddon.price.toLocaleString('id-ID') 
                            : currentAddon.price)
                        : ''
                    } 
                    onChange={e => {
                      // Ambil hanya karakter angka
                      const rawDigits = e.target.value.replace(/\D/g, '');
                      if (!rawDigits) {
                        setCurrentAddon({...currentAddon, price: ''});
                      } else {
                        const num = parseInt(rawDigits, 10);
                        setCurrentAddon({...currentAddon, price: num.toLocaleString('id-ID')});
                      }
                    }}
                    placeholder="Contoh: 100000"
                  />
                </div>
                <p className="text-[11px] text-gray-400 mt-1">Ketik langsung nominal harga (misal: 100000).</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                Deskripsi & Fasilitas
              </label>
              <textarea 
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-medium focus:border-[var(--cyan)] focus:ring-2 focus:ring-[var(--cyan)]/20 outline-none transition-all h-24 resize-none placeholder:text-gray-300" 
                value={currentAddon.description} 
                onChange={e => setCurrentAddon({...currentAddon, description: e.target.value})}
                placeholder="Deskripsikan fitur add-on ini (misal: Termasuk SD Card 64GB dan mounting pelampung)..."
              />
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
              <input 
                type="checkbox" 
                id="activeToggle"
                checked={currentAddon.active}
                onChange={e => setCurrentAddon({...currentAddon, active: e.target.checked})}
                className="w-5 h-5 text-[var(--royal)] rounded border-gray-300 focus:ring-[var(--royal)] cursor-pointer"
              />
              <label htmlFor="activeToggle" className="text-sm font-bold text-gray-800 cursor-pointer select-none">
                Aktif (Bisa dipilih pelanggan saat checkout booking)
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button 
                type="button" 
                onClick={() => setIsEditing(false)} 
                className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button 
                type="submit" 
                disabled={isSaving}
                className="bg-gray-900 hover:bg-black text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-md flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  'Simpan Add-on'
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-200/80 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400">
            <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-sm">Memuat daftar add-on...</p>
          </div>
        ) : addons.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Camera size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="font-bold text-lg text-gray-700">Belum ada Add-on</p>
            <p className="text-sm text-gray-400 mt-1">Klik tombol &ldquo;Tambah Add-on&rdquo; di atas untuk membuat opsi baru.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200 text-[11px] uppercase tracking-wider text-gray-500">
                  <th className="px-6 py-4 font-bold">Nama Add-on</th>
                  <th className="px-6 py-4 font-bold">Harga Sewa</th>
                  <th className="px-6 py-4 font-bold">Status</th>
                  <th className="px-6 py-4 font-bold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {addons.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">{item.name}</div>
                      <div className="text-xs text-gray-500 max-w-sm truncate mt-0.5">{item.description || '-'}</div>
                    </td>
                    <td className="px-6 py-4 font-bold text-[var(--teal)]">
                      {formatCurrency(item.price)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${item.active ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                        {item.active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleEdit(item)} 
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer" 
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id)} 
                          className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer" 
                          title="Hapus"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
