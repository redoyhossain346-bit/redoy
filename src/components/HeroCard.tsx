import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { BudgetSummary } from '../types';
import { motion } from 'motion/react';

interface HeroCardProps {
  summary: BudgetSummary;
}

export default function HeroCard({ summary }: HeroCardProps) {
  return (
    <div className="mb-0">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 relative overflow-hidden group flex flex-col justify-between h-[210px] border-slate-200 bg-white shadow-sm"
      >
        <div className="absolute -right-8 -top-8 w-40 h-40 bg-amber-500/[0.03] rounded-full blur-3xl group-hover:bg-amber-500/5 transition-all duration-700" />
        <div className="flex items-center justify-between relative z-10">
          <div>
            <p className="text-slate-400 text-xs font-black uppercase tracking-[0.2em] mb-1">Statement Summary</p>
            <h2 className="text-4xl font-black tracking-tight gold-gradient-text">
              {formatCurrency(summary.totalBalance)}
            </h2>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Real-time Asset Monitoring</span>
            </div>
          </div>
          <div className="p-5 rounded-[1.5rem] bg-gradient-to-br from-amber-500/5 to-amber-600/5 border border-amber-500/10 shadow-sm rotate-3 group-hover:rotate-6 transition-transform duration-500">
            <Wallet className="text-amber-600" size={28} />
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-slate-100 relative z-10">
          <div className="space-y-1">
            <span className="text-emerald-600 text-[10px] font-black uppercase tracking-widest opacity-80 flex items-center gap-1.5">
              <div className="w-1 h-1 rounded-full bg-emerald-600" />
              Revenue
            </span>
            <div className="text-lg font-black text-slate-900 leading-none">+{formatCurrency(summary.totalIncome)}</div>
          </div>
          <div className="space-y-1">
            <span className="text-rose-600 text-[10px] font-black uppercase tracking-widest opacity-80 flex items-center gap-1.5">
              <div className="w-1 h-1 rounded-full bg-rose-600" />
              Expenses
            </span>
            <div className="text-lg font-black text-slate-900 leading-none">-{formatCurrency(summary.totalExpenses)}</div>
          </div>
          <div className="space-y-1">
            <span className="text-indigo-600 text-[10px] font-black uppercase tracking-widest opacity-80 flex items-center gap-1.5">
              <div className="w-1 h-1 rounded-full bg-indigo-600" />
              Returns
            </span>
            <div className="text-lg font-black text-slate-900 leading-none">{formatCurrency(summary.totalRefund)}</div>
          </div>
          <div className="space-y-1 border-l border-slate-100 pl-6">
            <span className="text-amber-600/60 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
              <TrendingUp size={10} />
              Status
            </span>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Verified Logs</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
