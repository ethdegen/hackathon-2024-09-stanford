// src/app/generated-request-list/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { utils, write } from 'xlsx';

export default function GeneratedRequestList() {
  const [requestList, setRequestList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/analyze')
      .then(response => response.json())
      .then(data => {
        setRequestList(data);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error fetching request list:', error);
        setIsLoading(false);
      });
  }, []);

  const handleDownloadExcel = () => {
    const ws = utils.json_to_sheet(requestList);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Request List");
    const excelBuffer = write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(data);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'M&A_Request_List.xlsx';
    link.click();
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <main className="max-w-4xl min-h-screen mx-auto pb-32 px-3">
      <h1 className="text-2xl font-bold mb-4">Generated M&A Request List</h1>
      <button onClick={handleDownloadExcel} className="btn-blue mb-4">Download Excel</button>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-2">Item Name</th>
              <th className="border border-gray-300 p-2">Description</th>
              <th className="border border-gray-300 p-2">Explanation</th>
            </tr>
          </thead>
          <tbody>
            {requestList.map((item, index) => (
              <tr key={index}>
                <td className="border border-gray-300 p-2">{item.ItemName}</td>
                <td className="border border-gray-300 p-2">{item.ItemDescription}</td>
                <td className="border border-gray-300 p-2">{item.LLMExplanation}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}