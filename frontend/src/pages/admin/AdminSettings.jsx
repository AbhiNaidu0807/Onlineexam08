import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  User, 
  Bell, 
  Shield, 
  Info, 
  LogOut, 
  Save, 
  ShieldCheck, 
  Mail, 
  Key, 
  Database, 
  Cloud, 
  Lock, 
  Activity,
  Cpu,
  RefreshCcw,
  UserCircle
} from 'lucide-react';
import { useAuth } from '../../context/authContext';
import api from '../../services/api';

const AdminSettings = () => {
  const { user, logout, login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  const [notifs, setNotifs] = useState({
    exam_creation: true,
    student_submissions: true,
    system_alerts: true
  });

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    try {
      const res = await api.put('/auth/profile', formData);
      login(res, localStorage.getItem('token'));
      setSuccess('Administrative identity profile updated.');
    } catch (err) {
      console.error('Update Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const [activeSection, setActiveSection] = useState('profile');

  const sections = [
    { id: 'profile', icon: User, label: 'Profile' },
    { id: 'notifications', icon: Bell, label: 'Alerts' },
    { id: 'security', icon: Lock, label: 'Security' },
    { id: 'about', icon: Info, label: 'About' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-fade-in pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-4">
        <div className="space-y-2">
           <div className="flex items-center gap-3">
              <span className="bg-orange-500 text-white px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest">Master Auth</span>
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#22c55e]"></span>
           </div>
           <h1 className="text-4xl font-black font-display text-gray-900 dark:text-white tracking-tighter uppercase">Administrative <span className="text-orange-500">Core</span></h1>
           <p className="text-gray-400 font-bold uppercase tracking-[0.4em] text-[10px]">Configure enterprise-level parameters</p>
        </div>

        <button 
          onClick={logout}
          className="flex items-center gap-3 px-6 py-3 bg-rose-500/10 text-rose-500 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-rose-500 hover:text-white transition-all border border-rose-500/20"
        >
          <LogOut className="w-4 h-4" /> Finalize Session
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-10 px-4">
        {/* Navigation Sidebar */}
        <aside className="md:col-span-3 space-y-2">
           {sections.map(s => (
             <button
               key={s.id}
               onClick={() => setActiveSection(s.id)}
               className={`w-full flex items-center gap-4 px-6 py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all border ${activeSection === s.id ? 'bg-gray-900 dark:bg-orange-600 text-white border-transparent shadow-2xl' : 'bg-white dark:bg-gray-800/50 text-gray-400 border-gray-100 dark:border-white/5 hover:border-orange-500/50'}`}
             >
               <s.icon className={`w-5 h-5 ${activeSection === s.id ? 'scale-110' : ''}`} />
               {s.label}
             </button>
           ))}

           <div className="mt-10 p-6 bg-orange-500/5 rounded-3xl border border-orange-500/10 space-y-4">
              <div className="flex items-center gap-3">
                 <Cpu className="w-5 h-5 text-orange-500" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-orange-600">System Load</span>
              </div>
              <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                 <div className="h-full bg-orange-500 w-[24%]" />
              </div>
           </div>
        </aside>

        {/* Content Area */}
        <div className="md:col-span-9">
           <div className="bg-white dark:bg-gray-800/80 backdrop-blur-xl rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-2xl shadow-gray-200/50 dark:shadow-none p-10 min-h-[500px]">
              
              {activeSection === 'profile' && (
                <div className="space-y-12 animate-fade-in">
                  <div className="flex items-center gap-8">
                     <div className="w-24 h-24 bg-gray-900 dark:bg-orange-600 rounded-[2rem] flex items-center justify-center text-white text-4xl font-black shadow-2xl relative group">
                        {user?.name?.charAt(0)}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 rounded-[2rem] flex items-center justify-center transition-opacity cursor-pointer">
                           <RefreshCcw className="w-8 h-8 text-white" />
                        </div>
                     </div>
                     <div>
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-1">{user?.name}</h3>
                        <div className="flex items-center gap-2">
                           <Shield className="w-4 h-4 text-orange-500" />
                           <p className="text-[10px] font-black text-orange-500 uppercase tracking-[0.2em]">Verified Administrator</p>
                        </div>
                     </div>
                  </div>

                  <form onSubmit={handleUpdateProfile} className="space-y-8 max-w-xl">
                    {success && (
                      <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-emerald-100 dark:border-emerald-500/20 italic">
                        <ShieldCheck className="w-5 h-5" /> {success}
                      </div>
                    )}

                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] px-2 leading-none">Administrative Designation</label>
                       <div className="relative">
                          <UserCircle className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-300" />
                          <input 
                            type="text" 
                            className="w-full bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-orange-500 rounded-2xl py-5 pl-16 pr-8 text-sm font-black outline-none transition-all dark:text-white"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                          />
                       </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] px-2 leading-none">Security Email Entry</label>
                       <div className="relative">
                          <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-300" />
                          <input 
                            type="email" 
                            className="w-full bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-orange-500 rounded-2xl py-5 pl-16 pr-8 text-sm font-black outline-none transition-all dark:text-white"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                          />
                       </div>
                    </div>

                    <button 
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gray-900 dark:bg-orange-600 text-white py-5 rounded-2xl font-black uppercase tracking-[0.4em] text-sm shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4 disabled:opacity-50"
                    >
                      {loading ? 'WRITING...' : (
                        <>
                          COMMIT CHANGES <Save className="w-6 h-6" />
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}

              {activeSection === 'notifications' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="grid grid-cols-1 gap-4">
                    {Object.entries(notifs).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between p-8 bg-gray-50/50 dark:bg-gray-900/50 rounded-3xl border border-gray-100 dark:border-white/5 group hover:border-orange-500/30 transition-all">
                        <div className="space-y-1">
                          <p className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">{key.replace('_', ' ')} Logic</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Toggle real-time receptor nodes</p>
                        </div>
                        <button 
                          onClick={() => setNotifs({...notifs, [key]: !value})}
                          className={`w-16 h-9 rounded-full relative transition-all duration-300 ${value ? 'bg-orange-500' : 'bg-gray-300 dark:bg-gray-700'}`}
                        >
                          <div className={`absolute top-1.5 w-6 h-6 bg-white rounded-full shadow-lg transition-all duration-300 ${value ? 'left-8.5' : 'left-1.5'}`} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeSection === 'security' && (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-8 opacity-40">
                   <div className="w-24 h-24 bg-gray-50 dark:bg-gray-900 rounded-[2.5rem] flex items-center justify-center border-2 border-dashed border-gray-200 dark:border-white/10">
                      <Lock className="w-12 h-12 text-gray-400" />
                   </div>
                   <div className="space-y-2">
                      <p className="text-lg font-black text-gray-300 uppercase tracking-[0.2em]">Institutional Security Protocol</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">RSA-512 Encryption Cluster: STANDBY</p>
                   </div>
                   <button className="px-10 py-4 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] cursor-not-allowed">Reset Master Key</button>
                </div>
              )}

              {activeSection === 'about' && (
                <div className="space-y-16 animate-fade-in text-center p-6">
                   <div className="space-y-6">
                      <div className="w-24 h-24 bg-gray-900 dark:bg-orange-600 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl relative">
                         <Activity className="w-12 h-12 text-orange-500 dark:text-white" />
                         <span className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white dark:border-gray-800 animate-pulse"></span>
                      </div>
                      <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter uppercase">Eagle <span className="text-orange-500 italic underline decoration-gray-200 decoration-4 underline-offset-8">Exam</span></h2>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.5em]">Enterprise Assessment Framework</p>
                   </div>

                   <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      <div className="p-8 bg-gray-50/50 dark:bg-gray-900/50 rounded-3xl border border-gray-100 dark:border-white/10">
                         <Database className="w-8 h-8 text-orange-500 mx-auto mb-4" />
                         <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Build ID</p>
                         <p className="text-xl font-black text-gray-900 dark:text-white">v1.2.9</p>
                      </div>
                      <div className="p-8 bg-gray-50/50 dark:bg-gray-900/50 rounded-3xl border border-gray-100 dark:border-white/10">
                         <Cloud className="w-8 h-8 text-blue-500 mx-auto mb-4" />
                         <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">DB Engine</p>
                         <p className="text-xl font-black text-gray-900 dark:text-white uppercase">Turso</p>
                      </div>
                      <div className="p-8 bg-gray-50/50 dark:bg-gray-900/50 rounded-3xl border border-gray-100 dark:border-white/10">
                         <Key className="w-8 h-8 text-green-500 mx-auto mb-4" />
                         <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Security</p>
                         <p className="text-xl font-black text-gray-900 dark:text-white uppercase">JWT</p>
                      </div>
                   </div>

                   <p className="text-[10px] font-bold text-gray-400 leading-relaxed italic max-w-lg mx-auto">
                      Online Exam Management System for institutional academic mastery. Unauthorized access to administrative modules is strictly logged and audited.
                   </p>

                   <Link to="/admin" className="inline-flex items-center gap-2 text-orange-500 font-black text-[10px] uppercase tracking-widest hover:underline decoration-orange-500 underline-offset-4">
                      Protocol Documentation Center <ArrowRight className="w-4 h-4" />
                   </Link>
                </div>
              )}

           </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
