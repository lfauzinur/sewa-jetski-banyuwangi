'use client';
import { useRouter } from 'next/navigation';
import { ChevronLeft, CreditCard, Building2, QrCode, Plus, Lightbulb } from 'lucide-react';

const paymentMethods = [
  { id: 1, type: 'bank', name: 'BRI', number: '•••• •••• •••• 4521', icon: <Building2 size={20} /> },
  { id: 2, type: 'qris', name: 'QRIS', number: 'Scan QR untuk bayar', icon: <QrCode size={20} /> },
];

export default function PaymentMethodsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white pb-10">
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md pt-10 pb-4 px-6 flex items-center justify-between">
        <button onClick={() => router.back()} className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-[var(--royal)]">
          <ChevronLeft size={24} />
        </button>
        <h1 className="font-bold text-gray-900 text-lg">Payment Methods</h1>
        <div className="w-10" />
      </div>

      <div className="px-6 mt-6 space-y-4">
        {paymentMethods.map((method) => (
          <div key={method.id} className="bg-[#F8FAFC] rounded-[20px] p-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-[#F0F5FF] rounded-2xl flex items-center justify-center text-[var(--royal)]">
              {method.icon}
            </div>
            <div className="flex-1">
              <p className="font-bold text-gray-900 text-sm">{method.name}</p>
              <p className="text-xs text-gray-500">{method.number}</p>
            </div>
            <div className="w-3 h-3 rounded-full bg-emerald-400 border-2 border-emerald-200" />
          </div>
        ))}

        {/* Add New */}
        <button className="w-full border-2 border-dashed border-gray-200 rounded-[20px] p-5 flex items-center justify-center gap-3 text-gray-400 hover:border-[var(--royal)] hover:text-[var(--royal)] transition-colors">
          <Plus size={20} />
          <span className="font-semibold text-sm">Tambah Metode Pembayaran</span>
        </button>
      </div>

      <div className="px-6 mt-8">
        <div className="bg-amber-50 rounded-[20px] p-5">
          <h3 className="font-bold text-amber-800 text-sm mb-1 flex items-center gap-1.5"><Lightbulb size={14} /> Info Pembayaran</h3>
          <p className="text-xs text-amber-700 leading-relaxed">
            Kami menerima pembayaran via Transfer Bank (BRI, BCA, Mandiri) dan QRIS. 
            Setiap transaksi akan mendapat kode unik untuk mempermudah verifikasi.
          </p>
        </div>
      </div>
    </div>
  );
}
