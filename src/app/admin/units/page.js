'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Plus, Edit2, Trash2, X, Star, Search, Filter } from 'lucide-react';
import { formatCurrency } from '@/lib/data';
import { getServicesByType, upsertService, deleteService } from '@/lib/supabase-data';

const DEFAULT_UNIT = {
  id: '', name: '', slug: '', category: 'Standard', description: '',
  price: 350000, capacity: 2, engineCC: 1000, topSpeed: '80 km/h',
  rating: 4.5, reviews: 0, image: '/images/hero-jetski.png',
  features: ['GPS Tracking', 'Life Jacket', 'Guide Pendamping', 'Asuransi'],
  available: true, type: 'jetski',
};

export default function AdminUnits() {
  const [units, setUnits] = useState([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editUnit, setEditUnit] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      const data = await getServicesByType('jetski');
      if (data && data.length > 0) {
        setUnits(data);
      } else {
        // Seed with default data
        const { jetskiUnits } = require('@/lib/data');
        setUnits(jetskiUnits);
      }
    };
    loadData();
  }, []);

  const handleSave = async (unit) => {
    const payload = { ...unit, type: 'jetski' };
    if (!payload.slug) payload.slug = payload.name.toLowerCase().replace(/\s+/g, '-');
    
    const result = await upsertService(payload);
    if (result) {
      if (editUnit) {
        setUnits(prev => prev.map(u => u.id === unit.id ? result : u));
      } else {
        setUnits(prev => [...prev, result]);
      }
    }
    setShowModal(false);
    setEditUnit(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    if (await deleteService(deleteTarget.id)) {
      setUnits(prev => prev.filter(u => u.id !== deleteTarget.id));
    }
    setDeleteTarget(null);
  };

  const filtered = units.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Kelola Unit Jetski</h2>
          <p className="text-gray-500 text-sm">{units.length} unit terdaftar</p>
        </div>
        <button onClick={() => { setEditUnit(null); setShowModal(true); }} className="btn btn-cyan px-4 py-2.5 text-sm flex items-center gap-2 shadow-sm">
          <Plus size={18} /> Tambah Unit
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input type="text" placeholder="Cari unit..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full sm:w-80 pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl shadow-sm focus:border-[var(--cyan)] focus:ring-2 focus:ring-[var(--cyan)]/20 outline-none text-sm" />
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.map(unit => (
          <div key={unit.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="relative h-44 bg-gray-100">
              <Image src={unit.image} alt={unit.name} fill className="object-cover" sizes="(max-width: 640px) 100vw, 33vw" />
              <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-md text-[10px] font-bold text-[var(--teal)] uppercase">{unit.category}</div>
              <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-bold text-amber-500">
                <Star size={12} fill="currentColor" /> {unit.rating}
              </div>
              <div className={`absolute bottom-3 right-3 px-2 py-1 rounded-md text-[10px] font-bold uppercase ${unit.available ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                {unit.available ? 'Tersedia' : 'Tidak Tersedia'}
              </div>
            </div>
            <div className="p-5">
              <h3 className="font-bold text-gray-900 text-lg mb-1">{unit.name}</h3>
              <p className="text-gray-500 text-xs line-clamp-2 mb-3">{unit.description}</p>
              <div className="flex items-center justify-between text-sm mb-4">
                <span className="font-extrabold text-[var(--teal)]">{formatCurrency(unit.pricePerSlot)}</span>
                <span className="text-gray-400 text-xs">{unit.capacity} penumpang • {unit.engineCC}cc</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setEditUnit(unit); setShowModal(true); }} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 text-blue-600 text-xs font-bold hover:bg-blue-100 transition-colors">
                  <Edit2 size={14} /> Edit
                </button>
                <button onClick={() => setDeleteTarget(unit)} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 text-rose-600 text-xs font-bold hover:bg-rose-100 transition-colors">
                  <Trash2 size={14} /> Hapus
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ADD/EDIT MODAL */}
      {showModal && (
        <UnitFormModal unit={editUnit || DEFAULT_UNIT} onSave={handleSave} onClose={() => { setShowModal(false); setEditUnit(null); }} isEdit={!!editUnit} />
      )}

      {/* DELETE CONFIRM */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="font-bold text-gray-900 text-lg mb-2">Hapus Unit?</h3>
            <p className="text-gray-500 text-sm mb-6">Apakah Anda yakin ingin menghapus <strong>{deleteTarget.name}</strong>? Tindakan ini tidak dapat dibatalkan.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50">Batal</button>
              <button onClick={handleDelete} className="flex-1 px-4 py-2.5 bg-rose-500 text-white rounded-xl text-sm font-bold hover:bg-rose-600">Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function UnitFormModal({ unit, onSave, onClose, isEdit }) {
  const [form, setForm] = useState({ ...unit });
  const [featureInput, setFeatureInput] = useState('');

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const addFeature = () => {
    if (featureInput.trim()) {
      setForm(prev => ({ ...prev, features: [...prev.features, featureInput.trim()] }));
      setFeatureInput('');
    }
  };
  const removeFeature = (i) => setForm(prev => ({ ...prev, features: prev.features.filter((_, idx) => idx !== i) }));

  return (
    <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
          <h3 className="font-bold text-gray-900 text-lg">{isEdit ? 'Edit Unit' : 'Tambah Unit Baru'}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center"><X size={18} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Nama Unit</label>
            <input type="text" value={form.name} onChange={e => handleChange('name', e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-[var(--cyan)] focus:ring-2 focus:ring-[var(--cyan)]/20 outline-none" placeholder="Yamaha WaveRunner VX" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Kategori</label>
              <select value={form.category} onChange={e => handleChange('category', e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-[var(--cyan)] focus:ring-2 focus:ring-[var(--cyan)]/20 outline-none bg-white">
                <option value="Standard">Standard</option>
                <option value="Premium">Premium</option>
                <option value="Sport">Sport</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Harga / Slot (Rp)</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs select-none">Rp</span>
                <input 
                  type="text" 
                  inputMode="numeric"
                  value={form.pricePerSlot ? Number(form.pricePerSlot).toLocaleString('id-ID') : ''} 
                  onChange={e => {
                    const raw = e.target.value.replace(/\D/g, '');
                    handleChange('pricePerSlot', raw ? parseInt(raw, 10) : '');
                  }} 
                  placeholder="0"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-[var(--cyan)] focus:ring-2 focus:ring-[var(--cyan)]/20 outline-none" 
                />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Deskripsi</label>
            <textarea rows={3} value={form.description} onChange={e => handleChange('description', e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-[var(--cyan)] focus:ring-2 focus:ring-[var(--cyan)]/20 outline-none resize-none" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Kapasitas</label>
              <input type="number" value={form.capacity} onChange={e => handleChange('capacity', parseInt(e.target.value) || 1)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-[var(--cyan)] focus:ring-2 focus:ring-[var(--cyan)]/20 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Mesin (CC)</label>
              <input type="number" value={form.engineCC} onChange={e => handleChange('engineCC', parseInt(e.target.value) || 0)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-[var(--cyan)] focus:ring-2 focus:ring-[var(--cyan)]/20 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Top Speed</label>
              <input type="text" value={form.topSpeed} onChange={e => handleChange('topSpeed', e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-[var(--cyan)] focus:ring-2 focus:ring-[var(--cyan)]/20 outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Fitur</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {form.features.map((f, i) => (
                <span key={i} className="inline-flex items-center gap-1 text-xs font-semibold bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full">
                  {f} <button onClick={() => removeFeature(i)} className="text-gray-400 hover:text-rose-500"><X size={12} /></button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input type="text" value={featureInput} onChange={e => setFeatureInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addFeature())} placeholder="Tambah fitur..." className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none" />
              <button onClick={addFeature} className="px-3 py-2 bg-gray-100 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-200">+</button>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Tersedia</label>
            <button onClick={() => handleChange('available', !form.available)} className={`w-12 h-6 rounded-full transition-colors relative ${form.available ? 'bg-emerald-500' : 'bg-gray-300'}`}>
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.available ? 'left-6' : 'left-0.5'}`} />
            </button>
          </div>
        </div>
        <div className="flex gap-3 p-6 border-t border-gray-100 sticky bottom-0 bg-white rounded-b-2xl">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50">Batal</button>
          <button onClick={() => onSave(form)} className="flex-1 btn btn-cyan py-2.5 text-sm">{isEdit ? 'Simpan Perubahan' : 'Tambah Unit'}</button>
        </div>
      </div>
    </div>
  );
}
