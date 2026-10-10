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
