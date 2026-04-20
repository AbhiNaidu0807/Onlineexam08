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
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

const StatCard = ({ title, count, icon: Icon, delay }) => (
  <div className="bg-white p-6 border border-slate-200 shadow-sm flex flex-col gap-4 animate-fade-in" style={{ animationDelay: `${delay}ms` }}>
    <div className="flex items-center justify-between">
      <div className="w-10 h-10 bg-slate-50 flex items-center justify-center text-primary rounded">
        <Icon className="w-5 h-5" />
      </div>
      <TrendingUp className="w-4 h-4 text-slate-300" />
    </div>
    <div>
      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">{title}</p>
      <p className="text-3xl font-bold text-slate-900">{count}</p>
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
      return <span className="bg-slate-100 text-slate-500 px-2 py-0.5 border border-slate-200 text-[10px] font-bold uppercase tracking-wider">Draft</span>;
    }
    if (now > end) {
      return <span className="bg-rose-50 text-rose-600 px-2 py-0.5 border border-rose-100 text-[10px] font-bold uppercase tracking-wider">Closed</span>;
    }
    if (now >= start && now <= end) {
      return <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 border border-emerald-100 text-[10px] font-bold uppercase tracking-wider">Active</span>;
    }
    return <span className="bg-blue-50 text-blue-600 px-2 py-0.5 border border-blue-100 text-[10px] font-bold uppercase tracking-wider">Scheduled</span>;
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this exam? All associated data will be removed.')) {
      deleteExam(id);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-fade-in font-serif">
      {/* Institutional Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-200 pb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Admin Dashboard</h1>
          <p className="text-slate-500 text-sm italic font-normal">Welcome to the Eagle Exam institutional management system. Monitor and coordinate all academic assessments from this portal.</p>
        </div>
        
        <Link 
          to="/admin/exams/create" 
          className="btn-primary"
        >
          <Plus className="w-4 h-4" /> Create New Exam
        </Link>
      </header>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Exams" count={stats.totalExams} icon={FileText} delay={100} />
        <StatCard title="Total Students" count={stats.totalStudents} icon={Users} delay={200} />
        <StatCard title="Submissions" count={stats.totalSubmissions} icon={ClipboardCheck} delay={300} />
        <StatCard title="Upcoming Exams" count={stats.upcomingExams} icon={Calendar} delay={400} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Exam Management Table */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" /> Exam Management Ledger
              </h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Exam Title</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center">Status</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {exams.map((exam) => (
                    <tr key={exam.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-5">
                        <p className="text-base font-bold text-slate-900 mb-1">{exam.title}</p>
                        <div className="flex items-center gap-4 text-[11px] text-slate-400 font-normal">
                          <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {exam.duration} Minutes</span>
                          <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5" /> Passing: {exam.passing_score}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        {getStatusBadge(exam)}
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex justify-end gap-2 items-center">
                          {(!exam.is_published && exam.status === 'draft') && (
                            <button 
                              onClick={() => publishExam(exam.id)}
                              disabled={!exam.question_count || exam.question_count === 0}
                              className={`px-3 py-1.5 rounded text-[11px] font-bold uppercase tracking-wider transition-all ${
                                (!exam.question_count || exam.question_count === 0) 
                                ? 'bg-slate-100 text-slate-300 cursor-not-allowed' 
                                : 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95'
                              }`}
                            >
                              Publish
                            </button>
                          )}
                          <Link to={`/admin/exams/questions/${exam.id}`} className="p-2 text-slate-400 hover:text-primary hover:bg-slate-100 rounded transition-all" title="Manage Questions"><HelpCircle className="w-5 h-5" /></Link>
                          <Link to={`/admin/exams/results/${exam.id}`} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-all" title="View Results"><BarChart2 className="w-5 h-5" /></Link>
                          <button onClick={() => handleDelete(exam.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-all"><Trash2 className="w-5 h-5" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {exams.length === 0 && (
                    <tr>
                      <td colSpan="3" className="px-6 py-20 text-center text-slate-400 italic">No exams found in the institutional records.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* System Status Sidebar */}
        <div className="space-y-6">
           <div className="bg-white border border-slate-200 p-6 shadow-sm space-y-6">
              <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-primary" /> System Status
              </h3>
              <div className="space-y-4">
                 <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 font-normal italic">Database Connectivity</span>
                    <span className="text-emerald-600 font-bold uppercase text-[10px] tracking-widest">Stable</span>
                 </div>
                 <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 font-normal italic">Proctoring Engine</span>
                    <span className="text-emerald-600 font-bold uppercase text-[10px] tracking-widest">Active</span>
                 </div>
                 <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 font-normal italic">Resource Allocation</span>
                    <span className="text-blue-600 font-bold uppercase text-[10px] tracking-widest">Optimized</span>
                 </div>
              </div>
              <Link to="/admin/students" className="w-full py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded text-[11px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all">
                 Manage Enrollment <ChevronRight className="w-4 h-4" />
              </Link>
           </div>

           <div className="bg-primary p-6 text-white space-y-4 shadow-sm border-l-4 border-accent">
              <p className="text-[11px] font-bold text-slate-300 uppercase tracking-[0.2em]">Institutional Memorandum</p>
              <h4 className="text-lg font-bold italic leading-tight">New proctoring standards have been implemented for all upcoming sessions. Please review the updated protocols in settings.</h4>
              <button className="text-[11px] font-bold text-white py-2 px-4 bg-white/10 hover:bg-white/20 rounded uppercase tracking-widest border border-white/20">Review Protocols</button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
