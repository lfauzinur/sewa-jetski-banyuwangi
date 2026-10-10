'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, MessageCircle, Phone, Mail, HelpCircle } from 'lucide-react';

const faqItems = [
  { q: 'Bagaimana cara melakukan booking?', a: 'Pilih unit watersport yang diinginkan, pilih tanggal & jam, lalu lanjutkan ke pembayaran.' },
  { q: 'Metode pembayaran apa yang tersedia?', a: 'Kami menerima Transfer Bank (BRI) dan pembayaran via QRIS.' },
  { q: 'Bisa membatalkan booking?', a: 'Pembatalan dapat dilakukan maksimal 24 jam sebelum jadwal yang dipilih.' },
  { q: 'Apakah ada minimal usia untuk bermain jetski?', a: 'Minimal usia 12 tahun dan harus didampingi oleh orang dewasa.' },
  { q: 'Bagaimana jika cuaca buruk?', a: 'Jika cuaca tidak memungkinkan, jadwal akan diatur ulang tanpa biaya tambahan.' },
];

export default function HelpSupportPage() {
  const router = useRouter();
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="min-h-screen bg-white pb-10">
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md pt-10 pb-4 px-6 flex items-center justify-between">
        <button onClick={() => router.back()} className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-[var(--royal)]">
          <ChevronLeft size={24} />
        </button>
        <h1 className="font-bold text-gray-900 text-lg">Help & Support</h1>
        <div className="w-10" />
      </div>

      <div className="px-6 mt-4">
        {/* Contact Cards */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          <a href="https://wa.me/6281234567890" className="bg-emerald-50 rounded-[20px] p-5 flex flex-col items-center text-center hover:bg-emerald-100 transition-colors">
            <MessageCircle size={24} className="text-emerald-600 mb-2" />
            <p className="font-bold text-emerald-800 text-sm">WhatsApp</p>
            <p className="text-[10px] text-emerald-600 mt-0.5">Chat langsung</p>
          </a>
          <a href="tel:+6281234567890" className="bg-blue-50 rounded-[20px] p-5 flex flex-col items-center text-center hover:bg-blue-100 transition-colors">
            <Phone size={24} className="text-blue-600 mb-2" />
            <p className="font-bold text-blue-800 text-sm">Telepon</p>
            <p className="text-[10px] text-blue-600 mt-0.5">08xx-xxxx-xxxx</p>
          </a>
        </div>

        {/* FAQ */}
        <h2 className="font-bold text-gray-900 text-base mb-4">Pertanyaan Umum (FAQ)</h2>
        <div className="space-y-2">
          {faqItems.map((item, i) => (
            <div key={i} className="bg-[#F8FAFC] rounded-[16px] overflow-hidden">
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full p-4 flex items-center justify-between text-left">
                <span className="font-semibold text-gray-900 text-sm pr-4">{item.q}</span>
                <ChevronRight size={16} className={`text-gray-400 transition-transform duration-300 flex-shrink-0 ${openFaq === i ? 'rotate-90' : ''}`} />
              </button>
              {openFaq === i && (
                <div className="px-4 pb-4">
                  <p className="text-xs text-gray-600 leading-relaxed bg-white p-3 rounded-xl">{item.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
