'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, Phone, LogIn, Waves } from 'lucide-react';
import { COMPANY } from '@/lib/data';
import { useLanguage } from '@/context/LanguageContext';

const navLinks = [
  { href: '/', key: 'home' },
  { href: '/#layanan', key: 'services' },
  { href: '/#galeri', key: 'gallery' },
  { href: '/#testimoni', key: 'testimonials' },
  { href: '/#artikel', key: 'articles' },
  { href: '/#kontak', key: 'contact' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { lang, toggleLanguage, t } = useLanguage();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'nav-glass-scrolled py-2'
          : 'bg-transparent py-4'
      }`}
      style={{
        background: scrolled ? 'rgba(255,255,255,0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        boxShadow: scrolled ? 'var(--shadow-md)' : 'none',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-ocean flex items-center justify-center text-white shadow-md">
              <Waves size={22} className="text-white" />
            </div>
            <div className="hidden sm:block">
              <span className={`font-extrabold text-lg leading-tight block ${scrolled ? 'text-[var(--teal)]' : 'text-white'}`}>
                Banyuwangi
              </span>
              <span className={`text-[10px] uppercase tracking-widest font-semibold ${scrolled ? 'text-[var(--cyan)]' : 'text-cyan-200'}`}>
                Watersport
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                  scrolled
                    ? 'text-gray-600 hover:text-[var(--teal)] hover:bg-gray-50'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                {t(`nav.${link.key}`)}
              </Link>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <a
              href={`tel:${COMPANY.phone}`}
              className={`flex items-center gap-2 text-sm font-semibold transition-colors ${
                scrolled ? 'text-[var(--teal)]' : 'text-white'
              }`}
            >
              <Phone size={16} />
              <span className="hidden xl:inline">{COMPANY.phone}</span>
            </a>
            <div className={`flex items-center gap-1 px-2 border-l border-r border-white/20 mx-1 ${scrolled ? 'border-gray-200' : ''}`}>
               <button onClick={() => toggleLanguage('id')} className={`text-xs font-bold px-2 py-1 rounded transition-colors ${lang === 'id' ? (scrolled ? 'text-[var(--cyan)] bg-[var(--cyan-soft)]' : 'text-cyan-200 bg-white/20') : (scrolled ? 'text-gray-400 hover:text-gray-600' : 'text-white/50 hover:text-white/80')}`}>ID</button>
               <button onClick={() => toggleLanguage('en')} className={`text-xs font-bold px-2 py-1 rounded transition-colors ${lang === 'en' ? (scrolled ? 'text-[var(--cyan)] bg-[var(--cyan-soft)]' : 'text-cyan-200 bg-white/20') : (scrolled ? 'text-gray-400 hover:text-gray-600' : 'text-white/50 hover:text-white/80')}`}>EN</button>
            </div>
            <Link href="/login" className={`flex items-center gap-1.5 text-sm font-semibold px-4 py-2.5 rounded-full transition-all duration-200 ${scrolled ? 'text-[var(--teal)] hover:bg-[var(--cyan-soft)]' : 'text-white/90 hover:bg-white/10'}`}>
              <LogIn size={16} />
              {lang === 'id' ? 'Masuk' : 'Login'}
            </Link>
            <Link href="/login" className="btn btn-cyan text-sm px-5 py-2.5">
              {t('nav.bookNow')}
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`lg:hidden p-2 rounded-lg transition-colors ${
              scrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-white hover:bg-white/10'
            }`}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden absolute top-full left-0 right-0 bg-white shadow-xl transition-all duration-300 ${
          isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}
      >
        <div className="px-4 py-6 space-y-1">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="block px-4 py-3 rounded-xl text-gray-700 hover:bg-[var(--cyan-soft)] hover:text-[var(--teal)] font-semibold text-sm transition-colors"
            >
              {t(`nav.${link.key}`)}
            </Link>
          ))}
          <div className="pt-4 border-t border-gray-100 mt-4 space-y-3">
            <div className="flex items-center gap-2 px-4 py-2">
               <button onClick={() => toggleLanguage('id')} className={`text-xs font-bold px-3 py-1.5 rounded ${lang === 'id' ? 'bg-[var(--cyan-soft)] text-[var(--cyan)]' : 'text-gray-400 hover:bg-gray-50'}`}>ID (Indonesia)</button>
               <button onClick={() => toggleLanguage('en')} className={`text-xs font-bold px-3 py-1.5 rounded ${lang === 'en' ? 'bg-[var(--cyan-soft)] text-[var(--cyan)]' : 'text-gray-400 hover:bg-gray-50'}`}>EN (English)</button>
            </div>
            <a
              href={`tel:${COMPANY.phone}`}
              className="flex items-center gap-2 px-4 py-2 text-[var(--teal)] font-semibold text-sm"
            >
              <Phone size={16} /> {COMPANY.phone}
            </a>
            <Link
              href="/login"
              className="flex items-center gap-2 px-4 py-3 rounded-xl text-[var(--teal)] hover:bg-[var(--cyan-soft)] font-semibold text-sm transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <LogIn size={18} />
              {lang === 'id' ? 'Masuk / Login' : 'Sign In'}
            </Link>
            <Link
              href="/login"
              className="btn btn-cyan w-full justify-center"
              onClick={() => setIsOpen(false)}
            >
              {t('nav.bookNow')}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
