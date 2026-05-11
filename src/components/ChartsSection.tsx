import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { Transaction } from '../types';

interface ChartsSectionProps {
  transactions: Transaction[];
}

const COLORS = ['#6366f1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6366F1', '#14B8A6'];

export default function ChartsSection({ transactions }: ChartsSectionProps) {
  // ... data processing stays same ...
  const expenseData = transactions
    .filter(t => t.type === 'expense' || t.type === 'refund')
    .reduce((acc, t) => {
      const name = t.type === 'refund' ? `Refund (${t.category})` : t.category;
      const existing = acc.find(item => item.name === name);
      if (existing) {
        existing.value += t.amount;
      } else {
        acc.push({ name, value: t.amount });
      }
      return acc;
    }, [] as { name: string, value: number }[]);

  const monthlyTrends = transactions.reduce((acc, t) => {
    const month = new Date(t.date).toLocaleString('default', { month: 'short' });
    const existing = acc.find(item => item.month === month);
    const isIncome = t.type === 'income';
    const isExpense = t.type === 'expense' || t.type === 'refund';
    
    if (existing) {
      if (isIncome) existing.income += t.amount;
      if (isExpense) existing.expenses += t.amount;
    } else {
      acc.push({ 
        month, 
        income: isIncome ? t.amount : 0, 
        expenses: isExpense ? t.amount : 0 
      });
    }
    return acc;
  }, [] as { month: string, income: number, expenses: number }[]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      <div className="glass-card p-6 h-[320px] flex flex-col bg-white border-slate-200 shadow-sm">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">By Category Distribution</h3>
        <div className="flex-1 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={expenseData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={70}
                paddingAngle={4}
                dataKey="value"
              >
                {expenseData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                itemStyle={{ color: '#1e293b', fontSize: '12px', fontWeight: 'bold' }}
              />
              <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '20px' }}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass-card p-6 h-[320px] flex flex-col bg-white border-slate-200 shadow-sm">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Financial Trends</h3>
        <div className="flex-1 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
              <XAxis dataKey="month" stroke="rgba(0,0,0,0.4)" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="rgba(0,0,0,0.4)" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip 
                cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                itemStyle={{ color: '#1e293b', fontSize: '12px', fontWeight: 'bold' }}
              />
              <Bar dataKey="income" fill="#6366f1" radius={[2, 2, 0, 0]} />
              <Bar dataKey="expenses" fill="#94a3b8" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
