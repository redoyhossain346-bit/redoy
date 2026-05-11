import { useMemo } from 'react';
import { FileSpreadsheet, FileText, Trash2, Utensils, Car, Home, Zap, Heart, ShoppingBag, Box, DollarSign, Wallet, Smartphone, Layers, Wrench, Hammer, Unlock, Store, Gamepad, Banknote, CreditCard, User, Phone, Mail, ShieldCheck, Fingerprint, Hash, Tablet, Sparkles, ToyBrick, Package, Watch, Cpu } from 'lucide-react';
import { Transaction } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { format } from 'date-fns';
import ExcelJS from 'exceljs';
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
  const exportToExcel = async () => {
    const wsData = transactions.map(t => ({
      Date: t.date,
      Type: t.type.toUpperCase(),
      Category: t.category,
      Status: t.workStatus || 'N/A',
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

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Transactions');

    // Define columns
    if (wsData.length > 0) {
      worksheet.columns = Object.keys(wsData[0]).map(key => ({ 
        header: key, 
        key: key, 
        width: 15 
      }));
      worksheet.addRows(wsData);

      // Simple styling
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      };

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Report_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    }
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
    <div className="glass-card p-6 h-full flex flex-col bg-white border-slate-200 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-base font-black text-slate-800 uppercase tracking-widest premium-gradient-text">Recent Activity</h3>
        <div className="flex items-center gap-4">
          <button 
            onClick={exportToExcel}
            className="flex items-center gap-2 text-[10px] font-black text-emerald-600 hover:text-emerald-700 transition-all uppercase tracking-widest px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-100 shadow-sm"
            title="Export to Excel"
          >
            <FileSpreadsheet size={16} />
            EXCEL
          </button>
          <button 
            onClick={exportToPDF}
            className="flex items-center gap-2 text-[10px] font-black text-rose-600 hover:text-rose-700 transition-all uppercase tracking-widest px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-100 shadow-sm"
            title="Export to PDF"
          >
            <FileText size={16} />
            PDF
          </button>
          {onExportAudit && (
            <button 
              onClick={onExportAudit}
              className="flex items-center gap-2 text-[10px] font-black text-amber-600 hover:text-amber-700 transition-all uppercase tracking-widest px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 ml-2 shadow-sm"
              title="Export History"
            >
              <Fingerprint size={16} />
              HISTORY
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
        {sortedTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Box size={32} className="mb-2 opacity-20" />
            <p className="text-xs font-black uppercase tracking-widest">Global Log empty</p>
          </div>
        ) : (
          sortedTransactions.map((t) => (
            <div key={t.id} className="space-y-1">
              <div className="group flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 hover:border-amber-500/20 transition-all border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3">
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center text-base shadow-sm font-black",
                  t.type === 'income' ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : 
                  t.type === 'refund' ? "bg-amber-50 text-amber-600 border border-amber-100" :
                  "bg-rose-50 text-rose-600 border border-rose-100"
                )}>
                  {CATEGORY_ICONS[t.category] || <Wallet size={20} />}
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <p className="text-base font-black text-slate-800 tracking-tight leading-none uppercase">{t.note || t.category}</p>
                    <div className={cn(
                      "flex items-center gap-2 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                      t.paymentSplit ? "bg-amber-500 text-white shadow-sm" :
                      t.paymentMethod === 'CASH' ? "bg-slate-200 text-slate-700" : 
                      t.paymentMethod === 'ZELLE' ? "bg-purple-600 text-white" :
                      "bg-amber-50 text-amber-600 border border-amber-200"
                    )}>
                      {t.paymentSplit ? <Layers size={10} /> :
                       t.paymentMethod === 'CASH' ? <Banknote size={10} /> : 
                       t.paymentMethod === 'ZELLE' ? <Zap size={10} /> :
                       <CreditCard size={10} />}
                      {t.paymentSplit ? 'Split' : t.paymentMethod}
                    </div>
                    {t.workStatus && (
                      <div className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black bg-white text-slate-400 border border-slate-100 uppercase tracking-widest shadow-sm">
                        {t.workStatus}
                      </div>
                    )}
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">{t.category} • {format(new Date(t.date), 'dd MMM yyyy')}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
              <div className="text-right">
                <p className={cn(
                  "font-black text-lg tracking-tight",
                  t.type === 'income' ? "text-emerald-600" : "text-rose-600"
                )}>
                  {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                </p>
                {t.due > 0 && (
                  <p className="text-[10px] font-black text-amber-600 uppercase tracking-tight">
                    Due: {formatCurrency(t.due)}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
                <button 
                  onClick={() => onEdit(t.id)}
                  className="p-2.5 opacity-0 group-hover:opacity-100 hover:bg-amber-50 text-slate-400 hover:text-amber-600 rounded-xl transition-all shadow-sm"
                  title="Edit Entry"
                >
                  <Wrench size={16} />
                </button>
                <button 
                  onClick={() => onDelete(t.id)}
                  className="p-2.5 opacity-0 group-hover:opacity-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl transition-all shadow-sm"
                  title="Delete Entry"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
          
          <div className="mt-1 ml-14 space-y-1">
            {/* Amount Breakdown */}
            <div className="flex flex-col gap-2 p-4 bg-slate-50 rounded-2xl border border-slate-100 group-hover:border-amber-500/10 transition-colors shadow-sm">
              {/* Items List */}
              {t.items && t.items.length > 0 && (
                <div className="mb-2 space-y-2">
                  {t.items.map(item => (
                    <div key={item.id} className="flex flex-col gap-1 border-l-2 border-amber-200 pl-3">
                      <div className="flex justify-between items-center text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        <span>• {item.category} <span className="text-[8px] text-slate-400 bg-white border border-slate-100 px-1.5 rounded ml-2 shadow-xs">x{item.quantity}</span></span>
                        <span className="text-slate-800">{formatCurrency(item.amount * item.quantity)}</span>
                      </div>
                      {(item.model || item.imei || item.storage || item.color || item.warranty || item.carrier || item.phoneNumber) && (
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[8px] font-black text-slate-400 uppercase tracking-tighter">
                          {item.model && <div className="truncate">Model: <span className="text-amber-600">{item.model}</span></div>}
                          {item.imei && <div className="truncate">IMEI: <span className="text-amber-600">{item.imei}</span></div>}
                          {item.storage && <div>GB: <span className="text-amber-600">{item.storage}</span></div>}
                          {item.color && <div>Color: <span className="text-amber-600">{item.color}</span></div>}
                          {item.carrier && <div className="truncate">Carrier: <span className="text-amber-600">{item.carrier}</span></div>}
                          {item.phoneNumber && <div className="truncate">Num: <span className="text-amber-600">{item.phoneNumber}</span></div>}
                          {item.warranty && <div className="col-span-2 italic text-amber-600/80 leading-none">Security Warranty: {item.warranty}</div>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-[9px] font-black border-t border-slate-200 pt-2">
                <div className="text-slate-400">Sub: <span className="text-slate-700">{formatCurrency(t.subTotal)}</span></div>
                {t.discount > 0 && <div className="text-rose-500/70">Disc: <span className="text-rose-600">-{formatCurrency(t.discount)}</span></div>}
                {t.tax > 0 && <div className="text-slate-400">Tax: <span className="text-slate-700">{formatCurrency(t.tax)}</span></div>}
                {t.advance > 0 && <div className="text-emerald-500/70">Adv: <span className="text-emerald-600">-{formatCurrency(t.advance)}</span></div>}
              </div>
              
              {t.paymentSplit && (
                <div className="pt-2 mt-1 border-t border-slate-200 flex flex-wrap gap-3 text-[8px] font-black text-slate-400">
                  <span className="text-slate-500">Split:</span>
                  {t.paymentSplit.cash > 0 && <div className="flex items-center gap-1 text-slate-700"><Banknote size={8} className="text-emerald-600" /> Cash: {formatCurrency(t.paymentSplit.cash)}</div>}
                  {t.paymentSplit.card > 0 && <div className="flex items-center gap-1 text-slate-700"><CreditCard size={8} className="text-indigo-600" /> Card: {formatCurrency(t.paymentSplit.card)}</div>}
                  {t.paymentSplit.zelle > 0 && <div className="flex items-center gap-1 text-slate-700"><Zap size={8} className="text-purple-600" /> Zelle: {formatCurrency(t.paymentSplit.zelle)}</div>}
                </div>
              )}
              
              {t.cashReceived && (
                <div className="pt-2 mt-1 border-t border-slate-200 flex gap-4 text-[8px] font-black">
                  <div className="text-emerald-600">Received: {formatCurrency(t.cashReceived)}</div>
                  {t.changeDue && <div className="text-amber-600">Change: {formatCurrency(t.changeDue)}</div>}
                </div>
              )}
            </div>

            {t.customer && (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 grid grid-cols-2 gap-y-2.5 gap-x-6 shadow-sm">
                {t.customer.name && (
                  <div className="flex items-center gap-2.5 text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">
                    <User size={12} className="text-amber-600" />
                    <span className="text-slate-700">{t.customer.name}</span>
                  </div>
                )}
                {t.customer.phone && (
                  <div className="flex items-center gap-2.5 text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">
                    <Phone size={12} className="text-amber-600" />
                    <span className="text-slate-700">{t.customer.phone}</span>
                  </div>
                )}
                {t.customer.email && (
                  <div className="flex items-center gap-2.5 text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">
                    <Mail size={12} className="text-amber-600" />
                    <span className="truncate max-w-[150px] lowercase text-slate-700">{t.customer.email}</span>
                  </div>
                )}
                {t.customer.warranty && (
                  <div className="flex items-center gap-2.5 text-[10px] font-black text-emerald-600 uppercase tracking-widest leading-none">
                    <ShieldCheck size={12} />
                    <span>{t.customer.warranty} Coverage</span>
                  </div>
                )}
                {t.customer.idType && (
                  <div className="flex items-center gap-2.5 text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">
                    <Fingerprint size={12} className="text-amber-600" />
                    <span className="text-slate-700">{t.customer.idType} Card</span>
                  </div>
                )}
                {t.customer.idNumber && (
                  <div className="flex items-center gap-2.5 text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">
                    <Hash size={12} className="text-amber-600" />
                    <span className="text-slate-700">Ref: {t.customer.idNumber}</span>
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
