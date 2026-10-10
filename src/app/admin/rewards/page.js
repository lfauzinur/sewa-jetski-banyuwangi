'use client';
import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Gift, Check, X } from 'lucide-react';
import { getLoyaltyRewards, upsertLoyaltyReward, deleteLoyaltyReward } from '@/lib/supabase-data';
import { formatCurrency } from '@/lib/data';

export default function AdminRewardsPage() {
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentReward, setCurrentReward] = useState(null);

  useEffect(() => {
    fetchRewards();
  }, []);

  const fetchRewards = async () => {
    setLoading(true);
    const data = await getLoyaltyRewards();
    setRewards(data);
    setLoading(false);
  };

  const handleEdit = (reward) => {
    setCurrentReward(reward);
    setIsEditing(true);
  };

  const handleAddNew = () => {
    setCurrentReward({ name: '', type: 'discount', value: 0, points_required: 0, active: true });
    setIsEditing(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!currentReward.name || currentReward.value <= 0 || currentReward.points_required <= 0) {
      return alert('Data tidak valid. Value dan Points harus lebih dari 0.');
    }
    
    const saved = await upsertLoyaltyReward(currentReward);
    if (saved) {
      setIsEditing(false);
      setCurrentReward(null);
      fetchRewards();
    } else {
      alert('Gagal menyimpan Reward');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Yakin ingin menghapus reward ini?')) {
      const deleted = await deleteLoyaltyReward(id);
      if (deleted) {
        fetchRewards();
      } else {
        alert('Gagal menghapus');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Kelola Reward Poin (JetPass)</h2>
          <p className="text-gray-500 text-sm mt-1">Buat hadiah atau diskon yang bisa ditukarkan oleh pengguna dengan poin mereka.</p>
        </div>
        <button onClick={handleAddNew} className="btn btn-teal flex items-center gap-2">
          <Plus size={18} /> Tambah Reward
        </button>
      </div>

      {isEditing && currentReward && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold mb-4">{currentReward.id ? 'Edit Reward' : 'Tambah Reward Baru'}</h3>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Reward</label>
                <input 
                  type="text" 
                  required
                  className="w-full px-4 py-2 border rounded-xl" 
                  value={currentReward.name} 
                  onChange={e => setCurrentReward({...currentReward, name: e.target.value})}
                  placeholder="Misal: Diskon Rp 50.000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipe Reward</label>
                <select 
                  className="w-full px-4 py-2 border rounded-xl"
                  value={currentReward.type}
                  onChange={e => setCurrentReward({...currentReward, type: e.target.value})}
                >
                  <option value="discount">Potongan Harga (Diskon)</option>
                  <option value="duration">Tambahan Waktu (Menit)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nilai Reward ({currentReward.type === 'discount' ? 'Rp' : 'Menit'})
                </label>
                <input 
                  type="number" 
                  required
                  min="1"
                  className="w-full px-4 py-2 border rounded-xl" 
                  value={currentReward.value} 
                  onChange={e => setCurrentReward({...currentReward, value: parseInt(e.target.value) || 0})}
                  placeholder={currentReward.type === 'discount' ? '50000' : '15'}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Poin Dibutuhkan</label>
                <input 
                  type="number" 
                  required
                  min="1"
                  className="w-full px-4 py-2 border rounded-xl" 
                  value={currentReward.points_required} 
                  onChange={e => setCurrentReward({...currentReward, points_required: parseInt(e.target.value) || 0})}
                  placeholder="Misal: 50"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                id="activeToggle"
                checked={currentReward.active}
                onChange={e => setCurrentReward({...currentReward, active: e.target.checked})}
                className="w-4 h-4 text-[var(--teal)] rounded"
              />
              <label htmlFor="activeToggle" className="text-sm font-medium text-gray-700">Aktif (Bisa ditukar user)</label>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <button type="button" onClick={() => setIsEditing(false)} className="btn btn-outline-gray">Batal</button>
              <button type="submit" className="btn btn-teal">Simpan Reward</button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : rewards.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Gift size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="font-medium text-lg">Belum ada Reward</p>
            <p className="text-sm">Klik "Tambah Reward" untuk membuat daftar hadiah penukaran poin.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500">
                  <th className="px-6 py-4 font-semibold">Nama Reward</th>
                  <th className="px-6 py-4 font-semibold">Tipe & Nilai</th>
                  <th className="px-6 py-4 font-semibold">Harga Poin</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rewards.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">{item.name}</div>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-700">
                      {item.type === 'discount' 
                        ? <span className="text-[var(--teal)]">Diskon {formatCurrency(item.value)}</span>
                        : <span className="text-orange-600">+{item.value} Menit</span>
                      }
                    </td>
                    <td className="px-6 py-4 font-bold text-amber-500">
                      {item.points_required} Poin
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
