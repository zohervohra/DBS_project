'use client';

import { useState } from 'react';

import { supabase } from '../client'; // Import the Supabase client
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  // use navigate from react-router-dom to redirect to the dashboard
  const router = useNavigate();


  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
  
    const { email, password } = formData;
  
    try {
      // Authenticate with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });
  
      if (authError) {
        throw new Error(authError.message);
      }
  
      const userId = authData.user?.id;
      if (!userId) throw new Error('User ID not found after authentication.');
  
      // Fetch logged-in user data from public.users
      const { data: userData, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
  
      if (fetchError || !userData) {
        throw new Error('Failed to fetch user details. Please try again.');
      }
  
      if (!userData.is_verified) {
        throw new Error('User is not verified. Please contact admin.');
      }
  
      // Save the token to local storage
      const session = authData.session;
      if (session) {
        localStorage.setItem('supabase_token', session.access_token);
        localStorage.setItem('supabase_refresh_token', session.refresh_token);
        console.log('Token saved to local storage:', session.access_token);
      } else {
        throw new Error('No session found after login.');
      }
  
      console.log('User logged in successfully:', authData.user);
      console.log('Additional user data:', userData);
  
      // Redirect to the dashboard or another page
      router('/dashboard'); // Use the router to navigate
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <section className="bg-base-300 min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md bg-base-100 rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-base-content text-center mb-4">
          Sign in to your account
        </h1>
        
        {error && (
          <p className="text-red-500 text-sm text-center mb-4">{error}</p>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-base-content mb-1">
              Your email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-2.5 border rounded-lg bg-gray-50 text-base-content focus:ring-primary-600 focus:border-primary-600"
              placeholder="name@company.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-base-content mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-2.5 border rounded-lg bg-gray-50 text-base-content focus:ring-primary-600 focus:border-primary-600"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-primary text-white hover:bg-primary/80 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 flex justify-center items-center"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="text-sm font-light text-gray-500 text-center mt-4">
          Don’t have an account yet?{' '}
          <a href="/signup" className="font-medium text-primary-600 hover:underline">
            Sign up
          </a>
        </p>
      </div>
    </section>
  );
};

export default Login;
