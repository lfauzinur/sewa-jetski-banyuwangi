'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, Eye, EyeOff, ShieldCheck, ArrowLeft, Sparkles, KeyRound, Mail, Waves, Zap, AlertTriangle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Kredensial default admin
  const DEFAULT_ADMIN = {
    email: 'admin@sewajetskibanyuwangi.com',
    password: 'admin123',
    name: 'Admin Utama'
  };

  useEffect(() => {
    setIsMounted(true);
    // If already logged in as admin, redirect to /admin
    try {
      const stored = localStorage.getItem('admin_user');
      if (stored) {
        router.push('/admin');
      }
    } catch (e) {
      // ignore
    }
  }, [router]);

  // Helper untuk auto-fill kredensial default
  const handleAutoFill = () => {
    setEmail(DEFAULT_ADMIN.email);
    setPassword(DEFAULT_ADMIN.password);
    setError('');
  };

  // Instant login 1-click
  const handleInstantLogin = () => {
    setIsLoading(true);
    localStorage.setItem('admin_user', JSON.stringify({
      email: DEFAULT_ADMIN.email,
      name: DEFAULT_ADMIN.name,
      role: 'super_admin',
      loggedInAt: new Date().toISOString()
    }));
    setTimeout(() => {
      router.push('/admin');
    }, 400);
  };

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    try {
      // 1. Cek kredensial default / format admin lokal
      const isDefault = (cleanEmail === DEFAULT_ADMIN.email || cleanEmail === 'admin' || cleanEmail === 'admin@jetskibanyuwangi.com') && 
                        (cleanPass === DEFAULT_ADMIN.password || cleanPass === 'admin');

      if (isDefault) {
        localStorage.setItem('admin_user', JSON.stringify({ 
          email: cleanEmail.includes('@') ? cleanEmail : DEFAULT_ADMIN.email, 
          name: DEFAULT_ADMIN.name, 
          role: 'super_admin',
          loggedInAt: new Date().toISOString()
        }));
        router.push('/admin');
        return;
      }

      // 2. Coba autentikasi via Supabase Auth jika menggunakan akun terdaftar
      if (cleanEmail.includes('@')) {
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: cleanPass
        });

        if (!authError && data?.session) {
          const userName = data.user.user_metadata?.name || data.user.email.split('@')[0];
          localStorage.setItem('admin_user', JSON.stringify({
            email: data.user.email,
            name: userName,
            role: data.user.user_metadata?.role || 'admin',
            id: data.user.id,
            loggedInAt: new Date().toISOString()
          }));
          router.push('/admin');
          return;
        }
      }

      // Jika tidak cocok keduanya
      setError('Email atau password tidak sesuai. Silakan gunakan kredensial default atau tombol Masuk Cepat.');
    } catch (err) {
      setError(err?.message || 'Gagal login ke dashboard admin.');
    } finally {
      setIsLoading(false);
    }
  }

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#072430] via-[#0b3c4d] to-[#041c26] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Decorative ocean background lights */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        
        {/* Back Link */}
        <div className="mb-6">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-cyan-200/70 hover:text-white text-xs font-semibold px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur transition-all hover:bg-white/10"
          >
            <ArrowLeft size={14} /> Kembali ke Beranda
          </Link>
        </div>

        {/* Card Container */}
        <div className="bg-white/10 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 border border-white/15 shadow-2xl">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20 mx-auto mb-4 border border-white/20">
              <Waves size={32} className="text-white" />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-400/10 border border-cyan-400/20 text-cyan-300 text-[11px] font-bold tracking-widest uppercase mb-2">
              <ShieldCheck size={13} /> Admin Portal
            </div>
            <h1 className="text-2xl font-black text-white">Dashboard Admin</h1>
            <p className="text-white/60 text-xs sm:text-sm mt-1">Sewa Jetski & Watersport Banyuwangi</p>
          </div>

          {/* Quick 1-Click Access Button */}
          <div className="mb-6 p-3.5 rounded-2xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/30 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-bold text-cyan-200 flex items-center gap-1.5">
                <Sparkles size={14} className="text-cyan-300 flex-shrink-0 animate-pulse" />
                Akses Instan Pengelola
              </p>
              <p className="text-[11px] text-white/70 truncate">Masuk langsung tanpa repot ketik sandi</p>
            </div>
            <button
              type="button"
              onClick={handleInstantLogin}
              disabled={isLoading}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-300 hover:to-cyan-400 text-gray-950 text-xs font-extrabold shadow-md flex-shrink-0 transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <Zap size={14} className="fill-current" /> 1-Klik Masuk
            </button>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-cyan-200 mb-1.5 uppercase tracking-wider">
                Email / Username Admin
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan-300/60" />
                <input
                  type="text"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm focus:ring-2 focus:ring-cyan-400 focus:border-transparent outline-none transition-all"
                  placeholder="admin@sewajetskibanyuwangi.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-cyan-200 mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <KeyRound size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan-300/60" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-10 pr-11 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm focus:ring-2 focus:ring-cyan-400 focus:border-transparent outline-none transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors p-1"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-400/40 text-red-200 px-4 py-3 rounded-xl text-xs sm:text-sm font-medium animate-shake flex items-center gap-2">
                <AlertTriangle size={15} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/25 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Lock size={16} />
                  Masuk ke Panel Admin
                </>
              )}
            </button>
          </form>

          {/* Preset / Default Credentials Info */}
          <div className="mt-6 pt-5 border-t border-white/10">
            <div className="bg-black/25 rounded-2xl p-3.5 border border-white/10 flex items-start justify-between gap-3">
              <div className="text-[11px] text-cyan-200/80 space-y-0.5">
                <p className="font-bold text-cyan-200">Kredensial Default:</p>
                <p><span className="text-white/50">Email:</span> {DEFAULT_ADMIN.email}</p>
                <p><span className="text-white/50">Pass:</span> {DEFAULT_ADMIN.password}</p>
              </div>
              <button
                type="button"
                onClick={handleAutoFill}
                className="text-[11px] font-bold text-cyan-300 hover:text-white bg-white/10 hover:bg-white/20 px-2.5 py-1.5 rounded-lg border border-white/15 transition-all flex-shrink-0 cursor-pointer"
              >
                Isi Otomatis
              </button>
            </div>

            <div className="text-center mt-4">
              <Link 
                href="/login" 
                className="text-xs text-cyan-300/70 hover:text-cyan-200 transition-colors"
              >
                Bukan admin? <span className="underline">Login sebagai Member / Pelanggan</span>
              </Link>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
