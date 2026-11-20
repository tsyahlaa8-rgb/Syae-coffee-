export type UserRole = 'pembeli' | 'pemilik';

export type MenuCategory = 'Semua' | 'Signature' | 'Kopi Susu' | 'Kopi Hitam' | 'Manual Brew';

export type OrderStatus = 'Menunggu' | 'Diproses' | 'Siap Diambil' | 'Selesai';

export type TemperatureOption = 'Dingin' | 'Panas';

export type SugarLevel = 'Normal' | 'Sedikit Gula' | 'Tanpa Gula';

export type OrderType = 'Ambil di Kasir' | 'Makan di Tempat';

export type PaymentMethod = 'QRIS' | 'Tunai di Kasir';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  phone?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  category: Exclude<MenuCategory, 'Semua'>;
  description: string;
  price: number;
  image_url: string;
  is_available: boolean;
  is_featured: boolean;
  serving_options: TemperatureOption[];
  origin_note: string;
}

export interface CartItem {
  cartKey: string;
  menuItem: MenuItem;
  quantity: number;
  temperature: TemperatureOption;
  sugarLevel: SugarLevel;
  note: string;
}

export interface OrderItemRecord {
  menu_item_id: string;
  menu_name: string;
  image_url: string;
  quantity: number;
  unit_price: number;
  temperature: TemperatureOption;
  sugar_level: SugarLevel;
  item_note?: string;
}

export interface OrderRecord {
  id: string;
  order_code: string;
  customer_id: string;
  customer_name: string;
  customer_email: string;
  order_type: OrderType;
  table_number?: string;
  payment_method: PaymentMethod;
  status: OrderStatus;
  subtotal: number;
  total_amount: number;
  notes?: string;
  created_at: string;
  items: OrderItemRecord[];
}
