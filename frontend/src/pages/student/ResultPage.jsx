import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { 
  Trophy, 
  Award, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Printer,
  Info
} from 'lucide-react';

// Task 6: Safe Compare Function (Frontend Sync)
function compareAnswers(a, b) {
  const x = String(a ?? "").trim().toLowerCase();
  const y = String(b ?? "").trim().toLowerCase();
  const bothNum = !isNaN(x) && x !== "" && !isNaN(y) && y !== "";
  if (bothNum) return Number(x) === Number(y);
  return x === y;
}

const ResultPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  // Summary State
  const [summary, setSummary] = useState({
    totalQuestions: 0,
    correctCount: 0,
    wrongCount: 0,
    percentage: 0,
    finalStatus: "FAIL"
  });

  useEffect(() => {
    const fetchResult = async () => {
      try {
        setLoading(true);
        const data = await api.get(`/attempts/result/${id}`);
        
        if (data && data.answers) {
          // Task 5 & 6: Rebuild Result Array and evaluate correctly
          const evaluatedAnswers = data.answers.map(ans => {
            const student = ans.answer || "";
            const key = ans.correct_answer || "";
            const isCorrect = compareAnswers(student, key);
            return {
              ...ans,
              is_correct: isCorrect ? 1 : 0
            };
          });
          data.answers = evaluatedAnswers;
          
          // Task 2: REBUILD SCORE FROM results ARRAY (Single Source of Truth)
          const totalQuestions = evaluatedAnswers.length;
          const correctCount = evaluatedAnswers.filter(a => Number(a.is_correct) === 1).length;
          const wrongCount = totalQuestions - correctCount;
          
          // Task 3: Pass/Fail Rule (Standard 35% or Exam passing_score)
          const passMark = data.exam?.passing_score || 35;
          const percentage = totalQuestions === 0 ? 0 : Number(((correctCount / totalQuestions) * 100).toFixed(2));
          const finalStatus = percentage >= passMark ? "PASS" : "FAIL";

          // Task 8: Debug Log
          console.log({
            totalQuestions,
            correctCount,
            wrongCount,
            percentage,
            finalStatus
          });

          setSummary({ totalQuestions, correctCount, wrongCount, percentage, finalStatus });
        }
        
        setResult(data);
      } catch (error) {
        console.error('Fetch Error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [id]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[600px] animate-pulse">
       <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-6"></div>
       <p className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">Synchronizing Analytics...</p>
    </div>
  );
  
  if (!result) return <div className="p-20 text-center uppercase font-black text-rose-500">Result Not Found</div>;

  const { exam, answers } = result;
  const isPassed = summary.finalStatus === "PASS";

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-fade-in pb-32 pt-10">
      <header className="px-4">
         <div className="flex items-center gap-3 mb-6">
            <span className="bg-orange-500 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-[0.2em]">Official Report</span>
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
         </div>
         <h1 className="text-5xl font-black font-display text-gray-900 tracking-tighter uppercase leading-none">Assessment <span className="text-orange-500 italic">Result</span></h1>
         <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] italic mt-2">{exam?.title} - Master Repository Logic Enabled</p>
      </header>

      {/* Task 4: UI BINDING FIX - The Summary Card */}
      <div className={`p-20 bg-white dark:bg-gray-800 rounded-[3rem] shadow-2xl border-t-8 transition-all ${isPassed ? 'border-emerald-500' : 'border-rose-500'} text-center`}>
         <div className="flex flex-col items-center">
            <div className={`w-32 h-32 rounded-[2.5rem] flex items-center justify-center shadow-xl mb-10 ${isPassed ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
               {isPassed ? <CheckCircle2 size={60} /> : <XCircle size={60} />}
            </div>
            {/* Task 4.1: Percentage Display */}
            <h2 className="text-8xl font-black font-display tracking-tighter text-gray-900 dark:text-white italic mb-6">
               {summary.percentage}<span className="text-3xl opacity-20 NOT-italic">%</span>
            </h2>
            {/* Task 4.2: Final Status Display */}
            <p className={`text-4xl font-black font-display uppercase tracking-tighter ${isPassed ? 'text-emerald-500' : 'text-rose-500'}`}>
               {summary.finalStatus}
            </p>
            {/* Task 4.3: Correct Answers Count */}
            <p className="text-gray-400 font-black uppercase tracking-[0.3em] text-[10px] mt-6">
               Correct Answers: {summary.correctCount} / {summary.totalQuestions}
            </p>
         </div>
      </div>

      <div className="space-y-8 px-4">
         <h3 className="text-3xl font-black font-display text-gray-900 uppercase tracking-tighter pb-4 border-b-4 border-gray-100 italic">
            Response <span className="text-orange-500">Analysis</span>
         </h3>

         <div className="space-y-10">
            {answers.map((ans, idx) => {
               const isCorrect = Number(ans.is_correct) === 1;
               return (
                  <div key={idx} className={`p-10 rounded-[2.5rem] border-2 transition-all ${isCorrect ? 'bg-emerald-50/10 border-emerald-100' : 'bg-rose-50/10 border-rose-100'}`}>
                     <div className="flex justify-between items-start mb-8">
                        <div className="flex items-center gap-4">
                           <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl ${isCorrect ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                              {idx + 1}
                           </div>
                           <p className="text-xs font-black text-gray-900 uppercase tracking-tighter italic">Knowledge Fragment #{idx + 1}</p>
                        </div>
                        <div className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-sm ${isCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                           {isCorrect ? '✅ CORRECT' : '❌ INCORRECT'}
                        </div>
                     </div>

                     <h4 className="text-2xl font-black font-display text-gray-900 mb-8 leading-tight">{ans.question_text}</h4>

                     <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                           <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] px-2 border-l-4 border-gray-200">Your Submission</label>
                           <div className={`p-8 rounded-3xl border-2 italic font-bold text-xl min-h-[100px] flex items-center ${isCorrect ? 'text-emerald-700 border-emerald-100 bg-white shadow-sm' : 'text-rose-700 border-rose-100 bg-white shadow-sm'}`}>
                              {ans.answer || '-- EMPTY --'}
                           </div>
                        </div>
                        <div className="space-y-4">
                           <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] px-2 border-l-4 border-gray-900">Institutional Key</label>
                           <div className="p-8 bg-gray-900 text-white rounded-3xl border-2 border-gray-900 italic font-bold text-xl min-h-[100px] flex items-center shadow-2xl shadow-gray-200">
                              {ans.correct_answer}
                           </div>
                        </div>
                     </div>

                     {ans.explanation && (
                        <div className="mt-8 p-8 bg-orange-50 border-l-8 border-orange-500 rounded-r-3xl italic font-bold text-gray-800 leading-relaxed shadow-sm">
                           <p className="text-[10px] uppercase tracking-[0.3em] text-orange-600 mb-3 font-black flex items-center gap-2">
                              <Info size={14} /> Institutional Justification:
                           </p>
                           {ans.explanation}
                        </div>
                     )}
                  </div>
               );
            })}
         </div>
      </div>

      <div className="text-center pt-10 pb-20">
         <button onClick={() => navigate('/student')} className="px-12 py-5 bg-gray-900 text-white rounded-[2rem] font-black uppercase tracking-[0.6em] text-[10px] shadow-2xl hover:scale-105 active:scale-95 transition-all">
            Close Analysis Report
         </button>
      </div>
    </div>
  );
};

export default ResultPage;
