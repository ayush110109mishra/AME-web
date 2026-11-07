const http = require('http');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '.env') });
process.env.PORT = '5066'; // Use non-conflicting dedicated test port

const app = require('./server');
const User = require('./models/User');

const request = (method, urlPath, headers = {}, body = null) => {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : '';
    const reqHeaders = { ...headers };
    if (body) {
      reqHeaders['Content-Type'] = 'application/json';
      reqHeaders['Content-Length'] = Buffer.byteLength(postData);
    }

    const options = {
      hostname: '127.0.0.1',
      port: 5066,
      path: urlPath,
      method: method,
      headers: reqHeaders,
    };

    const req = http.request(options, (res) => {
      let rawData = '';
      res.on('data', (chunk) => {
        rawData += chunk;
      });
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(rawData);
        } catch (e) {
          json = rawData;
        }
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: json,
        });
      });
    });

    req.on('error', (e) => reject(e));
    if (body) {
      req.write(postData);
    }
    req.end();
  });
};

const run = async () => {
  console.log('--- Running Day 2 Backend Test Suite ---');
  // Allow server startup and mongo connection
  await new Promise((r) => setTimeout(r, 4000));

  const uniqueId = Date.now().toString().slice(-5);

  // 1. Create and login as Admin
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@ame.club').toLowerCase();
  const adminPass = process.env.ADMIN_PASSWORD || 'Admin@123456';

  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    admin = await User.create({
      name: 'AME Master Admin',
      rollNo: `ADMIN_${uniqueId}`,
      college: 'AME HQ',
      branch: 'Mechanical Engineering',
      year: 4,
      semester: 8,
      email: adminEmail,
      mobile: '9876543210',
      password: adminPass,
      role: 'admin',
    });
  }

  const adminLogin = await request('POST', '/api/auth/login', {}, {
    identifier: adminEmail,
    password: adminPass,
  });
  if (adminLogin.statusCode !== 200 || !adminLogin.body.data?.token) {
    throw new Error('Admin login failed: ' + JSON.stringify(adminLogin.body));
  }
  const adminToken = adminLogin.body.data.token;
  console.log('✔ Admin logged in');

  // 2. Create and login as Student
  const studentEmail = `day2student_${uniqueId}@dtu.ac.in`;
  const studentRoll = `D2_${uniqueId}`;
  const studentPass = 'StudentPass123';

  const regRes = await request('POST', '/api/auth/register', {}, {
    name: 'Day2 Student',
    rollNo: studentRoll,
    college: 'DTU',
    branch: 'Mechanical Engineering',
    year: 3,
    semester: 5,
    email: studentEmail,
    mobile: '9876543210',
    password: studentPass,
  });
  if (regRes.statusCode !== 201) {
    throw new Error('Student reg failed: ' + JSON.stringify(regRes.body));
  }
  const studentToken = regRes.body.data.token;
  const studentId = regRes.body.data.user._id;
  console.log('✔ Student registered');

  // 3. Test Change Password (Incorrect Current Password)
  const badPassRes = await request('PUT', '/api/auth/change-password', {
    Authorization: `Bearer ${studentToken}`,
  }, {
    currentPassword: 'WrongPassword999',
    newPassword: 'NewPassword123',
  });
  if (badPassRes.statusCode !== 400 || badPassRes.body.message !== 'Incorrect current password') {
    throw new Error('Wrong current password test failed: ' + JSON.stringify(badPassRes.body));
  }
  console.log('✔ Change password rejected on incorrect current password');

  // 4. Test Change Password (Successful)
  const goodPassRes = await request('PUT', '/api/auth/change-password', {
    Authorization: `Bearer ${studentToken}`,
  }, {
    currentPassword: studentPass,
    newPassword: 'BrandNewPass2026',
  });
  if (goodPassRes.statusCode !== 200 || goodPassRes.body.message !== 'Password changed successfully') {
    throw new Error('Password change failed: ' + JSON.stringify(goodPassRes.body));
  }
  console.log('✔ Password changed successfully');

  // Verify login with new password
  const newLoginRes = await request('POST', '/api/auth/login', {}, {
    identifier: studentEmail,
    password: 'BrandNewPass2026',
  });
  if (newLoginRes.statusCode !== 200 || !newLoginRes.body.data?.token) {
    throw new Error('Login with new password failed');
  }
  console.log('✔ Verified login with new password');

  // 5. Test Club Stats (Day 3 rule: GET /api/auth/stats is restricted to admin only)
  const studentClubStats = await request('GET', '/api/auth/stats', {
    Authorization: `Bearer ${studentToken}`,
  });
  if (studentClubStats.statusCode !== 403) {
    throw new Error('Student should be blocked with 403 on /api/auth/stats');
  }
  console.log('✔ Student access to /api/auth/stats blocked with 403 (Day 3 privacy rule)');

  const adminClubStats = await request('GET', '/api/auth/stats', {
    Authorization: `Bearer ${adminToken}`,
  });
  if (adminClubStats.statusCode !== 200 || typeof adminClubStats.body.data?.totalMembers !== 'number') {
    throw new Error('Admin club stats failed: ' + JSON.stringify(adminClubStats.body));
  }
  console.log('✔ Admin GET /api/auth/stats passed, totalMembers:', adminClubStats.body.data.totalMembers);

  // 6. Test Admin Dashboard Stats GET /api/admin/stats
  // Non-admin token should get 403
  const studentStatsRes = await request('GET', '/api/admin/stats', {
    Authorization: `Bearer ${studentToken}`,
  });
  if (studentStatsRes.statusCode !== 403) {
    throw new Error('Student did not receive 403 on /admin/stats: ' + studentStatsRes.statusCode);
  }
  console.log('✔ Student access to /api/admin/stats blocked with 403 Forbidden');

  // Admin token should get 200 with stat cards
  const adminStatsRes = await request('GET', '/api/admin/stats', {
    Authorization: `Bearer ${adminToken}`,
  });
  if (adminStatsRes.statusCode !== 200 || !adminStatsRes.body.data?.yearWise) {
    throw new Error('Admin stats failed: ' + JSON.stringify(adminStatsRes.body));
  }
  console.log('✔ Admin stats fetched successfully:', adminStatsRes.body.data);

  // 7. Test Admin Role Management
  // Student trying to change role -> 403
  const studentRoleAttempt = await request('PUT', `/api/admin/students/${studentId}/role`, {
    Authorization: `Bearer ${studentToken}`,
  }, { role: 'admin' });
  if (studentRoleAttempt.statusCode !== 403) {
    throw new Error('Student was not blocked with 403 on role change');
  }
  console.log('✔ Student blocked with 403 on role modification');

  // Admin trying to change their own role -> 400
  const selfDemoteRes = await request('PUT', `/api/admin/students/${adminLogin.body.data.user._id}/role`, {
    Authorization: `Bearer ${adminToken}`,
  }, { role: 'student' });
  if (selfDemoteRes.statusCode !== 400 || !selfDemoteRes.body.message.includes('cannot change their own role')) {
    throw new Error('Self demotion was not blocked: ' + JSON.stringify(selfDemoteRes.body));
  }
  console.log('✔ Admin self-demotion blocked with 400');

  // Admin promoting student to admin -> 200
  const promoteRes = await request('PUT', `/api/admin/students/${studentId}/role`, {
    Authorization: `Bearer ${adminToken}`,
  }, { role: 'admin' });
  if (promoteRes.statusCode !== 200 || promoteRes.body.data?.user?.role !== 'admin') {
    throw new Error('Student promotion failed: ' + JSON.stringify(promoteRes.body));
  }
  console.log('✔ Student promoted to Admin successfully');

  // Admin demoting newly promoted admin back to student -> 200 (since 2 admins exist now)
  const demoteRes = await request('PUT', `/api/admin/students/${studentId}/role`, {
    Authorization: `Bearer ${adminToken}`,
  }, { role: 'student' });
  if (demoteRes.statusCode !== 200 || demoteRes.body.data?.user?.role !== 'student') {
    throw new Error('Demotion back to student failed: ' + JSON.stringify(demoteRes.body));
  }
  console.log('✔ Secondary Admin demoted to Student successfully');

  // Password should never be in response
  if (demoteRes.body.data.user.password || promoteRes.body.data.user.password) {
    throw new Error('Security flaw: Password leaked in role response!');
  }
  console.log('✔ Password omitted from all user responses');

  console.log('\n===========================================');
  console.log('🎉 ALL DAY 2 (PART A) BACKEND TESTS PASSED!');
  console.log('===========================================\n');
  process.exit(0);
};

run().catch((e) => {
  console.error('❌ Day 2 test failed:', e);
  process.exit(1);
});
