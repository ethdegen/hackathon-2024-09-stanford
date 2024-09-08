// src/app/api/analyze/route.ts
import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';
import { generateMandARequestList } from '@/lib/generateMandARequestList';

export async function GET() {
  try {
    const files = ['priorPurchaseAgreement', 'priorRequestList', 'priorTermSheet', 'currentTermSheet'];
    const fileContents = await Promise.all(files.map(async (file) => {
      const filePath = path.join(process.cwd(), 'tmp', `${file}.txt`);
      return readFile(filePath, 'utf-8');
    }));

    const [priorPurchaseAgreement, priorRequestList, priorTermSheet, currentTermSheet] = fileContents;

    const requestList = await generateMandARequestList(
      priorPurchaseAgreement,
      priorRequestList,
      priorTermSheet,
      currentTermSheet
    );

    return NextResponse.json(requestList);
  } catch (error) {
    console.error('Error generating request list:', error);
    return NextResponse.json({ error: 'Failed to generate request list' }, { status: 500 });
  }
}