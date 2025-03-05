const express = require('express');
const router = express.Router();
const receiptController = require('../controllers/receiptController');
const multer = require('multer');
const { protect } = require('../middleware/authMiddleware');

const storage = multer.diskStorage({
    destination: (req, file, cb) => { cb(null, 'uploads/'); },
    filename: (req, file, cb) => {
        const suffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, suffix + '-' + file.originalname);
    }
});
const upload = multer({ storage });

// Protected routes
router.post('/', protect, upload.single('receipt'), receiptController.uploadReceipt);
router.get('/', protect, receiptController.getUserReceipts);

module.exports = router;
