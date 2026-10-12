'use client';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { 
  ChevronLeft, MapPin, Compass, Waves, Wind, Clock, 
  ShieldCheck, AlertCircle, Sparkles, Navigation2, CheckCircle2, ChevronRight
} from 'lucide-react';
import { getGpsRoutes, getGpsGeofences, DEFAULT_GPS_ROUTES } from '@/lib/supabase-data';
import { getMaritimeWeather } from '@/lib/weather-service';

// Dynamically import MapComponent to prevent SSR issues with Leaflet
const MapComponent = dynamic(() => import('@/components/MapComponent'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
      <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-cyan-300 font-bold text-sm tracking-wide animate-pulse">Menghubungkan GPS Satelit & Navigasi Laut...</p>
    </div>
  )
});

export default function NavigationPage() {
  const router = useRouter();
  const [routes, setRoutes] = useState([]);
  const [geofences, setGeofences] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [r, g, w] = await Promise.all([
        getGpsRoutes(),
        getGpsGeofences(),
        getMaritimeWeather()
      ]);
      setRoutes(r && r.length > 0 ? r.filter(x => x.active) : DEFAULT_GPS_ROUTES);
      setGeofences((g || []).filter(x => x.active));
      setWeather(w);
      setLoading(false);
    }
    loadData();
  }, []);

  // ══════════════════════════════════════════════════════════════════════
  // TAMPILAN 1: ROUTE SELECTION MENU (PRD Section 3.1)
  // ══════════════════════════════════════════════════════════════════════
  if (!isMapReady) {
    return (
      <div className="bg-slate-900 min-h-screen text-white px-4 sm:px-6 py-8 pb-24 max-w-2xl mx-auto">
        {/* Header Bar */}
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={() => router.push('/member')} 
            className="w-11 h-11 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <ChevronLeft size={22} />
          </button>
          <div className="text-right">
            <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400 block">Safari Nav Engine</span>
            <span className="text-xs text-slate-400 font-mono">Banyuwangi Watersport</span>
          </div>
        </div>

        {/* Title */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Pilih Paket Rute Safari</span>
            <Compass size={24} className="text-cyan-400" />
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Panduan rute interaktif di stang jetski dengan geofencing cerdas & titik pos penjelajahan.
          </p>
        </div>

        {/* Live Weather Forecast Preview Card */}
        {weather && (
          <div className={`p-4 rounded-3xl border mb-6 transition-all ${
            weather.isEmergency 
              ? 'bg-rose-950/60 border-rose-600' 
              : 'bg-slate-800/80 border-slate-700/80'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Waves size={18} className="text-cyan-400" />
                <span className="text-xs font-black uppercase tracking-wider text-slate-200">
                  Kondisi Laut Selat Bali (Live)
                </span>
              </div>
              <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                weather.isEmergency 
                  ? 'bg-rose-500 text-white animate-pulse' 
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}>
                {weather.isEmergency ? 'Peringatan Gelombang' : 'Laut Aman Terbuka'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-slate-900/60 p-2.5 rounded-2xl border border-slate-700/50">
                <span className="text-[10px] text-slate-400 block">Tinggi Ombak</span>
                <span className="text-base font-black font-mono text-cyan-300">{weather.waveHeight}m</span>
              </div>
              <div className="bg-slate-900/60 p-2.5 rounded-2xl border border-slate-700/50">
                <span className="text-[10px] text-slate-400 block">Kecepatan Angin</span>
                <span className="text-base font-black font-mono text-emerald-300">{weather.windKnots} kts</span>
              </div>
              <div className="bg-slate-900/60 p-2.5 rounded-2xl border border-slate-700/50">
                <span className="text-[10px] text-slate-400 block">Cuaca</span>
                <span className="text-xs font-black text-amber-300 truncate block mt-0.5">
                  {weather.weatherDescription}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Safari Routes List */}
        <div className="space-y-4">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Rute Resmi Tersedia ({routes.length}):
          </p>

          {loading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-3 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-xs text-slate-400">Memuat rute safari...</p>
            </div>
          ) : routes.length === 0 ? (
            <div className="text-center py-10 bg-slate-800 rounded-3xl border border-slate-700">
              <p className="text-slate-400 text-sm">Belum ada rute aktif.</p>
            </div>
          ) : (
            routes.map((route) => {
              const checkpointsCount = route.checkpoints?.length || (route.path_data?.length ? route.path_data.length : 0);
              return (
                <div
                  key={route.id}
                  onClick={() => {
                    setSelectedRoute(route);
                    setIsMapReady(true);
                  }}
                  className="bg-slate-800/90 hover:bg-slate-800 border-2 border-slate-700/80 hover:border-cyan-400 rounded-3xl p-5 transition-all cursor-pointer shadow-lg hover:shadow-cyan-500/10 group"
                >
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform" 
                        style={{ backgroundColor: `${route.color || '#0284C7'}25`, color: route.color || '#0284C7' }}
                      >
                        <Navigation2 size={24} style={{ color: route.color || '#0284C7' }} />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-base text-white group-hover:text-cyan-300 transition-colors">
                          {route.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                            route.difficulty === 'Mahir (Pro)' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                            route.difficulty === 'Menengah' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                            'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}>
                            {route.difficulty || 'Pemula'}
                          </span>
                          <span className="text-slate-500 text-xs">•</span>
                          <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                            <Clock size={12} /> {route.duration_min ? `${route.duration_min} mnt` : '45 mnt'}
                          </span>
                          <span className="text-slate-500 text-xs">•</span>
                          <span className="text-xs text-slate-400 font-mono">
                            {route.distance_km ? `${route.distance_km} km` : '~4.5 km'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all mt-2" />
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3 pl-15">
                    {route.description}
                  </p>

                  {/* Checkpoints Preview */}
                  {route.checkpoints && route.checkpoints.length > 0 && (
                    <div className="bg-slate-900/70 p-3 rounded-2xl border border-slate-700/50 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <MapPin size={13} className="text-cyan-400" />
                        <span className="font-bold">{route.checkpoints.length} Titik Pos Checkpoint</span>
                      </div>
                      <span className="text-[11px] text-cyan-400 font-bold group-hover:underline">
                        Mulai Navigasi →
                      </span>
                    </div>
                  )}
                </div>
              );
            })
          )}

          {/* Jelajah Bebas Option */}
          <button 
            onClick={() => {
              setSelectedRoute(null);
              setIsMapReady(true);
            }}
            className="w-full bg-slate-800/50 hover:bg-slate-800 text-slate-300 hover:text-white p-4.5 rounded-3xl border border-slate-700/60 text-center font-bold text-xs tracking-wider uppercase transition-all mt-6 cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Navigasi Bebas (Tanpa Jalur Safari)</span>
          </button>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════
  // TAMPILAN 2: LIVE MAP NAVIGATION VIEW (PRD Section 3.1 & 3.2)
  // ══════════════════════════════════════════════════════════════════════
  return (
    <div className="relative w-full h-[100dvh] overflow-hidden bg-black select-none">
      {/* Top Floating Control Bar */}
      <div className="absolute top-4 left-4 right-4 z-[9999] flex items-center gap-2 pointer-events-none">
        {/* Back / Change Route Button */}
        <button 
          onClick={() => setIsMapReady(false)} 
          className="pointer-events-auto w-12 h-12 bg-slate-950/90 backdrop-blur-md rounded-2xl shadow-xl flex items-center justify-center text-white border border-slate-800 hover:bg-slate-900 transition-colors cursor-pointer"
          title="Ganti Rute"
        >
          <ChevronLeft size={24} />
        </button>

        {/* Current Active Safari Route Badge */}
        {selectedRoute ? (
          <div className="pointer-events-auto flex-1 bg-slate-950/90 backdrop-blur-md rounded-2xl shadow-xl px-4 py-2.5 border border-slate-800 flex items-center justify-between min-w-0">
            <div className="min-w-0">
              <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest block leading-none mb-1">
                Navigasi Aktif
              </span>
              <p className="text-xs font-black text-white truncate leading-tight">
                {selectedRoute.name}
              </p>
            </div>
            <span className="shrink-0 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20 font-bold ml-2">
              {selectedRoute.distance_km ? `${selectedRoute.distance_km} km` : 'Aktif'}
            </span>
          </div>
        ) : (
          <div className="pointer-events-auto flex-1 bg-slate-950/90 backdrop-blur-md rounded-2xl shadow-xl px-4 py-2.5 border border-slate-800">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Mode Bebas</span>
            <p className="text-xs font-black text-white">Perairan Terbuka Banyuwangi</p>
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
