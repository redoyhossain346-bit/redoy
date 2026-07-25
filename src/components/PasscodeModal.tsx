import React, { useState } from 'react';
import { Lock, X, User } from 'lucide-react';
import { cn } from '../lib/utils';

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
      <div className="w-full max-w-sm glass-card p-10 border-slate-200 bg-white shadow-2xl relative">
        {allowClose && (
          <button 
            onClick={handleClose}
            className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-slate-50 rounded-xl"
          >
            <X size={20} />
          </button>
        )}

        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center mb-4 shadow-lg text-white">
            <Lock size={32} />
          </div>
          
          <h2 className="text-xl font-black text-slate-800 tracking-tight mb-1 uppercase">Terminal Login</h2>
          <p className="text-[10px] text-amber-600 mb-6 font-bold tracking-wider uppercase">Enter ID & Password to access</p>

          <div className="w-full space-y-4">
            <form onSubmit={handleSubmit} className="w-full space-y-4">
              <div className="space-y-1 text-left">
                <label className="text-[10px] font-bold text-slate-500 pl-1 uppercase tracking-wider leading-none">User ID</label>
                <div className="relative flex items-center">
                  <User size={16} className="absolute left-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    placeholder="Enter ID (e.g. Cellular01)"
                    className={cn(
                      "w-full bg-slate-50 border py-3 pl-10 pr-4 rounded-xl focus:outline-none transition-all text-xs font-bold text-slate-800 placeholder:text-slate-400 shadow-xs",
                      error ? "border-rose-500 animate-shake" : "border-slate-200 focus:border-amber-500"
                    )}
                  />
                </div>
              </div>

              <div className="space-y-1 text-left">
                <label className="text-[10px] font-bold text-slate-500 pl-1 uppercase tracking-wider leading-none">Password</label>
                <div className="relative flex items-center">
                  <Lock size={16} className="absolute left-3.5 text-slate-400" />
                  <input
                    type="password"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    placeholder="Enter Password"
                    className={cn(
                      "w-full bg-slate-50 border py-3 pl-10 pr-4 rounded-xl focus:outline-none transition-all text-xs font-bold text-slate-800 placeholder:text-slate-400 shadow-xs",
                      error ? "border-rose-500 animate-shake" : "border-slate-200 focus:border-amber-500"
                    )}
                  />
                </div>
              </div>

              {error && <p className="text-rose-500 text-[10px] font-bold text-center uppercase tracking-wider bg-rose-50 py-2 rounded-lg border border-rose-200">Invalid ID or Password</p>}
              
              <div className="flex items-center justify-between px-1">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input 
                      type="checkbox" 
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="peer sr-only"
                    />
                    <div className="w-4 h-4 border-2 border-slate-300 rounded-md bg-slate-50 peer-checked:bg-amber-500 peer-checked:border-amber-500 transition-all duration-300 shadow-xs"></div>
                    <div className="absolute opacity-0 peer-checked:opacity-100 transition-opacity">
                      <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 group-hover:text-slate-700 transition-colors uppercase tracking-wider">Remember ID</span>
                </label>
              </div>
              
              <button
                type="submit"
                className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-xs transition-all shadow-md mt-2 uppercase tracking-wider active:scale-95"
              >
                Log In
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

