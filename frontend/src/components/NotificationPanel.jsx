import React from 'react';
import { Bell, X, Check, Trash2, Clock, Zap, ClipboardCheck, AlertCircle } from 'lucide-react';

const NotificationPanel = ({ notifications, onClose, onMarkRead, onClearAll, loading }) => {
  const getIcon = (type) => {
    switch (type) {
      case 'EXAM_PUBLISHED': return { icon: Zap, color: 'text-orange-500', bg: 'bg-orange-50' };
      case 'RESULT_AVAILABLE': return { icon: ClipboardCheck, color: 'text-emerald-500', bg: 'bg-emerald-50' };
      default: return { icon: AlertCircle, color: 'text-blue-500', bg: 'bg-blue-50' };
    }
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="absolute top-full right-0 mt-4 w-[420px] bg-white border border-gray-100 rounded-[2.5rem] shadow-[0_32px_128px_-16px_rgba(0,0,0,0.15)] overflow-hidden z-[100] animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-white">
        <div>
           <h3 className="text-xl font-black text-gray-900 leading-none mb-2">NOTIFICATIONS</h3>
           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Digital Event Ledger</p>
        </div>
        <div className="flex gap-2">
          <button onClick={onClearAll} className="p-2 hover:bg-rose-50 text-gray-400 hover:text-rose-500 rounded-xl transition-all" title="Clear All">
            <Trash2 className="w-5 h-5" />
          </button>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 text-gray-400 rounded-xl transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="max-h-[500px] overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-4">
             <div className="w-8 h-8 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin"></div>
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest animate-pulse">Synchronizing Terminal...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center">
             <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center mb-6">
                <Bell className="w-8 h-8 text-gray-200" />
             </div>
             <p className="text-gray-400 font-bold italic">No intelligence packets found.</p>
          </div>
        ) : (
          notifications.map((n) => {
            const { icon: TypeIcon, color, bg } = getIcon(n.type);
            return (
              <div 
                key={n.id} 
                className={`relative p-6 rounded-[2rem] border transition-all group ${n.is_read ? 'bg-white border-gray-50 grayscale opacity-60' : 'bg-gray-50 border-gray-100 shadow-sm hover:border-orange-200 hover:bg-white'}`}
              >
                <div className="flex gap-5">
                  <div className={`w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center ${bg} ${color}`}>
                    <TypeIcon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm leading-relaxed mb-3 ${n.is_read ? 'text-gray-500 font-medium' : 'text-gray-900 font-bold'}`}>
                      {n.message}
                    </p>
                    <div className="flex items-center justify-between">
                       <span className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                          <Clock className="w-3.5 h-3.5" />
                          {formatTime(n.created_at)}
                       </span>
                       {!n.is_read && (
                         <button 
                           onClick={() => onMarkRead(n.id)}
                           className="opacity-0 group-hover:opacity-100 flex items-center gap-1.5 py-1.5 px-3 bg-emerald-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all hover:bg-emerald-600"
                         >
                           <Check className="w-3.5 h-3.5" /> Read
                         </button>
                       )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {notifications.length > 0 && (
         <div className="p-6 border-t border-gray-50 bg-gray-50/30">
            <button onClick={() => onMarkRead()} className="w-full py-4 bg-gray-900 text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] hover:bg-black transition-all shadow-xl active:scale-95">
               MARK ALL AS RECTIFIED
            </button>
         </div>
      )}
    </div>
  );
};

export default NotificationPanel;
