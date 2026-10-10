'use client';
import { useRouter } from 'next/navigation';
import { ChevronLeft, FileText, Shield, Scale } from 'lucide-react';

const sections = [
  {
    icon: <FileText size={20} />,
    title: 'Syarat & Ketentuan',
    content: `Dengan menggunakan layanan Sewa Jetski Banyuwangi, Anda menyetujui syarat dan ketentuan berikut:\n\n1. Penyewa wajib berusia minimal 17 tahun dan memiliki identitas yang valid.\n2. Penyewa bertanggung jawab atas keselamatan diri sendiri dan penumpang selama penggunaan.\n3. Kerusakan yang disebabkan oleh kelalaian penyewa menjadi tanggung jawab penyewa.\n4. Pembatalan booking minimal 24 jam sebelum jadwal.\n5. Operator berhak membatalkan sesi jika kondisi cuaca tidak memungkinkan.\n6. Penyewa wajib menggunakan pelampung keselamatan yang disediakan.`,
  },
  {
    icon: <Shield size={20} />,
    title: 'Kebijakan Privasi',
    content: `Kami menghormati privasi Anda. Data yang dikumpulkan:\n\n• Nama, email, dan nomor telepon untuk keperluan booking.\n• Data pembayaran untuk verifikasi transaksi.\n• Riwayat booking untuk peningkatan layanan.\n\nKami tidak akan membagikan data Anda kepada pihak ketiga tanpa persetujuan Anda.`,
  },
  {
    icon: <Scale size={20} />,
    title: 'Kebijakan Refund',
    content: `Kebijakan pengembalian dana:\n\n• Pembatalan >24 jam sebelum jadwal: Refund 100%.\n• Pembatalan 12-24 jam sebelum jadwal: Refund 50%.\n• Pembatalan <12 jam sebelum jadwal: Tidak ada refund.\n• Pembatalan karena cuaca buruk oleh operator: Refund 100% atau reschedule gratis.`,
  },
];

export default function TermsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white pb-10">
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md pt-10 pb-4 px-6 flex items-center justify-between">
        <button onClick={() => router.back()} className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-[var(--royal)]">
          <ChevronLeft size={24} />
        </button>
        <h1 className="font-bold text-gray-900 text-lg">Terms & Policies</h1>
        <div className="w-10" />
      </div>

      <div className="px-6 mt-4 space-y-6">
        {sections.map((section, i) => (
          <div key={i} className="bg-[#F8FAFC] rounded-[24px] p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#F0F5FF] rounded-xl flex items-center justify-center text-[var(--royal)]">
                {section.icon}
              </div>
              <h2 className="font-bold text-gray-900 text-sm">{section.title}</h2>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">{section.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
