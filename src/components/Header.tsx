import { useState } from 'react';
import { UserCircle, Check, Smartphone, MapPin, Phone, Mail, LogOut, LogIn } from 'lucide-react';
import { UserProfile } from '../types';

interface HeaderProps {
  user: UserProfile;
  onUpdateUser: (name: string) => void;
  isLoggedIn: boolean;
  onLogin: () => void;
  onLogout: () => void;
}

export default function Header({ user, onUpdateUser, isLoggedIn, onLogin, onLogout }: HeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user.name);

  const handleSave = () => {
    onUpdateUser(name);
    setIsEditing(false);
  };

  return (
    <header className="relative flex flex-col items-center py-6 gap-6 border-b border-white/5 mb-6 pb-6 text-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center shadow-2xl shadow-white/10 shrink-0 overflow-hidden border border-white/10 p-2">
          <svg viewBox="0 0 100 100" className="w-full h-full text-slate-900" fill="currentColor">
            {/* Phone Body */}
            <rect x="25" y="10" width="50" height="80" rx="8" fill="none" stroke="currentColor" strokeWidth="4" />
            <circle cx="50" cy="82" r="3" />
            
            {/* Motion Lines */}
            <path d="M15 35 H35" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
            <path d="M20 45 H35" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
            <path d="M15 55 H35" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
            
            {/* Gear Icon */}
            <path d="M75 45 L78 40 L74 36 L69 39 L65 35 L68 30 L63 26 L58 29 L54 25 L49 28 L45 24 L40 27 L43 32 L39 36 L34 33 L30 38 L33 43 L29 47 
                     L32 52 L28 57 L31 62 L36 59 L40 63 L37 68 L42 72 L47 69 L51 73 L56 70 L60 74 L65 71 L62 66 L66 62 L71 65 L75 60 L72 55 L76 50 Z" 
                  transform="translate(10, 5) scale(0.8)"
            />
            <circle cx="58" cy="45" r="8" fill="white" />
            <circle cx="58" cy="45" r="4" fill="currentColor" />
          </svg>
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl md:text-4xl font-black tracking-tighter text-white italic leading-none">
            All <span className="text-indigo-400 font-extrabold">Cellular</span> & <span className="text-indigo-400 font-extrabold">Repair</span>
          </h1>
          <div className="flex flex-col items-center gap-1.5 text-[9px] md:text-[11px] font-bold text-slate-400 leading-none">
            <div className="flex items-center gap-1.5">
              <MapPin size={10} className="text-indigo-400" />
              <span>925 w Baseline Rd, Suite: 106, Tempe, AZ 85283</span>
            </div>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-1.5 mt-1">
              <div className="flex items-center gap-1.5 uppercase">
                <Phone size={10} className="text-indigo-400" />
                <span>(623) 234-0967</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Mail size={10} className="text-indigo-400" />
                <span className="font-medium lowercase">allcellularandrepairtempe@gmail.com</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Header Right Corner Items */}
      <div className="flex items-center gap-3 lg:absolute lg:right-0 lg:top-1/2 lg:-translate-y-1/2">
        <div className="flex items-center gap-4 bg-slate-950/20 p-2.5 px-4 rounded-2xl border border-white/5 backdrop-blur-xl">
          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">
            <UserCircle size={16} className="text-slate-400" />
          </div>
          <div className="text-left min-w-[80px]">
            <p className="text-[8px] font-bold text-slate-500 leading-none mb-1">Active Operator</p>
            <div className="text-xs font-bold text-white leading-tight">
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-transparent border-b border-indigo-500/50 focus:outline-none w-20"
                    autoFocus
                  />
                  <button onClick={handleSave} className="text-emerald-400">
                    <Check size={12} />
                  </button>
                </div>
              ) : (
                <span className="cursor-pointer hover:text-indigo-400 transition-colors" onClick={() => setIsEditing(true)}>
                  {user.name}
                </span>
              )}
            </div>
          </div>
        </div>

        {isLoggedIn ? (
          <button 
            onClick={onLogout}
            className="flex flex-col items-center justify-center w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-white transition-all cursor-pointer group shadow-xl shadow-rose-500/10"
            title="Logout"
          >
            <LogOut size={16} />
            <span className="text-[8px] font-black mt-0.5">OFF</span>
          </button>
        ) : (
          <button 
            onClick={onLogin}
            className="flex flex-col items-center justify-center w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all cursor-pointer group shadow-xl shadow-emerald-500/10"
            title="Login"
          >
            <LogIn size={16} />
            <span className="text-[8px] font-black mt-0.5">IN</span>
          </button>
        )}
      </div>
    </header>
  );
}
