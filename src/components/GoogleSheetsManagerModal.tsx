import React, { useState, useEffect } from 'react';
import { FileSpreadsheet, LogIn, LogOut, RefreshCw, Check, ExternalLink, Plus, Download, Upload, AlertCircle, Database, Shield, Copy } from 'lucide-react';
import { User } from 'firebase/auth';
import { googleSignIn, logoutGoogle, initAuth, getAccessToken } from '../services/googleSheetsAuth';
import { googleSheetsService, DriveSpreadsheet } from '../services/googleSheetsService';
import { Transaction, InventoryItem, WorkHour } from '../types';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface GoogleSheetsManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  inventory: InventoryItem[];
  workHours: WorkHour[];
  onImportTransactions?: (imported: Transaction[]) => void;
  onImportInventory?: (imported: InventoryItem[]) => void;
}

export default function GoogleSheetsManagerModal({
  isOpen,
  onClose,
  transactions,
  inventory,
  workHours,
  onImportTransactions,
  onImportInventory,
}: GoogleSheetsManagerModalProps) {
  const [googleUser, setGoogleUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [isUnauthorizedDomain, setIsUnauthorizedDomain] = useState<boolean>(false);
  const [domainCopied, setDomainCopied] = useState<boolean>(false);
  
  // Spreadsheets & Auto-Sync
  const [spreadsheets, setSpreadsheets] = useState<DriveSpreadsheet[]>([]);
  const [selectedSpreadsheetId, setSelectedSpreadsheetId] = useState<string>(
    () => localStorage.getItem('gsheets_selected_id') || ''
  );
  const [autoSyncEnabled, setAutoSyncEnabled] = useState<boolean>(
    () => localStorage.getItem('gsheets_auto_sync_enabled') !== 'false'
  );
  const [lastSyncedTime, setLastSyncedTime] = useState<string | null>(
    () => localStorage.getItem('gsheets_last_synced') || null
  );

  // Confirmation state
  const [confirmAction, setConfirmAction] = useState<{
    title: string;
    description: string;
    onConfirm: () => void;
  } | null>(null);

  useEffect(() => {
    const unsub = initAuth(
      (u, tok) => {
        setGoogleUser(u);
        setToken(tok);
        loadSpreadsheets(tok);
      },
      () => {
        setGoogleUser(null);
        setToken(null);
      }
    );
    return () => unsub();
  }, []);

  const handleSpreadsheetSelect = (id: string) => {
    setSelectedSpreadsheetId(id);
    localStorage.setItem('gsheets_selected_id', id);
  };

  const handleAutoSyncToggle = (enabled: boolean) => {
    setAutoSyncEnabled(enabled);
    localStorage.setItem('gsheets_auto_sync_enabled', enabled ? 'true' : 'false');
  };

  const loadSpreadsheets = async (accessToken: string) => {
    try {
      setLoading(true);
      const files = await googleSheetsService.listUserSpreadsheets(accessToken);
      setSpreadsheets(files);
      
      const savedId = localStorage.getItem('gsheets_selected_id');
      if (savedId && files.some(f => f.id === savedId)) {
        setSelectedSpreadsheetId(savedId);
      } else if (files.length > 0 && !selectedSpreadsheetId) {
        setSelectedSpreadsheetId(files[0].id);
        localStorage.setItem('gsheets_selected_id', files[0].id);
      }
    } catch (err: any) {
      console.warn('Failed to load spreadsheets:', err);
      const msg = err?.message || String(err);
      if (msg.includes('authentication credentials') || msg.includes('401') || msg.includes('Unauthenticated') || msg.includes('invalid grant')) {
        setToken(null);
        setGoogleUser(null);
        setStatusMessage({ type: 'error', text: 'Google OAuth token expired. Please click "Connect Google Sheets" to re-authenticate.' });
      } else {
        setStatusMessage({ type: 'error', text: `Spreadsheet sync error: ${msg}` });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async () => {
    try {
      setLoading(true);
      setStatusMessage(null);
      setIsUnauthorizedDomain(false);
      const result = await googleSignIn();
      if (result) {
        setGoogleUser(result.user);
        setToken(result.accessToken);
        setStatusMessage({ type: 'success', text: `Signed in as ${result.user.email}` });
        await loadSpreadsheets(result.accessToken);
      }
    } catch (err: any) {
      console.error('Google Sign-in error:', err);
      const isDomainErr = err.code === 'auth/unauthorized-domain' || err.message?.includes('unauthorized-domain');
      setIsUnauthorizedDomain(isDomainErr);
      setStatusMessage({
        type: 'error',
        text: isDomainErr
          ? `Firebase error: Domain "${window.location.hostname}" is not authorized in Firebase Console.`
          : err.message || 'Google Sign-in failed',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await logoutGoogle();
    setGoogleUser(null);
    setToken(null);
    setSpreadsheets([]);
    setStatusMessage({ type: 'info', text: 'Disconnected Google Account' });
  };

  const handleCreateNewSheetAndExport = () => {
    if (!token) return;

    setConfirmAction({
      title: 'Create New Google Spreadsheet?',
      description: `This will create a new Google Sheet titled "Cellular & Repair Terminal Data" in your Google Drive and sync ${transactions.length} transactions, ${inventory.length} inventory items, and ${workHours.length} work hours entries.`,
      onConfirm: async () => {
        setConfirmAction(null);
        setLoading(true);
        setStatusMessage(null);
        try {
          const { spreadsheetId, spreadsheetUrl } = await googleSheetsService.createStoreSpreadsheet(token);
          await googleSheetsService.exportAllData(token, spreadsheetId, {
            transactions,
            inventory,
            workHours,
          });
          setSelectedSpreadsheetId(spreadsheetId);
          localStorage.setItem('gsheets_selected_id', spreadsheetId);
          const syncTime = new Date().toLocaleTimeString();
          setLastSyncedTime(syncTime);
          localStorage.setItem('gsheets_last_synced', syncTime);
          await loadSpreadsheets(token);
          setStatusMessage({
            type: 'success',
            text: `Successfully created spreadsheet and synced all data!`,
          });
        } catch (err: any) {
          setStatusMessage({ type: 'error', text: err.message || 'Failed to create spreadsheet' });
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handleExportToSelectedSheet = () => {
    if (!token || !selectedSpreadsheetId) {
      setStatusMessage({ type: 'error', text: 'Please select a spreadsheet first.' });
      return;
    }

    const targetSheet = spreadsheets.find((s) => s.id === selectedSpreadsheetId);

    setConfirmAction({
      title: `Update Google Sheet "${targetSheet?.name || 'Selected Sheet'}"?`,
      description: `This will overwrite or update the "Transactions", "Inventory", and "Work Hours" worksheets in this Google Sheet with your current terminal data.`,
      onConfirm: async () => {
        setConfirmAction(null);
        setLoading(true);
        setStatusMessage(null);
        try {
          await googleSheetsService.exportAllData(token, selectedSpreadsheetId, {
            transactions,
            inventory,
            workHours,
          });
          const syncTime = new Date().toLocaleTimeString();
          setLastSyncedTime(syncTime);
          localStorage.setItem('gsheets_last_synced', syncTime);
          setStatusMessage({
            type: 'success',
            text: `Successfully synced & styled data in Google Sheet!`,
          });
        } catch (err: any) {
          setStatusMessage({ type: 'error', text: err.message || 'Export failed' });
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handleFormatSheet = async () => {
    if (!token || !selectedSpreadsheetId) return;
    setLoading(true);
    setStatusMessage(null);
    try {
      await googleSheetsService.styleSpreadsheet(token, selectedSpreadsheetId);
      setStatusMessage({
        type: 'success',
        text: 'Successfully formatted sheet with header colors, zebra striping, borders, currency formatting, and column widths!',
      });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Formatting failed' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const currentSheet = spreadsheets.find((s) => s.id === selectedSpreadsheetId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-gradient-to-r from-emerald-50/50 via-white to-amber-50/50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 shadow-inner">
              <FileSpreadsheet size={24} />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-800 uppercase tracking-wide">Google Sheets Integration</h2>
              <p className="text-xs text-slate-500 font-medium">Sync store transactions, inventory & logs directly with Google Drive</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
          {/* Status Message */}
          {statusMessage && (
            <div
              className={cn(
                'p-4 rounded-2xl text-xs font-bold border flex items-center gap-3',
                statusMessage.type === 'success' && 'bg-emerald-50 text-emerald-800 border-emerald-200',
                statusMessage.type === 'error' && 'bg-rose-50 text-rose-800 border-rose-200',
                statusMessage.type === 'info' && 'bg-amber-50 text-amber-800 border-amber-200'
              )}
            >
              <AlertCircle size={18} className="shrink-0" />
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Unauthorized Domain Resolution Card */}
          {isUnauthorizedDomain && (
            <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-950 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Shield size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-amber-900">
                    Domain Authorization Required in Firebase
                  </h4>
                  <p className="text-xs font-medium text-amber-800/90 mt-1">
                    Firebase authentication protects your Google Account by requiring domains to be added to Authorized Domains.
                  </p>
                </div>
              </div>

              {/* Instant Quick Fix for 127.0.0.1 */}
              {(window.location.hostname === '127.0.0.1' || window.location.hostname.startsWith('127.')) && (
                <div className="p-3.5 bg-white rounded-xl border border-amber-300 flex items-center justify-between gap-3 shadow-sm">
                  <div>
                    <p className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                      ⚡ Instant Quick Fix for Local PC
                    </p>
                    <p className="text-[11px] font-medium text-slate-600 mt-0.5">
                      Firebase pre-authorizes <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-800 font-bold">localhost</code>. Access your app via localhost instead of 127.0.0.1!
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      window.location.href = window.location.href.replace('127.0.0.1', 'localhost');
                    }}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl uppercase tracking-wider shrink-0 transition-all shadow-sm active:scale-95"
                  >
                    Open localhost:3000
                  </button>
                </div>
              )}

              {/* Step-by-step domain whitelist guide */}
              <div className="space-y-2 text-xs font-semibold text-slate-700 bg-white/90 p-4 rounded-xl border border-amber-200/80 shadow-sm">
                <p className="font-bold text-slate-900 uppercase text-[11px] tracking-wider">
                  How to whitelist domain ({window.location.hostname}):
                </p>

                <div className="flex items-center justify-between gap-2 p-2 bg-slate-100 rounded-lg font-mono text-[11px] text-slate-800 border border-slate-200">
                  <span className="truncate font-bold">{window.location.hostname}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.hostname);
                      setDomainCopied(true);
                      setTimeout(() => setDomainCopied(false), 2000);
                    }}
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-md text-[10px] font-bold shrink-0 transition-colors shadow-2xs"
                  >
                    {domainCopied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                    {domainCopied ? 'Copied!' : 'Copy Domain'}
                  </button>
                </div>

                <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-slate-600 pt-1">
                  <li>Open <a href="https://console.firebase.google.com/" target="_blank" rel="noreferrer" className="text-emerald-700 font-bold underline inline-flex items-center gap-1">Firebase Console <ExternalLink size={10} /></a></li>
                  <li>Go to <strong>Authentication</strong> &rarr; <strong>Settings</strong> &rarr; <strong>Authorized Domains</strong>.</li>
                  <li>Click <strong>Add Domain</strong>, paste <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-amber-900 font-bold">{window.location.hostname}</code>, and click <strong>Save</strong>.</li>
                  <li>Click <strong>Sign in with Google</strong> above!</li>
                </ol>
              </div>
            </div>
          )}

          {/* Account Authentication Bar */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            {googleUser ? (
              <div className="flex items-center gap-3">
                {googleUser.photoURL ? (
                  <img src={googleUser.photoURL} alt="Profile" className="w-10 h-10 rounded-full border border-slate-300" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
                    {googleUser.displayName?.charAt(0) || 'G'}
                  </div>
                )}
                <div className="text-left">
                  <p className="text-xs font-black text-slate-800 uppercase tracking-wider">{googleUser.displayName || 'Google Account Connected'}</p>
                  <p className="text-[11px] font-semibold text-slate-500">{googleUser.email}</p>
                </div>
              </div>
            ) : (
              <div className="text-left">
                <p className="text-xs font-black text-slate-800 uppercase tracking-wider">Connect Google Account</p>
                <p className="text-[11px] font-semibold text-slate-500">Sign in to sync your terminal data with Google Sheets</p>
              </div>
            )}

            {googleUser ? (
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-black uppercase tracking-wider transition-colors"
              >
                <LogOut size={14} />
                Disconnect
              </button>
            ) : (
              /* Official Google Sign-In Button format as required by skill */
              <button
                onClick={handleSignIn}
                disabled={loading}
                className="flex items-center gap-3 px-5 py-3 bg-white border border-slate-300 rounded-2xl shadow-sm hover:shadow-md active:scale-95 transition-all text-slate-800 font-bold text-xs"
              >
                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5 shrink-0">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                </svg>
                <span>Sign in with Google</span>
              </button>
            )}
          </div>

          {/* Controls when logged in */}
          {googleUser ? (
            <div className="space-y-6">
              {/* Auto-Sync Banner */}
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
                    <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Automatic Live Google Sheets Sync</h4>
                    <p className="text-[11px] font-medium text-slate-500">
                      Keep Google Sheets automatically updated whenever transactions, inventory, or work hours change.
                    </p>
                    {lastSyncedTime && (
                      <p className="text-[10px] font-bold text-emerald-700 mt-0.5">
                        Last Synced: {lastSyncedTime}
                      </p>
                    )}
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={autoSyncEnabled}
                    onChange={(e) => handleAutoSyncToggle(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              {/* Spreadsheet Selector */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Select Google Spreadsheet</label>
                  <button
                    onClick={() => token && loadSpreadsheets(token)}
                    className="text-[10px] font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
                  >
                    <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
                    Refresh Drive Sheets
                  </button>
                </div>

                {spreadsheets.length > 0 ? (
                  <select
                    value={selectedSpreadsheetId}
                    onChange={(e) => handleSpreadsheetSelect(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-black text-slate-800 outline-none focus:border-emerald-500"
                  >
                    {spreadsheets.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} (ID: {s.id.slice(0, 8)}...)
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="p-4 bg-amber-50/50 border border-amber-200/60 rounded-2xl text-xs font-semibold text-amber-800">
                    No Google Spreadsheets found in your Google Drive yet. Click "Create New Google Sheet" below to generate one.
                  </div>
                )}

                {currentSheet && (
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <a
                      href={`https://docs.google.com/spreadsheets/d/${currentSheet.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-600 hover:underline"
                    >
                      <ExternalLink size={14} />
                      Open "{currentSheet.name}" in Google Sheets
                    </a>

                    <button
                      onClick={handleFormatSheet}
                      disabled={loading}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-50 border border-teal-200 hover:bg-teal-100 text-teal-800 text-xs font-bold rounded-lg transition-colors shadow-2xs active:scale-95 disabled:opacity-50"
                    >
                      <FileSpreadsheet size={13} className="text-teal-600" />
                      Apply Table Colors & Styling
                    </button>
                  </div>
                )}
              </div>

              {/* Action Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Create New Sheet & Export */}
                <div className="p-5 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-2xl shadow-lg space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Plus className="w-5 h-5" />
                      <h3 className="font-black text-sm uppercase tracking-wider">New Google Sheet</h3>
                    </div>
                    <p className="text-xs text-emerald-100 font-medium">
                      Creates a dedicated new Google Spreadsheet in your Drive with Transactions, Inventory & Work Hours sheets.
                    </p>
                  </div>
                  <button
                    onClick={handleCreateNewSheetAndExport}
                    disabled={loading}
                    className="w-full py-3 bg-white text-emerald-700 font-black text-xs uppercase tracking-wider rounded-xl shadow hover:bg-emerald-50 active:scale-95 transition-all"
                  >
                    {loading ? 'Creating Sheet...' : 'Create & Sync New Sheet'}
                  </button>
                </div>

                {/* Export to Existing Sheet */}
                <div className="p-5 bg-slate-900 text-white rounded-2xl shadow-lg space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Upload className="w-5 h-5 text-amber-400" />
                      <h3 className="font-black text-sm uppercase tracking-wider">Update Selected Sheet</h3>
                    </div>
                    <p className="text-xs text-slate-300 font-medium">
                      Pushes current terminal data ({transactions.length} sales, {inventory.length} items) into the selected sheet.
                    </p>
                  </div>
                  <button
                    onClick={handleExportToSelectedSheet}
                    disabled={loading || !selectedSpreadsheetId}
                    className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow active:scale-95 transition-all disabled:opacity-50"
                  >
                    {loading ? 'Syncing...' : 'Export to Selected Sheet'}
                  </button>
                </div>
              </div>

              {/* Data Summary Stats */}
              <div className="p-4 bg-slate-100 rounded-2xl border border-slate-200 grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Transactions</p>
                  <p className="text-base font-black text-slate-800">{transactions.length}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Inventory Items</p>
                  <p className="text-base font-black text-slate-800">{inventory.length}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Work Hours</p>
                  <p className="text-base font-black text-slate-800">{workHours.length}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center space-y-3">
              <Database size={40} className="mx-auto text-slate-300" />
              <p className="text-sm font-bold text-slate-600">Please sign in with Google above to unlock Google Sheets sync features.</p>
            </div>
          )}
        </div>

        {/* Confirmation Modal Overlay */}
        <AnimatePresence>
          {confirmAction && (
            <div className="absolute inset-0 z-50 bg-slate-950/70 backdrop-blur-sm p-6 flex items-center justify-center">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 text-center border border-slate-100"
              >
                <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 mx-auto flex items-center justify-center">
                  <Shield size={24} />
                </div>
                <h3 className="text-base font-black text-slate-900 uppercase tracking-wider">{confirmAction.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">{confirmAction.description}</p>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setConfirmAction(null)}
                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs uppercase tracking-wider rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmAction.onConfirm}
                    className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-colors"
                  >
                    Confirm
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
