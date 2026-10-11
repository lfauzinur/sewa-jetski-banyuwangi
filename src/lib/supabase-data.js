import { supabase } from './supabase';

// ========================
// SERVICES (Jetski Units + Activities)
// ========================
export async function getServices() {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) { console.error('getServices error:', error); return []; }
  return data;
}

export async function getServicesByType(type) {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('type', type)
    .order('created_at', { ascending: true });
  if (error) { console.error('getServicesByType error:', error); return []; }
  return data;
}

export async function getServicesByCategory(categorySlug) {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('category', categorySlug)
    .order('created_at', { ascending: true });
  if (error) { console.error('getServicesByCategory error:', error); return []; }
  return data;
}

export async function upsertService(service) {
  const payload = {
    type: service.type || 'activity',
    name: service.name,
    slug: service.slug,
    description: service.description,
    details: service.details,
    price: parseInt(service.price) || 0,
    duration: service.duration,
    image: service.image,
    icon: service.icon,
    category: service.category,
    features: service.features || [],
  };

  if (service.id && typeof service.id === 'string' && service.id.includes('-')) {
    // It's a UUID, update existing
    const { data, error } = await supabase
      .from('services')
      .update(payload)
      .eq('id', service.id)
      .select()
      .single();
    if (error) { console.error('updateService error:', error); return null; }
    return data;
  } else {
    // Insert new
    const { data, error } = await supabase
      .from('services')
      .insert(payload)
      .select()
      .single();
    if (error) { console.error('insertService error:', error); return null; }
    return data;
  }
}

export async function deleteService(id) {
  const { error } = await supabase.from('services').delete().eq('id', id);
  if (error) console.error('deleteService error:', error);
  return !error;
}

// ========================
// CATEGORIES
// ========================
export async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) { console.error('getCategories error:', error); return []; }
  return data;
}

export async function upsertCategory(cat) {
  const payload = {
    name: cat.name,
    slug: cat.slug,
    description: cat.description,
    image: cat.image,
  };

  if (cat.id && typeof cat.id === 'string' && cat.id.includes('-')) {
    const { data, error } = await supabase
      .from('categories')
      .update(payload)
      .eq('id', cat.id)
      .select()
      .single();
    if (error) { console.error('updateCategory error:', error); return null; }
    return data;
  } else {
    const { data, error } = await supabase
      .from('categories')
      .insert(payload)
      .select()
      .single();
    if (error) { console.error('insertCategory error:', error); return null; }
    return data;
  }
}

export async function deleteCategory(id) {
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) console.error('deleteCategory error:', error);
  return !error;
}

// ========================
// ARTICLES
// ========================
export async function getArticles() {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) { console.error('getArticles error:', error); return []; }
  return data;
}

export async function getArticleBySlug(slug) {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('slug', slug)
    .single();
  if (error) { console.error('getArticleBySlug error:', error); return null; }
  return data;
}

export async function upsertArticle(article) {
  const payload = {
    title: article.title,
    slug: article.slug,
    excerpt: article.excerpt,
    content: article.content,
    date: article.date,
    category: article.category,
    image: article.image,
    read_time: article.readTime || article.read_time,
  };

  if (article.id && typeof article.id === 'string' && article.id.includes('-')) {
    const { data, error } = await supabase
      .from('articles')
      .update(payload)
      .eq('id', article.id)
      .select()
      .single();
    if (error) { console.error('updateArticle error:', error); return null; }
    return data;
  } else {
    const { data, error } = await supabase
      .from('articles')
      .insert(payload)
      .select()
      .single();
    if (error) { console.error('insertArticle error:', error); return null; }
    return data;
  }
}

export async function deleteArticle(id) {
  const { error } = await supabase.from('articles').delete().eq('id', id);
  if (error) console.error('deleteArticle error:', error);
  return !error;
}

// ========================
// PROMOS
// ========================
export async function getPromos() {
  const { data, error } = await supabase
    .from('promos')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) { console.error('getPromos error:', error); return []; }
  return data;
}

export async function upsertPromo(promo) {
  const payload = {
    title: promo.title,
    subtitle: promo.subtitle,
    description: promo.description || promo.desc,
    bg_color: promo.bg_color || promo.bg,
    icon: promo.icon,
  };

  if (promo.id && typeof promo.id === 'string' && promo.id.includes('-')) {
    const { data, error } = await supabase
      .from('promos')
      .update(payload)
      .eq('id', promo.id)
      .select()
      .single();
    if (error) { console.error('updatePromo error:', error); return null; }
    return data;
  } else {
    const { data, error } = await supabase
      .from('promos')
      .insert(payload)
      .select()
      .single();
    if (error) { console.error('insertPromo error:', error); return null; }
    return data;
  }
}

export async function deletePromo(id) {
  const { error } = await supabase.from('promos').delete().eq('id', id);
  if (error) console.error('deletePromo error:', error);
  return !error;
}

// ========================
// BOOKINGS
// ========================
export async function getBookings() {
  const { data, error } = await supabase
    .from('bookings')
    .select('*, services(name, image)')
    .order('created_at', { ascending: false });
  if (error) { console.error('getBookings error:', error); return []; }
  return data;
}

export async function getBookingsByUser(userId) {
  const { data, error } = await supabase
    .from('bookings')
    .select('*, services(name, image)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) { console.error('getBookingsByUser error:', error); return []; }
  return data;
}

export async function createBooking(booking) {
  const { data, error } = await supabase
    .from('bookings')
    .insert(booking)
    .select()
    .single();
  if (error) { console.error('createBooking error:', error); return null; }
  return data;
}

export async function updateBookingStatus(id, status) {
  const { data, error } = await supabase
    .from('bookings')
    .update({ status })
    .eq('id', id)
    .select()
    .single();
  if (error) { console.error('updateBookingStatus error:', error); return null; }
  return data;
}

// ========================
// ADD-ONS
// ========================
const DEFAULT_ADDONS = [
  { id: 'addon-1', name: 'GoPro Hero 11 (Dokumentasi)', description: 'Sewa action cam GoPro Hero 11 termasuk memory card & mounting', price: 100000, active: true },
  { id: 'addon-2', name: 'Insta360 X3 (360 Video)', description: 'Video 360 derajat sinematik saat bermain jetski', price: 150000, active: true },
  { id: 'addon-3', name: 'Drone Aerial Video 4K', description: 'Pengambilan video udara dari drone pilot profesional', price: 250000, active: true },
  { id: 'addon-4', name: 'Water Shoes Anti-Slip', description: 'Sepatu khusus air untuk keamanan dan kenyamanan kaki', price: 25000, active: true },
  { id: 'addon-5', name: 'Asuransi Ekstra Watersport', description: 'Perlindungan asuransi kecelakaan ekstra per orang', price: 35000, active: true },
];

export async function getAddons() {
  try {
    const { data, error } = await supabase
      .from('addons')
      .select('*')
      .order('created_at', { ascending: true });
    if (!error && data && data.length > 0) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('admin_addons', JSON.stringify(data));
      }
      return data;
    }
  } catch (err) {
    console.warn('getAddons supabase err:', err);
  }

  // Fallback to localStorage or defaults
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('admin_addons');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    localStorage.setItem('admin_addons', JSON.stringify(DEFAULT_ADDONS));
  }
  return DEFAULT_ADDONS;
}

export async function upsertAddon(addon) {
  const payload = {
    name: addon.name,
    description: addon.description,
    price: parseInt(addon.price) || 0,
    active: addon.active !== false
  };

  let savedData = null;

  try {
    if (addon.id && typeof addon.id === 'string' && addon.id.includes('-') && !addon.id.startsWith('addon-')) {
      const { data, error } = await supabase.from('addons').update(payload).eq('id', addon.id).select().single();
      if (!error && data) savedData = data;
      else if (error) console.warn('Supabase updateAddon error (falling back to local):', error);
    } else {
      const { data, error } = await supabase.from('addons').insert(payload).select().single();
      if (!error && data) savedData = data;
      else if (error) console.warn('Supabase insertAddon error (falling back to local):', error);
    }
  } catch (err) {
    console.warn('Supabase upsertAddon exception:', err);
  }

  // Fallback to localStorage if Supabase failed or table does not exist
  if (!savedData && typeof window !== 'undefined') {
    const existing = JSON.parse(localStorage.getItem('admin_addons') || JSON.stringify(DEFAULT_ADDONS));
    const isEdit = !!addon.id;
    const targetId = isEdit ? addon.id : `addon-${Date.now()}`;
    const newObj = {
      ...payload,
      id: targetId,
      created_at: addon.created_at || new Date().toISOString()
    };

    let updatedList;
    if (isEdit) {
      updatedList = existing.map(item => item.id === targetId ? newObj : item);
      if (!updatedList.some(item => item.id === targetId)) {
        updatedList.push(newObj);
      }
    } else {
      updatedList = [...existing, newObj];
    }
    localStorage.setItem('admin_addons', JSON.stringify(updatedList));
    savedData = newObj;
  } else if (savedData && typeof window !== 'undefined') {
    // Sync Supabase success into localStorage cache
    const existing = JSON.parse(localStorage.getItem('admin_addons') || '[]');
    const isEdit = existing.some(item => item.id === savedData.id);
    const updatedList = isEdit
      ? existing.map(item => item.id === savedData.id ? savedData : item)
      : [...existing, savedData];
    localStorage.setItem('admin_addons', JSON.stringify(updatedList));
  }

  return savedData;
}

export async function deleteAddon(id) {
  try {
    if (typeof id === 'string' && !id.startsWith('addon-')) {
      await supabase.from('addons').delete().eq('id', id);
    }
  } catch (err) {
    console.warn('Supabase deleteAddon error:', err);
  }

  if (typeof window !== 'undefined') {
    const existing = JSON.parse(localStorage.getItem('admin_addons') || '[]');
    const filtered = existing.filter(item => item.id !== id);
    localStorage.setItem('admin_addons', JSON.stringify(filtered));
  }
  return true;
}

// ========================
// LOYALTY (JETPASS)
// ========================
export async function getUserLoyalty(userId) {
  if (!userId) return null;
  const { data, error } = await supabase
    .from('user_loyalty')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (error && error.code !== 'PGRST116') { // not found is okay
    console.error('getUserLoyalty error:', error); 
  }
  return data || { points_balance: 0, lifetime_points: 0 };
}

export async function addLoyaltyPoints(userId, amount, description, bookingId = null) {
  if (!userId || amount <= 0) return false;
  
  // Get current loyalty
  let current = await getUserLoyalty(userId);
  let isNew = false;
  if (!current.user_id) {
    isNew = true;
  }

  const newBalance = current.points_balance + amount;
  const newLifetime = current.lifetime_points + amount;

  // Update or Insert loyalty balance
  if (isNew) {
    await supabase.from('user_loyalty').insert({
      user_id: userId,
      points_balance: newBalance,
      lifetime_points: newLifetime
    });
  } else {
    await supabase.from('user_loyalty').update({
      points_balance: newBalance,
      lifetime_points: newLifetime,
      updated_at: new Date().toISOString()
    }).eq('user_id', userId);
  }

  // Insert transaction history
  await supabase.from('loyalty_transactions').insert({
    user_id: userId,
    type: 'earn',
    amount: amount,
    description: description,
    booking_id: bookingId
  });

  return true;
}

export async function redeemLoyaltyPoints(userId, amount, description, bookingId = null) {
  if (!userId || amount <= 0) return false;
  
  let current = await getUserLoyalty(userId);
  if (!current.user_id || current.points_balance < amount) return false; // Not enough points

  const newBalance = current.points_balance - amount;

  // Update balance
  await supabase.from('user_loyalty').update({
    points_balance: newBalance,
    updated_at: new Date().toISOString()
  }).eq('user_id', userId);

  // Insert transaction
  await supabase.from('loyalty_transactions').insert({
    user_id: userId,
    type: 'redeem',
    amount: amount,
    description: description,
    booking_id: bookingId
  });

  return true;
}

export async function getLoyaltyTransactions(userId) {
  const { data, error } = await supabase
    .from('loyalty_transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) { console.error('getLoyaltyTransactions error:', error); return []; }
  return data;
}

// ========================
// ========================
// REWARDS
// ========================
const DEFAULT_REWARDS = [
  { id: 'reward-1', name: 'Diskon Booking Rp 25.000', type: 'discount', value: 25000, points_required: 50, active: true },
  { id: 'reward-2', name: 'Diskon Booking Rp 50.000', type: 'discount', value: 50000, points_required: 100, active: true },
  { id: 'reward-3', name: 'Ekstra Waktu 15 Menit', type: 'duration', value: 15, points_required: 75, active: true },
  { id: 'reward-4', name: 'Diskon Booking Rp 100.000', type: 'discount', value: 100000, points_required: 180, active: true },
];

export async function getLoyaltyRewards() {
  try {
    const { data, error } = await supabase
      .from('loyalty_rewards')
      .select('*')
      .order('points_required', { ascending: true });
    if (!error && data && data.length > 0) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('admin_rewards', JSON.stringify(data));
      }
      return data;
    }
  } catch (err) {
    console.warn('getLoyaltyRewards error:', err);
  }

  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('admin_rewards');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    localStorage.setItem('admin_rewards', JSON.stringify(DEFAULT_REWARDS));
  }
  return DEFAULT_REWARDS;
}

export async function upsertLoyaltyReward(reward) {
  const payload = {
    name: reward.name,
    type: reward.type,
    value: parseInt(reward.value) || 0,
    points_required: parseInt(reward.points_required) || 0,
    active: reward.active !== false
  };

  let savedData = null;

  try {
    if (reward.id && typeof reward.id === 'string' && reward.id.includes('-') && !reward.id.startsWith('reward-')) {
      const { data, error } = await supabase.from('loyalty_rewards').update(payload).eq('id', reward.id).select().single();
      if (!error && data) savedData = data;
    } else {
      const { data, error } = await supabase.from('loyalty_rewards').insert(payload).select().single();
      if (!error && data) savedData = data;
    }
  } catch (err) {
    console.warn('upsertLoyaltyReward exception:', err);
  }

  // Fallback to localStorage
  if (!savedData && typeof window !== 'undefined') {
    const existing = JSON.parse(localStorage.getItem('admin_rewards') || JSON.stringify(DEFAULT_REWARDS));
    const isEdit = !!reward.id;
    const targetId = isEdit ? reward.id : `reward-${Date.now()}`;
    const newObj = {
      ...payload,
      id: targetId,
      created_at: reward.created_at || new Date().toISOString()
    };

    let updatedList;
    if (isEdit) {
      updatedList = existing.map(item => item.id === targetId ? newObj : item);
      if (!updatedList.some(item => item.id === targetId)) updatedList.push(newObj);
    } else {
      updatedList = [...existing, newObj];
    }
    localStorage.setItem('admin_rewards', JSON.stringify(updatedList));
    savedData = newObj;
  } else if (savedData && typeof window !== 'undefined') {
    const existing = JSON.parse(localStorage.getItem('admin_rewards') || '[]');
    const isEdit = existing.some(item => item.id === savedData.id);
    const updatedList = isEdit
      ? existing.map(item => item.id === savedData.id ? savedData : item)
      : [...existing, savedData];
    localStorage.setItem('admin_rewards', JSON.stringify(updatedList));
  }

  return savedData;
}

export async function deleteLoyaltyReward(id) {
  try {
    if (typeof id === 'string' && !id.startsWith('reward-')) {
      await supabase.from('loyalty_rewards').delete().eq('id', id);
    }
  } catch (err) {
    console.warn('deleteLoyaltyReward error:', err);
  }

  if (typeof window !== 'undefined') {
    const existing = JSON.parse(localStorage.getItem('admin_rewards') || '[]');
    const filtered = existing.filter(item => item.id !== id);
    localStorage.setItem('admin_rewards', JSON.stringify(filtered));
  }
  return true;
}

// ========================
// GPS & NAVIGATION
// ========================
const DEFAULT_GPS_ROUTES = [
  {
    id: 'route-1',
    name: 'Rute Aman: Pantai Boom - Pulau Santen',
    description: 'Rute yang sangat direkomendasikan untuk pemula. Ombak tenang.',
    color: '#10B981',
    path_data: [
      [-8.204555, 114.385455],
      [-8.209876, 114.391234],
      [-8.214532, 114.393456],
      [-8.220111, 114.392111]
    ],
    active: true
  },
  {
    id: 'route-2',
    name: 'Rute Eksplorasi: Selat Bali Cruise',
    description: 'Sensasi melaju kencang di perairan terbuka Selat Bali dengan pemandangan pegunungan.',
    color: '#3B82F6',
    path_data: [
      [-8.204555, 114.385455],
      [-8.201200, 114.398000],
      [-8.208500, 114.405000],
      [-8.218000, 114.398000]
    ],
    active: true
  }
];

export async function getGpsRoutes() {
  try {
    const { data, error } = await supabase
      .from('gps_routes')
      .select('*')
      .order('created_at', { ascending: true });
    if (!error && data && data.length > 0) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('admin_gps_routes', JSON.stringify(data));
      }
      return data;
    }
  } catch (err) {
    console.warn('getGpsRoutes supabase err:', err);
  }

  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('admin_gps_routes');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    localStorage.setItem('admin_gps_routes', JSON.stringify(DEFAULT_GPS_ROUTES));
  }
  return DEFAULT_GPS_ROUTES;
}

export async function upsertGpsRoute(route) {
  const payload = {
    name: route.name,
    description: route.description,
    color: route.color || '#3B82F6',
    path_data: route.path_data,
    active: route.active !== false
  };

  let savedData = null;

  try {
    if (route.id && typeof route.id === 'string' && route.id.includes('-') && !route.id.startsWith('route-')) {
      const { data, error } = await supabase.from('gps_routes').update(payload).eq('id', route.id).select().single();
      if (!error && data) savedData = data;
    } else {
      const { data, error } = await supabase.from('gps_routes').insert(payload).select().single();
      if (!error && data) savedData = data;
    }
  } catch (err) {
    console.warn('upsertGpsRoute error:', err);
  }

  // Fallback to localStorage
  if (!savedData && typeof window !== 'undefined') {
    const existing = JSON.parse(localStorage.getItem('admin_gps_routes') || JSON.stringify(DEFAULT_GPS_ROUTES));
    const isEdit = !!route.id;
    const targetId = isEdit ? route.id : `route-${Date.now()}`;
    const newObj = {
      ...payload,
      id: targetId,
      created_at: route.created_at || new Date().toISOString()
    };

    let updatedList;
    if (isEdit) {
      updatedList = existing.map(item => item.id === targetId ? newObj : item);
      if (!updatedList.some(item => item.id === targetId)) updatedList.push(newObj);
    } else {
      updatedList = [...existing, newObj];
    }
    localStorage.setItem('admin_gps_routes', JSON.stringify(updatedList));
    savedData = newObj;
  } else if (savedData && typeof window !== 'undefined') {
    const existing = JSON.parse(localStorage.getItem('admin_gps_routes') || '[]');
    const isEdit = existing.some(item => item.id === savedData.id);
    const updatedList = isEdit
      ? existing.map(item => item.id === savedData.id ? savedData : item)
      : [...existing, savedData];
    localStorage.setItem('admin_gps_routes', JSON.stringify(updatedList));
  }

  return savedData;
}

export async function deleteGpsRoute(id) {
  try {
    if (typeof id === 'string' && !id.startsWith('route-')) {
      await supabase.from('gps_routes').delete().eq('id', id);
    }
  } catch (err) {
    console.warn('deleteGpsRoute error:', err);
  }

  if (typeof window !== 'undefined') {
    const existing = JSON.parse(localStorage.getItem('admin_gps_routes') || '[]');
    const filtered = existing.filter(item => item.id !== id);
    localStorage.setItem('admin_gps_routes', JSON.stringify(filtered));
  }
  return true;
}

export async function getGpsGeofences() {
  const { data, error } = await supabase
    .from('gps_geofences')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) { console.error('getGpsGeofences error:', error); return []; }
  return data;
}

export async function upsertGpsGeofence(geofence) {
  const payload = {
    name: geofence.name,
    type: geofence.type || 'warning',
    polygon_data: geofence.polygon_data,
    active: geofence.active !== false
  };

  if (geofence.id && typeof geofence.id === 'string' && geofence.id.includes('-')) {
    const { data, error } = await supabase.from('gps_geofences').update(payload).eq('id', geofence.id).select().single();
    if (error) console.error('updateGpsGeofence error:', error); return data;
  } else {
    const { data, error } = await supabase.from('gps_geofences').insert(payload).select().single();
    if (error) console.error('insertGpsGeofence error:', error); return data;
  }
}

export async function deleteGpsGeofence(id) {
  const { error } = await supabase.from('gps_geofences').delete().eq('id', id);
  if (error) console.error('deleteGpsGeofence error:', error); return !error;
}

// ========================
// LIVE TRACKING
// ========================
export async function getLiveLocations() {
  const { data, error } = await supabase
    .from('live_locations')
    .select('*');
  if (error) { console.error('getLiveLocations error:', error); return []; }
  return data;
}

export async function upsertLiveLocation(payload) {
  const { data, error } = await supabase
    .from('live_locations')
    .upsert(payload, { onConflict: 'user_id' })
    .select();
  if (error) console.error('upsertLiveLocation error:', error); return data;
}

// ========================
// BASECAMPS
// ========================
export async function getBasecamps() {
  const { data, error } = await supabase
    .from('basecamps')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) { console.error('getBasecamps error:', error); return []; }
  return data;
}

export async function getActiveBasecamps() {
  const { data, error } = await supabase
    .from('basecamps')
    .select('*')
    .eq('active', true)
    .order('created_at', { ascending: true });
  if (error) { console.error('getActiveBasecamps error:', error); return []; }
  return data;
}

export async function createBasecamp(payload) {
  const { data, error } = await supabase.from('basecamps').insert(payload).select();
  if (error) console.error('createBasecamp error:', error);
  return data?.[0] || null;
}

export async function updateBasecamp(id, payload) {
  const { data, error } = await supabase.from('basecamps').update(payload).eq('id', id).select();
  if (error) console.error('updateBasecamp error:', error);
  return data?.[0] || null;
}

export async function deleteBasecamp(id) {
  const { error } = await supabase.from('basecamps').delete().eq('id', id);
  if (error) console.error('deleteBasecamp error:', error);
  return !error;
}
