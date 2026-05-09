import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { BudgetSummary } from '../types';
import { motion } from 'motion/react';

interface HeroCardProps {
  summary: BudgetSummary;
}

export default function HeroCard({ summary }: HeroCardProps) {
  return (
    <div className="mb-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 relative overflow-hidden group flex flex-col justify-between h-48"
      >
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all duration-500" />
        <div className="flex items-center justify-between relative z-10">
          <div>
            <p className="text-slate-400 text-sm font-medium">Total Balance</p>
            <h2 className="text-4xl font-bold tracking-tighter">
              {formatCurrency(summary.totalBalance)}
            </h2>
          </div>
          <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
            <Wallet className="text-indigo-400" size={24} />
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-800/50 relative z-10">
          <div className="space-y-1">
            <span className="text-emerald-500 text-[10px] font-bold uppercase tracking-wide">Total Income</span>
            <div className="text-lg font-semibold truncate">+{formatCurrency(summary.totalIncome)}</div>
          </div>
          <div className="space-y-1">
            <span className="text-rose-500 text-[10px] font-bold uppercase tracking-wide">Total Expense</span>
            <div className="text-lg font-semibold truncate">-{formatCurrency(summary.totalExpenses)}</div>
          </div>
          <div className="space-y-1">
            <span className="text-indigo-400 text-[10px] font-bold uppercase tracking-wide">Total Refund</span>
            <div className="text-lg font-semibold truncate">-{formatCurrency(summary.totalRefund)}</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
