import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const noBpb = searchParams.get('noBpb');
    const docNumber = searchParams.get('docNumber');

    if (!noBpb) {
      return NextResponse.json({ error: 'NO_BPB diperlukan' }, { status: 400 });
    }

    const whereHeader = docNumber
      ? { NO_BPB: noBpb, DOCUMENT_NUMBER: docNumber }
      : { NO_BPB: noBpb };

    const bpbHeader = await prisma.tBL_BPB.findFirst({
      where: {
        ...whereHeader,
        STATUS_CANCEL: false,
        STATUS_DELETE: false,
      },
      select: {
        NO_BPB: true,
        DOCUMENT_NUMBER: true,
        DOCUMENT_DATE: true,
        // tambahkan field lain jika perlu, TAPI JANGAN ID
      },
    });

    const whereLines = docNumber
      ? { NO_BPB: noBpb, DOCUMENT_NUMBER: docNumber }
      : { NO_BPB: noBpb };

    const bpbLines = await prisma.tBL_BPB_LINE.findMany({
      where: whereLines,
      select: {
        MATERIALCODE: true,
        DESCRIPTION: true,
        UNIT: true,
        QTY_BPB: true,
      },
    });

    return NextResponse.json({
      bpb: bpbHeader,
      materials: bpbLines,
    });
  } catch (error) {
    console.error('Error di bpb-detail:', error);
    return NextResponse.json({ error: 'Gagal ambil detail BPB' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}