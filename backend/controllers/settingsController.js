const GlobalSetting = require('../models/GlobalSetting');
const fs = require('fs');

// @desc    Update and upload a new payment QR code image
// @route   POST /api/v1/settings/qr
// @access  Private (Admin)
const updatePaymentQR = async (req, res) => {
  try {
    if (!req.file) {
      console.error('❌ QR Upload Failed: No file provided dynamically');
      return res.status(400).json({ message: 'Please upload a QR image' });
    }

    const filePath = req.file.path;
    
    // Read file and convert to Base64
    const fileData = fs.readFileSync(filePath);
    const base64Image = `data:${req.file.mimetype};base64,${fileData.toString('base64')}`;

    console.log('-----------------------------------');
    console.log('🧪 DEBUG MODE: PERMANENT QR UPLOAD');
    console.log(`- Local file processed: ${filePath}`);
    console.log(`- Conversion: Image -> Base64 String`);
    console.log(`- Data length: ${base64Image.length} characters`);
    console.log('-----------------------------------');

    let setting = await GlobalSetting.findOne({ key: 'PAYMENT_QR' });
    if (setting) {
      setting.value = base64Image;
      await setting.save();
    } else {
      await GlobalSetting.create({ key: 'PAYMENT_QR', value: base64Image });
    }

    // ── PERMANENCE FIX ──
    // Delete the local file after converting to DB string 
    // to ensure no orphan files on ephemeral storage.
    try {
      fs.unlinkSync(filePath);
      console.log('✅ Temporary QR file cleaned up from disk.');
    } catch (cleanupErr) {
      console.warn('⚠️ Minor: Failed to delete temporary QR file:', cleanupErr.message);
    }

    res.status(201).json({ 
      success: true, 
      message: 'Permanent QR Code updated successfully', 
      imageUrl: base64Image 
    });
  } catch (error) {
    console.error('🔥 Server Error in QR Upload:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get current payment QR code
// @route   GET /api/v1/settings/qr
// @access  Private
const getPaymentQR = async (req, res) => {
  try {
    const setting = await GlobalSetting.findOne({ key: 'PAYMENT_QR' });
    res.json({ 
      success: true,
      qrCodeUrl: setting ? setting.value : null 
    });
  } catch (error) {
    console.error('🔥 Error fetching QR code:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

module.exports = {
  updatePaymentQR,
  getPaymentQR
};
