'use client';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Lock, Eye, MapPin, Users } from 'lucide-react';
import { useState } from 'react';

const privacyItems = [
  { key: 'location', icon: <MapPin size={20} />, label: 'Bagikan Lokasi', desc: 'Izinkan akses lokasi untuk rekomendasi' },
  { key: 'profile', icon: <Eye size={20} />, label: 'Profil Publik', desc: 'Tampilkan profil Anda ke pengguna lain' },
  { key: 'activity', icon: <Users size={20} />, label: 'Riwayat Aktivitas', desc: 'Simpan riwayat pencarian Anda' },
];

export default function PrivacyPage() {
  const router = useRouter();
  const [settings, setSettings] = useState({ location: true, profile: false, activity: true });
  const toggle = (key) => setSettings({ ...settings, [key]: !settings[key] });

  return (
    <div className="min-h-screen bg-white pb-10">
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md pt-10 pb-4 px-6 flex items-center justify-between">
        <button onClick={() => router.back()} className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-[var(--royal)]">
          <ChevronLeft size={24} />
        </button>
        <h1 className="font-bold text-gray-900 text-lg">Privacy</h1>
        <div className="w-10" />
      </div>

      <div className="px-6 mt-4">
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 bg-[#F0F5FF] rounded-full flex items-center justify-center">
            <Lock size={40} className="text-[var(--royal)]" />
          </div>
        </div>

        <div className="space-y-3">
          {privacyItems.map((item) => (
            <div key={item.key} className="bg-[#F8FAFC] rounded-[20px] p-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[#F0F5FF] rounded-xl flex items-center justify-center text-[var(--royal)]">{item.icon}</div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{item.label}</p>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
              </div>
              <button onClick={() => toggle(item.key)} className={`w-12 h-7 rounded-full transition-colors duration-300 relative ${settings[item.key] ? 'bg-[var(--royal)]' : 'bg-gray-300'}`}>
                <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 ${settings[item.key] ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-rose-50 rounded-[20px] p-5">
          <h3 className="font-bold text-rose-700 text-sm mb-1">Hapus Akun</h3>
          <p className="text-xs text-rose-500 mb-4">Tindakan ini tidak dapat dibatalkan. Semua data akan dihapus.</p>
          <button className="w-full bg-rose-500 text-white py-3 rounded-2xl text-sm font-bold hover:bg-rose-600 transition-colors">
            Hapus Akun Saya
          </button>
        </div>
      </div>
    </div>
  );
}
