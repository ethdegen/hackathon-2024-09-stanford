// src/app/api/upload/route.ts
import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';

const allowedFileTypes = {
  priorPurchaseAgreement: ['.docx', '.txt'],
  priorRequestList: ['.xlsx', '.xls'],
  priorTermSheet: ['.docx', '.txt'],
  currentTermSheet: ['.docx', '.txt']
};

export async function POST(request: Request) {
  const formData = await request.formData();
  const uploadDir = path.join(process.cwd(), 'tmp');
  const fileNames = {};

  for (const [key, file] of formData.entries()) {
    if (file instanceof File) {
      const fileExtension = path.extname(file.name).toLowerCase();
      if (!allowedFileTypes[key]?.includes(fileExtension)) {
        return NextResponse.json({ error: `Invalid file type for ${key}. Expected ${allowedFileTypes[key].join(' or ')}.` }, { status: 400 });
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const fileName = `${key}${fileExtension}`;
      const filePath = path.join(uploadDir, fileName);
      await writeFile(filePath, buffer);
      fileNames[key] = fileName;
    }
  }

  // Store the file names in a JSON file
  await writeFile(path.join(uploadDir, 'fileNames.json'), JSON.stringify(fileNames));

  return NextResponse.json({ message: 'Files uploaded successfully', fileNames });
}