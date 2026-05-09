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
import { Transaction, UserProfile, BudgetSummary } from './types';
import { storage } from './lib/storage';
import { cn, formatCurrency } from './lib/utils';
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

  useEffect(() => {
    const savedTransactions = storage.getTransactions();
    const savedUser = storage.getUserProfile();
    const savedLogs = storage.getAuditLogs();
    const savedSession = sessionStorage.getItem('glass_budget_session');
    
    setTransactions(savedTransactions);
    setUser(savedUser);
    setAuditLogs(savedLogs);
    if (savedSession === 'active') {
      setIsLoggedIn(true);
      setPasscodeModal(prev => ({ ...prev, isOpen: false }));
    }
    setIsLoaded(true);
  }, []);

  const handleLogout = () => {
    setIsLoggedIn(false);
    sessionStorage.removeItem('glass_budget_session');
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
            id: crypto.randomUUID(),
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
        id: crypto.randomUUID()
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
          id: crypto.randomUUID(),
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

  const handleUpdateUser = (name: string) => {
    setUser({ name });
  };

  if (!isLoaded) return null;

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
      
      {!isLoggedIn ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-500 text-[10px] font-bold">
          <p>Login required to access cellular records</p>
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
        <div className="flex items-center">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 mr-2"></span>
            Local Database Secure & Synced
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
    </div>
  );
}
