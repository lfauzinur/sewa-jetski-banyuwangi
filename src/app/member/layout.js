'use client';
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Calendar, User, LogOut, Anchor } from 'lucide-react';
import { supabase } from '@/lib/supabase';

function MemberLayoutContent({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // Fallback check just in case we are mid-migration
        const local = localStorage.getItem('user');
        if (!local) router.push('/login');
        else {
          setUser(JSON.parse(local));
          setIsLoaded(true);
        }
      } else {
        setUser({
          email: session.user.email,
          name: session.user.user_metadata?.name || session.user.email.split('@')[0],
          role: 'member',
          id: session.user.id
        });
        setIsLoaded(true);
      }
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.push('/login');
      } else {
        setUser({
          email: session.user.email,
          name: session.user.user_metadata?.name || session.user.email.split('@')[0],
          role: 'member',
          id: session.user.id
        });
        setIsLoaded(true);
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const navItems = [
    { name: 'Home', href: '/member', icon: <Home size={22} /> },
    { name: 'Bookings', href: '/member/bookings', icon: <Calendar size={22} /> },
    { name: 'Profile', href: '/member/profile', icon: <User size={22} /> },
  ];

  return (
    <div className="min-h-screen bg-[var(--royal)] flex justify-center sm:py-6">
      {/* Mobile-first App Container */}
      <div className="w-full sm:max-w-[400px] bg-[#f8f9fa] min-h-screen sm:min-h-[850px] sm:h-[850px] sm:rounded-[40px] relative shadow-2xl flex flex-col overflow-hidden ring-8 ring-white/20">
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto pb-24 scrollbar-hide">
          {children}
        </main>

        {/* Floating Bottom Navigation (Only on main tabs) */}
        {['/member', '/member/bookings', '/member/profile'].includes(pathname) && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50">
            <div className="bg-white rounded-full shadow-[0_10px_40px_rgba(0,0,0,0.1)] px-6 py-4 flex items-center justify-center gap-8 min-w-[240px]">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300 ${
                      isActive ? 'bg-[var(--royal)] text-white' : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    {item.icon}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MemberLayout({ children }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--royal)] flex items-center justify-center">Loading...</div>}>
      <MemberLayoutContent>{children}</MemberLayoutContent>
    </Suspense>
  );
}
