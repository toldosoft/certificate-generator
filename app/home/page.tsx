// app/home/page.tsx
"use client";
import React, { useState, useEffect } from "react";
import * as XLSX from 'xlsx';
import { PDFDocument } from 'pdf-lib';
import { saveAs } from 'file-saver';
import { Box, TextField, Checkbox, FormControlLabel, Typography } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Button } from '@/components/ui/Button';

export default function HomePage() {
  const [file, setFile] = useState<File | null>(null);
  const [pdfTemplate, setPdfTemplate] = useState<File | null>(null);
  const [rows, setRows] = useState<Array<Record<string, any>>>([]);
  const [selectedColumns, setSelectedColumns] = useState<Record<string, boolean>>({});
  const [textPositions, setTextPositions] = useState<Record<string, { x: number, y: number }>>({});

  useEffect(() => {
    if (rows.length > 0) {
      // Initialize text positions when rows are first set
      const initialPositions = {};
      Object.keys(rows[0]).forEach(key => {
        initialPositions[key] = { x: 50, y: 700 }; // Default positions
      });
      setTextPositions(initialPositions);
    }
  }, [rows]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, type: 'excel' | 'pdf') => {
    const file = event.target.files ? event.target.files[0] : null;
    if (type === 'excel') setFile(file);
    else setPdfTemplate(file);
  };

  const handleColumnCheck = (columnName: string) => {
    setSelectedColumns(prev => ({
      ...prev,
      [columnName]: !prev[columnName]
    }));
  };

  const handlePositionChange = (columnName: string, axis: 'x' | 'y', value: number) => {
    setTextPositions(prev => ({
      ...prev,
      [columnName]: { ...prev[columnName], [axis]: value }
    }));
  };

  const handleSubmit = async () => {
    if (!file) return alert('Please upload an Excel file.');
  
    // Parse Excel File
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(worksheet);
      console.log("Parsed JSON:", json); // Debug log
      setRows(json);
    } catch (error) {
      console.error("Error parsing Excel file:", error);
      return alert('Failed to parse the Excel file.');
    }
  
    if (!pdfTemplate) return alert('Please upload a PDF template.');
  
    // Load PDF Template
    try {
      const pdfData = await pdfTemplate.arrayBuffer();
      const pdfDoc = await PDFDocument.load(pdfData);
  
      // Generate a PDF for each row
      const promises = rows.map(async (row, index) => {
        const pdfClone = await PDFDocument.load(await pdfDoc.save());
        const page = pdfClone.getPage(0);
  
        Object.keys(row).forEach(key => {
          if (selectedColumns[key]) {
            const { x, y } = textPositions[key];
            const text = `${key}: ${row[key]}`;
            page.drawText(text, { x, y, size: 12 });
          }
        });
  
        const pdfBytes = await pdfClone.save();
        saveAs(new Blob([pdfBytes], { type: 'application/pdf' }), `certificate-${index + 1}.pdf`);
      });
  
      await Promise.all(promises);
      alert('All certificates have been generated and downloaded.');
    } catch (error) {
      console.error("Error generating PDFs:", error);
      alert('Failed to generate PDFs.');
    }
  };
  

  const columns: GridColDef[] = rows[0]
    ? Object.keys(rows[0]).map(key => ({
        field: key,
        headerName: key.charAt(0).toUpperCase() + key.slice(1),
        width: 150,
        editable: true,
      }))
    : [];

  return (
    <div style={{ height: 800, width: '100%' }}>
      <input type="file" onChange={(e) => handleFileChange(e, 'excel')} accept=".xlsx" />
      <input type="file" onChange={(e) => handleFileChange(e, 'pdf')} accept=".pdf" />
      <Box sx={{ my: 2 }}>
        {Object.keys(selectedColumns).map(key => (
          <Box key={key} sx={{ my: 1 }}>
            <FormControlLabel
              control={<Checkbox checked={!!selectedColumns[key]} onChange={() => handleColumnCheck(key)} />}
              label={key}
            />
            {selectedColumns[key] && (
              <Box sx={{ display: 'inline', mx: 2 }}>
                <TextField
                  size="small"
                  label="X"
                  type="number"
                  value={textPositions[key].x}
                  onChange={(e) => handlePositionChange(key, 'x', parseInt(e.target.value))}
                  sx={{ width: '80px' }}
                />
                <TextField
                  size="small"
                  label="Y"
                  type="number"
                  value={textPositions[key].y}
                  onChange={(e) => handlePositionChange(key, 'y', parseInt(e.target.value))}
                  sx={{ width: '80px' }}
                />
              </Box>
            )}
          </Box>
        ))}
      </Box>
      <Button onClick={handleSubmit}>Generate Certificates</Button>
      <DataGrid
        rows={rows}
        columns={columns}
        pageSize={5}
        rowsPerPageOptions={[5, 10, 20]}
        checkboxSelection
        disableSelectionOnClick
        autoHeight
      />
    </div>
  );
}
