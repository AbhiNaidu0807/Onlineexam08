import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useExams } from '../../hooks/useExams';
import { 
  Plus, 
  Calendar, 
  Clock, 
  Award, 
  Type, 
  CheckCircle2, 
  ArrowLeft,
  ChevronRight,
  Zap,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

const CreateExam = () => {
  const { createExam } = useExams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    title: '',
    duration: 30,
    passing_score: 50,
    start_time: '',
    end_time: '',
    is_published: 0
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (checked ? 1 : 0) : value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Exam title is required";
    if (formData.duration <= 0) newErrors.duration = "Duration must be positive";
    if (formData.passing_score < 0 || formData.passing_score > 100) newErrors.passing_score = "0-100 only";
    if (!formData.start_time) newErrors.start_time = "Start date required";
    if (!formData.end_time) newErrors.end_time = "End date required";
    if (formData.start_time && formData.end_time && new Date(formData.end_time) <= new Date(formData.start_time)) {
      newErrors.end_time = "End date must be after start date";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;

    setLoading(true);
    try {
      await createExam({
        ...formData,
        status: 'draft'
      });
      navigate('/admin');
    } catch (error) {
      setErrors({ global: error?.response?.data?.message || error?.message || 'Database sync failed.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 px-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
             <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">Assessment Architect</span>
             <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          </div>
          <h1 className="text-5xl font-black text-gray-900 dark:text-white tracking-tight">Create <span className="text-orange-500 underline decoration-green-500 decoration-4 underline-offset-8 italic">Certification</span></h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium text-lg">Initialize a new academic challenge for your candidates.</p>
        </div>
        
        <Link to="/admin" className="flex items-center gap-2 text-xs font-black text-gray-400 hover:text-orange-500 uppercase tracking-widest group transition-colors">
           <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Cancel Architect
        </Link>
      </header>

      {errors.global && (
        <div className="mx-4 p-4 bg-red-50 text-red-600 rounded-2xl font-bold flex items-center gap-3 animate-in slide-in-from-top">
           <Zap className="w-5 h-5" /> {errors.global}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8">
           <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-12 rounded-[3rem] shadow-2xl border border-gray-100 dark:border-gray-700 space-y-8 relative overflow-hidden">
              {/* Field: Title */}
              <div className="space-y-4">
                <div className="flex justify-between items-center pr-2">
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest pl-2">Display Title</label>
                  {errors.title && <span className="text-[10px] font-black text-red-500 uppercase">{errors.title}</span>}
                </div>
                <div className={`relative group ${errors.title ? 'ring-2 ring-red-500 rounded-3xl' : ''}`}>
                   <Type className={`absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${errors.title ? 'text-red-500' : 'text-gray-300 group-focus-within:text-orange-500'}`} />
                   <input
                     type="text"
                     name="title"
                     className="w-full pl-14 pr-8 py-5 rounded-3xl bg-gray-50 dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-800 focus:border-orange-500 outline-none text-lg font-black dark:text-white transition-all shadow-inner"
                     placeholder="e.g. Master React & Redux 2026"
                     value={formData.title}
                     onChange={handleChange}
                   />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                {/* Field: Duration */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center pr-2">
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest pl-2">Duration (Min)</label>
                    {errors.duration && <span className="text-[10px] font-black text-red-500 uppercase">{errors.duration}</span>}
                  </div>
                  <div className={`relative group ${errors.duration ? 'ring-2 ring-red-500 rounded-3xl' : ''}`}>
                     <Clock className={`absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${errors.duration ? 'text-red-500' : 'text-gray-300 group-focus-within:text-orange-500'}`} />
                     <input
                       type="number"
                       name="duration"
                       className="w-full pl-14 pr-8 py-5 rounded-3xl bg-gray-50 dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-800 focus:border-orange-500 outline-none text-lg font-black dark:text-white transition-all"
                       value={formData.duration}
                       onChange={handleChange}
                     />
                  </div>
                </div>
                {/* Field: Passing Score */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center pr-2">
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest pl-2">Pass Gate (%)</label>
                    {errors.passing_score && <span className="text-[10px] font-black text-red-500 uppercase">{errors.passing_score}</span>}
                  </div>
                  <div className={`relative group ${errors.passing_score ? 'ring-2 ring-red-500 rounded-3xl' : ''}`}>
                     <Award className={`absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${errors.passing_score ? 'text-red-500' : 'text-gray-300 group-focus-within:text-green-500'}`} />
                     <input
                       type="number"
                       name="passing_score"
                       className="w-full pl-14 pr-8 py-5 rounded-3xl bg-gray-50 dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-800 focus:border-green-500 outline-none text-lg font-black dark:text-white transition-all"
                       value={formData.passing_score}
                       onChange={handleChange}
                     />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                {/* Field: Start Time */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center pr-2">
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest pl-2">Deployment</label>
                    {errors.start_time && <span className="text-[10px] font-black text-red-500 uppercase">{errors.start_time}</span>}
                  </div>
                  <div className={`relative group ${errors.start_time ? 'ring-2 ring-red-500 rounded-3xl' : ''}`}>
                     <Calendar className={`absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${errors.start_time ? 'text-red-500' : 'text-gray-300 group-focus-within:text-orange-500'}`} />
                     <input
                       type="datetime-local"
                       name="start_time"
                       className="w-full pl-14 pr-8 py-5 rounded-3xl bg-gray-50 dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-800 focus:border-orange-500 outline-none text-sm font-black dark:text-white transition-all"
                       value={formData.start_time}
                       onChange={handleChange}
                     />
                  </div>
                </div>
                {/* Field: End Time */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center pr-2">
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest pl-2">Expiry</label>
                    {errors.end_time && <span className="text-[10px] font-black text-red-500 uppercase">{errors.end_time}</span>}
                  </div>
                  <div className={`relative group ${errors.end_time ? 'ring-2 ring-red-500 rounded-3xl' : ''}`}>
                     <Calendar className={`absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${errors.end_time ? 'text-red-500' : 'text-gray-300 group-focus-within:text-red-500'}`} />
                     <input
                       type="datetime-local"
                       name="end_time"
                       className="w-full pl-14 pr-8 py-5 rounded-3xl bg-gray-50 dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-800 focus:border-red-500 outline-none text-sm font-black dark:text-white transition-all"
                       value={formData.end_time}
                       onChange={handleChange}
                     />
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-orange-500 disabled:bg-gray-600 text-white py-6 rounded-[2rem] font-black text-xl uppercase tracking-widest shadow-2xl shadow-orange-200 hover:bg-orange-600 hover:-translate-y-1 transition-all active:scale-95 flex items-center justify-center gap-4 group"
                >
                   {loading ? (
                      <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                   ) : (
                      <>INITIALIZE ASSESSMENT <Plus className="w-8 h-8 group-hover:rotate-180 transition-transform duration-500" /></>
                   )}
                </button>
              </div>
           </form>
        </div>

        <aside className="lg:col-span-4 space-y-8">
           <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
              <div className="relative z-10">
                 <Sparkles className="w-12 h-12 text-white/50 mb-6" />
                 <h3 className="text-2xl font-black leading-tight mb-4 tracking-tighter uppercase font-black">Architecture Mode</h3>
                 <p className="text-orange-50 text-sm font-medium mb-8 leading-relaxed">You are now initializing the framework for a new evaluation. Once saved, you can add questions and define custom logic pipelines.</p>
                 <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-4 py-2 bg-white/20 rounded-full w-fit">
                    <ShieldCheck className="w-4 h-4" /> Ready for Deployment
                 </div>
              </div>
           </div>

           <div className="bg-white dark:bg-gray-800 p-10 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-sm space-y-6">
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest leading-none px-2 mb-2">Architectural Summary</p>
              <div className="space-y-6">
                 <div className="flex items-center gap-4">
                    <div className="w-3 h-3 rounded-full bg-orange-500 animate-pulse"></div>
                    <p className="text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-tighter">Draft status initialized</p>
                 </div>
                 <div className="flex items-center gap-4">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <p className="text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-tighter">Database channel verified</p>
                 </div>
              </div>
           </div>
        </aside>
      </div>
    </div>
  );
};

export default CreateExam;
