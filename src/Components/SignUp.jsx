import {supabase} from '../client';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Custom notification component
const Notification = ({ message, type, onClose }) => {
  const bgColor = type === 'success' ? 'bg-green-100 border-green-500 text-green-700' : 
                 type === 'error' ? 'bg-red-100 border-red-500 text-red-700' : 
                 'bg-blue-100 border-blue-500 text-blue-700';
  
  return (
    <div className={`${bgColor} px-4 py-3 rounded border-l-4 relative mb-4 animate-fadeIn`} role="alert">
      <span className="block sm:inline">{message}</span>
      <button 
        onClick={onClose} 
        className="absolute top-0 bottom-0 right-0 px-4 py-3"
      >
        <svg className="fill-current h-6 w-6" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
          <title>Close</title>
          <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/>
        </svg>
      </button>
    </div>
  );
};

const Signup = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', center_name: '' });
    const [notification, setNotification] = useState(null);
    const navigate = useNavigate();

    let centers = [
      "AI Zone, Kanpur",
      "Agastya Tech Zone Computer Institute, Myorpur, Duddhi, Sonbhadra",
      "Algavadi Village Panchayat",
      "Bhadohi Girls Intermediate School ,Near Post Office, Bhadohi",
      "Bicholim Village Panchayat",
      "Cuncolim Education Society",
      "DDB Tutorials - Pandeypur, Varanasi",
      "Danisara Foundation - Tailoring",
      "GIST",
      "Hireguntoor Computer  centre",
      "Hireguntoor Tailoring  centre",
      "Hirekenwadi Villae Panchayat",
      "IPDP",
      "K.V Computer Education, 1 DevnathPur ,Bhadohi",
      "Karntaka Skills Centre",
      "MB Computer Institute, Narayanpur, Mirzapur.",
      "Maharudra Association Society - II, Siripur, Mirzapur",
      "Maharudra Association Society, Suklaha, Mirzapur",
      "Mallphanatti Village Panchayat",
      "Malviya Classes - Sona Talab, Panchkoshi, Varanasi",
      "Mayem Village Panchayat",
      "Meghally Village Panchayat",
      "Mh Skill Centres ( Computer/Tailoring/Beautician)",
      "Muttudooru Village Panchayat",
      "Navelim Village Panchayat",
      "New Tailorng centre",
      "R.K Computer Education, Manda, Prayagraj",
      "R.R.COLONY ( Jharsuguda)",
      "RRC Centre - HZL - Zawar Mines , Udaipur",
      "Righ to Live Computer/Tailoring Centre",
      "S&G Computer Education Centre - Hathua Market,Varanasi",
      "Sesa technical Schools",
      "Sirigere Village Panchayat",
      "Solver Solutions, Naveen Market, Mirzapur",
      "Super Tech Computer Institute, Gopiganj, Bhadohi ",
      "Super Tech Computer Institute, Gyanpur, Bhadohi",
      "TSPL - RAIPUR",
      "VIT Classes Bardah ,Azamgarh",
      "VTC  Jalna Ambad",
      "VTC  Jalna Ankushnagar",
      "VTC  Jalna Barawale",
      "VTC  Jalna Tirthpuri",
      "VTC Vithalwadi",
      "Vedanta Girls PG College - Ringas",
      "Vidyaprabhodini College"
    ];

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const validateForm = () => {
      // Password length validation
      if (formData.password.length < 6) {
        setNotification({
          type: 'error',
          message: 'Password must be at least 6 characters long'
        });
        return false;
      }
      
      // Name validation
      if (formData.name.trim().length < 2) {
        setNotification({
          type: 'error',
          message: 'Please enter a valid name'
        });
        return false;
      }
      
      return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Form validation
        if (!validateForm()) {
          return;
        }
      
        const { email, password, name, center_name } = formData;
      
        try {
          // Step 1: Sign up the user in Supabase Auth
          const { data, error } = await supabase.auth.signUp({ email, password });
          
          if (error) {
            // Handle specific error cases
            if (error.message.includes('already registered')) {
              setNotification({
                type: 'error',
                message: 'This email is already registered. Please use another email or sign in.'
              });
            } else {
              setNotification({
                type: 'error',
                message: `Signup error: ${error.message}`
              });
            }
            return;
          }
          
          // Step 2: Get the newly created user's ID
          const userId = data.user?.id;
          if (!userId) {
            setNotification({
              type: 'error',
              message: 'User ID not found after signup. Please try again.'
            });
            return;
          }
          
          // Step 3: Store user details in the 'users' table
          const { error: insertError } = await supabase.from('users').insert([
            {
              id: userId,
              email: email,
              name: name,
              center_name: center_name,
              is_verified: false,
              admin: false
            },
          ]);
          
          if (insertError) {
            setNotification({
              type: 'error',
              message: `Error creating user profile: ${insertError.message}`
            });
            return;
          }
          
          // Success notification
          setNotification({
            type: 'success',
            message: 'Account created successfully! Please contact an administrator for verification before logging in.'
          });
          
          // Clear form
          setFormData({ name: '', email: '', password: '', center_name: '' });
          
          // Redirect to login after 3 seconds
          setTimeout(() => {
            navigate('/login');
          }, 6000);
          
        } catch (err) {
          setNotification({
            type: 'error',
            message: `An unexpected error occurred: ${err.message}`
          });
        }
    };

    const closeNotification = () => {
      setNotification(null);
    };

    return (
      <section className="bg-base-300">
        <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
          <div className="w-full bg-base-100 rounded-lg shadow md:mt-0 sm:max-w-md xl:p-0">
            <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
              <h1 className="text-xl font-bold leading-tight tracking-tight text-base-content md:text-2xl">
                Create an account
              </h1>
              
              {notification && (
                <Notification
                  message={notification.message}
                  type={notification.type}
                  onClose={closeNotification}
                />
              )}
              
              <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="name" className="block mb-2 text-sm font-medium text-base-content">
                    Your name
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="bg-gray-50 border border-gray-300 text-base-content rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                    placeholder="Enter your name"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block mb-2 text-sm font-medium text-base-content">
                    Your email
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="bg-gray-50 border border-gray-300 text-base-content rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                    placeholder="name@company.com"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block mb-2 text-sm font-medium text-base-content">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    id="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="bg-gray-50 border border-gray-300 text-base-content rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Password must be at least 6 characters long</p>
                </div>
                <div>
                  <label htmlFor="center_name" className="block mb-2 text-sm font-medium text-base-content">
                    Center Name
                  </label>
                  <select
                    name="center_name"
                    value={formData.center_name}
                    onChange={handleChange}
                    required
                    className="w-full p-2.5 border rounded-lg bg-gray-50 text-base-content"
                  >
                    <option value="" disabled>Select a Center</option>
                    {centers.map((center, index) => (
                      <option key={index} value={center}>{center}</option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  className="bg-primary w-full text-white hover:bg-primary-200 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                >
                  Sign up
                </button>
                <p className="text-sm font-light text-gray-500">
                  Already have an account?{' '}
                  <a href="/login" className="font-medium text-primary-600 hover:underline">
                    Sign in
                  </a>
                </p>
              </form>
            </div>
          </div>
        </div>
        
        <style jsx>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fadeIn {
            animation: fadeIn 0.3s ease-in-out;
          }
        `}</style>
      </section>
    );
};

export default Signup;