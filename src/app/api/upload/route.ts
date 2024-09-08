// src/app/api/upload/route.ts
import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
  const formData = await request.formData();
  const files = ['priorPurchaseAgreement', 'priorRequestList', 'priorTermSheet', 'currentTermSheet'];

  for (const file of files) {
    const uploadedFile = formData.get(file) as File;
    if (!uploadedFile) {
      return NextResponse.json({ error: `${file} is required` }, { status: 400 });
    }

    const buffer = Buffer.from(await uploadedFile.arrayBuffer());
    const filename = path.join(process.cwd(), 'tmp', uploadedFile.name);
    await writeFile(filename, buffer);
  }

  return NextResponse.json({ message: 'Files uploaded successfully' });
}
