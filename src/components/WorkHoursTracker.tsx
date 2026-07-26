import React, { useState, useEffect } from 'react';
import { Clock, Plus, Trash2, Calendar as CalendarIcon, User, Search, UserCheck, Briefcase } from 'lucide-react';
import { WorkHour } from '../types';
import { format } from 'date-fns';
import { cn, uuid, format12Hour } from '../lib/utils';

interface WorkHoursTrackerProps {
  workHours: WorkHour[];
  onUpdate: (hours: WorkHour[]) => void;
  onRequestPasscode?: (onConfirm: () => void, title?: string, description?: string) => void;
}

// Calculate duration in hours between 24h start & end times
export function calculateShiftHours(start24?: string, end24?: string): number {
  if (!start24 || !end24) return 0;
  const [sH, sM] = start24.split(':').map(Number);
  const [eH, eM] = end24.split(':').map(Number);
  if (isNaN(sH) || isNaN(sM) || isNaN(eH) || isNaN(eM)) return 0;

  let startTotalMins = sH * 60 + sM;
  let endTotalMins = eH * 60 + eM;

  if (endTotalMins <= startTotalMins) {
    // Overnight shift (crosses midnight)
    endTotalMins += 24 * 60;
  }

  const diffMins = endTotalMins - startTotalMins;
  return parseFloat((diffMins / 60).toFixed(2));
}

export default function WorkHoursTracker({ workHours, onUpdate, onRequestPasscode }: WorkHoursTrackerProps) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [employeeName, setEmployeeName] = useState('');
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('20:00');
  const [hours, setHours] = useState('10.0');
  const [isManualHours, setIsManualHours] = useState(false);
  const [note, setNote] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmployeeFilter, setSelectedEmployeeFilter] = useState('ALL');

  // Extract unique employee names for quick picks
  const recentEmployees = Array.from(
    new Set(workHours.map(h => h.employeeName?.trim()).filter(Boolean) as string[])
  );

  // Auto-calculate hours when start or end time changes, unless user manually overwrote
  useEffect(() => {
    if (!isManualHours) {
      const computed = calculateShiftHours(startTime, endTime);
      if (computed > 0) {
        setHours(computed.toString());
      }
    }
  }, [startTime, endTime, isManualHours]);

  const handleStartChange = (val: string) => {
    setStartTime(val);
    setIsManualHours(false);
  };

  const handleEndChange = (val: string) => {
    setEndTime(val);
    setIsManualHours(false);
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const h = parseFloat(hours);
    if (!h || isNaN(h) || h <= 0) {
      alert("Please enter a valid shift duration in hours.");
      return;
    }

    const newEntry: WorkHour = {
      id: uuid(),
      date,
      employeeName: employeeName.trim() || 'Staff Member',
      startTime,
      endTime,
      hours: h,
      note: note.trim()
    };

    onUpdate([newEntry, ...workHours]);
    setNote('');
  };

  const handleDelete = (id: string) => {
    const doDelete = () => onUpdate(workHours.filter(h => h.id !== id));
    if (onRequestPasscode) {
      onRequestPasscode(
        doDelete,
        'Delete Shift Log',
        'Enter User ID & Password to confirm shift log deletion'
      );
    } else {
      doDelete();
    }
  };

  // Filtering
  const filteredWorkHours = workHours.filter(item => {
    const matchesSearch = 
      (item.employeeName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.note || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.date.includes(searchQuery);

    const matchesEmployee = 
      selectedEmployeeFilter === 'ALL' || 
      (item.employeeName || 'Staff Member') === selectedEmployeeFilter;

    return matchesSearch && matchesEmployee;
  });

  const totalHours = workHours.reduce((acc, curr) => acc + curr.hours, 0);
  const totalEmployees = recentEmployees.length;

  return (
    <div className="space-y-8">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass-card p-6 border-amber-200 bg-amber-50/70 shadow-sm rounded-2xl flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Clock size={16} className="text-amber-600" />
              <h3 className="text-[10px] font-black text-amber-700 uppercase tracking-widest">Total Cumulative Hours</h3>
            </div>
            <p className="text-3xl font-black text-slate-900 font-mono tracking-tight">{totalHours.toFixed(1)} <span className="text-xs text-amber-700 font-bold uppercase">Hrs</span></p>
          </div>
          <div className="p-3 bg-amber-500 text-white rounded-xl shadow-md">
            <Clock size={22} />
          </div>
        </div>

        <div className="glass-card p-6 border-indigo-200 bg-indigo-50/70 shadow-sm rounded-2xl flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <UserCheck size={16} className="text-indigo-600" />
              <h3 className="text-[10px] font-black text-indigo-700 uppercase tracking-widest">Active Staff Members</h3>
            </div>
            <p className="text-3xl font-black text-slate-900 font-mono tracking-tight">{totalEmployees} <span className="text-xs text-indigo-700 font-bold uppercase">Staff</span></p>
          </div>
          <div className="p-3 bg-indigo-600 text-white rounded-xl shadow-md">
            <UserCheck size={22} />
          </div>
        </div>

        <div className="glass-card p-6 border-emerald-200 bg-emerald-50/70 shadow-sm rounded-2xl flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Briefcase size={16} className="text-emerald-600" />
              <h3 className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Logged Shifts</h3>
            </div>
            <p className="text-3xl font-black text-slate-900 font-mono tracking-tight">{workHours.length} <span className="text-xs text-emerald-700 font-bold uppercase">Logs</span></p>
          </div>
          <div className="p-3 bg-emerald-600 text-white rounded-xl shadow-md">
            <Briefcase size={22} />
          </div>
        </div>
      </div>

      {/* Main Shift Input Form */}
      <div className="glass-card p-8 bg-white border-slate-200 shadow-sm rounded-3xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500 text-white rounded-xl shadow-sm">
              <Clock size={20} />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 uppercase tracking-wider">Log Work Shift & Staff Hours</h2>
              <p className="text-xs text-slate-400 font-medium">Record staff member name, shift start/end times (e.g. 10 AM to 8 PM), and duties.</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleAdd} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Employee Name */}
            <div className="space-y-2 lg:col-span-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] pl-1 flex items-center justify-between">
                <span>Who Works Here? (Staff / Employee Name) *</span>
              </label>
              <div className="relative">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  value={employeeName}
                  onChange={(e) => setEmployeeName(e.target.value)}
                  placeholder="e.g. Alex Smith, John, Sarah..."
                  className="glass-input h-12 w-full pl-11 pr-4 text-xs font-black border-slate-200 bg-white uppercase tracking-widest placeholder:text-slate-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
              </div>

              {/* Quick Pick Employee Name Buttons */}
              {recentEmployees.length > 0 && (
                <div className="flex items-center gap-2 pt-1 flex-wrap">
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Quick Pick:</span>
                  {recentEmployees.map(emp => (
                    <button
                      key={emp}
                      type="button"
                      onClick={() => setEmployeeName(emp)}
                      className={cn(
                        "text-[10px] font-black px-2.5 py-1 rounded-full border transition-all cursor-pointer",
                        employeeName === emp
                          ? "bg-amber-500 text-white border-amber-600 shadow-2xs"
                          : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-amber-50 hover:text-amber-700"
                      )}
                    >
                      {emp}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Shift Date */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] pl-1">Shift Date *</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="glass-input h-12 w-full px-4 text-xs font-black uppercase tracking-widest border-slate-200 bg-white"
              />
            </div>

            {/* Note / Activity */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] pl-1">Activity / Role / Note</label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Front Desk, Repairs, Opening..."
                className="glass-input h-12 w-full px-4 text-xs font-black border-slate-200 bg-white placeholder:text-slate-300"
              />
            </div>

          </div>

          {/* Time-wise Start and End Time section */}
          <div className="p-5 bg-amber-50/50 rounded-2xl border border-amber-200/80 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            
            {/* Start Time */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-amber-800 uppercase tracking-[0.2em] pl-1">Shift Start Time (e.g. 10:00 AM)</label>
              <div className="relative">
                <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-600" />
                <input
                  type="time"
                  required
                  value={startTime}
                  onChange={(e) => handleStartChange(e.target.value)}
                  className="glass-input h-11 w-full pl-10 pr-3 text-xs font-black border-amber-200 bg-white font-mono"
                />
              </div>
              <p className="text-[10px] font-extrabold text-amber-700/80 pl-1">{format12Hour(startTime)}</p>
            </div>

            {/* End Time */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-amber-800 uppercase tracking-[0.2em] pl-1">Shift End Time (e.g. 08:00 PM)</label>
              <div className="relative">
                <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-600" />
                <input
                  type="time"
                  required
                  value={endTime}
                  onChange={(e) => handleEndChange(e.target.value)}
                  className="glass-input h-11 w-full pl-10 pr-3 text-xs font-black border-amber-200 bg-white font-mono"
                />
              </div>
              <p className="text-[10px] font-extrabold text-amber-700/80 pl-1">{format12Hour(endTime)}</p>
            </div>

            {/* Calculated Duration & Submit */}
            <div className="space-y-2 flex flex-col justify-end">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black text-amber-800 uppercase tracking-[0.2em] pl-1">Total Hours</label>
                {!isManualHours ? (
                  <span className="text-[9px] font-extrabold bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full uppercase">
                    Auto Time-wise
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setIsManualHours(false);
                      setHours(calculateShiftHours(startTime, endTime).toString());
                    }}
                    className="text-[9px] font-bold text-amber-700 underline hover:text-amber-900 cursor-pointer"
                  >
                    Reset Auto
                  </button>
                )}
              </div>
              
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    required
                    value={hours}
                    onChange={(e) => {
                      setIsManualHours(true);
                      setHours(e.target.value);
                    }}
                    className="glass-input h-11 w-full px-4 text-sm font-black border-amber-200 bg-white font-mono text-amber-900"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-black text-amber-600">HRS</span>
                </div>

                <button
                  type="submit"
                  className="h-11 px-6 bg-amber-500 hover:bg-amber-600 text-white rounded-xl shadow-md transition-all font-black text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer active:scale-95 flex-shrink-0"
                >
                  <Plus size={18} />
                  <span>Log Shift</span>
                </button>
              </div>
              <p className="text-[10px] font-bold text-amber-700/80 pl-1">
                Range: <span className="font-black">{format12Hour(startTime)}</span> to <span className="font-black">{format12Hour(endTime)}</span>
              </p>
            </div>

          </div>
        </form>
      </div>

      {/* Shift Logs Table & Search Controls */}
      <div className="glass-card overflow-hidden bg-white border-slate-200 shadow-sm rounded-3xl">
        
        {/* Table Header Controls */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Historical Shift Logs</h3>
            <p className="text-[10px] text-slate-400 font-medium">Verify staff working hours and time-wise attendance record.</p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Search Input */}
            <div className="relative min-w-[200px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search staff, date, role..."
                className="h-9 w-full pl-9 pr-3 text-xs font-medium bg-white border border-slate-200 rounded-xl outline-none focus:border-amber-500"
              />
            </div>

            {/* Filter by Employee */}
            {recentEmployees.length > 0 && (
              <select
                value={selectedEmployeeFilter}
                onChange={(e) => setSelectedEmployeeFilter(e.target.value)}
                className="h-9 px-3 text-xs font-bold bg-white border border-slate-200 rounded-xl outline-none focus:border-amber-500 text-slate-700"
              >
                <option value="ALL">All Staff Members ({workHours.length})</option>
                {recentEmployees.map(emp => (
                  <option key={emp} value={emp}>{emp}</option>
                ))}
              </select>
            )}

            <span className="text-[10px] font-black text-amber-700 bg-amber-50 border border-amber-200 px-3 py-2 rounded-xl uppercase tracking-wider">
              {filteredWorkHours.length} Records
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-100/50">
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Staff Member</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Shift Date</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Time-Wise Range</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Duration</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Activity / Role</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredWorkHours.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-16 text-center text-slate-400 font-bold text-xs">
                    No shift logs found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredWorkHours.map(entry => (
                  <tr key={entry.id} className="hover:bg-amber-50/20 transition-colors group">
                    
                    {/* Employee Name */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-black text-xs border border-slate-200">
                          <User size={14} className="text-amber-600" />
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-900 uppercase tracking-tight">
                            {entry.employeeName || 'Staff Member'}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <CalendarIcon size={14} className="text-slate-400" />
                        <span className="text-xs font-bold text-slate-700">
                          {format(new Date(entry.date), 'dd MMM yyyy')}
                        </span>
                      </div>
                    </td>

                    {/* Time-Wise Range */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-amber-500" />
                        {entry.startTime && entry.endTime ? (
                          <span className="text-xs font-black text-amber-900 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 font-mono">
                            {format12Hour(entry.startTime)} - {format12Hour(entry.endTime)}
                          </span>
                        ) : (
                          <span className="text-xs font-medium text-slate-400 italic">Full Day / Manual</span>
                        )}
                      </div>
                    </td>

                    {/* Duration */}
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-black border border-emerald-200 font-mono">
                        {entry.hours.toFixed(1)} HRS
                      </span>
                    </td>

                    {/* Activity / Role / Note */}
                    <td className="px-6 py-4">
                      <span className="text-xs text-slate-600 font-medium">
                        {entry.note || <span className="text-slate-300 italic">No notes</span>}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(entry.id)}
                        className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer opacity-80 group-hover:opacity-100"
                        title="Delete Shift Log Entry"
                      >
                        <Trash2 size={16} />
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
