import React, { useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import { useExams } from '../../hooks/useExams';
import { 
  BookOpen, 
  ClipboardCheck, 
  Award, 
  Trophy, 
  ChevronRight,
  Clock,
  Activity,
  ArrowRight,
  TrendingUp,
  FileText
} from 'lucide-react';

const StatCard = ({ title, value, subtext, icon: Icon, delay }) => (
  <div className="bg-white p-6 border border-slate-200 shadow-sm flex flex-col gap-4 animate-fade-in" style={{ animationDelay: `${delay}ms` }}>
    <div className="flex items-center justify-between">
      <div className="w-10 h-10 bg-slate-50 flex items-center justify-center text-blue-900 rounded">
        <Icon className="w-5 h-5" />
      </div>
      <TrendingUp className="w-4 h-4 text-slate-300" />
    </div>
    <div>
      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">{title}</p>
      <div className="flex items-baseline gap-2">
        <p className="text-3xl font-bold text-slate-900">{value}</p>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{subtext}</p>
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
    <div className="max-w-7xl mx-auto space-y-10 animate-fade-in font-serif">
      {/* Institutional Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-200 pb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Student Dashboard</h1>
          <p className="text-slate-500 text-sm italic font-normal">Welcome back, {user?.name}. Your institutional credentials have been verified. Access your active assessments and results below.</p>
        </div>
        
        <div className="bg-white border border-slate-200 px-6 py-3 flex items-center gap-4 shadow-sm">
           <div className="text-right">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Academic Standing</p>
              <p className="text-base font-bold text-blue-900">ENROLLED STUDENT</p>
           </div>
           <div className="w-px h-8 bg-slate-100"></div>
           <Activity className="text-blue-900 w-5 h-5" />
        </div>
      </header>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Active Exams" 
          value={activeExams.length} 
          subtext="Available" 
          icon={BookOpen} 
          delay={100}
        />
        <StatCard 
          title="Completed" 
          value={stats.completed} 
          subtext="Verified" 
          icon={ClipboardCheck} 
          delay={200}
        />
        <StatCard 
          title="Global Rank" 
          value={`#${stats.rank}`} 
          subtext="Standing" 
          icon={Trophy} 
          delay={300}
        />
        <StatCard 
          title="Proficiency" 
          value={`${stats.avgScore}%`} 
          subtext="Aggregate" 
          icon={Award} 
          delay={400}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Results Table */}
        <div className="lg:col-span-2 space-y-6">
           <div className="flex justify-between items-center border-b border-slate-200 pb-4">
             <h2 className="text-xl font-bold text-slate-800">Recent Results Ledger</h2>
             <Link to="/student/history" className="text-[11px] font-bold text-slate-400 hover:text-blue-900 uppercase tracking-widest flex items-center gap-1 transition-colors">
               Full History <ChevronRight className="w-4 h-4" />
             </Link>
           </div>
           
           <div className="space-y-4">
              {submissions.length > 0 ? (
                submissions.slice(0, 5).map((sub) => (
                  <div key={sub.id} className="bg-white p-5 border border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-6 hover:border-blue-900 transition-all shadow-sm">
                    <div className="flex items-center gap-6">
                      <div className={`w-14 h-14 flex items-center justify-center font-bold text-xl border ${sub.score >= 60 ? 'border-emerald-100 bg-emerald-50 text-emerald-700' : 'border-rose-100 bg-rose-50 text-rose-700'}`}>
                        {sub.score}%
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-lg mb-1">{sub.title || 'General Assessment'}</p>
                        <div className="flex items-center gap-3 text-[11px] text-slate-400 font-normal">
                           <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {sub.submit_time ? new Date(sub.submit_time).toLocaleDateString() : 'N/A'}</span>
                           <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                           <span className={sub.score >= 60 ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>{sub.score >= 60 ? 'PASSED' : 'FAILED'}</span>
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => window.location.href = `/student/result/${sub.id}`} 
                      className="px-5 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 text-[11px] font-bold uppercase tracking-widest transition-all active:scale-95"
                    >
                        View Analysis
                    </button>
                  </div>
                ))
              ) : (
                <div className="bg-slate-50/50 border border-slate-200 border-dashed p-16 text-center">
                   <FileText className="w-8 h-8 text-slate-300 mx-auto mb-4" />
                   <p className="text-slate-400 text-sm italic">No recent assessment records found.</p>
                </div>
              )}
           </div>
        </div>

        {/* Action Sidebar */}
        <div className="space-y-6">
           <section className="bg-white p-6 border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                 <div className="w-10 h-10 bg-slate-50 text-blue-900 rounded flex items-center justify-center"><BookOpen className="w-5 h-5" /></div>
                 <h3 className="text-lg font-bold text-slate-800">Academics</h3>
              </div>
              <p className="text-slate-500 text-sm italic font-normal leading-relaxed">Proceed to the upcoming assessments menu to begin your institutional examinations.</p>
              <Link to="/student/exams" className="block w-full bg-blue-900 text-white text-center py-3 text-[11px] font-bold uppercase tracking-widest hover:bg-blue-800 transition-colors">
                 Start Examination <ArrowRight className="w-4 h-4 inline ml-2" />
              </Link>
           </section>

           <section className="bg-slate-50 p-6 border border-slate-200 space-y-5">
              <div className="flex items-center gap-3 mb-2">
                 <Trophy className="w-5 h-5 text-blue-900" />
                 <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Global Rankings</h3>
              </div>
              <div className="space-y-3">
                 {[1, 2, 3].map(i => (
                   <div key={i} className="flex items-center justify-between p-3 bg-white border border-slate-100 shadow-sm">
                      <div className="flex items-center gap-3">
                         <div className="text-[10px] font-bold text-slate-300 w-4">0{i}</div>
                         <span className="text-xs font-bold text-slate-700">Candidate ID #{10024 + i}</span>
                      </div>
                      <span className="text-[10px] font-bold text-blue-900">TOP RANK</span>
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
