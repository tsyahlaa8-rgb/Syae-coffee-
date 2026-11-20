import React, { useState } from 'react';
import { ArrowRight, Coffee, Eye, EyeOff, Lock, Mail, User } from 'lucide-react';
import { coffeeService } from '../services/coffeeService';
import { UserProfile, UserRole } from '../types/database';
import { CoffeeImage } from './CoffeeImage';

interface LoginViewProps {
  onSuccess: (user: UserProfile) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [role, setRole] = useState<UserRole>('pembeli');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Mohon lengkapi email dan kata sandi Anda.');
      return;
    }

    if (mode === 'register' && !fullName.trim()) {
      setError('Mohon masukkan nama lengkap Anda.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === 'login') {
        const res = await coffeeService.login(email, password);
        if (res.user) {
          onSuccess(res.user);
        } else {
          setError(res.error || 'Gagal masuk. Periksa kembali data Anda.');
        }
      } else {
        const res = await coffeeService.register({
          fullName,
          email,
          password,
          role,
        });
        if (res.user) {
          onSuccess(res.user);
        } else {
          setError(res.error || 'Gagal mendaftar. Coba email lain.');
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemo = async (demoRole: UserRole) => {
    setError('');
    setIsSubmitting(true);
    const demoEmail =
      demoRole === 'pemilik' ? 'pemilik@syaecoffee.id' : 'pembeli@syaecoffee.id';
    const res = await coffeeService.login(demoEmail, '123456');
    setIsSubmitting(false);
    if (res.user) {
      onSuccess(res.user);
    }
  };

  return (
    <div className="min-h-screen bg-[#0E0B09] text-[#F5EDE4] flex flex-col lg:grid lg:grid-cols-12">
      {/* Kolom Kiri — Visual Editorial Kedai (Desktop) */}
      <div className="relative hidden lg:flex lg:col-span-6 xl:col-span-7 flex-col justify-between p-12 overflow-hidden border-r border-[#261D17]">
        <div className="absolute inset-0">
          <CoffeeImage
            src="/src/assets/images/kopi_susu_gula_aren_1795174965659.jpg"
            alt="Kopi Susu Gula Aren Syaé Coffee"
            className="opacity-45"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0E0B09] via-[#0E0B09]/70 to-[#0E0B09]/40" />
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#C68B59] text-[#120D0A] flex items-center justify-center">
            <Coffee className="w-5 h-5" strokeWidth={2.2} />
          </div>
          <span className="font-serif text-2xl font-semibold tracking-tight text-[#F5EDE4]">
            Syaé Coffee
          </span>
        </div>

        <div className="relative z-10 max-w-lg space-y-4">
          <p className="text-sm text-[#D6B18F] font-medium">
            Seduhan Harian · Biji Pilihan Nusantara
          </p>
          <h1
            className="font-serif text-4xl xl:text-5xl font-semibold leading-tight text-[#F5EDE4]"
            style={{ textWrap: 'balance' }}
          >
            Nikmati kopi hangat dan dingin, dipesan langsung dari genggaman.
          </h1>
          <p className="text-base text-[#C4B5A9] leading-relaxed">
            Pesan kopi favorit tanpa antre panjang di kasir, atau kelola pesanan masuk dan
            ketersediaan menu secara langsung dari ruang pemilik kedai.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-4 text-xs text-[#A8998E]">
          <span>Buka Setiap Hari 08.00 – 22.00 WIB</span>
          <span aria-hidden="true">·</span>
          <span>11 Menu Kopi Pilihan</span>
        </div>
      </div>

      {/* Kolom Kanan — Form Masuk / Daftar */}
      <div className="flex-1 lg:col-span-6 xl:col-span-5 flex flex-col justify-center px-5 py-10 sm:px-10 lg:px-12">
        <div className="w-full max-w-md mx-auto space-y-8">
          {/* Header Mobile */}
          <div className="flex items-center gap-3 lg:hidden">
            <div className="w-10 h-10 rounded-xl bg-[#C68B59] text-[#120D0A] flex items-center justify-center">
              <Coffee className="w-5 h-5" strokeWidth={2.2} />
            </div>
            <span className="font-serif text-2xl font-semibold tracking-tight text-[#F5EDE4]">
              Syaé Coffee
            </span>
          </div>

          <div className="space-y-2">
            <h2 className="font-serif text-3xl font-semibold text-[#F5EDE4]">
              {mode === 'login' ? 'Selamat Datang Kembali' : 'Buat Akun Baru'}
            </h2>
            <p className="text-sm text-[#B0A093] leading-relaxed">
              {mode === 'login'
                ? 'Masuk untuk mulai memesan kopi atau mengelola pesanan kedai.'
                : 'Daftar sebagai pembeli atau pemilik untuk menggunakan Syaé Coffee.'}
            </p>
          </div>

          {/* Tab Masuk / Daftar */}
          <div className="grid grid-cols-2 gap-1.5 p-1.5 bg-[#18120F] border border-[#2B201A] rounded-2xl">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError('');
              }}
              className={`h-11 rounded-xl text-sm font-semibold transition-colors whitespace-nowrap ${
                mode === 'login'
                  ? 'bg-[#C68B59] text-[#120D0A]'
                  : 'text-[#B0A093] hover:text-[#F5EDE4]'
              }`}
            >
              Masuk
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setError('');
              }}
              className={`h-11 rounded-xl text-sm font-semibold transition-colors whitespace-nowrap ${
                mode === 'register'
                  ? 'bg-[#C68B59] text-[#120D0A]'
                  : 'text-[#B0A093] hover:text-[#F5EDE4]'
              }`}
            >
              Daftar Akun
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[#D9CCC0]">
                    Daftar Sebagai
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRole('pembeli')}
                      className={`h-12 rounded-xl border text-sm font-semibold transition-colors ${
                        role === 'pembeli'
                          ? 'bg-[#281E17] border-[#C68B59] text-[#F5EDE4]'
                          : 'bg-[#16100D] border-[#2B201A] text-[#9E8E81] hover:border-[#4A382D]'
                      }`}
                    >
                      Pembeli
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('pemilik')}
                      className={`h-12 rounded-xl border text-sm font-semibold transition-colors ${
                        role === 'pemilik'
                          ? 'bg-[#281E17] border-[#C68B59] text-[#F5EDE4]'
                          : 'bg-[#16100D] border-[#2B201A] text-[#9E8E81] hover:border-[#4A382D]'
                      }`}
                    >
                      Pemilik Kedai
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="fullName" className="block text-sm font-medium text-[#D9CCC0]">
                    Nama Lengkap
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#8E7D70] absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Contoh: Nadira Putri"
                      className="w-full h-13 pl-11 pr-4 rounded-xl bg-[#18120F] border border-[#2E231D] text-[#F5EDE4] placeholder-[#78685C] text-base focus:outline-none focus:border-[#C68B59] transition-colors"
                    />
                  </div>
                </div>
              </>
            )}

            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-sm font-medium text-[#D9CCC0]">
                Alamat Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#8E7D70] absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="w-full h-13 pl-11 pr-4 rounded-xl bg-[#18120F] border border-[#2E231D] text-[#F5EDE4] placeholder-[#78685C] text-base focus:outline-none focus:border-[#C68B59] transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-sm font-medium text-[#D9CCC0]">
                Kata Sandi
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#8E7D70] absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="w-full h-13 pl-11 pr-12 rounded-xl bg-[#18120F] border border-[#2E231D] text-[#F5EDE4] placeholder-[#78685C] text-base focus:outline-none focus:border-[#C68B59] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-[#8E7D70] hover:text-[#F5EDE4]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="p-3.5 rounded-xl bg-[#2E1614] border border-[#6E2C24] text-sm text-[#F4B4AC]"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-14 rounded-2xl bg-[#C68B59] hover:bg-[#D69B69] active:scale-[0.99] text-[#120D0A] font-bold text-base flex items-center justify-center gap-2 transition-all disabled:opacity-60"
            >
              <span>
                {isSubmitting
                  ? 'Memproses...'
                  : mode === 'login'
                  ? 'Masuk ke Syaé Coffee'
                  : 'Daftar & Masuk'}
              </span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          {/* Akses Cepat Demo untuk Pembeli & Pemilik */}
          <div className="pt-4 border-t border-[#261D17] space-y-3">
            <p className="text-xs text-[#9E8E81] text-center">
              Ingin langsung mencoba aplikasi? Pilih akses cepat di bawah:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleQuickDemo('pembeli')}
                disabled={isSubmitting}
                className="h-12 px-4 rounded-xl bg-[#1A1411] hover:bg-[#241B16] border border-[#332720] text-[#F5EDE4] text-sm font-semibold transition-colors"
              >
                Masuk sebagai Pembeli
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('pemilik')}
                disabled={isSubmitting}
                className="h-12 px-4 rounded-xl bg-[#1A1411] hover:bg-[#241B16] border border-[#332720] text-[#E6C3A3] text-sm font-semibold transition-colors"
              >
                Masuk sebagai Pemilik
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
