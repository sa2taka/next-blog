import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { DATA_ROOT, fetchAllImages } from './libs/repository/local-file';
import { uploadImageToStorage } from './libs/repository/storage';

dotenv.config();

const app = express();

app.use(
  express.json({
    type: ['application/json', 'text/plain'],
  })
);

app.use(cors({ origin: '*' }));

app.get('/image/:filename', async (req, res) => {
  const filename = req.params.filename;

  const file = await readFile(join(DATA_ROOT, '_images', filename));

  res.setHeader('Content-Type', 'image/png');
  res.send(file);
});

app.get('/api/images', async (req, res) => {
  const data = await fetchAllImages();
  res.json({ result: data });
});

app.post('/api/upload-to-storage', async (req, res) => {
  const filename = req.body.filename;
  const result = await uploadImageToStorage(filename);
  res.json(result);
});

app.listen(10010);
