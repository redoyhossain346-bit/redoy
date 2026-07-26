import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { BudgetSummary } from '../types';
import { motion } from 'motion/react';

interface HeroCardProps {
  summary: BudgetSummary;
}

export default function HeroCard({ summary }: HeroCardProps) {
  return (
    <div className="mb-0 overflow-visible [perspective:1000px]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ 
          rotateX: 5, 
          rotateY: -5,
          scale: 1.02,
          z: 50
        }}
        transition={{ 
          type: "spring", 
          stiffness: 300, 
          damping: 20 
        }}
        className="glass-card p-5 md:p-6 relative overflow-hidden group flex flex-col justify-between min-h-[190px] border-slate-200 bg-white shadow-xl shadow-slate-200/50 [transform-style:preserve-3d]"
      >
        <div className="absolute -right-8 -top-8 w-40 h-40 bg-amber-500/[0.03] rounded-full blur-3xl group-hover:bg-amber-500/5 transition-all duration-700 [transform:translateZ(-10px)]" />
        <div className="flex items-center justify-between relative z-10 [transform:translateZ(30px)]">
          <div>
            <p className="text-slate-400 text-[10px] md:text-xs font-black uppercase tracking-[0.15em] mb-0.5">Statement Summary</p>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight gold-gradient-text">
              {formatCurrency(summary.totalBalance)}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Real-time Asset Monitoring</span>
            </div>
          </div>
          <motion.div 
            whileHover={{ rotate: 12, scale: 1.1 }}
            className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-500/5 to-amber-600/5 border border-amber-500/10 shadow-sm rotate-3 group-hover:rotate-6 transition-transform duration-500"
          >
            <Wallet className="text-amber-600" size={22} />
          </motion.div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-100 relative z-10 [transform:translateZ(20px)]">
          <div className="space-y-0.5">
            <span className="text-emerald-600 text-[9px] font-black uppercase tracking-widest opacity-80 flex items-center gap-1.5">
              <div className="w-1 h-1 rounded-full bg-emerald-600" />
              Revenue
            </span>
            <div className="text-base font-black text-slate-900 leading-none">+{formatCurrency(summary.totalIncome)}</div>
          </div>
          <div className="space-y-0.5">
            <span className="text-rose-600 text-[9px] font-black uppercase tracking-widest opacity-80 flex items-center gap-1.5">
              <div className="w-1 h-1 rounded-full bg-rose-600" />
              Expenses
            </span>
            <div className="text-base font-black text-slate-900 leading-none">-{formatCurrency(summary.totalExpenses)}</div>
          </div>
          <div className="space-y-0.5">
            <span className="text-indigo-600 text-[9px] font-black uppercase tracking-widest opacity-80 flex items-center gap-1.5">
              <div className="w-1 h-1 rounded-full bg-indigo-600" />
              Returns
            </span>
            <div className="text-base font-black text-slate-900 leading-none">{formatCurrency(summary.totalRefund)}</div>
          </div>
          <div className="space-y-0.5 border-l border-slate-100 pl-4">
            <span className="text-amber-600/60 text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5">
              <TrendingUp size={10} />
              Status
            </span>
            <div className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Verified Logs</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
