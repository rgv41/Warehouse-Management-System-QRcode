'use client';

import { useState } from 'react';
import QRScanner from '@/components/QRScanner';

export default function PickingPage() {
  const [instructionNumber, setInstructionNumber] = useState('');
  const [scannedItems, setScannedItems] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const userAdd = 'PetugasGudang';

  const handleScan = async (qrCode) => {
    if (!instructionNumber.trim()) {
      alert('⚠️ Masukkan Instruction Number terlebih dahulu!');
      return;
    }

    if (scannedItems.some(item => item.qr === qrCode)) {
      alert('✅ Barang ini sudah dipilih sebelumnya.');
      return;
    }

    setIsProcessing(true);
    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qrCode,
          action: 'PICKING',
          instructionNumber: instructionNumber.trim(),
          userAdd,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setScannedItems(prev => [...prev, { qr: qrCode, qty: data.qty || 1 }]);
      } else {
        alert(`❌ Gagal: ${data.error || 'Barang tidak ditemukan'}`);
      }
    } catch (err) {
      console.error('Network error:', err);
      alert('🔌 Gagal menghubungi server. Periksa koneksi Anda.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveItem = (qrToRemove) => {
    setScannedItems(prev => prev.filter(item => item.qr !== qrToRemove));
  };

  const handleSubmitCart = async () => {
    if (scannedItems.length === 0) {
      alert('📭 Tidak ada barang yang dipilih!');
      return;
    }

    const confirmed = confirm(
      `Anda akan menyelesaikan picking untuk ${scannedItems.length} barang.\nLanjutkan?`
    );
    if (!confirmed) return;

    const cartQR = `CART_${instructionNumber.trim()}_${Date.now()}`;
    alert(
      `✅ Picking selesai!\n\nQR Keranjang: ${cartQR}\n\nBerikan ke Admin Gudang untuk Goods Issue.`
    );

    // Reset
    setScannedItems([]);
    setInstructionNumber('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-indigo-600 p-5 text-white text-center">
          <h1 className="text-2xl font-bold flex items-center justify-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Picking Barang
          </h1>
          <p className="text-indigo-200 text-sm mt-1">
            Scan barang sesuai instruksi produksi
          </p>
        </div>

        {/* Instruction Number */}
        <div className="p-5 border-b">
          <label htmlFor="instruction" className="block text-sm font-medium text-gray-700 mb-2">
            Instruction Number
          </label>
          <input
            id="instruction"
            type="text"
            value={instructionNumber}
            onChange={(e) => setInstructionNumber(e.target.value)}
            placeholder="Contoh: IN/2025/10/001"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            disabled={scannedItems.length > 0}
          />
          {scannedItems.length > 0 && (
            <p className="text-xs text-gray-500 mt-2">
              Tidak bisa mengubah Instruction Number setelah memilih barang.
            </p>
          )}
        </div>

        {/* QR Scanner */}
        <div className="p-5">
          <div className="bg-gray-50 rounded-xl p-4 mb-5">
            <h3 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2V10a2 2 0 012-2z" />
              </svg>
              Scan QR Barang
            </h3>
            <p className="text-sm text-gray-600">
              Arahkan kamera ke QR Code barang. Pastikan pencahayaan cukup dan QR terlihat jelas.
            </p>
          </div>

          <QRScanner
            onScan={handleScan}
            onError={(err) => {
              // Hanya tampilkan error kritis, bukan "tidak ada QR"
              if (
                !err.includes('NotFoundException') &&
                !err.includes('No MultiFormat Readers') &&
                !err.includes('No QR code detected') &&
                !err.includes('Canvas size')
              ) {
                alert(`🚨 Error Scanner: ${err}`);
              }
            }}
            label="Mulai Scan Barang"
          />
        </div>

        {/* Scanned Items */}
        {scannedItems.length > 0 && (
          <div className="p-5 border-t bg-gray-50">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-gray-800">Barang Dipilih ({scannedItems.length})</h3>
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                Instruction: {instructionNumber}
              </span>
            </div>

            <ul className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {scannedItems.map((item, i) => (
                <li
                  key={i}
                  className="flex justify-between items-center bg-white p-3 rounded-lg border border-gray-200 text-sm font-mono"
                >
                  <span className="text-gray-700 truncate max-w-[200px]">{item.qr}</span>
                  <button
                    onClick={() => handleRemoveItem(item.qr)}
                    className="text-red-500 hover:text-red-700 ml-2 flex-shrink-0"
                    title="Hapus dari daftar"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>

            <button
              onClick={handleSubmitCart}
              disabled={isProcessing}
              className="mt-4 w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 hover:from-green-600 hover:to-emerald-700 transition shadow-md disabled:opacity-70"
            >
              {isProcessing ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Memproses...
                </>
              ) : (
                '✅ Selesai & Generate QR Keranjang'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}