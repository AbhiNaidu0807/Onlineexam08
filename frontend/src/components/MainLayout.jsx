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
  Bell,
  Search,
  Zap,
  Trophy,
  Loader2,
  ChevronRight,
  GraduationCap
} from 'lucide-react';
import Logo from './Logo';
import NotificationPanel from './NotificationPanel';

const SidebarLink = ({ to, icon: Icon, label, active, collapsed }) => (
  <Link 
    to={to} 
    className={`flex items-center gap-4 px-4 py-3 rounded transition-all duration-200 group ${
      active 
        ? 'bg-primary text-white' 
        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-primary'
    }`}
  >
    <Icon className={`w-5 h-5 shrink-0 ${active ? 'text-white' : 'text-slate-400 group-hover:text-primary'}`} />
    {!collapsed && <span className="font-bold text-sm tracking-tight">{label}</span>}
  </Link>
);

export const MainLayout = ({ children }) => {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  
  // Notification State
  const [notifications, setNotifications] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifLoading, setNotifLoading] = useState(false);
  const notifRef = useRef(null);

  // Profile State
  const [profileOpen, setProfileOpen] = useState(false);
  const profileDropdownRef = useRef(null);

  const getBaseDomain = () => {
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    return apiBase.replace(/\/api$/, '');
  };
  const baseUrl = getBaseDomain();

  // Sync / Polling
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res);
    } catch (e) {}
  };

  const handleMarkRead = async (id) => {
    try {
      await api.post('/notifications/read', { id });
      fetchNotifications();
    } catch (e) {}
  };

  const handleClearAll = async () => {
    try {
      await api.delete('/notifications/clear');
      setNotifications([]);
    } catch (e) {}
  };

  // Click Outside Handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const menuItems = isAdmin ? [
    { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/students', icon: Users, label: 'Students' },
    { to: '/admin/exams/create', icon: BookOpen, label: 'Exams' },
    { to: '/admin/settings', icon: Settings, label: 'Settings' },
  ] : [
    { to: '/student', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/student/exams', icon: Zap, label: 'Exams' },
    { to: '/student/history', icon: ClipboardCheck, label: 'Results' },
    { to: '/student/leaderboard', icon: Trophy, label: 'Leaderboard' },
    { to: '/student/settings', icon: Settings, label: 'Settings' },
  ];
  
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-500 font-serif">
      {/* Sidebar - Desktop */}
      <aside className={`hidden md:flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-500 sticky top-0 h-screen ${collapsed ? 'w-24' : 'w-72'}`}>
        <div className="p-8 flex items-center justify-between">
          {!collapsed && (
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary flex items-center justify-center rounded">
                <Logo size={40} />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-xl font-bold text-primary dark:text-white tracking-tight">Eagle Exam</span>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Institutional Portal</span>
              </div>
            </Link>
          )}
          <button onClick={() => setCollapsed(!collapsed)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors">
            {collapsed ? <Menu className="w-6 h-6 text-gray-400" /> : <X className="w-6 h-6 text-gray-400" />}
          </button>
        </div>
 
        <nav className="flex-grow px-4 space-y-1 py-6">
          <p className={`text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 px-4 transition-opacity ${collapsed ? 'opacity-0' : 'opacity-100'}`}>Menu</p>
          {menuItems.map(item => (
            <SidebarLink 
              key={item.to} 
              {...item} 
              active={location.pathname === item.to}
              collapsed={collapsed}
            />
          ))}
        </nav>
 
        <div className="p-4 border-t border-gray-100 dark:border-gray-800">
          <button 
            onClick={logout}
            className="w-full flex items-center gap-4 px-4 py-3 rounded text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/10 transition-all font-bold text-sm"
          >
            <LogOut className="w-5 h-5" />
            {!collapsed && <span className="uppercase tracking-widest text-[11px]">Logout</span>}
          </button>
        </div>
      </aside>
 
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40 px-6 md:px-10 flex items-center justify-between shrink-0">
          <button className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded" onClick={() => setMobileOpen(true)}>
            <Menu className="w-6 h-6" />
          </button>
  
          <div className="flex items-center gap-4">
             <h2 className="text-xl font-bold text-gray-800 dark:text-white hidden md:block">
               {isAdmin ? 'Admin Dashboard' : 'Student Portal'}
             </h2>
          </div>

          <div className="flex items-center gap-6">
             <div className="flex items-center gap-4 pl-6 relative z-[60]">
                <div className="text-right hidden sm:block leading-none">
                   <p className="text-sm font-bold dark:text-white mb-1 uppercase italic tracking-tighter truncate max-w-[120px]">{user?.name}</p>
                   <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest opacity-60 leading-none">Authorized {user?.role}</p>
                </div>
                
                <div className="relative" ref={profileDropdownRef}>
                  <button 
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="w-12 h-12 rounded-[1.2rem] overflow-hidden border-2 border-white/10 shadow-xl group hover:border-orange-500 transition-all flex items-center justify-center bg-gradient-to-tr from-gray-900 to-black"
                  >
                    {user?.profile_photo ? (
                      <img 
                        src={user.profile_photo.startsWith('http') ? user.profile_photo : `${baseUrl}${user.profile_photo}`} 
                        alt={user?.name} 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <span className="text-white font-black text-base">{user?.name?.charAt(0).toUpperCase()}</span>
                    )}
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 mt-4 w-56 bg-white dark:bg-gray-900 rounded-3xl shadow-[0_32px_128px_-16px_rgba(0,0,0,0.15)] border border-gray-100 dark:border-gray-800 py-3 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
                      <div className="px-6 py-4 border-b border-gray-50 dark:border-gray-800 mb-2">
                        <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-1 italic">Identity Portal</p>
                        <p className="text-xs font-bold text-gray-800 dark:text-white truncate">{user?.email}</p>
                      </div>
                      
                      <button 
                        onClick={() => { navigate(isAdmin ? '/admin/profile' : '/student/profile'); setProfileOpen(false); }}
                        className="w-full flex items-center gap-4 px-6 py-3.5 text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 hover:bg-orange-50 dark:hover:bg-orange-500/10 hover:text-orange-600 transition-all"
                      >
                         <Trophy className="w-5 h-5" /> My Profile
                      </button>

                      <div className="h-px bg-gray-50 dark:bg-gray-800 my-2 mx-6" />

                      <button 
                        onClick={logout}
                        className="w-full flex items-center gap-4 px-6 py-3.5 text-xs font-black uppercase tracking-widest text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/10 transition-all"
                      >
                         <LogOut className="w-5 h-5" /> Logout
                      </button>
                    </div>
                  )}
                </div>
             </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 md:p-12 custom-scrollbar bg-[#fafafa]">
          {children}
        </main>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden animate-in fade-in">
           <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)}></div>
           <aside className="absolute top-0 left-0 bottom-0 w-80 bg-white dark:bg-gray-900 p-8 flex flex-col animate-in slide-in-from-left duration-300">
              <div className="flex justify-between items-center mb-10">
                 <Logo size={50} />
                 <button onClick={() => setMobileOpen(false)} className="p-2"><X className="w-6 h-6" /></button>
              </div>
              <nav className="space-y-4">
                 {menuItems.map(item => (
                    <SidebarLink key={item.to} {...item} active={location.pathname === item.to} />
                 ))}
              </nav>
              <button 
                onClick={logout}
                className="mt-auto flex items-center gap-4 p-4 text-rose-500 font-black uppercase text-xs tracking-widest underline decoration-2 underline-offset-8"
              >
                <LogOut className="w-6 h-6" /> Terminate Session
              </button>
           </aside>
        </div>
      )}
    </div>
  );
};
