'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, MapPin, Search, Ticket, Clock, CheckCircle2, ChevronRight, Anchor } from 'lucide-react';
import { formatCurrency } from '@/lib/data';

export default function MemberBookings() {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [bookings, setBookings] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('admin_bookings') || '[]');
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const userEmail = currentUser.email;
    
    // Only show bookings that match the current user's email, or all if no email (fallback)
    if (userEmail) {
      setBookings(stored.filter(b => b.customerEmail === userEmail));
    } else {
      setBookings(stored);
    }
  }, []);

  // Filter based on mock status/date logic
  const filteredBookings = bookings.filter(b => {
    const isUpcoming = new Date(b.date) >= new Date(new Date().setHours(0,0,0,0));
    const matchTab = activeTab === 'upcoming' ? isUpcoming : !isUpcoming;
    const matchSearch = b.unit.toLowerCase().includes(search.toLowerCase()) || b.id.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  return (
    <div className="p-5 max-w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900">Tiket Booking</h1>
        <p className="text-gray-500 text-sm mt-1">Kelola jadwal petualangan jetski Anda.</p>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Cari ID Booking atau Unit..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl shadow-sm focus:border-[var(--royal)] focus:ring-2 focus:ring-[var(--royal)]/20 outline-none text-sm transition-all"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`pb-3 text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'upcoming' ? 'border-[var(--royal)] text-[var(--royal)]' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Akan Datang
        </button>
        <button
          onClick={() => setActiveTab('past')}
          className={`pb-3 text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'past' ? 'border-[var(--royal)] text-[var(--royal)]' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Riwayat Booking
        </button>
      </div>

      {/* Bookings List */}
      <div className="space-y-4 pb-6">
        {filteredBookings.length > 0 ? (
          filteredBookings.map((booking) => (
            <div key={booking.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="p-4 flex flex-col justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${activeTab === 'upcoming' ? 'bg-blue-50 text-[var(--royal)]' : 'bg-gray-100 text-gray-400'}`}>
                    <Ticket size={20} />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-mono font-bold text-xs text-gray-400">{booking.id}</span>
                      {activeTab === 'upcoming' && <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Confirmed</span>}
                    </div>
                    <h3 className="font-extrabold text-gray-900 text-sm leading-tight">{booking.unit}</h3>
                    <div className="flex flex-col gap-1 mt-2 text-xs text-gray-600 font-medium">
                      <span className="flex items-center gap-1"><Calendar size={14} className="text-gray-400" /> {new Date(booking.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      <span className="flex items-center gap-1"><Clock size={14} className="text-gray-400" /> {booking.timeSlot}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-2">
                  <div className="text-left">
                    <span className="text-[10px] text-gray-400 font-bold uppercase block mb-0.5">Total Bayar</span>
                    <span className="font-extrabold text-[var(--royal)] text-base leading-none">{formatCurrency(booking.totalPrice)}</span>
                  </div>
                  {activeTab === 'upcoming' && (
                    <Link href={`/member/booking/success?id=${booking.id}`} className="flex items-center gap-1 text-[11px] font-bold text-[var(--royal)] bg-[var(--royal-soft)] hover:bg-[var(--royal)] hover:text-white px-3 py-1.5 rounded-lg transition-colors">
                      Lihat Tiket <ChevronRight size={14} />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-12 text-center bg-white rounded-2xl border border-gray-200">
            <Anchor size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="font-bold text-gray-900 mb-1">Belum Ada Tiket</h3>
            <p className="text-gray-500 text-sm mb-6">
              {activeTab === 'upcoming' 
                ? 'Anda belum memiliki jadwal booking mendatang.' 
                : 'Belum ada riwayat booking.'}
            </p>
            <Link href="/member" className="btn btn-royal px-6 py-2.5 text-sm shadow-sm inline-flex">
              Pesan Sekarang
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
