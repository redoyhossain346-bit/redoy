export type TransactionType = 'income' | 'expense' | 'refund';

export type PaymentMethod = 'CASH' | 'CARD' | 'ZELLE';

export type Category = 
  | 'Food' 
  | 'Transport' 
  | 'Rent' 
  | 'Utilities' 
  | 'Shopping' 
  | 'Income' 
  | 'Screen replacement'
  | 'Back glass'
  | 'Other fix'
  | 'Labor'
  | 'Unlocking'
  | 'Phone sell'
  | 'Tablet Sell'
  | 'Perfume'
  | 'Doll'
  | 'Case'
  | 'Water Bottle'
  | 'Accessories'
  | 'Parts Sell'
  | 'Toy sell'
  | 'Tempered Glass'
  | 'Battery'
  | 'Camera Protector'
  | 'Watch Belt'
  | 'Watch Protector'
  | 'Carrier sell'
  | 'Others';

export type WorkStatus = 'Working Process' | 'Not Started' | 'Bill Due' | 'Pre-Order' | 'Return' | 'Pickup' | 'Paid';

export interface TransactionItem {
  id: string;
  category: Category;
  amount: number;
  model?: string;
  imei?: string;
  storage?: string;
  color?: string;
  warranty?: string;
  carrier?: string;
  phoneNumber?: string;
}

export interface Transaction {
  id: string;
  amount: number;
  subTotal: number;
  discount: number;
  tax: number;
  advance: number;
  due: number;
  items: TransactionItem[];
  type: TransactionType;
  category: Category;
  paymentMethod: PaymentMethod;
  workStatus?: WorkStatus;
  paymentSplit?: {
    cash: number;
    card: number;
    zelle: number;
  };
  cashReceived?: number;
  changeDue?: number;
  customer?: {
    name: string;
    phone: string;
    email: string;
    warranty: string;
    idType?: string;
    idNumber?: string;
  };
  date: string;
  note: string;
}

export interface UserProfile {
  name: string;
}

export interface BudgetSummary {
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
  totalRefund: number;
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  action: 'DELETE' | 'EDIT';
  originalData: Transaction;
  newData?: Transaction;
}
