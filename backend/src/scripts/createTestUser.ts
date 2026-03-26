import mongoose from 'mongoose';
import User from '../models/User';
import config from '../config/config';

const createTestUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.mongodbUri);
    console.log('Connected to MongoDB');

    const testEmail = 'test@gmail.com';
    const testPassword = 'password123';

    // Check if user already exists
    const existingUser = await User.findOne({ email: testEmail });
    if (existingUser) {
      console.log(`User ${testEmail} already exists. Deleting...`);
      await User.deleteOne({ email: testEmail });
    }

    // Create new test user
    await User.create({
      name: 'Test User',
      email: testEmail,
      password: testPassword,
      role: 'student',
      learnerBackground: 'beginner',
      careerGoal: 'Software Developer'
    });

    console.log('\n✅ Test user created successfully!');
    console.log('━'.repeat(50));
    console.log('📧 Email:', testEmail);
    console.log('🔑 Password:', testPassword);
    console.log('━'.repeat(50));
    console.log('\nYou can now login with these credentials!');

    process.exit(0);
  } catch (error) {
    console.error('Error creating test user:', error);
    process.exit(1);
  }
};

// Run the function
createTestUser();
