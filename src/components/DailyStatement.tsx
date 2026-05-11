import { useMemo } from 'react';
import { Transaction, WorkHour } from '../types';
import { format, parseISO } from 'date-fns';
import { TrendingUp, Clock, Package, DollarSign, Calendar } from 'lucide-react';
import { formatCurrency } from '../lib/utils';

interface DailyStatementProps {
  transactions: Transaction[];
  workHours: WorkHour[];
}

export default function DailyStatement({ transactions, workHours }: DailyStatementProps) {
  const dailyData = useMemo(() => {
    const data: Record<string, { revenue: number; items: number; hours: number }> = {};

    // Process transactions
    transactions.forEach(t => {
      if (t.type !== 'income') return;
      const date = t.date;
      if (!data[date]) data[date] = { revenue: 0, items: 0, hours: 0 };
      
      data[date].revenue += t.amount;
      t.items?.forEach(item => {
        data[date].items += (item.quantity || 1);
      });
    });

    // Process work hours
    workHours.forEach(h => {
      const date = h.date;
      if (!data[date]) data[date] = { revenue: 0, items: 0, hours: 0 };
      data[date].hours += h.hours;
    });

    return Object.entries(data)
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([date, stats]) => ({
        date,
        ...stats
      }));
  }, [transactions, workHours]);

  if (dailyData.length === 0) {
    return (
      <div className="glass-card p-20 text-center border-slate-200 bg-white shadow-sm">
        <Calendar className="mx-auto text-slate-300 mb-6" size={60} />
        <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.4em]">Historical Void</h3>
        <p className="text-[10px] text-slate-500 mt-3 font-black uppercase tracking-widest">Awaiting authentication of daily operational manifests.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between mb-2 px-4">
        <h2 className="text-[11px] font-black text-slate-800 uppercase tracking-[0.3em] flex items-center gap-3">
          <TrendingUp size={18} className="text-amber-500" />
          Tactical Performance Log
        </h2>
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest border border-slate-100 px-4 py-1.5 rounded-full bg-white shadow-sm">{dailyData.length} ACTIVE OPERATIONAL CYCLES</span>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {dailyData.map((day) => (
          <div key={day.date} className="glass-card overflow-hidden group hover:border-amber-500/30 hover:bg-slate-50 transition-all duration-300 bg-white border-slate-200 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-4 items-center">
              {/* Date Header */}
              <div className="p-8 bg-slate-50 border-r border-slate-100 flex flex-col items-center justify-center text-center group-hover:bg-amber-50 gradual-transition transition-colors">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] mb-1">CHRONO ID</span>
                <div className="text-sm font-black text-slate-800 uppercase tracking-tighter">
                  {format(parseISO(day.date), 'EEEE')}
                </div>
                <div className="text-[10px] font-black text-amber-600 uppercase tracking-[0.2em] mt-1">
                  {format(parseISO(day.date), 'dd MMM yyyy')}
                </div>
              </div>

              {/* Stats Grid */}
              <div className="md:col-span-3 grid grid-cols-3 p-8 gap-8 items-center bg-white">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-slate-400 mb-1">
                    <Clock size={14} className="text-amber-500/60" />
                    <span className="text-[9px] font-black uppercase tracking-[0.2em]">Operational Duty</span>
                  </div>
                  <div className="text-2xl font-black text-slate-800 tracking-tight">
                    {day.hours.toFixed(1)}<span className="text-[10px] text-slate-400 ml-2 uppercase tracking-widest">Quantum</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-slate-400 mb-1">
                    <Package size={14} className="text-amber-500/60" />
                    <span className="text-[9px] font-black uppercase tracking-[0.2em]">Asset Turnover</span>
                  </div>
                  <div className="text-2xl font-black text-slate-800 tracking-tight">
                    {day.items}<span className="text-[10px] text-slate-400 ml-2 uppercase tracking-widest">Units</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-slate-400 mb-1">
                    <DollarSign size={14} className="text-emerald-500" />
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-600">Capital Yield</span>
                  </div>
                  <div className="text-2xl font-black text-emerald-600 tracking-tighter">
                    {formatCurrency(day.revenue)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
