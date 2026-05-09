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
    const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return data ? JSON.parse(data) : [];
  },
  saveTransactions: (transactions: Transaction[]) => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  },
  getUserProfile: (): UserProfile => {
    const data = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    return data ? JSON.parse(data) : { name: 'Guest' };
  },
  saveUserProfile: (profile: UserProfile) => {
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
  },
  getAuditLogs: (): any[] => {
    const data = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
    return data ? JSON.parse(data) : [];
  },
  saveAuditLogs: (logs: any[]) => {
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(logs));
  },
  getInventory: (): InventoryItem[] => {
    const data = localStorage.getItem(STORAGE_KEYS.INVENTORY);
    return data ? JSON.parse(data) : [];
  },
  saveInventory: (inventory: InventoryItem[]) => {
    localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(inventory));
  },
  getPartUsage: (): PartUsage[] => {
    const data = localStorage.getItem(STORAGE_KEYS.PART_USAGE);
    return data ? JSON.parse(data) : [];
  },
  savePartUsage: (usage: PartUsage[]) => {
    localStorage.setItem(STORAGE_KEYS.PART_USAGE, JSON.stringify(usage));
  },
  getInventoryCategories: (): string[] => {
    const data = localStorage.getItem(STORAGE_KEYS.INVENTORY_CATEGORIES);
    return data ? JSON.parse(data) : ['Screens', 'Batteries', 'Charging Ports', 'Cameras', 'Back Glass', 'Accessories'];
  },
  saveInventoryCategories: (categories: string[]) => {
    localStorage.setItem(STORAGE_KEYS.INVENTORY_CATEGORIES, JSON.stringify(categories));
  },
};
