// File: app/api/upload/route.ts
import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import * as xlsx from 'xlsx';

export const config = {
  api: {
    bodyParser: false
  }
};

export async function POST(req: NextApiRequest, res: NextApiResponse) {
  const form = new formidable.IncomingForm();
  form.parse(req, (err, fields, files) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to parse the form data.' });
    }

    try {
      const file = files.file as formidable.File;
      const workbook = xlsx.readFile(file.filepath);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(sheet);
      res.status(200).json({ data });
    } catch (error) {
      res.status(500).json({ error: 'Failed to read the Excel file.' });
    }
  });
}
