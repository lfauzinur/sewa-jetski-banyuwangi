'use client';
import { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode';
import { formatCurrency } from '@/lib/data';
import { Scan, CheckCircle, XCircle, User, Calendar, MapPin, Search } from 'lucide-react';

export default function AdminScanner() {
  const [scanResult, setScanResult] = useState(null);
  const [bookingError, setBookingError] = useState(null);
  const [scannedBooking, setScannedBooking] = useState(null);
  const [isScanning, setIsScanning] = useState(true);
  const scannerRef = useRef(null);
  const [manualId, setManualId] = useState('');

  useEffect(() => {
    let html5QrCode;

    if (isScanning && !scanResult) {
      setTimeout(() => {
        html5QrCode = new Html5Qrcode("qr-reader");
        const config = { fps: 10, qrbox: { width: 250, height: 250 } };
        
        // Auto-start camera
        html5QrCode.start(
          { facingMode: "environment" }, 
          config, 
          onScanSuccess, 
          onScanFailure
        ).catch(err => {
          console.error("Camera start failed", err);
          // Fallback message if camera access denied
        });
        
        scannerRef.current = html5QrCode;
      }, 500);
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().then(() => {
          scannerRef.current.clear();
        }).catch(e => console.log('Failed to stop scanner', e));
        scannerRef.current = null;
      }
    };
  }, [isScanning, scanResult]);

  const processBookingId = (id) => {
    setScanResult(id);
    setIsScanning(false);
    
    // Look up booking in local storage
    const bookings = JSON.parse(localStorage.getItem('admin_bookings') || '[]');
    const found = bookings.find(b => b.id === id);
    
    if (found) {
      setScannedBooking(found);
      setBookingError(null);
    } else {
      setScannedBooking(null);
      setBookingError(`Tiket dengan ID ${id} tidak ditemukan di database.`);
    }
  };

  const onScanSuccess = (decodedText) => {
    // Stop scanning once successful
    processBookingId(decodedText);
  };

  const onScanFailure = (error) => {
    // Ignore frequent scan errors when no QR is in sight
  };

  const handleManualSearch = (e) => {
    e.preventDefault();
    if (manualId.trim()) {
      processBookingId(manualId.trim());
    }
  };

  const handleReset = () => {
    setScanResult(null);
    setScannedBooking(null);
    setBookingError(null);
    setManualId('');
    setIsScanning(true);
  };

  const updateStatus = (newStatus) => {
    if (!scannedBooking) return;
    const bookings = JSON.parse(localStorage.getItem('admin_bookings') || '[]');
    const updated = bookings.map(b => b.id === scannedBooking.id ? { ...b, status: newStatus } : b);
    localStorage.setItem('admin_bookings', JSON.stringify(updated));
    setScannedBooking({ ...scannedBooking, status: newStatus });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Scan Tiket Member</h2>
        <p className="text-gray-500 text-sm">Arahkan kamera ke QR Code yang ada di aplikasi Member untuk memverifikasi pesanan.</p>
      </div>

      {!scanResult && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h3 className="font-bold text-gray-900 flex items-center gap-2"><Scan size={18} className="text-[var(--cyan)]" /> Scanner Kamera</h3>
          </div>
          <div className="p-6 flex flex-col items-center justify-center">
            <div id="qr-reader" className="w-full max-w-sm overflow-hidden rounded-xl border-2 border-gray-100"></div>
            
            <div className="w-full max-w-sm mt-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-px bg-gray-200 flex-1"></div>
                <span className="text-xs font-bold text-gray-400 uppercase">ATAU</span>
                <div className="h-px bg-gray-200 flex-1"></div>
              </div>
              
              <form onSubmit={handleManualSearch} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input 
                    type="text" 
                    placeholder="Masukkan ID Booking manual..." 
                    value={manualId}
                    onChange={(e) => setManualId(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[var(--cyan)] focus:ring-1 focus:ring-[var(--cyan)]"
                  />
                </div>
                <button type="submit" className="bg-gray-900 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors">Cek</button>
              </form>
            </div>
          </div>
        </div>
      )}

      {scanResult && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex justify-between items-start mb-6">
            <h3 className="font-bold text-gray-900 text-lg">Hasil Scan</h3>
            <button onClick={handleReset} className="bg-gray-100 text-gray-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-gray-200 transition-colors">Scan Lagi</button>
          </div>

          {bookingError ? (
            <div className="bg-rose-50 border border-rose-100 rounded-xl p-6 text-center">
              <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4 text-rose-500">
                <XCircle size={32} />
              </div>
              <h4 className="font-bold text-gray-900 text-lg mb-1">Tiket Tidak Valid</h4>
              <p className="text-sm text-gray-600 mb-4">{bookingError}</p>
            </div>
          ) : (
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              {/* Header Status */}
              <div className={`p-4 flex items-center gap-3 border-b border-gray-200 ${
                scannedBooking.status === 'confirmed' ? 'bg-emerald-50' : 
                scannedBooking.status === 'completed' ? 'bg-blue-50' :
                scannedBooking.status === 'cancelled' ? 'bg-rose-50' : 'bg-amber-50'
              }`}>
                {scannedBooking.status === 'confirmed' || scannedBooking.status === 'completed' ? (
                  <CheckCircle size={24} className={scannedBooking.status === 'confirmed' ? 'text-emerald-500' : 'text-blue-500'} />
                ) : (
                  <span className={`w-3 h-3 rounded-full ${scannedBooking.status === 'cancelled' ? 'bg-rose-500' : 'bg-amber-500'}`} />
                )}
                <div>
                  <h4 className="font-bold text-gray-900 leading-tight">
                    {scannedBooking.status === 'confirmed' ? 'Tiket Valid - Siap Main' : 
                     scannedBooking.status === 'completed' ? 'Selesai Dimainkan' :
                     scannedBooking.status === 'cancelled' ? 'Dibatalkan' : 'Menunggu Konfirmasi Pembayaran'}
                  </h4>
                  <p className="text-xs text-gray-500 uppercase font-semibold">ID: {scannedBooking.id}</p>
                </div>
              </div>

              {/* Data Grid */}
              <div className="p-6 grid sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase mb-1 flex items-center gap-1"><User size={12}/> Pelanggan</p>
                  <p className="font-semibold text-gray-900">{scannedBooking.customerName}</p>
                  <p className="text-sm text-gray-500">{scannedBooking.customerPhone}</p>
                  <p className="text-sm text-gray-500">{scannedBooking.customerEmail}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase mb-1 flex items-center gap-1"><MapPin size={12}/> Unit & Lokasi</p>
                  <p className="font-semibold text-[var(--royal)]">{scannedBooking.unit}</p>
                  <p className="text-sm text-gray-700 font-medium bg-gray-100 inline-block px-2 py-0.5 rounded mt-1">{scannedBooking.location || 'Pantai Boom'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase mb-1 flex items-center gap-1"><Calendar size={12}/> Jadwal</p>
                  <p className="font-semibold text-gray-900">{new Date(scannedBooking.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  <p className="text-sm font-bold text-amber-600 bg-amber-50 inline-block px-2 py-0.5 rounded mt-1">{scannedBooking.timeSlot}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase mb-1">Total Biaya</p>
                  <p className="font-extrabold text-2xl text-gray-900">{formatCurrency(scannedBooking.totalPrice)}</p>
                  {scannedBooking.uniqueCode && <p className="text-xs text-gray-400 mt-0.5">Kode Unik: {scannedBooking.uniqueCode}</p>}
                </div>
              </div>

              {/* Actions */}
              <div className="p-4 bg-gray-50 flex gap-3 border-t border-gray-200">
                {scannedBooking.status === 'pending' && (
                  <button onClick={() => updateStatus('confirmed')} className="flex-1 bg-emerald-500 text-white font-bold text-sm py-3 rounded-xl shadow-sm shadow-emerald-500/20 hover:bg-emerald-600 transition-colors">
                    Konfirmasi Pembayaran
                  </button>
                )}
                {scannedBooking.status === 'confirmed' && (
                  <button onClick={() => updateStatus('completed')} className="flex-1 bg-blue-500 text-white font-bold text-sm py-3 rounded-xl shadow-sm shadow-blue-500/20 hover:bg-blue-600 transition-colors">
                    Tandai Selesai Bermain
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
