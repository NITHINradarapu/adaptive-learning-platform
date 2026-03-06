# 📘 Adaptive Lifelong Learning Platform - Complete Project Overview

> A comprehensive reference document for understanding and extracting any information about your learning management system.

---

## 📋 Table of Contents
1. [Project Summary](#project-summary)
2. [Tech Stack](#tech-stack)
3. [Architecture Overview](#architecture-overview)
4. [Database Schema](#database-schema)
5. [API Endpoints](#api-endpoints)
6. [Frontend Structure](#frontend-structure)
7. [Backend Structure](#backend-structure)
8. [Key Features](#key-features)
9. [User Roles & Portals](#user-roles--portals)
10. [Authentication Flow](#authentication-flow)
11. [Learning Progress Tracking](#learning-progress-tracking)
12. [Adaptive Learning Engine](#adaptive-learning-engine)
13. [Interactive Video System](#interactive-video-system)
14. [Attendance & Streak System](#attendance--streak-system)
15. [Scripts & Testing](#scripts--testing)
16. [Environment Setup](#environment-setup)
17. [File Structure](#file-structure)

---

## 🎯 Project Summary

### What It Is
An **AI-driven e-learning platform** that promotes lifelong learning through:
- Personalized adaptive learning paths
- Interactive in-video engagement with checkpoints
- Comprehensive course management (CRUD)
- Dual portal system (Teacher & Learner)
- Attendance tracking with streak system

### Core Purpose
Enable students to learn at their own pace with AI-driven personalization while giving instructors powerful tools to create engaging content with interactive video questions.

### Target Users
- **Students/Learners**: Seeking personalized, engaging online education
- **Instructors/Teachers**: Creating and managing courses with interactive content
- **Admins**: Overseeing platform operations and content

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.2.0 | UI framework |
| **TypeScript** | 4.9.5 | Type safety |
| **React Router DOM** | 6.20.1 | Client-side routing |
| **Zustand** | 4.4.7 | State management |
| **Axios** | 1.6.2 | HTTP client |
| **React Icons** | 4.12.0 | Icon library |
| **date-fns** | 3.0.6 | Date utilities |
| **recharts** | 2.10.3 | Data visualization |
| **@tanstack/react-query** | 5.14.2 | Server state management |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | - | Runtime environment |
| **Express** | 4.18.2 | Web framework |
| **TypeScript** | 5.3.3 | Type safety |
| **MongoDB** | 8.0.3 | NoSQL database |
| **Mongoose** | 8.0.3 | ODM for MongoDB |
| **Passport.js** | 0.7.0 | Authentication |
| **JWT** | 9.0.2 | Token-based auth |
| **bcryptjs** | 2.4.3 | Password hashing |
| **helmet** | 7.1.0 | Security middleware |
| **cors** | 2.8.5 | Cross-origin requests |

---

## 🏗️ Architecture Overview

### System Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND                             │
│  React + TypeScript + Zustand + React Router                │
│                                                               │
│  ┌───────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐   │
│  │  Learner  │  │ Teacher  │  │  Admin   │  │ Profile │   │
│  │ Dashboard │  │Dashboard │  │ Dashboard│  │  Page   │   │
│  └───────────┘  └──────────┘  └──────────┘  └─────────┘   │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │           Video Player with Quiz Overlay              │  │
│  │     (Interactive checkpoints at timestamps)           │  │
│  └───────────────────────────────────────────────────────┘  │
└────────────────────┬────────────────────────────────────────┘
                     │ REST API (Axios)
                     │ JWT Authentication
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                         BACKEND                              │
│           Express + TypeScript + Passport.js                 │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Controllers  │  │  Middleware  │  │   Services   │      │
│  │ (Business    │  │  (Auth, JWT, │  │  (Adaptive   │      │
│  │  Logic)      │  │   Errors)    │  │   Learning)  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                    API Routes                         │   │
│  │  /api/auth  /api/courses  /api/modules  /api/videos │   │
│  │  /api/progress  /api/attendance                      │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────┬────────────────────────────────────────┘
                     │ Mongoose ODM
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                       MongoDB Database                       │
│                                                               │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌──────────────┐         │
│  │ Users  │ │Courses │ │Modules │ │    Videos    │         │
│  └────────┘ └────────┘ └────────┘ └──────────────┘         │
│                                                               │
│  ┌─────────────┐ ┌──────────┐ ┌────────────────┐           │
│  │  Progress   │ │Attendance│ │ Interactive    │           │
│  │   Tracking  │ │& Streaks │ │   Questions    │           │
│  └─────────────┘ └──────────┘ └────────────────┘           │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Database Schema

### Collections Overview
**9 MongoDB Collections** working together:

#### 1. **User** Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  role: "student" | "instructor" | "admin",
  learnerBackground: "beginner" | "intermediate" | "advanced",
  careerGoal: String,
  averageQuizScore: Number,
  totalCoursesCompleted: Number,
  currentStreak: Number,
  longestStreak: Number,
  createdAt: Date,
  updatedAt: Date
}
```

#### 2. **Course** Collection
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  instructor: ObjectId (ref: User),
  difficultyLevel: "beginner" | "intermediate" | "advanced",
  careerGoals: [String],
  thumbnailUrl: String,
  duration: Number (minutes),
  totalModules: Number,
  totalVideos: Number,
  enrolledStudents: Number,
  averageRating: Number (0-5),
  tags: [String],
  prerequisites: [String],
  isPublished: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

#### 3. **Module** Collection
```javascript
{
  _id: ObjectId,
  course: ObjectId (ref: Course),
  title: String,
  description: String,
  order: Number (unique with course),
  difficultyLevel: String,
  isLocked: Boolean,
  prerequisites: [ObjectId] (ref: Module),
  estimatedTime: Number (minutes),
  createdAt: Date,
  updatedAt: Date
}
```

#### 4. **Video** Collection
```javascript
{
  _id: ObjectId,
  module: ObjectId (ref: Module),
  course: ObjectId (ref: Course),
  title: String,
  description: String,
  videoUrl: String,
  thumbnailUrl: String,
  duration: Number (seconds),
  order: Number (unique with module),
  hasInteractiveQuestions: Boolean,
  requiredCheckpoints: Number,
  viewCount: Number,
  createdAt: Date,
  updatedAt: Date
}
```

#### 5. **InteractiveQuestion** Collection
```javascript
{
  _id: ObjectId,
  video: ObjectId (ref: Video),
  questionType: "mcq" | "fill-in-blank" | "short-answer",
  question: String,
  timestamp: Number (seconds),
  options: [{text: String, isCorrect: Boolean}],
  correctAnswer: String,
  acceptableAnswers: [String],
  hint: String,
  explanation: String,
  timeLimit: Number (seconds),
  maxRetries: Number,
  isRequired: Boolean,
  points: Number,
  order: Number,
  createdAt: Date,
  updatedAt: Date
}
```

#### 6. **CheckpointResponse** Collection
```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: User),
  video: ObjectId (ref: Video),
  question: ObjectId (ref: InteractiveQuestion),
  userAnswer: String,
  isCorrect: Boolean,
  attemptNumber: Number,
  timeSpent: Number (seconds),
  hintUsed: Boolean,
  pointsEarned: Number,
  answeredAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

#### 7. **LearningProgress** Collection
```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: User),
  course: ObjectId (ref: Course),
  enrolledAt: Date,
  status: "not-started" | "in-progress" | "completed" | "needs-revision",
  overallProgress: Number (0-100%),
  modulesProgress: [{
    module: ObjectId,
    status: String,
    videosCompleted: Number,
    totalVideos: Number,
    quizScore: Number,
    completedAt: Date
  }],
  videosProgress: [{
    video: ObjectId,
    watchedDuration: Number,
    totalDuration: Number,
    completed: Boolean,
    checkpointsCompleted: Number,
    totalCheckpoints: Number,
    lastWatchedAt: Date
  }],
  totalQuizzesTaken: Number,
  averageQuizScore: Number,
  totalTimeSpent: Number (minutes),
  totalCheckpointsCompleted: Number,
  performanceLevel: "struggling" | "average" | "excellent",
  recommendedPace: "slow" | "normal" | "fast",
  weakAreas: [String],
  strongAreas: [String],
  lastActivityDate: Date,
  totalDaysActive: Number,
  createdAt: Date,
  updatedAt: Date
}
```

#### 8. **Attendance** Collection
```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: User),
  date: Date (unique with user),
  checkpointsCompleted: Number,
  videosWatched: Number,
  totalTimeSpent: Number (minutes),
  coursesAccessed: [ObjectId] (ref: Course),
  isMarked: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

#### 9. **Streak** Collection
```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: User, unique),
  currentStreak: Number,
  longestStreak: Number,
  lastActivityDate: Date,
  streakStartDate: Date,
  totalActiveDays: Number,
  streakHistory: [{
    startDate: Date,
    endDate: Date,
    length: Number
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### Database Relationships
```
User (1) ─────── (Many) Course [as instructor]
User (1) ─────── (Many) LearningProgress
User (1) ─────── (Many) Attendance
User (1) ─────── (Many) CheckpointResponse
User (1) ─────── (1) Streak

Course (1) ───── (Many) Module
Course (1) ───── (Many) Video
Course (1) ───── (Many) LearningProgress

Module (1) ───── (Many) Video
Module (Many) ── (Many) Module [prerequisites]

Video (1) ────── (Many) InteractiveQuestion
Video (1) ────── (Many) CheckpointResponse

InteractiveQuestion (1) ─ (Many) CheckpointResponse
```

---

## 🔌 API Endpoints

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/register` | Register new user | No |
| POST | `/login` | Login user | No |
| GET | `/me` | Get current user | Yes |
| PUT | `/profile` | Update user profile | Yes |
| POST | `/logout` | Logout user | Yes |

### Courses (`/api/courses`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get all courses | No |
| GET | `/:id` | Get course by ID | No |
| POST | `/` | Create course | Yes (Instructor) |
| PUT | `/:id` | Update course | Yes (Instructor) |
| DELETE | `/:id` | Delete course | Yes (Instructor) |
| POST | `/:id/enroll` | Enroll in course | Yes |
| GET | `/instructor/courses` | Get instructor's courses | Yes (Instructor) |
| POST | `/:id/rate` | Rate a course | Yes |

### Modules (`/api/modules`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/course/:courseId` | Get course modules | No |
| GET | `/:id` | Get module by ID | No |
| POST | `/` | Create module | Yes (Instructor) |
| PUT | `/:id` | Update module | Yes (Instructor) |
| DELETE | `/:id` | Delete module | Yes (Instructor) |

### Videos (`/api/videos`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/module/:moduleId` | Get module videos | No |
| GET | `/:id` | Get video by ID | No |
| POST | `/` | Create video | Yes (Instructor) |
| PUT | `/:id` | Update video | Yes (Instructor) |
| DELETE | `/:id` | Delete video | Yes (Instructor) |
| GET | `/:id/questions` | Get video questions | No |
| POST | `/:id/questions` | Create question | Yes (Instructor) |
| POST | `/:id/checkpoint` | Submit checkpoint | Yes |

### Progress (`/api/progress`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/user/:userId` | Get user progress | Yes |
| GET | `/course/:courseId` | Get course progress | Yes |
| POST | `/enroll` | Enroll in course | Yes |
| PUT | `/video/:videoId` | Update video progress | Yes |
| GET | `/recommendations` | Get recommendations | Yes |

### Attendance (`/api/attendance`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/user/:userId` | Get attendance | Yes |
| POST | `/mark` | Mark attendance | Yes |
| GET | `/streak/:userId` | Get streak | Yes |
| PUT | `/streak/:userId` | Update streak | Yes |

---

## 🎨 Frontend Structure

### Pages

#### 1. **Home Page** (`/`)
- Landing page with platform introduction
- Demo credentials display
- Navigation to login/register

#### 2. **Authentication Pages**
- **Login** (`/login`): User authentication with Passport.js
- **Register** (`/register`): New user registration

#### 3. **Learner Dashboard** (`/learner/dashboard`)
**Access**: Students only
- Statistics cards (streaks, progress, quiz scores)
- Enrolled courses with progress bars
- AI-powered course recommendations
- All available courses
- Search and filter functionality

#### 4. **Teacher Dashboard** (`/teacher/dashboard`)
**Access**: Instructors/Admins only
- Total courses created
- Total students enrolled
- Average course rating
- Revenue tracking
- Quick actions (Create/Manage courses)
- Course table with actions

#### 5. **Course Management Pages**
- **ManageCourses** (`/teacher/courses`): View all instructor courses
- **AdminCourses** (`/admin/courses`): Create new courses
- **EditCourse** (`/admin/courses/:id/edit`): Edit course details

#### 6. **Module Management Pages**
- **ManageModules** (`/teacher/course/:courseId/modules`): Module CRUD
- **EditModule** (`/teacher/module/:moduleId/edit`): Edit module

#### 7. **Question Management**
- **ManageQuestions** (`/teacher/video/:videoId/questions`): Interactive question CRUD

#### 8. **Course Detail** (`/course/:id`)
- Course information
- Modules and videos list
- Enrollment option
- Rating system

#### 9. **Video Player** (`/video/:videoId`)
- Full-screen video playback
- Interactive checkpoint overlays
- Auto-save progress (every 30s)
- Quiz overlay component

#### 10. **Profile Page** (`/profile`)
- Edit name, learner background, career goals
- Change password
- Update preferences

#### 11. **Attendance Page** (`/attendance`)
- Calendar view of attendance
- Streak information
- Daily engagement metrics

### Components

#### **Navbar** (`components/Navbar`)
- Role-based navigation
- Learner: Dashboard, My Courses, Profile
- Teacher: Dashboard, Manage Courses, Create Course, Profile
- Logout functionality

#### **VideoPlayer** (`components/VideoPlayer`)
- Video playback controls
- Progress tracking
- Checkpoint triggering

#### **QuizOverlay** (`components/VideoPlayer/QuizOverlay`)
- MCQ questions
- Fill-in-blank questions
- Short answer questions
- Hint system
- Retry logic
- Timer display

### State Management (Zustand)

**Auth Store** (`store/authStore.ts`)
```typescript
interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  initialize: () => void;
}
```

### API Service Layer (`services/api.ts`)
- Axios instance with base URL
- Request/response interceptors
- Automatic token injection
- Error handling

---

## ⚙️ Backend Structure

### Controllers

#### **authController.ts**
- `register`: Create new user with password hashing
- `login`: Authenticate with Passport local strategy
- `getMe`: Get current user info
- `updateProfile`: Update user details and password
- `logout`: Clear session

#### **courseController.ts**
- `createCourse`: Create course (instructor only)
- `getAllCourses`: Get all published courses
- `getCourseById`: Get course details
- `updateCourse`: Update course (instructor only)
- `deleteCourse`: Delete course and progress data
- `getInstructorCourses`: Get courses by instructor
- `rateCourse`: Submit/update course rating

#### **moduleController.ts**
- `createModule`: Create module
- `getModulesByCourse`: Get all course modules
- `getModuleById`: Get single module
- `updateModule`: Update module
- `deleteModule`: Delete module

#### **videoController.ts**
- `createVideo`: Create video
- `getVideosByModule`: Get module videos
- `getVideoById`: Get video details
- `updateVideo`: Update video
- `deleteVideo`: Delete video
- `createQuestion`: Create interactive question
- `getQuestions`: Get video questions
- `submitCheckpoint`: Submit checkpoint answer

#### **progressController.ts**
- `enrollInCourse`: Create learning progress
- `getUserProgress`: Get user's all progress
- `getCourseProgress`: Get specific course progress
- `updateVideoProgress`: Update video watch time
- `getRecommendations`: AI-powered recommendations

#### **attendanceController.ts**
- `getUserAttendance`: Get attendance records
- `markAttendance`: Mark daily attendance
- `getStreak`: Get user's streak
- `updateStreak`: Update streak data

### Middleware

#### **auth.ts** (JWT Authentication)
```typescript
// Passport JWT strategy
passport.use('jwt', new JwtStrategy({...}, verify));

// Middleware
export const authenticateJWT = passport.authenticate('jwt', { session: false });

// Role-based authorization
export const authorizeRoles = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  };
};
```

#### **errorHandler.ts**
- `notFound`: 404 handler
- `errorHandler`: Global error handler

### Services

#### **adaptiveLearningService.ts**
Personalized course recommendations based on:
- Learner background (beginner/intermediate/advanced)
- Career goals
- Quiz performance
- Completion rates
- Difficulty progression

**Algorithm**:
1. Filter by career goals
2. Match difficulty level to performance
3. Exclude completed courses
4. Score based on fit
5. Return top 5 recommendations

### Configuration

#### **config.ts**
Environment variables management:
```typescript
{
  port: number,
  mongoUri: string,
  jwtSecret: string,
  jwtExpire: string,
  nodeEnv: string
}
```

#### **database.ts**
MongoDB connection with Mongoose:
- Retry logic
- Connection pooling
- Error handling

#### **passport.ts**
Passport strategies:
- `local-register`: Registration with validation
- `local-login`: Login with password check
- `jwt`: Token verification

### Models (Mongoose Schemas)

All 9 collections defined with:
- Schema validation
- Virtual fields
- Indexes for performance
- Timestamps (createdAt, updatedAt)
- Pre/post hooks

---

## ✨ Key Features

### 1. Adaptive Learning Engine
**How It Works**:
1. User sets learner background and career goal
2. System tracks quiz scores and completion time
3. Algorithm adjusts recommendations:
   - Low scores → easier content
   - High scores → harder content
   - Weak areas → targeted content

**Data Used**:
- `learnerBackground`: beginner/intermediate/advanced
- `careerGoal`: Software Developer, Data Analyst, etc.
- `averageQuizScore`: 0-100
- `performanceLevel`: struggling/average/excellent

### 2. Interactive In-Video Checkpoints
**Process**:
1. Instructor creates questions at specific timestamps
2. Video plays until checkpoint time
3. Video pauses, quiz overlay appears
4. Student must answer to continue
5. Answer submitted → attendance marked
6. Feedback shown (correct/incorrect)
7. Video resumes

**Question Types**:
- **MCQ**: Multiple choice with 2-6 options
- **Fill-in-blank**: Type the missing word
- **Short answer**: Open-ended response

**Features**:
- Time limits
- Retry options
- Hints available
- Points system
- Explanations on completion

### 3. Attendance & Streak System
**Attendance Rules**:
- Marked when answering checkpoint questions
- One record per day per user
- Tracks: videos watched, checkpoints completed, time spent

**Streak Calculation**:
- Increments on consecutive days
- Resets if day missed
- Longest streak recorded
- History maintained

**Benefits**:
- Gamification
- Student engagement
- Consistency tracking

### 4. Dual Portal System
**Two Separate Experiences**:

**Learner Portal**:
- Focus on learning
- Course discovery
- Progress tracking
- Personal stats

**Teacher Portal**:
- Content creation
- Course management
- Student analytics
- Revenue tracking

**Automatic Routing**:
```typescript
// Login redirect logic
if (user.role === 'student') navigate('/learner/dashboard');
if (user.role === 'instructor') navigate('/teacher/dashboard');
```

### 5. Progress Tracking
**Granular Tracking**:
- Course level: Overall progress %
- Module level: Videos completed, quiz scores
- Video level: Watch duration, checkpoints

**Auto-save**:
- Every 30 seconds during video playback
- On checkpoint submission
- On video completion

**Analytics**:
- Total learning time
- Average quiz score
- Completion rates
- Weak/strong areas

### 6. Course Rating System
- 1-5 star rating
- Average calculated automatically
- Only enrolled students can rate
- Update rating anytime
- Displayed in course cards

---

## 🔐 User Roles & Portals

### Roles

#### **Student**
**Permissions**:
- ✅ View courses
- ✅ Enroll in courses
- ✅ Watch videos
- ✅ Answer checkpoints
- ✅ Track progress
- ✅ Rate courses
- ❌ Create courses
- ❌ Manage content

**Dashboard**: `/learner/dashboard`

#### **Instructor**
**Permissions**:
- ✅ All student permissions
- ✅ Create courses
- ✅ Edit own courses
- ✅ Delete own courses
- ✅ Create modules/videos
- ✅ Create questions
- ✅ View student analytics
- ❌ Manage other instructors' content

**Dashboard**: `/teacher/dashboard`

#### **Admin**
**Permissions**:
- ✅ All instructor permissions
- ✅ Manage all courses
- ✅ Manage all users
- ✅ Platform analytics
- ✅ System configuration

**Dashboard**: `/teacher/dashboard` (same as instructor)

### Portal Comparison

| Feature | Learner Portal | Teacher Portal |
|---------|----------------|----------------|
| **Primary Focus** | Learning & Discovery | Content Creation |
| **Navigation** | Dashboard, My Courses | Dashboard, Manage Courses, Create |
| **Statistics** | Streaks, Progress, Scores | Total Courses, Students, Ratings |
| **Main Actions** | Enroll, Watch, Answer | Create, Edit, Delete |
| **Course View** | Cards with progress | Table with analytics |
| **Video Access** | Watch only | Watch + Manage Questions |

---

## 🔒 Authentication Flow

### Registration
```
1. User fills form (name, email, password, role, background, career goal)
2. Frontend → POST /api/auth/register
3. Backend validates data
4. Passport 'local-register' strategy
5. Password hashed with bcrypt (10 rounds)
6. User saved to MongoDB
7. JWT token generated
8. Response: { user, token }
9. Frontend stores in localStorage and Zustand
10. Redirect to appropriate dashboard
```

### Login
```
1. User enters email + password
2. Frontend → POST /api/auth/login
3. Passport 'local-login' strategy
4. Find user by email
5. bcrypt.compare(password, hashedPassword)
6. If valid → JWT token generated
7. Response: { user, token }
8. Frontend stores in localStorage
9. Redirect based on role:
   - Student → /learner/dashboard
   - Instructor → /teacher/dashboard
```

### JWT Token Structure
```typescript
{
  id: user._id,
  email: user.email,
  role: user.role,
  iat: issuedAt,
  exp: expiresAt
}
```

### Protected Routes
**Frontend** (React Router):
```tsx
<PrivateRoute>
  <LearnerDashboard />
</PrivateRoute>

<TeacherRoute> {/* Instructor/Admin only */}
  <ManageCourses />
</TeacherRoute>
```

**Backend** (Middleware):
```typescript
router.post('/courses', 
  authenticateJWT, 
  authorizeRoles('instructor', 'admin'), 
  createCourse
);
```

### Token Storage
- **localStorage**: `token` and `user` object
- **Zustand store**: In-memory state
- **Axios headers**: `Authorization: Bearer <token>`

### Logout
1. Clear localStorage
2. Clear Zustand store
3. Redirect to home page

---

## 📈 Learning Progress Tracking

### Progress Data Structure
```typescript
{
  user: ObjectId,
  course: ObjectId,
  enrolledAt: Date,
  status: "in-progress",
  overallProgress: 45, // %
  
  modulesProgress: [
    {
      module: ObjectId,
      status: "completed",
      videosCompleted: 5,
      totalVideos: 5,
      quizScore: 85,
      completedAt: Date
    },
    {
      module: ObjectId,
      status: "in-progress",
      videosCompleted: 2,
      totalVideos: 4,
      quizScore: 70
    }
  ],
  
  videosProgress: [
    {
      video: ObjectId,
      watchedDuration: 120, // seconds
      totalDuration: 300,
      completed: false,
      checkpointsCompleted: 1,
      totalCheckpoints: 3,
      lastWatchedAt: Date
    }
  ],
  
  totalQuizzesTaken: 8,
  averageQuizScore: 78,
  totalTimeSpent: 245, // minutes
  performanceLevel: "average",
  recommendedPace: "normal",
  weakAreas: ["Arrays", "Loops"],
  strongAreas: ["Variables", "Functions"]
}
```

### Progress Update Flow

#### On Video Watch
```
1. Video player plays → timer starts
2. Every 30 seconds → auto-save
3. PUT /api/progress/video/:videoId
4. Update watchedDuration
5. If watchedDuration >= 90% of totalDuration → mark completed
```

#### On Checkpoint Answer
```
1. User submits answer
2. POST /api/videos/:videoId/checkpoint
3. Save CheckpointResponse
4. Update videosProgress.checkpointsCompleted
5. If all checkpoints done → update video completion
6. Update Attendance (isMarked = true)
7. Update Streak
```

#### Progress Calculation
```typescript
// Course overall progress
overallProgress = (completedVideos / totalVideos) * 100;

// Module progress
moduleProgress = (videosCompleted / totalVideos) * 100;

// Video completion
videoCompleted = watchedDuration >= (totalDuration * 0.9);
```

---

## 🤖 Adaptive Learning Engine

### Algorithm Overview
```typescript
async function getRecommendations(userId: string) {
  // 1. Get user profile
  const user = await User.findById(userId);
  
  // 2. Get user's progress (completed courses)
  const progress = await LearningProgress.find({ 
    user: userId, 
    status: 'completed' 
  });
  
  // 3. Filter courses
  let courses = await Course.find({
    isPublished: true,
    _id: { $nin: completedCourseIds }
  });
  
  // 4. Score each course
  courses = courses.map(course => {
    let score = 0;
    
    // Career goal match (+30 points)
    if (course.careerGoals.includes(user.careerGoal)) {
      score += 30;
    }
    
    // Difficulty match (+25 points)
    if (matchesDifficultyLevel(user, course)) {
      score += 25;
    }
    
    // Performance-based (+20 points)
    if (user.averageQuizScore >= 80 && course.difficulty === 'advanced') {
      score += 20;
    }
    
    // Course rating (+15 points)
    score += course.averageRating * 3;
    
    // Enrollment popularity (+10 points)
    score += Math.min(course.enrolledStudents / 100, 10);
    
    return { ...course, recommendationScore: score };
  });
  
  // 5. Sort by score and return top 5
  return courses
    .sort((a, b) => b.recommendationScore - a.recommendationScore)
    .slice(0, 5);
}
```

### Difficulty Matching Logic
```typescript
function matchesDifficultyLevel(user, course) {
  const { learnerBackground, averageQuizScore } = user;
  const { difficultyLevel } = course;
  
  // Beginner learner
  if (learnerBackground === 'beginner') {
    if (averageQuizScore >= 80) return difficultyLevel === 'intermediate';
    return difficultyLevel === 'beginner';
  }
  
  // Intermediate learner
  if (learnerBackground === 'intermediate') {
    if (averageQuizScore >= 85) return difficultyLevel === 'advanced';
    if (averageQuizScore < 60) return difficultyLevel === 'beginner';
    return difficultyLevel === 'intermediate';
  }
  
  // Advanced learner
  if (learnerBackground === 'advanced') {
    if (averageQuizScore < 70) return difficultyLevel === 'intermediate';
    return difficultyLevel === 'advanced';
  }
}
```

### Performance Level Calculation
```typescript
function calculatePerformanceLevel(progress) {
  const { averageQuizScore, totalQuizzesTaken } = progress;
  
  if (totalQuizzesTaken < 3) return 'average'; // Not enough data
  
  if (averageQuizScore >= 80) return 'excellent';
  if (averageQuizScore >= 60) return 'average';
  return 'struggling';
}
```

---

## 🎬 Interactive Video System

### Video Player Features
- HTML5 video player
- Custom controls
- Progress bar
- Play/pause
- Volume control
- Fullscreen mode
- Auto-save progress (every 30s)

### Checkpoint System

#### Creating Checkpoints (Instructor)
```typescript
// Navigate to: /teacher/video/:videoId/questions
interface InteractiveQuestion {
  questionType: 'mcq' | 'fill-in-blank' | 'short-answer',
  question: string,
  timestamp: number, // e.g., 150 (2:30 into video)
  
  // For MCQ
  options: [
    { text: 'Option A', isCorrect: false },
    { text: 'Option B', isCorrect: true },
    { text: 'Option C', isCorrect: false }
  ],
  
  // For fill-in-blank / short-answer
  correctAnswer: string,
  acceptableAnswers: string[],
  
  hint: string,
  explanation: string,
  timeLimit: 60, // seconds
  maxRetries: 2,
  isRequired: true,
  points: 10
}
```

#### Watching with Checkpoints (Student)
```typescript
// Video playback logic
const checkpointTimes = questions.map(q => q.timestamp);

videoRef.current.ontimeupdate = () => {
  const currentTime = videoRef.current.currentTime;
  
  // Check if we hit a checkpoint
  const checkpoint = questions.find(q => 
    Math.abs(q.timestamp - currentTime) < 0.5 && 
    !answeredQuestions.includes(q._id)
  );
  
  if (checkpoint) {
    // Pause video
    videoRef.current.pause();
    
    // Show quiz overlay
    setCurrentQuestion(checkpoint);
    setShowQuiz(true);
    
    // Start timer
    startTimer(checkpoint.timeLimit);
  }
};
```

#### Quiz Overlay Component
```tsx
<QuizOverlay
  question={currentQuestion}
  onSubmit={handleSubmitAnswer}
  onClose={handleCloseQuiz}
  timeLimit={currentQuestion.timeLimit}
/>

// Features:
// - Question display
// - Answer input (MCQ radio, text input)
// - Timer countdown
// - Hint button
// - Submit button
// - Retry logic
// - Feedback display
```

#### Answer Submission
```typescript
async function submitAnswer(videoId, questionId, answer) {
  // 1. Submit to backend
  const response = await api.post(`/videos/${videoId}/checkpoint`, {
    questionId,
    userAnswer: answer,
    timeSpent: elapsedTime,
    hintUsed: wasHintUsed
  });
  
  // 2. Backend checks answer
  const isCorrect = checkAnswer(question, answer);
  
  // 3. Create CheckpointResponse
  await CheckpointResponse.create({
    user: userId,
    video: videoId,
    question: questionId,
    userAnswer: answer,
    isCorrect,
    attemptNumber: currentAttempt,
    timeSpent: elapsedTime,
    hintUsed: wasHintUsed,
    pointsEarned: isCorrect ? question.points : 0
  });
  
  // 4. Update attendance
  await markAttendance(userId);
  
  // 5. Update streak
  await updateStreak(userId);
  
  // 6. Return feedback
  return {
    isCorrect,
    explanation: question.explanation,
    pointsEarned,
    canRetry: attemptNumber < maxRetries
  };
}
```

---

## 📅 Attendance & Streak System

### Attendance Marking

#### Trigger Conditions
- User answers a checkpoint question
- Automatically marked (no manual action)
- One record per day

#### Attendance Record
```typescript
{
  user: ObjectId,
  date: "2026-01-04", // Normalized to start of day
  checkpointsCompleted: 5,
  videosWatched: 3,
  totalTimeSpent: 120, // minutes
  coursesAccessed: [courseId1, courseId2],
  isMarked: true
}
```

#### Mark Attendance Logic
```typescript
async function markAttendance(userId) {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Start of day
  
  let attendance = await Attendance.findOne({
    user: userId,
    date: today
  });
  
  if (!attendance) {
    attendance = await Attendance.create({
      user: userId,
      date: today,
      checkpointsCompleted: 1,
      videosWatched: 1,
      isMarked: true
    });
  } else {
    attendance.checkpointsCompleted += 1;
    await attendance.save();
  }
  
  // Update streak
  await updateStreak(userId);
}
```

### Streak System

#### Streak Calculation
```typescript
async function updateStreak(userId) {
  const user = await User.findById(userId);
  let streak = await Streak.findOne({ user: userId });
  
  if (!streak) {
    streak = await Streak.create({
      user: userId,
      currentStreak: 1,
      longestStreak: 1,
      lastActivityDate: new Date(),
      streakStartDate: new Date(),
      totalActiveDays: 1
    });
    return;
  }
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const lastActivity = new Date(streak.lastActivityDate);
  lastActivity.setHours(0, 0, 0, 0);
  
  const daysDiff = Math.floor((today - lastActivity) / (1000 * 60 * 60 * 24));
  
  if (daysDiff === 0) {
    // Same day, no change
    return;
  } else if (daysDiff === 1) {
    // Consecutive day, increment
    streak.currentStreak += 1;
    if (streak.currentStreak > streak.longestStreak) {
      streak.longestStreak = streak.currentStreak;
    }
  } else {
    // Streak broken, reset
    streak.streakHistory.push({
      startDate: streak.streakStartDate,
      endDate: streak.lastActivityDate,
      length: streak.currentStreak
    });
    
    streak.currentStreak = 1;
    streak.streakStartDate = today;
  }
  
  streak.lastActivityDate = today;
  streak.totalActiveDays += 1;
  await streak.save();
  
  // Update user model
  user.currentStreak = streak.currentStreak;
  user.longestStreak = streak.longestStreak;
  await user.save();
}
```

#### Streak Display
```tsx
// In LearnerDashboard
<div className="stat-card">
  <FaFire className="stat-icon" />
  <div className="stat-info">
    <div className="stat-value">{user.currentStreak}</div>
    <div className="stat-label">Day Streak 🔥</div>
  </div>
</div>

<div className="stat-card">
  <FaTrophy className="stat-icon" />
  <div className="stat-info">
    <div className="stat-value">{user.longestStreak}</div>
    <div className="stat-label">Longest Streak</div>
  </div>
</div>
```

---

## 🧪 Scripts & Testing

### Utility Scripts

#### 1. **Seed Courses** (`src/scripts/seedCourses.ts`)
```bash
npm run seed:courses
```
- Creates sample courses
- Generates modules and videos
- Adds interactive questions
- Useful for development/testing

#### 2. **Create Test User** (`src/scripts/createTestUser.ts`)
```bash
npm run create:user
```
- Creates test users (student, instructor, admin)
- Pre-configured with sample data
- For testing authentication

#### 3. **Test Passport Auth** (`src/scripts/testPassportAuth.ts`)
```bash
npm run test:auth
```
- Tests Passport strategies
- Validates JWT generation
- Checks authentication flow

### Running Scripts
```bash
cd backend
npm run seed:courses    # Seed database with sample data
npm run create:user     # Create test users
npm run test:auth       # Test authentication
```

---

## 🚀 Environment Setup

### Prerequisites
- Node.js v16+
- MongoDB v6+
- npm or yarn

### Environment Variables

#### Backend (`.env`)
```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/adaptive-learning

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d

# CORS (optional)
CLIENT_URL=http://localhost:3000
```

#### Frontend (`.env` - optional)
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### Installation Steps

#### 1. Clone & Install
```bash
# Clone repository
cd CAPSTONE

# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

#### 2. Setup MongoDB
```bash
# Start MongoDB
mongod

# Or use MongoDB Atlas (cloud)
# Update MONGODB_URI in .env
```

#### 3. Run Development Servers
```bash
# Terminal 1: Backend
cd backend
npm run dev
# Running on http://localhost:5000

# Terminal 2: Frontend
cd frontend
npm start
# Running on http://localhost:3000
```

#### 4. Seed Database (Optional)
```bash
cd backend
npm run seed:courses
npm run create:user
```

### Production Build

#### Backend
```bash
cd backend
npm run build
npm start
```

#### Frontend
```bash
cd frontend
npm run build
# Creates optimized build in /build folder
```

---

## 📁 File Structure

### Complete Directory Tree
```
CAPSTONE/
│
├── README.md                          # Main project documentation
├── DATABASE_SCHEMA.md                 # Database structure and relationships
├── FEATURES_CHECKLIST.md              # Implemented features list
├── IMPLEMENTATION_SUMMARY.md          # Recent changes and additions
├── DUAL_PORTAL_GUIDE.md               # Teacher/Learner portal guide
├── AUTHENTICATION_GUIDE.md            # Auth system documentation
├── PASSPORT_SUMMARY.md                # Passport.js implementation
├── ATTENDANCE_WORKFLOW.md             # Attendance system flow
├── PROJECT_OVERVIEW.md                # This file (comprehensive overview)
│
├── backend/
│   ├── package.json                   # Backend dependencies
│   ├── tsconfig.json                  # TypeScript config
│   ├── .env                           # Environment variables (create this)
│   │
│   └── src/
│       ├── server.ts                  # Express app entry point
│       │
│       ├── config/
│       │   ├── config.ts              # Environment config
│       │   ├── database.ts            # MongoDB connection
│       │   └── passport.ts            # Passport strategies
│       │
│       ├── controllers/
│       │   ├── authController.ts      # Authentication logic
│       │   ├── courseController.ts    # Course CRUD
│       │   ├── moduleController.ts    # Module CRUD
│       │   ├── videoController.ts     # Video CRUD & questions
│       │   ├── progressController.ts  # Learning progress tracking
│       │   ├── attendanceController.ts # Attendance & streaks
│       │   ├── analyticsController.ts  # Engagement & RL endpoints
│       │   ├── teacherAnalyticsController.ts # Teacher analytics
│       │   └── spacedRepetitionController.ts # SM-2 review endpoints
│       │
│       ├── middleware/
│       │   ├── auth.ts                # JWT & role authorization
│       │   └── errorHandler.ts        # Error handling
│       │
│       ├── models/
│       │   ├── User.ts                # User schema (roles, career goals)
│       │   ├── Course.ts              # Course schema
│       │   ├── Module.ts              # Module schema (prerequisites)
│       │   ├── Video.ts               # Video schema
│       │   ├── InteractiveQuestion.ts # Question schema (MCQ, fill-blank, short-answer)
│       │   ├── CheckpointResponse.ts  # Answer schema (attempts, hints, timing)
│       │   ├── LearningProgress.ts    # Progress schema (course/module/video level)
│       │   ├── Attendance.ts          # Attendance schema
│       │   ├── Streak.ts              # Streak schema (history)
│       │   ├── Analytics.ts           # Aggregated analytics per user-module
│       │   ├── EngagementEvent.ts     # Granular video events (play, pause, seek)
│       │   ├── RLQTable.ts            # Q-Learning Q-values (persistent)
│       │   └── SpacedRepetition.ts    # SM-2 review schedule per user-module
│       │
│       ├── routes/
│       │   ├── authRoutes.ts          # /api/auth
│       │   ├── courseRoutes.ts        # /api/courses
│       │   ├── moduleRoutes.ts        # /api/modules
│       │   ├── videoRoutes.ts         # /api/videos
│       │   ├── progressRoutes.ts      # /api/progress
│       │   ├── attendanceRoutes.ts    # /api/attendance
│       │   ├── analyticsRoutes.ts     # /api/analytics
│       │   ├── teacherAnalyticsRoutes.ts # /api/teacher-analytics
│       │   └── spacedRepetitionRoutes.ts # /api/spaced-repetition
│       │
│       ├── services/
│       │   ├── adaptiveLearningService.ts  # Personalized learning paths
│       │   ├── rlService.ts               # Q-Learning RL agent
│       │   ├── spacedRepetitionService.ts  # SM-2 review scheduling
│       │   ├── riskDetectionService.ts     # At-risk student detection
│       │   ├── engagementService.ts        # Engagement scoring
│       │   ├── recommendationService.ts    # Course recommendations
│       │   └── teacherAnalyticsService.ts  # Instructor analytics & insights
│       │
│       ├── scripts/
│       │   ├── seedCourses.ts         # Seed sample data
│       │   ├── createTestUser.ts      # Create test users
│       │   └── testPassportAuth.ts    # Test authentication
│       │
│       └── utils/
│           └── jwt.ts                 # JWT helper functions
│
└── frontend/
    ├── package.json                   # Frontend dependencies
    ├── tsconfig.json                  # TypeScript config
    │
    ├── public/
    │   └── index.html                 # HTML template
    │
    └── src/
        ├── index.tsx                  # React entry point
        ├── App.tsx                    # Main app component
        ├── App.css                    # Global styles
        ├── index.css                  # Reset styles
        │
        ├── components/
        │   ├── Navbar/
        │   │   ├── Navbar.tsx         # Navigation component
        │   │   └── Navbar.css         # Navbar styles
        │   │
        │   └── VideoPlayer/
        │       ├── VideoPlayer.tsx    # Video player component
        │       ├── VideoPlayer.css    # Player styles
        │       ├── QuizOverlay.tsx    # Interactive quiz component
        │       └── QuizOverlay.css    # Quiz styles
        │
        ├── pages/
        │   ├── Home/
        │   │   ├── Home.tsx           # Landing page
        │   │   └── Home.css
        │   │
        │   ├── Auth/
        │   │   ├── Login.tsx          # Login page
        │   │   ├── Register.tsx       # Registration page
        │   │   └── Auth.css           # Auth styles
        │   │
        │   ├── Learner/
        │   │   ├── LearnerDashboard.tsx # Student dashboard (AI recs, engagement, reviews)
        │   │   ├── LearnerDashboard.css
        │   │   └── SpacedReview.tsx    # Spaced repetition review page
        │   │
        │   ├── Teacher/
        │   │   ├── TeacherDashboard.tsx # Instructor dashboard
        │   │   ├── TeacherDashboard.css
        │   │   ├── TeacherAnalytics.tsx # AI analytics (heatmaps, risk, item analysis)
        │   │   ├── TeacherAnalytics.css
        │   │   ├── ManageModules.tsx  # Module management
        │   │   ├── ManageModules.css
        │   │   ├── EditModule.tsx     # Edit module
        │   │   ├── EditModule.css
        │   │   ├── ManageQuestions.tsx # Question management
        │   │   └── ManageQuestions.css
        │   │
        │   ├── Admin/
        │   │   ├── AdminCourses.tsx   # Create course
        │   │   ├── AdminCourses.css
        │   │   ├── ManageCourses.tsx  # View instructor courses
        │   │   ├── ManageCourses.css
        │   │   ├── EditCourse.tsx     # Edit course
        │   │   └── EditCourse.css
        │   │
        │   ├── CourseDetail/
        │   │   ├── CourseDetail.tsx   # Course detail page
        │   │   └── CourseDetail.css
        │   │
        │   ├── Profile/
        │   │   ├── Profile.tsx        # User profile page
        │   │   └── Profile.css
        │   │
        │   └── Attendance/
        │       ├── Attendance.tsx     # Attendance calendar
        │       └── Attendance.css
        │
        ├── services/
        │   └── api.ts                 # Axios API client
        │
        ├── store/
        │   └── authStore.ts           # Zustand auth state
        │
        └── types/
            └── index.ts               # TypeScript interfaces
```

---

## 📊 Data Flow Examples

### Example 1: Student Watches Video
```
1. Student clicks video in CourseDetail
   └→ Navigate to /video/:videoId

2. VideoPlayer component mounts
   └→ GET /api/videos/:videoId (fetch video data)
   └→ GET /api/videos/:videoId/questions (fetch checkpoints)
   └→ GET /api/progress/course/:courseId (fetch progress)

3. Video starts playing
   └→ Timer starts
   └→ Every 30s: PUT /api/progress/video/:videoId
      - Update watchedDuration
      - Update lastWatchedAt

4. Video reaches checkpoint (e.g., 2:30)
   └→ Video pauses
   └→ QuizOverlay shows with question
   └→ Student answers
   └→ POST /api/videos/:videoId/checkpoint
      - Create CheckpointResponse
      - Mark attendance if first checkpoint today
      - Update streak if consecutive day
      - Return feedback (correct/incorrect)
   └→ Video resumes

5. Video finishes (watchedDuration >= 90% of totalDuration)
   └→ Mark video as completed
   └→ Update course overall progress
   └→ Show completion alert
```

### Example 2: Instructor Creates Course with Interactive Video
```
1. Instructor navigates to /admin/courses
   └→ Fills course form (title, description, difficulty, career goals, etc.)
   └→ POST /api/courses
      - Create Course document
      - instructor: req.user._id

2. Instructor adds module
   └→ Navigate to /teacher/course/:courseId/modules
   └→ POST /api/modules
      - Create Module document
      - course: courseId
      - order: 1

3. Instructor adds video
   └→ POST /api/videos
      - Create Video document
      - module: moduleId
      - course: courseId
      - order: 1

4. Instructor adds interactive questions
   └→ Navigate to /teacher/video/:videoId/questions
   └→ Click "Add Question"
   └→ Fill form:
      - Question type: MCQ
      - Question: "What is a variable?"
      - Timestamp: 150 (2:30)
      - Options: [{ text: "A container", isCorrect: true }, ...]
      - Points: 10
   └→ POST /api/videos/:videoId/questions
      - Create InteractiveQuestion document
      - video: videoId

5. Students can now watch and answer checkpoints!
```

### Example 3: Adaptive Learning Recommendation
```
1. Student logs in
   └→ Profile: { 
       learnerBackground: "beginner", 
       careerGoal: "Software Developer",
       averageQuizScore: 85 
     }

2. Navigate to /learner/dashboard
   └→ GET /api/progress/recommendations
   
3. Backend algorithm:
   a. Get all courses
   b. Filter: published && not completed by user
   c. Score each course:
      - Career goal match: +30 points
      - Difficulty match (beginner + high score = intermediate): +25 points
      - Course rating: +15 points
      - Enrollment count: +10 points
   d. Sort by score
   e. Return top 5
   
4. Frontend displays recommended courses
   └→ Student can enroll with one click
   └→ POST /api/courses/:id/enroll
      - Create LearningProgress document
      - status: "not-started"
```

---

## 🎯 Common Use Cases

### Use Case 1: New Student Registration
```
1. Visit homepage
2. Click "Get Started" or "Register"
3. Fill form:
   - Name: John Doe
   - Email: john@example.com
   - Password: securepass123
   - Role: student
   - Learner Background: beginner
   - Career Goal: Software Developer
4. Submit → Passport 'local-register' strategy
5. Password hashed, JWT created
6. Redirect to /learner/dashboard
7. See welcome message, 0 streak, empty course list
8. Browse "All Courses"
9. Enroll in "Python Fundamentals"
10. Start watching first video
11. Answer checkpoint → attendance marked → streak: 1 day 🔥
```

### Use Case 2: Instructor Creating Interactive Course
```
1. Login as instructor
2. Redirect to /teacher/dashboard
3. Click "Create New Course"
4. Fill course form
5. Click "Create Course"
6. Navigate to "Manage Courses"
7. Click "Manage Modules" on new course
8. Add module: "Introduction to Python"
9. Add video: "Variables and Data Types"
10. Click "Questions" button on video
11. Add MCQ at timestamp 150 (2:30):
    - "What keyword defines a variable in Python?"
    - Options: def (wrong), var (wrong), let (wrong), No keyword needed (correct)
12. Save question
13. Publish course
14. Students can now enroll and watch with checkpoints!
```

### Use Case 3: Student Maintaining Streak
```
Day 1:
- Watch video, answer checkpoint
- Attendance marked
- Streak: 1 day

Day 2 (next day):
- Watch another video, answer checkpoint
- Attendance marked
- Streak updated: 2 days

Day 3 (skip - no activity):
- Streak breaks

Day 4:
- Watch video, answer checkpoint
- Streak resets to: 1 day
- Previous streak saved in streakHistory
```

---

## 🔍 Extracting Information from This Overview

### By Category

**Need API endpoints?** → See [API Endpoints](#api-endpoints) section

**Need database structure?** → See [Database Schema](#database-schema) section

**Need to understand authentication?** → See [Authentication Flow](#authentication-flow) section

**Need to know about adaptive learning?** → See [Adaptive Learning Engine](#adaptive-learning-engine) section

**Need file locations?** → See [File Structure](#file-structure) section

**Need to understand how videos work?** → See [Interactive Video System](#interactive-video-system) section

**Need attendance/streak logic?** → See [Attendance & Streak System](#attendance--streak-system) section

**Need setup instructions?** → See [Environment Setup](#environment-setup) section

**Need to understand user roles?** → See [User Roles & Portals](#user-roles--portals) section

### By Task

**Setting up for development?**
1. Read [Environment Setup](#environment-setup)
2. Check [File Structure](#file-structure)
3. Review [Tech Stack](#tech-stack)

**Building new features?**
1. Check [Database Schema](#database-schema) for data models
2. Review [API Endpoints](#api-endpoints) for available APIs
3. Check [Frontend Structure](#frontend-structure) for UI organization

**Understanding existing features?**
1. Read [Key Features](#key-features)
2. Review [Data Flow Examples](#data-flow-examples)
3. Check [Common Use Cases](#common-use-cases)

**Debugging issues?**
1. Check [Architecture Overview](#architecture-overview) for system flow
2. Review [Authentication Flow](#authentication-flow) for auth issues
3. Check [Scripts & Testing](#scripts--testing) for test tools

---

## 📝 Quick Reference

### Important Commands
```bash
# Backend
npm run dev          # Start development server
npm run build        # Build for production
npm run seed:courses # Seed database
npm run create:user  # Create test users

# Frontend
npm start            # Start development server
npm run build        # Build for production
```

### Default Ports
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000
- **MongoDB**: mongodb://localhost:27017

### Demo Credentials (if seeded)
```
Student:
Email: student@example.com
Password: password123

Instructor:
Email: instructor@example.com
Password: password123

Admin:
Email: admin@example.com
Password: password123
```

### Important URLs
```
# Learner Portal
/learner/dashboard       # Student dashboard
/course/:id              # Course detail
/video/:videoId          # Video player
/profile                 # User profile
/attendance              # Attendance calendar

# Teacher Portal
/teacher/dashboard                          # Instructor dashboard
/teacher/courses                            # Manage courses
/teacher/course/:courseId/modules           # Manage modules
/teacher/module/:moduleId/edit              # Edit module
/teacher/video/:videoId/questions           # Manage questions
/admin/courses                              # Create course
/admin/courses/:id/edit                     # Edit course
```

### Key Constants
```typescript
// Video completion threshold
const COMPLETION_THRESHOLD = 0.9; // 90% watched

// Auto-save interval
const AUTOSAVE_INTERVAL = 30000; // 30 seconds

// JWT expiry
const JWT_EXPIRE = '7d'; // 7 days

// Password hash rounds
const SALT_ROUNDS = 10;

// Max retries for checkpoints
const MAX_RETRIES = 2;

// Default question time limit
const DEFAULT_TIME_LIMIT = 60; // seconds
```

---

## 🎓 Summary

This **Adaptive Lifelong Learning Platform** is a full-stack educational system featuring:

✅ **Dual portals** for learners and teachers  
✅ **Interactive video checkpoints** with MCQ, fill-in-blank, and short-answer questions  
✅ **AI-powered course recommendations** based on performance and goals  
✅ **Q-Learning RL agent** for continuously improving recommendations  
✅ **SM-2 spaced repetition** for long-term knowledge retention  
✅ **At-risk student detection** with intervention suggestions  
✅ **Engagement analytics engine** with weighted scoring formula  
✅ **Teacher analytics dashboard** with AI-generated insights  
✅ **Comprehensive progress tracking** at course, module, and video levels  
✅ **Attendance and streak system** to boost engagement  
✅ **Role-based authentication** with Passport.js and JWT  
✅ **Complete CRUD** for courses, modules, videos, and questions  
✅ **Responsive UI** built with React and TypeScript  
✅ **RESTful API** with Express and MongoDB  

**Total Files**: ~80 (backend + frontend + documentation)  
**Database Collections**: 13  
**Backend Services**: 7 AI/ML services  
**API Endpoints**: 35+  
**User Roles**: 3 (Student, Instructor, Admin)  
**Question Types**: 3 (MCQ, Fill-in-blank, Short-answer)

---

**📌 For any specific information, use this document's table of contents or search for keywords!**
