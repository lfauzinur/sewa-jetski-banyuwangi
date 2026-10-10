-- ==============================================================================
-- ADD-ONS & LOYALTY PROGRAM MIGRATION SCRIPT
-- Jalankan script ini di menu SQL Editor pada Supabase Dashboard Anda.
-- ==============================================================================

-- 1. ADD-ONS TABLE
CREATE TABLE public.addons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price INTEGER NOT NULL DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. BOOKING ADD-ONS TABLE (Relasi Booking <-> Addons)
CREATE TABLE public.booking_addons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    addon_id UUID NOT NULL REFERENCES public.addons(id) ON DELETE CASCADE,
    price_at_booking INTEGER NOT NULL,
    quantity INTEGER DEFAULT 1 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. USER LOYALTY (Sisa Poin & Total Poin)
CREATE TABLE public.user_loyalty (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    points_balance INTEGER DEFAULT 0 NOT NULL,
    lifetime_points INTEGER DEFAULT 0 NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. LOYALTY TRANSACTIONS (Riwayat Keluar/Masuk Poin)
CREATE TABLE public.loyalty_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('earn', 'redeem')),
    amount INTEGER NOT NULL,
    description TEXT,
    booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. LOYALTY REWARDS (Master Data Hadiah/Voucher)
CREATE TABLE public.loyalty_rewards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('discount', 'duration')),
    value INTEGER NOT NULL,
    points_required INTEGER NOT NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS (Row Level Security) Policies
-- Menonaktifkan RLS sementara agar tidak bentrok dengan mock-authentication (localStorage)
ALTER TABLE public.addons DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_addons DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_loyalty DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_rewards DISABLE ROW LEVEL SECURITY;

-- Dummy Data untuk Add-ons (Contoh)
INSERT INTO public.addons (name, description, price) VALUES 
('GoPro Hero 11', 'Rekam momen seru watersport dengan kualitas 4K. Termasuk memori 64GB.', 150000),
('Insta360 X3', 'Kamera 360 derajat untuk video cinematic tanpa batas.', 250000),
('Drone DJI Mini 3 (Include Pilot)', 'Dokumentasi udara spektakuler (khusus jetski adventure).', 400000);

-- Dummy Data untuk Rewards (Contoh)
INSERT INTO public.loyalty_rewards (name, type, value, points_required) VALUES 
('Diskon Rp 50.000', 'discount', 50000, 50),
('Diskon Rp 150.000', 'discount', 150000, 130),
('Gratis Tambahan Waktu 15 Menit', 'duration', 15, 100);
