import { Transaction, InventoryItem, WorkHour } from '../types';
import { formatCurrency } from '../lib/utils';
import { format } from 'date-fns';

export interface DriveSpreadsheet {
  id: string;
  name: string;
  modifiedTime?: string;
  webViewLink?: string;
}

export const googleSheetsService = {
  /**
   * List user's Google Spreadsheets from Google Drive API
   */
  async listUserSpreadsheets(accessToken: string): Promise<DriveSpreadsheet[]> {
    try {
      const q = encodeURIComponent("mimeType='application/vnd.google-apps.spreadsheet' and trashed=false");
      const res = await fetch(`https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name,modifiedTime,webViewLink)&orderBy=modifiedTime desc`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message || 'Failed to list spreadsheets');
      }

      const data = await res.json();
      return data.files || [];
    } catch (error) {
      console.error('Error listing spreadsheets:', error);
      throw error;
    }
  },

  /**
   * Create a new formatted Google Spreadsheet on Google Drive
   */
  async createStoreSpreadsheet(
    accessToken: string,
    title: string = `Cellular & Repair Terminal - ${format(new Date(), 'yyyy-MM-dd')}`
  ): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> {
    try {
      const res = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          properties: {
            title,
          },
          sheets: [
            { properties: { title: 'Transactions' } },
            { properties: { title: 'Inventory' } },
            { properties: { title: 'Work Hours' } },
          ],
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message || 'Failed to create Google Spreadsheet');
      }

      const data = await res.json();
      return {
        spreadsheetId: data.spreadsheetId,
        spreadsheetUrl: data.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${data.spreadsheetId}`,
      };
    } catch (error) {
      console.error('Error creating spreadsheet:', error);
      throw error;
    }
  },

  /**
   * Export Transactions to 'Transactions' worksheet in Google Sheets
   */
  async exportTransactions(
    accessToken: string,
    spreadsheetId: string,
    transactions: Transaction[]
  ): Promise<void> {
    const headers = [
      'Transaction ID',
      'Date & Time',
      'Type',
      'Category',
      'Total Amount ($)',
      'Payment Method',
      'Customer Name',
      'Customer Phone',
      'Customer Email',
      'Device IMEI / ID',
      'Purchased Items / Parts',
      'Notes',
      'Work Status',
    ];

    const rows = transactions.map((t) => [
      t.id,
      format(new Date(t.date), 'yyyy-MM-dd HH:mm'),
      t.type.toUpperCase(),
      t.category,
      t.amount,
      t.paymentMethod || 'CASH',
      t.customer?.name || '',
      t.customer?.phone || '',
      t.customer?.email || '',
      t.customer?.idNumber || '',
      t.items?.map((i) => `${i.category}${i.model ? ` (${i.model})` : ''} (x${i.quantity})`).join(', ') || '',
      t.note || '',
      t.workStatus || 'Completed',
    ]);

    const values = [headers, ...rows];

    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Transactions!A1:M${values.length}?valueInputOption=USER_ENTERED`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ values }),
      }
    );

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || 'Failed to write transactions to Google Sheets');
    }
  },

  /**
   * Export Inventory to 'Inventory' worksheet in Google Sheets
   */
  async exportInventory(
    accessToken: string,
    spreadsheetId: string,
    inventory: InventoryItem[]
  ): Promise<void> {
    const headers = [
      'Item ID',
      'Item Name',
      'Category',
      'Quantity in Stock',
      'Unit Price ($)',
      'Total Value ($)',
      'Min Stock Level',
      'Serial / Tag Number',
      'Stock Alert Status',
    ];

    const rows = inventory.map((item) => [
      item.id,
      item.name,
      item.category,
      item.quantity,
      item.price,
      item.price * item.quantity,
      item.minStock,
      item.serialNumber || 'N/A',
      item.quantity <= item.minStock ? 'LOW STOCK' : 'IN STOCK',
    ]);

    const values = [headers, ...rows];

    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Inventory!A1:I${values.length}?valueInputOption=USER_ENTERED`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ values }),
      }
    );

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || 'Failed to write inventory to Google Sheets');
    }
  },

  /**
   * Export Work Hours to 'Work Hours' worksheet in Google Sheets
   */
  async exportWorkHours(
    accessToken: string,
    spreadsheetId: string,
    workHours: WorkHour[]
  ): Promise<void> {
    const headers = [
      'Entry ID',
      'Date',
      'Hours Worked',
      'Notes',
    ];

    const rows = workHours.map((wh) => [
      wh.id,
      wh.date,
      wh.hours,
      wh.note || '',
    ]);

    const values = [headers, ...rows];

    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'Work Hours'!A1:D${values.length}?valueInputOption=USER_ENTERED`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ values }),
      }
    );

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || 'Failed to write work hours to Google Sheets');
    }
  },

  /**
   * Full Sync: Export Transactions, Inventory, and Work Hours into a Google Sheet
   */
  async exportAllData(
    accessToken: string,
    spreadsheetId: string,
    data: { transactions: Transaction[]; inventory: InventoryItem[]; workHours: WorkHour[] }
  ): Promise<void> {
    await this.exportTransactions(accessToken, spreadsheetId, data.transactions);
    await this.exportInventory(accessToken, spreadsheetId, data.inventory);
    await this.exportWorkHours(accessToken, spreadsheetId, data.workHours);
  },

  /**
   * Import Transactions or Inventory from a Google Sheet
   */
  async importFromSpreadsheet(
    accessToken: string,
    spreadsheetId: string,
    sheetName: string = 'Transactions'
  ): Promise<any[]> {
    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(sheetName)}!A1:Z1000`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || `Failed to read sheet ${sheetName}`);
    }

    const data = await res.json();
    const rows = data.values || [];
    if (rows.length < 2) return [];

    const headers = rows[0].map((h: string) => h.toLowerCase().trim());
    const items = rows.slice(1).map((row: any[]) => {
      const obj: any = {};
      headers.forEach((header: string, index: number) => {
        obj[header] = row[index] || '';
      });
      return obj;
    });

    return items;
  },
};
