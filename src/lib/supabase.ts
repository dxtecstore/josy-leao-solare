import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;

export type Service = {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  duration: string | null;
  image_url: string | null;
  active: boolean;
  created_at: string;
};

export type GalleryItem = {
  id: string;
  title: string;
  image_url: string;
  category: string | null;
  active: boolean;
  created_at: string;
};

export type Appointment = {
  id: string;
  client_name: string;
  phone: string;
  service_id: string | null;
  preferred_date: string | null;
  preferred_time: string | null;
  status: 'novo' | 'confirmado' | 'realizado' | 'cancelado';
  notes: string | null;
  created_at: string;
  services?: Pick<Service, 'name' | 'price' | 'duration'> | null;
};

export type Testimonial = {
  id: string;
  client_name: string;
  text: string;
  image_url: string | null;
  active: boolean;
  created_at: string;
};

export type Settings = {
  id: string;
  business_name: string;
  whatsapp: string;
  instagram: string;
  address: string;
  logo_url: string | null;
  hero_image_url: string | null;
};

export type ClientProfile = {
  id: string;
  name: string;
  whatsapp: string;
  history: string | null;
  last_procedure: string | null;
  notes: string | null;
  sessions_count: number;
  bonus_balance: number;
  created_at: string;
};

export type TimeBlock = {
  id: string;
  block_date: string;
  start_time: string;
  end_time: string;
  reason: string | null;
  created_at: string;
};
