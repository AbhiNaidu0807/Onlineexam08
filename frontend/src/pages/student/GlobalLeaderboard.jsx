import React, { useState, useEffect } from 'react';
import { Trophy, Crown, Medal, TrendingUp, Search, Filter, ArrowRight, Star, ChevronDown, Rocket } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/authContext';
import { useExams } from '../../hooks/useExams';

const GlobalLeaderboard = () => {
  const { user } = useAuth();
  const { activeExams } = useExams();
  const [selectedExamId, setSelectedExamId] = useState('');
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeExams.length > 0 && !selectedExamId) {
      setSelectedExamId(activeExams[0].id);
    }
  }, [activeExams]);

  useEffect(() => {
    const fetchRankings = async () => {
      if (!selectedExamId) return;
      try {
        setLoading(true);
        const res = await api.get(`/leaderboard/${selectedExamId}`);
        setRankings(res || []);
      } catch (err) {
        console.error('Error fetching rankings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRankings();
  }, [selectedExamId]);

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-fade-in pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 px-4">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="bg-orange-500 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-orange-100 dark:shadow-none">Global Arena</span>
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#22c55e]"></span>
          </div>
          <h1 className="text-5xl font-black font-display text-gray-900 dark:text-white tracking-tighter">THE <span className="text-orange-500">LEADERBOARD</span></h1>
          <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Cross-institutional Proficiency Matrix</p>
        </div>

        <div className="w-full md:w-72 relative group">
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-500 pointer-events-none group-hover:scale-110 transition-transform" />
          <select 
            value={selectedExamId}
            onChange={(e) => setSelectedExamId(e.target.value)}
            className="w-full appearance-none bg-white dark:bg-gray-900 border-2 border-orange-50 dark:border-white/5 rounded-2xl px-6 py-4 text-sm font-black uppercase tracking-widest text-gray-700 dark:text-gray-300 focus:border-orange-500 transition-all shadow-xl shadow-orange-50/50 dark:shadow-none outline-none"
          >
            <option value="">Select Examination</option>
            {activeExams.map(exam => (
              <option key={exam.id} value={exam.id}>{exam.title}</option>
            ))}
          </select>
        </div>
      </header>

      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-6"></div>
          <p className="text-sm font-black text-gray-400 uppercase tracking-[0.3em]">Synchronizing Standings...</p>
        </div>
      ) : rankings.length > 0 ? (
        <>
          {/* Top 3 Podium Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end px-4">
            {/* 2nd Place */}
            <div className="bg-white dark:bg-gray-800/50 rounded-[2.5rem] p-8 border border-gray-100 dark:border-white/5 text-center space-y-4 order-2 md:order-1 relative group hover:scale-[1.02] transition-all shadow-lg hover:shadow-2xl">
              <div className="w-20 h-20 bg-gray-50 dark:bg-gray-700 rounded-3xl flex items-center justify-center mx-auto mb-4 border-2 border-white dark:border-gray-600 shadow-inner group-hover:-rotate-12 transition-transform">
                <Medal className="w-10 h-10 text-slate-400" />
              </div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Silver Tier</p>
              <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase">{rankings[1]?.user_name || 'N/A'}</h3>
              <p className="text-4xl font-black text-orange-400 italic font-display">{rankings[1]?.score || 0}<span className="text-xs opacity-50">%</span></p>
            </div>

            {/* 1st Place */}
            <div className="bg-gray-900 dark:bg-orange-600 rounded-[3rem] p-12 border-b-8 border-orange-500 dark:border-orange-400 text-center space-y-6 order-1 md:order-2 shadow-2xl relative overflow-hidden group hover:scale-105 transition-all">
               <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform">
                  <Star className="w-32 h-32 text-white" />
               </div>
               <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                  <Crown className="w-16 h-16 text-orange-500 dark:text-white drop-shadow-2xl animate-bounce" />
               </div>
               <div className="w-24 h-24 bg-white/10 backdrop-blur-md rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-white/20 shadow-xl group-hover:rotate-12 transition-transform">
                  <Trophy className="w-12 h-12 text-orange-500 dark:text-white" />
               </div>
               <p className="text-[10px] font-black text-orange-200 uppercase tracking-[0.5em]">Supreme Ranking</p>
               <h3 className="text-2xl font-black text-white uppercase tracking-tight">{rankings[0]?.user_name || 'N/A'}</h3>
               <p className="text-7xl font-black text-orange-500 dark:text-white italic tracking-tighter drop-shadow-2xl">{rankings[0]?.score || 0}%</p>
            </div>

            {/* 3rd Place */}
            <div className="bg-white dark:bg-gray-800/50 rounded-[2.5rem] p-8 border border-gray-100 dark:border-white/5 text-center space-y-4 order-3 relative group hover:scale-[1.02] transition-all shadow-lg hover:shadow-2xl">
              <div className="w-20 h-20 bg-orange-50 dark:bg-orange-500/10 rounded-3xl flex items-center justify-center mx-auto mb-4 border-2 border-white dark:border-gray-600 shadow-inner group-hover:rotate-12 transition-transform">
                <Medal className="w-10 h-10 text-orange-300" />
              </div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Bronze Tier</p>
              <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase">{rankings[2]?.user_name || 'N/A'}</h3>
              <p className="text-4xl font-black text-orange-300 italic font-display">{rankings[2]?.score || 0}<span className="text-xs opacity-50">%</span></p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900/50 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-2xl shadow-orange-100 dark:shadow-none overflow-hidden mx-4">
            <div className="px-10 py-8 border-b border-gray-50 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-orange-500 text-white rounded-xl flex items-center justify-center">
                     <Filter className="w-5 h-5" />
                  </div>
                  <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em]">Full Professional Standings</h3>
               </div>
               <div className="flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-500/10 rounded-full border border-green-100 dark:border-green-500/20">
                  <Rocket className="w-4 h-4 text-green-500" />
                  <span className="text-[10px] font-black text-green-600 uppercase tracking-widest">Real-time AWS Sync</span>
               </div>
            </div>

            <div className="divide-y divide-gray-50 dark:divide-white/5">
              {rankings.map((rank, i) => (
                <div key={rank.id} className={`px-10 py-8 flex flex-col md:flex-row items-center justify-between gap-8 transition-all group ${rank.user_id?.toString() === user?.id?.toString() ? 'bg-orange-50/50 dark:bg-orange-500/10' : 'hover:bg-gray-50/20'}`}>
                  <div className="flex items-center gap-10">
                    <span className={`text-4xl font-black font-display italic transition-all ${i < 3 ? 'text-orange-500' : 'text-gray-200 dark:text-gray-700 group-hover:text-gray-400'}`}>
                      {(i + 1).toString().padStart(2, '0')}
                    </span>
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <p className={`text-xl font-black uppercase tracking-tight ${rank.user_id?.toString() === user?.id?.toString() ? 'text-orange-600' : 'text-gray-900 dark:text-white'}`}>
                          {rank.user_name}
                        </p>
                        {rank.user_id?.toString() === user?.id?.toString() && (
                          <span className="bg-orange-600 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter shadow-lg shadow-orange-200">YOU</span>
                        )}
                        {i === 0 && <Star className="w-4 h-4 text-orange-500 animate-spin-slow" />}
                      </div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                        <TrendingUp className="w-3 h-3 text-green-500" /> Improvement Vector Active
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-12 text-center md:text-right">
                    <div className="space-y-1">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none">Proficiency</p>
                      <p className="text-3xl font-black font-display text-gray-900 dark:text-white tracking-widest">{rank.score}%</p>
                    </div>
                    <div className="space-y-1 hidden sm:block">
                       <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none">Execution Time</p>
                       <p className="text-sm font-black text-gray-600 dark:text-gray-400 uppercase tracking-widest">
                          {rank.time_taken ? `${Math.floor(rank.time_taken/60)}m ${rank.time_taken%60}s` : 'N/A'}
                       </p>
                    </div>
                    <div className="w-12 h-12 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                       <ArrowRight className="w-5 h-5 text-gray-300" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="py-32 text-center space-y-6">
           <div className="w-24 h-24 bg-gray-50 dark:bg-gray-800 rounded-[2rem] flex items-center justify-center mx-auto border-2 border-dashed border-gray-200 dark:border-white/10 opacity-50">
              <Trophy className="w-10 h-10 text-gray-300" />
           </div>
           <div>
              <p className="text-xl font-black text-gray-300 uppercase tracking-widest">Zero Data Integrity Found</p>
              <p className="text-sm font-bold text-gray-400 mt-2 italic px-4">Initial rankings require at least one finalized assessment fragment.</p>
           </div>
        </div>
      )}
    </div>
  );
};

export default GlobalLeaderboard;
