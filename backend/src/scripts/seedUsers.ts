import mongoose from 'mongoose';
import User, { UserRole, LearnerBackground, CareerGoal } from '../models/User';
import config from '../config/config';

const demoUsers = [
  {
    name: 'Demo Student',
    email: 'student@test.com',
    password: 'password123',
    role: UserRole.STUDENT,
    learnerBackground: LearnerBackground.BEGINNER,
    careerGoal: CareerGoal.SOFTWARE_DEVELOPER
  },
  {
    name: 'Demo Teacher',
    email: 'teacher@test.com',
    password: 'password123',
    role: UserRole.INSTRUCTOR,
    learnerBackground: LearnerBackground.ADVANCED,
    careerGoal: CareerGoal.TEACHER
  }
];

const seedUsers = async () => {
  try {
    await mongoose.connect(config.mongodbUri);
    console.log('✅ Connected to MongoDB\n');

    for (const userData of demoUsers) {
      const existing = await User.findOne({ email: userData.email });
      if (existing) {
        console.log(`⚠️  User ${userData.email} already exists — skipping`);
        continue;
      }

      const user = new User(userData);
      await user.save();
      console.log(`✅ Created ${userData.role}: ${userData.email} / ${userData.password}`);
    }

    console.log('\n═══════════════════════════════════════════════');
    console.log('🎉 Demo users seeded successfully!');
    console.log('═══════════════════════════════════════════════\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding users:', error);
    process.exit(1);
  }
};

seedUsers();
