const express = require('express');
const router = express.Router();
const { getPaymentQR, updatePaymentQR } = require('../controllers/settingsController');
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Get current QR code - Staff and Admin can see this
router.get('/qr', protect, getPaymentQR);

// Update QR code - Admin only
router.post('/qr', protect, admin, upload.single('qrImage'), updatePaymentQR);

module.exports = router;
