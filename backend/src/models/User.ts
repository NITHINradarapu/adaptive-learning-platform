import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export enum UserRole {
  STUDENT = 'student',
  INSTRUCTOR = 'instructor',
  ADMIN = 'admin'
}

export enum LearnerBackground {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced'
}

export enum CareerGoal {
  SOFTWARE_DEVELOPER = 'Software Developer',
  DATA_ANALYST = 'Data Analyst',
  TEACHER = 'Teacher',
  WEB_DEVELOPER = 'Web Developer',
  ML_ENGINEER = 'ML Engineer',
  OTHER = 'Other'
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  
  // Learner-specific fields
  learnerBackground?: LearnerBackground;
  careerGoal?: CareerGoal;
  
  // Performance metrics
  averageQuizScore?: number;
  totalCoursesCompleted?: number;
  currentStreak?: number;
  longestStreak?: number;
  
  createdAt: Date;
  updatedAt: Date;
  
  // Methods
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: Object.values(UserRole),
    default: UserRole.STUDENT
  },
  learnerBackground: {
    type: String,
    enum: Object.values(LearnerBackground),
    default: LearnerBackground.BEGINNER
  },
  careerGoal: {
    type: String,
    enum: Object.values(CareerGoal),
    default: CareerGoal.OTHER
  },
  averageQuizScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  totalCoursesCompleted: {
    type: Number,
    default: 0
  },
  currentStreak: {
    type: Number,
    default: 0
  },
  longestStreak: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>('User', userSchema);
