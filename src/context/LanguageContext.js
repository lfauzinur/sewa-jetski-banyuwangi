'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const translations = {
  id: {
    nav: {
      home: 'Beranda',
      services: 'Layanan',
      gallery: 'Galeri',
      testimonials: 'Testimoni',
      articles: 'Artikel',
      contact: 'Kontak',
      bookNow: 'BOOK NOW',
      login: 'Masuk'
    },
    hero: {
      subtitle: '#1 Watersport Banyuwangi',
      title1: 'Rasakan Sensasi',
      title2: 'Jetski Adventure',
      title3: 'di Banyuwangi',
      desc: 'Nikmati pengalaman watersport premium di perairan jernih Banyuwangi. Guide profesional, unit terawat, dan harga terbaik menanti Anda!',
      btnBook: 'BOOK NOW',
      btnServices: 'Lihat Layanan',
      badges: {
        insurance: 'Asuransi',
        insuranceSub: 'Full Coverage',
        guide: 'Best Guide',
        guideSub: 'Bersertifikat',
        rating: '4.9 Rating',
        ratingSub: '500+ Review'
      },
      location: 'Lokasi',
      startFrom: 'Mulai dari'
    },
    benefits: {
      price: { title: 'Best Price', desc: 'Harga terjangkau tanpa biaya tersembunyi. Dijamin termurah!' },
      safe: { title: 'Aman & Terjamin', desc: 'Semua unit dilengkapi asuransi dan alat keselamatan lengkap.' },
      guide: { title: 'Guide Profesional', desc: 'Pemandu bersertifikat dengan pengalaman lebih dari 10 tahun.' },
      unit: { title: 'Unit Terawat', desc: 'Jetski & wahana rutin di-service untuk kenyamanan Anda.' }
    },
    services: {
      badge: 'Layanan Kami',
      title: 'Pilih Kategori Favorit Anda',
      desc: 'Berbagai aktivitas watersport seru menanti Anda di Banyuwangi. Pilih lokasi dan paket sesuai keinginan Anda!',
      viewPackage: 'Lihat Paket'
    },
    about: {
      expYears: 'Tahun',
      expDesc: 'Pengalaman Melayani',
      badge: 'Tentang Kami',
      title1: 'Mengapa Memilih',
      title2: 'Banyuwangi Watersport?',
      desc: 'Dengan pengalaman lebih dari 10 tahun, kami menyediakan layanan watersport premium dengan standar keselamatan internasional. Setiap unit dirawat secara berkala dan pemandu kami telah bersertifikat resmi.',
      point1: 'Asuransi penuh untuk setiap penumpang',
      point2: 'Pemandu bersertifikat & ramah',
      point3: 'Jadwal fleksibel sesuai kebutuhan',
      point4: 'Unit terawat & bersih setiap hari',
      btnBook: 'Pesan Sekarang'
    },
    gallery: {
      badge: 'Galeri',
      title: 'Momen Seru di Banyuwangi',
      desc: 'Lihat keseruan aktivitas watersport dari pelanggan kami.'
    },
    testimonials: {
      badge: 'Testimoni',
      title: 'Kata Mereka Tentang Kami',
      desc: 'Ribuan pelanggan puas telah merasakan serunya watersport bersama kami.'
    },
    articles: {
      badge: 'Artikel Terbaru',
      title: 'Info & Tips Watersport',
      viewAll: 'Lihat Semua'
    },
    cta: {
      title: 'Siap Bermain Jetski?',
      desc: 'Daftar sekarang dan dapatkan penawaran terbaik untuk pengalaman watersport yang tak terlupakan di Banyuwangi!',
      btnRegister: 'Daftar Gratis',
      btnLogin: 'Login & Book'
    },
    footer: {
      desc: 'Pengalaman watersport premium di perairan jernih Banyuwangi. Keamanan dan kenyamanan Anda adalah prioritas kami.',
      quickLinks: 'Tautan Cepat',
      services: 'Layanan',
      contact: 'Hubungi Kami',
      rights: 'Hak Cipta Dilindungi'
    }
  },
  en: {
    nav: {
      home: 'Home',
      services: 'Services',
      gallery: 'Gallery',
      testimonials: 'Testimonials',
      articles: 'Articles',
      contact: 'Contact',
      bookNow: 'BOOK NOW',
      login: 'Login'
    },
    hero: {
      subtitle: '#1 Watersport Banyuwangi',
      title1: 'Feel the Thrill of',
      title2: 'Jetski Adventure',
      title3: 'in Banyuwangi',
      desc: 'Enjoy premium watersport experiences in the crystal clear waters of Banyuwangi. Professional guides, well-maintained units, and the best prices await you!',
      btnBook: 'BOOK NOW',
      btnServices: 'See Services',
      badges: {
        insurance: 'Insurance',
        insuranceSub: 'Full Coverage',
        guide: 'Best Guide',
        guideSub: 'Certified',
        rating: '4.9 Rating',
        ratingSub: '500+ Reviews'
      },
      location: 'Location',
      startFrom: 'Start from'
    },
    benefits: {
      price: { title: 'Best Price', desc: 'Affordable prices with no hidden fees. Guaranteed cheapest!' },
      safe: { title: 'Safe & Secure', desc: 'All units are equipped with insurance and complete safety gear.' },
      guide: { title: 'Professional Guide', desc: 'Certified guides with more than 10 years of experience.' },
      unit: { title: 'Well Maintained', desc: 'Jetskis & rides are routinely serviced for your comfort.' }
    },
    services: {
      badge: 'Our Services',
      title: 'Choose Your Favorite Category',
      desc: 'Various exciting watersport activities await you in Banyuwangi. Choose the location and package as you wish!',
      viewPackage: 'See Package'
    },
    about: {
      expYears: 'Years',
      expDesc: 'Serving Experience',
      badge: 'About Us',
      title1: 'Why Choose',
      title2: 'Banyuwangi Watersport?',
      desc: 'With over 10 years of experience, we provide premium watersport services with international safety standards. Every unit is regularly maintained and our guides are officially certified.',
      point1: 'Full insurance for every passenger',
      point2: 'Certified & friendly guides',
      point3: 'Flexible schedule according to your needs',
      point4: 'Well-maintained & clean units every day',
      btnBook: 'Book Now'
    },
    gallery: {
      badge: 'Gallery',
      title: 'Exciting Moments in Banyuwangi',
      desc: 'See the fun watersport activities from our customers.'
    },
    testimonials: {
      badge: 'Testimonials',
      title: 'What They Say About Us',
      desc: 'Thousands of satisfied customers have experienced the thrill of watersport with us.'
    },
    articles: {
      badge: 'Latest Articles',
      title: 'Watersport Info & Tips',
      viewAll: 'View All'
    },
    cta: {
      title: 'Ready for Jetskiing?',
      desc: 'Register now and get the best offers for an unforgettable watersport experience in Banyuwangi!',
      btnRegister: 'Register for Free',
      btnLogin: 'Login & Book'
    },
    footer: {
      desc: 'Premium watersport experiences in the crystal clear waters of Banyuwangi. Your safety and comfort are our priority.',
      quickLinks: 'Quick Links',
      services: 'Services',
      contact: 'Contact Us',
      rights: 'All Rights Reserved'
    }
  }
};

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState('id');

  useEffect(() => {
    const savedLang = localStorage.getItem('app_lang');
    if (savedLang && (savedLang === 'id' || savedLang === 'en')) {
      setLang(savedLang);
    }
  }, []);

  const toggleLanguage = (newLang) => {
    setLang(newLang);
    localStorage.setItem('app_lang', newLang);
  };

  const t = (key) => {
    const keys = key.split('.');
    let value = translations[lang];
    for (const k of keys) {
      if (value === undefined || value[k] === undefined) return key;
      value = value[k];
    }
    return value;
  };

  return (
    <LanguageContext.Provider value={{ lang, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
