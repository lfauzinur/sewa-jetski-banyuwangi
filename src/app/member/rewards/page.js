'use client';
import { useEffect, useState } from 'react';
import { ChevronLeft, Gift, Award, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getUserLoyalty, getLoyaltyRewards } from '@/lib/supabase-data';

export default function RewardsPage() {
  const router = useRouter();
  const [points, setPoints] = useState(0);
  const [rewards, setRewards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.id) {
        const loyalty = await getUserLoyalty(user.id);
        setPoints(loyalty.points || 0);
      }
      
      const availableRewards = await getLoyaltyRewards();
      setRewards(availableRewards);
      setIsLoading(false);
    }
    loadData();
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 pt-12 pb-6 px-6 text-white rounded-b-[40px] shadow-lg">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => router.push('/member')} className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center hover:bg-white/30 transition-colors">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-xl font-black">JetPass Rewards</h1>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20">
          <p className="text-white/80 text-sm font-medium mb-1">Total Poin Anda</p>
          <div className="flex items-end gap-2">
            <span className="text-5xl font-black">{points}</span>
            <span className="text-lg font-bold mb-1">pts</span>
          </div>
        </div>
      </div>

      {/* Rewards List */}
      <div className="px-6 mt-8">
        <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Award size={20} className="text-amber-500" />
          Katalog Penukaran
        </h2>

        {isLoading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-24 bg-gray-200 rounded-2xl"></div>
            <div className="h-24 bg-gray-200 rounded-2xl"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {rewards.map(reward => {
              const canRedeem = points >= reward.points_required;
              return (
                <div key={reward.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-4 items-center">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${canRedeem ? 'bg-amber-100 text-amber-500' : 'bg-gray-100 text-gray-400'}`}>
                    {reward.type === 'discount' ? <Zap size={28} /> : <Gift size={28} />}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-sm">{reward.name}</h3>
                    <p className="text-xs text-gray-500 mt-1">{reward.points_required} Poin</p>
                  </div>
                  <button 
                    disabled={!canRedeem}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      canRedeem 
                        ? 'bg-gray-900 text-white shadow-md active:scale-95' 
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Tukar
                  </button>
                </div>
              );
            })}
          </div>
        )}
        
        <p className="text-center text-xs text-gray-400 mt-8">
          *Poin dapat ditukarkan secara otomatis saat Anda melakukan penyewaan jetski di halaman pembayaran.
        </p>
      </div>
    </div>
  );
}
