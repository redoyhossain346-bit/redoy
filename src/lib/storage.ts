import { Transaction, UserProfile, InventoryItem, PartUsage } from "../types";

const STORAGE_KEYS = {
  TRANSACTIONS: 'glass_budget_transactions',
  USER_PROFILE: 'glass_budget_user_profile',
  AUDIT_LOGS: 'glass_budget_audit_logs',
  INVENTORY: 'glass_budget_inventory',
  PART_USAGE: 'glass_budget_part_usage',
  INVENTORY_CATEGORIES: 'glass_budget_inventory_categories',
};

export const storage = {
  getTransactions: (): Transaction[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to load transactions', e);
      return [];
    }
  },
  saveTransactions: (transactions: Transaction[]) => {
    try {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    } catch (e) {
      console.error('Failed to save transactions', e);
    }
  },
  getUserProfile: (): UserProfile => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      return data ? JSON.parse(data) : { name: 'Guest' };
    } catch (e) {
      console.error('Failed to load user profile', e);
      return { name: 'Guest' };
    }
  },
  saveUserProfile: (profile: UserProfile) => {
    try {
      localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
    } catch (e) {
      console.error('Failed to save user profile', e);
    }
  },
  getAuditLogs: (): any[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to load audit logs', e);
      return [];
    }
  },
  saveAuditLogs: (logs: any[]) => {
    try {
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(logs));
    } catch (e) {
      console.error('Failed to save audit logs', e);
    }
  },
  getInventory: (): InventoryItem[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.INVENTORY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to load inventory', e);
      return [];
    }
  },
  saveInventory: (inventory: InventoryItem[]) => {
    try {
      localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(inventory));
    } catch (e) {
      console.error('Failed to save inventory', e);
    }
  },
  getPartUsage: (): PartUsage[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PART_USAGE);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to load part usage', e);
      return [];
    }
  },
  savePartUsage: (usage: PartUsage[]) => {
    try {
      localStorage.setItem(STORAGE_KEYS.PART_USAGE, JSON.stringify(usage));
    } catch (e) {
      console.error('Failed to save part usage', e);
    }
  },
  getInventoryCategories: (): string[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.INVENTORY_CATEGORIES);
      return data ? JSON.parse(data) : ['Screens', 'Batteries', 'Charging Ports', 'Cameras', 'Back Glass', 'Accessories'];
    } catch (e) {
      console.error('Failed to load inventory categories', e);
      return ['Screens', 'Batteries', 'Charging Ports', 'Cameras', 'Back Glass', 'Accessories'];
    }
  },
  saveInventoryCategories: (categories: string[]) => {
    try {
      localStorage.setItem(STORAGE_KEYS.INVENTORY_CATEGORIES, JSON.stringify(categories));
    } catch (e) {
      console.error('Failed to save inventory categories', e);
    }
  },
};
