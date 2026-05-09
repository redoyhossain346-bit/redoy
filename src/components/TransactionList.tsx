import { useMemo } from 'react';
import { FileSpreadsheet, FileText, Trash2, Utensils, Car, Home, Zap, Heart, ShoppingBag, Box, DollarSign, Wallet, Smartphone, Layers, Wrench, Hammer, Unlock, Store, Gamepad, Banknote, CreditCard, User, Phone, Mail, ShieldCheck, Fingerprint, Hash, Tablet, Sparkles, ToyBrick, Package, Watch, Cpu } from 'lucide-react';
import { Transaction } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  onExportAudit?: () => void;
}

const CATEGORY_ICONS: Record<string, any> = {
  Food: <Utensils size={16} />,
  Transport: <Car size={16} />,
  Rent: <Home size={16} />,
  Utilities: <Zap size={16} />,
  Shopping: <ShoppingBag size={16} />,
  Income: <DollarSign size={16} />,
  'Screen replacement': <Smartphone size={16} />,
  'Back glass': <Layers size={16} />,
  'Other fix': <Wrench size={16} />,
  Labor: <Hammer size={16} />,
  Unlocking: <Unlock size={16} />,
  'Phone sell': <Store size={16} />,
  'Tablet Sell': <Tablet size={16} />,
  Perfume: <Sparkles size={16} />,
  Doll: <ToyBrick size={16} />,
  Case: <Package size={16} />,
  'Water Bottle': <ShoppingBag size={16} />,
  Accessories: <Watch size={16} />,
  'Parts Sell': <Cpu size={16} />,
  'Toy sell': <Gamepad size={16} />,
  'Tempered Glass': <Smartphone size={16} />,
  Battery: <Zap size={16} />,
  'Camera Protector': <ShieldCheck size={16} />,
  'Watch Belt': <Watch size={16} />,
  'Watch Protector': <ShieldCheck size={16} />,
  Others: <Wallet size={16} />,
};

export default function TransactionList({ transactions, onDelete, onEdit, onExportAudit }: TransactionListProps) {
  const exportToExcel = () => {
    const wsData = transactions.map(t => ({
      Date: t.date,
      Type: t.type.toUpperCase(),
      Category: t.category,
      'Work Status': t.workStatus || 'N/A',
      Items: t.items?.map(i => {
        let details = `${i.category}($${i.amount})`;
        if (i.model) details += ` | Mod:${i.model}`;
        if (i.imei) details += ` | IMEI:${i.imei}`;
        if (i.storage) details += ` | GB:${i.storage}`;
        if (i.color) details += ` | Color:${i.color}`;
        if (i.warranty) details += ` | Warnt:${i.warranty}`;
        if (i.carrier) details += ` | Carri:${i.carrier}`;
        if (i.phoneNumber) details += ` | Num:${i.phoneNumber}`;
        return details;
      }).join('; ') || t.category,
      Method: t.paymentSplit ? 'SPLIT' : t.paymentMethod,
      Cash: t.paymentSplit?.cash || (t.paymentMethod === 'CASH' ? t.amount : 0),
      Card: t.paymentSplit?.card || (t.paymentMethod === 'CARD' ? t.amount : 0),
      Zelle: t.paymentSplit?.zelle || (t.paymentMethod === 'ZELLE' ? t.amount : 0),
      SubTotal: t.subTotal,
      Discount: t.discount,
      Tax: t.tax,
      Total: t.amount,
      Advance: t.advance,
      Due: t.due,
      Note: t.note,
      Customer_Name: t.customer?.name || '',
      Customer_Phone: t.customer?.phone || '',
      Customer_Email: t.customer?.email || '',
      Warranty: t.customer?.warranty || '',
      ID_Type: t.customer?.idType || '',
      ID_Number: t.customer?.idNumber || ''
    }));

    const ws = XLSX.utils.json_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Transactions");
    XLSX.writeFile(wb, `Report_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
  };

  const exportToPDF = () => {
    const doc = new jsPDF('l', 'pt', 'a4');
    
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(18);
    doc.text("All Cellular & Repair - Transaction Report", 40, 40);
    doc.setFontSize(10);
    doc.text(`Generated on: ${format(new Date(), 'dd MMM yyyy, hh:mm a')}`, 40, 55);

    const tableData = transactions.map(t => [
      format(new Date(t.date), 'dd/MM/yy'),
      t.type.toUpperCase(),
      t.items?.map(i => {
        let str = i.category;
        if (i.model) str += ` (${i.model})`;
        if (i.carrier) str += ` (${i.carrier})`;
        if (i.phoneNumber) str += ` [#:${i.phoneNumber}]`;
        if (i.imei) str += ` [EMI:${i.imei}]`;
        return str;
      }).join(', ') || t.category,
      t.workStatus || '-',
      t.paymentSplit ? 'SPLIT' : t.paymentMethod,
      formatCurrency(t.amount),
      formatCurrency(t.due),
      t.customer?.name || '-',
      t.note || '-'
    ]);

    autoTable(doc, {
      startY: 70,
      head: [['Date', 'Type', 'Category', 'Status', 'Method', 'Total', 'Due', 'Customer', 'Note']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [79, 70, 229], textColor: 255 },
      styles: { fontSize: 8, cellPadding: 5 },
      didDrawPage: (data) => {
        // Footer
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Page ${data.pageNumber}`, doc.internal.pageSize.width - 50, doc.internal.pageSize.height - 20);
        doc.text("ALL CELLULAR AND REPAIR | 925 W Baseline Rd, Tempe, AZ", 40, doc.internal.pageSize.height - 20);
      }
    });

    doc.save(`Report_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  const sortedTransactions = useMemo(() => {
    return [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions]);

  return (
    <div className="glass-card p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-bold text-slate-300">Recent Activity</h3>
        <div className="flex items-center gap-3">
          <button 
            onClick={exportToExcel}
            className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
            title="Export to Excel"
          >
            <FileSpreadsheet size={14} />
            EXCEL
          </button>
          <button 
            onClick={exportToPDF}
            className="flex items-center gap-1.5 text-[10px] font-bold text-rose-400 hover:text-rose-300 transition-colors"
            title="Export to PDF"
          >
            <FileText size={14} />
            PDF
          </button>
          {onExportAudit && (
            <button 
              onClick={onExportAudit}
              className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors ml-1 pl-1 border-l border-white/10"
              title="Export History"
            >
              <Fingerprint size={14} />
              HISTORY
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
        {sortedTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-700">
            <Box size={32} className="mb-2" />
            <p className="text-xs">Empty</p>
          </div>
        ) : (
          sortedTransactions.map((t) => (
            <div key={t.id} className="space-y-1">
              <div className="group flex items-center justify-between p-3 bg-slate-800/40 rounded-xl hover:bg-slate-800/60 transition-all border border-white/5">
                <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center text-sm",
                  t.type === 'income' ? "bg-emerald-500/10 text-emerald-400" : 
                  t.type === 'refund' ? "bg-indigo-500/10 text-indigo-400" :
                  "bg-rose-500/10 text-rose-400"
                )}>
                  {CATEGORY_ICONS[t.category] || <Wallet size={16} />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold">{t.note || t.category}</p>
                    <div className={cn(
                      "flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-bold",
                      t.paymentSplit ? "bg-indigo-500 text-white" :
                      t.paymentMethod === 'CASH' ? "bg-slate-700 text-slate-300" : 
                      t.paymentMethod === 'ZELLE' ? "bg-purple-500/20 text-purple-400" :
                      "bg-indigo-500/20 text-indigo-400"
                    )}>
                      {t.paymentSplit ? <Layers size={8} /> :
                       t.paymentMethod === 'CASH' ? <Banknote size={8} /> : 
                       t.paymentMethod === 'ZELLE' ? <Zap size={8} /> :
                       <CreditCard size={8} />}
                      {t.paymentSplit ? 'Split' : t.paymentMethod}
                    </div>
                    {t.workStatus && (
                      <div className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-bold bg-slate-950/40 text-slate-400 border border-white/5">
                        {t.workStatus}
                      </div>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500">{t.category} • {format(new Date(t.date), 'dd MMM')}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
              <div className="text-right">
                <p className={cn(
                  "font-bold text-sm",
                  t.type === 'income' ? "text-emerald-400" : "text-rose-400"
                )}>
                  {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                </p>
                {t.due > 0 && (
                  <p className="text-[9px] font-bold text-amber-500">
                    Due: {formatCurrency(t.due)}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => onEdit(t.id)}
                  className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-indigo-500/20 hover:text-indigo-400 rounded-lg transition-all"
                  title="Edit Entry"
                >
                  <Wrench size={14} />
                </button>
                <button 
                  onClick={() => onDelete(t.id)}
                  className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-rose-500/20 hover:text-rose-400 rounded-lg transition-all"
                  title="Delete Entry"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
          
          <div className="mt-1 ml-12 space-y-1">
            {/* Amount Breakdown */}
            <div className="flex flex-col gap-1 p-2 bg-slate-950/20 rounded-lg border border-white/5">
              {/* Items List */}
              {t.items && t.items.length > 0 && (
                <div className="mb-2 space-y-1.5">
                  {t.items.map(item => (
                    <div key={item.id} className="flex flex-col gap-0.5 border-l-2 border-indigo-500/20 pl-2">
                      <div className="flex justify-between items-center text-[8px] font-bold text-slate-400">
                        <span>• {item.category}</span>
                        <span className="text-slate-300">{formatCurrency(item.amount)}</span>
                      </div>
                      {(item.model || item.imei || item.storage || item.color || item.warranty || item.carrier || item.phoneNumber) && (
                        <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[7px] text-slate-500 font-bold">
                          {item.model && <div className="truncate">Model: <span className="text-indigo-400/80">{item.model}</span></div>}
                          {item.imei && <div className="truncate">IMEI: <span className="text-indigo-400/80">{item.imei}</span></div>}
                          {item.storage && <div>GB: <span className="text-indigo-400/80">{item.storage}</span></div>}
                          {item.color && <div>Color: <span className="text-indigo-400/80">{item.color}</span></div>}
                          {item.carrier && <div className="truncate">Carrier: <span className="text-indigo-400/80">{item.carrier}</span></div>}
                          {item.phoneNumber && <div className="truncate">Num: <span className="text-indigo-400/80">{item.phoneNumber}</span></div>}
                          {item.warranty && <div className="col-span-2 italic">Warranty: <span className="text-indigo-400/80">{item.warranty}</span></div>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-[9px] font-medium border-t border-white/5 pt-1">
                <div className="text-slate-500">Sub: <span className="text-slate-300">{formatCurrency(t.subTotal)}</span></div>
                {t.discount > 0 && <div className="text-rose-500/70">Disc: <span className="text-rose-400">-{formatCurrency(t.discount)}</span></div>}
                {t.tax > 0 && <div className="text-slate-500">Tax: <span className="text-slate-300">{formatCurrency(t.tax)}</span></div>}
                {t.advance > 0 && <div className="text-emerald-500/70">Adv: <span className="text-emerald-400">-{formatCurrency(t.advance)}</span></div>}
              </div>
              
              {t.paymentSplit && (
                <div className="pt-1 mt-1 border-t border-white/5 flex flex-wrap gap-3 text-[8px] font-bold text-slate-500">
                  <span className="text-slate-600">Split:</span>
                  {t.paymentSplit.cash > 0 && <div className="flex items-center gap-1"><Banknote size={8} /> Cash: {formatCurrency(t.paymentSplit.cash)}</div>}
                  {t.paymentSplit.card > 0 && <div className="flex items-center gap-1"><CreditCard size={8} /> Card: {formatCurrency(t.paymentSplit.card)}</div>}
                  {t.paymentSplit.zelle > 0 && <div className="flex items-center gap-1"><Zap size={8} /> Zelle: {formatCurrency(t.paymentSplit.zelle)}</div>}
                </div>
              )}
              
              {t.cashReceived && (
                <div className="pt-1 mt-1 border-t border-white/5 flex gap-4 text-[8px] font-bold">
                  <div className="text-emerald-500/80">Received: {formatCurrency(t.cashReceived)}</div>
                  {t.changeDue && <div className="text-amber-500/80">Change: {formatCurrency(t.changeDue)}</div>}
                </div>
              )}
            </div>

            {t.customer && (
              <div className="p-3 bg-slate-950/20 rounded-xl border border-white/5 grid grid-cols-2 gap-y-2 gap-x-4">
                {t.customer.name && (
                  <div className="flex items-center gap-2 text-[10px] text-slate-400">
                    <User size={10} className="text-indigo-400" />
                    <span className="font-medium">{t.customer.name}</span>
                  </div>
                )}
                {t.customer.phone && (
                  <div className="flex items-center gap-2 text-[10px] text-slate-400">
                    <Phone size={10} className="text-indigo-400" />
                    <span>{t.customer.phone}</span>
                  </div>
                )}
                {t.customer.email && (
                  <div className="flex items-center gap-2 text-[10px] text-slate-400">
                    <Mail size={10} className="text-indigo-400" />
                    <span className="truncate max-w-[120px]">{t.customer.email}</span>
                  </div>
                )}
                {t.customer.warranty && (
                  <div className="flex items-center gap-2 text-[10px] text-indigo-300">
                    <ShieldCheck size={10} className="text-indigo-400" />
                    <span>Warranty: {t.customer.warranty}</span>
                  </div>
                )}
                {t.customer.idType && (
                  <div className="flex items-center gap-2 text-[10px] text-slate-400">
                    <Fingerprint size={10} className="text-indigo-400" />
                    <span>ID: {t.customer.idType}</span>
                  </div>
                )}
                {t.customer.idNumber && (
                  <div className="flex items-center gap-2 text-[10px] text-slate-400">
                    <Hash size={10} className="text-indigo-400" />
                    <span>{t.customer.idNumber}</span>
                  </div>
                )}
              </div>
            )}
            </div>
          </div>
          ))
        )}
      </div>
    </div>
  );
}
