'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Star, MapPin, Phone, Shield, Award, Users, Clock, ChevronRight, ChevronLeft,
  ArrowRight, Waves, Anchor, Play, Calendar, Sparkles
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WhatsAppFloat from '@/components/WhatsAppFloat';
import {
  COMPANY, watersportServices, watersportCategories, testimonials, articles as staticArticles,
  formatCurrency, formatDate
} from '@/lib/data';
import { getCategories, getArticles, getPromos } from '@/lib/supabase-data';
import { useLanguage } from '@/context/LanguageContext';

/* ═══════════════════════════════════════
   HERO SECTION
   ═══════════════════════════════════════ */
function HeroSection() {
  const { t } = useLanguage();
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/hero-jetski.png"
          alt="Jetski Adventure Banyuwangi"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--teal-dark)]/90 via-[var(--teal)]/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--teal-dark)]/60 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-24 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* Left - Main CTA */}
          <div className="animate-fade-in-up">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-cyan-200 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider mb-6 border border-white/20">
              <Sparkles size={14} />
              <span>{t('hero.subtitle')}</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-white leading-[1.1] mb-6">
              {t('hero.title1')}
              <br />
              <span className="text-gradient-ocean" style={{ WebkitTextFillColor: 'transparent', background: 'linear-gradient(135deg, #90E0EF 0%, #00B4D8 50%, #FCD34D 100%)', backgroundClip: 'text', WebkitBackgroundClip: 'text' }}>
                {t('hero.title2')}
              </span>
              <br />
              {t('hero.title3')}
            </h1>
            <p className="text-white/70 text-lg max-w-lg mb-8 leading-relaxed">
              {t('hero.desc')}
            </p>

            <div className="flex flex-wrap gap-4 mb-12">
              <Link href="/login" className="btn btn-cyan text-base px-8 py-3.5 shadow-lg">
                <Calendar size={18} /> {t('hero.btnBook')}
              </Link>
              <Link href="/#layanan" className="btn btn-outline-white text-base px-8 py-3.5">
                {t('hero.btnServices')}
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap gap-6">
              {[
                { icon: <Shield size={20} />, label: t('hero.badges.insurance'), sub: t('hero.badges.insuranceSub') },
                { icon: <Award size={20} />, label: t('hero.badges.guide'), sub: t('hero.badges.guideSub') },
                { icon: <Star size={20} />, label: t('hero.badges.rating'), sub: t('hero.badges.ratingSub') },
              ].map((badge, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center text-cyan-300 border border-white/10">
                    {badge.icon}
                  </div>
                  <div>
                    <span className="text-white font-bold text-sm block">{badge.label}</span>
                    <span className="text-white/50 text-xs">{badge.sub}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right - Floating Info Cards */}
          <div className="hidden lg:block relative">
            {/* Contact Card */}
            <div className="absolute top-0 left-0 card-glass p-5 rounded-2xl animate-float delay-200 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[var(--cyan)]/20 flex items-center justify-center">
                  <MapPin size={22} className="text-[var(--cyan)]" />
                </div>
                <div>
                  <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">{t('hero.location')}</span>
                  <p className="font-bold text-gray-900 text-sm">Banyuwangi, Banyuwangi</p>
                </div>
              </div>
            </div>

            {/* Price Card */}
            <div className="absolute bottom-20 right-0 card-glass p-5 rounded-2xl animate-float delay-400 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[var(--amber)]/20 flex items-center justify-center">
                  <span className="text-2xl">🏷️</span>
                </div>
                <div>
                  <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">{t('hero.startFrom')}</span>
                  <p className="font-extrabold text-gray-900 text-lg text-[var(--amber)]">Rp 100.000</p>
                </div>
              </div>
            </div>

            {/* Rating Card */}
            <div className="absolute top-1/2 right-8 -translate-y-1/2 card-glass p-5 rounded-2xl animate-float delay-300 shadow-xl">
              <div className="flex items-center gap-1 text-amber-400 mb-2">
                {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
              </div>
              <p className="text-xs text-gray-600 mb-1">&quot;Pengalaman luar biasa!&quot;</p>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-cyan-100 flex items-center justify-center text-xs">👩</div>
                <span className="text-xs font-semibold text-gray-700">Rina S.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Wave Bottom */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <svg viewBox="0 0 1440 120" preserveAspectRatio="none" className="w-full h-16 sm:h-20 lg:h-24">
          <path d="M0,64L48,58.7C96,53,192,43,288,48C384,53,480,75,576,80C672,85,768,75,864,64C960,53,1056,43,1152,42.7C1248,43,1344,53,1392,58.7L1440,64L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z" fill="white"/>
        </svg>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════
   BENEFITS SECTION
   ═══════════════════════════════════════ */
function BenefitsSection() {
  const { t } = useLanguage();
  const benefits = [
    { icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--teal)]"><circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 18V6"/></svg>, title: t('benefits.price.title'), desc: t('benefits.price.desc') },
    { icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--teal)]"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>, title: t('benefits.safe.title'), desc: t('benefits.safe.desc') },
    { icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--teal)]"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></svg>, title: t('benefits.guide.title'), desc: t('benefits.guide.desc') },
    { icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--teal)]"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>, title: t('benefits.unit.title'), desc: t('benefits.unit.desc') },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((b, i) => (
            <div key={i} className="text-center p-6 rounded-2xl hover:bg-[var(--cyan-soft)] transition-all duration-300 group cursor-default">
              <div className="w-16 h-16 rounded-2xl bg-[var(--cyan-soft)] flex items-center justify-center mx-auto mb-4 text-3xl group-hover:scale-110 transition-transform duration-300">
                {b.icon}
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">{b.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════
   SERVICES SECTION
   ═══════════════════════════════════════ */
function ServicesSection() {
  const { t, lang } = useLanguage();
  const [cats, setCats] = useState(watersportCategories);

  useEffect(() => {
    getCategories().then(data => {
      if (data && data.length > 0) setCats(data);
    });
  }, []);

  return (
    <section id="layanan" className="py-20 bg-[var(--bg-secondary)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-flex items-center gap-2 text-[var(--cyan)] font-bold text-xs uppercase tracking-widest mb-4">
            <Waves size={16} /> {t('services.badge')}
          </span>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-4">
            {t('services.title')}
          </h2>
          <p className="text-gray-500 leading-relaxed">
            {t('services.desc')}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cats.map((category) => (
            <Link href={`/kategori/${category.slug}`} key={category.id} className="card group cursor-pointer block">
              <div className="relative h-52 overflow-hidden">
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              </div>
              <div className="p-6">
                <h3 className="font-bold text-gray-900 text-lg mb-2">{lang === 'en' ? category.nameEn || category.name : category.name}</h3>
                <p className="text-gray-500 text-sm line-clamp-2 mb-4">{lang === 'en' ? category.descriptionEn || category.description : category.description}</p>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-sm font-bold text-[var(--teal)]">{t('services.viewPackage')} &rarr;</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════
   VIDEO SECTION
   ═══════════════════════════════════════ */
function VideoSection() {
  const [isOpen, setIsOpen] = useState(false);
  const [video, setVideo] = useState({ title: 'CHALLENGE YOURSELF', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' });

  useEffect(() => {
    const storedVideo = localStorage.getItem('admin_video');
    if (storedVideo) setVideo(JSON.parse(storedVideo));
  }, []);
  
  return (
    <section className="relative py-32 bg-gray-900 overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/hero-jetski.png"
          alt="Video Thumbnail"
          fill
          className="object-cover opacity-50 grayscale"
        />
      </div>
      <div className="relative z-10 text-center flex flex-col items-center">
        <h2 className="text-white text-lg tracking-[0.3em] uppercase mb-8 font-light">{video.title}</h2>
        <button 
          onClick={() => setIsOpen(true)}
          className="w-20 h-20 rounded-full border border-white flex items-center justify-center text-white hover:bg-white/20 transition-all group"
        >
          <Play className="w-8 h-8 ml-2 group-hover:scale-110 transition-transform" />
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4">
          <button 
            onClick={() => setIsOpen(false)}
            className="absolute top-6 right-6 text-white hover:text-[var(--cyan)] text-4xl"
          >
            &times;
          </button>
          <div className="w-full max-w-5xl aspect-video rounded-xl overflow-hidden shadow-2xl relative">
            <iframe 
              width="100%" 
              height="100%" 
              src={isOpen ? `${video.url}?autoplay=1` : video.url} 
              title="YouTube video player" 
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen>
            </iframe>
          </div>
        </div>
      )}
    </section>
  );
}

/* ═══════════════════════════════════════
   ABOUT / WHY US SECTION
   ═══════════════════════════════════════ */
function AboutSection() {
  const { t } = useLanguage();
  return (
    <section className="py-20 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Image Grid */}
          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="relative h-56 rounded-2xl overflow-hidden">
                  <Image src="/images/gallery-group.png" alt="Jetski Group" fill className="object-cover" sizes="25vw" />
                </div>
                <div className="relative h-36 rounded-2xl overflow-hidden">
                  <Image src="/images/gallery-sunset.png" alt="Sunset" fill className="object-cover" sizes="25vw" />
                </div>
              </div>
              <div className="space-y-4 pt-8">
                <div className="relative h-36 rounded-2xl overflow-hidden">
                  <Image src="/images/gallery-banana-boat.png" alt="Banana Boat" fill className="object-cover" sizes="25vw" />
                </div>
                <div className="relative h-56 rounded-2xl overflow-hidden">
                  <Image src="/images/gallery-parasailing.png" alt="Parasailing" fill className="object-cover" sizes="25vw" />
                </div>
              </div>
            </div>
            {/* Experience Badge */}
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-white rounded-2xl shadow-xl p-5 flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl gradient-ocean flex items-center justify-center text-white font-extrabold text-xl">
                10+
              </div>
              <div>
                <span className="font-extrabold text-gray-900 text-lg block">{t('about.expYears')}</span>
                <span className="text-gray-500 text-xs">{t('about.expDesc')}</span>
              </div>
            </div>
          </div>

          {/* Text Content */}
          <div>
            <span className="inline-flex items-center gap-2 text-[var(--cyan)] font-bold text-xs uppercase tracking-widest mb-4">
              <Anchor size={16} /> {t('about.badge')}
            </span>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-6 leading-tight">
              {t('about.title1')} <br />
              <span className="text-[var(--cyan)]">{t('about.title2')}</span>
            </h2>
            <p className="text-gray-500 leading-relaxed mb-6">
              {t('about.desc')}
            </p>
            <div className="space-y-4 mb-8">
              {[
                { icon: <Shield size={18} />, text: t('about.point1') },
                { icon: <Users size={18} />, text: t('about.point2') },
                { icon: <Clock size={18} />, text: t('about.point3') },
                { icon: <Award size={18} />, text: t('about.point4') },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[var(--cyan-soft)] text-[var(--cyan)] flex items-center justify-center flex-shrink-0">
                    {item.icon}
                  </div>
                  <span className="text-gray-700 text-sm font-medium">{item.text}</span>
                </div>
              ))}
            </div>
            <Link href="/login" className="btn btn-teal">
              {t('about.btnBook')} <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════
   GALLERY SECTION
   ═══════════════════════════════════════ */
function GallerySection() {
  const { t } = useLanguage();
  const [photos, setPhotos] = useState([
    { id: 1, src: '/images/hero-jetski.png', alt: 'Jetski Action', span: 'col-span-2 row-span-2' },
    { id: 2, src: '/images/gallery-group.png', alt: 'Group Ride', span: '' },
    { id: 3, src: '/images/gallery-aerial.png', alt: 'Aerial View', span: '' },
    { id: 4, src: '/images/gallery-banana-boat.png', alt: 'Banana Boat', span: '' },
    { id: 5, src: '/images/gallery-parasailing.png', alt: 'Parasailing', span: '' },
    { id: 6, src: '/images/gallery-sunset.png', alt: 'Sunset View', span: 'col-span-2' },
  ]);

  useEffect(() => {
    const storedGallery = localStorage.getItem('admin_gallery');
    if (storedGallery) setPhotos(JSON.parse(storedGallery));
  }, []);

  return (
    <section id="galeri" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-flex items-center gap-2 text-[var(--cyan)] font-bold text-xs uppercase tracking-widest mb-4">
            📸 {t('gallery.badge')}
          </span>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-4">
            {t('gallery.title')}
          </h2>
          <p className="text-gray-500">
            {t('gallery.desc')}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 auto-rows-[180px] md:auto-rows-[200px]">
          {photos.map((photo, i) => (
            <div
              key={i}
              className={`relative rounded-2xl overflow-hidden group cursor-pointer ${photo.span}`}
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                <span className="text-white font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {photo.alt}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════
   TESTIMONIALS CAROUSEL
   ═══════════════════════════════════════ */
function TestimonialsSection() {
  const { t } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [clientTestimonials, setClientTestimonials] = useState(testimonials);
  const slidesPerView = 3;
  const totalSlides = Math.max(1, Math.ceil(clientTestimonials.length / slidesPerView));

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % totalSlides);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);

  useEffect(() => {
    const stored = localStorage.getItem('admin_testimonials');
    if (stored) {
      setClientTestimonials(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [totalSlides]);

  return (
    <section id="testimoni" className="py-20 gradient-ocean relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-flex items-center gap-2 text-cyan-200 font-bold text-xs uppercase tracking-widest mb-4">
            ⭐ {t('testimonials.badge')}
          </span>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-white mb-4">
            {t('testimonials.title')}
          </h2>
          <p className="text-white/60">
            {t('testimonials.desc')}
          </p>
        </div>

        {/* Carousel */}
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {/* Group testimonials into slides */}
            {Array.from({ length: totalSlides }).map((_, slideIdx) => (
              <div key={slideIdx} className="flex-shrink-0 w-full grid md:grid-cols-3 gap-6 px-1">
                {clientTestimonials.slice(slideIdx * slidesPerView, (slideIdx + 1) * slidesPerView).map(testi => (
                  <div key={testi.id} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/15 transition-colors duration-300">
                    <div className="flex items-center gap-1 text-amber-300 mb-4">
                      {[...Array(testi.rating || 5)].map((_, i) => (
                        <Star key={i} size={14} fill="currentColor" />
                      ))}
                    </div>
                    <p className="text-white/80 text-sm leading-relaxed mb-6 line-clamp-3">
                      &quot;{testi.text}&quot;
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-lg">
                        {testi.avatar}
                      </div>
                      <div>
                        <span className="text-white font-bold text-sm block">{testi.name}</span>
                        <span className="text-white/50 text-xs">{testi.role}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-center gap-4 mt-10">
          <button onClick={prevSlide} className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors">
            <ChevronLeft size={20} />
          </button>
          <div className="flex gap-2">
            {Array.from({ length: totalSlides }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  i === currentSlide ? 'bg-white w-8' : 'bg-white/30'
                }`}
              />
            ))}
          </div>
          <button onClick={nextSlide} className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════
   ARTICLES SECTION
   ═══════════════════════════════════════ */
function ArticlesSection() {
  const { t, lang } = useLanguage();
  return (
    <section id="artikel" className="py-20 bg-[var(--bg-secondary)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-12">
          <div>
            <span className="inline-flex items-center gap-2 text-[var(--cyan)] font-bold text-xs uppercase tracking-widest mb-4">
              📰 {t('articles.badge')}
            </span>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900">
              {t('articles.title')}
            </h2>
          </div>
          <Link href="#" className="hidden sm:inline-flex items-center gap-2 text-[var(--cyan)] font-bold text-sm hover:gap-3 transition-all">
            {t('articles.viewAll')} <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {staticArticles.map(article => (
            <Link href={`/artikel/${article.slug}`} key={article.id} className="card group cursor-pointer block">
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={article.image}
                  alt={lang === 'en' ? article.titleEn || article.title : article.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute top-4 left-4 bg-[var(--cyan)] text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase">
                  {lang === 'en' ? article.categoryEn || article.category : article.category}
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                  <span>{formatDate(article.date)}</span>
                  <span>•</span>
                  <span>{lang === 'en' ? article.readTimeEn || article.readTime : article.readTime}</span>
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2 group-hover:text-[var(--cyan)] transition-colors line-clamp-2">
                  {lang === 'en' ? article.titleEn || article.title : article.title}
                </h3>
                <p className="text-gray-500 text-sm line-clamp-2">{lang === 'en' ? article.excerptEn || article.excerpt : article.excerpt}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════
   CTA SECTION
   ═══════════════════════════════════════ */
function CTASection() {
  const { t } = useLanguage();
  return (
    <section className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative gradient-ocean rounded-3xl p-10 lg:p-16 text-center overflow-hidden">
          {/* Decorative */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-white mb-4">
              {t('cta.title')}
            </h2>
            <p className="text-white/70 mb-8 max-w-lg mx-auto">
              {t('cta.desc')}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/register" className="btn bg-white text-[var(--teal)] font-bold px-8 py-3.5 hover:bg-gray-100 transition-colors rounded-full">
                {t('cta.btnRegister')}
              </Link>
              <Link href="/login" className="btn btn-outline-white px-8 py-3.5">
                {t('cta.btnLogin')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════
   MAIN LANDING PAGE
   ═══════════════════════════════════════ */
export default function LandingPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <HeroSection />
      <BenefitsSection />
      <ServicesSection />
      <VideoSection />
      <AboutSection />
      <GallerySection />
      <TestimonialsSection />
      <ArticlesSection />
      <CTASection />
      <Footer />
      <WhatsAppFloat />
    </main>
  );
}
