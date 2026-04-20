import React, { useMemo, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import { useExams } from '../../hooks/useExams';
import { 
  BookOpen, 
  ClipboardCheck, 
  Award, 
  Trophy, 
  Search,
  Filter,
  Eye,
  FileText,
  CheckCircle,
  XCircle
} from 'lucide-react';

const DashboardStat = ({ title, value, icon: Icon }) => (
  <div className="bg-white p-6 border border-[#e0e0e0] flex items-center gap-6">
    <div className="w-12 h-12 bg-[#f5f5f5] text-[#1a237e] flex items-center justify-center">
      <Icon size={24} />
    </div>
    <div>
      <p className="text-[12px] font-bold text-gray-500 uppercase tracking-tight mb-1">{title}</p>
      <p className="text-2xl font-bold text-[#1a237e]">{value}</p>
    </div>
  </div>
);

const StudentDashboard = () => {
  const { user } = useAuth();
  const { submissions, getStudentStats, refreshData } = useExams();
  const [filter, setFilter] = useState("ALL");
  const navigate = useNavigate();
  
  useEffect(() => {
    refreshData();
  }, []);

  const stats = useMemo(() => getStudentStats(user?.id), [user?.id, submissions]);

  const filteredSubmissions = useMemo(() => {
    return submissions.filter(sub => {
      if (filter === "PASSED") return sub.score >= 60;
      if (filter === "FAILED") return sub.score < 60;
      return true;
    });
  }, [submissions, filter]);

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-fade-in font-serif">
      {/* Page Header */}
      <div className="border-b border-[#e0e0e0] pb-6">
        <h1 className="text-[22px] font-bold text-[#1a237e] mb-1">Standardized Examination Dashboard</h1>
        <p className="text-[#37474f] text-[14px]">Official Portal for Candidate Performance Tracking and Academic Assessment Management.</p>
      </div>

      {/* System Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardStat 
          title="Total Exams Attempted" 
          value={stats.completed} 
          icon={ClipboardCheck} 
        />
        <DashboardStat 
          title="Average Score" 
          value={`${stats.avgScore}%`} 
          icon={Award} 
        />
        <DashboardStat 
          title="Highest Score" 
          value={`${Math.max(...submissions.map(s => s.score), 0)}%`} 
          icon={Trophy} 
        />
        <DashboardStat 
          title="System Status" 
          value="Active" 
          icon={BookOpen} 
        />
      </div>

      {/* Exam History Section */}
      <div className="bg-white border border-[#e0e0e0] shadow-sm overflow-hidden">
        <div className="p-6 border-b border-[#e0e0e0] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-[18px] font-bold text-[#1a237e]">Official Exam History</h2>
          
          <div className="flex gap-2">
            {["ALL", "PASSED", "FAILED"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 text-[12px] font-bold border transition-colors ${
                  filter === f 
                  ? "bg-[#1a237e] text-white border-[#1a237e]" 
                  : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f5f5f5]">
                <th className="px-6 py-4 text-[14px] font-bold text-[#37474f] border-b-2 border-[#e0e0e0]">Exam Name</th>
                <th className="px-6 py-4 text-[14px] font-bold text-[#37474f] border-b-2 border-[#e0e0e0]">Date</th>
                <th className="px-6 py-4 text-[14px] font-bold text-[#37474f] border-b-2 border-[#e0e0e0]">Score</th>
                <th className="px-6 py-4 text-[14px] font-bold text-[#37474f] border-b-2 border-[#e0e0e0]">Status</th>
                <th className="px-6 py-4 text-[14px] font-bold text-[#37474f] border-b-2 border-[#e0e0e0]">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e0e0e0]">
              {filteredSubmissions.length > 0 ? (
                filteredSubmissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 text-[14px] font-bold text-[#1a237e]">{sub.title || 'General Assessment'}</td>
                    <td className="px-6 py-4 text-[14px] text-gray-600 font-normal">
                      {sub.submit_time ? new Date(sub.submit_time).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-[14px] font-bold text-gray-900">{sub.score}%</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold rounded-full ${
                        sub.score >= 60 
                        ? 'bg-green-50 text-green-700' 
                        : 'bg-red-50 text-red-700'
                      }`}>
                        {sub.score >= 60 ? <CheckCircle size={12} /> : <XCircle size={12} />}
                        {sub.score >= 60 ? 'PASSED' : 'FAILED'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => navigate(`/student/result/${sub.id}`)}
                        className="flex items-center gap-2 text-[#1a237e] hover:underline font-bold text-[14px]"
                      >
                        <Eye size={16} /> View Statement
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-16 text-center text-gray-400 italic">
                    <FileText className="mx-auto mb-2 opacity-50" size={32} />
                    No examination records match the current filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Action */}
      <div className="flex justify-center pt-8">
        <Link to="/student/exams" className="bg-[#1a237e] text-white px-10 py-3 rounded-[4px] font-bold text-[14px] shadow-md hover:bg-[#0d1440] transition-colors inline-flex items-center gap-3">
          <BookOpen size={18} /> Proceed to Examination Center
        </Link>
      </div>
    </div>
  );
};

export default StudentDashboard;
