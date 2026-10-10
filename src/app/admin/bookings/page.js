'use client';
import { useState, useEffect } from 'react';
import { Search, Filter, Eye, CheckCircle, XCircle, Clock, Download, MapPin } from 'lucide-react';
import { formatCurrency } from '@/lib/data';

const STATUS_OPTIONS = ['all', 'pending', 'confirmed', 'completed', 'cancelled'];
const STATUS_COLORS = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-emerald-100 text-emerald-700',
  completed: 'bg-blue-100 text-blue-700',
  cancelled: 'bg-rose-100 text-rose-700',
};

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('admin_bookings');
    if (stored) {
      setBookings(JSON.parse(stored));
    } else {
      const { mockBookings } = require('@/lib/data');
      setBookings(mockBookings);
      localStorage.setItem('admin_bookings', JSON.stringify(mockBookings));
    }
  }, []);

  const saveBookings = (updated) => {
    setBookings(updated);
    localStorage.setItem('admin_bookings', JSON.stringify(updated));
  };

  const updateStatus = (bookingId, newStatus) => {
    const updated = bookings.map(b => b.id === bookingId ? { ...b, status: newStatus } : b);
    saveBookings(updated);
    if (selectedBooking?.id === bookingId) {
      setSelectedBooking({ ...selectedBooking, status: newStatus });
    }
  };

  const filtered = bookings.filter(b => {
    const matchStatus = filter === 'all' || b.status === filter;
    const matchSearch = b.customerName.toLowerCase().includes(search.toLowerCase()) || b.id.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    revenue: bookings.filter(b => b.status !== 'cancelled').reduce((acc, b) => acc + b.totalPrice, 0),
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Data Booking</h2>
          <p className="text-gray-500 text-sm">{stats.total} total booking • Revenue: {formatCurrency(stats.revenue)}</p>
        </div>
        <button className="btn btn-outline-cyan bg-white px-4 py-2 text-sm shadow-sm flex items-center gap-2">
          <Download size={16} /> Export CSV
        </button>
      </div>

      {/* Mini Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: stats.total, color: 'text-gray-900' },
          { label: 'Pending', value: stats.pending, color: 'text-amber-600' },
          { label: 'Confirmed', value: stats.confirmed, color: 'text-emerald-600' },
          { label: 'Completed', value: stats.completed, color: 'text-blue-600' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">{s.label}</p>
            <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input type="text" placeholder="Cari nama / ID booking..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl shadow-sm focus:border-[var(--cyan)] focus:ring-2 focus:ring-[var(--cyan)]/20 outline-none text-sm" />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {STATUS_OPTIONS.map(s => (
            <button key={s} onClick={() => setFilter(s)} className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${filter === s ? 'bg-[var(--cyan)] text-white border-[var(--cyan)]' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}>
              {s === 'all' ? 'Semua' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider text-[10px] font-bold">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Pelanggan</th>
                <th className="px-6 py-4">Unit & Lokasi</th>
                <th className="px-6 py-4">Jadwal</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {filtered.map(booking => (
                <tr key={booking.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-[var(--royal)] text-xs">{booking.id}</td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900">{booking.customerName}</div>
                    <div className="text-xs text-gray-500">{booking.customerPhone}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{booking.unit}</div>
                    <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5"><MapPin size={10} /> {booking.location || 'Pantai Boom'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div>{new Date(booking.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</div>
                    <div className="text-xs text-gray-500">{booking.timeSlot}</div>
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-900">{formatCurrency(booking.totalPrice)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${STATUS_COLORS[booking.status] || ''}`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <button onClick={() => setSelectedBooking(booking)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500" title="Detail"><Eye size={16} /></button>
                      {booking.status === 'pending' && (
                        <>
                          <button onClick={() => updateStatus(booking.id, 'confirmed')} className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-500" title="Konfirmasi"><CheckCircle size={16} /></button>
                          <button onClick={() => updateStatus(booking.id, 'cancelled')} className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-500" title="Batalkan"><XCircle size={16} /></button>
                        </>
                      )}
                      {booking.status === 'confirmed' && (
                        <button onClick={() => updateStatus(booking.id, 'completed')} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500" title="Selesai"><CheckCircle size={16} /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-500">Tidak ada data booking ditemukan.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-gray-900 text-lg">Detail Booking</h3>
              <button onClick={() => setSelectedBooking(null)} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center"><XCircle size={18} /></button>
            </div>
            <div className="space-y-3 text-sm">
              {[
                ['ID Booking', selectedBooking.id],
                ['Pelanggan', selectedBooking.customerName],
                ['Email', selectedBooking.customerEmail],
                ['Telepon', selectedBooking.customerPhone],
                ['Unit', selectedBooking.unit],
                ['Lokasi', selectedBooking.location || 'Pantai Boom'],
                ['Tanggal', new Date(selectedBooking.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })],
                ['Waktu', selectedBooking.timeSlot],
                ['Total', formatCurrency(selectedBooking.totalPrice)],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-gray-500">{label}</span>
                  <span className="font-semibold text-gray-900 text-right max-w-[200px]">{val}</span>
                </div>
              ))}
              <div className="flex justify-between py-2">
                <span className="text-gray-500">Status</span>
                <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${STATUS_COLORS[selectedBooking.status]}`}>
                  {selectedBooking.status}
                </span>
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              {selectedBooking.status === 'pending' && (
                <>
                  <button onClick={() => updateStatus(selectedBooking.id, 'confirmed')} className="flex-1 btn btn-cyan py-2.5 text-sm">Konfirmasi</button>
                  <button onClick={() => updateStatus(selectedBooking.id, 'cancelled')} className="flex-1 px-4 py-2.5 bg-rose-500 text-white rounded-xl text-sm font-bold hover:bg-rose-600">Tolak</button>
                </>
              )}
              {selectedBooking.status === 'confirmed' && (
                <button onClick={() => updateStatus(selectedBooking.id, 'completed')} className="flex-1 btn btn-cyan py-2.5 text-sm">Tandai Selesai</button>
              )}
              <button onClick={() => setSelectedBooking(null)} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50">Tutup</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
