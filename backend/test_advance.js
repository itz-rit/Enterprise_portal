const API_URL = 'http://127.0.0.1:5000/api/admin/users';
const AUTH_URL = 'http://127.0.0.1:5000/api/v1/auth/login';
const STAFF_PROFILE = 'http://127.0.0.1:5000/api/staff/profile';

async function testSync() {
  try {
    // 1. Admin Login
    console.log('Logging in as Admin...');
    let adminRes = await fetch(AUTH_URL, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '7010425239', password: 'password123' })
    });
    if (!adminRes.ok) {
       adminRes = await fetch(AUTH_URL, {
         method: 'POST', headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ phone: '7010425239', password: 'password' })
       });
    }
    if (!adminRes.ok) {
       adminRes = await fetch(AUTH_URL, {
         method: 'POST', headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ phone: '7010425239', password: '123456' })
       });
    }
    const adminData = await adminRes.json();
    const adminToken = adminData.token;
    if (!adminToken) throw new Error('Admin login failed');
    console.log('Admin token retrieved.');

    // 2. Get Staff
    const usersRes = await fetch(API_URL, { headers: { Authorization: `Bearer ${adminToken}` } });
    if (!usersRes.ok) throw new Error('Failed to fetch users');
    const users = await usersRes.json();
    const staff = users.find(u => u.role === 'Staff');
    if (!staff) throw new Error('No staff found.');
    console.log(`Found staff: ${staff.name} (Phone: ${staff.phone})`);

    // 3. Update Advance
    const newAdvance = Math.floor(Math.random() * 1000) + 1000;
    console.log(`Setting advanceAmount to: ${newAdvance}`);
    
    const updateRes = await fetch(`${API_URL}/${staff._id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}` 
      },
      body: JSON.stringify({ advanceAmount: newAdvance })
    });
    if (!updateRes.ok) throw new Error('Failed to update staff advanceAmount');

    // 4. Staff Login
    console.log('Logging in as Staff...');
    let staffRes = await fetch(AUTH_URL, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: staff.phone, password: 'password123' })
    });
    if (!staffRes.ok) {
       staffRes = await fetch(AUTH_URL, {
         method: 'POST', headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ phone: staff.phone, password: 'password' })
       });
    }
    if (!staffRes.ok) {
       staffRes = await fetch(AUTH_URL, {
         method: 'POST', headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ phone: staff.phone, password: '123456' })
       });
    }
    const staffData = await staffRes.json();
    const staffToken = staffData.token;
    if (!staffToken) throw new Error('Staff login failed');

    // 5. Fetch Profile
    const profileRes = await fetch(STAFF_PROFILE, { headers: { Authorization: `Bearer ${staffToken}` } });
    if (!profileRes.ok) throw new Error('Failed to fetch profile');
    const profile = await profileRes.json();
    const profileAdvance = profile.advanceAmount;
    
    console.log(`Admin set advance: ${newAdvance}`);
    console.log(`Staff fetched advance: ${profileAdvance}`);

    if (profileAdvance === newAdvance) {
      console.log('SUCCESS: Advance amount synced perfectly!');
    } else {
      console.log('FAILED: Sync mismatch.');
    }
  } catch (error) {
    console.error('Test Failed:', error.message);
  }
}

testSync();
