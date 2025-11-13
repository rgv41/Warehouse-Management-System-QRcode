// src/app/layout.js
import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata = {
  title: 'Sistem Gudang QR Code',
  description: 'Simulasi sistem manajemen gudang berbasis QR Code',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-white text-gray-900 font-sans">
        <Navbar />
        <main className="min-h-screen p-4 md:p-6">{children}</main>
      </body>
    </html>
  );
}