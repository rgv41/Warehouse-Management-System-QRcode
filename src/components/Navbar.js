'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { name: 'Beranda', href: '/' },
  { name: 'Goods Received', href: '/goods-received' },
  { name: 'Putting', href: '/putting' },
  { name: 'Picking', href: '/picking' },
  { name: 'Goods Issue', href: '/goods-issue' },
  { name: 'Permintaan Produksi', href: '/request' },
  { name: 'QR Rak Penyimpanan', href: '/storage-qr' },
  { name: 'Dashboard', href: '/dashboard' },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="bg-slate-800 text-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <span>📦</span>
            <span className="hidden sm:block">Sistem Gudang QR</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3.5 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  pathname === item.href
                    ? 'bg-slate-700 text-white shadow-sm'
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Mobile: Bisa tambahkan hamburger jika perlu */}
          {/* Untuk saat ini, tampilkan semua di mobile dengan scroll horizontal */}
          <div className="md:hidden flex overflow-x-auto pb-1 space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`whitespace-nowrap px-2.5 py-1 text-xs font-medium rounded ${
                  pathname === item.href
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}