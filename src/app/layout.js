import "./globals.css";
import { COMPANY } from "@/lib/data";
import { LanguageProvider } from "@/context/LanguageContext";

export const metadata = {
  title: `${COMPANY.name} — Sewa Jetski & Watersport Terbaik di Banyuwangi`,
  description: "Nikmati pengalaman watersport premium di Banyuwangi, Banyuwangi. Sewa Jetski, Banana Boat, Parasailing & lainnya dengan harga terbaik dan guide berpengalaman. Booking online sekarang!",
  keywords: "sewa jetski bali, watersport Banyuwangi, banana boat bali, parasailing bali, jetski bali murah, water sport bali",
  openGraph: {
    title: `${COMPANY.name} — Sewa Jetski & Watersport Terbaik di Banyuwangi`,
    description: "Sewa Jetski & Watersport Premium di Banyuwangi, Banyuwangi. Booking online sekarang!",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#3366FF" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body className="antialiased">
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
