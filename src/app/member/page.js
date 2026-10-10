'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, LogOut, Star, Waves, MapPin, Gift, Receipt, CreditCard, Sparkles, CheckCircle2, Navigation } from 'lucide-react';
import { jetskiUnits, articles as fallbackArticles, watersportServices as fallbackServices } from '@/lib/data';
import { getServices, getArticles, getPromos } from '@/lib/supabase-data';
import { supabase } from '@/lib/supabase';

const defaultPromos = [
  { id: 1, title: 'BELI 1\nGRATIS 1', subtitle: 'Jetski Adventure', desc: 'Ajak teman & keluarga! Beli 1 tiket, gratis 1 tiket lagi. Berlaku weekdays.', bg: 'bg-blue-500', icon: '🎫' },
  { id: 2, title: 'PAKET VOUCHER\nLANGGANAN EKSKLUSIF', subtitle: 'Member VIP', desc: 'Hemat Lebih Banyak Setiap Hari! Nikmati Diskon Mingguan.', bg: 'bg-cyan-500', icon: '🎟️' },
];

export default function MemberHome() {
  const router = useRouter();
  const [services, setServices] = useState([]);
  const [otherServices, setOtherServices] = useState([]);
  const [articles, setArticles] = useState([]);
  const [user, setUser] = useState({ name: 'Guest', phone: '081234567890' });
  const [promos, setPromos] = useState(defaultPromos);
  const [totalBookings, setTotalBookings] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      // Load services from Supabase
      const svcData = await getServices();
      if (svcData && svcData.length > 0) {
        setServices(svcData.filter(s => s.type === 'jetski'));
        setOtherServices(svcData.filter(s => s.type === 'activity'));
      } else {
        setServices(jetskiUnits);
        setOtherServices(fallbackServices || []);
      }

      // Load articles from Supabase
      const artData = await getArticles();
      if (artData && artData.length > 0) setArticles(artData);
      else setArticles(fallbackArticles || []);

      // Load promos from Supabase
      const promoData = await getPromos();
      if (promoData && promoData.length > 0) {
        setPromos(promoData.map(p => ({ ...p, desc: p.description, bg: p.bg_color })));
      }

      // Get user from Supabase session
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser({
          email: session.user.email,
          name: session.user.user_metadata?.name || session.user.email.split('@')[0],
          phone: session.user.user_metadata?.phone || '',
        });
      } else {
        const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
        if (storedUser) setUser(storedUser);
      }
    };
    loadData();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const features = [
    { name: 'Navigasi', icon: <Navigation size={24} className="text-white" />, href: '/member/navigation', color: 'bg-red-500 shadow-md shadow-red-500/20' },
    { name: 'Pesan Unit', icon: <Waves size={24} className="text-blue-500" />, href: '#booking', color: 'bg-blue-50' },
    { name: 'Lokasi', icon: <MapPin size={24} className="text-rose-500" />, href: 'https://maps.google.com/?q=Pantai+Boom+Banyuwangi', color: 'bg-rose-50' },
    { name: 'Reward', icon: <Gift size={24} className="text-amber-500" />, href: '/member/rewards', color: 'bg-amber-50' },
    { name: 'Pesanan', icon: <Receipt size={24} className="text-emerald-500" />, href: '/member/bookings', color: 'bg-emerald-50' },
    { name: 'Pembayaran', icon: <CreditCard size={24} className="text-violet-500" />, href: '/member/profile/payment', color: 'bg-violet-50' },
  ];

  return (
    <div className="min-h-screen bg-[#F5F8FF] pb-24 font-sans">
      
      {/* Hero Background */}
      <div className="relative h-[280px] w-full bg-blue-900 rounded-b-[32px] overflow-hidden">
        <Image 
          src="/images/hero-jetski.png" 
          alt="Background" 
          fill 
          className="object-cover opacity-60 mix-blend-overlay"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
        
        <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-10 pt-12">
          <div>
            <div className="text-white font-black text-2xl tracking-tighter mb-8 italic drop-shadow-md">
              <span className="text-[var(--cyan)]">SEWA</span>JETSKI
            </div>
            <p className="text-white/90 text-sm font-medium mb-1 drop-shadow-sm">Selamat datang kembali,</p>
            <h1 className="text-white font-bold text-2xl drop-shadow-md">{user.name}</h1>
          </div>
          <button onClick={handleLogout} className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20 hover:bg-white/30 transition-colors">
            <LogOut size={18} />
          </button>
        </div>
      </div>

      {/* Stats Card (Overlapping) */}
      <div className="-mt-16 relative z-20 px-5">
        <div className="bg-white rounded-[24px] p-4 shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 flex flex-col">
          <div className="flex justify-between items-center mb-4 px-2 pt-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
                <Waves size={22} className="text-[var(--royal)]" />
              </div>
              <div>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-0.5">Total Booking</p>
                <p className="text-xl font-black text-gray-900 leading-none">{totalBookings} <span className="text-[10px] font-bold text-gray-400">tiket</span></p>
              </div>
            </div>
            
            <div className="w-px h-10 bg-gray-100"></div>
            
            <div className="flex items-center gap-3 pl-2">
              <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center">
                <Star size={22} className="text-amber-500" />
              </div>
              <div>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-0.5">Level</p>
                <p className="text-sm font-black text-[var(--royal)] leading-none mt-1">CAPTAIN</p>
              </div>
            </div>
          </div>
          
          <Link href="/member/bookings" className="bg-[#F8FAFC] rounded-[16px] p-3 flex justify-between items-center group hover:bg-blue-50 transition-colors">
            <div className="flex items-center gap-3">
              <Receipt size={16} className="text-[var(--royal)]" />
              <span className="text-xs font-bold text-gray-700">Lihat Tiket Booking Anda</span>
            </div>
            <ChevronRight size={16} className="text-gray-400 group-hover:text-[var(--royal)] transition-colors" />
          </Link>
        </div>
      </div>

      {/* Digital Member Card */}
      <div className="mt-5 px-5">
        <div className="relative h-36 rounded-[24px] overflow-hidden bg-gradient-to-r from-[#1A365D] to-[#2B6CB0] shadow-lg">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-xl" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-[var(--cyan)]/20 rounded-full blur-xl" />
          
          <div className="relative z-10 p-5 flex justify-between items-center h-full">
            <div className="flex flex-col h-full justify-between py-1">
              <div>
                <p className="text-white/70 text-[9px] font-black tracking-widest uppercase mb-1">MEMBER VIP</p>
                <h2 className="text-white font-bold text-[15px] leading-tight mb-1">Kartu Member Digital</h2>
                <p className="text-white/60 text-[9px] max-w-[130px] leading-snug">Scan QR di kasir untuk check-in dan mengumpulkan poin.</p>
              </div>
              <div>
                <p className="text-white/50 text-[8px] tracking-widest uppercase mb-0.5">NOMOR MEMBER</p>
                <p className="text-white font-mono font-bold tracking-widest text-xs drop-shadow-md">{user.phone || '082243701993'}</p>
              </div>
            </div>
            
            <div className="bg-white p-2 rounded-xl shadow-inner flex-shrink-0">
              <div className="w-[72px] h-[72px] relative grid grid-cols-4 grid-rows-4 gap-0.5 p-0.5">
                {Array.from({ length: 16 }).map((_, i) => (
                  <div key={i} className={`bg-gray-900 rounded-[2px] ${[0, 1, 3, 4, 6, 7, 9, 11, 12, 14, 15].includes(i) ? 'opacity-100' : 'opacity-0'}`}></div>
                ))}
              </div>
              <p className="text-[6px] text-center font-bold text-gray-400 mt-1 uppercase">Tunjukkan ke Admin</p>
            </div>
          </div>
        </div>
      </div>

      {/* JELAJAHI Fitur Spesial */}
      <div className="mt-8 px-5">
        <div className="flex justify-between items-end mb-5">
          <div>
            <p className="text-[var(--cyan)] font-black text-[10px] tracking-widest uppercase mb-1">JELAJAHI</p>
            <h2 className="text-gray-900 font-extrabold text-[19px]">Fitur spesial</h2>
          </div>
          <div className="bg-blue-50 text-[var(--royal)] px-3 py-1.5 rounded-full text-[10px] font-bold">Sering dipakai</div>
        </div>
        
        <div className="grid grid-cols-4 gap-y-6 gap-x-2">
          {features.map((item, idx) => (
            <Link key={idx} href={item.href} className="flex flex-col items-center group">
              <div className={`w-14 h-14 ${item.color} rounded-full flex items-center justify-center mb-2 shadow-sm group-hover:scale-105 transition-transform`}>
                {item.icon}
              </div>
              <span className="text-[10px] font-bold text-gray-700 text-center leading-tight">{item.name}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* PILIHAN HARI INI Promo spesial */}
      <div className="mt-10 pl-5 overflow-hidden">
        <div className="flex justify-between items-end mb-5 pr-5">
          <div>
            <p className="text-[var(--cyan)] font-black text-[10px] tracking-widest uppercase mb-1">PILIHAN HARI INI</p>
            <h2 className="text-gray-900 font-extrabold text-[19px]">Promo spesial</h2>
          </div>
          <div className="bg-blue-50 text-[var(--royal)] px-3 py-1.5 rounded-full text-[10px] font-bold">Lihat semua</div>
        </div>
        
        <div className="flex overflow-x-auto gap-4 pb-4 pr-5 scrollbar-hide snap-x">
          {promos.map((promo) => (
            <div key={promo.id} className={`flex-shrink-0 w-[280px] h-[160px] rounded-[24px] ${promo.bg} p-5 relative overflow-hidden shadow-lg snap-center flex flex-col justify-between`}>
              <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-xl"></div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="bg-white/20 p-1.5 rounded-lg text-white text-xs backdrop-blur-sm">{promo.icon}</div>
                  <span className="text-white text-[10px] font-bold tracking-widest uppercase">{promo.subtitle}</span>
                </div>
                <h3 className="text-white text-xl font-black leading-tight drop-shadow-md whitespace-pre-line">{promo.title}</h3>
              </div>
              <div className="flex justify-between items-end">
                <p className="text-white/90 text-[9px] font-medium max-w-[150px] leading-tight">{promo.desc}</p>
                <p className="text-white/50 text-[8px] font-bold tracking-wider">S&K Berlaku</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* BOOKING - Unit Jetski HORIZONTAL SLIDER */}
      <div id="booking" className="mt-10 pl-5 overflow-hidden">
        <div className="flex justify-between items-end mb-5 pr-5">
          <div>
            <p className="text-[var(--cyan)] font-black text-[10px] tracking-widest uppercase mb-1">BOOKING</p>
            <h2 className="text-gray-900 font-extrabold text-[19px]">Pilih Unit Jetski</h2>
          </div>
          <Link href="/member/units" className="bg-blue-50 text-[var(--royal)] px-3 py-1.5 rounded-full text-[10px] font-bold">Lihat semua</Link>
        </div>
        
        <div className="flex overflow-x-auto gap-4 pb-4 pr-5 scrollbar-hide snap-x">
          {services.map((unit) => (
            <Link key={unit.id} href={`/member/booking/${unit.id}`} className="flex-shrink-0 w-[280px] bg-white rounded-[24px] p-3 shadow-sm border border-gray-50 hover:shadow-md transition-all group snap-center">
              <div className="flex items-center gap-4">
                <div className="relative w-24 h-24 rounded-[16px] overflow-hidden bg-gray-100 flex-shrink-0">
                  <Image src={unit.image} alt={unit.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="96px" />
                </div>
                
                <div className="flex-1 py-1">
                  <h3 className="font-extrabold text-gray-900 text-base leading-tight mb-0.5">{unit.name.split(' ')[0]} {unit.name.split(' ')[1]}</h3>
                  <p className="text-gray-400 text-[10px] uppercase font-bold tracking-wider mb-2">{unit.name.split(' ').slice(2).join(' ') || 'Adventure'}</p>
                  <p className="text-[var(--royal)] text-[11px] font-black">Rp {(unit.price || unit.pricePerSlot || 0).toLocaleString('id-ID')}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Star size={10} className="text-amber-400 fill-amber-400" />
                    <span className="font-bold text-[10px] text-gray-500">{unit.rating || '4.8'}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* LAYANAN LAINNYA HORIZONTAL SLIDER */}
      {otherServices.length > 0 && (
        <div className="mt-10 pl-5 overflow-hidden">
          <div className="flex justify-between items-end mb-5 pr-5">
            <div>
              <p className="text-[var(--cyan)] font-black text-[10px] tracking-widest uppercase mb-1">AKTIVITAS</p>
              <h2 className="text-gray-900 font-extrabold text-[19px]">Layanan lainnya</h2>
            </div>
            <Link href="/member/units" className="bg-blue-50 text-[var(--royal)] px-3 py-1.5 rounded-full text-[10px] font-bold">Lihat semua</Link>
          </div>
          
          <div className="flex overflow-x-auto gap-4 pb-4 pr-5 scrollbar-hide snap-x">
            {otherServices.map((svc) => (
              <Link href={`/member/booking/${svc.slug || svc.id}`} key={svc.id} className="flex-shrink-0 w-[200px] bg-white rounded-[20px] overflow-hidden shadow-sm border border-gray-50 snap-center hover:shadow-md transition-shadow">
                <div className="relative h-24 w-full overflow-hidden">
                  <Image src={svc.image} alt={svc.name} fill className="object-cover" sizes="200px" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                </div>
                <div className="p-3">
                  <h3 className="font-bold text-gray-900 text-xs mb-1 line-clamp-1">{svc.name}</h3>
                  <p className="text-gray-400 text-[9px] mb-2 line-clamp-1">{svc.duration || ''}</p>
                  {svc.details && (
                    <div className="space-y-0.5 mb-2">
                      {svc.details.split('\n').slice(0, 2).map((d, i) => (
                        <span key={i} className="flex items-center gap-1 text-[9px] text-gray-500">
                          <CheckCircle2 size={9} className="text-[var(--cyan)] shrink-0" />{d}
                        </span>
                      ))}
                      {svc.details.split('\n').length > 2 && (
                        <span className="text-[8px] text-gray-400 pl-3">+{svc.details.split('\n').length - 2} lainnya</span>
                      )}
                    </div>
                  )}
                  <p className="text-[10px] font-bold text-[var(--royal)]">Rp {(svc.price || 0).toLocaleString('id-ID')}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ARTIKEL TERBARU HORIZONTAL SLIDER */}
      {articles.length > 0 && (
        <div className="mt-10 pl-5 overflow-hidden mb-6">
          <div className="flex justify-between items-end mb-5 pr-5">
            <div>
              <p className="text-[var(--cyan)] font-black text-[10px] tracking-widest uppercase mb-1">INFORMASI</p>
              <h2 className="text-gray-900 font-extrabold text-[19px]">Artikel terbaru</h2>
            </div>
            <Link href="/member/articles" className="bg-blue-50 text-[var(--royal)] px-3 py-1.5 rounded-full text-[10px] font-bold">Lihat semua</Link>
          </div>
          
          <div className="flex overflow-x-auto gap-4 pb-4 pr-5 scrollbar-hide snap-x">
            {articles.map((article) => (
              <Link href={`/member/articles/${article.slug || article.id}`} key={article.id} className="block flex-shrink-0 w-60 bg-white rounded-[24px] overflow-hidden shadow-sm border border-gray-50 group snap-center">
                <div className="relative h-32 w-full overflow-hidden">
                  <Image src={article.image || '/images/hero-jetski.png'} alt={article.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="240px" />
                  <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-[10px] font-bold text-[var(--royal)] uppercase shadow-sm">
                    {article.category || 'Tips'}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 text-sm line-clamp-2 mb-2 group-hover:text-[var(--royal)] transition-colors">{article.title}</h3>
                  <p className="text-gray-500 text-xs line-clamp-2">{article.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
