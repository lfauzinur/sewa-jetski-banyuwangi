'use client';
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Polygon } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet-defaulticon-compatibility';
import { getLiveLocations, getGpsGeofences, getGpsRoutes } from '@/lib/supabase-data';
import { supabase } from '@/lib/supabase';

const riderIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3753/3753641.png', // Jetski icon
  iconSize: [30, 30],
  iconAnchor: [15, 15]
});

export default function AdminMap() {
  const [locations, setLocations] = useState([]);
  const [geofences, setGeofences] = useState([]);
  const [routes, setRoutes] = useState([]);

  // Default Center
  const defaultCenter = [-8.204555, 114.385455];

  useEffect(() => {
    async function loadData() {
      const loc = await getLiveLocations();
      setLocations(loc);

      const f = await getGpsGeofences();
      setGeofences(f);

      const r = await getGpsRoutes();
      setRoutes(r);
    }
    loadData();

    // Set up polling because realtime requires table replication settings on Supabase
    // To ensure it just works for the user MVP without complex DB configs, we poll every 3 seconds.
    const interval = setInterval(async () => {
      const loc = await getLiveLocations();
      setLocations(loc);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-[600px] bg-gray-100 rounded-3xl overflow-hidden shadow-sm border border-gray-200">
      <MapContainer 
        center={defaultCenter} 
        zoom={14} 
        style={{ width: '100%', height: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Routes */}
        {routes.filter(r => r.active).map(route => (
          <Polyline 
            key={route.id}
            positions={route.path_data} 
            color={route.color || '#3B82F6'} 
            weight={3}
            opacity={0.5}
            dashArray="5, 10"
          />
        ))}

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
          const isStale = new Date() - new Date(loc.last_updated) > 60000; // > 1 minute
          return (
            <Marker key={loc.user_id} position={[loc.lat, loc.lng]} icon={riderIcon} opacity={isStale ? 0.5 : 1}>
              <Popup>
                <div className="text-center">
                  <p className="font-bold text-gray-900">{loc.user_name}</p>
                  <p className="text-xs text-gray-500">Speed: {Math.round(loc.speed || 0)} m/s</p>
                  <p className="text-[10px] text-gray-400">Last seen: {isStale ? 'Offline' : 'Live'}</p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
