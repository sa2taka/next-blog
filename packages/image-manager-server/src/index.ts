import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { readFile } from 'fs/promises';
import { dirname, join } from 'path';
import { DATA_ROOT, fetchAllImages } from './libs/repository/local-file';
import { uploadImageToStorage } from './libs/repository/storage';
import multer from 'multer';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, join(__dirname, '..', '..', '..', '_data', '_images'));
  },
  filename: function (_req, file, cb) {
    const converted = Buffer.from(file.originalname, 'latin1').toString('utf8');
    cb(null, converted);
  },
});

const upload = multer({
  dest: join(__dirname, '..', '..', '..', '_data', '_images'),
  storage,
});

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

app.post('/api/upload-to-local', upload.array('images[]'), async (req, res) => {
  await Promise.all(
    Object.values(req.files ?? {}).map(async (file) => {
      const converted = Buffer.from(file.originalname, 'latin1')
        .toString('utf8')
        .normalize();
      await uploadImageToStorage(converted);
    })
  );

  res.sendStatus(201);
});

app.post('/api/upload-to-storage', async (req, res) => {
  const filename = req.body.filename;
  const result = await uploadImageToStorage(filename);
  res.json(result);
});

app.listen(10010);
