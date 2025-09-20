// Quick Fix Utility - Run this in the browser console (F12 → Console)
// This will immediately fix the user ID issue without waiting for the React components

console.log('🔧 Quick Fix Utility Starting...');

// Step 1: Check current localStorage
const currentUser = localStorage.getItem('user');
console.log('Current user data:', currentUser);

if (currentUser) {
  try {
    const userData = JSON.parse(currentUser);
    console.log('Current user ID:', userData.id);
    
    if (userData.id === 7) {
      console.log('🚨 Detected corrupted user ID 7!');
      
      // Step 2: Fix the user ID immediately
      const fixedUser = {
        id: 3,
        name: "Test Student",
        email: "student@academic.com",
        role: "student",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Step 3: Update localStorage
      localStorage.setItem('user', JSON.stringify(fixedUser));
      localStorage.setItem('token', 'dummy_token_3');
      
      console.log('✅ User ID fixed to:', fixedUser.id);
      console.log('✅ localStorage updated successfully');
      
      // Step 4: Reload the page
      console.log('🔄 Reloading page in 2 seconds...');
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } else {
      console.log('✅ User ID is already correct:', userData.id);
    }
  } catch (error) {
    console.error('❌ Error parsing user data:', error);
    console.log('🔧 Attempting to fix anyway...');
    
    // Force fix even if parsing fails
    const fixedUser = {
      id: 3,
      name: "Test Student",
      email: "student@academic.com",
      role: "student",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    localStorage.setItem('user', JSON.stringify(fixedUser));
    localStorage.setItem('token', 'dummy_token_3');
    
    console.log('✅ Forced user ID fix to:', fixedUser.id);
    console.log('🔄 Reloading page in 2 seconds...');
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  }
} else {
  console.log('❌ No user data found in localStorage');
  console.log('🔧 Creating new user data...');
  
  const newUser = {
    id: 3,
    name: "Test Student",
    email: "student@academic.com",
    role: "student",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  localStorage.setItem('user', JSON.stringify(newUser));
  localStorage.setItem('token', 'dummy_token_3');
  
  console.log('✅ Created new user data with ID:', newUser.id);
  console.log('🔄 Reloading page in 2 seconds...');
  setTimeout(() => {
    window.location.reload();
  }, 2000);
}

console.log('📝 Instructions:');
console.log('1. Wait for the page to reload automatically');
console.log('2. The dashboard should now work with user ID 3');
console.log('3. If it doesn\'t work, manually refresh the page');
