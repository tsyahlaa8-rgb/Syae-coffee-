import React, { useMemo, useState } from 'react';
import { CheckCircle2, Clock, Coffee, RotateCcw } from 'lucide-react';
import { OrderRecord, OrderStatus, UserRole } from '../types/database';
import { formatRupiah, formatWaktuIndonesia } from '../services/coffeeService';
import { CoffeeImage } from './CoffeeImage';

interface OrderHistoryViewProps {
  orders: OrderRecord[];
  userRole: UserRole;
  onUpdateOrderStatus?: (orderId: string, status: OrderStatus) => void;
  onReorder?: (order: OrderRecord) => void;
  onGoToMenu: () => void;
}

const STATUS_FILTERS: ('Semua' | OrderStatus)[] = [
  'Semua',
  'Menunggu',
  'Diproses',
  'Siap Diambil',
  'Selesai',
];

function getNextStatus(current: OrderStatus): { next: OrderStatus; label: string } | null {
  switch (current) {
    case 'Menunggu':
      return { next: 'Diproses', label: 'Mulai Seduh (Proses)' };
    case 'Diproses':
      return { next: 'Siap Diambil', label: 'Tandai Siap Diambil' };
    case 'Siap Diambil':
      return { next: 'Selesai', label: 'Selesaikan Pesanan' };
    default:
      return null;
  }
}

function getStatusColor(status: OrderStatus): string {
  switch (status) {
    case 'Menunggu':
      return 'text-[#E6C3A3]';
    case 'Diproses':
      return 'text-[#D69B69]';
    case 'Siap Diambil':
      return 'text-[#9ED6A7]';
    case 'Selesai':
      return 'text-[#9E8E81]';
  }
}

export const OrderHistoryView: React.FC<OrderHistoryViewProps> = ({
  orders,
  userRole,
  onUpdateOrderStatus,
  onReorder,
  onGoToMenu,
}) => {
  const [statusFilter, setStatusFilter] = useState<'Semua' | OrderStatus>('Semua');

  const filteredOrders = useMemo(() => {
    if (statusFilter === 'Semua') return orders;
    return orders.filter((order) => order.status === statusFilter);
  }, [orders, statusFilter]);

  const ownerStats = useMemo(() => {
    const totalRevenue = orders.reduce((sum, o) => sum + o.total_amount, 0);
    const activeCount = orders.filter((o) => o.status !== 'Selesai').length;
    return {
      totalOrders: orders.length,
      activeCount,
      totalRevenue,
    };
  }, [orders]);

  return (
    <div className="space-y-6 pb-8">
      <div className="space-y-1">
        <h1 className="font-serif text-3xl font-semibold text-[#F5EDE4]">
          {userRole === 'pemilik' ? 'Pesanan Masuk & Riwayat' : 'Riwayat Pesanan Saya'}
        </h1>
        <p className="text-sm text-[#B0A093]">
          {userRole === 'pemilik'
            ? 'Pantau pesanan pelanggan yang masuk dan perbarui status penyajian secara langsung.'
            : 'Pantau status seduhan kopimu atau pesan ulang menu favorit dengan satu ketukan.'}
        </p>
      </div>

      {/* Ringkasan Penjualan Khusus Pemilik */}
      {userRole === 'pemilik' && (
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-2xl bg-[#18120F] border border-[#2B201A] p-5 space-y-1">
            <p className="text-xs text-[#9E8E81]">Total Pesanan</p>
            <p className="text-2xl font-bold text-[#F5EDE4] tabular-nums">
              {ownerStats.totalOrders} Pesanan
            </p>
          </div>
          <div className="rounded-2xl bg-[#18120F] border border-[#2B201A] p-5 space-y-1">
            <p className="text-xs text-[#9E8E81]">Sedang Berjalan</p>
            <p className="text-2xl font-bold text-[#C68B59] tabular-nums">
              {ownerStats.activeCount} Aktif
            </p>
          </div>
          <div className="rounded-2xl bg-[#18120F] border border-[#2B201A] p-5 space-y-1">
            <p className="text-xs text-[#9E8E81]">Total Pendapatan</p>
            <p className="text-2xl font-bold text-[#E6C3A3] tabular-nums">
              {formatRupiah(ownerStats.totalRevenue)}
            </p>
          </div>
        </section>
      )}

      {/* Filter Status */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {STATUS_FILTERS.map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setStatusFilter(status)}
            className={`h-11 px-4 rounded-xl text-sm font-semibold transition-colors whitespace-nowrap shrink-0 ${
              statusFilter === status
                ? 'bg-[#C68B59] text-[#120D0A]'
                : 'bg-[#18120F] border border-[#2B201A] text-[#B0A093] hover:text-[#F5EDE4]'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Daftar Pesanan */}
      {filteredOrders.length === 0 ? (
        <div className="rounded-3xl bg-[#18120F] border border-[#2B201A] p-10 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-[#211914] text-[#9E8E81] flex items-center justify-center mx-auto">
            <Coffee className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <p className="font-serif text-xl text-[#F5EDE4]">Belum ada pesanan</p>
            <p className="text-sm text-[#9E8E81]">
              {statusFilter === 'Semua'
                ? 'Riwayat pesanan akan muncul di sini setelah ada transaksi.'
                : `Tidak ada pesanan dengan status "${statusFilter}".`}
            </p>
          </div>
          {userRole === 'pembeli' && (
            <button
              type="button"
              onClick={onGoToMenu}
              className="h-12 px-6 rounded-xl bg-[#C68B59] text-[#120D0A] font-bold text-sm"
            >
              Mulai Pesan Kopi
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const nextAction = getNextStatus(order.status);

            return (
              <article
                key={order.id}
                className="rounded-2xl bg-[#18120F] border border-[#2B201A] p-5 space-y-4"
              >
                {/* Header Pesanan */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#261D17]">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-bold text-[#F5EDE4] tabular-nums">
                        #{order.order_code}
                      </span>
                      <span className="text-[#6E5E53]" aria-hidden="true">
                        ·
                      </span>
                      <span className="text-[#B0A093]">{order.customer_name}</span>
                    </div>
                    <p className="text-xs text-[#8E7D70]">
                      {formatWaktuIndonesia(order.created_at)} · {order.order_type}
                      {order.table_number ? ` (${order.table_number})` : ''} ·{' '}
                      {order.payment_method}
                    </p>
                  </div>

                  <div
                    className={`flex items-center gap-1.5 text-sm font-semibold ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {order.status === 'Selesai' ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <Clock className="w-4 h-4" />
                    )}
                    <span>Status: {order.status}</span>
                  </div>
                </div>

                {/* Item Kopi */}
                <div className="space-y-3">
                  {order.items.map((item, idx) => (
                    <div key={`${order.id}-${idx}`} className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-[#211914] shrink-0">
                        <CoffeeImage src={item.image_url} alt={item.menu_name} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#F5EDE4] truncate">
                          {item.quantity}x {item.menu_name}
                        </p>
                        <p className="text-xs text-[#9E8E81]">
                          {item.temperature} · {item.sugar_level}
                          {item.item_note ? ` · ${item.item_note}` : ''}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-[#D9CCC0] tabular-nums shrink-0">
                        {formatRupiah(item.unit_price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {order.notes && (
                  <p className="text-xs text-[#C68B59] bg-[#120D0A] border border-[#261D17] rounded-xl px-3.5 py-2.5">
                    Catatan Pemesan: {order.notes}
                  </p>
                )}

                {/* Footer Total & Aksi */}
                <div className="pt-3 border-t border-[#261D17] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="text-xs text-[#8E7D70]">Total Pesanan</p>
                    <p className="text-lg font-bold text-[#E6C3A3] tabular-nums">
                      {formatRupiah(order.total_amount)}
                    </p>
                  </div>

                  {userRole === 'pemilik' && onUpdateOrderStatus && nextAction && (
                    <button
                      type="button"
                      onClick={() => onUpdateOrderStatus(order.id, nextAction.next)}
                      className="h-12 px-5 rounded-xl bg-[#C68B59] hover:bg-[#D69B69] text-[#120D0A] font-bold text-sm transition-colors whitespace-nowrap"
                    >
                      {nextAction.label}
                    </button>
                  )}

                  {userRole === 'pembeli' && onReorder && (
                    <button
                      type="button"
                      onClick={() => onReorder(order)}
                      className="h-12 px-5 rounded-xl bg-[#211914] hover:bg-[#2B201A] border border-[#362921] text-[#F5EDE4] font-semibold text-sm flex items-center justify-center gap-2 transition-colors whitespace-nowrap"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Pesan Lagi</span>
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
