// src/app/api/qr-storage-location/route.js
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const locationCode = searchParams.get('locationCode');

  if (!locationCode) {
    return NextResponse.json(
      { error: 'locationCode diperlukan' },
      { status: 400 }
    );
  }

  try {
    const location = await prisma.tBL_STORAGE_LOCATION.findUnique({
      where: { LOCATION_CODE: locationCode },
    });

    if (!location) {
      return NextResponse.json(
        { error: 'Lokasi tidak ditemukan' },
        { status: 404 }
      );
    }

    // Format data QR: bisa disesuaikan (misal JSON, teks, URL)
    const qrData = JSON.stringify({
      type: 'STORAGE_LOCATION',
      code: location.LOCATION_CODE,
      name: location.LOCATION_NAME,
      rack: location.RACK,
      row: location.ROW_NO,
      column: location.COLUMN_NO,
    });

    return NextResponse.json({ qrData });
  } catch (error) {
    console.error('Error generate QR storage location:', error);
    return NextResponse.json(
      { error: 'Gagal generate QR untuk lokasi penyimpanan' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}