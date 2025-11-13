'use client';

import { useState, useEffect } from 'react';
import QRCode from 'react-qr-code';
import { generateLabelPDF } from '@/lib/printLabels';

export default function StorageQRPage() {
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const locRes = await fetch('/api/storage-locations');
        const data = await locRes.json();
        setLocations(data.locations || []);
      } catch (err) {
        console.error('Gagal ambil daftar lokasi:', err);
      }
    };
    fetchLocations();
  }, []);

  const handleGenerate = async (locationCode) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/qr-storage-location?locationCode=${encodeURIComponent(locationCode)}`);
      const data = await res.json();
      if (res.ok) {
        setQrData(data.qrData);
        setSelectedLocation(locationCode);
      } else {
        alert(`❌ Gagal: ${data.error || 'Tidak dapat generate QR'}`);
        setQrData(null);
      }
    } catch (err) {
      console.error(err);
      alert('🔌 Gagal menghubungi server.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!qrData) return;
    generateLabelPDF([qrData], `qr-rak-${selectedLocation}.pdf`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-amber-600 p-5 text-white text-center">
          <h1 className="text-2xl font-bold flex items-center justify-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            QR Code Rak Penyimpanan
          </h1>
          <p className="text-amber-200 text-sm mt-1">
            Pilih lokasi untuk generate & cetak QR rak
          </p>
        </div>

        <div className="p-5">
          <h2 className="text-lg font-medium text-gray-800 mb-3">Pilih Lokasi Penyimpanan</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {locations.map((loc) => (
              <button
                key={loc.ID}
                onClick={() => handleGenerate(loc.LOCATION_CODE)}
                disabled={loading}
                className="border border-gray-200 p-3 rounded-xl text-left hover:bg-amber-50 hover:border-amber-200 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <strong className="text-amber-700">{loc.LOCATION_CODE}</strong>
                <div className="text-sm text-gray-600 mt-1">
                  {loc.LOCATION_NAME || '—'}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Rak: {loc.RACK || '—'} | Baris: {loc.ROW_NO || '—'} | Kolom: {loc.COLUMN_NO || '—'}
                </div>
              </button>
            ))}
          </div>

          {loading && (
            <div className="mt-6 text-center text-gray-600">
              <svg className="animate-spin h-5 w-5 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="mt-2">Memuat QR...</p>
            </div>
          )}

          {qrData && (
            <div className="mt-8 p-5 bg-amber-50 border border-amber-100 rounded-xl max-w-md mx-auto">
              <h3 className="font-semibold text-amber-800 mb-3">QR Code untuk: <span className="font-mono">{selectedLocation}</span></h3>
              <div className="bg-white p-4 rounded-lg inline-block shadow-sm">
                <QRCode value={qrData} size={180} />
              </div>
              <p className="text-xs text-gray-600 mt-2 break-all font-mono">
                {qrData}
              </p>
              <button
                onClick={handleDownloadPDF}
                className="mt-4 w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white py-2.5 rounded-xl font-medium hover:from-amber-600 hover:to-amber-700 transition flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download PDF
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}