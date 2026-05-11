import { useState, FormEvent, useEffect } from 'react';
import { User, Phone, PlusCircle, CreditCard, Banknote, DollarSign, Zap, Plus, X, Edit3 } from 'lucide-react';
import { Category, Transaction, TransactionType, PaymentMethod, TransactionItem, WorkStatus } from '../types';
import { cn } from '../lib/utils';

interface TransactionFormProps {
  onAdd: (transaction: Omit<Transaction, 'id'>) => void;
  editingTransaction: Transaction | null;
  onCancelEdit?: () => void;
  currentTaxRate: number;
  onUpdateTaxRate: (rate: number) => void;
}

const CATEGORIES: Category[] = [
  'Screen replacement', 'Back glass', 'Other fix', 'Labor', 'Unlocking', 'Phone sell', 'Tablet Sell', 
  'Perfume', 'Doll', 'Case', 'Water Bottle', 'Accessories', 'Parts Sell', 'Toy sell',
  'Tempered Glass', 'Battery', 'Camera Protector', 'Watch Belt', 'Watch Protector',
  'Carrier sell', 'Income', 'Food', 'Transport', 'Rent', 'Utilities', 'Shopping', 'Others'
];

const CARRIERS = ['T-Mobile', 'AT&T', 'Lyca', 'Simple Mobile', 'Verizon', 'Boost Mobile', 'H2O', 'Cricket', 'Others'];

const ID_TYPES = ['State ID', 'Passport', 'Driving License', 'Visa Copy', 'Other'];

const WORK_STATUSES: WorkStatus[] = ['Not Started', 'Working Process', 'Bill Due', 'Pre-Order', 'Return', 'Pickup', 'Paid'];

export default function TransactionForm({ onAdd, editingTransaction, onCancelEdit, currentTaxRate, onUpdateTaxRate }: TransactionFormProps) {
  const [type, setType] = useState<TransactionType>('income');
  const [items, setItems] = useState<TransactionItem[]>([]);
  const [itemCategory, setItemCategory] = useState<Category>('Labor');
  const [itemAmount, setItemAmount] = useState('');
  const [itemQuantity, setItemQuantity] = useState('1');
  const [deviceModel, setDeviceModel] = useState('');
  const [deviceImei, setDeviceImei] = useState('');
  const [deviceStorage, setDeviceStorage] = useState('');
  const [deviceColor, setDeviceColor] = useState('');
  const [deviceWarranty, setDeviceWarranty] = useState('');
  const [carrier, setCarrier] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [discount, setDiscount] = useState('0');
  const [advance, setAdvance] = useState('0');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [workStatus, setWorkStatus] = useState<WorkStatus>('Not Started');
  const [isSplit, setIsSplit] = useState(false);
  const [splitCash, setSplitCash] = useState('0');
  const [splitCard, setSplitCard] = useState('0');
  const [splitZelle, setSplitZelle] = useState('0');
  const [cashReceived, setCashReceived] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [warranty, setWarranty] = useState('');
  const [idType, setIdType] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [showCustomer, setShowCustomer] = useState(false);
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      setItems(editingTransaction.items || []);
      setDiscount(editingTransaction.discount.toString());
      setAdvance(editingTransaction.advance.toString());
      setPaymentMethod(editingTransaction.paymentMethod);
      setWorkStatus(editingTransaction.workStatus || 'Not Started');
      setIsSplit(!!editingTransaction.paymentSplit);
      if (editingTransaction.paymentSplit) {
        setSplitCash(editingTransaction.paymentSplit.cash.toString());
        setSplitCard(editingTransaction.paymentSplit.card.toString());
        setSplitZelle(editingTransaction.paymentSplit.zelle.toString());
      }
      setCashReceived(editingTransaction.cashReceived?.toString() || '');
      setNote(editingTransaction.note || '');
      setDate(editingTransaction.date);
      setCustomerName(editingTransaction.customer?.name || '');
      setCustomerPhone(editingTransaction.customer?.phone || '');
      setCustomerEmail(editingTransaction.customer?.email || '');
      setWarranty(editingTransaction.customer?.warranty || '');
      setIdType(editingTransaction.customer?.idType || '');
      setIdNumber(editingTransaction.customer?.idNumber || '');
      setShowCustomer(!!editingTransaction.customer);
    }
  }, [editingTransaction]);

  // Calculations
  const sVal = items.reduce((acc, curr) => acc + (curr.amount * curr.quantity), 0);
  const dVal = parseFloat(discount) || 0;
  
  // Handle Advance calculation based on split if active
  const sCashVal = parseFloat(splitCash) || 0;
  const sCardVal = parseFloat(splitCard) || 0;
  const sZelleVal = parseFloat(splitZelle) || 0;
  
  const aVal = isSplit ? (sCashVal + sCardVal + sZelleVal) : (parseFloat(advance) || 0);
  
  const [taxEnabled, setTaxEnabled] = useState(true);
  const taxMultiplier = taxEnabled ? currentTaxRate : 0;
  const taxVal = parseFloat(((sVal - dVal) * taxMultiplier).toFixed(2));
  const totalAmount = parseFloat((sVal - dVal + taxVal).toFixed(2));
  const dueAmount = parseFloat((totalAmount - aVal).toFixed(2));

  // Change Calculation
  const cashToConsider = isSplit ? sCashVal : (paymentMethod === 'CASH' ? totalAmount : 0);
  const cReceivedVal = parseFloat(cashReceived) || 0;
  const changeVal = cReceivedVal > 0 ? Math.max(0, cReceivedVal - cashToConsider) : 0;

  const addItem = () => {
    const amt = parseFloat(itemAmount);
    const qty = parseInt(itemQuantity) || 1;
    if (!amt || isNaN(amt)) return;
    
    const isDeviceSell = itemCategory === 'Phone sell' || itemCategory === 'Phone sell' || itemCategory === 'Tablet Sell';
    const isCarrierSell = itemCategory === 'Carrier sell';
    
    setItems([...items, {
      id: Math.random().toString(36).substr(2, 9),
      category: itemCategory,
      amount: amt,
      quantity: qty,
      ...(isDeviceSell ? {
        model: deviceModel,
        imei: deviceImei,
        storage: deviceStorage,
        color: deviceColor,
        warranty: deviceWarranty
      } : {}),
      ...(isCarrierSell ? {
        carrier: carrier,
        phoneNumber: phoneNumber
      } : {})
    }]);
    
    setItemAmount('');
    setItemQuantity('1');
    if (isDeviceSell) {
      setDeviceModel('');
      setDeviceImei('');
      setDeviceStorage('');
      setDeviceColor('');
      setDeviceWarranty('');
    }
    if (isCarrierSell) {
      setCarrier('');
      setPhoneNumber('');
    }
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    onAdd({
      amount: totalAmount,
      subTotal: sVal,
      discount: dVal,
      tax: taxVal,
      advance: aVal,
      due: dueAmount,
      items,
      type,
      category: items[0].category, // Primary category for summary
      paymentMethod,
      workStatus,
      paymentSplit: isSplit ? {
        cash: sCashVal,
        card: sCardVal,
        zelle: sZelleVal
      } : undefined,
      cashReceived: cReceivedVal > 0 ? cReceivedVal : undefined,
      changeDue: changeVal > 0 ? changeVal : undefined,
      customer: showCustomer ? {
        name: customerName,
        phone: customerPhone,
        email: customerEmail,
        warranty: warranty,
        idType,
        idNumber
      } : undefined,
      note,
      date
    });

    setItems([]);
    setDiscount('0');
    setAdvance('0');
    setSplitCash('0');
    setSplitCard('0');
    setSplitZelle('0');
    setIsSplit(false);
    setWorkStatus('Not Started');
    setCashReceived('');
    setNote('');
    setCustomerName('');
    setCustomerPhone('');
    setCustomerEmail('');
    setWarranty('');
    setIdType('');
    setIdNumber('');
  };

  return (
    <div className={cn("glass-card p-8 bg-white border-slate-200 shadow-sm", editingTransaction && "border-amber-500/50 shadow-lg shadow-amber-500/5")}>
      <h3 className="text-2xl font-black text-slate-800 mb-10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {editingTransaction ? <Edit3 size={28} className="text-amber-500" /> : <PlusCircle size={28} className="text-amber-500" />}
          <span className="premium-gradient-text">{editingTransaction ? 'Editing Transaction' : 'New Transaction Entry'}</span>
        </div>
        {editingTransaction && onCancelEdit && (
          <button 
            type="button"
            onClick={onCancelEdit}
            className="text-xs font-black text-slate-400 hover:text-rose-500 transition-colors uppercase tracking-widest"
          >
            Cancel Edit
          </button>
        )}
      </h3>
      
      <div className="flex p-2 bg-slate-50 rounded-3xl mb-8 gap-2 border border-slate-100 shadow-sm">
        <button
          onClick={() => setType('income')}
          className={cn(
            "flex-1 py-5 rounded-2xl text-base font-black transition-all duration-300",
            type === 'income' ? "bg-emerald-600 text-white shadow-[0_5px_15px_rgba(5,150,105,0.2)]" : "text-slate-400 hover:text-slate-600"
          )}
        >
          Income
        </button>
        <button
          onClick={() => setType('expense')}
          className={cn(
            "flex-1 py-5 rounded-2xl text-base font-black transition-all duration-300",
            type === 'expense' ? "bg-rose-600 text-white shadow-[0_5px_15px_rgba(225,29,72,0.2)]" : "text-slate-400 hover:text-slate-600"
          )}
        >
          Expense
        </button>
        <button
          onClick={() => setType('refund')}
          className={cn(
            "flex-1 py-5 rounded-2xl text-base font-black transition-all duration-300",
            type === 'refund' ? "bg-amber-600 text-white shadow-[0_5px_15px_rgba(245,158,11,0.2)]" : "text-slate-400 hover:text-slate-600"
          )}
        >
          Refund
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Item Builder */}
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <label className="text-base font-black text-slate-400 block uppercase tracking-[0.2em]">Add Products/Services</label>
            <div className="flex items-center gap-4">
              <label className="text-sm font-black text-slate-400 block uppercase tracking-widest">Work Status:</label>
              <select
                value={workStatus}
                onChange={(e) => setWorkStatus(e.target.value as WorkStatus)}
                className="bg-transparent text-base font-black text-amber-600 outline-none cursor-pointer uppercase tracking-tight"
              >
                {WORK_STATUSES.map(status => (
                  <option key={status} value={status} className="bg-white">{status}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-4">
            <select
              value={itemCategory}
              onChange={(e) => setItemCategory(e.target.value as Category)}
              className="glass-input h-16 flex-1 pr-12 text-lg font-black appearance-none border-slate-200 bg-white"
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat} className="bg-white">{cat}</option>
              ))}
            </select>
            <div className="relative w-28">
              <input
                type="number"
                value={itemQuantity}
                onChange={(e) => setItemQuantity(e.target.value)}
                placeholder="Qty"
                className="glass-input h-16 w-full px-2 text-lg font-black text-center border-slate-200 bg-white"
              />
              <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] font-black text-amber-600 bg-white px-1.5 uppercase tracking-widest leading-none border border-amber-600/10 shadow-sm rounded-full">QTY</span>
            </div>
            <div className="relative w-40">
              <DollarSign size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="number"
                value={itemAmount}
                onChange={(e) => setItemAmount(e.target.value)}
                placeholder="Price"
                className="glass-input h-16 w-full pl-10 text-lg font-black border-slate-200 bg-white"
              />
              <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] font-black text-amber-600 bg-white px-1.5 uppercase tracking-widest leading-none border border-amber-600/10 shadow-sm rounded-full">PRICE</span>
            </div>
            <button
              type="button"
              onClick={addItem}
              className="h-16 px-8 bg-amber-500 hover:bg-amber-400 text-white rounded-[1.25rem] transition-all duration-300 flex items-center justify-center shadow-lg shadow-amber-500/10 active:scale-95 border border-amber-600/20"
            >
              <Plus size={32} />
            </button>
          </div>

          {(itemCategory === 'Phone sell' || itemCategory === 'Tablet Sell') && (
            <div className="grid grid-cols-2 gap-2 mt-2 animate-in fade-in slide-in-from-top-1">
              <input
                type="text"
                value={deviceModel}
                onChange={(e) => setDeviceModel(e.target.value)}
                placeholder="Phone/Tablet Model"
                className="glass-input text-[10px] py-1.5"
              />
              <input
                type="text"
                value={deviceImei}
                onChange={(e) => setDeviceImei(e.target.value)}
                placeholder="IMEI Number"
                className="glass-input text-[10px] py-1.5"
              />
              <input
                type="text"
                value={deviceStorage}
                onChange={(e) => setDeviceStorage(e.target.value)}
                placeholder="Storage (e.g. 128GB)"
                className="glass-input text-[10px] py-1.5"
              />
              <input
                type="text"
                value={deviceColor}
                onChange={(e) => setDeviceColor(e.target.value)}
                placeholder="Color"
                className="glass-input text-[10px] py-1.5"
              />
              <input
                type="text"
                value={deviceWarranty}
                onChange={(e) => setDeviceWarranty(e.target.value)}
                placeholder="Parts Warranty"
                className="glass-input text-[10px] py-1.5 col-span-2"
              />
            </div>
          )}

          {itemCategory === 'Carrier sell' && (
            <div className="grid grid-cols-2 gap-2 mt-2 animate-in fade-in slide-in-from-top-1">
              <select
                value={carrier}
                onChange={(e) => setCarrier(e.target.value)}
                className="glass-input text-[10px] py-1.5 pr-8 appearance-none bg-white border-slate-200"
              >
                <option value="" className="bg-white text-slate-400">Select Carrier</option>
                {CARRIERS.map(c => (
                  <option key={c} value={c} className="bg-white text-slate-800">{c}</option>
                ))}
              </select>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Phone Number"
                className="glass-input text-[10px] py-1.5"
              />
            </div>
          )}

          {items.length > 0 && (
            <div className="mt-3 space-y-1 animate-in fade-in slide-in-from-top-1 duration-200">
              {items.map(item => (
                <div key={item.id} className="flex flex-col p-4 bg-white rounded-xl border border-slate-100 group shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-black text-slate-800 uppercase tracking-tight">{item.category}</span>
                      <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded border border-indigo-100">x{item.quantity}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-lg font-black text-emerald-600 font-mono">${(item.amount * item.quantity).toFixed(2)}</span>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="p-1.5 text-slate-300 hover:text-rose-500 transition-colors"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </div>
                  {(item.model || item.imei || item.carrier || item.phoneNumber) && (
                    <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-0.5 text-[8px] font-black text-slate-400 uppercase tracking-tighter border-t border-slate-50 pt-2">
                      {item.model && <div>Model: <span className="text-indigo-600">{item.model}</span></div>}
                      {item.imei && <div>IMEI: <span className="text-indigo-600">{item.imei}</span></div>}
                      {item.storage && <div>GB: <span className="text-indigo-600">{item.storage}</span></div>}
                      {item.color && <div>Color: <span className="text-indigo-600">{item.color}</span></div>}
                      {item.warranty && <div className="col-span-2">Warranty: <span className="text-indigo-600">{item.warranty}</span></div>}
                      {item.carrier && <div>Carrier: <span className="text-indigo-600">{item.carrier}</span></div>}
                      {item.phoneNumber && <div>Number: <span className="text-indigo-600">{item.phoneNumber}</span></div>}
                    </div>
                  )}
                </div>
              ))}
              <div className="flex justify-between p-4 border-t border-slate-100 mt-4">
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Added Items Total</span>
                <span className="text-xl font-black text-slate-900">${sVal.toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6 bg-slate-50 p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="grid grid-cols-2 gap-6">
            <div className="opacity-60">
              <label className="text-sm font-black text-slate-400 mb-2 block uppercase tracking-widest">Sub Total (Auto)</label>
              <div className="glass-input h-14 w-full text-lg font-black bg-white border-slate-200 flex items-center gap-3">
                <span className="text-slate-400">$</span>
                {sVal.toFixed(2)}
              </div>
            </div>
            <div>
              <label className="text-sm font-black text-slate-400 mb-2 block uppercase tracking-widest">Discount</label>
              <div className="relative">
                <DollarSign size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-500/30" />
                <input
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  placeholder="0.00"
                  className="glass-input h-14 w-full pl-10 text-lg font-black text-rose-600 border-slate-200 bg-white"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-black text-slate-400 block uppercase tracking-widest">Sales Tax</label>
                <button
                  type="button"
                  onClick={() => setTaxEnabled(!taxEnabled)}
                  className={cn(
                    "text-xs font-black px-4 py-1 rounded-xl uppercase tracking-widest transition-all shadow-sm",
                    taxEnabled ? "bg-indigo-600 text-white shadow-indigo-100" : "bg-slate-200 text-slate-500"
                  )}
                >
                  {taxEnabled ? 'Tax ON' : 'Tax OFF'}
                </button>
              </div>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  value={(currentTaxRate * 100).toFixed(1)}
                  onChange={(e) => onUpdateTaxRate(parseFloat(e.target.value) / 100)}
                  className="glass-input h-14 w-full text-lg font-black pl-5 pr-12 border-slate-200 bg-white"
                  placeholder="8.1"
                />
                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-sm font-black text-slate-400">%</span>
              </div>
              <div className="mt-2 text-xs font-black text-slate-400 flex justify-between uppercase tracking-[0.1em]">
                <span>Tax Amount:</span>
                <span className="text-indigo-600">${taxVal.toFixed(2)}</span>
              </div>
            </div>
            <div>
              <label className="text-sm font-black text-indigo-600 mb-2 block uppercase tracking-widest">Total Amount</label>
              <div className="glass-input h-14 w-full text-2xl font-black bg-indigo-50 border-indigo-200 text-indigo-700 flex items-center gap-3">
                <span className="text-indigo-400/50">$</span>
                {totalAmount.toFixed(2)}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-100">
            <div>
              <label className="text-sm font-black text-slate-400 mb-2 block uppercase tracking-widest">
                {isSplit ? 'Total Paid (Split)' : 'Advance Paid'}
              </label>
              <div className="relative">
                <DollarSign size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500/30" />
                <input
                  type="number"
                  value={isSplit ? aVal.toFixed(2) : advance}
                  onChange={(e) => setAdvance(e.target.value)}
                  disabled={isSplit}
                  placeholder="0.00"
                  className={cn(
                    "glass-input h-14 w-full pl-10 text-lg text-emerald-600 font-black border-slate-200 bg-white",
                    isSplit && "bg-emerald-50/20 opacity-80 cursor-not-allowed border-emerald-100"
                  )}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-black text-amber-600 mb-2 block uppercase tracking-widest">Amount Due</label>
              <div className="glass-input h-14 w-full text-lg font-black bg-amber-50 border-amber-200 text-amber-700 flex items-center gap-3">
                <span className="text-amber-500/50">$</span>
                {dueAmount.toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs font-black text-slate-400 block uppercase tracking-widest">Payment Method</label>
            <button
              type="button"
              onClick={() => setIsSplit(!isSplit)}
              className={cn(
                "text-xs font-black px-3 py-1 rounded-lg transition-all shadow-sm",
                isSplit ? "bg-indigo-600 text-white shadow-indigo-100" : "text-indigo-600 hover:text-indigo-700 bg-indigo-50 border border-indigo-100"
              )}
            >
              {isSplit ? '✓ Split ON' : 'Enable Split?'}
            </button>
          </div>
          
          {!isSplit ? (
            <div className="flex p-1 bg-slate-50 border border-slate-100 rounded-xl gap-1 shadow-sm">
              <button
                type="button"
                onClick={() => setPaymentMethod('CASH')}
                className={cn(
                  "flex-1 py-2.5 rounded-lg text-xs font-black flex items-center justify-center gap-2 transition-all",
                  paymentMethod === 'CASH' ? "bg-white text-slate-900 shadow-sm border border-slate-200" : "text-slate-400 hover:text-slate-600"
                )}
              >
                <Banknote size={14} />
                CASH
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('CARD')}
                className={cn(
                  "flex-1 py-2.5 rounded-lg text-xs font-black flex items-center justify-center gap-2 transition-all",
                  paymentMethod === 'CARD' ? "bg-white text-slate-900 shadow-sm border border-slate-200" : "text-slate-400 hover:text-slate-600"
                )}
              >
                <CreditCard size={14} />
                CARD
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('ZELLE')}
                className={cn(
                  "flex-1 py-2.5 rounded-lg text-xs font-black flex items-center justify-center gap-2 transition-all",
                  paymentMethod === 'ZELLE' ? "bg-white text-slate-900 shadow-sm border border-slate-200" : "text-slate-400 hover:text-slate-600"
                )}
              >
                <Zap size={14} className={cn(paymentMethod === 'ZELLE' ? "text-purple-600" : "text-slate-400")} />
                ZELLE
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 border border-slate-100 rounded-xl animate-in fade-in zoom-in-95 duration-200 shadow-sm">
              <div>
                <label className="text-[9px] font-black text-slate-400 block mb-1.5 uppercase tracking-widest">CASH</label>
                <input
                  type="number"
                  value={splitCash}
                  onChange={(e) => setSplitCash(e.target.value)}
                  className="glass-input h-10 w-full text-xs font-black px-3 bg-white border-slate-200"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="text-[9px] font-black text-slate-400 block mb-1.5 uppercase tracking-widest">CARD</label>
                <input
                  type="number"
                  value={splitCard}
                  onChange={(e) => setSplitCard(e.target.value)}
                  className="glass-input h-10 w-full text-xs font-black px-3 text-indigo-600 bg-white border-slate-200"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="text-[9px] font-black text-slate-400 block mb-1.5 uppercase tracking-widest">ZELLE</label>
                <input
                  type="number"
                  value={splitZelle}
                  onChange={(e) => setSplitZelle(e.target.value)}
                  className="glass-input h-10 w-full text-xs font-black px-3 text-purple-600 bg-white border-slate-200"
                  placeholder="0"
                />
              </div>
            </div>
          )}
        </div>

        {/* Change Calculator (Only for Cash payments) */}
        {(paymentMethod === 'CASH' || isSplit) && (
          <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-1 duration-200 shadow-sm">
            <div>
              <label className="text-xs font-black text-emerald-700/70 mb-1.5 block uppercase tracking-widest">Cash Received</label>
              <div className="relative">
                <Banknote size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500/50" />
                <input
                  type="number"
                  value={cashReceived}
                  onChange={(e) => setCashReceived(e.target.value)}
                  placeholder="0.00"
                  className="glass-input h-11 w-full pl-8 text-sm text-emerald-700 font-black border-emerald-200 bg-white shadow-sm"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-black text-amber-700/70 mb-1.5 block uppercase tracking-widest">Change to Return</label>
              <div className="glass-input h-11 w-full text-base font-black bg-amber-50 border-amber-200 text-amber-700 flex items-center justify-between px-4 shadow-sm">
                <span className="text-amber-500/50">$</span>
                <span>{changeVal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        <div>
          <label className="text-xs font-black text-slate-400 mb-1.5 block uppercase tracking-widest">Primary Category (Auto)</label>
          <div className="glass-input h-11 w-full text-sm font-black bg-slate-100 border-slate-200 flex items-center gap-3 px-4 opacity-70 uppercase tracking-tighter text-slate-800">
            {items.length > 0 ? items[0].category : 'Select Items Above'}
          </div>
        </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-black text-slate-400 mb-2 block uppercase tracking-widest">Transaction Date</label>
              <input
                type="date"
                value={date}
                max="3036-12-31"
                onChange={(e) => setDate(e.target.value)}
                className="glass-input h-12 w-full text-base font-black text-slate-900 px-4 bg-white border-slate-200 shadow-sm"
              />
            </div>
            <div>
              <label className="text-xs font-black text-slate-400 mb-2 block uppercase tracking-widest">Internal Note</label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Optional notes..."
                className="glass-input h-12 w-full text-sm font-black px-4 bg-white border-slate-200 shadow-sm"
              />
            </div>
          </div>

        <button 
          type="button" 
          onClick={() => setShowCustomer(!showCustomer)}
          className="text-xs font-black text-indigo-600 flex items-center gap-2 hover:text-indigo-700 transition-all uppercase tracking-widest bg-indigo-50 px-4 py-2 rounded-lg border border-indigo-100 shadow-sm active:scale-95"
        >
          {showCustomer ? '- Hide Customer Profile' : '+ Attach Customer Profile'}
        </button>

        {showCustomer && (
          <div className="space-y-4 p-6 bg-slate-50 rounded-xl border border-slate-100 animate-in fade-in slide-in-from-top-2 shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-black text-slate-400 mb-2 block uppercase tracking-[0.1em]">Client Name</label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Full Name"
                    className="glass-input h-12 w-full pl-12 text-sm font-black bg-white border-slate-200 shadow-sm"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-black text-slate-400 mb-2 block uppercase tracking-[0.1em]">Phone Number</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="(000) 000-0000"
                    className="glass-input h-12 w-full pl-12 text-sm font-black bg-white border-slate-200 shadow-sm"
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-black text-slate-400 mb-2 block uppercase tracking-widest">Email Address</label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="glass-input h-12 w-full text-sm font-black px-4 bg-white border-slate-200 shadow-sm"
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <label className="text-[11px] font-black text-slate-400 mb-2 block uppercase tracking-widest">Warranty Period</label>
                <input
                  type="text"
                  value={warranty}
                  onChange={(e) => setWarranty(e.target.value)}
                  className="glass-input h-12 w-full text-sm font-black px-4 bg-white border-slate-200 shadow-sm"
                  placeholder="e.g. 6 Months"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-black text-slate-400 mb-2 block uppercase tracking-widest">Type of Identification</label>
                <div className="relative">
                  <select
                    value={idType}
                    onChange={(e) => setIdType(e.target.value)}
                    className="glass-input h-12 w-full text-sm font-black appearance-none pr-10 bg-white px-4 border-slate-200 shadow-sm"
                  >
                    <option value="" className="bg-white text-slate-400">Select ID Type</option>
                    {ID_TYPES.map(type => (
                      <option key={type} value={type} className="bg-white">{type}</option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <Plus size={14} />
                  </div>
                </div>
              </div>
              <div>
                <label className="text-[11px] font-black text-slate-400 mb-2 block uppercase tracking-widest">ID Reference No.</label>
                <input
                  type="text"
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value)}
                  className="glass-input h-12 w-full text-sm font-black px-4 bg-white border-slate-200 shadow-sm"
                  placeholder="ID Number"
                />
              </div>
            </div>
          </div>
        )}

        <button type="submit" className={cn(
          "glass-button h-16 w-full mt-8 text-lg font-black uppercase tracking-[0.2em] transition-all duration-500 active:scale-95 shadow-lg shadow-slate-200",
          editingTransaction 
            ? "bg-amber-600 border-amber-500 text-white" 
            : "bg-white border-slate-200 text-slate-800 hover:bg-amber-500 hover:text-white hover:border-amber-600"
        )}>
          {editingTransaction ? '✓ Update Transaction' : 'Post New Record'}
        </button>
      </form>
    </div>
  );
}
