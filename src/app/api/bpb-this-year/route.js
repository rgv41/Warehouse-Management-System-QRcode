// src/app/api/bpb-this-month/route.js
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1); // 1 Januari
    const endOfYear = new Date(now.getFullYear() + 1, 0, 1); // 1 Januari tahun depan

    const bpbs = await prisma.tBL_BPB.findMany({
      where: {
        DOCUMENT_DATE: {
          gte: startOfYear,
          lt: endOfYear,
        },
        STATUS_CANCEL: false,
        STATUS_DELETE: false,
      },
      select: {
        NO_BPB: true,
        DOCUMENT_NUMBER: true,
        DOCUMENT_DATE: true,
      },
      orderBy: { DOCUMENT_DATE: 'desc' },
    });

    return NextResponse.json({ bpbs });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal ambil data BPB' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}