'use client';
import { useState, useEffect } from 'react';
import { 
  Plus, Edit2, Trash2, X, FileText, Layers, MessageSquare, Star, Play, 
  Image as ImageIcon, Tag, Upload, Check, Sparkles, User 
} from 'lucide-react';
import ThemeIcon from '@/components/ThemeIcon';
import { 
  getServices, upsertService, deleteService, 
  getCategories, upsertCategory, deleteCategory, 
  getArticles, upsertArticle, deleteArticle, 
  getPromos, upsertPromo, deletePromo 
} from '@/lib/supabase-data';

// Koleksi Gambar Siap Pakai untuk Kemudahan Admin dengan Icon Senada UI
const WATERSPORT_PRESETS = [
  { name: 'Paddle Board', src: '/images/paddle-board.png', icon: 'waves' },
  { name: 'Jetski WaveRunner', src: '/images/hero-jetski.png', icon: 'zap' },
  { name: 'Banana Boat', src: '/images/gallery-banana-boat.png', icon: 'ship' },
  { name: 'Parasailing', src: '/images/gallery-parasailing.png', icon: 'wind' },
  { name: 'Pantai & Sunset', src: '/images/gallery-sunset.png', icon: 'sun' },
  { name: 'Pulau / Aerial View', src: '/images/gallery-aerial.png', icon: 'palmtree' },
  { name: 'Group Wisatawan', src: '/images/gallery-group.png', icon: 'users' },
];

export default function AdminContent() {
  const [tab, setTab] = useState('articles');
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [services, setServices] = useState([]);
  const [promos, setPromos] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [video, setVideo] = useState({ title: 'CHALLENGE YOURSELF', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' });
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      try {
        const [svc, cats, arts, prms] = await Promise.all([
          getServices(),
          getCategories(),
          getArticles(),
          getPromos(),
        ]);
        setServices(svc || []);
        setCategories(cats || []);
        setArticles(arts || []);
        setPromos((prms || []).map(p => ({ ...p, desc: p.description, bg: p.bg_color })));
      } catch (err) {
        console.error('Failed to load data:', err);
      }

      // LocalStorage data (Testimoni, Galeri, Video)
      const storedTestimonials = localStorage.getItem('admin_testimonials');
      if (storedTestimonials) setTestimonials(JSON.parse(storedTestimonials));
      else {
        const data = require('@/lib/data');
        setTestimonials(data.testimonials || []);
        localStorage.setItem('admin_testimonials', JSON.stringify(data.testimonials || []));
      }

      const storedGallery = localStorage.getItem('admin_gallery');
      if (storedGallery) setGallery(JSON.parse(storedGallery));
      else {
        const defGal = [
          { id: 1, src: '/images/hero-jetski.png', alt: 'Jetski Action', span: 'col-span-2 row-span-2' },
          { id: 2, src: '/images/gallery-group.png', alt: 'Group Ride', span: '' },
          { id: 3, src: '/images/gallery-aerial.png', alt: 'Aerial View', span: '' },
          { id: 4, src: '/images/gallery-banana-boat.png', alt: 'Banana Boat', span: '' },
          { id: 5, src: '/images/gallery-parasailing.png', alt: 'Parasailing', span: '' },
          { id: 6, src: '/images/gallery-sunset.png', alt: 'Sunset View', span: 'col-span-2' },
        ];
        setGallery(defGal);
        localStorage.setItem('admin_gallery', JSON.stringify(defGal));
      }

      const storedVideo = localStorage.getItem('admin_video');
      if (storedVideo) setVideo(JSON.parse(storedVideo));

      setLoading(false);
    };
    loadAll();
  }, []);

  const saveLocal = (key, data, setter) => { 
    setter(data); 
    localStorage.setItem(key, JSON.stringify(data)); 
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const { type, item } = deleteTarget;
    if (type === 'articles') {
      if (await deleteArticle(item.id)) setArticles(prev => prev.filter(a => a.id !== item.id));
    }
    if (type === 'categories') {
      if (await deleteCategory(item.id)) setCategories(prev => prev.filter(c => c.id !== item.id));
    }
    if (type === 'services') {
      if (await deleteService(item.id)) setServices(prev => prev.filter(s => s.id !== item.id));
    }
    if (type === 'promos') {
      if (await deletePromo(item.id)) setPromos(prev => prev.filter(p => p.id !== item.id));
    }
    if (type === 'testimonials') saveLocal('admin_testimonials', testimonials.filter(t => t.id !== item.id), setTestimonials);
    if (type === 'gallery') saveLocal('admin_gallery', gallery.filter(g => g.id !== item.id), setGallery);
    setDeleteTarget(null);
  };

  const handleSave = async (item) => {
    if (tab === 'articles') {
      const result = await upsertArticle(item);
      if (result) {
        if (editItem) setArticles(prev => prev.map(a => a.id === item.id ? result : a));
        else setArticles(prev => [...prev, result]);
      }
    }
    if (tab === 'categories') {
      const result = await upsertCategory(item);
      if (result) {
        if (editItem) setCategories(prev => prev.map(c => c.id === item.id ? result : c));
        else setCategories(prev => [...prev, result]);
      }
    }
    if (tab === 'services') {
      const result = await upsertService(item);
      if (result) {
        if (editItem) setServices(prev => prev.map(s => s.id === item.id ? result : s));
        else setServices(prev => [...prev, result]);
      }
    }
    if (tab === 'promos') {
      const result = await upsertPromo(item);
      if (result) {
        const mapped = { ...result, desc: result.description, bg: result.bg_color };
        if (editItem) setPromos(prev => prev.map(p => p.id === item.id ? mapped : p));
        else setPromos(prev => [...prev, mapped]);
      }
    }
    if (tab === 'testimonials') {
      if (editItem) saveLocal('admin_testimonials', testimonials.map(t => t.id === item.id ? item : t), setTestimonials);
      else saveLocal('admin_testimonials', [...testimonials, { ...item, id: Date.now() }], setTestimonials);
    }
    if (tab === 'gallery') {
      if (editItem) saveLocal('admin_gallery', gallery.map(g => g.id === item.id ? item : g), setGallery);
      else saveLocal('admin_gallery', [...gallery, { ...item, id: Date.now() }], setGallery);
    }
    setShowModal(false);
    setEditItem(null);
  };

  const tabs = [
    { key: 'articles', label: 'Artikel', icon: <FileText size={17} />, count: articles.length, color: 'text-blue-500' },
    { key: 'categories', label: 'Kategori', icon: <Layers size={17} />, count: categories.length, color: 'text-indigo-500' },
    { key: 'promos', label: 'Promo', icon: <Tag size={17} />, count: promos.length, color: 'text-amber-500' },
    { key: 'services', label: 'Layanan', icon: <Star size={17} />, count: services.length, color: 'text-emerald-500' },
    { key: 'gallery', label: 'Galeri', icon: <ImageIcon size={17} />, count: gallery.length, color: 'text-cyan-500' },
    { key: 'video', label: 'Video', icon: <Play size={17} />, count: 1, color: 'text-rose-500' },
    { key: 'testimonials', label: 'Testimoni', icon: <MessageSquare size={17} />, count: testimonials.length, color: 'text-purple-500' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Konten CMS</h2>
          <p className="text-gray-500 text-sm">Kelola artikel, kategori, layanan, galeri foto, video, dan testimoni website.</p>
        </div>
        {tab !== 'video' && (
          <button 
            onClick={() => { setEditItem(null); setShowModal(true); }} 
            className="btn btn-cyan px-4 py-2.5 text-sm flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <Plus size={18} /> Tambah {tabs.find(t => t.key === tab)?.label.split(' ')[0]}
          </button>
        )}
      </div>

      {/* Segmented Tabs Navigation */}
      <div className="bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/80 shadow-inner">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide py-0.5">
          {tabs.map(t => {
            const isActive = tab === t.key;
            return (
              <button 
                key={t.key} 
                onClick={() => setTab(t.key)} 
                className={`
                  flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 cursor-pointer
                  ${isActive 
                    ? 'bg-white text-gray-900 shadow-sm border border-gray-200/80 ring-1 ring-black/5' 
                    : 'text-gray-500 hover:text-gray-900 hover:bg-white/60'
                  }
                `}
              >
                <span className={isActive ? t.color : 'text-gray-400'}>{t.icon}</span>
                <span>{t.label}</span>
                <span className={`
                  text-[11px] px-2 py-0.5 rounded-full font-extrabold transition-colors
                  ${isActive 
                    ? 'bg-[var(--cyan-soft)] text-[var(--teal)]' 
                    : 'bg-gray-200/70 text-gray-600'
                  }
                `}>
                  {t.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ARTIKEL TAB */}
      {tab === 'articles' && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {articles.map(item => (
            <div key={item.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm flex flex-col">
              <div className="relative h-40 bg-gray-100">
                <img src={item.image || '/images/hero-jetski.png'} alt={item.title} className="w-full h-full object-cover" />
              </div>
              <div className="p-4 flex flex-col flex-1">
                <span className="text-[10px] font-bold text-[var(--cyan)] uppercase">{item.category}</span>
                <h3 className="font-bold text-gray-900 text-sm mt-1 line-clamp-2">{item.title}</h3>
                <p className="text-gray-500 text-xs mt-1 line-clamp-2 flex-1">{item.excerpt}</p>
                <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
                  <button onClick={() => { setEditItem(item); setShowModal(true); }} className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-xs font-bold hover:bg-blue-100 cursor-pointer"><Edit2 size={12} /> Edit</button>
                  <button onClick={() => setDeleteTarget({ type: 'articles', item })} className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-rose-50 text-rose-600 text-xs font-bold hover:bg-rose-100 cursor-pointer"><Trash2 size={12} /> Hapus</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* KATEGORI TAB */}
      {tab === 'categories' && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map(item => (
            <div key={item.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm flex flex-col">
              <div className="relative h-40 bg-gray-100">
                <img src={item.image || '/images/hero-jetski.png'} alt={item.name} className="w-full h-full object-cover" />
              </div>
              <div className="p-4 flex flex-col flex-1">
                <h3 className="font-bold text-gray-900 text-sm">{item.name}</h3>
                <p className="text-gray-500 text-xs mt-1 line-clamp-2 flex-1">{item.description}</p>
                <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
                  <button onClick={() => { setEditItem(item); setShowModal(true); }} className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-xs font-bold hover:bg-blue-100 cursor-pointer"><Edit2 size={12} /> Edit</button>
                  <button onClick={() => setDeleteTarget({ type: 'categories', item })} className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-rose-50 text-rose-600 text-xs font-bold hover:bg-rose-100 cursor-pointer"><Trash2 size={12} /> Hapus</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PROMO TAB */}
      {tab === 'promos' && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {promos.map(item => (
            <div key={item.id} className="rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex flex-col">
              <div className={`${item.bg || 'bg-blue-500'} p-5 h-36 relative overflow-hidden flex flex-col justify-between`}>
                <div className="absolute -top-6 -right-6 w-20 h-20 bg-white/10 rounded-full blur-lg"></div>
                <div className="flex items-center gap-2">
                  <div className="bg-white/20 p-1.5 rounded-lg text-white text-xs backdrop-blur-sm flex items-center justify-center">
                    <ThemeIcon name={item.icon || 'ticket'} size={14} className="text-white" />
                  </div>
                  <span className="text-xs text-white/80 font-bold uppercase tracking-widest">{item.subtitle}</span>
                </div>
                <h3 className="text-white text-lg font-black whitespace-pre-line leading-tight">{item.title}</h3>
              </div>
              <div className="bg-white p-4 flex flex-col flex-1">
                <p className="text-gray-500 text-xs line-clamp-2 flex-1">{item.desc}</p>
                <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
                  <button onClick={() => { setEditItem(item); setShowModal(true); }} className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-xs font-bold hover:bg-blue-100 cursor-pointer"><Edit2 size={12} /> Edit</button>
                  <button onClick={() => setDeleteTarget({ type: 'promos', item })} className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-rose-50 text-rose-600 text-xs font-bold hover:bg-rose-100 cursor-pointer"><Trash2 size={12} /> Hapus</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* LAYANAN TAB */}
      {tab === 'services' && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map(item => {
            // Smart display image fallback if user set paddle/padle
            const serviceImage = (item.image && item.image !== '/images/hero-jetski.png')
              ? item.image
              : (item.name?.toLowerCase().includes('paddle') || item.name?.toLowerCase().includes('padle'))
                ? '/images/paddle-board.png'
                : (item.image || '/images/hero-jetski.png');

            return (
              <div key={item.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm flex flex-col">
                <div className="relative h-44 bg-gray-100">
                  <img src={serviceImage} alt={item.name} className="w-full h-full object-cover" />
                  {item.category && (
                    <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-[10px] font-bold text-[var(--royal)] uppercase shadow-sm">
                      {item.category}
                    </div>
                  )}
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-bold text-gray-900 text-base">{item.name}</h3>
                  <div className="text-gray-500 text-xs mt-1.5 flex items-center gap-1.5 flex-wrap">
                    <span className="w-5 h-5 rounded-md bg-cyan-50 text-[var(--cyan)] flex items-center justify-center shrink-0">
                      <ThemeIcon name={item.icon || 'waves'} size={12} />
                    </span>
                    <span>{item.duration}</span>
                    <span>•</span>
                    <span className="font-bold text-[var(--teal)]">Rp {(item.price || 0).toLocaleString('id-ID')}</span>
                  </div>
                  {item.details && (
                    <div className="text-gray-400 text-[11px] mt-2 line-clamp-2 flex items-start gap-1">
                      <FileText size={11} className="text-gray-400 shrink-0 mt-0.5" />
                      <span>{item.details.split('\n').join(', ')}</span>
                    </div>
                  )}
                  <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
                    <button onClick={() => { setEditItem(item); setShowModal(true); }} className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-xs font-bold hover:bg-blue-100 cursor-pointer"><Edit2 size={12} /> Edit</button>
                    <button onClick={() => setDeleteTarget({ type: 'services', item })} className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-rose-50 text-rose-600 text-xs font-bold hover:bg-rose-100 cursor-pointer"><Trash2 size={12} /> Hapus</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* GALERI TAB */}
      {tab === 'gallery' && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {gallery.map(item => (
            <div key={item.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm flex flex-col">
              <div className="relative h-44 bg-gray-100">
                <img src={item.src} alt={item.alt} className="w-full h-full object-cover" />
              </div>
              <div className="p-4 flex flex-col flex-1">
                <h3 className="font-bold text-gray-900 text-sm">{item.alt || 'Foto Galeri'}</h3>
                <p className="text-gray-400 text-xs mt-1">Grid span: {item.span || 'Normal'}</p>
                <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
                  <button onClick={() => { setEditItem(item); setShowModal(true); }} className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-xs font-bold hover:bg-blue-100 cursor-pointer"><Edit2 size={12} /> Edit</button>
                  <button onClick={() => setDeleteTarget({ type: 'gallery', item })} className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-rose-50 text-rose-600 text-xs font-bold hover:bg-rose-100 cursor-pointer"><Trash2 size={12} /> Hapus</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TESTIMONI TAB */}
      {tab === 'testimonials' && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {testimonials.map(item => (
            <div key={item.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex flex-col">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-lg overflow-hidden shrink-0 border border-gray-200">
                  {item.avatar && (item.avatar.startsWith('data:') || item.avatar.startsWith('http') || item.avatar.startsWith('/')) ? (
                    <img src={item.avatar} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <User size={18} className="text-gray-400" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">{item.name}</h3>
                  <p className="text-gray-500 text-xs">{item.role}</p>
                </div>
              </div>
              <div className="flex gap-0.5 mb-2">{Array(item.rating).fill(0).map((_, i) => <Star key={i} size={12} className="text-amber-400" fill="currentColor" />)}</div>
              <p className="text-gray-600 text-xs line-clamp-3 italic flex-1">&ldquo;{item.text}&rdquo;</p>
              <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
                <button onClick={() => { setEditItem(item); setShowModal(true); }} className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-xs font-bold hover:bg-blue-100 cursor-pointer"><Edit2 size={12} /> Edit</button>
                <button onClick={() => setDeleteTarget({ type: 'testimonials', item })} className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-rose-50 text-rose-600 text-xs font-bold hover:bg-rose-100 cursor-pointer"><Trash2 size={12} /> Hapus</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* VIDEO TAB */}
      {tab === 'video' && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm max-w-2xl">
          <h3 className="font-bold text-gray-900 text-lg mb-4">Pengaturan Video Landing Page</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">Judul / Tagline</label>
              <input type="text" value={video.title} onChange={e => setVideo({...video, title: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">URL Video (Youtube Embed)</label>
              <input type="text" value={video.url} onChange={e => setVideo({...video, url: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm" />
            </div>
            <button onClick={() => {
              localStorage.setItem('admin_video', JSON.stringify(video));
              alert('Pengaturan video berhasil disimpan!');
            }} className="btn btn-cyan px-6 py-2.5 text-sm mt-2 cursor-pointer">Simpan Perubahan Video</button>
          </div>
        </div>
      )}

      {/* MODAL TAMBAH / EDIT */}
      {showModal && (
        <ContentFormModal 
          tab={tab} 
          item={editItem} 
          onSave={handleSave} 
          onClose={() => { setShowModal(false); setEditItem(null); }} 
          categories={categories} 
        />
      )}

      {/* DELETE CONFIRM */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="font-bold text-gray-900 text-lg mb-2">Hapus Item?</h3>
            <p className="text-gray-500 text-sm mb-6">Apakah Anda yakin ingin menghapus item ini? Tindakan ini tidak dapat dibatalkan.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 cursor-pointer">Batal</button>
              <button onClick={handleDelete} className="flex-1 px-4 py-2.5 bg-rose-500 text-white rounded-xl text-sm font-bold hover:bg-rose-600 cursor-pointer">Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Komponen Reusable untuk Upload Foto & Pilih Preset
function ImageUploadField({ label = 'Foto / Gambar', value, onChange, presets = WATERSPORT_PRESETS, hint = '' }) {
  const [urlInput, setUrlInput] = useState('');
  const [showUrlBox, setShowUrlBox] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Mohon pilih file gambar (JPG, PNG, WebP).');
      return;
    }

    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = () => {
        // Resize canvas to max 1200px width/height for high quality & small file size
        const canvas = document.createElement('canvas');
        const maxDim = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        onChange(dataUrl);
        setIsProcessing(false);
      };
      img.src = readerEvent.target.result;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
          {label} *
        </label>
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="text-[11px] font-bold text-rose-500 hover:underline cursor-pointer"
          >
            Hapus Foto
          </button>
        )}
      </div>

      {/* Preview Box */}
      <div className="relative w-full h-44 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 overflow-hidden flex flex-col items-center justify-center group">
        {value ? (
          <>
            <img 
              src={value} 
              alt="Preview" 
              className="w-full h-full object-cover" 
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <label 
                htmlFor={`file-upload-${label}`}
                className="bg-white text-gray-800 text-xs font-bold px-3 py-1.5 rounded-xl cursor-pointer hover:bg-gray-100 shadow-md flex items-center gap-1.5"
              >
                <Upload size={13} /> Ganti Foto
              </label>
            </div>
          </>
        ) : (
          <div className="text-center p-4">
            <div className="w-10 h-10 rounded-full bg-cyan-50 text-[var(--teal)] flex items-center justify-center mx-auto mb-2">
              <ImageIcon size={20} />
            </div>
            <p className="text-xs font-bold text-gray-700">Belum ada foto dipilih</p>
            <p className="text-[11px] text-gray-400 mt-0.5">Unggah dari perangkat atau klik salah satu foto di bawah</p>
          </div>
        )}

        {isProcessing && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-xs flex items-center justify-center">
            <span className="text-xs font-bold text-gray-700 animate-pulse">Memproses foto...</span>
          </div>
        )}
      </div>

      <input 
        id={`file-upload-${label}`}
        type="file" 
        accept="image/*" 
        className="hidden" 
        onChange={handleFileChange}
      />

      {/* Action Buttons: Upload & Input URL */}
      <div className="flex items-center gap-2 pt-1">
        <label
          htmlFor={`file-upload-${label}`}
          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold py-2 px-3 rounded-xl cursor-pointer text-center flex items-center justify-center gap-1.5 transition-colors border border-gray-200"
        >
          <Upload size={14} className="text-gray-600" />
          <span>Upload dari Komputer / HP</span>
        </label>
        <button
          type="button"
          onClick={() => setShowUrlBox(!showUrlBox)}
          className="bg-white hover:bg-gray-50 text-gray-600 text-xs font-bold py-2 px-3 rounded-xl border border-gray-200 transition-colors cursor-pointer"
        >
          {showUrlBox ? 'Tutup URL' : 'Input URL'}
        </button>
      </div>

      {/* URL Input Box */}
      {showUrlBox && (
        <div className="flex gap-2 pt-1 animate-fadeIn">
          <input 
            type="url" 
            placeholder="https://... atau /images/..." 
            value={urlInput}
            onChange={e => setUrlInput(e.target.value)}
            className="flex-1 px-3 py-1.5 border border-gray-200 rounded-xl text-xs outline-none focus:border-cyan-500 font-mono"
          />
          <button
            type="button"
            onClick={() => {
              if (urlInput.trim()) {
                onChange(urlInput.trim());
                setShowUrlBox(false);
              }
            }}
            className="bg-gray-800 hover:bg-black text-white px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer"
          >
            Gunakan
          </button>
        </div>
      )}

      {/* Presets List */}
      {presets.length > 0 && (
        <div className="pt-2">
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
            Pilihan Foto Siap Pakai (Klik untuk Memilih):
          </p>
          <div className="flex flex-wrap gap-1.5">
            {presets.map((preset, idx) => {
              const isSelected = value === preset.src;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onChange(preset.src)}
                  className={`text-xs px-2.5 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                    isSelected 
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-2 ring-emerald-200' 
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 ${
                    isSelected ? 'bg-emerald-100 text-emerald-700' : 'bg-cyan-50 text-[var(--cyan)]'
                  }`}>
                    <ThemeIcon name={preset.icon || 'waves'} size={12} />
                  </span>
                  <span>{preset.name}</span>
                  {isSelected && <Check size={12} className="text-emerald-600" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {hint && <p className="text-[10px] text-gray-400">{hint}</p>}
    </div>
  );
}

// Komponen Khusus Upload Avatar Testimoni dengan Kompresi Ketat (Maks 160x160 px, ~5-12 KB)
function AvatarUploadField({ value, onChange }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const isImage = value && (value.startsWith('data:') || value.startsWith('http') || value.startsWith('/'));

  const handleAvatarFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Mohon pilih file gambar (JPG, PNG, WebP).');
      return;
    }

    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = () => {
        // Strict resize to 160x160 square to prevent bloating DB or hosting (<15KB)
        const canvas = document.createElement('canvas');
        const targetSize = 160;
        canvas.width = targetSize;
        canvas.height = targetSize;
        const ctx = canvas.getContext('2d');

        // Center square crop
        const minDim = Math.min(img.width, img.height);
        const startX = (img.width - minDim) / 2;
        const startY = (img.height - minDim) / 2;

        ctx.drawImage(img, startX, startY, minDim, minDim, 0, 0, targetSize, targetSize);
        // Compress as JPEG 0.75 for ultra-lightweight size (~8KB)
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.75);
        onChange(compressedDataUrl);
        setIsProcessing(false);
      };
      img.src = readerEvent.target.result;
    };
    reader.readAsDataURL(file);
  };


  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
          Avatar / Foto Tamu
        </label>
        <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full font-bold border border-emerald-100">
          Auto-Kompres 160x160px (&lt;15 KB)
        </span>
      </div>

      <div className="flex items-center gap-3.5 p-3 bg-gray-50 rounded-2xl border border-gray-100">
        {/* Circle Avatar Preview */}
        <div className="relative w-14 h-14 rounded-full bg-white shadow-sm border-2 border-white ring-2 ring-gray-200 overflow-hidden flex items-center justify-center text-2xl flex-shrink-0">
          {isImage ? (
            <img src={value} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <User size={24} className="text-gray-400" />
          )}
          {isProcessing && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-xs flex items-center justify-center">
              <span className="text-[10px] font-bold text-gray-700 animate-pulse">...</span>
            </div>
          )}
        </div>

        <div className="flex-1 space-y-1.5 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <input 
              id="avatar-file-input"
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleAvatarFile} 
            />
            <label
              htmlFor="avatar-file-input"
              className="bg-white hover:bg-gray-100 text-gray-800 text-xs font-bold py-1.5 px-3 rounded-xl cursor-pointer border border-gray-200 shadow-2xs flex items-center gap-1.5 transition-colors"
            >
              <Upload size={13} className="text-gray-600" />
              <span>{isImage ? 'Ganti Foto' : 'Upload Foto Avatar'}</span>
            </label>
            {isImage && (
              <button
                type="button"
                onClick={() => onChange('')}
                className="text-xs font-bold text-rose-500 hover:underline px-1.5 py-1 cursor-pointer"
              >
                Hapus Foto
              </button>
            )}
          </div>
          <p className="text-[11px] text-gray-400 leading-tight">
            Foto otomatis di-crop bulat & dikompres sangat ringan agar hemat database.
          </p>
        </div>
      </div>

    </div>
  );
}

// Modal Form Tambah / Edit Konten
function ContentFormModal({ tab, item, onSave, onClose, categories = [] }) {
  const isEdit = !!item;
  const getDefaults = () => {
    if (tab === 'articles') return { id: '', title: '', slug: '', excerpt: '', date: new Date().toISOString().split('T')[0], category: 'Tips & Trik', image: '/images/hero-jetski.png', readTime: '5 menit' };
    if (tab === 'categories') return { id: '', name: '', slug: '', description: '', image: '/images/hero-jetski.png' };
    if (tab === 'services') return { id: '', name: '', slug: '', description: '', price: 0, duration: '30 menit', image: '/images/hero-jetski.png', icon: 'waves', details: 'Guide Profesional\nPelampung\nAir Mineral', category: categories.length > 0 ? categories[0].slug : 'safari-packages' };
    if (tab === 'promos') return { id: '', title: '', subtitle: '', desc: '', bg: 'bg-blue-500', icon: 'ticket' };
    if (tab === 'gallery') return { id: '', src: '/images/gallery-group.png', alt: '', span: '' };
    return { id: '', name: '', role: '', avatar: '', rating: 5, text: '' };
  };

  const [form, setForm] = useState(item || getDefaults());
  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = () => {
    if (tab === 'articles' && !form.slug) form.slug = form.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    if (tab === 'categories' && !form.slug) form.slug = form.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    if (tab === 'services' && !form.slug) form.slug = form.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    onSave(form);
  };

  const inputClass = "w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-[var(--cyan)] focus:ring-2 focus:ring-[var(--cyan)]/20 outline-none";

  // Label Title Modal
  const modalTitle = isEdit 
    ? `Edit ${tab === 'articles' ? 'Artikel' : tab === 'categories' ? 'Kategori' : tab === 'promos' ? 'Promo' : tab === 'services' ? 'Layanan' : tab === 'gallery' ? 'Galeri' : 'Testimoni'}`
    : `Tambah ${tab === 'articles' ? 'Artikel' : tab === 'categories' ? 'Kategori' : tab === 'promos' ? 'Promo' : tab === 'services' ? 'Layanan' : tab === 'gallery' ? 'Galeri' : 'Testimoni'}`;

  return (
    <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white rounded-t-3xl z-10">
          <h3 className="font-bold text-gray-900 text-lg">{modalTitle}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center cursor-pointer">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* TAB ARTIKEL */}
          {tab === 'articles' && (<>
            <ImageUploadField 
              label="Thumbnail Artikel" 
              value={form.image} 
              onChange={val => set('image', val)} 
            />
            <div><label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Judul Artikel *</label><input type="text" required value={form.title} onChange={e => set('title', e.target.value)} className={inputClass} placeholder="Contoh: 5 Tips Bermain Jetski Aman" /></div>
            <div><label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Ringkasan / Excerpt</label><textarea rows={2} value={form.excerpt} onChange={e => set('excerpt', e.target.value)} className={`${inputClass} resize-none`} placeholder="Ringkasan singkat artikel..." /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Kategori</label><input type="text" value={form.category} onChange={e => set('category', e.target.value)} className={inputClass} /></div>
              <div><label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Tanggal</label><input type="date" value={form.date} onChange={e => set('date', e.target.value)} className={inputClass} /></div>
            </div>
          </>)}

          {/* TAB KATEGORI */}
          {tab === 'categories' && (<>
            <ImageUploadField 
              label="Foto Cover Kategori" 
              value={form.image} 
              onChange={val => set('image', val)} 
            />
            <div><label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Nama Kategori *</label><input type="text" required value={form.name} onChange={e => set('name', e.target.value)} className={inputClass} placeholder="Contoh: Jetski di Pantai Boom" /></div>
            <div><label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Deskripsi Kategori</label><textarea rows={3} value={form.description} onChange={e => set('description', e.target.value)} className={`${inputClass} resize-none`} placeholder="Jelaskan daya tarik kategori watersport ini..." /></div>
          </>)}

          {/* TAB LAYANAN */}
          {tab === 'services' && (<>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Kategori (Pilih Kategori di Landing Page)</label>
              <select value={form.category || ''} onChange={e => set('category', e.target.value)} className={`${inputClass} bg-white`}>
                {categories.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
              </select>
            </div>

            <ImageUploadField 
              label="Foto Layanan Watersport" 
              value={form.image} 
              onChange={val => set('image', val)} 
            />

            <div><label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Nama Layanan *</label><input type="text" required value={form.name} onChange={e => set('name', e.target.value)} className={inputClass} placeholder="Contoh: Paddle Board, Banana Boat..." /></div>
            <div><label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Deskripsi Layanan</label><textarea rows={2} value={form.description} onChange={e => set('description', e.target.value)} className={`${inputClass} resize-none`} placeholder="Deskripsi serunya wahana..." /></div>
            <div><label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Detail / Include (Pisahkan dengan baris baru)</label><textarea rows={3} value={form.details || ''} onChange={e => set('details', e.target.value)} placeholder="Guide Profesional&#10;Pelampung&#10;Air Mineral" className={`${inputClass} resize-none`} /></div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Harga (Rp)</label>
                <input 
                  type="text" 
                  inputMode="numeric"
                  value={form.price ? Number(form.price).toLocaleString('id-ID') : ''} 
                  onChange={e => {
                    const raw = e.target.value.replace(/\D/g, '');
                    set('price', raw ? parseInt(raw, 10) : 0);
                  }} 
                  placeholder="0"
                  className={inputClass} 
                />
              </div>
              <div><label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Durasi</label><input type="text" value={form.duration} onChange={e => set('duration', e.target.value)} className={inputClass} placeholder="30 menit" /></div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Icon Layanan</label>
                <div className="relative">
                  <select 
                    value={form.icon || 'waves'} 
                    onChange={e => set('icon', e.target.value)} 
                    className={`${inputClass} bg-white pl-9 text-xs`}
                  >
                    <option value="waves">Waves (Ombak / Air)</option>
                    <option value="zap">Zap (Speed / Jetski)</option>
                    <option value="ship">Boat (Banana Boat)</option>
                    <option value="wind">Wind (Parasailing)</option>
                    <option value="compass">Compass (Safari Tour)</option>
                    <option value="sun">Sun (Sunset View)</option>
                    <option value="users">Users (Group)</option>
                    <option value="sparkles">Sparkles (VIP)</option>
                  </select>
                  <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--cyan)]">
                    <ThemeIcon name={form.icon || 'waves'} size={15} />
                  </div>
                </div>
              </div>
            </div>
          </>)}

          {/* TAB PROMO */}
          {tab === 'promos' && (<>
            <div><label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Judul Promo *</label><input type="text" required value={form.title} onChange={e => set('title', e.target.value)} className={inputClass} placeholder="DISKON 30%" /></div>
            <div><label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Subtitle (Kategori)</label><input type="text" value={form.subtitle} onChange={e => set('subtitle', e.target.value)} className={inputClass} placeholder="Jetski Adventure" /></div>
            <div><label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Deskripsi</label><textarea rows={2} value={form.desc} onChange={e => set('desc', e.target.value)} className={`${inputClass} resize-none`} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Warna Background</label>
                <select value={form.bg} onChange={e => set('bg', e.target.value)} className={`${inputClass} bg-white`}>
                  <option value="bg-blue-500">Biru</option>
                  <option value="bg-cyan-500">Cyan</option>
                  <option value="bg-emerald-500">Hijau</option>
                  <option value="bg-amber-500">Kuning</option>
                  <option value="bg-rose-500">Merah</option>
                  <option value="bg-violet-500">Ungu</option>
                  <option value="bg-orange-500">Oranye</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Icon Badge Promo</label>
                <div className="relative">
                  <select 
                    value={form.icon || 'ticket'} 
                    onChange={e => set('icon', e.target.value)} 
                    className={`${inputClass} bg-white pl-9 text-xs`}
                  >
                    <option value="ticket">Ticket (Tiket & Voucher)</option>
                    <option value="percent">Percent (Diskon %)</option>
                    <option value="gift">Gift (Beli 1 Gratis 1 / Hadiah)</option>
                    <option value="sparkles">Sparkles (Spesial VIP)</option>
                    <option value="zap">Zap (Flash Sale / Kilat)</option>
                    <option value="tag">Tag (Penawaran Khusus)</option>
                  </select>
                  <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--cyan)]">
                    <ThemeIcon name={form.icon || 'ticket'} size={15} />
                  </div>
                </div>
              </div>
            </div>
          </>)}

          {/* TAB TESTIMONI */}
          {tab === 'testimonials' && (<>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Nama Tamu *</label><input type="text" required value={form.name} onChange={e => set('name', e.target.value)} className={inputClass} /></div>
              <div><label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Peran / Asal Kota</label><input type="text" value={form.role} onChange={e => set('role', e.target.value)} className={inputClass} placeholder="Wisatawan Surabaya" /></div>
            </div>
            {/* Avatar Upload Field dengan Auto-Resize */}
            <AvatarUploadField 
              value={form.avatar} 
              onChange={val => set('avatar', val)} 
            />

            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Rating Kepuasan</label>
              <select value={form.rating} onChange={e => set('rating', parseInt(e.target.value))} className={`${inputClass} bg-white`}>
                {[1,2,3,4,5].map(r => <option key={r} value={r}>{r} Bintang</option>)}
              </select>
            </div>
            <div><label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Ulasan / Testimoni *</label><textarea rows={3} required value={form.text} onChange={e => set('text', e.target.value)} className={`${inputClass} resize-none`} /></div>
          </>)}

          {/* TAB GALERI */}
          {tab === 'gallery' && (<>
            <ImageUploadField 
              label="Foto Galeri" 
              value={form.src} 
              onChange={val => set('src', val)} 
            />
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Judul Foto / Alt Text *</label>
              <input 
                type="text" 
                required 
                value={form.alt} 
                onChange={e => set('alt', e.target.value)} 
                className={inputClass} 
                placeholder="Contoh: Keseruan Bermain Jetski di Pantai Boom" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Tata Letak Grid Span (Opsional)</label>
              <select value={form.span} onChange={e => set('span', e.target.value)} className={`${inputClass} bg-white`}>
                <option value="">Normal (1 Kotak)</option>
                <option value="col-span-2">Lebar 2 Kolom</option>
                <option value="row-span-2">Tinggi 2 Baris</option>
                <option value="col-span-2 row-span-2">Lebar 2 Kolom & Tinggi 2 Baris (Besar)</option>
              </select>
            </div>
          </>)}
        </div>

        <div className="flex gap-3 p-6 border-t border-gray-100 sticky bottom-0 bg-white rounded-b-3xl">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 cursor-pointer">Batal</button>
          <button onClick={handleSubmit} className="flex-1 btn btn-cyan py-2.5 text-sm cursor-pointer">{isEdit ? 'Simpan Perubahan' : 'Tambahkan'}</button>
        </div>
      </div>
    </div>
  );
}
