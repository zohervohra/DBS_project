// Import Supabase client
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL; // Your Supabase project URL
const supabaseKey = process.env.SUPABASE_KEY; // Your Supabase public or private key
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Middleware to validate user token and check role
 * @returns {Object} - Returns user role or error
 */
const middleware = async () => {
  try {
    // Step 1: Retrieve the token from local storage
    const token = localStorage.getItem('supabase_token');

    if (!token) {
      throw new Error('No token found in local storage');
    }

    // Step 2: Verify the user's token
    const { data: user, error: authError } = await supabase.auth.getUser(token);

    if (authError) {
      throw new Error('Invalid token: User not authenticated');
    }

    // Step 3: Fetch the user's role from the database
    const { data: roleData, error: roleError } = await supabase
      .from('users') // Replace 'users' with your table name
      .select('role')
      .eq('id', user.id) // Assuming 'id' is the primary key in your users table
      .single();

    if (roleError) {
      throw new Error('Failed to fetch user role');
    }

    // Step 4: Check the user's role
    const userRole = roleData.role;

    if (userRole === 'admin' || userRole === 'center_head') {
      return {
        isValid: true,
        role: userRole,
        userId: user.id,
      };
    } else {
      throw new Error('User does not have required permissions');
    }
  } catch (error) {
    console.error('Middleware error:', error.message);
    return {
      isValid: false,
      error: error.message,
    };
  }
};

export default middleware;