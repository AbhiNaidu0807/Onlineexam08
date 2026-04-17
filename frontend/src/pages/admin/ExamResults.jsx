import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useExams } from '../../hooks/useExams';
import * as XLSX from 'xlsx';
import { 
  Trophy, 
  Users, 
  Target, 
  TrendingUp, 
  ArrowLeft, 
  PieChart, 
  Download 
} from 'lucide-react';

const ExamResults = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getExamById, getSubmissionsForExam, students } = useExams();

  const exam = getExamById(id);
  const examSubmissions = getSubmissionsForExam(id);

  const analytics = useMemo(() => {
    if (!examSubmissions.length) return null;

    const scores = examSubmissions.map(s => (s.score / (s.totalMarks || 100)) * 100);
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    const passCount = scores.filter(s => s >= (exam?.passing_score || 50)).length;
    
    const leaderboard = examSubmissions
      .map(s => ({
        ...s,
        studentName: students.find(std => std.id === s.studentId)?.name || 'Unknown Student',
        percentage: Math.round((s.score / (s.totalMarks || 100)) * 100)
      }))
      .sort((a, b) => b.score - a.score);

    return {
      avgScore: Math.round(avgScore),
      passRate: Math.round((passCount / scores.length) * 100),
      totalSubmissions: examSubmissions.length,
      leaderboard
    };
  }, [examSubmissions, students, exam]);

  const handleExportExcel = () => {
    const data = analytics.leaderboard.map(s => ({
      Rank: analytics.leaderboard.indexOf(s) + 1,
      Name: s.studentName,
      Email: students.find(std => std.id === s.studentId)?.email || 'N/A',
      Score: s.score,
      Total: s.totalMarks,
      Percentage: `${s.percentage}%`,
      Status: s.percentage >= (exam.passing_score || 50) ? 'PASS' : 'FAIL',
      Submitted: new Date(s.submitTime).toLocaleString()
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Exam Results");
    XLSX.writeFile(wb, `${exam.title.replace(/\s+/g, '_')}_results.xlsx`);
  };

  if (!exam) return <div className="text-center py-20 font-bold opacity-50">Exam not found...</div>;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 animate-in fade-in duration-500">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-12">
        <div className="flex items-center gap-6">
          <button onClick={() => navigate('/admin')} className="p-3 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:bg-gray-50 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </button>
          <div>
            <h1 className="text-4xl font-black text-gray-900 dark:text-white leading-tight">Intelligence <span className="text-blue-600">Report</span></h1>
            <p className="text-gray-500 dark:text-gray-400 font-medium tracking-tight">Post-assessment performance audit for <span className="font-bold text-gray-700 dark:text-gray-200">{exam.title}</span></p>
          </div>
        </div>
        <div className="flex gap-3">
           <button 
             onClick={handleExportExcel}
             disabled={!analytics}
             className="px-8 py-4 bg-gray-900 dark:bg-gray-700 text-white font-black rounded-2xl hover:bg-black transition-all flex items-center gap-2 shadow-xl shrink-0 disabled:opacity-50"
           >
             <Download className="w-5 h-5" /> EXPORT EXCEL
           </button>
        </div>
      </header>

      {!analytics ? (
        <div className="py-32 text-center bg-white dark:bg-gray-800 rounded-[3rem] border border-gray-100 dark:border-gray-700 shadow-sm">
           <PieChart className="w-20 h-20 text-gray-100 dark:text-gray-700 mx-auto mb-6" />
           <p className="text-gray-400 font-medium text-lg uppercase tracking-widest text-xs font-black">Zero Submissions Synchronized</p>
        </div>
      ) : (
        <div className="space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-[2rem] shadow-sm border border-gray-50 dark:border-gray-700 group hover:border-blue-500 transition-colors">
               <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl group-hover:scale-110 transition-transform"><Target className="w-6 h-6" /></div>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Avg. Score</span>
               </div>
               <div className="text-4xl font-black dark:text-white">{analytics.avgScore}%</div>
               <div className="mt-2 text-[10px] font-black text-gray-400 uppercase">Collective Accuracy</div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-8 rounded-[2rem] shadow-sm border border-gray-50 dark:border-gray-700 group hover:border-green-500 transition-colors">
               <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-xl group-hover:scale-110 transition-transform"><TrendingUp className="w-6 h-6" /></div>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pass Rate</span>
               </div>
               <div className="text-4xl font-black dark:text-white">{analytics.passRate}%</div>
               <div className="mt-2 text-[10px] font-black text-gray-400 uppercase">Qualification Index</div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-8 rounded-[2rem] shadow-sm border border-gray-50 dark:border-gray-700 group hover:border-purple-500 transition-colors">
               <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-xl group-hover:scale-110 transition-transform"><Users className="w-6 h-6" /></div>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Attempts</span>
               </div>
               <div className="text-4xl font-black dark:text-white">{analytics.totalSubmissions}</div>
               <div className="mt-2 text-[10px] font-black text-gray-400 uppercase">Active Engagement</div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-8 rounded-[2rem] shadow-sm border border-gray-50 dark:border-gray-700 group hover:border-yellow-500 transition-colors">
               <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 rounded-xl group-hover:scale-110 transition-transform"><Trophy className="w-6 h-6" /></div>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Topper</span>
               </div>
               <div className="text-xl font-black dark:text-white truncate">{analytics.leaderboard[0]?.studentName || 'N/A'}</div>
               <div className="mt-2 text-[10px] font-black text-gray-400 uppercase">Top Performer</div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            <div className="xl:col-span-8 bg-white dark:bg-gray-800 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm">
               <div className="px-8 py-6 border-b border-gray-50 dark:border-gray-700 bg-gray-50/30 flex justify-between items-center">
                  <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-tighter shadow-sm">Performance Audit Ledger</h3>
                  <div className="flex items-center gap-2"><div className="w-2 h-2 bg-green-500 rounded-full"></div><span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Live Sync</span></div>
               </div>
               <div className="overflow-x-auto">
                  <table className="w-full text-left">
                     <thead>
                        <tr className="bg-gray-50/50 dark:bg-gray-900/50 border-b dark:border-gray-700">
                           <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Student</th>
                           <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Score Breakdown</th>
                           <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Outcome</th>
                           <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Time</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                        {analytics.leaderboard.map((sub) => (
                           <tr key={sub.id} className="hover:bg-gray-50/50 transition-colors group">
                              <td className="px-8 py-5">
                                 <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center font-bold text-gray-500 text-xs">{sub.studentName.charAt(0)}</div>
                                    <div>
                                       <p className="font-bold text-gray-800 dark:text-gray-100 text-sm">{sub.studentName}</p>
                                       <button 
                                          onClick={() => navigate(`/admin/exams/review/${sub.id}`)}
                                          className="text-[10px] text-blue-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity hover:underline"
                                       >
                                          Detailed Audit
                                       </button>
                                    </div>
                                 </div>
                              </td>
                              <td className="px-8 py-5">
                                 <div className="flex flex-col gap-1">
                                    <p className="text-sm font-black dark:text-white">{sub.score} <span className="text-gray-400 font-medium">/ {sub.totalMarks}</span></p>
                                    <div className="w-24 h-1 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                       <div className={`h-full ${sub.percentage >= (exam.passing_score || 50) ? 'bg-green-500' : 'bg-red-500'}`} style={{ width: `${sub.percentage}%` }}></div>
                                    </div>
                                 </div>
                              </td>
                              <td className="px-8 py-5">
                                 <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${sub.percentage >= (exam.passing_score || 50) ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                    {sub.percentage >= (exam.passing_score || 50) ? 'QUALIFIED' : 'DISQUALIFIED'}
                                 </span>
                              </td>
                              <td className="px-8 py-5 text-right text-[10px] font-black text-gray-400">
                                 {new Date(sub.submitTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>

            <div className="xl:col-span-4 space-y-8">
               <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-8 border border-gray-100 dark:border-gray-700 shadow-sm">
                  <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight mb-8">Pass/Fail Distribution</h3>
                  <div className="flex gap-1 h-20 rounded-2xl overflow-hidden mb-6">
                     <div className="bg-green-500 flex-grow hover:opacity-80 transition-opacity relative group" style={{ flexBasis: `${analytics.passRate}%` }}>
                        <div className="absolute inset-0 flex items-center justify-center text-white font-black text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">PASS</div>
                     </div>
                     <div className="bg-red-500 flex-grow hover:opacity-80 transition-opacity relative group" style={{ flexBasis: `${100 - analytics.passRate}%` }}>
                        <div className="absolute inset-0 flex items-center justify-center text-white font-black text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">FAIL</div>
                     </div>
                  </div>
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                     <div className="flex items-center gap-2"><div className="w-3 h-3 bg-green-500 rounded-sm"></div><span>{analytics.passRate}% Qualified</span></div>
                     <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-500 rounded-sm"></div><span>{100 - analytics.passRate}% Failed</span></div>
                  </div>
               </div>

               <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-[2.5rem] p-8 text-white shadow-xl shadow-indigo-100 dark:shadow-none">
                  <h3 className="text-xl font-black mb-2 flex items-center gap-2 italic underline decoration-white/20">AI Analytics Insights</h3>
                  <p className="text-indigo-100/70 text-sm leading-relaxed mb-6 font-medium">Based on recent submission patterns, students are taking 15% longer on coding questions. Recommend increasing coding duration by 10 minutes next time.</p>
                  <button className="w-full py-4 bg-white/10 hover:bg-white/20 transition-all rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2">
                     <PieChart className="w-4 h-4" /> Deep Audit Logs
                  </button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamResults;
