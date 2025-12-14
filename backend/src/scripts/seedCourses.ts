import mongoose from 'mongoose';
import Course from '../models/Course';
import User from '../models/User';
import { DifficultyLevel } from '../models/Course';
import config from '../config/config';

const sampleCourses = [
  {
    title: 'JavaScript Fundamentals',
    description: 'Master the basics of JavaScript including variables, functions, arrays, objects, and DOM manipulation. Perfect for beginners starting their web development journey.',
    difficultyLevel: DifficultyLevel.BEGINNER,
    careerGoals: ['Full Stack Developer', 'Frontend Developer', 'Software Engineer'],
    duration: 480,
    thumbnailUrl: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=800',
    tags: ['JavaScript', 'Programming', 'Web Development', 'Frontend'],
    isPublished: true,
    totalModules: 8,
    totalVideos: 32
  },
  {
    title: 'React.js Complete Guide',
    description: 'Build modern, interactive user interfaces with React. Learn components, hooks, state management, routing, and best practices for building scalable applications.',
    difficultyLevel: DifficultyLevel.INTERMEDIATE,
    careerGoals: ['Frontend Developer', 'Full Stack Developer', 'UI/UX Developer'],
    duration: 720,
    thumbnailUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
    tags: ['React', 'JavaScript', 'Frontend', 'Web Development', 'Hooks'],
    isPublished: true,
    totalModules: 12,
    totalVideos: 48
  },
  {
    title: 'Node.js Backend Development',
    description: 'Create robust server-side applications with Node.js and Express. Cover REST APIs, authentication, databases, security, and deployment strategies.',
    difficultyLevel: DifficultyLevel.INTERMEDIATE,
    careerGoals: ['Backend Developer', 'Full Stack Developer', 'Software Engineer'],
    duration: 600,
    thumbnailUrl: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800',
    tags: ['Node.js', 'Express', 'Backend', 'API', 'JavaScript'],
    isPublished: true,
    totalModules: 10,
    totalVideos: 40
  },
  {
    title: 'Python for Data Science',
    description: 'Learn Python programming with focus on data analysis, visualization, and machine learning. Use pandas, NumPy, matplotlib, and scikit-learn.',
    difficultyLevel: DifficultyLevel.BEGINNER,
    careerGoals: ['Data Scientist', 'Machine Learning Engineer', 'Data Analyst'],
    duration: 540,
    thumbnailUrl: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800',
    tags: ['Python', 'Data Science', 'Machine Learning', 'Analytics'],
    isPublished: true,
    totalModules: 9,
    totalVideos: 36
  },
  {
    title: 'Machine Learning Masterclass',
    description: 'Deep dive into machine learning algorithms, neural networks, and deep learning. Build real-world ML models and deploy them to production.',
    difficultyLevel: DifficultyLevel.ADVANCED,
    careerGoals: ['Machine Learning Engineer', 'Data Scientist', 'AI Researcher'],
    duration: 900,
    thumbnailUrl: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800',
    tags: ['Machine Learning', 'AI', 'Deep Learning', 'Python', 'Neural Networks'],
    isPublished: true,
    totalModules: 15,
    totalVideos: 60
  },
  {
    title: 'DevOps & CI/CD Pipeline',
    description: 'Master DevOps practices including Docker, Kubernetes, Jenkins, and cloud deployment. Automate your development and deployment workflows.',
    difficultyLevel: DifficultyLevel.ADVANCED,
    careerGoals: ['DevOps Engineer', 'Cloud Engineer', 'Software Engineer'],
    duration: 660,
    thumbnailUrl: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800',
    tags: ['DevOps', 'Docker', 'Kubernetes', 'CI/CD', 'Cloud'],
    isPublished: true,
    totalModules: 11,
    totalVideos: 44
  },
  {
    title: 'Mobile App Development with React Native',
    description: 'Build cross-platform mobile applications for iOS and Android using React Native. Learn navigation, state management, and native features.',
    difficultyLevel: DifficultyLevel.INTERMEDIATE,
    careerGoals: ['Mobile Developer', 'Full Stack Developer', 'Frontend Developer'],
    duration: 720,
    thumbnailUrl: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800',
    tags: ['React Native', 'Mobile Development', 'iOS', 'Android', 'JavaScript'],
    isPublished: true,
    totalModules: 12,
    totalVideos: 48
  },
  {
    title: 'Cybersecurity Fundamentals',
    description: 'Understand security principles, ethical hacking, network security, and how to protect systems from cyber threats. Perfect for aspiring security professionals.',
    difficultyLevel: DifficultyLevel.INTERMEDIATE,
    careerGoals: ['Cybersecurity Specialist', 'Security Analyst', 'Network Engineer'],
    duration: 600,
    thumbnailUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800',
    tags: ['Cybersecurity', 'Ethical Hacking', 'Network Security', 'Security'],
    isPublished: true,
    totalModules: 10,
    totalVideos: 40
  },
  {
    title: 'UI/UX Design Principles',
    description: 'Create beautiful, user-friendly interfaces. Learn design thinking, user research, prototyping with Figma, and modern UI/UX best practices.',
    difficultyLevel: DifficultyLevel.BEGINNER,
    careerGoals: ['UI/UX Developer', 'Product Designer', 'Frontend Developer'],
    duration: 480,
    thumbnailUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800',
    tags: ['UI/UX', 'Design', 'Figma', 'Prototyping', 'User Experience'],
    isPublished: true,
    totalModules: 8,
    totalVideos: 32
  },
  {
    title: 'AWS Cloud Architecture',
    description: 'Master Amazon Web Services including EC2, S3, Lambda, RDS, and CloudFormation. Build scalable, secure cloud infrastructure.',
    difficultyLevel: DifficultyLevel.ADVANCED,
    careerGoals: ['Cloud Engineer', 'DevOps Engineer', 'Solutions Architect'],
    duration: 780,
    thumbnailUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800',
    tags: ['AWS', 'Cloud Computing', 'Infrastructure', 'DevOps'],
    isPublished: true,
    totalModules: 13,
    totalVideos: 52
  },
  {
    title: 'Database Design & SQL Mastery',
    description: 'Learn relational database design, SQL querying, optimization, and database administration. Cover PostgreSQL, MySQL, and database best practices.',
    difficultyLevel: DifficultyLevel.BEGINNER,
    careerGoals: ['Database Administrator', 'Backend Developer', 'Data Engineer'],
    duration: 540,
    thumbnailUrl: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800',
    tags: ['SQL', 'Database', 'PostgreSQL', 'MySQL', 'Data Modeling'],
    isPublished: true,
    totalModules: 9,
    totalVideos: 36
  },
  {
    title: 'Blockchain & Smart Contracts',
    description: 'Understand blockchain technology and develop smart contracts with Solidity. Build decentralized applications (DApps) on Ethereum.',
    difficultyLevel: DifficultyLevel.ADVANCED,
    careerGoals: ['Blockchain Developer', 'Software Engineer', 'Cryptocurrency Specialist'],
    duration: 720,
    thumbnailUrl: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800',
    tags: ['Blockchain', 'Ethereum', 'Solidity', 'Smart Contracts', 'Web3'],
    isPublished: true,
    totalModules: 12,
    totalVideos: 48
  }
];

const seedCourses = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.mongodbUri);
    console.log('✅ Connected to MongoDB\n');

    // Get the first user to use as instructor
    const user = await User.findOne();
    if (!user) {
      console.error('❌ No users found. Please create a user first using:');
      console.error('   npm run create:user');
      process.exit(1);
    }

    console.log(`📧 Using ${user.name} (${user.email}) as instructor\n`);

    // Clear existing courses (optional - comment out if you want to keep existing courses)
    // await Course.deleteMany({});
    // console.log('Cleared existing courses');

    // Insert sample courses
    const coursesWithInstructor = sampleCourses.map(course => ({
      ...course,
      instructor: user._id
    }));

    const createdCourses = await Course.insertMany(coursesWithInstructor);
    
    console.log('═══════════════════════════════════════════════');
    console.log(`✅ Successfully created ${createdCourses.length} sample courses!`);
    console.log('═══════════════════════════════════════════════\n');

    // Display created courses with categories
    const byDifficulty = {
      beginner: createdCourses.filter(c => c.difficultyLevel === 'beginner'),
      intermediate: createdCourses.filter(c => c.difficultyLevel === 'intermediate'),
      advanced: createdCourses.filter(c => c.difficultyLevel === 'advanced')
    };

    console.log('📚 BEGINNER COURSES:');
    byDifficulty.beginner.forEach((course, index) => {
      console.log(`   ${index + 1}. ${course.title} (${course.duration} min)`);
    });

    console.log('\n📘 INTERMEDIATE COURSES:');
    byDifficulty.intermediate.forEach((course, index) => {
      console.log(`   ${index + 1}. ${course.title} (${course.duration} min)`);
    });

    console.log('\n📕 ADVANCED COURSES:');
    byDifficulty.advanced.forEach((course, index) => {
      console.log(`   ${index + 1}. ${course.title} (${course.duration} min)`);
    });

    console.log('\n═══════════════════════════════════════════════');
    console.log('🎉 All courses created successfully!');
    console.log('🚀 Start the frontend and login to see them!');
    console.log('═══════════════════════════════════════════════\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding courses:', error);
    process.exit(1);
  }
};

// Run the seed function
seedCourses();
