'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Bell, MessageSquare, Tag, Megaphone } from 'lucide-react';

const notifSettings = [
  { key: 'booking', icon: <Bell size={20} />, label: 'Booking Updates', desc: 'Notifikasi status booking Anda' },
  { key: 'promo', icon: <Tag size={20} />, label: 'Promo & Diskon', desc: 'Penawaran spesial dan kupon' },
  { key: 'chat', icon: <MessageSquare size={20} />, label: 'Pesan', desc: 'Pesan dari admin atau customer service' },
  { key: 'news', icon: <Megaphone size={20} />, label: 'Berita & Artikel', desc: 'Artikel dan tips terbaru' },
];

export default function NotificationsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState({ booking: true, promo: true, chat: true, news: false });

  const toggle = (key) => setSettings({ ...settings, [key]: !settings[key] });

  return (
    <div className="min-h-screen bg-white pb-10">
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md pt-10 pb-4 px-6 flex items-center justify-between">
        <button onClick={() => router.back()} className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-[var(--royal)]">
          <ChevronLeft size={24} />
        </button>
        <h1 className="font-bold text-gray-900 text-lg">Notifications</h1>
        <div className="w-10" />
      </div>

      <div className="px-6 mt-6 space-y-3">
        {notifSettings.map((item) => (
          <div key={item.key} className="bg-[#F8FAFC] rounded-[20px] p-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-[#F0F5FF] rounded-xl flex items-center justify-center text-[var(--royal)]">
                {item.icon}
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">{item.label}</p>
                <p className="text-xs text-gray-500">{item.desc}</p>
              </div>
            </div>
            <button
              onClick={() => toggle(item.key)}
              className={`w-12 h-7 rounded-full transition-colors duration-300 relative ${settings[item.key] ? 'bg-[var(--royal)]' : 'bg-gray-300'}`}
            >
              <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 ${settings[item.key] ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
