-- ==============================================================================
-- LIVE TRACKING (ADMIN DASHBOARD) MIGRATION SCRIPT
-- ==============================================================================

CREATE TABLE public.live_locations (
    user_id UUID PRIMARY KEY, -- Menggunakan ID user sebagai kunci (1 user = 1 posisi terkini)
    user_name TEXT,
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    heading DOUBLE PRECISION,     -- Arah hadap jetski
    speed DOUBLE PRECISION,       -- Kecepatan (m/s)
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS (Disable sementara untuk MVP mock-auth)
ALTER TABLE public.live_locations DISABLE ROW LEVEL SECURITY;

-- Dummy Data untuk mengetes Live Tracking Admin (contoh jetski yang sedang beroperasi)
INSERT INTO public.live_locations (user_id, user_name, lat, lng, last_updated) VALUES 
('11111111-1111-1111-1111-111111111111', 'John (Jetski 1)', -8.204555, 114.385455, now()),
('22222222-2222-2222-2222-222222222222', 'Doe (Jetski 2)', -8.208111, 114.389111, now());
