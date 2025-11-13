// src/app/api/request-production/route.js
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const { department, items, userRequest } = await request.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Minimal 1 barang harus diminta' }, { status: 400 });
    }

    const requestNo = `REQ-${Date.now().toString().slice(-8)}`;
    const instructionNumber = `INSTR-${Date.now().toString().slice(-8)}`;

    // Buat header
    const header = await prisma.tBL_REQUEST_PRODUKSI.create({
       data : {
        REQUEST_NO: requestNo,
        REQUEST_DATE: new Date(),
        DEPARTMENT: department,
        INSTRUCTION_NUMBER: instructionNumber,
        USER_REQUEST: userRequest,
        STATUS: 'Pending',
      },
    });

    // Buat detail
    await prisma.tBL_REQUEST_DETAIL.createMany({
      data: items.map(item => ({
        REQUEST_NO: requestNo,
        MATERIALCODE: item.materialCode,
        DESCRIPTION: item.description,
        QTY_REQUEST: parseFloat(item.qty),
        UNIT: item.unit,
      })),
    });

    // Generate QR Permintaan: REQ_{REQUEST_NO}
    const qrRequest = `REQ_${requestNo}`;

    return NextResponse.json({
      success: true,
      requestNo,
      instructionNumber,
      qrRequest,
    }, { status: 201 });

  } catch (error) {
    console.error('Request Production Error:', error);
    return NextResponse.json({ error: 'Gagal membuat permintaan' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}