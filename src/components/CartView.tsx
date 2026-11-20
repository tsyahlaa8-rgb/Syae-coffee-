import React, { useState } from 'react';
import { CheckCircle2, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import {
  CartItem,
  OrderRecord,
  OrderType,
  PaymentMethod,
  UserProfile,
} from '../types/database';
import { formatRupiah } from '../services/coffeeService';
import { CoffeeImage } from './CoffeeImage';

interface CartViewProps {
  cart: CartItem[];
  user: UserProfile;
  onUpdateQuantity: (cartKey: string, delta: number) => void;
  onRemoveItem: (cartKey: string) => void;
  onCheckout: (payload: {
    customerName: string;
    orderType: OrderType;
    tableNumber?: string;
    paymentMethod: PaymentMethod;
    notes?: string;
  }) => Promise<OrderRecord>;
  onGoToMenu: () => void;
  onGoToHistory: () => void;
}

export const CartView: React.FC<CartViewProps> = ({
  cart,
  user,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  onGoToMenu,
  onGoToHistory,
}) => {
  const [customerName, setCustomerName] = useState(user.full_name);
  const [orderType, setOrderType] = useState<OrderType>('Ambil di Kasir');
  const [tableNumber, setTableNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('QRIS');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<OrderRecord | null>(null);

  const subtotal = cart.reduce(
    (sum, item) => sum + item.menuItem.price * item.quantity,
    0
  );

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    setIsSubmitting(true);
    try {
      const order = await onCheckout({
        customerName: customerName.trim() || user.full_name,
        orderType,
        tableNumber: orderType === 'Makan di Tempat' ? tableNumber.trim() : undefined,
        paymentMethod,
        notes: notes.trim() || undefined,
      });
      setConfirmedOrder(order);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (confirmedOrder) {
    return (
      <div className="max-w-xl mx-auto py-8 sm:py-12">
        <div className="rounded-3xl bg-[#18120F] border border-[#2E231D] p-6 sm:p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-[#261D17] border border-[#C68B59]/40 text-[#C68B59] flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium text-[#C68B59]">
              Pesanan Berhasil Dikirim
            </p>
            <h1 className="font-serif text-3xl font-semibold text-[#F5EDE4]">
              Kode Pesanan #{confirmedOrder.order_code}
            </h1>
            <p className="text-sm text-[#B0A093] leading-relaxed">
              Terima kasih, {confirmedOrder.customer_name}. Barista Syaé Coffee telah
              menerima pesananmu dan akan segera menyeduhnya.
            </p>
          </div>

          <div className="rounded-2xl bg-[#120D0A] border border-[#261D17] p-4 text-left space-y-2.5 text-sm">
            <div className="flex justify-between text-[#B0A093]">
              <span>Jenis Pesanan</span>
              <span className="text-[#F5EDE4] font-medium">
                {confirmedOrder.order_type}
                {confirmedOrder.table_number ? ` · ${confirmedOrder.table_number}` : ''}
              </span>
            </div>
            <div className="flex justify-between text-[#B0A093]">
              <span>Metode Pembayaran</span>
              <span className="text-[#F5EDE4] font-medium">
                {confirmedOrder.payment_method}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-[#261D17]">
              <span className="font-semibold text-[#F5EDE4]">Total Bayar</span>
              <span className="font-bold text-[#E6C3A3] tabular-nums">
                {formatRupiah(confirmedOrder.total_amount)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={onGoToHistory}
              className="h-14 rounded-2xl bg-[#C68B59] hover:bg-[#D69B69] text-[#120D0A] font-bold text-sm transition-colors"
            >
              Lihat Riwayat Pesanan
            </button>
            <button
              type="button"
              onClick={() => {
                setConfirmedOrder(null);
                onGoToMenu();
              }}
              className="h-14 rounded-2xl bg-[#211914] hover:bg-[#2B201A] border border-[#332720] text-[#F5EDE4] font-semibold text-sm transition-colors"
            >
              Pesan Menu Lain
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-lg mx-auto py-12 text-center space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-[#18120F] border border-[#2B201A] text-[#9E8E81] flex items-center justify-center mx-auto">
          <ShoppingBag className="w-7 h-7" strokeWidth={1.6} />
        </div>
        <div className="space-y-2">
          <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-[#F5EDE4]">
            Keranjang Masih Kosong
          </h1>
          <p className="text-sm text-[#B0A093] leading-relaxed">
            Belum ada kopi yang dipilih. Jelajahi menu kopi pilihan Syaé Coffee dan
            tambahkan minuman favoritmu ke keranjang.
          </p>
        </div>
        <button
          type="button"
          onClick={onGoToMenu}
          className="h-14 px-8 rounded-2xl bg-[#C68B59] hover:bg-[#D69B69] text-[#120D0A] font-bold text-base transition-colors"
        >
          Lihat Daftar Menu Kopi
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="space-y-1">
        <h1 className="font-serif text-3xl font-semibold text-[#F5EDE4]">
          Keranjang Pesanan
        </h1>
        <p className="text-sm text-[#B0A093]">
          Periksa kembali pesanan kopi dan pilih metode pengambilan sebelum konfirmasi.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Daftar Item Keranjang */}
        <section className="lg:col-span-7 space-y-4">
          {cart.map((item) => (
            <div
              key={item.cartKey}
              className="rounded-2xl bg-[#18120F] border border-[#2B201A] p-4 flex gap-4"
            >
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-[#211914] shrink-0">
                <CoffeeImage src={item.menuItem.image_url} alt={item.menuItem.name} />
              </div>

              <div className="flex-1 min-w-0 flex flex-col justify-between gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h2 className="font-serif text-lg font-semibold text-[#F5EDE4] truncate">
                      {item.menuItem.name}
                    </h2>
                    <p className="text-xs text-[#9E8E81] mt-0.5">
                      {item.temperature} · {item.sugarLevel}
                    </p>
                    {item.note && (
                      <p className="text-xs text-[#C68B59] mt-1">Catatan: {item.note}</p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => onRemoveItem(item.cartKey)}
                    aria-label={`Hapus ${item.menuItem.name}`}
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-[#8E7D70] hover:text-[#F4B4AC] hover:bg-[#2E1614] transition-colors shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="text-base font-bold text-[#E6C3A3] tabular-nums">
                    {formatRupiah(item.menuItem.price * item.quantity)}
                  </span>

                  <div className="flex items-center bg-[#120D0A] border border-[#2E231D] rounded-xl h-11 px-1">
                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(item.cartKey, -1)}
                      aria-label="Kurangi jumlah"
                      className="w-9 h-9 flex items-center justify-center text-[#F5EDE4] hover:text-[#C68B59]"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center text-sm font-bold tabular-nums text-[#F5EDE4]">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(item.cartKey, 1)}
                      aria-label="Tambah jumlah"
                      className="w-9 h-9 flex items-center justify-center text-[#F5EDE4] hover:text-[#C68B59]"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* Form Ringkasan & Pembayaran */}
        <form
          onSubmit={handlePlaceOrder}
          className="lg:col-span-5 rounded-3xl bg-[#18120F] border border-[#2B201A] p-5 sm:p-6 space-y-5"
        >
          <h2 className="font-serif text-xl font-semibold text-[#F5EDE4]">
            Detail Pemesanan
          </h2>

          <div className="space-y-1.5">
            <label htmlFor="customerName" className="block text-sm font-medium text-[#D9CCC0]">
              Nama Pemesan
            </label>
            <input
              id="customerName"
              type="text"
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Nama untuk dipanggil di kasir"
              className="w-full h-12 px-4 rounded-xl bg-[#120D0A] border border-[#2E231D] text-[#F5EDE4] text-sm focus:outline-none focus:border-[#C68B59]"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#D9CCC0]">
              Cara Pengambilan
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {(['Ambil di Kasir', 'Makan di Tempat'] as OrderType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setOrderType(type)}
                  className={`h-12 px-3 rounded-xl border text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap ${
                    orderType === type
                      ? 'bg-[#2B2018] border-[#C68B59] text-[#F5EDE4]'
                      : 'bg-[#120D0A] border-[#2E231D] text-[#9E8E81] hover:border-[#4A382D]'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {orderType === 'Makan di Tempat' && (
            <div className="space-y-1.5">
              <label htmlFor="tableNumber" className="block text-sm font-medium text-[#D9CCC0]">
                Nomor Meja
              </label>
              <input
                id="tableNumber"
                type="text"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                placeholder="Contoh: Meja 05"
                className="w-full h-12 px-4 rounded-xl bg-[#120D0A] border border-[#2E231D] text-[#F5EDE4] text-sm focus:outline-none focus:border-[#C68B59]"
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#D9CCC0]">
              Metode Pembayaran
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {(['QRIS', 'Tunai di Kasir'] as PaymentMethod[]).map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPaymentMethod(method)}
                  className={`h-12 px-3 rounded-xl border text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap ${
                    paymentMethod === method
                      ? 'bg-[#2B2018] border-[#C68B59] text-[#F5EDE4]'
                      : 'bg-[#120D0A] border-[#2E231D] text-[#9E8E81] hover:border-[#4A382D]'
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="orderNotes" className="block text-sm font-medium text-[#D9CCC0]">
              Catatan Pesanan (Opsional)
            </label>
            <input
              id="orderNotes"
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Bungkus terpisah, sedotan kertas"
              className="w-full h-12 px-4 rounded-xl bg-[#120D0A] border border-[#2E231D] text-[#F5EDE4] text-sm focus:outline-none focus:border-[#C68B59]"
            />
          </div>

          <div className="pt-4 border-t border-[#261D17] space-y-2 text-sm">
            <div className="flex justify-between text-[#B0A093]">
              <span>Subtotal ({cart.reduce((s, i) => s + i.quantity, 0)} gelas)</span>
              <span className="tabular-nums">{formatRupiah(subtotal)}</span>
            </div>
            <div className="flex justify-between text-[#B0A093]">
              <span>Biaya Layanan</span>
              <span>Gratis</span>
            </div>
            <div className="flex justify-between pt-2 text-base font-bold text-[#F5EDE4]">
              <span>Total Pembayaran</span>
              <span className="text-xl text-[#E6C3A3] tabular-nums">
                {formatRupiah(subtotal)}
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-14 rounded-2xl bg-[#C68B59] hover:bg-[#D69B69] active:scale-[0.99] text-[#120D0A] font-bold text-base transition-all disabled:opacity-60"
          >
            {isSubmitting ? 'Mengirim Pesanan...' : 'Pesan Sekarang'}
          </button>
        </form>
      </div>
    </div>
  );
};
