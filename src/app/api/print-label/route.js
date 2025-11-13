// src/app/api/print-label/route.js
import { NextResponse } from 'next/server';
import ThermalPrinter from 'node-thermal-printer';

export async function POST(request) {
  try {
    const { qrCodes, printerIP } = await request.json();

    if (!printerIP) {
      return NextResponse.json({ error: 'IP printer diperlukan' }, { status: 400 });
    }

    // Konfigurasi printer via jaringan (ESC/POS)
    const printer = new ThermalPrinter({
      type: 'epson', // atau 'star'
      interface: `tcp://${printerIP}:9100`, // port standar printer thermal
    });

    for (const qr of qrCodes) {
      printer.alignCenter();
      printer.println('WAREHOUSE LABEL');
      printer.printQR(qr, { cellSize: 8 });
      printer.println(qr);
      printer.feed(3);
      printer.cut();
    }

    await printer.execute(); // Kirim ke printer

    return NextResponse.json({ success: true, message: 'Label berhasil dicetak' });
  } catch (error) {
    console.error('Print error:', error);
    return NextResponse.json({ error: 'Gagal mencetak label: ' + error.message }, { status: 500 });
  }
}