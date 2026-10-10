-- ==============================================================================
-- SMART ROUTE PLANNER & GEOFENCING MIGRATION SCRIPT
-- Jalankan script ini di menu SQL Editor pada Supabase Dashboard Anda.
-- ==============================================================================

-- 1. Tabel Rute Peta (GPS Routes)
CREATE TABLE public.gps_routes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    color TEXT DEFAULT '#3B82F6', -- Default warna biru
    path_data JSONB NOT NULL,    -- Menyimpan array koordinat rute
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tabel Geofencing (Zona Terlarang / Peringatan)
CREATE TABLE public.gps_geofences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('danger', 'warning')), -- danger = merah, warning = kuning
    polygon_data JSONB NOT NULL, -- Menyimpan batas area polygon
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS (Row Level Security)
-- Disable RLS sementara agar selaras dengan mock-authentication (localStorage)
ALTER TABLE public.gps_routes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.gps_geofences DISABLE ROW LEVEL SECURITY;

-- Dummy Data untuk Rute Peta (Contoh Rute Teluk Banyuwangi)
INSERT INTO public.gps_routes (name, description, color, path_data) VALUES 
('Rute Aman: Pantai Boom - Pulau Santen', 'Rute yang sangat direkomendasikan untuk pemula. Ombak tenang.', '#10B981', 
'[
  [-8.204555, 114.385455],
  [-8.209876, 114.391234],
  [-8.214532, 114.393456],
  [-8.220111, 114.392111]
]'::jsonb);

-- Dummy Data untuk Zona Geofence (Contoh Area Terumbu Karang)
INSERT INTO public.gps_geofences (name, type, polygon_data) VALUES 
('Zona Karang Dangkal Pantai Boom', 'danger', 
'[[
  [-8.205111, 114.381111],
  [-8.205111, 114.383333],
  [-8.207222, 114.383333],
  [-8.207222, 114.381111],
  [-8.205111, 114.381111]
]]'::jsonb);
