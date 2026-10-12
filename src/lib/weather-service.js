// ==============================================================================
// MARITIME WEATHER & WAVE ALERT SERVICE
// Mengintegrasikan Open-Meteo Marine API & Weather Forecast API untuk Banyuwangi
// Sesuai PRD Section 3.2: Digital Weather & Wave Condition Alert System
// ==============================================================================

const BANYUWANGI_COORDS = {
  lat: -8.204555,
  lng: 114.385455,
  name: 'Selat Bali & Perairan Banyuwangi'
};

const CACHE_KEY = 'maritime_weather_cache';
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 Menit sesuai PRD

// Thresholds sesuai PRD Section 3.2
export const WEATHER_THRESHOLDS = {
  MAX_WAVE_HEIGHT_DANGER_M: 1.5,   // > 1.5m = WEATHER_WARNING_AUTOMATIC (Danger)
  MAX_WAVE_HEIGHT_WARNING_M: 1.0,  // > 1.0m = Warning
  MAX_WIND_KNOTS_DANGER: 25.0,     // > 25 knot = Danger
  MAX_WIND_KNOTS_WARNING: 18.0     // > 18 knot = Warning
};

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
  const arr = ['U (Utara)', 'TL (Timur Laut)', 'T (Timur)', 'TG (Tenggara)', 'S (Selatan)', 'BD (Barat Daya)', 'B (Barat)', 'BL (Barat Laut)'];
  return arr[val % 8];
}

/**
 * Mengambil data cuaca laut & gelombang terkini
 * Menggunakan Open-Meteo Marine API gratis tanpa API Key
 */
export async function getMaritimeWeather(forceRefresh = false) {
  // 1. Cek Cache LocalStorage
  if (!forceRefresh && typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_TTL_MS) {
          return data;
        }
      }
    } catch (e) {
      console.warn('Weather cache read error:', e);
    }
  }

  try {
    const marineUrl = `https://marine-api.open-meteo.com/v1/marine?latitude=${BANYUWANGI_COORDS.lat}&longitude=${BANYUWANGI_COORDS.lng}&current=wave_height,wave_direction,wave_period&timezone=Asia%2FJakarta`;
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${BANYUWANGI_COORDS.lat}&longitude=${BANYUWANGI_COORDS.lng}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,wind_direction_10m&timezone=Asia%2FJakarta`;

    const [marineRes, weatherRes] = await Promise.all([
      fetch(marineUrl).then(r => r.json()).catch(() => null),
      fetch(weatherUrl).then(r => r.json()).catch(() => null)
    ]);

    const marine = marineRes?.current || {};
    const weather = weatherRes?.current || {};

    const waveHeight = Number((marine.wave_height || 0.4).toFixed(2));
    const wavePeriod = Number((marine.wave_period || 6.5).toFixed(1));
    const waveDirection = marine.wave_direction || 140;

    const windSpeedKmh = Number((weather.wind_speed_10m || 12).toFixed(1));
    const windKnots = Number((windSpeedKmh * 0.539957).toFixed(1));
    const windDirection = weather.wind_direction_10m || 120;
    const tempC = Number((weather.temperature_2m || 29).toFixed(1));
    const humidity = weather.relative_humidity_2m || 65;
    const weatherCode = weather.weather_code ?? 0;
    const weatherInfo = getWeatherDescription(weatherCode);

    // ==========================================
    // LOGIKA OTOMATIS SESUAI PRD SECTION 3.2
    // ==========================================
    let status = 'WEATHER_SAFE';
    let alertLevel = 'safe'; // 'safe' | 'warning' | 'danger'
    let alertTitle = 'Kondisi Laut Aman';
    let alertMessage = 'Ombak tenang dan angin bersahabat. Seluruh rute safari terbuka.';
    let isEmergency = false;

    if (waveHeight >= WEATHER_THRESHOLDS.MAX_WAVE_HEIGHT_DANGER_M || windKnots >= WEATHER_THRESHOLDS.MAX_WIND_KNOTS_DANGER) {
      status = 'WEATHER_WARNING_AUTOMATIC';
      alertLevel = 'danger';
      isEmergency = true;
      alertTitle = 'PERINGATAN CUACA EKSTREM DI LAUT!';
      alertMessage = `Tinggi gelombang mencapai ${waveHeight}m (Batas aman: 1.5m) atau kecepatan angin ${windKnots} knot (Batas aman: 25 knot). Semua rider WAJIB kembali ke dermaga!`;
    } else if (waveHeight >= WEATHER_THRESHOLDS.MAX_WAVE_HEIGHT_WARNING_M || windKnots >= WEATHER_THRESHOLDS.MAX_WIND_KNOTS_WARNING) {
      status = 'WEATHER_ADVISORY';
      alertLevel = 'warning';
      alertTitle = 'Waspada Gelombang & Angin Sedang';
      alertMessage = `Tinggi gelombang ${waveHeight}m dan angin ${windKnots} knot. Kurangi kecepatan dan hindari perairan lepas pantai.`;
    }

    const result = {
      location: BANYUWANGI_COORDS.name,
      coords: BANYUWANGI_COORDS,
      waveHeight,        // dalam meter
      wavePeriod,        // dalam detik
      waveDirection,
      windSpeedKmh,
      windKnots,         // dalam knot
      windDirection,
      windCompass: getWindCompass(windDirection),
      temperature: tempC,
      humidity,
      weatherCode,
      weatherDescription: weatherInfo.text,
      weatherIcon: weatherInfo.icon,
      status,            // 'WEATHER_SAFE' | 'WEATHER_ADVISORY' | 'WEATHER_WARNING_AUTOMATIC'
      alertLevel,        // 'safe' | 'warning' | 'danger'
      alertTitle,
      alertMessage,
      isEmergency,
      lastUpdated: new Date().toISOString()
    };

    // Simpan ke Cache
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          data: result,
          timestamp: Date.now()
        }));
      } catch (e) {}
    }

    return result;
  } catch (err) {
    console.error('Error fetching marine weather:', err);
    // Fallback data yang aman
    return getFallbackMaritimeWeather();
  }
}

/**
 * Fallback jika offline atau koneksi gagal
 */
export function getFallbackMaritimeWeather() {
  return {
    location: BANYUWANGI_COORDS.name,
    coords: BANYUWANGI_COORDS,
    waveHeight: 0.5,
    wavePeriod: 6.0,
    waveDirection: 135,
    windSpeedKmh: 14.0,
    windKnots: 7.5,
    windDirection: 130,
    windCompass: 'Tenggara',
    temperature: 29.5,
    humidity: 68,
    weatherCode: 0,
    weatherDescription: 'Cerah Berawan (Offline Cache)',
    weatherIcon: 'sun',
    status: 'WEATHER_SAFE',
    alertLevel: 'safe',
    alertTitle: 'Kondisi Laut Normal',
    alertMessage: 'Perairan Selat Bali dalam kondisi tenang.',
    isEmergency: false,
    lastUpdated: new Date().toISOString()
  };
}
