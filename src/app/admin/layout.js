'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  CalendarCheck, 
  FileEdit, 
  Settings, 
  LogOut,
  Menu,
  X,
  Users,
  Scan,
  PlusSquare,
  Gift,
  Map,
  MapPin,
  Waves
} from 'lucide-react';

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (pathname === '/admin/login') return;

    // Simple auth check for admin
    const storedUser = localStorage.getItem('admin_user');
    if (!storedUser) {
      router.push('/admin/login');
    }
  }, [pathname, router]);

  if (!isMounted) return null;

  // Don't render sidebar and header for /admin/login
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const navItems = [
    { name: 'Dashboard', href: '/admin', icon: <LayoutDashboard size={20} /> },
    { name: 'Live Tracking', href: '/admin/live-tracking', icon: <Map size={20} /> },
    { name: 'Basecamp', href: '/admin/basecamps', icon: <MapPin size={20} /> },
    { name: 'Scan Tiket', href: '/admin/scanner', icon: <Scan size={20} /> },
    { name: 'Kelola Unit', href: '/admin/units', icon: <Package size={20} /> },
    { name: 'Data Booking', href: '/admin/bookings', icon: <CalendarCheck size={20} /> },
    { name: 'Data Member', href: '/admin/members', icon: <Users size={20} /> },
    { name: 'Kelola Add-ons', href: '/admin/addons', icon: <PlusSquare size={20} /> },
    { name: 'Reward Poin', href: '/admin/rewards', icon: <Gift size={20} /> },
    { name: 'Konten CMS', href: '/admin/content', icon: <FileEdit size={20} /> },
    { name: 'Pengaturan', href: '/admin/settings', icon: <Settings size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-[var(--teal-dark)] text-white
        transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col
      `}>
        <div className="p-6 flex justify-between items-center">
          <Link href="/admin" className="flex items-center gap-3 text-white">
            <div className="w-8 h-8 rounded-lg gradient-ocean flex items-center justify-center text-white">
              <Waves size={16} />
            </div>
            <div>
              <span className="font-extrabold text-sm block leading-tight">Admin Panel</span>
              <span className="text-cyan-300 text-[10px] uppercase tracking-widest font-semibold">Banyuwangi</span>
            </div>
          </Link>
          <button className="lg:hidden text-white/50 hover:text-white" onClick={() => setIsSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors text-sm
                  ${isActive 
                    ? 'bg-[var(--cyan)] text-white shadow-md' 
                    : 'text-white/60 hover:bg-white/10 hover:text-white'
                  }
                `}
              >
                {item.icon}
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button 
            onClick={() => {
              localStorage.removeItem('admin_user');
              router.push('/admin/login');
            }}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl font-medium text-white/60 hover:bg-rose-500/10 hover:text-rose-400 transition-colors text-sm"
          >
            <LogOut size={20} />
            Keluar
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 flex-shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <Menu size={24} />
            </button>
            <h1 className="font-bold text-gray-900 truncate">
              {navItems.find(i => i.href === pathname)?.name || 'Dashboard'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-gray-900">Admin Utama</p>
              <p className="text-[10px] text-gray-500 uppercase">Super Admin</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-[var(--cyan-soft)] text-[var(--teal)] flex items-center justify-center font-bold">
              A
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
