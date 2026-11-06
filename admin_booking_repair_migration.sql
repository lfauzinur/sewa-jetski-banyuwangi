-- Additive migration for Basecamp, Jetski unit fields, and booking DP tracking.
-- Run once in Supabase SQL Editor before deploying the application changes.

CREATE TABLE IF NOT EXISTS public.basecamps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT,
  operating_hours TEXT DEFAULT '06:00 - 17:00 WIB',
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  maps_url TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.basecamps ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.basecamps ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.basecamps ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.basecamps ADD COLUMN IF NOT EXISTS operating_hours TEXT DEFAULT '06:00 - 17:00 WIB';
ALTER TABLE public.basecamps ADD COLUMN IF NOT EXISTS lat DOUBLE PRECISION;
ALTER TABLE public.basecamps ADD COLUMN IF NOT EXISTS lng DOUBLE PRECISION;
ALTER TABLE public.basecamps ADD COLUMN IF NOT EXISTS maps_url TEXT;
ALTER TABLE public.basecamps ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE public.basecamps ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();

DO $$
BEGIN
  IF to_regclass('public.services') IS NULL THEN
    RAISE EXCEPTION 'Tabel public.services tidak ditemukan. Buat/restore tabel services sebelum menjalankan migrasi unit.';
  END IF;
END $$;

ALTER TABLE public.services ADD COLUMN IF NOT EXISTS capacity INTEGER NOT NULL DEFAULT 2;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS engine_cc INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS top_speed TEXT DEFAULT '';
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS rating NUMERIC(3, 1) NOT NULL DEFAULT 4.5;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS reviews INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS available BOOLEAN NOT NULL DEFAULT true;

-- Add DP fields without changing existing booking rows or their statuses.
DO $$
BEGIN
  IF to_regclass('public.bookings') IS NOT NULL THEN
    ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS payment_plan TEXT;
    ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS deposit_percent INTEGER;
    ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS deposit_amount INTEGER;
    ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS amount_paid INTEGER NOT NULL DEFAULT 0;
    ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS remaining_amount INTEGER;
    ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS payment_status TEXT;
    ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS payment_method TEXT;
    ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS payment_details JSONB NOT NULL DEFAULT '[]'::jsonb;
  END IF;
END $$;
