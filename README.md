# Adaptive Lifelong Learning Platform

> An AI-driven e-learning platform that promotes lifelong learning through personalized adaptive learning paths, interactive in-video engagement, and comprehensive course management.

## 🌟 Key Features

### 1. **Adaptive Learning Engine**
- 🎯 Dynamic personalization based on learner background (Beginner/Intermediate/Advanced)
- 📊 Performance-based content adjustment using quiz scores and completion time
- 🎓 Career goal-oriented learning paths (Software Developer, Data Analyst, ML Engineer, etc.)
- 🔄 Automatic progression and intelligent content recommendations

### 2. **Interactive In-Video Engagement**
- ⏸️ Interactive checkpoints at specific video timestamps
- ❓ Multiple question types: MCQs, fill-in-the-blanks, short answers
- ⏱️ Time-limited answers with retry options and hints
- ✅ Real-time attendance tracking based on checkpoint completion
- 🔥 Daily streak system to boost engagement

### 3. **Comprehensive Course Management**
- ➕ **Create**: Rich course creation with career goals, difficulty levels, and tags
- 📝 **Read**: Detailed course views with modules, videos, and statistics
- ✏️ **Update**: Full editing capabilities for course instructors
- 🗑️ **Delete**: Secure deletion with authorization checks
- 📊 **Analytics**: Track student enrollments and course performance

### 4. **User Dashboard**
- 📈 Personal statistics: streak counter, average progress, quiz scores
- 📚 Enrolled courses with progress tracking
- 💡 AI-powered course recommendations
- 🎯 All available courses with instant enrollment

## 🛠️ Tech Stack

| Category | Technologies |
|----------|-------------|
| **Frontend** | React 18, TypeScript 4.9, React Router 6, Zustand (State Management) |
| **Backend** | Node.js, Express.js, TypeScript |
| **Database** | MongoDB, Mongoose ODM |
| **Authentication** | JWT (JSON Web Tokens), bcrypt |
| **Styling** | Custom CSS, Responsive Design |
| **Icons** | React Icons |
| **API Client** | Axios with Interceptors |

## 📁 Project Structure

```
CAPSTONE/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuration files
│   │   ├── models/          # MongoDB models (User, Course, Module, Video, etc.)
│   │   ├── controllers/     # Request handlers
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic (Adaptive Learning Engine)
│   │   ├── middleware/      # Auth, error handling
│   │   ├── utils/           # Helper functions
│   │   ├── scripts/         # Seed scripts
│   │   └── server.ts        # Entry point
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI components (Navbar, VideoPlayer)
│   │   ├── pages/           # Page components (Dashboard, Auth, Admin)
│   │   ├── services/        # API service layer
│   │   ├── store/           # Zustand state management
│   │   ├── types/           # TypeScript interfaces
│   │   └── App.tsx          # Main app component
│   ├── package.json
│   └── tsconfig.json
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v6 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd CAPSTONE
```

2. **Backend Setup**
```bash
cd backend
npm install

# Create .env file
echo "PORT=5000
MONGODB_URI=mongodb://localhost:27017/adaptive-learning
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
NODE_ENV=development" > .env

# Start MongoDB (if not running)
# mongod

# Start backend server
npm run dev
```

3. **Frontend Setup** (in new terminal)
```bash
cd frontend
npm install

# Create .env file
echo "REACT_APP_API_URL=http://localhost:5000/api" > .env

# Start frontend
npm start
```

4. **Seed Sample Data** (optional, in new terminal)
```bash
cd backend
npm run create:user    # Creates test user
npm run seed:courses   # Creates 12 sample courses
```

### 🎯 Demo Credentials

After running the seed script, use these credentials:

**Email:** `test@gmail.com`  
**Password:** `password123`

Or register a new account at `http://localhost:3000/register`

## 📱 Application Features

### For Students:
- ✅ Browse and enroll in courses
- ✅ Track learning progress with visual indicators
- ✅ Complete interactive video checkpoints
- ✅ View personalized course recommendations
- ✅ Monitor daily streak and quiz performance
- ✅ Detailed course information pages

### For Instructors/Admins:
- ✅ Create new courses with rich metadata
- ✅ Edit existing course details
- ✅ Delete courses (with confirmation)
- ✅ Manage course visibility (publish/unpublish)
- ✅ View student enrollment statistics
- ✅ Organize courses by difficulty and career goals

## 🗄️ Database Models

- **User**: Student and instructor profiles
- **Course**: Course information and structure
- **Module**: Course modules/chapters
- **Video**: Video lessons with metadata
- **InteractiveQuestion**: In-video questions and checkpoints
- **LearningProgress**: Learner progress tracking
- **Attendance**: Daily attendance records
- **Streak**: Learning streak tracking

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Courses
- `GET /api/courses` - Get all courses
- `GET /api/courses/:id` - Get course details
- `POST /api/courses` - Create course (instructor)
- `PUT /api/courses/:id` - Update course (instructor)

### Videos
- `GET /api/videos/:id` - Get video details
- `GET /api/videos/:id/questions` - Get interactive questions
- `POST /api/videos/:id/checkpoints` - Submit checkpoint answer

### Learning Progress
- `GET /api/progress/dashboard` - Get learner dashboard
- `GET /api/progress/adaptive-path` - Get personalized learning path
- `POST /api/progress/update` - Update progress

### Attendance & Streaks
- `GET /api/attendance/status` - Get attendance status
- `POST /api/attendance/mark` - Mark attendance
- `GET /api/streaks/current` - Get current streak

## Features in Detail

### Adaptive Learning Logic

The platform adjusts content based on:
1. **Learner Background**: Beginners get fundamentals, advanced learners skip basics
2. **Performance Metrics**: Quiz scores, time taken, mistakes
3. **Career Goals**: Content focus aligned with career objectives
4. **Learning Patterns**: Struggling learners get revision content

### Interactive Video System

- Questions appear at instructor-defined timestamps
- Video automatically pauses for questions
- Timer-based answer submission
- Limited retries with hints
- Progress blocked until checkpoint completion
- Attendance marked only with real engagement

### Streak & Gamification

- Daily streaks based on actual learning activity
- Checkpoint completion required for streak continuation
- Visual progress indicators
- Achievement badges and milestones

## License

MIT

## Author

Built for Capstone Project - December 2025
