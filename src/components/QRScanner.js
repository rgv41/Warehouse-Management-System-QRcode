'use client';

import { useEffect, useRef, useState } from 'react';

export default function QRScanner({ onScan, label = 'Scan QR Code' }) {
  const html5QrCodeRef = useRef(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const hasScannedRef = useRef(false);

  const startScanner = async () => {
    if (isScanning || isLoading) return;

    setIsLoading(true);
    hasScannedRef.current = false;

    try {
      const { Html5Qrcode } = await import('html5-qrcode');

      const config = {
        fps: 10,
        qrbox: (viewfinderWidth, viewfinderHeight) => {
          const minEdgeSize = Math.min(viewfinderWidth, viewfinderHeight);
          const qrboxSize = Math.floor(minEdgeSize * 0.8);
          return { width: qrboxSize, height: qrboxSize };
        },
        aspectRatio: 1.0,
        disableFlip: true,
        experimentalFeatures: {
          useBarCodeDetectorIfSupported: false,
        },
      };

      const html5QrCode = new Html5Qrcode('qr-reader');

      await html5QrCode.start(
        { facingMode: 'environment' },
        config,
        (decodedText) => {
          // QR berhasil dibaca
          if (hasScannedRef.current) return;
          hasScannedRef.current = true;
          onScan(decodedText);
          stopScannerInternal(html5QrCode);
        },
        // 🚫 Jangan munculkan error apa pun saat belum mendeteksi QR
        () => {}
      );

      html5QrCodeRef.current = html5QrCode;
      setIsScanning(true);
      setIsLoading(false);
    } catch (err) {
      console.error('Gagal memulai scanner:', err);
      setIsLoading(false);
      alert('Gagal mengakses kamera. Pastikan izin kamera diberikan & gunakan HTTPS.');
      if (html5QrCodeRef.current) {
        stopScannerInternal(html5QrCodeRef.current);
      }
    }
  };

  const stopScannerInternal = (instance) => {
    if (!instance) return;
    instance.stop().then(() => {
      setIsScanning(false);
      setIsLoading(false);
      html5QrCodeRef.current = null;
    }).catch(() => {
      setIsScanning(false);
      setIsLoading(false);
      html5QrCodeRef.current = null;
    });
  };

  const stopScanner = () => {
    if (html5QrCodeRef.current && isScanning) {
      stopScannerInternal(html5QrCodeRef.current);
    }
  };

  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current) {
        stopScannerInternal(html5QrCodeRef.current);
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <button
        type="button"
        onClick={isScanning ? stopScanner : startScanner}
        disabled={isLoading}
        className={`w-full max-w-xs px-4 py-3 rounded-xl text-white font-medium flex items-center justify-center gap-2 transition-all ${
          isLoading
            ? 'bg-gray-400 cursor-not-allowed'
            : isScanning
            ? 'bg-red-500 hover:bg-red-600 shadow-md'
            : 'bg-indigo-600 hover:bg-indigo-700 shadow-md'
        }`}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Memuat Kamera...
          </>
        ) : isScanning ? (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <rect x="4" y="4" width="16" height="16" rx="2" ry="2" strokeWidth="2" />
              <line x1="8" y1="8" x2="16" y2="16" strokeWidth="2" />
              <line x1="16" y1="8" x2="8" y2="16" strokeWidth="2" />
            </svg>
            Berhenti Scan
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M12 12m-2 0a2 2 0 104 0 2 2 0 10-4 0" />
              <path d="M3.05 12.05l6.9 6.9m7.05-7.05l-6.9-6.9" />
            </svg>
            {label}
          </>
        )}
      </button>

      <div
        id="qr-reader"
        className="w-full flex justify-center rounded-xl overflow-hidden bg-black"
        style={{ minHeight: 300, maxWidth: 320 }}
      />

      {isScanning && (
        <p className="text-sm text-gray-600 text-center max-w-xs">
          Arahkan kamera ke QR Code. Pastikan tidak terlalu dekat atau terlalu jauh.
        </p>
      )}
    </div>
  );
}
