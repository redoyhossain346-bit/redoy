import { useState, FormEvent, useEffect } from 'react';
import { PlusCircle, CreditCard, Banknote, DollarSign, Zap, Plus, X, Edit3 } from 'lucide-react';
import { Category, Transaction, TransactionType, PaymentMethod, TransactionItem, WorkStatus } from '../types';
import { cn } from '../lib/utils';

interface TransactionFormProps {
  onAdd: (transaction: Omit<Transaction, 'id'>) => void;
  editingTransaction: Transaction | null;
  onCancelEdit?: () => void;
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

export default function TransactionForm({ onAdd, editingTransaction, onCancelEdit }: TransactionFormProps) {
  const [type, setType] = useState<TransactionType>('income');
  const [items, setItems] = useState<TransactionItem[]>([]);
  const [itemCategory, setItemCategory] = useState<Category>('Labor');
  const [itemAmount, setItemAmount] = useState('');
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
  const sVal = items.reduce((acc, curr) => acc + curr.amount, 0);
  const dVal = parseFloat(discount) || 0;
  
  // Handle Advance calculation based on split if active
  const sCashVal = parseFloat(splitCash) || 0;
  const sCardVal = parseFloat(splitCard) || 0;
  const sZelleVal = parseFloat(splitZelle) || 0;
  
  const aVal = isSplit ? (sCashVal + sCardVal + sZelleVal) : (parseFloat(advance) || 0);
  
  const taxVal = parseFloat(((sVal - dVal) * 0.081).toFixed(2));
  const totalAmount = parseFloat((sVal - dVal + taxVal).toFixed(2));
  const dueAmount = parseFloat((totalAmount - aVal).toFixed(2));

  // Change Calculation
  const cashToConsider = isSplit ? sCashVal : (paymentMethod === 'CASH' ? totalAmount : 0);
  const cReceivedVal = parseFloat(cashReceived) || 0;
  const changeVal = cReceivedVal > 0 ? Math.max(0, cReceivedVal - cashToConsider) : 0;

  const addItem = () => {
    const amt = parseFloat(itemAmount);
    if (!amt || isNaN(amt)) return;
    
    const isDeviceSell = itemCategory === 'Phone sell' || itemCategory === 'Phone sell' || itemCategory === 'Tablet Sell';
    const isCarrierSell = itemCategory === 'Carrier sell';
    
    setItems([...items, {
      id: Math.random().toString(36).substr(2, 9),
      category: itemCategory,
      amount: amt,
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
    <div className={cn("glass-card p-6", editingTransaction && "border-indigo-500/50 shadow-2xl shadow-indigo-500/10")}>
      <h3 className="text-xs font-bold text-slate-300 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {editingTransaction ? <Edit3 size={14} className="text-indigo-400" /> : <PlusCircle size={14} className="text-indigo-400" />}
          {editingTransaction ? 'Editing Transaction' : 'New Transaction'}
        </div>
        {editingTransaction && onCancelEdit && (
          <button 
            type="button"
            onClick={onCancelEdit}
            className="text-[10px] text-slate-500 hover:text-slate-300"
          >
            Cancel Edit
          </button>
        )}
      </h3>
      
      <div className="flex p-1 bg-slate-950/40 rounded-xl mb-4 gap-1">
        <button
          onClick={() => setType('income')}
          className={cn(
            "flex-1 py-2 rounded-lg text-[10px] font-extrabold transition-all",
            type === 'income' ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20" : "text-slate-500 hover:text-slate-300"
          )}
        >
          Income
        </button>
        <button
          onClick={() => setType('expense')}
          className={cn(
            "flex-1 py-2 rounded-lg text-[10px] font-extrabold transition-all",
            type === 'expense' ? "bg-rose-600 text-white shadow-lg shadow-rose-600/20" : "text-slate-500 hover:text-slate-300"
          )}
        >
          Expense
        </button>
        <button
          onClick={() => setType('refund')}
          className={cn(
            "flex-1 py-2 rounded-lg text-[10px] font-extrabold transition-all",
            type === 'refund' ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "text-slate-500 hover:text-slate-300"
          )}
        >
          Refund
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Item Builder */}
        <div className="bg-slate-950/20 p-3 rounded-xl border border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold text-slate-500 block">Add Products/Services</label>
            <div className="flex items-center gap-2">
              <label className="text-[10px] font-bold text-slate-500 block">Work Status:</label>
              <select
                value={workStatus}
                onChange={(e) => setWorkStatus(e.target.value as WorkStatus)}
                className="bg-transparent text-[10px] font-bold text-indigo-400 outline-none cursor-pointer"
              >
                {WORK_STATUSES.map(status => (
                  <option key={status} value={status} className="bg-slate-900">{status}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={itemCategory}
              onChange={(e) => setItemCategory(e.target.value as Category)}
              className="glass-input flex-1 pr-8 text-xs appearance-none"
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat} className="bg-slate-900">{cat}</option>
              ))}
            </select>
            <div className="relative w-24">
              <DollarSign size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="number"
                value={itemAmount}
                onChange={(e) => setItemAmount(e.target.value)}
                placeholder="0.00"
                className="glass-input w-full pl-7 text-xs font-bold"
              />
            </div>
            <button
              type="button"
              onClick={addItem}
              className="p-2 bg-indigo-500 hover:bg-indigo-400 text-white rounded-lg transition-colors"
            >
              <Plus size={16} />
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
                className="glass-input text-[10px] py-1.5 pr-8 appearance-none"
              >
                <option value="" className="bg-slate-900">Select Carrier</option>
                {CARRIERS.map(c => (
                  <option key={c} value={c} className="bg-slate-900">{c}</option>
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
                <div key={item.id} className="flex flex-col p-2 bg-slate-900/50 rounded-lg border border-white/5 group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-300">{item.category}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-emerald-400">${item.amount.toFixed(2)}</span>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                  {(item.model || item.imei || item.carrier || item.phoneNumber) && (
                    <div className="mt-1 grid grid-cols-2 gap-x-4 gap-y-0.5 text-[8px] font-bold text-slate-500 uppercase tracking-tighter border-t border-white/5 pt-1">
                      {item.model && <div>Model: <span className="text-indigo-400">{item.model}</span></div>}
                      {item.imei && <div>IMEI: <span className="text-indigo-400">{item.imei}</span></div>}
                      {item.storage && <div>GB: <span className="text-indigo-400">{item.storage}</span></div>}
                      {item.color && <div>Color: <span className="text-indigo-400">{item.color}</span></div>}
                      {item.warranty && <div className="col-span-2">Warranty: <span className="text-indigo-400">{item.warranty}</span></div>}
                      {item.carrier && <div>Carrier: <span className="text-indigo-400">{item.carrier}</span></div>}
                      {item.phoneNumber && <div>Number: <span className="text-indigo-400">{item.phoneNumber}</span></div>}
                    </div>
                  )}
                </div>
              ))}
              <div className="flex justify-between p-2 border-t border-white/5 mt-2">
                <span className="text-[10px] font-bold text-slate-500">Sub Total</span>
                <span className="text-sm font-black text-white">${sVal.toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-3 bg-slate-950/20 p-3 rounded-xl border border-white/5">
          <div className="grid grid-cols-2 gap-3">
            <div className="opacity-50">
              <label className="text-[10px] font-bold text-slate-500 mb-1 block">Sub Total (Auto)</label>
              <div className="glass-input w-full text-xs font-bold bg-slate-900/50 flex items-center gap-2">
                <span className="text-slate-500">$</span>
                {sVal.toFixed(2)}
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 mb-1 block">Discount</label>
              <div className="relative">
                <DollarSign size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-rose-500/50" />
                <input
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  placeholder="0.00"
                  className="glass-input w-full pl-7 text-xs text-rose-400"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-500 mb-1 block">Sales Tax (8.1%)</label>
              <div className="glass-input w-full text-xs font-bold bg-slate-900/50 flex items-center gap-2 opacity-80">
                <span className="text-slate-500">$</span>
                {taxVal.toFixed(2)}
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 mb-1 block">Total Amount</label>
              <div className="glass-input w-full text-xs font-bold bg-indigo-500/10 border-indigo-500/30 text-indigo-400 flex items-center gap-2">
                <span className="text-indigo-500/50">$</span>
                {totalAmount.toFixed(2)}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/5">
            <div>
              <label className="text-[10px] font-bold text-slate-500 mb-1 block">
                {isSplit ? 'Total Paid (Split)' : 'Advance Paid'}
              </label>
              <div className="relative">
                <DollarSign size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-emerald-500/50" />
                <input
                  type="number"
                  value={isSplit ? aVal.toFixed(2) : advance}
                  onChange={(e) => setAdvance(e.target.value)}
                  disabled={isSplit}
                  placeholder="0.00"
                  className={cn(
                    "glass-input w-full pl-7 text-xs text-emerald-400 font-bold",
                    isSplit && "bg-emerald-500/5 opacity-80 cursor-not-allowed"
                  )}
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-amber-500 mb-1 block">Amount Due</label>
              <div className="glass-input w-full text-xs font-bold bg-amber-500/10 border-amber-500/30 text-amber-400 flex items-center gap-2">
                <span className="text-amber-500/50">$</span>
                {dueAmount.toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[10px] font-bold text-slate-500 block">Payment Method</label>
            <button
              type="button"
              onClick={() => setIsSplit(!isSplit)}
              className={cn(
                "text-[10px] font-bold px-2 py-0.5 rounded transition-all",
                isSplit ? "bg-indigo-500 text-white" : "text-indigo-400 hover:text-indigo-300"
              )}
            >
              {isSplit ? '✓ Split On' : 'Split?'}
            </button>
          </div>
          
          {!isSplit ? (
            <div className="flex p-1 bg-slate-950/40 rounded-xl gap-1">
              <button
                type="button"
                onClick={() => setPaymentMethod('CASH')}
                className={cn(
                  "flex-1 py-1.5 rounded-lg text-[10px] font-bold flex items-center justify-center gap-2 transition-all",
                  paymentMethod === 'CASH' ? "bg-slate-700 text-white" : "text-slate-500 hover:text-slate-300"
                )}
              >
                <Banknote size={12} />
                Cash
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('CARD')}
                className={cn(
                  "flex-1 py-1.5 rounded-lg text-[10px] font-bold flex items-center justify-center gap-2 transition-all",
                  paymentMethod === 'CARD' ? "bg-slate-700 text-white" : "text-slate-500 hover:text-slate-300"
                )}
              >
                <CreditCard size={12} />
                Card
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('ZELLE')}
                className={cn(
                  "flex-1 py-1.5 rounded-lg text-[10px] font-bold flex items-center justify-center gap-2 transition-all",
                  paymentMethod === 'ZELLE' ? "bg-slate-700 text-white" : "text-slate-500 hover:text-slate-300"
                )}
              >
                <Zap size={12} className={cn(paymentMethod === 'ZELLE' ? "text-purple-400" : "text-slate-500")} />
                Zelle
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2 p-2 bg-slate-950/40 rounded-xl animate-in fade-in zoom-in-95 duration-200">
              <div>
                <label className="text-[8px] font-bold text-slate-500 block mb-1">Cash</label>
                <input
                  type="number"
                  value={splitCash}
                  onChange={(e) => setSplitCash(e.target.value)}
                  className="glass-input w-full text-[10px] py-1 px-2"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="text-[8px] font-bold text-slate-500 block mb-1">Card</label>
                <input
                  type="number"
                  value={splitCard}
                  onChange={(e) => setSplitCard(e.target.value)}
                  className="glass-input w-full text-[10px] py-1 px-2 text-indigo-400"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="text-[8px] font-bold text-slate-500 block mb-1">Zelle</label>
                <input
                  type="number"
                  value={splitZelle}
                  onChange={(e) => setSplitZelle(e.target.value)}
                  className="glass-input w-full text-[10px] py-1 px-2 text-purple-400"
                  placeholder="0"
                />
              </div>
            </div>
          )}
        </div>

        {/* Change Calculator (Only for Cash payments) */}
        {(paymentMethod === 'CASH' || isSplit) && (
          <div className="bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/10 grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-1 duration-200">
            <div>
              <label className="text-[10px] font-bold text-emerald-500/70 mb-1 block">Cash Received</label>
              <div className="relative">
                <Banknote size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-emerald-500/50" />
                <input
                  type="number"
                  value={cashReceived}
                  onChange={(e) => setCashReceived(e.target.value)}
                  placeholder="0.00"
                  className="glass-input w-full pl-7 text-xs text-emerald-400 font-bold border-emerald-500/20"
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-amber-500/70 mb-1 block">Change to Return</label>
              <div className="glass-input w-full text-xs font-black bg-amber-500/10 border-amber-500/30 text-amber-400 flex items-center justify-between px-3">
                <span className="text-amber-500/50">$</span>
                <span>{changeVal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        <div>
          <label className="text-[10px] font-bold text-slate-500 mb-1 block">Primary Category (Auto)</label>
          <div className="glass-input w-full text-xs font-bold bg-slate-900/50 flex items-center gap-2 opacity-80">
            {items.length > 0 ? items[0].category : 'Select Items Above'}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-bold text-slate-500 mb-1 block">Date</label>
            <input
              type="date"
              value={date}
              max="3036-12-31"
              onChange={(e) => setDate(e.target.value)}
              className="glass-input w-full text-xs"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500 mb-1 block">Note</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="..."
              className="glass-input w-full text-xs"
            />
          </div>
        </div>

        <button 
          type="button" 
          onClick={() => setShowCustomer(!showCustomer)}
          className="text-[10px] font-bold text-indigo-400 flex items-center gap-1 hover:text-indigo-300 transition-colors"
        >
          {showCustomer ? '- Remove Customer Info' : '+ Add Customer Info'}
        </button>

        {showCustomer && (
          <div className="space-y-3 p-3 bg-slate-950/20 rounded-xl border border-white/5 animate-in fade-in slide-in-from-top-1">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[9px] font-bold text-slate-500 mb-1 block">Customer Name</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="glass-input w-full text-xs"
                  placeholder="Name"
                />
              </div>
              <div>
                <label className="text-[9px] font-bold text-slate-500 mb-1 block">Phone</label>
                <input
                  type="text"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="glass-input w-full text-xs"
                  placeholder="Phone"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[9px] font-bold text-slate-500 mb-1 block">Email</label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="glass-input w-full text-xs"
                  placeholder="Email"
                />
              </div>
              <div>
                <label className="text-[9px] font-bold text-slate-500 mb-1 block">Warranty</label>
                <input
                  type="text"
                  value={warranty}
                  onChange={(e) => setWarranty(e.target.value)}
                  className="glass-input w-full text-xs"
                  placeholder="e.g. 6 Months"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[9px] font-bold text-slate-500 mb-1 block">Type of ID</label>
                <select
                  value={idType}
                  onChange={(e) => setIdType(e.target.value)}
                  className="glass-input w-full text-xs appearance-none pr-8 bg-slate-900/50"
                >
                  <option value="" className="bg-slate-900">Select ID Type</option>
                  {ID_TYPES.map(type => (
                    <option key={type} value={type} className="bg-slate-900">{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[9px] font-bold text-slate-500 mb-1 block">ID Number</label>
                <input
                  type="text"
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value)}
                  className="glass-input w-full text-xs"
                  placeholder="ID Number"
                />
              </div>
            </div>
          </div>
        )}

        <button type="submit" className={cn(
          "glass-button w-full mt-2 text-sm",
          editingTransaction && "bg-indigo-600 border-indigo-400 text-white"
        )}>
          {editingTransaction ? 'Update Entry' : 'Post Entry'}
        </button>
      </form>
    </div>
  );
}
