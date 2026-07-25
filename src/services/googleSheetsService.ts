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

    await this.styleSpreadsheet(accessToken, spreadsheetId);
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

    await this.styleSpreadsheet(accessToken, spreadsheetId);
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

    await this.styleSpreadsheet(accessToken, spreadsheetId);
  },

  /**
   * Apply beautiful table styling (header color, zebra striping, borders, currency formats, auto-width) to worksheets
   */
  async styleSpreadsheet(
    accessToken: string,
    spreadsheetId: string
  ): Promise<void> {
    try {
      // 1. Fetch metadata to get sheet IDs
      const metaRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!metaRes.ok) return;
      const meta = await metaRes.json();
      const sheets = meta.sheets || [];

      const requests: any[] = [];

      for (const sheet of sheets) {
        const sheetId = sheet.properties.sheetId;
        const title = sheet.properties.title;
        const grid = sheet.properties.gridProperties || {};
        const maxRows = Math.min(grid.rowCount || 100, 500);
        const maxCols = title === 'Transactions' ? 13 : title === 'Inventory' ? 9 : 4;

        // A. Header Row Formatting (Teal #0D9488, Bold White Text, Middle Centered)
        requests.push({
          repeatCell: {
            range: {
              sheetId,
              startRowIndex: 0,
              endRowIndex: 1,
              startColumnIndex: 0,
              endColumnIndex: maxCols,
            },
            cell: {
              userEnteredFormat: {
                backgroundColor: { red: 0.05, green: 0.58, blue: 0.53 }, // Teal-600
                textFormat: {
                  foregroundColor: { red: 1, green: 1, blue: 1 },
                  fontSize: 11,
                  bold: true,
                  fontFamily: 'Segoe UI',
                },
                horizontalAlignment: 'CENTER',
                verticalAlignment: 'MIDDLE',
                padding: { top: 8, right: 10, bottom: 8, left: 10 },
              },
            },
            fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment,padding)',
          },
        });

        // B. Set Header Row Height to 38px
        requests.push({
          updateDimensionProperties: {
            range: {
              sheetId,
              dimension: 'ROWS',
              startIndex: 0,
              endIndex: 1,
            },
            properties: { pixelSize: 38 },
            fields: 'pixelSize',
          },
        });

        // C. Data Row Formatting (General text alignment, font, and borders)
        const thinBorder = { style: 'SOLID', color: { red: 0.85, green: 0.88, blue: 0.92 } };
        requests.push({
          repeatCell: {
            range: {
              sheetId,
              startRowIndex: 1,
              endRowIndex: maxRows,
              startColumnIndex: 0,
              endColumnIndex: maxCols,
            },
            cell: {
              userEnteredFormat: {
                textFormat: { fontSize: 10, fontFamily: 'Segoe UI', foregroundColor: { red: 0.12, green: 0.16, blue: 0.22 } },
                verticalAlignment: 'MIDDLE',
                borders: {
                  top: thinBorder,
                  bottom: thinBorder,
                  left: thinBorder,
                  right: thinBorder,
                },
                padding: { top: 6, right: 8, bottom: 6, left: 8 },
              },
            },
            fields: 'userEnteredFormat(textFormat,verticalAlignment,borders,padding)',
          },
        });

        // D. Alternating Row Colors (Zebra Striping: even rows white, odd rows light gray-blue #F8FAFC)
        for (let r = 1; r < 100; r++) {
          if (r % 2 === 1) {
            requests.push({
              repeatCell: {
                range: {
                  sheetId,
                  startRowIndex: r,
                  endRowIndex: r + 1,
                  startColumnIndex: 0,
                  endColumnIndex: maxCols,
                },
                cell: {
                  userEnteredFormat: {
                    backgroundColor: { red: 0.97, green: 0.98, blue: 0.99 },
                  },
                },
                fields: 'userEnteredFormat.backgroundColor',
              },
            });
          }
        }

        // E. Specific Column Formatting (Currency & Alignment)
        if (title === 'Transactions') {
          // Column 4 is "Total Amount ($)" -> Currency
          requests.push({
            repeatCell: {
              range: {
                sheetId,
                startRowIndex: 1,
                endRowIndex: maxRows,
                startColumnIndex: 4,
                endColumnIndex: 5,
              },
              cell: {
                userEnteredFormat: {
                  numberFormat: { type: 'CURRENCY', pattern: '$#,##0.00' },
                  horizontalAlignment: 'RIGHT',
                  textFormat: { bold: true, foregroundColor: { red: 0.05, green: 0.5, blue: 0.3 } },
                },
              },
              fields: 'userEnteredFormat(numberFormat,horizontalAlignment,textFormat)',
            },
          });
        } else if (title === 'Inventory') {
          // Column 4 (Unit Price) & Column 5 (Total Value) -> Currency
          requests.push({
            repeatCell: {
              range: {
                sheetId,
                startRowIndex: 1,
                endRowIndex: maxRows,
                startColumnIndex: 4,
                endColumnIndex: 6,
              },
              cell: {
                userEnteredFormat: {
                  numberFormat: { type: 'CURRENCY', pattern: '$#,##0.00' },
                  horizontalAlignment: 'RIGHT',
                  textFormat: { bold: true },
                },
              },
              fields: 'userEnteredFormat(numberFormat,horizontalAlignment,textFormat)',
            },
          });
        }

        // F. Auto-resize Column Widths to fit header and text perfectly
        requests.push({
          autoResizeDimensions: {
            dimensions: {
              sheetId,
              dimension: 'COLUMNS',
              startIndex: 0,
              endIndex: maxCols,
            },
          },
        });
      }

      // Execute batchUpdate request
      if (requests.length > 0) {
        await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ requests }),
        });
      }
    } catch (err) {
      console.warn('Error applying table styling to Google Sheet:', err);
    }
  },
  async exportAllData(
    accessToken: string,
    spreadsheetId: string,
    data: { transactions: Transaction[]; inventory: InventoryItem[]; workHours: WorkHour[] }
  ): Promise<void> {
    await this.exportTransactions(accessToken, spreadsheetId, data.transactions);
    await this.exportInventory(accessToken, spreadsheetId, data.inventory);
    await this.exportWorkHours(accessToken, spreadsheetId, data.workHours);
    await this.styleSpreadsheet(accessToken, spreadsheetId);
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
