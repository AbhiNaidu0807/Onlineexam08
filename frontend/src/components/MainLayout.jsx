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
    className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group ${
      active 
        ? 'bg-orange-500 text-white shadow-md shadow-orange-100 dark:shadow-none' 
        : 'text-gray-500 dark:text-gray-400 hover:bg-orange-50 dark:hover:bg-orange-500/10 hover:text-orange-600'
    }`}
  >
    <Icon className={`w-5 h-5 shrink-0 transition-transform ${active ? 'scale-110' : 'group-hover:scale-110'}`} />
    {!collapsed && <span className="font-semibold text-sm tracking-tight">{label}</span>}
  </Link>
);

export const MainLayout = ({ children }) => {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  
  // Search State
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState({ exams: [], students: [], results: [] });
  const [searching, setSearching] = useState(false);
  const searchRef = useRef(null);

  // Notification State
  const [notifications, setNotifications] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifLoading, setNotifLoading] = useState(false);
  const notifRef = useRef(null);

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

  // Search Logic
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (query.trim()) {
        performSearch();
      } else {
        setSearchResults({ exams: [], students: [], results: [] });
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  const performSearch = async () => {
    setSearching(true);
    setSearchOpen(true);
    try {
      const res = await api.get(`/search?query=${query}`);
      setSearchResults(res);
    } catch (e) {}
    setSearching(false);
  };

  // Click Outside Handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const menuItems = isAdmin ? [
    { to: '/admin', icon: LayoutDashboard, label: 'Overview' },
    { to: '/admin/students', icon: Users, label: 'Students' },
    { to: '/admin/exams/create', icon: BookOpen, label: 'Creator' },
    { to: '/admin/settings', icon: Settings, label: 'Settings' },
  ] : [
    { to: '/student', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/student/exams', icon: Zap, label: 'Active Exams' },
    { to: '/student/history', icon: ClipboardCheck, label: 'Results' },
    { to: '/student/leaderboard', icon: Trophy, label: 'Leaderboard' },
    { to: '/student/settings', icon: Settings, label: 'Settings' },
  ];
  
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-500 font-outfit">
      {/* Sidebar - Desktop */}
      <aside className={`hidden md:flex flex-col bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 transition-all duration-500 sticky top-0 h-screen ${collapsed ? 'w-24' : 'w-72'}`}>
        <div className="p-8 flex items-center justify-between">
          {!collapsed && (
            <Link to="/" className="flex items-center gap-3">
              <Logo size={60} />
              <div className="flex flex-col leading-none">
                <span className="text-xl font-bold font-display text-gray-900 dark:text-white tracking-tight leading-none uppercase italic">EAGLE <span className="text-orange-500 not-italic">EXAM</span></span>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mt-2">Assessment Center</span>
              </div>
            </Link>
          )}
          <button onClick={() => setCollapsed(!collapsed)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
            {collapsed ? <Menu className="w-6 h-6 text-gray-400" /> : <X className="w-6 h-6 text-gray-400" />}
          </button>
        </div>
 
        <nav className="flex-grow px-4 space-y-1 py-6">
          <p className={`text-[11px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4 px-4 transition-opacity ${collapsed ? 'opacity-0' : 'opacity-100'}`}>Primary Menu</p>
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
            className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/10 transition-all group"
          >
            <LogOut className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            {!collapsed && <span className="font-black text-[10px] uppercase tracking-[0.3em]">Logout Session</span>}
          </button>
        </div>
      </aside>
 
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-24 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800 sticky top-0 z-40 px-6 md:px-12 flex items-center justify-between shrink-0">
          <button className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl" onClick={() => setMobileOpen(true)}>
            <Menu className="w-6 h-6" />
          </button>
 
          {/* Search Container */}
          <div className="hidden md:flex flex-col relative" ref={searchRef}>
            <div className={`flex items-center gap-4 bg-gray-50 dark:bg-gray-800 px-6 py-3 rounded-[1.5rem] w-[500px] border transition-all ${searchOpen ? 'border-orange-500 shadow-xl bg-white' : 'border-gray-100 dark:border-gray-700 shadow-inner'} group`}>
              {searching ? <Loader2 className="w-5 h-5 text-orange-500 animate-spin" /> : <Search className="w-5 h-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />}
              <input 
                type="text" 
                placeholder="Global Intelligence Search..." 
                className="bg-transparent border-none outline-none text-sm font-bold w-full italic"
                value={query}
                onChange={(e) => {setQuery(e.target.value); setSearchOpen(true);}}
                onFocus={() => setSearchOpen(true)}
              />
              {query && <button onClick={() => setQuery('')} className="p-1 hover:bg-gray-200 rounded-full"><X className="w-4 h-4 text-gray-400" /></button>}
            </div>

            {/* Search Suggestions Dropdown */}
            {searchOpen && query.trim() && (
              <div className="absolute top-full left-0 right-0 mt-4 bg-white border border-gray-100 rounded-[2rem] shadow-[0_32px_128px_-16px_rgba(0,0,0,0.15)] p-4 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                   {/* Exams Section */}
                   {searchResults.exams?.length > 0 && (
                     <div className="mb-6">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4 mb-3 italic">Active Assessments</p>
                        {searchResults.exams.map(e => (
                          <button key={e.id} onClick={() => {navigate(`/student/exams`); setSearchOpen(false);}} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl transition-all group">
                             <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500"><Zap className="w-5 h-5" /></div>
                                <span className="font-bold text-sm text-gray-800">{e.title}</span>
                             </div>
                             <ChevronRight className="w-4 h-4 text-gray-300 group-hover:translate-x-1 transition-transform" />
                          </button>
                        ))}
                     </div>
                   )}
                   {/* Students Section */}
                   {isAdmin && searchResults.students?.length > 0 && (
                     <div className="mb-6">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4 mb-3 italic">Identity Fragments</p>
                        {searchResults.students.map(s => (
                          <button key={s.id} onClick={() => {navigate(`/admin/students`); setSearchOpen(false);}} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl transition-all group">
                             <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500"><Users className="w-5 h-5" /></div>
                                <div className="text-left leading-tight">
                                   <p className="font-bold text-sm text-gray-800">{s.name}</p>
                                   <p className="text-[9px] text-gray-400 font-bold uppercase">{s.email}</p>
                                </div>
                             </div>
                             <ChevronRight className="w-4 h-4 text-gray-300 group-hover:translate-x-1 transition-transform" />
                          </button>
                        ))}
                     </div>
                   )}
                   {/* Results Section */}
                   {searchResults.results?.length > 0 && (
                     <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4 mb-3 italic">Verification Logs</p>
                        {searchResults.results.map(r => (
                          <button key={r.id} onClick={() => {navigate(isAdmin ? `/admin/exams` : `/student/history`); setSearchOpen(false);}} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl transition-all group">
                             <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500"><ClipboardCheck className="w-5 h-5" /></div>
                                <div className="text-left leading-tight">
                                   <p className="font-bold text-sm text-gray-800">{r.exam_title}</p>
                                   <p className="text-[9px] text-emerald-600 font-bold uppercase">{r.score}/{r.total_marks} Marks Verified</p>
                                </div>
                             </div>
                             <ChevronRight className="w-4 h-4 text-gray-300 group-hover:translate-x-1 transition-transform" />
                          </button>
                        ))}
                     </div>
                   )}
                   {(!searchResults.exams?.length && !searchResults.students?.length && !searchResults.results?.length) && (
                     <div className="py-10 text-center text-gray-400 font-bold italic">No intelligence matched terminal query.</div>
                   )}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-6">
             {/* Notification Bell */}
             <div className="relative" ref={notifRef}>
                <button 
                  onClick={() => setNotifOpen(!notifOpen)}
                  className={`p-3 rounded-[1.2rem] relative transition-all group ${unreadCount > 0 ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'bg-gray-50 dark:bg-gray-800 hover:bg-orange-50 dark:hover:bg-orange-500/10'}`}
                >
                  <Bell className={`w-5 h-5 ${unreadCount > 0 ? 'animate-bounce' : 'text-gray-500'}`} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-white text-orange-600 text-[9px] font-black flex items-center justify-center rounded-full ring-4 ring-gray-50">
                       {unreadCount}
                    </span>
                  )}
                </button>
                {notifOpen && (
                  <NotificationPanel 
                    notifications={notifications} 
                    onClose={() => setNotifOpen(false)}
                    onMarkRead={handleMarkRead}
                    onClearAll={handleClearAll}
                    loading={notifLoading}
                  />
                )}
             </div>
             
             <div className="flex items-center gap-3 pl-6 border-l border-gray-100 dark:border-gray-800">
                <div className="text-right hidden sm:block leading-none">
                   <p className="text-sm font-bold dark:text-white mb-1 uppercase italic tracking-tighter">{user?.name}</p>
                   <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest opacity-60">Authorized {user?.role}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-tr from-gray-900 to-black rounded-[1.2rem] flex items-center justify-center text-white font-black text-base shadow-xl group border-2 border-white/10">
                   {user?.name?.charAt(0).toUpperCase()}
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
