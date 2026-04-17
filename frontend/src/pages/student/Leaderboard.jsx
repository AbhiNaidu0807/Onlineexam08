import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/authContext';
import { 
  Trophy, 
  Target, 
  TrendingUp, 
  ArrowLeft, 
  Crown, 
  Medal, 
  Zap,
  BarChart4,
  LayoutDashboard,
  Clock
} from 'lucide-react';

const Leaderboard = () => {
  const { examId } = useParams();
  const { user } = useAuth();
  const [exam, setExam] = useState(null);
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const examRes = await api.get(`/exams/${examId}`);
        setExam(examRes);

        const rankRes = await api.get(`/leaderboard/${examId}`);
        setRankings(rankRes || []);
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [examId]);

  if (loading) return (
     <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest">Compiling Rankings...</p>
     </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-fade-in pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
             <span className="bg-gray-900 dark:bg-orange-500 text-white px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest">Global Standings</span>
             <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
          </div>
          <h1 className="text-4xl font-bold font-display text-gray-900 dark:text-white tracking-tight">Exam <span className="text-orange-500">Leaderboard</span></h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Top performers for {exam?.title || 'Certification Matrix'}.</p>
        </div>

        <Link to="/student" className="flex items-center gap-2 text-sm font-semibold text-gray-400 hover:text-orange-500 transition-colors group">
           <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Return to Dashboard
        </Link>
      </header>

      {/* Podium for Top 3 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end px-4">
         {/* Rank 2 */}
         <div className="bg-white dark:bg-gray-800/50 rounded-3xl p-8 border border-gray-100 dark:border-white/5 text-center space-y-4 order-2 md:order-1 h-fit transform hover:translate-y-[-5px] transition-transform shadow-sm">
            <div className="w-16 h-16 bg-gray-50 dark:bg-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-4 transform -rotate-6">
               <Medal className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Vanguard</p>
            <h3 className="text-xl font-bold font-display text-gray-900 dark:text-white">{rankings[1]?.user_name || '---'}</h3>
            <p className="text-3xl font-bold font-display text-gray-400 italic">{rankings[1]?.score || 0}%</p>
         </div>

         {/* Rank 1 */}
         <div className="bg-gray-900 dark:bg-orange-600 rounded-[2.5rem] p-12 border-b-8 border-orange-500 dark:border-orange-400 text-center space-y-6 order-1 md:order-2 shadow-2xl shadow-orange-100 dark:shadow-none relative">
            <div className="absolute -top-8 left-1/2 -translate-x-1/2">
               <Crown className="w-16 h-16 text-orange-500 dark:text-white drop-shadow-xl animate-bounce" />
            </div>
            <div className="w-24 h-24 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center mx-auto mb-6 border border-white/10 transform rotate-6">
               <Trophy className="w-12 h-12 text-orange-500 dark:text-white" />
            </div>
            <p className="text-[10px] font-bold text-orange-200 uppercase tracking-widest">Supreme Leader</p>
            <h3 className="text-2xl font-bold font-display text-white">{rankings[0]?.user_name || '---'}</h3>
            <p className="text-6xl font-bold font-display text-orange-500 dark:text-white tracking-tight italic">{rankings[0]?.score || 0}%</p>
         </div>

         {/* Rank 3 */}
         <div className="bg-white dark:bg-gray-800/50 rounded-3xl p-8 border border-gray-100 dark:border-white/5 text-center space-y-4 order-3 h-fit transform hover:translate-y-[-5px] transition-transform shadow-sm">
            <div className="w-16 h-16 bg-orange-50 dark:bg-orange-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 transform rotate-6">
               <Medal className="w-8 h-8 text-orange-400" />
            </div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Sentinel</p>
            <h3 className="text-xl font-bold font-display text-gray-900 dark:text-white">{rankings[2]?.user_name || '---'}</h3>
            <p className="text-3xl font-bold font-display text-orange-300 italic">{rankings[2]?.score || 0}%</p>
         </div>
      </div>

      {/* Full Rankings Table */}
      <div className="bg-white dark:bg-gray-800/50 rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden mx-4">
         <div className="px-8 py-6 bg-gray-50/50 dark:bg-white/5 border-b border-gray-100 dark:border-white/5 flex justify-between items-center">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
               <BarChart4 className="w-4 h-4" /> Full Rankings
            </h3>
            <div className="text-[10px] font-bold text-orange-500 uppercase tracking-widest">Live Sync</div>
         </div>
         
         <div className="divide-y divide-gray-50 dark:divide-white/5">
            {rankings.map((rank, i) => (
              <div key={rank.id} className={`px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-6 transition-colors group ${rank.user_id?.toString() === user?.id?.toString() ? 'bg-orange-50/50 dark:bg-orange-500/10' : 'hover:bg-gray-50/50 dark:hover:bg-white/5'}`}>
                 <div className="flex items-center gap-8">
                    <span className={`text-2xl font-bold font-display tracking-tight ${i < 3 ? 'text-orange-500' : 'text-gray-300 dark:text-gray-600'}`}>{ (i+1).toString().padStart(2, '0') }</span>
                    <div>
                        <div className="flex items-center gap-3">
                          <p className={`text-lg font-bold font-display ${rank.user_id?.toString() === user?.id?.toString() ? 'text-orange-600' : 'text-gray-900 dark:text-gray-100'}`}>
                              {rank.user_name}
                          </p>
                          {i === 0 && <Crown className="w-4 h-4 text-orange-500" />}
                          {rank.user_id?.toString() === user?.id?.toString() && <span className="bg-orange-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded">YOU</span>}
                        </div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Rank ID: #{rank.id}</p>
                    </div>
                 </div>

                 <div className="flex items-center gap-10">
                     <div className="text-right">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Time</p>
                        <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">{rank.time_taken ? `${Math.floor(rank.time_taken/60)}m ${rank.time_taken%60}s` : 'N/A'}</p>
                     </div>
                     <div className="text-right">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Final Score</p>
                        <p className="text-2xl font-bold font-display text-gray-900 dark:text-white tracking-tight">{rank.score}%</p>
                     </div>
                 </div>
              </div>
            ))}
            {rankings.length === 0 && (
              <div className="py-20 text-center">
                 <p className="text-gray-400 font-medium">No rankings available yet for this assessment.</p>
              </div>
            )}
         </div>
      </div>

      <div className="text-center pt-10">
         <Link to="/student" className="inline-flex items-center gap-2 px-8 py-3.5 bg-gray-900 dark:bg-orange-500 text-white rounded-xl font-bold text-sm shadow-xl hover:scale-105 transition-all">
            <LayoutDashboard className="w-5 h-5" /> Back to Dashboard
         </Link>
      </div>
    </div>
  );
};

export default Leaderboard;
