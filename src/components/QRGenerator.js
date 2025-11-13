'use client';

import { useState, useEffect, useRef } from 'react';
import QRCode from 'react-qr-code';

export default function QRGenerator({ onGenerate }) {
  const [bpbs, setBpbs] = useState([]);
  const [materialsInBpb, setMaterialsInBpb] = useState([]);
  const [formData, setFormData] = useState({
    materialCode: '',
    description: '',
    noBpb: '',
    documentNumber: '',
    qty: '',
    labelCount: '1',
    qtyPerLabel: '1',
    unit: 'pcs',
    userAdd: 'AdminGudang',
  });
  const [generatedQRs, setGeneratedQRs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingBpbDetail, setLoadingBpbDetail] = useState(false);

  const bpbInputRef = useRef(null);

  // Ambil daftar BPB tahun ini
  useEffect(() => {
    const fetchBpbs = async () => {
      try {
        const res = await fetch('/api/bpb-this-year');
        const data = await res.json();
        setBpbs(data.bpbs || []);
      } catch (err) {
        console.error('Gagal ambil daftar BPB:', err);
      }
    };
    fetchBpbs();
  }, []);

  // Tutup dropdown saat klik di luar
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (bpbInputRef.current && !bpbInputRef.current.contains(e.target)) {
        setShowBpbList(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [showBpbList, setShowBpbList] = useState(false);
  const [filteredBpbs, setFilteredBpbs] = useState([]);

  const handleBpbChange = (value) => {
    setFormData((prev) => ({ ...prev, noBpb: value, documentNumber: '' }));
    if (value.length >= 2) {
      const filtered = bpbs.filter((b) =>
        b.NO_BPB.includes(value) || (b.DOCUMENT_NUMBER && b.DOCUMENT_NUMBER.includes(value))
      ).slice(0, 15);
      setFilteredBpbs(filtered);
      setShowBpbList(true);
    } else {
      setShowBpbList(false);
    }
  };

  const handleBpbSelect = async (bpb) => {
    const { NO_BPB, DOCUMENT_NUMBER } = bpb;

    setFormData((prev) => ({
      ...prev,
      noBpb: NO_BPB,
      documentNumber: DOCUMENT_NUMBER || '',
    }));
    setShowBpbList(false);
    setLoadingBpbDetail(true);

    try {
      const res = await fetch(
        `/api/bpb-detail?noBpb=${encodeURIComponent(NO_BPB)}&docNumber=${encodeURIComponent(DOCUMENT_NUMBER || '')}`
      );
      const data = await res.json();
      if (res.ok) {
        setMaterialsInBpb(data.materials || []);
      } else {
        alert('Gagal memuat daftar material: ' + (data.error || ''));
        setMaterialsInBpb([]);
      }
    } catch (err) {
      console.error('Error load BPB detail:', err);
      setMaterialsInBpb([]);
    } finally {
      setLoadingBpbDetail(false);
    }
  };

  const handleMaterialChange = (e) => {
    const matCode = e.target.value;
    const mat = materialsInBpb.find((m) => m.MATERIALCODE === matCode);
    setFormData((prev) => ({
      ...prev,
      materialCode: matCode,
      description: mat?.DESCRIPTION || '',
      unit: mat?.UNIT || 'pcs',
      qty: mat?.QTY_BPB?.toString() || '',
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.materialCode || !formData.noBpb) {
      alert('Pilih BPB dan Material terlebih dahulu');
      return;
    }
    setLoading(true);

    try {
      const res = await fetch('/api/save-qr-labels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          labelCount: parseInt(formData.labelCount, 10),
          qtyPerLabel: parseFloat(formData.qtyPerLabel),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setGeneratedQRs(data.qrCodes);
        if (onGenerate) onGenerate(data.qrCodes);
      } else {
        alert('Error: ' + (data.error || 'Gagal generate QR'));
      }
    } catch (err) {
      console.error(err);
      alert('Gagal menghubungi server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-3 mb-6 p-4 border rounded">
        {/* BPB Selection */}
        <div className="relative" ref={bpbInputRef}>
          <input
            type="text"
            value={formData.noBpb}
            onChange={(e) => handleBpbChange(e.target.value)}
            placeholder="Nomor BPB * (ketik minimal 2 karakter)"
            required
            className="border p-2 w-full"
          />
          {showBpbList && (
            <ul className="absolute z-10 w-full bg-white border border-t-0 max-h-40 overflow-y-auto shadow-lg text-sm">
              {filteredBpbs.map((bpb, i) => (
                <li
                  key={i}
                  onClick={() => handleBpbSelect(bpb)}
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                >
                  <strong>{bpb.NO_BPB}</strong> — {bpb.DOCUMENT_NUMBER || '—'}{' '}
                  <span className="text-gray-500">
                    ({new Date(bpb.DOCUMENT_DATE).toLocaleDateString('id-ID')})
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Material Selection from BPB */}
        <div>
          <label className="block text-sm mb-1">Pilih Material dari BPB:</label>
          {loadingBpbDetail ? (
            <p className="text-sm text-gray-500">Memuat daftar material...</p>
          ) : materialsInBpb.length > 0 ? (
            <select
              value={formData.materialCode}
              onChange={handleMaterialChange}
              required
              className="border p-2 w-full"
            >
              <option value="">-- Pilih Material --</option>
              {materialsInBpb.map((mat, i) => (
                <option key={i} value={mat.MATERIALCODE}>
                  {mat.MATERIALCODE} — {mat.DESCRIPTION} ({mat.QTY_BPB} {mat.UNIT})
                </option>
              ))}
            </select>
          ) : (
            <p className="text-sm text-gray-500 italic">
              {formData.noBpb
                ? 'Tidak ada material ditemukan untuk BPB ini'
                : 'Pilih BPB terlebih dahulu untuk melihat daftar material'}
            </p>
          )}
        </div>

        {/* Deskripsi & Unit */}
        <input
          name="description"
          placeholder="Deskripsi"
          value={formData.description}
          onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
          className="border p-2 w-full"
        />
        <input
          name="unit"
          placeholder="Unit"
          value={formData.unit}
          onChange={(e) => setFormData((prev) => ({ ...prev, unit: e.target.value }))}
          className="border p-2 w-full"
        />

        {/* Qty per Label */}
        <input
          name="qtyPerLabel"
          type="number"
          step="0.01"
          placeholder="Qty per Label *"
          value={formData.qtyPerLabel}
          onChange={(e) => setFormData((prev) => ({ ...prev, qtyPerLabel: e.target.value }))}
          required
          className="border p-2 w-full"
        />

        {/* Jumlah Label */}
        <input
          name="labelCount"
          type="number"
          min="1"
          placeholder="Jumlah Label *"
          value={formData.labelCount}
          onChange={(e) => setFormData((prev) => ({ ...prev, labelCount: e.target.value }))}
          required
          className="border p-2 w-full"
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded w-full disabled:opacity-50"
        >
          {loading ? 'Menyimpan...' : 'Generate & Simpan QR Labels'}
        </button>
      </form>

      {/* Preview QR */}
      {generatedQRs.length > 0 && (
        <div className="mt-4">
          <h3 className="font-medium mb-2">Preview QR:</h3>
          <div className="grid grid-cols-2 gap-4">
            {generatedQRs.map((qr, i) => (
              <div key={i} className="text-center">
                <QRCode value={qr} size={100} />
                <p className="text-xs mt-1 break-words">{qr}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}