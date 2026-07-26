import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

export function formatCurrency(amount: number): string {
  return currencyFormatter.format(amount);
}

export function uuid(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 11) + 
         Math.random().toString(36).substring(2, 11);
}

export function formatTransactionId(id?: string, index?: number): string {
  if (!id) {
    return index !== undefined ? `TXN-${1001 + index}` : 'TXN-1001';
  }
  // If id is already in serial format like TXN-1001 or TXN-1002
  if (/^TXN-\d+$/i.test(id)) {
    return id.toUpperCase();
  }
  // If id is a numeric string like "1001"
  if (/^\d+$/.test(id)) {
    return `TXN-${id}`;
  }
  // If index is provided, format cleanly as sequential serial number
  if (index !== undefined) {
    return `TXN-${1001 + index}`;
  }
  // Fallback for random UUIDs without index: extract last 5 chars
  const shortId = id.replace(/[^a-zA-Z0-9]/g, '').slice(-5).toUpperCase();
  return `TXN-${shortId || '1001'}`;
}

export function generateNextTransactionId(existingTransactions?: Array<{ id: string }>): string {
  let maxNum = 1000;
  if (existingTransactions && Array.isArray(existingTransactions)) {
    for (const t of existingTransactions) {
      if (t?.id) {
        const match = t.id.match(/TXN-(\d+)/i) || t.id.match(/^(\d+)$/);
        if (match) {
          const num = parseInt(match[1], 10);
          if (!isNaN(num) && num > maxNum) {
            maxNum = num;
          }
        }
      }
    }
    // If no TXN- prefixed IDs exist yet, default to 1000 + length
    if (maxNum === 1000 && existingTransactions.length > 0) {
      maxNum = 1000 + existingTransactions.length;
    }
  }
  return `TXN-${maxNum + 1}`;
}

export function toDatetimeLocalString(dateObjOrString?: string | Date): string {
  const d = dateObjOrString ? new Date(dateObjOrString) : new Date();
  if (isNaN(d.getTime())) {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}T${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  }
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function formatTxDateTime(dateStr?: string, createdAtStr?: string): string {
  if (!dateStr && !createdAtStr) {
    return format(new Date(), 'yyyy-MM-dd hh:mm a');
  }
  
  if (dateStr && dateStr.includes('T')) {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return format(d, 'yyyy-MM-dd hh:mm a');
    }
  }

  if (createdAtStr) {
    const cd = new Date(createdAtStr);
    if (!isNaN(cd.getTime())) {
      const datePart = dateStr && dateStr.length >= 10 ? dateStr.slice(0, 10) : format(cd, 'yyyy-MM-dd');
      const timePart = format(cd, 'hh:mm a');
      return `${datePart} ${timePart}`;
    }
  }

  if (dateStr) {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return format(d, 'yyyy-MM-dd hh:mm a');
    }
  }

  return format(new Date(), 'yyyy-MM-dd hh:mm a');
}

export function formatDateSafe(dateStr?: string, formatPattern: string = 'dd MMM yyyy'): string {
  if (!dateStr) return '';
  // If it's a 10-character YYYY-MM-DD date string, parse with local time T00:00:00 to prevent UTC timezone backward shift
  if (dateStr.length === 10 && dateStr.includes('-')) {
    const [year, month, day] = dateStr.split('-').map(Number);
    if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
      const localDate = new Date(year, month - 1, day);
      return format(localDate, formatPattern);
    }
  }
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return format(d, formatPattern);
}

export function format12Hour(time24?: string): string {
  if (!time24) return '';
  const [hStr, mStr] = time24.split(':');
  let h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  if (isNaN(h) || isNaN(m)) return time24;
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  const mFormatted = m < 10 ? `0${m}` : `${m}`;
  return `${h}:${mFormatted} ${ampm}`;
}

