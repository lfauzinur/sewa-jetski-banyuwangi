'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Activity, Users, AlertTriangle } from 'lucide-react';

const AdminMap = dynamic(() => import('@/components/AdminMap'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] bg-gray-50 flex flex-col items-center justify-center rounded-3xl border border-gray-100">
      <div className="w-10 h-10 border-4 border-[var(--royal)] border-t-transparent rounded-full animate-spin mb-3" />
      <p className="text-gray-500 font-bold text-sm">Memuat Peta Live Tracking...</p>
    </div>
  )
});

export default function LiveTrackingPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Live Tracking Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Pantau seluruh armada jetski yang sedang beroperasi secara real-time.</p>
        </div>
        <div className="flex gap-2">
          <div className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl flex items-center gap-2 font-bold text-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Sistem Aktif
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Armada Aktif</p>
            <p className="text-2xl font-black text-gray-900 leading-none mt-1">2</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
            <Users size={24} />
          </div>
          <div>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Total Rider Hari Ini</p>
            <p className="text-2xl font-black text-gray-900 leading-none mt-1">14</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-red-50 text-red-600 rounded-xl flex items-center justify-center">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">SOS Alert</p>
            <p className="text-2xl font-black text-gray-900 leading-none mt-1">0</p>
          </div>
        </div>
      </div>

      {/* Map Area */}
      <div className="bg-white p-4 rounded-[32px] border border-gray-100 shadow-sm relative">
        <AdminMap />
      </div>
    </div>
  );
}
