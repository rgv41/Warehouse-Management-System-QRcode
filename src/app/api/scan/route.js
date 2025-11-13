// src/app/api/scan/route.js
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const { qrCode, action, locationCode, instructionNumber, userAdd } = await request.json();

    const qr = await prisma.tBL_QR_LABEL.findUnique({
      where: { QR_CODE: qrCode },
    });

    if (!qr) {
      return NextResponse.json({ error: 'QR Code tidak ditemukan' }, { status: 404 });
    }

    switch (action) {
      case 'PUTAWAY':
        if (!locationCode) {
          return NextResponse.json({ error: 'Lokasi rak diperlukan' }, { status: 400 });
        }
        if (typeof locationCode !== 'string' || locationCode.length > 50) {
          return NextResponse.json({ error: 'Kode lokasi tidak valid atau terlalu panjang' }, { status: 400 });
        }
        await prisma.tBL_PUTAWAY.create({
          data: {
            QR_CODE: qrCode,
            LOCATION_CODE: locationCode,
            USER_ADD: userAdd,
          },
        });
        return NextResponse.json({ success: true, message: 'Barang disimpan ke rak' });

      case 'PICKING':
        if (!instructionNumber) return NextResponse.json({ error: 'Instruction Number diperlukan' }, { status: 400 });
        await prisma.tBL_PICKING.create({
          data: {
            INSTRUCTION_NUMBER: instructionNumber,
            QR_CODE: qrCode,
            MATERIALCODE: qr.MATERIALCODE,
            QTY: qr.QTY,
            UNIT: qr.UNIT,
            USER_ADD: userAdd,
          },
        });
        return NextResponse.json({ success: true, message: 'Barang dipilih untuk produksi' });

      case 'VERIFY_QR':
        return NextResponse.json({ success: true, data: qr });

      default:
        return NextResponse.json({ error: 'Aksi tidak valid' }, { status: 400 });
    }
  } catch (error) {
    console.error('Scan error:', error);
    return NextResponse.json({ error: 'Gagal memproses scan' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}