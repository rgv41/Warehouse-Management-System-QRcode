'use client';

import { useState } from 'react';
import QRScanner from '@/components/QRScanner';

export default function PuttingPage() {
  const [rackQR, setRackQR] = useState('');
  const [rackInfo, setRackInfo] = useState(null);
  const [scannedItems, setScannedItems] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const userAdd = 'RanggaJavian';

  const handleRackScan = (data) => {
    try {
      const parsed = JSON.parse(data);
      if (parsed.type === 'STORAGE_LOCATION' && parsed.code) {
        setRackQR(parsed.code);
        setRackInfo({
          code: parsed.code,
          name: parsed.name || '—',
          rack: parsed.rack || '—',
          row: parsed.row || '—',
          column: parsed.column || '—',
        });
      } else {
        throw new Error('Format tidak valid');
      }
    } catch (e) {
      alert('❌ QR yang discan bukan QR Rak!\nPastikan scan dari halaman "QR Code Rak Penyimpanan".');
      console.warn('Invalid rack QR:', data);
    }
  };

  const handleItemScan = async (qrCode) => {
    if (!rackQR) return;

    if (scannedItems.includes(qrCode)) {
      alert('✅ Barang ini sudah disimpan ke rak ini.');
      return;
    }

    setIsProcessing(true);
    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qrCode,
          action: 'PUTAWAY',
          locationCode: rackQR,
          userAdd,
        }),
      });

      if (res.ok) {
        setScannedItems((prev) => [...prev, qrCode]);
      } else {
        const err = await res.json();
        alert(`❌ Gagal: ${err.error || 'Barang tidak ditemukan'}`);
      }
    } catch (err) {
      console.error('Network error:', err);
      alert('🔌 Gagal menghubungi server. Periksa koneksi Anda.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    if (scannedItems.length > 0) {
      const confirmed = confirm('Anda akan mengganti rak. Data barang yang sudah discan akan hilang. Lanjutkan?');
      if (!confirmed) return;
    }
    setRackQR('');
    setRackInfo(null);
    setScannedItems([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 p-5 text-white text-center">
          <h1 className="text-2xl font-bold flex items-center justify-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
            Putting Barang
          </h1>
          <p className="text-blue-200 text-sm mt-1">
            Simpan barang ke rak penyimpanan yang sesuai
          </p>
        </div>

        <div className="p-5">
          {!rackQR ? (
            <>
              <div className="bg-blue-50 rounded-xl p-4 mb-5 border border-blue-100">
                <h3 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M12 12m-2 0a2 2 0 104 0 2 2 0 10-4 0" />
                    <path d="M3.05 12.05l6.9 6.9m7.05-7.05l-6.9-6.9" />
                  </svg>
                  Langkah 1: Pilih Lokasi Rak
                </h3>
                <p className="text-sm text-blue-700">
                  Scan QR Code dari rak penyimpanan. QR harus berasal dari halaman <strong>“QR Code Rak Penyimpanan”</strong>.
                </p>
              </div>

              {/* ✅ Scanner untuk Rak — dengan key unik */}
              <QRScanner
                key="rack-scanner"
                onScan={handleRackScan}
                onError={(err) => {
                  if (
                    !err.includes('NotFoundException') &&
                    !err.includes('No MultiFormat Readers') &&
                    !err.includes('Canvas size')
                  ) {
                    alert(`🚨 Error Scanner: ${err}`);
                  }
                }}
                label="Scan QR Rak"
              />
            </>
          ) : (
            <>
              {/* Info Rak */}
              <div className="mb-5 p-4 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-green-800">📍 Lokasi Rak Aktif</h3>
                    <p className="text-lg font-mono font-bold text-green-700">{rackInfo.code}</p>
                    <p className="text-sm text-green-600 mt-1">{rackInfo.name}</p>
                    <div className="text-xs text-green-700 mt-2">
                      Rak: {rackInfo.rack} | Baris: {rackInfo.row} | Kolom: {rackInfo.column}
                    </div>
                  </div>
                  <button
                    onClick={handleReset}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Ganti Rak
                  </button>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 mb-5">
                <h3 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2V10a2 2 0 012-2z" />
                  </svg>
                  Langkah 2: Scan Barang
                </h3>
                <p className="text-sm text-gray-600">
                  Arahkan kamera ke QR Code barang yang akan disimpan ke rak ini.
                </p>
              </div>

              {/* ✅ Scanner untuk Barang — dengan key unik */}
              <QRScanner
                key="item-scanner"
                onScan={handleItemScan}
                onError={(err) => {
                  if (
                    !err.includes('NotFoundException') &&
                    !err.includes('No MultiFormat Readers') &&
                    !err.includes('Canvas size')
                  ) {
                    alert(`🚨 Error Scanner: ${err}`);
                  }
                }}
                label="Scan Barang"
              />

              {scannedItems.length > 0 && (
                <div className="mt-6">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-semibold text-gray-800">Barang Disimpan ({scannedItems.length})</h3>
                  </div>
                  <ul className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {scannedItems.map((qr, i) => (
                      <li
                        key={i}
                        className="bg-white p-2.5 rounded-lg border border-gray-200 text-sm font-mono text-gray-700"
                      >
                        {qr}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}