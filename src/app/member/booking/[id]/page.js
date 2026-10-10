'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { jetskiUnits, watersportServices, timeSlots, generateBookingId } from '@/lib/data';
import { getAddons } from '@/lib/supabase-data';

const generateCalendar = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstDay = new Date(year, month, 1).getDay(); 
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  // Mon-Sun grid offset
  const startOffset = firstDay === 0 ? 6 : firstDay - 1;
  
  const days = [];
  for (let i = 0; i < startOffset; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    const d = new Date(year, month, i);
    days.push({
      dateNum: i,
      fullDate: d.toISOString().split('T')[0],
      isAvailable: d >= new Date(new Date().setHours(0,0,0,0)), // Past days unavailable
    });
  }
  return { monthName: today.toLocaleDateString('en-US', { month: 'short' }), days };
};

export default function BookingPage({ params }) {
  const router = useRouter();
  const [calendar, setCalendar] = useState({ monthName: '', days: [] });
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState('Pantai Boom');
  const [isProcessing, setIsProcessing] = useState(false);
  const [unit, setUnit] = useState(null);
  const [addons, setAddons] = useState([]);
  const [selectedAddons, setSelectedAddons] = useState([]);
  
  useEffect(() => {
    const unwrapParams = async () => {
      const { id } = await params;
      const storedUnits = localStorage.getItem('admin_units');
      const storedServices = localStorage.getItem('admin_services');
      const units = storedUnits ? JSON.parse(storedUnits) : jetskiUnits;
      const services = storedServices ? JSON.parse(storedServices) : watersportServices;
      const allItems = [...units, ...services];
      const found = allItems.find(u => u.id === id || u.slug === id) || allItems[0];
      setUnit(found);
    }
    unwrapParams();

    const cal = generateCalendar();
    setCalendar(cal);
    
    // Select today if available, else first available
    const todayStr = new Date().toISOString().split('T')[0];
    const todayAvailable = cal.days.find(d => d && d.fullDate === todayStr && d.isAvailable);
    if (todayAvailable) {
      setSelectedDate(todayStr);
    } else {
      const firstAvailable = cal.days.find(d => d && d.isAvailable);
      if (firstAvailable) setSelectedDate(firstAvailable.fullDate);
    }
    
    const fetchAddonsData = async () => {
      const dbAddons = await getAddons();
      setAddons(dbAddons.filter(a => a.active));
    };
    fetchAddonsData();
  }, [params]);

  if (!unit) return null;

  const handleBooking = () => {
    if (!selectedDate || !selectedTime) return;
    setIsProcessing(true);

    setTimeout(() => {
      const basePrice = unit.price || unit.pricePerSlot;
      const addonsPrice = selectedAddons.reduce((sum, addon) => sum + (addon.price * addon.quantity), 0);
      const uniqueCode = Math.floor(Math.random() * 900) + 100;
      const totalPrice = basePrice + addonsPrice + uniqueCode;

      const user = JSON.parse(localStorage.getItem('user') || '{"name":"Guest","email":"guest@example.com","phone":"-"}');
      const bookingData = {
        id: generateBookingId(),
        customerName: user.name,
        customerEmail: user.email,
        customerPhone: user.phone,
        unit: unit.name,
        location: selectedLocation,
        date: selectedDate,
        timeSlot: timeSlots.find(t => t.id === selectedTime)?.time,
        basePrice,
        addons: selectedAddons,
        addonsPrice,
        uniqueCode,
        totalPrice,
        status: 'pending_payment',
        timestamp: new Date().toISOString()
      };
      
      localStorage.setItem('current_checkout', JSON.stringify(bookingData));
      router.push(`/member/booking/payment`);
    }, 1000);
  };

  const getSlotStatus = (slotId) => {
    if (!selectedDate) return 'available';
    const dateNum = parseInt(selectedDate.split('-')[2]);
    const isBooked = (dateNum + parseInt(slotId.split('-')[1])) % 7 === 0; // Mock booked slots
    return isBooked ? 'booked' : 'available';
  };

  const toggleAddon = (addon) => {
    setSelectedAddons(prev => {
      const exists = prev.find(a => a.id === addon.id);
      if (exists) {
        return prev.filter(a => a.id !== addon.id);
      } else {
        return [...prev, { ...addon, quantity: 1 }];
      }
    });
  };

  const currentBasePrice = unit.price || unit.pricePerSlot;
  const currentAddonsPrice = selectedAddons.reduce((sum, a) => sum + (a.price * a.quantity), 0);
  const currentTotal = currentBasePrice + currentAddonsPrice;

  return (
    <div className="bg-white min-h-screen pb-32">
      {/* Top Header - Like Dribbble */}
      <div className="pt-10 pb-6 px-6 flex items-center justify-between sticky top-0 bg-white/90 backdrop-blur-md z-30">
        <button onClick={() => router.back()} className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-[var(--royal)] hover:bg-gray-100 transition-colors shadow-sm">
          <ChevronLeft size={24} />
        </button>
        <h1 className="font-bold text-gray-900 text-lg">Book Now</h1>
        <div className="w-10" /> {/* Spacer */}
      </div>

      {/* Optional: Small Unit Card so they know what they are booking */}
      <div className="px-6 mb-8">
        <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-2xl border border-gray-100">
          <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-white">
            <Image src={unit.image} alt={unit.name} fill className="object-cover" />
          </div>
          <div>
            <h2 className="font-bold text-gray-900 text-sm">{unit.name}</h2>
            <p className="text-xs text-gray-500">{unit.duration || '30 Menit'}</p>
          </div>
        </div>
      </div>

      {/* Details / Includes */}
      {unit.details && (
        <div className="px-6 mb-8">
          <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50">
            <h3 className="text-xs font-bold text-[var(--cyan)] uppercase tracking-wider mb-3">Termasuk di Layanan:</h3>
            <ul className="space-y-2">
              {unit.details.split('\n').map((detail, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-sm text-gray-700 font-medium">
                  <CheckCircle2 size={16} className="text-[var(--cyan)] shrink-0 mt-0.5" />
                  <span>{detail}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Select Location */}
      <div className="px-6 mb-8">
        <h2 className="font-bold text-gray-900 text-base mb-4">Pilih Lokasi Bermain</h2>
        <div className="flex gap-3">
          <button 
            onClick={() => setSelectedLocation('Pantai Boom')}
            className={`flex-1 p-4 rounded-2xl border-2 text-center transition-all ${selectedLocation === 'Pantai Boom' ? 'border-[var(--royal)] bg-blue-50/50 text-[var(--royal)]' : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200'}`}
          >
            <div className="font-bold text-sm mb-1">Pantai Boom</div>
            <div className="text-[10px] opacity-70">Banyuwangi Kota</div>
          </button>
          <button 
            onClick={() => setSelectedLocation('Pulau Tabuhan')}
            className={`flex-1 p-4 rounded-2xl border-2 text-center transition-all ${selectedLocation === 'Pulau Tabuhan' ? 'border-[var(--royal)] bg-blue-50/50 text-[var(--royal)]' : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200'}`}
          >
            <div className="font-bold text-sm mb-1">Pulau Tabuhan</div>
            <div className="text-[10px] opacity-70">Wongsorejo</div>
          </button>
        </div>
      </div>

      {/* Select Dates */}
      <div className="px-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-900 text-base">Select dates</h2>
          <div className="flex items-center gap-2 text-gray-500">
            <ChevronLeft size={16} />
            <span className="text-sm font-medium">{calendar.monthName}</span>
            <ChevronRight size={16} />
          </div>
        </div>
        
        {/* Weekdays */}
        <div className="grid grid-cols-7 gap-1 text-center mb-3">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
            <div key={day} className="text-[10px] font-semibold text-gray-400 uppercase">{day}</div>
          ))}
        </div>
        
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-y-4 gap-x-1 text-center">
          {calendar.days.map((day, i) => {
            if (!day) return <div key={`empty-${i}`} className="h-8" />;
            const isSelected = selectedDate === day.fullDate;
            return (
              <div key={i} className="flex justify-center">
                <button
                  disabled={!day.isAvailable}
                  onClick={() => setSelectedDate(day.fullDate)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                    !day.isAvailable
                      ? 'text-gray-300 cursor-not-allowed'
                      : isSelected
                        ? 'bg-[var(--royal)] text-white shadow-md shadow-blue-500/30'
                        : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {day.dateNum}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="w-full h-[1px] bg-gray-100 mb-8 mx-6" style={{ width: 'calc(100% - 48px)' }} />

      {/* Available Time Slots */}
      <div className="px-6 mb-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bold text-gray-900 text-base">Available Time slots</h2>
          <div className="flex items-center gap-2 text-gray-500">
            <ChevronLeft size={16} />
            <span className="text-sm font-medium">Morning</span>
            <ChevronRight size={16} />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {timeSlots.map(slot => {
            const status = getSlotStatus(slot.id);
            const isSelected = selectedTime === slot.id;
            return (
              <button
                key={slot.id}
                disabled={status === 'booked'}
                onClick={() => setSelectedTime(slot.id)}
                className={`py-3 rounded-[14px] text-[11px] font-bold border-[1.5px] transition-all ${
                  status === 'booked'
                    ? 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed'
                    : isSelected
                      ? 'border-[var(--royal)] bg-[#F0F5FF] text-[var(--royal)]'
                      : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                {slot.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Add-ons Section */}
      {addons.length > 0 && (
        <div className="px-6 mb-10">
          <h2 className="font-bold text-gray-900 text-base mb-4">Tambahan (Add-ons)</h2>
          <div className="space-y-3">
            {addons.map(addon => {
              const isSelected = selectedAddons.some(a => a.id === addon.id);
              return (
                <div 
                  key={addon.id} 
                  onClick={() => toggleAddon(addon)}
                  className={`p-4 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all ${
                    isSelected ? 'border-[var(--royal)] bg-[#F0F5FF]' : 'border-gray-100 bg-white hover:border-gray-200'
                  }`}
                >
                  <div>
                    <h3 className={`text-sm font-bold ${isSelected ? 'text-[var(--royal)]' : 'text-gray-900'}`}>{addon.name}</h3>
                    <p className="text-xs text-gray-500 mt-1 max-w-[200px]">{addon.description}</p>
                    <p className="text-xs font-bold text-amber-500 mt-1">+Rp {addon.price.toLocaleString('id-ID')}</p>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-[var(--royal)] bg-[var(--royal)] text-white' : 'border-gray-300'}`}>
                    {isSelected && <CheckCircle2 size={14} />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Floating Bottom Bar - Dribbble Style */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl p-6 pt-4 z-40 sm:w-[400px] sm:left-1/2 sm:-ml-[200px] sm:absolute sm:rounded-b-[40px] shadow-[0_-10px_20px_rgba(0,0,0,0.05)] border-t border-gray-100">
        <div className="mb-4">
          <p className="text-xs font-bold text-gray-600 mb-0.5">Total Fair</p>
          <p className="text-3xl font-black text-amber-500 tracking-tight">
            Rp {currentTotal.toLocaleString('id-ID')}
          </p>
        </div>
        
        <button
          onClick={handleBooking}
          disabled={!selectedDate || !selectedTime || isProcessing}
          className="w-full bg-[var(--royal)] text-white py-4 rounded-2xl font-bold text-base shadow-[0_8px_20px_rgba(37,99,235,0.25)] disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2 transition-all hover:bg-blue-700"
        >
          {isProcessing ? 'Processing...' : 'Book Now'} <ArrowLeft size={18} className="rotate-180" />
        </button>
      </div>
    </div>
  );
}
