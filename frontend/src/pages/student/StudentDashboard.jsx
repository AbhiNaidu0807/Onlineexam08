import React, { useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import { useExams } from '../../hooks/useExams';
import { 
  BookOpen, 
  ClipboardCheck, 
  Target, 
  Award, 
  Calendar, 
  Trophy, 
  ExternalLink,
  ChevronRight,
  Zap,
  Clock,
  Layout,
  Fingerprint,
  Activity,
  ArrowRight
} from 'lucide-react';

const StatCard = ({ title, value, subtext, icon: Icon, colorClass, gradientClass, delay }) => (
  <div className={`relative group p-8 rounded-[3rem] bg-white border border-gray-100 shadow-xl overflow-hidden transition-all hover:scale-[1.02] active:scale-95 animate-fade-in`} style={{ animationDelay: `${delay}ms` }}>
    <div className={`absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-5 transition-transform group-hover:scale-150 ${colorClass}`}></div>
    <div className="flex flex-col gap-6 relative z-10">
      <div className={`w-14 h-14 rounded-2xl ${gradientClass} flex items-center justify-center text-white shadow-lg`}>
        <Icon className="w-8 h-8" />
      </div>
      <div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-2">{title}</p>
        <div className="flex items-baseline gap-3">
          <p className="text-4xl font-black font-display text-gray-900 italic tracking-tighter">{value}</p>
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{subtext}</p>
        </div>
      </div>
    </div>
  </div>
);

const StudentDashboard = () => {
  const { user } = useAuth();
  const { activeExams, submissions, getStudentStats, refreshData } = useExams();
  
  useEffect(() => {
     refreshData();
  }, []);

  const stats = useMemo(() => getStudentStats(user?.id), [user?.id, submissions]);

  return (
    <div className="max-w-7xl mx-auto space-y-16 animate-fade-in mb-20 px-4">
      {/* Dynamic Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-2">
             <span className="bg-orange-500 text-white px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.25em] shadow-lg shadow-orange-100">Official Access</span>
             <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          </div>
          <h1 className="text-6xl font-black font-display text-gray-900 tracking-tighter uppercase leading-none italic">
             Welcome, <span className="text-orange-500 not-italic">{user?.name}</span>
          </h1>
          <p className="text-gray-400 font-bold uppercase tracking-[0.3em] text-[10px] italic">Operational Readiness Verified • Student Terminal 01</p>
        </div>
        
        <div className="bg-white p-6 rounded-[2.5rem] flex items-center gap-6 group border-2 border-gray-50 shadow-2xl shadow-orange-100 transition-all hover:border-orange-200">
           <div className="text-right">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-1">Status Protocol</p>
              <p className="text-xl font-black font-display text-gray-900 italic tracking-tight">ELITE SCHOLAR</p>
           </div>
           <div className="w-16 h-16 bg-gray-900 rounded-[1.5rem] flex items-center justify-center shadow-2xl transition-transform group-hover:rotate-[15deg]">
              <Fingerprint className="text-orange-500 w-8 h-8" />
           </div>
        </div>
      </header>

      {/* Primary Analytics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard 
          title="Active Exams" 
          value={activeExams.length} 
          subtext="Deployments" 
          icon={BookOpen} 
          colorClass="bg-blue-500" 
          gradientClass="bg-gradient-to-tr from-blue-500 to-indigo-600"
          delay={100}
        />
        <StatCard 
          title="Completed" 
          value={stats.completed} 
          subtext="Verifications" 
          icon={ClipboardCheck} 
          colorClass="bg-emerald-500" 
          gradientClass="bg-gradient-to-tr from-emerald-500 to-teal-600"
          delay={200}
        />
        <StatCard 
          title="Global Rank" 
          value={`#${stats.rank}`} 
          subtext="Placement" 
          icon={Trophy} 
          colorClass="bg-orange-500" 
          gradientClass="bg-black"
          delay={300}
        />
        <StatCard 
          title="Proficiency" 
          value={`${stats.avgScore}%`} 
          subtext="Aggregate" 
          icon={Award} 
          colorClass="bg-orange-500" 
          gradientClass="bg-gradient-to-tr from-orange-400 to-orange-600"
          delay={400}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Recent Activity Ledger */}
        <div className="lg:col-span-8 space-y-10">
           <div className="flex justify-between items-center border-b-4 border-gray-50 pb-6">
             <h3 className="text-3xl font-black font-display text-gray-900 uppercase tracking-tighter flex items-center gap-4 italic">
               Recent <span className="text-orange-500 not-italic">Verifications</span>
             </h3>
             <Link to="/student/history" className="text-[10px] font-black text-gray-400 hover:text-orange-500 uppercase tracking-widest flex items-center gap-2 transition-colors">
               Full History <ChevronRight className="w-4 h-4" />
             </Link>
           </div>
           
           <div className="space-y-6">
              {submissions.length > 0 ? (
                submissions.slice(0, 5).map((sub, idx) => (
                  <div key={sub.id} className="bg-white p-8 rounded-[3rem] border-2 border-gray-50 flex flex-col sm:flex-row justify-between items-center gap-8 transition-all hover:border-orange-100 hover:shadow-2xl group">
                    <div className="flex items-center gap-8 text-center sm:text-left">
                      <div className={`w-20 h-20 rounded-[1.8rem] flex items-center justify-center font-black font-display text-2xl shadow-xl transition-transform group-hover:scale-110 ${sub.score >= 60 ? 'bg-emerald-500 text-white' : 'bg-orange-500 text-white'}`}>
                        {sub.score}%
                      </div>
                      <div>
                        <p className="font-black text-gray-900 text-2xl tracking-tighter leading-tight mb-2 italic uppercase">{sub.title || 'General Logic Fragment'}</p>
                        <div className="flex flex-wrap justify-center sm:justify-start items-center gap-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                           <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-orange-500" /> {sub.submit_time ? new Date(sub.submit_time).toLocaleDateString() : 'REAL-TIME'}</span>
                           <span className="w-1.5 h-1.5 bg-gray-200 rounded-full"></span>
                           <span className={sub.score >= 60 ? 'text-emerald-500' : 'text-orange-500'}>{sub.score >= 60 ? 'CERTIFIED' : 'RETAKE REQUIRED'}</span>
                        </div>
                      </div>
                    </div>
                    <button onClick={() => window.location.href = `/student/result/${sub.id}`} className="px-8 py-4 bg-gray-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] transition-all hover:bg-orange-600 active:scale-95 shadow-xl">
                        ANALYSIS →
                    </button>
                  </div>
                ))
              ) : (
                <div className="bg-gray-50/50 rounded-[3rem] border-4 border-dashed border-gray-100 p-24 text-center space-y-6">
                   <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto shadow-inner">
                      <Activity className="w-10 h-10 text-gray-200" />
                   </div>
                   <p className="text-gray-400 font-black uppercase tracking-[0.4em] text-[11px] italic">Neutral state: No intelligence fragments found.</p>
                </div>
              )}
           </div>
        </div>

        {/* Global Deployment Sidebar */}
        <div className="lg:col-span-4 space-y-10">
           <section className="bg-white p-10 rounded-[3.5rem] border-2 border-gray-50 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 -rotate-12 transition-transform group-hover:rotate-0 duration-1000">
                <Layout size={200} />
              </div>
              <div className="relative z-10 space-y-8">
                <div className="flex items-center gap-4">
                   <div className="w-14 h-14 bg-orange-500 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-orange-100"><Zap className="w-8 h-8" /></div>
                   <div>
                      <h3 className="text-2xl font-black font-display text-gray-900 uppercase italic leading-none">Intelligence</h3>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-1">Operational Cluster</p>
                   </div>
                </div>
                <p className="text-gray-500 font-bold italic leading-relaxed text-sm">Synchronize with pending assessment protocols to enhance your institutional proficiency and global standing.</p>
                <Link to="/student/exams" className="w-full bg-black text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] flex items-center justify-center gap-4 transition-all hover:bg-orange-500 shadow-2xl active:scale-95">
                   INITIALIZE EXAM <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
           </section>

           <section className="p-10 space-y-6">
             <div className="flex items-center gap-4 mb-4">
                <Trophy className="w-6 h-6 text-orange-500" />
                <h3 className="text-[11px] font-black text-gray-900 uppercase tracking-[0.5em] italic">Top Performers</h3>
             </div>
             <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl border border-gray-100 transition-all hover:scale-[1.05]">
                     <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center font-black text-[10px] text-gray-400 shadow-sm">{i}</div>
                        <span className="text-xs font-black text-gray-700 uppercase tracking-tighter">Candidate {100 + i}</span>
                     </div>
                     <span className="text-[10px] font-black text-orange-500">98% PR</span>
                  </div>
                ))}
             </div>
           </section>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
