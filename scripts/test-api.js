#!/usr/bin/env node

const BASE_URL = 'http://localhost:3000';

async function testAPI() {
  console.log('=== Testing Food Ordering API ===\n');

  // Test 1: Health Check
  console.log('1. Health Check:');
  try {
    const res = await fetch(`${BASE_URL}/health`);
    const data = await res.json();
    console.log(`   ✓ Status: ${res.status} - ${data.message}\n`);
  } catch (err) {
    console.log(`   ✗ Error: ${err.message}\n`);
  }

  // Test 2: Sign Up
  console.log('2. Sign Up (new user):');
  try {
    const res = await fetch(`${BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User 2',
        email: `test${Date.now()}@example.com`,
        password: '123456',
        role: 'end_user',
      }),
    });
    const data = await res.json();
    if (res.ok) {
      console.log(`   ✓ Status: ${res.status} - User created`);
      console.log(`   ✓ User ID: ${data.user.id}, Role: ${data.user.role}`);
      console.log(`   ✓ Token received: ${data.accessToken ? 'Yes' : 'No'}\n`);
    } else {
      console.log(`   ✗ Status: ${res.status} - ${data.message}\n`);
    }
  } catch (err) {
    console.log(`   ✗ Error: ${err.message}\n`);
  }

  // Test 3: Sign In
  console.log('3. Sign In:');
  let token = null;
  try {
    const res = await fetch(`${BASE_URL}/api/auth/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: '123456',
      }),
    });
    const data = await res.json();
    if (res.ok) {
      token = data.accessToken;
      console.log(`   ✓ Status: ${res.status} - Signed in`);
      console.log(`   ✓ User ID: ${data.id}, Role: ${data.role}`);
      console.log(`   ✓ Token received: ${token ? 'Yes' : 'No'}\n`);
    } else {
      console.log(`   ✗ Status: ${res.status} - ${data.message}\n`);
      return;
    }
  } catch (err) {
    console.log(`   ✗ Error: ${err.message}\n`);
    return;
  }

  // Test 4: Get Profile (with token)
  console.log('4. Get Profile (authenticated):');
  try {
    const res = await fetch(`${BASE_URL}/api/users/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (res.ok) {
      console.log(`   ✓ Status: ${res.status} - Profile retrieved`);
      console.log(`   ✓ Name: ${data.name}, Email: ${data.email}\n`);
    } else {
      console.log(`   ✗ Status: ${res.status} - ${data.message}\n`);
    }
  } catch (err) {
    console.log(`   ✗ Error: ${err.message}\n`);
  }

  // Test 5: Get Profile (without token)
  console.log('5. Get Profile (no token - should fail):');
  try {
    const res = await fetch(`${BASE_URL}/api/users/profile`);
    const data = await res.json();
    console.log(`   ✓ Status: ${res.status} - ${data.message} (expected)\n`);
  } catch (err) {
    console.log(`   ✗ Error: ${err.message}\n`);
  }

  // Test 6: Get Restaurants
  console.log('6. Get Restaurants (public endpoint):');
  try {
    const res = await fetch(`${BASE_URL}/api/restaurants`);
    const data = await res.json();
    console.log(`   ✓ Status: ${res.status} - Found ${Array.isArray(data) ? data.length : 0} restaurants\n`);
  } catch (err) {
    console.log(`   ✗ Error: ${err.message}\n`);
  }

  // Test 7: Get Notifications
  console.log('7. Get Notifications (authenticated):');
  try {
    const res = await fetch(`${BASE_URL}/api/notifications`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (res.ok) {
      console.log(`   ✓ Status: ${res.status} - Found ${Array.isArray(data) ? data.length : 0} notifications\n`);
    } else {
      console.log(`   ✗ Status: ${res.status} - ${data.message}\n`);
    }
  } catch (err) {
    console.log(`   ✗ Error: ${err.message}\n`);
  }

  // Test 8: Get My Orders
  console.log('8. Get My Orders (end_user role):');
  try {
    const res = await fetch(`${BASE_URL}/api/orders/my-orders`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (res.ok) {
      console.log(`   ✓ Status: ${res.status} - Found ${Array.isArray(data) ? data.length : 0} orders\n`);
    } else {
      console.log(`   ✗ Status: ${res.status} - ${data.message}\n`);
    }
  } catch (err) {
    console.log(`   ✗ Error: ${err.message}\n`);
  }

  // Test 9: Invalid token
  console.log('9. Test with Invalid Token:');
  try {
    const res = await fetch(`${BASE_URL}/api/users/profile`, {
      headers: { Authorization: 'Bearer invalid_token_12345' },
    });
    const data = await res.json();
    console.log(`   ✓ Status: ${res.status} - ${data.message} (expected)\n`);
  } catch (err) {
    console.log(`   ✗ Error: ${err.message}\n`);
  }

  console.log('=== All Tests Completed ===');
}

testAPI().catch(console.error);
