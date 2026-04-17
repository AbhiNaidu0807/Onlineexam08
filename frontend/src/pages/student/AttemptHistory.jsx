import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { 
  History, 
  Search, 
  Filter, 
  ArrowRight, 
  CheckCircle, 
  XCircle, 
  Clock, 
  ChevronRight,
  TrendingUp,
  Database,
  Calendar,
  Award,
  BarChart4,
  Target,
  FileDown
} from 'lucide-react';

const AttemptHistory = () => {
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, passed, failed

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        // Synchronize with master assessment repository
        const data = await api.get('/attempts/my');
        setAttempts(data || []);
      } catch (error) {
        console.error('Master Core Sync Error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const stats = useMemo(() => {
    if (!attempts.length) return { total: 0, avg: 0, best: 0 };
    const total = attempts.length;
    const scores = attempts.map(a => (a.score / a.total_marks) * 100);
    const avg = scores.reduce((a, b) => a + b, 0) / total;
    const best = Math.max(...scores);
    return { total, avg: Math.round(avg), best: Math.round(best) };
  }, [attempts]);

  const filteredAttempts = useMemo(() => {
    if (filter === 'all') return attempts;
    return attempts.filter(att => {
      const percentage = (att.score / att.total_marks) * 100;
      return filter === 'passed' ? percentage >= 50 : percentage < 50;
    });
  }, [attempts, filter]);

  if (loading) return (
    <div className="min-h-[600px] flex flex-col items-center justify-center animate-pulse">
       <div className="w-20 h-20 border-t-8 border-orange-500 border-r-8 border-r-transparent rounded-full animate-spin mb-8"></div>
       <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Querying Assessment Ledger...</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-fade-in pb-32">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10 px-4">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
             <span className="bg-orange-500 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-[0.3em] shadow-xl shadow-orange-100 dark:shadow-none">Ledger Analysis</span>
             <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse border-2 border-white dark:border-gray-900 shadow-[0_0_10px_#22c55e]"></span>
          </div>
          <h1 className="text-5xl font-black font-display text-gray-900 dark:text-white tracking-tighter uppercase leading-none italic">
             Attempt <span className="text-orange-500">History</span>
          </h1>
          <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Real-time database synchronization active</p>
        </div>

        <div className="flex items-center gap-3 bg-white dark:bg-gray-800 p-2 rounded-2xl shadow-xl border border-gray-100 dark:border-white/5">
           {['all', 'passed', 'failed'].map(f => (
             <button 
               key={f}
               onClick={() => setFilter(f)}
               className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${filter === f ? 'bg-orange-600 text-white shadow-2xl scale-105' : 'text-gray-400 hover:text-orange-500'}`}
             >
               {f}
             </button>
           ))}
        </div>
      </header>

      {/* Stats Summary Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
         {[
           { label: 'Total Deployments', value: stats.total, icon: Database, color: 'text-orange-500', bg: 'bg-orange-500/5' },
           { label: 'Mean Proficiency', value: `${stats.avg}%`, icon: BarChart4, color: 'text-blue-500', bg: 'bg-blue-500/5' },
           { label: 'Peak Performance', value: `${stats.best}%`, icon: Target, color: 'text-emerald-500', bg: 'bg-emerald-500/5' }
         ].map((s, i) => (
           <div key={i} className={`p-8 rounded-[2.5rem] border border-gray-100 dark:border-white/5 bg-white dark:bg-gray-800/80 shadow-2xl shadow-orange-50/50 dark:shadow-none flex flex-col justify-between group hover:border-orange-500/50 transition-all`}>
              <div className="flex justify-between items-start mb-6">
                 <div className={`p-4 rounded-2xl ${s.bg} transition-transform group-hover:scale-110 duration-500`}>
                    <s.icon className={`w-8 h-8 ${s.color}`} />
                 </div>
                 <div className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Analytics.v2</div>
              </div>
              <div>
                 <p className="text-4xl font-black font-display text-gray-900 dark:text-white italic leading-none truncate">{s.value}</p>
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">{s.label}</p>
              </div>
           </div>
         ))}
      </div>

      <div className="space-y-6 px-4">
        {filteredAttempts.length > 0 ? (
          filteredAttempts.map((att) => {
            const percentage = ((att.score / att.total_marks) * 100).toFixed(0);
            const isPassed = percentage >= 50;
            
            return (
              <div key={att.id} className="group bg-white dark:bg-gray-800/80 backdrop-blur-xl rounded-[2.5rem] p-8 border border-gray-50 dark:border-white/5 shadow-2xl shadow-orange-50/30 dark:shadow-none transition-all hover:scale-[1.01] hover:shadow-orange-100 dark:hover:shadow-none flex flex-col md:flex-row items-center gap-12 relative overflow-hidden">
                <div className={`w-2 h-full absolute left-0 top-0 transition-all ${isPassed ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                
                <div className={`w-24 h-24 rounded-[2rem] flex items-center justify-center font-black font-display text-2xl shadow-2xl shrink-0 group-hover:rotate-12 transition-transform duration-700 ${isPassed ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                  {percentage}<span className="text-xs opacity-60 ml-0.5">%</span>
                </div>

                <div className="flex-grow space-y-4">
                   <div className="flex items-center gap-4">
                      <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.3em] shadow-lg ${isPassed ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                         {isPassed ? 'Validated' : 'Needs Review'}
                      </span>
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-orange-500" />
                        {new Date(att.submit_time || att.start_time).toLocaleDateString(undefined, { dateStyle: 'long' })}
                      </span>
                   </div>
                   <h3 className="text-3xl font-black font-display text-gray-900 dark:text-white uppercase tracking-tighter leading-none">{att.exam_title || 'Institutional Certification'}</h3>
                   <div className="flex items-center gap-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      <span className="flex items-center gap-2 bg-gray-50 dark:bg-white/5 px-3 py-1 rounded-lg">
                         <Clock className="w-4 h-4 text-orange-500" /> SYNCED
                      </span>
                      <span className="flex items-center gap-2 bg-gray-50 dark:bg-white/5 px-3 py-1 rounded-lg">
                         <Database className="w-4 h-4 text-emerald-500" /> MASTER DB
                      </span>
                   </div>
                </div>

                <div className="flex flex-col items-center md:items-end gap-6 shrink-0">
                   <div className="text-center md:text-right">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Assessment Index</p>
                      <p className="text-3xl font-black font-display text-gray-900 dark:text-white tracking-widest italic">{att.score} / {att.total_marks}</p>
                   </div>
                   <button 
                     onClick={() => navigate(`/student/result/${att.id}`)}
                     className="px-10 py-4 bg-gray-900 dark:bg-orange-600 text-white rounded-3xl font-black uppercase tracking-[0.3em] text-[10px] shadow-2xl hover:scale-105 transition-all flex items-center gap-3"
                   >
                     Initialize Report <ChevronRight className="w-5 h-5" />
                   </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-40 bg-white dark:bg-gray-800/20 rounded-[3rem] border-4 border-dashed border-gray-100 dark:border-white/5 text-center space-y-8">
             <div className="w-24 h-24 bg-gray-50 dark:bg-gray-800 rounded-[2.5rem] flex items-center justify-center mx-auto opacity-30">
                <History className="w-12 h-12 text-gray-400" />
             </div>
             <div className="space-y-2 px-10">
                <p className="text-2xl font-black font-display text-gray-400 uppercase tracking-widest">Zero Index Results</p>
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-loose italic">No master assessing fragments found for current filter criteria.</p>
             </div>
          </div>
        )}
      </div>

      <div className="text-center pt-20 px-4">
         <button 
           className="inline-flex items-center gap-3 px-10 py-4.5 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] shadow-2xl hover:bg-orange-600 transition-all border-b-4 border-orange-700"
         >
            <FileDown className="w-5 h-5 text-orange-500" /> Export History Matrix (.CSV)
         </button>
      </div>
    </div>
  );
};

export default AttemptHistory;
