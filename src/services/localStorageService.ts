import { Transaction, InventoryItem, PartUsage, WorkHour } from '../types';

const STORAGE_KEYS = {
  TRANSACTIONS: 'cell_terminal_transactions',
  INVENTORY: 'cell_terminal_inventory',
  WORK_HOURS: 'cell_terminal_work_hours',
  PART_USAGE: 'cell_terminal_part_usage',
  CATEGORIES: 'cell_terminal_categories',
  TAX_RATE: 'cell_terminal_tax_rate',
  USER_DATA: 'cell_terminal_user',
};

// Helper to save to localStorage
const saveToLocal = (key: string, data: any) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Helper to get from localStorage
const getFromLocal = <T>(key: string, defaultValue: T): T => {
  const saved = localStorage.getItem(key);
  if (!saved) return defaultValue;
  try {
    return JSON.parse(saved);
  } catch {
    return defaultValue;
  }
};

export const localStorageService = {
  // Transactions
  getTransactions: (callback: (transactions: Transaction[]) => void) => {
    const data = getFromLocal<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, []);
    // Sort by date desc to match firebase behavior
    data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    callback(data);
    return () => {}; // No-op unsubscribe
  },

  saveTransaction: (transaction: Transaction) => {
    const current = getFromLocal<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, []);
    const index = current.findIndex(t => t.id === transaction.id);
    
    if (index >= 0) {
      current[index] = { ...transaction, updatedAt: new Date().toISOString() };
    } else {
      current.unshift({ ...transaction, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    
    saveToLocal(STORAGE_KEYS.TRANSACTIONS, current);
    return Promise.resolve();
  },

  deleteTransaction: (id: string) => {
    const current = getFromLocal<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, []);
    const filtered = current.filter(t => t.id !== id);
    saveToLocal(STORAGE_KEYS.TRANSACTIONS, filtered);
    return Promise.resolve();
  },

  // Inventory
  getInventory: (callback: (items: InventoryItem[]) => void) => {
    const data = getFromLocal<InventoryItem[]>(STORAGE_KEYS.INVENTORY, []);
    callback(data);
    return () => {};
  },

  saveInventoryItem: (item: InventoryItem) => {
    const current = getFromLocal<InventoryItem[]>(STORAGE_KEYS.INVENTORY, []);
    const index = current.findIndex(i => i.id === item.id);
    
    if (index >= 0) {
      current[index] = item;
    } else {
      current.push(item);
    }
    
    saveToLocal(STORAGE_KEYS.INVENTORY, current);
    return Promise.resolve();
  },

  deleteInventoryItem: (id: string) => {
    const current = getFromLocal<InventoryItem[]>(STORAGE_KEYS.INVENTORY, []);
    const filtered = current.filter(i => i.id !== id);
    saveToLocal(STORAGE_KEYS.INVENTORY, filtered);
    return Promise.resolve();
  },

  // Work Hours
  getWorkHours: (callback: (hours: WorkHour[]) => void) => {
    const data = getFromLocal<WorkHour[]>(STORAGE_KEYS.WORK_HOURS, []);
    data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    callback(data);
    return () => {};
  },

  saveWorkHour: (workHour: WorkHour) => {
    const current = getFromLocal<WorkHour[]>(STORAGE_KEYS.WORK_HOURS, []);
    const index = current.findIndex(h => h.id === workHour.id);
    
    if (index >= 0) {
      current[index] = workHour;
    } else {
      current.unshift(workHour);
    }
    
    saveToLocal(STORAGE_KEYS.WORK_HOURS, current);
    return Promise.resolve();
  },

  deleteWorkHour: (id: string) => {
    const current = getFromLocal<WorkHour[]>(STORAGE_KEYS.WORK_HOURS, []);
    const filtered = current.filter(h => h.id !== id);
    saveToLocal(STORAGE_KEYS.WORK_HOURS, filtered);
    return Promise.resolve();
  },

  // Part Usage
  getPartUsage: (callback: (usage: PartUsage[]) => void) => {
    const data = getFromLocal<PartUsage[]>(STORAGE_KEYS.PART_USAGE, []);
    data.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    callback(data);
    return () => {};
  },

  savePartUsage: (usage: PartUsage) => {
    const current = getFromLocal<PartUsage[]>(STORAGE_KEYS.PART_USAGE, []);
    current.unshift(usage);
    saveToLocal(STORAGE_KEYS.PART_USAGE, current);
    return Promise.resolve();
  },

  // Categories
  getCategories: (callback: (categories: string[]) => void) => {
    const data = getFromLocal<string[]>(STORAGE_KEYS.CATEGORIES, ['Screens', 'Batteries', 'Charging Ports', 'Cameras', 'Back Glass', 'Accessories']);
    callback(data);
    return () => {};
  },

  saveCategory: (name: string) => {
    const current = getFromLocal<string[]>(STORAGE_KEYS.CATEGORIES, ['Screens', 'Batteries', 'Charging Ports', 'Cameras', 'Back Glass', 'Accessories']);
    if (!current.includes(name)) {
      current.push(name);
      saveToLocal(STORAGE_KEYS.CATEGORIES, current);
    }
    return Promise.resolve();
  },

  // Tax Rate
  getTaxRate: (callback: (rate: number) => void) => {
    const rate = getFromLocal<number>(STORAGE_KEYS.TAX_RATE, 0.081);
    callback(rate);
    return () => {};
  },

  saveTaxRate: (taxRate: number) => {
    saveToLocal(STORAGE_KEYS.TAX_RATE, taxRate);
    return Promise.resolve();
  },
};
