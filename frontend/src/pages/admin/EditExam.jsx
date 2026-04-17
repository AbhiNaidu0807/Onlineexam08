import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { 
  Calendar, 
  Clock, 
  Award, 
  Type, 
  CheckCircle2, 
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  Zap,
  BookOpen
} from 'lucide-react';

const EditExam = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    title: '',
    duration: 30,
    passing_score: 50,
    start_time: '',
    end_time: '',
    is_published: 0
  });

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const exam = await api.get(`/exams/${id}`);
        const format = (d) => d ? new Date(d).toISOString().slice(0, 16) : '';
        setFormData({
          title: exam.title || '',
          duration: exam.duration || 30,
          passing_score: exam.passing_score || 50,
          start_time: format(exam.start_time),
          end_time: format(exam.end_time),
          is_published: exam.is_published || 0
        });
      } catch (error) {
        setErrors({ global: "Failed to retrieve assessment data." });
      } finally {
        setLoading(false);
      }
    };
    fetchExam();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (checked ? 1 : 0) : value
    }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
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
    
    setSaving(true);
    try {
      await api.put(`/exams/${id}`, formData);
      navigate('/admin');
    } catch (error) {
      setErrors({ global: error?.response?.data?.message || 'Update synchronization failed.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 px-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
             <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">Administrative Control</span>
             <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          </div>
          <h1 className="text-5xl font-black text-gray-900 dark:text-white tracking-tight">Modify <span className="text-orange-500 underline decoration-green-500 decoration-4 underline-offset-8 italic">Assessment</span></h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium text-lg">Update credentials and availability for {formData.title}.</p>
        </div>
        
        <Link to="/admin" className="flex items-center gap-2 text-xs font-black text-gray-400 hover:text-orange-500 uppercase tracking-widest group transition-colors">
           <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Control Center
        </Link>
      </header>

      {errors.global && (
        <div className="mx-4 p-4 bg-red-50 text-red-600 rounded-2xl font-bold flex items-center gap-3 animate-in slide-in-from-top">
           <Zap className="w-5 h-5" /> {errors.global}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8">
           <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-12 rounded-[3rem] shadow-2xl border border-gray-100 dark:border-gray-700 space-y-8">
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
                     placeholder="e.g. Advanced System Architecture"
                     value={formData.title}
                     onChange={handleChange}
                   />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex justify-between items-center pr-2">
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest pl-2">Time (Min)</label>
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
                <div className="space-y-4">
                  <div className="flex justify-between items-center pr-2">
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest pl-2">Pass (%)</label>
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
                <div className="space-y-4">
                  <div className="flex justify-between items-center pr-2">
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest pl-2">Cycle Start</label>
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
                <div className="space-y-4">
                  <div className="flex justify-between items-center pr-2">
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest pl-2">Cycle Expiry</label>
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

              <div className="pt-6 flex gap-6">
                <button 
                  type="submit" 
                  disabled={saving}
                  className="flex-grow bg-orange-500 disabled:bg-gray-600 text-white py-5 rounded-[2rem] font-black text-lg uppercase tracking-widest shadow-xl shadow-orange-200 hover:bg-orange-600 hover:-translate-y-1 transition-all active:scale-95 flex items-center justify-center gap-3"
                >
                   {saving ? (
                      <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                   ) : (
                      <>Apply Modifications <CheckCircle2 className="w-6 h-6" /></>
                   )}
                </button>
                <button type="button" onClick={() => navigate('/admin')} className="px-12 py-5 border-2 border-gray-100 dark:border-gray-800 rounded-[2rem] font-black text-sm uppercase tracking-widest text-gray-400 hover:text-gray-600 transition-all">
                  Discard
                </button>
              </div>
           </form>
        </div>

        <aside className="lg:col-span-4 space-y-8">
           <div className="bg-gradient-to-br from-green-500 to-green-600 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
              <Zap className="w-12 h-12 text-white/50 mb-6" />
              <h3 className="text-2xl font-black leading-tight mb-4 tracking-tighter uppercase font-black">Live Assessment Status</h3>
              <p className="text-green-50 text-sm font-medium mb-8 leading-relaxed">Once you synchronize these changes, all students currently in the session will see updated parameters upon their next lifecycle pulse.</p>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-4 py-2 bg-white/20 rounded-full w-fit">
                 <ShieldCheck className="w-4 h-4" /> Secure Protocol Active
              </div>
           </div>

           <div className="bg-white dark:bg-gray-800 p-10 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-sm space-y-6">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 px-2">
                <BookOpen className="w-4 h-4 text-orange-500" /> Global Integrity Rules
              </h3>
              <div className="space-y-4">
                 {[
                   'Duration must be > 0 minutes',
                   'Passing score cap: 100%',
                   'Expiry date > Start date',
                   'Title cannot be empty'
                 ].map((rule, i) => (
                   <div key={i} className="flex gap-4 group">
                      <div className="w-5 h-5 rounded-full bg-orange-50 dark:bg-orange-950/40 text-orange-500 flex items-center justify-center text-[10px] font-black shrink-0 group-hover:bg-orange-500 group-hover:text-white transition-colors">{i+1}</div>
                      <p className="text-sm font-bold text-gray-600 dark:text-gray-400 leading-snug">{rule}</p>
                   </div>
                 ))}
              </div>
           </div>
        </aside>
      </div>
    </div>
  );
};

export default EditExam;
