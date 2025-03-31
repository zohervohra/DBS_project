import {supabase} from '../client';
import { useState } from 'react';

const Signup = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', center_name: '' });
    const [error, setError] = useState(null);

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
  ]
  



    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
      
        const { email, password, name, center_name } = formData;
      
        // Step 1: Sign up the user in Supabase Auth
        const { data, error } = await supabase.auth.signUp({ email, password });
      
        if (error) {
          console.error('Signup error:', error.message);
          return;
        }
      
        // Step 2: Get the newly created user's ID
        const userId = data.user?.id;
        if (!userId) {
          console.error('User ID not found after signup');
          return;
        }
      
        // Step 3: Store user details in the 'users' table
        const { data: userData, error: insertError } = await supabase.from('users').insert([
          {
            id: userId,       // Same as auth user ID
            email: email,
            name: name,
            center_name: center_name,
            is_verified: false,  // Default: user must be manually verified
            admin : false
          },
        ]);
      
        if (insertError) {
          console.error('Error inserting user into database:', insertError.message);
          return;
        }
      
        console.log('User signed up successfully. Awaiting verification:', userData);
      };

    return (
      <section className="bg-base-300">
        <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
          <div className="w-full bg-base-100 rounded-lg shadow md:mt-0 sm:max-w-md xl:p-0">
            <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
              <h1 className="text-xl font-bold leading-tight tracking-tight text-base-content md:text-2xl">
                Create an account
              </h1>
              {error && <p className="text-red-500 text-sm">{error}</p>}
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
                  <a href="#" className="font-medium text-primary-600 hover:underline">
                    Sign in
                  </a>
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>
    );
};

export default Signup;