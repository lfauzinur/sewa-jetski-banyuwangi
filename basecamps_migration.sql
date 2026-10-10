-- ==============================================================================
-- BASECAMPS MIGRATION SCRIPT
-- Jalankan script ini di menu SQL Editor pada Supabase Dashboard Anda.
-- ==============================================================================

CREATE TABLE public.basecamps (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    phone TEXT,
    operating_hours TEXT DEFAULT '06:00 - 17:00 WIB',
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    maps_url TEXT,          -- Link Google Maps lengkap
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS (Disable sementara untuk MVP mock-auth)
ALTER TABLE public.basecamps DISABLE ROW LEVEL SECURITY;

-- Data Awal: Dua lokasi basecamp
INSERT INTO public.basecamps (name, address, phone, operating_hours, lat, lng, maps_url) VALUES 
(
  'Pantai Boom Marina',
  'Jl. Raden Wijaya, Area Sawah/Kebun, Kertosari, Kec. Banyuwangi, Kabupaten Banyuwangi, Jawa Timur 68416',
  '+62 812-3456-7890',
  'Setiap Hari: 06:00 - 17:00 WIB',
  -8.2121849, 114.3803574,
  'https://maps.google.com/?q=Pantai+Boom+Banyuwangi'
),
(
  'Pantai Bengkak Wongsorejo',
  'Dusun Krajan, Bengkak, Kec. Wongsorejo, Kabupaten Banyuwangi, Jawa Timur 68453',
  '+62 812-3456-7890',
  'Setiap Hari: 07:00 - 16:00 WIB',
  -8.0917, 114.3667,
  'https://maps.google.com/?q=Pantai+Bengkak+Wongsorejo+Banyuwangi'
);
