require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/user');

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const adminEmail = 'admin@quiz.com'
    const existingUser = await User.findOne({ email:  adminEmail});

    if (existingUser) {
      console.log('Admin already exists');
      process.exit();
    }

    await User.create({
      email: adminEmail,
      password: '123456',
      role: 'admin'
    });

    console.log('Admin created successfully');
    process.exit();
  } catch (error) {
    console.error('Seed Error:', error);
    process.exit(1);
  }
};

seedAdmin();