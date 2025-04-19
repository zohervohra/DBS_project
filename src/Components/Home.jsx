import { Link } from 'react-router-dom';
import vedantaLogo from '../assets/logo-vedanta(2).png';

const Home = () => {
  const features = [
    {
      icon: '📝',
      title: 'Student Registration',
      desc: 'Easily register new students with comprehensive forms',
      path: '/form'
    },
    {
      icon: '📊',
      title: 'Data Management',
      desc: 'View and manage all student records in one place',
      path: '/table'
    },
    {
      icon: '📈',
      title: 'Advanced Analytics',
      desc: 'Track and analyze student performance metrics',
      path: '/analytics'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Hero Section */}
      <section className="flex-grow flex flex-col px-4 py-12 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img 
            src={vedantaLogo} 
            alt="Vedanta Foundation Logo"
            className="h-32 w-auto rounded-lg"
          />
        </div>

        {/* Centered Content */}
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            Welcome to Vedanta Foundation
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Empowering students through education and career development programs...
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/login" className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg shadow hover:bg-green-700 transition">
              Login to Your Account
            </Link>
            <Link to="/signup" className="px-6 py-3 border border-green-600 text-green-600 font-medium rounded-lg shadow hover:bg-green-50 transition">
              Create New Account
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Link 
                key={index} 
                to={feature.path}
                className="bg-gray-50 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 cursor-pointer"
              >
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
