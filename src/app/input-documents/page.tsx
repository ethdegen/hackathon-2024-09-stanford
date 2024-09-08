// src/app/input-documents/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function InputDocuments() {
  const [files, setFiles] = useState({
    priorPurchaseAgreement: null,
    priorRequestList: null,
    priorTermSheet: null,
    currentTermSheet: null,
  });
  const router = useRouter();

  const handleFileChange = (event, fileType) => {
    setFiles({ ...files, [fileType]: event.target.files[0] });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    Object.keys(files).forEach(key => {
      formData.append(key, files[key]);
    });

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        router.push('/generated-request-list');
      } else {
        // Handle error
        console.error('Upload failed');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <main className="max-w-lg min-h-screen flex flex-col justify-center items-center mx-auto pb-32 px-3">
      <h1 className="text-2xl font-bold mb-4">Input Documents</h1>
      <form onSubmit={handleSubmit} className="w-full">
        <div className="mb-4">
          <label className="block mb-2">Prior Purchase Agreement</label>
          <input type="file" onChange={(e) => handleFileChange(e, 'priorPurchaseAgreement')} required />
        </div>
        <div className="mb-4">
          <label className="block mb-2">Prior Request List</label>
          <input type="file" onChange={(e) => handleFileChange(e, 'priorRequestList')} required />
        </div>
        <div className="mb-4">
          <label className="block mb-2">Prior Term Sheet</label>
          <input type="file" onChange={(e) => handleFileChange(e, 'priorTermSheet')} required />
        </div>
        <div className="mb-4">
          <label className="block mb-2">Current Term Sheet</label>
          <input type="file" onChange={(e) => handleFileChange(e, 'currentTermSheet')} required />
        </div>
        <button type="submit" className="btn-blue w-full">Generate Request List</button>
      </form>
    </main>
  );
}