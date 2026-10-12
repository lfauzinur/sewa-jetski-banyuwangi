'use client';
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Polygon, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet-defaulticon-compatibility';
import { getLiveLocations, getGpsGeofences, getGpsRoutes } from '@/lib/supabase-data';

// ==============================================================================
// CUSTOM LEAFLET DIV ICONS UNTUK FLEET ADMIN
// ==============================================================================

const createFleetRiderIcon = (status = 'normal', heading = 0) => {
  const isSos = status === 'sos';
  const isWarning = status === 'warning';

  const bgColor = isSos 
    ? '#EF4444' 
    : isWarning 
    ? '#F59E0B' 
    : 'linear-gradient(135deg, #0284C7, #06B6D4)';

  const shadow = isSos 
    ? '0 0 16px rgba(239, 68, 68, 0.9)' 
    : '0 4px 10px rgba(2, 132, 199, 0.4)';

  return new L.divIcon({
    html: `
      <div style="
        background: ${bgColor}; 
        width: 36px; height: 36px; 
        display: flex; align-items: center; justify-content: center; 
        border-radius: 50%; 
        box-shadow: ${shadow}; 
        border: 2.5px solid white;
        position: relative;
        transform: rotate(${heading || 0}deg);
        ${isSos ? 'animation: pulse 1s infinite alternate;' : ''}
      ">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="12 2 19 21 12 17 5 21 12 2" fill="white" fill-opacity="0.3"/>
        </svg>
        ${isSos ? '<div style="position: absolute; -top: 6px; -right: 6px; background: #991B1B; color: white; font-size: 8px; font-weight: 900; padding: 1px 4px; border-radius: 6px; border: 1px solid white;">SOS</div>' : ''}
      </div>
    `,
    className: '',
    iconSize: [36, 36],
    iconAnchor: [18, 18]
  });
};

const waypointIcon = (num, color = '#10B981') => new L.divIcon({
  html: `<div style="background: ${color}; color: white; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; border-radius: 50%; font-size: 11px; font-weight: 800; border: 2px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.35);">${num}</div>`,
  className: '',
  iconSize: [26, 26],
  iconAnchor: [13, 13]
});

const basecampIcon = new L.divIcon({
  html: `
    <div style="background: #0F172A; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 10px; border: 2px solid #38BDF8; box-shadow: 0 4px 10px rgba(0,0,0,0.3);">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      </svg>
    </div>
  `,
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 16]
});

function MapClickHandler({ isDrawing, onMapClick }) {
  useMapEvents({
    click(e) {
      if (isDrawing && onMapClick) {
        onMapClick([Number(e.latlng.lat.toFixed(6)), Number(e.latlng.lng.toFixed(6))]);
      }
    }
  });
  return null;
}

function MapController({ focusPosition }) {
  const map = useMap();
  useEffect(() => {
    if (focusPosition && focusPosition.length === 2) {
      map.setView(focusPosition, 16, { animate: true });
    }
  }, [focusPosition, map]);
  return null;
}

export default function AdminMap({ 
  refreshTrigger = 0,
  isDrawing = false,
  drawingPoints = [],
  drawingColor = '#10B981',
  onMapClick = null,
  focusPosition = null,
  externalLocations = null
}) {
  const [locations, setLocations] = useState([]);
  const [geofences, setGeofences] = useState([]);
  const [routes, setRoutes] = useState([]);

  // Default Center (Pantai Boom Marina Banyuwangi)
  const defaultCenter = [-8.204555, 114.385455];

  useEffect(() => {
    async function loadData() {
      const f = await getGpsGeofences();
      setGeofences(f || []);

      const r = await getGpsRoutes();
      setRoutes(r || []);

      if (!externalLocations) {
        const loc = await getLiveLocations();
        setLocations(loc || []);
      }
    }
    loadData();

    if (!externalLocations) {
      const interval = setInterval(async () => {
        const loc = await getLiveLocations();
        setLocations(loc || []);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [refreshTrigger, externalLocations]);

  const activeLocations = externalLocations || locations;

  return (
    <div className={`w-full h-[620px] bg-slate-900 rounded-3xl overflow-hidden shadow-xl border border-slate-700/80 relative ${isDrawing ? 'cursor-crosshair ring-3 ring-emerald-500' : ''}`}>
      <MapContainer 
        center={defaultCenter} 
        zoom={14} 
        style={{ width: '100%', height: '100%' }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapClickHandler isDrawing={isDrawing} onMapClick={onMapClick} />
        <MapController focusPosition={focusPosition} />

        {/* Basecamp Marina Station */}
        <Marker position={defaultCenter} icon={basecampIcon}>
          <Popup>
            <div className="text-center font-bold text-xs p-1">
              <p className="text-sky-700">Posko Pusat Pantai Boom Marina</p>
              <p className="text-[10px] text-gray-500 font-normal">Basecamp Kendali Utama & Rescue</p>
            </div>
          </Popup>
        </Marker>

        {/* Existing Saved Routes */}
        {routes.filter(r => r.active).map(route => (
          <Polyline 
            key={route.id}
            positions={route.path_data} 
            color={route.color || '#0284C7'} 
            weight={4}
            opacity={0.7}
            dashArray="6, 8"
          />
        ))}

        {/* Active Drawing Route in Progress */}
        {isDrawing && drawingPoints.length > 0 && (
          <>
            <Polyline 
              positions={drawingPoints} 
              color={drawingColor || '#10B981'} 
              weight={5}
              opacity={0.9}
            />
            {drawingPoints.map((pt, idx) => (
              <Marker 
                key={`wp-${idx}`} 
                position={pt} 
                icon={waypointIcon(idx + 1, drawingColor)}
              >
                <Popup>
                  <div className="text-center text-xs">
                    <p className="font-bold text-gray-800">Waypoint {idx + 1}</p>
                    <p className="text-[10px] text-gray-500 font-mono mt-0.5">{pt[0]}, {pt[1]}</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </>
        )}

        {/* Geofences Polygons */}
        {geofences.filter(g => g.active && g.polygon_data).map(fence => {
          const color = fence.type === 'danger' ? '#EF4444' : '#F59E0B';
          return (
            <Polygon 
              key={fence.id}
              positions={fence.polygon_data[0]} 
              pathOptions={{ 
                color, 
                fillColor: color, 
                fillOpacity: 0.25,
                weight: 2
              }}
            >
              <Popup>
                <div className="text-xs p-1">
                  <p className="font-black text-rose-600 uppercase">{fence.name}</p>
                  <p className="text-[10px] text-gray-500">Tipe: {fence.type === 'danger' ? 'Zona Bahaya' : 'Peringatan'}</p>
                </div>
              </Popup>
            </Polygon>
          );
        })}

        {/* Multi-Vehicle Active Fleet Riders */}
        {activeLocations.map(loc => {
          const isStale = new Date() - new Date(loc.last_updated) > 90000;
          const status = loc.status || (isStale ? 'offline' : 'normal');
          const speedKnots = Math.round((loc.speed || 0) * 1.94384);

          return (
            <Marker 
              key={loc.user_id} 
              position={[loc.lat, loc.lng]} 
              icon={createFleetRiderIcon(status, loc.heading)} 
              opacity={isStale ? 0.6 : 1}
            >
              <Popup>
                <div className="p-1 min-w-[170px] text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-extrabold text-sm text-gray-900">{loc.user_name}</span>
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                      status === 'sos' ? 'bg-red-600 text-white' :
                      status === 'warning' ? 'bg-amber-100 text-amber-800' :
                      'bg-emerald-100 text-emerald-800'
                    }`}>
                      {status === 'sos' ? 'SOS AKTIF' : status === 'warning' ? 'ZONA WASPADA' : 'NORMAL'}
                    </span>
                  </div>
                  <p className="text-gray-600 font-mono">Kecepatan: {speedKnots} kts ({(loc.speed || 0).toFixed(1)} m/s)</p>
                  <p className="text-gray-500 text-[10px] font-mono mt-0.5">
                    Koordinat: {loc.lat.toFixed(5)}, {loc.lng.toFixed(5)}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1">
                    {isStale ? 'Koneksi Terputus (>90d)' : `Update: ${new Date(loc.last_updated).toLocaleTimeString('id-ID')}`}
                  </p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
