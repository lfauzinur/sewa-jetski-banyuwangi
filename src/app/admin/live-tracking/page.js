'use client';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { 
  Activity, Users, AlertTriangle, Plus, MapPin, Trash2, Edit2, 
  CheckCircle2, X, Compass, Route, Undo2, MousePointerClick, 
  HelpCircle, Eye, EyeOff, Sparkles, Navigation, Waves, Wind, 
  Radio, ShieldAlert, PhoneCall, ExternalLink, RefreshCw, AlertCircle, 
  Megaphone, Siren, ShieldCheck
} from 'lucide-react';
import { 
  getGpsRoutes, upsertGpsRoute, deleteGpsRoute, 
  getLiveLocations, getActiveSosSignals, resolveSosSignal,
  getActiveEmergencyAlert, broadcastEmergencyAlert, dismissEmergencyAlert
} from '@/lib/supabase-data';
import { getMaritimeWeather } from '@/lib/weather-service';
import { COMPANY } from '@/lib/data';

const AdminMap = dynamic(() => import('@/components/AdminMap'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-[620px] bg-slate-900 flex flex-col items-center justify-center rounded-3xl border border-slate-800 text-white">
      <div className="w-10 h-10 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mb-3" />
      <p className="text-cyan-300 font-bold text-sm tracking-wide">Memuat Peta Live Tracking Satelit...</p>
    </div>
  )
});

// Template Rute Safari Siap Pakai di Banyuwangi
const ROUTE_TEMPLATES = [
  {
    name: 'Sunset Explorer Safari (Boom Marina - Santen)',
    description: 'Petualangan pemula menyusuri perairan dangkal tenang dengan pemandangan matahari terbenam.',
    distance_km: 3.8,
    duration_min: 45,
    difficulty: 'Pemula',
    color: '#10B981',
    path_data: [
      [-8.204555, 114.385455],
      [-8.209876, 114.391234],
      [-8.214532, 114.393456],
      [-8.220111, 114.392111]
    ]
  },
  {
    name: 'Selat Bali Speed Cruise & Coral Sanctuary',
    description: 'Perairan terbuka dengan pemandangan pegunungan Bali Barat & Selat Bali. Jalur luas untuk kecepatan tinggi.',
    distance_km: 6.5,
    duration_min: 60,
    difficulty: 'Menengah',
    color: '#0284C7',
    path_data: [
      [-8.204555, 114.385455],
      [-8.201200, 114.398000],
      [-8.208500, 114.405000],
      [-8.218000, 114.398000]
    ]
  },
  {
    name: 'Island-Hopping Safari: Pulau Tabuhan Expedition',
    description: 'Touring spektakuler menuju spot pasir putih dan surga snorkeling Pulau Tabuhan Wongsorejo.',
    distance_km: 11.2,
    duration_min: 90,
    difficulty: 'Mahir (Pro)',
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
  const [fleetLocations, setFleetLocations] = useState([]);
  const [sosSignals, setSosSignals] = useState([]);
  const [activeAlert, setActiveAlert] = useState(null);
  const [maritimeWeather, setMaritimeWeather] = useState(null);
  const [focusPosition, setFocusPosition] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Modals & UI State
  const [showModal, setShowModal] = useState(false);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [editingRoute, setEditingRoute] = useState(null);
  const [toast, setToast] = useState('');
  const [broadcastForm, setBroadcastForm] = useState({
    title: 'PERINGATAN EVAKUASI: CUACA BURUK & GELOMBANG TINGGI',
    message: 'Seluruh armada jetski diinstruksikan segera memutar balik dan kembali ke dermaga terdekat sekarang!',
    severity: 'danger'
  });

  // Interactive Drawing Mode State
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingPoints, setDrawingPoints] = useState([]);
  const [drawingColor, setDrawingColor] = useState('#10B981');

  // Form State
  const [form, setForm] = useState({
    id: '',
    name: '',
    description: '',
    distance_km: '',
    duration_min: '',
    difficulty: 'Pemula',
    color: '#10B981',
    active: true,
    path_data: []
  });

  useEffect(() => {
    loadAllData();
    const interval = setInterval(loadRealtimeData, 4000);
    return () => clearInterval(interval);
  }, []);

  async function loadAllData() {
    const [r, w] = await Promise.all([
      getGpsRoutes(),
      getMaritimeWeather()
    ]);
    setRoutes(r || []);
    setMaritimeWeather(w);
    await loadRealtimeData();
  }

  async function loadRealtimeData() {
    const [locs, sos, alert] = await Promise.all([
      getLiveLocations(),
      getActiveSosSignals(),
      getActiveEmergencyAlert()
    ]);
    setFleetLocations(locs || []);
    setSosSignals(sos || []);
    setActiveAlert(alert);
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

  function handleFinishDrawing() {
    if (drawingPoints.length < 2) {
      alert('Rute minimal membutuhkan 2 titik klik pada peta.');
      return;
    }
    setEditingRoute(null);
    setForm({
      id: '',
      name: `Rute Safari ${new Date().toLocaleDateString('id-ID')}`,
      description: `Rute hasil penarikan garis di peta (${drawingPoints.length} waypoint).`,
      distance_km: (drawingPoints.length * 1.2).toFixed(1),
      duration_min: 45,
      difficulty: 'Menengah',
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
    showToast('Mode Tarik Rute Aktif: Klik pada peta laut untuk membuat jalur!');
  }

  function handleOpenCreate() {
    setEditingRoute(null);
    setForm({
      id: '',
      name: '',
      description: '',
      distance_km: '',
      duration_min: '',
      difficulty: 'Pemula',
      color: '#10B981',
      active: true,
      path_data: []
    });
    setShowModal(true);
  }

  function handleOpenEdit(route) {
    setEditingRoute(route);
    setForm({
      id: route.id,
      name: route.name,
      description: route.description || '',
      distance_km: route.distance_km || '',
      duration_min: route.duration_min || '',
      difficulty: route.difficulty || 'Pemula',
      color: route.color || '#3B82F6',
      active: route.active !== false,
      path_data: route.path_data || []
    });
    setShowModal(true);
  }

  function handleApplyTemplate(tpl) {
    setForm(prev => ({
      ...prev,
      name: tpl.name,
      description: tpl.description,
      distance_km: tpl.distance_km,
      duration_min: tpl.duration_min,
      difficulty: tpl.difficulty,
      color: tpl.color,
      path_data: tpl.path_data
    }));
  }

  async function handleSaveRoute(e) {
    e.preventDefault();
    if (!form.name.trim()) return alert('Nama rute wajib diisi.');
    if (form.path_data.length < 2) return alert('Rute harus memiliki minimal 2 titik koordinat.');

    const cleanPath = form.path_data.map(pt => [parseFloat(pt[0]) || 0, parseFloat(pt[1]) || 0]);
    const payload = {
      ...form,
      distance_km: parseFloat(form.distance_km) || null,
      duration_min: parseInt(form.duration_min) || null,
      path_data: cleanPath
    };

    const saved = await upsertGpsRoute(payload);
    if (saved) {
      setShowModal(false);
      setDrawingPoints([]);
      const updated = await getGpsRoutes();
      setRoutes(updated || []);
      setRefreshTrigger(prev => prev + 1);
      showToast('✓ Rute safari berhasil disimpan & aktif di peta!');
    } else {
      alert('Gagal menyimpan rute.');
    }
  }

  async function handleDeleteRoute(id) {
    if (confirm('Yakin ingin menghapus rute navigasi ini?')) {
      const ok = await deleteGpsRoute(id);
      if (ok) {
        const updated = await getGpsRoutes();
        setRoutes(updated || []);
        setRefreshTrigger(prev => prev + 1);
        showToast('✓ Rute berhasil dihapus');
      }
    }
  }

  async function handleToggleRoute(route) {
    await upsertGpsRoute({ ...route, active: !route.active });
    const updated = await getGpsRoutes();
    setRoutes(updated || []);
    setRefreshTrigger(prev => prev + 1);
    showToast(`Rute ${!route.active ? 'diaktifkan' : 'dinonaktifkan'}`);
  }

  // Emergency Broadcast Functions (PRD Section 3.2)
  async function handleSendBroadcast(e) {
    e.preventDefault();
    await broadcastEmergencyAlert({
      type: 'admin_override',
      severity: broadcastForm.severity,
      title: broadcastForm.title,
      message: broadcastForm.message
    });
    setShowBroadcastModal(false);
    await loadRealtimeData();
    showToast('🚨 Peringatan darurat berhasil disiarkan ke semua layar pengendara!');
  }

  async function handleDismissBroadcast() {
    if (confirm('Cabut siaran darurat? Layar pengendara akan kembali ke tampilan normal.')) {
      await dismissEmergencyAlert();
      await loadRealtimeData();
      showToast('✓ Siaran darurat telah dihentikan.');
    }
  }

  async function handleResolveSos(id) {
    if (confirm('Tandai sinyal SOS ini telah berhasil ditangani/dievakuasi?')) {
      await resolveSosSignal(id);
      await loadRealtimeData();
      showToast('✓ Status SOS diselesaikan.');
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 font-bold text-sm animate-fade-in-up">
          <CheckCircle2 size={18} />
          <span>{toast}</span>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          ACTIVE SOS EMERGENCY CALLOUT BANNER (HIGHEST PRIORITY)
          ══════════════════════════════════════════════════════════════ */}
      {sosSignals.length > 0 && (
        <div className="bg-gradient-to-r from-red-600 to-rose-700 text-white p-5 rounded-3xl shadow-2xl border-4 border-white animate-pulse space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white text-red-600 rounded-2xl flex items-center justify-center font-black text-lg shrink-0 shadow-lg">
                SOS
              </div>
              <div>
                <h3 className="font-black text-lg text-white leading-tight flex items-center gap-2">
                  <span>SINYAL DARURAT DIAKTIFKAN OLEH PENGENDARA!</span>
                  <span className="bg-white/20 text-xs px-2.5 py-0.5 rounded-full font-mono">
                    {sosSignals.length} Panggilan Aktif
                  </span>
                </h3>
                <p className="text-xs text-white/90 mt-0.5">
                  Rider membutuhkan pertolongan tim rescue SAR segera. Posisi GPS tertera di bawah ini.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold bg-white/20 px-3 py-1.5 rounded-xl">
                Waktu: {new Date(sosSignals[0].created_at).toLocaleTimeString('id-ID')}
              </span>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3 pt-2 border-t border-white/20">
            {sosSignals.map((sig) => (
              <div key={sig.id} className="bg-black/25 backdrop-blur-sm p-3.5 rounded-2xl flex items-center justify-between gap-3 text-xs">
                <div>
                  <p className="font-extrabold text-sm">{sig.user_name}</p>
                  <p className="font-mono text-white/80 text-[11px] mt-0.5">
                    Koordinat: {sig.lat.toFixed(6)}, {sig.lng.toFixed(6)}
                  </p>
                  <p className="text-[10px] text-white/70 italic mt-0.5">&ldquo;{sig.note}&rdquo;</p>
                </div>
                <div className="flex flex-col gap-1.5 shrink-0">
                  <button
                    onClick={() => setFocusPosition([sig.lat, sig.lng])}
                    className="bg-white text-red-700 hover:bg-gray-100 font-extrabold px-3 py-1.5 rounded-xl text-xs flex items-center justify-center gap-1 cursor-pointer shadow-sm"
                  >
                    <Compass size={13} /> Fokus Peta
                  </button>
                  <button
                    onClick={() => handleResolveSos(sig.id)}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-3 py-1.5 rounded-xl text-[11px] cursor-pointer"
                  >
                    Selesaikan SOS
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          HEADER & TOP COMMAND BUTTONS
          ══════════════════════════════════════════════════════════════ */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              Fleet Tracking & Safety Command
            </h1>
            <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 border border-emerald-100">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Satelit GPS Live
            </span>
          </div>
          <p className="text-gray-500 text-xs sm:text-sm mt-1">
            Pantau posisi armada jetski, telemetri laut real-time, dan siarkan peringatan cuaca otomatis/manual.
          </p>
        </div>

        {/* Command Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Emergency Broadcast Trigger Button */}
          {activeAlert ? (
            <button
              onClick={handleDismissBroadcast}
              className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2.5 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-rose-600/30 animate-pulse cursor-pointer"
            >
              <Siren size={18} />
              <span>SIARAN EVAKUASI AKTIF (Cabut)</span>
            </button>
          ) : (
            <button
              onClick={() => setShowBroadcastModal(true)}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-4 py-2.5 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <Megaphone size={18} />
              <span>Broadcast Evakuasi Darurat</span>
            </button>
          )}

          {/* Interactive Drawing Button */}
          <button
            onClick={handleStartDrawingMode}
            className={`px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer shadow-sm ${
              isDrawing 
                ? 'bg-emerald-600 text-white ring-4 ring-emerald-100' 
                : 'bg-white text-gray-800 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <MousePointerClick size={17} className={isDrawing ? 'text-white' : 'text-emerald-600'} />
            {isDrawing ? 'Sedang Menarik Garis...' : 'Tarik Rute di Peta'}
          </button>

          <button
            onClick={handleOpenCreate}
            className="bg-slate-900 hover:bg-black text-white px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <Plus size={18} /> Rute Safari Baru
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          LIVE MARITIME WEATHER & FLEET STATUS CARDS (PRD 3.2)
          ══════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Card 1: Marine Wave Monitor */}
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center shrink-0">
            <Waves size={24} />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-black uppercase tracking-wider block">
              Tinggi Ombak Laut
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-2xl font-black font-mono text-gray-900">
                {maritimeWeather?.waveHeight || '0.4'}
              </span>
              <span className="text-xs font-bold text-gray-500">Meter</span>
            </div>
            <span className={`text-[10px] font-bold ${
              (maritimeWeather?.waveHeight || 0) > 1.5 ? 'text-rose-600' : 'text-emerald-600'
            }`}>
              {(maritimeWeather?.waveHeight || 0) > 1.5 ? '⚠️ Melebihi Batas Aman' : '✓ Normal (<1.5m)'}
            </span>
          </div>
        </div>

        {/* Card 2: Wind Speed Monitor */}
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center shrink-0">
            <Wind size={24} />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-black uppercase tracking-wider block">
              Kecepatan Angin
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-2xl font-black font-mono text-gray-900">
                {maritimeWeather?.windKnots || '8.2'}
              </span>
              <span className="text-xs font-bold text-gray-500">Knots</span>
            </div>
            <span className="text-[10px] text-gray-500 font-medium">
              Arah: {maritimeWeather?.windCompass || 'Tenggara'}
            </span>
          </div>
        </div>

        {/* Card 3: Active Fleet Units */}
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
            <Activity size={24} />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-black uppercase tracking-wider block">
              Armada Beroperasi
            </span>
            <p className="text-2xl font-black font-mono text-gray-900 leading-none mt-1">
              {fleetLocations.length}
            </p>
            <span className="text-[10px] text-emerald-600 font-bold">
              GPS Sinyal Terhubung
            </span>
          </div>
        </div>

        {/* Card 4: Safety & Weather Alert Status */}
        <div className={`p-5 rounded-3xl border shadow-sm flex items-center gap-4 ${
          activeAlert || maritimeWeather?.isEmergency
            ? 'bg-rose-50 border-rose-200 text-rose-900'
            : 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
        }`}>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
            activeAlert || maritimeWeather?.isEmergency
              ? 'bg-rose-600 text-white animate-pulse'
              : 'bg-emerald-600 text-white'
          }`}>
            <ShieldCheck size={24} />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-black uppercase tracking-wider block opacity-70">
              Status Keselamatan Laut
            </span>
            <p className="font-black text-sm truncate mt-0.5">
              {activeAlert ? 'Peringatan Evakuasi Aktif' : maritimeWeather?.alertTitle || 'Kondisi Aman'}
            </p>
            <p className="text-[10px] opacity-80 truncate">
              {activeAlert ? 'Broadcast Admin Aktif' : 'Pantai Boom & Selat Bali'}
            </p>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          DRAWING MODE TOOLBAR
          ══════════════════════════════════════════════════════════════ */}
      {isDrawing && (
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-4 sm:p-5 rounded-3xl shadow-xl border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in-up">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0 animate-pulse">
              <MousePointerClick size={22} className="text-white" />
            </div>
            <div>
              <p className="font-extrabold text-sm sm:text-base flex items-center gap-2">
                <span>Mode Tarik Rute di Peta Aktif</span>
                <span className="bg-white/20 px-2 py-0.5 rounded-lg text-xs font-mono">
                  {drawingPoints.length} Titik Waypoint
                </span>
              </p>
              <p className="text-xs text-white/80 mt-0.5">
                Klik langsung pada peta perairan laut untuk menggambar jalur lintasan safari.
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
                <Undo2 size={14} /> Batalkan Titik
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

      {/* ══════════════════════════════════════════════════════════════
          MAIN SATELLITE MAP AREA
          ══════════════════════════════════════════════════════════════ */}
      <div className="bg-white p-4 rounded-[32px] border border-gray-100 shadow-sm relative space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-2">
          <div className="flex items-center gap-2">
            <Compass size={18} className="text-cyan-600" />
            <span className="font-extrabold text-gray-900 text-sm">
              Radar Peta Armada & Geofence Perairan Banyuwangi
            </span>
            {activeAlert && (
              <span className="bg-rose-100 text-rose-800 text-[11px] font-black px-2.5 py-0.5 rounded-full animate-pulse border border-rose-200">
                ⚠️ Siaran Evakuasi Aktif
              </span>
            )}
          </div>
          <span className="text-xs text-gray-400">
            Marker jetski diperbarui live tiap 4 detik via Supabase Realtime
          </span>
        </div>

        <AdminMap 
          refreshTrigger={refreshTrigger} 
          isDrawing={isDrawing}
          drawingPoints={drawingPoints}
          drawingColor={drawingColor}
          onMapClick={handleMapClick}
          focusPosition={focusPosition}
          externalLocations={fleetLocations}
        />
      </div>

      {/* ══════════════════════════════════════════════════════════════
          MULTI-VEHICLE LIVE FLEET TELEMETRY TABLE (PRD SECTION 3.3)
          ══════════════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <Radio size={20} className="text-cyan-600" />
            <div>
              <h2 className="text-lg font-black text-gray-900">
                Live Telemetri Armada Pengendara ({fleetLocations.length})
              </h2>
              <p className="text-xs text-gray-500">
                Pantau kecepatan, heading, posisi koordinat, dan status keselamatan tiap unit.
              </p>
            </div>
          </div>
          <button
            onClick={loadRealtimeData}
            className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        {fleetLocations.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <Activity size={36} className="mx-auto mb-2 text-gray-300" />
            <p className="font-bold text-gray-600">Belum ada armada jetski yang aktif di laut</p>
            <p className="text-xs text-gray-400 mt-0.5">
              Ketika penyewa membuka aplikasi navigasi di HP mereka, posisi akan muncul di sini secara otomatis.
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {fleetLocations.map((loc) => {
              const speedKnots = Math.round((loc.speed || 0) * 1.94384);
              const isStale = new Date() - new Date(loc.last_updated) > 90000;
              const status = loc.status || (isStale ? 'offline' : 'normal');

              return (
                <div 
                  key={loc.user_id} 
                  className={`p-4.5 rounded-2xl border transition-all ${
                    status === 'sos' ? 'border-red-500 bg-red-50/50 shadow-md ring-2 ring-red-200' :
                    status === 'warning' ? 'border-amber-400 bg-amber-50/40' :
                    'border-gray-200 bg-white hover:border-cyan-400'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h4 className="font-black text-gray-900 text-sm">{loc.user_name}</h4>
                      <span className="text-[10px] text-gray-400 font-mono">ID: {loc.user_id.slice(0, 8)}...</span>
                    </div>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                      status === 'sos' ? 'bg-red-600 text-white animate-pulse' :
                      status === 'warning' ? 'bg-amber-100 text-amber-800' :
                      'bg-emerald-100 text-emerald-800'
                    }`}>
                      {status === 'sos' ? 'SOS' : status === 'warning' ? 'ZONA WASPADA' : 'AMAN'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 my-2.5 text-xs font-mono">
                    <div className="bg-gray-50 p-2 rounded-xl border border-gray-100">
                      <span className="text-[9px] text-gray-400 block font-sans">Kecepatan</span>
                      <span className="font-black text-gray-800">{speedKnots} kts</span>
                    </div>
                    <div className="bg-gray-50 p-2 rounded-xl border border-gray-100">
                      <span className="text-[9px] text-gray-400 block font-sans">Arah Heading</span>
                      <span className="font-black text-gray-800">{loc.heading || 0}°</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2.5 border-t border-gray-100 text-[11px]">
                    <span className="text-gray-400 font-mono truncate max-w-[130px]">
                      {loc.lat.toFixed(4)}, {loc.lng.toFixed(4)}
                    </span>
                    <button
                      onClick={() => setFocusPosition([loc.lat, loc.lng])}
                      className="bg-cyan-50 hover:bg-cyan-100 text-cyan-700 font-bold px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Compass size={12} /> Fokus Peta
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════
          SAFARI ROUTE MANAGEMENT SECTION
          ══════════════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-100 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2">
              <Route className="text-cyan-600" size={20} />
              <h2 className="text-lg font-black text-gray-900">
                Paket Rute Safari & Titik Pos Navigasi ({routes.length})
              </h2>
            </div>
            <p className="text-gray-500 text-xs mt-1">
              Rute berstatus <strong>Aktif</strong> otomatis muncul di menu pemilihan rute safari penyewa.
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

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {routes.map((rt) => {
            const pointCount = Array.isArray(rt.path_data) ? rt.path_data.length : 0;
            return (
              <div 
                key={rt.id} 
                className={`p-4.5 rounded-2xl border transition-all ${
                  rt.active ? 'border-gray-200 bg-white shadow-sm' : 'border-gray-100 bg-gray-50/60 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span 
                      className="w-3.5 h-3.5 rounded-full shrink-0" 
                      style={{ backgroundColor: rt.color || '#0284C7' }} 
                    />
                    <h3 className="font-extrabold text-gray-900 text-sm truncate">{rt.name}</h3>
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

                <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                  <span className="bg-gray-100 px-2 py-0.5 rounded text-[10px] font-bold text-gray-700">
                    {rt.difficulty || 'Pemula'}
                  </span>
                  <span>•</span>
                  <span>{rt.distance_km ? `${rt.distance_km} km` : '~4 km'}</span>
                  <span>•</span>
                  <span>{rt.duration_min ? `${rt.duration_min} mnt` : '45 mnt'}</span>
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
      </div>

      {/* ══════════════════════════════════════════════════════════════
          EMERGENCY BROADCAST OVERRIDE MODAL (PRD 3.2)
          ══════════════════════════════════════════════════════════════ */}
      {showBroadcastModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center">
                  <Megaphone size={20} />
                </div>
                <div>
                  <h3 className="text-base font-black text-gray-900">Broadcast Peringatan Darurat</h3>
                  <p className="text-xs text-gray-500">Kirim instruksi evakuasi ke semua layar HP pengendara.</p>
                </div>
              </div>
              <button onClick={() => setShowBroadcastModal(false)} className="p-1 text-gray-400 hover:text-gray-700">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSendBroadcast} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Judul Peringatan</label>
                <input
                  type="text"
                  required
                  value={broadcastForm.title}
                  onChange={e => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
                  className="w-full text-xs font-bold border border-gray-200 rounded-xl px-3 py-2.5 focus:border-rose-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Instruksi Evakuasi untuk Pengendara</label>
                <textarea
                  rows={3}
                  required
                  value={broadcastForm.message}
                  onChange={e => setBroadcastForm({ ...broadcastForm, message: e.target.value })}
                  className="w-full text-xs border border-gray-200 rounded-xl p-3 focus:border-rose-500 outline-none"
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-100 text-xs text-amber-900 flex items-start gap-2">
                <AlertCircle size={16} className="shrink-0 mt-0.5 text-amber-600" />
                <p>
                  Peringatan ini akan memicu alarm suara, getar, dan menampilkan garis panduan evakuasi menuju dermaga aman di semua smartphone pengendara.
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBroadcastModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 font-bold py-3 rounded-xl text-xs cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-black py-3 rounded-xl text-xs shadow-lg shadow-rose-600/30 cursor-pointer"
                >
                  SIARKAN SEKARANG
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          MODAL BUAT / EDIT RUTE SAFARI
          ══════════════════════════════════════════════════════════════ */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div 
            className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-7 space-y-5" 
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-black text-gray-900">
                  {editingRoute ? 'Edit Rute Safari' : 'Buat Rute Safari Baru'}
                </h3>
                <p className="text-xs text-gray-500">Tentukan nama, jarak, durasi, dan waypoint lintasan.</p>
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
              <div className="bg-sky-50/70 p-3.5 rounded-2xl border border-sky-100 space-y-2">
                <p className="text-xs font-bold text-sky-900 flex items-center gap-1">
                  <Sparkles size={14} className="text-amber-500" />
                  <span>Pilih Template Safari Siap Pakai (1-Klik):</span>
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {ROUTE_TEMPLATES.map((tpl, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleApplyTemplate(tpl)}
                      className="bg-white hover:bg-sky-100 text-sky-800 text-xs font-bold py-1.5 px-3 rounded-xl border border-sky-200 shadow-2xs transition-colors cursor-pointer"
                    >
                      {tpl.name.split('(')[0].trim()}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleSaveRoute} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Nama Rute Safari *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Contoh: Sunset Explorer Boom Marina"
                  className="w-full text-xs font-semibold border border-gray-200 rounded-xl px-3.5 py-2.5 focus:border-cyan-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Jarak (KM)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={form.distance_km}
                    onChange={e => setForm({ ...form, distance_km: e.target.value })}
                    placeholder="4.5"
                    className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Durasi (Mnt)</label>
                  <input
                    type="number"
                    value={form.duration_min}
                    onChange={e => setForm({ ...form, duration_min: e.target.value })}
                    placeholder="45"
                    className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Kesulitan</label>
                  <select
                    value={form.difficulty}
                    onChange={e => setForm({ ...form, difficulty: e.target.value })}
                    className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2 outline-none bg-white"
                  >
                    <option value="Pemula">Pemula</option>
                    <option value="Menengah">Menengah</option>
                    <option value="Mahir (Pro)">Mahir (Pro)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Deskripsi Jalur</label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Karakteristik ombak dan pemandangan sepanjang jalur..."
                  className="w-full text-xs border border-gray-200 rounded-xl p-3 outline-none"
                />
              </div>

              <div className="flex gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 font-bold py-3 rounded-xl text-xs cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-slate-900 hover:bg-black text-white font-black py-3 rounded-xl text-xs cursor-pointer"
                >
                  Simpan Rute Safari
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
