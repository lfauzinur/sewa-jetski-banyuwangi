'use client';
import { useState, useEffect } from 'react';
import { Search, Eye, CheckCircle, XCircle, Download, MapPin, CheckCircle2, Sparkles } from 'lucide-react';
import { formatCurrency } from '@/lib/data';

const STATUS_OPTIONS = ['all', 'pending', 'confirmed', 'completed', 'cancelled'];
const STATUS_COLORS = {
  pending: 'bg-amber-100 text-amber-700',
  waiting_confirmation: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-emerald-100 text-emerald-700',
  completed: 'bg-blue-100 text-blue-700',
  cancelled: 'bg-rose-100 text-rose-700',
};

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [toast, setToast] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('admin_bookings');
    if (stored) {
      try {
        setBookings(JSON.parse(stored));
      } catch (e) {
        console.error(e);
      }
    } else {
      const { mockBookings } = require('@/lib/data');
      setBookings(mockBookings);
      localStorage.setItem('admin_bookings', JSON.stringify(mockBookings));
    }
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

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
    showToast(`✓ Status booking ${bookingId} diperbarui: ${newStatus.toUpperCase()}`);
  };

  const handleExportCSV = () => {
    if (filtered.length === 0) {
      alert('Tidak ada data booking yang cocok untuk diekspor.');
      return;
    }

    const headers = [
      'ID Booking',
      'Nama Pelanggan',
      'No. Telepon',
      'Email',
      'Unit Watersport',
      'Lokasi Basecamp',
      'Add-ons Tambahan',
      'Tanggal',
      'Waktu',
      'Total Harga (Rp)',
      'Status'
    ];

    const rows = filtered.map(b => {
      const addonsText = b.addons && b.addons.length > 0 
        ? b.addons.map(a => `${a.name} (+Rp ${Number(a.price).toLocaleString('id-ID')})`).join('; ')
        : '-';

      return [
        `"${b.id || ''}"`,
        `"${(b.customerName || '').replace(/"/g, '""')}"`,
        `"${(b.customerPhone || '').replace(/"/g, '""')}"`,
        `"${(b.customerEmail || '').replace(/"/g, '""')}"`,
        `"${(b.unit || '').replace(/"/g, '""')}"`,
        `"${(b.location || 'Pantai Boom').replace(/"/g, '""')}"`,
        `"${addonsText.replace(/"/g, '""')}"`,
        `"${b.date || ''}"`,
        `"${b.timeSlot || ''}"`,
        `"${b.totalPrice || 0}"`,
        `"${(b.status || '').toUpperCase()}"`
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `data-booking-watersport-banyuwangi-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(`✓ Berhasil mengekspor ${filtered.length} data booking ke CSV!`);
  };

  const filtered = bookings.filter(b => {
    const matchStatus = filter === 'all' || b.status === filter;
    const matchSearch = (b.customerName || '').toLowerCase().includes(search.toLowerCase()) || 
                        (b.id || '').toLowerCase().includes(search.toLowerCase()) ||
                        (b.unit || '').toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending' || b.status === 'waiting_confirmation').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    revenue: bookings.filter(b => b.status !== 'cancelled').reduce((acc, b) => acc + (b.totalPrice || 0), 0),
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed top-6 right-6 z-[70] bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 font-bold text-sm animate-fade-in-up">
          <CheckCircle2 size={18} />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Data Booking</h2>
          <p className="text-gray-500 text-sm">{stats.total} total booking • Revenue: {formatCurrency(stats.revenue)}</p>
        </div>
        <button 
          onClick={handleExportCSV}
          className="btn btn-outline-cyan bg-white hover:bg-cyan-50 px-4 py-2.5 text-sm shadow-sm flex items-center gap-2 font-bold cursor-pointer transition-colors"
          title="Download Rekap Data Booking Format CSV / Excel"
        >
          <Download size={16} className="text-[var(--royal)]" /> Export CSV
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

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Cari nama pelanggan, ID booking, atau unit..." 
            value={search} 
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl shadow-sm focus:border-[var(--cyan)] focus:ring-2 focus:ring-[var(--cyan)]/20 outline-none text-sm" 
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {STATUS_OPTIONS.map(s => (
            <button 
              key={s} 
              onClick={() => setFilter(s)} 
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border cursor-pointer ${
                filter === s ? 'bg-[var(--cyan)] text-white border-[var(--cyan)]' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {s === 'all' ? 'Semua' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider text-[10px] font-bold">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Pelanggan</th>
                <th className="px-6 py-4">Unit & Add-ons</th>
                <th className="px-6 py-4">Jadwal</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {filtered.map(booking => (
                <tr key={booking.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-[var(--royal)] text-xs">
                    {booking.id}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900">{booking.customerName}</div>
                    <div className="text-xs text-gray-500">{booking.customerPhone}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{booking.unit}</div>
                    <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                      <MapPin size={10} /> {booking.location || 'Pantai Boom'}
                    </div>

                    {/* Badge Add-ons Terpilih */}
                    {booking.addons && booking.addons.length > 0 && (
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {booking.addons.map((addon, aIdx) => (
                          <span 
                            key={aIdx} 
                            className="inline-flex items-center text-[10px] bg-amber-50 text-amber-800 border border-amber-200/60 px-1.5 py-0.5 rounded font-bold"
                          >
                            +{addon.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div>{new Date(booking.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</div>
                    <div className="text-xs text-gray-500">{booking.timeSlot}</div>
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-900">
                    {formatCurrency(booking.totalPrice)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${STATUS_COLORS[booking.status] || 'bg-gray-100 text-gray-600'}`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => setSelectedBooking(booking)} 
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 cursor-pointer" 
                        title="Lihat Detail"
                      >
                        <Eye size={16} />
                      </button>
                      {(booking.status === 'pending' || booking.status === 'waiting_confirmation') && (
                        <>
                          <button 
                            onClick={() => updateStatus(booking.id, 'confirmed')} 
                            className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-500 cursor-pointer" 
                            title="Konfirmasi Booking"
                          >
                            <CheckCircle size={16} />
                          </button>
                          <button 
                            onClick={() => updateStatus(booking.id, 'cancelled')} 
                            className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-500 cursor-pointer" 
                            title="Batalkan Booking"
                          >
                            <XCircle size={16} />
                          </button>
                        </>
                      )}
                      {booking.status === 'confirmed' && (
                        <button 
                          onClick={() => updateStatus(booking.id, 'completed')} 
                          className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 cursor-pointer" 
                          title="Tandai Selesai"
                        >
                          <CheckCircle size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    Tidak ada data booking ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4" onClick={() => setSelectedBooking(null)}>
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-lg">Detail Booking Lengkap</h3>
              <button onClick={() => setSelectedBooking(null)} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center cursor-pointer">
                <XCircle size={18} />
              </button>
            </div>
            
            <div className="space-y-2.5 text-sm">
              {[
                ['ID Booking', selectedBooking.id],
                ['Pelanggan', selectedBooking.customerName],
                ['Email', selectedBooking.customerEmail || '-'],
                ['Telepon', selectedBooking.customerPhone || '-'],
                ['Unit Utama', selectedBooking.unit],
                ['Lokasi Basecamp', selectedBooking.location || 'Pantai Boom'],
                ['Tanggal', new Date(selectedBooking.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })],
                ['Jadwal Waktu', selectedBooking.timeSlot],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between py-1.5 border-b border-gray-50">
                  <span className="text-gray-500 text-xs">{label}</span>
                  <span className="font-semibold text-gray-900 text-right max-w-[220px] text-xs">{val}</span>
                </div>
              ))}

              {/* Rincian Add-ons */}
              {selectedBooking.addons && selectedBooking.addons.length > 0 && (
                <div className="py-2 border-b border-gray-50">
                  <span className="text-gray-500 text-xs block mb-1.5 font-bold uppercase tracking-wider">
                    Add-ons yang Dipilih ({selectedBooking.addons.length}):
                  </span>
                  <div className="space-y-1.5">
                    {selectedBooking.addons.map((ad, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-amber-50/80 p-2 rounded-xl text-xs border border-amber-200/60">
                        <span className="font-bold text-amber-900 flex items-center gap-1"><Sparkles size={12} /> {ad.name}</span>
                        <span className="text-amber-700 font-bold">+Rp {Number(ad.price).toLocaleString('id-ID')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Total Bayar */}
              <div className="flex justify-between items-center py-2.5 bg-blue-50/70 p-3 rounded-xl border border-blue-100">
                <span className="font-bold text-gray-700 text-xs">Total Pembayaran:</span>
                <span className="font-black text-[var(--royal)] text-base">
                  {formatCurrency(selectedBooking.totalPrice)}
                </span>
              </div>

              {/* Status */}
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-500 text-xs">Status Booking:</span>
                <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${STATUS_COLORS[selectedBooking.status]}`}>
                  {selectedBooking.status}
                </span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              {(selectedBooking.status === 'pending' || selectedBooking.status === 'waiting_confirmation') && (
                <>
                  <button onClick={() => updateStatus(selectedBooking.id, 'confirmed')} className="flex-1 btn btn-cyan py-2.5 text-xs font-bold cursor-pointer">Konfirmasi</button>
                  <button onClick={() => updateStatus(selectedBooking.id, 'cancelled')} className="flex-1 px-4 py-2.5 bg-rose-500 text-white rounded-xl text-xs font-bold hover:bg-rose-600 cursor-pointer">Tolak</button>
                </>
              )}
              {selectedBooking.status === 'confirmed' && (
                <button onClick={() => updateStatus(selectedBooking.id, 'completed')} className="flex-1 btn btn-cyan py-2.5 text-xs font-bold cursor-pointer">Tandai Selesai</button>
              )}
              <button onClick={() => setSelectedBooking(null)} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 cursor-pointer">Tutup</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
