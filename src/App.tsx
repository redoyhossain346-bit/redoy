/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo } from 'react';
import { Calendar, Filter, RefreshCw, LogIn, Maximize2, Minimize2, Sliders } from 'lucide-react';
import Header from './components/Header';
import HeroCard from './components/HeroCard';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import PasscodeModal from './components/PasscodeModal';
import ChatBot from './components/ChatBot';
import InventoryManager from './components/InventoryManager';
import WorkHoursTracker from './components/WorkHoursTracker';
import SalesSummary from './components/SalesSummary';
import DailyStatement from './components/DailyStatement';
import GoogleSheetsManagerModal from './components/GoogleSheetsManagerModal';
import GmailManagerModal from './components/GmailManagerModal';
import SettingsModal from './components/SettingsModal';
import PhoneColorCatalog from './components/PhoneColorCatalog';
import LowStockBanner from './components/LowStockBanner';
import { Transaction, UserProfile, BudgetSummary, InventoryItem, PartUsage, WorkHour } from './types';
import { cn, formatCurrency, uuid, generateNextTransactionId } from './lib/utils';
import { format } from 'date-fns';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { localStorageService } from './services/localStorageService';
import { getAccessToken, clearAccessToken, initAuth } from './services/googleSheetsAuth';
import { googleSheetsService } from './services/googleSheetsService';
import { googleDriveBackupService } from './services/googleDriveBackupService';
import { motion } from 'motion/react';

export default function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [user, setUser] = useState<UserProfile>({ name: 'Terminal Admin' });
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [lastLoginTime, setLastLoginTime] = useState<string>(() => {
    const saved = localStorage.getItem('admin_last_login_time');
    if (saved) return saved;
    const now = new Date().toISOString();
    localStorage.setItem('admin_last_login_time', now);
    return now;
  });
  const [authError, setAuthError] = useState<string | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isGoogleSheetsOpen, setIsGoogleSheetsOpen] = useState(false);
  const [isGmailOpen, setIsGmailOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [hasGoogleToken, setHasGoogleToken] = useState<boolean>(!!getAccessToken());

  useEffect(() => {
    const unsub = initAuth(
      () => setHasGoogleToken(true),
      () => setHasGoogleToken(false)
    );
    return () => unsub();
  }, []);
  
  // Passcode Modal State
  const [passcodeModal, setPasscodeModal] = useState<{
    isOpen: boolean;
    onSuccess: () => void;
    allowClose?: boolean;
    title?: string;
    description?: string;
  }>({ 
    isOpen: false, 
    onSuccess: () => {}, 
    allowClose: true,
    title: 'Confirm Deletion',
    description: 'Enter User ID & Password to confirm deletion'
  });
  
  // Statement Filtering
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [filterType, setFilterType] = useState<'month' | 'year' | 'range' | 'all'>('month');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeView, setActiveView] = useState<'dashboard' | 'shift_logs' | 'inventory' | 'phone_colors'>('dashboard');
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [usageHistory, setUsageHistory] = useState<PartUsage[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [workHours, setWorkHours] = useState<WorkHour[]>([]);
  const [taxRate, setTaxRate] = useState<number>(0.081);
  const [isCompactMode, setIsCompactMode] = useState<boolean>(() => {
    return localStorage.getItem('is_compact_mode') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('is_compact_mode', isCompactMode.toString());
    if (isCompactMode) {
      document.documentElement.classList.add('compact-mode');
    } else {
      document.documentElement.classList.remove('compact-mode');
    }
  }, [isCompactMode]);

  useEffect(() => {
    // Initial data load from local storage
    const unsubTransactions = localStorageService.getTransactions(setTransactions);
    const unsubInventory = localStorageService.getInventory(setInventory);
    const unsubWorkHours = localStorageService.getWorkHours(setWorkHours);
    const unsubUsage = localStorageService.getPartUsage(setUsageHistory);
    const unsubCategories = localStorageService.getCategories(setCategories);
    const unsubTaxRate = localStorageService.getTaxRate(setTaxRate);

    setIsLoaded(true);

    return () => {
      unsubTransactions();
      unsubInventory();
      unsubWorkHours();
      unsubUsage();
      unsubCategories();
      unsubTaxRate();
    };
  }, []);

  // Automatic background sync to Google Sheets whenever terminal data changes
  useEffect(() => {
    if (!isLoaded) return;
    const isAutoSync = localStorage.getItem('gsheets_auto_sync_enabled') !== 'false';
    const spreadsheetId = localStorage.getItem('gsheets_selected_id');
    const token = getAccessToken();

    if (isAutoSync && spreadsheetId && token) {
      const timer = setTimeout(async () => {
        try {
          await googleSheetsService.exportAllData(token, spreadsheetId, {
            transactions,
            inventory,
            workHours,
          });
          const syncTime = new Date().toLocaleTimeString();
          localStorage.setItem('gsheets_last_synced', syncTime);
        } catch (err: any) {
          const errMsg = err?.message || String(err);
          if (errMsg.includes('authentication credentials') || errMsg.includes('401') || errMsg.includes('Unauthenticated') || errMsg.includes('invalid grant')) {
            clearAccessToken();
            console.warn('Google Sheets background sync paused: session expired or unauthenticated.');
          } else {
            console.error('Background Google Sheets sync failed:', err);
          }
        }
      }, 2000); // 2 second debounce

      return () => clearTimeout(timer);
    }
  }, [transactions, inventory, workHours, isLoaded]);

  // Automatic recurring silent JSON backup to Google Drive folder
  useEffect(() => {
    if (!isLoaded) return;
    const runBackupCheck = () => {
      googleDriveBackupService.checkAndRunSilentBackup();
    };
    // Check shortly after load
    const timer = setTimeout(runBackupCheck, 3000);
    // Check periodically every 60 seconds
    const interval = setInterval(runBackupCheck, 60 * 1000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [isLoaded]);

  const handleUpdateInventory = async (newInventory: InventoryItem[]) => {
    setInventory(newInventory);
    // Find what changed and save only changed items
    for (const item of newInventory) {
      await localStorageService.saveInventoryItem(item);
    }
  };

  const handleUpdateUsage = async (newUsage: PartUsage[]) => {
    setUsageHistory(newUsage);
    if (newUsage.length > 0) {
      await localStorageService.savePartUsage(newUsage[0]);
    }
  };

  const handleUpdateCategories = async (newCategories: string[]) => {
    setCategories(newCategories);
    const latest = newCategories[newCategories.length - 1];
    if (latest) {
      await localStorageService.saveCategory(latest);
    }
  };

  const handleUpdateWorkHours = async (newHours: WorkHour[]) => {
    setWorkHours(newHours);
    await localStorageService.setAllWorkHours(newHours);
  };

  const handleUpdateTaxRate = async (newRate: number) => {
    setTaxRate(newRate);
    await localStorageService.saveTaxRate(newRate);
  };

  const handleRestoreDatabase = () => {
    localStorageService.getTransactions(setTransactions);
    localStorageService.getInventory(setInventory);
    localStorageService.getWorkHours(setWorkHours);
    localStorageService.getPartUsage(setUsageHistory);
    localStorageService.getCategories(setCategories);
    localStorageService.getTaxRate(setTaxRate);
  };

  const lowStockItems = useMemo(() => {
    return inventory.filter(item => item.quantity <= item.minStock);
  }, [inventory]);

  const lowStockCount = lowStockItems.length;

  const handleLogout = () => {
    setIsLoggedIn(false);
    sessionStorage.removeItem('glass_budget_session');
    setPasscodeModal({
      isOpen: true,
      onSuccess: handleLoginSuccess,
      allowClose: false
    });
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    sessionStorage.setItem('glass_budget_session', 'active');
    const now = new Date().toISOString();
    setLastLoginTime(now);
    localStorage.setItem('admin_last_login_time', now);
  };

  const filteredTransactions = useMemo(() => {
    let result = transactions;

    // Time Based Filter
    if (filterType === 'month') {
      result = result.filter(t => t.date.startsWith(selectedMonth));
    } else if (filterType === 'year') {
      result = result.filter(t => t.date.startsWith(selectedYear));
    } else if (filterType === 'range') {
      result = result.filter(t => {
        const dateStr = t.date ? t.date.slice(0, 10) : '';
        return (!startDate || dateStr >= startDate) && (!endDate || dateStr <= endDate);
      });
    }

    // Payment Method Filter
    if (paymentMethodFilter !== 'all') {
      result = result.filter(t => t.paymentMethod === paymentMethodFilter);
    }

    // Work Status Filter
    if (statusFilter !== 'all') {
      result = result.filter(t => t.workStatus === statusFilter);
    }

    return result;
  }, [transactions, selectedMonth, selectedYear, startDate, endDate, filterType, paymentMethodFilter, statusFilter]);

  const filteredWorkHours = useMemo(() => {
    let result = workHours;

    if (filterType === 'month') {
      result = result.filter(h => h.date.startsWith(selectedMonth));
    } else if (filterType === 'year') {
      result = result.filter(h => h.date.startsWith(selectedYear));
    } else if (filterType === 'range') {
      result = result.filter(h => {
        const dateStr = h.date ? h.date.slice(0, 10) : '';
        return (!startDate || dateStr >= startDate) && (!endDate || dateStr <= endDate);
      });
    }

    return result;
  }, [workHours, selectedMonth, selectedYear, startDate, endDate, filterType]);

  const summary: BudgetSummary = useMemo(() => {
    const totalIncome = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalRefund = filteredTransactions
      .filter(t => t.type === 'refund')
      .reduce((sum, t) => sum + t.amount, 0);
    
    return {
      totalIncome,
      totalExpenses,
      totalRefund,
      totalBalance: totalIncome - (totalExpenses + totalRefund)
    };
  }, [filteredTransactions]);

  const onRequestPasscode = (onConfirm: () => void, title?: string, description?: string) => {
    setPasscodeModal({
      isOpen: true,
      allowClose: true,
      title: title || 'Confirm Deletion',
      description: description || 'Enter User ID & Password to confirm deletion',
      onSuccess: () => {
        onConfirm();
      }
    });
  };

  const handleAddTransaction = async (newT: Omit<Transaction, 'id'>) => {
    if (editingTransaction) {
      const updated: Transaction = { 
        ...newT, 
        id: editingTransaction.id,
        createdAt: editingTransaction.createdAt 
      };
      
      // Log Audit
      const log = {
        id: uuid(),
        timestamp: new Date().toISOString(),
        action: 'EDIT',
        originalData: editingTransaction,
        newData: updated
      };
      
      setAuditLogs(prev => [log, ...prev]);
      await localStorageService.saveTransaction(updated);
      setEditingTransaction(null);
    } else {
      const transaction: Transaction = {
        ...newT,
        id: generateNextTransactionId(transactions)
      };
      await localStorageService.saveTransaction(transaction);
      // Manually refresh local state
      localStorageService.getTransactions(setTransactions);
    }
  };

  const handleUpdateTransaction = async (updated: Transaction) => {
    await localStorageService.saveTransaction(updated);
    localStorageService.getTransactions(setTransactions);
  };

  const handleDeleteTransaction = async (id: string) => {
    onRequestPasscode(
      async () => {
        const original = transactions.find(t => t.id === id);
        if (!original) return;

        // Log Audit
        const log = {
          id: uuid(),
          timestamp: new Date().toISOString(),
          action: 'DELETE',
          originalData: original
        };

        setAuditLogs(prev => [log, ...prev]);
        await localStorageService.deleteTransaction(id);
        // Manually refresh local state
        localStorageService.getTransactions(setTransactions);
      },
      'Delete Entry',
      'Enter User ID & Password to confirm deletion of transaction'
    );
  };

  const handleEditInit = (id: string) => {
    const t = transactions.find(item => item.id === id);
    if (t) {
      setEditingTransaction(t);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleExportAudit = () => {
    setPasscodeModal({
      isOpen: true,
      allowClose: true,
      onSuccess: () => {
        const doc = new jsPDF('l', 'pt', 'a4');
        doc.setTextColor(40, 40, 40);
        doc.setFontSize(18);
        doc.text("All Cellular & Repair - Master History Log (Audited)", 40, 40);
        doc.setFontSize(10);
        doc.text(`Total Records: ${auditLogs.length} | Generated: ${format(new Date(), 'dd MMM yyyy, hh:mm a')}`, 40, 55);

        const tableData = auditLogs.map(log => [
          format(new Date(log.timestamp), 'dd/MM/yy HH:mm'),
          log.action,
          log.originalData.customer?.name || '-',
          log.originalData.category,
          formatCurrency(log.originalData.amount),
          log.newData ? formatCurrency(log.newData.amount) : 'N/A',
          log.newData ? log.newData.workStatus : 'REMOVED'
        ]);

        autoTable(doc, {
          startY: 70,
          head: [['Timestamp', 'Action', 'Customer', 'Category', 'Old Amount', 'New Amount', 'Current Status']],
          body: tableData,
          theme: 'grid',
          headStyles: { fillColor: [51, 65, 85], textColor: 255 },
          styles: { fontSize: 7, cellPadding: 3 }
        });

        doc.save(`AuditHistory_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
      }
    });
  };

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  
  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    }
  };

  const handleUpdateUser = (name: string) => {
    setUser({ name });
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-amber-500/10 border-t-amber-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-amber-500/5 rounded-full animate-pulse" />
            </div>
          </div>
          <p className="text-slate-400 font-black text-xs uppercase tracking-[0.3em] premium-gradient-text">Initializing Systems...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 pb-12">
      <Header 
        user={user} 
        onUpdateUser={handleUpdateUser} 
        isLoggedIn={isLoggedIn}
        onLogin={() => setPasscodeModal({ isOpen: true, onSuccess: handleLoginSuccess, allowClose: true })}
        onLogout={handleLogout}
        onInstall={handleInstallClick}
        isInstallable={!!deferredPrompt}
        onOpenGoogleSheets={() => setIsGoogleSheetsOpen(true)}
        onOpenGmail={() => setIsGmailOpen(true)}
        isSheetsConnected={hasGoogleToken}
        lastLoginTime={lastLoginTime}
        isCompactMode={isCompactMode}
        onToggleCompactMode={() => setIsCompactMode(!isCompactMode)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />
      
      <PasscodeModal 
        isOpen={passcodeModal.isOpen} 
        onClose={() => setPasscodeModal(prev => ({ ...prev, isOpen: false }))}
        onSuccess={() => {
          passcodeModal.onSuccess();
          setPasscodeModal(prev => ({ ...prev, isOpen: false }));
        }}
        allowClose={passcodeModal.allowClose}
        title={passcodeModal.title}
        description={passcodeModal.description}
      />

      <GoogleSheetsManagerModal
        isOpen={isGoogleSheetsOpen}
        onClose={() => setIsGoogleSheetsOpen(false)}
        transactions={transactions}
        inventory={inventory}
        workHours={workHours}
      />

      <GmailManagerModal
        isOpen={isGmailOpen}
        onClose={() => setIsGmailOpen(false)}
        transactions={transactions}
        inventory={inventory}
        workHours={workHours}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onRestoreDatabase={handleRestoreDatabase}
        taxRate={taxRate}
        onUpdateTaxRate={handleUpdateTaxRate}
        isCompactMode={isCompactMode}
        onToggleCompactMode={() => setIsCompactMode(!isCompactMode)}
      />

      <div className="flex gap-2 bg-slate-100/50 p-2 rounded-3xl w-fit mx-auto mt-8 border border-slate-200 backdrop-blur-xl mb-6 flex-wrap justify-center">
        <button
          onClick={() => setActiveView('dashboard')}
          className={cn(
            "px-6 sm:px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-300",
            activeView === 'dashboard' ? "bg-amber-500 text-white shadow-[0_0_25px_rgba(245,158,11,0.2)]" : "text-slate-400 hover:text-slate-700 hover:bg-white"
          )}
        >
          Dashboard
        </button>
        <button
          onClick={() => setActiveView('shift_logs')}
          className={cn(
            "px-6 sm:px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-300",
            activeView === 'shift_logs' ? "bg-emerald-600 text-white shadow-[0_0_25px_rgba(5,150,105,0.2)]" : "text-slate-400 hover:text-slate-700 hover:bg-white"
          )}
        >
          Shift Logs & Hours
        </button>
        <button
          onClick={() => setActiveView('inventory')}
          className={cn(
            "px-6 sm:px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-300 relative",
            activeView === 'inventory' ? "bg-rose-600 text-white shadow-[0_0_25px_rgba(225,29,72,0.2)]" : "text-slate-400 hover:text-slate-700 hover:bg-white"
          )}
        >
          Inventory
          {lowStockCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-600 text-[10px] font-black text-white shadow-lg ring-2 ring-white animate-bounce">
              {lowStockCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveView('phone_colors')}
          className={cn(
            "px-6 sm:px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-300",
            activeView === 'phone_colors' ? "bg-indigo-600 text-white shadow-[0_0_25px_rgba(79,70,229,0.25)] font-bold" : "text-slate-400 hover:text-slate-700 hover:bg-white"
          )}
        >
          Colors & Models
        </button>
      </div>
      
      {activeView === 'phone_colors' ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 min-h-[85vh] w-full"
        >
          <PhoneColorCatalog onOpenGoogleSheets={() => setIsGoogleSheetsOpen(true)} />
        </motion.div>
      ) : activeView === 'inventory' ? (
        <motion.div 
          initial={{ opacity: 0, rotateY: -10 }}
          animate={{ opacity: 1, rotateY: 0 }}
          className="mt-8 min-h-[70vh] [perspective:1200px]"
        >
          <InventoryManager 
            inventory={inventory} 
            usageHistory={usageHistory}
            transactions={transactions}
            categories={categories}
            onUpdateInventory={handleUpdateInventory}
            onUpdateUsage={handleUpdateUsage}
            onUpdateCategories={handleUpdateCategories}
            onRequestPasscode={onRequestPasscode}
          />
        </motion.div>
      ) : activeView === 'shift_logs' ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, rotateX: 5 }}
          animate={{ opacity: 1, scale: 1, rotateX: 0 }}
          className="mt-8 min-h-[70vh] [perspective:1200px]"
        >
          <WorkHoursTracker 
            workHours={workHours}
            onUpdate={handleUpdateWorkHours}
            onRequestPasscode={onRequestPasscode}
          />
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="[perspective:1500px]"
        >
          {/* Automated Low Stock Notification Banner */}
          <LowStockBanner
            lowStockItems={lowStockItems}
            onNavigateToInventory={() => setActiveView('inventory')}
            onAddTransaction={handleAddTransaction}
            onUpdateInventoryItem={(item) => {
              const updated = inventory.map(i => i.id === item.id ? item : i);
              handleUpdateInventory(updated);
            }}
          />

          {/* Top Info Grid: Statement Period & Balance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-10">
            {/* Statement Period Selection */}
            <motion.div 
              whileHover={{ translateZ: 20 }}
              className="glass-card p-5 md:p-6 flex flex-col justify-between min-h-[190px] bg-white border-slate-200 [transform-style:preserve-3d]"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-amber-500/5 rounded-[1.25rem] text-amber-600 border border-amber-500/10 shadow-sm">
                    <Calendar size={28} />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-slate-800 uppercase tracking-tight">Audit Period</h2>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-0.5">Filtering activity</p>
                  </div>
                </div>
                
                <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-200 flex-wrap gap-1">
                  <button
                    onClick={() => setFilterType('month')}
                    className={cn(
                      "px-4 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all uppercase cursor-pointer",
                      filterType === 'month' ? "bg-amber-500 text-white shadow-sm" : "text-slate-400 hover:text-slate-600"
                    )}
                  >
                    Month
                  </button>
                  <button
                    onClick={() => setFilterType('year')}
                    className={cn(
                      "px-4 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all uppercase cursor-pointer",
                      filterType === 'year' ? "bg-amber-500 text-white shadow-sm" : "text-slate-400 hover:text-slate-600"
                    )}
                  >
                    Year
                  </button>
                  <button
                    onClick={() => setFilterType('range')}
                    className={cn(
                      "px-4 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all uppercase cursor-pointer",
                      filterType === 'range' ? "bg-amber-500 text-white shadow-sm" : "text-slate-400 hover:text-slate-600"
                    )}
                  >
                    Range
                  </button>
                  <button
                    onClick={() => setFilterType('all')}
                    className={cn(
                      "px-4 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all uppercase cursor-pointer",
                      filterType === 'all' ? "bg-amber-500 text-white shadow-sm" : "text-slate-400 hover:text-slate-600"
                    )}
                    title="View entire lifetime history across all months and years"
                  >
                    All Time
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-6 pt-6 border-t border-slate-100">
                {filterType === 'all' && (
                  <div className="flex-1 flex items-center justify-center bg-amber-500/10 border border-amber-500/30 rounded-2xl h-14 px-4 text-amber-800 text-xs font-black uppercase tracking-widest">
                    Showing All-Time History ({transactions.length} Total Transactions Logged)
                  </div>
                )}

                {filterType === 'month' && (
                  <div className="flex-1 flex items-center gap-2 flex-wrap sm:flex-nowrap">
                    <button
                      type="button"
                      onClick={() => {
                        const [y, m] = selectedMonth.split('-').map(Number);
                        const d = new Date(y, m - 2, 1);
                        const ny = d.getFullYear();
                        const nm = String(d.getMonth() + 1).padStart(2, '0');
                        setSelectedMonth(`${ny}-${nm}`);
                      }}
                      className="h-14 px-3 sm:px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black uppercase tracking-wider transition-all cursor-pointer border border-slate-200 shrink-0 flex items-center gap-1"
                      title="Previous Month"
                    >
                      ◀ <span className="hidden sm:inline">Prev</span>
                    </button>
                    <div className="relative flex-1 min-w-[150px]">
                      <input
                        type="month"
                        value={selectedMonth}
                        max="3036-12"
                        onChange={(e) => {
                          setSelectedMonth(e.target.value);
                          setFilterType('month');
                        }}
                        className="glass-input h-14 w-full text-sm font-black border-slate-200 text-slate-800 text-center uppercase tracking-widest"
                      />
                      <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[9px] font-black text-amber-600 bg-white px-2 uppercase tracking-widest">Active Month</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const [y, m] = selectedMonth.split('-').map(Number);
                        const d = new Date(y, m, 1);
                        const ny = d.getFullYear();
                        const nm = String(d.getMonth() + 1).padStart(2, '0');
                        setSelectedMonth(`${ny}-${nm}`);
                      }}
                      className="h-14 px-3 sm:px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black uppercase tracking-wider transition-all cursor-pointer border border-slate-200 shrink-0 flex items-center gap-1"
                      title="Next Month"
                    >
                      <span className="hidden sm:inline">Next</span> ▶
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const d = new Date();
                        const lm = new Date(d.getFullYear(), d.getMonth() - 1, 1);
                        const ny = lm.getFullYear();
                        const nm = String(lm.getMonth() + 1).padStart(2, '0');
                        setSelectedMonth(`${ny}-${nm}`);
                      }}
                      className="h-14 px-3.5 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 text-xs font-black uppercase tracking-widest transition-all cursor-pointer shrink-0"
                      title="Quick switch to Last Month's history"
                    >
                      Last Month
                    </button>
                  </div>
                )}

                {filterType === 'year' && (
                  <div className="flex-1">
                    <select
                      value={selectedYear}
                      onChange={(e) => {
                        setSelectedYear(e.target.value);
                        setFilterType('year');
                      }}
                      className="glass-input h-14 w-full text-sm font-black border-slate-200 text-slate-800 appearance-none px-4 bg-white text-center uppercase tracking-widest"
                    >
                      {Array.from({ length: 16 }, (_, i) => 2020 + i).map(year => (
                        <option key={year} value={year.toString()} className="bg-white">{year}</option>
                      ))}
                    </select>
                  </div>
                )}

                {filterType === 'range' && (
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="glass-input h-14 w-full text-[10px] font-black border-slate-200 bg-white text-slate-800 text-center"
                    />
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="glass-input h-14 w-full text-[10px] font-black border-slate-200 bg-white text-slate-800 text-center"
                    />
                  </div>
                )}

                <button
                  onClick={() => setFilterType('all')}
                  className={cn(
                    "px-4 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all",
                    filterType === 'all' ? "bg-slate-800 text-white shadow-sm" : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  All Time
                </button>
              </div>
            </motion.div>

            {/* Total Balance Hero Card */}
            <div className="h-[210px]">
              <HeroCard summary={summary} />
            </div>
          </div>

          <div className="flex flex-col gap-8 mt-8">
            <div className="grid grid-cols-1 gap-8">
              {/* Full-width Advanced Filters Row */}
              <div className="glass-card p-10 border-slate-200 bg-white">
                <div className="w-full flex flex-wrap items-center gap-12">
                  <div className="flex flex-col gap-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] pl-1">Payment Method</label>
                    <div className="flex bg-slate-50 p-2 rounded-3xl border border-slate-200 gap-2">
                      {['all', 'CASH', 'CARD', 'ZELLE'].map((m) => (
                        <button
                          key={m}
                          onClick={() => setPaymentMethodFilter(m)}
                          className={cn(
                            "px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-300",
                            paymentMethodFilter === m 
                              ? "bg-amber-500 text-white shadow-sm" 
                              : "text-slate-400 hover:text-slate-700 hover:bg-white"
                          )}
                        >
                          {m === 'all' ? 'All' : m}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] pl-1">Lifecycle Status</label>
                    <div className="relative">
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="glass-input text-xs font-black border-slate-200 bg-slate-50 appearance-none pl-6 pr-14 h-14 rounded-2xl min-w-[220px] focus:border-amber-500/50 outline-none uppercase tracking-[0.1em]"
                      >
                        <option value="all" className="bg-white">Show All Statuses</option>
                        {['Not Started', 'Working Process', 'Bill Due', 'Pre-Order', 'Return', 'Pickup', 'Paid'].map(s => (
                          <option key={s} value={s} className="bg-white">{s.toUpperCase()}</option>
                        ))}
                      </select>
                      <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-amber-500">
                        <Filter size={20} />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] pl-1">Display Mode</label>
                    <button
                      onClick={() => setIsCompactMode(!isCompactMode)}
                      className={cn(
                        "flex items-center gap-3 px-5 h-14 rounded-2xl font-black text-xs uppercase tracking-wider transition-all duration-300 border cursor-pointer",
                        isCompactMode
                          ? "bg-indigo-600 border-indigo-600 text-white shadow-[0_0_20px_rgba(79,70,229,0.3)]"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                      )}
                      title={isCompactMode ? "Switch to Standard View" : "Switch to Compact View (Fits more rows on screen)"}
                    >
                      {isCompactMode ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                      <div className="text-left leading-tight">
                        <div className="flex items-center gap-2">
                          <span>Compact Mode</span>
                          <span className={cn(
                            "px-2 py-0.5 rounded-full text-[9px] font-black tracking-widest",
                            isCompactMode ? "bg-white text-indigo-700" : "bg-slate-200 text-slate-600"
                          )}>
                            {isCompactMode ? 'ON' : 'OFF'}
                          </span>
                        </div>
                        <p className={cn("text-[9px] font-normal normal-case", isCompactMode ? "text-indigo-100" : "text-slate-400")}>
                          {isCompactMode ? "Reduced padding & font size" : "Spacious standard view"}
                        </p>
                      </div>
                    </button>
                  </div>

                  <div className="flex-1 flex items-end justify-end self-end mb-1">
                    <button
                      onClick={() => {
                        setFilterType('month');
                        setPaymentMethodFilter('all');
                        setStatusFilter('all');
                        setSelectedMonth(new Date().toISOString().slice(0, 7));
                      }}
                      className="group flex items-center gap-3 text-xs font-black text-rose-400 hover:text-rose-300 uppercase tracking-widest transition-all p-3 rounded-xl hover:bg-rose-500/5"
                    >
                      <RefreshCw size={14} className="group-hover:rotate-180 transition-transform duration-500" />
                      Reset All Filters
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Full-width Data Entry Form */}
              <div className="w-full max-w-4xl mx-auto">
                <TransactionForm 
                  onAdd={handleAddTransaction} 
                  editingTransaction={editingTransaction}
                  onCancelEdit={() => setEditingTransaction(null)}
                  currentTaxRate={taxRate}
                  onUpdateTaxRate={handleUpdateTaxRate}
                />
              </div>
            </div>

            {/* Bottom Section: Sales Summary & Recent Activity */}
            <div className="w-full space-y-8">
              <SalesSummary transactions={filteredTransactions} />
              
              <DailyStatement transactions={filteredTransactions} workHours={filteredWorkHours} />

              <TransactionList 
                transactions={filteredTransactions} 
                allTransactions={transactions}
                onDelete={handleDeleteTransaction} 
                onEdit={handleEditInit}
                onExportAudit={handleExportAudit}
                workHours={filteredWorkHours}
                onUpdateTransaction={handleUpdateTransaction}
              />
            </div>
          </div>
        </motion.div>
      )}

      <footer className="mt-8 pt-6 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-400 font-medium px-2 pb-8">
        <div className="flex items-center gap-4">
            <div className="flex items-center">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
                PC Storage Mode Active (Private)
            </div>
            {deferredPrompt && (
              <button 
                onClick={handleInstallClick}
                className="bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded-md border border-amber-500/20 hover:bg-amber-500 hover:text-white transition-all cursor-pointer"
              >
                Download Terminal
              </button>
            )}
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="flex space-x-6">
              <span>Status: Internal</span>
              <span>v2.2.0-local</span>
              <span className="text-amber-600">Free to use forever</span>
          </div>
          <div className="text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded-md mt-1 border border-slate-200">
            Storage: <span className="text-slate-900">This PC Only</span>
          </div>
        </div>
      </footer>
      <ChatBot />
    </div>
  );
}
