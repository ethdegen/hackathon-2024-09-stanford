// src/app/api/analyze/route.ts
import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';
import { generateMandARequestList } from '@/lib/grok/generateMandARequestList';

const expectedFileTypes = {
  priorPurchaseAgreement: ['.docx', '.txt'],
  priorRequestList: ['.xlsx', '.xls'],
  priorTermSheet: ['.docx', '.txt'],
  currentTermSheet: ['.docx', '.txt']
};

export async function GET() {
  try {
    const uploadDir = path.join(process.cwd(), 'tmp');
    const fileNamesPath = path.join(uploadDir, 'fileNames.json');
    const fileNamesContent = await readFile(fileNamesPath, 'utf8');
    const fileNames = JSON.parse(fileNamesContent);

    const getFilePath = (key: string) => {
      const fileName = fileNames[key];
      if (!fileName) {
        throw new Error(`Missing file: ${key}`);
      }
      const fileExtension = path.extname(fileName).toLowerCase();
      if (!expectedFileTypes[key].includes(fileExtension)) {
        throw new Error(`Invalid file type for ${key}. Expected ${expectedFileTypes[key].join(' or ')}.`);
      }
      return path.join(uploadDir, fileName);
    };

    const priorPurchaseAgreementPath = getFilePath('priorPurchaseAgreement');
    const priorRequestListPath = getFilePath('priorRequestList');
    const priorTermSheetPath = getFilePath('priorTermSheet');
    const currentTermSheetPath = getFilePath('currentTermSheet');

    const requestList = await generateMandARequestList(
      priorPurchaseAgreementPath,
      priorRequestListPath,
      priorTermSheetPath,
      currentTermSheetPath
    );

    return NextResponse.json(requestList);
  } catch (error) {
    console.error('Error generating request list:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate request list' }, { status: 500 });
  }
}