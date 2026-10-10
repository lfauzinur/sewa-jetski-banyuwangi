'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, 
  CreditCard, 
  TrendingUp, 
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Download
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { mockBookings, formatCurrency } from '@/lib/data';

// Mock chart data
const revenueData = [
  { name: '1 Okt', total: 1200000 },
  { name: '2 Okt', total: 2100000 },
  { name: '3 Okt', total: 1800000 },
  { name: '4 Okt', total: 3200000 },
  { name: '5 Okt', total: 2800000 },
  { name: '6 Okt', total: 4500000 },
  { name: '7 Okt', total: 3900000 },
];

const unitPopularityData = [
  { name: 'WaveRunner', count: 45 },
  { name: 'FX SVHO', count: 32 },
  { name: 'GTX 170', count: 28 },
  { name: 'Ultra 310R', count: 18 },
];

export default function AdminDashboard() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const stats = [
    { 
      title: 'Total Pendapatan', 
      value: 'Rp 45.200.000', 
      trend: '+12.5%', 
      isUp: true,
      icon: <CreditCard size={24} className="text-white" />,
      color: 'bg-emerald-500'
    },
    { 
      title: 'Total Booking', 
      value: '128', 
      trend: '+8.2%', 
      isUp: true,
      icon: <Activity size={24} className="text-white" />,
      color: 'bg-[var(--royal)]'
    },
    { 
      title: 'Pelanggan Baru', 
      value: '84', 
      trend: '+2.4%', 
      isUp: true,
      icon: <Users size={24} className="text-white" />,
      color: 'bg-[var(--cyan)]'
    },
    { 
      title: 'Tingkat Pembatalan', 
      value: '4.2%', 
      trend: '-1.1%', 
      isUp: false, // For cancellation, down is good, but styling-wise let's keep it simple
      icon: <TrendingUp size={24} className="text-white" />,
      color: 'bg-rose-500'
    },
  ];

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Overview</h2>
          <p className="text-gray-500 text-sm">Ringkasan performa bisnis Anda hari ini.</p>
        </div>
        <button className="btn btn-outline-cyan bg-white px-4 py-2 text-sm shadow-sm">
          <Download size={16} /> Export Laporan
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md ${stat.color}`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">{stat.title}</p>
              <h3 className="text-2xl font-bold text-gray-900 leading-none">{stat.value}</h3>
              <p className={`text-xs font-semibold mt-2 flex items-center gap-1 ${stat.isUp ? 'text-emerald-500' : 'text-rose-500'}`}>
                {stat.isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {stat.trend} dari bulan lalu
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      {mounted && (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Revenue Chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Grafik Pendapatan (7 Hari Terakhir)</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--cyan)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--cyan)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    tickFormatter={(value) => `Rp ${value / 1000000}M`}
                    dx={-10}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: 'var(--shadow-md)' }}
                    formatter={(value) => [formatCurrency(value), 'Pendapatan']}
                  />
                  <Area type="monotone" dataKey="total" stroke="var(--cyan)" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Popular Units Chart */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Unit Terpopuler</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={unitPopularityData} layout="vertical" margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#475569', fontWeight: 600 }} />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-sm)' }}
                  />
                  <Bar dataKey="count" fill="var(--royal)" radius={[0, 4, 4, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Recent Bookings Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-900">Booking Terbaru</h3>
          <Link href="/admin/bookings" className="text-sm font-semibold text-[var(--cyan)] hover:text-[var(--teal)]">Lihat Semua</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider text-[10px] font-bold">
              <tr>
                <th className="px-6 py-4">ID Booking</th>
                <th className="px-6 py-4">Pelanggan</th>
                <th className="px-6 py-4">Unit / Layanan</th>
                <th className="px-6 py-4">Jadwal</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {mockBookings.slice(0, 5).map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-[var(--royal)]">{booking.id}</td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900">{booking.customerName}</div>
                    <div className="text-xs text-gray-500">{booking.customerPhone}</div>
                  </td>
                  <td className="px-6 py-4 font-medium">{booking.unit}</td>
                  <td className="px-6 py-4">
                    <div>{new Date(booking.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                    <div className="text-xs text-gray-500">{booking.timeSlot}</div>
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-900">{formatCurrency(booking.totalPrice)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider
                      ${booking.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' : 
                        booking.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                        booking.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                        'bg-rose-100 text-rose-700'}
                    `}>
                      {booking.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
