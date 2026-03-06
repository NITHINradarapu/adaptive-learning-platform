# Adaptive Lifelong Learning Platform

> An AI-driven e-learning platform that promotes lifelong learning through personalized adaptive learning paths, interactive in-video engagement, and comprehensive course management.

## 🌟 Key Features

### 1. **Adaptive Learning Engine**
- 🎯 Dynamic personalization based on learner background (Beginner/Intermediate/Advanced)
- 📊 Performance-based content adjustment using quiz scores and completion time
- 🎓 Career goal-oriented learning paths (Software Developer, Data Analyst, ML Engineer, etc.)
- 🔄 Automatic progression and intelligent content recommendations

### 2. **Reinforcement Learning (Q-Learning) Agent**
- 🤖 Epsilon-greedy Q-learning agent that improves recommendations over time
- 🧠 6-action space: recommend next topic, revision, easy content, advanced challenge, suggest break, switch format
- 📈 State representation: quiz scores, engagement, mastery, retry frequency, completion rate, streaks
- 💾 Persistent Q-table stored in MongoDB across sessions

### 3. **Spaced Repetition (SM-2 Algorithm)**
- 🔁 Scientifically-grounded review scheduling using SuperMemo 2 algorithm
- 📅 Dynamic interval adjustment: 1 day → 6 days → EF × previous interval
- 🎯 Status progression: new → learning → review → mastered
- 📊 Review dashboard with due-now, due-tomorrow, mastery percentage

### 4. **At-Risk Student Detection**
- ⚠️ Multi-factor risk assessment (engagement, failure rate, login consistency, performance trend)
- 🚨 Three risk levels: low, medium, high with intervention suggestions
- 👨‍🏫 Teacher view aggregating at-risk students across all courses

### 5. **Engagement Analytics Engine**
- 📊 Weighted engagement formula: quiz accuracy (30%) + watch completion (20%) + consistency (20%) + replay behavior (15%) + participation frequency (15%)
- 📹 Granular event tracking: play, pause, seek, replay, checkpoint answers

### 6. **Interactive In-Video Engagement**
- ⏸️ Interactive checkpoints at specific video timestamps
- ❓ Multiple question types: MCQs, fill-in-the-blanks, short answers
- ⏱️ Time-limited answers with retry options and hints
- 🎓 **Attendance Policy**: Students MUST answer checkpoint questions to mark attendance
- ✅ Questions pop up automatically during video playback and pause the video
- 🔥 Daily streak system to boost engagement and consistency
- 📊 Detailed attendance calendar with engagement metrics

### 7. **Comprehensive Course Management**
- ➕ **Create**: Rich course creation with career goals, difficulty levels, and tags
- 📝 **Read**: Detailed course views with modules, videos, and statistics
- ✏️ **Update**: Full editing capabilities for course instructors
- 🗑️ **Delete**: Secure deletion with authorization checks
- 📊 **Analytics**: Track student enrollments and course performance

### 8. **User Dashboard**
- 📈 Personal statistics: streak counter, average progress, quiz scores
- 📚 Enrolled courses with progress tracking
- 💡 AI-powered course recommendations (adaptive + RL-based)
- 🎯 All available courses with instant enrollment
- 🧠 Engagement score visualization
- 🔁 Spaced repetition review reminders

### 9. **Teacher Analytics Dashboard**
- � Topic-wise performance heatmap with drop-off detection
- ❓ Question item analysis (success rate, Bloom's level, hint usage)
- 📈 Engagement distribution across students
- 🤖 AI-generated insights from analytics patterns
- ⚠️ At-risk student identification with intervention suggestions
- 👥 Per-student performance breakdowns

## �🛠️ Tech Stack

| Category | Technologies |
|----------|-------------|
| **Frontend** | React 18, TypeScript 4.9, React Router 6, Zustand, React Query, Recharts |
| **Backend** | Node.js, Express.js, TypeScript |
| **Database** | MongoDB, Mongoose ODM |
| **Authentication** | Passport.js (Local + JWT strategies), bcrypt |
| **AI/ML Services** | Q-Learning RL Agent, SM-2 Spaced Repetition, Risk Detection, Engagement Analytics |
| **Styling** | Custom CSS, Responsive Design |
| **Icons** | React Icons |
| **API Client** | Axios with Interceptors |

## 📁 Project Structure

```
CAPSTONE/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuration (DB, Passport, env)
│   │   ├── models/          # 13 MongoDB models
│   │   ├── controllers/     # 9 controllers (auth, courses, videos, analytics...)
│   │   ├── routes/          # 9 API route groups
│   │   ├── services/        # 7 AI/ML services (RL, SM-2, risk detection...)
│   │   ├── middleware/      # Auth (JWT + roles), error handling
│   │   ├── utils/           # Helper functions
│   │   ├── scripts/         # Seed scripts
│   │   └── server.ts        # Entry point
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI (Navbar, VideoPlayer, QuizOverlay)
│   │   ├── pages/           # 8 page groups (Learner, Teacher, Admin, etc.)
│   │   ├── services/        # API service layer (35+ endpoints)
│   │   ├── store/           # Zustand state management
│   │   ├── types/           # TypeScript interfaces
│   │   └── App.tsx          # Main app with routing & guards
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
- ✅ AI-powered analytics dashboard with performance heatmaps
- ✅ At-risk student detection with intervention suggestions
- ✅ Question item analysis (success rates, difficulty, Bloom's taxonomy)
- ✅ Engagement distribution across student cohorts

## 🗄️ Database Models (13 Collections)

- **User**: Student and instructor profiles with career goals
- **Course**: Course information, difficulty, career goals
- **Module**: Course modules/chapters with prerequisites
- **Video**: Video lessons with metadata
- **InteractiveQuestion**: In-video questions (MCQ, fill-blank, short-answer)
- **CheckpointResponse**: Student answers with attempt tracking
- **LearningProgress**: Granular progress at course/module/video levels
- **Attendance**: Daily attendance records
- **Streak**: Learning streak tracking with history
- **Analytics**: Aggregated analytics per user-module
- **EngagementEvent**: Granular video player events (play, pause, seek, replay)
- **RLQTable**: Reinforcement learning Q-values (persistent Q-table)
- **SpacedRepetition**: SM-2 review schedules per user-module

## API Endpoints (9 Route Groups, 35+ Endpoints)

### Authentication (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - User login
- `GET /me` - Get current user
- `PUT /profile` - Update profile & password
- `POST /logout` - Logout user

### Courses (`/api/courses`)
- `GET /` - Get all courses
- `GET /:id` - Get course details
- `POST /` - Create course (instructor)
- `PUT /:id` - Update course (instructor)
- `DELETE /:id` - Delete course (instructor)
- `POST /:id/enroll` - Enroll in course
- `DELETE /:id/enroll` - Unenroll from course
- `GET /recommended` - Get AI recommendations

### Modules (`/api/modules`)
- Full CRUD for course modules

### Videos (`/api/videos`)
- Full CRUD + question management + checkpoint submission

### Progress (`/api/progress`)
- `GET /dashboard` - Learner dashboard stats
- `GET /adaptive-path/:courseId` - Personalized learning path
- `POST /video/:videoId` - Update video progress

### Attendance (`/api/attendance`)
- `GET /status` - Get attendance status
- `POST /mark` - Mark attendance
- `GET /calendar` - Monthly attendance calendar
- `GET /streaks/current` - Get current streak

### Analytics & Engagement (`/api/analytics`)
- `POST /engagement/track` - Track video engagement events
- `GET /engagement/score` - Get engagement score
- `GET /recommendations` - RL-powered recommendations
- `POST /rl/interaction` - Process RL agent interaction
- `GET /rl/stats` - Get RL stats for dashboard

### Teacher Analytics (`/api/teacher-analytics`)
- `GET /course/:id/dashboard` - Full course analytics dashboard
- `GET /course/:id/students` - Per-student performance data
- `GET /at-risk` - All at-risk students across courses
- `GET /student/:id/risk` - Individual risk assessment

### Spaced Repetition (`/api/spaced-repetition`)
- `GET /due` - Get modules due for review
- `GET /summary` - Review summary (due today, this week, mastery %)
- `GET /schedules` - All review schedules
- `GET /module/:id/questions` - Review quiz questions
- `POST /module/:id/submit` - Submit review answers
- `POST /module/:id/init` - Initialize spaced repetition for module

## Intelligent Systems in Detail

### Adaptive Learning Logic
The platform adjusts content based on:
1. **Learner Background**: Beginners get fundamentals, advanced learners skip basics
2. **Performance Metrics**: Quiz scores, time taken, mistakes
3. **Career Goals**: Content focus aligned with career objectives
4. **Learning Patterns**: Struggling learners get revision content

### Reinforcement Learning Agent
- Q-Learning with epsilon-greedy exploration (ε=0.15)
- Learns optimal recommendations from student interactions
- Reward function considers quiz scores, topic completion, streaks, dropouts
- Q-values persist in MongoDB and improve over sessions

### Spaced Repetition (SM-2)
- Implemented SuperMemo 2 algorithm for review scheduling
- Easiness factor dynamically adjusted per module per learner
- Review intervals grow: 1 day → 6 days → EF × previous
- Poor recall (quality < 3) resets interval to 1 day

### Risk Detection
- Multi-factor analysis: engagement, failure rate, login consistency, performance trends
- Three risk levels with AI-generated intervention suggestions
- Batch assessment across courses for teacher dashboards

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

## Backend Services Architecture

| Service | Algorithm | Purpose |
|---------|-----------|--------|
| `adaptiveLearningService` | Rule-based scoring | Personalized learning paths & course recommendations |
| `rlService` | Q-Learning (ε-greedy) | Continuously improving action recommendations |
| `spacedRepetitionService` | SM-2 SuperMemo | Optimal review scheduling for long-term retention |
| `riskDetectionService` | Multi-factor analysis | Early identification of at-risk students |
| `engagementService` | Weighted formula | Quantified engagement scoring |
| `recommendationService` | Collaborative filtering | Course recommendations |
| `teacherAnalyticsService` | Aggregation + insights | Instructor analytics with AI-generated text insights |

## License

MIT

## Author

Built for Capstone Project - December 2025
