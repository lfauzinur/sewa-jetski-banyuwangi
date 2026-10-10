'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Eye, EyeOff, Lock, KeyRound, ShieldCheck } from 'lucide-react';

export default function SecurityPage() {
  const router = useRouter();
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState({ old: '', new: '', confirm: '' });
  const [message, setMessage] = useState('');

  const handleSubmit = () => {
    if (!form.old || !form.new || !form.confirm) { setMessage('Semua field harus diisi.'); return; }
    if (form.new.length < 6) { setMessage('Password baru minimal 6 karakter.'); return; }
    if (form.new !== form.confirm) { setMessage('Konfirmasi password tidak cocok.'); return; }
    setMessage('Password berhasil diubah!');
    setForm({ old: '', new: '', confirm: '' });
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="min-h-screen bg-white pb-10">
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md pt-10 pb-4 px-6 flex items-center justify-between">
        <button onClick={() => router.back()} className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-[var(--royal)]">
          <ChevronLeft size={24} />
        </button>
        <h1 className="font-bold text-gray-900 text-lg">Security</h1>
        <div className="w-10" />
      </div>

      <div className="px-6 mt-4">
        {/* Icon */}
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 bg-[#F0F5FF] rounded-full flex items-center justify-center">
            <ShieldCheck size={40} className="text-[var(--royal)]" />
          </div>
        </div>

        <h2 className="font-bold text-gray-900 text-base mb-1">Ubah Password</h2>
        <p className="text-xs text-gray-500 mb-6">Pastikan password baru Anda kuat dan unik</p>

        {/* Fields */}
        <div className="space-y-4">
          {[
            { label: 'Password Lama', key: 'old', show: showOld, toggle: () => setShowOld(!showOld) },
            { label: 'Password Baru', key: 'new', show: showNew, toggle: () => setShowNew(!showNew) },
            { label: 'Konfirmasi Password', key: 'confirm', show: showConfirm, toggle: () => setShowConfirm(!showConfirm) },
          ].map((field) => (
            <div key={field.key}>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">{field.label}</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={field.show ? 'text' : 'password'}
                  value={form[field.key]}
                  onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                  className="w-full bg-[#F8FAFC] border border-gray-100 rounded-2xl pl-11 pr-12 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--royal)]"
                  placeholder="••••••••"
                />
                <button onClick={field.toggle} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                  {field.show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          ))}
        </div>

        {message && (
          <div className={`mt-4 p-3 rounded-2xl text-sm font-medium text-center ${message.includes('berhasil') ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
            {message}
          </div>
        )}

        <button onClick={handleSubmit} className="w-full mt-6 bg-[var(--royal)] text-white py-4 rounded-2xl font-bold text-sm shadow-[0_8px_20px_rgba(37,99,235,0.25)] hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
          <KeyRound size={18} /> Ubah Password
        </button>
      </div>
    </div>
  );
}
