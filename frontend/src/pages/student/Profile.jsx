import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/authContext';
import api from '../../services/api';
import { 
  User, 
  Mail, 
  Shield, 
  Calendar, 
  Award, 
  Edit3, 
  Settings, 
  ShieldCheck, 
  Save, 
  Key, 
  TrendingUp, 
  Target, 
  Trophy, 
  ChevronRight,
  Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [stats, setStats] = useState({ total: 0, avg: 0, best: 0 });
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const attempts = await api.get('/attempts/my');
        if (attempts && attempts.length > 0) {
          const scores = attempts.map(a => (a.score / a.total_marks) * 100);
          setStats({
            total: attempts.length,
            avg: Math.round(scores.reduce((a, b) => a + b, 0) / attempts.length),
            best: Math.round(Math.max(...scores))
          });
        }
      } catch (err) {
        console.error('Stats Sync Error:', err);
      }
    };
    fetchStats();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    try {
      const res = await api.put('/auth/profile', formData);
      login(res, localStorage.getItem('token'));
      setSuccess('Institutional identity profile recalibrated.');
    } catch (err) {
      console.error('Update Failure:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-fade-in pb-32">
      <header className="px-4 space-y-3">
        <div className="flex items-center gap-3">
           <span className="bg-gray-900 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-[0.3em]">Identity Core</span>
           <span className="w-2.5 h-2.5 bg-orange-500 rounded-full animate-pulse border-2 border-white dark:border-gray-900 shadow-lg"></span>
        </div>
        <h1 className="text-5xl font-black font-display text-gray-900 dark:text-white tracking-tighter uppercase italic leading-none">
           User <span className="text-orange-500">Profile</span>
        </h1>
        <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Manage your institutional credentials and matrix stats.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 px-4">
        {/* Left Column: Profile Card */}
        <div className="lg:col-span-8 space-y-12">
           <div className="bg-white dark:bg-gray-800/80 backdrop-blur-xl rounded-[3rem] shadow-2xl shadow-orange-50/50 dark:shadow-none border border-gray-100 dark:border-white/5 overflow-hidden">
              <div className="h-48 bg-gradient-to-tr from-gray-900 via-orange-600 to-orange-400 relative overflow-hidden">
                 <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
              </div>
              
              <div className="px-10 pb-12">
                 <div className="relative -mt-20 mb-12 flex flex-col md:flex-row items-end gap-8">
                    <div className="w-40 h-40 bg-white dark:bg-gray-700 rounded-[2.5rem] p-2 shadow-2xl relative group">
                       <div className="w-full h-full bg-gray-900 dark:bg-gray-600 rounded-[2.2rem] flex items-center justify-center text-5xl font-black text-orange-500 transition-all group-hover:scale-95">
                          {user?.name?.charAt(0)}
                       </div>
                       <button className="absolute -bottom-2 -right-2 p-4 bg-orange-500 text-white rounded-2xl shadow-xl hover:scale-110 transition-all border-4 border-white dark:border-gray-800">
                          <Edit3 className="w-5 h-5" />
                       </button>
                    </div>
                    <div className="pb-4 flex-1 space-y-2">
                       <h2 className="text-4xl font-black font-display text-gray-900 dark:text-white uppercase tracking-tighter">{user?.name}</h2>
                       <div className="flex items-center gap-2">
                          <ShieldCheck className="w-5 h-5 text-orange-500" />
                          <p className="text-[10px] font-black text-orange-500 uppercase tracking-[0.3em]">Verified Institutional {user?.role}</p>
                       </div>
                    </div>
                 </div>

                 <form onSubmit={handleUpdate} className="space-y-10">
                    {success && (
                       <div className="p-5 bg-emerald-50 dark:bg-emerald-500/10 border-2 border-emerald-100 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 italic">
                          <Zap className="w-5 h-5" /> {success}
                       </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-3">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] px-2 flex items-center gap-2">
                             <User className="w-4 h-4 text-orange-500" /> Full Designation
                          </label>
                          <input 
                            type="text" 
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            className="w-full bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-orange-500 rounded-3xl py-6 px-8 text-sm font-black text-gray-800 dark:text-white outline-none transition-all shadow-inner"
                          />
                       </div>
                       <div className="space-y-3">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] px-2 flex items-center gap-2">
                             <Mail className="w-4 h-4 text-orange-500" /> Secure Neural ID
                          </label>
                          <input 
                            type="email" 
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            className="w-full bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-orange-500 rounded-3xl py-6 px-8 text-sm font-black text-gray-800 dark:text-white outline-none transition-all shadow-inner"
                          />
                       </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-6 pt-6">
                       <button 
                         type="submit"
                         disabled={loading}
                         className="w-full md:w-auto px-12 py-5 bg-gray-900 dark:bg-orange-600 text-white rounded-3xl font-black uppercase tracking-[0.4em] text-[10px] shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4 disabled:opacity-50"
                       >
                          {loading ? 'SYNCING...' : (
                            <>
                               Commit Identity Changes <Save className="w-5 h-5" />
                            </>
                          )}
                       </button>
                       <button 
                         type="button" 
                         className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-orange-500 transition-colors flex items-center gap-2"
                       >
                          <Key className="w-4 h-4" /> Reset Security Credentials
                       </button>
                    </div>
                 </form>
              </div>
           </div>
        </div>

        {/* Right Column: Mini Stats & Quick Links */}
        <aside className="lg:col-span-4 space-y-12">
           <div className="bg-gray-900 rounded-[3rem] p-10 text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 rotate-45 group-hover:scale-150 transition-transform duration-700">
                 <Trophy size={160} />
              </div>
              
              <h3 className="text-[10px] font-black text-orange-400 uppercase tracking-[0.5em] mb-10 flex items-center gap-3">
                 <Target className="w-5 h-5" /> Matrix Scan
              </h3>
              
              <div className="space-y-10 relative z-10">
                 {[
                   { label: 'Total Deployments', value: stats.total.toString().padStart(2, '0'), icon: TrendingUp },
                   { label: 'Peak Proficiency', value: `${stats.best}%`, icon: Trophy },
                   { label: 'Mean Score', value: `${stats.avg}%`, icon: Zap }
                 ].map((s, i) => (
                   <div key={i} className="flex items-center gap-6 group/item">
                      <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center group-hover/item:bg-orange-500 transition-colors">
                         <s.icon className="w-6 h-6" />
                      </div>
                      <div>
                         <p className="text-3xl font-black font-display tracking-widest italic">{s.value}</p>
                         <p className="text-[9px] font-black text-orange-200 uppercase tracking-widest mt-1 opacity-50">{s.label}</p>
                      </div>
                   </div>
                 ))}
              </div>

              <div className="mt-12 pt-10 border-t border-white/10">
                 <button 
                  onClick={() => navigate('/student/history')}
                  className="w-full flex items-center justify-between group/btn"
                 >
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] group-hover/btn:text-orange-400 transition-colors">Audit Full History</span>
                    <ChevronRight className="w-5 h-5 text-orange-500 group-hover/btn:translate-x-2 transition-transform" />
                 </button>
              </div>
           </div>

           <div className="p-10 bg-white dark:bg-gray-800/80 backdrop-blur-xl rounded-[3rem] border border-gray-100 dark:border-white/5 space-y-8">
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] flex items-center gap-3">
                 <Settings className="w-5 h-5 text-orange-500" /> Core Params
              </h4>
              <div className="space-y-6">
                 {[
                   { label: 'Email Alerts', enabled: true },
                   { label: 'Public Leaderboard', enabled: stats.best > 70 },
                   { label: 'Shadow Mode', enabled: false }
                 ].map((t, i) => (
                   <div key={i} className="flex items-center justify-between">
                      <p className="text-xs font-black text-gray-700 dark:text-gray-200 uppercase tracking-tight">{t.label}</p>
                      <div className={`w-12 h-6 rounded-full relative ${t.enabled ? 'bg-orange-500' : 'bg-gray-200 dark:bg-gray-700'}`}>
                         <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${t.enabled ? 'right-1' : 'left-1'}`}></div>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </aside>
      </div>
    </div>
  );
};

export default Profile;
