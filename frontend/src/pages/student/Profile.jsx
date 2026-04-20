import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/authContext';
import api from '../../services/api';
import { 
  User, 
  Mail, 
  Shield, 
  Edit3, 
  ShieldCheck, 
  Save, 
  Key, 
  Zap,
  Camera,
  Trash2,
  Lock,
  Loader2,
  CheckCircle2
} from 'lucide-react';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [preview, setPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  const [pwdData, setPwdData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);
  
  const getBaseDomain = () => {
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    return apiBase.replace(/\/api$/, '');
  };
  
  const baseUrl = getBaseDomain();

  useEffect(() => {
    if (msg.text) {
      const timer = setTimeout(() => setMsg({ text: '', type: '' }), 5000);
      return () => clearTimeout(timer);
    }
  }, [msg]);

  const validateAndSetFile = (file) => {
    if (file) {
      if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
        setMsg({ text: 'Error: Only JPG and PNG images are allowed.', type: 'error' });
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        setMsg({ text: 'Error: Image size exceeds 2MB limit.', type: 'error' });
        return;
      }
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = (e) => {
    validateAndSetFile(e.target.files[0]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 1. Upload Avatar if exists
      if (avatarFile) {
        const fileData = new FormData();
        fileData.append('avatar', avatarFile);
        const uploadRes = await api.post('/user/upload-avatar', fileData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        updateUser({ profile_photo: uploadRes.avatarUrl });
      }

      // 2. Update Profile Details
      const res = await api.put('/user/profile', formData);
      updateUser(res);
      setMsg({ text: 'Institutional identity updated successfully.', type: 'success' });
      setIsEditing(false);
      setAvatarFile(null);
      setPreview(null);
    } catch (err) {
      setMsg({ text: err.response?.data?.message || 'Failed to update profile.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwdData.newPassword !== pwdData.confirmPassword) {
      setMsg({ text: 'Passwords do not match.', type: 'error' });
      return;
    }
    setLoading(true);
    try {
      await api.put('/user/change-password', {
        currentPassword: pwdData.currentPassword,
        newPassword: pwdData.newPassword
      });
      setMsg({ text: 'Security credentials recalibrated successfully.', type: 'success' });
      setPwdData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setMsg({ text: err.response?.data?.message || 'Password update failed.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!window.confirm('Are you sure you want to remove your profile image?')) return;
    try {
      await api.delete('/user/avatar');
      updateUser({ profile_photo: null });
      setPreview(null);
      setMsg({ text: 'Profile image removed.', type: 'success' });
    } catch (err) {
      setMsg({ text: 'Failed to remove image.', type: 'error' });
    }
  };

  const profilePhotoUrl = preview || (user?.profile_photo ? (user.profile_photo.startsWith('http') ? user.profile_photo : `${baseUrl}${user.profile_photo}`) : null);

  return (
    <div className="max-w-5xl mx-auto py-12 px-4 font-serif selection:bg-orange-100" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
      {/* Alert Component */}
      {msg.text && (
        <div className={`fixed top-24 right-8 z-50 animate-bounce p-4 rounded-xl shadow-2xl flex items-center gap-3 border ${msg.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
          {msg.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <Zap className="w-5 h-5" />}
          <span className="font-bold uppercase tracking-widest text-[11px]">{msg.text}</span>
        </div>
      )}

      <header className="mb-12 text-center md:text-left">
        <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
           <span className="bg-gray-900 text-white px-3 py-1 rounded-sm text-[10px] font-bold uppercase tracking-[0.3em]">Institutional ID</span>
           <div className="h-0.5 w-12 bg-orange-500"></div>
        </div>
        <h1 className="text-6xl font-normal text-gray-900 dark:text-white italic tracking-tight">
           User <span className="text-orange-600">Profile</span>
        </h1>
        <p className="text-gray-500 uppercase tracking-widest text-[10px] mt-2 font-bold">Comprehensive management of academic credentials and biometric data.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-none shadow-[20px_20px_0px_0px_rgba(0,0,0,0.05)] border border-gray-100 dark:border-gray-700 p-8 text-center relative overflow-hidden">
             <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 -mr-12 -mt-12 rotate-45"></div>
             
             <div className="relative inline-block mb-4">
                <div 
                  className="w-48 h-48 mx-auto rounded-none border-2 border-gray-900 dark:border-gray-100 p-1 bg-white dark:bg-gray-900 overflow-hidden group cursor-pointer relative"
                  onClick={() => fileInputRef.current.click()}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  {profilePhotoUrl ? (
                    <img 
                      src={profilePhotoUrl} 
                      alt={user?.name} 
                      className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-gray-800 text-7xl font-bold text-gray-200 dark:text-gray-700 italic">
                      {user?.name?.charAt(0)}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Camera className="text-white w-10 h-10" />
                  </div>
                </div>

                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/jpeg,image/png" 
                  onChange={handleFileChange} 
                />

                {user?.profile_photo && !preview && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleRemoveAvatar(); }}
                    className="absolute -bottom-2 -left-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-2 text-red-500 hover:text-red-700 hover:scale-110 transition-all shadow-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
             </div>

             <button 
               onClick={() => fileInputRef.current.click()}
               className="mb-8 text-[11px] font-bold uppercase tracking-widest text-orange-600 hover:underline flex items-center gap-2 mx-auto"
             >
                <Camera className="w-4 h-4" /> Update Institutional Photo
             </button>

             <h2 className="text-2xl font-bold text-gray-900 dark:text-white italic mb-1">{user?.name}</h2>
             <div className="flex items-center justify-center gap-2 mb-6">
                <ShieldCheck className="w-4 h-4 text-orange-600" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-orange-600">{user?.role}</span>
             </div>

             <div className="space-y-4 pt-6 border-t border-gray-50 dark:border-gray-700">
                <div className="flex justify-between items-center text-[11px] font-bold uppercase tracking-widest text-gray-400">
                   <span>Status:</span>
                   <span className="text-emerald-600">Active</span>
                </div>
                <div className="flex justify-between items-center text-[11px] font-bold uppercase tracking-widest text-gray-400">
                   <span>System Access:</span>
                   <span className="text-gray-900 dark:text-gray-200">Verified</span>
                </div>
             </div>
          </div>
        </div>

        {/* Forms Area */}
        <div className="lg:col-span-2 space-y-12">
          {/* Edit Details */}
          <div className="bg-white dark:bg-gray-800 p-10 border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between mb-10">
               <h3 className="text-xl font-bold italic flex items-center gap-3">
                 <User className="w-5 h-5 text-orange-600" /> Identity Synchronization
               </h3>
               {!isEditing && (
                 <button 
                    onClick={() => setIsEditing(true)}
                    className="text-[11px] font-bold uppercase tracking-widest text-orange-600 hover:underline flex items-center gap-2"
                 >
                    <Edit3 className="w-4 h-4" /> Edit Profile
                 </button>
               )}
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Designated Name</label>
                  <input 
                    type="text"
                    disabled={!isEditing && !avatarFile}
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full border-b border-gray-200 dark:border-gray-700 bg-transparent py-3 focus:border-orange-600 outline-none transition-colors text-lg italic disabled:opacity-50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Communication Gateway (Email)</label>
                  <input 
                    type="email"
                    disabled={!isEditing && !avatarFile}
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full border-b border-gray-200 dark:border-gray-700 bg-transparent py-3 focus:border-orange-600 outline-none transition-colors text-lg italic disabled:opacity-50"
                  />
                </div>
              </div>

              {(isEditing || avatarFile) && (
                <div className="flex items-center gap-6 pt-4">
                  <button 
                    type="submit"
                    disabled={loading}
                    className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-8 py-3 text-[11px] font-bold uppercase tracking-[0.3em] flex items-center gap-3 hover:bg-orange-600 dark:hover:bg-orange-500 dark:hover:text-white transition-all disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Commit Changes
                  </button>
                  <button 
                    type="button"
                    onClick={() => { setIsEditing(false); setPreview(null); setAvatarFile(null); setFormData({ name: user.name, email: user.email }); }}
                    className="text-[11px] font-bold uppercase tracking-widest text-gray-400 hover:text-red-500"
                  >
                    Discard
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* Change Password */}
          <div className="bg-white dark:bg-gray-800 p-10 border border-gray-100 dark:border-gray-700 shadow-sm">
            <h3 className="text-xl font-bold italic flex items-center gap-3 mb-10">
              <Lock className="w-5 h-5 text-orange-600" /> Security Recalibration
            </h3>

            <form onSubmit={handleChangePassword} className="space-y-8">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Current Secret Manifest</label>
                <input 
                  type="password"
                  required
                  value={pwdData.currentPassword}
                  onChange={(e) => setPwdData({...pwdData, currentPassword: e.target.value})}
                  className="w-full border-b border-gray-200 dark:border-gray-700 bg-transparent py-3 focus:border-orange-600 outline-none transition-colors italic"
                  placeholder="********"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">New Identity Secret</label>
                  <input 
                    type="password"
                    required
                    value={pwdData.newPassword}
                    onChange={(e) => setPwdData({...pwdData, newPassword: e.target.value})}
                    className="w-full border-b border-gray-200 dark:border-gray-700 bg-transparent py-3 focus:border-orange-600 outline-none transition-colors italic"
                    placeholder="********"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Verify New Secret</label>
                  <input 
                    type="password"
                    required
                    value={pwdData.confirmPassword}
                    onChange={(e) => setPwdData({...pwdData, confirmPassword: e.target.value})}
                    className="w-full border-b border-gray-200 dark:border-gray-700 bg-transparent py-3 focus:border-orange-600 outline-none transition-colors italic"
                    placeholder="********"
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-8 py-3 text-[11px] font-bold uppercase tracking-[0.3em] flex items-center gap-3 hover:bg-orange-600 dark:hover:bg-orange-500 dark:hover:text-white transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
                Update Security Access
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
