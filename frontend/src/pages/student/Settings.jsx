import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Bell, Shield, Info, LogOut, Save, ArrowRight, UserCircle, Mail, Key, Globe, Moon, Sun, Smartphone, ShieldCheck, Heart } from 'lucide-react';
import { useAuth } from '../../context/authContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../services/api';

const Settings = () => {
  const { user, logout, login } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  const [notifs, setNotifs] = useState({
    exams: true,
    results: true,
    newsletter: false
  });

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    try {
      const res = await api.put('/auth/profile', formData);
      login(res, localStorage.getItem('token')); // Update context with tokens
      setSuccess('Identity profile recalibrated successfully.');
    } catch (err) {
      console.error('Update Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const sections = [
    { id: 'profile', icon: User, label: 'Identity Profile' },
    { id: 'notifications', icon: Bell, label: 'Sensor Alerts' },
    { id: 'security', icon: Shield, label: 'Security Core' },
    { id: 'about', icon: Info, label: 'System Info' },
  ];

  const [activeSection, setActiveSection] = useState('profile');

  return (
    <div className="max-w-4xl mx-auto pb-20 animate-fade-in">
      <header className="mb-12 px-4 text-center md:text-left">
        <h1 className="text-5xl font-black font-display text-gray-900 dark:text-white tracking-tighter uppercase mb-2">Systems <span className="text-orange-500">Core</span></h1>
        <p className="text-gray-400 font-bold uppercase tracking-[0.3em] text-[10px]">Manage your global deployment parameters</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 px-4">
        {/* Navigation Sidebar */}
        <aside className="md:col-span-1 space-y-2">
           {sections.map(s => (
             <button
               key={s.id}
               onClick={() => setActiveSection(s.id)}
               className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all ${activeSection === s.id ? 'bg-orange-600 text-white shadow-xl shadow-orange-100 dark:shadow-none translate-x-1' : 'text-gray-400 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-500/10'}`}
             >
               <s.icon className={`w-5 h-5 ${activeSection === s.id ? 'scale-110' : ''}`} />
               {s.label}
             </button>
           ))}

           <div className="pt-8 mt-8 border-t border-gray-100 dark:border-white/5">
              <button 
                onClick={logout}
                className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] text-rose-500 hover:bg-rose-50 transition-all border-2 border-transparent hover:border-rose-100"
              >
                <LogOut className="w-5 h-5" /> Terminate Session
              </button>
           </div>
        </aside>

        {/* Dynamic Content Panel */}
        <div className="md:col-span-3">
           <div className="bg-white dark:bg-gray-800/50 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-2xl shadow-orange-100/30 dark:shadow-none p-10 min-h-[500px]">
              
              {activeSection === 'profile' && (
                <div className="space-y-10 animate-fade-in">
                  <div className="flex items-center gap-6">
                     <div className="w-24 h-24 bg-gradient-to-tr from-orange-500 to-orange-400 rounded-[2rem] flex items-center justify-center text-white text-3xl font-black shadow-2xl relative group cursor-pointer overflow-hidden">
                        {user?.name?.charAt(0)}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                           <Smartphone className="w-8 h-8 text-white/50" />
                        </div>
                     </div>
                     <div>
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">{user?.name}</h3>
                        <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest mt-1">Verified {user?.role}</p>
                     </div>
                  </div>

                  <form onSubmit={handleUpdateProfile} className="space-y-6">
                    {success && (
                      <div className="bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-green-100 dark:border-green-500/20 flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4" /> {success}
                      </div>
                    )}

                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Display Designation</label>
                       <div className="relative">
                          <UserCircle className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input 
                            type="text" 
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            className="w-full bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-orange-500 rounded-2xl py-4 pl-14 pr-6 text-sm font-black outline-none transition-all dark:text-white"
                          />
                       </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Neural ID (Email)</label>
                       <div className="relative">
                          <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input 
                            type="email" 
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            className="w-full bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-orange-500 rounded-2xl py-4 pl-14 pr-6 text-sm font-black outline-none transition-all dark:text-white"
                          />
                       </div>
                    </div>

                    <button 
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gray-900 dark:bg-orange-600 text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-sm shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                      {loading ? 'Propagating...' : (
                        <>
                          Store Recalibration <Save className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}

              {activeSection === 'notifications' && (
                <div className="space-y-8 animate-fade-in">
                  <div className="flex flex-col gap-6">
                    {Object.entries(notifs).map(([key, val]) => (
                      <div key={key} className="flex items-center justify-between p-6 bg-gray-50 dark:bg-gray-900 rounded-3xl group">
                         <div>
                            <p className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight capitalize">{key.replace('_', ' ')} Notifications</p>
                            <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest">Toggle real-time receptor nodes</p>
                         </div>
                         <button 
                           onClick={() => setNotifs({...notifs, [key]: !val})}
                           className={`w-14 h-8 rounded-full relative transition-all ${val ? 'bg-orange-600' : 'bg-gray-300 dark:bg-gray-700'}`}
                         >
                            <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${val ? 'left-7' : 'left-1'}`}></div>
                         </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeSection === 'security' && (
                <div className="space-y-8 animate-fade-in">
                   <div className="flex flex-col items-center justify-center py-12 text-center space-y-4 opacity-50">
                      <Key className="w-16 h-16 text-gray-300" />
                      <p className="text-xs font-black text-gray-400 uppercase tracking-widest">End-to-End Encryption Active</p>
                      <button className="px-8 py-3 bg-gray-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest cursor-not-allowed">Reset Master Key</button>
                   </div>
                </div>
              )}

              {activeSection === 'about' && (
                <div className="space-y-12 animate-fade-in text-center">
                   <div className="space-y-4">
                      <div className="w-20 h-20 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto shadow-2xl shadow-orange-100">
                         <Globe className="w-10 h-10 text-white" />
                      </div>
                      <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter uppercase">Eagle <span className="text-orange-500">Exam</span></h2>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Proprietary Assessment Engine</p>
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-white/5">
                         <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Build Index</p>
                         <p className="text-xl font-black text-orange-600">v3.4.92</p>
                      </div>
                      <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-white/5">
                         <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Environment</p>
                         <p className="text-xl font-black text-green-600 uppercase italic">Stable</p>
                      </div>
                   </div>

                   <p className="text-[10px] font-bold text-gray-400 leading-relaxed italic px-10">
                      Developed for institutional assessment mastery. Unauthorized reproduction is strictly monitored by RSA-512 security sensors.
                   </p>

                   <div className="flex items-center justify-center gap-2 text-rose-500 font-bold text-[10px] uppercase tracking-widest">
                      <Heart className="w-3 h-3 fill-rose-500" /> Built with absolute precision
                   </div>
                </div>
              )}

           </div>
           
           <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-6 px-4">
              <div className="flex items-center gap-4">
                 <button 
                  onClick={toggleTheme}
                  className="p-4 bg-gray-900 text-white dark:bg-white dark:text-gray-900 rounded-2xl transition-all active:scale-90"
                 >
                    {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                 </button>
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Initialize {isDarkMode ? 'Lunar' : 'Solar'} UI Module</p>
              </div>
              
              <Link to="/student" className="flex items-center gap-2 text-[10px] font-black text-gray-400 hover:text-orange-600 transition-colors group">
                 Return to Command Bridge <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
