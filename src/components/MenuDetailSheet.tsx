import React, { useState } from 'react';
import { Minus, Plus, X } from 'lucide-react';
import { MenuItem, SugarLevel, TemperatureOption } from '../types/database';
import { formatRupiah } from '../services/coffeeService';
import { CoffeeImage } from './CoffeeImage';

interface MenuDetailSheetProps {
  item: MenuItem;
  onClose: () => void;
  onAddToCart: (payload: {
    menuItem: MenuItem;
    quantity: number;
    temperature: TemperatureOption;
    sugarLevel: SugarLevel;
    note: string;
  }) => void;
}

const SUGAR_OPTIONS: SugarLevel[] = ['Normal', 'Sedikit Gula', 'Tanpa Gula'];

export const MenuDetailSheet: React.FC<MenuDetailSheetProps> = ({
  item,
  onClose,
  onAddToCart,
}) => {
  const [temperature, setTemperature] = useState<TemperatureOption>(
    item.serving_options[0] || 'Dingin'
  );
  const [sugarLevel, setSugarLevel] = useState<SugarLevel>('Normal');
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState('');

  const handleConfirm = () => {
    onAddToCart({
      menuItem: item,
      quantity,
      temperature,
      sugarLevel,
      note: note.trim(),
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sheet-title"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-lg bg-[#16110E] border-t sm:border border-[#2E231D] rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag Handle (Mobile) */}
        <div className="sm:hidden pt-3 pb-1 flex justify-center">
          <div className="w-10 h-1.5 rounded-full bg-[#3A2C24]" />
        </div>

        {/* Gambar & Tombol Tutup */}
        <div className="relative h-52 sm:h-56 shrink-0 bg-[#1F1712]">
          <CoffeeImage src={item.image_url} alt={item.name} />
          <div className="absolute inset-0 bg-gradient-to-t from-[#16110E] via-transparent to-black/30" />
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup detail menu"
            className="absolute top-3 right-3 w-11 h-11 rounded-full bg-[#120D0A]/80 border border-[#3A2C24] text-[#F5EDE4] flex items-center justify-center hover:bg-[#231A15] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Konten Scrollable */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          <div className="space-y-1.5">
            <p className="text-xs text-[#C68B59] font-medium">
              {item.category} · {item.origin_note}
            </p>
            <div className="flex items-start justify-between gap-4">
              <h3 id="sheet-title" className="font-serif text-2xl font-semibold text-[#F5EDE4]">
                {item.name}
              </h3>
              <span className="text-lg font-bold text-[#E6C3A3] tabular-nums whitespace-nowrap">
                {formatRupiah(item.price)}
              </span>
            </div>
            <p className="text-sm text-[#B0A093] leading-relaxed">{item.description}</p>
          </div>

          {/* Pilihan Penyajian */}
          <div className="space-y-2.5">
            <label className="block text-sm font-semibold text-[#F5EDE4]">
              Pilihan Penyajian
            </label>
            <div className="grid grid-cols-2 gap-3">
              {item.serving_options.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setTemperature(opt)}
                  className={`h-12 rounded-xl border text-sm font-semibold transition-colors ${
                    temperature === opt
                      ? 'bg-[#2B2018] border-[#C68B59] text-[#F5EDE4]'
                      : 'bg-[#1D1612] border-[#2E231D] text-[#9E8E81] hover:border-[#4A382D]'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Tingkat Gula */}
          <div className="space-y-2.5">
            <label className="block text-sm font-semibold text-[#F5EDE4]">
              Tingkat Manis
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {SUGAR_OPTIONS.map((sugar) => (
                <button
                  key={sugar}
                  type="button"
                  onClick={() => setSugarLevel(sugar)}
                  className={`h-12 px-2 rounded-xl border text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap ${
                    sugarLevel === sugar
                      ? 'bg-[#2B2018] border-[#C68B59] text-[#F5EDE4]'
                      : 'bg-[#1D1612] border-[#2E231D] text-[#9E8E81] hover:border-[#4A382D]'
                  }`}
                >
                  {sugar}
                </button>
              ))}
            </div>
          </div>

          {/* Catatan Tambahan */}
          <div className="space-y-2">
            <label htmlFor="item-note" className="block text-sm font-semibold text-[#F5EDE4]">
              Catatan untuk Barista (Opsional)
            </label>
            <input
              id="item-note"
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Contoh: Es sedikit, ekstra hangat..."
              className="w-full h-12 px-4 rounded-xl bg-[#1D1612] border border-[#2E231D] text-[#F5EDE4] placeholder-[#78685C] text-sm focus:outline-none focus:border-[#C68B59]"
            />
          </div>
        </div>

        {/* Footer Aksi */}
        <div className="p-4 sm:p-5 border-t border-[#261D17] bg-[#120D0A] flex items-center gap-3 shrink-0">
          <div className="flex items-center bg-[#1D1612] border border-[#2E231D] rounded-xl h-14 px-1">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              aria-label="Kurangi jumlah"
              className="w-11 h-11 flex items-center justify-center text-[#F5EDE4] hover:text-[#C68B59]"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-8 text-center font-bold text-base tabular-nums text-[#F5EDE4]">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((q) => q + 1)}
              aria-label="Tambah jumlah"
              className="w-11 h-11 flex items-center justify-center text-[#F5EDE4] hover:text-[#C68B59]"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 h-14 px-5 rounded-2xl bg-[#C68B59] hover:bg-[#D69B69] active:scale-[0.99] text-[#120D0A] font-bold text-sm sm:text-base flex items-center justify-between transition-all"
          >
            <span>Tambah ke Keranjang</span>
            <span className="tabular-nums">{formatRupiah(item.price * quantity)}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
