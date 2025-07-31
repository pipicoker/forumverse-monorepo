import express from 'express';
import multer from 'multer';
import cloudinary from '../lib/cloudinary';

const router = express.Router();
const storage = multer.memoryStorage(); // buffer upload in memory
const upload = multer({ storage });

router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const result = await cloudinary.uploader.upload_stream(
      { folder: 'forumverse/user_avatars' },
      (error, result) => {
        if (error) return res.status(500).json({ error: 'Upload failed', detail: error });

        return res.json({ url: result?.secure_url });
      }
    );

    // pipe the buffer to Cloudinary
    const stream = result;
    stream.end(req.file.buffer);
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
