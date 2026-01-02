# 🚀 Authentication Quick Reference

## ✅ Status: FULLY IMPLEMENTED

---

## 📋 Quick Commands

### Start Backend
```bash
cd backend
npm run dev
```
Server: http://localhost:5000

### Start Frontend
```bash
cd frontend
npm start
```
App: http://localhost:3000

### Test Auth
```bash
cd backend
npm run test:auth
```

---

## 🔑 API Endpoints

### Public
```
POST /api/auth/register  - Create account
POST /api/auth/login     - Login
```

### Protected (Requires JWT)
```
GET  /api/auth/me        - Get profile
POST /api/auth/logout    - Logout
PUT  /api/auth/profile   - Update profile
```

---

## 🛡️ Authorization Levels

| Role | Create Course | Edit Course | Delete Course |
|------|---------------|-------------|---------------|
| **Student** | ❌ | ❌ | ❌ |
| **Instructor** | ✅ | ✅ | ✅ |
| **Admin** | ✅ | ✅ | ✅ |

---

## 🔐 Security Layers

1. **Password**: Bcrypt hashing (10 rounds)
2. **Token**: JWT signed with secret
3. **Transport**: HTTPS recommended
4. **Storage**: localStorage (client-side)
5. **Headers**: Authorization: Bearer <token>

---

## 📱 Frontend Usage

### Login
```tsx
const { login } = useAuthStore();
await login(email, password);
// Auto redirects to dashboard
```

### Logout
```tsx
const { logout } = useAuthStore();
logout();
// Clears token & redirects to home
```

### Check Auth
```tsx
const { isAuthenticated, user } = useAuthStore();
if (isAuthenticated) {
  console.log(user.name);
}
```

### Protected Route
```tsx
<PrivateRoute>
  <Dashboard />
</PrivateRoute>
```

---

## 🧪 Test User

**Email**: test@gmail.com  
**Password**: password123  
**Role**: student

Or create your own via registration!

---

## 🔧 Configuration

**Backend (.env)**
```env
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
MONGODB_URI=mongodb://localhost:27017/adaptive-learning
```

**Frontend**
```env
REACT_APP_API_URL=http://localhost:5000/api
```

---

## 📚 Documentation

- **Full Guide**: [AUTHENTICATION_GUIDE.md](AUTHENTICATION_GUIDE.md)
- **Passport Details**: [backend/PASSPORT_IMPLEMENTATION.md](backend/PASSPORT_IMPLEMENTATION.md)
- **Testing Guide**: [PASSPORT_TESTING_GUIDE.md](PASSPORT_TESTING_GUIDE.md)
- **Summary**: [PASSPORT_SUMMARY.md](PASSPORT_SUMMARY.md)

---

## ✨ What's Implemented

✅ Registration with validation  
✅ Login with Passport.js  
✅ Logout functionality  
✅ JWT token authentication  
✅ Role-based authorization  
✅ Protected routes (frontend & backend)  
✅ Auto-logout on token expiration  
✅ Password hashing with bcrypt  
✅ Error handling  
✅ TypeScript throughout  

---

**Ready to use! 🎉**
