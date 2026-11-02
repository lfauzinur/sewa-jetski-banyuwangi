import TidesPanel from '@/components/TidesPanel';

export default function AdminTidesPage() {
  return <div className="mx-auto max-w-5xl space-y-5">
    <div><p className="text-[10px] font-black tracking-[0.2em] text-[var(--cyan)]">MARINE FORECAST</p><h2 className="mt-1 text-2xl font-bold text-gray-900">Tides Banyuwangi</h2><p className="mt-1 text-sm text-gray-500">Pantau estimasi elevasi laut dan titik pasang surut untuk area operasional.</p></div>
    <TidesPanel fullPage href="/admin/tides" />
  </div>;
}
