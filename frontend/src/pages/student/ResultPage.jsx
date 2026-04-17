import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { 
  Trophy, 
  Award, 
  CheckCircle2, 
  XCircle, 
  Target, 
  Zap, 
  ArrowLeft,
  FileText,
  Download,
  ShieldCheck,
  TrendingUp,
  Calendar,
  ChevronRight,
  Info,
  Clock,
  Printer
} from 'lucide-react';

const ResultPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        setLoading(true);
        // Sync with central database shared with admin
        const data = await api.get(`/attempts/result/${id}`);
        setResult(data);
      } catch (error) {
        console.error('Error fetching synced results:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [id]);

  const getGradeInfo = (percentage) => {
    if (percentage >= 90) return { grade: 'A+', status: 'EXCELLENT', color: 'text-emerald-500', bg: 'bg-emerald-50', icon: Award };
    if (percentage >= 75) return { grade: 'A', status: 'PASS', color: 'text-green-500', bg: 'bg-green-50', icon: CheckCircle2 };
    if (percentage >= 60) return { grade: 'B', status: 'PASS', color: 'text-blue-500', bg: 'bg-blue-50', icon: Trophy };
    if (percentage >= 40) return { grade: 'C', status: 'PROBATION', color: 'text-orange-500', bg: 'bg-orange-50', icon: TrendingUp };
    return { grade: 'FAIL', status: 'FAIL', color: 'text-rose-500', bg: 'bg-rose-50', icon: XCircle };
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[600px] animate-pulse">
       <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-6"></div>
       <p className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">Synchronizing Analytics...</p>
    </div>
  );
  
  if (!result) return (
    <div className="max-w-2xl mx-auto text-center py-32 space-y-6">
       <XCircle className="w-20 h-20 text-rose-500 mx-auto" />
       <h1 className="text-4xl font-black font-display text-gray-900 dark:text-white uppercase tracking-tighter">Result Not Found</h1>
       <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">The requested assessment token is not present in the master repository.</p>
       <button 
         onClick={() => navigate('/student')}
         className="mt-8 px-10 py-4 bg-gray-900 dark:bg-orange-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl"
       >
         Return to Command Center
       </button>
    </div>
  );

  const { attempt, exam, answers } = result;
  const percentage = attempt.total_marks > 0 ? ((attempt.score / attempt.total_marks) * 100).toFixed(1) : 0;
  const grade = getGradeInfo(parseFloat(percentage));
  const isPassed = parseFloat(percentage) >= (exam?.passing_score || 50);

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-fade-in pb-32">
      {/* Action Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 px-4 print:hidden">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
             <span className="bg-orange-500 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-orange-100">Official Report</span>
             <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          </div>
          <h1 className="text-5xl font-black font-display text-gray-900 dark:text-white tracking-tighter uppercase leading-none">Assessment <span className="text-orange-500 italic">Result</span></h1>
          <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] italic">{exam?.title} - Database Synced</p>
        </div>
        
        <div className="flex flex-wrap gap-4">
           <button onClick={() => window.print()} className="flex items-center gap-3 px-6 py-3.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:scale-105 transition-all outline outline-2 outline-gray-50 dark:outline-white/5">
              <Printer className="w-4 h-4 text-orange-500" /> Export PDF
           </button>
           <button 
             onClick={() => navigate('/student/leaderboard/' + exam.id)}
             className="flex items-center gap-3 px-6 py-3.5 bg-gray-900 dark:bg-orange-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl hover:scale-105 transition-all"
           >
              Global Rank <Trophy className="w-4 h-4" />
           </button>
        </div>
      </header>

      {/* Hero Result Card */}
      <div className={`relative overflow-hidden bg-white dark:bg-gray-800/80 backdrop-blur-xl rounded-[3rem] shadow-2xl border-t-8 transition-all ${isPassed ? 'border-emerald-500' : 'border-rose-500'}`}>
         {/* Background Decor */}
         <div className="absolute top-0 right-0 p-12 opacity-[0.03] rotate-12">
            <grade.icon size={300} />
         </div>

         <div className="p-12 md:p-20 text-center flex flex-col items-center relative z-10">
            <div className={`w-36 h-36 rounded-[2.5rem] flex items-center justify-center shadow-2xl mb-10 transform rotate-6 transition-transform hover:rotate-0 duration-700 ${isPassed ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
               <grade.icon className="w-20 h-20" />
            </div>

            <div className="space-y-6 mb-16">
               <div className={`inline-flex items-center gap-3 px-10 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.4em] ${grade.bg} ${grade.color} shadow-lg shadow-orange-50/50`}>
                  GRADE: {grade.grade}
               </div>
               <h2 className="text-9xl font-black font-display tracking-tighter text-gray-900 dark:text-white italic">
                  {percentage}<span className="text-4xl opacity-20 NOT-italic">%</span>
               </h2>
               <div className="flex flex-col items-center">
                  <p className={`text-4xl font-black font-display uppercase tracking-tighter ${isPassed ? 'text-emerald-500' : 'text-rose-500'}`}>
                     {grade.status}
                  </p>
                  {!isPassed && (
                    <p className="text-rose-600 font-black uppercase tracking-widest text-[11px] mt-2 animate-bounce">Needs Retake</p>
                  )}
               </div>
               <p className="text-gray-400 font-black uppercase tracking-[0.3em] text-[10px]">
                  Aggregated Score: {attempt.score} / {attempt.total_marks} marks
               </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-4xl">
               {[
                  { label: 'Min. Proficiency', value: `${exam?.passing_score || 50}%`, icon: ShieldCheck, color: 'text-orange-500' },
                  { label: 'Time Utilization', value: attempt.time_taken ? `${Math.floor(attempt.time_taken/60)}m ${attempt.time_taken%60}s` : 'N/A', icon: Clock, color: 'text-blue-500' },
                  { label: 'Verification', value: 'DATABASE SYNCED', icon: Zap, color: 'text-emerald-500' },
                  { label: 'Submission', value: new Date(attempt.submit_time || Date.now()).toLocaleDateString(), icon: Calendar, color: 'text-gray-400' }
               ].map((stat, i) => (
                  <div key={i} className="bg-gray-50 dark:bg-white/5 p-6 rounded-3xl border border-gray-100 dark:border-white/5 group hover:bg-gray-900 transition-all duration-500">
                     <stat.icon className={`w-5 h-5 mx-auto mb-4 ${stat.color} transition-transform group-hover:scale-125`} />
                     <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 group-hover:text-gray-500">
                        {stat.label}
                     </p>
                     <p className="text-xs font-black text-gray-900 dark:text-white group-hover:text-white uppercase tracking-tight">
                        {stat.value}
                     </p>
                  </div>
               ))}
            </div>

            {!isPassed && (
              <div className="mt-16 w-full max-w-md">
                 <button 
                  onClick={() => navigate(`/student/exams`)}
                  className="w-full bg-rose-600 text-white py-5 rounded-2xl font-black uppercase tracking-[0.3em] text-sm shadow-2xl hover:scale-105 active:scale-95 transition-all"
                 >
                   Initialize Retake Cluster
                 </button>
              </div>
            )}
         </div>
      </div>

      {/* Response Analysis Breakdown */}
      <section className="space-y-8 px-4">
         <div className="flex items-center justify-between pb-4 border-b-4 border-gray-50 dark:border-white/5">
            <h3 className="text-3xl font-black font-display text-gray-900 dark:text-white uppercase tracking-tighter flex items-center gap-4">
               Detailed <span className="text-orange-500 italic">Breakdown</span>
            </h3>
            <div className="flex items-center gap-2 px-6 py-2 bg-gray-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl">
               <Info className="w-4 h-4 text-orange-500" /> {answers.length} Fragments
            </div>
         </div>

         <div className="space-y-10">
            {answers.map((ans, idx) => (
               <div key={idx} className={`p-10 rounded-[2.5rem] border-2 transition-all group ${ans.is_correct ? 'bg-white dark:bg-emerald-500/5 border-emerald-50 dark:border-emerald-500/10' : 'bg-white dark:bg-rose-500/5 border-rose-50 dark:border-rose-500/10'}`}>
                  <div className="flex justify-between items-start mb-10">
                     <div className="flex items-center gap-5">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black font-display text-2xl shadow-xl group-hover:rotate-12 transition-transform duration-500 ${ans.is_correct ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                           {(idx + 1).toString().padStart(2, '0')}
                        </div>
                        <div>
                           <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Knowledge Segment</p>
                           <p className="text-xs font-black text-gray-900 dark:text-gray-100 uppercase mt-0.5 tracking-tighter italic">Source Verification Active</p>
                        </div>
                     </div>
                     <div className={`px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.3em] flex items-center gap-3 shadow-lg ${ans.is_correct ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                        {ans.is_correct ? 'CORRECT' : 'INCORRECT'}
                        <div className={`w-2 h-2 rounded-full ${ans.is_correct ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-rose-500 shadow-[0_0_10px_#f43f5e]'}`}></div>
                     </div>
                  </div>

                  <h4 className="text-2xl font-black font-display text-gray-900 dark:text-white mb-10 leading-tight">
                     {ans.question_text}
                  </h4>

                  <div className="grid md:grid-cols-2 gap-8">
                     <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Your Submission</label>
                        <div className={`p-8 rounded-3xl border-2 min-h-[100px] flex items-center group-hover:scale-[1.02] transition-transform ${ans.is_correct ? 'bg-emerald-50/20 border-emerald-100 dark:border-emerald-500/10' : 'bg-rose-50/20 border-rose-100 dark:border-rose-500/10'}`}>
                           <p className={`text-xl font-black italic tracking-tight ${ans.is_correct ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}`}>
                              {ans.answer || '-- NIL RESPONSE --'}
                           </p>
                        </div>
                     </div>
                     <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Institutional Key</label>
                        <div className="p-8 bg-gray-900 dark:bg-gray-700 rounded-3xl border-2 border-gray-900 dark:border-gray-600 min-h-[100px] flex items-center shadow-xl group-hover:scale-[1.02] transition-transform">
                           <p className="text-xl font-black text-white italic tracking-tight uppercase">
                              {ans.correct_answer}
                           </p>
                        </div>
                     </div>
                  </div>

                  {ans.explanation && (
                     <div className="mt-10 p-8 bg-orange-500/5 dark:bg-orange-500/10 border-l-8 border-orange-500 rounded-r-[2rem]">
                        <div className="flex items-center gap-3 mb-3">
                           <Info className="w-5 h-5 text-orange-500" />
                           <p className="text-[11px] font-black text-orange-600 dark:text-orange-400 uppercase tracking-[0.3em]">Institutional Justification</p>
                        </div>
                        <p className="text-lg text-gray-700 dark:text-gray-200 font-bold italic leading-relaxed">{ans.explanation}</p>
                     </div>
                  )}
               </div>
            ))}
         </div>
      </section>

      <div className="text-center pt-10 px-4">
         <button 
           onClick={() => navigate('/student')}
           className="px-12 py-5 bg-gray-900 dark:bg-orange-600 text-white rounded-3xl font-black uppercase tracking-[0.5em] text-xs shadow-2xl hover:scale-105 transition-all"
         >
           Close Report Cluster
         </button>
      </div>
    </div>
  );
};

export default ResultPage;
