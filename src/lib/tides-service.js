export const DEFAULT_TIDE_COORDS = {
  lat: -8.204555,
  lng: 114.385455,
  name: 'Selat Bali (Boom Marina)',
};

const CACHE_PREFIX = 'tide_forecast_';
const CACHE_TTL_MS = 15 * 60 * 1000;

function findTurningPoints(points) {
  const turns = [];
  for (let i = 1; i < points.length - 1; i += 1) {
    const before = points[i - 1].height;
    const current = points[i].height;
    const after = points[i + 1].height;
    const type = current > before && current >= after
      ? 'high'
      : current < before && current <= after
        ? 'low'
        : null;

    if (type) turns.push({ ...points[i], type });
  }
  return turns;
}

function toJakartaTimestamp(time) {
  return new Date(`${time}+07:00`).getTime();
}

export async function getTideForecast(coords = DEFAULT_TIDE_COORDS, forceRefresh = false) {
  const lat = Number(coords?.lat);
  const lng = Number(coords?.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) throw new Error('Koordinat lokasi tidak valid.');

  const cacheKey = `${CACHE_PREFIX}${lat.toFixed(2)}_${lng.toFixed(2)}`;
  if (!forceRefresh && typeof window !== 'undefined') {
    try {
      const cached = JSON.parse(localStorage.getItem(cacheKey) || 'null');
      if (cached?.data && Date.now() - cached.timestamp < CACHE_TTL_MS) return cached.data;
    } catch {}
  }

  const query = new URLSearchParams({
    latitude: lat.toFixed(4),
    longitude: lng.toFixed(4),
    hourly: 'sea_level_height_msl',
    forecast_days: '3',
    timezone: 'Asia/Jakarta',
  });
  const response = await fetch(`https://marine-api.open-meteo.com/v1/marine?${query}`);
  if (!response.ok) throw new Error('Prakiraan pasang belum tersedia saat ini.');
  const payload = await response.json();
  const times = payload.hourly?.time || [];
  const heights = payload.hourly?.sea_level_height_msl || [];
  const points = times.map((time, index) => ({
    time,
    height: heights[index] == null ? null : Number(heights[index]),
  })).filter((point) => Number.isFinite(point.height));

  if (points.length < 3) throw new Error('Data elevasi laut belum tersedia untuk lokasi ini.');

  const now = Date.now();
  const upcoming = points.filter((point) => toJakartaTimestamp(point.time) >= now);
  const events = findTurningPoints(points)
    .filter((point) => toJakartaTimestamp(point.time) >= now)
    .slice(0, 6);
  const result = {
    coords: { lat, lng },
    location: coords?.name || 'Lokasi terpilih',
    points: upcoming.slice(0, 25),
    events,
    current: upcoming[0] || points.at(-1),
    fetchedAt: new Date().toISOString(),
  };

  if (typeof window !== 'undefined') {
    try { localStorage.setItem(cacheKey, JSON.stringify({ data: result, timestamp: Date.now() })); } catch {}
  }
  return result;
}
