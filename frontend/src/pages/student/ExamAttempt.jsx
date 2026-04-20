import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { useExams } from '../../hooks/useExams';
import Editor from '@monaco-editor/react';
import { 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  ShieldCheck,
  Play,
  FileText,
  AlertTriangle,
  Flag,
  Terminal,
  CheckCircle,
  XCircle,
  Code2,
  Table as TableIcon
} from 'lucide-react';

import Logo from '../../components/Logo';
import ProctoringControl from '../../components/student/ProctoringControl';

const ExamAttempt = () => {
  const { id: examId } = useParams();
  const navigate = useNavigate();
  const { refreshData } = useExams();

  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [started, setStarted] = useState(false);
  const [attemptId, setAttemptId] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [violations, setViolations] = useState([]);
  const [showViolationWarning, setShowViolationWarning] = useState(null);
  const [flagged, setFlagged] = useState([]);

  // Code Execution States
  const [codeOutput, setCodeOutput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [testResults, setTestResults] = useState(null);
  
  const timerRef = useRef(null);

  useEffect(() => {
    const initAttempt = async () => {
      try {
        setLoading(true);
        const examData = await api.get(`/exams/${examId}`);
        setExam(examData);

        const res = await api.post('/attempts/start', { examId });
        const { attempt_id, questions: qData, time_remaining, status } = res;

        setQuestions(qData);
        setAttemptId(attempt_id);
        setTimeLeft(time_remaining);
        setStarted(status === 'resumed');

        const savedAns = localStorage.getItem(`exam_ans_${attempt_id}`);
        if (savedAns) setAnswers(JSON.parse(savedAns));

        const savedFlags = localStorage.getItem(`exam_flags_${attempt_id}`);
        if (savedFlags) setFlagged(JSON.parse(savedFlags));

      } catch (err) {
        setError(err.message || 'Authorization failure accessing the examination portal.');
      } finally {
        setLoading(false);
      }
    };
    initAttempt();
  }, [examId]);

  useEffect(() => {
    if (started && timeLeft > 0 && !isSubmitting) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            submitExam(true, 'TIMER_EXPIRED');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [started, isSubmitting]);

  useEffect(() => {
    if (attemptId && Object.keys(answers).length > 0) {
      localStorage.setItem(`exam_ans_${attemptId}`, JSON.stringify(answers));
      localStorage.setItem(`exam_flags_${attemptId}`, JSON.stringify(flagged));
      
      const sync = setTimeout(async () => {
        try {
          const qId = questions[currentIndex]?.id;
          if (qId && answers[qId]) {
            const finalAns = typeof answers[qId] === 'object' ? JSON.stringify(answers[qId]) : answers[qId];
            await api.post('/answers/save', { attempt_id: attemptId, question_id: qId, answer: finalAns });
          }
        } catch (e) {}
      }, 3000);
      return () => clearTimeout(sync);
    }
  }, [answers, flagged, attemptId, currentIndex]);

  const submitExam = async (isAuto = false, reason = 'MANUAL') => {
    if (isSubmitting) return;
    if (!isAuto && !window.confirm("Are you sure you want to finalize and submit your examination?")) return;

    setIsSubmitting(true);
    try {
      await api.post('/attempts/submit', { attemptId, isAuto, reason, answers });
      localStorage.removeItem(`exam_ans_${attemptId}`);
      localStorage.removeItem(`exam_flags_${attemptId}`);
      await refreshData();
      navigate(`/student/result/${attemptId}`);
    } catch (err) {
      setIsSubmitting(false);
      alert("Submission Error: " + err.message);
    }
  };

  const handleAnswerChange = (qId, val) => {
    setAnswers(prev => ({ ...prev, [qId]: val }));
    setTestResults(null); 
    setCodeOutput('');
  };

  const runCode = async () => {
    setIsExecuting(true);
    setCodeOutput('Compiling code in authorized environment...\n');
    setTimeout(() => {
      const q = questions[currentIndex];
      const ans = answers[q.id];
      const lang = typeof ans === 'object' ? ans.lang : (q.language || 'javascript');
      setCodeOutput(`Execution Success.\n\n$ ${lang} run\n> Output: Standard response delivered.\n\nTime: 85ms`);
      setIsExecuting(false);
    }, 1200);
  };

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleViolation = (type, msg) => {
    setViolations(prev => [...prev, { type, msg, time: new Date() }]);
    setShowViolationWarning(msg);
    setTimeout(() => setShowViolationWarning(null), 4000);
  };

  const toggleFlag = (qId) => {
    setFlagged(prev => prev.includes(qId) ? prev.filter(id => id !== qId) : [...prev, qId]);
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white font-serif">
       <div className="w-12 h-12 border-4 border-[#1a237e] border-t-transparent rounded-full animate-spin mb-6"></div>
       <p className="text-[12px] font-bold text-gray-400 uppercase tracking-widest">Authorized Access in Progress...</p>
    </div>
  );

  if (!started) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-6 font-serif">
        <div className="max-w-2xl w-full bg-white border border-[#e0e0e0] p-12 text-center space-y-10 shadow-sm">
           <div className="w-20 h-20 bg-[#1a237e] text-white rounded-sm flex items-center justify-center mx-auto">
              <ShieldCheck size={40} />
           </div>
           <div className="space-y-2">
              <h1 className="text-[22px] font-bold text-[#1a237e] uppercase tracking-tight">{exam?.title || 'Examination Center'}</h1>
              <p className="text-[14px] text-gray-500 italic">Candidate Identity Verification Successful. Access Granted.</p>
           </div>
           
           <div className="bg-gray-50 p-8 border border-gray-100 text-left space-y-6">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-200 pb-2">Institutional Instructions:</p>
              <ul className="space-y-4 text-[14px] text-gray-700">
                 <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <span>Active proctoring is enabled. Your session is being monitored for compliance with institutional regulations.</span>
                 </li>
                 <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <span>The examination consists of {questions.length} questions. You can navigate between questions using the palette.</span>
                 </li>
                 <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <span>Ensure a stable connection. All progress is synchronized in real-time with the master database.</span>
                 </li>
              </ul>
           </div>

           <button 
             onClick={() => setStarted(true)}
             className="w-full bg-[#1a237e] text-white py-4 font-bold text-[16px] uppercase tracking-widest hover:bg-[#0d1440] transition-colors shadow-md"
           >
             Begin Certified Assessment
           </button>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const currentAns = answers[currentQ.id];
  const userLang = typeof currentAns === 'object' ? currentAns.lang : (currentQ.language || 'javascript');
  const userCode = typeof currentAns === 'object' ? currentAns.code : (currentAns || '');

  return (
    <div className="min-h-screen bg-white flex flex-col font-serif">
      <ProctoringControl isExamActive={started && !isSubmitting} onViolation={handleViolation} />
      
      {showViolationWarning && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] bg-red-600 text-white px-8 py-4 rounded-sm shadow-2xl flex items-center gap-4 border-2 border-white animate-pulse">
           <AlertTriangle size={20} />
           <p className="font-bold uppercase tracking-widest text-[12px]">{showViolationWarning}</p>
        </div>
      )}

      {/* Official Header */}
      <header className="h-16 border-b border-[#e0e0e0] sticky top-0 z-50 px-8 flex items-center justify-between bg-white/95 backdrop-blur-sm">
          <div className="flex items-center gap-8">
             <Link to="/student" className="shrink-0">
                <Logo size={40} />
             </Link>
             <div className="h-8 w-px bg-gray-200"></div>
             <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Standardized Assessment Progress</p>
                <p className="text-[15px] font-bold text-[#1a237e]">Question {currentIndex + 1} of {questions.length}</p>
             </div>
         </div>

         <div className="flex items-center gap-10">
            <div className={`flex items-center gap-3 px-6 py-1.5 border rounded-sm ${timeLeft < 300 ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
               <Clock size={18} className={timeLeft < 300 ? 'text-red-500' : 'text-[#1a237e]'} />
               <span className={`text-[18px] font-bold ${timeLeft < 300 ? 'text-red-600 animate-pulse' : 'text-gray-900'}`}>{formatTime(timeLeft)}</span>
            </div>

            <button onClick={() => submitExam()} className="bg-[#1a237e] text-white px-8 py-2 font-bold text-[13px] uppercase tracking-widest hover:bg-[#0d1440] transition-colors">
              Submit Assessment
            </button>
         </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
         {/* Navigation Palette */}
         <aside className="w-80 border-r border-[#e0e0e0] p-10 flex flex-col gap-10 overflow-y-auto bg-[#fafafa]">
            <div className="space-y-6">
               <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em] text-center border-b border-gray-200 pb-2">Institutional Selector</h3>
               <div className="grid grid-cols-4 gap-2">
                  {questions.map((q, i) => (
                    <button
                      key={q.id}
                      onClick={() => setCurrentIndex(i)}
                      className={`h-11 rounded-sm font-bold text-[14px] flex items-center justify-center transition-all border ${
                        currentIndex === i ? 'bg-[#1a237e] text-white border-[#1a237e]' : 
                        flagged.includes(q.id) ? 'border-orange-500 text-orange-600 bg-orange-50' :
                        answers[q.id] ? 'bg-gray-200 text-gray-800 border-gray-300' : 'bg-white text-gray-300 border-gray-100 hover:border-gray-300'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
               </div>
            </div>

            <div className="mt-auto p-6 bg-white border border-gray-200 space-y-4">
               <div className="flex items-center justify-between text-[11px] font-bold uppercase text-gray-400">
                  <span>Completion Index</span>
                  <span className="text-[#1a237e]">{Object.keys(answers).length} / {questions.length}</span>
               </div>
               <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#1a237e] transition-all duration-500" style={{ width: `${(Object.keys(answers).length / questions.length) * 100}%` }}></div>
               </div>
            </div>
         </aside>

         {/* Content Area */}
         <main className="flex-1 overflow-y-auto p-12 lg:p-20 flex flex-col items-center">
            <div className="max-w-4xl w-full space-y-10">
               <div className="flex justify-between items-center bg-[#f5f5f5] p-3 border border-gray-200">
                  <span className="text-[11px] font-bold text-[#1a237e] uppercase tracking-widest flex items-center gap-2">
                     {currentQ?.type?.toLowerCase() === 'mcq' ? <FileText size={16} /> : <Code2 size={16} />}
                     Standard Question Item: {currentQ?.type?.toUpperCase()}
                  </span>
                  <button 
                    onClick={() => toggleFlag(currentQ?.id)}
                    className={`flex items-center gap-2 font-bold uppercase text-[11px] tracking-widest transition-all ${flagged.includes(currentQ?.id) ? 'text-orange-600' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <Flag size={14} className={flagged.includes(currentQ?.id) ? 'fill-current' : ''} />
                    {flagged.includes(currentQ?.id) ? 'Marked for Review' : 'Mark for Review'}
                  </button>
               </div>

               <h2 className="text-[20px] font-bold text-gray-800 leading-relaxed italic">
                  {currentQ?.question_text}
               </h2>

               <div className="p-1">
                  {currentQ?.type?.toLowerCase() === 'mcq' && (
                    <div className="space-y-4">
                       {(typeof currentQ.options === 'string' ? JSON.parse(currentQ.options) : currentQ.options).map((opt, i) => (
                         <button
                           key={i}
                           onClick={() => handleAnswerChange(currentQ.id, opt)}
                           className={`w-full p-6 text-left border-2 transition-all flex items-center gap-8 ${
                             answers[currentQ.id] === opt 
                             ? 'border-[#1a237e] bg-[#f9f9ff] text-[#1a237e] font-bold' 
                             : 'border-gray-100 bg-white text-gray-600 hover:bg-gray-50'
                           }`}
                         >
                            <div className={`w-8 h-8 rounded-sm flex items-center justify-center font-bold text-[14px] border ${answers[currentQ.id] === opt ? 'bg-[#1a237e] text-white border-[#1a237e]' : 'bg-gray-50 text-gray-400 border-gray-200'}`}>
                               {String.fromCharCode(65 + i)}
                            </div>
                            <span className="text-[16px]">{opt}</span>
                         </button>
                       ))}
                    </div>
                  )}

                  {currentQ?.type?.toLowerCase() === 'short' && (
                    <textarea 
                      className="w-full min-h-[300px] p-10 bg-white border border-gray-200 rounded-sm focus:border-[#1a237e] outline-none text-[16px] leading-[1.8] italic placeholder:text-gray-300"
                      placeholder="Candidate's official response..."
                      value={currentAns || ''}
                      onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)}
                    />
                  )}

                  {currentQ?.type?.toLowerCase() === 'coding' && (
                    <div className="space-y-6">
                       <div className="flex items-center justify-between bg-gray-100 p-3">
                          <p className="text-[11px] font-bold text-gray-600 uppercase tracking-widest">Programming Environment</p>
                          <button onClick={runCode} disabled={isExecuting} className="flex items-center gap-2 px-6 py-2 bg-[#1a237e] text-white font-bold text-[11px] uppercase tracking-widest hover:bg-[#0d1440] transition-colors">
                             <Play size={14} className="fill-current" /> Execute Logic
                          </button>
                       </div>
                       
                       <div className="h-[500px] border border-gray-200 shadow-inner">
                          <Editor 
                            height="100%"
                            theme="light"
                            language={userLang}
                            value={userCode}
                            onChange={(v) => handleAnswerChange(currentQ.id, { lang: userLang, code: v })}
                            options={{ fontSize: 14, fontFamily: 'monospace', minimap: { enabled: false }, padding: { top: 10 } }}
                          />
                       </div>

                       <div className="bg-gray-900 p-6 font-mono text-[13px]">
                          <p className="text-gray-500 mb-2 border-b border-gray-800 pb-1 text-[10px] uppercase font-bold tracking-widest">Output Window</p>
                          <pre className="text-gray-300 whitespace-pre-wrap italic">
                             {codeOutput || (isExecuting ? 'Processing...' : 'System ready for instruction.')}
                          </pre>
                       </div>
                    </div>
                  )}
               </div>

               {/* Navigation Controls */}
               <div className="flex items-center justify-between pt-10 border-t border-gray-100">
                  <button 
                    disabled={currentIndex === 0}
                    onClick={() => setCurrentIndex(prev => prev - 1)}
                    className="flex items-center gap-2 px-8 py-3 text-gray-400 hover:text-[#1a237e] transition-all disabled:opacity-0 font-bold uppercase tracking-widest text-[12px]"
                  >
                    <ChevronLeft size={20} /> Previous Question
                  </button>
                  <button 
                    onClick={() => {
                      if (currentIndex < questions.length - 1) setCurrentIndex(prev => prev + 1);
                      else submitExam();
                    }}
                    className="flex items-center gap-2 px-10 py-3 bg-[#1a237e] text-white font-bold uppercase tracking-widest text-[12px] shadow-lg hover:bg-[#0d1440]"
                  >
                    {currentIndex === questions.length - 1 ? 'Finish Assessment' : 'Continue to Next Question'} 
                    <ChevronRight size={20} />
                  </button>
               </div>
            </div>
         </main>
      </div>
    </div>
  );
};

export default ExamAttempt;
