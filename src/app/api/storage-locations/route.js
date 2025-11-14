// src/app/api/storage-locations/route.js
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const locations = await prisma.tBL_TS_STORAGE_LOCATION.findMany({
      where: { STATUS_ACTIVE: true },
      orderBy: { LOCATION_CODE: 'asc' },
    });
    return NextResponse.json({ locations });
  } catch (error) {
    console.error('Gagal ambil lokasi:', error);
    return NextResponse.json({ error: 'Gagal ambil daftar lokasi' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}