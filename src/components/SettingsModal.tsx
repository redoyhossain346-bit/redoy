import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Database,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
  Settings,
  FileJson,
  Percent,
  Maximize2,
  Minimize2,
  HardDrive,
  ShieldAlert,
  Clock,
  RefreshCw,
  Cloud,
  FolderPlus,
  Folder,
  LogIn,
  LogOut,
  Play
} from 'lucide-react';
import { localStorageService } from '../services/localStorageService';
import { format } from 'date-fns';
import { cn } from '../lib/utils';
import { User } from 'firebase/auth';
import { googleSignIn, logoutGoogle, initAuth } from '../services/googleSheetsAuth';
import { googleDriveBackupService, DriveFolder, DriveBackupConfig } from '../services/googleDriveBackupService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRestoreDatabase: () => void;
  taxRate?: number;
  onUpdateTaxRate?: (rate: number) => void;
  isCompactMode?: boolean;
  onToggleCompactMode?: () => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  onRestoreDatabase,
  taxRate = 0.081,
  onUpdateTaxRate,
  isCompactMode = false,
  onToggleCompactMode,
}: SettingsModalProps) {
  const [statusMessage, setStatusMessage] = useState<{
    text: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [localTaxRateInput, setLocalTaxRateInput] = useState((taxRate * 100).toFixed(2));
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Google Drive Recurring Silent Backup State
  const [googleUser, setGoogleUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [driveFolders, setDriveFolders] = useState<DriveFolder[]>([]);
  const [loadingFolders, setLoadingFolders] = useState<boolean>(false);
  const [backupConfig, setBackupConfig] = useState<DriveBackupConfig>(() =>
    googleDriveBackupService.getConfig()
  );
  const [isRunningManualBackup, setIsRunningManualBackup] = useState<boolean>(false);
  const [isCreatingFolder, setIsCreatingFolder] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) return;
    const unsub = initAuth((u, tok) => {
      setGoogleUser(u);
      setToken(tok);
      loadDriveFolders(tok);
    });
    setBackupConfig(googleDriveBackupService.getConfig());
    return () => {
      if (unsub && typeof unsub === 'function') unsub();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const showStatus = (text: string, type: 'success' | 'error' | 'info') => {
    setStatusMessage({ text, type });
    setTimeout(() => {
      setStatusMessage(null);
    }, 6000);
  };

  const loadDriveFolders = async (tok: string) => {
    try {
      setLoadingFolders(true);
      const folders = await googleDriveBackupService.listFolders(tok);
      setDriveFolders(folders);
    } catch (err: any) {
      console.error('Failed to list Drive folders:', err);
    } finally {
      setLoadingFolders(false);
    }
  };

  const handleGoogleConnect = async () => {
    try {
      const res = await googleSignIn();
      if (res) {
        setGoogleUser(res.user);
        setToken(res.accessToken);
        showStatus(`Connected to Google Drive as ${res.user.displayName || res.user.email}`, 'success');
        loadDriveFolders(res.accessToken);
      }
    } catch (err: any) {
      showStatus(err?.message || 'Failed to connect Google Account', 'error');
    }
  };

  const handleGoogleDisconnect = async () => {
    await logoutGoogle();
    setGoogleUser(null);
    setToken(null);
    showStatus('Disconnected Google Drive account.', 'info');
  };

  const handleCreateBackupFolder = async () => {
    if (!token) {
      showStatus('Please connect your Google Account first.', 'error');
      return;
    }
    try {
      setIsCreatingFolder(true);
      const newFolder = await googleDriveBackupService.createFolder(
        token,
        'All Cellular & Repair Backups'
      );
      setDriveFolders((prev) => [newFolder, ...prev]);
      const updated = googleDriveBackupService.saveConfig({
        folderId: newFolder.id,
        folderName: newFolder.name,
      });
      setBackupConfig(updated);
      showStatus(`Created and selected folder "${newFolder.name}" in your Google Drive!`, 'success');
    } catch (err: any) {
      showStatus(err?.message || 'Failed to create Google Drive folder', 'error');
    } finally {
      setIsCreatingFolder(false);
    }
  };

  const handleFolderChange = (folderId: string) => {
    const folder = driveFolders.find((f) => f.id === folderId);
    const updated = googleDriveBackupService.saveConfig({
      folderId,
      folderName: folder ? folder.name : '',
    });
    setBackupConfig(updated);
    showStatus(`Selected backup folder: ${folder?.name || 'Drive Folder'}`, 'success');
  };

  const formatIntervalLabel = (minutes: number): string => {
    if (minutes === 30) return '30 Minutes';
    if (minutes === 60) return '1 Hour';
    if (minutes === 360) return '6 Hours';
    if (minutes === 720) return '12 Hours';
    if (minutes === 1440) return '24 Hours (Daily)';
    if (minutes === 10080) return '7 Days (Weekly)';
    return `${minutes} Minutes`;
  };

  const handleToggleBackupEnabled = (enabled: boolean) => {
    if (enabled && !backupConfig.folderId) {
      showStatus('Please select or create a Google Drive folder first.', 'error');
      return;
    }
    const updated = googleDriveBackupService.saveConfig({ enabled });
    setBackupConfig(updated);
    showStatus(
      enabled
        ? `Recurring silent export enabled (${formatIntervalLabel(updated.intervalMinutes)}).`
        : 'Recurring silent export disabled.',
      'info'
    );
  };

  const handleIntervalChange = (minutes: number) => {
    const updated = googleDriveBackupService.saveConfig({ intervalMinutes: minutes });
    setBackupConfig(updated);
    showStatus(`Recurring backup interval set to ${formatIntervalLabel(minutes)}.`, 'info');
  };

  const handleRunSilentBackupNow = async () => {
    try {
      setIsRunningManualBackup(true);
      const result = await googleDriveBackupService.runBackupNow(token || undefined);
      if (result.success) {
        showStatus(result.message, 'success');
        setBackupConfig(googleDriveBackupService.getConfig());
      }
    } catch (err: any) {
      showStatus(err?.message || 'Failed to execute silent backup', 'error');
    } finally {
      setIsRunningManualBackup(false);
    }
  };

  const handleExportDatabase = () => {
    try {
      setIsExporting(true);
      const dbData = localStorageService.exportFullDatabase();
      const jsonString = JSON.stringify(dbData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);

      const downloadLink = document.createElement('a');
      downloadLink.href = url;
      downloadLink.download = `All_Cellular_Terminal_Database_Backup_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.json`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      window.URL.revokeObjectURL(url);

      showStatus(
        `Export Full Database completed! Backup saved (${dbData.transactions?.length || 0} transactions, ${dbData.inventory?.length || 0} inventory items).`,
        'success'
      );
    } catch (err: any) {
      showStatus(err?.message || 'Failed to export full database.', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const text = await file.text();
      let parsedData: any;
      try {
        parsedData = JSON.parse(text);
      } catch {
        throw new Error('The selected file is not valid JSON format.');
      }

      const result = localStorageService.importFullDatabase(parsedData);
      if (result.success) {
        showStatus(result.message, 'success');
        onRestoreDatabase();
      } else {
        showStatus(result.message, 'error');
      }
    } catch (err: any) {
      showStatus(err?.message || 'Failed to read or restore database file.', 'error');
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleTaxRateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(localTaxRateInput);
    if (isNaN(parsed) || parsed < 0 || parsed > 100) {
      showStatus('Please enter a valid tax percentage between 0 and 100.', 'error');
      return;
    }
    const rateDecimal = parsed / 100;
    if (onUpdateTaxRate) {
      onUpdateTaxRate(rateDecimal);
    }
    showStatus(`Default store tax rate updated to ${parsed.toFixed(2)}%`, 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
              <Settings size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight">Terminal Settings & Database</h2>
                <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-bold uppercase tracking-wider">
                  Admin Control
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium">
                Manage database backup, restoration, tax configuration & terminal view preferences
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
            title="Close Settings"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-8 max-h-[80vh] overflow-y-auto">
          {/* Status Message Alert */}
          <AnimatePresence>
            {statusMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={cn(
                  "p-4 rounded-2xl border text-xs font-semibold flex items-center gap-3",
                  statusMessage.type === 'success' && "bg-emerald-50 text-emerald-800 border-emerald-200",
                  statusMessage.type === 'error' && "bg-rose-50 text-rose-800 border-rose-200",
                  statusMessage.type === 'info' && "bg-blue-50 text-blue-800 border-blue-200"
                )}
              >
                {statusMessage.type === 'success' ? (
                  <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle size={18} className="text-rose-600 shrink-0" />
                )}
                <span className="flex-1">{statusMessage.text}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* SECTION 1: DATABASE EXPORT & IMPORT */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <Database size={18} className="text-amber-500" />
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                  Database Backup & Restoration
                </h3>
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
                JSON File Archive
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Export Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100/80 border border-slate-200/80 flex flex-col justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                      <Download size={16} />
                    </div>
                    <span className="text-xs font-black text-slate-800 uppercase tracking-wide">
                      Export Full Database
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Export all store transactions, inventory parts, phone variants, work hours logs, and tax configurations into a self-contained <span className="font-mono font-bold text-slate-800">.json</span> file.
                  </p>
                </div>

                <button
                  onClick={handleExportDatabase}
                  disabled={isExporting}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  <FileJson size={16} />
                  <span>{isExporting ? 'Exporting...' : 'Export Full Database'}</span>
                </button>
              </div>

              {/* Import Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100/80 border border-slate-200/80 flex flex-col justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                      <Upload size={16} />
                    </div>
                    <span className="text-xs font-black text-slate-800 uppercase tracking-wide">
                      Import Database
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Restore application state from a local JSON backup file. This replaces current local terminal data with the archive records and refreshes the display.
                  </p>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept=".json,application/json"
                  className="hidden"
                />

                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isImporting}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  <HardDrive size={16} />
                  <span>{isImporting ? 'Restoring Database...' : 'Import Database'}</span>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-amber-50/70 border border-amber-200/60 text-amber-800 text-xs font-medium">
              <ShieldAlert size={15} className="text-amber-600 shrink-0" />
              <span>
                <strong>Tip:</strong> Regular JSON backups ensure zero data loss across devices or browser clearing.
              </span>
            </div>
          </div>

          {/* SECTION 2: RECURRING GOOGLE DRIVE JSON BACKUP */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <Cloud size={18} className="text-blue-600" />
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                  Recurring Google Drive JSON Backup
                </h3>
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full">
                Silent Automated Export
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100/80 border border-slate-200/80 space-y-4">
              {/* Google Account Connection Status */}
              <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-slate-200/70">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
                    <Cloud size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-900 uppercase tracking-wide">
                        Google Drive Cloud Storage
                      </span>
                      {googleUser ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-black">
                          Connected
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 text-[10px] font-bold">
                          Not Connected
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      {googleUser
                        ? `Linked to ${googleUser.displayName || googleUser.email}`
                        : 'Connect your Google Account to schedule recurring, silent JSON data backups to a Drive folder.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {googleUser ? (
                    <>
                      <button
                        type="button"
                        onClick={() => token && loadDriveFolders(token)}
                        disabled={loadingFolders}
                        className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <RefreshCw size={13} className={loadingFolders ? 'animate-spin' : ''} />
                        <span>Refresh Folders</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleGoogleDisconnect}
                        className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <LogOut size={13} />
                        <span>Disconnect</span>
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={handleGoogleConnect}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                    >
                      <LogIn size={15} />
                      <span>Connect Google Drive</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Folder Selection & Schedule Config (Only visible when connected) */}
              {googleUser && (
                <div className="space-y-4 pt-1">
                  {/* Folder selection */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                        <Folder size={13} className="text-amber-500" />
                        <span>Target Google Drive Folder</span>
                      </label>
                      <div className="flex items-center gap-2">
                        <select
                          value={backupConfig.folderId}
                          onChange={(e) => handleFolderChange(e.target.value)}
                          className="flex-1 px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                        >
                          <option value="">-- Select or Create Backup Folder --</option>
                          {driveFolders.map((f) => (
                            <option key={f.id} value={f.id}>
                              {f.name}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={handleCreateBackupFolder}
                          disabled={isCreatingFolder}
                          title="Create a new 'All Cellular & Repair Backups' folder in your Drive"
                          className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer disabled:opacity-50"
                        >
                          <FolderPlus size={14} />
                          <span>{isCreatingFolder ? 'Creating...' : '+ New Folder'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Interval selection */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                        <Clock size={13} className="text-blue-500" />
                        <span>Silent Export Schedule Interval</span>
                      </label>
                      <select
                        value={backupConfig.intervalMinutes}
                        onChange={(e) => handleIntervalChange(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                      >
                        <option value={30}>Every 30 Minutes</option>
                        <option value={60}>Every 1 Hour</option>
                        <option value={360}>Every 6 Hours</option>
                        <option value={720}>Every 12 Hours</option>
                        <option value={1440}>Every 24 Hours (Daily)</option>
                        <option value={10080}>Every 7 Days (Weekly)</option>
                      </select>
                    </div>
                  </div>

                  {/* Enable toggle & immediate trigger */}
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-white border border-slate-200 flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input
                          type="checkbox"
                          checked={backupConfig.enabled}
                          onChange={(e) => handleToggleBackupEnabled(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                      <div>
                        <div className="text-xs font-black text-slate-900 uppercase tracking-wide">
                          Recurring Silent Export {backupConfig.enabled ? 'Enabled' : 'Disabled'}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {backupConfig.enabled
                            ? `Automated JSON exports run silently in background. Last Run: ${backupConfig.lastBackupTime || 'Not run yet'}`
                            : 'Enable to automatically upload backup snapshots to Google Drive without disrupting work.'}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleRunSilentBackupNow}
                      disabled={isRunningManualBackup || !backupConfig.folderId}
                      className={cn(
                        "px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-xs",
                        backupConfig.folderId
                          ? "bg-blue-600 hover:bg-blue-700 text-white"
                          : "bg-slate-100 text-slate-400 cursor-not-allowed"
                      )}
                    >
                      <Play size={13} />
                      <span>{isRunningManualBackup ? 'Exporting...' : 'Run Backup Now'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* SECTION 3: TERMINAL CONFIGURATION & DISPLAY PREFERENCES */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <Settings size={18} className="text-slate-700" />
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                  Terminal Preferences & Taxes
                </h3>
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
                Customization
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Default Tax Rate Setting */}
              <form
                onSubmit={handleTaxRateSubmit}
                className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                    <Percent size={14} className="text-amber-500" />
                    <span>Store Tax Rate (%)</span>
                  </label>
                  <span className="text-[10px] text-slate-400 font-medium">Current: {(taxRate * 100).toFixed(2)}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={localTaxRateInput}
                      onChange={(e) => setLocalTaxRateInput(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-800 text-sm focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
                      placeholder="8.10"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                      %
                    </span>
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-black uppercase tracking-wider hover:bg-slate-800 transition-all cursor-pointer"
                  >
                    Save
                  </button>
                </div>
                <p className="text-[11px] text-slate-500">
                  Applied by default when creating new customer transaction receipts.
                </p>
              </form>

              {/* Compact Mode Toggle */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                      {isCompactMode ? <Minimize2 size={14} className="text-indigo-600" /> : <Maximize2 size={14} className="text-slate-600" />}
                      <span>Compact Table Density</span>
                    </span>
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider",
                        isCompactMode
                          ? "bg-indigo-100 text-indigo-800"
                          : "bg-slate-100 text-slate-600"
                      )}
                    >
                      {isCompactMode ? 'Active' : 'Standard'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Tightens padding across transaction tables and inventory cards to fit more records on screen.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={onToggleCompactMode}
                  className={cn(
                    "w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer",
                    isCompactMode
                      ? "bg-indigo-600 text-white shadow-md hover:bg-indigo-700"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  )}
                >
                  {isCompactMode ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                  <span>{isCompactMode ? 'Switch to Standard Density' : 'Enable Compact Density'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-200/80">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <Clock size={14} className="text-slate-400" />
            <span>All Cellular & Repair — Terminal Configuration</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-xs"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
}
