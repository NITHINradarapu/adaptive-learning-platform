# 🔐 Passport.js Authentication Implementation

## ✅ Implementation Complete

This project now uses **Passport.js** for authentication with the following strategies:

### 📦 Installed Packages
- `passport` - Authentication middleware
- `passport-local` - Local username/password strategy
- `passport-jwt` - JWT token strategy
- `express-session` - Session management (optional)
- `@types/*` - TypeScript type definitions

---

## 🏗️ Architecture

### 1. **Passport Configuration** ([config/passport.ts](src/config/passport.ts))

Three strategies implemented:

#### **Local-Login Strategy**
- Authenticates users with email and password
- Validates credentials against database
- Returns user object on success

#### **Local-Register Strategy**
- Creates new user accounts
- Checks for existing users
- Hashes password automatically (via User model)
- Returns newly created user

#### **JWT Strategy**
- Validates JWT tokens from Authorization header
- Extracts user from token payload
- Protects routes requiring authentication

### 2. **Authentication Controller** ([controllers/authController.ts](src/controllers/authController.ts))

Updated to use Passport middleware:

#### **register()**
```typescript
passport.authenticate('local-register', { session: false })
```
- Uses Passport local-register strategy
- Creates new user account
- Generates JWT token
- Returns user data and token

#### **login()**
```typescript
passport.authenticate('local-login', { session: false })
```
- Uses Passport local-login strategy
- Validates credentials
- Generates JWT token
- Returns user data and token

#### **logout()**
- Returns success response
- Client-side token removal handles actual logout
- Can be extended with token blacklisting

#### **getMe()** (Protected)
- Retrieves current user profile
- Requires authentication

#### **updateProfile()** (Protected)
- Updates user profile information
- Requires authentication

### 3. **Authentication Middleware** ([middleware/auth.ts](src/middleware/auth.ts))

#### **authenticate**
```typescript
passport.authenticate('jwt', { session: false })
```
- Validates JWT token from Authorization header
- Attaches user object to request
- Rejects invalid/expired tokens

#### **authorize(...roles)**
- Role-based access control
- Checks user role against allowed roles
- Returns 403 if unauthorized

### 4. **Server Configuration** ([server.ts](src/server.ts))

```typescript
import passportConfig from './config/passport';
app.use(passportConfig.initialize());
```
- Initializes Passport middleware
- Must be called before routes

---

## 🔌 API Endpoints

### Public Routes

#### **POST /api/auth/register**
Register a new user
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

Response:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### **POST /api/auth/login**
Login with email and password
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

Response:
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

### Protected Routes (Require JWT Token)

#### **GET /api/auth/me**
Get current user profile
- Headers: `Authorization: Bearer <token>`

#### **POST /api/auth/logout**
Logout user
- Headers: `Authorization: Bearer <token>`

#### **PUT /api/auth/profile**
Update user profile
- Headers: `Authorization: Bearer <token>`
```json
{
  "name": "Jane Doe",
  "learnerBackground": "intermediate",
  "careerGoal": "Data Analyst"
}
```

---

## 🔑 How It Works

### 1. **Registration Flow**
```
Client → POST /api/auth/register
  ↓
passport.authenticate('local-register')
  ↓
Check if email exists
  ↓
Create user in database (password auto-hashed)
  ↓
Generate JWT token
  ↓
Return user + token
```

### 2. **Login Flow**
```
Client → POST /api/auth/login
  ↓
passport.authenticate('local-login')
  ↓
Find user by email
  ↓
Compare password (bcrypt)
  ↓
Generate JWT token
  ↓
Return user + token
```

### 3. **Protected Route Flow**
```
Client → Request with Authorization: Bearer <token>
  ↓
authenticate middleware
  ↓
passport.authenticate('jwt')
  ↓
Verify token signature
  ↓
Extract user from payload
  ↓
Attach user to req.user
  ↓
Continue to route handler
```

### 4. **Logout Flow**
```
Client → POST /api/auth/logout
  ↓
authenticate middleware (verify token)
  ↓
Return success response
  ↓
Client removes token from storage
```

---

## 🛡️ Security Features

1. **Password Hashing**
   - Bcrypt with salt rounds
   - Passwords never stored in plain text

2. **JWT Tokens**
   - Signed with secret key
   - Includes expiration time
   - Stateless authentication

3. **Session-less Authentication**
   - `{ session: false }` in all strategies
   - No server-side session storage
   - Fully stateless and scalable

4. **Role-Based Access Control**
   - `authorize(...roles)` middleware
   - Granular permission control

5. **Input Validation**
   - Email format validation
   - Password length requirements
   - User existence checks

---

## 🧪 Testing

### Using cURL

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

**Get Profile:**
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Logout:**
```bash
curl -X POST http://localhost:5000/api/auth/logout \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 📝 Frontend Integration

No changes needed to the frontend! The JWT token flow remains the same:

1. **Login/Register**: Store token in localStorage
2. **API Requests**: Include token in Authorization header
3. **Logout**: Remove token from localStorage

The existing frontend code is fully compatible.

---

## 🎯 Key Benefits

✅ **Industry Standard**: Passport.js is the de-facto authentication middleware for Node.js  
✅ **Flexible**: Easy to add more strategies (Google OAuth, Facebook, etc.)  
✅ **Secure**: Battle-tested authentication flows  
✅ **Scalable**: Stateless JWT authentication  
✅ **Type-Safe**: Full TypeScript support  
✅ **Modular**: Clean separation of concerns  

---

## 🔮 Future Enhancements

- **OAuth2 Integration** (Google, GitHub, Facebook)
- **Two-Factor Authentication (2FA)**
- **Token Refresh Strategy**
- **Token Blacklisting** for logout
- **Rate Limiting** on auth endpoints
- **Account Verification** via email
- **Password Reset** functionality

---

## 📚 References

- [Passport.js Documentation](http://www.passportjs.org/)
- [Passport-Local Strategy](http://www.passportjs.org/packages/passport-local/)
- [Passport-JWT Strategy](http://www.passportjs.org/packages/passport-jwt/)

---

✨ **Authentication is now powered by Passport.js!**
