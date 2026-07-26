import { useMemo, useState } from 'react';
import { FileSpreadsheet, FileText, Trash2, Utensils, Car, Home, Zap, Heart, ShoppingBag, Box, DollarSign, Wallet, Smartphone, Layers, Wrench, Hammer, Unlock, Store, Gamepad, Banknote, CreditCard, User, Phone, Mail, ShieldCheck, Fingerprint, Hash, Tablet, Sparkles, ToyBrick, Package, Watch, Cpu, ChevronDown } from 'lucide-react';
import { Transaction, WorkHour } from '../types';
import { formatCurrency, cn, formatTransactionId, formatTxDateTime, format12Hour, formatDateSafe } from '../lib/utils';
import { format, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import ExcelJS from 'exceljs';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { motion, AnimatePresence } from 'motion/react';

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  onExportAudit?: () => void;
  workHours?: WorkHour[];
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

export default function TransactionList({ transactions, onDelete, onEdit, onExportAudit, workHours = [] }: TransactionListProps) {
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [exportFilters, setExportFilters] = useState({
    startDate: '',
    endDate: '',
    type: 'all' as 'all' | 'income' | 'expense' | 'refund'
  });

  const filteredForExport = useMemo(() => {
    return transactions.filter(t => {
      const matchesType = exportFilters.type === 'all' || t.type === exportFilters.type;
      const tDate = new Date(t.date);
      const matchesDate = (!exportFilters.startDate || tDate >= startOfDay(new Date(exportFilters.startDate))) &&
                          (!exportFilters.endDate || tDate <= endOfDay(new Date(exportFilters.endDate)));
      return matchesType && matchesDate;
    });
  }, [transactions, exportFilters]);

  const filteredWorkHoursForExport = useMemo(() => {
    return (workHours || []).filter(h => {
      const hDate = new Date(h.date.length === 10 ? `${h.date}T00:00:00` : h.date);
      const sDate = exportFilters.startDate ? new Date(`${exportFilters.startDate}T00:00:00`) : null;
      const eDate = exportFilters.endDate ? new Date(`${exportFilters.endDate}T23:59:59`) : null;

      const matchesDate = (!sDate || hDate >= startOfDay(sDate)) &&
                          (!eDate || hDate <= endOfDay(eDate));
      return matchesDate;
    });
  }, [workHours, exportFilters]);

  const exportToExcel = async () => {
    const dataToExport = filteredForExport;
    if (dataToExport.length === 0) {
      alert("No data match the selected filters.");
      return;
    }

    const wsData = dataToExport.map((t, index) => ({
      Transaction_ID: formatTransactionId(t.id, index),
      Date_Time: formatTxDateTime(t.date, t.createdAt),
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

    // Calculate Financial Summaries for the bottom row
    const totalInc = dataToExport.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExp = dataToExport.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const totalRef = dataToExport.filter(t => t.type === 'refund').reduce((sum, t) => sum + t.amount, 0);
    const netProfit = totalInc - totalExp - totalRef;
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

    // Empty separator row
    worksheet.addRow({});

    // Summary Totals Row
    const summaryRow = worksheet.addRow({
      Transaction_ID: 'TOTAL FINANCIAL SUMMARY',
      Type: `INC: $${totalInc.toFixed(2)}`,
      Category: `CASH: $${totalCashIncome.toFixed(2)} | CARD: $${totalCardIncome.toFixed(2)}`,
      Status: `REF: $${totalRef.toFixed(2)}`,
      Method: `NET: $${netProfit.toFixed(2)}`,
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
      { name: 'Total Income (+)', val: `$${totalInc.toFixed(2)}`, bg: 'FFECFDF5', color: 'FF047857' },
      { name: '  • Total Cash Income', val: `$${totalCashIncome.toFixed(2)}`, bg: 'FFECFDF5', color: 'FF065F46' },
      { name: '  • Total Card Income', val: `$${totalCardIncome.toFixed(2)}`, bg: 'FFECFDF5', color: 'FF065F46' },
      { name: 'Total Expenses (-)', val: `$${totalExp.toFixed(2)}`, bg: 'FFFFF1F2', color: 'FFBE123C' },
      { name: 'Total Refunds (-)', val: `$${totalRef.toFixed(2)}`, bg: 'FFFEF2F2', color: 'FFDC2626' },
      { name: '  • Total Cash Refund', val: `$${totalCashRefund.toFixed(2)}`, bg: 'FFFEF2F2', color: 'FF92400E' },
      { name: '  • Total Card Refund', val: `$${totalCardRefund.toFixed(2)}`, bg: 'FFFEF2F2', color: 'FF92400E' },
      { name: 'Net Profit / Cash Flow', val: `$${netProfit.toFixed(2)}`, bg: 'FFE2E8F0', color: 'FF0F172A' },
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
    
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text("All Cellular & Repair - Transaction Report", 40, 40);
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`Generated on: ${format(new Date(), 'dd MMM yyyy, hh:mm a')}`, 40, 54);
    if (exportFilters.startDate || exportFilters.endDate) {
      doc.text(`Period: ${exportFilters.startDate || 'Start'} to ${exportFilters.endDate || 'End'}`, 40, 66);
    }

    const tableData = dataToExport.map((t, index) => [
      formatTransactionId(t.id, index),
      formatTxDateTime(t.date, t.createdAt),
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
      startY: 75,
      head: [['Txn ID', 'Date & Time', 'Type', 'Category / Details', 'Status', 'Method', 'Total', 'Due', 'Customer', 'Note']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 8, cellPadding: 5 },
      didParseCell: (data) => {
        if (data.section === 'body') {
          const rawRow = dataToExport[data.row.index];
          if (rawRow) {
            if (rawRow.type === 'income') {
              data.cell.styles.fillColor = [236, 253, 245]; // Soft Emerald Green
              if (data.column.index === 2 || data.column.index === 6) { // Type & Total
                data.cell.styles.textColor = [4, 120, 87]; // Emerald Green
                data.cell.styles.fontStyle = 'bold';
              }
            } else if (rawRow.type === 'refund') {
              data.cell.styles.fillColor = [254, 242, 242]; // Soft Red
              if (data.column.index === 2 || data.column.index === 6) { // Type & Total
                data.cell.styles.textColor = [220, 38, 38]; // Bright Red
                data.cell.styles.fontStyle = 'bold';
              }
            } else if (rawRow.type === 'expense') {
              data.cell.styles.fillColor = [255, 241, 242]; // Soft Rose
              if (data.column.index === 2 || data.column.index === 6) { // Type & Total
                data.cell.styles.textColor = [190, 18, 60]; // Dark Rose
                data.cell.styles.fontStyle = 'bold';
              }
            }

            // Highlight due column in red if > 0
            if (data.column.index === 7 && rawRow.due > 0) {
              data.cell.styles.textColor = [220, 38, 38];
              data.cell.styles.fontStyle = 'bold';
            }
          }
        }
      },
      didDrawPage: (data) => {
        // Footer
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Page ${data.pageNumber}`, doc.internal.pageSize.width - 50, doc.internal.pageSize.height - 20);
        doc.text("ALL CELLULAR AND REPAIR | 925 W Baseline Rd, Tempe, AZ", 40, doc.internal.pageSize.height - 20);
      }
    });

    // CALCULATE FINANCIAL TOTALS FOR PDF SUMMARY
    const totalIncome = dataToExport.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = dataToExport.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const totalRefund = dataToExport.filter(t => t.type === 'refund').reduce((sum, t) => sum + t.amount, 0);
    const netProfit = totalIncome - totalExpense - totalRefund;
    const totalDue = dataToExport.reduce((sum, t) => sum + (t.due || 0), 0);

    let pdfCashIncome = 0;
    let pdfCardIncome = 0;
    let pdfCashRefund = 0;
    let pdfCardRefund = 0;

    dataToExport.forEach(t => {
      let cashVal = 0;
      let cardVal = 0;

      if (t.paymentSplit) {
        cashVal = Number(t.paymentSplit.cash || 0);
        cardVal = Number(t.paymentSplit.card || 0);
      } else {
        if (t.paymentMethod === 'CASH') cashVal = Number(t.amount || 0);
        else if (t.paymentMethod === 'CARD') cardVal = Number(t.amount || 0);
      }

      if (t.type === 'income') {
        pdfCashIncome += cashVal;
        pdfCardIncome += cardVal;
      } else if (t.type === 'refund') {
        pdfCashRefund += cashVal;
        pdfCardRefund += cardVal;
      }
    });

    const finalY = (doc as any).lastAutoTable?.finalY || 100;
    const pageHeight = doc.internal.pageSize.height;

    // If remaining space on page is small, add a new page for summary
    if (finalY > pageHeight - 220) {
      doc.addPage();
    }

    const summaryStartY = (finalY > pageHeight - 220) ? 40 : finalY + 20;

    autoTable(doc, {
      startY: summaryStartY,
      margin: { left: 40 },
      tableWidth: 460,
      head: [['Financial Metric Overview', 'Total Amount ($)']],
      body: [
        ['Total Income (+)', formatCurrency(totalIncome)],
        ['  • Total Cash Income', formatCurrency(pdfCashIncome)],
        ['  • Total Card Income', formatCurrency(pdfCardIncome)],
        ['Total Expenses (-)', formatCurrency(totalExpense)],
        ['Total Refunds (-)', formatCurrency(totalRefund)],
        ['  • Total Cash Refund', formatCurrency(pdfCashRefund)],
        ['  • Total Card Refund', formatCurrency(pdfCardRefund)],
        ['Net Profit / Cash Flow', formatCurrency(netProfit)],
        ['Total Outstanding Balance Due', formatCurrency(totalDue)]
      ],
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9 },
      styles: { fontSize: 8.5, cellPadding: 5, fontStyle: 'bold' },
      didParseCell: (data) => {
        if (data.section === 'body') {
          const rowIndex = data.row.index;
          if (rowIndex === 0 || rowIndex === 1 || rowIndex === 2) {
            data.cell.styles.fillColor = [236, 253, 245]; // Emerald light
            data.cell.styles.textColor = [4, 120, 87];
          } else if (rowIndex === 3) {
            data.cell.styles.fillColor = [255, 241, 242]; // Rose light
            data.cell.styles.textColor = [190, 18, 60];
          } else if (rowIndex === 4 || rowIndex === 5 || rowIndex === 6) {
            data.cell.styles.fillColor = [254, 242, 242]; // Red light
            data.cell.styles.textColor = [220, 38, 38];
          } else if (rowIndex === 7) {
            data.cell.styles.fillColor = [226, 232, 240]; // Slate-200
            data.cell.styles.textColor = [15, 23, 42];
          } else if (rowIndex === 8) {
            data.cell.styles.fillColor = [254, 242, 242];
            data.cell.styles.textColor = [220, 38, 38];
          }
        }
      },
      columnStyles: {
        0: { cellWidth: 280 },
        1: { cellWidth: 180, halign: 'right' }
      }
    });

    // STAFF SHIFT LOGS TABLE IN PDF EXPORT
    if (filteredWorkHoursForExport.length > 0) {
      const shiftPdfY = (doc as any).lastAutoTable?.finalY || 100;
      const pdfPageH = doc.internal.pageSize.height;

      const shiftStartPdfY = (shiftPdfY > pdfPageH - 180) ? 40 : shiftPdfY + 20;
      if (shiftPdfY > pdfPageH - 180) {
        doc.addPage();
      }

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
        startY: shiftStartPdfY,
        margin: { left: 40 },
        tableWidth: 600,
        head: [['Staff Member Name', 'Shift Date', 'Time-Wise Range', 'Hours Logged', 'Activity / Role Note']],
        body: shiftTableData,
        theme: 'grid',
        headStyles: { fillColor: [217, 119, 6], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9 },
        styles: { fontSize: 8.5, cellPadding: 5 },
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
          0: { cellWidth: 140 },
          1: { cellWidth: 90 },
          2: { cellWidth: 150 },
          3: { cellWidth: 80 },
          4: { cellWidth: 140 }
        }
      });
    }

    doc.save(`Report_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  const sortedTransactions = useMemo(() => {
    return [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions]);

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
            <p className="text-xs font-black uppercase tracking-widest">Global Log empty</p>
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
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
