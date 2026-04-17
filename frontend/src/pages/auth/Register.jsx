import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import api from '../../services/api';
import { Mail, Lock, User, ArrowRight, AlertCircle, ShieldCheck, Fingerprint, Cpu, Network, GraduationCap } from 'lucide-react';
import Logo from '../../components/Logo';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/auth/register', formData);
      login(response.user, response.token);
    } catch (err) {
      setError(err.error || err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 lg:p-12 relative overflow-hidden font-sans selection:bg-orange-500 selection:text-white">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px] animate-pulse [animation-delay:2s]"></div>
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
              EAGLE<span className="text-orange-500 not-italic">JOIN</span>
            </h1>
            <p className="text-gray-400 text-xl font-bold max-w-md leading-relaxed uppercase tracking-tight">
               Integrate with the global assessment network. Construct your identity protocol.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6">
             {[
               { icon: Fingerprint, label: 'BIOMETRIC SYNC', color: 'text-emerald-500' },
               { icon: Cpu, label: 'NEURAL GRADING', color: 'text-orange-500' },
               { icon: Network, label: 'MESH PROTOCOL', color: 'text-blue-500' },
               { icon: ShieldCheck, label: 'ENCRYPTED LOG', color: 'text-purple-500' }
             ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 bg-white/5 p-4 rounded-3xl border border-white/5 transition-all hover:bg-white/10 hover:border-white/20 group">
                   <item.icon className={`w-6 h-6 ${item.color} group-hover:scale-110 transition-transform`} />
                   <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">{item.label}</span>
                </div>
             ))}
          </div>
        </div>

        {/* Register Form Section */}
        <div className="w-full max-w-lg mx-auto">
          <div className="bg-white/[0.02] backdrop-blur-3xl p-10 lg:p-14 rounded-[4rem] border border-white/10 shadow-[0_32px_128px_-16px_rgba(0,0,0,0.5)]">
            <div className="lg:hidden text-center mb-10">
               <Logo size={80} className="mx-auto mb-6" />
               <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic">Join Cluster</h2>
            </div>
            
            <div className="mb-10 hidden lg:block">
               <h2 className="text-4xl font-black text-white italic tracking-tight mb-2 uppercase">Integrate</h2>
               <p className="text-gray-500 font-bold uppercase tracking-[0.3em] text-[10px]">Define Academic Parameters</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="flex items-center gap-3 p-5 bg-rose-500/10 text-rose-500 rounded-3xl border border-rose-500/20 text-[9px] font-black uppercase tracking-widest animate-in fade-in slide-in-from-top-2">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span>CRITICAL ERROR: {error}</span>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-6">
                 <div className="group space-y-3">
                   <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] pl-2 group-focus-within:text-orange-500 transition-colors">Full Identity</label>
                   <div className="relative">
                     <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors">
                       <User className="w-5 h-5" />
                     </div>
                     <input
                       type="text"
                       required
                       className="w-full bg-white/5 border-2 border-white/5 rounded-3xl py-5 pl-16 pr-6 text-white font-bold placeholder:text-gray-600 outline-none focus:border-orange-500 focus:bg-white/10 transition-all text-sm"
                       placeholder="Legal Name"
                       value={formData.name}
                       onChange={(e) => setFormData({...formData, name: e.target.value})}
                     />
                   </div>
                 </div>

                 <div className="group space-y-3">
                   <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] pl-2 group-focus-within:text-orange-500 transition-colors">Communication</label>
                   <div className="relative">
                     <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors">
                       <Mail className="w-5 h-5" />
                     </div>
                     <input
                       type="email"
                       required
                       className="w-full bg-white/5 border-2 border-white/5 rounded-3xl py-5 pl-16 pr-6 text-white font-bold placeholder:text-gray-600 outline-none focus:border-orange-500 focus:bg-white/10 transition-all text-sm"
                       placeholder="E-mail Identity"
                       value={formData.email}
                       onChange={(e) => setFormData({...formData, email: e.target.value})}
                     />
                   </div>
                 </div>
              </div>

              <div className="group space-y-3">
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] pl-2 group-focus-within:text-orange-500 transition-colors">Security Passcode</label>
                <div className="relative">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type="password"
                    required
                    className="w-full bg-white/5 border-2 border-white/5 rounded-3xl py-5 pl-16 pr-6 text-white font-bold placeholder:text-gray-600 outline-none focus:border-orange-500 focus:bg-white/10 transition-all text-sm"
                    placeholder="Min. 6 Characters"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-4">
                 <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] pl-2">Designate Role</label>
                 <div className="grid grid-cols-2 gap-4">
                    {[
                      { id: 'student', icon: GraduationCap, label: 'Student', color: 'border-emerald-500 bg-emerald-500/10 text-emerald-500' },
                      { id: 'admin', icon: ShieldCheck, label: 'Admin', color: 'border-orange-500 bg-orange-500/10 text-orange-500' }
                    ].map((role) => (
                       <button
                         key={role.id}
                         type="button"
                         onClick={() => setFormData({...formData, role: role.id})}
                         className={`relative overflow-hidden group p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-3 ${formData.role === role.id ? role.color : 'border-white/5 bg-white/5 text-gray-500 opacity-40 grayscale'}`}
                       >
                          <role.icon className="w-7 h-7" />
                          <span className="text-[10px] font-black uppercase tracking-[0.2em]">{role.label}</span>
                          {formData.role === role.id && (
                             <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-current animate-ping"></div>
                          )}
                       </button>
                    ))}
                 </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group relative w-full overflow-hidden rounded-[2rem] p-[2px] transition-all hover:scale-[1.02] active:scale-95 shadow-2xl shadow-orange-500/20 disabled:opacity-50 pt-2"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-600 animate-spin-slow duration-[3000ms]"></div>
                <div className="relative bg-[#050505] rounded-[calc(2rem-2px)] py-5 text-white font-black text-[10px] uppercase tracking-[0.4em] flex items-center justify-center gap-4 group-hover:bg-transparent transition-colors">
                  {loading ? (
                    <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>Establish Account</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                    </>
                  )}
                </div>
              </button>
            </form>

            <div className="mt-12 text-center text-sm text-gray-500 font-bold uppercase tracking-widest leading-loose">
               Legacy Member?{' '}
               <Link to="/login" className="text-white hover:text-orange-500 transition-colors underline decoration-orange-500 decoration-2 underline-offset-8">
                  Authorise Fragment
               </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
