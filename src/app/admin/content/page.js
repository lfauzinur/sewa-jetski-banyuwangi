'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Plus, Edit2, Trash2, X, FileText, Layers, MessageSquare, Star, Play, Image as ImageIcon, Tag } from 'lucide-react';

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

  useEffect(() => {
    // Load from localStorage or seed from data.js
    const loadData = (key, fallbackImport) => {
      const stored = localStorage.getItem(key);
      if (stored) return JSON.parse(stored);
      const data = require('@/lib/data');
      const val = data[fallbackImport];
      localStorage.setItem(key, JSON.stringify(val));
      return val;
    };
    setArticles(loadData('admin_articles', 'articles'));
    setCategories(loadData('admin_categories', 'watersportCategories'));
    setTestimonials(loadData('admin_testimonials', 'testimonials'));
    setServices(loadData('admin_services', 'watersportServices'));

    const storedPromos = localStorage.getItem('admin_promos');
    if (storedPromos) setPromos(JSON.parse(storedPromos));
    else {
      const defPromos = [
        { id: 1, title: 'BELI 1\nGRATIS 1', subtitle: 'Jetski Adventure', desc: 'Ajak teman & keluarga! Beli 1 tiket, gratis 1 tiket lagi. Berlaku weekdays.', bg: 'bg-blue-500', icon: '🎫' },
        { id: 2, title: 'PAKET VOUCHER\nLANGGANAN EKSKLUSIF', subtitle: 'Member VIP', desc: 'Hemat Lebih Banyak Setiap Hari! Nikmati Diskon Mingguan.', bg: 'bg-cyan-500', icon: '🎟️' },
      ];
      setPromos(defPromos);
      localStorage.setItem('admin_promos', JSON.stringify(defPromos));
    }
    
    // Custom non-data.js loads
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
  }, []);

  const save = (key, data, setter) => { setter(data); localStorage.setItem(key, JSON.stringify(data)); };

  const handleDelete = () => {
    if (!deleteTarget) return;
    const { type, item } = deleteTarget;
    if (type === 'articles') save('admin_articles', articles.filter(a => a.id !== item.id), setArticles);
    if (type === 'categories') save('admin_categories', categories.filter(c => c.id !== item.id), setCategories);
    if (type === 'testimonials') save('admin_testimonials', testimonials.filter(t => t.id !== item.id), setTestimonials);
    if (type === 'services') save('admin_services', services.filter(s => s.id !== item.id), setServices);
    if (type === 'promos') save('admin_promos', promos.filter(p => p.id !== item.id), setPromos);
    if (type === 'gallery') save('admin_gallery', gallery.filter(g => g.id !== item.id), setGallery);
    setDeleteTarget(null);
  };

  const handleSave = (item) => {
    if (tab === 'articles') {
      if (editItem) save('admin_articles', articles.map(a => a.id === item.id ? item : a), setArticles);
      else save('admin_articles', [...articles, { ...item, id: Date.now() }], setArticles);
    }
    if (tab === 'categories') {
      if (editItem) save('admin_categories', categories.map(c => c.id === item.id ? item : c), setCategories);
      else save('admin_categories', [...categories, { ...item, id: `cat-${Date.now()}` }], setCategories);
    }
    if (tab === 'testimonials') {
      if (editItem) save('admin_testimonials', testimonials.map(t => t.id === item.id ? item : t), setTestimonials);
      else save('admin_testimonials', [...testimonials, { ...item, id: Date.now() }], setTestimonials);
    }
    if (tab === 'services') {
      if (editItem) save('admin_services', services.map(s => s.id === item.id ? item : s), setServices);
      else save('admin_services', [...services, { ...item, id: `ws-${Date.now()}` }], setServices);
    }
    if (tab === 'promos') {
      if (editItem) save('admin_promos', promos.map(p => p.id === item.id ? item : p), setPromos);
      else save('admin_promos', [...promos, { ...item, id: Date.now() }], setPromos);
    }
    if (tab === 'gallery') {
      if (editItem) save('admin_gallery', gallery.map(g => g.id === item.id ? item : g), setGallery);
      else save('admin_gallery', [...gallery, { ...item, id: Date.now() }], setGallery);
    }
    setShowModal(false);
    setEditItem(null);
  };

  const tabs = [
    { key: 'articles', label: 'Artikel', icon: <FileText size={16} />, count: articles.length },
    { key: 'categories', label: 'Kategori', icon: <Layers size={16} />, count: categories.length },
    { key: 'promos', label: 'Promo', icon: <Tag size={16} />, count: promos.length },
    { key: 'services', label: 'Layanan', icon: <Star size={16} />, count: services.length },
    { key: 'gallery', label: 'Galeri', icon: <ImageIcon size={16} />, count: gallery.length },
    { key: 'video', label: 'Video', icon: <Play size={16} />, count: 1 },
    { key: 'testimonials', label: 'Testimoni (Gambar 4)', icon: <MessageSquare size={16} />, count: testimonials.length },
  ];

  const currentData = tab === 'articles' ? articles : tab === 'categories' ? categories : tab === 'services' ? services : tab === 'gallery' ? gallery : testimonials;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Konten CMS</h2>
          <p className="text-gray-500 text-sm">Kelola artikel, kategori, layanan, galeri, video, dan testimoni website.</p>
        </div>
        {tab !== 'video' && (
          <button onClick={() => { setEditItem(null); setShowModal(true); }} className="btn btn-cyan px-4 py-2.5 text-sm flex items-center gap-2 shadow-sm">
            <Plus size={18} /> Tambah {tabs.find(t => t.key === tab)?.label.split(' ')[0]}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all border ${tab === t.key ? 'bg-[var(--cyan)] text-white border-[var(--cyan)] shadow-md' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}>
            {t.icon} {t.label} <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${tab === t.key ? 'bg-white/20' : 'bg-gray-100'}`}>{t.count}</span>
          </button>
        ))}
      </div>

      {/* Content Grid */}
      {tab === 'articles' && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {articles.map(item => (
            <div key={item.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
              <div className="relative h-36"><Image src={item.image} alt={item.title} fill className="object-cover" sizes="33vw" /></div>
              <div className="p-4">
                <span className="text-[10px] font-bold text-[var(--cyan)] uppercase">{item.category}</span>
                <h3 className="font-bold text-gray-900 text-sm mt-1 line-clamp-2">{item.title}</h3>
                <p className="text-gray-500 text-xs mt-1 line-clamp-2">{item.excerpt}</p>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => { setEditItem(item); setShowModal(true); }} className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-xs font-bold hover:bg-blue-100"><Edit2 size={12} /> Edit</button>
                  <button onClick={() => setDeleteTarget({ type: 'articles', item })} className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-rose-50 text-rose-600 text-xs font-bold hover:bg-rose-100"><Trash2 size={12} /> Hapus</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'categories' && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map(item => (
            <div key={item.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
              <div className="relative h-36"><Image src={item.image} alt={item.name} fill className="object-cover" sizes="33vw" /></div>
              <div className="p-4">
                <h3 className="font-bold text-gray-900 text-sm">{item.name}</h3>
                <p className="text-gray-500 text-xs mt-1 line-clamp-2">{item.description}</p>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => { setEditItem(item); setShowModal(true); }} className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-xs font-bold hover:bg-blue-100"><Edit2 size={12} /> Edit</button>
                  <button onClick={() => setDeleteTarget({ type: 'categories', item })} className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-rose-50 text-rose-600 text-xs font-bold hover:bg-rose-100"><Trash2 size={12} /> Hapus</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'promos' && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {promos.map(item => (
            <div key={item.id} className={`rounded-2xl overflow-hidden shadow-sm border border-gray-100`}>
              <div className={`${item.bg || 'bg-blue-500'} p-5 h-36 relative overflow-hidden`}>
                <div className="absolute -top-6 -right-6 w-20 h-20 bg-white/10 rounded-full blur-lg"></div>
                <span className="text-xs text-white/70 font-bold uppercase tracking-widest">{item.subtitle}</span>
                <h3 className="text-white text-lg font-black mt-1 whitespace-pre-line leading-tight">{item.title}</h3>
              </div>
              <div className="bg-white p-4">
                <p className="text-gray-500 text-xs line-clamp-2">{item.desc}</p>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => { setEditItem(item); setShowModal(true); }} className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-xs font-bold hover:bg-blue-100"><Edit2 size={12} /> Edit</button>
                  <button onClick={() => setDeleteTarget({ type: 'promos', item })} className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-rose-50 text-rose-600 text-xs font-bold hover:bg-rose-100"><Trash2 size={12} /> Hapus</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'services' && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map(item => (
            <div key={item.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
              <div className="relative h-36">
                <Image src={item.image} alt={item.name} fill className="object-cover" sizes="33vw" />
                {item.category && (
                  <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-[10px] font-bold text-[var(--royal)] uppercase shadow-sm">
                    {item.category}
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-bold text-gray-900 text-sm">{item.name}</h3>
                <p className="text-gray-500 text-xs mt-1">{item.icon} {item.duration} • Rp {(item.price || 0).toLocaleString('id-ID')}</p>
                {item.details && (
                  <p className="text-gray-400 text-[10px] mt-1 line-clamp-1">📋 {item.details.split('\n').join(', ')}</p>
                )}
                <div className="flex gap-2 mt-3">
                  <button onClick={() => { setEditItem(item); setShowModal(true); }} className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-xs font-bold hover:bg-blue-100"><Edit2 size={12} /> Edit</button>
                  <button onClick={() => setDeleteTarget({ type: 'services', item })} className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-rose-50 text-rose-600 text-xs font-bold hover:bg-rose-100"><Trash2 size={12} /> Hapus</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'testimonials' && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {testimonials.map(item => (
            <div key={item.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-lg">{item.avatar}</div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">{item.name}</h3>
                  <p className="text-gray-500 text-xs">{item.role}</p>
                </div>
              </div>
              <div className="flex gap-0.5 mb-2">{Array(item.rating).fill(0).map((_, i) => <Star key={i} size={12} className="text-amber-400" fill="currentColor" />)}</div>
              <p className="text-gray-600 text-xs line-clamp-3 italic">&ldquo;{item.text}&rdquo;</p>
              <div className="flex gap-2 mt-3">
                <button onClick={() => { setEditItem(item); setShowModal(true); }} className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-xs font-bold hover:bg-blue-100"><Edit2 size={12} /> Edit</button>
                <button onClick={() => setDeleteTarget({ type: 'testimonials', item })} className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-rose-50 text-rose-600 text-xs font-bold hover:bg-rose-100"><Trash2 size={12} /> Hapus</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'gallery' && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {gallery.map(item => (
            <div key={item.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
              <div className="relative h-40"><img src={item.src} alt={item.alt} className="w-full h-full object-cover" /></div>
              <div className="p-4">
                <h3 className="font-bold text-gray-900 text-sm">{item.alt}</h3>
                <p className="text-gray-500 text-xs mt-1">Grid span: {item.span || 'Normal'}</p>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => { setEditItem(item); setShowModal(true); }} className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-xs font-bold hover:bg-blue-100"><Edit2 size={12} /> Edit</button>
                  <button onClick={() => setDeleteTarget({ type: 'gallery', item })} className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-rose-50 text-rose-600 text-xs font-bold hover:bg-rose-100"><Trash2 size={12} /> Hapus</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

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
            }} className="btn btn-cyan px-6 py-2.5 text-sm mt-2">Simpan Perubahan Video</button>
          </div>
        </div>
      )}

      {showModal && (
        <ContentFormModal tab={tab} item={editItem} onSave={handleSave} onClose={() => { setShowModal(false); setEditItem(null); }} categories={categories} />
      )}

      {/* DELETE CONFIRM */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="font-bold text-gray-900 text-lg mb-2">Hapus Item?</h3>
            <p className="text-gray-500 text-sm mb-6">Apakah Anda yakin ingin menghapus item ini? Tindakan ini tidak dapat dibatalkan.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50">Batal</button>
              <button onClick={handleDelete} className="flex-1 px-4 py-2.5 bg-rose-500 text-white rounded-xl text-sm font-bold hover:bg-rose-600">Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ContentFormModal({ tab, item, onSave, onClose, categories = [] }) {
  const isEdit = !!item;
  const getDefaults = () => {
    if (tab === 'articles') return { id: '', title: '', slug: '', excerpt: '', date: new Date().toISOString().split('T')[0], category: 'Tips & Trik', image: '/images/hero-jetski.png', readTime: '5 menit' };
    if (tab === 'categories') return { id: '', name: '', slug: '', description: '', image: '/images/hero-jetski.png' };
    if (tab === 'services') return { id: '', name: '', slug: '', description: '', price: 0, duration: '30 menit', image: '/images/hero-jetski.png', icon: '🏄', details: 'Guide Profesional\nPelampung\nAir Mineral', category: categories.length > 0 ? categories[0].slug : 'safari-packages' };
    if (tab === 'promos') return { id: '', title: '', subtitle: '', desc: '', bg: 'bg-blue-500', icon: '🎫' };
    if (tab === 'gallery') return { id: '', src: '/images/gallery-group.png', alt: '', span: '' };
    return { id: '', name: '', role: '', avatar: '👤', rating: 5, text: '' };
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

  return (
    <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
          <h3 className="font-bold text-gray-900 text-lg">{isEdit ? 'Edit' : 'Tambah'} {tab === 'articles' ? 'Artikel' : tab === 'categories' ? 'Kategori' : tab === 'promos' ? 'Promo' : tab === 'services' ? 'Layanan' : 'Testimoni'}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center"><X size={18} /></button>
        </div>
        <div className="p-6 space-y-4">
          {tab === 'articles' && (<>
            <div><label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Judul</label><input type="text" value={form.title} onChange={e => set('title', e.target.value)} className={inputClass} /></div>
            <div><label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Excerpt</label><textarea rows={2} value={form.excerpt} onChange={e => set('excerpt', e.target.value)} className={`${inputClass} resize-none`} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Kategori</label><input type="text" value={form.category} onChange={e => set('category', e.target.value)} className={inputClass} /></div>
              <div><label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Tanggal</label><input type="date" value={form.date} onChange={e => set('date', e.target.value)} className={inputClass} /></div>
            </div>
          </>)}
          {tab === 'categories' && (<>
            <div><label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Nama Kategori</label><input type="text" value={form.name} onChange={e => set('name', e.target.value)} className={inputClass} /></div>
            <div><label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Deskripsi</label><textarea rows={3} value={form.description} onChange={e => set('description', e.target.value)} className={`${inputClass} resize-none`} /></div>
          </>)}
          {tab === 'services' && (<>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Kategori (Pilih Kategori di Landing Page)</label>
              <select value={form.category || ''} onChange={e => set('category', e.target.value)} className={`${inputClass} bg-white`}>
                {categories.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
              </select>
            </div>
            <div><label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Nama Layanan</label><input type="text" value={form.name} onChange={e => set('name', e.target.value)} className={inputClass} /></div>
            <div><label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Deskripsi</label><textarea rows={2} value={form.description} onChange={e => set('description', e.target.value)} className={`${inputClass} resize-none`} /></div>
            <div><label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Detail / Include (Pisahkan dengan baris baru)</label><textarea rows={3} value={form.details || ''} onChange={e => set('details', e.target.value)} placeholder="Guide Profesional&#10;Pelampung&#10;Air Mineral" className={`${inputClass} resize-none`} /></div>
            <div className="grid grid-cols-3 gap-4">
              <div><label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Harga</label><input type="number" value={form.price} onChange={e => set('price', parseInt(e.target.value) || 0)} className={inputClass} /></div>
              <div><label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Durasi</label><input type="text" value={form.duration} onChange={e => set('duration', e.target.value)} className={inputClass} /></div>
              <div><label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Icon</label><input type="text" value={form.icon} onChange={e => set('icon', e.target.value)} className={inputClass} /></div>
            </div>
          </>)}
          {tab === 'promos' && (<>
            <div><label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Judul Promo</label><input type="text" value={form.title} onChange={e => set('title', e.target.value)} className={inputClass} placeholder="DISKON 30%" /></div>
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
              <div><label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Icon (Emoji)</label><input type="text" value={form.icon} onChange={e => set('icon', e.target.value)} className={inputClass} /></div>
            </div>
          </>)}
          {tab === 'testimonials' && (<>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Nama</label><input type="text" value={form.name} onChange={e => set('name', e.target.value)} className={inputClass} /></div>
              <div><label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Peran</label><input type="text" value={form.role} onChange={e => set('role', e.target.value)} className={inputClass} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Avatar (Emoji)</label><input type="text" value={form.avatar} onChange={e => set('avatar', e.target.value)} className={inputClass} /></div>
              <div><label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Rating</label>
                <select value={form.rating} onChange={e => set('rating', parseInt(e.target.value))} className={`${inputClass} bg-white`}>
                  {[1,2,3,4,5].map(r => <option key={r} value={r}>{r} Bintang</option>)}
                </select>
              </div>
            </div>
            <div><label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Testimoni</label><textarea rows={3} value={form.text} onChange={e => set('text', e.target.value)} className={`${inputClass} resize-none`} /></div>
          </>)}
          {tab === 'gallery' && (<>
            <div><label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Image URL (src)</label><input type="text" value={form.src} onChange={e => set('src', e.target.value)} className={inputClass} /></div>
            <div><label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Alt Text (Judul)</label><input type="text" value={form.alt} onChange={e => set('alt', e.target.value)} className={inputClass} /></div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Grid Span (Opsional)</label>
              <select value={form.span} onChange={e => set('span', e.target.value)} className={`${inputClass} bg-white`}>
                <option value="">Normal</option>
                <option value="col-span-2">Lebar 2 Kolom</option>
                <option value="row-span-2">Tinggi 2 Baris</option>
                <option value="col-span-2 row-span-2">Lebar 2 Kolom & Tinggi 2 Baris</option>
              </select>
            </div>
          </>)}
        </div>
        <div className="flex gap-3 p-6 border-t border-gray-100 sticky bottom-0 bg-white rounded-b-2xl">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50">Batal</button>
          <button onClick={handleSubmit} className="flex-1 btn btn-cyan py-2.5 text-sm">{isEdit ? 'Simpan' : 'Tambah'}</button>
        </div>
      </div>
    </div>
  );
}
