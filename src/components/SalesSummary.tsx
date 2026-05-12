import { useMemo } from 'react';
import { Transaction, Category } from '../types';
import { cn } from '../lib/utils';
import { Smartphone, Shield, Package, ShoppingBag, Layers } from 'lucide-react';
import { motion } from 'motion/react';

interface SalesSummaryProps {
  transactions: Transaction[];
}

export default function SalesSummary({ transactions }: SalesSummaryProps) {
  const stats = useMemo(() => {
    const summary: Record<string, { count: number; revenue: number }> = {};
    
    transactions.forEach(t => {
      if (t.type !== 'income') return;
      
      t.items?.forEach(item => {
        const cat = item.category;
        if (!summary[cat]) {
          summary[cat] = { count: 0, revenue: 0 };
        }
        summary[cat].count += item.quantity || 1;
        summary[cat].revenue += (item.amount * (item.quantity || 1));
      });
    });
    
    return Object.entries(summary)
      .sort((a, b) => b[1].count - a[1].count);
  }, [transactions]);

  const getIcon = (category: string) => {
    if (category.toLowerCase().includes('phone')) return <Smartphone size={14} />;
    if (category.toLowerCase().includes('glass') || category.toLowerCase().includes('protector')) return <Shield size={14} />;
    if (category.toLowerCase().includes('case') || category.toLowerCase().includes('accessory')) return <ShoppingBag size={14} />;
    if (category.toLowerCase().includes('parts') || category.toLowerCase().includes('repair')) return <Layers size={14} />;
    return <Package size={14} />;
  };

  if (stats.length === 0) return null;

  return (
    <div className="glass-card overflow-hidden bg-white border-slate-200 shadow-sm [perspective:1000px]">
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
        <h3 className="text-[10px] font-black text-amber-600 uppercase tracking-[0.3em]">Lifecycle Metrics & Velocity</h3>
      </div>
      <div className="p-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 [transform-style:preserve-3d]">
        {stats.map(([category, data]) => (
          <motion.div 
            key={category} 
            whileHover={{ rotateX: 5, rotateY: 5, translateZ: 20 }}
            className="group p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center text-center hover:border-amber-500/20 transition-all duration-300 shadow-sm hover:shadow-xl [transform-style:preserve-3d]"
          >
            <div className="p-3 bg-white rounded-xl text-amber-600 mb-3 group-hover:scale-110 transition-transform duration-300 shadow-sm [transform:translateZ(10px)]">
              {getIcon(category)}
            </div>
            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 line-clamp-1 w-full border-b border-slate-200 pb-1.5">
              {category}
            </div>
            <div className="text-2xl font-black text-slate-800 tracking-tight">
              {data.count}
            </div>
            <div className="text-[10px] font-black text-emerald-600 mt-1.5 border-t border-slate-200 pt-1.5 w-full uppercase tracking-tighter">
              ${data.revenue.toLocaleString()}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
