'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Star, CheckCircle2 } from 'lucide-react';
import { jetskiUnits, watersportServices } from '@/lib/data';
import { getServices } from '@/lib/supabase-data';

export default function MemberUnitsPage() {
  const [units, setUnits] = useState([]);
  const [services, setServices] = useState([]);
  const [activeTab, setActiveTab] = useState('jetski');

  useEffect(() => {
    const loadData = async () => {
      const svcData = await getServices();
      if (svcData && svcData.length > 0) {
        setUnits(svcData.filter(s => s.type === 'jetski'));
        setServices(svcData.filter(s => s.type === 'activity'));
      } else {
        setUnits(jetskiUnits);
        setServices(watersportServices);
      }
    };
    loadData();
  }, []);

  const displayItems = activeTab === 'jetski' ? units : services;

  return (
    <div className="min-h-screen bg-[#F5F8FF] pb-24">
      {/* Header */}
      <div className="sticky top-0 bg-white/90 backdrop-blur-xl z-30 px-5 pt-12 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-4">
          <Link href="/member" className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-[var(--royal)] hover:bg-gray-100 transition-colors shadow-sm">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="font-bold text-gray-900 text-lg">Semua Layanan</h1>
            <p className="text-gray-400 text-xs">Pilih unit atau aktivitas favoritmu</p>
          </div>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="px-5 pt-5">
        <div className="flex bg-white rounded-2xl p-1.5 shadow-sm border border-gray-100">
          <button
            onClick={() => setActiveTab('jetski')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'jetski' ? 'bg-[var(--royal)] text-white shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Unit Jetski ({units.length})
          </button>
          <button
            onClick={() => setActiveTab('services')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'services' ? 'bg-[var(--royal)] text-white shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Layanan Lainnya ({services.length})
          </button>
        </div>
      </div>

      {/* Items List */}
      <div className="px-5 pt-5 space-y-4">
        {displayItems.map(item => (
          <Link
            key={item.id}
            href={`/member/booking/${item.slug || item.id}`}
            className="block bg-white rounded-[20px] overflow-hidden shadow-sm border border-gray-50 hover:shadow-md transition-all group"
          >
            <div className="relative h-44 w-full overflow-hidden">
              <Image
                src={item.image || '/images/hero-jetski.png'}
                alt={item.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold text-[var(--royal)] uppercase shadow-sm">
                {item.category || 'Aktivitas'}
              </div>
              {item.rating && (
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                  <Star size={10} className="text-amber-400 fill-amber-400" />
                  <span className="text-[10px] font-bold text-gray-700">{item.rating}</span>
                </div>
              )}
              <div className="absolute bottom-3 left-3 right-3">
                <h3 className="text-white font-extrabold text-lg drop-shadow-md">{item.name}</h3>
              </div>
            </div>
            <div className="p-4">
              <p className="text-gray-500 text-xs mb-3 line-clamp-2">{item.description}</p>

              {/* Details / Includes */}
              {(item.details || item.features) && (
                <div className="bg-blue-50/60 rounded-xl p-3 mb-3">
                  <p className="text-[9px] font-bold text-[var(--cyan)] uppercase tracking-wider mb-1.5">Termasuk:</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1">
                    {(item.details ? item.details.split('\n') : item.features || []).slice(0, 4).map((detail, idx) => (
                      <span key={idx} className="flex items-center gap-1.5 text-[10px] text-gray-600 font-medium">
                        <CheckCircle2 size={11} className="text-[var(--cyan)] shrink-0" />
                        {detail}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[9px] text-gray-400 uppercase tracking-wider font-semibold">Mulai dari</span>
                  <p className="text-[var(--royal)] text-base font-black">Rp {(item.price || item.pricePerSlot || 0).toLocaleString('id-ID')}</p>
                </div>
                <div className="bg-[var(--royal)] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-blue-500/20">
                  Booking →
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
