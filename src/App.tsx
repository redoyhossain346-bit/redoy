/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo } from 'react';
import { Calendar, Filter, RefreshCw, LogIn } from 'lucide-react';
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
import { Transaction, UserProfile, BudgetSummary, InventoryItem, PartUsage, WorkHour } from './types';
import { cn, formatCurrency, uuid } from './lib/utils';
import { format } from 'date-fns';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { auth, signInWithPopup, googleProvider, signOut } from './lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { firebaseService } from './services/firebaseService';
import { motion } from 'motion/react';

export default function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [user, setUser] = useState<UserProfile>({ name: 'Guest' });
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  
  // Passcode Modal State
  const [passcodeModal, setPasscodeModal] = useState<{
    isOpen: boolean;
    onSuccess: () => void;
    allowClose?: boolean;
  }>({ isOpen: true, onSuccess: () => setIsLoggedIn(true), allowClose: false });
  
  // Statement Filtering
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [filterType, setFilterType] = useState<'month' | 'year' | 'range' | 'all'>('month');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeView, setActiveView] = useState<'dashboard' | 'inventory' | 'hours' | 'daily_log'>('dashboard');
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [usageHistory, setUsageHistory] = useState<PartUsage[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [workHours, setWorkHours] = useState<WorkHour[]>([]);
  const [taxRate, setTaxRate] = useState<number>(0.081);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (fUser) => {
      setFirebaseUser(fUser);
      setIsLoaded(true);
      if (fUser) {
        setIsLoggedIn(true);
        setUser({ name: fUser.displayName || 'Operator' });
        // Ensure modal closes on successful auth
        setPasscodeModal(prev => ({ ...prev, isOpen: false }));
      } else {
        setIsLoggedIn(false);
        setUser({ name: 'Guest' });
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!firebaseUser) {
      setTransactions([]);
      setInventory([]);
      setUsageHistory([]);
      setWorkHours([]);
      return;
    }

    const unsubTransactions = firebaseService.getTransactions(firebaseUser.uid, setTransactions);
    const unsubInventory = firebaseService.getInventory(firebaseUser.uid, setInventory);
    const unsubWorkHours = firebaseService.getWorkHours(firebaseUser.uid, setWorkHours);
    const unsubUsage = firebaseService.getPartUsage(firebaseUser.uid, setUsageHistory);
    const unsubCategories = firebaseService.getCategories(firebaseUser.uid, setCategories);
    const unsubTaxRate = firebaseService.getTaxRate(firebaseUser.uid, setTaxRate);

    return () => {
      unsubTransactions();
      unsubInventory();
      unsubWorkHours();
      unsubUsage();
      unsubCategories();
      unsubTaxRate();
    };
  }, [firebaseUser]);

  const handleUpdateInventory = async (newInventory: InventoryItem[]) => {
    if (!firebaseUser) return;
    setInventory(newInventory);
    // Find what changed and save only changed items
    for (const item of newInventory) {
      await firebaseService.saveInventoryItem(firebaseUser.uid, item);
    }
  };

  const handleUpdateUsage = async (newUsage: PartUsage[]) => {
    if (!firebaseUser) return;
    setUsageHistory(newUsage);
    if (newUsage.length > 0) {
      await firebaseService.savePartUsage(firebaseUser.uid, newUsage[0]);
    }
  };

  const handleUpdateCategories = async (newCategories: string[]) => {
    if (!firebaseUser) return;
    setCategories(newCategories);
    const latest = newCategories[newCategories.length - 1];
    if (latest) {
      await firebaseService.saveCategory(firebaseUser.uid, latest);
    }
  };

  const handleUpdateWorkHours = async (newHours: WorkHour[]) => {
    if (!firebaseUser) return;
    setWorkHours(newHours);
    if (newHours.length > 0) {
      await firebaseService.saveWorkHour(firebaseUser.uid, newHours[0]);
    }
  };

  const handleUpdateTaxRate = async (newRate: number) => {
    if (!firebaseUser) return;
    setTaxRate(newRate);
    await firebaseService.saveTaxRate(firebaseUser.uid, newRate);
  };

  const lowStockCount = useMemo(() => {
    return inventory.filter(item => item.quantity <= item.minStock).length;
  }, [inventory]);

  const handleLogout = async () => {
    await signOut(auth);
    setIsLoggedIn(false);
    sessionStorage.removeItem('glass_budget_session');
    localStorage.removeItem('keep_logged_in');
    setPasscodeModal({
      isOpen: true,
      onSuccess: () => setIsLoggedIn(true),
      allowClose: false
    });
  };

  const handleGoogleSignIn = async () => {
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
      setPasscodeModal(prev => ({ ...prev, isOpen: false }));
    } catch (error: any) {
      console.error('Login failed', error);
      let message = 'Login failed';
      if (error.code === 'auth/unauthorized-domain') {
        message = `Unauthorized Domain: Please add "${window.location.hostname}" to authorized domains in Firebase Console.`;
      } else if (error.code === 'auth/popup-blocked') {
        message = 'Popup blocked by browser. Please allow popups for this site.';
      } else {
        message = error.message || 'Unknown authentication error';
      }
      setAuthError(message);
    }
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    sessionStorage.setItem('glass_budget_session', 'active');
  };

  const filteredTransactions = useMemo(() => {
    let result = transactions;

    // Time Based Filter
    if (filterType === 'month') {
      result = result.filter(t => t.date.startsWith(selectedMonth));
    } else if (filterType === 'year') {
      result = result.filter(t => t.date.startsWith(selectedYear));
    } else if (filterType === 'range') {
      result = result.filter(t => t.date >= startDate && t.date <= endDate);
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

  const handleAddTransaction = async (newT: Omit<Transaction, 'id'>) => {
    if (!firebaseUser) return;
    
    if (editingTransaction) {
      setPasscodeModal({
        isOpen: true,
        allowClose: true,
        onSuccess: async () => {
          const updated: Transaction = { 
            ...newT, 
            id: editingTransaction.id,
            createdAt: editingTransaction.createdAt 
          };
          
          // Log Audit (Client-side sync for now, should ideally be firestore collection too if needed)
          const log = {
            id: uuid(),
            timestamp: new Date().toISOString(),
            action: 'EDIT',
            originalData: editingTransaction,
            newData: updated
          };
          
          setAuditLogs(prev => [log, ...prev]);
          await firebaseService.saveTransaction(firebaseUser.uid, updated);
          setEditingTransaction(null);
          setPasscodeModal(prev => ({ ...prev, isOpen: false }));
        }
      });
    } else {
      const transaction: Transaction = {
        ...newT,
        id: uuid()
      };
      await firebaseService.saveTransaction(firebaseUser.uid, transaction);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!firebaseUser) return;
    
    setPasscodeModal({
      isOpen: true,
      allowClose: true,
      onSuccess: async () => {
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
        await firebaseService.deleteTransaction(id);
        setPasscodeModal(prev => ({ ...prev, isOpen: false }));
      }
    });
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
      />
      
      <PasscodeModal 
        isOpen={passcodeModal.isOpen} 
        onClose={() => setPasscodeModal(prev => ({ ...prev, isOpen: false }))}
        onSuccess={handleLoginSuccess}
        allowClose={passcodeModal.allowClose}
      />

      {isLoggedIn && (
        <div className="flex gap-2 bg-slate-100/50 p-2 rounded-3xl w-fit mx-auto mt-8 border border-slate-200 backdrop-blur-xl mb-6">
          <button
            onClick={() => setActiveView('dashboard')}
            className={cn(
              "px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-300",
              activeView === 'dashboard' ? "bg-amber-500 text-white shadow-[0_0_25px_rgba(245,158,11,0.2)]" : "text-slate-400 hover:text-slate-700 hover:bg-white"
            )}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveView('hours')}
            className={cn(
              "px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-300",
              activeView === 'hours' ? "bg-indigo-600 text-white shadow-[0_0_25px_rgba(79,70,229,0.2)]" : "text-slate-400 hover:text-slate-700 hover:bg-white"
            )}
          >
            Shift Logs
          </button>
          <button
            onClick={() => setActiveView('daily_log')}
            className={cn(
              "px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-300",
              activeView === 'daily_log' ? "bg-emerald-600 text-white shadow-[0_0_25px_rgba(5,150,105,0.2)]" : "text-slate-400 hover:text-slate-700 hover:bg-white"
            )}
          >
            Daily Sheet
          </button>
          <button
            onClick={() => setActiveView('inventory')}
            className={cn(
              "px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-300 relative",
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
        </div>
      )}
      
      {!isLoggedIn ? (
        <motion.div 
          initial={{ opacity: 0, rotateX: 20, z: -100 }}
          animate={{ opacity: 1, rotateX: 0, z: 0 }}
          className="flex flex-col items-center justify-center min-h-[60vh] gap-8 [perspective:1000px]"
        >
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-black text-slate-800 uppercase tracking-widest">Gmail Verification Required</h2>
            <p className="text-xs text-slate-400 font-medium">Please sign in with your Gmail account to access terminal data</p>
          </div>

          {authError && (
            <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl max-w-md text-center">
              <p className="text-rose-500 text-[10px] font-black uppercase tracking-widest leading-relaxed">
                {authError}
              </p>
            </div>
          )}

          <button 
            onClick={handleGoogleSignIn}
            className="flex items-center gap-4 bg-white border border-slate-200 px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all active:scale-95 group"
          >
            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:scale-110 transition-transform">
              <LogIn size={20} className="text-slate-600" />
            </div>
            <span className="text-sm font-black text-slate-800 uppercase tracking-widest">Sign in with Google (Gmail)</span>
          </button>
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
            categories={categories}
            onUpdateInventory={handleUpdateInventory}
            onUpdateUsage={handleUpdateUsage}
            onUpdateCategories={handleUpdateCategories}
          />
        </motion.div>
      ) : activeView === 'hours' ? (
        <motion.div 
          initial={{ opacity: 0, rotateY: 10 }}
          animate={{ opacity: 1, rotateY: 0 }}
          className="mt-8 min-h-[70vh] [perspective:1200px]"
        >
          <WorkHoursTracker 
            workHours={workHours}
            onUpdate={handleUpdateWorkHours}
          />
        </motion.div>
      ) : activeView === 'daily_log' ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, rotateX: 5 }}
          animate={{ opacity: 1, scale: 1, rotateX: 0 }}
          className="mt-8 min-h-[70vh] [perspective:1200px]"
        >
          <DailyStatement 
            transactions={transactions}
            workHours={workHours}
          />
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="[perspective:1500px]"
        >
          {/* Top Info Grid: Statement Period & Balance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-10">
            {/* Statement Period Selection */}
            <motion.div 
              whileHover={{ translateZ: 20 }}
              className="glass-card p-8 flex flex-col justify-between h-[210px] bg-white border-slate-200 [transform-style:preserve-3d]"
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
                
                <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-200">
                  <button
                    onClick={() => setFilterType('month')}
                    className={cn(
                      "px-4 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all uppercase",
                      filterType === 'month' ? "bg-amber-500 text-white shadow-sm" : "text-slate-400 hover:text-slate-600"
                    )}
                  >
                    Month
                  </button>
                  <button
                    onClick={() => setFilterType('year')}
                    className={cn(
                      "px-4 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all uppercase",
                      filterType === 'year' ? "bg-amber-500 text-white shadow-sm" : "text-slate-400 hover:text-slate-600"
                    )}
                  >
                    Year
                  </button>
                  <button
                    onClick={() => setFilterType('range')}
                    className={cn(
                      "px-4 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all uppercase",
                      filterType === 'range' ? "bg-amber-500 text-white shadow-sm" : "text-slate-400 hover:text-slate-600"
                    )}
                  >
                    Range
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-6 pt-6 border-t border-slate-100">
                {filterType === 'month' && (
                  <div className="flex-1">
                    <div className="relative">
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
                      {Array.from({ length: 20 }, (_, i) => 2024 + i).map(year => (
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
                        className="glass-input text-xs font-black border-slate-200 bg-slate-50 appearance-none pl-6 pr-14 h-14 rounded-2xl min-w-[240px] focus:border-amber-500/50 outline-none uppercase tracking-[0.1em]"
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
              
              <TransactionList 
                transactions={filteredTransactions} 
                onDelete={handleDeleteTransaction} 
                onEdit={handleEditInit}
                onExportAudit={handleExportAudit}
              />
            </div>
          </div>
        </motion.div>
      )}

      <footer className="mt-8 pt-6 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-400 font-medium px-2 pb-8">
        <div className="flex items-center gap-4">
            <div className="flex items-center">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
                Real-time Cloud Sync Active
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
              <span>Status: Online</span>
              <span>v2.1.0</span>
              <span className="text-amber-600">Last backup: Just now</span>
          </div>
          <div className="text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded-md mt-1 border border-slate-200">
            Operator: <span className="text-slate-900">Cellular01</span>
          </div>
        </div>
      </footer>
      <ChatBot />
    </div>
  );
}
