// ==============================================================================
// DYNAMIC MARITIME WEATHER & WAVE ALERT SERVICE
// Membaca koordinat GPS pengguna secara dinamis (Pantai Selatan, Selat Bali, dll.)
// Mengintegrasikan Open-Meteo Marine API & Weather API
// ==============================================================================

// Titik referensi default jika GPS belum aktif/izin belum diberikan
export const DEFAULT_COORDS = {
  lat: -8.204555,
  lng: 114.385455,
  name: 'Selat Bali (Boom Marina)'
};

const CACHE_KEY_PREFIX = 'maritime_weather_cache_';
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 Menit cache agar hemat kuota & responsif

export const WEATHER_THRESHOLDS = {
  MAX_WAVE_HEIGHT_DANGER_M: 1.5,   // > 1.5m = WEATHER_WARNING_AUTOMATIC (Danger)
  MAX_WAVE_HEIGHT_WARNING_M: 1.0,  // > 1.0m = Warning
  MAX_WIND_KNOTS_DANGER: 25.0,     // > 25 knot = Danger
  MAX_WIND_KNOTS_WARNING: 18.0     // > 18 knot = Warning
};

/**
 * Deteksi nama zona pesisir/pantai secara cerdas berdasarkan koordinat GPS
 * Membedakan Pantai Selatan (Pulau Merah/G-Land), Selat Bali, Perairan Utara (Tabuhan/Watudodol), dll.
 */
export function resolveMaritimeZoneName(lat, lng) {
  if (typeof lat !== 'number' || typeof lng !== 'number') {
    return 'Selat Bali & Perairan Banyuwangi';
  }

  // 1. ZONA PANTAI SELATAN (Samudera Hindia - Ombak Besar)
  // Wilayah selatan Banyuwangi: Pesanggaran, Purwo, Grajagan, Pulau Merah, Plengkung/G-Land, Sukamade
  if (lat <= -8.45 || (lat <= -8.35 && lng <= 114.22)) {
    if (lng <= 114.10) {
      return 'Pantai Selatan (Pulau Merah & Pancer)';
    }
    if (lng <= 114.30) {
      return 'Pantai Selatan (Grajagan & Teluk Lampon)';
    }
    return 'Pantai Selatan (G-Land Plengkung & Alas Purwo)';
  }

  // 2. ZONA PERAIRAN UTARA (Wongsorejo, Tabuhan, Bangsring)
  if (lat >= -8.12) {
    if (lat >= -8.05) {
      return 'Perairan Utara (Pulau Tabuhan & Wongsorejo)';
    }
    return 'Perairan Utara (Bangsring & Grand Watudodol)';
  }

  // 3. ZONA SELAT BALI TIMUR (Pusat Kota Banyuwangi & Ketapang)
  if (lng >= 114.35 && lat < -8.12 && lat > -8.45) {
    if (lat >= -8.17) {
      return 'Selat Bali (Pelabuhan Ketapang & Cacalan)';
    }
    if (lat >= -8.23) {
      return 'Selat Bali (Pantai Boom Marina & Kota)';
    }
    return 'Selat Bali (Pantai Sobo & Pulau Santen)';
  }

  // 4. JIKA DI AREA DARATAN BANYUWANGI
  if (lat >= -8.8 && lat <= -7.8 && lng >= 113.8 && lng <= 114.6) {
    return 'Pesisir Banyuwangi (GPS Terdeteksi)';
  }

  // 5. JIKA DIBUKA DI LUAR BANYUWANGI (e.g. Pantai Selatan Jawa / Bali / Tempat Lain)
  if (lat < -8.3) {
    return 'Pesisir Pantai Selatan (Samudera Hindia)';
  }
  return 'Perairan Pesisir Lokal (Live GPS)';
}

/**
 * Konversi WMO Weather Code ke deskripsi bahasa Indonesia
 */
export function getWeatherDescription(code) {
  const codes = {
    0: { text: 'Cerah Berawan', icon: 'sun' },
    1: { text: 'Sebagian Berawan', icon: 'cloud-sun' },
    2: { text: 'Berawan', icon: 'cloud' },
    3: { text: 'Mendung Tebal', icon: 'cloud' },
    45: { text: 'Berkabut Laut', icon: 'cloud-fog' },
    48: { text: 'Kabut Tebal', icon: 'cloud-fog' },
    51: { text: 'Gerimis Ringan', icon: 'cloud-drizzle' },
    53: { text: 'Gerimis Sedang', icon: 'cloud-drizzle' },
    55: { text: 'Gerimis Deras', icon: 'cloud-drizzle' },
    61: { text: 'Hujan Ringan', icon: 'cloud-rain' },
    63: { text: 'Hujan Sedang', icon: 'cloud-rain' },
    65: { text: 'Hujan Deras', icon: 'cloud-rain' },
    80: { text: 'Hujan Mendadak', icon: 'cloud-rain' },
    95: { text: 'Badai Petir Laut', icon: 'zap' },
    96: { text: 'Badai Petir & Hujan Es', icon: 'zap' }
  };
  return codes[code] || { text: 'Cerah Berangin', icon: 'sun' };
}

/**
 * Konversi derajat sudut angin ke arah mata angin
 */
export function getWindCompass(deg) {
  if (deg === undefined || deg === null) return 'N/A';
  const val = Math.floor((deg / 45) + 0.5);
  const arr = ['Utara', 'Timur Laut', 'Timur', 'Tenggara', 'Selatan', 'Barat Daya', 'Barat', 'Barat Laut'];
  return arr[val % 8];
}

/**
 * Mengambil data cuaca laut & gelombang terkini berdasarkan koordinat GPS dinamis
 * @param {{ lat: number, lng: number } | null} customCoords - Koordinat GPS pengguna saat ini
 * @param {boolean} forceRefresh - Paksa perbarui tanpa cache
 */
export async function getMaritimeWeather(customCoords = null, forceRefresh = false) {
  const targetLat = customCoords?.lat ? Number(customCoords.lat) : DEFAULT_COORDS.lat;
  const targetLng = customCoords?.lng ? Number(customCoords.lng) : DEFAULT_COORDS.lng;
  const isCustomGps = !!(customCoords?.lat && customCoords?.lng);

  const zoneName = resolveMaritimeZoneName(targetLat, targetLng);
  const cacheKey = `${CACHE_KEY_PREFIX}${targetLat.toFixed(2)}_${targetLng.toFixed(2)}`;

  // 1. Cek Cache LocalStorage untuk lokasi ini
  if (!forceRefresh && typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_TTL_MS) {
          return { ...data, isGpsActive: isCustomGps };
        }
      }
    } catch (e) {}
  }

  try {
    const marineUrl = `https://marine-api.open-meteo.com/v1/marine?latitude=${targetLat.toFixed(4)}&longitude=${targetLng.toFixed(4)}&current=wave_height,wave_direction,wave_period&timezone=Asia%2FJakarta`;
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${targetLat.toFixed(4)}&longitude=${targetLng.toFixed(4)}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,wind_direction_10m&timezone=Asia%2FJakarta`;

    const [marineRes, weatherRes] = await Promise.all([
      fetch(marineUrl).then(r => r.json()).catch(() => null),
      fetch(weatherUrl).then(r => r.json()).catch(() => null)
    ]);

    const marine = marineRes?.current || {};
    const weather = weatherRes?.current || {};

    // Jika di perairan laut dalam/selatan, ombak diambil dari API, jika perairan darat gunakan fallback wajar
    const waveHeight = Number((marine.wave_height !== undefined ? marine.wave_height : 0.4).toFixed(2));
    const wavePeriod = Number((marine.wave_period !== undefined ? marine.wave_period : 6.5).toFixed(1));
    const waveDirection = marine.wave_direction || 140;

    const windSpeedKmh = Number((weather.wind_speed_10m || 12).toFixed(1));
    const windKnots = Number((windSpeedKmh * 0.539957).toFixed(1));
    const windDirection = weather.wind_direction_10m || 120;
    const tempC = Number((weather.temperature_2m || 29).toFixed(1));
    const humidity = weather.relative_humidity_2m || 65;
    const weatherCode = weather.weather_code ?? 0;
    const weatherInfo = getWeatherDescription(weatherCode);

    // Evaluasi Logika Keselamatan Sesuai PRD
    let status = 'WEATHER_SAFE';
    let alertLevel = 'safe'; // 'safe' | 'warning' | 'danger'
    let alertTitle = 'Kondisi Laut Aman';
    let alertMessage = 'Ombak aman dan perairan bersahabat untuk aktivitas jetski & watersport.';
    let isEmergency = false;

    if (waveHeight >= WEATHER_THRESHOLDS.MAX_WAVE_HEIGHT_DANGER_M || windKnots >= WEATHER_THRESHOLDS.MAX_WIND_KNOTS_DANGER) {
      status = 'WEATHER_WARNING_AUTOMATIC';
      alertLevel = 'danger';
      isEmergency = true;
      alertTitle = 'PERINGATAN GELOMBANG TINGGI!';
      alertMessage = `Tinggi ombak ${waveHeight}m (Batas aman: 1.5m) atau angin ${windKnots} knot. Hindari melaut ke tengah!`;
    } else if (waveHeight >= WEATHER_THRESHOLDS.MAX_WAVE_HEIGHT_WARNING_M || windKnots >= WEATHER_THRESHOLDS.MAX_WIND_KNOTS_WARNING) {
      status = 'WEATHER_ADVISORY';
      alertLevel = 'warning';
      alertTitle = 'Waspada Gelombang Sedang';
      alertMessage = `Tinggi ombak ${waveHeight}m dan angin ${windKnots} knot. Tetap dekat garis pantai aman.`;
    }

    const result = {
      location: zoneName,
      coords: { lat: targetLat, lng: targetLng },
      isGpsActive: isCustomGps,
      waveHeight,
      wavePeriod,
      waveDirection,
      windSpeedKmh,
      windKnots,
      windDirection,
      windCompass: getWindCompass(windDirection),
      temperature: tempC,
      humidity,
      weatherCode,
      weatherDescription: weatherInfo.text,
      weatherIcon: weatherInfo.icon,
      status,
      alertLevel,
      alertTitle,
      alertMessage,
      isEmergency,
      lastUpdated: new Date().toISOString()
    };

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(cacheKey, JSON.stringify({
          data: result,
          timestamp: Date.now()
        }));
      } catch (e) {}
    }

    return result;
  } catch (err) {
    console.error('Error fetching marine weather:', err);
    return getFallbackMaritimeWeather(targetLat, targetLng, isCustomGps);
  }
}

/**
 * Fallback jika offline atau gagal koneksi
 */
export function getFallbackMaritimeWeather(lat = -8.204555, lng = 114.385455, isCustomGps = false) {
  const isSouth = lat <= -8.45;
  return {
    location: resolveMaritimeZoneName(lat, lng),
    coords: { lat, lng },
    isGpsActive: isCustomGps,
    waveHeight: isSouth ? 1.8 : 0.45,
    wavePeriod: isSouth ? 12.0 : 6.2,
    waveDirection: 140,
    windSpeedKmh: 13.5,
    windKnots: 7.3,
    windDirection: 130,
    windCompass: 'Tenggara',
    temperature: 29.5,
    humidity: 68,
    weatherCode: 0,
    weatherDescription: 'Cerah Berawan',
    weatherIcon: 'sun',
    status: isSouth ? 'WEATHER_WARNING_AUTOMATIC' : 'WEATHER_SAFE',
    alertLevel: isSouth ? 'danger' : 'safe',
    alertTitle: isSouth ? 'Ombak Kuat Samudera Hindia' : 'Kondisi Laut Tenang',
    alertMessage: isSouth ? 'Gelombang tinggi pantai selatan.' : 'Aman untuk aktivitas perairan.',
    isEmergency: isSouth,
    lastUpdated: new Date().toISOString()
  };
}
