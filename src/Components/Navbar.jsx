import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../client'; // Import the Supabase client
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    // navigate to login page
    navigate('/login');
    setUser(null);
  };

  return (
    <nav className="flex justify-between items-center p-4 bg-primary border-b-2 border-neutral">
      <div className="flex items-center justify-center">
        {/* <img alt="Logo" className="h-12 w-12 mr-3 rounded-full" />
        {!isOpen && 
        <span className="text-3xl font-mono font-bold text-primary-content">ProjectX</span>
        } */}
      </div>
      <div className="flex items-center space-x-4">
        <div className="md:hidden">
          <button onClick={() => setIsOpen(!isOpen)} className="text-primary-content focus:outline-none">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}></path>
            </svg>
          </button>
        </div>
      </div>
      <div className={`flex-col items-center justify-center md:flex md:flex-row space-y-4 md:space-y-0 md:space-x-6 ${isOpen ? 'flex' : 'hidden'}`}>
        <Link to="/" className="text-xl text-primary-content hover:text-secondary-content transition-colors duration-300">Home</Link>
        <Link to="/form" className="text-xl text-primary-content hover:text-secondary-content transition-colors duration-300">Student Form</Link>
        <Link to="/table" className="text-xl text-primary-content hover:text-secondary-content transition-colors duration-300">Students Table</Link>
        <Link to="/analytics" className="text-xl text-primary-content hover:text-secondary-content transition-colors duration-300">Analytics</Link>
        {user ? (
          <button onClick={handleLogout} className="text-xl text-primary-content hover:text-secondary-content transition-colors duration-300">Logout</button>
        ) : (
          <>
            <Link to="/login" className="text-xl text-primary-content hover:text-secondary-content transition-colors duration-300">Login</Link>
            <Link to="/signup" className="text-xl text-primary-content hover:text-secondary-content transition-colors duration-300">Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
