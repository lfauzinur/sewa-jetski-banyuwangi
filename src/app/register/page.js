'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!formData.name || !formData.email || !formData.password || !formData.phone) {
        throw new Error('Semua kolom wajib diisi.');
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

      // In some Supabase settings, email confirmation is required.
      // We will assume it signs in immediately or asks for confirmation.
      if (data.session) {
        localStorage.setItem('user', JSON.stringify({ email: formData.email, name: formData.name, role: 'member' }));
        router.push('/member');
      } else {
        // If email confirmation is required
        setError('Pendaftaran berhasil! Silakan cek email Anda untuk konfirmasi.');
      }
    } catch (err) {
      setError(err.message || 'Gagal mendaftar. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/member`
        }
      });
      if (error) throw error;
    } catch (err) {
      setError(err.message || 'Gagal login dengan Google');
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

          {error && (
            <div className="bg-rose-50 text-rose-600 text-sm px-4 py-3 rounded-xl mb-6 border border-rose-100">
              {error}
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

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
            <div className="relative flex justify-center"><span className="bg-white px-4 text-xs text-gray-400 font-semibold uppercase">atau</span></div>
          </div>

          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 py-3.5 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-sm font-semibold text-gray-700"
          >
            <svg width="20" height="20" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Daftar dengan Google
          </button>

          <p className="text-center mt-6 text-sm text-gray-500">
            Sudah punya akun?{' '}
            <Link href="/login" className="font-bold text-[var(--cyan)] hover:text-[var(--teal)]">Masuk di sini</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
