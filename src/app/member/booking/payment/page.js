'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Wallet, Building2, QrCode, Copy, CheckCircle2, ChevronRight, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/data';
import { getUserLoyalty, getLoyaltyRewards, redeemLoyaltyPoints, addLoyaltyPoints } from '@/lib/supabase-data';

function PaymentContent() {
  const router = useRouter();
  const [booking, setBooking] = useState(null);
  const [method, setMethod] = useState('transfer'); // 'transfer' or 'qris'
  const [copied, setCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loyalty, setLoyalty] = useState({ points_balance: 0 });
  const [rewards, setRewards] = useState([]);
  const [selectedReward, setSelectedReward] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const checkoutData = localStorage.getItem('current_checkout');
    if (!checkoutData) {
      router.push('/member');
      return;
    }
    setBooking(JSON.parse(checkoutData));

    const loadLoyalty = async () => {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user && user.id) {
        setCurrentUser(user);
        const l = await getUserLoyalty(user.id);
        if (l) setLoyalty(l);
      }
      const r = await getLoyaltyRewards();
      setRewards(r);
    };
    loadLoyalty();
  }, [router]);

  if (!booking) return null;

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirmPayment = async () => {
    setIsProcessing(true);
    
    // Process reward redemption if selected
    let rewardApplied = null;
    if (selectedReward && currentUser) {
      const r = rewards.find(rw => rw.id === selectedReward);
      if (r) {
        rewardApplied = r;
        await redeemLoyaltyPoints(currentUser.id, r.points_required, `Redeem: ${r.name}`, booking.id);
      }
    }

    // Process earning points (e.g. 1 point for every Rp 50,000 spent)
    if (currentUser) {
      const earnPoints = Math.floor(finalPrice / 50000);
      if (earnPoints > 0) {
        await addLoyaltyPoints(currentUser.id, earnPoints, `Earn points from booking ${booking.unit}`, booking.id);
      }
    }

    setTimeout(() => {
      // Move from checkout to bookings
      const existing = JSON.parse(localStorage.getItem('admin_bookings') || '[]');
      const finalBooking = { 
        ...booking, 
        totalPrice: finalPrice,
        reward_applied: rewardApplied ? rewardApplied.name : null,
        status: 'waiting_confirmation' 
      };
      localStorage.setItem('admin_bookings', JSON.stringify([finalBooking, ...existing]));
      localStorage.removeItem('current_checkout');
      
      router.push(`/member/booking/success?id=${booking.id}`);
    }, 1500);
  };

  const getActiveReward = () => {
    if (!selectedReward) return null;
    return rewards.find(r => r.id === selectedReward);
  };

  const activeReward = getActiveReward();
  const discountAmount = activeReward && activeReward.type === 'discount' ? activeReward.value : 0;
  const finalPrice = Math.max(0, booking.totalPrice - discountAmount);

  return (
    <div className="bg-gray-50 min-h-screen pb-24">
      {/* Header */}
      <div className="bg-white px-5 pt-6 pb-4 flex items-center gap-4 shadow-sm relative z-10">
        <button onClick={() => router.back()} className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-700 hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-extrabold text-gray-900 text-lg">Pembayaran</h1>
      </div>

      <div className="p-5 space-y-6">
        
        {/* Total Highlight */}
        <div className="bg-white rounded-[24px] p-6 shadow-sm text-center border border-gray-100">
          <p className="text-gray-500 text-sm font-semibold mb-2">Total Pembayaran</p>
          <h2 className="text-4xl font-black text-[var(--royal)] mb-2 tracking-tight">
            Rp {finalPrice.toLocaleString('id-ID')}
          </h2>
          <div className="inline-flex flex-col gap-2 items-center text-left">
            <div className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-600 px-3 py-1.5 rounded-lg text-xs font-bold">
              <AlertCircle size={14} />
              Termasuk kode unik *{booking.uniqueCode} untuk verifikasi
            </div>
            {discountAmount > 0 && (
              <div className="text-emerald-500 text-sm font-bold mt-1">
                - Rp {discountAmount.toLocaleString('id-ID')} (Diskon Poin)
              </div>
            )}
            {activeReward && activeReward.type === 'duration' && (
              <div className="text-emerald-500 text-sm font-bold mt-1">
                + Tambahan waktu {activeReward.value} Menit
              </div>
            )}
          </div>

          {/* Rincian Singkat Unit & Add-ons */}
          <div className="mt-4 pt-3 border-t border-gray-100 text-left text-xs space-y-1.5">
            <div className="flex justify-between font-semibold text-gray-800">
              <span>{booking.unit} ({booking.timeSlot})</span>
              <span>Rp {(booking.basePrice || 0).toLocaleString('id-ID')}</span>
            </div>
            {booking.addons && booking.addons.length > 0 && (
              <div className="space-y-1 pt-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Add-ons Tambahan:</p>
                {booking.addons.map((ad, idx) => (
                  <div key={idx} className="flex justify-between text-gray-600 pl-2">
                    <span>+ {ad.name}</span>
                    <span className="font-medium text-amber-600">+Rp {Number(ad.price).toLocaleString('id-ID')}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Loyalty Reward Selection */}
        {currentUser && rewards.length > 0 && (
          <div>
            <h3 className="font-bold text-gray-900 text-base mb-3 px-1 flex justify-between items-center">
              <span>JetPass Poin Anda</span>
              <span className="text-amber-500">{loyalty.points_balance} Poin</span>
            </h3>
            <div className="bg-white rounded-[20px] p-4 shadow-sm border border-gray-100">
              <p className="text-xs text-gray-500 mb-3">Tukarkan poin Anda dengan hadiah atau diskon tambahan.</p>
              <select
                value={selectedReward}
                onChange={(e) => setSelectedReward(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[var(--royal)] outline-none"
              >
                <option value="">Pilih hadiah untuk ditukar (Opsional)</option>
                {rewards.map(r => (
                  <option 
                    key={r.id} 
                    value={r.id} 
                    disabled={loyalty.points_balance < r.points_required}
                  >
                    {r.name} ({r.points_required} Poin)
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Payment Methods */}
        <div>
          <h3 className="font-bold text-gray-900 text-base mb-3 px-1">Pilih Metode</h3>
          <div className="space-y-3">
            <button 
              onClick={() => setMethod('transfer')}
              className={`w-full bg-white rounded-2xl p-4 flex items-center gap-4 border-2 transition-all ${method === 'transfer' ? 'border-[var(--royal)] shadow-[var(--shadow-royal)]' : 'border-gray-100 shadow-sm'}`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${method === 'transfer' ? 'bg-[var(--royal)] text-white' : 'bg-blue-50 text-[var(--royal)]'}`}>
                <Building2 size={24} />
              </div>
              <div className="text-left flex-1">
                <h4 className="font-bold text-gray-900 text-base">Transfer Bank</h4>
                <p className="text-xs text-gray-500 mt-0.5">BCA, Mandiri, BNI, BRI</p>
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${method === 'transfer' ? 'border-[var(--royal)]' : 'border-gray-300'}`}>
                {method === 'transfer' && <div className="w-3 h-3 rounded-full bg-[var(--royal)]" />}
              </div>
            </button>

            <button 
              onClick={() => setMethod('qris')}
              className={`w-full bg-white rounded-2xl p-4 flex items-center gap-4 border-2 transition-all ${method === 'qris' ? 'border-[var(--royal)] shadow-[var(--shadow-royal)]' : 'border-gray-100 shadow-sm'}`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${method === 'qris' ? 'bg-[var(--royal)] text-white' : 'bg-blue-50 text-[var(--royal)]'}`}>
                <QrCode size={24} />
              </div>
              <div className="text-left flex-1">
                <h4 className="font-bold text-gray-900 text-base">QRIS</h4>
                <p className="text-xs text-gray-500 mt-0.5">Gopay, OVO, Dana, LinkAja</p>
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${method === 'qris' ? 'border-[var(--royal)]' : 'border-gray-300'}`}>
                {method === 'qris' && <div className="w-3 h-3 rounded-full bg-[var(--royal)]" />}
              </div>
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-[24px] p-5 border border-gray-100 shadow-sm">
          {method === 'transfer' ? (
            <div>
              <h3 className="font-bold text-gray-900 text-sm mb-4">Instruksi Transfer</h3>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex items-center justify-between mb-4">
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide mb-1">Bank BCA</p>
                  <p className="font-mono font-bold text-gray-900 text-lg">8930 1234 5678</p>
                  <p className="text-xs text-gray-500 mt-0.5">a.n. PT Sewa Jetski BWI</p>
                </div>
                <button 
                  onClick={() => handleCopy('893012345678')}
                  className="bg-white p-2.5 rounded-lg shadow-sm border border-gray-200 text-gray-600 hover:text-[var(--royal)] transition-colors"
                >
                  {copied ? <CheckCircle2 size={20} className="text-emerald-500" /> : <Copy size={20} />}
                </button>
              </div>
              <ul className="text-xs text-gray-500 space-y-2 list-disc pl-4">
                <li>Pastikan nominal transfer <strong className="text-gray-900">tepat hingga 3 digit terakhir</strong>.</li>
                <li>Transfer dari bank lain mungkin dikenakan biaya admin.</li>
                <li>Simpan bukti transfer Anda.</li>
              </ul>
            </div>
          ) : (
            <div className="text-center">
              <h3 className="font-bold text-gray-900 text-sm mb-4">Scan QR Code</h3>
              <div className="bg-white w-48 h-48 mx-auto rounded-xl p-2 border-2 border-gray-100 shadow-sm mb-4 relative">
                {/* Placeholder QR */}
                <div className="w-full h-full border-4 border-[var(--royal)] rounded-lg p-2 relative">
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-amber-400" />
                  <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-amber-400" />
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-amber-400" />
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-amber-400" />
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center flex-col gap-2">
                    <QrCode size={40} className="text-gray-400" />
                    <span className="text-[10px] font-bold text-gray-400 uppercase">QRIS Placeholder</span>
                  </div>
                </div>
              </div>
              <ul className="text-xs text-gray-500 space-y-2 list-disc pl-4 text-left">
                <li>Buka aplikasi m-banking atau e-wallet Anda.</li>
                <li>Pilih menu scan QRIS.</li>
                <li>Pastikan nominal tepat <strong className="text-gray-900">Rp {finalPrice.toLocaleString('id-ID')}</strong>.</li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Floating Action */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 pb-safe z-40 shadow-[0_-10px_20px_rgba(0,0,0,0.03)] sm:w-[400px] sm:left-1/2 sm:-ml-[200px] sm:absolute sm:rounded-b-[40px] sm:border-none">
        <button
          onClick={handleConfirmPayment}
          disabled={isProcessing}
          className="w-full bg-[var(--royal)] text-white py-4 rounded-xl font-bold text-sm shadow-[var(--shadow-royal)] disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2 transition-all"
        >
          {isProcessing ? 'Memproses...' : 'Saya Sudah Bayar'}
        </button>
      </div>
    </div>
  );
}

export default function Payment() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>}>
      <PaymentContent />
    </Suspense>
  );
}
