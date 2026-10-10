'use client';
import { useRouter } from 'next/navigation';
import { ChevronLeft, MapPin, Navigation, Clock, Phone } from 'lucide-react';

export default function LocationPage() {
  const router = useRouter();

  return (
    <div className="bg-gray-50 min-h-screen pb-24">
      {/* Header */}
      <div className="bg-white px-6 py-6 border-b border-gray-100 flex items-center gap-4 sticky top-0 z-50">
        <button 
          onClick={() => router.push('/member')} 
          className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-black text-gray-900">Lokasi Basecamp</h1>
      </div>

      <div className="p-6 space-y-6">
        {/* Map Container */}
        <div className="w-full h-64 bg-gray-200 rounded-3xl overflow-hidden shadow-sm relative">
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15796.338276061036!2d114.375253896582!3d-8.204359400000002!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dd1452297eb0ccb%3A0x6b978d5236ce4489!2sPantai%20Boom!5e0!3m2!1sid!2sid!4v1700000000000!5m2!1sid!2sid" 
            width="100%" 
            height="100%" 
            style={{ border: 0 }} 
            allowFullScreen="" 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
            className="absolute inset-0"
          ></iframe>
        </div>

        {/* Info Card */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-5">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center flex-shrink-0">
              <MapPin size={24} />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 text-lg">Pantai Boom Marina</h2>
              <p className="text-gray-500 text-sm mt-1 leading-relaxed">
                Jl. Raden Wijaya, Area Sawah/Kebun, Kertosari, Kec. Banyuwangi, Kabupaten Banyuwangi, Jawa Timur 68416
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-center">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center flex-shrink-0">
              <Clock size={24} />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm">Jam Operasional</p>
              <p className="text-gray-500 text-sm">Setiap Hari: 06:00 - 17:00 WIB</p>
            </div>
          </div>
          
          <div className="flex gap-4 items-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center flex-shrink-0">
              <Phone size={24} />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm">Kontak Darurat / Bantuan</p>
              <p className="text-gray-500 text-sm">+62 812-3456-7890</p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <a 
          href="https://maps.google.com/?q=Pantai+Boom+Banyuwangi" 
          target="_blank"
          rel="noopener noreferrer"
          className="w-full bg-[var(--royal)] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30"
        >
          <Navigation size={20} />
          Buka di Google Maps
        </a>
      </div>
    </div>
  );
}
