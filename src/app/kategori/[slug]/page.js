'use client';
import { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { watersportCategories, watersportServices, formatCurrency } from '@/lib/data';
import { getCategories, getServicesByCategory, getServices } from '@/lib/supabase-data';
import { useLanguage } from '@/context/LanguageContext';

function CategoryDetailContent() {
  const { t, lang } = useLanguage();
  const params = useParams();
  const slug = params?.slug;
  const [category, setCategory] = useState(null);
  const [displayItems, setDisplayItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    
    const loadData = async () => {
      // Try to load category from Supabase first
      const cats = await getCategories();
      let cat = cats.find(c => c.slug === slug);
      
      // Fallback to static data
      if (!cat) {
        cat = watersportCategories.find(c => c.slug === slug);
      }
      
      if (!cat) {
        setLoading(false);
        return;
      }
      
      setCategory(cat);
      
      // Load services from Supabase filtered by category
      const catServices = await getServicesByCategory(cat.slug);
      
      if (catServices && catServices.length > 0) {
        setDisplayItems(catServices);
      } else {
        // Fallback: load all services
        const allServices = await getServices();
        if (allServices && allServices.length > 0) {
          const filtered = allServices.filter(s => s.category === cat.slug || s.category === cat.name);
          setDisplayItems(filtered.length > 0 ? filtered : allServices);
        } else {
          setDisplayItems(watersportServices);
        }
      }
      
      setLoading(false);
    };
    
    loadData();
  }, [slug]);

  if (loading) return <div className="min-h-screen pt-24 bg-[var(--bg-secondary)] text-center">Loading...</div>;

  if (!category) return (
    <div className="min-h-screen pt-24 bg-[var(--bg-secondary)] text-center">
      <h1 className="text-2xl font-bold">Kategori Tidak Ditemukan</h1>
      <Link href="/" className="mt-4 text-[var(--cyan)] underline">Kembali ke Beranda</Link>
    </div>
  );

  return (
    <div className="pt-24 pb-20 min-h-screen bg-[var(--bg-secondary)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/" className="inline-flex items-center text-sm font-semibold text-[var(--cyan)] hover:text-[var(--teal)] mb-8 transition-colors">
          <ArrowLeft size={16} className="mr-2" /> {t('nav.home')}
        </Link>
        
        {/* Category Header */}
        <div className="relative rounded-3xl overflow-hidden mb-12 h-64 sm:h-80 shadow-lg group">
          <Image 
            src={category.image} 
            alt={category.name} 
            fill 
            className="object-cover transition-transform duration-1000 group-hover:scale-105"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8 sm:p-12">
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white mb-4">
              {lang === 'en' ? category.nameEn || category.name : category.name}
            </h1>
            <p className="text-gray-200 text-lg max-w-2xl leading-relaxed">
              {lang === 'en' ? category.descriptionEn || category.description : category.description}
            </p>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {lang === 'en' ? 'Available Packages & Services' : 'Paket & Layanan Tersedia'}
          </h2>
          <p className="text-gray-500">
            {lang === 'en' ? 'Choose the package that best fits your vacation style in this category.' : 'Pilih paket yang paling sesuai dengan gaya liburan Anda di kategori ini.'}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayItems.length > 0 ? displayItems.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group border border-gray-100 flex flex-col">
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={item.image || '/images/hero-jetski.png'}
                  alt={item.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-bold text-[var(--teal)]">
                  {lang === 'en' ? item.durationEn || item.duration || 'Product' : item.duration || 'Produk'}
                </div>
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <h3 className="font-bold text-gray-900 text-xl mb-2">
                  {lang === 'en' ? item.nameEn || item.name : item.name}
                </h3>
                <p className="text-gray-500 text-sm mb-4 flex-grow">
                  {lang === 'en' ? item.descriptionEn || item.description : item.description}
                </p>
                
                {/* DETAILS / INCLUDES */}
                {(lang === 'en' ? item.detailsEn || item.details : item.details) && (
                  <div className="mb-4 bg-blue-50/50 p-4 rounded-xl border border-blue-100/50">
                    <p className="text-[10px] font-bold text-[var(--cyan)] uppercase tracking-wider mb-2">
                      {lang === 'en' ? 'Includes:' : 'Termasuk:'}
                    </p>
                    <ul className="space-y-1">
                      {(lang === 'en' ? item.detailsEn || item.details : item.details).split('\n').map((detail, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-gray-700">
                          <CheckCircle2 size={14} className="text-[var(--cyan)] shrink-0 mt-0.5" />
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                  <div>
                    <span className="text-[10px] text-gray-400 block uppercase tracking-wider font-semibold">
                      {lang === 'en' ? 'Price' : 'Harga'}
                    </span>
                    <span className="text-lg font-extrabold text-[var(--teal)]">{formatCurrency(item.price || item.pricePerSlot || 0)}</span>
                  </div>
                  <Link
                    href="/login"
                    className="btn btn-cyan px-4 py-2 text-sm"
                  >
                    {lang === 'en' ? 'Book Now' : 'Booking'}
                  </Link>
                </div>
              </div>
            </div>
          )) : (
            <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-dashed border-gray-300">
               <p className="text-gray-500">
                 {lang === 'en' ? 'No packages available for this category yet.' : 'Belum ada paket tersedia untuk kategori ini.'}
               </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CategoryDetail() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-24 bg-[var(--bg-secondary)] text-center">Loading...</div>}>
      <CategoryDetailContent />
    </Suspense>
  );
}
