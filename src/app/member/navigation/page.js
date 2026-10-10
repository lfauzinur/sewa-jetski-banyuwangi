'use client';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { ChevronLeft, MapPin } from 'lucide-react';
import { getGpsRoutes, getGpsGeofences } from '@/lib/supabase-data';

// Dynamically import the map to avoid window undefined errors in Next.js SSR
const MapComponent = dynamic(() => import('@/components/MapComponent'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-screen bg-gray-100 flex flex-col items-center justify-center">
      <div className="w-12 h-12 border-4 border-[var(--royal)] border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-gray-500 font-bold animate-pulse">Memuat Peta Navigasi...</p>
    </div>
  )
});

export default function NavigationPage() {
  const router = useRouter();
  const [routes, setRoutes] = useState([]);
  const [geofences, setGeofences] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [isMapReady, setIsMapReady] = useState(false);

  useEffect(() => {
    async function loadData() {
      const r = await getGpsRoutes();
      const g = await getGpsGeofences();
      setRoutes(r.filter(x => x.active));
      setGeofences(g.filter(x => x.active));
    }
    loadData();
  }, []);

  if (!isMapReady) {
    return (
      <div className="bg-gray-50 min-h-screen px-6 py-10 pb-24">
        <button onClick={() => router.push('/member')} className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-gray-700 hover:bg-gray-100 shadow-sm mb-6 border border-gray-100">
          <ChevronLeft size={24} />
        </button>
        
        <h1 className="text-2xl font-black text-gray-900 mb-2">Pilih Rute Tujuan</h1>
        <p className="text-sm text-gray-500 mb-8">Pilih rute aman yang telah kami siapkan untuk pengalaman terbaik Anda.</p>
        
        <div className="space-y-4">
          {routes.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-3xl border border-gray-100">
              <p className="text-gray-500 font-medium">Belum ada rute tersedia.</p>
            </div>
          ) : (
            routes.map((route) => (
              <button 
                key={route.id}
                onClick={() => {
                  setSelectedRoute(route);
                  setIsMapReady(true);
                }}
                className="w-full bg-white p-5 rounded-3xl border-2 border-gray-100 shadow-sm text-left hover:border-[var(--royal)] hover:shadow-md transition-all group flex items-start gap-4"
              >
                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center flex-shrink-0 group-hover:bg-[var(--royal)] group-hover:text-white transition-colors" style={{ color: route.color }}>
                  <MapPin size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base mb-1">{route.name}</h3>
                  <p className="text-xs text-gray-500 line-clamp-2">{route.description}</p>
                </div>
              </button>
            ))
          )}
          
          <button 
            onClick={() => setIsMapReady(true)}
            className="w-full bg-gray-900 text-white p-5 rounded-3xl shadow-sm text-center font-bold hover:bg-gray-800 transition-all mt-4"
          >
            Mulai Tanpa Rute (Jelajah Bebas)
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[100dvh] overflow-hidden bg-black">
      {/* Back Button Floating on Map */}
      <button 
        onClick={() => router.push('/member')} 
        className="absolute top-12 left-4 z-[9999] w-12 h-12 bg-white/90 backdrop-blur-md rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex items-center justify-center text-gray-900 border border-gray-100 hover:bg-gray-50 transition-colors"
      >
        <ChevronLeft size={24} />
      </button>

      {/* Info Panel Floating */}
      {selectedRoute && (
        <div className="absolute top-12 left-20 right-4 z-[9999] bg-white/90 backdrop-blur-md rounded-2xl shadow-lg px-4 py-3 border border-white">
          <p className="text-[10px] font-bold text-[var(--royal)] uppercase tracking-wide">Navigasi Aktif</p>
          <p className="text-sm font-black text-gray-900 truncate">{selectedRoute.name}</p>
        </div>
      )}

      {/* Map Content */}
      <MapComponent 
        selectedRoute={selectedRoute} 
        routes={routes} 
        geofences={geofences} 
      />
    </div>
  );
}
