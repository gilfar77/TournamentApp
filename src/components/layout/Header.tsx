import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, Trophy } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signIn, logOut } = useAuth();
  const location = useLocation();

  const navigation = [
    { name: 'ראשי', path: '/' },
    { name: 'טורנירים', path: '/tournaments' },
    { name: 'תוצאות חיות', path: '/live' },
    { name: 'טבלת דירוג', path: '/standings' },
    { name: 'שחקנים', path: '/players' },
    { name: 'גלריה', path: '/gallery' },
    { name: 'ניהול', path: '/admin', requireAdmin: true },
  ];

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const filteredNavigation = navigation.filter(item => {
    if (item.requireAdmin) return user?.isAdmin;
    return true;
  });

  return (
    <header className="bg-primary-500 text-white shadow-header sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <div className="w-16 h-16 flex items-center justify-center">
                <img 
                  src="/logo_sport.png" 
                  alt="סיירת כרמלי" 
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="mr-2 font-bold text-xl">יום ספורט סיירת כרמלי</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {filteredNavigation.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`text-base font-medium transition-colors hover:text-secondary-400 mx-4 ${
                  location.pathname === item.path ? 'text-secondary-400' : 'text-white'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center">
            {user ? (
              <div className="flex items-center">
                {user.photoURL && (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="h-8 w-8 rounded-full mr-2"
                  />
                )}
                <div className="relative group">
                  <button className="flex items-center text-white hover:text-secondary-400">
                    <span className="mr-1">{user.displayName || user.email}</span>
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-dropdown opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-left">
                    <div className="py-1">
                      <button
                        onClick={logOut}
                        className="block w-full text-right px-4 py-2 text-sm text-accent-700 hover:bg-secondary-50"
                      >
                        התנתק
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <Button onClick={signIn} variant="secondary">
                התחברות
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="text-white hover:text-secondary-400 focus:outline-none"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-primary-600 animate-in">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {filteredNavigation.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  location.pathname === item.path
                    ? 'bg-primary-700 text-secondary-400'
                    : 'text-white hover:bg-primary-700 hover:text-secondary-400'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </div>
          <div className="pt-4 pb-3 border-t border-primary-700">
            {user ? (
              <div className="flex items-center px-5">
                {user.photoURL && (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="h-8 w-8 rounded-full mr-3"
                  />
                )}
                <div className="mr-3">
                  <div className="text-base font-medium text-white">
                    {user.displayName || user.email}
                  </div>
                  <div className="text-sm font-medium text-primary-300">{user.email}</div>
                </div>
                <button
                  onClick={logOut}
                  className="mr-auto bg-primary-700 flex items-center justify-center p-2 rounded-md text-primary-200 hover:text-white hover:bg-primary-800"
                >
                  התנתק
                </button>
              </div>
            ) : (
              <div className="px-5">
                <Button onClick={signIn} variant="secondary" className="w-full">
                  התחברות
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;