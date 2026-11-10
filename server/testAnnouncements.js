const http = require('http');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '.env') });
process.env.PORT = '5077'; // Dedicated test port

const app = require('./server');
const User = require('./models/User');
const Announcement = require('./models/Announcement');

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
      port: 5077,
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
  console.log('--- Running Announcements API Test Suite ---');
  await new Promise((r) => setTimeout(r, 3000));

  const uniqueId = Date.now().toString().slice(-5);

  // 1. Setup Admin
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@ame.club').toLowerCase();
  const adminPass = process.env.ADMIN_PASSWORD || 'DevAdmin@Pass123';
  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    admin = await User.create({
      name: 'AME Master Admin',
      rollNo: `ADM_${uniqueId}`,
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
  if (adminLogin.statusCode !== 200) throw new Error('Admin login failed');
  const adminToken = adminLogin.body.data.token;
  console.log('✔ Admin logged in');

  // 2. Setup Year 2 Student
  const studentEmail = `student_y2_${uniqueId}@dtu.ac.in`;
  const studentPass = 'StudentPass123';
  const regRes = await request('POST', '/api/auth/register', {}, {
    name: 'Year Two Student',
    rollNo: `Y2_${uniqueId}`,
    college: 'DTU',
    branch: 'Mechanical Engineering',
    year: 2,
    semester: 4,
    email: studentEmail,
    mobile: '9876543210',
    password: studentPass,
  });
  if (regRes.statusCode !== 201) throw new Error('Student Y2 reg failed: ' + JSON.stringify(regRes.body));
  const studentToken = regRes.body.data.token;
  console.log('✔ Year 2 Student registered');

  // 3. Security: Student attempts to POST announcement -> must get 403 Forbidden
  const studentPostRes = await request('POST', '/api/announcements', {
    Authorization: `Bearer ${studentToken}`,
  }, {
    title: 'Hacked Announcement',
    description: 'Student attempting unauthorized announcement',
    category: 'general',
  });
  if (studentPostRes.statusCode !== 403) {
    throw new Error(`Expected 403 for student POST, got ${studentPostRes.statusCode}`);
  }
  console.log('✔ Security: Student blocked with 403 on announcement creation');

  // 4. Admin creates All-Years announcement (targetYear 0)
  const createRes1 = await request('POST', '/api/announcements', {
    Authorization: `Bearer ${adminToken}`,
  }, {
    title: `General Orientation Fest ${uniqueId}`,
    description: 'Welcome orientation for all mechanical engineering batches.',
    category: 'intro',
    targetYear: 0,
  });
  if (createRes1.statusCode !== 201) {
    throw new Error('Admin failed to create announcement: ' + JSON.stringify(createRes1.body));
  }
  const annAllYearsId = createRes1.body.data._id;
  console.log('✔ Admin created All-Years announcement');

  // 5. Admin creates Year 3 targeted announcement (targetYear 3)
  const createRes2 = await request('POST', '/api/announcements', {
    Authorization: `Bearer ${adminToken}`,
  }, {
    title: `Advanced CFD Turbomachinery Lab ${uniqueId}`,
    description: 'Restricted elective lab batch for 3rd year students only.',
    category: 'workshop',
    targetYear: 3,
  });
  if (createRes2.statusCode !== 201) {
    throw new Error('Admin failed to create targeted announcement: ' + JSON.stringify(createRes2.body));
  }
  const annY3Id = createRes2.body.data._id;
  console.log('✔ Admin created Year 3 targeted announcement');

  // 6. Security & Year Filtering:
  // Year 2 student queries announcements: MUST see All-Years, MUST NOT see Year 3 announcement
  const studentListRes = await request('GET', '/api/announcements', {
    Authorization: `Bearer ${studentToken}`,
  });
  if (studentListRes.statusCode !== 200) throw new Error('Student list announcements failed');
  const studentItems = studentListRes.body.data.announcements;
  const seesAllYears = studentItems.some((item) => item._id === annAllYearsId);
  const seesY3 = studentItems.some((item) => item._id === annY3Id);

  if (!seesAllYears) throw new Error('Student failed to see All-Years announcement (targetYear: 0)');
  if (seesY3) throw new Error('SECURITY BREACH: Year 2 student saw Year 3 restricted announcement!');
  console.log('✔ TargetYear isolation verified: Year 2 student cannot see Year 3 circulars');

  // 7. Admin queries announcements: MUST see all
  const adminListRes = await request('GET', '/api/announcements', {
    Authorization: `Bearer ${adminToken}`,
  });
  if (adminListRes.statusCode !== 200) throw new Error('Admin list failed');
  const adminItems = adminListRes.body.data.announcements;
  const adminSeesAllYears = adminItems.some((item) => item._id === annAllYearsId);
  const adminSeesY3 = adminItems.some((item) => item._id === annY3Id);
  if (!adminSeesAllYears || !adminSeesY3) throw new Error('Admin failed to see all announcements');
  console.log('✔ Admin sees all announcements across all batches');

  // 8. Security: Student attempts to update or delete -> 403 Forbidden
  const studentPutRes = await request('PUT', `/api/announcements/${annAllYearsId}`, {
    Authorization: `Bearer ${studentToken}`,
  }, { title: 'Unauthorized Modification' });
  if (studentPutRes.statusCode !== 403) throw new Error('Student PUT did not return 403');

  const studentDelRes = await request('DELETE', `/api/announcements/${annAllYearsId}`, {
    Authorization: `Bearer ${studentToken}`,
  });
  if (studentDelRes.statusCode !== 403) throw new Error('Student DELETE did not return 403');
  console.log('✔ Security: Student blocked with 403 on PUT and DELETE');

  // 9. Admin updates announcement -> 200
  const updateRes = await request('PUT', `/api/announcements/${annAllYearsId}`, {
    Authorization: `Bearer ${adminToken}`,
  }, {
    title: `General Orientation Fest ${uniqueId} [UPDATED]`,
  });
  if (updateRes.statusCode !== 200 || !updateRes.body.data.title.includes('[UPDATED]')) {
    throw new Error('Admin PUT update failed: ' + JSON.stringify(updateRes.body));
  }
  console.log('✔ Admin updated announcement successfully');

  // 10. Clean-up test data to leave clean DB state
  await request('DELETE', `/api/announcements/${annAllYearsId}`, {
    Authorization: `Bearer ${adminToken}`,
  });
  await request('DELETE', `/api/announcements/${annY3Id}`, {
    Authorization: `Bearer ${adminToken}`,
  });
  await User.deleteOne({ email: studentEmail });
  console.log('✔ Test data cleaned up successfully (clean DB state maintained)');

  console.log('\n=============================================');
  console.log('🎉 ALL PART 3A ANNOUNCEMENTS TESTS PASSED!');
  console.log('=============================================\n');
  process.exit(0);
};

run().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});

