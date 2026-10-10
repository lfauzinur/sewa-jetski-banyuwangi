'use client';
import { useState, useEffect } from 'react';
import { MapPin, Plus, Trash2, Edit3, Power, X, Save } from 'lucide-react';
import { getBasecamps, createBasecamp, updateBasecamp, deleteBasecamp } from '@/lib/supabase-data';

export default function AdminBasecampsPage() {
  const [basecamps, setBasecamps] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: '', address: '', phone: '', operating_hours: '06:00 - 17:00 WIB',
    lat: '', lng: '', maps_url: '', active: true
  });

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setIsLoading(true);
    const data = await getBasecamps();
    setBasecamps(data);
    setIsLoading(false);
  }

  function resetForm() {
    setForm({ name: '', address: '', phone: '', operating_hours: '06:00 - 17:00 WIB', lat: '', lng: '', maps_url: '', active: true });
    setEditingId(null);
    setShowForm(false);
  }

  function handleEdit(bc) {
    setForm({
      name: bc.name, address: bc.address, phone: bc.phone || '',
      operating_hours: bc.operating_hours || '', lat: bc.lat, lng: bc.lng,
      maps_url: bc.maps_url || '', active: bc.active
    });
    setEditingId(bc.id);
    setShowForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const payload = { ...form, lat: parseFloat(form.lat), lng: parseFloat(form.lng) };
    
    if (editingId) {
      await updateBasecamp(editingId, payload);
    } else {
      await createBasecamp(payload);
    }
    resetForm();
    loadData();
  }

  async function handleDelete(id) {
    if (!confirm('Yakin ingin menghapus basecamp ini?')) return;
    await deleteBasecamp(id);
    loadData();
  }

  async function handleToggleActive(bc) {
    await updateBasecamp(bc.id, { active: !bc.active });
    loadData();
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Kelola Basecamp</h1>
          <p className="text-gray-500 text-sm mt-1">Atur lokasi basecamp penyewaan jetski Anda.</p>
        </div>
        <button 
          onClick={() => { resetForm(); setShowForm(true); }}
          className="bg-[var(--royal)] text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-md"
        >
          <Plus size={18} />
          Tambah Basecamp
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => resetForm()}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-black text-gray-900">{editingId ? 'Edit Basecamp' : 'Tambah Basecamp Baru'}</h2>
              <button onClick={resetForm} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Nama Basecamp *</label>
                <input type="text" required value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Contoh: Pantai Boom Marina" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Alamat Lengkap *</label>
                <textarea required value={form.address} onChange={e => setForm({...form, address: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                  rows={3} placeholder="Jl. Raden Wijaya, ..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Latitude *</label>
                  <input type="number" step="any" required value={form.lat} onChange={e => setForm({...form, lat: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="-8.2121849" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Longitude *</label>
                  <input type="number" step="any" required value={form.lng} onChange={e => setForm({...form, lng: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="114.3803574" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Telepon / WA</label>
                <input type="text" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="+62 812-3456-7890" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Jam Operasional</label>
                <input type="text" value={form.operating_hours} onChange={e => setForm({...form, operating_hours: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Setiap Hari: 06:00 - 17:00 WIB" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Link Google Maps (Opsional)</label>
                <input type="url" value={form.maps_url} onChange={e => setForm({...form, maps_url: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="https://maps.google.com/?q=..." />
              </div>
              <button type="submit" className="w-full bg-[var(--royal)] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors mt-2">
                <Save size={18} />
                {editingId ? 'Simpan Perubahan' : 'Tambah Basecamp'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Basecamps List */}
      {isLoading ? (
        <div className="space-y-4">
          <div className="bg-white h-28 rounded-2xl animate-pulse" />
          <div className="bg-white h-28 rounded-2xl animate-pulse" />
        </div>
      ) : basecamps.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
          <MapPin size={48} className="text-gray-300 mx-auto mb-4" />
          <p className="font-bold text-gray-500">Belum ada basecamp.</p>
          <p className="text-gray-400 text-sm mt-1">Klik tombol "Tambah Basecamp" untuk menambahkan.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {basecamps.map(bc => (
            <div key={bc.id} className={`bg-white rounded-2xl p-5 border shadow-sm transition-all ${bc.active ? 'border-gray-100' : 'border-orange-200 bg-orange-50/30 opacity-70'}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-4 flex-1">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${bc.active ? 'bg-rose-50 text-rose-500' : 'bg-gray-100 text-gray-400'}`}>
                    <MapPin size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-gray-900">{bc.name}</h3>
                      {!bc.active && <span className="text-[10px] bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-bold uppercase">Nonaktif</span>}
                    </div>
                    <p className="text-gray-500 text-sm mt-1 line-clamp-2">{bc.address}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                      <span>📞 {bc.phone || '-'}</span>
                      <span>🕐 {bc.operating_hours || '-'}</span>
                    </div>
                    <p className="text-[10px] text-gray-300 mt-1 font-mono">Lat: {bc.lat}, Lng: {bc.lng}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => handleToggleActive(bc)} title={bc.active ? 'Nonaktifkan' : 'Aktifkan'}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${bc.active ? 'text-emerald-500 hover:bg-emerald-50' : 'text-gray-400 hover:bg-gray-100'}`}>
                    <Power size={16} />
                  </button>
                  <button onClick={() => handleEdit(bc)} className="w-9 h-9 rounded-xl text-blue-500 hover:bg-blue-50 flex items-center justify-center transition-colors">
                    <Edit3 size={16} />
                  </button>
                  <button onClick={() => handleDelete(bc.id)} className="w-9 h-9 rounded-xl text-red-400 hover:bg-red-50 flex items-center justify-center transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
