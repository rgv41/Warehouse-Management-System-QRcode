'use client';

import { useState } from 'react';
import QRScanner from '@/components/QRScanner';

export default function GoodsIssuePage() {
  const [scannedCart, setScannedCart] = useState(null);
  const [issueResult, setIssueResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const userAdd = 'AdminGudang';

  const handleCartScan = async (cartQR) => {
    if (!cartQR.startsWith('CART_')) {
      alert('❌ QR yang discan bukan QR Keranjang!\nPastikan ini berasal dari proses Picking.');
      return;
    }

    setIsProcessing(true);
    try {
      const res = await fetch('/api/goods-issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartQR, userAdd }),
      });

      const data = await res.json();
      if (res.ok) {
        setScannedCart(cartQR);
        setIssueResult(data);
      } else {
        alert(`❌ Gagal: ${data.error || 'Tidak dapat memproses Goods Issue'}`);
      }
    } catch (err) {
      console.error('Network error:', err);
      alert('🔌 Gagal menghubungi server. Periksa koneksi Anda.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setIssueResult(null);
    setScannedCart(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-green-600 p-5 text-white text-center">
          <h1 className="text-2xl font-bold flex items-center justify-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
            Goods Issue
          </h1>
          <p className="text-green-200 text-sm mt-1">
            Keluarkan barang dari gudang berdasarkan keranjang picking
          </p>
        </div>

        <div className="p-5">
          {!issueResult ? (
            <>
              <div className="bg-green-50 rounded-xl p-4 mb-5 border border-green-100">
                <h3 className="font-medium text-green-800 mb-2 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M12 12m-2 0a2 2 0 104 0 2 2 0 10-4 0" />
                    <path d="M3.05 12.05l6.9 6.9m7.05-7.05l-6.9-6.9" />
                  </svg>
                  Scan QR Keranjang
                </h3>
                <p className="text-sm text-green-700">
                  Scan QR Code yang dihasilkan dari halaman <strong>Picking</strong>.
                </p>
              </div>

              <QRScanner
                onScan={handleCartScan}
                onError={(err) => {
                  if (
                    !err.includes('NotFoundException') &&
                    !err.includes('No MultiFormat Readers') &&
                    !err.includes('Canvas size')
                  ) {
                    alert(`🚨 Error Scanner: ${err}`);
                  }
                }}
                label="Scan QR Keranjang"
              />
            </>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-xl p-5">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>

              <h2 className="text-xl font-bold text-green-800 text-center mb-3">✅ Goods Issue Berhasil!</h2>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Nomor Issue:</span> {issueResult.issueNo}</p>
                <p><span className="font-medium">QR Keranjang:</span> <span className="font-mono">{scannedCart}</span></p>
              </div>

              <h3 className="font-semibold text-gray-800 mt-4 mb-2">Barang yang Dikeluarkan:</h3>
              <ul className="space-y-1 max-h-40 overflow-y-auto pr-1">
                {issueResult.items.map((item, i) => (
                  <li key={i} className="bg-white p-2 rounded border text-sm">
                    <span className="font-mono">{item.qr}</span> – {item.qty} {item.unit || 'pcs'}
                  </li>
                ))}
              </ul>

              <button
                onClick={handleReset}
                className="mt-5 w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-2.5 rounded-xl font-medium hover:from-green-600 hover:to-emerald-700 transition"
              >
                Proses Keranjang Lain
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}