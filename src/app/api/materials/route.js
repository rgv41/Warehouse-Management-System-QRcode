// src/app/api/materials/route.js
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const materials = await prisma.tBL_MATERIAL.findMany({
      where: { STATUS_HAPUS: false },
      select: {
        MATERIALCODE: true,
        DESCRIPTION: true,
        BASE_UNIT: true,
      },
      orderBy: { MATERIALCODE: 'asc' },
    });
    return NextResponse.json({ materials });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal ambil data material' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}