import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { randomToken } from '../utils/crypto.util';

const uploadRoot = path.resolve(process.cwd(), 'uploads');
fs.mkdirSync(uploadRoot, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadRoot),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).slice(0, 10);
    cb(null, `${Date.now()}-${randomToken(8)}${ext}`);
  },
});

export const upload = multer({
  storage,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB
  },
});

