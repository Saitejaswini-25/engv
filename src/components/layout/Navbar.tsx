import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Menu, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Logo from '../common/Logo';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setIsMenuOpen(false);
    setDropdownOpen(false);
  }, [location.pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.toLowerCase().trim();

    if (!currentUser) {
      navigate('/login');
      return;
    }

    if (query.includes('mentor')) {
      navigate('/mentorship');
    } else if (
      query.includes('web') ||
      query.includes('development') ||
      query.includes('ai') ||
      query.includes('ml') ||
      query.includes('dev') ||
      query.includes('vlsi') ||
      query.includes('VLSI')||
      query.includes('Iot')||
      query.includes('iot')||
      query.includes('IOT')||
      query.includes('dbms')||
      query.includes('Dbms')||
      query.includes('DBMS')||
      query.includes('Aptitude')||
      query.includes('aptitude')||
      query.includes('APTITUDE')
    ) {
      navigate('/sessions');
    } else if (query.includes('aptitude')) {
      navigate('/aptitude');
    } else if (query.includes('notes')) {
      navigate('/handouts');
    } else {
      alert('No matching resource found.');
    }

    setSearchQuery('');
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="container mx-auto px-2 py-2">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <Logo size="sm" />
            <span className="text-lg font-semibold text-blue-900">Engiversee</span>
          </Link>

          {/* Search Bar (disabled for unauthenticated users) */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search Opportunities"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 bg-white text-gray-700 placeholder-gray-400 text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200 transition"
                disabled={!currentUser}
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Search className="w-5 h-5" />
              </span>
            </div>
          </form>

          {/* Desktop Nav - Conditional Links */}
          <nav className="hidden md:flex items-center space-x-5">
            <Link to="/" className="text-sm">Home</Link>
            <Link to="/about" className="text-sm">About Us</Link>
            {currentUser ? (
              <Link to="/sessions" className="text-sm">Book a Session</Link>
            ) : (
              <Link to="/contact" className="text-sm">Connect</Link>
            )}
          </nav>

          {/* Desktop Auth Section or Dropdown */}
          <div className="hidden md:flex items-center ml-4">
            {!currentUser ? (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 text-sm mr-2"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                >
                  Sign Up
                </Link>
              </>
            ) : (
              <div className="relative">
                <button onClick={() => setDropdownOpen(!dropdownOpen)} className="p-2">
                  {dropdownOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg p-4 space-y-3">
                    <form onSubmit={handleSearch}>
                      <div className="relative w-full mb-2">
                        <input
                          type="text"
                          placeholder="Search Opportunities"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 bg-white text-gray-700 placeholder-gray-400 text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200 transition"
                        />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                          <Search className="w-5 h-5" />
                        </span>
                      </div>
                    </form>
                    <Link to="/profile" className="block text-sm text-gray-800">Profile</Link>
                    <Link to="/aptitude" className="block text-sm text-gray-800">Mock Tests</Link>
                    <Link to="/handouts" className="block text-sm text-gray-800">Notes</Link>
                    <Link to="/mentorship" className="block text-sm text-gray-800">Mentors</Link>
                    <Link to="/hack" className="block text-sm text-gray-800">Hack&Quiz Hub</Link>
                    <Link to="/code" className="block text-sm text-gray-800">Coding Point</Link>
                    
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left text-sm text-gray-800 hover:text-red-500"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4">
            <nav className="flex flex-col space-y-4">
              <Link to="/" className="nav-link">Home</Link>
              <Link to="/about" className="nav-link">About Us</Link>
              <Link to="/contact" className="nav-link">Connect</Link>
              {currentUser && (
                <>
                  <Link to="/sessions" className="nav-link">Book a Session</Link>
                  <Link to="/aptitude" className="nav-link">Mock Tests</Link>
                  <Link to="/handouts" className="nav-link">Notes</Link>
                  <Link to="/mentorship" className="nav-link">Mentors</Link>
                  <Link to="/hack" className="nav-link">Hack&Quiz Hub</Link>
                  <Link to="/code" className="nav-link">Coding Point</Link>
                </>
              )}
            </nav>
            <div className="mt-4 flex flex-col space-y-2">
              {currentUser ? (
                <>
                  <Link
                    to="/profile"
                    className="px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 text-center"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 text-center"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-center"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
