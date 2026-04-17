import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import { useTheme } from '../context/ThemeContext';
import { LogOut, User, LayoutDashboard, ClipboardList, Sun, Moon } from 'lucide-react';
import Logo from './Logo';

const Navbar = () => {
  const { user, logout, isAdmin, isStudent } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  if (!user) return null;

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

          <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-2xl border border-gray-100 dark:border-gray-600 shadow-sm">
            <div className="w-7 h-7 bg-gradient-to-tr from-orange-400 to-orange-600 rounded-lg flex items-center justify-center text-[11px] text-white font-black uppercase">
              {user.name.charAt(0)}
            </div>
            <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{user.name}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-lg uppercase font-black tracking-tighter ${isAdmin ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600' : 'bg-green-100 dark:bg-green-900/30 text-green-600'}`}>
              {user.role}
            </span>
          </div>
          
          <button 
            onClick={logout}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
