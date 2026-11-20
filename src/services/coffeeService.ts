import { INITIAL_MENU_ITEMS } from '../data/initialMenu';
import {
  MenuItem,
  OrderItemRecord,
  OrderRecord,
  OrderStatus,
  OrderType,
  PaymentMethod,
  UserProfile,
  UserRole,
} from '../types/database';

const STORAGE_KEYS = {
  MENU: 'syae_coffee_menu_v2',
  ORDERS: 'syae_coffee_orders_v1',
  USERS: 'syae_coffee_users_v1',
  SESSION: 'syae_coffee_session_v1',
};

const DEFAULT_USERS: (UserProfile & { password: string })[] = [
  {
    id: 'usr-pembeli-01',
    email: 'pembeli@syaecoffee.id',
    password: '123456',
    full_name: 'Raka Pratama',
    role: 'pembeli',
    phone: '0812-3456-7890',
  },
  {
    id: 'usr-pemilik-01',
    email: 'pemilik@syaecoffee.id',
    password: '123456',
    full_name: 'Syaé Nabila (Pemilik)',
    role: 'pemilik',
    phone: '0811-2233-4455',
  },
];

const INITIAL_ORDERS: OrderRecord[] = [
  {
    id: 'ord-1001',
    order_code: 'SYE-1041',
    customer_id: 'usr-pembeli-01',
    customer_name: 'Raka Pratama',
    customer_email: 'pembeli@syaecoffee.id',
    order_type: 'Ambil di Kasir',
    payment_method: 'QRIS',
    status: 'Selesai',
    subtotal: 52000,
    total_amount: 52000,
    notes: 'Es jangan terlalu banyak',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    items: [
      {
        menu_item_id: 'sye-01',
        menu_name: 'Kopi Susu Gula Aren Syaé',
        image_url: '/src/assets/images/kopi_susu_gula_aren_1795174965659.jpg',
        quantity: 1,
        unit_price: 24000,
        temperature: 'Dingin',
        sugar_level: 'Sedikit Gula',
      },
      {
        menu_item_id: 'sye-06',
        menu_name: 'Caramel Macchiato',
        image_url: '/src/assets/images/caramel_macchiato_1795174965363.jpg',
        quantity: 1,
        unit_price: 28000,
        temperature: 'Dingin',
        sugar_level: 'Normal',
      },
    ],
  },
  {
    id: 'ord-1002',
    order_code: 'SYE-1042',
    customer_id: 'usr-pembeli-01',
    customer_name: 'Raka Pratama',
    customer_email: 'pembeli@syaecoffee.id',
    order_type: 'Makan di Tempat',
    table_number: 'Meja 04',
    payment_method: 'Tunai di Kasir',
    status: 'Diproses',
    subtotal: 57000,
    total_amount: 57000,
    notes: 'Antar ke meja dekat jendela',
    created_at: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    items: [
      {
        menu_item_id: 'sye-04',
        menu_name: 'Caffè Latte Klasik',
        image_url: '/src/assets/images/caffe_latte_klasik_1795174965264.jpg',
        quantity: 1,
        unit_price: 26000,
        temperature: 'Panas',
        sugar_level: 'Tanpa Gula',
      },
      {
        menu_item_id: 'sye-10',
        menu_name: 'Matcha Espresso Fusion',
        image_url: '/src/assets/images/matcha_espresso_fusion_1795174965149.jpg',
        quantity: 1,
        unit_price: 31000,
        temperature: 'Dingin',
        sugar_level: 'Sedikit Gula',
      },
    ],
  },
];

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Abaikan jika penyimpanan browser penuh
  }
}

/**
 * Service Layer Syaé Coffee
 * Semua fungsi bersifat async agar mudah diganti dengan query Supabase:
 * Contoh: const { data } = await supabase.from('menu_items').select('*');
 */
export const coffeeService = {
  async getMenuItems(): Promise<MenuItem[]> {
    const stored = readStorage<MenuItem[] | null>(STORAGE_KEYS.MENU, null);
    if (!stored || stored.length !== INITIAL_MENU_ITEMS.length) {
      writeStorage(STORAGE_KEYS.MENU, INITIAL_MENU_ITEMS);
      return INITIAL_MENU_ITEMS;
    }
    return stored;
  },

  async toggleMenuAvailability(id: string): Promise<MenuItem[]> {
    const items = await this.getMenuItems();
    const updated = items.map((item) =>
      item.id === id ? { ...item, is_available: !item.is_available } : item
    );
    writeStorage(STORAGE_KEYS.MENU, updated);
    return updated;
  },

  async updateMenuPrice(id: string, newPrice: number): Promise<MenuItem[]> {
    const items = await this.getMenuItems();
    const updated = items.map((item) =>
      item.id === id ? { ...item, price: Math.max(5000, newPrice) } : item
    );
    writeStorage(STORAGE_KEYS.MENU, updated);
    return updated;
  },

  async getOrders(user?: UserProfile | null): Promise<OrderRecord[]> {
    const stored = readStorage<OrderRecord[] | null>(STORAGE_KEYS.ORDERS, null);
    const orders = stored ?? INITIAL_ORDERS;
    if (!stored) {
      writeStorage(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
    }

    const sorted = [...orders].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    if (user && user.role === 'pembeli') {
      return sorted.filter((order) => order.customer_email === user.email);
    }
    return sorted;
  },

  async createOrder(payload: {
    customer: UserProfile;
    customerName: string;
    orderType: OrderType;
    tableNumber?: string;
    paymentMethod: PaymentMethod;
    notes?: string;
    items: OrderItemRecord[];
  }): Promise<OrderRecord> {
    const existing = await this.getOrders();
    const subtotal = payload.items.reduce(
      (sum, item) => sum + item.unit_price * item.quantity,
      0
    );
    const nextNumber = 1043 + existing.length;

    const newOrder: OrderRecord = {
      id: `ord-${Date.now()}`,
      order_code: `SYE-${nextNumber}`,
      customer_id: payload.customer.id,
      customer_name: payload.customerName.trim() || payload.customer.full_name,
      customer_email: payload.customer.email,
      order_type: payload.orderType,
      table_number: payload.orderType === 'Makan di Tempat' ? payload.tableNumber : undefined,
      payment_method: payload.paymentMethod,
      status: 'Menunggu',
      subtotal,
      total_amount: subtotal,
      notes: payload.notes?.trim() || undefined,
      created_at: new Date().toISOString(),
      items: payload.items,
    };

    const updated = [newOrder, ...existing];
    writeStorage(STORAGE_KEYS.ORDERS, updated);
    return newOrder;
  },

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<OrderRecord[]> {
    const existing = await this.getOrders();
    const updated = existing.map((order) =>
      order.id === orderId ? { ...order, status } : order
    );
    writeStorage(STORAGE_KEYS.ORDERS, updated);
    return updated;
  },

  async login(
    email: string,
    password: string
  ): Promise<{ user: UserProfile | null; error?: string }> {
    const users = readStorage(STORAGE_KEYS.USERS, DEFAULT_USERS);
    const normalizedEmail = email.trim().toLowerCase();
    const found = users.find(
      (u) => u.email.toLowerCase() === normalizedEmail && u.password === password
    );

    if (!found) {
      return {
        user: null,
        error: 'Email atau kata sandi tidak cocok. Gunakan akun demo atau daftar baru.',
      };
    }

    const profile: UserProfile = {
      id: found.id,
      email: found.email,
      full_name: found.full_name,
      role: found.role,
      phone: found.phone,
    };
    writeStorage(STORAGE_KEYS.SESSION, profile);
    return { user: profile };
  },

  async register(payload: {
    fullName: string;
    email: string;
    password: string;
    role: UserRole;
  }): Promise<{ user: UserProfile | null; error?: string }> {
    const users = readStorage(STORAGE_KEYS.USERS, DEFAULT_USERS);
    const normalizedEmail = payload.email.trim().toLowerCase();

    if (users.some((u) => u.email.toLowerCase() === normalizedEmail)) {
      return { user: null, error: 'Email tersebut sudah terdaftar. Silakan masuk.' };
    }

    const newUser = {
      id: `usr-${Date.now()}`,
      email: normalizedEmail,
      password: payload.password,
      full_name: payload.fullName.trim(),
      role: payload.role,
    };

    writeStorage(STORAGE_KEYS.USERS, [...users, newUser]);

    const profile: UserProfile = {
      id: newUser.id,
      email: newUser.email,
      full_name: newUser.full_name,
      role: newUser.role,
    };
    writeStorage(STORAGE_KEYS.SESSION, profile);
    return { user: profile };
  },

  getCurrentSession(): UserProfile | null {
    return readStorage<UserProfile | null>(STORAGE_KEYS.SESSION, null);
  },

  logout(): void {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
  },
};

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatWaktuIndonesia(isoDate: string): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(isoDate));
}
