import { useMemo, useState } from 'react';
import { FileSpreadsheet, FileText, Trash2, Utensils, Car, Home, Zap, Heart, ShoppingBag, Box, DollarSign, Wallet, Smartphone, Layers, Wrench, Hammer, Unlock, Store, Gamepad, Banknote, CreditCard, User, Phone, Mail, ShieldCheck, Fingerprint, Hash, Tablet, Sparkles, ToyBrick, Package, Watch, Cpu, ChevronDown, Search, X, CheckSquare, Square, Coffee } from 'lucide-react';
import { Transaction, WorkHour, STANDARD_REPAIR_CHECKLIST } from '../types';
import { formatCurrency, cn, formatTransactionId, formatTxDateTime, format12Hour, formatDateSafe } from '../lib/utils';
import { format, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import ExcelJS from 'exceljs';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { motion, AnimatePresence } from 'motion/react';
import CustomerHistoryModal from './CustomerHistoryModal';

interface TransactionListProps {
  transactions: Transaction[];
  allTransactions?: Transaction[];
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  onExportAudit?: () => void;
  workHours?: WorkHour[];
  onUpdateTransaction?: (updated: Transaction) => void;
}

const CATEGORY_ICONS: Record<string, any> = {
  Uber: <Car size={16} />,
  Food: <Utensils size={16} />,
  Transport: <Car size={16} />,
  Rent: <Home size={16} />,
  Utilities: <Zap size={16} />,
  Shopping: <ShoppingBag size={16} />,
  Income: <DollarSign size={16} />,
  Repair: <Wrench size={16} />,
  Accessory: <Watch size={16} />,
  Service: <Wrench size={16} />,
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
  Drinks: <Coffee size={16} />,
  Noodles: <Utensils size={16} />,
  Coffee: <Coffee size={16} />,
  Snacks: <Utensils size={16} />,
  'Stanley cup': <ShoppingBag size={16} />,
  'Earbud case': <Package size={16} />,
  Fan: <Zap size={16} />,
  Speaker: <Smartphone size={16} />,
  'Charging cord': <Zap size={16} />,
  Adapter: <Zap size={16} />,
  Cable: <Zap size={16} />,
  Bag: <ShoppingBag size={16} />,
  'Custom Name': <ShoppingBag size={16} />,
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

export default function TransactionList({ transactions, allTransactions, onDelete, onEdit, onExportAudit, workHours = [], onUpdateTransaction }: TransactionListProps) {
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchAllTime, setSearchAllTime] = useState(true);
  const [selectedCustomerForHistory, setSelectedCustomerForHistory] = useState<string | null>(null);

  const handleToggleChecklist = (tx: Transaction, itemId: string) => {
    const checklist = tx.repairChecklist || STANDARD_REPAIR_CHECKLIST;
    const updatedChecklist = checklist.map(item =>
      item.id === itemId ? { ...item, checked: !item.checked } : item
    );
    const updatedTx = {
      ...tx,
      repairChecklist: updatedChecklist,
      updatedAt: new Date().toISOString()
    };
    if (onUpdateTransaction) {
      onUpdateTransaction(updatedTx);
    }
  };

  const [exportFilters, setExportFilters] = useState({
    startDate: '',
    endDate: '',
    type: 'all' as 'all' | 'income' | 'expense' | 'refund'
  });

  const filteredForExport = useMemo(() => {
    return transactions.filter(t => {
      const matchesType = exportFilters.type === 'all' || t.type === exportFilters.type;
      const tDateStr = t.date ? t.date.slice(0, 10) : '';
      const matchesDate = (!exportFilters.startDate || tDateStr >= exportFilters.startDate) &&
                          (!exportFilters.endDate || tDateStr <= exportFilters.endDate);
      return matchesType && matchesDate;
    });
  }, [transactions, exportFilters]);

  const filteredWorkHoursForExport = useMemo(() => {
    return (workHours || []).filter(h => {
      const hDateStr = h.date ? h.date.slice(0, 10) : '';
      const matchesDate = (!exportFilters.startDate || hDateStr >= exportFilters.startDate) &&
                          (!exportFilters.endDate || hDateStr <= exportFilters.endDate);
      return matchesDate;
    });
  }, [workHours, exportFilters]);

  const exportToExcel = async () => {
    const dataToExport = filteredForExport;
    if (dataToExport.length === 0) {
      alert("No data match the selected filters.");
      return;
    }

    const wsData = dataToExport.map((t) => ({
      Date_Time: formatTxDateTime(t.date, t.createdAt),
      Type: t.type.toUpperCase(),
      Category: t.category,
      Status: t.workStatus || 'N/A',
      Items: t.items?.map(i => {
        let details = `${i.category}($${i.amount})`;
        if (i.cost) details += ` [Cost:$${i.cost}]`;
        if (i.model) details += ` | Mod:${i.model}`;
        if (i.imei) details += ` | IMEI:${i.imei}`;
        if (i.storage) details += ` | GB:${i.storage}`;
        if (i.color) details += ` | Color:${i.color}`;
        if (i.warranty) details += ` | Warnt:${i.warranty}`;
        if (i.carrier) details += ` | Carri:${i.carrier}`;
        if (i.phoneNumber) details += ` | Num:${i.phoneNumber}`;
        return details;
      }).join('; ') || t.category,
      Method: t.paymentSplit
        ? `SPLIT (Cash: ${t.paymentSplit.cash || 0} / Card: ${t.paymentSplit.card || 0} / Zelle: ${t.paymentSplit.zelle || 0})`
        : t.paymentMethod,
      Cash: t.paymentSplit?.cash || (t.paymentMethod === 'CASH' ? t.amount : 0),
      Card: t.paymentSplit?.card || (t.paymentMethod === 'CARD' ? t.amount : 0),
      Zelle: t.paymentSplit?.zelle || (t.paymentMethod === 'ZELLE' ? t.amount : 0),
      SubTotal: t.subTotal,
      Cost: t.totalCost || t.items?.reduce((acc, i) => acc + ((i.cost || 0) * i.quantity), 0) || 0,
      Profit: t.profit !== undefined ? t.profit : ((t.subTotal - t.discount) - (t.totalCost || t.items?.reduce((acc, i) => acc + ((i.cost || 0) * i.quantity), 0) || 0)),
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

    // Calculate Financial Summaries for the export
    const totalInc = dataToExport.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExp = dataToExport.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const totalRef = dataToExport.filter(t => t.type === 'refund').reduce((sum, t) => sum + t.amount, 0);
    const totalCost = dataToExport.reduce((sum, t) => sum + (t.totalCost || t.items?.reduce((acc, i) => acc + ((i.cost || 0) * i.quantity), 0) || 0), 0);
    const netProfit = totalInc - totalCost - totalExp - totalRef;
    const totalDue = dataToExport.reduce((sum, t) => sum + (t.due || 0), 0);

    let totalCashIncome = 0;
    let totalCardIncome = 0;
    let totalCashRefund = 0;
    let totalCardRefund = 0;

    dataToExport.forEach(t => {
      let cashVal = 0;
      let cardVal = 0;

      if (t.paymentSplit) {
        cashVal = Number(t.paymentSplit.cash || 0);
        cardVal = Number(t.paymentSplit.card || 0);
      } else {
        if (t.paymentMethod === 'CASH') {
          cashVal = Number(t.amount || 0);
        } else if (t.paymentMethod === 'CARD') {
          cardVal = Number(t.amount || 0);
        }
      }

      if (t.type === 'income') {
        totalCashIncome += cashVal;
        totalCardIncome += cardVal;
      } else if (t.type === 'refund') {
        totalCashRefund += cashVal;
        totalCardRefund += cardVal;
      }
    });

    const workbook = new ExcelJS.Workbook();

    // ==========================================
    // 1st WORKSHEET: FINANCIAL SUMMARY & P&L
    // ==========================================
    const pnlSheet = workbook.addWorksheet('Financial Summary P&L');

    const titleRow = pnlSheet.addRow(['ALL CELLULAR & REPAIR - FINANCIAL SUMMARY & P&L REPORT']);
    titleRow.font = { name: 'Arial', size: 13, bold: true, color: { argb: 'FFFFFFFF' } };
    titleRow.height = 30;
    pnlSheet.mergeCells('A1:C1');
    pnlSheet.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } };
    pnlSheet.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };

    let pnlSubtitle = `Report Date: ${format(new Date(), 'dd MMM yyyy, hh:mm a')}`;
    if (exportFilters.startDate || exportFilters.endDate) {
      pnlSubtitle += `  |  Filtered Period: ${exportFilters.startDate || 'Start'} to ${exportFilters.endDate || 'End'}`;
    }
    const dateRow = pnlSheet.addRow([pnlSubtitle, '', '']);
    dateRow.font = { name: 'Arial', size: 9, italic: true, color: { argb: 'FF64748B' } };
    pnlSheet.mergeCells('A2:C2');

    pnlSheet.addRow([]); // Blank separator

    const pnlHeader = pnlSheet.addRow(['Financial Metric / Category', 'Amount ($)', 'Detailed Description']);
    pnlHeader.height = 26;
    pnlHeader.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
    pnlHeader.eachCell((cell) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } };
      cell.alignment = { vertical: 'middle' };
    });

    const pnlMetrics = [
      { metric: 'Total Gross Sales / Income (+)', val: totalInc, bg: 'FFECFDF5', color: 'FF047857', note: 'Total revenue from sales & services' },
      { metric: '  • Cash Sales Income', val: totalCashIncome, bg: 'FFECFDF5', color: 'FF065F46', note: 'Cash collections' },
      { metric: '  • Card Sales Income', val: totalCardIncome, bg: 'FFECFDF5', color: 'FF065F46', note: 'Credit/Debit card collections' },
      { metric: 'Total Product / Item Cost (-)', val: totalCost, bg: 'FFFFF1F2', color: 'FFE11D48', note: 'Wholesale / inventory cost of sold items' },
      { metric: 'Total Operating Expenses (-)', val: totalExp, bg: 'FFFFF1F2', color: 'FFBE123C', note: 'Store operating & general expenses' },
      { metric: 'Total Customer Refunds (-)', val: totalRef, bg: 'FFFEF2F2', color: 'FFDC2626', note: 'Refunds issued to customers' },
      { metric: '  • Cash Refunds Issued', val: totalCashRefund, bg: 'FFFEF2F2', color: 'FF92400E', note: 'Cash refunds' },
      { metric: '  • Card Refunds Issued', val: totalCardRefund, bg: 'FFFEF2F2', color: 'FF92400E', note: 'Card refunds' },
      { metric: 'NET PROFIT / MONEY MADE', val: netProfit, bg: 'FFDCFCE7', color: 'FF166534', note: 'Net money made after costs, expenses & refunds' },
      { metric: 'Total Outstanding Balance Due', val: totalDue, bg: 'FFFEF2F2', color: 'FFDC2626', note: 'Uncollected balance due from customers' }
    ];

    pnlMetrics.forEach(m => {
      const row = pnlSheet.addRow([m.metric, m.val, m.note]);
      row.height = 22;
      row.getCell(1).font = { name: 'Arial', size: 9.5, bold: true, color: { argb: 'FF334155' } };
      row.getCell(2).font = { name: 'Arial', size: 10, bold: true, color: { argb: m.color } };
      row.getCell(2).numFmt = '$#,##0.00';
      row.getCell(3).font = { name: 'Arial', size: 8.5, italic: true, color: { argb: 'FF64748B' } };
      row.eachCell({ includeEmpty: true }, (cell) => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: m.bg } };
        cell.border = {
          bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
        };
      });
    });

    pnlSheet.getColumn(1).width = 36;
    pnlSheet.getColumn(2).width = 20;
    pnlSheet.getColumn(3).width = 46;

    // ==========================================
    // 2nd WORKSHEET: TRANSACTIONS LIST
    // ==========================================
    const worksheet = workbook.addWorksheet('Transactions');

    // Define columns
    worksheet.columns = Object.keys(wsData[0]).map(key => ({ 
      header: key.replace(/_/g, ' '), 
      key: key, 
      width: 18 
    }));
    worksheet.addRows(wsData);

    // Header styling - Dark Navy background, White text, Centered
    const headerRow = worksheet.getRow(1);
    headerRow.height = 28;
    headerRow.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF0F172A' } // Slate-900
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        bottom: { style: 'medium', color: { argb: 'FF334155' } }
      };
    });

    // Style each data row with individual colors based on Transaction Type!
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;

      const typeValue = row.getCell('Type').value?.toString();

      row.height = 22;
      row.font = { name: 'Arial', size: 9 };

      // Row colors: Income = Light Emerald/Green, Expense = Light Rose, Refund = Soft Red
      let bgArgb = 'FFFFFFFF';
      let typeFontColor = 'FF1E293B';

      if (typeValue === 'INCOME') {
        bgArgb = 'FFECFDF5'; // Light Emerald Green
        typeFontColor = 'FF047857'; // Dark Emerald Green
      } else if (typeValue === 'EXPENSE') {
        bgArgb = 'FFFFF1F2'; // Light Rose
        typeFontColor = 'FFBE123C'; // Dark Rose
      } else if (typeValue === 'REFUND') {
        bgArgb = 'FFFEF2F2'; // Light Red
        typeFontColor = 'FFDC2626'; // Bright Red
      }

      row.eachCell({ includeEmpty: true }, (cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: bgArgb }
        };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
        };
        cell.alignment = { vertical: 'middle' };
      });

      // Type cell styling
      const typeCell = row.getCell('Type');
      typeCell.font = { name: 'Arial', size: 9, bold: true, color: { argb: typeFontColor } };
      typeCell.alignment = { vertical: 'middle', horizontal: 'center' };

      // Total cell styling - Green for Income, Red for Refund
      const totalCell = row.getCell('Total');
      totalCell.font = { 
        name: 'Arial', 
        size: 9, 
        bold: true, 
        color: { argb: typeValue === 'INCOME' ? 'FF047857' : typeValue === 'REFUND' ? 'FFDC2626' : 'FF09090B' } 
      };

      // Due cell highlighting
      const dueCell = row.getCell('Due');
      if (Number(dueCell.value) > 0) {
        dueCell.font = { name: 'Arial', size: 9, bold: true, color: { argb: 'FFDC2626' } };
      }
    });

    // Empty separator row
    worksheet.addRow({});

    // Summary Totals Row
    const summaryRow = worksheet.addRow({
      Date_Time: 'TOTAL FINANCIAL SUMMARY',
      Type: `INC: $${totalInc.toFixed(2)}`,
      Category: `COST: $${totalCost.toFixed(2)}`,
      Status: `EXP: $${totalExp.toFixed(2)}`,
      Method: `REF: $${totalRef.toFixed(2)}`,
      Cash: totalCashIncome,
      Card: totalCardIncome,
      SubTotal: dataToExport.reduce((sum, t) => sum + (t.subTotal || 0), 0),
      Cost: totalCost,
      Profit: netProfit,
      Total: dataToExport.reduce((sum, t) => sum + t.amount, 0),
      Due: totalDue
    });
    summaryRow.height = 26;
    summaryRow.eachCell({ includeEmpty: true }, (cell) => {
      cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF0F172A' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFCBD5E1' } // Slate 300
      };
      cell.border = {
        top: { style: 'medium', color: { argb: 'FF0F172A' } },
        bottom: { style: 'double', color: { argb: 'FF0F172A' } }
      };
      cell.alignment = { vertical: 'middle' };
    });

    // Empty separator row
    worksheet.addRow({});

    // Financial Metric Overview Header Row
    const overviewHeaderRow = worksheet.addRow({
      Transaction_ID: 'FINANCIAL METRIC OVERVIEW',
      Date_Time: 'TOTAL AMOUNT ($)'
    });
    overviewHeaderRow.height = 24;
    overviewHeaderRow.eachCell({ includeEmpty: true }, (cell) => {
      cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF0F172A' } // Slate-900
      };
      cell.alignment = { vertical: 'middle' };
    });

    const metrics = [
      { name: 'Total Gross Sales / Income (+)', val: `$${totalInc.toFixed(2)}`, bg: 'FFECFDF5', color: 'FF047857' },
      { name: '  • Total Cash Income', val: `$${totalCashIncome.toFixed(2)}`, bg: 'FFECFDF5', color: 'FF065F46' },
      { name: '  • Total Card Income', val: `$${totalCardIncome.toFixed(2)}`, bg: 'FFECFDF5', color: 'FF065F46' },
      { name: 'Total Product / Item Cost (-)', val: `$${totalCost.toFixed(2)}`, bg: 'FFFFF1F2', color: 'FFE11D48' },
      { name: 'Total Business Expenses (-)', val: `$${totalExp.toFixed(2)}`, bg: 'FFFFF1F2', color: 'FFBE123C' },
      { name: 'Total Customer Refunds (-)', val: `$${totalRef.toFixed(2)}`, bg: 'FFFEF2F2', color: 'FFDC2626' },
      { name: '  • Total Cash Refund', val: `$${totalCashRefund.toFixed(2)}`, bg: 'FFFEF2F2', color: 'FF92400E' },
      { name: '  • Total Card Refund', val: `$${totalCardRefund.toFixed(2)}`, bg: 'FFFEF2F2', color: 'FF92400E' },
      { name: 'Net Profit / Money Made', val: `$${netProfit.toFixed(2)}`, bg: 'FFDCFCE7', color: 'FF166534' },
      { name: 'Total Outstanding Balance Due', val: `$${totalDue.toFixed(2)}`, bg: 'FFFEF2F2', color: 'FFDC2626' }
    ];

    metrics.forEach(m => {
      const mRow = worksheet.addRow({
        Transaction_ID: m.name,
        Date_Time: m.val
      });
      mRow.height = 22;
      mRow.getCell('Transaction_ID').font = { name: 'Arial', size: 9, bold: true, color: { argb: 'FF334155' } };
      mRow.getCell('Date_Time').font = { name: 'Arial', size: 9.5, bold: true, color: { argb: m.color } };
      mRow.eachCell({ includeEmpty: true }, cell => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: m.bg }
        };
        cell.border = {
          bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
        };
      });
    });

    // STAFF SHIFT LOGS SECTION IN MAIN SHEET
    if (filteredWorkHoursForExport.length > 0) {
      worksheet.addRow({});

      const shiftHeaderRow = worksheet.addRow({
        Transaction_ID: 'STAFF SHIFT LOGS & HOURS',
        Date_Time: 'STAFF MEMBER NAME',
        Type: 'SHIFT DATE',
        Category: 'START TIME',
        Status: 'END TIME',
        Items: 'TIME-WISE SHIFT RANGE',
        Method: 'HOURS LOGGED',
        Cash: 'ACTIVITY / ROLE NOTE'
      });
      shiftHeaderRow.height = 24;
      shiftHeaderRow.eachCell({ includeEmpty: true }, (cell) => {
        cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFD97706' } // Amber-600
        };
        cell.alignment = { vertical: 'middle' };
      });

      let totalShiftHours = 0;
      filteredWorkHoursForExport.forEach(h => {
        totalShiftHours += h.hours;
        const rangeStr = (h.startTime && h.endTime) 
          ? `${format12Hour(h.startTime)} to ${format12Hour(h.endTime)}`
          : 'Full Day / Manual';

        const sRow = worksheet.addRow({
          Transaction_ID: 'SHIFT-LOG',
          Date_Time: h.employeeName || 'Staff Member',
          Type: h.date,
          Category: format12Hour(h.startTime) || '10:00 AM',
          Status: format12Hour(h.endTime) || '08:00 PM',
          Items: rangeStr,
          Method: `${h.hours.toFixed(1)} HRS`,
          Cash: h.note || '-'
        });
        sRow.height = 20;
        sRow.getCell('Date_Time').font = { name: 'Arial', size: 9, bold: true, color: { argb: 'FFB45309' } };
        sRow.getCell('Items').font = { name: 'Arial', size: 9, bold: true, color: { argb: 'FF1E293B' } };
        sRow.getCell('Method').font = { name: 'Arial', size: 9, bold: true, color: { argb: 'FF047857' } };
        sRow.eachCell({ includeEmpty: true }, cell => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFDF8F6' }
          };
          cell.border = {
            bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
            left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
            right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
          };
        });
      });

      const shiftSummaryRow = worksheet.addRow({
        Transaction_ID: 'TOTAL SHIFT HOURS',
        Date_Time: `${filteredWorkHoursForExport.length} Shift Logs`,
        Method: `${totalShiftHours.toFixed(1)} HRS`
      });
      shiftSummaryRow.height = 22;
      shiftSummaryRow.eachCell({ includeEmpty: true }, (cell) => {
        cell.font = { name: 'Arial', size: 9.5, bold: true, color: { argb: 'FF92400E' } };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFEF3C7' }
        };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFD97706' } },
          bottom: { style: 'medium', color: { argb: 'FFD97706' } }
        };
      });
    }

    // DEDICATED WORKSHEET FOR SHIFT LOGS
    const shiftWorksheet = workbook.addWorksheet('Shift Logs (Staff)');
    const shiftWsData = filteredWorkHoursForExport.map(h => ({
      Staff_Member_Name: h.employeeName || 'Staff Member',
      Shift_Date: h.date,
      Start_Time: format12Hour(h.startTime) || '10:00 AM',
      End_Time: format12Hour(h.endTime) || '08:00 PM',
      Time_Wise_Shift_Range: (h.startTime && h.endTime) ? `${format12Hour(h.startTime)} to ${format12Hour(h.endTime)}` : 'Full Day',
      Total_Hours_Worked: `${h.hours.toFixed(1)} HRS`,
      Activity_Role_Note: h.note || ''
    }));

    if (shiftWsData.length > 0) {
      shiftWorksheet.columns = Object.keys(shiftWsData[0]).map(key => ({
        header: key.replace(/_/g, ' '),
        key: key,
        width: 22
      }));
      shiftWorksheet.addRows(shiftWsData);

      const shiftHeader = shiftWorksheet.getRow(1);
      shiftHeader.height = 28;
      shiftHeader.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
      shiftHeader.eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFB45309' } // Amber-700
        };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.border = {
          bottom: { style: 'medium', color: { argb: 'FF78350F' } }
        };
      });

      shiftWorksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return;
        row.height = 22;
        row.font = { name: 'Arial', size: 9 };
        row.eachCell({ includeEmpty: true }, (cell) => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFDF8F6' }
          };
          cell.border = {
            top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
            bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
            left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
            right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
          };
          cell.alignment = { vertical: 'middle' };
        });

        const staffCell = row.getCell('Staff_Member_Name');
        staffCell.font = { name: 'Arial', size: 9.5, bold: true, color: { argb: 'FF92400E' } };

        const hoursCell = row.getCell('Total_Hours_Worked');
        hoursCell.font = { name: 'Arial', size: 9.5, bold: true, color: { argb: 'FF047857' } };
      });

      const totalShiftHrs = filteredWorkHoursForExport.reduce((sum, h) => sum + h.hours, 0);
      const shiftTotRow = shiftWorksheet.addRow({
        Staff_Member_Name: 'TOTAL SHIFT HOURS LOGGED',
        Total_Hours_Worked: `${totalShiftHrs.toFixed(1)} HRS`
      });
      shiftTotRow.height = 26;
      shiftTotRow.eachCell({ includeEmpty: true }, (cell) => {
        cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF78350F' } };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFEF3C7' }
        };
        cell.border = {
          top: { style: 'medium', color: { argb: 'FFB45309' } },
          bottom: { style: 'double', color: { argb: 'FFB45309' } }
        };
      });

      shiftWorksheet.columns.forEach((column) => {
        let maxLen = column.header ? column.header.length : 12;
        column.eachCell?.({ includeEmpty: true }, (cell) => {
          const len = cell.value ? String(cell.value).length : 0;
          if (len > maxLen) maxLen = len;
        });
        column.width = Math.min(Math.max(maxLen + 3, 14), 45);
      });
    }

    // Auto-adjust column widths for main sheet
    worksheet.columns.forEach((column) => {
      let maxLen = column.header ? column.header.length : 12;
      column.eachCell?.({ includeEmpty: true }, (cell) => {
        const len = cell.value ? String(cell.value).length : 0;
        if (len > maxLen) maxLen = len;
      });
      column.width = Math.min(Math.max(maxLen + 3, 12), 45);
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Report_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToPDF = () => {
    const dataToExport = filteredForExport;
    if (dataToExport.length === 0) {
      alert("No data match the selected filters.");
      return;
    }
    const doc = new jsPDF('l', 'pt', 'a4');
    const pageHeight = doc.internal.pageSize.height;
    const rowCount = dataToExport.length;
    
    // Dynamic sizing to guarantee single page fit
    const mainFontSize = rowCount > 15 ? 9 : 9.5;
    const mainCellPadding = rowCount > 15 ? 3 : 3.5;

    // Title Header
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text("All Cellular & Repair - Transaction & Financial Report", 30, 30);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    let subtitleText = `Generated: ${format(new Date(), 'dd MMM yyyy, hh:mm a')}`;
    if (exportFilters.startDate || exportFilters.endDate) {
      subtitleText += `  |  Period: ${exportFilters.startDate || 'Start'} to ${exportFilters.endDate || 'End'}`;
    }
    doc.text(subtitleText, 30, 43);

    const tableData = dataToExport.map((t, index) => {
      const txCost = t.totalCost || t.items?.reduce((acc, i) => acc + ((i.cost || 0) * i.quantity), 0) || 0;
      const txProfit = t.profit !== undefined ? t.profit : ((t.subTotal - t.discount) - txCost);

      return [
        formatTransactionId(t.id, index),
        formatTxDateTime(t.date, t.createdAt),
        t.type.toUpperCase(),
        (() => {
          let catStr = t.items?.map(i => {
            let str = i.category;
            if (i.cost !== undefined && i.cost > 0) str += ` [Cost:$${i.cost}]`;
            if (i.model) str += ` (${i.model})`;
            if (i.carrier) str += ` (${i.carrier})`;
            if (i.phoneNumber) str += ` [#:${i.phoneNumber}]`;
            if (i.imei) str += ` [EMI:${i.imei}]`;
            if (i.isPreOrder) str += ` [PRE-ORDER]`;
            if (i.advance && i.advance > 0) str += ` [Adv:$${i.advance}]`;
            return str;
          }).join(', ') || t.category;
          if (t.advance && t.advance > 0) {
            catStr += ` | Adv Deposit: ${formatCurrency(t.advance)}`;
          }
          return catStr;
        })(),
        t.workStatus || '-',
        t.paymentSplit
          ? `SPLIT (Cash: ${formatCurrency(t.paymentSplit.cash || 0)} | Card: ${formatCurrency(t.paymentSplit.card || 0)} | Zelle: ${formatCurrency(t.paymentSplit.zelle || 0)})`
          : t.paymentMethod,
        formatCurrency(t.amount),
        txCost > 0 ? formatCurrency(txCost) : '-',
        (t.type === 'income' && txCost > 0) ? formatCurrency(txProfit) : (t.type === 'income' ? formatCurrency(t.amount) : '-'),
        formatCurrency(t.due),
        t.customer?.name || '-',
        t.note || '-'
      ];
    });

    // Draw Main Transactions Table
    autoTable(doc, {
      startY: 50,
      margin: { left: 30, right: 30 },
      head: [['Txn ID', 'Date & Time', 'Type', 'Category / Details', 'Status', 'Method', 'Total', 'Cost', 'Profit', 'Due', 'Customer', 'Note']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42], textColor: 255, fontStyle: 'bold', fontSize: 10, cellPadding: { top: 5, bottom: 5, left: 3, right: 3 }, valign: 'middle' },
      styles: { fontSize: mainFontSize, cellPadding: mainCellPadding, valign: 'middle' },
      columnStyles: {
        6: { halign: 'right' },
        7: { halign: 'right' },
        8: { halign: 'right' },
        9: { halign: 'right' }
      },
      didParseCell: (data) => {
        if (data.section === 'body') {
          const rawRow = dataToExport[data.row.index];
          if (rawRow) {
            if (rawRow.type === 'income') {
              data.cell.styles.fillColor = [236, 253, 245]; // Soft Emerald Green
              if (data.column.index === 2 || data.column.index === 6) { // Type & Total
                data.cell.styles.textColor = [4, 120, 87];
                data.cell.styles.fontStyle = 'bold';
              }
            } else if (rawRow.type === 'refund') {
              data.cell.styles.fillColor = [254, 242, 242]; // Soft Red
              if (data.column.index === 2 || data.column.index === 6) {
                data.cell.styles.textColor = [220, 38, 38];
                data.cell.styles.fontStyle = 'bold';
              }
            } else if (rawRow.type === 'expense') {
              data.cell.styles.fillColor = [255, 241, 242]; // Soft Rose
              if (data.column.index === 2 || data.column.index === 6) {
                data.cell.styles.textColor = [190, 18, 60];
                data.cell.styles.fontStyle = 'bold';
              }
            }

            // Cost column (index 7)
            if (data.column.index === 7 && data.cell.raw !== '-') {
              data.cell.styles.textColor = [225, 29, 72];
              data.cell.styles.fontStyle = 'bold';
            }

            // Profit column (index 8)
            if (data.column.index === 8 && data.cell.raw !== '-') {
              data.cell.styles.textColor = [22, 101, 52];
              data.cell.styles.fontStyle = 'bold';
            }

            // Highlight due column (index 9) in red if > 0
            if (data.column.index === 9 && rawRow.due > 0) {
              data.cell.styles.textColor = [220, 38, 38];
              data.cell.styles.fontStyle = 'bold';
            }
          }
        }
      }
    });

    // CALCULATE FINANCIAL TOTALS FOR PDF SUMMARY
    const totalIncome = dataToExport.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = dataToExport.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const totalRefund = dataToExport.filter(t => t.type === 'refund').reduce((sum, t) => sum + t.amount, 0);
    const pdfTotalCost = dataToExport.reduce((sum, t) => sum + (t.totalCost || t.items?.reduce((acc, i) => acc + ((i.cost || 0) * i.quantity), 0) || 0), 0);
    const netProfit = totalIncome - pdfTotalCost - totalExpense - totalRefund;
    const totalDue = dataToExport.reduce((sum, t) => sum + (t.due || 0), 0);

    let pdfCashIncome = 0;
    let pdfCardIncome = 0;
    let pdfZelleIncome = 0;
    let pdfCashRefund = 0;
    let pdfCardRefund = 0;
    let pdfZelleRefund = 0;

    dataToExport.forEach(t => {
      let cashVal = 0;
      let cardVal = 0;
      let zelleVal = 0;

      if (t.paymentSplit) {
        cashVal = Number(t.paymentSplit.cash || 0);
        cardVal = Number(t.paymentSplit.card || 0);
        zelleVal = Number(t.paymentSplit.zelle || 0);
      } else {
        if (t.paymentMethod === 'CASH') cashVal = Number(t.amount || 0);
        else if (t.paymentMethod === 'CARD') cardVal = Number(t.amount || 0);
        else if (t.paymentMethod === 'ZELLE') zelleVal = Number(t.amount || 0);
      }

      if (t.type === 'income') {
        pdfCashIncome += cashVal;
        pdfCardIncome += cardVal;
        pdfZelleIncome += zelleVal;
      } else if (t.type === 'refund') {
        pdfCashRefund += cashVal;
        pdfCardRefund += cardVal;
        pdfZelleRefund += zelleVal;
      }
    });

    const totalAdvance = dataToExport.reduce((sum, t) => sum + (t.advance || 0), 0);

    const finalY = (doc as any).lastAutoTable?.finalY || 100;
    const summaryStartY = Math.min(finalY + 10, pageHeight - 180);
    const hasShiftLogs = filteredWorkHoursForExport.length > 0;

    // Draw Financial Overview Table (Left Column)
    autoTable(doc, {
      startY: summaryStartY,
      margin: { left: 30 },
      tableWidth: hasShiftLogs ? 380 : 480,
      head: [['Financial Metric Overview', 'Amount ($)']],
      body: [
        ['Total Gross Sales / Income (+)', formatCurrency(totalIncome)],
        ['  • Cash Sales (Inc. Split)', formatCurrency(pdfCashIncome)],
        ['  • Card Sales (Inc. Split)', formatCurrency(pdfCardIncome)],
        ['  • Zelle Sales (Inc. Split)', formatCurrency(pdfZelleIncome)],
        ['Total Items / Products Cost (-)', formatCurrency(pdfTotalCost)],
        ['Total Business Expenses (-)', formatCurrency(totalExpense)],
        ['Total Customer Refunds (-)', formatCurrency(totalRefund)],
        ['  • Cash Refund', formatCurrency(pdfCashRefund)],
        ['  • Card Refund', formatCurrency(pdfCardRefund)],
        ['  • Zelle Refund', formatCurrency(pdfZelleRefund)],
        ['Total Advance Deposits Collected', formatCurrency(totalAdvance)],
        ['Net Profit / Money Made', formatCurrency(netProfit)],
        ['Total Outstanding Balance Due', formatCurrency(totalDue)]
      ],
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 10 },
      styles: { fontSize: 9.5, cellPadding: 3, fontStyle: 'bold' },
      didParseCell: (data) => {
        if (data.section === 'body') {
          const rowIndex = data.row.index;
          if (rowIndex >= 0 && rowIndex <= 3) {
            data.cell.styles.fillColor = [236, 253, 245];
            data.cell.styles.textColor = [4, 120, 87];
          } else if (rowIndex === 4) {
            data.cell.styles.fillColor = [255, 241, 242];
            data.cell.styles.textColor = [225, 29, 72];
          } else if (rowIndex === 5) {
            data.cell.styles.fillColor = [255, 241, 242];
            data.cell.styles.textColor = [190, 18, 60];
          } else if (rowIndex >= 6 && rowIndex <= 9) {
            data.cell.styles.fillColor = [254, 242, 242];
            data.cell.styles.textColor = [220, 38, 38];
          } else if (rowIndex === 10) {
            data.cell.styles.fillColor = [243, 232, 255];
            data.cell.styles.textColor = [126, 34, 206];
          } else if (rowIndex === 11) {
            data.cell.styles.fillColor = [220, 252, 231];
            data.cell.styles.textColor = [22, 101, 52];
          } else if (rowIndex === 12) {
            data.cell.styles.fillColor = [254, 242, 242];
            data.cell.styles.textColor = [220, 38, 38];
          }
        }
      },
      columnStyles: {
        0: { cellWidth: hasShiftLogs ? 250 : 320 },
        1: { cellWidth: hasShiftLogs ? 130 : 160, halign: 'right' }
      }
    });

    // Draw Staff Shift Logs Table (Right Column side-by-side)
    if (hasShiftLogs) {
      const shiftTableData = filteredWorkHoursForExport.map(h => [
        h.employeeName || 'Staff Member',
        formatDateSafe(h.date, 'dd MMM yyyy'),
        (h.startTime && h.endTime) ? `${format12Hour(h.startTime)} to ${format12Hour(h.endTime)}` : 'Full Day',
        `${h.hours.toFixed(1)} HRS`,
        h.note || '-'
      ]);

      const totalPdfShiftHours = filteredWorkHoursForExport.reduce((s, h) => s + h.hours, 0);
      shiftTableData.push([
        'TOTAL SHIFT HOURS',
        `${filteredWorkHoursForExport.length} Logs`,
        '',
        `${totalPdfShiftHours.toFixed(1)} HRS`,
        ''
      ]);

      autoTable(doc, {
        startY: summaryStartY,
        margin: { left: 425 },
        tableWidth: 385,
        head: [['Staff Member', 'Shift Date', 'Time Range', 'Hours', 'Role / Note']],
        body: shiftTableData,
        theme: 'grid',
        headStyles: { fillColor: [217, 119, 6], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 10 },
        styles: { fontSize: 9.5, cellPadding: 3 },
        didParseCell: (data) => {
          if (data.section === 'body') {
            const isTotalRow = data.row.index === shiftTableData.length - 1;
            if (isTotalRow) {
              data.cell.styles.fillColor = [254, 243, 199];
              data.cell.styles.textColor = [120, 53, 15];
              data.cell.styles.fontStyle = 'bold';
            } else {
              data.cell.styles.fillColor = [253, 248, 246];
              if (data.column.index === 0) {
                data.cell.styles.textColor = [180, 83, 9];
                data.cell.styles.fontStyle = 'bold';
              } else if (data.column.index === 3) {
                data.cell.styles.textColor = [4, 120, 87];
                data.cell.styles.fontStyle = 'bold';
              }
            }
          }
        },
        columnStyles: {
          0: { cellWidth: 95 },
          1: { cellWidth: 70 },
          2: { cellWidth: 90 },
          3: { cellWidth: 50 },
          4: { cellWidth: 80 }
        }
      });
    }

    // Static Single-Page Footer
    doc.setFontSize(9.5);
    doc.setTextColor(148, 163, 184);
    doc.text("ALL CELLULAR AND REPAIR  •  925 W Baseline Rd, Tempe, AZ", 30, pageHeight - 15);
    doc.text("Page 1 of 1", doc.internal.pageSize.width - 60, pageHeight - 15);

    doc.save(`Report_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  const sortedTransactions = useMemo(() => {
    const source = (searchQuery.trim() && searchAllTime && allTransactions) ? allTransactions : transactions;
    return [...source]
      .filter(t => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase().trim();
        const customerName = t.customer?.name?.toLowerCase() || '';
        const customerPhone = t.customer?.phone?.toLowerCase() || '';
        const note = t.note?.toLowerCase() || '';
        const itemsMatch = t.items?.some(i => 
          i.phoneNumber?.toLowerCase().includes(q) || 
          i.imei?.toLowerCase().includes(q) || 
          i.model?.toLowerCase().includes(q)
        ) || false;
        return customerName.includes(q) || customerPhone.includes(q) || note.includes(q) || itemsMatch;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, allTransactions, searchQuery, searchAllTime]);

  return (
    <div className="glass-card p-6 h-full flex flex-col bg-white border-slate-200 shadow-sm">
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex justify-between items-center">
          <h3 className="text-base font-black text-slate-800 uppercase tracking-widest premium-gradient-text">Recent Activity</h3>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowExportOptions(!showExportOptions)}
              className={cn(
                "flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg transition-all border shadow-sm",
                showExportOptions ? "bg-amber-500 text-white border-amber-600" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              )}
            >
              <FileSpreadsheet size={16} />
              EXPORT OPTIONS
              <ChevronDown size={14} className={cn("transition-transform", showExportOptions && "rotate-180")} />
            </button>
            {onExportAudit && (
              <button 
                onClick={onExportAudit}
                className="flex items-center gap-2 text-[10px] font-black text-amber-600 hover:text-amber-700 transition-all uppercase tracking-widest px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 shadow-sm"
                title="Export History"
              >
                <Fingerprint size={16} />
                HISTORY
              </button>
            )}
          </div>
        </div>

        {/* Search Bar for filtering by customer name, phone number, or notes */}
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search transactions by customer name, phone number, or notes..."
            className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white transition-all shadow-2xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              title="Clear search"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {searchQuery && allTransactions && (
          <div className="flex items-center justify-between bg-amber-50 border border-amber-200 px-3.5 py-2 rounded-xl text-xs font-bold text-amber-900 shadow-2xs">
            <span>
              {searchAllTime 
                ? `Searching across All-Time History (${allTransactions.length} total records)` 
                : `Searching only within current date view (${transactions.length} records)`}
            </span>
            <button
              type="button"
              onClick={() => setSearchAllTime(!searchAllTime)}
              className="underline font-black hover:text-amber-700 cursor-pointer ml-2"
            >
              {searchAllTime ? "Search Current View Only" : "Search All-Time History"}
            </button>
          </div>
        )}

        <AnimatePresence>
          {showExportOptions && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Type Filter</label>
                    <select 
                      value={exportFilters.type}
                      onChange={e => setExportFilters({...exportFilters, type: e.target.value as any})}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-[10px] font-black uppercase tracking-widest outline-none focus:border-amber-500/40"
                    >
                      <option value="all">ALL TYPES</option>
                      <option value="income">INCOME ONLY</option>
                      <option value="expense">EXPENSE ONLY</option>
                      <option value="refund">REFUND ONLY</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Start Date</label>
                    <input 
                      type="date"
                      value={exportFilters.startDate}
                      onChange={e => setExportFilters({...exportFilters, startDate: e.target.value})}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-[10px] font-black uppercase tracking-widest outline-none focus:border-amber-500/40"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">End Date</label>
                    <input 
                      type="date"
                      value={exportFilters.endDate}
                      onChange={e => setExportFilters({...exportFilters, endDate: e.target.value})}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-[10px] font-black uppercase tracking-widest outline-none focus:border-amber-500/40"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-2 border-t border-slate-200">
                  <button 
                    onClick={exportToExcel}
                    className="flex-1 flex items-center justify-center gap-2 text-[10px] font-black text-emerald-600 hover:text-emerald-700 transition-all uppercase tracking-widest px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-100 shadow-sm"
                  >
                    <FileSpreadsheet size={16} />
                    EXPORT EXCEL ({filteredForExport.length})
                  </button>
                  <button 
                    onClick={exportToPDF}
                    className="flex-1 flex items-center justify-center gap-2 text-[10px] font-black text-rose-600 hover:text-rose-700 transition-all uppercase tracking-widest px-4 py-3 rounded-xl bg-rose-50 border border-rose-100 shadow-sm"
                  >
                    <FileText size={16} />
                    EXPORT PDF ({filteredForExport.length})
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
        {sortedTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Box size={32} className="mb-2 opacity-20" />
            <p className="text-xs font-black uppercase tracking-widest">
              {searchQuery ? "No transactions found matching search" : "Global Log empty"}
            </p>
          </div>
        ) : (
          sortedTransactions.map((t, idx) => (
            <motion.div 
              key={t.id} 
              initial={{ opacity: 0, x: -20, rotateY: -10 }}
              animate={{ opacity: 1, x: 0, rotateY: 0 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ translateZ: 10, scale: 1.01 }}
              className="space-y-1 [transform-style:preserve-3d]"
            >
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
                    {t.customer?.name && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCustomerForHistory(t.customer!.name);
                        }}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 uppercase tracking-widest shadow-xs transition-all cursor-pointer"
                        title={`Click to view ${t.customer.name}'s entire past service history & total lifetime spending`}
                      >
                        <User size={10} className="text-amber-600 shrink-0" />
                        <span>{t.customer.name}</span>
                      </button>
                    )}
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 rounded bg-slate-200/80 text-slate-700 font-mono text-[9px] font-extrabold">
                      {formatTransactionId(t.id, idx)}
                    </span>
                    <span>{t.category} • {formatTxDateTime(t.date, t.createdAt)}</span>
                  </p>
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
                  {t.items.map(item => {
                    const itemSellTotal = item.amount * item.quantity;
                    const itemCostTotal = (item.cost || 0) * item.quantity;
                    const itemProfit = itemSellTotal - itemCostTotal;

                    return (
                      <div key={item.id} className="flex flex-col gap-1 border-l-2 border-amber-200 pl-3">
                        <div className="flex justify-between items-center text-[10px] font-black text-slate-500 uppercase tracking-widest">
                          <span className="flex items-center gap-1.5">
                            • {item.category} 
                            <span className="text-[8px] text-slate-400 bg-white border border-slate-100 px-1.5 rounded shadow-xs">x{item.quantity}</span>
                            {item.cost !== undefined && item.cost > 0 && (
                              <span className="text-[8px] font-bold text-rose-500 bg-rose-50 px-1.5 rounded border border-rose-100">
                                Cost: {formatCurrency(itemCostTotal)}
                              </span>
                            )}
                          </span>
                          <div className="text-right">
                            <span className="text-slate-800">{formatCurrency(itemSellTotal)}</span>
                            {item.cost !== undefined && item.cost > 0 && (
                              <span className="text-[8px] font-black text-emerald-600 block">
                                Profit: +{formatCurrency(itemProfit)}
                              </span>
                            )}
                          </div>
                        </div>
                        {(item.brand || item.model || item.quality || item.imei || item.storage || item.color || item.warranty || item.carrier || item.phoneNumber) && (
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[8px] font-black text-slate-400 uppercase tracking-tighter">
                            {item.brand && <div className="truncate">Brand: <span className="text-slate-800">{item.brand}</span></div>}
                            {item.model && <div className="truncate">Model: <span className="text-amber-600 font-bold">{item.model}</span></div>}
                            {item.quality && <div className="truncate">Quality: <span className="text-amber-700 bg-amber-50 px-1 rounded font-bold">{item.quality}</span></div>}
                            {item.imei && <div className="truncate">IMEI: <span className="text-amber-600">{item.imei}</span></div>}
                            {item.storage && <div>GB: <span className="text-amber-600">{item.storage}</span></div>}
                            {item.color && <div>Color: <span className="text-amber-600">{item.color}</span></div>}
                            {item.carrier && <div className="truncate">Carrier: <span className="text-amber-600">{item.carrier}</span></div>}
                            {item.phoneNumber && <div className="truncate">Num: <span className="text-amber-600">{item.phoneNumber}</span></div>}
                            {item.warranty && <div className="col-span-2 italic text-amber-600/80 leading-none">Security Warranty: {item.warranty}</div>}
                          </div>
                        )}
                        {(item.isPreOrder || (item.advance !== undefined && item.advance > 0)) && (
                          <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                            {item.isPreOrder && (
                              <span className="bg-purple-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider">
                                📦 PRE-ORDER
                              </span>
                            )}
                            {item.advance !== undefined && item.advance > 0 && (
                              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[8px] font-black px-1.5 py-0.5 rounded font-mono">
                                Adv: ${item.advance.toFixed(2)} | Due: ${Math.max(0, itemSellTotal - item.advance).toFixed(2)}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
              
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[9px] font-black border-t border-slate-200 pt-2">
                <div className="text-slate-400">Sub: <span className="text-slate-700">{formatCurrency(t.subTotal)}</span></div>
                {t.discount > 0 && <div className="text-rose-500/70">Disc: <span className="text-rose-600">-{formatCurrency(t.discount)}</span></div>}
                {t.tax > 0 && <div className="text-slate-400">Tax: <span className="text-slate-700">{formatCurrency(t.tax)}</span></div>}
                {t.advance > 0 && <div className="text-emerald-500/70">Adv: <span className="text-emerald-600">-{formatCurrency(t.advance)}</span></div>}
                
                {((t.totalCost && t.totalCost > 0) || (t.items && t.items.some(i => i.cost && i.cost > 0))) && (
                  <>
                    <div className="text-rose-500">Cost: <span className="font-mono">{formatCurrency(t.totalCost || t.items?.reduce((a, b) => a + ((b.cost || 0) * b.quantity), 0) || 0)}</span></div>
                    <div className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 ml-auto">
                      Profit: <span className="font-mono text-emerald-600">+{formatCurrency(t.profit !== undefined ? t.profit : ((t.subTotal - t.discount) - (t.totalCost || 0)))}</span>
                    </div>
                  </>
                )}
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
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCustomerForHistory(t.customer!.name);
                      }}
                      className="text-slate-800 hover:text-amber-600 font-extrabold underline decoration-amber-500/50 hover:decoration-amber-600 underline-offset-4 transition-all cursor-pointer text-left"
                      title={`Click to view ${t.customer.name}'s entire past service history & total lifetime spending`}
                    >
                      {t.customer.name}
                    </button>
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

            {/* Diagnostic & Repair Checklist (Auto-Save Enabled) */}
            {(t.repairChecklist || (t.category === 'Screen replacement' || t.category === 'Back glass' || t.category === 'Other fix' || t.category === 'Labor' || t.workStatus !== 'Not Started')) && (
              <div className="mt-3 p-4 bg-slate-50/90 rounded-2xl border border-slate-200/80 shadow-xs">
                <div className="flex items-center justify-between mb-2.5 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Wrench size={13} className="text-amber-600" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-700">Diagnostic & Repair Checklist</span>
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-black border border-emerald-300">
                      <span className="w-1 h-1 rounded-full bg-emerald-600 animate-pulse" /> Auto-Save Enabled
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-600 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                    {(t.repairChecklist || STANDARD_REPAIR_CHECKLIST).filter(i => i.checked).length} / {(t.repairChecklist || STANDARD_REPAIR_CHECKLIST).length} Tests Completed
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {(t.repairChecklist || STANDARD_REPAIR_CHECKLIST).map(item => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleChecklist(t, item.id);
                      }}
                      className={cn(
                        "flex items-center gap-2 px-2.5 py-1.5 rounded-xl border text-left transition-all cursor-pointer",
                        item.checked
                          ? "bg-emerald-50/90 border-emerald-300 text-emerald-950 font-bold"
                          : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                      )}
                    >
                      {item.checked ? (
                        <CheckSquare size={14} className="text-emerald-600 shrink-0" />
                      ) : (
                        <Square size={14} className="text-slate-400 shrink-0" />
                      )}
                      <span className={cn("text-[11px] truncate", item.checked && "line-through text-slate-500")}>
                        {item.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            </div>
            </motion.div>
          ))
        )}
      </div>

      <CustomerHistoryModal
        isOpen={Boolean(selectedCustomerForHistory)}
        onClose={() => setSelectedCustomerForHistory(null)}
        customerName={selectedCustomerForHistory}
        transactions={allTransactions || transactions}
        onEditTransaction={onEdit}
        onDeleteTransaction={onDelete}
      />
    </div>
  );
}
