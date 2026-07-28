import { useState } from 'react';
import { UserCircle, Check, Smartphone, MapPin, Phone, Mail, LogOut, LogIn, Download, FileSpreadsheet, Clock, Maximize2, Minimize2, Sliders } from 'lucide-react';
import { UserProfile } from '../types';
import { format } from 'date-fns';

interface HeaderProps {
  user: UserProfile;
  onUpdateUser: (name: string) => void;
  isLoggedIn: boolean;
  onLogin: () => void;
  onLogout: () => void;
  onInstall?: () => void;
  isInstallable?: boolean;
  onOpenGoogleSheets?: () => void;
  onOpenGmail?: () => void;
  isSheetsConnected?: boolean;
  isGmailConnected?: boolean;
  lastLoginTime?: string;
  isCompactMode?: boolean;
  onToggleCompactMode?: () => void;
}

export default function Header({ 
  user, 
  onUpdateUser, 
  isLoggedIn, 
  onLogin, 
  onLogout, 
  onInstall, 
  isInstallable,
  onOpenGoogleSheets,
  onOpenGmail,
  isSheetsConnected = false,
  isGmailConnected = false,
  lastLoginTime,
  isCompactMode = false,
  onToggleCompactMode
}: HeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user.name);

  const handleSave = () => {
    onUpdateUser(name);
    setIsEditing(false);
  };

  const formatLoginTime = (timeStr?: string) => {
    if (!timeStr) return '';
    try {
      const d = new Date(timeStr);
      if (isNaN(d.getTime())) return timeStr;
      return format(d, 'dd MMM yyyy, hh:mm:ss a');
    } catch {
      return timeStr;
    }
  };

  return (
    <header className="w-full mb-8 pb-6 border-b border-slate-200/80 bg-gradient-to-b from-slate-50/80 to-transparent rounded-b-3xl px-4 sm:px-6 py-4 shadow-2xs">
      {/* Top Admin Utility Bar */}
      <div className="w-full flex items-center justify-between gap-3 pb-3.5 mb-4 border-b border-slate-200/60 flex-wrap">
        {/* Left Side: Admin Terminal Badge, Last Login Time & Install App button */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest px-2.5 py-1.5 bg-slate-100 rounded-lg border border-slate-200/70 flex items-center gap-1.5 shrink-0 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Admin Terminal
          </span>

          {lastLoginTime && (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-900 text-[10px] font-bold shadow-2xs shrink-0">
              <Clock size={12} className="text-amber-600 shrink-0" />
              <span className="text-slate-500 uppercase tracking-wider text-[9px]">Last Login:</span>
              <span className="font-mono font-black text-slate-800">
                {formatLoginTime(lastLoginTime)}
              </span>
            </div>
          )}

          {isInstallable && onInstall && (
            <button 
              onClick={onInstall}
              className="flex items-center gap-1.5 bg-amber-500 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-md hover:bg-amber-600 hover:scale-105 active:scale-95 transition-all shrink-0 cursor-pointer"
            >
              <Download size={13} />
              <span>Install App</span>
            </button>
          )}
        </div>

        {/* Right Side: Quick Action Toolbar (Gmail, Sheets, Admin Profile, Lock/Unlock) */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap sm:flex-nowrap">
          {onOpenGmail && (
            <button
              onClick={onOpenGmail}
              className="flex items-center gap-1.5 h-9 px-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 hover:bg-red-600 hover:text-white transition-all cursor-pointer shadow-2xs text-xs font-black uppercase tracking-wider"
              title="Gmail Manager & Email Reports"
            >
              <Mail size={14} />
              <span>Gmail</span>
            </button>
          )}

          {onOpenGoogleSheets && (
            <button
              onClick={onOpenGoogleSheets}
              className={`flex items-center gap-1.5 h-9 px-3 rounded-xl border transition-all cursor-pointer shadow-2xs text-xs font-black uppercase tracking-wider ${
                isSheetsConnected
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 hover:bg-emerald-600 hover:text-white'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-600 hover:bg-amber-500 hover:text-white'
              }`}
              title="Google Sheets Sign In, Setup & Auto Sync"
            >
              <FileSpreadsheet size={14} />
              <span className={`w-2 h-2 rounded-full ${isSheetsConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <span>{isSheetsConnected ? 'Sheets Sync' : 'Sheets Setup'}</span>
            </button>
          )}

          {onToggleCompactMode && (
            <button
              onClick={onToggleCompactMode}
              className={`flex items-center gap-1.5 h-9 px-3 rounded-xl border transition-all cursor-pointer shadow-2xs text-xs font-black uppercase tracking-wider ${
                isCompactMode
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.3)]'
                  : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
              }`}
              title={isCompactMode ? "Disable Compact Mode (Standard View)" : "Enable Compact Mode (Fits more rows & data on screen)"}
            >
              {isCompactMode ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
              <span className="hidden sm:inline">Compact</span>
              <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                isCompactMode ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {isCompactMode ? 'ON' : 'OFF'}
              </span>
            </button>
          )}

          {/* Admin User Card */}
          <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-xl border border-slate-200 shadow-2xs h-9">
            <UserCircle size={18} className="text-slate-400 shrink-0" />
            <div className="text-left">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Admin</p>
              <div className="text-xs font-black text-slate-900 leading-tight uppercase tracking-tight">
                {isEditing ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="bg-transparent border-b border-amber-500 focus:outline-none w-20 text-xs font-bold"
                      autoFocus
                    />
                    <button onClick={handleSave} className="text-emerald-600">
                      <Check size={12} />
                    </button>
                  </div>
                ) : (
                  <span className="cursor-pointer hover:text-amber-600 transition-colors" onClick={() => setIsEditing(true)}>
                    {user.name}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Lock / Unlock Terminal Button */}
          {isLoggedIn ? (
            <button 
              onClick={onLogout}
              className="flex items-center justify-center gap-1.5 h-9 px-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 hover:bg-rose-600 hover:text-white transition-all cursor-pointer shadow-2xs text-xs font-black uppercase tracking-wider"
              title="Lock Terminal"
            >
              <LogOut size={14} />
              <span>Lock</span>
            </button>
          ) : (
            <button 
              onClick={onLogin}
              className="flex items-center justify-center gap-1.5 h-9 px-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all cursor-pointer shadow-2xs text-xs font-black uppercase tracking-wider"
              title="Unlock Terminal"
            >
              <LogIn size={14} />
              <span>Unlock</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Store Branding Header */}
      <div className="flex flex-col items-center gap-4 text-center pt-2">
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
        <div className="space-y-3">
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
    </header>
  );
}
