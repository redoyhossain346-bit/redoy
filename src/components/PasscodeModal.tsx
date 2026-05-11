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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-white/80 backdrop-blur-xl">
      <div className="w-full max-w-sm glass-card p-12 border-slate-200 bg-white shadow-2xl relative">
        <button 
          onClick={handleClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-slate-50 rounded-xl"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center mb-10 shadow-lg">
            <ShieldCheck size={48} className="text-white" />
          </div>
          
          <h2 className="text-3xl font-black text-slate-800 tracking-tighter mb-2 premium-gradient-text uppercase">System Access</h2>
          <p className="text-[10px] text-amber-600 mb-12 font-black tracking-[0.4em] uppercase">Security Clearance Required</p>

          <form onSubmit={handleSubmit} className="w-full space-y-6">
            <div className="space-y-2 text-left">
              <label className="text-[10px] font-black text-slate-400 pl-1 uppercase tracking-[0.2em] leading-none">Authentication ID</label>
              <input
                type="text"
                autoFocus
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="OPERATOR ID"
                className={cn(
                  "w-full bg-slate-50 border py-5 px-6 rounded-2xl focus:outline-none transition-all text-sm font-black placeholder:text-slate-300 uppercase tracking-widest",
                  error ? "border-rose-500 animate-shake" : "border-slate-200 focus:border-amber-500/50 text-slate-800 shadow-sm"
                )}
              />
            </div>

            <div className="space-y-2 text-left">
              <label className="text-[10px] font-black text-slate-400 pl-1 uppercase tracking-[0.2em] leading-none">Secure Passcode</label>
              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="••••••"
                className={cn(
                  "w-full bg-slate-50 border text-center text-3xl tracking-[1.2rem] py-5 rounded-2xl focus:outline-none transition-all placeholder:tracking-normal placeholder:text-slate-300",
                  error ? "border-rose-500 animate-shake" : "border-slate-200 focus:border-amber-500/50 text-slate-800 shadow-sm"
                )}
              />
            </div>

            {error && <p className="text-rose-500 text-[10px] font-black text-center uppercase tracking-[0.3em] bg-rose-50 py-2 rounded-lg border border-rose-100">Access Denied</p>}
            
            <div className="flex items-center justify-between px-1">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center">
                  <input 
                    type="checkbox" 
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="peer sr-only"
                  />
                  <div className="w-5 h-5 border-2 border-slate-200 rounded-lg bg-slate-50 peer-checked:bg-amber-500 peer-checked:border-amber-500 transition-all duration-300 shadow-sm"></div>
                  <div className="absolute opacity-0 peer-checked:opacity-100 transition-opacity">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <span className="text-[10px] font-black text-slate-400 group-hover:text-slate-600 transition-colors uppercase tracking-[0.15em]">Remember Terminal</span>
              </label>
            </div>
            
            <button
              type="submit"
              className="w-full py-6 bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-white rounded-2xl font-black text-xs transition-all shadow-lg mt-6 uppercase tracking-widest active:scale-95"
            >
              Initialize Session
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
