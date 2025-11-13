'use client';

import Link from 'next/link';

// Daftar modul dengan ikon eksplisit (aman untuk SSR + hydration)
const modules = [
  {
    title: 'Goods Received',
    icon: '📦',
    desc: 'Terima barang & generate QR label',
    href: '/goods-received',
    bg: 'bg-gray-50',
    border: 'border-gray-300',
    hover: 'hover:shadow-md hover:border-gray-400',
    iconBg: 'bg-gray-100',
    iconColor: 'text-gray-700',
  },
  {
    title: 'Putting',
    icon: '📍',
    desc: 'Simpan barang ke rak dengan scan QR',
    href: '/putting',
    bg: 'bg-blue-50',
    border: 'border-blue-300',
    hover: 'hover:shadow-md hover:border-blue-400',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-700',
  },
  {
    title: 'Picking',
    icon: '🛒',
    desc: 'Ambil barang untuk produksi',
    href: '/picking',
    bg: 'bg-indigo-50',
    border: 'border-indigo-300',
    hover: 'hover:shadow-md hover:border-indigo-400',
    iconBg: 'bg-indigo-100',
    iconColor: 'text-indigo-700',
  },
  {
    title: 'Goods Issue',
    icon: '📤',
    desc: 'Keluar barang dari gudang',
    href: '/goods-issue',
    bg: 'bg-green-50',
    border: 'border-green-300',
    hover: 'hover:shadow-md hover:border-green-400',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-700',
  },
  {
    title: 'Permintaan Produksi',
    icon: '🏭',
    desc: 'Ajukan permintaan via form web',
    href: '/request',
    bg: 'bg-purple-50',
    border: 'border-purple-300',
    hover: 'hover:shadow-md hover:border-purple-400',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-700',
  },
  {
    title: 'Dashboard',
    icon: '📊',
    desc: 'Lihat histori QR & status stok',
    href: '/dashboard',
    bg: 'bg-slate-50',
    border: 'border-slate-300',
    hover: 'hover:shadow-md hover:border-slate-400',
    iconBg: 'bg-slate-100',
    iconColor: 'text-slate-700',
  },
  {
    title: 'QR Rak Penyimpanan',
    icon: '🏷️',
    desc: 'Generate QR code untuk lokasi rak',
    href: '/storage-qr',
    bg: 'bg-teal-50',
    border: 'border-teal-300',
    hover: 'hover:shadow-md hover:border-teal-400',
    iconBg: 'bg-teal-100',
    iconColor: 'text-teal-700',
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10 pt-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Sistem Manajemen Gudang Berbasis QR Code
          </h1>
          <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
            Simulasi alur: Goods Received → Putting → Picking → Goods Issue
          </p>
        </div>

        {/* Grid Modul */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((mod, i) => (
            <Link key={i} href={mod.href} className="block">
              <div
                className={`${mod.bg} ${mod.border} ${mod.hover} rounded-2xl p-6 border transition-all duration-200 h-full flex flex-col`}
              >
                <div className={`w-12 h-12 ${mod.iconBg} ${mod.iconColor} rounded-xl flex items-center justify-center mb-4 flex-shrink-0`}>
                  {mod.icon}
                </div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">{mod.title}</h3>
                <p className="text-gray-600 text-sm flex-grow">{mod.desc}</p>
                <span className="mt-3 inline-block text-sm font-medium text-indigo-600">
                  Buka Modul →
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* Footer Note */}
        <div className="mt-12 text-center text-sm text-gray-500 pb-8">
          <p>Sistem ini hanya untuk simulasi. Tidak ada koneksi ke printer fisik.</p>
        </div>
      </div>
    </div>
  );
}