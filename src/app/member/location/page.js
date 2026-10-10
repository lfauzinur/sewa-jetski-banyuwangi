'use client';
import { useEffect, useState } from 'react';
import { ChevronLeft, MapPin, Clock, Phone, Navigation, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getActiveBasecamps } from '@/lib/supabase-data';

export default function LocationPage() {
  const router = useRouter();
  const [basecamps, setBasecamps] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBc, setSelectedBc] = useState(null);

  useEffect(() => {
    async function loadData() {
      const data = await getActiveBasecamps();
      setBasecamps(data);
      setIsLoading(false);
    }
    loadData();
  }, []);

  // Detail view for a selected basecamp
  if (selectedBc) {
    const mapSrc = `https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d3000!2d${selectedBc.lng}!3d${selectedBc.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sid!2sid`;
    return (
      <div className="bg-gray-50 min-h-screen pb-24">
        <div className="bg-white px-6 py-6 border-b border-gray-100 flex items-center gap-4 sticky top-0 z-50">
          <button onClick={() => setSelectedBc(null)} className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-700 hover:bg-gray-100 transition-colors">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-lg font-black text-gray-900 truncate">{selectedBc.name}</h1>
        </div>

        <div className="p-6 space-y-6">
          <div className="w-full h-64 bg-gray-200 rounded-3xl overflow-hidden shadow-sm relative">
            <iframe src={mapSrc} width="100%" height="100%" style={{ border: 0 }} allowFullScreen="" loading="lazy"
              referrerPolicy="no-referrer-when-downgrade" className="absolute inset-0" />
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-5">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center flex-shrink-0">
                <MapPin size={24} />
              </div>
              <div>
                <h2 className="font-bold text-gray-900 text-lg">{selectedBc.name}</h2>
                <p className="text-gray-500 text-sm mt-1 leading-relaxed">{selectedBc.address}</p>
              </div>
            </div>

            <div className="flex gap-4 items-center">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center flex-shrink-0">
                <Clock size={24} />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm">Jam Operasional</p>
                <p className="text-gray-500 text-sm">{selectedBc.operating_hours || '-'}</p>
              </div>
            </div>

            <div className="flex gap-4 items-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center flex-shrink-0">
                <Phone size={24} />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm">Kontak Darurat / Bantuan</p>
                <p className="text-gray-500 text-sm">{selectedBc.phone || '-'}</p>
              </div>
            </div>
          </div>

          {selectedBc.maps_url && (
            <a href={selectedBc.maps_url} target="_blank" rel="noopener noreferrer"
              className="w-full bg-[var(--royal)] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30">
              <Navigation size={20} />
              Buka di Google Maps
            </a>
          )}
        </div>
      </div>
    );
  }

  // List view
  return (
    <div className="bg-gray-50 min-h-screen pb-24">
      <div className="bg-white px-6 py-6 border-b border-gray-100 flex items-center gap-4 sticky top-0 z-50">
        <button onClick={() => router.push('/member')} className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-700 hover:bg-gray-100 transition-colors">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-black text-gray-900">Lokasi Basecamp</h1>
      </div>

      <div className="p-6 space-y-4">
        <p className="text-gray-500 text-sm">Pilih lokasi basecamp untuk melihat detail dan peta.</p>

        {isLoading ? (
          <div className="space-y-4">
            <div className="bg-white h-28 rounded-2xl animate-pulse" />
            <div className="bg-white h-28 rounded-2xl animate-pulse" />
          </div>
        ) : basecamps.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
            <MapPin size={48} className="text-gray-300 mx-auto mb-4" />
            <p className="font-bold text-gray-500">Belum ada lokasi basecamp.</p>
          </div>
        ) : (
          basecamps.map(bc => (
            <button key={bc.id} onClick={() => setSelectedBc(bc)}
              className="w-full bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md hover:border-blue-200 transition-all text-left active:scale-[0.98]">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 text-white flex items-center justify-center flex-shrink-0 shadow-md">
                <MapPin size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900">{bc.name}</h3>
                <p className="text-gray-500 text-sm mt-0.5 truncate">{bc.address}</p>
                <p className="text-xs text-gray-400 mt-1">🕐 {bc.operating_hours || '-'}</p>
              </div>
              <ChevronRight size={20} className="text-gray-300 flex-shrink-0" />
            </button>
          ))
        )}
      </div>
    </div>
  );
}
