import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import api from '../services/api';
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  ClipboardCheck, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Trophy,
  History
} from 'lucide-react';
import Logo from './Logo';

const SidebarLink = ({ to, icon: Icon, label, active, collapsed }) => (
  <Link 
    to={to} 
    className={`flex items-center gap-4 px-4 py-3 rounded transition-all duration-200 group ${
      active 
        ? 'bg-[#1a237e] text-white' 
        : 'text-gray-600 hover:bg-gray-50 hover:text-[#1a237e]'
    }`}
  >
    <Icon className={`w-5 h-5 shrink-0 ${active ? 'text-white' : 'text-gray-400 group-hover:text-[#1a237e]'}`} />
    {!collapsed && <span className="font-bold text-[14px]">{label}</span>}
  </Link>
);

export const MainLayout = ({ children }) => {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileDropdownRef = useRef(null);

  const getBaseDomain = () => {
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    return apiBase.replace(/\/api$/, '');
  };
  const baseUrl = getBaseDomain();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const menuItems = isAdmin ? [
    { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/students', icon: Users, label: 'Candidate Registry' },
    { to: '/admin/exams/create', icon: BookOpen, label: 'Examination Management' },
    { to: '/admin/settings', icon: Settings, label: 'System Configuration' },
  ] : [
    { to: '/student', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/student/exams', icon: BookOpen, label: 'Examination Center' },
    { to: '/student/history', icon: History, label: 'Exam History' },
    { to: '/student/leaderboard', icon: Trophy, label: 'Merit List' },
    { to: '/student/settings', icon: Settings, label: 'Account Settings' },
  ];
  
  return (
    <div className="flex min-h-screen bg-[#fafafa] font-serif">
      {/* Sidebar */}
      <aside className={`hidden md:flex flex-col bg-white border-r border-[#e0e0e0] transition-all duration-300 sticky top-0 h-screen ${collapsed ? 'w-24' : 'w-72'}`}>
        <div className="p-8 flex items-center justify-between">
          {!collapsed && (
            <Link to="/" className="flex items-center gap-3">
              <div className="w-8 h-8 flex items-center justify-center">
                <Logo size={40} />
              </div>
              <div className="flex flex-col leading-tight border-l border-gray-200 pl-3">
                <span className="text-xl font-bold text-[#1a237e] tracking-tight uppercase">EaglePortal</span>
                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest leading-none">Government Official</span>
              </div>
            </Link>
          )}
          <button onClick={() => setCollapsed(!collapsed)} className="p-1 hover:bg-gray-100 rounded text-gray-400">
            {collapsed ? <Menu size={20} /> : <X size={20} />}
          </button>
        </div>
  
        <nav className="flex-grow px-4 space-y-1 py-6">
          <p className={`text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 px-4 ${collapsed ? 'hidden' : 'block'}`}>Navigation Menu</p>
          {menuItems.map(item => (
            <SidebarLink 
              key={item.to} 
              {...item} 
              active={location.pathname === item.to}
              collapsed={collapsed}
            />
          ))}
        </nav>
  
        <div className="p-4 border-t border-[#f0f0f0]">
          <button 
            onClick={logout}
            className="w-full flex items-center gap-4 px-4 py-3 rounded text-red-600 hover:bg-red-50 transition-all font-bold text-sm"
          >
            <LogOut className="w-5 h-5" />
            {!collapsed && <span className="uppercase tracking-widest text-[11px]">Terminate Session</span>}
          </button>
        </div>
      </aside>
  
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-[#e0e0e0] px-8 flex items-center justify-between">
          <button className="md:hidden p-2 text-gray-500" onClick={() => setMobileOpen(true)}>
            <Menu size={24} />
          </button>
   
          <h2 className="text-[18px] font-bold text-[#37474f]">
            {isAdmin ? 'System Administration Console' : 'Standardized Assessment Portal'}
          </h2>

          <div className="flex items-center gap-6">
             <div className="flex items-center gap-4 relative" ref={profileDropdownRef}>
                <div className="text-right hidden sm:block">
                   <p className="text-[14px] font-bold text-gray-900 leading-none mb-1">{user?.name}</p>
                   <p className="text-[10px] font-bold text-orange-600 uppercase tracking-widest leading-none">ID: #{user?.id?.toString().slice(-4)}</p>
                </div>
                
                <button 
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="w-10 h-10 rounded-[4px] overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center"
                >
                  {user?.profile_photo ? (
                    <img 
                      src={user.profile_photo.startsWith('http') ? user.profile_photo : `${baseUrl}${user.profile_photo}`} 
                      alt={user?.name} 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <span className="text-[#1a237e] font-bold">{user?.name?.charAt(0).toUpperCase()}</span>
                  )}
                </button>

                {profileOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-[#e0e0e0] shadow-xl py-2 z-50 animate-fade-in">
                    <div className="px-5 py-3 border-b border-gray-50 mb-1">
                      <p className="text-[10px] font-bold text-[#1a237e] uppercase tracking-widest mb-0.5">Authorization</p>
                      <p className="text-[12px] text-gray-600 truncate">{user?.email}</p>
                    </div>
                    <Link 
                      to={isAdmin ? '/admin/profile' : '/student/profile'}
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-5 py-2.5 text-[13px] font-bold text-gray-700 hover:bg-gray-50"
                    >
                      <Users size={16} /> Member Profile
                    </Link>
                    <button 
                      onClick={logout}
                      className="w-full flex items-center gap-3 px-5 py-2.5 text-[13px] font-bold text-red-600 hover:bg-red-50"
                    >
                      <LogOut size={16} /> Permanent Logout
                    </button>
                  </div>
                )}
             </div>
          </div>
        </header>
  
        <main className="flex-1 overflow-y-auto p-8 lg:p-12 bg-[#fafafa]">
          {children}
        </main>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
           <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)}></div>
           <aside className="relative w-72 bg-white h-full p-6 flex flex-col shadow-2xl">
              <div className="flex justify-between items-center mb-10">
                 <Logo size={40} />
                 <button onClick={() => setMobileOpen(false)} className="p-2 texy-gray-500"><X size={24} /></button>
              </div>
              <nav className="space-y-2">
                 {menuItems.map(item => (
                    <SidebarLink key={item.to} {...item} active={location.pathname === item.to} />
                 ))}
                 <button 
                  onClick={logout}
                  className="w-full flex items-center gap-4 px-4 py-3 rounded text-red-600 font-bold text-[14px] mt-4"
                >
                  <LogOut size={20} /> Logout
                </button>
              </nav>
           </aside>
        </div>
      )}
    </div>
  );
};
