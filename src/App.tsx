import React, { useEffect, useState } from 'react';
import { ClipboardList, Coffee, LogOut, ShoppingBag } from 'lucide-react';
import { coffeeService } from './services/coffeeService';
import {
  CartItem,
  MenuItem,
  OrderRecord,
  OrderStatus,
  OrderType,
  PaymentMethod,
  SugarLevel,
  TemperatureOption,
  UserProfile,
} from './types/database';
import { LoginView } from './components/LoginView';
import { MenuView } from './components/MenuView';
import { CartView } from './components/CartView';
import { OrderHistoryView } from './components/OrderHistoryView';

type ActiveTab = 'menu' | 'cart' | 'history';

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(() =>
    coffeeService.getCurrentSession()
  );
  const [activeTab, setActiveTab] = useState<ActiveTab>('menu');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function loadInitialData() {
      const [loadedMenu, loadedOrders] = await Promise.all([
        coffeeService.getMenuItems(),
        coffeeService.getOrders(user),
      ]);
      if (mounted) {
        setMenuItems(loadedMenu);
        setOrders(loadedOrders);
      }
    }
    loadInitialData();
    return () => {
      mounted = false;
    };
  }, [user]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    window.setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2600);
  };

  const handleLoginSuccess = (loggedInUser: UserProfile) => {
    setUser(loggedInUser);
    setActiveTab(loggedInUser.role === 'pemilik' ? 'history' : 'menu');
  };

  const handleLogout = () => {
    coffeeService.logout();
    setUser(null);
    setCart([]);
    setActiveTab('menu');
  };

  const handleAddToCart = (payload: {
    menuItem: MenuItem;
    quantity: number;
    temperature: TemperatureOption;
    sugarLevel: SugarLevel;
    note: string;
  }) => {
    const cartKey = `${payload.menuItem.id}__${payload.temperature}__${payload.sugarLevel}__${payload.note}`;
    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.cartKey === cartKey);
      if (existingIndex >= 0) {
        return prev.map((item, idx) =>
          idx === existingIndex
            ? { ...item, quantity: item.quantity + payload.quantity }
            : item
        );
      }
      return [...prev, { cartKey, ...payload }];
    });
    showToast(`${payload.menuItem.name} ditambahkan ke keranjang`);
  };

  const handleUpdateQuantity = (cartKey: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.cartKey === cartKey
            ? { ...item, quantity: item.quantity + delta }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const handleRemoveItem = (cartKey: string) => {
    setCart((prev) => prev.filter((item) => item.cartKey !== cartKey));
  };

  const handleCheckout = async (payload: {
    customerName: string;
    orderType: OrderType;
    tableNumber?: string;
    paymentMethod: PaymentMethod;
    notes?: string;
  }): Promise<OrderRecord> => {
    if (!user) {
      throw new Error('Pengguna belum masuk.');
    }
    const newOrder = await coffeeService.createOrder({
      customer: user,
      customerName: payload.customerName,
      orderType: payload.orderType,
      tableNumber: payload.tableNumber,
      paymentMethod: payload.paymentMethod,
      notes: payload.notes,
      items: cart.map((c) => ({
        menu_item_id: c.menuItem.id,
        menu_name: c.menuItem.name,
        image_url: c.menuItem.image_url,
        quantity: c.quantity,
        unit_price: c.menuItem.price,
        temperature: c.temperature,
        sugar_level: c.sugarLevel,
        item_note: c.note || undefined,
      })),
    });

    setCart([]);
    const refreshedOrders = await coffeeService.getOrders(user);
    setOrders(refreshedOrders);
    return newOrder;
  };

  const handleToggleMenuAvailability = async (id: string) => {
    const updated = await coffeeService.toggleMenuAvailability(id);
    setMenuItems(updated);
    showToast('Status ketersediaan menu diperbarui');
  };

  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus) => {
    const updated = await coffeeService.updateOrderStatus(orderId, status);
    setOrders(updated);
    showToast(`Status pesanan diubah menjadi ${status}`);
  };

  const handleReorder = (order: OrderRecord) => {
    const newCartItems: CartItem[] = [];
    for (const item of order.items) {
      const foundMenu = menuItems.find((m) => m.id === item.menu_item_id);
      if (foundMenu && foundMenu.is_available) {
        const note = item.item_note || '';
        newCartItems.push({
          cartKey: `${foundMenu.id}__${item.temperature}__${item.sugar_level}__${note}`,
          menuItem: foundMenu,
          quantity: item.quantity,
          temperature: item.temperature,
          sugarLevel: item.sugar_level,
          note,
        });
      }
    }
    if (newCartItems.length > 0) {
      setCart((prev) => [...prev, ...newCartItems]);
      setActiveTab('cart');
      showToast('Menu dari riwayat dimasukkan ke keranjang');
    } else {
      showToast('Menu pada pesanan tersebut sedang tidak tersedia');
    }
  };

  if (!user) {
    return <LoginView onSuccess={handleLoginSuccess} />;
  }

  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-[#0E0B09] text-[#F5EDE4] flex flex-col">
      {/* Top Bar — 3-Zone Contract (Desktop & Mobile) */}
      <header className="sticky top-0 z-30 bg-[#0E0B09]/92 backdrop-blur-md border-b border-[#241B16]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Brand Wordmark */}
          <button
            type="button"
            onClick={() => setActiveTab('menu')}
            className="font-serif text-xl sm:text-2xl font-semibold tracking-tight text-[#F5EDE4] whitespace-nowrap shrink-0"
          >
            Syaé Coffee
          </button>

          {/* Zone 2: Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
            <button
              type="button"
              onClick={() => setActiveTab('menu')}
              className={`whitespace-nowrap shrink-0 py-1 transition-colors ${
                activeTab === 'menu'
                  ? 'text-[#C68B59] border-b-2 border-[#C68B59]'
                  : 'text-[#B0A093] hover:text-[#F5EDE4]'
              }`}
            >
              {user.role === 'pemilik' ? 'Kelola Menu' : 'Daftar Menu'}
            </button>

            {user.role === 'pembeli' && (
              <button
                type="button"
                onClick={() => setActiveTab('cart')}
                className={`whitespace-nowrap shrink-0 py-1 transition-colors tabular-nums ${
                  activeTab === 'cart'
                    ? 'text-[#C68B59] border-b-2 border-[#C68B59]'
                    : 'text-[#B0A093] hover:text-[#F5EDE4]'
                }`}
              >
                Keranjang{totalCartItems > 0 ? ` (${totalCartItems})` : ''}
              </button>
            )}

            <button
              type="button"
              onClick={() => setActiveTab('history')}
              className={`whitespace-nowrap shrink-0 py-1 transition-colors ${
                activeTab === 'history'
                  ? 'text-[#C68B59] border-b-2 border-[#C68B59]'
                  : 'text-[#B0A093] hover:text-[#F5EDE4]'
              }`}
            >
              {user.role === 'pemilik' ? 'Pesanan Masuk' : 'Riwayat Pesanan'}
            </button>
          </nav>

          {/* Zone 3: Single Primary Action */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={handleLogout}
              className="h-10 px-4 rounded-xl bg-[#1A1411] hover:bg-[#261D17] border border-[#2E231D] text-xs sm:text-sm font-semibold text-[#D9CCC0] flex items-center gap-2 transition-colors whitespace-nowrap shrink-0"
            >
              <LogOut className="w-4 h-4" />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 pt-6 pb-24 md:pb-12">
        {activeTab === 'menu' && (
          <MenuView
            menuItems={menuItems}
            userRole={user.role}
            userName={user.full_name}
            onAddToCart={handleAddToCart}
            onToggleAvailability={
              user.role === 'pemilik' ? handleToggleMenuAvailability : undefined
            }
          />
        )}

        {activeTab === 'cart' && user.role === 'pembeli' && (
          <CartView
            cart={cart}
            user={user}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onCheckout={handleCheckout}
            onGoToMenu={() => setActiveTab('menu')}
            onGoToHistory={() => setActiveTab('history')}
          />
        )}

        {activeTab === 'history' && (
          <OrderHistoryView
            orders={orders}
            userRole={user.role}
            onUpdateOrderStatus={
              user.role === 'pemilik' ? handleUpdateOrderStatus : undefined
            }
            onReorder={user.role === 'pembeli' ? handleReorder : undefined}
            onGoToMenu={() => setActiveTab('menu')}
          />
        )}
      </main>

      {/* Toast Feedback */}
      {toastMessage && (
        <div
          role="status"
          className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl bg-[#261D17] border border-[#C68B59]/60 text-[#F5EDE4] text-sm font-medium shadow-xl whitespace-nowrap"
        >
          {toastMessage}
        </div>
      )}

      {/* Mobile Bottom Navigation Bar */}
      <nav
        aria-label="Navigasi utama mobile"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#120D0A]/95 backdrop-blur-md border-t border-[#261D17]"
      >
        <div
          className={`grid ${
            user.role === 'pembeli' ? 'grid-cols-3' : 'grid-cols-2'
          } h-16 items-center`}
        >
          <button
            type="button"
            onClick={() => setActiveTab('menu')}
            className={`h-full flex flex-col items-center justify-center gap-1 transition-colors ${
              activeTab === 'menu' ? 'text-[#C68B59]' : 'text-[#8E7D70]'
            }`}
          >
            <Coffee className="w-5 h-5" />
            <span className="text-[11px] font-semibold">
              {user.role === 'pemilik' ? 'Kelola Menu' : 'Menu Kopi'}
            </span>
          </button>

          {user.role === 'pembeli' && (
            <button
              type="button"
              onClick={() => setActiveTab('cart')}
              className={`h-full flex flex-col items-center justify-center gap-1 relative transition-colors ${
                activeTab === 'cart' ? 'text-[#C68B59]' : 'text-[#8E7D70]'
              }`}
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5" />
                {totalCartItems > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#C68B59] text-[#120D0A] text-[10px] font-bold flex items-center justify-center tabular-nums">
                    {totalCartItems}
                  </span>
                )}
              </div>
              <span className="text-[11px] font-semibold">Keranjang</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`h-full flex flex-col items-center justify-center gap-1 transition-colors ${
              activeTab === 'history' ? 'text-[#C68B59]' : 'text-[#8E7D70]'
            }`}
          >
            <ClipboardList className="w-5 h-5" />
            <span className="text-[11px] font-semibold">
              {user.role === 'pemilik' ? 'Pesanan' : 'Riwayat'}
            </span>
          </button>
        </div>
      </nav>
    </div>
  );
}
