import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { X, Chrome, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { login, manualLogin, authModalMode } = useAuth();
  const [loginMethod, setLoginMethod] = useState<'manual' | 'google'>('manual');
  const [emailInput, setEmailInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await login();
      onClose();
    } catch (err: any) {
      if (err.message?.includes('auth/operation-not-allowed')) {
        setError('Google Sign-in is NOT enabled in your Firebase Project. To fix this: 1. Go to Firebase Console > Authentication > Sign-in Method. 2. Click "Add new provider" (or Edit) and select "Google". 3. Toggle "Enable" and Save. 4. Also ensure your web app URL is in "Authorized domains".');
      } else {
        setError(err.message || 'Failed to connect to Google');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim() || !nameInput.trim()) {
      setError("Please fill in both email and name fields.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await manualLogin(emailInput, nameInput);
      onClose();
    } catch (err: any) {
      setError(err.message || "Manual Sign-In Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           exit={{ opacity: 0 }}
           onClick={onClose}
           className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 30 }}
          className="relative w-full max-w-sm sm:max-w-md bg-[#0f1115] border border-white/10 rounded-2xl shadow-2xl overflow-hidden m-4"
        >
          <div className="p-6 md:p-8">
            <div className="flex justify-between items-start mb-6">
              <div className="flex flex-col">
                <h2 className="text-xl md:text-2xl font-black text-white italic uppercase tracking-tighter">
                  {authModalMode === 'login' ? 'Welcome Back' : 'Join the Club'}
                </h2>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">
                  Access High-Quality Reels Instantly
                </p>
              </div>
              <button 
                onClick={onClose}
                className="p-1.5 hover:bg-white/10 rounded-full text-slate-400 transition-colors"
                id="close-auth-modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Selector Tabs */}
            <div className="flex border-b border-white/10 mb-6 font-black uppercase text-[10px] tracking-wider">
              <button 
                onClick={() => { setLoginMethod('manual'); setError(null); }}
                className={`flex-1 py-3 text-center border-b-2 transition-all ${loginMethod === 'manual' ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-slate-500 hover:text-white hover:bg-white/5'}`}
              >
                Manual Entry
              </button>
              <button 
                onClick={() => { setLoginMethod('google'); setError(null); }}
                className={`flex-1 py-3 text-center border-b-2 transition-all ${loginMethod === 'google' ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-slate-500 hover:text-white hover:bg-white/5'}`}
              >
                Google Sign-In
              </button>
            </div>

            <div className="space-y-4">
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-[10px] md:text-xs text-red-200 leading-relaxed max-h-[150px] overflow-y-auto">
                  {error}
                </div>
              )}

              {loginMethod === 'manual' ? (
                <form onSubmit={handleManualLogin} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase tracking-widest font-black text-slate-500 ml-1">Gmail / Email Address</label>
                    <input 
                      type="email"
                      required
                      placeholder="e.g. ytshivu8@gmail.com"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white text-xs placeholder-white/20 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-bold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase tracking-widest font-black text-slate-500 ml-1">Full Name</label>
                    <input 
                      type="text"
                      required
                      placeholder="e.g. Shiva Gowda"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white text-xs placeholder-white/20 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-bold"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 flex items-center justify-center gap-2 px-6 py-3.5 bg-primary text-black font-black uppercase text-xs rounded-xl hover:bg-white transition-all active:scale-[0.98] disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      "Sign In Instantly"
                    )}
                  </button>
                </form>
              ) : (
                <div className="space-y-4">
                  <button
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-3 px-6 py-3.5 md:py-4 bg-white text-black font-black uppercase text-[11px] md:text-sm rounded-lg md:rounded-xl hover:bg-primary transition-all active:scale-[0.98] disabled:opacity-50 group"
                    id="google-login-btn"
                  >
                    {loading ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Chrome size={18} className="group-hover:rotate-12 transition-transform" />
                    )}
                    {loading ? 'Connecting...' : 'Continue with Google'}
                  </button>
                  <div className="p-3 bg-white/5 border border-white/5 rounded-xl text-center">
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-normal">
                      Don't have Google login ready? <br />
                      Switch to <span className="text-primary font-black cursor-pointer hover:underline" onClick={() => setLoginMethod('manual')}>Manual Entry</span> above.
                    </p>
                  </div>
                </div>
              )}

              <div className="text-center pt-2">
                <p className="text-[8px] md:text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
                  Fast & Secure Login <br/>
                  <span className="text-slate-400 font-black">Free Access Instantly</span>
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
