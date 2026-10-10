'use client';
import { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Calendar, Clock, User } from 'lucide-react';
import { articles as fallbackArticles } from '@/lib/data';

function MemberArticleDetailContent() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug;
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    
    // Load from local storage first to sync with admin
    const storedArticles = localStorage.getItem('admin_articles');
    let allArticles = fallbackArticles;
    
    if (storedArticles) {
      allArticles = JSON.parse(storedArticles);
    }
    
    // Find the article by slug or id
    const found = allArticles.find(a => a.slug === slug || a.id.toString() === slug);
    
    if (found) {
      setArticle(found);
    }
    
    setLoading(false);
  }, [slug]);

  if (loading) {
    return <div className="min-h-screen bg-[#F5F8FF] flex items-center justify-center font-sans">Loading...</div>;
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-[#F5F8FF] font-sans">
        <div className="bg-white px-5 py-4 flex items-center justify-between shadow-sm sticky top-0 z-50">
          <Link href="/member/articles" className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-700 hover:bg-gray-100">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="font-extrabold text-gray-900 text-lg">Artikel Tidak Ditemukan</h1>
        </div>
        <div className="p-10 text-center text-gray-500">
          Maaf, artikel yang Anda cari tidak tersedia.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F8FF] pb-24 font-sans">
      {/* Header Sticky */}
      <div className="bg-white px-5 py-4 flex items-center justify-between shadow-sm sticky top-0 z-50">
        <button onClick={() => router.back()} className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-700 hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div className="text-[10px] font-bold text-white bg-[var(--cyan)] px-3 py-1 rounded-full uppercase tracking-wider">
          {article.category || 'TIPS'}
        </div>
      </div>

      {/* Hero Image */}
      <div className="relative w-full h-64 bg-gray-900">
        <Image 
          src={article.image || '/images/hero-jetski.png'} 
          alt={article.title} 
          fill 
          className="object-cover" 
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60"></div>
      </div>

      {/* Content Area - Overlapping */}
      <div className="-mt-10 relative z-20 px-5">
        <div className="bg-white rounded-[32px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100">
          
          <h1 className="text-2xl font-black text-gray-900 leading-tight mb-4">{article.title}</h1>
          
          <div className="flex flex-wrap items-center gap-4 text-[11px] font-bold text-gray-500 mb-6 pb-6 border-b border-gray-100">
            <div className="flex items-center gap-1.5">
              <Calendar size={14} className="text-[var(--royal)]" />
              {article.date ? new Date(article.date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Hari ini'}
            </div>
            <div className="flex items-center gap-1.5">
              <Clock size={14} className="text-[var(--royal)]" />
              {article.readTime || '5 menit membaca'}
            </div>
            <div className="flex items-center gap-1.5">
              <User size={14} className="text-[var(--royal)]" />
              Admin
            </div>
          </div>
          
          <div className="prose prose-sm prose-p:text-gray-600 prose-p:leading-relaxed prose-headings:text-gray-900 prose-a:text-[var(--cyan)] max-w-none">
            <p className="text-sm font-semibold text-gray-800 mb-4">{article.excerpt}</p>
            
            {/* For CMS generated articles that might just have excerpt, we show some dummy content if real body is empty */}
            {article.content ? (
              <div dangerouslySetInnerHTML={{ __html: article.content }} />
            ) : (
              <>
                <p className="mb-4">Banyuwangi terus berkembang menjadi surga bagi para pecinta olahraga air (watersport). Dengan pesona pantai-pantainya yang masih alami dan ombak yang bervariasi, tempat ini menawarkan sensasi yang tak kalah menarik dibandingkan destinasi populer lainnya.</p>
                <h3 className="text-lg font-bold text-gray-900 mt-6 mb-3">Mengapa Harus Mencoba?</h3>
                <p className="mb-4">Selain pemandangan laut biru dan hamparan pulau Bali di seberang selat yang menjadi latar belakang indah, fasilitas jetski dan wahana lain di sini sangat terawat dan dikawal oleh guide profesional. Anda tidak perlu khawatir tentang keamanan!</p>
                <p>Jadi tunggu apalagi? Jadwalkan liburan Anda berikutnya dan pastikan Anda memasukkan petualangan watersport ke dalam itinerary Anda. Jangan ragu untuk menghubungi kami untuk penawaran paket khusus.</p>
              </>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}

export default function MemberArticleDetail() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F5F8FF] flex items-center justify-center font-sans">Loading...</div>}>
      <MemberArticleDetailContent />
    </Suspense>
  );
}
