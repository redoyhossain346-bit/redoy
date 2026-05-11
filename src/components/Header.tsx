import { useState } from 'react';
import { UserCircle, Check, Smartphone, MapPin, Phone, Mail, LogOut, LogIn, Download } from 'lucide-react';
import { UserProfile } from '../types';

interface HeaderProps {
  user: UserProfile;
  onUpdateUser: (name: string) => void;
  isLoggedIn: boolean;
  onLogin: () => void;
  onLogout: () => void;
  onInstall?: () => void;
  isInstallable?: boolean;
}

export default function Header({ 
  user, 
  onUpdateUser, 
  isLoggedIn, 
  onLogin, 
  onLogout, 
  onInstall, 
  isInstallable
}: HeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user.name);

  const handleSave = () => {
    onUpdateUser(name);
    setIsEditing(false);
  };

  return (
    <header className="relative flex flex-col items-center py-6 md:py-8 gap-6 border-b border-slate-100 mb-8 pb-8 text-center bg-gradient-to-b from-slate-50 to-transparent">
      {/* Installation Badge */}
      {isInstallable && onInstall && (
        <button 
          onClick={onInstall}
          className="absolute left-0 top-0 mt-4 flex items-center gap-2 bg-amber-500 text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all z-10 animate-bounce hover:animate-none"
        >
          <Download size={14} />
          Install Desktop App
        </button>
      )}

      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-[1.75rem] bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center shadow-[0_10px_30px_rgba(245,158,11,0.2)] shrink-0 overflow-hidden border border-white/20 p-1.5 rotate-3">
          <svg viewBox="0 0 100 100" className="w-full h-full text-black" fill="currentColor">
            {/* Phone Body */}
            <rect x="25" y="10" width="50" height="80" rx="8" fill="none" stroke="currentColor" strokeWidth="4" />
            <circle cx="50" cy="80" r="4" fill="none" stroke="currentColor" strokeWidth="2" />
            
            {/* Repair Spark Symbol */}
            <path d="M75 45 L78 40 L74 36 L69 39 L65 35 L68 30 L63 26 L58 29 L54 25 L49 28 L45 24 L40 27 L43 32 L39 36 L34 33 L30 38 L33 43 L29 47 
                     L32 52 L28 57 L31 62 L36 59 L40 63 L37 68 L42 72 L47 69 L51 73 L56 70 L60 74 L65 71 L62 66 L66 62 L71 65 L75 60 L72 55 L76 50 Z" 
                   transform="translate(10, 5) scale(0.8)"
            />
            <circle cx="58" cy="45" r="8" fill="white" />
            <circle cx="58" cy="45" r="4" fill="currentColor" />
          </svg>
        </div>
        <div className="space-y-4">
          <h1 className="text-3xl md:text-5xl font-black tracking-tighter italic leading-none premium-gradient-text uppercase pr-1 md:pr-2">
            All <span className="gold-gradient-text">Cellular</span> & <span className="gold-gradient-text">Repair</span>
          </h1>
          <div className="flex flex-col items-center gap-2.5 text-[10px] md:text-xs font-semibold text-slate-400 leading-none">
            <div className="flex items-center gap-2.5 px-4 py-2 bg-slate-50 border border-slate-100 rounded-full">
              <MapPin size={12} className="text-amber-600" />
              <span className="tracking-[0.2em] uppercase text-slate-500">925 w Baseline Rd, Suite: 106, Tempe, AZ 85283</span>
            </div>
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 mt-1">
              <div className="flex items-center gap-2 uppercase tracking-widest text-slate-400">
                <Phone size={12} className="text-amber-600" />
                <span>(623) 234-0967</span>
              </div>
              <div className="flex items-center gap-2 uppercase tracking-widest text-slate-400">
                <Mail size={12} className="text-amber-600" />
                <span className="lowercase">allcellularandrepairtempe@gmail.com</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Header Right Corner Items */}
      <div className="flex items-center gap-3 lg:absolute lg:right-0 lg:top-1/2 lg:-translate-y-1/2">
        <div className="flex items-center gap-4 bg-white p-2.5 px-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center border border-slate-200">
            <UserCircle size={20} className="text-slate-400" />
          </div>
          <div className="text-left min-w-[100px]">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Admin</p>
            <div className="text-sm font-black text-slate-900 leading-tight uppercase tracking-tight">
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-transparent border-b border-amber-500/50 focus:outline-none w-24"
                    autoFocus
                  />
                  <button onClick={handleSave} className="text-emerald-400">
                    <Check size={14} />
                  </button>
                </div>
              ) : (
                <span className="cursor-pointer hover:text-amber-400 transition-colors" onClick={() => setIsEditing(true)}>
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
