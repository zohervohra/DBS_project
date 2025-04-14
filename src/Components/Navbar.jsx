import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../client';
import { FaHome, FaUserEdit, FaTable, FaChartLine, FaUser, FaSignOutAlt, FaSignInAlt, FaUserPlus } from 'react-icons/fa';
import vedantaLogo from '../assets/logo-vedanta(2).png';
const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();

    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
    setUser(null);
    setIsOpen(false); // Close mobile menu on logout
  };

  // Close mobile menu when navigating
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'py-2 bg-primary/90 backdrop-blur-sm shadow-lg' : 'py-4 bg-primary'} border-b-2 border-neutral`}>
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link to="/" className="flex items-center">
          {/* Logo with optional text */}
          {/* Logo image */}
          <img 
            src={vedantaLogo} 
            alt="Vedanta Foundation Logo"
            className="h-16 w-50 mr-3 object-contain rounded" 
          />
          {/* <span className="text-2xl font-bold text-primary-content hidden md:block">Vedanta Foundation</span> */}
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          <NavLink to="/" icon={<FaHome />} text="Home" />
          <NavLink to="/form" icon={<FaUserEdit />} text="Student Form" />
          <NavLink to="/table" icon={<FaTable />} text="Records" />
          <NavLink to="/analytics" icon={<FaChartLine />} text="Analytics" />
          
          {user ? (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center">
                  <FaUser className="text-white text-sm" />
                </div>
                <span className="text-primary-content">{user.email?.split('@')[0]}</span>
              </div>
              <button 
                onClick={handleLogout} 
                className="flex items-center space-x-1 text-primary-content hover:text-secondary-content transition-colors duration-300"
              >
                <FaSignOutAlt />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <NavLink to="/login" icon={<FaSignInAlt />} text="Login" />
              <NavLink to="/signup" icon={<FaUserPlus />} text="Sign Up" isButton />
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden">
          <button 
            onClick={() => setIsOpen(!isOpen)} 
            className="text-primary-content focus:outline-none"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className={`md:hidden ${isOpen ? 'block' : 'hidden'} bg-primary transition-all duration-300`}>
        <div className="container mx-auto px-4 py-3 flex flex-col space-y-3">
          <MobileNavLink to="/" icon={<FaHome />} text="Home" />
          <MobileNavLink to="/form" icon={<FaUserEdit />} text="Student Form" />
          <MobileNavLink to="/table" icon={<FaTable />} text="Students" />
          <MobileNavLink to="/analytics" icon={<FaChartLine />} text="Analytics" />
          
          {user ? (
            <>
              <div className="flex items-center space-x-2 px-4 py-2 text-primary-content">
                <div className="h-6 w-6 rounded-full bg-accent flex items-center justify-center">
                  <FaUser className="text-white text-xs" />
                </div>
                <span>{user.email?.split('@')[0]}</span>
              </div>
              <button 
                onClick={handleLogout} 
                className="flex items-center space-x-2 px-4 py-2 text-primary-content hover:text-secondary-content transition-colors duration-300"
              >
                <FaSignOutAlt />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              <MobileNavLink to="/login" icon={<FaSignInAlt />} text="Login" />
              <MobileNavLink to="/signup" icon={<FaUserPlus />} text="Sign Up" isButton />
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

// Reusable NavLink component for desktop
const NavLink = ({ to, icon, text, isButton = false }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link
      to={to}
      className={`flex items-center space-x-1 transition-colors duration-300 ${
        isActive 
          ? 'text-secondary-content font-semibold' 
          : 'text-primary-content hover:text-secondary-content'
      } ${isButton ? 'bg-accent hover:bg-accent-focus px-4 py-2 rounded-lg' : ''}`}
    >
      {icon}
      <span>{text}</span>
    </Link>
  );
};

// Reusable MobileNavLink component
const MobileNavLink = ({ to, icon, text, isButton = false }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link
      to={to}
      className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors duration-300 ${
        isActive 
          ? 'bg-neutral/20 text-secondary-content font-semibold' 
          : 'text-primary-content hover:bg-neutral/10 hover:text-secondary-content'
      } ${isButton ? 'bg-accent hover:bg-accent-focus' : ''}`}
    >
      <span className="text-lg">{icon}</span>
      <span>{text}</span>
    </Link>
  );
};

export default Navbar;