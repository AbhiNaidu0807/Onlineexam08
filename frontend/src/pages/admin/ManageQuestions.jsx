import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useExams } from '../../hooks/useExams';
import { 
  Plus, 
  Upload, 
  Trash2, 
  ArrowLeft, 
  Save, 
  CheckCircle2, 
  FileText, 
  Code2,
  Type as TypeIcon,
  HelpCircle,
  X,
  Database,
  CaseSensitive,
  Eye,
  Settings,
  Play,
  Info,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import * as XLSX from 'xlsx';
import Editor from '@monaco-editor/react';

const ManageQuestions = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getExamById, addQuestionsToExam, fetchQuestionsForExam, deleteQuestion } = useExams();
  
  const [exam, setExam] = useState(null);
  const [activeTab, setActiveTab] = useState('manual');
  const [questions, setQuestions] = useState([]);
  const [parsing, setParsing] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [questionType, setQuestionType] = useState('mcq'); 
  const [commonFields, setCommonFields] = useState({ text: '', marks: 5, explanation: '' });
  
  const [mcqData, setMcqData] = useState({ options: ['', '', '', ''], correctAnswer: 0 });
  const [shortData, setShortData] = useState({ answer: '', caseSensitive: false });
  const [codingData, setCodingData] = useState({
    language: 'javascript',
    baseCode: '',
    testCases: [{ input: '', output: '' }]
  });

  const fileInputRef = useRef();

  const loadQuestions = async () => {
    setLoading(true);
    const qs = await fetchQuestionsForExam(id);
    setQuestions(qs);
    setLoading(false);
  };

  useEffect(() => {
    const data = getExamById(id);
    if (data) {
      setExam(data);
      loadQuestions();
    }
  }, [id, getExamById]);

  const resetForm = () => {
    setCommonFields({ text: '', marks: 5, explanation: '' });
    setMcqData({ options: ['', '', '', ''], correctAnswer: 0 });
    setShortData({ answer: '', caseSensitive: false });
    setCodingData({ language: 'javascript', baseCode: '', testCases: [{ input: '', output: '' }] });
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    let newQ = {
      type: questionType,
      question_text: commonFields.text,
      marks: parseInt(commonFields.marks),
      explanation: commonFields.explanation,
      exam_id: id
    };

    if (questionType === 'mcq') {
       newQ = { 
         ...newQ, 
         options: JSON.stringify(mcqData.options.filter(o => o.trim() !== '')), 
         correct_answer: mcqData.options[mcqData.correctAnswer] 
       };
    } else if (questionType === 'short') {
       newQ = { ...newQ, correct_answer: shortData.answer };
    } else {
       newQ = { 
         ...newQ, 
         language: codingData.language, 
         base_code: codingData.baseCode, 
         test_cases: JSON.stringify(codingData.testCases), 
         correct_answer: 'Verified via test cases' 
       };
    }

    try {
      await addQuestionsToExam(id, [newQ]);
      await loadQuestions();
      resetForm();
      alert("Question successfully added to bank.");
    } catch (err) {
      alert("Persistence Error.");
    }
  };

  const handleDelete = async (qid) => {
     if (window.confirm("Permanently erase this question from the bank?")) {
        try {
           await deleteQuestion(qid);
           setQuestions(prev => prev.filter(q => q.id !== qid));
        } catch (e) {
           alert("Deletion failed.");
        }
     }
  };

  const downloadSampleTemplate = () => {
    const headers = ["Question", "Type", "Option A", "Option B", "Option C", "Option D", "Answer", "Marks", "Explanation", "Language"];
    const rows = [
      ["What is React?", "mcq", "A UI Library", "Operating System", "Database", "Browser", "A UI Library", "5", "React is a JS library for building UIs.", "javascript"],
      ["What is JSX?", "short", "", "", "", "", "JavaScript XML", "10", "JSX is a syntax extension for JS.", ""],
    ];
    
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    XLSX.utils.book_append_sheet(wb, ws, "Questions");
    XLSX.writeFile(wb, "exam_question_template.xlsx");
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setParsing(true);

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(ws);

        const parsed = data.map((row) => {
          const type = row.Type?.toLowerCase() || 'mcq';
          let q = {
            type,
            question_text: row.Question || '',
            marks: parseInt(row.Marks) || 5,
            explanation: row.Explanation || '',
            exam_id: id
          };

          if (type === 'mcq') {
            q.options = JSON.stringify([row["Option A"], row["Option B"], row["Option C"], row["Option D"]].filter(Boolean));
            q.correct_answer = row.Answer || row["Option A"];
          } else if (type === 'short') {
            q.correct_answer = row.Answer || '';
          } else if (type === 'coding') {
            q.correct_answer = row.Answer || '';
            q.language = row.Language || 'javascript';
            q.test_cases = JSON.stringify([{ input: row.Input || '', output: row.Output || '' }]);
          }
          return q;
        });

        await addQuestionsToExam(id, parsed);
        await loadQuestions();
        alert(`Successfully imported ${parsed.length} questions.`);
      } catch (err) {
        alert("Import Error.");
      } finally {
        setParsing(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  if (!exam) return <div className="p-20 text-center font-black opacity-20 animate-pulse">Synchronizing Data Grid...</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 font-outfit">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 px-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
             <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">Question Bank</span>
             <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          </div>
          <h1 className="text-5xl font-black text-gray-900 dark:text-white tracking-tight">Manage <span className="text-orange-500 italic underline decoration-gray-900 decoration-4 underline-offset-8">Curriculum</span></h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Design and calibrate assessment questions for <span className="text-orange-600 font-black">{exam.title}</span></p>
        </div>
        
        <div className="flex gap-3">
           <button onClick={() => navigate('/admin')} className="flex items-center gap-2 px-8 py-4 bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-2xl font-black text-xs uppercase tracking-widest hover:border-orange-500 transition-all shadow-sm">
              <ArrowLeft className="w-4 h-4" /> Exit Session
           </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-7 space-y-8">
           <div className="bg-white dark:bg-gray-800 rounded-[3.5rem] border border-gray-100 dark:border-gray-700 overflow-hidden shadow-2xl">
              <div className="flex border-b border-gray-100 dark:border-gray-700">
                 <button onClick={() => setActiveTab('manual')} className={`flex-1 py-7 font-black uppercase tracking-widest text-[10px] transition-all ${activeTab === 'manual' ? 'bg-orange-500 text-white' : 'text-gray-400 hover:bg-gray-50'}`}>Manual Builder</button>
                 <button onClick={() => setActiveTab('bulk')} className={`flex-1 py-7 font-black uppercase tracking-widest text-[10px] transition-all ${activeTab === 'bulk' ? 'bg-orange-500 text-white' : 'text-gray-400 hover:bg-gray-50'}`}>Bulk Ingestion</button>
              </div>

              <div className="p-10 md:p-14">
                 {activeTab === 'manual' ? (
                    <form onSubmit={handleManualSubmit} className="space-y-10">
                       <div className="flex gap-4">
                          {['mcq', 'short', 'coding'].map(type => (
                             <button 
                               key={type}
                               type="button"
                               onClick={() => setQuestionType(type)}
                               className={`flex-1 py-6 rounded-3xl font-black uppercase text-[10px] tracking-widest border-2 transition-all group ${questionType === type ? 'bg-orange-50 border-orange-500 text-orange-600' : 'border-gray-100 dark:border-gray-700 text-gray-400 hover:border-orange-200'}`}
                             >
                                <div className={`w-10 h-10 mx-auto mb-3 rounded-xl flex items-center justify-center transition-colors ${questionType === type ? 'bg-orange-500 text-white shadow-lg' : 'bg-gray-50 dark:bg-gray-900 group-hover:bg-orange-50'}`}>
                                   {type === 'mcq' && <CheckCircle2 className="w-5 h-5" />}
                                   {type === 'short' && <TypeIcon className="w-5 h-5" />}
                                   {type === 'coding' && <Code2 className="w-5 h-5" />}
                                </div>
                                {type}
                             </button>
                          ))}
                       </div>

                       <div className="space-y-8">
                          <div>
                             <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 px-2">Question Context</label>
                             <textarea 
                               required
                               className="w-full p-8 h-40 rounded-[2.5rem] bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-orange-500 outline-none font-bold text-gray-800 dark:text-white transition-all shadow-inner"
                               placeholder="Enter your question prompt here..."
                               value={commonFields.text}
                               onChange={(e) => setCommonFields({...commonFields, text: e.target.value})}
                             />
                          </div>
                          <div className="grid grid-cols-2 gap-8">
                             <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 px-2">Weightage (Marks)</label>
                                <input 
                                  type="number" 
                                  className="w-full p-5 rounded-2xl bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-orange-500 outline-none font-black"
                                  value={commonFields.marks}
                                  onChange={(e) => setCommonFields({...commonFields, marks: e.target.value})}
                                />
                             </div>
                             <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 px-2">Solution Explainer</label>
                                <input 
                                  type="text" 
                                  className="w-full p-5 rounded-2xl bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-orange-500 outline-none font-bold"
                                  placeholder="Provide rationale..."
                                  value={commonFields.explanation}
                                  onChange={(e) => setCommonFields({...commonFields, explanation: e.target.value})}
                                />
                             </div>
                          </div>
                       </div>

                       {questionType === 'mcq' && (
                          <div className="space-y-4 animate-in slide-in-from-bottom">
                             <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 px-2">Interactive Options (Map correct index)</label>
                             {mcqData.options.map((opt, idx) => (
                                <div key={idx} className="flex gap-4">
                                   <button 
                                     type="button"
                                     onClick={() => setMcqData({...mcqData, correctAnswer: idx})}
                                     className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black transition-all ${mcqData.correctAnswer === idx ? 'bg-orange-500 text-white shadow-xl' : 'bg-gray-100 dark:bg-gray-900 text-gray-400'}`}
                                   >
                                      {String.fromCharCode(65 + idx)}
                                   </button>
                                   <input 
                                     type="text"
                                     className="flex-1 p-5 rounded-2xl bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-orange-500 outline-none font-medium"
                                     placeholder={`Option Segment ${String.fromCharCode(65 + idx)}`}
                                     value={opt}
                                     onChange={(e) => {
                                        const newOpts = [...mcqData.options];
                                        newOpts[idx] = e.target.value;
                                        setMcqData({...mcqData, options: newOpts});
                                     }}
                                   />
                                </div>
                             ))}
                          </div>
                       )}

                       {questionType === 'short' && (
                          <div className="space-y-4 animate-in slide-in-from-bottom">
                             <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 px-2">Primary Answer Pattern</label>
                             <input 
                               type="text" 
                               className="w-full p-6 rounded-[2rem] bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-orange-500 outline-none font-black text-lg shadow-inner"
                               placeholder="Exact string matching pattern..."
                               value={shortData.answer}
                               onChange={(e) => setShortData({...shortData, answer: e.target.value})}
                             />
                          </div>
                       )}

                       {questionType === 'coding' && (
                          <div className="space-y-8 animate-in slide-in-from-bottom">
                             <div className="flex gap-3 flex-wrap">
                                {['javascript', 'python', 'java', 'cpp'].map(lang => (
                                   <button 
                                     key={lang}
                                     type="button"
                                     onClick={() => setCodingData({...codingData, language: lang})}
                                     className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${codingData.language === lang ? 'bg-gray-900 text-white shadow-lg' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                                   >
                                      {lang}
                                   </button>
                                ))}
                             </div>
                             <div className="h-80 border-4 border-gray-900 rounded-[2.5rem] overflow-hidden shadow-2xl relative">
                                <div className="absolute top-0 left-0 right-0 h-10 bg-gray-800 flex items-center px-6 gap-2 border-b border-gray-700 z-10">
                                   <div className="flex gap-1.5 align-middle">
                                      <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
                                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                                   </div>
                                   <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Algorithmic Sandbox</span>
                                </div>
                                <div className="pt-10 h-full">
                                  <Editor
                                    height="100%"
                                    language={codingData.language === 'cpp' ? 'cpp' : codingData.language}
                                    theme="vs-dark"
                                    value={codingData.baseCode}
                                    onChange={(v) => setCodingData({...codingData, baseCode: v})}
                                    options={{ minimap: { enabled: false }, fontSize: 15, fontFamily: 'JetBrains Mono' }}
                                  />
                                </div>
                             </div>
                          </div>
                       )}

                       <button type="submit" className="w-full bg-orange-500 text-white py-8 rounded-[2.5rem] font-black uppercase tracking-[0.2em] shadow-2xl shadow-orange-100 dark:shadow-none hover:bg-orange-600 hover:-translate-y-1 transition-all active:scale-95 flex items-center justify-center gap-4">
                          <Plus className="w-6 h-6 border-2 rounded-lg" /> PERSIST QUESTION TO BANK
                       </button>
                    </form>
                 ) : (
                    <div className="py-20 flex flex-col items-center justify-center space-y-10 text-center">
                       <div className="w-32 h-32 bg-orange-50 dark:bg-orange-950 text-orange-500 rounded-[3rem] flex items-center justify-center border-4 border-white dark:border-gray-800 shadow-2xl">
                          <Upload className="w-14 h-14" />
                       </div>
                       <div className="max-w-lg">
                          <h3 className="text-3xl font-black text-gray-900 dark:text-white capitalize mb-4">Tactical Manifest Import</h3>
                          <p className="text-gray-500 dark:text-gray-400 font-medium mb-10 text-lg leading-relaxed px-8">Upgrade your entire curriculum in seconds. Decipher your proprietary assessment logic using our schema-validated Excel protocol.</p>
                       </div>
                       <div className="flex flex-col sm:flex-row gap-4 w-full px-12">
                          <button onClick={downloadSampleTemplate} className="flex-1 py-5 bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-3xl font-black uppercase text-[10px] tracking-[0.2em] text-gray-400 hover:border-orange-500 transition-all">Protocol Template</button>
                          <button onClick={() => fileInputRef.current.click()} disabled={parsing} className="flex-1 py-5 bg-gray-900 text-white rounded-3xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-orange-600 transition-all shadow-xl flex items-center justify-center gap-3">
                             {parsing ? 'Parsing Node...' : 'Inject Manifest'}
                          </button>
                       </div>
                       <input type="file" ref={fileInputRef} className="hidden" accept=".xlsx, .xls" onChange={handleFileUpload} />
                    </div>
                 )}
              </div>
           </div>
        </div>

        <aside className="lg:col-span-5 space-y-8">
           <div className="bg-white dark:bg-gray-800 p-10 rounded-[3.5rem] border border-gray-100 dark:border-gray-700 shadow-sm relative overflow-hidden flex flex-col h-[780px]">
              <div className="flex items-center justify-between mb-8">
                 <div className="flex items-center gap-3">
                    <Database className="w-5 h-5 text-orange-500" />
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Curriculum Audit</h3>
                 </div>
                 <span className="bg-orange-100 text-orange-600 px-4 py-1.5 rounded-xl text-[10px] font-black tracking-widest">{questions.length} LOGS</span>
              </div>
              
              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6">
                {questions.map((q, idx) => (
                  <div key={q.id || idx} className="p-8 bg-gray-50 dark:bg-gray-900/50 rounded-[2.5rem] border-2 border-transparent hover:border-orange-500 transition-all group relative">
                    <button 
                      onClick={() => handleDelete(q.id)}
                      className="absolute top-6 right-6 p-2.5 bg-white dark:bg-gray-800 text-rose-500 rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-50 border border-transparent hover:border-rose-100 shadow-sm"
                    >
                       <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="flex flex-col gap-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center text-orange-500 shadow-sm transition-transform group-hover:rotate-12">
                          {q.type === 'mcq' && <HelpCircle className="w-6 h-6" />}
                          {q.type === 'short' && <TypeIcon className="w-6 h-6" />}
                          {q.type === 'coding' && <Code2 className="w-6 h-6" />}
                        </div>
                        <div className="pt-1">
                          <div className="flex gap-2 items-center mb-1">
                             <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Question Segment • {idx + 1}</span>
                             <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                             <span className="text-[10px] font-black uppercase text-orange-500 tracking-widest">{q.marks} Marks</span>
                          </div>
                          <p className="text-lg font-black text-gray-900 dark:text-white leading-tight">{q.question_text || q.text}</p>
                        </div>
                      </div>

                      <div className="p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 space-y-3">
                         <div className="flex items-center gap-2">
                            <ShieldCheck className="w-3 h-3 text-green-500" />
                            <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Verified Pattern (Admin Only)</span>
                         </div>
                         <p className="text-sm font-bold text-green-600 dark:text-green-500 italic">Correct Answer: {q.correct_answer || 'Pattern not defined'}</p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {loading && (
                  <div className="flex flex-col items-center justify-center py-32 gap-6 opacity-30">
                     <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Streaming Metadata segment...</p>
                  </div>
                )}

                {questions.length === 0 && !loading && (
                  <div className="text-center py-40 animate-in fade-in zoom-in-95">
                    <div className="w-20 h-20 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                       <AlertCircle className="w-10 h-10" />
                    </div>
                    <p className="text-gray-400 font-black italic text-lg uppercase tracking-tight">Curriculum Segment is Vacant.</p>
                  </div>
                )}
              </div>
           </div>
        </aside>
      </div>
    </div>
  );
};

export default ManageQuestions;
