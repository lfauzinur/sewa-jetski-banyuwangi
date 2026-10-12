'use client';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { 
  ChevronLeft, MapPin, Compass, Clock, 
  Navigation, Navigation2, ChevronRight, Waves, Sparkles
} from 'lucide-react';
import { getGpsRoutes, getGpsGeofences, DEFAULT_GPS_ROUTES } from '@/lib/supabase-data';
import MarineWeatherCard from '@/components/MarineWeatherCard';

// Dynamically import MapComponent to prevent SSR issues with Leaflet
const MapComponent = dynamic(() => import('@/components/MapComponent'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-screen bg-[#F5F8FF] flex flex-col items-center justify-center text-gray-800">
      <div className="w-12 h-12 border-4 border-[var(--royal)] border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-[var(--royal)] font-extrabold text-sm tracking-wide animate-pulse">
        Menghubungkan Radar GPS & Peta Navigasi...
      </p>
    </div>
  )
});

export default function NavigationPage() {
  const router = useRouter();
  const [routes, setRoutes] = useState([]);
  const [geofences, setGeofences] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [r, g] = await Promise.all([
        getGpsRoutes(),
        getGpsGeofences()
      ]);
      setRoutes(r && r.length > 0 ? r.filter(x => x.active) : DEFAULT_GPS_ROUTES);
      setGeofences((g || []).filter(x => x.active));
      setLoading(false);
    }
    loadData();
  }, []);

  // ══════════════════════════════════════════════════════════════════════
  // TAMPILAN 1: ROUTE SELECTION MENU (Sama dengan Tema UI/UX Member #F5F8FF)
  // ══════════════════════════════════════════════════════════════════════
  if (!isMapReady) {
    return (
      <div className="min-h-screen bg-[#F5F8FF] pb-24 font-sans text-gray-900">
        <div className="max-w-2xl mx-auto px-5 py-8">
          {/* Header Bar */}
          <div className="flex items-center justify-between mb-6">
            <button 
              onClick={() => router.push('/member')} 
              className="w-11 h-11 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <ChevronLeft size={22} />
            </button>
            <div className="text-right">
              <span className="text-[var(--cyan)] font-black text-[10px] tracking-widest uppercase block leading-none">
                SAFARI ENGINE
              </span>
              <span className="text-xs text-gray-500 font-bold">Banyuwangi Watersport</span>
            </div>
          </div>

          {/* Title Section */}
          <div className="mb-6">
            <p className="text-[var(--cyan)] font-black text-[10px] tracking-widest uppercase mb-1">
              PANDUAN JALUR LAUT
            </p>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              <span>Pilih Paket Rute Safari</span>
              <Compass size={24} className="text-[var(--royal)]" />
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 leading-relaxed">
              Panduan rute interaktif di stang jetski dengan deteksi geofencing cerdas & titik pos penjelajahan.
            </p>
          </div>

          {/* Live Maritime Weather Card (GPS-based, Clean Member UI) */}
          <div className="mb-6">
            <MarineWeatherCard showNavigationLink={false} />
          </div>

          {/* Safari Routes Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-[var(--cyan)] font-black text-[10px] tracking-widest uppercase">
                RUTE SAFARI RESMI ({routes.length})
              </p>
              <span className="text-[11px] text-gray-400 font-medium">Pilih untuk memulai</span>
            </div>

            {loading ? (
              <div className="bg-white rounded-[24px] p-8 border border-gray-100 shadow-sm text-center">
                <div className="w-8 h-8 border-3 border-[var(--royal)] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-xs text-gray-500 font-bold">Memuat rute safari...</p>
              </div>
            ) : routes.length === 0 ? (
              <div className="text-center py-10 bg-white rounded-[24px] border border-gray-100 shadow-sm">
                <p className="text-gray-500 text-sm font-medium">Belum ada rute aktif yang tersedia.</p>
              </div>
            ) : (
              routes.map((route) => {
                const checkpointsCount = route.checkpoints?.length || (route.path_data?.length ? route.path_data.length : 0);
                const isPro = route.difficulty === 'Mahir (Pro)';
                const isMedium = route.difficulty === 'Menengah';

                return (
                  <div
                    key={route.id}
                    onClick={() => {
                      setSelectedRoute(route);
                      setIsMapReady(true);
                    }}
                    className="bg-white hover:bg-blue-50/30 rounded-[24px] p-5 border border-gray-100 hover:border-blue-200 shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div 
                          className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform" 
                          style={{ 
                            backgroundColor: `${route.color || '#0284C7'}15`, 
                            color: route.color || '#0284C7' 
                          }}
                        >
                          <Navigation2 size={24} style={{ color: route.color || '#0284C7' }} />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-extrabold text-base text-gray-900 group-hover:text-[var(--royal)] transition-colors leading-snug truncate">
                            {route.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                              isPro ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                              isMedium ? 'bg-blue-50 text-blue-800 border border-blue-200' :
                              'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            }`}>
                              {route.difficulty || 'Pemula'}
                            </span>
                            <span className="text-gray-300 text-xs">•</span>
                            <span className="text-xs text-gray-500 font-semibold flex items-center gap-1">
                              <Clock size={12} className="text-gray-400" />
                              {route.duration_min ? `${route.duration_min} mnt` : '45 mnt'}
                            </span>
                            <span className="text-gray-300 text-xs">•</span>
                            <span className="text-xs text-gray-500 font-semibold">
                              {route.distance_km ? `${route.distance_km} km` : '~4 km'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-[var(--royal)] group-hover:text-white transition-colors shrink-0 mt-1">
                        <ChevronRight size={18} />
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mt-2 mb-3">
                      {route.description}
                    </p>

                    {/* Checkpoints & CTA Strip */}
                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-gray-600 font-bold">
                        <MapPin size={13} className="text-[var(--royal)]" />
                        <span>{checkpointsCount} Titik Pos Checkpoint</span>
                      </div>
                      <span className="text-xs font-black text-[var(--royal)] group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                        <span>Mulai Navigasi</span>
                        <span>→</span>
                      </span>
                    </div>
                  </div>
                );
              })
            )}

            {/* Opsi Navigasi Bebas */}
            <button 
              onClick={() => {
                setSelectedRoute(null);
                setIsMapReady(true);
              }}
              className="w-full bg-white hover:bg-gray-50 text-gray-700 font-bold p-4.5 rounded-[22px] border-2 border-dashed border-gray-200 text-center text-xs tracking-wider uppercase transition-all mt-4 cursor-pointer shadow-2xs flex items-center justify-center gap-2"
            >
              <span>Jelajah Bebas (Tanpa Jalur Safari)</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════
  // TAMPILAN 2: LIVE MAP NAVIGATION VIEW
  // ══════════════════════════════════════════════════════════════════════
  return (
    <div className="relative w-full h-[100dvh] overflow-hidden bg-black select-none font-sans">
      {/* Top Floating Control Bar */}
      <div className="absolute top-4 left-4 right-4 z-[9999] flex items-center gap-2 pointer-events-none">
        {/* Back / Change Route Button */}
        <button 
          onClick={() => setIsMapReady(false)} 
          className="pointer-events-auto w-12 h-12 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl flex items-center justify-center text-gray-900 border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer"
          title="Ganti Rute"
        >
          <ChevronLeft size={24} />
        </button>

        {/* Current Active Safari Route Badge */}
        {selectedRoute ? (
          <div className="pointer-events-auto flex-1 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl px-4 py-2.5 border border-gray-200 flex items-center justify-between min-w-0">
            <div className="min-w-0">
              <span className="text-[10px] font-black text-[var(--royal)] uppercase tracking-widest block leading-none mb-1">
                Navigasi Aktif
              </span>
              <p className="text-xs font-black text-gray-900 truncate leading-tight">
                {selectedRoute.name}
              </p>
            </div>
            <span className="shrink-0 text-[10px] font-mono text-[var(--royal)] bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-100 font-bold ml-2">
              {selectedRoute.distance_km ? `${selectedRoute.distance_km} km` : 'Aktif'}
            </span>
          </div>
        ) : (
          <div className="pointer-events-auto flex-1 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl px-4 py-2.5 border border-gray-200">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Mode Bebas</span>
            <p className="text-xs font-black text-gray-900">Perairan Terbuka Banyuwangi</p>
          </div>
        )}
      </div>

      {/* Map Engine Component */}
      <MapComponent 
        selectedRoute={selectedRoute} 
        routes={routes} 
        geofences={geofences} 
        onReturnToBase={() => setSelectedRoute(null)}
      />
    </div>
  );
}
