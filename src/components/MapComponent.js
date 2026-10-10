'use client';
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polyline, Polygon, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import * as turf from '@turf/turf';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet-defaulticon-compatibility';
import { upsertLiveLocation } from '@/lib/supabase-data';

// Custom icons
const riderIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3753/3753641.png', // Jetski icon placeholder
  iconSize: [40, 40],
  iconAnchor: [20, 20]
});

// Component to handle tracking and map centering
function LocationTracker({ position, setGeofenceAlert, geofences }) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.setView([position.lat, position.lng]);

      // Check geofences
      let isInsideDanger = false;
      if (geofences && geofences.length > 0) {
        const pt = turf.point([position.lng, position.lat]);
        for (const fence of geofences) {
          if (!fence.active || !fence.polygon_data) continue;
          const poly = turf.polygon(fence.polygon_data);
          if (turf.booleanPointInPolygon(pt, poly)) {
            isInsideDanger = true;
            break;
          }
        }
      }
      setGeofenceAlert(isInsideDanger);
    }
  }, [position, map, geofences, setGeofenceAlert]);

  return null;
}

export default function MapComponent({ selectedRoute, routes, geofences }) {
  const [position, setPosition] = useState(null);
  const [geofenceAlert, setGeofenceAlert] = useState(false);
  const [watchId, setWatchId] = useState(null);

  // Initial map center (Banyuwangi Boom Beach approx)
  const defaultCenter = [-8.204555, 114.385455]; 

  useEffect(() => {
    // Determine the User for Live Tracking (Mock/Auth)
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const mockId = user.id || '99999999-9999-9999-9999-999999999999';
    const mockName = user.name || 'Anonymous Rider';

    // Start tracking
    if ('geolocation' in navigator) {
      const id = navigator.geolocation.watchPosition(
        (pos) => {
          setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          
          // Push to backend for Admin Live Tracking MVP
          upsertLiveLocation({
            user_id: mockId,
            user_name: mockName,
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            heading: pos.coords.heading || 0,
            speed: pos.coords.speed || 0,
            last_updated: new Date().toISOString()
          }).catch(console.error);
        },
        (err) => {
          console.error("GPS Error:", err);
          alert("Gagal mengakses GPS. Pastikan Location Services menyala.");
        },
        { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
      );
      setWatchId(id);
    } else {
      alert("Browser Anda tidak mendukung Geolocation.");
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, []); // Run once on mount

  const handleSOS = () => {
    const loc = position ? `${position.lat},${position.lng}` : 'Tidak diketahui';
    const msg = `DARURAT! Saya butuh bantuan. Lokasi saya: https://maps.google.com/?q=${loc}`;
    alert("Sinyal SOS dikirim!\n\n" + msg);
    // In production, this would hit an API to send a WhatsApp or Push notification to the Admin
  };

  return (
    <div className="relative w-full h-[100dvh]">
      {/* Map */}
      <MapContainer 
        center={defaultCenter} 
        zoom={15} 
        style={{ width: '100%', height: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Rider Position */}
        {position && (
          <>
            <Marker position={[position.lat, position.lng]} icon={riderIcon} />
            <LocationTracker position={position} setGeofenceAlert={setGeofenceAlert} geofences={geofences} />
          </>
        )}

        {/* Selected Route */}
        {selectedRoute && selectedRoute.path_data && (
          <Polyline 
            positions={selectedRoute.path_data} 
            color={selectedRoute.color || '#3B82F6'} 
            weight={5} 
          />
        )}

        {/* Geofences */}
        {geofences && geofences.map(fence => {
          if (!fence.active || !fence.polygon_data) return null;
          // Invert Coordinates from Turf (LngLat) to Leaflet (LatLng) if needed. 
          // Our dummy data stores [[lat, lng]] for simplicity here.
          const color = fence.type === 'danger' ? '#EF4444' : '#F59E0B';
          return (
            <Polygon 
              key={fence.id}
              positions={fence.polygon_data[0]} 
              pathOptions={{ color, fillColor: color, fillOpacity: 0.3 }}
            />
          );
        })}
      </MapContainer>

      {/* Warning Overlay */}
      {geofenceAlert && (
        <div className="absolute inset-0 z-[400] pointer-events-none flex items-center justify-center bg-red-600/30 animate-pulse">
          <div className="bg-white px-6 py-4 rounded-3xl shadow-2xl flex flex-col items-center">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-3">
              <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-black text-gray-900 text-center">ZONA BERBAHAYA!</h2>
            <p className="text-sm font-bold text-red-600 mt-1">Anda keluar dari batas aman.</p>
            <p className="text-xs text-gray-500 mt-2">Segera putar balik ke arah awal.</p>
          </div>
        </div>
      )}

      {/* SOS Button */}
      <button 
        onClick={handleSOS}
        className="absolute bottom-10 right-6 z-[400] w-16 h-16 bg-red-600 text-white rounded-full shadow-[0_10px_25px_rgba(220,38,38,0.5)] flex items-center justify-center border-4 border-white active:scale-95 transition-transform"
      >
        <span className="font-black text-lg">SOS</span>
      </button>
    </div>
  );
}
