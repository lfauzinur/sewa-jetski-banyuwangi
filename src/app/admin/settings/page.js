'use client';
import { useState, useEffect } from 'react';
import { Save, Globe, Phone, Mail, MapPin, Share2 } from 'lucide-react';

export default function AdminSettings() {
  const [settings, setSettings] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('admin_settings');
    if (stored) {
      setSettings(JSON.parse(stored));
    } else {
      const { COMPANY } = require('@/lib/data');
      setSettings({ ...COMPANY });
      localStorage.setItem('admin_settings', JSON.stringify(COMPANY));
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('admin_settings', JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const set = (field, value) => setSettings(prev => ({ ...prev, [field]: value }));

  if (!settings) return null;

  const inputClass = "w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-[var(--cyan)] focus:ring-2 focus:ring-[var(--cyan)]/20 outline-none";

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Pengaturan</h2>
          <p className="text-gray-500 text-sm">Konfigurasi informasi bisnis dan kontak Anda.</p>
        </div>
        <button onClick={handleSave} className={`btn ${saved ? 'bg-emerald-500 hover:bg-emerald-600' : 'btn-cyan'} px-5 py-2.5 text-sm flex items-center gap-2 shadow-sm transition-colors`}>
          {saved ? '✓ Tersimpan!' : <><Save size={16} /> Simpan</>}
        </button>
      </div>

      {/* Business Info */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-gray-900 font-bold text-sm mb-2">
          <Globe size={18} className="text-[var(--cyan)]" /> Informasi Bisnis
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Nama Perusahaan</label>
          <input type="text" value={settings.name} onChange={e => set('name', e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Tagline</label>
          <input type="text" value={settings.tagline} onChange={e => set('tagline', e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Alamat</label>
          <textarea rows={2} value={settings.address} onChange={e => set('address', e.target.value)} className={`${inputClass} resize-none`} />
        </div>
      </div>

      {/* Contact */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-gray-900 font-bold text-sm mb-2">
          <Phone size={18} className="text-[var(--cyan)]" /> Kontak
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Telepon</label>
            <input type="text" value={settings.phone} onChange={e => set('phone', e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">WhatsApp</label>
            <input type="text" value={settings.whatsapp} onChange={e => set('whatsapp', e.target.value)} className={inputClass} />
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Email</label>
          <input type="email" value={settings.email} onChange={e => set('email', e.target.value)} className={inputClass} />
        </div>
      </div>

      {/* Social Media */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-gray-900 font-bold text-sm mb-2">
          <Share2 size={18} className="text-[var(--cyan)]" /> Media Sosial
        </div>
        {[
          { key: 'instagram', label: 'Instagram' },
          { key: 'facebook', label: 'Facebook' },
          { key: 'tiktok', label: 'TikTok' },
          { key: 'youtube', label: 'YouTube' },
          { key: 'tripadvisor', label: 'TripAdvisor' },
        ].map(s => (
          <div key={s.key}>
            <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">{s.label}</label>
            <input type="url" value={settings[s.key] || ''} onChange={e => set(s.key, e.target.value)} className={inputClass} placeholder={`https://${s.key}.com/...`} />
          </div>
        ))}
      </div>

      {/* Google Maps */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-gray-900 font-bold text-sm mb-2">
          <MapPin size={18} className="text-[var(--cyan)]" /> Lokasi Google Maps
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Link Google Maps</label>
          <input type="url" value={settings.maps} onChange={e => set('maps', e.target.value)} className={inputClass} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Latitude</label>
            <input type="number" step="any" value={settings.lat} onChange={e => set('lat', parseFloat(e.target.value) || 0)} className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Longitude</label>
            <input type="number" step="any" value={settings.lng} onChange={e => set('lng', parseFloat(e.target.value) || 0)} className={inputClass} />
          </div>
        </div>
      </div>

      {/* Bottom Save */}
      <div className="flex justify-end pt-4">
        <button onClick={handleSave} className={`btn ${saved ? 'bg-emerald-500 hover:bg-emerald-600' : 'btn-cyan'} px-8 py-3 text-sm flex items-center gap-2 shadow-md transition-colors`}>
          {saved ? '✓ Berhasil Disimpan!' : <><Save size={16} /> Simpan Semua Perubahan</>}
        </button>
      </div>
    </div>
  );
}
