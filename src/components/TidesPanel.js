'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AlertTriangle, ArrowDown, ArrowUp, Clock3, MapPin, RefreshCw, Waves } from 'lucide-react';
import { DEFAULT_TIDE_COORDS, getTideForecast } from '@/lib/tides-service';

function formatTime(value, options = {}) {
  return new Date(value).toLocaleTimeString('id-ID', { timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit', ...options });
}

function TideEvent({ event }) {
  const isHigh = event.type === 'high';
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-3 py-3">
      <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${isHigh ? 'bg-cyan-100 text-cyan-700' : 'bg-blue-100 text-blue-700'}`}>
        {isHigh ? <ArrowUp size={18} /> : <ArrowDown size={18} />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-extrabold text-gray-800">{isHigh ? 'Pasang' : 'Surut'}</p>
        <p className="text-[11px] text-gray-500">{formatTime(event.time)} WIB</p>
      </div>
      <p className="font-mono text-sm font-black text-gray-900">{event.height.toFixed(2)} m</p>
    </div>
  );
}

export default function TidesPanel({ compact = false, fullPage = false, embedded = false, initialCoords = DEFAULT_TIDE_COORDS, href = '/member/tides', allowGps = true }) {
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [coords, setCoords] = useState(initialCoords);
  const [usingGps, setUsingGps] = useState(false);

  const load = useCallback(async (location = coords, refresh = false) => {
    setLoading(true);
    setError('');
    try {
      const data = await getTideForecast(location, refresh);
      setForecast(data);
      setCoords(location);
    } catch (err) {
      setError(err.message || 'Data pasang surut gagal dimuat.');
    } finally {
      setLoading(false);
    }
  }, [coords]);

  useEffect(() => {
    let isCurrent = true;
    const fetchInitialForecast = async () => {
      try {
        const data = await getTideForecast(initialCoords);
        if (!isCurrent) return;
        setForecast(data);
        setCoords(initialCoords);
        setError('');
      } catch (err) {
        if (isCurrent) setError(err.message || 'Data pasang surut gagal dimuat.');
      } finally {
        if (isCurrent) setLoading(false);
      }
    };

    fetchInitialForecast();
    return () => { isCurrent = false; };
    // Coordinates define the request; the location label does not affect its result.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCoords?.lat, initialCoords?.lng]);

  const chartData = useMemo(() => (forecast?.points || []).map((point) => ({
    ...point,
    label: formatTime(point.time),
  })), [forecast]);
  const nextHigh = forecast?.events?.find((event) => event.type === 'high');
  const nextLow = forecast?.events?.find((event) => event.type === 'low');

  const detectGps = () => {
    if (!navigator.geolocation) return;
    setUsingGps(true);
    navigator.geolocation.getCurrentPosition((position) => {
      setUsingGps(false);
      load({ lat: position.coords.latitude, lng: position.coords.longitude, name: 'Lokasi GPS' }, true);
    }, () => {
      setUsingGps(false);
      setError('Lokasi GPS tidak dapat diakses. Menampilkan lokasi Boom Marina.');
    }, { enableHighAccuracy: true, timeout: 7000, maximumAge: 30000 });
  };

  return (
    <section className={embedded ? '' : `rounded-[24px] border border-gray-100 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.06)] ${compact ? 'p-4' : 'p-5 sm:p-6'}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          {!embedded && <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-50 text-[var(--royal)]"><Waves size={22} /></div>}
          <div className="min-w-0">
            <p className="text-[10px] font-black tracking-[0.18em] text-[var(--cyan)]">{embedded ? 'TIDES · ESTIMASI' : 'TIDES'}</p>
            <h2 className="truncate text-base font-extrabold text-gray-900">Pasang Surut</h2>
            {!embedded && <p className="mt-0.5 flex items-center gap-1 truncate text-[11px] text-gray-500"><MapPin size={11} />{forecast?.location || initialCoords?.name || DEFAULT_TIDE_COORDS.name}</p>}
          </div>
        </div>
        <button type="button" onClick={() => load(coords, true)} disabled={loading} aria-label="Muat ulang data pasang surut" className="rounded-xl p-2 text-gray-400 hover:bg-gray-50 hover:text-[var(--royal)] disabled:opacity-50">
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {allowGps && !compact && (
        <button type="button" onClick={detectGps} disabled={usingGps} className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-[var(--royal)]">
          <MapPin size={13} />{usingGps ? 'Mencari lokasi…' : 'Gunakan lokasi GPS'}
        </button>
      )}

      {error && <div className="mt-4 rounded-xl bg-amber-50 p-3 text-xs font-medium text-amber-800">{error}</div>}
      {loading && !forecast ? (
        <div className="mt-5 h-28 animate-pulse rounded-2xl bg-slate-50" />
      ) : forecast ? (
        <>
          <div className={`mt-4 grid gap-2 ${compact ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-2'}`}>
            {[{ title: 'Pasang berikutnya', event: nextHigh, type: 'high' }, { title: 'Surut berikutnya', event: nextLow, type: 'low' }].map(({ title, event, type }) => (
              <div key={type} className="rounded-2xl border border-gray-100 p-3">
                <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">{title}</p>
                {event ? <div className="mt-1 flex items-end justify-between gap-1"><span className="text-lg font-black text-gray-900">{formatTime(event.time)}<small className="ml-1 text-[10px] font-bold text-gray-400">WIB</small></span><span className="font-mono text-xs font-bold text-[var(--royal)]">{event.height.toFixed(2)} m</span></div> : <p className="mt-2 text-xs text-gray-500">Belum tersedia</p>}
              </div>
            ))}
          </div>

          {!compact && (
            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between"><p className="text-sm font-extrabold text-gray-800">Elevasi muka laut · 24 jam</p><span className="text-[10px] text-gray-400">meter MSL</span></div>
              <div className="h-52 w-full">
                {chartData.length ? <ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                  <defs><linearGradient id="tideFill" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#0891b2" stopOpacity={0.25} /><stop offset="95%" stopColor="#0891b2" stopOpacity={0.02} /></linearGradient></defs>
                  <CartesianGrid stroke="#eef2f7" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="label" interval={3} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(value) => `${value.toFixed(1)}m`} />
                  <Tooltip labelFormatter={(label) => `${label} WIB`} formatter={(value) => [`${Number(value).toFixed(2)} m`, 'Elevasi']} contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
                  <Area type="monotone" dataKey="height" stroke="#0891b2" strokeWidth={2.5} fill="url(#tideFill)" connectNulls />
                </AreaChart></ResponsiveContainer> : <div className="flex h-full items-center justify-center text-xs text-gray-400">Grafik belum tersedia untuk koordinat ini.</div>}
              </div>
            </div>
          )}

          {!compact && <div className="mt-4 space-y-2">
            <p className="flex items-center gap-1.5 text-xs font-extrabold text-gray-700"><Clock3 size={14} className="text-[var(--royal)]" />Perkiraan titik pasang dan surut</p>
            {forecast.events.length ? forecast.events.slice(0, 4).map((event) => <TideEvent key={`${event.type}-${event.time}`} event={event} />) : <p className="rounded-xl bg-slate-50 p-3 text-xs text-gray-500">Belum ada titik pasang/surut pada rentang prakiraan.</p>}
          </div>}

          {!embedded && <div className="mt-4 flex gap-2 rounded-xl border border-amber-100 bg-amber-50 p-3 text-[10px] leading-relaxed text-amber-900">
            <AlertTriangle size={15} className="mt-0.5 shrink-0" />
            <span>Estimasi Open-Meteo untuk informasi umum. Akurasi di pesisir terbatas; jangan gunakan sebagai acuan navigasi atau keselamatan.</span>
          </div>}
        </>
      ) : null}

      {compact && <Link href={href} className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3 text-xs font-extrabold text-[var(--royal)]">
        <span>{embedded ? 'Lihat grafik pasang surut' : 'Lihat grafik dan prakiraan lengkap'}</span><span aria-hidden="true">→</span>
      </Link>}
      <p className={`mt-2 text-[10px] text-gray-400 ${embedded ? 'text-right' : ''}`}>{embedded ? 'Sumber pasang: ' : 'Sumber: '}<a href="https://open-meteo.com/en/docs/marine-weather-api" target="_blank" rel="noreferrer" className="underline">Open-Meteo Marine API</a>{fullPage && <> · Diperbarui {forecast?.fetchedAt ? new Date(forecast.fetchedAt).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'} WIB</>}</p>
    </section>
  );
}
