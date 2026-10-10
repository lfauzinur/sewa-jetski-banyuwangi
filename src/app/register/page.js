'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';

// Translate Supabase errors to user-friendly Indonesian messages
function translateError(err) {
  const msg = (err.message || '').toLowerCase();
  if (msg.includes('email rate limit exceeded') || msg.includes('rate limit')) {
    return 'Terlalu banyak percobaan. Silakan tunggu beberapa menit lalu coba lagi.';
  }
  if (msg.includes('user already registered') || msg.includes('already been registered')) {
    return 'Email ini sudah terdaftar. Silakan login atau gunakan email lain.';
  }
  if (msg.includes('invalid email')) {
    return 'Format email tidak valid. Periksa kembali email Anda.';
  }
  if (msg.includes('password') && msg.includes('at least')) {
    return 'Password minimal 6 karakter.';
  }
  if (msg.includes('signup is disabled')) {
    return 'Pendaftaran sedang ditutup sementara. Silakan coba lagi nanti.';
  }
  if (msg.includes('network') || msg.includes('fetch')) {
    return 'Koneksi internet bermasalah. Periksa koneksi Anda dan coba lagi.';
  }
  return err.message || 'Gagal mendaftar. Silakan coba lagi.';
}

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!formData.name || !formData.email || !formData.password || !formData.phone) {
        throw new Error('Semua kolom wajib diisi.');
      }

      if (formData.password.length < 6) {
        throw new Error('Password minimal 6 karakter.');
      }

      const { data, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            phone: formData.phone,
            role: 'member',
          },
        },
      });

      if (authError) throw authError;

      if (data.session) {
        localStorage.setItem('user', JSON.stringify({ email: formData.email, name: formData.name, role: 'member' }));
        router.push('/member');
      } else {
        // Email confirmation is required
        setSuccess('Pendaftaran berhasil! 🎉 Silakan cek email Anda untuk konfirmasi akun.');
      }
    } catch (err) {
      setError(translateError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-row-reverse">
      {/* Right - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(/images/gallery-sunset.png)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-l from-[var(--teal-dark)]/90 to-[var(--cyan)]/60" />
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div className="flex justify-end">
            <Link href="/" className="flex items-center gap-3 text-white">
              <div className="text-right">
                <span className="font-extrabold text-lg block leading-tight">Banyuwangi</span>
                <span className="text-cyan-200 text-[10px] uppercase tracking-widest font-semibold">Watersport</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-lg">🌊</div>
            </Link>
          </div>

          <div className="text-right">
            <h2 className="text-4xl font-extrabold text-white mb-4 leading-tight">
              Bergabung Bersama Kami! 🌴
            </h2>
            <p className="text-white/70 max-w-md ml-auto">
              Dapatkan akses mudah untuk booking online, promo spesial, dan pengalaman watersport yang tak terlupakan.
            </p>
          </div>

          <div className="flex items-center justify-end gap-4 text-white">
            <span className="text-white/80 text-sm">Daftar kurang dari 1 menit</span>
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-lg border-2 border-white/30">⚡</div>
          </div>
        </div>
      </div>

      {/* Left - Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-white">
        <div className="w-full max-w-md">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-600 text-sm font-semibold mb-8 transition-colors">
            <ArrowLeft size={16} /> Kembali ke Beranda
          </Link>

          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Buat Akun Baru</h1>
          <p className="text-gray-500 mb-8">Lengkapi data diri Anda untuk memulai.</p>

          {success && (
            <div className="bg-emerald-50 text-emerald-700 text-sm px-4 py-3 rounded-xl mb-6 border border-emerald-200 flex items-start gap-2">
              <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span>{success}</span>
            </div>
          )}

          {error && (
            <div className="bg-rose-50 text-rose-600 text-sm px-4 py-3 rounded-xl mb-6 border border-rose-100 flex items-start gap-2">
              <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Nama Lengkap</label>
              <div className="relative">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Budi Setiawan"
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 focus:border-[var(--cyan)] focus:ring-2 focus:ring-[var(--cyan)]/20 outline-none text-sm transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Nomor WhatsApp</label>
              <div className="relative">
                <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="081234567890"
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 focus:border-[var(--cyan)] focus:ring-2 focus:ring-[var(--cyan)]/20 outline-none text-sm transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="nama@email.com"
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 focus:border-[var(--cyan)] focus:ring-2 focus:ring-[var(--cyan)]/20 outline-none text-sm transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Minimal 8 karakter"
                  className="w-full pl-12 pr-12 py-3.5 rounded-xl border border-gray-200 focus:border-[var(--cyan)] focus:ring-2 focus:ring-[var(--cyan)]/20 outline-none text-sm transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-cyan w-full py-3.5 text-base justify-center disabled:opacity-50 mt-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>
                  Memproses...
                </span>
              ) : 'Daftar Sekarang'}
            </button>
          </form>

          <p className="text-center mt-6 text-sm text-gray-500">
            Sudah punya akun?{' '}
            <Link href="/login" className="font-bold text-[var(--cyan)] hover:text-[var(--teal)]">Masuk di sini</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
