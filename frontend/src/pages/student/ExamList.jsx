import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExams } from '../../hooks/useExams';
import { useAuth } from '../../context/authContext';
import { 
  Clock, 
  Award, 
  BookOpen, 
  Search,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  FileText
} from 'lucide-react';

const ExamList = () => {
  const { activeExams, loading, isAttempted, searchTerm, setSearchTerm } = useExams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleStartExam = (id) => {
    navigate(`/exam/${id}`);
  };

  if (loading && activeExams.length === 0) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] font-serif">
      <div className="w-10 h-10 border-4 border-[#1a237e] border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-sm text-gray-500 uppercase tracking-widest">Inquiry in progress...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-fade-in font-serif">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#e0e0e0] pb-8">
        <div className="space-y-1">
          <h1 className="text-[22px] font-bold text-[#1a237e]">Examination Admission Center</h1>
          <p className="text-[#37474f] text-[14px]">Authorized access to institutional assessments and certification programs.</p>
        </div>
        
        <div className="relative w-full md:w-96">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Search size={18} />
          </div>
          <input 
            type="text" 
            placeholder="Search examinations by title..." 
            className="w-full pl-10 pr-4 py-2.5 border border-[#e0e0e0] rounded-[4px] outline-none focus:border-[#1a237e] text-[14px] shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Stats Summary Panel */}
      <div className="bg-[#f5f5f5] p-6 border border-[#e0e0e0] flex items-center justify-between">
         <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#1a237e] text-white flex items-center justify-center">
               <BookOpen size={20} />
            </div>
            <div>
               <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Available Assessments</p>
               <p className="text-xl font-bold text-[#1a237e]">{activeExams.length} Programs Found</p>
            </div>
         </div>
      </div>

      {/* Examination Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {activeExams.length > 0 ? (
          activeExams.map((exam) => {
            const attempted = isAttempted(exam.id, user?.id);
            return (
              <div key={exam.id} className="bg-white border border-[#e0e0e0] p-8 flex flex-col justify-between hover:border-[#1a237e] transition-colors shadow-sm">
                <div className="space-y-6">
                  <div className="flex justify-between items-start">
                    <span className={`px-4 py-1.5 text-[10px] font-bold border ${
                      attempted 
                      ? 'bg-green-50 text-green-700 border-green-100' 
                      : 'bg-blue-50 text-[#1a237e] border-blue-100'
                    }`}>
                      {attempted ? 'COMPLETED' : 'OPEN FOR ADMISSION'}
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="text-[18px] font-bold text-gray-900 leading-tight">{exam.title}</h3>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="flex items-center gap-2 text-[12px] text-gray-500">
                          <Clock className="w-4 h-4 text-[#1a237e]" /> <span>{exam.duration} Min Duration</span>
                       </div>
                       <div className="flex items-center gap-2 text-[12px] text-gray-500">
                          <Award className="w-4 h-4 text-[#1a237e]" /> <span>{exam.passing_score}% Pass Score</span>
                       </div>
                    </div>
                  </div>
                </div>

                <div className="mt-10 pt-6 border-t border-[#f5f5f5]">
                   {!attempted ? (
                      exam.question_count > 0 ? (
                        <button
                          onClick={() => handleStartExam(exam.id)}
                          className="w-full bg-[#1a237e] text-white py-3 rounded-[4px] font-bold text-[13px] transition-all hover:bg-[#0d1440] flex items-center justify-center gap-2"
                        >
                          Begin Assessment <ArrowRight className="w-4 h-4" />
                        </button>
                      ) : (
                        <div className="w-full py-3 bg-gray-50 border border-gray-100 flex items-center justify-center gap-2">
                           <AlertCircle className="w-4 h-4 text-gray-300" />
                           <span className="text-[12px] font-bold text-gray-400 italic uppercase">Insufficient Data</span>
                        </div>
                      )
                   ) : (
                      <div className="w-full py-3 bg-gray-50 border border-gray-100 flex items-center justify-center gap-2">
                         <CheckCircle className="w-4 h-4 text-green-500" />
                         <span className="text-[12px] font-bold text-gray-400 italic uppercase tracking-tighter">Transcript Generated</span>
                      </div>
                   )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-24 text-center bg-white border-2 border-dashed border-[#e0e0e0]">
             <FileText className="mx-auto mb-4 text-gray-200" size={48} />
             <p className="text-gray-400 font-bold italic">No examination programs match your search parameters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamList;
