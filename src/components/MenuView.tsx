import React, { useMemo, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { MenuCategory, MenuItem, SugarLevel, TemperatureOption, UserRole } from '../types/database';
import { formatRupiah } from '../services/coffeeService';
import { CoffeeImage } from './CoffeeImage';
import { MenuDetailSheet } from './MenuDetailSheet';

interface MenuViewProps {
  menuItems: MenuItem[];
  userRole: UserRole;
  userName: string;
  onAddToCart: (payload: {
    menuItem: MenuItem;
    quantity: number;
    temperature: TemperatureOption;
    sugarLevel: SugarLevel;
    note: string;
  }) => void;
  onToggleAvailability?: (id: string) => void;
}

const CATEGORIES: MenuCategory[] = [
  'Semua',
  'Signature',
  'Kopi Susu',
  'Kopi Hitam',
  'Manual Brew',
];

export const MenuView: React.FC<MenuViewProps> = ({
  menuItems,
  userRole,
  userName,
  onAddToCart,
  onToggleAvailability,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory>('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeItem, setActiveItem] = useState<MenuItem | null>(null);

  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchCategory =
        selectedCategory === 'Semua' || item.category === selectedCategory;
      const query = searchQuery.trim().toLowerCase();
      const matchQuery =
        !query ||
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query);
      return matchCategory && matchQuery;
    });
  }, [menuItems, selectedCategory, searchQuery]);

  const firstName = userName.split(' ')[0];

  return (
    <div className="space-y-8 pb-8">
      {/* Hero Ringkas */}
      <section className="relative overflow-hidden rounded-3xl bg-[#18120F] border border-[#2B201A]">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
          <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-center space-y-4">
            <p className="text-xs sm:text-sm font-medium text-[#C68B59]">
              Halo, {firstName} · Seduhan Segar Hari Ini
            </p>
            <h1
              className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#F5EDE4] leading-tight"
              style={{ textWrap: 'balance' }}
            >
              Temukan cangkir kopi terbaik untuk harimu.
            </h1>
            <p className="text-sm sm:text-base text-[#B0A093] max-w-xl leading-relaxed">
              Setiap gelas diseduh dari biji kopi sangrai pilihan dengan takaran presisi.
              Pilih menu favoritmu, atur tingkat manis, lalu ambil di kasir atau nikmati di meja.
            </p>
          </div>

          <div className="hidden lg:block lg:col-span-5 relative min-h-[260px]">
            <CoffeeImage
              src="/src/assets/images/caffe_latte_klasik_1795174965264.jpg"
              alt="Caffè Latte Klasik Syaé Coffee"
              className="lg:h-full"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#18120F] via-transparent to-transparent" />
          </div>
        </div>
      </section>

      {/* Pencarian & Filter Kategori */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#8E7D70] absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari kopi, gula aren, matcha, V60..."
              aria-label="Cari menu kopi"
              className="w-full h-12 pl-11 pr-4 rounded-xl bg-[#18120F] border border-[#2E231D] text-[#F5EDE4] placeholder-[#78685C] text-sm focus:outline-none focus:border-[#C68B59] transition-colors"
            />
          </div>

          <p className="text-xs text-[#9E8E81] tabular-nums">
            Menampilkan {filteredItems.length} dari {menuItems.length} menu kopi
          </p>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {CATEGORIES.map((category) => {
            const isActive = selectedCategory === category;
            return (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`h-11 px-4 rounded-xl text-sm font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-[#C68B59] text-[#120D0A]'
                    : 'bg-[#18120F] border border-[#2B201A] text-[#B0A093] hover:text-[#F5EDE4] hover:border-[#4A382D]'
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>
      </section>

      {/* Grid Daftar Menu Kopi (10 Foto) */}
      {filteredItems.length === 0 ? (
        <div className="rounded-3xl bg-[#18120F] border border-[#2B201A] p-10 text-center space-y-3">
          <p className="font-serif text-xl text-[#F5EDE4]">Menu tidak ditemukan</p>
          <p className="text-sm text-[#9E8E81]">
            Coba kata kunci lain atau pilih kategori Semua untuk melihat seluruh menu Syaé Coffee.
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('Semua');
              setSearchQuery('');
            }}
            className="h-12 px-6 rounded-xl bg-[#C68B59] text-[#120D0A] font-semibold text-sm"
          >
            Tampilkan Semua Menu
          </button>
        </div>
      ) : (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {filteredItems.map((item) => (
            <article
              key={item.id}
              className={`group rounded-2xl bg-[#18120F] border border-[#2B201A] overflow-hidden flex flex-col transition-transform duration-200 hover:-translate-y-0.5 ${
                !item.is_available ? 'opacity-65' : ''
              }`}
            >
              {/* Foto Produk 4:3 */}
              <div className="relative aspect-[4/3] bg-[#211914] overflow-hidden">
                <CoffeeImage
                  src={item.image_url}
                  alt={item.name}
                  className="transition-transform duration-300 group-hover:scale-[1.03]"
                />
                {!item.is_available && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <span className="text-sm font-semibold text-[#F5EDE4] bg-[#18120F]/90 border border-[#3A2C24] px-4 py-2 rounded-xl">
                      Stok Habis
                    </span>
                  </div>
                )}
              </div>

              {/* Detail Kartu */}
              <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs text-[#9E8E81]">
                    <span className="text-[#C68B59] font-medium">{item.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{item.serving_options.join(' / ')}</span>
                  </div>
                  <h2 className="font-serif text-xl font-semibold text-[#F5EDE4] leading-snug">
                    {item.name}
                  </h2>
                  <p className="text-sm text-[#B0A093] line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#261D17] flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs text-[#8E7D70]">Harga</p>
                    <p className="text-lg font-bold text-[#F5EDE4] tabular-nums">
                      {formatRupiah(item.price)}
                    </p>
                  </div>

                  {userRole === 'pemilik' && onToggleAvailability ? (
                    <button
                      type="button"
                      onClick={() => onToggleAvailability(item.id)}
                      className={`h-12 px-4 rounded-xl text-sm font-semibold transition-colors whitespace-nowrap ${
                        item.is_available
                          ? 'bg-[#261D17] hover:bg-[#332720] text-[#E6C3A3] border border-[#3E2F26]'
                          : 'bg-[#C68B59] hover:bg-[#D69B69] text-[#120D0A]'
                      }`}
                    >
                      {item.is_available ? 'Tandai Habis' : 'Aktifkan Stok'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={!item.is_available}
                      onClick={() => setActiveItem(item)}
                      className="h-12 px-5 rounded-xl bg-[#C68B59] hover:bg-[#D69B69] active:scale-[0.98] disabled:bg-[#2B201A] disabled:text-[#78685C] text-[#120D0A] font-bold text-sm flex items-center gap-1.5 transition-all whitespace-nowrap"
                    >
                      <Plus className="w-4 h-4" strokeWidth={2.5} />
                      <span>Pesan</span>
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </section>
      )}

      {activeItem && (
        <MenuDetailSheet
          item={activeItem}
          onClose={() => setActiveItem(null)}
          onAddToCart={onAddToCart}
        />
      )}
    </div>
  );
};
