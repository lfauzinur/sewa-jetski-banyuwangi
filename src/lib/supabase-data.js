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
export async function getAddons() {
  const { data, error } = await supabase
    .from('addons')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) { console.error('getAddons error:', error); return []; }
  return data;
}

export async function upsertAddon(addon) {
  const payload = {
    name: addon.name,
    description: addon.description,
    price: parseInt(addon.price) || 0,
    active: addon.active !== false
  };

  if (addon.id && typeof addon.id === 'string' && addon.id.includes('-')) {
    const { data, error } = await supabase.from('addons').update(payload).eq('id', addon.id).select().single();
    if (error) console.error('updateAddon error:', error); return data;
  } else {
    const { data, error } = await supabase.from('addons').insert(payload).select().single();
    if (error) console.error('insertAddon error:', error); return data;
  }
}

export async function deleteAddon(id) {
  const { error } = await supabase.from('addons').delete().eq('id', id);
  if (error) console.error('deleteAddon error:', error); return !error;
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
// REWARDS
// ========================
export async function getLoyaltyRewards() {
  const { data, error } = await supabase
    .from('loyalty_rewards')
    .select('*')
    .eq('active', true)
    .order('points_required', { ascending: true });
  if (error) { console.error('getLoyaltyRewards error:', error); return []; }
  return data;
}

export async function upsertLoyaltyReward(reward) {
  const payload = {
    name: reward.name,
    type: reward.type,
    value: parseInt(reward.value) || 0,
    points_required: parseInt(reward.points_required) || 0,
    active: reward.active !== false
  };

  if (reward.id && typeof reward.id === 'string' && reward.id.includes('-')) {
    const { data, error } = await supabase.from('loyalty_rewards').update(payload).eq('id', reward.id).select().single();
    if (error) console.error('updateReward error:', error); return data;
  } else {
    const { data, error } = await supabase.from('loyalty_rewards').insert(payload).select().single();
    if (error) console.error('insertReward error:', error); return data;
  }
}

export async function deleteLoyaltyReward(id) {
  const { error } = await supabase.from('loyalty_rewards').delete().eq('id', id);
  if (error) console.error('deleteReward error:', error); return !error;
}

// ========================
// GPS & NAVIGATION
// ========================
export async function getGpsRoutes() {
  const { data, error } = await supabase
    .from('gps_routes')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) { console.error('getGpsRoutes error:', error); return []; }
  return data;
}

export async function upsertGpsRoute(route) {
  const payload = {
    name: route.name,
    description: route.description,
    color: route.color || '#3B82F6',
    path_data: route.path_data,
    active: route.active !== false
  };

  if (route.id && typeof route.id === 'string' && route.id.includes('-')) {
    const { data, error } = await supabase.from('gps_routes').update(payload).eq('id', route.id).select().single();
    if (error) console.error('updateGpsRoute error:', error); return data;
  } else {
    const { data, error } = await supabase.from('gps_routes').insert(payload).select().single();
    if (error) console.error('insertGpsRoute error:', error); return data;
  }
}

export async function deleteGpsRoute(id) {
  const { error } = await supabase.from('gps_routes').delete().eq('id', id);
  if (error) console.error('deleteGpsRoute error:', error); return !error;
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
