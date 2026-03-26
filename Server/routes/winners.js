const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const DrawResult = require('../models/DrawResult');
const { protect } = require('../middleware/auth');

// Configure multer for proof uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `proof_${req.user._id}_${Date.now()}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|pdf/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) return cb(null, true);
    cb(new Error('Only image files and PDFs are allowed'));
  },
});

// GET /api/winners/me — current user's win history
router.get('/me', protect, async (req, res) => {
  try {
    const wins = await DrawResult.find({ userId: req.user._id })
      .populate('drawId', 'month year winningNumbers totalPrizePool')
      .sort({ createdAt: -1 });
    res.json({ wins });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/winners/:id/upload-proof — upload score screenshot as proof
router.post('/:id/upload-proof', protect, upload.single('proof'), async (req, res) => {
  try {
    const drawResult = await DrawResult.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!drawResult) {
      return res.status(404).json({ message: 'Win record not found' });
    }

    if (!['pending'].includes(drawResult.verificationStatus)) {
      return res.status(400).json({
        message: `Cannot upload proof — current status: ${drawResult.verificationStatus}`,
      });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const proofUrl = `/uploads/${req.file.filename}`;
    drawResult.proofUrl = proofUrl;
    drawResult.verificationStatus = 'proof_submitted';
    await drawResult.save();

    res.json({ message: 'Proof uploaded successfully', proofUrl, drawResult });
  } catch (err) {
    console.error('Proof upload error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
