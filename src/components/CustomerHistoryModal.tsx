import React, { useMemo } from 'react';
import {
  X,
  User,
  Phone,
  Mail,
  ShieldCheck,
  Fingerprint,
  Hash,
  DollarSign,
  Calendar,
  Wrench,
  Trash2,
  FileSpreadsheet,
  FileText,
  Clock,
  Layers,
  Banknote,
  Zap,
  CreditCard,
  ShoppingBag,
  CheckSquare,
  Square
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Transaction } from '../types';
import { formatCurrency, cn, formatTransactionId, formatTxDateTime } from '../lib/utils';
import ExcelJS from 'exceljs';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

interface CustomerHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerName: string | null;
  transactions: Transaction[];
  onEditTransaction?: (id: string) => void;
  onDeleteTransaction?: (id: string) => void;
}

const CATEGORY_ICONS: Record<string, any> = {
  Repair: <Wrench size={16} />,
  Accessory: <ShoppingBag size={16} />,
  Service: <Wrench size={16} />,
  'Screen replacement': <Wrench size={16} />,
  'Back glass': <Wrench size={16} />,
  'Other fix': <Wrench size={16} />,
  'Labor': <Wrench size={16} />,
  'Unlocking': <Wrench size={16} />,
  'Phone sell': <ShoppingBag size={16} />,
  'Tablet Sell': <ShoppingBag size={16} />,
  'Accessories': <ShoppingBag size={16} />,
};

export default function CustomerHistoryModal({
  isOpen,
  onClose,
  customerName,
  transactions,
  onEditTransaction,
  onDeleteTransaction,
}: CustomerHistoryModalProps) {
  const norm = (str?: string) => (str || '').trim().toLowerCase();

  const customerTransactions = useMemo(() => {
    if (!customerName) return [];
    return transactions
      .filter((t) => norm(t.customer?.name) === norm(customerName))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, customerName]);

  // Aggregate Customer Metrics & Lifetime Spending
  const stats = useMemo(() => {
    let lifetimeSpending = 0;
    let totalDue = 0;
    let totalProfit = 0;
    let totalCost = 0;
    let totalItemsServiced = 0;
    const phoneNumbers = new Set<string>();
    const emails = new Set<string>();
    const warranties = new Set<string>();
    let idType = '';
    let idNumber = '';

    for (const t of customerTransactions) {
      if (t.type === 'income') {
        lifetimeSpending += t.amount;
      }
      totalDue += t.due || 0;
      totalProfit +=
        t.profit !== undefined
          ? t.profit
          : t.subTotal - t.discount - (t.totalCost || 0);
      totalCost += t.totalCost || 0;

      if (t.items && t.items.length > 0) {
        totalItemsServiced += t.items.reduce((acc, i) => acc + (i.quantity || 1), 0);
      } else {
        totalItemsServiced += 1;
      }

      if (t.customer?.phone) phoneNumbers.add(t.customer.phone);
      if (t.customer?.email) emails.add(t.customer.email);
      if (t.customer?.warranty) warranties.add(t.customer.warranty);
      if (t.customer?.idType && !idType) idType = t.customer.idType;
      if (t.customer?.idNumber && !idNumber) idNumber = t.customer.idNumber;
    }

    return {
      lifetimeSpending,
      totalDue,
      totalProfit,
      totalCost,
      totalItemsServiced,
      totalTransactions: customerTransactions.length,
      phones: Array.from(phoneNumbers),
      emails: Array.from(emails),
      warranties: Array.from(warranties),
      idType,
      idNumber,
    };
  }, [customerTransactions]);

  if (!isOpen || !customerName) return null;

  const handleExportPDF = () => {
    if (customerTransactions.length === 0) return;
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(`Customer Profile & Service History: ${customerName}`, 14, 20);
    doc.setFontSize(10);
    doc.text(
      `Lifetime Spending: ${formatCurrency(stats.lifetimeSpending)} | Total Services: ${stats.totalTransactions} | Total Due: ${formatCurrency(stats.totalDue)}`,
      14,
      28
    );
    doc.text(`Report Generated: ${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}`, 14, 34);

    const tableData = customerTransactions.map((t, idx) => [
      formatTransactionId(t.id, idx),
      formatTxDateTime(t.date, t.createdAt),
      t.category,
      t.note || '-',
      t.workStatus || '-',
      t.paymentMethod,
      formatCurrency(t.amount),
      formatCurrency(t.due),
    ]);

    autoTable(doc, {
      startY: 40,
      head: [
        [
          'Tx ID',
          'Date / Time',
          'Category',
          'Note',
          'Status',
          'Payment',
          'Amount',
          'Due',
        ],
      ],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42] },
    });

    doc.save(`${customerName.replace(/\s+/g, '_')}_Service_History.pdf`);
  };

  const handleExportExcel = async () => {
    if (customerTransactions.length === 0) return;
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Customer Service History');

    worksheet.columns = [
      { header: 'Tx ID', key: 'txId', width: 14 },
      { header: 'Date & Time', key: 'date', width: 20 },
      { header: 'Category', key: 'category', width: 22 },
      { header: 'Note', key: 'note', width: 24 },
      { header: 'Work Status', key: 'status', width: 16 },
      { header: 'Payment Method', key: 'payment', width: 16 },
      { header: 'Amount ($)', key: 'amount', width: 14 },
      { header: 'Due ($)', key: 'due', width: 14 },
    ];

    customerTransactions.forEach((t, idx) => {
      worksheet.addRow({
        txId: formatTransactionId(t.id, idx),
        date: formatTxDateTime(t.date, t.createdAt),
        category: t.category,
        note: t.note || '',
        status: t.workStatus || '',
        payment: t.paymentMethod,
        amount: t.amount,
        due: t.due || 0,
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${customerName.replace(/\s+/g, '_')}_Service_History.xlsx`;
    a.click();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-md overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] my-auto"
          onClick={(e) => e.stopPropagation()}
          id="customer-service-history-modal"
        >
          {/* Header Banner */}
          <div className="p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white shadow-lg font-black shrink-0">
                <User size={24} />
              </div>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white">
                    {customerName}
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black uppercase tracking-widest">
                    Customer Profile & History
                  </span>
                </div>
                <p className="text-xs font-medium text-slate-400 mt-0.5">
                  Showing complete service history across all logged transactions
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExportPDF}
                title="Export Customer History as PDF"
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-rose-300 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
              >
                <FileText size={14} />
                <span className="hidden sm:inline">PDF</span>
              </button>
              <button
                type="button"
                onClick={handleExportExcel}
                title="Export Customer History as Excel"
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-300 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
              >
                <FileSpreadsheet size={14} />
                <span className="hidden sm:inline">Excel</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer ml-1"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Customer Profile & Lifetime Spending Cards Grid */}
          <div className="p-6 bg-slate-50 border-b border-slate-200 shrink-0 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Lifetime Spending */}
              <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Lifetime Spending
                  </span>
                  <DollarSign size={14} className="text-emerald-500" />
                </div>
                <div className="text-xl sm:text-2xl font-black text-emerald-600 tracking-tight">
                  {formatCurrency(stats.lifetimeSpending)}
                </div>
                <div className="text-[10px] font-bold text-slate-500 mt-0.5">
                  Total revenue collected
                </div>
              </div>

              {/* Total Service Count */}
              <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Total Services
                  </span>
                  <Wrench size={14} className="text-amber-500" />
                </div>
                <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {stats.totalTransactions}
                </div>
                <div className="text-[10px] font-bold text-slate-500 mt-0.5">
                  {stats.totalItemsServiced} total device items
                </div>
              </div>

              {/* Outstanding Due */}
              <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Total Balance Due
                  </span>
                  <Clock size={14} className="text-amber-600" />
                </div>
                <div
                  className={cn(
                    'text-xl sm:text-2xl font-black tracking-tight',
                    stats.totalDue > 0 ? 'text-amber-600' : 'text-slate-900'
                  )}
                >
                  {formatCurrency(stats.totalDue)}
                </div>
                <div className="text-[10px] font-bold text-slate-500 mt-0.5">
                  {stats.totalDue > 0 ? 'Outstanding receivables' : 'All accounts settled'}
                </div>
              </div>

              {/* Net Profit Generated */}
              <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Net Profit Value
                  </span>
                  <Calendar size={14} className="text-blue-500" />
                </div>
                <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {formatCurrency(stats.totalProfit)}
                </div>
                <div className="text-[10px] font-bold text-slate-500 mt-0.5">
                  After parts cost
                </div>
              </div>
            </div>

            {/* Customer Contact & Profile Badges */}
            <div className="flex items-center gap-3 flex-wrap pt-2 border-t border-slate-200/60">
              {stats.phones.length > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 shadow-xs">
                  <Phone size={13} className="text-amber-600" />
                  <span>{stats.phones.join(', ')}</span>
                </div>
              )}
              {stats.emails.length > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 shadow-xs">
                  <Mail size={13} className="text-amber-600" />
                  <span>{stats.emails.join(', ')}</span>
                </div>
              )}
              {stats.warranties.length > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-extrabold text-emerald-800 shadow-xs">
                  <ShieldCheck size={13} className="text-emerald-600" />
                  <span>{stats.warranties.join(' / ')} Coverage</span>
                </div>
              )}
              {stats.idType && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 shadow-xs">
                  <Fingerprint size={13} className="text-amber-600" />
                  <span>{stats.idType} Card</span>
                </div>
              )}
              {stats.idNumber && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 shadow-xs">
                  <Hash size={13} className="text-amber-600" />
                  <span>Ref: {stats.idNumber}</span>
                </div>
              )}
            </div>
          </div>

          {/* Service History Timeline (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-6 space-y-3.5 custom-scrollbar bg-slate-50/50">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">
                Service History Timeline ({customerTransactions.length} Entries)
              </h3>
              <span className="text-[11px] font-bold text-slate-500">
                Sorted by newest first
              </span>
            </div>

            {customerTransactions.length === 0 ? (
              <div className="py-16 text-center text-slate-400 font-bold">
                No past transactions found for this customer.
              </div>
            ) : (
              customerTransactions.map((t, idx) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-amber-300 transition-all space-y-3"
                >
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'w-10 h-10 rounded-xl flex items-center justify-center text-base font-black border',
                          t.type === 'income'
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                            : t.type === 'refund'
                            ? 'bg-amber-50 text-amber-600 border-amber-100'
                            : 'bg-rose-50 text-rose-600 border-rose-100'
                        )}
                      >
                        {CATEGORY_ICONS[t.category] || <Wrench size={18} />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-black text-slate-900 uppercase tracking-tight">
                            {t.note || t.category}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-mono font-black">
                            {formatTransactionId(t.id, idx)}
                          </span>
                          {t.workStatus && (
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-[9px] font-black uppercase tracking-wider">
                              {t.workStatus}
                            </span>
                          )}
                          <span
                            className={cn(
                              'px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider',
                              t.paymentSplit
                                ? 'bg-amber-500 text-white'
                                : t.paymentMethod === 'CASH'
                                ? 'bg-slate-200 text-slate-800'
                                : t.paymentMethod === 'ZELLE'
                                ? 'bg-purple-600 text-white'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            )}
                          >
                            {t.paymentSplit ? 'Split' : t.paymentMethod}
                          </span>
                        </div>
                        <div className="text-[10px] font-extrabold text-slate-400 mt-0.5">
                          {formatTxDateTime(t.date, t.createdAt)} • {t.category}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div
                          className={cn(
                            'text-base font-black tracking-tight',
                            t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                          )}
                        >
                          {t.type === 'income' ? '+' : '-'}
                          {formatCurrency(t.amount)}
                        </div>
                        {t.due > 0 && (
                          <div className="text-[10px] font-black text-amber-600 uppercase">
                            Due: {formatCurrency(t.due)}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-1 border-l border-slate-200 pl-3">
                        {onEditTransaction && (
                          <button
                            type="button"
                            onClick={() => {
                              onClose();
                              onEditTransaction(t.id);
                            }}
                            className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all cursor-pointer"
                            title="Edit this service transaction"
                          >
                            <Wrench size={15} />
                          </button>
                        )}
                        {onDeleteTransaction && (
                          <button
                            type="button"
                            onClick={() => onDeleteTransaction(t.id)}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                            title="Delete this transaction"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Serviced Items Detailed Breakdown */}
                  {t.items && t.items.length > 0 && (
                    <div className="pl-3 border-l-2 border-amber-200 space-y-1.5 pt-1">
                      {t.items.map((item) => {
                        const sellTotal = item.amount * item.quantity;
                        return (
                          <div
                            key={item.id}
                            className="text-xs bg-slate-50/80 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between flex-wrap gap-2"
                          >
                            <div className="space-y-0.5">
                              <div className="font-extrabold text-slate-800 uppercase tracking-tight flex items-center gap-1.5">
                                <span>• {item.category}</span>
                                <span className="px-1.5 py-0.5 bg-white border rounded text-[9px] font-mono text-slate-600">
                                  x{item.quantity}
                                </span>
                              </div>
                              {(item.brand ||
                                item.model ||
                                item.quality ||
                                item.imei ||
                                item.storage ||
                                item.color ||
                                item.carrier) && (
                                <div className="text-[10px] font-bold text-slate-500 flex items-center gap-2 flex-wrap">
                                  {item.brand && <span>Brand: {item.brand}</span>}
                                  {item.model && (
                                    <span className="text-amber-700 font-extrabold">
                                      {item.model}
                                    </span>
                                  )}
                                  {item.quality && (
                                    <span className="px-1 py-0.5 rounded bg-amber-100 text-amber-900 font-black text-[9px]">
                                      {item.quality}
                                    </span>
                                  )}
                                  {item.imei && <span>IMEI: {item.imei}</span>}
                                  {item.storage && <span>GB: {item.storage}</span>}
                                  {item.color && <span>Color: {item.color}</span>}
                                </div>
                              )}
                            </div>
                            <div className="text-right font-black text-slate-800">
                              {formatCurrency(sellTotal)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Diagnostic Checklist status if any */}
                  {t.repairChecklist && t.repairChecklist.length > 0 && (
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      <span className="font-extrabold text-slate-500 uppercase tracking-wider text-[10px]">
                        Diagnostic & Repair Checklist
                      </span>
                      <span className="font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        {t.repairChecklist.filter((i) => i.checked).length} /{' '}
                        {t.repairChecklist.length} Tests Passed
                      </span>
                    </div>
                  )}
                </motion.div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-4 bg-slate-900 text-slate-300 flex items-center justify-between border-t border-slate-800 shrink-0 text-xs font-bold">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>
                Total Service History: {customerTransactions.length} entries for{' '}
                {customerName}
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-colors cursor-pointer"
            >
              Close History
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
