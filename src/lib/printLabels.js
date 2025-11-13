// src/lib/printLabels.js
import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';

/**
 * Generate PDF berisi label QR Code
 * @param {string[]} qrList - Array string QR Code
 * @param {string} filename - Nama file PDF (default: 'warehouse-labels.pdf')
 */
export async function generateLabelPDF(qrList, filename = 'warehouse-labels.pdf') {
  if (!qrList || qrList.length === 0) {
    console.warn('Tidak ada QR untuk dicetak');
    return;
  }

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 10;
  const labelWidth = 70; // lebar label (sesuaikan dengan stiker)
  const labelHeight = 40; // tinggi label
  const cols = Math.floor((pageWidth - 2 * margin) / labelWidth);
  const rows = Math.floor((pageHeight - 2 * margin) / labelHeight);

  let currentX = margin;
  let currentY = margin;

  for (const qr of qrList) {
    try {
      // Generate QR sebagai Data URL (gambar PNG)
      const qrDataUrl = await QRCode.toDataURL(qr, {
        width: 32,
        margin: 0,
        errorCorrectionLevel: 'M',
      });

      // Tambahkan QR ke PDF
      doc.addImage(qrDataUrl, 'PNG', currentX + 2, currentY + 2, 32, 32);

      // Tambahkan teks QR di bawah (opsional)
      doc.setFontSize(6);
      doc.text(qr, currentX + 38, currentY + 10, {
        maxWidth: labelWidth - 40,
        lineHeightFactor: 1.2,
      });

      // Pindah ke posisi berikutnya
      currentX += labelWidth;
      if (currentX + labelWidth > pageWidth - margin) {
        currentX = margin;
        currentY += labelHeight;
        if (currentY + labelHeight > pageHeight - margin) {
          doc.addPage();
          currentY = margin;
        }
      }
    } catch (err) {
      console.error('Gagal generate QR:', qr, err);
    }
  }

  doc.save(filename);
}