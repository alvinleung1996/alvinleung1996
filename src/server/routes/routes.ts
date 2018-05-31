import path from 'path';
import express from 'express';

const router = express.Router();

router.use((req, res) => {
  res.sendFile(path.resolve(req.publicPath, './index.html'));
})

export default router;
