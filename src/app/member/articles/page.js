'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { articles as fallbackArticles } from '@/lib/data';

export default function MemberArticlesList() {
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    const storedArticles = localStorage.getItem('admin_articles');
    if (storedArticles) setArticles(JSON.parse(storedArticles));
    else setArticles(fallbackArticles || []);
  }, []);

  return (
    <div className="min-h-screen bg-[#F5F8FF] pb-24 font-sans">
      {/* Header */}
      <div className="bg-white px-5 py-4 flex items-center justify-between shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Link href="/member" className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-700 hover:bg-gray-100 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="font-extrabold text-gray-900 text-lg">Semua Artikel</h1>
        </div>
      </div>

      <div className="p-5">
        <p className="text-sm text-gray-500 mb-6">Jelajahi informasi terbaru, tips, dan panduan seputar jetski dan watersport di Banyuwangi.</p>
        
        <div className="space-y-4">
          {articles.map((article) => (
            <Link href={`/member/articles/${article.slug || article.id}`} key={article.id} className="bg-white rounded-[24px] p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50 hover:shadow-md transition-all group flex flex-col sm:flex-row gap-4">
              <div className="relative w-full sm:w-32 h-40 sm:h-24 rounded-[16px] overflow-hidden bg-gray-100 flex-shrink-0">
                <Image src={article.image || '/images/hero-jetski.png'} alt={article.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 640px) 100vw, 128px" />
                <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-[10px] font-bold text-[var(--royal)] uppercase shadow-sm">
                  {article.category || 'Tips'}
                </div>
              </div>
              
              <div className="flex-1 py-1 flex flex-col">
                <h3 className="font-extrabold text-gray-900 text-base leading-tight mb-2 group-hover:text-[var(--royal)] transition-colors">{article.title}</h3>
                <p className="text-gray-500 text-xs line-clamp-2 mb-3">{article.excerpt}</p>
                
                <div className="mt-auto flex items-center justify-between">
                  <span className="text-[10px] font-bold text-gray-400">{article.date ? new Date(article.date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Baru'}</span>
                  <div className="w-6 h-6 bg-blue-50 rounded-full flex items-center justify-center text-[var(--royal)]">
                    <ChevronRight size={14} />
                  </div>
                </div>
              </div>
            </Link>
          ))}
          
          {articles.length === 0 && (
            <div className="text-center py-10 bg-white rounded-[24px] border border-gray-100">
              <p className="text-gray-500 text-sm font-medium">Belum ada artikel.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
