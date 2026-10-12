-- ==============================================================================
-- WEATHER ALERT SYSTEM & EMERGENCY OVERRIDE MIGRATION SCRIPT
-- Sesuai PRD Section 3.2: Digital Weather & Wave Condition Alert System
-- & Section 3.1: SOS / Emergency Button Dispatch
-- ==============================================================================

-- 1. Tabel Emergency Broadcast & Weather Alerts (Admin Manual Override & Automatic Trigger)
CREATE TABLE IF NOT EXISTS public.emergency_alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type TEXT NOT NULL DEFAULT 'admin_override', -- 'weather_automatic', 'admin_override', 'evacuation'
    severity TEXT NOT NULL DEFAULT 'danger',     -- 'warning', 'danger', 'critical'
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    active BOOLEAN DEFAULT true,
    created_by TEXT DEFAULT 'Beach Marshal Admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tabel Sinyal SOS Darurat Pengendara
CREATE TABLE IF NOT EXISTS public.sos_signals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    status TEXT NOT NULL DEFAULT 'active', -- 'active', 'responding', 'resolved'
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- 3. Tambahkan kolom status pada tabel live_locations (jika belum ada)
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'live_locations' AND column_name = 'status'
    ) THEN 
        ALTER TABLE public.live_locations ADD COLUMN status TEXT DEFAULT 'normal';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'live_locations' AND column_name = 'route_id'
    ) THEN 
        ALTER TABLE public.live_locations ADD COLUMN route_id TEXT;
    END IF;
END $$;

-- Disable RLS sementara agar tersinkronisasi mulus dengan client side
ALTER TABLE public.emergency_alerts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.sos_signals DISABLE ROW LEVEL SECURITY;
