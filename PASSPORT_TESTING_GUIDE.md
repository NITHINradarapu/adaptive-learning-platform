# 🎯 Quick Start: Testing Passport.js Authentication

## Prerequisites
- MongoDB running on `mongodb://localhost:27017/adaptive-learning`
- Backend server NOT yet started

## Step 1: Start the Backend Server

Open a terminal and run:
```bash
cd backend
npm run dev
```

You should see:
```
╔═══════════════════════════════════════════════════════╗
║  Adaptive Lifelong Learning Platform API             ║
║  Server running in development mode                   ║
║  Port: 5000                                           ║
║  API Base URL: http://localhost:5000/api             ║
╚═══════════════════════════════════════════════════════╝
MongoDB Connected: localhost
```

## Step 2: Test Authentication

Open another terminal and run:
```bash
cd backend
npm run test:auth
```

This will automatically test:
1. ✅ User registration with Passport local-register strategy
2. ✅ User login with Passport local-login strategy
3. ✅ Protected route access with JWT strategy
4. ✅ Profile updates
5. ✅ Logout functionality
6. ✅ Invalid credentials handling
7. ✅ Unauthorized access prevention

## Step 3: Manual Testing with cURL or Postman

### Register a New User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"John Doe\",
    \"email\": \"john@example.com\",
    \"password\": \"password123\",
    \"learnerBackground\": \"beginner\",
    \"careerGoal\": \"Software Developer\"
  }"
```

Expected Response:
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

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"john@example.com\",
    \"password\": \"password123\"
  }"
```

### Access Protected Route
Replace `YOUR_TOKEN` with the token from login/register:
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Logout
```bash
curl -X POST http://localhost:5000/api/auth/logout \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Step 4: Test with Frontend

1. Start the frontend:
```bash
cd frontend
npm start
```

2. Open http://localhost:3000

3. Register or login - it will work seamlessly with Passport!

The frontend doesn't need any changes because:
- JWT tokens are still used the same way
- API endpoints remain the same
- Token storage in localStorage is unchanged

## 🎉 Success Indicators

You'll know it's working when:
- ✅ Registration creates new users
- ✅ Login returns a JWT token
- ✅ Protected routes work with valid tokens
- ✅ Invalid tokens are rejected (401)
- ✅ Missing tokens are rejected (401)
- ✅ Wrong passwords are rejected (401)
- ✅ Duplicate emails are prevented (400)

## 🔍 Debugging

If something doesn't work:

1. **Check MongoDB is running:**
   ```bash
   mongosh
   ```

2. **Check server logs** for errors in the terminal running `npm run dev`

3. **Verify environment variables** in `backend/.env`:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/adaptive-learning
   JWT_SECRET=your_secret_key
   JWT_EXPIRE=7d
   NODE_ENV=development
   ```

4. **Check network tab** in browser DevTools to see request/response

## 📚 What Changed?

### Before (Direct JWT)
- Manual password validation
- Direct JWT token verification
- Custom authentication logic

### After (Passport.js)
- `passport.authenticate('local-login')` for login
- `passport.authenticate('local-register')` for signup
- `passport.authenticate('jwt')` for protected routes
- Industry-standard authentication patterns
- Easier to extend (OAuth, 2FA, etc.)

---

**✨ Passport.js is now successfully integrated!**
