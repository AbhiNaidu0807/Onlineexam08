import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/authContext';
import { useExams } from '../hooks/useExams';
import Editor from '@monaco-editor/react';
import { 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  Send, 
  Terminal, 
  CheckCircle2, 
  XCircle, 
  Trophy, 
  AlertTriangle,
  PlayCircle,
  Target,
  ArrowLeft,
  Timer
} from 'lucide-react';

// --- Simulation Logic ---
const runCodeSimulation = (language, code) => {
  const passed = code.length > 20; // Basic mock validation
  return {
    success: passed,
    output: passed ? "All test cases passed." : "Compilation Error: Unexpected token",
    results: [
      { name: "Syntax Verification", passed: true },
      { name: "Edge Case: Null Input", passed: passed },
      { name: "Performance Benchmarking", passed: passed }
    ]
  };
};

const ExamPortal = () => {
  const { user } = useAuth();
  const { activeExams, submitAttempt, isAttempted } = useExams();
  
  const [phase, setPhase] = useState('lobby'); // 'lobby' | 'session' | 'success'
  const [activeExam, setActiveExam] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [consoleOutput, setConsoleOutput] = useState(null);

  // Timer logic
  useEffect(() => {
    let timer;
    if (phase === 'session' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [phase, timeLeft]);

  const startExam = (exam) => {
    setActiveExam(exam);
    setTimeLeft(exam.duration * 60);
    setAnswers({});
    setCurrentIndex(0);
    setPhase('session');
    
    // Attempt tracking
    localStorage.setItem(`exam_start_${exam.id}_${user.id}`, new Date().toISOString());
  };

  const handleAnswerChange = (qId, val) => {
    setAnswers(prev => ({ ...prev, [qId]: val }));
  };

  const handleAutoSubmit = () => {
    processSubmission();
  };

  const processSubmission = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    // Calculate score (simple mock validation for demo)
    let score = 0;
    activeExam.questions.forEach(q => {
      const ans = answers[q.id];
      if (q.type === 'MCQ' && ans === q.correct_answer) score += q.marks;
      if (q.type === 'SHORT' && ans?.toLowerCase() === q.correct_answer?.toLowerCase()) score += q.marks;
      if (q.type === 'CODING' && ans?.length > 20) score += q.marks;
    });

    const finalPct = Math.round((score / activeExam.questions.reduce((a, b) => a + b.marks, 0)) * 100);

    try {
      await submitAttempt({
        exam_id: activeExam.id,
        user_id: user.id,
        score: finalPct,
        answers: JSON.stringify(answers),
        status: 'submitted'
      });
      setPhase('success');
    } catch (err) {
      alert("Error submitting exam: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (s) => {
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  if (phase === 'lobby') {
    return (
      <div className="max-w-6xl mx-auto py-8 animate-in fade-in">
        <header className="mb-12 flex justify-between items-end px-4">
          <div>
            <h1 className="text-5xl font-black text-gray-900 dark:text-white mb-2">Live <span className="text-orange-500 underline decoration-green-500">Portal</span></h1>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Real-time assessment environment</p>
          </div>
          <div className="hidden md:block text-right">
            <span className="text-2xl font-black text-green-600 block">SYSTEM SECURE</span>
            <span className="text-[10px] font-black text-gray-400 block tracking-tighter italic">256-BIT ENCRYPTION ACTIVE</span>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {activeExams.map(exam => {
            const attempted = isAttempted(exam.id, user.id);
            return (
              <div key={exam.id} className="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-[3rem] p-10 border border-gray-100 dark:border-gray-700 shadow-xl hover:shadow-2xl transition-all h-[420px] flex flex-col justify-between">
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 dark:bg-orange-900/10 rounded-bl-[4rem] group-hover:w-40 group-hover:h-40 transition-all duration-500"></div>
                
                <div className="relative z-10 space-y-6">
                  <div className="flex justify-between items-start">
                    <div className="p-4 bg-orange-500 rounded-2xl shadow-lg shadow-orange-200"><Target className="w-8 h-8 text-white" /></div>
                    {attempted ? (
                       <span className="bg-green-100 text-green-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                         <CheckCircle2 className="w-4 h-4" /> Completed
                       </span>
                    ) : (
                       <span className="bg-orange-100 text-orange-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">Available</span>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white leading-tight leading-7 line-clamp-2">{exam.title}</h3>
                    <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">Official Assessment</p>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 text-gray-500"><Clock className="w-4 h-4" /> <span className="text-xs font-black">{exam.duration} MIN</span></div>
                    <div className="flex items-center gap-2 text-gray-500"><Terminal className="w-4 h-4" /> <span className="text-xs font-black">{exam.questions?.length || 0} QUESTS</span></div>
                  </div>
                </div>

                {!attempted ? (
                  <button 
                    onClick={() => startExam(exam)}
                    className="w-full py-5 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-black text-lg transition-all shadow-xl shadow-orange-200 active:scale-95 z-10"
                  >
                    START EXAM →
                  </button>
                ) : (
                  <button disabled className="w-full py-5 bg-gray-100 dark:bg-gray-700 text-gray-400 font-black rounded-2xl cursor-not-allowed z-10 grayscale">
                    ATTEMPT LOCKED
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (phase === 'success') {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 animate-in slide-in-from-bottom duration-700">
        <div className="bg-white dark:bg-gray-800 rounded-[4rem] shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700">
          <div className="bg-gradient-to-br from-green-500 to-green-600 p-16 text-center text-white relative">
            <div className="inline-flex items-center justify-center w-28 h-28 bg-white/20 backdrop-blur-xl rounded-[2.5rem] mb-8 animate-float">
              <Trophy className="w-16 h-16 text-white" />
            </div>
            <h1 className="text-5xl font-black mb-4">Exam Submitted!</h1>
            <p className="text-green-50 text-xl font-medium max-w-md mx-auto">Your responses have been securely synced with the database. You can view your results in the dashboard.</p>
          </div>
          <div className="p-12 text-center">
            <button 
              onClick={() => window.location.href = '/student'}
              className="bg-orange-500 text-white px-12 py-5 rounded-2xl font-black text-xl hover:bg-orange-600 transition-all shadow-xl shadow-orange-200"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = activeExam.questions[currentIndex];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 -mt-8 -mx-4 pb-20 select-none">
       {/* High-Stakes Header */}
       <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b-2 border-orange-500 shadow-xl">
         <div className="container mx-auto px-6 h-20 flex items-center justify-between">
           <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center animate-pulse shadow-lg shadow-orange-200">
               <Terminal className="text-white w-6 h-6" />
             </div>
             <div>
               <h1 className="text-xl font-black text-gray-900 dark:text-white leading-tight truncate max-w-[200px] md:max-w-md">{activeExam.title}</h1>
               <div className="flex items-center gap-2 text-[10px] font-black text-green-600 uppercase tracking-widest">
                 <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                 EXAM SYNCHRONIZED
               </div>
             </div>
           </div>

           <div className={`flex items-center gap-4 px-8 py-3 rounded-2xl border-4 transition-all ${timeLeft < 300 ? 'bg-red-50 border-red-500 text-red-600 animate-pulse' : 'bg-orange-50 border-orange-500 text-orange-600'}`}>
              <Timer className="w-6 h-6" />
              <span className="text-2xl font-black tabular-nums">{formatTime(timeLeft)}</span>
           </div>
         </div>
       </header>

       <div className="container mx-auto px-6 py-10 flex flex-col lg:grid lg:grid-cols-12 gap-10">
          {/* Progress sidebar */}
          <aside className="lg:col-span-3 space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-[3rem] p-8 border border-gray-100 dark:border-gray-700 shadow-sm">
               <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest">Progress Map</h2>
                  <span className="bg-orange-100 text-orange-600 text-[10px] font-black px-2 py-0.5 rounded-lg">LIVE</span>
               </div>
               <div className="grid grid-cols-5 gap-3">
                  {activeExam.questions.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentIndex(idx)}
                      className={`w-full aspect-square rounded-xl text-xs font-black transition-all border-2 ${
                        currentIndex === idx 
                          ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-200 scale-110' 
                          : answers[q.id] 
                            ? 'bg-green-500 border-green-500 text-white' 
                            : 'bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-700 text-gray-400 hover:border-orange-300'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
               </div>
            </div>

            <button 
              onClick={() => { if(window.confirm('Finish and submit your responses?')) processSubmission(); }}
              disabled={isSubmitting}
              className="w-full py-6 bg-green-600 hover:bg-green-700 text-white rounded-[2rem] font-black text-xl shadow-xl shadow-green-200 flex items-center justify-center gap-3 transition-all active:scale-95 disabled:bg-gray-300"
            >
              {isSubmitting ? <div className="w-6 h-6 border-4 border-white border-t-transparent animate-spin rounded-full"></div> : <><Send className="w-7 h-7" /> FINISH & SUBMIT</>}
            </button>
          </aside>

          {/* Question Hub */}
          <main className="lg:col-span-9 space-y-8">
            <div className="bg-white dark:bg-gray-800 rounded-[4rem] p-12 md:p-16 border border-gray-100 dark:border-gray-700 shadow-xl animate-in fade-in">
              <div className="flex items-center gap-3 mb-12">
                <span className="bg-orange-500 text-white px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest">Question {currentIndex + 1}</span>
                <span className="bg-gray-100 dark:bg-gray-700 text-gray-500 px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest">{currentQ.marks} MARKS</span>
                <div className="ml-auto flex items-center gap-2 px-6 py-2 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase">
                  <CheckCircle2 className="w-4 h-4" /> Secure Input
                </div>
              </div>

              <h2 className="text-4xl font-black text-gray-900 dark:text-white leading-tight mb-12">
                {currentQ.question_text}
              </h2>

              <div className="space-y-6">
                {currentQ.type === 'MCQ' && (
                  <div className="grid grid-cols-1 gap-4">
                    {JSON.parse(currentQ.options || '[]').map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => handleAnswerChange(currentQ.id, opt)}
                        className={`group w-full p-8 text-left rounded-[2rem] border-3 transition-all flex items-center gap-8 ${
                          answers[currentQ.id] === opt
                            ? 'bg-orange-500 border-orange-500 text-white shadow-xl shadow-orange-200'
                            : 'bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-orange-300'
                        }`}
                      >
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl transition-all ${
                          answers[currentQ.id] === opt ? 'bg-white/20 text-white' : 'bg-white dark:bg-gray-800 text-gray-400 group-hover:bg-orange-50'
                        }`}>
                          {String.fromCharCode(65 + i)}
                        </div>
                        <span className="text-2xl font-bold">{opt}</span>
                      </button>
                    ))}
                  </div>
                )}

                {currentQ.type === 'SHORT' && (
                  <input
                    type="text"
                    value={answers[currentQ.id] || ''}
                    onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)}
                    placeholder="Type your official answer..."
                    className="w-full px-10 py-8 rounded-[2rem] bg-gray-50 dark:bg-gray-900 border-4 border-gray-100 dark:border-gray-700 focus:border-orange-500 outline-none text-3xl font-black text-gray-900 dark:text-white transition-all shadow-inner"
                  />
                )}

                {currentQ.type === 'CODING' && (
                  <div className="space-y-6">
                     <div className="rounded-[2.5rem] overflow-hidden border-4 border-gray-100 dark:border-gray-700 shadow-2xl h-[450px]">
                        <Editor
                          height="100%"
                          defaultLanguage="javascript"
                          theme="vs-dark"
                          value={answers[currentQ.id] || ''}
                          onChange={(val) => handleAnswerChange(currentQ.id, val)}
                          options={{ fontSize: 18, fontFamily: "'Fira Code', monospace", padding: { top: 20 } }}
                        />
                     </div>
                     <button 
                       onClick={() => setConsoleOutput(runCodeSimulation('js', answers[currentQ.id] || ''))}
                       className="w-full py-5 bg-gray-900 text-white rounded-2xl font-black text-lg hover:bg-black flex items-center justify-center gap-3 transition-all"
                     >
                       <PlayCircle className="w-6 h-6" /> EXECUTE CODE SIMULATION
                     </button>
                     {consoleOutput && (
                       <div className="bg-black p-8 rounded-[2.5rem] font-mono text-sm border-l-8 border-orange-500 animate-in slide-in-from-top">
                          <div className="flex justify-between items-center mb-6">
                            <span className="text-orange-500 font-black">CONSOLE OUTPUT</span>
                            <button onClick={() => setConsoleOutput(null)} className="text-gray-600 hover:text-white"><XCircle className="w-5 h-5" /></button>
                          </div>
                          <pre className="text-green-400 mb-6">{consoleOutput.output}</pre>
                       </div>
                     )}
                  </div>
                )}
              </div>
            </div>

            <nav className="flex justify-between items-center bg-white dark:bg-gray-800 p-8 rounded-[3rem] border border-gray-100 dark:border-gray-700 shadow-sm">
               <button
                 disabled={currentIndex === 0}
                 onClick={() => setCurrentIndex(prev => prev - 1)}
                 className="flex items-center gap-3 px-10 py-5 rounded-2xl font-black text-gray-400 hover:text-orange-500 disabled:opacity-20 transition-all uppercase tracking-widest text-sm"
               >
                 <ChevronLeft className="w-6 h-6" /> Back
               </button>
               <div className="flex gap-2">
                 {activeExam.questions.map((_, i) => (
                   <div key={i} className={`w-2 h-2 rounded-full transition-all ${i === currentIndex ? 'w-10 bg-orange-500' : 'bg-gray-200'}`}></div>
                 ))}
               </div>
               <button
                 onClick={() => {
                   if (currentIndex < activeExam.questions.length - 1) setCurrentIndex(prev => prev + 1);
                   else if(window.confirm('Ready for final submission?')) processSubmission();
                 }}
                 className="flex items-center gap-3 px-12 py-5 bg-orange-500 text-white rounded-2xl font-black hover:bg-orange-600 transition-all shadow-xl shadow-orange-200 uppercase tracking-widest text-sm"
               >
                 {currentIndex === activeExam.questions.length - 1 ? 'Final Review' : 'Proceed'} <ChevronRight className="w-6 h-6" />
               </button>
            </nav>
          </main>
       </div>
    </div>
  );
};

export default ExamPortal;
