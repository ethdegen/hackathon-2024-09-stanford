// src/app/api/analyze/route.ts
import { NextResponse } from 'next/server';
import { readdir } from 'fs/promises';
import path from 'path';
import { generateMandARequestList } from '@/lib/grok/generateMandARequestList';

export async function GET() {
  try {
    const uploadDir = path.join(process.cwd(), 'tmp');
    const files = await readdir(uploadDir);

    const getFilePath = (prefix: string) => {
      const file = files.find(f => f.startsWith(prefix) && (f.endsWith('.txt') || f.endsWith('.docx')));
      return file ? path.join(uploadDir, file) : null;
    };

    const priorPurchaseAgreementPath = getFilePath('priorPurchaseAgreement');
    const priorRequestListPath = path.join(uploadDir, 'priorRequestList.xlsx');
    const priorTermSheetPath = getFilePath('priorTermSheet');
    const currentTermSheetPath = getFilePath('currentTermSheet');

    if (!priorPurchaseAgreementPath || !priorTermSheetPath || !currentTermSheetPath) {
      throw new Error('One or more required files are missing');
    }

    const requestList = await generateMandARequestList(
      priorPurchaseAgreementPath,
      priorRequestListPath,
      priorTermSheetPath,
      currentTermSheetPath
    );

    return NextResponse.json(requestList);
  } catch (error) {
    console.error('Error generating request list:', error);
    return NextResponse.json({ error: 'Failed to generate request list' }, { status: 500 });
  }
}