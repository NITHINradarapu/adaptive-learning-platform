# Database Schema - Learning Management System

```mermaid
erDiagram
    User ||--o{ Course : "instructs"
    User ||--o{ LearningProgress : "has"
    User ||--o{ Attendance : "has"
    User ||--o{ CheckpointResponse : "submits"
    User ||--|| Streak : "has"
    
    Course ||--o{ Module : "contains"
    Course ||--o{ LearningProgress : "tracks"
    Course ||--o{ Video : "has"
    
    Module ||--o{ Video : "contains"
    Module ||--o{ Module : "prerequisite"
    
    Video ||--o{ InteractiveQuestion : "contains"
    Video ||--o{ CheckpointResponse : "receives"
    
    InteractiveQuestion ||--o{ CheckpointResponse : "answered by"

    User {
        ObjectId _id PK
        string name
        string email UK
        string password
        enum role "student|instructor|admin"
        enum learnerBackground "beginner|intermediate|advanced"
        enum careerGoal
        number averageQuizScore
        number totalCoursesCompleted
        number currentStreak
        number longestStreak
        date createdAt
        date updatedAt
    }

    Course {
        ObjectId _id PK
        string title
        string description
        ObjectId instructor FK "User._id"
        enum difficultyLevel "beginner|intermediate|advanced"
        array careerGoals
        string thumbnailUrl
        number duration "in minutes"
        number totalModules
        number totalVideos
        number enrolledStudents
        number averageRating "0-5"
        array tags
        array prerequisites
        boolean isPublished
        date createdAt
        date updatedAt
    }

    Module {
        ObjectId _id PK
        ObjectId course FK "Course._id"
        string title
        string description
        number order UK "with course"
        enum difficultyLevel
        boolean isLocked
        array prerequisites FK "Module._id[]"
        number estimatedTime "in minutes"
        date createdAt
        date updatedAt
    }

    Video {
        ObjectId _id PK
        ObjectId module FK "Module._id"
        ObjectId course FK "Course._id"
        string title
        string description
        string videoUrl
        string thumbnailUrl
        number duration "in seconds"
        number order UK "with module"
        boolean hasInteractiveQuestions
        number requiredCheckpoints
        number viewCount
        date createdAt
        date updatedAt
    }

    InteractiveQuestion {
        ObjectId _id PK
        ObjectId video FK "Video._id"
        enum questionType "mcq|fill-in-blank|short-answer"
        string question
        number timestamp "in seconds"
        array options "text, isCorrect"
        string correctAnswer
        array acceptableAnswers
        string hint
        string explanation
        number timeLimit "in seconds"
        number maxRetries
        boolean isRequired
        number points
        number order
        date createdAt
        date updatedAt
    }

    CheckpointResponse {
        ObjectId _id PK
        ObjectId user FK "User._id"
        ObjectId video FK "Video._id"
        ObjectId question FK "InteractiveQuestion._id"
        string userAnswer
        boolean isCorrect
        number attemptNumber
        number timeSpent "in seconds"
        boolean hintUsed
        number pointsEarned
        date answeredAt
        date createdAt
        date updatedAt
    }

    LearningProgress {
        ObjectId _id PK
        ObjectId user FK "User._id"
        ObjectId course FK "Course._id"
        date enrolledAt
        enum status "not-started|in-progress|completed|needs-revision"
        number overallProgress "0-100%"
        array modulesProgress "module, status, videosCompleted, totalVideos, quizScore, completedAt"
        array videosProgress "video, watchedDuration, totalDuration, completed, checkpointsCompleted, totalCheckpoints, lastWatchedAt"
        number totalQuizzesTaken
        number averageQuizScore
        number totalTimeSpent "in minutes"
        number totalCheckpointsCompleted
        string performanceLevel "struggling|average|excellent"
        string recommendedPace "slow|normal|fast"
        array weakAreas
        array strongAreas
        date lastActivityDate
        number totalDaysActive
        date createdAt
        date updatedAt
    }

    Attendance {
        ObjectId _id PK
        ObjectId user FK "User._id"
        date date UK "with user"
        number checkpointsCompleted
        number videosWatched
        number totalTimeSpent "in minutes"
        array coursesAccessed FK "Course._id[]"
        boolean isMarked
        date createdAt
        date updatedAt
    }

    Streak {
        ObjectId _id PK
        ObjectId user FK UK "User._id"
        number currentStreak
        number longestStreak
        date lastActivityDate
        date streakStartDate
        number totalActiveDays
        array streakHistory "startDate, endDate, length"
        date createdAt
        date updatedAt
    }
```

## Key Relationships

### User Relationships
- **One-to-Many**: User → Course (as instructor)
- **One-to-Many**: User → LearningProgress (enrollment tracking)
- **One-to-Many**: User → Attendance (daily records)
- **One-to-Many**: User → CheckpointResponse (quiz answers)
- **One-to-One**: User → Streak (activity tracking)

### Course Hierarchy
```
Course (Programming Fundamentals)
├── Module 1 (Introduction to Python)
│   ├── Video 1 (Variables and Data Types)
│   │   ├── Question 1 (MCQ at 2:30)
│   │   └── Question 2 (Fill-in-blank at 5:00)
│   └── Video 2 (Control Structures)
│       └── Question 1 (Short answer at 3:15)
└── Module 2 (Functions and Modules)
    └── Video 1 (Defining Functions)
        └── Question 1 (MCQ at 1:45)
```

### Progress Tracking Flow
1. **User** enrolls in **Course** → Creates **LearningProgress**
2. User watches **Video** → Updates **LearningProgress.videosProgress**
3. User answers **InteractiveQuestion** → Creates **CheckpointResponse**
4. Daily activity → Creates/Updates **Attendance** and **Streak**

## Indexes

- **User**: email (unique)
- **Course**: title, description, tags (text search)
- **Module**: course + order (unique composite)
- **Video**: module + order (unique composite)
- **Attendance**: user + date (unique composite)
- **CheckpointResponse**: user + video + question (composite)
- **Streak**: user (unique)

## Data Flow Example

### Student Learning Journey
```
1. Student registers → User document created
2. Student enrolls → LearningProgress document created
3. Student watches video → LearningProgress.videosProgress updated
4. Video checkpoint appears → InteractiveQuestion triggered
5. Student answers → CheckpointResponse created
6. Daily activity → Attendance & Streak updated
7. Complete all modules → Course status = completed
```

## Adaptive Learning Data

The **LearningProgress** model tracks:
- **Performance metrics**: Quiz scores, time spent, checkpoints completed
- **Adaptive data**: Performance level, recommended pace
- **Weak/Strong areas**: Topics for recommendation engine
- **Activity patterns**: Last activity, total days active

This data enables personalized course recommendations and adaptive difficulty adjustments.
