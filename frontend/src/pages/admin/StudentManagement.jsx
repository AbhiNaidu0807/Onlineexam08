import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Users, Mail, Calendar, Search, Filter, MoreVertical, Database, LayoutDashboard } from 'lucide-react';

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const data = await api.get('/admin/students');
        setStudents(data || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExportCSV = () => {
    const headers = ["ID", "Name", "Email", "Enrolled Date", "Attempts"];
    const rows = filteredStudents.map(s => [s.id, s.name, s.email, s.created_at, s.attempt_count]);
    let csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "student_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const grantRetake = async (studentId, examId) => {
    try {
      await api.post('/admin/grant-retake', { user_id: studentId, exam_id: examId });
      alert('Retake permission granted successfully.');
    } catch (error) {
      alert('Failed to grant retake: ' + (error.message || 'Server Error'));
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-6">
      <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="font-black text-gray-400 uppercase tracking-widest text-xs">Synchronizing User Directory...</p>
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <header className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
             <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">User Directory</span>
             <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          </div>
          <h1 className="text-5xl font-black text-gray-900 dark:text-white tracking-tight">Student <span className="text-orange-500 underline decoration-green-500 decoration-4 underline-offset-8 italic">Management</span></h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Oversee academic enrollment and user performance logs.</p>
        </div>
        
        <div className="flex flex-col md:flex-row items-center gap-4 w-full xl:w-auto">
           <div className="relative group w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Lookup Name or Email..." 
                className="w-full pl-12 pr-6 py-4 rounded-2xl bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 focus:border-orange-500 outline-none font-bold transition-all shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
           <div className="flex gap-2 w-full md:w-auto">
              <button 
                onClick={handleExportCSV}
                className="flex-1 md:flex-none px-8 py-4 bg-orange-500 text-white font-black rounded-2xl shadow-xl shadow-orange-100 hover:bg-orange-600 transition-all flex items-center justify-center gap-2"
              >
                 <Database className="w-5 h-5" /> EXPORT DATA
              </button>
              <button className="p-4 bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-2xl hover:border-orange-500 transition-all shadow-sm">
                 <Filter className="w-6 h-6 text-gray-500" />
              </button>
           </div>
        </div>
      </header>

      <div className="bg-white dark:bg-gray-800 rounded-[3rem] border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm transition-all hover:shadow-22xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-50 dark:border-gray-700 bg-orange-50/20">
                <th className="px-10 py-6 text-xs font-black text-gray-400 uppercase tracking-widest leading-none">Identity Profile</th>
                <th className="px-10 py-6 text-xs font-black text-gray-400 uppercase tracking-widest leading-none">Activity Log</th>
                <th className="px-10 py-6 text-xs font-black text-gray-400 uppercase tracking-widest leading-none">Enrollment Cycle</th>
                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-orange-50/10 group transition-colors">
                  <td className="px-10 py-8">
                     <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-gradient-to-tr from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg transition-transform group-hover:scale-110">
                           {student.name?.charAt(0)}
                        </div>
                        <div>
                           <p className="font-black text-gray-900 dark:text-white text-lg leading-none mb-1">{student.name}</p>
                           <p className="text-sm text-gray-400 font-bold flex items-center gap-1.5"><Mail className="w-3 h-3" /> {student.email}</p>
                        </div>
                     </div>
                  </td>
                  <td className="px-10 py-8">
                     <div className="flex flex-col gap-1">
                        <span className="font-black text-gray-800 dark:text-gray-200 uppercase tracking-widest text-[10px]">{student.attempt_count} Assessments</span>
                        <div className="flex items-center gap-2">
                           <div className="w-20 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div className="h-full bg-orange-500" style={{ width: `${Math.min(student.attempt_count * 20, 100)}%` }}></div>
                           </div>
                        </div>
                     </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-3 text-gray-500">
                       <Calendar className="w-5 h-5 text-gray-400" />
                       <span className="text-sm font-black dark:text-gray-300">
                         {student.created_at ? new Date(student.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Jan 2026'}
                       </span>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                     <div className="flex items-center justify-end gap-3">
                        <button 
                          onClick={() => grantRetake(student.id, prompt("Enter Exam ID to grant retake permission:"))}
                          className="px-6 py-2.5 bg-orange-50 text-orange-600 dark:bg-orange-900/10 rounded-xl hover:bg-orange-500 hover:text-white font-black text-[10px] uppercase tracking-widest transition-all shadow-sm active:scale-95"
                        >
                           Grant Access
                        </button>
                        <button className="p-3 text-gray-400 hover:text-orange-500 bg-gray-50 dark:bg-gray-900 rounded-xl"><MoreVertical className="w-5 h-5" /></button>
                     </div>
                  </td>
                </tr>
              ))}
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-10 py-32 text-center">
                    <div className="w-20 h-20 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto text-gray-300 mb-6">
                       <Users className="w-10 h-10" />
                    </div>
                    <p className="text-gray-400 font-black italic text-lg uppercase tracking-tight italic">No student records matching your search query.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentManagement;
