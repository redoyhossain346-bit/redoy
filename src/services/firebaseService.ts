import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  query, 
  where, 
  deleteDoc, 
  serverTimestamp,
  orderBy,
  limit,
  onSnapshot
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { Transaction, InventoryItem, PartUsage, WorkHour, UserProfile } from '../types';

const COLLECTIONS = {
  TRANSACTIONS: 'transactions',
  INVENTORY: 'inventory',
  WORK_HOURS: 'workHours',
  PART_USAGE: 'partUsage',
  CATEGORIES: 'categories',
  SETTINGS: 'settings',
};

// Helper to remove undefined values which Firestore doesn't support
function sanitizeData(data: any): any {
  if (data === null || data === undefined) return data;
  if (typeof data !== 'object') return data;
  if (data instanceof Date) return data;
  
  // Only recurse into plain objects and arrays
  const isPlainObject = data.constructor === Object;
  const isArray = Array.isArray(data);

  if (!isPlainObject && !isArray) return data;

  if (isArray) {
    return data.map(item => sanitizeData(item));
  }

  const result: any = {};
  Object.keys(data).forEach(key => {
    if (data[key] !== undefined) {
      result[key] = sanitizeData(data[key]);
    }
  });
  return result;
}

export const firebaseService = {
  // Transactions
  getTransactions: (userId: string, callback: (transactions: Transaction[]) => void) => {
    const q = query(
      collection(db, COLLECTIONS.TRANSACTIONS), 
      where('userId', '==', userId),
      orderBy('date', 'desc')
    );
    
    return onSnapshot(q, (snapshot) => {
      const transactions = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as Transaction[];
      callback(transactions);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, COLLECTIONS.TRANSACTIONS);
    });
  },

  saveTransaction: async (userId: string, transaction: Transaction) => {
    try {
      const docRef = doc(db, COLLECTIONS.TRANSACTIONS, transaction.id);
      const data = sanitizeData({
        ...transaction,
        userId,
        updatedAt: serverTimestamp(),
        createdAt: transaction.createdAt || serverTimestamp()
      });
      await setDoc(docRef, data);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, COLLECTIONS.TRANSACTIONS);
    }
  },

  deleteTransaction: async (id: string) => {
    try {
      await deleteDoc(doc(db, COLLECTIONS.TRANSACTIONS, id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, COLLECTIONS.TRANSACTIONS);
    }
  },

  // Inventory
  getInventory: (userId: string, callback: (items: InventoryItem[]) => void) => {
    const q = query(collection(db, COLLECTIONS.INVENTORY), where('userId', '==', userId));
    return onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as InventoryItem[];
      callback(items);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, COLLECTIONS.INVENTORY);
    });
  },

  saveInventoryItem: async (userId: string, item: InventoryItem) => {
    try {
      const data = sanitizeData({
        ...item,
        userId
      });
      await setDoc(doc(db, COLLECTIONS.INVENTORY, item.id), data);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, COLLECTIONS.INVENTORY);
    }
  },

  deleteInventoryItem: async (id: string) => {
    try {
      await deleteDoc(doc(db, COLLECTIONS.INVENTORY, id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, COLLECTIONS.INVENTORY);
    }
  },

  // Work Hours
  getWorkHours: (userId: string, callback: (hours: WorkHour[]) => void) => {
    const q = query(collection(db, COLLECTIONS.WORK_HOURS), where('userId', '==', userId), orderBy('date', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const hours = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as WorkHour[];
      callback(hours);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, COLLECTIONS.WORK_HOURS);
    });
  },

  saveWorkHour: async (userId: string, workHour: WorkHour) => {
    try {
      const data = sanitizeData({
        ...workHour,
        userId
      });
      await setDoc(doc(db, COLLECTIONS.WORK_HOURS, workHour.id), data);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, COLLECTIONS.WORK_HOURS);
    }
  },

  deleteWorkHour: async (id: string) => {
    try {
      await deleteDoc(doc(db, COLLECTIONS.WORK_HOURS, id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, COLLECTIONS.WORK_HOURS);
    }
  },

  // Part Usage
  getPartUsage: (userId: string, callback: (usage: PartUsage[]) => void) => {
    const q = query(collection(db, COLLECTIONS.PART_USAGE), where('userId', '==', userId), orderBy('timestamp', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const usage = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as PartUsage[];
      callback(usage);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, COLLECTIONS.PART_USAGE);
    });
  },

  savePartUsage: async (userId: string, usage: PartUsage) => {
    try {
      const data = sanitizeData({
        ...usage,
        userId
      });
      await setDoc(doc(db, COLLECTIONS.PART_USAGE, usage.id), data);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, COLLECTIONS.PART_USAGE);
    }
  },

  // Categories
  getCategories: (userId: string, callback: (categories: string[]) => void) => {
    const q = query(collection(db, COLLECTIONS.CATEGORIES), where('userId', '==', userId));
    return onSnapshot(q, (snapshot) => {
      const categories = snapshot.docs.map(doc => doc.data().name as string);
      callback(categories.length > 0 ? categories : ['Screens', 'Batteries', 'Charging Ports', 'Cameras', 'Back Glass', 'Accessories']);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, COLLECTIONS.CATEGORIES);
    });
  },

  saveCategory: async (userId: string, name: string) => {
    try {
      const id = name.toLowerCase().replace(/\s+/g, '-');
      const data = sanitizeData({
        name,
        userId
      });
      await setDoc(doc(db, COLLECTIONS.CATEGORIES, `${userId}_${id}`), data);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, COLLECTIONS.CATEGORIES);
    }
  },

  // Settings
  getTaxRate: (userId: string, callback: (rate: number) => void) => {
    const docRef = doc(db, COLLECTIONS.SETTINGS, `${userId}_taxRate`);
    return onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        callback(doc.data().taxRate);
      } else {
        callback(0.081);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, COLLECTIONS.SETTINGS);
    });
  },

  saveTaxRate: async (userId: string, taxRate: number) => {
    try {
      const data = sanitizeData({
        taxRate,
        userId
      });
      await setDoc(doc(db, COLLECTIONS.SETTINGS, `${userId}_taxRate`), data);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, COLLECTIONS.SETTINGS);
    }
  },
};
