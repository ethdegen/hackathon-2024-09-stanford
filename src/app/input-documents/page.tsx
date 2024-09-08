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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, fileType: string) => {
    if (event.target.files && event.target.files[0]) {
      setFiles({ ...files, [fileType]: event.target.files[0] });
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    Object.entries(files).forEach(([key, file]) => {
      if (file) formData.append(key, file);
    });

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('File upload failed');
      }

      router.push('/generated-request-list');
    } catch (error) {
      console.error('Error uploading files:', error);
      setError('An error occurred while uploading files. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="max-w-lg min-h-screen flex flex-col justify-center items-center mx-auto pb-32 px-3">
      <h1 className="text-2xl font-bold mb-4">Input Documents</h1>
      <form onSubmit={handleSubmit} className="w-full">
        <div className="mb-4">
          <label className="block mb-2">Prior Purchase Agreement (DOCX or TXT)</label>
          <input type="file" accept=".docx,.txt" onChange={(e) => handleFileChange(e, 'priorPurchaseAgreement')} required />
        </div>
        <div className="mb-4">
          <label className="block mb-2">Prior Request List (Excel)</label>
          <input type="file" accept=".xlsx,.xls" onChange={(e) => handleFileChange(e, 'priorRequestList')} required />
        </div>
        <div className="mb-4">
          <label className="block mb-2">Prior Term Sheet (DOCX or TXT)</label>
          <input type="file" accept=".docx,.txt" onChange={(e) => handleFileChange(e, 'priorTermSheet')} required />
        </div>
        <div className="mb-4">
          <label className="block mb-2">Current Term Sheet (DOCX or TXT)</label>
          <input type="file" accept=".docx,.txt" onChange={(e) => handleFileChange(e, 'currentTermSheet')} required />
        </div>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <button type="submit" className="btn-blue w-full" disabled={isLoading}>
          {isLoading ? 'Uploading...' : 'Generate Request List'}
        </button>
      </form>
    </main>
  );
}