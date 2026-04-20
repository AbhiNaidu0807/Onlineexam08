import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import { useTheme } from '../context/ThemeContext';
import { LogOut, User, LayoutDashboard, ClipboardList, Sun, Moon, ChevronDown, UserCircle, Settings } from 'lucide-react';
import Logo from './Logo';

const Navbar = () => {
  const { user, logout, isAdmin, isStudent } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  const getBaseDomain = () => {
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    return apiBase.replace(/\/api$/, '');
  };
  
  const baseUrl = getBaseDomain();
  const profilePhotoUrl = user.profile_photo ? (user.profile_photo.startsWith('http') ? user.profile_photo : `${baseUrl}${user.profile_photo}`) : null;

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 sticky top-0 z-50 transition-colors duration-300">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to={isAdmin ? "/admin" : "/student"} className="flex items-center gap-3 group">
          <Logo size={40} />
          <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
            Eagle<span className="text-orange-500">Exam</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {isStudent && (
            <>
              <Link to="/student" className="text-gray-600 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 font-bold transition-colors">Dashboard</Link>
              <Link to="/student/exams" className="px-4 py-1.5 bg-orange-500 text-white rounded-full text-sm font-black shadow-lg shadow-orange-100 hover:bg-orange-600 transition-all">Exams</Link>
              <Link to="/student/history" className="text-gray-600 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 font-bold transition-colors">Results</Link>
            </>
          )}
          {isAdmin && (
            <>
              <Link to="/admin" className="text-gray-600 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 font-bold transition-colors">Dashboard</Link>
              <Link to="/admin/students" className="text-gray-600 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 font-bold transition-colors">Students</Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={toggleTheme}
            className="p-2.5 text-gray-500 dark:text-gray-400 hover:bg-orange-50 dark:hover:bg-gray-700 rounded-xl transition-all active:scale-90"
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDarkMode ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5" />}
          </button>

          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-gray-700 rounded-2xl border border-gray-100 dark:border-gray-600 shadow-sm hover:border-orange-200 dark:hover:border-orange-900 transition-all"
            >
              {profilePhotoUrl ? (
                <img src={profilePhotoUrl} alt="Profile" className="w-8 h-8 rounded-lg object-cover border border-gray-200 dark:border-gray-500" />
              ) : (
                <div className="w-8 h-8 bg-gradient-to-tr from-orange-400 to-orange-600 rounded-lg flex items-center justify-center text-[12px] text-white font-black uppercase">
                  {user.name.charAt(0)}
                </div>
              )}
              <div className="hidden sm:block text-left mr-1">
                <p className="text-xs font-black text-gray-800 dark:text-gray-200 leading-none mb-0.5">{user.name}</p>
                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">{user.role}</p>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 py-2 animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-50 dark:border-gray-700 mb-2">
                   <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-1">Identity Core</p>
                   <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user.email}</p>
                </div>

                <button 
                  onClick={() => { navigate(isStudent ? '/student/profile' : '/admin/profile'); setIsDropdownOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-gray-700 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                >
                  <UserCircle className="w-5 h-5" />
                  My Profile
                </button>

                <div className="h-px bg-gray-50 dark:bg-gray-700 my-2" />

                <button 
                  onClick={() => { logout(); setIsDropdownOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
