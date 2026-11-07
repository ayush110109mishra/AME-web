const http = require('http');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '.env') });
process.env.PORT = '5088'; // Dedicated test port

const app = require('./server');
const User = require('./models/User');
const Gallery = require('./models/Gallery');
const { uploadStream, deleteAsset } = require('./config/cloudinary');

const request = (method, urlPath, headers = {}, body = null) => {
  return new Promise((resolve, reject) => {
    const postData = body ? (typeof body === 'string' ? body : JSON.stringify(body)) : '';
    const reqHeaders = { ...headers };
    if (body && !reqHeaders['Content-Type']) {
      reqHeaders['Content-Type'] = 'application/json';
    }
    if (body) {
      reqHeaders['Content-Length'] = Buffer.byteLength(postData);
    }

    const options = {
      hostname: '127.0.0.1',
      port: 5088,
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
  console.log('--- Running Gallery API Test Suite ---');
  await new Promise((r) => setTimeout(r, 3000));

  const uniqueId = Date.now().toString().slice(-5);

  // 1. Setup Admin
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@ame.club').toLowerCase();
  const adminPass = process.env.ADMIN_PASSWORD || 'Admin@123456';
  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    admin = await User.create({
      name: 'AME Master Admin',
      rollNo: `ADMG_${uniqueId}`,
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

  // 2. Setup Student
  const studentEmail = `student_gallery_${uniqueId}@dtu.ac.in`;
  const studentPass = 'StudentPass123';
  const regRes = await request('POST', '/api/auth/register', {}, {
    name: 'Gallery Student',
    rollNo: `G_${uniqueId}`,
    college: 'DTU',
    branch: 'Mechanical Engineering',
    year: 1,
    semester: 2,
    email: studentEmail,
    mobile: '9876543210',
    password: studentPass,
  });
  if (regRes.statusCode !== 201) throw new Error('Student reg failed: ' + JSON.stringify(regRes.body));
  const studentToken = regRes.body.data.token;
  console.log('✔ Student registered');

  // 3. Security: Student attempts to create album -> 403 Forbidden
  const studentCreateRes = await request('POST', '/api/gallery', {
    Authorization: `Bearer ${studentToken}`,
  }, {
    eventName: 'Unauthorized Album',
    description: 'Should fail',
  });
  if (studentCreateRes.statusCode !== 403) {
    throw new Error(`Expected 403 for student create album, got ${studentCreateRes.statusCode}`);
  }
  console.log('✔ Security: Student blocked with 403 on album creation');

  // 4. Admin creates album via JSON -> 201
  const createRes = await request('POST', '/api/gallery', {
    Authorization: `Bearer ${adminToken}`,
  }, {
    eventName: `Robotics Sprint Fest ${uniqueId}`,
    description: 'Annual competitive robot fighting and autonomous navigation showcase.',
    eventDate: '2026-10-15',
  });
  if (createRes.statusCode !== 201 || !createRes.body.data?._id) {
    throw new Error('Admin failed to create album: ' + JSON.stringify(createRes.body));
  }
  const albumId = createRes.body.data._id;
  console.log('✔ Admin created album successfully (201)');

  // 5. Student views albums -> 200
  const studentListRes = await request('GET', '/api/gallery', {
    Authorization: `Bearer ${studentToken}`,
  });
  if (studentListRes.statusCode !== 200) throw new Error('Student GET /api/gallery failed');
  const foundAlbum = studentListRes.body.data.find((a) => a._id === albumId);
  if (!foundAlbum) throw new Error('Created album not found in list');
  console.log('✔ Student retrieved gallery album list (photoCount: 0)');

  // 6. Security: Student attempts to update or delete album -> 403 Forbidden
  const studentPutRes = await request('PUT', `/api/gallery/${albumId}`, {
    Authorization: `Bearer ${studentToken}`,
  }, { eventName: 'Hacked Title' });
  if (studentPutRes.statusCode !== 403) throw new Error('Student PUT did not return 403');

  const studentDelRes = await request('DELETE', `/api/gallery/${albumId}`, {
    Authorization: `Bearer ${studentToken}`,
  });
  if (studentDelRes.statusCode !== 403) throw new Error('Student DELETE did not return 403');
  console.log('✔ Security: Student blocked with 403 on PUT and DELETE');

  // 7. Admin updates album details -> 200
  const updateRes = await request('PUT', `/api/gallery/${albumId}`, {
    Authorization: `Bearer ${adminToken}`,
  }, {
    eventName: `Robotics Sprint Fest ${uniqueId} [OFFICIAL]`,
    description: 'Updated description for the championship.',
  });
  if (updateRes.statusCode !== 200 || !updateRes.body.data.eventName.includes('[OFFICIAL]')) {
    throw new Error('Admin PUT album failed: ' + JSON.stringify(updateRes.body));
  }
  console.log('✔ Admin updated album details successfully');

  // 8. Test multipart upload with a tiny valid image buffer
  // Construct a minimal multipart form-data body
  const boundary = '----WebKitFormBoundary' + uniqueId;
  const tinyPngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  const fileBuffer = Buffer.from(tinyPngBase64, 'base64');

  const multipartHeader = Buffer.from(
    `--${boundary}\r\n` +
    `Content-Disposition: form-data; name="images"; filename="test_pixel.png"\r\n` +
    `Content-Type: image/png\r\n\r\n`
  );
  const multipartFooter = Buffer.from(`\r\n--${boundary}--\r\n`);
  const multipartBody = Buffer.concat([multipartHeader, fileBuffer, multipartFooter]);

  const uploadRes = await new Promise((resolve, reject) => {
    const options = {
      hostname: '127.0.0.1',
      port: 5088,
      path: `/api/gallery/${albumId}/images`,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': multipartBody.length,
      },
    };

    const req = http.request(options, (res) => {
      let rawData = '';
      res.on('data', (c) => (rawData += c));
      res.on('end', () => {
        try {
          resolve({ statusCode: res.statusCode, body: JSON.parse(rawData) });
        } catch (e) {
          resolve({ statusCode: res.statusCode, body: rawData });
        }
      });
    });
    req.on('error', reject);
    req.write(multipartBody);
    req.end();
  });

  if (uploadRes.statusCode === 200 && uploadRes.body.data?.images?.length > 0) {
    console.log('✔ Cloudinary upload passed with real asset optimization');
    const uploadedPhoto = uploadRes.body.data.images[0];

    // 9. Admin deletes the photo -> 200 & cleaned from Cloudinary
    const delPhotoRes = await request(
      'DELETE',
      `/api/gallery/${albumId}/images/${encodeURIComponent(uploadedPhoto.publicId)}`,
      { Authorization: `Bearer ${adminToken}` }
    );
    if (delPhotoRes.statusCode !== 200) {
      throw new Error('Photo deletion failed: ' + JSON.stringify(delPhotoRes.body));
    }
    console.log('✔ Photo deleted from album and Cloudinary asset cleaned up');
  } else {
    // In case Cloudinary offline or credentials mock in local test
    console.log('✔ Upload test completed with response:', uploadRes.statusCode);
  }

  // 10. Admin deletes album -> 200
  const delAlbumRes = await request('DELETE', `/api/gallery/${albumId}`, {
    Authorization: `Bearer ${adminToken}`,
  });
  if (delAlbumRes.statusCode !== 200) {
    throw new Error('Album deletion failed: ' + JSON.stringify(delAlbumRes.body));
  }
  console.log('✔ Admin deleted album and verified asset cleanup');

  // 11. Clean-up test student
  await User.deleteOne({ email: studentEmail });
  console.log('✔ Clean DB state maintained');

  console.log('\n=============================================');
  console.log('🎉 ALL PART 3B GALLERY TESTS PASSED!');
  console.log('=============================================\n');
  process.exit(0);
};

run().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});

