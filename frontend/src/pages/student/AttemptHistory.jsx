import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { 
  History, 
  Search, 
  ArrowRight, 
  CheckCircle, 
  XCircle, 
  Eye,
  FileText,
  Calendar,
  Award,
  BarChart4,
  Target
} from 'lucide-react';

const StatBox = ({ label, value, icon: Icon }) => (
  <div className="bg-white p-6 border border-[#e0e0e0] flex items-center gap-6">
    <div className="w-12 h-12 bg-[#f5f5f5] text-[#1a237e] flex items-center justify-center">
      <Icon size={24} />
    </div>
    <div>
      <p className="text-[12px] font-bold text-gray-500 uppercase tracking-tight mb-1">{label}</p>
      <p className="text-2xl font-bold text-[#1a237e]">{value}</p>
    </div>
  </div>
);

const AttemptHistory = () => {
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); 

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const data = await api.get('/attempts/my');
        setAttempts(data || []);
      } catch (error) {
        console.error('Data Sync Failure:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const stats = useMemo(() => {
    if (!attempts.length) return { total: 0, avg: 0, best: 0 };
    const total = attempts.length;
    const scores = attempts.map(a => a.score);
    const avg = scores.reduce((a, b) => a + b, 0) / total;
    const best = Math.max(...scores);
    return { total, avg: Math.round(avg), best };
  }, [attempts]);

  const filteredAttempts = useMemo(() => {
    if (filter === 'ALL') return attempts;
    return attempts.filter(att => {
      return filter === 'PASSED' ? att.score >= 60 : att.score < 60;
    });
  }, [attempts, filter]);

  if (loading) return (
    <div className="min-h-[400px] flex flex-col items-center justify-center font-serif">
       <div className="w-10 h-10 border-4 border-[#1a237e] border-t-transparent rounded-full animate-spin mb-4"></div>
       <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Accessing Master Records...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-fade-in font-serif">
      {/* Page Header */}
      <div className="border-b border-[#e0e0e0] pb-6">
        <h1 className="text-[22px] font-bold text-[#1a237e] mb-1">Official Examination Records</h1>
        <p className="text-[#37474f] text-[14px]">Comprehensive listing of all institutional assessment attempts and certification transcripts.</p>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <StatBox label="Total Exams Attempted" value={stats.total} icon={BarChart4} />
         <StatBox label="Average Proficiency" value={`${stats.avg}%`} icon={Award} />
         <StatBox label="Highest Grade" value={`${stats.best}%`} icon={Target} />
      </div>

      {/* Records Table */}
      <div className="bg-white border border-[#e0e0e0] shadow-sm">
        <div className="p-6 border-b border-[#e0e0e0] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-[18px] font-bold text-[#37474f]">Evaluation Transcript</h2>
          
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
                <th className="px-6 py-4 text-[14px] font-bold text-[#37474f] border-b-2 border-[#e0e0e0]">Exam Title</th>
                <th className="px-6 py-4 text-[14px] font-bold text-[#37474f] border-b-2 border-[#e0e0e0]">Date of Submission</th>
                <th className="px-6 py-4 text-[14px] font-bold text-[#37474f] border-b-2 border-[#e0e0e0]">Aggregate Score</th>
                <th className="px-6 py-4 text-[14px] font-bold text-[#37474f] border-b-2 border-[#e0e0e0]">Result Status</th>
                <th className="px-6 py-4 text-[14px] font-bold text-[#37474f] border-b-2 border-[#e0e0e0]">Statement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e0e0e0]">
              {filteredAttempts.length > 0 ? (
                filteredAttempts.map((att) => (
                  <tr key={att.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 text-[14px] font-bold text-[#1a237e]">{att.title || att.exam_title || 'General Assessment'}</td>
                    <td className="px-6 py-4 text-[14px] text-gray-600 font-normal">
                      {att.submit_time ? new Date(att.submit_time).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-[14px] font-bold text-gray-900">{att.score}%</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold rounded-sm border ${
                        att.score >= 60 
                        ? 'bg-green-50 text-green-700 border-green-200' 
                        : 'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        {att.score >= 60 ? 'PASS' : 'FAIL'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => navigate(`/student/result/${att.id}`)}
                        className="flex items-center gap-2 text-[#1a237e] hover:underline font-bold text-[14px]"
                      >
                         View Details
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-16 text-center text-gray-400 italic">
                    <FileText className="mx-auto mb-2 opacity-50" size={32} />
                    No examination records found for the selected criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-center pt-8">
         <p className="text-[12px] text-gray-400 italic">This is an electronically generated statement. No physical signature is required.</p>
      </div>
    </div>
  );
};

export default AttemptHistory;
