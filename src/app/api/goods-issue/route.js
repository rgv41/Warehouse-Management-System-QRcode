// src/app/api/goods-issue/route.js
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const { cartQR, userAdd } = await request.json();

    // Format QR Keranjang: CART_{INSTRUCTION_NUMBER}_{TIMESTAMP}
    if (!cartQR.startsWith('CART_')) {
      return NextResponse.json({ error: 'QR bukan keranjang valid' }, { status: 400 });
    }

    const instructionNumber = cartQR.split('_')[1];
    if (!instructionNumber) {
      return NextResponse.json({ error: 'Instruction Number tidak ditemukan' }, { status: 400 });
    }

    // Cari semua picking berdasarkan instruction number
    const pickings = await prisma.tBL_TS_PICKING.findMany({
      where: { INSTRUCTION_NUMBER: instructionNumber },
      include: { TBL_TS_QR_LABEL: true },
    });

    if (pickings.length === 0) {
      return NextResponse.json({ error: 'Tidak ada barang dalam keranjang ini' }, { status: 404 });
    }

    // Generate nomor issue unik
    const issueNo = `GI-${new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 12)}`;

    // Buat Goods Issue Header
    const goodsIssue = await prisma.tBL_TS_GOODS_ISSUE.create({
       data: {
        ISSUE_NO: issueNo,
        ISSUE_DATE: new Date(),
        INSTRUCTION_NUMBER: instructionNumber,
        USER_ADD: userAdd,
        DESTINATION: 'Produksi',
        REMARK: 'Goods Issue via QR Keranjang',
      },
    });

    // Opsional: update status picking atau QR label
    await prisma.tBL_TS_PICKING.updateMany({
      where: { INSTRUCTION_NUMBER: instructionNumber },
      data: { STATUS_CART: true },
    });

    return NextResponse.json({
      success: true,
      issueNo,
      items: pickings.map(p => ({
        material: p.MATERIALCODE,
        qty: p.QTY,
        qr: p.QR_CODE,
      })),
    }, { status: 201 });

  } catch (error) {
    console.error('Goods Issue Error:', error);
    return NextResponse.json({ error: 'Gagal proses Goods Issue' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}