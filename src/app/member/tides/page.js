import TidesPanel from '@/components/TidesPanel';

export default function MemberTidesPage() {
  return <div className="min-h-screen bg-[#F5F8FF] px-5 py-7 pb-24 font-sans">
    <div className="mx-auto max-w-2xl">
      <p className="mb-1 text-[10px] font-black tracking-[0.2em] text-[var(--cyan)]">MARINE FORECAST</p>
      <h1 className="mb-5 text-2xl font-black text-gray-900">Tides Banyuwangi</h1>
      <TidesPanel fullPage />
    </div>
  </div>;
}
