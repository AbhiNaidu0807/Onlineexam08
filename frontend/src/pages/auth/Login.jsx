import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import api from '../../services/api';
import { Mail, Lock, ArrowRight, AlertCircle, ShieldCheck, Zap, Globe } from 'lucide-react';
import Logo from '../../components/Logo';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/auth/login', { email, password });
      login(response.user, response.token);
    } catch (err) {
      if (err.isNetworkError) {
        setError('Master Server is waking up. Please wait 30-40 seconds and try again.');
      } else {
        setError(err.error || err.message || 'Invalid credentials');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 lg:p-12 relative overflow-hidden font-sans selection:bg-orange-500 selection:text-white">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-500/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] animate-pulse [animation-delay:2s]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-[0.03]" 
             style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      </div>

      <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-12 items-center relative z-10">
        {/* Branding Section */}
        <div className="hidden lg:flex flex-col justify-center space-y-12">
          <div className="space-y-6">
            <div className="inline-block p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] shadow-2xl animate-float">
               <Logo size={120} />
            </div>
            <h1 className="text-8xl font-black text-white italic tracking-tighter leading-none">
              EAGLE<span className="text-orange-500 not-italic">EXAM</span>
            </h1>
            <p className="text-gray-400 text-xl font-medium max-w-md leading-relaxed">
              The next generation of institutional assessment technology. Secure, synced, and production-ready.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6">
             {[
               { icon: ShieldCheck, label: 'ENCRYPTED SYNC', color: 'text-emerald-500' },
               { icon: Zap, label: 'ZERO LATENCY', color: 'text-orange-500' },
               { icon: Globe, label: 'GLOBAL ACCESS', color: 'text-blue-500' },
               { icon: Lock, label: 'SECURE PORTAL', color: 'text-purple-500' }
             ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 bg-white/5 p-4 rounded-3xl border border-white/5 transition-all hover:bg-white/10 hover:border-white/20 group">
                   <item.icon className={`w-6 h-6 ${item.color} group-hover:scale-110 transition-transform`} />
                   <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">{item.label}</span>
                </div>
             ))}
          </div>
        </div>

        {/* Login Form Section */}
        <div className="w-full max-w-md mx-auto">
          <div className="bg-white/[0.03] backdrop-blur-3xl p-10 lg:p-14 rounded-[4rem] border border-white/10 shadow-[0_32px_128px_-16px_rgba(0,0,0,0.5)]">
            <div className="lg:hidden text-center mb-10">
               <Logo size={80} className="mx-auto mb-6" />
               <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Login Portal</h2>
            </div>
            
            <div className="mb-10 hidden lg:block">
               <h2 className="text-4xl font-black text-white italic tracking-tight mb-2 uppercase">Authorise</h2>
               <p className="text-gray-500 font-bold uppercase tracking-[0.3em] text-[10px]">Institutional Credentials Required</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {error && (
                <div className="flex items-center gap-3 p-5 bg-rose-500/10 text-rose-500 rounded-3xl border border-rose-500/20 text-xs font-black uppercase tracking-wider animate-in fade-in slide-in-from-top-2">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span>Error: {error}</span>
                </div>
              )}

              <div className="group space-y-3">
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] pl-2 group-focus-within:text-orange-500 transition-colors">Identification</label>
                <div className="relative">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    type="email"
                    required
                    className="w-full bg-white/5 border-2 border-white/5 rounded-3xl py-5 pl-16 pr-6 text-white font-bold placeholder:text-gray-600 outline-none focus:border-orange-500 focus:bg-white/10 transition-all text-lg"
                    placeholder="E-mail Identity"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="group space-y-3">
                <div className="flex justify-between items-center px-2">
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] group-focus-within:text-orange-500 transition-colors">Passcode</label>
                  <Link to="#" className="text-[10px] text-orange-500 hover:text-orange-300 font-black uppercase tracking-widest transition-colors">Recover Keys?</Link>
                </div>
                <div className="relative">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type="password"
                    required
                    className="w-full bg-white/5 border-2 border-white/5 rounded-3xl py-5 pl-16 pr-6 text-white font-bold placeholder:text-gray-600 outline-none focus:border-orange-500 focus:bg-white/10 transition-all text-lg"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group relative w-full overflow-hidden rounded-3xl p-[2px] transition-all hover:scale-[1.02] active:scale-95 shadow-2xl shadow-orange-500/20 disabled:opacity-50"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-600 animate-spin-slow duration-[3000ms]"></div>
                <div className="relative bg-[#050505] rounded-[calc(1.5rem-2px)] py-5 text-white font-black text-sm uppercase tracking-[0.4em] flex items-center justify-center gap-4 group-hover:bg-transparent transition-colors">
                  {loading ? (
                    <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>Initialise Session</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                    </>
                  )}
                </div>
              </button>
            </form>

            <div className="mt-12 text-center space-y-6">
              <p className="text-sm text-gray-500 font-bold uppercase tracking-widest">
                New Identity?{' '}
                <Link to="/register" className="text-white hover:text-orange-500 transition-colors underline decoration-orange-500 decoration-2 underline-offset-8">
                   Create Portal
                </Link>
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                 <button onClick={() => { setEmail('admin@quizapp.com'); setPassword('Admin@123'); }} 
                         className="py-3 px-4 bg-white/5 rounded-2xl border border-white/5 text-[9px] font-black uppercase tracking-widest text-emerald-500 hover:bg-emerald-500/10 hover:border-emerald-500/20 transition-all">
                    DEMO ADMIN
                 </button>
                 <button onClick={() => { setEmail('alice@student.com'); setPassword('Alice@123'); }}
                         className="py-3 px-4 bg-white/5 rounded-2xl border border-white/5 text-[9px] font-black uppercase tracking-widest text-blue-500 hover:bg-blue-500/10 hover:border-blue-500/20 transition-all">
                    DEMO STUDENT
                 </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
