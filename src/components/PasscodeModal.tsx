import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, X, MessageSquare, Timer, RefreshCw, Send } from 'lucide-react';
import { cn } from '../lib/utils';

interface PasscodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type VerificationStep = 'credentials' | 'otp';

export default function PasscodeModal({ isOpen, onClose, onSuccess }: PasscodeModalProps) {
  const [step, setStep] = useState<VerificationStep>('credentials');
  const [userId, setUserId] = useState('');
  const [passcode, setPasscode] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [timeLeft, setTimeLeft] = useState(25);
  const [error, setError] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const VALID_USER_ID = 'Cellular01';
  const VALID_PASSCODE = '123458';
  const PHONE_NUMBER = '(480) 594-8459';

  useEffect(() => {
    if (step === 'otp' && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [step, timeLeft]);

  if (!isOpen) return null;

  const generateOtp = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setTimeLeft(25);
    setOtpInput('');
    setError(false);
    
    // Simulate real SMS delay
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      // In a real app, this would be an API call to Twilio or similar
      console.log(`[DEBUG] OTP for ${PHONE_NUMBER}: ${code}`);
    }, 800);
  };

  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userId === VALID_USER_ID && passcode === VALID_PASSCODE) {
      setStep('otp');
      generateOtp();
      setError(false);
    } else {
      setError(true);
      setPasscode('');
      setTimeout(() => setError(false), 1000);
    }
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (timeLeft <= 0) {
      setError(true);
      return;
    }

    if (otpInput === generatedOtp) {
      onSuccess();
      resetModal();
      onClose();
    } else {
      setError(true);
      setOtpInput('');
      setTimeout(() => setError(false), 1000);
    }
  };

  const resetModal = () => {
    setStep('credentials');
    setUserId('');
    setPasscode('');
    setOtpInput('');
    setGeneratedOtp('');
    setTimeLeft(25);
    setError(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-sm glass-card p-10 border-indigo-500/30 shadow-2xl relative overflow-hidden">
        {/* Progress Bar for Timer */}
        {step === 'otp' && (
          <div className="absolute top-0 left-0 h-1 bg-indigo-500/20 w-full overflow-hidden">
            <div 
              className={cn(
                "h-full transition-all duration-1000 ease-linear",
                timeLeft < 10 ? "bg-rose-500" : "bg-indigo-500"
              )}
              style={{ width: `${(timeLeft / 25) * 100}%` }}
            />
          </div>
        )}

        <button 
          onClick={() => {
            resetModal();
            onClose();
          }}
          className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className={cn(
            "w-20 h-20 rounded-3xl flex items-center justify-center mb-8 shadow-2xl transition-all duration-500",
            step === 'credentials' ? "bg-indigo-500 shadow-indigo-500/20" : "bg-emerald-500 shadow-emerald-500/20"
          )}>
            {step === 'credentials' ? (
              <ShieldCheck size={40} className="text-white" />
            ) : (
              <MessageSquare size={40} className="text-white" />
            )}
          </div>
          
          <h2 className="text-2xl font-black text-white tracking-tight mb-2">
            {step === 'credentials' ? 'Security Verification' : 'OTP Verification'}
          </h2>
          <p className="text-[10px] text-slate-500 mb-10 font-bold tracking-widest uppercase">
            {step === 'credentials' ? 'Authorized Personnel Only' : `Code sent to: ${PHONE_NUMBER}`}
          </p>

          {step === 'credentials' ? (
            <form onSubmit={handleCredentialsSubmit} className="w-full space-y-5">
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
              
              <button
                type="submit"
                className="w-full py-5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-bold text-xs transition-all shadow-xl shadow-indigo-500/20 mt-4 flex items-center justify-center gap-2 group"
              >
                <span>Continue to OTP</span>
                <Send size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleOtpSubmit} className="w-full space-y-5">
              <div className="space-y-4">
                {isSending ? (
                  <div className="py-6 flex flex-col items-center gap-3">
                    <RefreshCw className="text-indigo-400 animate-spin" size={24} />
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Sending Secure Code...</p>
                  </div>
                ) : (
                  <>
                    <input
                      type="text"
                      autoFocus
                      maxLength={6}
                      value={otpInput}
                      onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                      placeholder="000000"
                      className={cn(
                        "w-full bg-slate-900/50 border text-center text-4xl tracking-[0.5em] py-5 rounded-xl focus:outline-none transition-all font-black placeholder:text-slate-800",
                        error ? "border-rose-500 animate-shake" : "border-white/10 focus:border-emerald-500/50 text-white",
                        timeLeft === 0 && "opacity-50 grayscale"
                      )}
                    />
                    
                    <div className="flex items-center justify-between px-1">
                      <div className={cn(
                        "flex items-center gap-2 text-[10px] font-bold transition-colors",
                        timeLeft < 10 ? "text-rose-500" : "text-slate-400"
                      )}>
                        <Timer size={14} />
                        <span className="tabular-nums uppercase tracking-widest">Expires in: {timeLeft}s</span>
                      </div>
                      
                      <button
                        type="button"
                        onClick={generateOtp}
                        className="text-[10px] font-extrabold text-indigo-400 hover:text-indigo-300 uppercase tracking-widest flex items-center gap-1.5 transition-colors"
                      >
                        <RefreshCw size={12} />
                        Resend
                      </button>
                    </div>

                    {/* Demo Helper - Remove in production */}
                    <div className="p-3 bg-indigo-500/5 rounded-lg border border-indigo-500/10 text-[9px] font-bold text-indigo-400/70 leading-relaxed italic">
                      DEMO: Your OTP code is <span className="text-white font-black underline">{generatedOtp}</span>
                    </div>
                  </>
                )}
              </div>

              {error && (
                <p className="text-rose-500 text-[10px] font-bold text-center uppercase tracking-widest">
                  {timeLeft === 0 ? 'Code Expired - Please Resend' : 'Invalid OTP Code'}
                </p>
              )}
              
              <button
                type="submit"
                disabled={isSending || timeLeft === 0}
                className={cn(
                  "w-full py-5 text-white rounded-xl font-bold text-xs transition-all shadow-xl mt-4 uppercase tracking-[0.2em] flex items-center justify-center gap-2",
                  isSending || timeLeft === 0 
                    ? "bg-slate-700 cursor-not-allowed opacity-50" 
                    : "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20"
                )}
              >
                <span>Verify & Login</span>
              </button>
              
              <button
                type="button"
                onClick={() => setStep('credentials')}
                className="text-[9px] font-bold text-slate-500 hover:text-slate-400 uppercase tracking-widest transition-colors"
              >
                Go Back
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
