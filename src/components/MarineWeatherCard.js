'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Waves, Wind, Sun, MapPin, RefreshCw, ChevronRight, AlertTriangle, ShieldCheck, Navigation } from 'lucide-react';
import { getMaritimeWeather } from '@/lib/weather-service';

export default function MarineWeatherCard({ compact = false, showNavigationLink = true }) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [gpsDetecting, setGpsDetecting] = useState(false);
  const [userCoords, setUserCoords] = useState(null);

  // Fungsi deteksi GPS & fetch weather
  const fetchWeatherWithGps = (forceRefresh = false) => {
    setGpsDetecting(true);
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserCoords(coords);
          setGpsDetecting(false);
          const data = await getMaritimeWeather(coords, forceRefresh);
          setWeather(data);
          setLoading(false);
        },
        async (error) => {
          console.warn('Geolocation failed or denied, using default Banyuwangi:', error);
          setGpsDetecting(false);
          const data = await getMaritimeWeather(null, forceRefresh);
          setWeather(data);
          setLoading(false);
        },
        { enableHighAccuracy: true, timeout: 7000, maximumAge: 30000 }
      );
    } else {
      setGpsDetecting(false);
      getMaritimeWeather(null, forceRefresh).then((data) => {
        setWeather(data);
        setLoading(false);
      });
    }
  };

  useEffect(() => {
    fetchWeatherWithGps();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-[24px] p-5 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 flex items-center justify-center py-8">
        <div className="flex items-center gap-3 text-gray-500 text-xs font-bold">
          <div className="w-5 h-5 border-2 border-[var(--royal)] border-t-transparent rounded-full animate-spin" />
          <span>Mendeteksi Lokasi GPS & Gelombang Laut...</span>
        </div>
      </div>
    );
  }

  if (!weather) return null;

  const isDanger = weather.alertLevel === 'danger';
  const isWarning = weather.alertLevel === 'warning';

  return (
    <div className="bg-white rounded-[24px] p-5 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 relative overflow-hidden transition-all">
      {/* Background Accent Pill */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-blue-50/50 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />

      {/* Header Section */}
      <div className="flex items-start justify-between gap-3 mb-4 relative z-10">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-[var(--royal)] shrink-0 shadow-xs">
            <Waves size={24} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[var(--cyan)] font-black text-[10px] tracking-widest uppercase block leading-none">
                KONDISI LAUT (LIVE GPS)
              </span>
              {gpsDetecting && (
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              )}
            </div>
            <h3 className="text-gray-900 font-extrabold text-base leading-snug truncate mt-0.5">
              {weather.location}
            </h3>
            <p className="text-[11px] text-gray-400 font-medium flex items-center gap-1 truncate mt-0.5">
              <MapPin size={11} className="text-[var(--royal)] shrink-0" />
              <span>{weather.isGpsActive ? 'Lokasi GPS Akurat' : 'Perairan Banyuwangi'}</span>
              <span>•</span>
              <button 
                type="button" 
                onClick={() => fetchWeatherWithGps(true)}
                className="text-[var(--royal)] hover:underline inline-flex items-center gap-0.5 font-bold cursor-pointer"
              >
                <RefreshCw size={10} className={gpsDetecting ? 'animate-spin' : ''} />
                <span>Cek Ulang GPS</span>
              </button>
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <div className="shrink-0">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold shadow-2xs ${
            isDanger 
              ? 'bg-rose-50 text-rose-700 border border-rose-200 animate-pulse'
              : isWarning
              ? 'bg-amber-50 text-amber-800 border border-amber-200'
              : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
          }`}>
            <span className={`w-2 h-2 rounded-full ${
              isDanger ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
            }`} />
            <span>
              {isDanger ? 'Bahaya Cuaca' : isWarning ? 'Waspada' : 'Laut Aman'}
            </span>
          </span>
        </div>
      </div>

      {/* 3 Metric Tiles (Tinggi Ombak, Kecepatan Angin, Cuaca) */}
      <div className="grid grid-cols-3 gap-2.5 relative z-10">
        {/* Tile 1: Tinggi Ombak */}
        <div className="bg-[#F8FAFC] rounded-[18px] p-3 text-center border border-gray-100/80 flex flex-col justify-between">
          <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider block">
            Tinggi Ombak
          </span>
          <div className="my-1">
            <span className="text-xl sm:text-2xl font-black font-mono text-gray-900 leading-none">
              {weather.waveHeight}
            </span>
            <span className="text-[11px] font-bold text-gray-500 ml-0.5">m</span>
          </div>
          <div>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md inline-block leading-tight ${
              weather.waveHeight >= 1.5 
                ? 'bg-rose-100 text-rose-800' 
                : weather.waveHeight >= 1.0 
                ? 'bg-amber-100 text-amber-800' 
                : 'bg-blue-100 text-blue-800'
            }`}>
              {weather.waveHeight >= 1.5 ? 'Tinggi' : weather.waveHeight >= 1.0 ? 'Sedang' : 'Tenang'}
            </span>
          </div>
        </div>

        {/* Tile 2: Kecepatan Angin */}
        <div className="bg-[#F8FAFC] rounded-[18px] p-3 text-center border border-gray-100/80 flex flex-col justify-between">
          <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider block">
            Kecepatan Angin
          </span>
          <div className="my-1">
            <span className="text-xl sm:text-2xl font-black font-mono text-gray-900 leading-none">
              {weather.windKnots}
            </span>
            <span className="text-[11px] font-bold text-gray-500 ml-0.5">kts</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded-md inline-block leading-tight truncate max-w-full">
              {weather.windCompass}
            </span>
          </div>
        </div>

        {/* Tile 3: Cuaca & Suhu */}
        <div className="bg-[#F8FAFC] rounded-[18px] p-3 text-center border border-gray-100/80 flex flex-col justify-between">
          <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider block">
            Cuaca Maritim
          </span>
          <div className="my-1 px-1">
            <span className="text-xs sm:text-sm font-extrabold text-gray-900 leading-tight block truncate">
              {weather.weatherDescription}
            </span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded-md inline-block leading-tight">
              {weather.temperature}°C
            </span>
          </div>
        </div>
      </div>

      {/* Footer / Navigation Link */}
      {showNavigationLink && (
        <Link 
          href="/member/navigation"
          className="mt-4 pt-3.5 border-t border-gray-100 flex items-center justify-between group cursor-pointer"
        >
          <div className="flex items-center gap-2 text-xs font-bold text-[var(--royal)] group-hover:text-blue-700 transition-colors">
            <Navigation size={14} className="group-hover:rotate-45 transition-transform" />
            <span>Mulai Smart Navigation & Jelajahi Rute Safari</span>
          </div>
          <ChevronRight size={16} className="text-gray-400 group-hover:text-[var(--royal)] group-hover:translate-x-1 transition-all" />
        </Link>
      )}
    </div>
  );
}
