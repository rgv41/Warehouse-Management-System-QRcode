// src/app/api/generate-qr/route.js
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { generateQRCode, getNextSequence } from '@/lib/utils';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const {
      materialCode,
      description,
      noBpb,
      documentNumber,
      qty,
      unit,
      userAdd,
      labelCount,
      qtyPerLabel,
    } = await request.json();

    if (!materialCode || !qty || !labelCount || !qtyPerLabel) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const qrList = [];
    const today = new Date();

    for (let i = 0; i < labelCount; i++) {
      const seq = await getNextSequence(prisma, materialCode, today);
      const qrCode = `${generateQRCode(materialCode, today)}_${seq}`;

      const created = await prisma.tBL_QR_LABEL.create({
        data: {
          QR_CODE: qrCode,
          MATERIALCODE: materialCode,
          NO_BPB: noBpb,
          DOCUMENT_NUMBER: documentNumber,
          DESCRIPTION: description,
          QTY: parseFloat(qtyPerLabel),
          UNIT: unit,
          USER_ADD: userAdd,
          CREATE_DATE: today,
        },
      });

      qrList.push(created.QR_CODE);
    }

    return NextResponse.json({ success: true, qrCodes: qrList }, { status: 201 });
  } catch (error) {
    console.error('Error generating QR:', error);
    return NextResponse.json({ error: 'Failed to generate QR codes' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}