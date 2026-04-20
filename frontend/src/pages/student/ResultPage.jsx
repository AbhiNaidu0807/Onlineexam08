import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { 
  CheckCircle2, 
  XCircle, 
  Info,
  RefreshCw,
  Trophy,
  ArrowLeft
} from 'lucide-react';

const ResultPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * MISSION HARDENED RECONCILIATION
   * Rebuilding with exact Mission Task 11 specs.
   */
  const fetchResult = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await api.get(`/attempts/result/${id}`);
      
      if (res) {
        setResult(res);
        console.log('[SUCCESS] Result Loaded:', res.attemptId);
      } else {
        throw new Error("No data received from scaling server");
      }
    } catch (err) {
      // FRONTEND SAFETY
      console.error("RESULT FETCH ERROR:", err.data || err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchResult();
  }, [id]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[600px] animate-fade-in">
       <div className="relative">
          <div className="w-20 h-20 border-4 border-gray-100 rounded-full"></div>
          <div className="w-20 h-20 border-4 border-orange-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
       </div>
       <p className="mt-8 text-[11px] font-black text-gray-400 uppercase tracking-[0.5em] animate-pulse italic">Reclaiming Metrics...</p>
    </div>
  );
  
  if (error) return (
    <div className="max-w-xl mx-auto mt-20 px-6">
       <div className="bg-white rounded-[4rem] p-16 shadow-2xl border-t-[12px] border-rose-500 text-center relative overflow-hidden group">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-rose-50 rounded-full opacity-50 group-hover:scale-110 transition-transform"></div>
          
          <div className="w-28 h-28 bg-rose-500 text-white rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 shadow-xl shadow-rose-200">
             <XCircle size={56} />
          </div>
          
          <h1 className="text-4xl font-black font-display text-gray-900 uppercase tracking-tighter mb-4 italic leading-tight">Analysis <span className="text-rose-500 font-black underline decoration-4 underline-offset-8">Interrupted</span></h1>
          
          <div className="p-8 bg-rose-50 border-2 border-rose-100 rounded-3xl text-rose-700 font-bold italic mb-12 shadow-inner text-sm leading-relaxed">
             {error}
          </div>
          
          <div className="space-y-4">
             {/* Mission Task 11: Retry button logic */}
             <button 
                onClick={fetchResult}
                className="w-full flex items-center justify-center gap-4 py-6 bg-gray-900 text-white rounded-[2rem] font-black uppercase tracking-[0.3em] text-[10px] shadow-2xl hover:bg-orange-500 transition-all active:scale-95"
             >
                <RefreshCw size={18} />
                Retry Re-Evaluation
             </button>
             <button 
                onClick={() => navigate('/student')}
                className="w-full py-5 bg-gray-50 text-gray-400 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] hover:text-gray-900 transition-all flex items-center justify-center gap-2"
             >
                <ArrowLeft size={14} /> Exit Vault
             </button>
          </div>
       </div>
    </div>
  );

  if (!result) return null;

  // Sync with new Backend Payload Structure (Mission Task 9)
  const { exam, status, percentage, score, totalMarks, gradedAnswers } = result;
  const isPassed = status === "PASS";

  return (
    <div className="max-w-6xl mx-auto space-y-16 animate-fade-in pb-40 pt-10 px-8">
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-10">
         <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gray-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest border border-gray-700 shadow-lg">
               <Trophy size={14} className="text-orange-500" /> Assessment Feedback Protocol
            </div>
            <h1 className="text-8xl font-black font-display text-gray-900 tracking-tighter uppercase leading-none italic">
               Exam <span className="text-orange-500">Report</span>
            </h1>
            <p className="text-gray-400 font-bold uppercase tracking-[0.4em] text-[11px] italic pl-1 border-l-4 border-orange-500 ml-2">{exam?.title}</p>
         </div>
         <button onClick={() => window.print()} className="px-10 py-5 bg-white border-2 border-gray-100 rounded-[2rem] text-[10px] font-black uppercase tracking-widest hover:border-orange-500 hover:text-orange-600 transition-all shadow-sm">
            Export Records
         </button>
      </header>

      {/* Hero Grade Card */}
      <div className={`p-20 md:p-28 bg-white rounded-[5rem] shadow-2xl border-t-[20px] transition-all grid lg:grid-cols-2 gap-20 items-center overflow-hidden relative group ${isPassed ? 'border-emerald-500' : 'border-rose-500'}`}>
         <div className="text-center lg:text-left space-y-10 relative z-10">
            <div className={`inline-flex items-center gap-4 px-10 py-3 rounded-full text-sm font-black uppercase tracking-widest shadow-sm border ${isPassed ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
               <span className={`w-3 h-3 rounded-full animate-pulse ${isPassed ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
               Assessment Status: {status}
            </div>
            
            <h2 className="text-[12rem] md:text-[16rem] font-black font-display tracking-tighter text-gray-900 leading-[0.8] italic group-hover:scale-105 transition-transform">
               {percentage}<span className="text-5xl md:text-7xl opacity-10 font-bold NOT-italic ml-6">%</span>
            </h2>
            
            <div className="flex flex-wrap gap-6 justify-center lg:justify-start">
               <div className="px-10 py-5 bg-gray-900 text-white rounded-3xl shadow-xl">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Score Gained</p>
                  <p className="text-4xl font-black font-display italic leading-none">{score}<span className="text-sm opacity-20 NOT-italic ml-2">pts</span></p>
               </div>
               <div className="px-10 py-5 bg-gray-50 rounded-3xl border-2 border-gray-100">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Possible</p>
                  <p className="text-4xl font-black font-display italic text-gray-900 leading-none">{totalMarks}<span className="text-sm opacity-20 NOT-italic ml-2">pts</span></p>
               </div>
            </div>
         </div>

         <div className="flex justify-center relative scale-110 md:scale-125">
            <div className={`w-72 h-72 md:w-96 md:h-96 rounded-[5rem] flex items-center justify-center shadow-2xl transition-all duration-700 ${isPassed ? 'bg-emerald-500 text-white rotate-6' : 'bg-rose-500 text-white -rotate-6'} group-hover:rotate-0`}>
               {isPassed ? <CheckCircle2 size={160} strokeWidth={3} /> : <XCircle size={160} strokeWidth={3} />}
            </div>
         </div>
      </div>

      {/* Response Breakdown */}
      <div className="space-y-16">
         <h3 className="text-4xl font-black font-display text-gray-900 uppercase tracking-tighter border-b-4 border-gray-100 pb-6 italic">Dataset <span className="text-orange-500">Breakdown</span></h3>

         <div className="grid gap-14">
            {gradedAnswers.map((res, idx) => {
               const isCorrect = res.isCorrect;
               return (
                  <div key={idx} className={`group p-12 md:p-16 bg-white rounded-[4.5rem] border-2 transition-all relative overflow-hidden ${isCorrect ? 'border-emerald-100 hover:border-emerald-300' : 'border-rose-100 hover:border-rose-300'} hover:shadow-2xl`}>
                     <div className={`absolute top-0 right-0 p-10 font-black text-[150px] opacity-[0.03] italic leading-none select-none group-hover:scale-110 transition-all ${isCorrect ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {idx + 1}
                     </div>

                     <div className="flex flex-col md:flex-row md:items-center justify-between gap-10 mb-16 relative z-10">
                        <div className="flex items-center gap-10">
                           <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center font-black text-4xl shadow-2xl ${isCorrect ? 'bg-emerald-500 text-white shadow-emerald-200' : 'bg-rose-500 text-white shadow-rose-200'}`}>
                              {idx + 1}
                           </div>
                           <div className="space-y-2">
                              <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.5em] italic">Knowledge Item {idx + 1}</p>
                              <div className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-2 ${isCorrect ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                 {isCorrect ? 'VALIDATED' : 'DISCREPANCY'}
                              </div>
                           </div>
                        </div>
                        <div className="bg-gray-900 text-white px-10 py-5 rounded-[2.5rem] shadow-xl flex items-center gap-4">
                           <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Weight:</span>
                           <span className="text-3xl font-black font-display italic leading-none">{res.marks_awarded} / {res.marks}</span>
                        </div>
                     </div>

                     <h4 className="text-4xl font-black font-display text-gray-900 mb-14 max-w-5xl leading-[1.2] group-hover:text-orange-500 transition-colors">
                        {res.question_text}
                     </h4>

                     <div className="grid lg:grid-cols-2 gap-10">
                        <div className="space-y-6">
                           <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-xl w-fit border border-gray-100">
                              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Student Response</span>
                           </div>
                           <div className={`p-10 md:p-12 rounded-[3.5rem] border-2 italic font-bold text-3xl min-h-[160px] flex items-center transition-all bg-gray-50/20 backdrop-blur-sm ${isCorrect ? 'text-emerald-700 border-emerald-50' : 'text-rose-700 border-rose-50'}`}>
                              "{res.studentAnswer || '-- NIL --'}"
                           </div>
                        </div>
                        <div className="space-y-6">
                           <div className="flex items-center gap-3 px-4 py-2 bg-gray-900 rounded-xl w-fit border border-gray-800">
                              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Institutional Key</span>
                           </div>
                           <div className="p-10 md:p-12 bg-gray-900 text-white rounded-[3.5rem] border-[4px] border-gray-800 italic font-bold text-3xl min-h-[160px] flex items-center shadow-2xl transition-all">
                              "{res.correctAnswer}"
                           </div>
                        </div>
                     </div>

                     {res.explanation && (
                        <div className="mt-14 p-12 bg-gray-50 rounded-[4rem] italic font-bold text-gray-700 border-l-[12px] border-orange-500 relative group/exp overflow-hidden">
                           <p className="text-[11px] uppercase tracking-[0.5em] text-orange-600 mb-6 font-black flex items-center gap-3 relative z-10">
                              <Info size={18} /> Analysis Commentary:
                           </p>
                           <p className="text-2xl leading-relaxed relative z-10 text-gray-600">
                              {res.explanation}
                           </p>
                        </div>
                     )}
                  </div>
               );
            })}
         </div>
      </div>

      <div className="text-center pt-32 pb-10">
         <button 
            onClick={() => navigate('/student')} 
            className="group relative px-24 py-10 bg-gray-900 text-white rounded-[4rem] font-black uppercase tracking-[1.2em] text-[11px] shadow-2xl hover:bg-orange-600 hover:-translate-y-2 active:translate-y-0 transition-all"
         >
            <span className="relative z-10">Return to Terminal</span>
         </button>
      </div>
    </div>
  );
};

export default ResultPage;
