// app/home/page.tsx
"use client";

import { useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/Button';

export default function HomePage() {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    setFile(file);
  };

  const handleSubmit = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post('/api/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    console.log(response.data);
  };

  return (
    <div className="p-4">
      <input type="file" onChange={handleFileChange} accept=".xlsx" />
      <Button onClick={handleSubmit}>Upload File</Button>
    </div>
  );
}

