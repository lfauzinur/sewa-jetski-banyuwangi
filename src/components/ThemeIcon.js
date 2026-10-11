'use client';
import React from 'react';
import {
  Waves,
  Zap,
  Ship,
  Wind,
  Sun,
  Palmtree,
  Users,
  Ticket,
  Percent,
  Gift,
  Sparkles,
  Tag,
  Award,
  Compass,
  Anchor,
  Camera,
  User,
  FileText,
  Phone,
  Clock,
  ShieldCheck,
  Check,
  Flame,
  BadgePercent,
  Fish,
} from 'lucide-react';

// Normalizer mapping: maps any emoji or key string to a cohesive Lucide icon component
const ICON_MAP = {
  // Watersport / Activities
  waves: Waves,
  paddle: Waves,
  surf: Waves,
  '🏄': Waves,
  '🏄‍♂️': Waves,
  '🌊': Waves,

  zap: Zap,
  jetski: Zap,
  speed: Zap,
  '⚡': Zap,
  '⚡️': Zap,

  ship: Ship,
  boat: Ship,
  banana: Ship,
  '🍌': Ship,
  '🚤': Ship,
  '⛵': Ship,

  wind: Wind,
  parasailing: Wind,
  '🪂': Wind,

  sun: Sun,
  sunset: Sun,
  beach: Sun,
  '🌅': Sun,
  '☀️': Sun,

  palmtree: Palmtree,
  island: Palmtree,
  aerial: Palmtree,
  '🏝️': Palmtree,
  '🌴': Palmtree,

  users: Users,
  group: Users,
  team: Users,
  family: Users,
  '👥': Users,
  '🧑‍🤝‍🧑': Users,

  compass: Compass,
  safari: Compass,
  explore: Compass,
  snorkel: Compass,
  diving: Compass,
  '🤿': Compass,
  '🧭': Compass,

  fish: Fish,
  '🐠': Fish,
  '🐟': Fish,

  anchor: Anchor,

  // Promo / Offers / Badges
  ticket: Ticket,
  voucher: Ticket,
  '🎫': Ticket,
  '🎟️': Ticket,

  percent: Percent,
  diskon: Percent,
  discount: Percent,
  '%': Percent,

  gift: Gift,
  gratis: Gift,
  free: Gift,
  '🎁': Gift,

  sparkles: Sparkles,
  vip: Sparkles,
  spesial: Sparkles,
  combo: Sparkles,
  '✨': Sparkles,
  '🎉': Sparkles,

  tag: Tag,
  promo: Tag,
  '🏷️': Tag,

  award: Award,
  bestseller: Award,
  '🏆': Award,

  flame: Flame,
  hot: Flame,
  '🔥': Flame,

  // General UI / Meta
  camera: Camera,
  photo: Camera,
  '📸': Camera,
  '📷': Camera,

  user: User,
  member: User,
  guest: User,
  '👤': User,
  '🧑': User,
  '👩': User,
  '👨': User,

  file: FileText,
  doc: FileText,
  details: FileText,
  '📋': FileText,

  phone: Phone,
  '📞': Phone,

  clock: Clock,
  time: Clock,
  '🕐': Clock,
  '⏰': Clock,

  shield: ShieldCheck,
  safety: ShieldCheck,

  check: Check,
  '✓': Check,
};

/**
 * Cohesive Theme Icon Component
 * Renders high-quality Lucide SVG icons matching the ocean / cyan / royal theme.
 * Handles both key strings (e.g. 'waves', 'ticket') and legacy emoji strings safely.
 */
export default function ThemeIcon({
  name,
  size = 16,
  className = '',
  style = {},
  fallback = null,
}) {
  if (!name && !fallback) return null;

  const key = typeof name === 'string' ? name.trim().toLowerCase() : '';
  const IconComponent = ICON_MAP[key] || ICON_MAP[name];

  if (IconComponent) {
    return <IconComponent size={size} className={className} style={style} />;
  }

  // If fallback provided
  if (fallback) return fallback;

  // If no match found, render default Waves or Ticket depending on context
  if (key.includes('promo') || key.includes('tiket') || key.includes('voucher') || key.includes('diskon')) {
    return <Ticket size={size} className={className} style={style} />;
  }

  return <Waves size={size} className={className} style={style} />;
}
