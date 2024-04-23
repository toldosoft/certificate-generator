// File: app/api/upload/route.ts
import { NextApiRequest, NextApiResponse } from 'next';
import * as xlsx from 'xlsx';

// Make sure to import IncomingForm from formidable if you are handling file uploads
import { IncomingForm } from 'formidable';

export const config = {
  api: {
    bodyParser: false,
  },
};

// Use named export for POST method
export const POST = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const form = new IncomingForm();
    form.parse(req, (err, fields, files) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to parse the form data.' });
      }

      const file = files?.file;
      if (!file) {
        return res.status(400).json({ error: 'No file uploaded.' });
      }

      try {
        // Assuming the file is an Excel file and we want to parse it to JSON
        const workbook = xlsx.read(file.path, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(worksheet);

        res.status(200).json(data);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to process the file.' });
      }
    });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end('Method Not Allowed');
  }
};
