'use client';
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Check, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

function BookingSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('id');
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    if (!bookingId) {
      router.push('/member');
      return;
    }
    const bookings = JSON.parse(localStorage.getItem('admin_bookings') || '[]');
    const found = bookings.find(b => b.id === bookingId);
    if (found) {
      setBooking(found);
    } else {
      router.push('/member');
    }
  }, [bookingId, router]);

  if (!booking) return null;

  const dateObj = new Date(booking.date);
  const formattedDate = dateObj.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });

  return (
    <div className="min-h-screen bg-white flex flex-col items-center">
      
      {/* Illustration Area */}
      <div className="relative w-full h-80 bg-[#F5F8FF] flex items-center justify-center pt-8">
        {/* We use a placeholder or hero image from the app since we don't have the exact illustration */}
        <div className="relative w-64 h-64">
          <Image 
            src="/images/hero-jetski.png" 
            alt="Success Illustration" 
            fill 
            className="object-contain drop-shadow-2xl opacity-90"
            priority
          />
        </div>
        
        {/* Floating Checkmark Badge */}
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-20 h-20 bg-[var(--royal)] rounded-full border-4 border-white flex items-center justify-center shadow-lg">
          <Check size={40} className="text-white" strokeWidth={3} />
        </div>
      </div>

      {/* Content Area */}
      <div className="px-8 pt-16 pb-8 text-center flex-1 flex flex-col">
        <h1 className="text-2xl font-extrabold text-[var(--royal)] mb-3">Congratulations</h1>
        
        <p className="text-gray-700 text-sm leading-relaxed mb-4">
          Your slot has been booked for Timeslot <br/>
          <strong className="text-gray-900">{booking.timeSlot}</strong>, On <strong className="text-gray-900">{formattedDate}</strong>, at <strong className="text-gray-900">{booking.unit.split(' ')[0] || 'Aspen'}</strong>. 
          Go to booking tab to see full details.
        </p>

        {/* Add-ons List */}
        {booking.addons && booking.addons.length > 0 && (
          <div className="mb-6 p-3.5 bg-amber-50/80 rounded-2xl border border-amber-200/60 max-w-xs mx-auto text-left shadow-2xs">
            <p className="text-[10px] font-bold text-amber-800 uppercase tracking-wider mb-1.5">Add-ons Tambahan:</p>
            <div className="space-y-1">
              {booking.addons.map((ad, idx) => (
                <div key={idx} className="text-xs text-amber-950 font-medium flex justify-between">
                  <span>+ {ad.name}</span>
                  <span className="font-bold text-amber-700">+Rp {Number(ad.price).toLocaleString('id-ID')}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* QR Code Container */}
        <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-gray-100 p-5 mx-auto mb-8 w-48 h-48 flex flex-col items-center justify-center relative overflow-hidden group">
          {/* Mock QR Code Pattern */}
          <div className="w-32 h-32 grid grid-cols-5 grid-rows-5 gap-1 opacity-90 p-1 border-2 border-black">
            {Array.from({ length: 25 }).map((_, i) => (
              <div key={i} className={`bg-black rounded-sm ${[0, 1, 2, 4, 5, 8, 11, 15, 20, 24].includes(i) ? 'opacity-100' : 'opacity-0'}`}></div>
            ))}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white flex items-center justify-center font-bold text-xs border-2 border-black rounded shadow-lg">
              JS
            </div>
          </div>
          <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="bg-white text-blue-600 px-3 py-1 rounded-full text-xs font-bold shadow-md shadow-blue-900/10">Ketuk untuk perbesar</span>
          </div>
          <p className="text-[10px] text-gray-400 font-mono mt-3 uppercase tracking-widest">{booking.id}</p>
        </div>

        <div className="mt-auto space-y-3 w-full max-w-sm mx-auto">
          <Link href="/member/bookings" className="w-full bg-[var(--royal)] text-white py-4 rounded-[18px] font-bold text-sm flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(37,99,235,0.25)] hover:bg-blue-700 transition-all">
            Go to Bookings <ArrowRight size={18} />
          </Link>
          <Link href="/member" className="w-full bg-[#1A1D21] text-white py-4 rounded-[18px] font-bold text-sm flex items-center justify-center gap-2 hover:bg-black transition-all">
            Back to home
          </Link>
        </div>
      </div>

    </div>
  );
}

export default function BookingSuccess() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center">Loading...</div>}>
      <BookingSuccessContent />
    </Suspense>
  );
}
