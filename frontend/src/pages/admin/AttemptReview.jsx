import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  FileText, 
  Clock, 
  Award,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

const AttemptReview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [grading, setGrading] = useState(false);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const res = await api.get(`/attempts/result/${id}`);
        setData(res);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [id]);

  const handleManualGrade = async (answerId, isCorrect, marks) => {
    setGrading(true);
    try {
      await api.post('/admin/grade-answer', {
        answer_id: answerId,
        is_correct: isCorrect,
        marks_awarded: marks
      });
      // Refresh data
      const res = await api.get(`/attempts/result/${id}`);
      setData(res);
      alert('Manual grade updated successfully');
    } catch (error) {
      alert('Grading failed: ' + (error.message || 'Server Error'));
    } finally {
      setGrading(false);
    }
  };

  if (loading) return <div className="text-center py-20 font-black opacity-30 animate-pulse">Syncing Attempt Data...</div>;
  if (!data) return <div className="text-center py-20 text-red-500 font-black">Attempt not found.</div>;

  const { attempt, exam, answers } = data;

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="flex items-center gap-6">
          <button onClick={() => navigate(-1)} className="p-3 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:bg-gray-50 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </button>
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white leading-tight">Submission Review</h1>
            <p className="text-gray-500 dark:text-gray-400">Exam: <span className="text-orange-600 font-bold">{exam.title}</span></p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 px-6 py-3 rounded-2xl shadow-sm border border-orange-100 flex items-center gap-4">
           <div className="text-center">
              <p className="text-2xl font-black text-orange-500 leading-none">{attempt.score}</p>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Total Score</p>
           </div>
           <div className="w-px h-8 bg-gray-100 dark:bg-gray-700"></div>
           <div className="text-center">
              <p className="text-2xl font-black text-gray-900 dark:text-white leading-none">{Math.round((attempt.score / (attempt.total_marks || 1)) * 100)}%</p>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Accuracy</p>
           </div>
        </div>
      </header>

      <div className="space-y-8">
        {answers.map((ans, idx) => (
          <div key={ans.id} className="bg-white dark:bg-gray-800 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm">
            <div className="px-10 py-6 border-b border-gray-50 dark:border-gray-700 flex justify-between items-center bg-gray-50/30">
               <div className="flex items-center gap-4">
                  <span className="w-10 h-10 bg-gray-900 text-white rounded-xl flex items-center justify-center font-black">Q{idx+1}</span>
                  <div className="flex gap-2">
                     <span className="px-3 py-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg text-[10px] font-black uppercase tracking-widest text-gray-400 leading-none flex items-center">{ans.marks_awarded} Points Awarded</span>
                  </div>
               </div>
               {ans.is_correct ? (
                  <div className="flex items-center gap-2 text-green-500 bg-green-50 px-3 py-1 rounded-full text-[10px] font-black uppercase"><CheckCircle className="w-4 h-4" /> AUTO-VERIFIED</div>
               ) : (
                  <div className="flex items-center gap-2 text-red-500 bg-red-50 px-3 py-1 rounded-full text-[10px] font-black uppercase"><AlertCircle className="w-4 h-4" /> POTENTIAL ERROR</div>
               )}
            </div>
            
            <div className="p-10 space-y-8">
               <div className="space-y-3">
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Question Probe</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white leading-relaxed">{ans.question_text}</p>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-3">
                     <p className="text-xs font-black text-purple-600 uppercase tracking-widest">Student Response</p>
                     <div className="p-6 bg-purple-50 dark:bg-purple-900/10 rounded-3xl border border-purple-100 dark:border-purple-900/30 font-mono text-sm dark:text-gray-200 min-h-[100px] whitespace-pre-wrap">
                        {ans.answer || '[No Response Provided]'}
                     </div>
                  </div>
                  <div className="space-y-3">
                     <p className="text-xs font-black text-green-600 uppercase tracking-widest">Expected Signature</p>
                     <div className="p-6 bg-green-50 dark:bg-green-900/10 rounded-3xl border border-green-100 dark:border-green-900/30 font-mono text-sm dark:text-gray-200 min-h-[100px] whitespace-pre-wrap">
                        {ans.correct_answer}
                     </div>
                  </div>
               </div>

               {ans.explanation && (
                  <div className="p-6 bg-gray-50 dark:bg-gray-900/50 rounded-3xl border border-gray-100 dark:border-gray-700">
                     <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Internal Explanation</p>
                     <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">{ans.explanation}</p>
                  </div>
               )}

               <div className="pt-6 border-t border-gray-50 dark:border-gray-700 flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="flex items-center gap-3">
                     <ShieldCheck className="w-5 h-5 text-orange-500" />
                     <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Manual Grading Override</p>
                  </div>
                  <div className="flex gap-4">
                     <button 
                       onClick={() => handleManualGrade(ans.id, false, 0)}
                       disabled={grading}
                       className="px-8 py-3 bg-red-50 text-red-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all active:scale-95"
                     >
                        Mark Incorrect
                     </button>
                     <button 
                       onClick={() => handleManualGrade(ans.id, true, ans.marks || 1)}
                       disabled={grading}
                       className="px-10 py-3 bg-green-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-green-600 transition-all shadow-lg active:scale-95"
                     >
                        Approve Full Marks
                     </button>
                  </div>
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AttemptReview;
