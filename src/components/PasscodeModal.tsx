import React, { useState } from 'react';
import { ShieldCheck, X } from 'lucide-react';
import { cn } from '../lib/utils';

interface PasscodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PasscodeModal({ isOpen, onClose, onSuccess }: PasscodeModalProps) {
  const [userId, setUserId] = useState(localStorage.getItem('remembered_user_id') || '');
  const [passcode, setPasscode] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState(false);
  
  const VALID_USER_ID = 'Cellular01';
  const VALID_PASSCODE = '123458';

  if (!isOpen) return null;

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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-sm glass-card p-10 border-indigo-500/30 shadow-2xl relative">
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-3xl bg-indigo-500 flex items-center justify-center mb-8 shadow-2xl shadow-indigo-500/20">
            <ShieldCheck size={40} className="text-white" />
          </div>
          
          <h2 className="text-2xl font-black text-white tracking-tight mb-2">Security Verification</h2>
          <p className="text-[10px] text-slate-500 mb-10 font-bold tracking-widest uppercase">Authorized Personnel Only</p>

          <form onSubmit={handleSubmit} className="w-full space-y-5">
            <div className="space-y-1.5 text-left">
              <label className="text-[9px] font-bold text-slate-500 pl-1 uppercase tracking-widest leading-none">User Identification</label>
              <input
                type="text"
                autoFocus
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Cellular ID"
                className={cn(
                  "w-full bg-slate-900/50 border py-4 px-5 rounded-xl focus:outline-none transition-all text-sm font-bold placeholder:text-slate-700",
                  error ? "border-rose-500 animate-shake" : "border-white/10 focus:border-indigo-500/50 text-white"
                )}
              />
            </div>

            <div className="space-y-1.5 text-left">
              <label className="text-[9px] font-bold text-slate-500 pl-1 uppercase tracking-widest leading-none">Security Passcode</label>
              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="••••••"
                className={cn(
                  "w-full bg-slate-900/50 border text-center text-2xl tracking-[1em] py-4 rounded-xl focus:outline-none transition-all placeholder:tracking-normal",
                  error ? "border-rose-500 animate-shake" : "border-white/10 focus:border-indigo-500/50 text-white"
                )}
              />
            </div>

            {error && <p className="text-rose-500 text-[10px] font-bold text-center uppercase tracking-widest">Invalid Credentials</p>}
            
            <div className="flex items-center justify-between px-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative flex items-center justify-center">
                  <input 
                    type="checkbox" 
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="peer sr-only"
                  />
                  <div className="w-4 h-4 border-2 border-white/10 rounded bg-slate-900/50 peer-checked:bg-indigo-500 peer-checked:border-indigo-500 transition-all"></div>
                  <div className="absolute opacity-0 peer-checked:opacity-100 transition-opacity">
                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <span className="text-[9px] font-bold text-slate-500 group-hover:text-slate-300 transition-colors uppercase tracking-widest">Remember access</span>
              </label>
            </div>
            
            <button
              type="submit"
              className="w-full py-5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-bold text-xs transition-all shadow-xl shadow-indigo-500/20 mt-4"
            >
              Verify & Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
