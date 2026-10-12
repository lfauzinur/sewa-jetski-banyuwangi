'use client';
import { useEffect, useState, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Polyline, Polygon, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import * as turf from '@turf/turf';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet-defaulticon-compatibility';
import { 
  AlertTriangle, Navigation, Compass, ShieldAlert, Waves, Wind, 
  Sun, CheckCircle2, PhoneCall, ChevronRight, X, Volume2, VolumeX, Eye
} from 'lucide-react';
import { upsertLiveLocation, sendSosSignal, getActiveEmergencyAlert } from '@/lib/supabase-data';
import { getMaritimeWeather } from '@/lib/weather-service';
import { COMPANY } from '@/lib/data';

// ==============================================================================
// LEAFLET CUSTOM MARKERS (High Contrast & Modern SVG)
// ==============================================================================
const createRiderIcon = (heading = 0, isDanger = false, isSos = false) => new L.divIcon({
  html: `
    <div style="
      background: ${isSos ? '#EF4444' : isDanger ? '#DC2626' : 'linear-gradient(135deg, #0284C7, #06B6D4)'};
      width: 42px; height: 42px;
      display: flex; align-items: center; justify-content: center;
      border-radius: 50%;
      box-shadow: 0 4px 14px ${isSos ? 'rgba(239, 68, 68, 0.7)' : 'rgba(2, 132, 199, 0.45)'};
      border: 3px solid white;
      transform: rotate(${heading}deg);
      transition: transform 0.3s ease;
    ">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="12 2 19 21 12 17 5 21 12 2" fill="white" fill-opacity="0.25"/>
      </svg>
    </div>
  `,
  className: '',
  iconSize: [42, 42],
  iconAnchor: [21, 21]
});

const createCheckpointIcon = (number, isReached = false) => new L.divIcon({
  html: `
    <div style="
      background: ${isReached ? '#10B981' : '#0284C7'};
      color: white;
      width: 30px; height: 30px;
      display: flex; align-items: center; justify-content: center;
      border-radius: 50%;
      font-weight: 800; font-size: 13px;
      border: 2.5px solid white;
      box-shadow: 0 3px 8px rgba(0,0,0,0.3);
    ">
      ${isReached ? '✓' : number}
    </div>
  `,
  className: '',
  iconSize: [30, 30],
  iconAnchor: [15, 15]
});

const basecampIcon = new L.divIcon({
  html: `
    <div style="
      background: #0F172A; color: white;
      width: 32px; height: 32px;
      display: flex; align-items: center; justify-content: center;
      border-radius: 10px;
      border: 2px solid #38BDF8;
      box-shadow: 0 4px 10px rgba(0,0,0,0.3);
    ">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    </div>
  `,
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 16]
});

// Sound Alert Synth
function playAudioTone(type = 'danger') {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = type === 'danger' ? 'sawtooth' : 'sine';
    osc.frequency.setValueAtTime(type === 'danger' ? 880 : 587, ctx.currentTime);
    gain.gain.setValueAtTime(0.35, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.45);
    osc.start();
    osc.stop(ctx.currentTime + 0.45);
  } catch (e) {}
}

// Distance Helper (Haversine km)
function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return Number((R * c).toFixed(2));
}

// Map Centering Tracker Component
function MapFollower({ position, isAutoFollow }) {
  const map = useMap();
  useEffect(() => {
    if (position && isAutoFollow) {
      map.setView([position.lat, position.lng], map.getZoom(), { animate: true });
    }
  }, [position, isAutoFollow, map]);
  return null;
}

export default function MapComponent({ selectedRoute, routes, geofences, onReturnToBase = null }) {
  const [position, setPosition] = useState(null);
  const [speedKmh, setSpeedKmh] = useState(0);
  const [heading, setHeading] = useState(0);
  const [geofenceAlert, setGeofenceAlert] = useState(false);
  const [weatherAlert, setWeatherAlert] = useState(null);
  const [activeBroadcast, setActiveBroadcast] = useState(null);
  const [maritimeWeather, setMaritimeWeather] = useState(null);
  const [reachedCheckpoints, setReachedCheckpoints] = useState(new Set());
  const [activeCheckpointToast, setActiveCheckpointToast] = useState(null);
  const [showSosModal, setShowSosModal] = useState(false);
  const [sosSent, setSosSent] = useState(false);
  const [isAutoFollow, setIsAutoFollow] = useState(true);
  const [isSunlightMode, setIsSunlightMode] = useState(false); // High Contrast Outdoor Mode
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Home Basecamp (Pantai Boom Marina Banyuwangi)
  const HOME_BASECAMP = useMemo(() => ({
    name: 'Dermaga Boom Marina Banyuwangi',
    lat: -8.204555,
    lng: 114.385455
  }), []);

  // 1. Inisialisasi GPS Geolocation Watcher
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user.id || 'rider-anonymous';
    const userName = user.name || 'Safari Rider';

    let prevPos = null;
    let prevTime = Date.now();

    if ('geolocation' in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const currentHeading = pos.coords.heading || 0;
          let calculatedSpeedKmh = pos.coords.speed ? (pos.coords.speed * 3.6) : 0;

          // Hitung kecepatan jika speed GPS null (pada beberapa smartphone)
          if (!pos.coords.speed && prevPos) {
            const timeDiffSec = (Date.now() - prevTime) / 1000;
            if (timeDiffSec > 1) {
              const distKm = calculateDistanceKm(prevPos.lat, prevPos.lng, lat, lng);
              calculatedSpeedKmh = (distKm / (timeDiffSec / 3600));
            }
          }
          prevPos = { lat, lng };
          prevTime = Date.now();

          const newPos = { lat, lng };
          setPosition(newPos);
          setSpeedKmh(Math.min(95, Math.round(calculatedSpeedKmh)));
          if (currentHeading) setHeading(Math.round(currentHeading));

          // Sync Live Location ke Admin
          upsertLiveLocation({
            user_id: userId,
            user_name: userName,
            lat,
            lng,
            heading: currentHeading,
            speed: calculatedSpeedKmh / 3.6, // m/s
            status: geofenceAlert ? 'warning' : 'normal',
            route_id: selectedRoute?.id || null,
            last_updated: new Date().toISOString()
          }).catch(() => {});
        },
        (err) => {
          console.warn("GPS Error / Mock Fallback:", err);
          // Fallback mock position jika izin GPS ditolak di browser desktop
          setPosition({ lat: -8.204555, lng: 114.385455 });
        },
        { enableHighAccuracy: true, maximumAge: 1000, timeout: 8000 }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    } else {
      setPosition({ lat: -8.204555, lng: 114.385455 });
    }
  }, [selectedRoute, geofenceAlert]);

  // 2. Evaluasi Geofence & Checkpoints saat posisi berubah
  useEffect(() => {
    if (!position) return;

    // A. Geofence Danger Check (Turf.js)
    let insideDanger = false;
    if (geofences && geofences.length > 0) {
      const pt = turf.point([position.lng, position.lat]);
      for (const fence of geofences) {
        if (!fence.active || !fence.polygon_data) continue;
        try {
          const poly = turf.polygon(fence.polygon_data);
          if (turf.booleanPointInPolygon(pt, poly)) {
            insideDanger = true;
            break;
          }
        } catch (e) {}
      }
    }

    if (insideDanger && !geofenceAlert) {
      setGeofenceAlert(true);
      if (soundEnabled) playAudioTone('danger');
      if (navigator.vibrate) navigator.vibrate([400, 200, 400]);
    } else if (!insideDanger && geofenceAlert) {
      setGeofenceAlert(false);
    }

    // B. Checkpoint Proximity Detection (Radius 60m)
    if (selectedRoute?.checkpoints?.length) {
      selectedRoute.checkpoints.forEach((cp, idx) => {
        const distKm = calculateDistanceKm(position.lat, position.lng, cp.lat, cp.lng);
        if (distKm <= 0.08 && !reachedCheckpoints.has(cp.id || `cp-${idx}`)) {
          setReachedCheckpoints(prev => new Set(prev).add(cp.id || `cp-${idx}`));
          setActiveCheckpointToast(cp);
          if (soundEnabled) playAudioTone('safe');
          setTimeout(() => setActiveCheckpointToast(null), 7000);
        }
      });
    }
  }, [position, geofences, geofenceAlert, selectedRoute, reachedCheckpoints, soundEnabled]);

  // 3. Periodic Weather API & Emergency Broadcast Checker (Tiap 20 Detik)
  useEffect(() => {
    async function checkSafetyConditions() {
      // A. Ambil Cuaca Maritim Terkini (Open-Meteo)
      const weather = await getMaritimeWeather();
      setMaritimeWeather(weather);

      if (weather && weather.isEmergency) {
        setWeatherAlert(weather);
        if (soundEnabled) playAudioTone('danger');
      } else {
        setWeatherAlert(null);
      }

      // B. Ambil Manual Broadcast dari Admin
      const broadcast = await getActiveEmergencyAlert();
      if (broadcast && broadcast.active) {
        setActiveBroadcast(broadcast);
        if (soundEnabled) playAudioTone('danger');
      } else {
        setActiveBroadcast(null);
      }
    }

    checkSafetyConditions();
    const interval = setInterval(checkSafetyConditions, 20000);
    return () => clearInterval(interval);
  }, [soundEnabled]);

  // Handle SOS
  async function triggerSos() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const loc = position || HOME_BASECAMP;
    
    await sendSosSignal({
      user_id: user.id || 'rider-unknown',
      user_name: user.name || 'Safari Rider',
      lat: loc.lat,
      lng: loc.lng,
      note: 'Darurat! Sinyal SOS ditekan dari aplikasi navigasi stang jetski.'
    });

    setSosSent(true);
    if (soundEnabled) playAudioTone('danger');
    if (navigator.vibrate) navigator.vibrate([600, 200, 600, 200, 600]);
  }

  // Jarak ke Home Basecamp
  const distanceToBaseKm = position 
    ? calculateDistanceKm(position.lat, position.lng, HOME_BASECAMP.lat, HOME_BASECAMP.lng)
    : 0;

  // Garis Evakuasi Darurat (Return Route ke Basecamp terdekat)
  const evacuationRoute = useMemo(() => {
    if (!position) return null;
    return [
      [position.lat, position.lng],
      [HOME_BASECAMP.lat, HOME_BASECAMP.lng]
    ];
  }, [position, HOME_BASECAMP]);

  const speedKnots = Math.round(speedKmh * 0.539957);

  return (
    <div className={`relative w-full h-[100dvh] overflow-hidden select-none ${isSunlightMode ? 'sunlight-high-contrast' : ''}`}>
      {/* MAP ENGINE */}
      <MapContainer 
        center={[HOME_BASECAMP.lat, HOME_BASECAMP.lng]} 
        zoom={14} 
        style={{ width: '100%', height: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url={isSunlightMode 
            ? "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          }
        />

        {/* Home Basecamp */}
        <Marker position={[HOME_BASECAMP.lat, HOME_BASECAMP.lng]} icon={basecampIcon}>
          <Popup>
            <div className="text-center font-bold text-xs p-1">
              <p className="text-sky-700">{HOME_BASECAMP.name}</p>
              <p className="text-[10px] text-gray-500 font-normal">Dermaga Utama & Tim Penyelamat</p>
            </div>
          </Popup>
        </Marker>

        {/* Selected Safari Route Polyline */}
        {selectedRoute?.path_data && (
          <Polyline 
            positions={selectedRoute.path_data} 
            color={selectedRoute.color || '#0284C7'} 
            weight={isSunlightMode ? 8 : 6}
            opacity={0.9}
          />
        )}

        {/* Checkpoint Markers */}
        {selectedRoute?.checkpoints?.map((cp, idx) => {
          const isReached = reachedCheckpoints.has(cp.id || `cp-${idx}`);
          return (
            <Marker 
              key={cp.id || idx} 
              position={[cp.lat, cp.lng]} 
              icon={createCheckpointIcon(idx + 1, isReached)}
            >
              <Popup>
                <div className="p-1 max-w-[180px]">
                  <p className="font-extrabold text-xs text-gray-900">{cp.name}</p>
                  <p className="text-[11px] text-gray-600 mt-0.5 leading-snug">{cp.description}</p>
                  {isReached && (
                    <span className="inline-block mt-1 px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-md">
                      ✓ Sudah Tercapai
                    </span>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Geofence Polygons */}
        {geofences?.filter(f => f.active && f.polygon_data).map(fence => {
          const color = fence.type === 'danger' ? '#EF4444' : '#F59E0B';
          return (
            <Polygon 
              key={fence.id}
              positions={fence.polygon_data[0]} 
              pathOptions={{ 
                color, 
                fillColor: color, 
                fillOpacity: isSunlightMode ? 0.35 : 0.25, 
                weight: 2 
              }}
            />
          );
        })}

        {/* Evacuation Return Route (Red Line jika Peringatan Aktif) */}
        {(weatherAlert || activeBroadcast || geofenceAlert) && evacuationRoute && (
          <Polyline 
            positions={evacuationRoute} 
            color="#EF4444" 
            weight={5} 
            dashArray="8, 12" 
          />
        )}

        {/* Rider Live Position Marker */}
        {position && (
          <Marker 
            position={[position.lat, position.lng]} 
            icon={createRiderIcon(heading, geofenceAlert, sosSent)}
            zIndexOffset={1000}
          />
        )}

        <MapFollower position={position} isAutoFollow={isAutoFollow} />
      </MapContainer>

      {/* ══════════════════════════════════════════════════════════════
          TOP MARITIME WEATHER & SAFETY BAR
          ══════════════════════════════════════════════════════════════ */}
      <div className="absolute top-3 left-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
        <div className="flex items-center justify-between gap-2 pointer-events-auto">
          {/* Weather Widget Capsule */}
          <div className="bg-slate-900/90 backdrop-blur-md text-white px-3.5 py-2 rounded-2xl shadow-lg border border-slate-700/60 flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-cyan-300">
              <Waves size={15} />
              <span className="font-mono font-bold text-xs">
                {maritimeWeather ? `${maritimeWeather.waveHeight}m` : '0.4m'}
              </span>
            </div>
            <div className="h-3 w-px bg-slate-700" />
            <div className="flex items-center gap-1.5 text-emerald-300">
              <Wind size={15} />
              <span className="font-mono font-bold text-xs">
                {maritimeWeather ? `${maritimeWeather.windKnots} kts` : '8 kts'}
              </span>
            </div>
            <div className="h-3 w-px bg-slate-700" />
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
              weatherAlert || activeBroadcast ? 'bg-rose-500 text-white animate-pulse' : 'bg-emerald-500/20 text-emerald-300'
            }`}>
              {weatherAlert || activeBroadcast ? 'DARURAT' : 'LAUT AMAN'}
            </span>
          </div>

          {/* Quick Utility Actions (Sunlight Mode & Sound) */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsSunlightMode(!isSunlightMode)}
              className={`p-2.5 rounded-xl shadow-lg font-bold text-xs flex items-center justify-center transition-all ${
                isSunlightMode ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-500' : 'bg-slate-900/80 text-white backdrop-blur-md'
              }`}
              title="Mode Sinar Matahari (High Contrast)"
            >
              <Sun size={18} />
            </button>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2.5 bg-slate-900/80 backdrop-blur-md text-white rounded-xl shadow-lg flex items-center justify-center"
              title="Toggle Suara Peringatan"
            >
              {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} className="text-gray-400" />}
            </button>
          </div>
        </div>

        {/* ACTIVE CHECKPOINT CELEBRATION TOAST */}
        {activeCheckpointToast && (
          <div className="bg-emerald-600 text-white p-3 rounded-2xl shadow-xl flex items-center gap-3 animate-bounce border-2 border-white pointer-events-auto">
            <CheckCircle2 size={24} className="shrink-0 text-emerald-200" />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-black uppercase tracking-wider text-emerald-200">Checkpoint Tercapai!</p>
              <p className="font-extrabold text-sm truncate">{activeCheckpointToast.name}</p>
              <p className="text-xs text-white/90 line-clamp-1">{activeCheckpointToast.description}</p>
            </div>
            <button onClick={() => setActiveCheckpointToast(null)} className="p-1 hover:bg-emerald-700 rounded-lg">
              <X size={16} />
            </button>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════
          BOTTOM HEADS-UP DISPLAY (HUD) & TELEMETRY
          ══════════════════════════════════════════════════════════════ */}
      <div className="absolute bottom-6 left-4 right-4 z-[9999] flex items-end justify-between gap-3 pointer-events-none">
        {/* Speedometer & Compass HUD Card */}
        <div className="bg-slate-950/90 backdrop-blur-md border border-slate-800 text-white p-3.5 rounded-3xl shadow-2xl flex items-center gap-4 pointer-events-auto">
          {/* Speed Value */}
          <div className="text-center px-1">
            <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">Speed</span>
            <div className="flex items-baseline justify-center gap-0.5">
              <span className="text-3xl font-black font-mono text-cyan-400 leading-none">{speedKnots}</span>
              <span className="text-[11px] font-bold text-slate-400">kts</span>
            </div>
            <span className="text-[10px] text-slate-400">{speedKmh} km/h</span>
          </div>

          <div className="h-8 w-px bg-slate-800" />

          {/* Compass Heading */}
          <div className="text-center px-1">
            <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">Arah</span>
            <div className="flex items-center justify-center gap-1">
              <Compass size={18} className="text-amber-400" />
              <span className="font-mono font-black text-lg text-white">{heading}°</span>
            </div>
            <span className="text-[10px] text-amber-300 font-bold">
              {heading >= 315 || heading < 45 ? 'U' : heading < 135 ? 'T' : heading < 225 ? 'S' : 'B'}
            </span>
          </div>

          <div className="h-8 w-px bg-slate-800" />

          {/* Distance to Home Basecamp */}
          <div className="text-center px-1">
            <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">Dermaga</span>
            <span className="font-mono font-black text-lg text-emerald-400">{distanceToBaseKm}</span>
            <span className="text-[10px] text-slate-400 block font-bold">km lagi</span>
          </div>
        </div>

        {/* ACTION BUTTONS (Return-to-Base & Big SOS) */}
        <div className="flex items-center gap-2.5 pointer-events-auto">
          {/* Auto Re-center */}
          <button
            onClick={() => setIsAutoFollow(!isAutoFollow)}
            className={`w-13 h-13 rounded-2xl shadow-xl flex items-center justify-center border transition-all ${
              isAutoFollow ? 'bg-cyan-500 text-white border-cyan-400' : 'bg-slate-900/90 text-slate-400 border-slate-700'
            }`}
            title="Kunci Posisi Saya"
          >
            <Navigation size={22} className={isAutoFollow ? 'animate-pulse' : ''} />
          </button>

          {/* BIG SOS BUTTON */}
          <button
            onClick={() => setShowSosModal(true)}
            className="w-16 h-16 bg-gradient-to-tr from-rose-700 to-red-500 text-white rounded-full shadow-[0_8px_25px_rgba(225,29,72,0.6)] flex flex-col items-center justify-center border-4 border-white active:scale-95 transition-transform cursor-pointer"
          >
            <span className="font-black text-base leading-none">SOS</span>
            <span className="text-[9px] font-bold text-red-100 tracking-wider">DARURAT</span>
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          GEOFENCE OUT-OF-BOUNDS FLASHING WARNING MODAL
          ══════════════════════════════════════════════════════════════ */}
      {geofenceAlert && (
        <div className="absolute inset-0 z-[10000] pointer-events-auto flex items-center justify-center p-4 bg-red-950/70 backdrop-blur-xs animate-pulse">
          <div className="bg-white rounded-3xl p-6 shadow-2xl max-w-sm w-full text-center border-4 border-red-600">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl mx-auto flex items-center justify-center mb-4">
              <ShieldAlert size={36} />
            </div>
            <h2 className="text-xl font-black text-red-600 tracking-tight">KELUAR DARI ZONA AMAN!</h2>
            <p className="text-xs font-bold text-gray-700 mt-2 leading-relaxed">
              Anda mendekati area terumbu karang dangkal atau batas laut terlarang.
            </p>
            <div className="mt-4 p-3 bg-red-50 rounded-2xl border border-red-100 text-left text-xs text-red-900 space-y-1">
              <p className="font-bold">Instruksi Keselamatan:</p>
              <p>1. Lepaskan tuas gas segera.</p>
              <p>2. Putar balik perlahan mengikuti garis panduan di layar.</p>
            </div>
            <button
              onClick={() => setGeofenceAlert(false)}
              className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white font-extrabold py-3.5 rounded-2xl shadow-lg transition-colors cursor-pointer text-sm"
            >
              Saya Mengerti & Putar Balik
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          WEATHER & ADMIN EVACUATION EMERGENCY POPUP (PRD SECTION 3.2)
          ══════════════════════════════════════════════════════════════ */}
      {(weatherAlert || activeBroadcast) && (
        <div className="absolute inset-0 z-[10001] pointer-events-auto flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-2xl max-w-md w-full border-2 border-rose-500">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-rose-500/20 text-rose-400 rounded-2xl flex items-center justify-center shrink-0 border border-rose-500/30">
                <AlertTriangle size={28} className="animate-bounce" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-rose-400 block">
                  {activeBroadcast ? 'Peringatan Beach Marshal' : 'Peringatan Cuaca Otomatis'}
                </span>
                <h3 className="text-lg font-black text-white leading-tight">
                  {activeBroadcast?.title || weatherAlert?.alertTitle || 'PERINTAH EVAKUASI KE DARAT'}
                </h3>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700">
              {activeBroadcast?.message || weatherAlert?.alertMessage}
            </p>

            <div className="grid grid-cols-2 gap-2 mt-4 text-xs font-mono">
              <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700">
                <span className="text-[10px] text-slate-400 block">Gelombang Laut</span>
                <span className="text-base font-black text-rose-400">
                  {maritimeWeather?.waveHeight || 1.6} Meter
                </span>
              </div>
              <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700">
                <span className="text-[10px] text-slate-400 block">Kecepatan Angin</span>
                <span className="text-base font-black text-amber-400">
                  {maritimeWeather?.windKnots || 26} Knots
                </span>
              </div>
            </div>

            <div className="mt-5 space-y-2">
              <button
                onClick={() => {
                  setWeatherAlert(null);
                  setActiveBroadcast(null);
                }}
                className="w-full bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-black py-3.5 rounded-2xl shadow-lg transition-transform active:scale-98 text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Ikuti Jalur Merah ke Dermaga ({distanceToBaseKm} km)</span>
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          SOS CONFIRMATION / DISPATCH MODAL
          ══════════════════════════════════════════════════════════════ */}
      {showSosModal && (
        <div className="absolute inset-0 z-[10002] pointer-events-auto flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-white rounded-3xl p-6 shadow-2xl max-w-sm w-full text-center border border-gray-100">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-3xl mx-auto flex items-center justify-center mb-3">
              <AlertTriangle size={32} />
            </div>

            <h3 className="text-xl font-black text-gray-900">Kirim Sinyal SOS Darurat?</h3>
            <p className="text-xs text-gray-500 mt-1">
              Posisi koordinat Anda saat ini akan segera dikirimkan ke Dashboard Admin Beach Marshal & Tim SAR.
            </p>

            <div className="my-3 p-3 bg-gray-50 rounded-2xl text-left text-xs font-mono text-gray-600 space-y-1">
              <p><span className="font-bold">Koordinat:</span> {position?.lat.toFixed(6)}, {position?.lng.toFixed(6)}</p>
              <p><span className="font-bold">Jarak Dermaga:</span> {distanceToBaseKm} km</p>
            </div>

            {sosSent ? (
              <div className="space-y-3">
                <div className="p-3 bg-emerald-50 text-emerald-800 rounded-2xl text-xs font-bold border border-emerald-100 flex items-center justify-center gap-2">
                  <CheckCircle2 size={18} className="text-emerald-600" />
                  <span>Sinyal SOS Terkirim ke Posko Pantai!</span>
                </div>
                <a
                  href={`https://wa.me/${COMPANY.whatsapp}?text=${encodeURIComponent(
                    `*DARURAT SOS JETSKI BANYUWANGI*\nNama Rider: Tamu Navigasi\nKoordinat: https://maps.google.com/?q=${position?.lat},${position?.lng}\nJarak ke Dermaga: ${distanceToBaseKm} km\nMohon bantuan tim rescue segera!`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-emerald-600 text-white font-extrabold py-3 rounded-2xl flex items-center justify-center gap-2 text-xs"
                >
                  <PhoneCall size={16} /> Hubungi WhatsApp Marshal
                </a>
                <button
                  onClick={() => {
                    setShowSosModal(false);
                    setSosSent(false);
                  }}
                  className="w-full text-gray-500 text-xs py-2 font-bold"
                >
                  Tutup
                </button>
              </div>
            ) : (
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setShowSosModal(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-2xl text-xs cursor-pointer"
                >
                  Batal
                </button>
                <button
                  onClick={triggerSos}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-black py-3 rounded-2xl text-xs shadow-lg shadow-red-600/30 cursor-pointer"
                >
                  KIRIM SEKARANG
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
