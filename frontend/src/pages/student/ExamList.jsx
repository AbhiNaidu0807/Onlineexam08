import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExams } from '../../hooks/useExams';
import { useAuth } from '../../context/authContext';
import { 
  Clock, 
  Award, 
  Calendar, 
  BookOpen, 
  ChevronRight, 
  Zap,
  CheckCircle2,
  Lock,
  ArrowRight,
  AlertCircle
} from 'lucide-react';

const ExamList = () => {
  const { activeExams, loading, isAttempted, searchTerm } = useExams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const filteredExams = activeExams.filter(exam => 
    (exam.title || '').toLowerCase().includes((searchTerm || '').toLowerCase())
  );

  const handleStartExam = (id) => {
    navigate(`/exam/${id}`);
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="space-y-12 animate-fade-in">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-2">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
             <span className="bg-orange-500/10 text-orange-600 dark:text-orange-400 px-3 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider">Available Assets</span>
             <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
          </div>
          <h1 className="text-4xl font-bold font-display text-gray-900 dark:text-white tracking-tight">Active <span className="text-orange-500">Assessments</span></h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Select a challenge to prove your proficiency.</p>
        </div>
        
        <div className="glass px-6 py-4 rounded-2xl flex items-center gap-5 group border border-gray-100 dark:border-white/5 shadow-sm">
           <div className="text-right">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Open</p>
              <p className="text-xl font-bold font-display text-gray-900 dark:text-white">{activeExams.length}</p>
           </div>
           <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-100 dark:shadow-none">
              <BookOpen className="text-white w-6 h-6" />
           </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredExams.length > 0 ? (
          filteredExams.map((exam) => {
            const attempted = isAttempted(exam.id, user?.id);
            return (
              <div key={exam.id} className="group relative bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between min-h-[380px]">
                <div className="space-y-6">
                  <div className="flex justify-between items-start">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm ${attempted ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                      {attempted ? <CheckCircle2 className="w-6 h-6" /> : <Zap className="w-6 h-6" />}
                    </div>
                    {attempted ? (
                       <span className="bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-400 px-3 py-1 rounded-full text-[10px] font-bold">
                         COMPLETED
                       </span>
                    ) : (
                       <span className="bg-orange-100 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 px-3 py-1 rounded-full text-[10px] font-bold">UNATTEMPTED</span>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="text-xl font-bold font-display text-gray-900 dark:text-white leading-tight line-clamp-2">{exam.title}</h3>
                    <div className="flex flex-wrap gap-4 text-xs font-semibold text-gray-500 dark:text-gray-400">
                       <div className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-orange-500" /> {exam.duration} Min
                       </div>
                       <div className="flex items-center gap-1.5">
                          <Award className="w-4 h-4 text-green-500" /> {exam.passing_score}% Passing
                       </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                   {!attempted ? (
                      exam.question_count > 0 ? (
                        <button
                          onClick={() => handleStartExam(exam.id)}
                          className="w-full py-4 bg-gray-900 dark:bg-orange-600 hover:bg-orange-600 dark:hover:bg-orange-500 text-white rounded-xl font-bold text-sm transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
                        >
                          Start Assessment <ArrowRight className="w-4 h-4" />
                        </button>
                      ) : (
                        <div className="w-full py-4 bg-gray-50 dark:bg-white/5 rounded-xl flex items-center justify-center gap-2 border-2 border-dashed border-gray-100 dark:border-white/10">
                           <AlertCircle className="w-4 h-4 text-gray-300" />
                           <span className="text-xs font-semibold text-gray-400 italic">No Questions Available</span>
                        </div>
                      )
                   ) : (
                      <div className="w-full py-4 bg-gray-50 dark:bg-white/5 rounded-xl flex items-center justify-center gap-2 border border-gray-100 dark:border-white/10">
                         <Lock className="w-4 h-4 text-gray-300" />
                         <span className="text-xs font-semibold text-gray-400 italic">Attempt Locked</span>
                      </div>
                   )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-24 text-center bg-white dark:bg-gray-800/10 rounded-3xl border-2 border-dashed border-gray-100 dark:border-white/5 shadow-inner">
             <div className="w-16 h-16 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto text-gray-300 mb-4">
                <BookOpen className="w-8 h-8" />
             </div>
             <p className="text-gray-400 font-bold italic">No active assessments found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamList;
