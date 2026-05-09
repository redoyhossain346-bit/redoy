/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo } from 'react';
import { Calendar } from 'lucide-react';
import Header from './components/Header';
import HeroCard from './components/HeroCard';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import ChartsSection from './components/ChartsSection';
import PasscodeModal from './components/PasscodeModal';
import ChatBot from './components/ChatBot';
import InventoryManager from './components/InventoryManager';
import { Transaction, UserProfile, BudgetSummary, InventoryItem, PartUsage } from './types';
import { storage } from './lib/storage';
import { cn, formatCurrency, uuid } from './lib/utils';
import { format } from 'date-fns';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [user, setUser] = useState<UserProfile>({ name: 'Guest' });
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
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
  const [filterType, setFilterType] = useState<'month' | 'year' | 'all'>('month');
  const [activeView, setActiveView] = useState<'dashboard' | 'inventory'>('dashboard');
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [usageHistory, setUsageHistory] = useState<PartUsage[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    try {
      const savedTransactions = storage.getTransactions();
      const savedUser = storage.getUserProfile();
      const savedLogs = storage.getAuditLogs();
      const savedInventory = storage.getInventory();
      const savedUsage = storage.getPartUsage();
      const savedCategories = storage.getInventoryCategories();
      const savedSession = sessionStorage.getItem('glass_budget_session');
      const persistentSession = localStorage.getItem('keep_logged_in') === 'true';
      
      setTransactions(savedTransactions);
      setUser(savedUser);
      setAuditLogs(savedLogs);
      setInventory(savedInventory);
      setUsageHistory(savedUsage);
      setCategories(savedCategories);
      if (savedSession === 'active' || persistentSession) {
        setIsLoggedIn(true);
        setPasscodeModal(prev => ({ ...prev, isOpen: false }));
      }
    } catch (e) {
      console.error('Initialization failed', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const handleUpdateInventory = (newInventory: InventoryItem[]) => {
    setInventory(newInventory);
    storage.saveInventory(newInventory);
  };

  const handleUpdateUsage = (newUsage: PartUsage[]) => {
    setUsageHistory(newUsage);
    storage.savePartUsage(newUsage);
  };

  const handleUpdateCategories = (newCategories: string[]) => {
    setCategories(newCategories);
    storage.saveInventoryCategories(newCategories);
  };

  const lowStockCount = useMemo(() => {
    return inventory.filter(item => item.quantity <= item.minStock).length;
  }, [inventory]);

  const handleLogout = () => {
    setIsLoggedIn(false);
    sessionStorage.removeItem('glass_budget_session');
    localStorage.removeItem('keep_logged_in');
    setPasscodeModal({
      isOpen: true,
      onSuccess: () => setIsLoggedIn(true),
      allowClose: false
    });
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    sessionStorage.setItem('glass_budget_session', 'active');
    passcodeModal.onSuccess();
  };

  useEffect(() => {
    if (isLoaded) {
      storage.saveTransactions(transactions);
    }
  }, [transactions, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      storage.saveAuditLogs(auditLogs);
    }
  }, [auditLogs, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      storage.saveUserProfile(user);
    }
  }, [user, isLoaded]);

  const filteredTransactions = useMemo(() => {
    if (filterType === 'all') return transactions;
    if (filterType === 'year') return transactions.filter(t => t.date.startsWith(selectedYear));
    return transactions.filter(t => t.date.startsWith(selectedMonth));
  }, [transactions, selectedMonth, selectedYear, filterType]);

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

  const handleAddTransaction = (newT: Omit<Transaction, 'id'>) => {
    if (editingTransaction) {
      setPasscodeModal({
        isOpen: true,
        allowClose: true,
        onSuccess: () => {
          const updated: Transaction = { ...newT, id: editingTransaction.id };
          
          // Log Audit
          const log = {
            id: uuid(),
            timestamp: new Date().toISOString(),
            action: 'EDIT',
            originalData: editingTransaction,
            newData: updated
          };
          
          setAuditLogs(prev => [log, ...prev]);
          setTransactions(prev => prev.map(t => t.id === updated.id ? updated : t));
          setEditingTransaction(null);
        }
      });
    } else {
      const transaction: Transaction = {
        ...newT,
        id: uuid()
      };
      setTransactions(prev => [transaction, ...prev]);
    }
  };

  const handleDeleteTransaction = (id: string) => {
    setPasscodeModal({
      isOpen: true,
      allowClose: true,
      onSuccess: () => {
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
        setTransactions(prev => prev.filter(t => t.id !== id));
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
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 font-bold text-sm">Initializing Management Portal...</p>
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
      />
      
      <PasscodeModal 
        isOpen={passcodeModal.isOpen} 
        onClose={() => {
          if (passcodeModal.allowClose) {
            setPasscodeModal(prev => ({ ...prev, isOpen: false }));
          }
        }}
        onSuccess={handleLoginSuccess}
      />

      {isLoggedIn && (
        <div className="flex gap-1 bg-slate-900/50 p-1 rounded-2xl w-fit mx-auto mt-6 border border-white/5">
          <button
            onClick={() => setActiveView('dashboard')}
            className={cn(
              "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
              activeView === 'dashboard' ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20" : "text-slate-500 hover:text-slate-300"
            )}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveView('inventory')}
            className={cn(
              "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all relative",
              activeView === 'inventory' ? "bg-rose-500 text-white shadow-lg shadow-rose-500/20" : "text-slate-500 hover:text-slate-300"
            )}
          >
            Inventory & Parts
            {lowStockCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[8px] font-bold text-white shadow-lg ring-2 ring-slate-900 border border-rose-400 animate-bounce">
                {lowStockCount}
              </span>
            )}
          </button>
        </div>
      )}
      
      {!isLoggedIn ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-500 text-[10px] font-bold">
          <p>Login required to access cellular records</p>
        </div>
      ) : activeView === 'inventory' ? (
        <div className="mt-8 min-h-[70vh]">
          <InventoryManager 
            inventory={inventory} 
            usageHistory={usageHistory}
            categories={categories}
            onUpdateInventory={handleUpdateInventory}
            onUpdateUsage={handleUpdateUsage}
            onUpdateCategories={handleUpdateCategories}
          />
        </div>
      ) : (
        <>
          {/* Monthly Statement Selection */}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-900/40 border border-white/5 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400">
                <Calendar size={18} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">Statement Period</h2>
                <p className="text-[10px] text-slate-500 leading-none">Filtering all reports</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilterType('all')}
                className={cn(
                  "px-4 py-2 rounded-xl text-[10px] font-bold transition-all",
                  filterType === 'all' ? "bg-slate-700 text-white" : "text-slate-500 hover:text-slate-300"
                )}
              >
                All Time
              </button>
              
              <div className="h-6 w-[1px] bg-white/10 mx-1"></div>

              <div className="flex bg-slate-950/40 p-1 rounded-xl">
                <button
                  onClick={() => setFilterType('month')}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-[9px] font-bold transition-all",
                    filterType === 'month' ? "bg-indigo-500 text-white" : "text-slate-500 hover:text-slate-300"
                  )}
                >
                  Month
                </button>
                <button
                  onClick={() => setFilterType('year')}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-[9px] font-bold transition-all",
                    filterType === 'year' ? "bg-indigo-500 text-white" : "text-slate-500 hover:text-slate-300"
                  )}
                >
                  Year
                </button>
              </div>

              {filterType === 'month' && (
                <input
                  type="month"
                  value={selectedMonth}
                  max="3036-12"
                  onChange={(e) => {
                    setSelectedMonth(e.target.value);
                    setFilterType('month');
                  }}
                  className="glass-input text-[10px] font-bold border-indigo-500/50 text-indigo-400"
                />
              )}

              {filterType === 'year' && (
                <select
                  value={selectedYear}
                  onChange={(e) => {
                    setSelectedYear(e.target.value);
                    setFilterType('year');
                  }}
                  className="glass-input text-[10px] font-bold border-indigo-500/50 text-indigo-400 appearance-none pr-8 bg-slate-900/50"
                >
                  {Array.from({ length: 20 }, (_, i) => 2024 + i).map(year => (
                    <option key={year} value={year.toString()} className="bg-slate-900">{year}</option>
                  ))}
                </select>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 mt-8">
            {/* Left Column: Hero & Form & Tips */}
            <div className="xl:col-span-8 flex flex-col gap-8">
              <HeroCard summary={summary} />
              
              <div className="flex flex-col gap-8">
                <TransactionForm 
                  onAdd={handleAddTransaction} 
                  editingTransaction={editingTransaction}
                  onCancelEdit={() => setEditingTransaction(null)}
                />
              </div>

              <ChartsSection transactions={filteredTransactions} />
            </div>

            {/* Right Column: Transaction List */}
            <div className="xl:col-span-4 max-h-[100vh]">
              <TransactionList 
                transactions={filteredTransactions} 
                onDelete={handleDeleteTransaction} 
                onEdit={handleEditInit}
                onExportAudit={handleExportAudit}
              />
            </div>
          </div>
        </>
      )}

      <footer className="mt-8 pt-6 border-t border-slate-800/50 flex justify-between items-center text-[10px] text-slate-500 font-medium px-2 pb-8">
        <div className="flex items-center gap-4">
            <div className="flex items-center">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 mr-2"></span>
                Local Database Secure & Synced
            </div>
            {deferredPrompt && (
              <button 
                onClick={handleInstallClick}
                className="bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-md border border-indigo-500/20 hover:bg-indigo-500 hover:text-white transition-all cursor-pointer animate-pulse"
              >
                Download/Install App
              </button>
            )}
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="flex space-x-6">
              <span>Session: Active</span>
              <span>v2.1.0</span>
              <span className="text-indigo-400">Last backup: Just now</span>
          </div>
          <div className="text-slate-400 font-bold bg-slate-800/50 px-2 py-0.5 rounded-md mt-1 border border-white/5">
            Operator: <span className="text-white">Cellular01</span>
          </div>
        </div>
      </footer>
      <ChatBot />
    </div>
  );
}
