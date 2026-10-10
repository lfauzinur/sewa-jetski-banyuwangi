'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Bell, Settings, History, CalendarDays, 
  User, Shield, Lock, CreditCard, 
  HelpCircle, Info, LogOut 
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function MemberProfile() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser({
          email: session.user.email,
          name: session.user.user_metadata?.name || session.user.email.split('@')[0],
          id: session.user.id
        });
      } else {
        const storedUser = localStorage.getItem('user');
        if (storedUser) setUser(JSON.parse(storedUser));
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('user');
    router.push('/'); // Redirect to landing page/login
  };

  return (
    <div className="min-h-screen bg-[var(--royal)] relative flex flex-col pb-24">
      
      {/* Top Section - Blue Background */}
      <div className="pt-10 px-6 pb-8 relative flex flex-col items-center text-center">
        
        {/* Notification Bell */}
        <div className="absolute top-10 right-6 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md">
          <Bell size={20} className="text-[var(--royal)]" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
        </div>

        {/* Profile Picture */}
        <div className="w-24 h-24 rounded-full border-4 border-white/20 overflow-hidden mb-4 mt-6">
          <img 
            src={`https://api.dicebear.com/7.x/notionists/svg?seed=${user?.name || 'User'}`} 
            alt={user?.name || 'User'} 
            className="w-full h-full object-cover bg-white"
          />
        </div>

        {/* User Info */}
        <h1 className="text-2xl font-extrabold text-white mb-1">{user?.name || 'Loading...'}</h1>
        <p className="text-sm text-blue-100 font-medium">{user?.email || ''}</p>
      </div>

      {/* Main Content Area - White Card */}
      <div className="bg-white rounded-t-[40px] flex-1 w-full px-6 pt-8 pb-32 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
        
        {/* Top Tabs */}
        <div className="flex items-center justify-between gap-3 mb-8">
          <Link href="/member/bookings" className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-700 py-3 rounded-2xl flex items-center justify-center gap-2 text-sm font-semibold transition-colors">
            <History size={16} /> History
          </Link>
          <Link href="/member/bookings" className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-700 py-3 rounded-2xl flex items-center justify-center gap-2 text-sm font-semibold transition-colors">
            <CalendarDays size={16} /> Upcoming
          </Link>
          <div className="w-12 h-12 bg-[#F0F5FF] text-[var(--royal)] rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm">
            <Settings size={20} />
          </div>
        </div>

        {/* Menu Section 1 */}
        <div className="bg-[#F8FAFC] rounded-[24px] p-2 mb-4">
          <Link href="/member/profile/edit" className="w-full flex items-center gap-4 p-4 rounded-[18px] hover:bg-white transition-colors text-left group">
            <User size={20} className="text-gray-600 group-hover:text-[var(--royal)] transition-colors" />
            <span className="font-semibold text-gray-900 text-sm">Edit profile</span>
          </Link>
          <Link href="/member/profile/security" className="w-full flex items-center gap-4 p-4 rounded-[18px] hover:bg-white transition-colors text-left group">
            <Shield size={20} className="text-gray-600 group-hover:text-[var(--royal)] transition-colors" />
            <span className="font-semibold text-gray-900 text-sm">Security</span>
          </Link>
          <Link href="/member/profile/notifications" className="w-full flex items-center gap-4 p-4 rounded-[18px] hover:bg-white transition-colors text-left group">
            <Bell size={20} className="text-gray-600 group-hover:text-[var(--royal)] transition-colors" />
            <span className="font-semibold text-gray-900 text-sm">Notifications</span>
          </Link>
          <Link href="/member/profile/privacy" className="w-full flex items-center gap-4 p-4 rounded-[18px] hover:bg-white transition-colors text-left group">
            <Lock size={20} className="text-gray-600 group-hover:text-[var(--royal)] transition-colors" />
            <span className="font-semibold text-gray-900 text-sm">Privacy</span>
          </Link>
        </div>

        {/* Menu Section 2 */}
        <div className="bg-[#F8FAFC] rounded-[24px] p-2 mb-6">
          <Link href="/member/profile/payment" className="w-full flex items-center gap-4 p-4 rounded-[18px] hover:bg-white transition-colors text-left group">
            <CreditCard size={20} className="text-gray-600 group-hover:text-[var(--royal)] transition-colors" />
            <span className="font-semibold text-gray-900 text-sm">Payment methods</span>
          </Link>
          <Link href="/member/profile/help" className="w-full flex items-center gap-4 p-4 rounded-[18px] hover:bg-white transition-colors text-left group">
            <HelpCircle size={20} className="text-gray-600 group-hover:text-[var(--royal)] transition-colors" />
            <span className="font-semibold text-gray-900 text-sm">Help & Support</span>
          </Link>
          <Link href="/member/profile/terms" className="w-full flex items-center gap-4 p-4 rounded-[18px] hover:bg-white transition-colors text-left group">
            <Info size={20} className="text-gray-600 group-hover:text-[var(--royal)] transition-colors" />
            <span className="font-semibold text-gray-900 text-sm">Terms and Policies</span>
          </Link>
        </div>

        {/* Logout Section */}
        <div className="bg-rose-50 rounded-[24px] p-2">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-4 p-4 rounded-[18px] hover:bg-white transition-colors text-left group"
          >
            <LogOut size={20} className="text-rose-600" />
            <span className="font-semibold text-rose-600 text-sm">Log out</span>
          </button>
        </div>

      </div>
    </div>
  );
}
