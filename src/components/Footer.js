'use client';
import Link from 'next/link';
import { MapPin, Phone, Mail } from 'lucide-react';
import { COMPANY } from '@/lib/data';
import { useLanguage } from '@/context/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();
  return (
    <footer id="kontak" className="relative overflow-hidden">
      {/* Wave Top */}
      <div className="wave-divider wave-divider-bottom">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" fill="var(--teal-dark)"></path>
        </svg>
      </div>

      <div className="bg-[var(--teal-dark)] pt-8 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">

            {/* Brand */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl gradient-ocean flex items-center justify-center text-white font-black text-lg">
                  🌊
                </div>
                <div>
                  <span className="font-extrabold text-white text-lg block leading-tight">Banyuwangi</span>
                  <span className="text-cyan-300 text-[10px] uppercase tracking-widest font-semibold">Watersport</span>
                </div>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                {t('footer.desc')}
              </p>
              <div className="flex gap-3">
                <a href={COMPANY.instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-[var(--cyan)] transition-all duration-300">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                </a>
                <a href={COMPANY.facebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-[var(--cyan)] transition-all duration-300">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                </a>
                <a href={COMPANY.youtube} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-[var(--cyan)] transition-all duration-300">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>
                </a>
                <a href={COMPANY.tiktok} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-[var(--cyan)] transition-all duration-300">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V9.12a8.16 8.16 0 004.76 1.54v-3.4a4.85 4.85 0 01-1-.57z"/></svg>
                </a>
                <a href={COMPANY.tripadvisor} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-[var(--cyan)] transition-all duration-300">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M22.062 13.916a8.47 8.47 0 0 1-1.22 3.12 7.15 7.15 0 0 0-.8-2.074l-1.127-1.782c-.878-.445-1.993-.578-3.036-.26-1.042.316-1.95.932-2.583 1.748L11.758 13.3c-.633-.816-1.54-1.432-2.583-1.748-1.043-.318-2.158-.185-3.036.26l-1.127 1.782a7.15 7.15 0 0 0-.8 2.074 8.47 8.47 0 0 1-1.22-3.12c-.534-2.615.11-5.32 1.784-7.464l-2.03-2.03A.638.638 0 0 1 3.2 2.1l2.5.54a9.145 9.145 0 0 1 6.31-2.482c2.253 0 4.437.825 6.137 2.316l2.56-.554a.638.638 0 0 1 .753.753l-1.92 1.92c1.784 2.308 2.392 5.253 1.637 8.113l.885 1.21zm-4.708 1.992a3.02 3.02 0 1 0 0-6.04 3.02 3.02 0 0 0 0 6.04zm-10.708 0a3.02 3.02 0 1 0 0-6.04 3.02 3.02 0 0 0 0 6.04zm5.354-10.63a6.115 6.115 0 0 0-4.148 1.606l2.254 3.565c.616-.548 1.488-.705 2.25-.4l1.37-2.164a6.048 6.048 0 0 0-1.726-2.607zm-5.354 5.922a1.32 1.32 0 1 1 0-2.64 1.32 1.32 0 0 1 0 2.64zm10.708 0a1.32 1.32 0 1 1 0-2.64 1.32 1.32 0 0 1 0 2.64z"/></svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-bold text-white text-sm uppercase tracking-wider mb-6">{t('footer.quickLinks')}</h3>
              <ul className="space-y-3">
                {[
                  { href: '/', key: 'home' },
                  { href: '/#layanan', key: 'services' },
                  { href: '/#galeri', key: 'gallery' },
                  { href: '/#artikel', key: 'articles' },
                  { href: '/login', key: 'login' },
                ].map(link => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-gray-400 hover:text-cyan-300 text-sm transition-colors duration-200">
                      {t(`nav.${link.key}`)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Services */}
            <div>
              <h3 className="font-bold text-white text-sm uppercase tracking-wider mb-6">{t('footer.services')}</h3>
              <ul className="space-y-3">
                {[
                  { name: 'Jetski Adventure', href: '/login' },
                  { name: 'Banana Boat', href: '/layanan/banana-boat' },
                  { name: 'Parasailing', href: '/layanan/parasailing' },
                  { name: 'Snorkeling', href: '/layanan/snorkeling' },
                  { name: 'Flying Fish', href: '/layanan/flying-fish' },
                  { name: 'Paket Combo', href: '/layanan/paket-combo' },
                ].map(service => (
                  <li key={service.name}>
                    <Link href={service.href} className="text-gray-400 hover:text-cyan-300 text-sm transition-colors duration-200">
                      {service.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="font-bold text-white text-sm uppercase tracking-wider mb-6">{t('footer.contact')}</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="text-cyan-400 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-400 text-sm leading-relaxed">{COMPANY.address}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Phone size={18} className="text-cyan-400 flex-shrink-0" />
                  <a href={`tel:${COMPANY.phone}`} className="text-gray-400 hover:text-cyan-300 text-sm transition-colors">{COMPANY.phone}</a>
                </div>
                <div className="flex items-center gap-3">
                  <Mail size={18} className="text-cyan-400 flex-shrink-0" />
                  <a href={`mailto:${COMPANY.email}`} className="text-gray-400 hover:text-cyan-300 text-sm transition-colors">{COMPANY.email}</a>
                </div>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-xs">
              © 2026 {COMPANY.name}. {t('footer.rights')}.
            </p>
            <div className="flex gap-6 text-xs text-gray-500">
              <Link href="#" className="hover:text-gray-300 transition-colors">Kebijakan Privasi</Link>
              <Link href="#" className="hover:text-gray-300 transition-colors">Syarat & Ketentuan</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
