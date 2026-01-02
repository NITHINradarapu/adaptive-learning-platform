import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';

interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: any;
    token: string;
  };
}

/**
 * Test Passport.js Authentication Implementation
 */
async function testAuth() {
  console.log('🧪 Testing Passport.js Authentication\n');
  
  let token = '';
  
  try {
    // Test 1: Register new user
    console.log('1️⃣ Testing Registration...');
    const registerData = {
      name: 'Passport Test User',
      email: `passporttest${Date.now()}@example.com`,
      password: 'testpassword123',
      learnerBackground: 'beginner',
      careerGoal: 'Software Developer'
    };
    
    const registerRes = await axios.post<AuthResponse>(`${API_URL}/register`, registerData);
    
    if (registerRes.data.success && registerRes.data.data?.token) {
      console.log('✅ Registration successful');
      console.log(`   User: ${registerRes.data.data.user.name}`);
      console.log(`   Email: ${registerRes.data.data.user.email}`);
      token = registerRes.data.data.token;
    } else {
      console.log('❌ Registration failed');
      return;
    }
    
    // Test 2: Login
    console.log('\n2️⃣ Testing Login...');
    const loginRes = await axios.post<AuthResponse>(`${API_URL}/login`, {
      email: registerData.email,
      password: registerData.password
    });
    
    if (loginRes.data.success && loginRes.data.data?.token) {
      console.log('✅ Login successful');
      token = loginRes.data.data.token;
    } else {
      console.log('❌ Login failed');
      return;
    }
    
    // Test 3: Get current user (protected route)
    console.log('\n3️⃣ Testing Protected Route (GET /me)...');
    const meRes = await axios.get(`${API_URL}/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (meRes.data.success) {
      console.log('✅ Protected route accessible');
      console.log(`   User ID: ${meRes.data.data.user.id}`);
      console.log(`   Name: ${meRes.data.data.user.name}`);
    } else {
      console.log('❌ Failed to access protected route');
      return;
    }
    
    // Test 4: Update profile
    console.log('\n4️⃣ Testing Profile Update...');
    const updateRes = await axios.put(`${API_URL}/profile`, {
      name: 'Updated Passport User',
      learnerBackground: 'intermediate'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (updateRes.data.success) {
      console.log('✅ Profile updated successfully');
      console.log(`   New name: ${updateRes.data.data.user.name}`);
    } else {
      console.log('❌ Profile update failed');
    }
    
    // Test 5: Logout
    console.log('\n5️⃣ Testing Logout...');
    const logoutRes = await axios.post(`${API_URL}/logout`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (logoutRes.data.success) {
      console.log('✅ Logout successful');
    } else {
      console.log('❌ Logout failed');
    }
    
    // Test 6: Invalid credentials
    console.log('\n6️⃣ Testing Invalid Login...');
    try {
      await axios.post(`${API_URL}/login`, {
        email: registerData.email,
        password: 'wrongpassword'
      });
      console.log('❌ Should have failed with invalid credentials');
    } catch (error: any) {
      if (error.response?.status === 401) {
        console.log('✅ Correctly rejected invalid credentials');
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }
    
    // Test 7: Access without token
    console.log('\n7️⃣ Testing Unauthorized Access...');
    try {
      await axios.get(`${API_URL}/me`);
      console.log('❌ Should have failed without token');
    } catch (error: any) {
      if (error.response?.status === 401) {
        console.log('✅ Correctly rejected request without token');
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }
    
    console.log('\n✨ All tests completed!\n');
    
  } catch (error: any) {
    console.error('\n❌ Test failed:', error.response?.data || error.message);
  }
}

// Run tests
console.log('⚠️  Make sure the backend server is running on http://localhost:5000\n');
testAuth();
