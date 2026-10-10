'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Camera, Save, Check } from 'lucide-react';

export default function EditProfile() {
  const router = useRouter();
  const [user, setUser] = useState({ name: '', email: '', phone: '', address: '' });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUser({ name: parsed.name || '', email: parsed.email || '', phone: parsed.phone || '', address: parsed.address || '' });
    }
  }, []);

  const handleSave = () => {
    const existing = JSON.parse(localStorage.getItem('user') || '{}');
    localStorage.setItem('user', JSON.stringify({ ...existing, ...user }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="min-h-screen bg-white pb-10">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md pt-10 pb-4 px-6 flex items-center justify-between">
        <button onClick={() => router.back()} className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-[var(--royal)]">
          <ChevronLeft size={24} />
        </button>
        <h1 className="font-bold text-gray-900 text-lg">Edit Profile</h1>
        <div className="w-10" />
      </div>

      {/* Avatar */}
      <div className="flex flex-col items-center mt-4 mb-8">
        <div className="relative">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-[var(--royal-soft)] bg-white">
            <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${user.name || 'User'}`} alt="Avatar" className="w-full h-full object-cover bg-gray-50" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-[var(--royal)] rounded-full flex items-center justify-center text-white shadow-md">
            <Camera size={14} />
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="px-6 space-y-5">
        {[
          { label: 'Nama Lengkap', key: 'name', type: 'text', placeholder: 'Masukkan nama lengkap' },
          { label: 'Email', key: 'email', type: 'email', placeholder: 'Masukkan email' },
          { label: 'No. Telepon', key: 'phone', type: 'tel', placeholder: 'Masukkan nomor telepon' },
          { label: 'Alamat', key: 'address', type: 'text', placeholder: 'Masukkan alamat' },
        ].map((field) => (
          <div key={field.key}>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">{field.label}</label>
            <input
              type={field.type}
              value={user[field.key]}
              onChange={(e) => setUser({ ...user, [field.key]: e.target.value })}
              placeholder={field.placeholder}
              className="w-full bg-[#F8FAFC] border border-gray-100 rounded-2xl px-4 py-3.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--royal)] focus:border-transparent transition-all"
            />
          </div>
        ))}

        <button
          onClick={handleSave}
          className={`w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all mt-6 ${
            saved 
              ? 'bg-emerald-500 text-white' 
              : 'bg-[var(--royal)] text-white shadow-[0_8px_20px_rgba(37,99,235,0.25)] hover:bg-blue-700'
          }`}
        >
          {saved ? <><Check size={18} /> Tersimpan!</> : <><Save size={18} /> Simpan Perubahan</>}
        </button>
      </div>
    </div>
  );
}
