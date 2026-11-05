const http = require('http');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '.env') });
process.env.PORT = '5055'; // Use non-conflicting port for tests

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
      port: 5055,
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

const runTests = async () => {
  console.log('--- Starting Backend Verification Tests ---');

  // Wait for mongo connection and server listen
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // 1. Seed admin
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@ame.club').toLowerCase();
  const adminPass = process.env.ADMIN_PASSWORD || 'Admin@123456';
  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    admin = await User.create({
      name: 'AME Super Admin',
      rollNo: 'ADMIN001',
      college: 'AME Central',
      branch: 'Mechanical Engineering',
      year: 4,
      semester: 8,
      email: adminEmail,
      mobile: '9876543210',
      password: adminPass,
      role: 'admin',
    });
  }

  // Login as admin
  const adminLoginRes = await request('POST', '/api/auth/login', {}, {
    identifier: adminEmail,
    password: adminPass,
  });
  console.log('Admin login status:', adminLoginRes.statusCode);
  if (adminLoginRes.statusCode !== 200 || !adminLoginRes.body.data?.token) {
    throw new Error('Admin login failed: ' + JSON.stringify(adminLoginRes.body));
  }
  const adminToken = adminLoginRes.body.data.token;
  console.log('✔ Admin login passed');

  // 2. Student Registration
  const studentData = {
    name: 'Rahul Sharma',
    rollNo: 'ME2024001',
    college: 'Delhi Technological University',
    branch: 'Mechanical Engineering',
    year: 3,
    semester: 5,
    email: 'rahul.me@dtu.ac.in',
    mobile: '9812345678',
    password: 'Password@123',
    role: 'admin', // Try to inject admin role
  };

  const regRes = await request('POST', '/api/auth/register', {}, studentData);
  console.log('Student registration status:', regRes.statusCode);
  if (regRes.statusCode !== 201) {
    throw new Error('Student registration failed: ' + JSON.stringify(regRes.body));
  }
  if (regRes.body.data.user.role !== 'student') {
    throw new Error('Security flaw: role injection was not prevented!');
  }
  const studentToken = regRes.body.data.token;
  console.log('✔ Student registration passed (role enforced to student)');

  // 3. Duplicate email check
  const dupEmailRes = await request('POST', '/api/auth/register', {}, {
    ...studentData,
    rollNo: 'ME2024999',
  });
  if (dupEmailRes.statusCode !== 400 || !dupEmailRes.body.message.includes('Email is already registered')) {
    throw new Error('Duplicate email check failed: ' + JSON.stringify(dupEmailRes.body));
  }
  console.log('✔ Duplicate email rejection passed');

  // 4. Duplicate rollNo check
  const dupRollRes = await request('POST', '/api/auth/register', {}, {
    ...studentData,
    email: 'rahul.alternate@dtu.ac.in',
  });
  if (dupRollRes.statusCode !== 400 || !dupRollRes.body.message.includes('Roll number is already registered')) {
    throw new Error('Duplicate rollNo check failed: ' + JSON.stringify(dupRollRes.body));
  }
  console.log('✔ Duplicate rollNo rejection passed');

  // 5. Login via email
  const loginEmailRes = await request('POST', '/api/auth/login', {}, {
    identifier: 'rahul.me@dtu.ac.in',
    password: 'Password@123',
  });
  if (loginEmailRes.statusCode !== 200 || !loginEmailRes.body.data?.token) {
    throw new Error('Login via email failed: ' + JSON.stringify(loginEmailRes.body));
  }
  console.log('✔ Login via email passed');

  // 6. Login via roll number
  const loginRollRes = await request('POST', '/api/auth/login', {}, {
    identifier: 'ME2024001',
    password: 'Password@123',
  });
  if (loginRollRes.statusCode !== 200 || !loginRollRes.body.data?.token) {
    throw new Error('Login via rollNo failed: ' + JSON.stringify(loginRollRes.body));
  }
  console.log('✔ Login via roll number passed');

  // 7. Login with wrong password -> Generic 401 "Invalid credentials"
  const badLoginRes = await request('POST', '/api/auth/login', {}, {
    identifier: 'ME2024001',
    password: 'WrongPassword',
  });
  if (badLoginRes.statusCode !== 401 || badLoginRes.body.message !== 'Invalid credentials') {
    throw new Error('Bad password did not return 401 Invalid credentials');
  }
  console.log('✔ Invalid credentials response verified');

  // 8. GET /api/auth/me (Protected)
  const meRes = await request('GET', '/api/auth/me', {
    Authorization: `Bearer ${studentToken}`,
  });
  if (meRes.statusCode !== 200 || meRes.body.data?.user?.email !== 'rahul.me@dtu.ac.in') {
    throw new Error('GET /api/auth/me failed: ' + JSON.stringify(meRes.body));
  }
  console.log('✔ GET /api/auth/me passed');

  // 9. GET /api/auth/me without token -> 401
  const noTokenRes = await request('GET', '/api/auth/me');
  if (noTokenRes.statusCode !== 401) {
    throw new Error('No token request was not rejected with 401');
  }
  console.log('✔ Unauthenticated route protection passed');

  // 10. PUT /api/auth/profile
  const updateRes = await request('PUT', '/api/auth/profile', {
    Authorization: `Bearer ${studentToken}`,
  }, {
    college: 'DTU Main Campus',
    semester: 6,
    mobile: '9988776655',
    role: 'admin', // should be ignored
    rollNo: 'HACKED001', // should be ignored
  });
  if (updateRes.statusCode !== 200 || updateRes.body.data?.user?.college !== 'DTU Main Campus' || updateRes.body.data?.user?.semester !== 6) {
    throw new Error('PUT /api/auth/profile failed: ' + JSON.stringify(updateRes.body));
  }
  if (updateRes.body.data.user.role === 'admin' || updateRes.body.data.user.rollNo === 'HACKED001') {
    throw new Error('Security flaw: unauthorized fields were updated!');
  }
  console.log('✔ PUT /api/auth/profile passed (restricted fields only)');

  // 11. Student attempting admin route -> 403 Forbidden
  const studentAdminRes = await request('GET', '/api/admin/students', {
    Authorization: `Bearer ${studentToken}`,
  });
  if (studentAdminRes.statusCode !== 403) {
    throw new Error('Student was not rejected with 403 on admin route! Got: ' + studentAdminRes.statusCode);
  }
  console.log('✔ Student access to admin route blocked with 403 Forbidden');

  // 12. Admin accessing GET /api/admin/students
  const adminStudentsRes = await request('GET', '/api/admin/students', {
    Authorization: `Bearer ${adminToken}`,
  });
  if (adminStudentsRes.statusCode !== 200 || !adminStudentsRes.body.data?.students) {
    throw new Error('Admin GET /students failed: ' + JSON.stringify(adminStudentsRes.body));
  }
  console.log('✔ Admin GET /api/admin/students passed, count:', adminStudentsRes.body.data.students.length);

  // 13. Admin exporting CSV
  const csvRes = await request('GET', '/api/admin/students/export', {
    Authorization: `Bearer ${adminToken}`,
  });
  if (csvRes.statusCode !== 200 || !csvRes.body.includes('Roll Number') || !csvRes.body.includes('ME2024001')) {
    throw new Error('Admin CSV export failed: ' + csvRes.body);
  }
  console.log('✔ Admin CSV export passed with CSV header and records');

  console.log('\n========================================');
  console.log('🎉 ALL BACKEND API TESTS PASSED SUCCESSFULLY!');
  console.log('========================================\n');
  process.exit(0);
};

runTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});

