const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '../.env') });

const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');

const seedAdmin = async () => {
  try {
    await connectDB();

    const adminEmail = (
      process.env.ADMIN_EMAIL || 'admin@ame.club'
    ).toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';

    const existingAdmin = await User.findOne({
      $or: [{ email: adminEmail }, { role: 'admin' }],
    });

    if (existingAdmin) {
      console.log(
        `Admin already exists (email: ${existingAdmin.email}, role: ${existingAdmin.role}). Skipping seed.`
      );
      await mongoose.connection.close();
      process.exit(0);
    }

    const adminUser = await User.create({
      name: 'AME Administrator',
      rollNo: 'ADMIN001',
      college: 'AME Headquarters',
      branch: 'Mechanical Engineering',
      year: 4,
      semester: 8,
      email: adminEmail,
      mobile: '9876543210',
      password: adminPassword,
      role: 'admin',
    });

    console.log(`Admin user created successfully: ${adminUser.email}`);
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error(`Error seeding admin: ${error.message}`);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
};

seedAdmin();

