'use client';
import { Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Clock, Phone, Bell, Waves, Sparkles, ChevronRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WhatsAppFloat from '@/components/WhatsAppFloat';
import { watersportServices, COMPANY, formatCurrency, getWhatsAppLink } from '@/lib/data';

const serviceExtras = {
  'banana-boat': {
    emoji: '🍌',
    color: 'from-yellow-400 to-orange-500',
    bgSoft: 'bg-yellow-50',
    textColor: 'text-yellow-600',
    highlights: ['Cocok untuk keluarga & grup', 'Kapasitas 4-8 orang', 'Air tenang & aman', 'Life jacket tersedia'],
  },
  'parasailing': {
    emoji: '🪂',
    color: 'from-sky-400 to-blue-600',
    bgSoft: 'bg-sky-50',
    textColor: 'text-sky-600',
    highlights: ['Terbang tinggi 50-100m', 'Pemandangan spektakuler', 'Instruktur bersertifikat', 'Foto udara gratis'],
  },
  'snorkeling': {
    emoji: '🤿',
    color: 'from-emerald-400 to-teal-600',
    bgSoft: 'bg-emerald-50',
    textColor: 'text-emerald-600',
    highlights: ['Terumbu karang indah', 'Peralatan lengkap', 'Guide lokal berpengalaman', 'Spot rahasia lokal'],
  },
  'flying-fish': {
    emoji: '🐠',
    color: 'from-violet-400 to-purple-600',
    bgSoft: 'bg-violet-50',
    textColor: 'text-violet-600',
    highlights: ['Sensasi terbang di air', 'Adrenalin tinggi', 'Driver profesional', 'Pengalaman unik'],
  },
  'paket-combo': {
    emoji: '🎉',
    color: 'from-rose-400 to-pink-600',
    bgSoft: 'bg-rose-50',
    textColor: 'text-rose-600',
    highlights: ['4 wahana sekaligus', 'Hemat hingga 30%', 'Full day experience', 'Makan siang included'],
  },
};

function ServiceComingSoonContent() {
  const params = useParams();
  const slug = params?.slug;

  const service = watersportServices.find(s => s.slug === slug);
  const extras = serviceExtras[slug] || {
    emoji: '🌊',
    color: 'from-cyan-400 to-teal-600',
    bgSoft: 'bg-cyan-50',
    textColor: 'text-cyan-600',
    highlights: ['Segera hadir', 'Stay tuned'],
  };

  // If it's jetski-adventure, redirect to main booking
  if (slug === 'jetski-adventure') {
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    return null;
  }

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-secondary)]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Layanan Tidak Ditemukan</h1>
          <Link href="/" className="text-[var(--cyan)] font-semibold hover:underline">Kembali ke Beranda</Link>
        </div>
      </div>
    );
  }

  const waMessage = `Halo, saya tertarik dengan layanan ${service.name} (${formatCurrency(service.price)}/sesi). Apakah sudah tersedia untuk booking?`;

  return (
    <main className="min-h-screen">
      <Navbar />

      {/* Hero Banner */}
      <section className="relative min-h-[60vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src={service.image}
            alt={service.name}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className={`absolute inset-0 bg-gradient-to-r ${extras.color} opacity-80`} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
        </div>

        {/* Floating decorations */}
        <div className="absolute top-20 right-10 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse" />
        <div className="absolute bottom-20 left-10 w-24 h-24 bg-white/10 rounded-full blur-lg animate-pulse delay-700" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-32 pb-20">
          <Link href="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white text-sm font-semibold mb-8 transition-colors">
            <ArrowLeft size={16} /> Kembali ke Beranda
          </Link>

          <div className="max-w-2xl">
            <div className="text-6xl mb-6 animate-bounce" style={{ animationDuration: '2s' }}>
              {extras.emoji}
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-4">
              {service.name}
            </h1>
            <p className="text-white/80 text-lg leading-relaxed mb-6">
              {service.description}
            </p>
            <div className="flex items-center gap-3 text-white/60">
              <Clock size={18} />
              <span className="text-sm font-medium">{service.duration} per sesi</span>
              <span className="text-white/30">•</span>
              <span className="text-2xl font-extrabold text-white">{formatCurrency(service.price)}</span>
            </div>
          </div>
        </div>

        {/* Wave Bottom */}
        <div className="absolute bottom-0 left-0 right-0 z-10">
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none" className="w-full h-16 sm:h-20">
            <path d="M0,64L48,58.7C96,53,192,43,288,48C384,53,480,75,576,80C672,85,768,75,864,64C960,53,1056,43,1152,42.7C1248,43,1344,53,1392,58.7L1440,64L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Coming Soon Content */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Coming Soon Badge */}
          <div className="text-center mb-16">
            <div className={`inline-flex items-center gap-2 ${extras.bgSoft} ${extras.textColor} px-6 py-3 rounded-full text-sm font-bold uppercase tracking-wider mb-6 border border-current/10`}>
              <Sparkles size={16} />
              <span>Segera Hadir — Coming Soon</span>
              <Sparkles size={16} />
            </div>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-4">
              Kami Sedang Mempersiapkan<br />
              Layanan Terbaik untuk Anda
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto leading-relaxed">
              Booking online untuk <strong>{service.name}</strong> akan segera tersedia. Sementara itu, Anda bisa langsung menghubungi kami via WhatsApp untuk reservasi manual.
            </p>
          </div>

          {/* Highlights Grid */}
          <div className="grid sm:grid-cols-2 gap-4 mb-12">
            {extras.highlights.map((item, i) => (
              <div key={i} className={`flex items-center gap-4 p-5 rounded-2xl ${extras.bgSoft} border border-current/5 group hover:scale-[1.02] transition-transform duration-300`}>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${extras.color} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
                  {i + 1}
                </div>
                <span className="font-semibold text-gray-800">{item}</span>
              </div>
            ))}
          </div>

          {/* CTA Cards */}
          <div className="grid sm:grid-cols-2 gap-6 mb-16">
            {/* WhatsApp CTA */}
            <a
              href={getWhatsAppLink(waMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className="relative overflow-hidden rounded-2xl p-8 bg-gradient-to-br from-green-500 to-emerald-600 text-white group hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Phone size={24} />
                </div>
                <h3 className="text-xl font-extrabold mb-2">Hubungi via WhatsApp</h3>
                <p className="text-white/80 text-sm mb-4">Chat langsung untuk booking manual atau tanya info lebih lanjut.</p>
                <div className="flex items-center gap-2 font-bold text-sm">
                  Chat Sekarang <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </a>

            {/* Notification CTA */}
            <div className="relative overflow-hidden rounded-2xl p-8 bg-gradient-to-br from-gray-800 to-gray-900 text-white group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mb-4">
                  <Bell size={24} />
                </div>
                <h3 className="text-xl font-extrabold mb-2">Dapatkan Notifikasi</h3>
                <p className="text-white/60 text-sm mb-4">Kami akan segera menginfokan ketika booking online sudah aktif.</p>
                <div className="flex items-center gap-2 text-gray-400 text-sm font-medium">
                  <Waves size={14} />
                  Follow media sosial kami
                </div>
              </div>
            </div>
          </div>

          {/* Other Services */}
          <div className="text-center">
            <p className="text-gray-500 text-sm mb-6">Sementara menunggu, coba layanan kami yang sudah tersedia:</p>
            <Link
              href="/login"
              className="btn btn-cyan text-base px-8 py-3.5 shadow-lg inline-flex items-center gap-2"
            >
              🏄 Booking Jetski Adventure
              <ChevronRight size={16} />
            </Link>
          </div>

        </div>
      </section>

      <Footer />
      <WhatsAppFloat />
    </main>
  );
}

export default function ServiceComingSoon() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-24 bg-white text-center">Loading...</div>}>
      <ServiceComingSoonContent />
    </Suspense>
  );
}
