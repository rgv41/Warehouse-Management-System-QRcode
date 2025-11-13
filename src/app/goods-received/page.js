'use client';

import { useState } from 'react';
import QRGenerator from '@/components/QRGenerator';
import { generateLabelPDF } from '@/lib/printLabels';

export default function GoodsReceivedPage() {
  const [generatedQRs, setGeneratedQRs] = useState([]);

  const handleReset = () => {
    if (generatedQRs.length > 0) {
      const confirmed = confirm('Semua QR yang dihasilkan akan dihapus. Lanjutkan?');
      if (!confirmed) return;
    }
    setGeneratedQRs([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gray-700 p-5 text-white text-center">
          <h1 className="text-2xl font-bold flex items-center justify-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            Goods Received
          </h1>
          <p className="text-gray-300 text-sm mt-1">
            Terima barang masuk & buat label QR
          </p>
        </div>

        <div className="p-5">
          <QRGenerator onGenerate={setGeneratedQRs} />

          {generatedQRs.length > 0 && (
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => generateLabelPDF(generatedQRs)}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 hover:from-green-600 hover:to-emerald-700 transition shadow-md"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Label PDF
              </button>
              <button
                onClick={handleReset}
                className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 text-white py-2.5 rounded-xl font-medium hover:from-gray-600 hover:to-gray-700 transition"
              >
                Reset Semua
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}