'use client';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { 
  Activity, Users, AlertTriangle, Plus, MapPin, Trash2, Edit2, 
  CheckCircle2, X, Compass, Route, Undo2, MousePointerClick, 
  HelpCircle, Eye, EyeOff, Sparkles, Navigation 
} from 'lucide-react';
import { getGpsRoutes, upsertGpsRoute, deleteGpsRoute } from '@/lib/supabase-data';

const AdminMap = dynamic(() => import('@/components/AdminMap'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] bg-gray-50 flex flex-col items-center justify-center rounded-3xl border border-gray-100">
      <div className="w-10 h-10 border-4 border-[var(--royal)] border-t-transparent rounded-full animate-spin mb-3" />
      <p className="text-gray-500 font-bold text-sm">Memuat Peta Live Tracking...</p>
    </div>
  )
});

// Template Rute Siap Pakai di Perairan Banyuwangi
const ROUTE_TEMPLATES = [
  {
    name: 'Rute Aman: Pantai Boom Marina - Pulau Santen',
    description: 'Jalur perairan dangkal & tenang dekat bibir pantai. Sangat direkomendasikan untuk pemula dan keluarga.',
    color: '#10B981',
    path_data: [
      [-8.204555, 114.385455],
      [-8.209876, 114.391234],
      [-8.214532, 114.393456],
      [-8.220111, 114.392111]
    ]
  },
  {
    name: 'Rute Eksplorasi: Selat Bali Speed Cruise',
    description: 'Perairan terbuka dengan pemandangan pegunungan Bali Barat & Selat Bali. Jalur luas untuk kecepatan tinggi.',
    color: '#3B82F6',
    path_data: [
      [-8.204555, 114.385455],
      [-8.201200, 114.398000],
      [-8.208500, 114.405000],
      [-8.218000, 114.398000]
    ]
  },
  {
    name: 'Rute Safari: Pantai Bengkak - Pulau Tabuhan',
    description: 'Touring spektakuler menuju spot pasir putih dan surga snorkeling Pulau Tabuhan Wongsorejo.',
    color: '#F59E0B',
    path_data: [
      [-8.041200, 114.441100],
      [-8.035000, 114.448000],
      [-8.028000, 114.455000],
      [-8.022000, 114.461000]
    ]
  }
];

export default function LiveTrackingPage() {
  const [routes, setRoutes] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [editingRoute, setEditingRoute] = useState(null);
  const [toast, setToast] = useState('');
  const [showGuide, setShowGuide] = useState(true);

  // Interactive Drawing Mode State
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingPoints, setDrawingPoints] = useState([]);
  const [drawingColor, setDrawingColor] = useState('#10B981');

  // Form State
  const [form, setForm] = useState({
    id: '',
    name: '',
    description: '',
    color: '#10B981',
    active: true,
    path_data: []
  });

  useEffect(() => {
    loadRoutes();
  }, []);

  async function loadRoutes() {
    const data = await getGpsRoutes();
    setRoutes(data || []);
  }

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  }

  // Handle map click during drawing mode
  function handleMapClick(coord) {
    setDrawingPoints(prev => [...prev, coord]);
  }

  function handleUndoPoint() {
    setDrawingPoints(prev => prev.slice(0, -1));
  }

  function handleResetDrawing() {
    setDrawingPoints([]);
  }

  function handleCancelDrawing() {
    setIsDrawing(false);
    setDrawingPoints([]);
  }

  // Finish drawing on map and open form modal to save
  function handleFinishDrawing() {
    if (drawingPoints.length < 2) {
      alert('Rute minimal membutuhkan 2 titik klik pada peta.');
      return;
    }
    setEditingRoute(null);
    setForm({
      id: '',
      name: `Rute Navigasi ${new Date().toLocaleDateString('id-ID')}`,
      description: `Rute hasil penarikan garis di peta (${drawingPoints.length} waypoint).`,
      color: drawingColor,
      active: true,
      path_data: drawingPoints
    });
    setIsDrawing(false);
    setShowModal(true);
  }

  function handleStartDrawingMode() {
    setIsDrawing(true);
    setDrawingPoints([]);
    showToast('📍 Mode Tarik Rute Aktif: Klik pada peta laut untuk membuat jalur!');
  }

  function handleOpenCreate() {
    setEditingRoute(null);
    setForm({
      id: '',
      name: '',
      description: '',
      color: '#10B981',
      active: true,
      path_data: [
        [-8.204555, 114.385455],
        [-8.210000, 114.390000],
        [-8.215000, 114.393000]
      ]
    });
    setShowModal(true);
  }

  function handleOpenEdit(route) {
    setEditingRoute(route);
    setForm({
      id: route.id,
      name: route.name,
      description: route.description || '',
      color: route.color || '#3B82F6',
      active: route.active !== false,
      path_data: Array.isArray(route.path_data) ? route.path_data : []
    });
    setShowModal(true);
  }

  function applyTemplate(tpl) {
    setForm(prev => ({
      ...prev,
      name: tpl.name,
      description: tpl.description,
      color: tpl.color,
      path_data: tpl.path_data
    }));
  }

  function handleAddPoint() {
    const lastPoint = form.path_data[form.path_data.length - 1] || [-8.204555, 114.385455];
    const newPoint = [Number((lastPoint[0] - 0.005).toFixed(6)), Number((lastPoint[1] + 0.005).toFixed(6))];
    setForm(prev => ({
      ...prev,
      path_data: [...prev.path_data, newPoint]
    }));
  }

  function handleRemovePoint(index) {
    if (form.path_data.length <= 2) {
      alert('Rute minimal harus memiliki 2 titik koordinat.');
      return;
    }
    setForm(prev => ({
      ...prev,
      path_data: prev.path_data.filter((_, i) => i !== index)
    }));
  }

  function handlePointChange(index, coordIndex, val) {
    const num = parseFloat(val);
    setForm(prev => {
      const updated = [...prev.path_data];
      updated[index] = [...updated[index]];
      updated[index][coordIndex] = isNaN(num) ? val : num;
      return { ...prev, path_data: updated };
    });
  }

  async function handleSaveRoute(e) {
    e.preventDefault();
    if (!form.name.trim()) return alert('Nama rute wajib diisi.');
    if (form.path_data.length < 2) return alert('Rute harus memiliki minimal 2 titik koordinat.');

    const cleanPath = form.path_data.map(pt => [parseFloat(pt[0]) || 0, parseFloat(pt[1]) || 0]);

    const payload = {
      ...form,
      path_data: cleanPath
    };

    const saved = await upsertGpsRoute(payload);
    if (saved) {
      setShowModal(false);
      setDrawingPoints([]);
      await loadRoutes();
      setRefreshTrigger(prev => prev + 1);
      showToast('✓ Rute navigasi berhasil disimpan & aktif di peta!');
    } else {
      alert('Gagal menyimpan rute.');
    }
  }

  async function handleDeleteRoute(id) {
    if (confirm('Yakin ingin menghapus rute navigasi ini?')) {
      const ok = await deleteGpsRoute(id);
      if (ok) {
        await loadRoutes();
        setRefreshTrigger(prev => prev + 1);
        showToast('✓ Rute berhasil dihapus');
      }
    }
  }

  async function handleToggleRoute(route) {
    await upsertGpsRoute({ ...route, active: !route.active });
    await loadRoutes();
    setRefreshTrigger(prev => prev + 1);
    showToast(`Rute ${!route.active ? 'diaktifkan' : 'dinonaktifkan'}`);
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 font-bold text-sm animate-fade-in-up">
          <CheckCircle2 size={18} />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-gray-900">Live Tracking Dashboard</h1>
            <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 border border-emerald-100">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Sistem Aktif
            </span>
          </div>
          <p className="text-gray-500 text-sm mt-1">Pantau seluruh armada jetski real-time & kelola rute navigasi perairan.</p>
        </div>

        {/* Action Buttons for Route Creation */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleStartDrawingMode}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all cursor-pointer shadow-sm ${
              isDrawing 
                ? 'bg-emerald-600 text-white ring-4 ring-emerald-100' 
                : 'bg-white text-gray-800 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
            }`}
          >
            <MousePointerClick size={17} className={isDrawing ? 'text-white' : 'text-emerald-600'} />
            {isDrawing ? 'Sedang Menarik Garis...' : 'Tarik Rute di Peta'}
          </button>

          <button
            onClick={handleOpenCreate}
            className="bg-[var(--royal)] hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <Plus size={18} /> Buat Rute Manual / Template
          </button>
        </div>
      </div>

      {/* Interactive Drawing Mode Floating Action Bar */}
      {isDrawing && (
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-4 sm:p-5 rounded-2xl shadow-lg border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in-up">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0 animate-pulse">
              <MousePointerClick size={22} className="text-white" />
            </div>
            <div>
              <p className="font-extrabold text-sm sm:text-base flex items-center gap-2">
                <span>Mode Tarik Rute di Peta Aktif!</span>
                <span className="bg-white/20 px-2 py-0.5 rounded-lg text-xs font-mono">
                  {drawingPoints.length} Titik Waypoint
                </span>
              </p>
              <p className="text-xs text-white/80 mt-0.5">
                Klik langsung pada peta di laut untuk menentukan lintasan rute jetski.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {drawingPoints.length > 0 && (
              <button
                type="button"
                onClick={handleUndoPoint}
                className="bg-white/15 hover:bg-white/25 text-white px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Undo2 size={14} /> Batalkan Titik Terakhir
              </button>
            )}
            {drawingPoints.length > 0 && (
              <button
                type="button"
                onClick={handleResetDrawing}
                className="bg-rose-500/80 hover:bg-rose-600 text-white px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Reset
              </button>
            )}
            <button
              type="button"
              disabled={drawingPoints.length < 2}
              onClick={handleFinishDrawing}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold shadow-md transition-all cursor-pointer flex items-center gap-1.5 ${
                drawingPoints.length >= 2 
                  ? 'bg-white text-emerald-800 hover:bg-gray-100' 
                  : 'bg-white/40 text-white/60 cursor-not-allowed'
              }`}
            >
              <CheckCircle2 size={15} /> Selesai & Simpan ({drawingPoints.length} Titik)
            </button>
            <button
              type="button"
              onClick={handleCancelDrawing}
              className="text-white/80 hover:text-white text-xs font-bold px-2.5 py-2 cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Guide Banner: Cara Membuat Rute */}
      {showGuide && !isDrawing && (
        <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-4 sm:p-5 relative">
          <button 
            onClick={() => setShowGuide(false)}
            className="absolute top-3 right-3 text-blue-400 hover:text-blue-700 p-1 cursor-pointer"
            title="Sembunyikan panduan"
          >
            <X size={16} />
          </button>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Navigation size={18} />
            </div>
            <div className="space-y-1.5 pr-6">
              <h3 className="font-extrabold text-blue-900 text-sm flex items-center gap-2">
                <span>Cara Membuat Rute Navigasi Jetski:</span>
              </h3>
              <div className="grid sm:grid-cols-3 gap-3 text-xs text-blue-950 pt-1">
                <div className="bg-white/80 p-2.5 rounded-xl border border-blue-100">
                  <span className="font-extrabold text-blue-700 block mb-0.5">Langkah 1:</span>
                  Klik tombol <strong>&ldquo;Tarik Rute di Peta&rdquo;</strong> di atas atau tombol <strong>&ldquo;+ Buat Rute Manual&rdquo;</strong>.
                </div>
                <div className="bg-white/80 p-2.5 rounded-xl border border-blue-100">
                  <span className="font-extrabold text-blue-700 block mb-0.5">Langkah 2:</span>
                  Klik pada area perairan/laut di peta untuk menaruh titik jalur, atau pilih <strong>Template Rute Siap Pakai</strong>.
                </div>
                <div className="bg-white/80 p-2.5 rounded-xl border border-blue-100">
                  <span className="font-extrabold text-blue-700 block mb-0.5">Langkah 3:</span>
                  Beri nama rute dan klik <strong>Simpan</strong>. Rute otomatis muncul di layar navigasi live GPS member!
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Armada Aktif</p>
            <p className="text-2xl font-black text-gray-900 leading-none mt-1">2</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <Users size={24} />
          </div>
          <div>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Total Rider Hari Ini</p>
            <p className="text-2xl font-black text-gray-900 leading-none mt-1">14</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-red-50 text-red-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">SOS Alert</p>
            <p className="text-2xl font-black text-gray-900 leading-none mt-1">0</p>
          </div>
        </div>
      </div>

      {/* Map Area */}
      <div className="bg-white p-4 rounded-[32px] border border-gray-100 shadow-sm relative space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-2">
          <div className="flex items-center gap-2">
            <Compass size={18} className="text-[var(--royal)]" />
            <span className="font-bold text-gray-800 text-sm">Peta Navigasi & Live Tracking Armada</span>
            {isDrawing && (
              <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                Mode Gambar Aktif
              </span>
            )}
          </div>
          <span className="text-xs text-gray-400">
            Garis putus-putus menunjukkan rute yang sedang aktif di radar rider
          </span>
        </div>

        <AdminMap 
          refreshTrigger={refreshTrigger} 
          isDrawing={isDrawing}
          drawingPoints={drawingPoints}
          drawingColor={drawingColor}
          onMapClick={handleMapClick}
        />
      </div>

      {/* Rute Management Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-100 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2">
              <Route className="text-[var(--royal)]" size={20} />
              <h2 className="text-lg font-black text-gray-900">Daftar Rute Navigasi Jetski ({routes.length})</h2>
            </div>
            <p className="text-gray-500 text-xs mt-1">
              Rute berstatus <strong>Aktif</strong> otomatis tampil di layar peta Member Area saat tamu bermain jetski.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleStartDrawingMode}
              className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <MousePointerClick size={14} /> Tarik di Peta
            </button>
            <button
              onClick={handleOpenCreate}
              className="bg-gray-900 hover:bg-black text-white px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-sm"
            >
              <Plus size={16} /> Buat Rute Baru
            </button>
          </div>
        </div>

        {routes.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Route size={44} className="mx-auto mb-2 text-gray-300" />
            <p className="font-bold text-gray-600">Belum ada rute navigasi yang disimpan</p>
            <p className="text-xs mt-1 max-w-md mx-auto">
              Klik tombol &ldquo;Tarik Rute di Peta&rdquo; atau &ldquo;Buat Rute Baru&rdquo; di atas untuk merancang jalur bermain yang aman.
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {routes.map((rt) => {
              const pointCount = Array.isArray(rt.path_data) ? rt.path_data.length : 0;
              return (
                <div 
                  key={rt.id} 
                  className={`p-4 rounded-2xl border transition-all ${
                    rt.active ? 'border-gray-200 bg-white shadow-sm' : 'border-gray-100 bg-gray-50/60 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span 
                        className="w-3.5 h-3.5 rounded-full flex-shrink-0" 
                        style={{ backgroundColor: rt.color || '#3B82F6' }} 
                      />
                      <h3 className="font-bold text-gray-900 text-sm truncate">{rt.name}</h3>
                    </div>
                    <button
                      onClick={() => handleToggleRoute(rt)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full cursor-pointer transition-colors ${
                        rt.active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {rt.active ? 'Aktif' : 'Nonaktif'}
                    </button>
                  </div>

                  <p className="text-xs text-gray-500 line-clamp-2 mb-3 min-h-[32px]">
                    {rt.description || 'Tidak ada deskripsi rute.'}
                  </p>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-xs text-gray-400">
                    <span className="flex items-center gap-1 font-semibold text-gray-600">
                      <MapPin size={12} className="text-gray-400" /> {pointCount} Titik Waypoint
                    </span>
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => handleOpenEdit(rt)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        title="Edit Rute"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button 
                        onClick={() => handleDeleteRoute(rt.id)}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Hapus Rute"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Buat / Edit Rute */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div 
            className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-7 space-y-5 animate-fadeIn" 
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-black text-gray-900">
                  {editingRoute ? 'Edit Rute Navigasi' : 'Buat Rute Navigasi Baru'}
                </h3>
                <p className="text-xs text-gray-500">Tentukan nama, warna jalur, dan titik koordinat waypoint.</p>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 text-gray-400 hover:text-gray-700 flex items-center justify-center transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Quick Templates */}
            {!editingRoute && (
              <div className="bg-blue-50/70 p-3.5 rounded-2xl border border-blue-100 space-y-2">
                <p className="text-xs font-bold text-blue-900 flex items-center gap-1">
                  <Sparkles size={14} className="text-amber-500" />
                  <span>Pilih Template Rute Siap Pakai (1-Klik):</span>
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {ROUTE_TEMPLATES.map((tpl, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => applyTemplate(tpl)}
                      className="text-xs bg-white text-blue-700 hover:bg-blue-100 px-3 py-1.5 rounded-xl border border-blue-200 font-semibold transition-all cursor-pointer shadow-sm text-left"
                    >
                      + {tpl.name.split(':')[1]?.trim() || tpl.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleSaveRoute} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                  Nama Rute *
                </label>
                <input 
                  type="text" 
                  required
                  value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                  placeholder="Contoh: Rute Aman Pantai Boom Marina"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                  Deskripsi Rute
                </label>
                <textarea 
                  rows={2}
                  value={form.description}
                  onChange={e => setForm({...form, description: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none resize-none"
                  placeholder="Contoh: Perairan tenang, cocok bagi keluarga dan pemula..."
                />
              </div>

              {/* Pilihan Warna Garis */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                  Warna Garis Rute di Peta
                </label>
                <div className="flex items-center gap-3">
                  {[
                    { label: 'Hijau', hex: '#10B981' },
                    { label: 'Biru', hex: '#3B82F6' },
                    { label: 'Oranye', hex: '#F59E0B' },
                    { label: 'Ungu', hex: '#8B5CF6' },
                    { label: 'Merah', hex: '#EF4444' },
                    { label: 'Cyan', hex: '#00B4D8' },
                  ].map(c => (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => setForm({...form, color: c.hex})}
                      className={`w-8 h-8 rounded-full border-2 transition-transform cursor-pointer ${
                        form.color === c.hex ? 'scale-125 border-gray-900 shadow-md' : 'border-transparent hover:scale-110'
                      }`}
                      style={{ backgroundColor: c.hex }}
                      title={c.label}
                    />
                  ))}
                  <span className="text-xs text-gray-500 font-mono ml-2">{form.color}</span>
                </div>
              </div>

              {/* Waypoints Editor */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Titik Koordinat Waypoint ({form.path_data.length} Titik)
                  </label>
                  <button
                    type="button"
                    onClick={handleAddPoint}
                    className="text-xs font-bold text-[var(--royal)] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={14} /> Tambah Titik
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {form.path_data.map((pt, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded-xl border border-gray-100 text-xs">
                      <span className="w-5 font-bold text-gray-400 text-center">{idx + 1}</span>
                      <div className="flex-1 grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-[10px] text-gray-400 block">Latitude</span>
                          <input 
                            type="number"
                            step="any"
                            value={pt[0]}
                            onChange={e => handlePointChange(idx, 0, e.target.value)}
                            className="w-full px-2 py-1 bg-white border border-gray-200 rounded-lg text-xs font-mono outline-none"
                            placeholder="Latitude"
                          />
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-400 block">Longitude</span>
                          <input 
                            type="number"
                            step="any"
                            value={pt[1]}
                            onChange={e => handlePointChange(idx, 1, e.target.value)}
                            className="w-full px-2 py-1 bg-white border border-gray-200 rounded-lg text-xs font-mono outline-none"
                            placeholder="Longitude"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemovePoint(idx)}
                        className="text-gray-400 hover:text-rose-500 p-1 cursor-pointer"
                        title="Hapus Titik"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Aktif Checkbox */}
              <div className="flex items-center gap-2 pt-2">
                <input 
                  type="checkbox" 
                  id="routeActive"
                  checked={form.active}
                  onChange={e => setForm({...form, active: e.target.checked})}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 cursor-pointer"
                />
                <label htmlFor="routeActive" className="text-xs font-bold text-gray-700 cursor-pointer">
                  Aktifkan Rute Ini (Langsung tampil di peta navigasi member)
                </label>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[var(--royal)] hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-md cursor-pointer transition-colors"
                >
                  {editingRoute ? 'Simpan Perubahan' : 'Buat & Tampilkan Rute'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
