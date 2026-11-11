import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Briefcase, FileText, CheckCircle, Shield, LogOut, User } from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 text-blue-600 font-bold text-xl tracking-tight">
            <Briefcase className="w-6 h-6" />
            <span>AI JobMatch</span>
          </Link>

          {/* Navigation Links */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center space-x-6 text-sm font-medium text-slate-600">
              <Link
                to="/"
                className={`hover:text-blue-600 transition-colors ${
                  isActive('/') ? 'text-blue-600 font-semibold' : ''
                }`}
              >
                Recommendations
              </Link>
              <Link
                to="/resume"
                className={`flex items-center space-x-1 hover:text-blue-600 transition-colors ${
                  isActive('/resume') ? 'text-blue-600 font-semibold' : ''
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>My Resume</span>
              </Link>
              <Link
                to="/applications"
                className={`flex items-center space-x-1 hover:text-blue-600 transition-colors ${
                  isActive('/applications') ? 'text-blue-600 font-semibold' : ''
                }`}
              >
                <CheckCircle className="w-4 h-4" />
                <span>My Applications</span>
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  className={`flex items-center space-x-1 hover:text-blue-600 transition-colors ${
                    isActive('/admin') ? 'text-blue-600 font-semibold' : ''
                  }`}
                >
                  <Shield className="w-4 h-4 text-amber-500" />
                  <span className="text-amber-600 font-semibold">Admin Panel</span>
                </Link>
              )}
            </div>
          )}

          {/* Right Action / Auth Buttons */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 bg-slate-100 py-1 px-3 rounded-full text-xs font-medium text-slate-700">
                  <User className="w-3.5 h-3.5" />
                  <span>{user?.name}</span>
                  <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-bold">
                    {user?.role}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-slate-500 hover:text-red-600 text-sm font-medium transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-sm"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
