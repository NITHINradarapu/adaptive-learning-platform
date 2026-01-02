# 🔐 Authentication & Authorization Complete Guide

## ✅ Implementation Status: COMPLETE

Your Adaptive Lifelong Learning Platform now has **production-ready authentication and authorization** using **Passport.js**.

---

## 🏗️ Architecture Overview

### Backend Authentication (Passport.js)
```
┌─────────────────────────────────────────────────────────┐
│                   CLIENT REQUEST                        │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│  PUBLIC ROUTES (No Auth Required)                       │
│  • POST /api/auth/register  → passport-local-register   │
│  • POST /api/auth/login     → passport-local-login      │
└─────────────────────────────────────────────────────────┘
                           ↓
                    Generate JWT Token
                           ↓
┌─────────────────────────────────────────────────────────┐
│  PROTECTED ROUTES (JWT Required)                        │
│  • authenticate middleware → passport-jwt strategy       │
│  • Validates token & attaches user to request           │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│  ROLE-BASED AUTHORIZATION                               │
│  • authorize(...roles) middleware                       │
│  • Checks user.role against allowed roles               │
└─────────────────────────────────────────────────────────┘
                           ↓
                    Route Handler Executes
```

### Frontend Authentication (Zustand + Axios)
```
┌─────────────────────────────────────────────────────────┐
│                 USER INTERACTION                        │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│  AUTH STORE (Zustand)                                   │
│  • login(email, password)                               │
│  • register(data)                                       │
│  • logout()                                             │
│  • State: user, token, isAuthenticated                  │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│  API SERVICE (Axios)                                    │
│  • Interceptor: Add token to Authorization header       │
│  • Interceptor: Handle 401 errors (auto-logout)         │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│  ROUTE PROTECTION (React Router)                        │
│  • <PrivateRoute> checks isAuthenticated                │
│  • Redirects to login if not authenticated              │
└─────────────────────────────────────────────────────────┘
```

---

## 🔑 Authentication Features

### ✅ User Registration
- **Endpoint**: `POST /api/auth/register`
- **Strategy**: `passport-local-register`
- **Features**:
  - Email uniqueness validation
  - Password hashing (bcrypt, 10 rounds)
  - Automatic JWT token generation
  - User profile creation with preferences

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "student",
  "learnerBackground": "beginner",
  "careerGoal": "Software Developer"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "...",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "student",
      "learnerBackground": "beginner",
      "careerGoal": "Software Developer"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### ✅ User Login
- **Endpoint**: `POST /api/auth/login`
- **Strategy**: `passport-local-login`
- **Features**:
  - Email and password validation
  - Bcrypt password comparison
  - JWT token generation
  - User data retrieval

**Request:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### ✅ User Logout
- **Endpoint**: `POST /api/auth/logout`
- **Strategy**: `passport-jwt` (protected)
- **Features**:
  - Server acknowledgment
  - Client-side token removal
  - State cleanup

**Request:**
```
Headers: Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### ✅ Get Current User
- **Endpoint**: `GET /api/auth/me`
- **Strategy**: `passport-jwt` (protected)
- **Features**:
  - Token validation
  - User profile retrieval
  - Statistics included

### ✅ Update Profile
- **Endpoint**: `PUT /api/auth/profile`
- **Strategy**: `passport-jwt` (protected)
- **Features**:
  - Update name, learnerBackground, careerGoal
  - Validates user exists
  - Returns updated user

---

## 🛡️ Authorization Features

### Role-Based Access Control (RBAC)

**User Roles:**
- `student` - Default role for learners
- `instructor` - Can create/edit/delete courses
- `admin` - Full system access

### Protected Routes by Role

#### Student Routes (All Authenticated Users)
```typescript
✅ GET    /api/courses                      // Browse courses
✅ GET    /api/courses/:id                  // View course
✅ POST   /api/courses/:id/enroll           // Enroll in course
✅ GET    /api/courses/recommended          // Get recommendations
✅ GET    /api/videos/:id                   // Watch videos
✅ POST   /api/videos/:id/checkpoints/:qid  // Submit checkpoints
✅ GET    /api/progress/dashboard           // View dashboard
✅ GET    /api/progress/course/:id          // View progress
✅ POST   /api/progress/video/:id           // Update progress
```

#### Instructor/Admin Routes
```typescript
🔒 POST   /api/courses                      // Create course
🔒 PUT    /api/courses/:id                  // Update course
🔒 DELETE /api/courses/:id                  // Delete course
🔒 POST   /api/videos/:id/questions         // Create questions
```

### Authorization Middleware Usage

**In Routes:**
```typescript
// Anyone authenticated
router.get('/courses', authenticate, getCourses);

// Only instructors and admins
router.post('/courses', 
  authenticate, 
  authorize(UserRole.INSTRUCTOR, UserRole.ADMIN), 
  createCourse
);

// Only admins
router.delete('/users/:id', 
  authenticate, 
  authorize(UserRole.ADMIN), 
  deleteUser
);
```

---

## 🔐 Security Features

### 1. Password Security
- ✅ Bcrypt hashing with salt (10 rounds)
- ✅ Passwords never stored in plain text
- ✅ Password field excluded from queries (`select: false`)
- ✅ Minimum password length: 6 characters

### 2. Token Security
- ✅ JWT signed with secret key (`JWT_SECRET`)
- ✅ Token expiration: 7 days (configurable)
- ✅ Stateless authentication (no server-side sessions)
- ✅ Token in Authorization header: `Bearer <token>`

### 3. Request Security
- ✅ CORS enabled
- ✅ Helmet.js security headers
- ✅ Session-less authentication (`session: false`)
- ✅ Request validation middleware

### 4. Error Handling
- ✅ Generic error messages (no sensitive info)
- ✅ Proper HTTP status codes (401, 403, 500)
- ✅ Auto-logout on token expiration
- ✅ Graceful error recovery

### 5. Frontend Security
- ✅ Token stored in localStorage
- ✅ Auto token injection via Axios interceptor
- ✅ Auto logout on 401 response
- ✅ Protected routes (React Router)
- ✅ Private route wrapper component

---

## 📱 Frontend Implementation

### Auth Store (Zustand)

**Location:** `frontend/src/store/authStore.ts`

**State:**
```typescript
{
  user: User | null,
  token: string | null,
  isAuthenticated: boolean,
  isLoading: boolean,
  error: string | null
}
```

**Actions:**
```typescript
login(email, password)    // Authenticate user
register(data)            // Create new account
logout()                  // Clear session
updateUser(data)          // Update profile
clearError()              // Clear error state
```

### API Service (Axios)

**Location:** `frontend/src/services/api.ts`

**Interceptors:**
```typescript
// Request: Add token to headers
config.headers.Authorization = `Bearer ${token}`;

// Response: Handle 401 errors
if (error.response.status === 401) {
  localStorage.removeItem('token');
  window.location.href = '/login';
}
```

### Protected Routes

**Location:** `frontend/src/App.tsx`

```tsx
const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/" />;
};

// Usage:
<Route path="/dashboard" element={
  <PrivateRoute>
    <Dashboard />
  </PrivateRoute>
} />
```

---

## 🧪 Testing Authentication

### 1. Manual Testing (cURL)

**Register:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "learnerBackground": "beginner",
    "careerGoal": "Software Developer"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Access Protected Route:**
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 2. Automated Testing

**Run test script:**
```bash
cd backend
npm run test:auth
```

This tests:
- ✅ Registration
- ✅ Login
- ✅ Protected routes
- ✅ Profile updates
- ✅ Logout
- ✅ Invalid credentials
- ✅ Unauthorized access

### 3. Frontend Testing

1. Start backend: `cd backend && npm run dev`
2. Start frontend: `cd frontend && npm start`
3. Open http://localhost:3000
4. Test:
   - ✅ Register new account
   - ✅ Login with credentials
   - ✅ Access dashboard
   - ✅ Navigate protected routes
   - ✅ Logout

---

## 🚀 Quick Start

### Backend Setup
```bash
cd backend
npm install
npm run dev
```

Server runs on: `http://localhost:5000`

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

App runs on: `http://localhost:3000`

### Environment Variables

**backend/.env:**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/adaptive-learning
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRE=7d
NODE_ENV=development
```

---

## 📊 Authentication Flow Examples

### Complete Registration Flow
```
1. User fills registration form
   ↓
2. Frontend: authStore.register(data)
   ↓
3. API: POST /api/auth/register
   ↓
4. Backend: passport.authenticate('local-register')
   ↓
5. Check email doesn't exist
   ↓
6. Create user (password auto-hashed)
   ↓
7. Generate JWT token
   ↓
8. Return { user, token }
   ↓
9. Frontend: Store token in localStorage
   ↓
10. Frontend: Update authStore state
   ↓
11. Frontend: Redirect to dashboard
```

### Complete Login Flow
```
1. User enters email/password
   ↓
2. Frontend: authStore.login(email, password)
   ↓
3. API: POST /api/auth/login
   ↓
4. Backend: passport.authenticate('local-login')
   ↓
5. Find user by email
   ↓
6. Compare password (bcrypt)
   ↓
7. Generate JWT token
   ↓
8. Return { user, token }
   ↓
9. Frontend: Store token in localStorage
   ↓
10. Frontend: Update authStore state
   ↓
11. Frontend: Redirect to dashboard
```

### Protected Route Access Flow
```
1. User navigates to /dashboard
   ↓
2. React Router: Check <PrivateRoute>
   ↓
3. Check authStore.isAuthenticated
   ↓
4. If false → Redirect to /login
   ↓
5. If true → Render Dashboard component
   ↓
6. Dashboard: Load data from API
   ↓
7. Axios: Add Authorization header (interceptor)
   ↓
8. API: GET /api/progress/dashboard
   ↓
9. Backend: authenticate middleware
   ↓
10. passport.authenticate('jwt')
    ↓
11. Verify token signature
    ↓
12. Extract user from payload
    ↓
13. Attach user to req.user
    ↓
14. Continue to route handler
    ↓
15. Return dashboard data
```

---

## ✨ Key Benefits

✅ **Industry Standard**: Passport.js is battle-tested  
✅ **Secure**: Bcrypt + JWT + Best practices  
✅ **Scalable**: Stateless authentication  
✅ **Flexible**: Easy to add OAuth, 2FA, etc.  
✅ **Type-Safe**: Full TypeScript support  
✅ **Maintainable**: Clean separation of concerns  
✅ **Production-Ready**: Error handling, validation, logging  

---

## 🔮 Future Enhancements

- [ ] OAuth2 (Google, GitHub, Facebook)
- [ ] Two-Factor Authentication (2FA)
- [ ] Password reset via email
- [ ] Email verification
- [ ] Token refresh strategy
- [ ] Token blacklisting (for logout)
- [ ] Rate limiting on auth endpoints
- [ ] Account lockout after failed attempts
- [ ] Remember me functionality
- [ ] Session management dashboard

---

**✅ Authentication & Authorization: FULLY IMPLEMENTED**
