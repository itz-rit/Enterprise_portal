const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_BASE = 'http://localhost:5000/api/v1';

async function testUpload() {
  try {
    // 1. Login to get token
    const loginRes = await axios.post(`${API_BASE}/auth/login`, {
      phone: '9999999999',
      password: 'admin123'
    });
    const token = loginRes.data.token;
    console.log('Logged in, token received');

    // 2. Prepare Form Data
    const form = new FormData();
    // Create a dummy image file if it doesn't exist
    const dummyPath = path.join(__dirname, 'dummy.png');
    fs.writeFileSync(dummyPath, 'fake image data');
    
    form.append('qrImage', fs.createReadStream(dummyPath));

    // 3. Post to QR endpoint
    console.log('Uploading QR...');
    const uploadRes = await axios.post(`${API_BASE}/settings/qr`, form, {
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${token}`
      }
    });

    console.log('Upload Success:', uploadRes.data);

    // 4. Cleanup
    fs.unlinkSync(dummyPath);
  } catch (err) {
    console.error('Upload Failed:', err.response?.data || err.message);
  }
}

testUpload();
