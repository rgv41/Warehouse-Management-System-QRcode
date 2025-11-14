// src/app/api/save-qr-labels/route.js
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { format } from 'date-fns';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const {
      materialCode,
      description,
      noBpb,
      documentNumber,
      qtyPerLabel,
      unit,
      userAdd,
      labelCount,
    } = await request.json();

    if (!materialCode || !noBpb || !labelCount || qtyPerLabel == null) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 });
    }

    const today = new Date();
    const dateStr = format(today, 'ddMMyyyy');

    // Ambil nomor urut terakhir hari ini untuk material ini
    const latest = await prisma.tBL_TS_QR_LABEL.findFirst({
      where: {
        QR_CODE: {
          startsWith: `${materialCode}_${dateStr}_`,
        },
      },
      orderBy: {
        QR_CODE: 'desc',
      },
    });

    let nextSeq = 1;
    if (latest) {
      const lastSeq = parseInt(latest.QR_CODE.split('_').pop(), 10);
      nextSeq = lastSeq + 1;
    }

    const qrList = [];
    for (let i = 0; i < labelCount; i++) {
      const seq = String(nextSeq + i).padStart(4, '0');
      const qrCode = `${materialCode}_${dateStr}_${seq}`;

      const created = await prisma.tBL_TS_QR_LABEL.create({
         data :{
          QR_CODE: qrCode,
          MATERIALCODE: materialCode,
          NO_BPB: noBpb,
          DOCUMENT_NUMBER: documentNumber || null,
          DESCRIPTION: description || null,
          QTY: parseFloat(qtyPerLabel),
          UNIT: unit || 'pcs',
          USER_ADD: userAdd || 'AdminGudang',
          CREATE_DATE: today,
          STATUS_USED: false,
        },
      });

      qrList.push(qrCode);
    }

    return NextResponse.json({ success: true, qrCodes: qrList }, { status: 201 });
  } catch (error) {
    console.error('Save QR Error:', error);
    return NextResponse.json({ error: 'Gagal menyimpan QR ke database' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}