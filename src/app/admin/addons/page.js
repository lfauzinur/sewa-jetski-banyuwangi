'use client';
import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Camera, Check, X } from 'lucide-react';
import { getAddons, upsertAddon, deleteAddon } from '@/lib/supabase-data';
import { formatCurrency } from '@/lib/data';

export default function AdminAddonsPage() {
  const [addons, setAddons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentAddon, setCurrentAddon] = useState(null);

  useEffect(() => {
    fetchAddons();
  }, []);

  const fetchAddons = async () => {
    setLoading(true);
    const data = await getAddons();
    setAddons(data);
    setLoading(false);
  };

  const handleEdit = (addon) => {
    setCurrentAddon(addon);
    setIsEditing(true);
  };

  const handleAddNew = () => {
    setCurrentAddon({ name: '', description: '', price: 0, active: true });
    setIsEditing(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!currentAddon.name || currentAddon.price < 0) return alert('Data tidak valid');
    
    const saved = await upsertAddon(currentAddon);
    if (saved) {
      setIsEditing(false);
      setCurrentAddon(null);
      fetchAddons();
    } else {
      alert('Gagal menyimpan Add-on');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Yakin ingin menghapus add-on ini?')) {
      const deleted = await deleteAddon(id);
      if (deleted) {
        fetchAddons();
      } else {
        alert('Gagal menghapus');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Kelola Add-ons Media & Lainnya</h2>
          <p className="text-gray-500 text-sm mt-1">Tambahkan opsi sewa kamera (GoPro/Insta360) atau asuransi tambahan.</p>
        </div>
        <button onClick={handleAddNew} className="btn btn-teal flex items-center gap-2">
          <Plus size={18} /> Tambah Add-on
        </button>
      </div>

      {isEditing && currentAddon && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold mb-4">{currentAddon.id ? 'Edit Add-on' : 'Tambah Add-on Baru'}</h3>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Add-on</label>
                <input 
                  type="text" 
                  required
                  className="w-full px-4 py-2 border rounded-xl" 
                  value={currentAddon.name} 
                  onChange={e => setCurrentAddon({...currentAddon, name: e.target.value})}
                  placeholder="Misal: GoPro Hero 11"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Harga Sewa (Rp)</label>
                <input 
                  type="number" 
                  required
                  min="0"
                  className="w-full px-4 py-2 border rounded-xl" 
                  value={currentAddon.price} 
                  onChange={e => setCurrentAddon({...currentAddon, price: parseInt(e.target.value) || 0})}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi & Fasilitas</label>
              <textarea 
                className="w-full px-4 py-2 border rounded-xl h-24" 
                value={currentAddon.description} 
                onChange={e => setCurrentAddon({...currentAddon, description: e.target.value})}
                placeholder="Deskripsikan fitur add-on ini..."
              />
            </div>
            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                id="activeToggle"
                checked={currentAddon.active}
                onChange={e => setCurrentAddon({...currentAddon, active: e.target.checked})}
                className="w-4 h-4 text-[var(--teal)] rounded"
              />
              <label htmlFor="activeToggle" className="text-sm font-medium text-gray-700">Aktif (Bisa dibeli user)</label>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <button type="button" onClick={() => setIsEditing(false)} className="btn btn-outline-gray">Batal</button>
              <button type="submit" className="btn btn-teal">Simpan Add-on</button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : addons.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Camera size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="font-medium text-lg">Belum ada Add-on</p>
            <p className="text-sm">Klik "Tambah Add-on" untuk membuat opsi sewa kamera.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500">
                  <th className="px-6 py-4 font-semibold">Nama Add-on</th>
                  <th className="px-6 py-4 font-semibold">Harga</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {addons.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">{item.name}</div>
                      <div className="text-xs text-gray-500 max-w-xs truncate">{item.description}</div>
                    </td>
                    <td className="px-6 py-4 font-medium text-[var(--teal)]">
                      {formatCurrency(item.price)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${item.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {item.active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleEdit(item)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(item.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Hapus">
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
