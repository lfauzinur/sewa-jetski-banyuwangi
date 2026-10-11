'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, ArrowLeft, Waves, User, ShieldCheck } from 'lucide-react';
import { supabase } from '@/lib/supabase';

// Translate Supabase errors to user-friendly Indonesian messages
function translateError(err) {
  const msg = (err.message || '').toLowerCase();
  if (msg.includes('invalid login credentials') || msg.includes('invalid_credentials')) {
    return 'Email atau password salah. Silakan periksa kembali.';
  }
  if (msg.includes('email not confirmed')) {
    return 'Email belum dikonfirmasi. Silakan cek inbox email Anda.';
  }
  if (msg.includes('rate limit') || msg.includes('too many requests')) {
    return 'Terlalu banyak percobaan login. Tunggu beberapa menit lalu coba lagi.';
  }
  if (msg.includes('network') || msg.includes('fetch')) {
    return 'Koneksi internet bermasalah. Periksa koneksi Anda dan coba lagi.';
  }
  if (msg.includes('user not found')) {
    return 'Akun tidak ditemukan. Silakan daftar terlebih dahulu.';
  }
  return err.message || 'Login gagal. Periksa kembali email dan password Anda.';
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!email || !password) {
        throw new Error('Email dan password wajib diisi.');
      }

      const cleanEmail = email.trim().toLowerCase();
      const cleanPass = password.trim();

      // Cek jika kredensial admin dimasukkan di halaman login umum
      if (
        (cleanEmail === 'admin@sewajetskibanyuwangi.com' || cleanEmail === 'admin' || cleanEmail === 'admin@jetskibanyuwangi.com') &&
        (cleanPass === 'admin123' || cleanPass === 'admin')
      ) {
        localStorage.setItem('admin_user', JSON.stringify({
          email: 'admin@sewajetskibanyuwangi.com',
          name: 'Admin Utama',
          role: 'super_admin',
          loggedInAt: new Date().toISOString()
        }));
        router.push('/admin');
        return;
      }

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPass,
      });

      if (authError) throw authError;

      if (data.session) {
        const userRole = data.user.user_metadata?.role;
        const userName = data.user.user_metadata?.name || data.user.email.split('@')[0];

        if (userRole === 'admin' || userRole === 'super_admin') {
          localStorage.setItem('admin_user', JSON.stringify({
            email: data.user.email,
            name: userName,
            role: userRole,
            loggedInAt: new Date().toISOString()
          }));
          router.push('/admin');
        } else {
          localStorage.setItem('user', JSON.stringify({ 
            email: data.user.email, 
            name: userName, 
            role: userRole || 'member' 
          }));
          router.push('/member');
        }
      }
    } catch (err) {
      setError(translateError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(/images/hero-jetski.png)' }}
        />
        <div className="absolute inset-0 gradient-ocean opacity-80" />
        <div className="relative z-10 flex flex-col justify-between p-12">
          <Link href="/" className="flex items-center gap-3 text-white">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white">
              <Waves size={22} />
            </div>
            <div>
              <span className="font-extrabold text-lg block leading-tight">Banyuwangi</span>
              <span className="text-cyan-200 text-[10px] uppercase tracking-widest font-semibold">Watersport</span>
            </div>
          </Link>

          <div>
            <h2 className="text-4xl font-extrabold text-white mb-4 leading-tight">
              Mulai Petualangan<br />Watersport Anda!
            </h2>
            <p className="text-white/70 max-w-md">
              Login untuk booking jetski, melihat riwayat pesanan, dan mendapatkan penawaran eksklusif.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex -space-x-3">
              {[0, 1, 2, 3].map((_, i) => (
                <div key={i} className="w-10 h-10 rounded-full bg-cyan-700/80 flex items-center justify-center text-white border-2 border-white/40 shadow-sm">
                  <User size={18} />
                </div>
              ))}
            </div>
            <span className="text-white/80 text-sm font-medium">500+ pelanggan puas</span>
          </div>
        </div>
      </div>

      {/* Right - Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-white">
        <div className="w-full max-w-md">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-600 text-sm font-semibold mb-8 transition-colors">
            <ArrowLeft size={16} /> Kembali ke Beranda
          </Link>

          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Selamat Datang!</h1>
          <p className="text-gray-500 mb-8">Masuk ke akun Anda untuk melanjutkan booking.</p>

          {error && (
            <div className="bg-rose-50 text-rose-600 text-sm px-4 py-3 rounded-xl mb-6 border border-rose-100 flex items-start gap-2">
              <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
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

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[var(--cyan)] focus:ring-[var(--cyan)]" />
                <span className="text-sm text-gray-600">Ingat saya</span>
              </label>
              <a href="#" className="text-sm font-semibold text-[var(--cyan)] hover:text-[var(--teal)]">Lupa password?</a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-cyan w-full py-3.5 text-base justify-center disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>
                  Memproses...
                </span>
              ) : 'Masuk'}
            </button>
          </form>

          <p className="text-center mt-6 text-sm text-gray-500">
            Belum punya akun?{' '}
            <Link href="/register" className="font-bold text-[var(--cyan)] hover:text-[var(--teal)]">Daftar Sekarang</Link>
          </p>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <Link 
              href="/admin/login" 
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-[var(--teal)] transition-colors py-1 px-3 rounded-lg hover:bg-gray-50"
            >
              <ShieldCheck size={14} /> Masuk ke Panel Pengelola / Admin
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
