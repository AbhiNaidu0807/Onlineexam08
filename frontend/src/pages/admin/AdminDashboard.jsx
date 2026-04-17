import React, { useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useExams } from '../../hooks/useExams';
import { 
  Plus, 
  Users, 
  ClipboardCheck, 
  FileText, 
  Calendar, 
  Trash2, 
  HelpCircle, 
  BarChart2, 
  CheckCircle,
  Clock,
  ShieldAlert,
  Zap,
  Activity,
  ArrowRight,
  ChevronRight
} from 'lucide-react';

const StatCard = ({ title, count, icon: Icon, colorClass, delay }) => (
  <div className={`relative group p-8 rounded-[3rem] bg-white border border-gray-100 shadow-xl overflow-hidden transition-all hover:scale-[1.02] active:scale-95 animate-fade-in`} style={{ animationDelay: `${delay}ms` }}>
    <div className={`absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-5 transition-transform group-hover:scale-150 ${colorClass}`}></div>
    <div className="flex flex-col gap-6 relative z-10">
      <div className={`w-14 h-14 rounded-2xl ${colorClass} flex items-center justify-center text-white shadow-lg`}>
        <Icon className="w-8 h-8" />
      </div>
      <div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-2">{title}</p>
        <p className="text-4xl font-black font-display text-gray-900 italic tracking-tighter">{count}</p>
      </div>
    </div>
  </div>
);

const AdminDashboard = () => {
  const { exams, students, submissions, deleteExam, publishExam, refreshData } = useExams();

  useEffect(() => {
    refreshData();
  }, []);

  const stats = useMemo(() => {
    const upcoming = exams.filter(e => new Date(e.startDate) > new Date()).length;
    return {
      totalExams: exams.length,
      totalStudents: students.length,
      totalSubmissions: submissions.length,
      upcomingExams: upcoming
    };
  }, [exams, students, submissions]);

  const getStatusBadge = (exam) => {
    const now = new Date();
    const start = new Date(exam.start_time);
    const end = new Date(exam.end_time);

    if (exam.status === 'draft' || !exam.is_published) {
      return <span className="bg-gray-100 text-gray-400 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest">Draft Archive</span>;
    }
    if (now > end) {
      return <span className="bg-rose-500 text-white px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-lg shadow-rose-100">Terminated</span>;
    }
    if (now >= start && now <= end) {
      return <span className="bg-emerald-500 text-white px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-lg shadow-emerald-100">Active Field</span>;
    }
    return <span className="bg-blue-500 text-white px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-lg shadow-blue-100">Scheduled</span>;
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this assessment sequence? All associated data will be purged.')) {
      deleteExam(id);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-16 animate-fade-in px-4 mb-20">
      {/* Institutional Controller Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-2">
             <span className="bg-gray-900 text-white px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.3em] shadow-xl">Controller Terminal</span>
             <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse shadow-[0_0_10px_#f43f5e]"></span>
          </div>
          <h1 className="text-6xl font-black font-display text-gray-900 tracking-tighter uppercase leading-none italic">
             Resource <span className="text-orange-500 not-italic">Manager</span>
          </h1>
          <p className="text-gray-400 font-bold uppercase tracking-[0.3em] text-[10px] italic">Institutional Control Cluster 07 • Live Environment Synchronization Active</p>
        </div>
        
        <Link 
          to="/admin/exams/create" 
          className="group relative overflow-hidden bg-black text-white px-10 py-5 rounded-[2rem] font-black text-[10px] tracking-[0.4em] uppercase shadow-2xl transition-all hover:scale-105 active:scale-95 flex items-center gap-4 group"
        >
          <div className="absolute inset-0 bg-orange-600 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
          <span className="relative z-10 flex items-center gap-4">
             INITIALIZE ARCHIVE <Plus className="w-5 h-5" />
          </span>
        </Link>
      </header>

      {/* Institutional Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard title="Total Assets" count={stats.totalExams} icon={FileText} colorClass="bg-orange-500" delay={100} />
        <StatCard title="Global Identity" count={stats.totalStudents} icon={Users} colorClass="bg-blue-500" delay={200} />
        <StatCard title="Verifications" count={stats.totalSubmissions} icon={ClipboardCheck} colorClass="bg-emerald-500" delay={300} />
        <StatCard title="Upcoming Sync" count={stats.upcomingExams} icon={Calendar} colorClass="bg-purple-500" delay={400} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
        {/* Assessment Management Panel */}
        <div className="xl:col-span-8 space-y-10">
          <div className="bg-white rounded-[3.5rem] border-2 border-gray-50 overflow-hidden shadow-2xl transition-all hover:border-orange-100">
            <div className="px-10 py-8 border-b-4 border-gray-50 flex justify-between items-center bg-gray-50/30">
              <h2 className="text-2xl font-black font-display text-gray-900 uppercase italic tracking-tight flex items-center gap-4">
                <ShieldAlert className="w-6 h-6 text-orange-500" /> Assessment <span className="text-orange-500 not-italic">Ledger</span>
              </h2>
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-emerald-500"></div> REAL-TIME SYNC
              </div>
            </div>
            
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/50">
                    <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Sequence Identity</th>
                    <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Protocol Status</th>
                    <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Operation Controls</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {exams.map((exam) => (
                    <tr key={exam.id} className="hover:bg-gray-50/30 transition-colors group">
                      <td className="px-10 py-8">
                        <p className="text-lg font-black text-gray-900 italic tracking-tighter mb-2 group-hover:text-orange-500 transition-colors">{exam.title.toUpperCase()}</p>
                        <div className="flex items-center gap-4 text-[9px] font-black text-gray-400 uppercase tracking-widest">
                          <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-orange-500" /> {exam.duration}m</span>
                          <span className="w-1.5 h-1.5 bg-gray-200 rounded-full"></span>
                          <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500" /> {exam.passing_score}% MIN</span>
                        </div>
                      </td>
                      <td className="px-10 py-8 text-center">
                        {getStatusBadge(exam)}
                      </td>
                      <td className="px-10 py-8">
                        <div className="flex justify-end gap-3 items-center">
                          {(!exam.is_published && exam.status === 'draft') && (
                            <button 
                              onClick={() => publishExam(exam.id)}
                              disabled={!exam.question_count || exam.question_count === 0}
                              className={`px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                                (!exam.question_count || exam.question_count === 0) 
                                ? 'bg-gray-100 text-gray-300 cursor-not-allowed' 
                                : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-xl shadow-emerald-100 active:scale-95'
                              }`}
                            >
                              Deploy
                            </button>
                          )}
                          <Link to={`/admin/exams/questions/${exam.id}`} className="p-3 text-gray-300 hover:text-orange-500 hover:bg-orange-50 rounded-xl transition-all" title="Fragments"><HelpCircle className="w-5 h-5" /></Link>
                          <Link to={`/admin/exams/results/${exam.id}`} className="p-3 text-gray-300 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all" title="Logs"><BarChart2 className="w-5 h-5" /></Link>
                          <button onClick={() => handleDelete(exam.id)} className="p-3 text-gray-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"><Trash2 className="w-5 h-5" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Global Control Sidebar */}
        <div className="xl:col-span-4 space-y-10">
           <div className="bg-white rounded-[3.5rem] p-10 border-2 border-gray-50 shadow-2xl space-y-10">
              <div className="flex items-center gap-4 mb-2">
                 <div className="w-12 h-12 bg-gray-900 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-gray-100"><Activity className="w-6 h-6" /></div>
                 <h3 className="text-xl font-black text-gray-900 uppercase italic leading-none">Integrity</h3>
              </div>
              <div className="space-y-8">
                 <div className="flex items-center gap-6 group">
                    <div className="w-14 h-14 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110">
                       <ShieldAlert className="w-7 h-7" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">Database Shards</p>
                        <p className="text-sm font-black text-gray-900 leading-none">CONNECTED & SYNCED</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-6 group">
                    <div className="w-14 h-14 bg-orange-500/10 text-orange-500 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110">
                       <Zap className="w-7 h-7" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">Response Logic</p>
                        <p className="text-sm font-black text-gray-900 leading-none">ZERO-LATENCY STREAM</p>
                    </div>
                 </div>
              </div>
              <Link to="/admin/students" className="w-full py-5 bg-gray-50 hover:bg-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-4 transition-all">
                 VERIFY CLUSTER <ChevronRight className="w-5 h-5" />
              </Link>
           </div>

           <div className="bg-gradient-to-br from-gray-900 to-black rounded-[3.5rem] p-10 text-white space-y-6 shadow-2xl group overflow-hidden relative">
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000"></div>
              <p className="text-[10px] font-black text-orange-500 uppercase tracking-[0.4em] relative z-10">Institutional Notice</p>
              <h4 className="text-2xl font-black font-display italic tracking-tight relative z-10 leading-tight">Proctoring reports for the latest 0x7 session are now ready for audit.</h4>
              <button className="text-[10px] font-black text-white px-8 py-3 bg-white/10 rounded-xl hover:bg-orange-500 transition-all relative z-10 tracking-[0.3em] uppercase underline decoration-2 underline-offset-8">Start Audit Analysis</button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
