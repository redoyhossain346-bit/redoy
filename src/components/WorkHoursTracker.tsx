import React, { useState } from 'react';
import { Clock, Plus, Trash2, Calendar as CalendarIcon } from 'lucide-react';
import { WorkHour } from '../types';
import { format } from 'date-fns';
import { cn, uuid } from '../lib/utils';

interface WorkHoursTrackerProps {
  workHours: WorkHour[];
  onUpdate: (hours: WorkHour[]) => void;
}

export default function WorkHoursTracker({ workHours, onUpdate }: WorkHoursTrackerProps) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [hours, setHours] = useState('');
  const [note, setNote] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const h = parseFloat(hours);
    if (!h || isNaN(h)) return;

    const newEntry: WorkHour = {
      id: uuid(),
      date,
      hours: h,
      note
    };

    onUpdate([newEntry, ...workHours]);
    setHours('');
    setNote('');
  };

  const handleDelete = (id: string) => {
    onUpdate(workHours.filter(h => h.id !== id));
  };

  const totalHours = workHours.reduce((acc, curr) => acc + curr.hours, 0);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="glass-card p-8 border-amber-200 bg-amber-50 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white rounded-xl text-amber-600 border border-amber-100 shadow-sm">
              <Clock size={24} />
            </div>
            <h3 className="text-[10px] font-black text-amber-600 uppercase tracking-[0.3em]">Cumulative Time</h3>
          </div>
          <p className="text-4xl font-black text-slate-800 tracking-tighter">{totalHours.toFixed(1)}<span className="text-xs text-slate-400 ml-2 uppercase tracking-widest">Aggregate Hours</span></p>
        </div>

        <div className="md:col-span-2 glass-card p-8 bg-white border-slate-200 shadow-sm">
          <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-end">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-1">Shift Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="glass-input h-12 w-full text-xs font-black uppercase tracking-widest border-slate-200 bg-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-1">Duration (Hrs)</label>
              <input
                type="number"
                step="0.5"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                placeholder="0.0"
                className="glass-input h-12 w-full text-xs font-black border-slate-200 bg-white placeholder:text-slate-300"
              />
            </div>
            <div className="flex gap-3">
              <div className="flex-1 space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-1">Activity Label</label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="OPTIONAL..."
                  className="glass-input h-12 w-full text-xs font-black border-slate-200 bg-white uppercase tracking-widest placeholder:text-slate-300"
                />
              </div>
              <button
                type="submit"
                className="w-12 h-12 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl shadow-lg transition-all flex items-center justify-center active:scale-90 flex-shrink-0"
              >
                <Plus size={24} />
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="glass-card overflow-hidden bg-white border-slate-200 shadow-sm">
        <div className="px-8 py-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Historical Shift Logs</h3>
          <span className="text-[10px] font-black text-amber-600 bg-white px-4 py-1.5 rounded-full border border-amber-100 uppercase tracking-widest shadow-sm">{workHours.length} Records Verified</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Timestamp</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Quantum</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Description</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] text-right">Security</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {workHours.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center text-slate-300 font-black text-xs uppercase tracking-[0.2em]">
                    Registry archive is empty
                  </td>
                </tr>
              ) : (
                workHours.map(entry => (
                  <tr key={entry.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <CalendarIcon size={14} className="text-amber-500/60" />
                        <span className="text-xs font-black text-slate-800 uppercase tracking-tight">{format(new Date(entry.date), 'dd MMM yyyy')}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="inline-flex items-center px-3 py-1.5 rounded-xl bg-amber-50 text-amber-600 text-[10px] font-black border border-amber-100 uppercase tracking-widest shadow-xs">
                        {entry.hours} UNITS
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-xs text-slate-400 font-bold uppercase tracking-tight">{entry.note || 'NO DESCRIPTION PROVIDED'}</span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button
                        onClick={() => handleDelete(entry.id)}
                        className="p-2.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
