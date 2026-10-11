'use client';
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Polygon, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet-defaulticon-compatibility';
import { getLiveLocations, getGpsGeofences, getGpsRoutes } from '@/lib/supabase-data';

const riderIcon = new L.divIcon({
  html: '<div style="font-size: 16px; background: white; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 50%; box-shadow: 0 4px 6px rgba(0,0,0,0.3); border: 2px solid #EF4444;">🏄‍♂️</div>',
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 16]
});

const waypointIcon = (num, color = '#10B981') => new L.divIcon({
  html: `<div style="background: ${color}; color: white; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; border-radius: 50%; font-size: 11px; font-weight: 800; border: 2px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.35);">${num}</div>`,
  className: '',
  iconSize: [24, 24],
  iconAnchor: [12, 12]
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

export default function AdminMap({ 
  refreshTrigger = 0,
  isDrawing = false,
  drawingPoints = [],
  drawingColor = '#10B981',
  onMapClick = null
}) {
  const [locations, setLocations] = useState([]);
  const [geofences, setGeofences] = useState([]);
  const [routes, setRoutes] = useState([]);

  // Default Center (Pantai Boom Banyuwangi)
  const defaultCenter = [-8.204555, 114.385455];

  useEffect(() => {
    async function loadData() {
      const loc = await getLiveLocations();
      setLocations(loc || []);

      const f = await getGpsGeofences();
      setGeofences(f || []);

      const r = await getGpsRoutes();
      setRoutes(r || []);
    }
    loadData();

    const interval = setInterval(async () => {
      const loc = await getLiveLocations();
      setLocations(loc || []);
    }, 4000);

    return () => clearInterval(interval);
  }, [refreshTrigger]);

  return (
    <div className={`w-full h-[600px] bg-gray-100 rounded-3xl overflow-hidden shadow-sm border border-gray-200 relative ${isDrawing ? 'cursor-crosshair ring-2 ring-emerald-500' : ''}`}>
      <MapContainer 
        center={defaultCenter} 
        zoom={14} 
        style={{ width: '100%', height: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Click listener for interactive drawing */}
        <MapClickHandler isDrawing={isDrawing} onMapClick={onMapClick} />

        {/* Existing Saved Routes */}
        {routes.filter(r => r.active).map(route => (
          <Polyline 
            key={route.id}
            positions={route.path_data} 
            color={route.color || '#3B82F6'} 
            weight={3.5}
            opacity={0.65}
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
                    <p className="font-bold text-gray-800">Titik {idx + 1}</p>
                    <p className="text-[10px] text-gray-500 font-mono mt-0.5">{pt[0]}, {pt[1]}</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </>
        )}

        {/* Geofences */}
        {geofences.filter(g => g.active && g.polygon_data).map(fence => {
          const color = fence.type === 'danger' ? '#EF4444' : '#F59E0B';
          return (
            <Polygon 
              key={fence.id}
              positions={fence.polygon_data[0]} 
              pathOptions={{ color, fillColor: color, fillOpacity: 0.2 }}
            />
          );
        })}

        {/* Active Riders */}
        {locations.map(loc => {
          const isStale = new Date() - new Date(loc.last_updated) > 60000;
          return (
            <Marker key={loc.user_id} position={[loc.lat, loc.lng]} icon={riderIcon} opacity={isStale ? 0.5 : 1}>
              <Popup>
                <div className="text-center">
                  <p className="font-bold text-gray-900">{loc.user_name}</p>
                  <p className="text-xs text-gray-500">Speed: {Math.round(loc.speed || 0)} m/s</p>
                  <p className="text-[10px] text-gray-400">Status: {isStale ? 'Offline' : 'Sedang Berlayar'}</p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
