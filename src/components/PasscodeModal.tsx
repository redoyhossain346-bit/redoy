import React, { useState } from 'react';
import { ShieldCheck, X, LogIn } from 'lucide-react';
import { cn } from '../lib/utils';
import { auth, signInWithPopup, googleProvider } from '../lib/firebase';

interface PasscodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  allowClose?: boolean;
}

export default function PasscodeModal({ isOpen, onClose, onSuccess, allowClose = true }: PasscodeModalProps) {
  const [userId, setUserId] = useState(localStorage.getItem('remembered_user_id') || '');
  const [passcode, setPasscode] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const VALID_USER_ID = 'Cellular01';
  const VALID_PASSCODE = '123458';

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(false);
    try {
      await signInWithPopup(auth, googleProvider);
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Google Sign-In failed', error);
      setError(true);
      // If it's a specific auth error, we can log it more specifically
      if (error.code === 'auth/unauthorized-domain') {
        alert(`Unauthorized Domain: Please add "${window.location.hostname}" to authorized domains in Firebase Console.`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userId === VALID_USER_ID && passcode === VALID_PASSCODE) {
      if (rememberMe) {
        localStorage.setItem('remembered_user_id', userId);
        localStorage.setItem('keep_logged_in', 'true');
      } else {
        localStorage.removeItem('remembered_user_id');
        localStorage.removeItem('keep_logged_in');
      }
      onSuccess();
      setPasscode('');
      setError(false);
      onClose();
    } else {
      setError(true);
      setPasscode('');
      setTimeout(() => setError(false), 1000);
    }
  };

  const handleClose = () => {
    setUserId('');
    setPasscode('');
    setError(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-white/80 backdrop-blur-xl">
      <div className="w-full max-w-sm glass-card p-12 border-slate-200 bg-white shadow-2xl relative">
        {allowClose && (
          <button 
            onClick={handleClose}
            className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-slate-50 rounded-xl"
          >
            <X size={20} />
          </button>
        )}

        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-[1.5rem] bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center mb-6 shadow-lg">
            <ShieldCheck size={40} className="text-white" />
          </div>
          
          <h2 className="text-2xl font-black text-slate-800 tracking-tighter mb-1 uppercase">System Access</h2>
          <p className="text-[9px] text-amber-600 mb-8 font-black tracking-[0.3em] uppercase">Auth Required</p>

          <div className="w-full space-y-4">
            <button 
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full py-4 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-95 flex items-center justify-center gap-3 group"
            >
              <div className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:scale-110 transition-transform">
                <LogIn size={14} className="text-slate-600" />
              </div>
              <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Sign in with Gmail (Google ID)</span>
            </button>

            <div className="flex items-center gap-4 py-2">
              <div className="h-px flex-1 bg-slate-100"></div>
              <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">OR</span>
              <div className="h-px flex-1 bg-slate-100"></div>
            </div>

            <form onSubmit={handleSubmit} className="w-full space-y-4">
              <div className="space-y-1.5 text-left">
                <label className="text-[9px] font-black text-slate-400 pl-1 uppercase tracking-[0.2em] leading-none">Operator ID</label>
                <input
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="ID"
                  className={cn(
                    "w-full bg-slate-50 border py-3.5 px-4 rounded-xl focus:outline-none transition-all text-xs font-black placeholder:text-slate-300 uppercase tracking-widest",
                    error ? "border-rose-500 animate-shake" : "border-slate-200 focus:border-amber-500/50 text-slate-800 shadow-sm"
                  )}
                />
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-[9px] font-black text-slate-400 pl-1 uppercase tracking-[0.2em] leading-none">Passcode</label>
                <input
                  type="password"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="••••••"
                  className={cn(
                    "w-full bg-slate-50 border text-center text-xl tracking-[0.8rem] py-3.5 rounded-xl focus:outline-none transition-all placeholder:tracking-normal placeholder:text-slate-300",
                    error ? "border-rose-500 animate-shake" : "border-slate-200 focus:border-amber-500/50 text-slate-800 shadow-sm"
                  )}
                />
              </div>

              {error && <p className="text-rose-500 text-[9px] font-black text-center uppercase tracking-[0.2em] bg-rose-50 py-1.5 rounded-lg border border-rose-100">Access Denied</p>}
              
              <div className="flex items-center justify-between px-1">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input 
                      type="checkbox" 
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="peer sr-only"
                    />
                    <div className="w-4 h-4 border-2 border-slate-200 rounded-md bg-slate-50 peer-checked:bg-amber-500 peer-checked:border-amber-500 transition-all duration-300 shadow-sm"></div>
                    <div className="absolute opacity-0 peer-checked:opacity-100 transition-opacity">
                      <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <span className="text-[9px] font-black text-slate-400 group-hover:text-slate-600 transition-colors uppercase tracking-[0.1em]">Remember Identity</span>
                </label>
              </div>
              
              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-white rounded-xl font-black text-[10px] transition-all shadow-lg mt-2 uppercase tracking-widest active:scale-95"
              >
                Enter Terminal
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
