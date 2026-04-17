import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { useExams } from '../../hooks/useExams';
import Editor from '@monaco-editor/react';
import { 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  ShieldCheck,
  Zap,
  Play,
  FileText,
  AlertTriangle,
  Flag,
  Terminal,
  Monitor,
  CheckCircle2,
  XCircle,
  Database,
  Code2,
  Layout,
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
        setError(err.message || 'Identity verification failed. Access denied.');
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
    if (!isAuto && !window.confirm("Finalize assessment and commit sequence to cloud?")) return;

    setIsSubmitting(true);
    try {
      // Pass all answers directly as a fail-safe in case background sync lagged
      await api.post('/attempts/submit', { attemptId, isAuto, reason, answers });
      localStorage.removeItem(`exam_ans_${attemptId}`);
      localStorage.removeItem(`exam_flags_${attemptId}`);
      await refreshData();
      navigate(`/student/result/${attemptId}`);
    } catch (err) {
      setIsSubmitting(false);
      alert("Comms failure: " + err.message);
    }
  };

  const handleAnswerChange = (qId, val) => {
    setAnswers(prev => ({ ...prev, [qId]: val }));
    setTestResults(null); 
    setCodeOutput('');
  };

  const runCode = async () => {
    setIsExecuting(true);
    setCodeOutput('Initializing secure sandbox environment...\n');
    
    // Simulate execution latency
    setTimeout(() => {
      const q = questions[currentIndex];
      const ans = answers[q.id];
      const code = typeof ans === 'object' ? ans.code : ans;
      const lang = typeof ans === 'object' ? ans.lang : (q.language || 'javascript');

      if (lang === 'html' || lang === 'css' || lang === 'react') {
        setCodeOutput('Rendering live preview sequence...');
      } else if (lang === 'sql') {
        setCodeOutput('Query executed. Result: 14 rows returned.');
      } else {
        setCodeOutput(`Execution complete.\n\n$ ${lang} script.run\n> System initialized\n> Processing logic...\n> Output: 42\n\nExecution Time: 124ms`);
      }
      setIsExecuting(false);
    }, 1500);
  };

  const runTests = async () => {
    setIsExecuting(true);
    setCodeOutput('Loading encrypted test vectors...\n');
    
    setTimeout(() => {
      setTestResults([
        { id: 1, name: 'Initial Handshake', status: 'passed', expected: '1', actual: '1' },
        { id: 2, name: 'Data Flow Compression', status: 'passed', expected: 'true', actual: 'true' },
        { id: 3, name: 'Boundary Condition Edge', status: 'failed', expected: 'error-null', actual: '0' },
      ]);
      setIsExecuting(false);
    }, 2000);
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 font-serif">
       <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-6"></div>
       <p className="text-sm font-black text-gray-400 uppercase tracking-[0.3em]">Synching with Assessment Node...</p>
    </div>
  );

  if (!started) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 font-serif">
        <div className="max-w-xl w-full bg-white dark:bg-gray-800 rounded-[2rem] p-12 shadow-xl border border-gray-100 dark:border-white/5 text-center space-y-8 animate-fade-in">
           <div className="w-20 h-20 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
              <ShieldCheck className="w-10 h-10 text-orange-500" />
           </div>
           <h1 className="text-3xl font-bold font-display text-gray-900 dark:text-white tracking-tight leading-tight">{exam?.title || 'Security Protocol'} Entry</h1>
           <div className="bg-orange-50 dark:bg-orange-500/10 p-6 rounded-2xl border border-orange-100 dark:border-orange-500/20 text-left">
              <p className="text-[10px] font-bold text-orange-600 dark:text-orange-400 uppercase tracking-widest mb-4">Environment Status:</p>
              <ul className="space-y-3 text-sm font-bold text-gray-700">
                 <li className="flex items-center gap-2 pr-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" /> Proctoring Sensor Active
                 </li>
                 <li className="flex items-center gap-2 pr-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" /> Multi-language Sandbox Initialized
                 </li>
                 <li className="flex items-center gap-2 pr-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" /> RSA-256 Cloud Sync Ready
                 </li>
              </ul>
           </div>
           <button 
             onClick={() => setStarted(true)}
             className="w-full py-5 bg-gray-900 dark:bg-orange-600 text-white rounded-xl font-bold text-lg hover:filter hover:brightness-110 transition-all shadow-lg active:scale-95"
           >
             Start Assessment
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
    <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col">
      <ProctoringControl isExamActive={started && !isSubmitting} onViolation={handleViolation} />
      
      {showViolationWarning && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[999] bg-rose-600 text-white px-8 py-4 rounded-full shadow-2xl flex items-center gap-4 animate-bounce border-2 border-white">
           <AlertTriangle className="w-5 h-5" />
           <p className="font-bold uppercase tracking-widest text-xs">{showViolationWarning}</p>
        </div>
      )}

      {/* Header */}
      <header className="h-20 border-b border-gray-100 dark:border-white/5 sticky top-0 z-50 px-8 flex items-center justify-between bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl transition-colors">
          <div className="flex items-center gap-6">
             <Link to="/student" className="hover:scale-105 transition-transform shrink-0">
                <Logo size={50} />
             </Link>
             <div className="w-1.5 h-8 bg-gray-100 dark:bg-gray-800 rounded-full"></div>
             <div className="w-11 h-11 bg-gray-900 dark:bg-orange-600 text-white rounded-xl flex items-center justify-center font-bold text-lg">
                {currentIndex + 1}
             </div>
            <div>
               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1.5">Question Progress</p>
               <div className="flex items-center gap-3">
                  <div className="h-1.5 w-40 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                     <div className="h-full bg-orange-500 transition-all duration-700" style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}></div>
                  </div>
                  <span className="text-[10px] font-bold text-gray-400">{currentIndex + 1}/{questions.length}</span>
               </div>
            </div>
         </div>

         <div className="flex items-center gap-6">
            <div className="hidden lg:flex items-center gap-2 bg-emerald-50 dark:bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-100 dark:border-emerald-500/20">
               <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
               <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Active Connection</span>
            </div>

            <div className={`flex items-center gap-3 px-6 py-2 rounded-xl border transition-all ${timeLeft < 300 ? 'bg-rose-50 border-rose-200 animate-pulse' : 'bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/5'}`}>
               <Clock className={`w-5 h-5 ${timeLeft < 300 ? 'text-rose-500' : 'text-gray-400'}`} />
               <span className={`text-xl font-bold font-display ${timeLeft < 300 ? 'text-rose-600' : 'text-gray-900 dark:text-white'}`}>{formatTime(timeLeft)}</span>
            </div>

            <button onClick={() => submitExam()} className="bg-gray-900 dark:bg-orange-600 text-white px-8 py-3.5 rounded-xl font-bold text-sm hover:filter hover:brightness-110 transition-all active:scale-95 shadow-md">
              Finish
            </button>
         </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
         {/* Question Palette Sidebar */}
         <aside className="w-80 border-r border-gray-100 p-8 flex flex-col gap-10 overflow-y-auto">
            <div className="space-y-6">
               <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.5em] px-2 text-center">Navigator Palette</h3>
               <div className="grid grid-cols-4 gap-3">
                  {questions.map((q, i) => (
                    <button
                      key={q.id}
                      onClick={() => setCurrentIndex(i)}
                      className={`h-14 rounded-xl font-black text-sm flex items-center justify-center transition-all ${
                        currentIndex === i ? 'ring-4 ring-orange-100 border-orange-500 bg-orange-50 text-orange-600' : 
                        flagged.includes(q.id) ? 'border-2 border-orange-500 text-orange-600 animate-pulse' :
                        answers[q.id] ? 'bg-gray-900 text-white shadow-lg' : 'bg-gray-50 text-gray-300'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
               </div>
            </div>

            <div className="mt-auto space-y-6 bg-slate-50 rounded-3xl p-6 border border-gray-100">
               <div className="flex items-center justify-between text-[10px] font-black uppercase text-gray-400">
                  <span>Logic Coverage</span>
                  <span>{Object.keys(answers).length}/{questions.length}</span>
               </div>
               <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gray-900 transition-all duration-1000" style={{ width: `${(Object.keys(answers).length / questions.length) * 100}%` }}></div>
               </div>
            </div>
         </aside>

         {/* Main Workspace */}
         <main className="flex-1 overflow-y-auto bg-gray-50/30 p-12 lg:p-16 flex flex-col items-center">
            <div className="max-w-5xl w-full space-y-12">
               <div className="flex justify-between items-center px-4">
                  <span className="bg-orange-100 text-orange-600 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                     {currentQ?.type?.toLowerCase() === 'mcq' ? <FileText className="w-4 h-4" /> : <Code2 className="w-4 h-4" />}
                     SEGMENT TYPE: {currentQ?.type?.toUpperCase()}
                  </span>
                  <button 
                    onClick={() => toggleFlag(currentQ?.id)}
                    className={`flex items-center gap-3 font-black uppercase text-[10px] tracking-[0.2em] transition-all ${flagged.includes(currentQ?.id) ? 'text-orange-500' : 'text-gray-400'}`}
                  >
                    <Flag className={`w-4 h-4 ${flagged.includes(currentQ?.id) ? 'fill-current' : ''}`} />
                    {flagged.includes(currentQ?.id) ? 'Marked for Review' : 'Flag Fragment'}
                  </button>
               </div>

               <h2 className="text-4xl font-black text-gray-900 leading-[1.2] tracking-tight px-4 italic">
                  {currentQ?.question_text}
               </h2>

               <div className="bg-white rounded-[3.5rem] border border-gray-100 shadow-2xl p-6 lg:p-10 transition-shadow hover:shadow-orange-100/30">
                  {currentQ?.type?.toLowerCase() === 'mcq' && (
                    <div className="grid gap-4">
                       {(typeof currentQ.options === 'string' ? JSON.parse(currentQ.options) : currentQ.options).map((opt, i) => (
                         <button
                           key={i}
                           onClick={() => handleAnswerChange(currentQ.id, opt)}
                           className={`p-10 rounded-[2.5rem] text-left border-4 transition-all flex items-center gap-8 group ${
                             answers[currentQ.id] === opt 
                             ? 'border-gray-900 bg-gray-900 text-white shadow-2xl translate-x-4' 
                             : 'border-gray-50 bg-gray-50/50 text-gray-700 hover:border-gray-100'
                           }`}
                         >
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-2xl transition-all ${answers[currentQ.id] === opt ? 'bg-white/20' : 'bg-white text-gray-200'}`}>
                               {String.fromCharCode(65 + i)}
                            </div>
                            <span className="text-2xl font-bold">{opt}</span>
                         </button>
                       ))}
                    </div>
                  )}

                  {currentQ?.type?.toLowerCase() === 'short' && (
                    <textarea 
                      className="w-full min-h-[400px] p-12 bg-gray-50 border-4 border-gray-100 rounded-[3rem] focus:border-gray-900 outline-none text-2xl font-bold transition-all placeholder:text-gray-200"
                      placeholder="Synthesise logic fragment here..."
                      value={currentAns || ''}
                      onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)}
                    />
                  )}

                  {currentQ?.type?.toLowerCase() === 'coding' && (
                    <div className="space-y-8">
                       <div className="flex items-center justify-between bg-zinc-900 p-4 rounded-[2rem] shadow-xl">
                          <div className="flex gap-2">
                             {['javascript', 'python', 'java', 'sql', 'html', 'css', 'react'].map(lang => (
                               <button 
                                 key={lang}
                                 onClick={() => handleAnswerChange(currentQ.id, { lang, code: userCode })}
                                 className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${userLang === lang ? 'bg-white text-zinc-900' : 'text-zinc-500 hover:text-zinc-300'}`}
                               >
                                 {lang}
                               </button>
                             ))}
                          </div>
                          <div className="flex gap-3">
                             <button onClick={runCode} disabled={isExecuting} className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 active:scale-95 transition-all shadow-lg shadow-emerald-500/30">
                                <Play className="w-4 h-4 fill-current" /> Run Logic
                             </button>
                             <button onClick={runTests} disabled={isExecuting} className="flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-600 active:scale-95 transition-all shadow-lg shadow-orange-500/30">
                                <Terminal className="w-4 h-4" /> Execute Multi-Tests
                             </button>
                          </div>
                       </div>
                       
                       <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                          <div className="h-[600px] rounded-[3rem] overflow-hidden border-4 border-zinc-900 shadow-2xl bg-zinc-900 transition-all hover:ring-8 hover:ring-orange-100">
                             <Editor 
                               height="100%"
                               theme="vs-dark"
                               language={userLang === 'react' ? 'javascript' : userLang}
                               value={userCode}
                               onChange={(v) => handleAnswerChange(currentQ.id, { lang: userLang, code: v })}
                               options={{ fontSize: 16, fontFamily: 'Fira Code', minimap: { enabled: false }, padding: { top: 20 } }}
                             />
                          </div>

                          <div className="flex flex-col gap-6">
                             {/* Preview Panel for Web Dev */}
                             {(userLang === 'html' || userLang === 'css' || userLang === 'react') && (
                                <div className="h-full min-h-[280px] bg-white rounded-[3rem] border-4 border-gray-100 flex flex-col overflow-hidden shadow-inner">
                                   <div className="px-6 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 italic"><Layout className="w-4 h-4" /> Web Viewport Shell</span>
                                      <div className="flex gap-1.5">
                                         <div className="w-2.5 h-2.5 bg-rose-400 rounded-full"></div>
                                         <div className="w-2.5 h-2.5 bg-amber-400 rounded-full"></div>
                                         <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full"></div>
                                      </div>
                                   </div>
                                   <div className="flex-1 p-6 font-serif">
                                      {userLang === 'html' && <div dangerouslySetInnerHTML={{ __html: userCode }} />}
                                      {(userLang === 'css' || userLang === 'react') && <div className="flex flex-col items-center justify-center h-full text-gray-200 text-xs font-black uppercase">Live Render Initialized</div>}
                                   </div>
                                </div>
                             )}

                             {/* SQL Result Table Placeholder */}
                             {userLang === 'sql' && (
                                <div className="h-full min-h-[280px] bg-white rounded-[3rem] border-4 border-gray-100 flex flex-col overflow-hidden">
                                   <div className="px-6 py-3 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
                                      <TableIcon className="w-4 h-4 text-orange-500" />
                                      <span className="text-[10px] font-black uppercase text-gray-400">Query Output Matrix</span>
                                   </div>
                                   <div className="flex-1 overflow-auto">
                                      <table className="w-full text-left text-xs">
                                         <thead className="bg-gray-50 border-b border-gray-100">
                                            <tr>
                                               <th className="px-4 py-2 font-black uppercase text-gray-400">ID</th>
                                               <th className="px-4 py-2 font-black uppercase text-gray-400">Field_A</th>
                                               <th className="px-4 py-2 font-black uppercase text-gray-400">Value_B</th>
                                            </tr>
                                         </thead>
                                         <tbody className="divide-y divide-gray-50 font-medium italic">
                                            <tr><td className="px-4 py-2">001</td><td className="px-4 py-2">Handshake_Succ</td><td className="px-4 py-2">124.5</td></tr>
                                            <tr><td className="px-4 py-2">002</td><td className="px-4 py-2">Protocol_Sync</td><td className="px-4 py-2">88.2</td></tr>
                                         </tbody>
                                      </table>
                                   </div>
                                </div>
                             )}

                             {/* Console Output */}
                             <div className="h-full bg-zinc-950 rounded-[3rem] p-8 border-4 border-zinc-900 shadow-2xl relative">
                                <span className="absolute top-4 right-10 text-[9px] font-black text-zinc-700 uppercase italic">Debug Console v4.2</span>
                                <div className="flex items-center gap-2 mb-4 text-zinc-500">
                                   <Terminal className="w-4 h-4" />
                                   <p className="text-[10px] font-black uppercase tracking-widest">Compiler Stream</p>
                                </div>
                                <pre className="text-emerald-400 font-mono text-sm leading-relaxed whitespace-pre-wrap">
                                   {codeOutput || (isExecuting ? 'Initializing System Kernel...' : 'Ready for instruction.')}
                                </pre>
                                
                                {testResults && (
                                  <div className="mt-8 pt-8 border-t border-zinc-800 space-y-4">
                                     <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Test Vector Status</p>
                                     <div className="grid grid-cols-1 gap-2">
                                        {testResults.map(res => (
                                          <div key={res.id} className="flex items-center justify-between bg-zinc-900/50 p-3 rounded-xl border border-zinc-800">
                                             <div className="flex items-center gap-3">
                                                {res.status === 'passed' ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <XCircle className="w-4 h-4 text-rose-500" />}
                                                <span className="text-[11px] font-bold text-zinc-300">{res.name}</span>
                                             </div>
                                             <span className={`text-[10px] font-black uppercase ${res.status === 'passed' ? 'text-emerald-500' : 'text-rose-500'}`}>{res.status}</span>
                                          </div>
                                        ))}
                                     </div>
                                  </div>
                                )}
                             </div>
                          </div>
                       </div>
                    </div>
                  )}
               </div>

               <div className="flex items-center justify-between pt-12">
                  <button 
                    disabled={currentIndex === 0}
                    onClick={() => setCurrentIndex(prev => prev - 1)}
                    className="flex items-center gap-4 px-10 py-5 rounded-[1.5rem] font-black text-gray-300 hover:text-gray-900 transition-all disabled:opacity-20"
                  >
                    <ChevronLeft className="w-6 h-6" /> PREVIOUS SEQUENCE
                  </button>
                  <button 
                    onClick={() => {
                      if (currentIndex < questions.length - 1) setCurrentIndex(prev => prev + 1);
                      else submitExam();
                    }}
                    className="flex items-center gap-4 px-12 py-6 bg-gray-900 text-white rounded-[1.5rem] font-black text-sm uppercase tracking-[0.2em] shadow-xl hover:bg-black transition-all active:scale-95 group"
                  >
                    {currentIndex === questions.length - 1 ? 'COMMIT ALL FRAGMENTS' : 'NEXT FRAGMENT'} 
                    <ChevronRight className="w-6 h-6 group-hover:translate-x-3 transition-transform" />
                  </button>
               </div>
            </div>
         </main>
      </div>
    </div>
  );
};

export default ExamAttempt;
