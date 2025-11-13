'use client';

import { useState } from 'react';
import QRCode from 'react-qr-code';

export default function RequestProductionPage() {
  const [department, setDepartment] = useState('');
  const userRequest = 'OperatorProduksi';
  const [items, setItems] = useState([{ materialCode: '', description: '', qty: '', unit: 'pcs' }]);
  const [generatedQR, setGeneratedQR] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addItem = () => {
    setItems([...items, { materialCode: '', description: '', qty: '', unit: 'pcs' }]);
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const removeItem = (index) => {
    if (items.length <= 1) {
      alert('Minimal harus ada 1 barang.');
      return;
    }
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validItems = items.filter(
      (item) => item.materialCode.trim() && item.qty && !isNaN(Number(item.qty)) && Number(item.qty) > 0
    );

    if (!department.trim()) {
      alert('⚠️ Departemen wajib diisi.');
      return;
    }

    if (validItems.length === 0) {
      alert('⚠️ Isi minimal 1 barang dengan kode dan qty valid.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/request-production', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          department: department.trim(),
          userRequest,
          items: validItems.map((item) => ({
            materialCode: item.materialCode.trim(),
            description: item.description.trim(),
            qty: Number(item.qty),
            unit: item.unit.trim() || 'pcs',
          })),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setGeneratedQR(data.qrRequest);
      } else {
        alert(`❌ Gagal: ${data.error || 'Permintaan tidak dapat diproses'}`);
      }
    } catch (err) {
      console.error('Network error:', err);
      alert('🔌 Gagal menghubungi server. Periksa koneksi Anda.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setGeneratedQR(null);
    setItems([{ materialCode: '', description: '', qty: '', unit: 'pcs' }]);
    setDepartment('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-purple-600 p-5 text-white text-center">
          <h1 className="text-2xl font-bold flex items-center justify-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Permintaan Produksi
          </h1>
          <p className="text-purple-200 text-sm mt-1">
            Ajukan kebutuhan barang untuk produksi
          </p>
        </div>

        <div className="p-5">
          {generatedQR ? (
            <div className="text-center bg-purple-50 p-6 rounded-xl border border-purple-100">
              <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-purple-800 mb-3">✅ Permintaan Berhasil!</h2>
              <p className="text-purple-700 mb-4">Berikan QR berikut ke Admin Gudang untuk proses selanjutnya.</p>
              
              <div className="inline-block bg-white p-4 rounded-xl shadow-sm border">
                <QRCode value={generatedQR} size={180} />
              </div>
              <p className="mt-3 font-mono text-xs text-gray-600 break-all max-w-xs mx-auto">
                {generatedQR}
              </p>

              <button
                onClick={handleReset}
                className="mt-5 w-full max-w-xs mx-auto bg-gradient-to-r from-purple-500 to-purple-600 text-white py-2.5 rounded-xl font-medium hover:from-purple-600 hover:to-purple-700 transition"
              >
                Buat Permintaan Baru
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Departemen <span className="text-red-500">*</span>
                </label>
                <input
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="Contoh: Cutting, Sewing, Finishing"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                  required
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    Daftar Barang <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={addItem}
                    className="text-sm text-purple-600 font-medium hover:text-purple-800 flex items-center gap-1"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Tambah Barang
                  </button>
                </div>

                <div className="space-y-3">
                  {items.map((item, i) => (
                    <div key={i} className="grid grid-cols-12 gap-2">
                      <input
                        value={item.materialCode}
                        onChange={(e) => updateItem(i, 'materialCode', e.target.value)}
                        placeholder="Kode Material"
                        className="col-span-3 px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                        required
                      />
                      <input
                        value={item.description}
                        onChange={(e) => updateItem(i, 'description', e.target.value)}
                        placeholder="Deskripsi"
                        className="col-span-3 px-2 py-1.5 text-sm border border-gray-300 rounded"
                      />
                      <input
                        type="number"
                        min="1"
                        value={item.qty}
                        onChange={(e) => updateItem(i, 'qty', e.target.value)}
                        placeholder="Qty"
                        className="col-span-2 px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-purple-500"
                        required
                      />
                      <input
                        value={item.unit}
                        onChange={(e) => updateItem(i, 'unit', e.target.value)}
                        placeholder="Unit"
                        className="col-span-2 px-2 py-1.5 text-sm border border-gray-300 rounded"
                      />
                      <button
                        type="button"
                        onClick={() => removeItem(i)}
                        className="col-span-2 text-red-600 hover:text-red-800 text-sm font-medium flex items-center justify-center gap-1"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Hapus
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 rounded-xl font-medium text-white flex items-center justify-center gap-2 transition ${
                  isSubmitting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 shadow-md'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Memproses...
                  </>
                ) : (
                  '📤 Kirim Permintaan & Generate QR'
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}