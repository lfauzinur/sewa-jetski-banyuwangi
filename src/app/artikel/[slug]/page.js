import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Calendar, Clock, User } from 'lucide-react';
import { articles, watersportServices, formatCurrency } from '@/lib/data';
import { notFound } from 'next/navigation';

export const instant = false;

export function generateStaticParams() {
  return articles.map((article) => ({
    slug: article.slug,
  }));
}

export default async function ArticleDetail({ params }) {
  const { slug } = await params;
  const article = articles.find(a => a.slug === slug);

  if (!article) {
    notFound();
  }

  return (
    <div className="pt-24 pb-20 min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/" className="inline-flex items-center text-sm font-semibold text-[var(--cyan)] hover:text-[var(--teal)] mb-8 transition-colors">
          <ArrowLeft size={16} className="mr-2" /> Kembali ke Beranda
        </Link>
        
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-gray-100">
          <div className="relative h-64 sm:h-96 w-full">
            <Image 
              src={article.image} 
              alt={article.title} 
              fill 
              className="object-cover"
              priority
            />
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-full text-xs font-bold text-[var(--teal)]">
              {article.category}
            </div>
          </div>
          
          <div className="p-8 sm:p-12">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-6 leading-tight">
              {article.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 mb-10 pb-8 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-[var(--cyan)]" />
                {new Date(article.date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-[var(--cyan)]" />
                {article.readTime} membaca
              </div>
              <div className="flex items-center gap-2">
                <User size={16} className="text-[var(--cyan)]" />
                Admin
              </div>
            </div>
            
            <div className="prose prose-lg max-w-none prose-a:text-[var(--cyan)] prose-headings:text-gray-900 prose-img:rounded-xl text-gray-600 mb-16">
              <p className="text-xl text-gray-700 font-medium mb-6 leading-relaxed">
                {article.excerpt}
              </p>
              <p className="mb-6 leading-relaxed">
                Banyuwangi terus berkembang menjadi surga bagi para pecinta olahraga air (watersport). Dengan pesona pantai-pantainya yang masih alami dan ombak yang bervariasi, tempat ini menawarkan sensasi yang tak kalah menarik dibandingkan destinasi populer lainnya.
              </p>
              <h3 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Mengapa Harus Mencoba?</h3>
              <p className="mb-6 leading-relaxed">
                Selain pemandangan laut biru dan hamparan pulau Bali di seberang selat yang menjadi latar belakang indah, fasilitas jetski dan wahana lain di sini sangat terawat dan dikawal oleh guide profesional. Anda tidak perlu khawatir tentang keamanan!
              </p>
              <p className="leading-relaxed">
                Jadi tunggu apalagi? Jadwalkan liburan Anda berikutnya dan pastikan Anda memasukkan petualangan watersport ke dalam itinerary Anda. Jangan ragu untuk menghubungi kami untuk penawaran paket khusus.
              </p>
            </div>

            {/* RELATED PACKAGES TO BOOK */}
            <div className="pt-10 border-t border-gray-100 mt-10">
              <h3 className="text-2xl font-extrabold text-gray-900 mb-6">Paket Watersport Pilihan</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {watersportServices.slice(0, 2).map((item) => (
                  <div key={item.id} className="flex gap-4 p-4 rounded-2xl border border-gray-100 hover:shadow-lg transition-shadow group bg-gray-50/50">
                    <div className="relative w-24 h-24 rounded-xl overflow-hidden shrink-0">
                      <Image src={item.image} alt={item.name} fill className="object-cover group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="flex flex-col flex-grow py-1">
                      <h4 className="font-bold text-gray-900 mb-1 line-clamp-1">{item.name}</h4>
                      <p className="text-sm font-bold text-[var(--teal)] mb-auto">{formatCurrency(item.price)}</p>
                      <Link href="/login" className="text-xs font-bold bg-[var(--cyan-soft)] text-[var(--cyan)] py-1.5 px-3 rounded-full text-center hover:bg-[var(--cyan)] hover:text-white transition-colors mt-2">
                        Booking Sekarang
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
