// src/lib/utils.js
import { format } from 'date-fns';

export function generateQRCode(materialCode, date = new Date()) {
  const formattedDate = format(date, 'ddMMyyyy');
  return `${materialCode}_${formattedDate}`;
}

// Fungsi untuk generate nomor urut harian per material (simulasi sederhana)
// Di production, ini harus dicek dari DB: count QR hari ini berdasarkan materialCode & tanggal
export async function getNextSequence(prisma, materialCode, date = new Date()) {
  const formattedDate = format(date, 'ddMMyyyy');
  const prefix = `${materialCode}_${formattedDate}_`;
  
  const latest = await prisma.tBL_QR_LABEL.findFirst({
    where: {
      QR_CODE: {
        startsWith: prefix,
      },
    },
    orderBy: {
      QR_CODE: 'desc',
    },
  });

  if (!latest) return '0001';

  const lastSeq = latest.QR_CODE.split('_').pop();
  const next = (parseInt(lastSeq, 10) + 1).toString().padStart(4, '0');
  return next;
}