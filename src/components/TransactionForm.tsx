import { useState, FormEvent, useEffect, useMemo } from 'react';
import { User, Phone, PlusCircle, CreditCard, Banknote, DollarSign, Zap, Plus, X, Edit3, ArrowRight, ArrowLeft, CheckCircle2, ShoppingBag, UserCircle, Receipt, Mic, MicOff, Smartphone, Package, Clock, Tag, Sparkles, AlertCircle, ClipboardCheck, CheckSquare, Square, RotateCcw, Wrench } from 'lucide-react';
import { Category, Transaction, TransactionType, PaymentMethod, TransactionItem, WorkStatus, RepairChecklistItem, STANDARD_REPAIR_CHECKLIST } from '../types';
import { cn, toDatetimeLocalString } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { DEVICE_BRANDS, QUALITY_OPTIONS } from '../data/deviceModels';

interface TransactionFormProps {
  onAdd: (transaction: Omit<Transaction, 'id'>) => void;
  editingTransaction: Transaction | null;
  onCancelEdit?: () => void;
  currentTaxRate: number;
  onUpdateTaxRate: (rate: number) => void;
}

const CATEGORIES: Category[] = [
  'Repair', 'Accessory', 'Service', 'Screen replacement', 'Back glass', 'Other fix', 'Labor', 'Unlocking', 'Phone sell', 'Tablet Sell', 
  'Perfume', 'Doll', 'Case', 'Water Bottle', 'Drinks', 'Noodles', 'Coffee', 'Snacks', 'Stanley cup', 'Earbud case', 'Fan', 'Speaker', 'Charging cord', 'Adapter', 'Cable', 'Bag', 'Custom Name', 'Accessories', 'Parts Sell', 'Toy sell',
  'Tempered Glass', 'Battery', 'Camera Protector', 'Watch Belt', 'Watch Protector',
  'Carrier sell', 'Uber', 'Income', 'Food', 'Transport', 'Rent', 'Utilities', 'Shopping', 'Others'
];

const CARRIERS = ['T-Mobile', 'AT&T', 'Lyca', 'Simple Mobile', 'Verizon', 'Boost Mobile', 'H2O', 'Cricket', 'Others'];

const ID_TYPES = ['State ID', 'Passport', 'Driving License', 'Visa Copy', 'Other'];

const WORK_STATUSES: WorkStatus[] = ['Not Started', 'Working Process', 'Bill Due', 'Pre-Order', 'Return', 'Pickup', 'Paid'];

type Step = 'Basics' | 'Items' | 'Customer' | 'Payment';

export default function TransactionForm({ onAdd, editingTransaction, onCancelEdit, currentTaxRate, onUpdateTaxRate }: TransactionFormProps) {
  const [currentStep, setCurrentStep] = useState<Step>('Basics');
  const [type, setType] = useState<TransactionType>('income');
  const [items, setItems] = useState<TransactionItem[]>([]);
  const [itemCategory, setItemCategory] = useState<Category>('Screen replacement');
  const [customItemName, setCustomItemName] = useState('');
  const [aiSuggestedCategory, setAiSuggestedCategory] = useState<{
    category: Category;
    confidence: number;
    reason: string;
    allSuggestions: Category[];
    isAiPowered: boolean;
  } | null>(null);
  const [isAnalyzingCategory, setIsAnalyzingCategory] = useState(false);
  const [hasManuallyOverriddenCategory, setHasManuallyOverriddenCategory] = useState(false);
  const [itemCost, setItemCost] = useState('');
  const [itemAmount, setItemAmount] = useState('');
  const [itemQuantity, setItemQuantity] = useState('1');
  const [isItemPreOrder, setIsItemPreOrder] = useState(false);
  const [itemAdvanceMoney, setItemAdvanceMoney] = useState('');
  const [deviceBrand, setDeviceBrand] = useState<string>('iPhone');
  const [deviceModel, setDeviceModel] = useState('');
  const [deviceQuality, setDeviceQuality] = useState<string>('');
  const [deviceImei, setDeviceImei] = useState('');

  const currentBrandModels = useMemo(() => {
    const found = DEVICE_BRANDS.find(b => b.brand.toLowerCase() === deviceBrand.toLowerCase());
    return found ? found.models : [];
  }, [deviceBrand]);
  const [deviceStorage, setDeviceStorage] = useState('');
  const [deviceColor, setDeviceColor] = useState('');
  const [deviceWarranty, setDeviceWarranty] = useState('');
  const [carrier, setCarrier] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [discount, setDiscount] = useState('0');
  const [advance, setAdvance] = useState('0');
  const [isManualAdvance, setIsManualAdvance] = useState(false);
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
  const [date, setDate] = useState(toDatetimeLocalString());
  const [isListening, setIsListening] = useState(false);
  const [repairChecklist, setRepairChecklist] = useState<RepairChecklistItem[]>(STANDARD_REPAIR_CHECKLIST);
  const [newChecklistLabel, setNewChecklistLabel] = useState('');
  const [showChecklist, setShowChecklist] = useState(true);

  const toggleListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice recognition is not supported in this browser. Please use Chrome, Edge, or Safari.");
      return;
    }

    if (isListening) {
      if ((window as any).activeRecognition) {
        (window as any).activeRecognition.stop();
      }
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      (window as any).activeRecognition = recognition;

      const baseNote = note;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        
        const newNote = baseNote 
          ? `${baseNote} ${currentTranscript.trim()}`
          : currentTranscript.trim();
          
        setNote(newNote);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          alert('Microphone access was blocked. Please allow microphone permissions in your browser address bar.');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.error('Failed to start speech recognition', err);
      setIsListening(false);
    }
  };

  const toggleChecklistItem = (id: string) => {
    setRepairChecklist(prev =>
      prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item)
    );
  };

  const addChecklistItem = () => {
    if (!newChecklistLabel.trim()) return;
    const newItem: RepairChecklistItem = {
      id: `custom_${Date.now()}`,
      label: newChecklistLabel.trim(),
      checked: false
    };
    setRepairChecklist(prev => [...prev, newItem]);
    setNewChecklistLabel('');
  };

  const removeChecklistItem = (id: string) => {
    setRepairChecklist(prev => prev.filter(item => item.id !== id));
  };

  const resetChecklist = () => {
    setRepairChecklist(STANDARD_REPAIR_CHECKLIST);
  };

  const clearDraft = () => {
    try {
      localStorage.removeItem('pos_tx_form_draft_v1');
    } catch (e) {}
  };

  useEffect(() => {
    if (editingTransaction) {
      setIsManualAdvance(true);
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
      setDate(toDatetimeLocalString(editingTransaction.date || editingTransaction.createdAt));
      setCustomerName(editingTransaction.customer?.name || '');
      setCustomerPhone(editingTransaction.customer?.phone || '');
      setCustomerEmail(editingTransaction.customer?.email || '');
      setWarranty(editingTransaction.customer?.warranty || '');
      setIdType(editingTransaction.customer?.idType || '');
      setIdNumber(editingTransaction.customer?.idNumber || '');
      setShowCustomer(!!editingTransaction.customer);
      setRepairChecklist(editingTransaction.repairChecklist || STANDARD_REPAIR_CHECKLIST);
      // Reset to first step on edit
      setCurrentStep('Basics');
    } else {
      setIsManualAdvance(false);
      try {
        const savedDraft = localStorage.getItem('pos_tx_form_draft_v1');
        if (savedDraft) {
          const draft = JSON.parse(savedDraft);
          if (draft.repairChecklist) setRepairChecklist(draft.repairChecklist);
          if (draft.note) setNote(draft.note);
          if (draft.workStatus) setWorkStatus(draft.workStatus);
          if (draft.items && draft.items.length > 0) setItems(draft.items);
          if (draft.customerName) {
            setCustomerName(draft.customerName);
            setShowCustomer(true);
          }
          if (draft.customerPhone) setCustomerPhone(draft.customerPhone);
          if (draft.customerEmail) setCustomerEmail(draft.customerEmail);
        }
      } catch (err) {
        console.error('Failed to load transaction draft', err);
      }
    }
  }, [editingTransaction]);

  // Auto-save form draft whenever key fields change (when creating new transaction)
  useEffect(() => {
    if (editingTransaction) return;
    try {
      const draft = {
        repairChecklist,
        note,
        workStatus,
        items,
        customerName,
        customerPhone,
        customerEmail,
        timestamp: Date.now()
      };
      localStorage.setItem('pos_tx_form_draft_v1', JSON.stringify(draft));
    } catch (err) {
      console.error('Failed to auto-save transaction draft', err);
    }
  }, [editingTransaction, repairChecklist, note, workStatus, items, customerName, customerPhone, customerEmail]);

  // AI-powered auto-categorization based on notes or customer fields
  const analyzeCategory = async (customNote?: string, customName?: string) => {
    const noteText = customNote !== undefined ? customNote : note;
    const nameText = customName !== undefined ? customName : customerName;

    if (!noteText.trim() && !nameText.trim()) {
      return;
    }

    setIsAnalyzingCategory(true);
    try {
      const response = await fetch('/api/suggest-category', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          note: noteText,
          customerName: nameText,
          customerPhone,
          items
        })
      });

      if (!response.ok) {
        throw new Error('Failed to analyze category');
      }

      const resJson = await response.json();
      if (resJson.success && resJson.data) {
        const result = {
          category: (resJson.data.suggestedCategory || 'Repair') as Category,
          confidence: resJson.data.confidence ?? 0.92,
          reason: resJson.data.reason || 'Analyzed from notes & customer fields',
          allSuggestions: (resJson.data.allSuggestions || ['Repair', 'Accessory', 'Service']) as Category[],
          isAiPowered: !!resJson.data.isAiPowered
        };
        setAiSuggestedCategory(result);

        // Auto-apply suggested category if user hasn't manually overridden it
        if (!hasManuallyOverriddenCategory) {
          setItemCategory(result.category);
        }
      }
    } catch (err) {
      console.error('AI Categorization Error:', err);
    } finally {
      setIsAnalyzingCategory(false);
    }
  };

  useEffect(() => {
    const textLen = (note || '').trim().length + (customerName || '').trim().length;
    if (textLen < 3) {
      return;
    }
    const timer = setTimeout(() => {
      analyzeCategory(note, customerName);
    }, 800);
    return () => clearTimeout(timer);
  }, [note, customerName]);

  const renderAICategoryBanner = () => {
    if (isAnalyzingCategory) {
      return (
        <div className="bg-gradient-to-r from-indigo-50 via-amber-50 to-indigo-50 p-4 rounded-2xl border border-indigo-200/60 shadow-xs flex items-center justify-between gap-3 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
              <Sparkles size={16} className="animate-spin" />
            </div>
            <div>
              <p className="text-xs font-black text-indigo-950 uppercase tracking-wider">
                AI Categorization Active
              </p>
              <p className="text-[11px] font-medium text-slate-600 mt-0.5">
                Analyzing notes & customer info to suggest the best store category...
              </p>
            </div>
          </div>
        </div>
      );
    }

    if (!aiSuggestedCategory) {
      return (
        <div className="bg-slate-50 hover:bg-amber-50/50 p-3.5 rounded-2xl border border-slate-200 hover:border-amber-300 transition-all flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center shrink-0">
              <Sparkles size={16} />
            </div>
            <div>
              <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                AI Auto-Categorization Ready
              </span>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Type in Internal Note or Customer Name to automatically suggest category ('Repair', 'Accessory', 'Service')
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => analyzeCategory()}
            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black uppercase tracking-wider transition-all shadow-xs shrink-0 cursor-pointer flex items-center gap-1.5"
          >
            <Sparkles size={14} />
            Auto-Categorize Now
          </button>
        </div>
      );
    }

    const isCurrentActive = itemCategory === aiSuggestedCategory.category;

    return (
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-white p-4 rounded-2xl border border-amber-500/30 shadow-xs space-y-3"
      >
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Sparkles size={16} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  AI Suggested Category: <span className="text-amber-700 underline decoration-amber-400">{aiSuggestedCategory.category}</span>
                </span>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                  {aiSuggestedCategory.isAiPowered ? "⚡ Gemini AI" : "✨ Smart Rule"} ({Math.round(aiSuggestedCategory.confidence * 100)}% Match)
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-600 mt-0.5">{aiSuggestedCategory.reason}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isCurrentActive ? (
              <button
                type="button"
                onClick={() => {
                  setItemCategory(aiSuggestedCategory.category);
                  setHasManuallyOverriddenCategory(false);
                }}
                className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black uppercase tracking-wider transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 size={14} />
                Apply '{aiSuggestedCategory.category}'
              </button>
            ) : (
              <span className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-[11px] font-black uppercase tracking-wider shadow-xs flex items-center gap-1.5">
                <CheckCircle2 size={14} />
                Selected: {aiSuggestedCategory.category}
              </span>
            )}
            <button
              type="button"
              onClick={() => analyzeCategory()}
              title="Re-analyze note and customer details"
              className="p-2 rounded-xl bg-white hover:bg-amber-100 text-slate-600 hover:text-amber-700 border border-slate-200 transition-all cursor-pointer"
            >
              <RotateCcw size={14} />
            </button>
          </div>
        </div>

        {/* Alternative suggestions pills & update existing items */}
        <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-amber-500/10">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Suggested Alternatives:</span>
            {aiSuggestedCategory.allSuggestions
              .filter((c: string) => c !== aiSuggestedCategory.category)
              .slice(0, 4)
              .map((cat: Category) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setItemCategory(cat);
                    setHasManuallyOverriddenCategory(true);
                  }}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-[10px] font-black transition-all border cursor-pointer uppercase",
                    itemCategory === cat
                      ? "bg-amber-500 text-white border-amber-600 shadow-2xs"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-amber-50 hover:border-amber-300"
                  )}
                >
                  + {cat}
                </button>
              ))}
          </div>

          {items.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setItems(prev => prev.map(item => ({ ...item, category: aiSuggestedCategory.category })));
              }}
              className="text-[11px] font-black text-amber-700 hover:text-amber-800 underline cursor-pointer transition-all"
            >
              Apply '{aiSuggestedCategory.category}' to all {items.length} item(s) in bill
            </button>
          )}
        </div>
      </motion.div>
    );
  };

  // Calculations
  const sVal = useMemo(() => items.reduce((acc, curr) => acc + (curr.amount * curr.quantity), 0), [items]);
  const totalCostVal = useMemo(() => items.reduce((acc, curr) => acc + ((curr.cost || 0) * curr.quantity), 0), [items]);
  const dVal = parseFloat(discount) || 0;
  const totalProfitVal = useMemo(() => (sVal - dVal) - totalCostVal, [sVal, dVal, totalCostVal]);
  
  // Handle Advance calculation based on split if active
  const sCashVal = parseFloat(splitCash) || 0;
  const sCardVal = parseFloat(splitCard) || 0;
  const sZelleVal = parseFloat(splitZelle) || 0;
  
  const aVal = isSplit ? (sCashVal + sCardVal + sZelleVal) : (parseFloat(advance) || 0);
  
  const [taxEnabled, setTaxEnabled] = useState(true);
  const [isEditingTax, setIsEditingTax] = useState(false);
  const [taxRateInput, setTaxRateInput] = useState((currentTaxRate * 100).toString());

  useEffect(() => {
    setTaxRateInput((currentTaxRate * 100).toString());
  }, [currentTaxRate]);

  const taxMultiplier = taxEnabled ? currentTaxRate : 0;
  const taxVal = parseFloat(((sVal - dVal) * taxMultiplier).toFixed(2));
  const totalAmount = parseFloat((sVal - dVal + taxVal).toFixed(2));
  const dueAmount = parseFloat((totalAmount - aVal).toFixed(2));

  // Auto-detect and sync Amount Paid to Total Amount unless user manually overrides
  useEffect(() => {
    if (!isManualAdvance && !editingTransaction) {
      setAdvance(totalAmount > 0 ? totalAmount.toFixed(2) : '0');
    }
  }, [totalAmount, isManualAdvance, editingTransaction]);

  // Change Calculation
  const cashToConsider = isSplit ? sCashVal : (paymentMethod === 'CASH' ? aVal : 0);
  const cReceivedVal = parseFloat(cashReceived) || 0;
  const changeVal = cReceivedVal > 0 && cashToConsider > 0 ? Math.max(0, cReceivedVal - cashToConsider) : 0;

  const addItem = () => {
    const parsedAmt = parseFloat(itemAmount);
    const parsedCost = parseFloat(itemCost);
    const qty = parseInt(itemQuantity) || 1;

    // If cost is entered without a sell price (e.g. Uber / expense), default sell price to cost (no profit / expense)
    const cost = (!isNaN(parsedCost) && parsedCost >= 0) ? parsedCost : undefined;
    const amt = (!isNaN(parsedAmt) && parsedAmt > 0)
      ? parsedAmt
      : (cost !== undefined ? cost : 0);

    if (amt <= 0 && (cost === undefined || cost <= 0)) return;
    
    const isDeviceSell = itemCategory === 'Phone sell' || itemCategory === 'Tablet Sell';
    const isCarrierSell = itemCategory === 'Carrier sell';
    const isRepairOrPart = [
      'Screen replacement', 'Back glass', 'Battery', 'Other fix', 'Labor',
      'Unlocking', 'Phone sell', 'Tablet Sell', 'Tempered Glass',
      'Camera Protector', 'Parts Sell', 'Accessories'
    ].includes(itemCategory);

    const itemAdvVal = parseFloat(itemAdvanceMoney) || 0;
    const finalCat = (itemCategory === 'Custom Name' && customItemName.trim()) ? (customItemName.trim() as Category) : itemCategory;

    setItems([...items, {
      id: Math.random().toString(36).substr(2, 9),
      category: finalCat,
      amount: amt,
      cost: cost,
      quantity: qty,
      brand: isRepairOrPart && deviceBrand && deviceBrand !== 'None' ? deviceBrand : undefined,
      model: isRepairOrPart && deviceModel ? deviceModel : undefined,
      quality: isRepairOrPart && deviceQuality ? deviceQuality : undefined,
      isPreOrder: isItemPreOrder,
      advance: itemAdvVal > 0 ? itemAdvVal : undefined,
      ...(isDeviceSell ? {
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

    if (isItemPreOrder && workStatus !== 'Pre-Order') {
      setWorkStatus('Pre-Order');
    }

    if (itemAdvVal > 0) {
      setIsManualAdvance(true);
      const prevAdv = parseFloat(advance) || 0;
      setAdvance((prevAdv + itemAdvVal).toFixed(2));
    }
    
    setItemAmount('');
    setItemCost('');
    setItemQuantity('1');
    setCustomItemName('');
    setIsItemPreOrder(false);
    setItemAdvanceMoney('');
    setDeviceModel('');
    setDeviceImei('');
    setDeviceStorage('');
    setDeviceColor('');
    setDeviceWarranty('');
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
    if (items.length === 0) {
      setCurrentStep('Items');
      return;
    }

    onAdd({
      amount: totalAmount,
      subTotal: sVal,
      discount: dVal,
      tax: taxVal,
      advance: aVal,
      due: dueAmount,
      totalCost: totalCostVal,
      profit: totalProfitVal,
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
      repairChecklist,
      date: date || new Date().toISOString(),
      createdAt: editingTransaction?.createdAt || new Date().toISOString()
    });

    setItems([]);
    setDiscount('0');
    setAdvance('0');
    setIsManualAdvance(false);
    setSplitCash('0');
    setSplitCard('0');
    setSplitZelle('0');
    setIsSplit(false);
    setWorkStatus('Not Started');
    setCashReceived('');
    setNote('');
    setDate(toDatetimeLocalString());
    setCustomerName('');
    setCustomerPhone('');
    setCustomerEmail('');
    setWarranty('');
    setIdType('');
    setIdNumber('');
    setRepairChecklist(STANDARD_REPAIR_CHECKLIST);
    clearDraft();
    setCurrentStep('Basics');
  };

  const nextStep = () => {
    if (currentStep === 'Basics') setCurrentStep('Items');
    else if (currentStep === 'Items') setCurrentStep('Customer');
    else if (currentStep === 'Customer') setCurrentStep('Payment');
  };

  const prevStep = () => {
    if (currentStep === 'Items') setCurrentStep('Basics');
    else if (currentStep === 'Customer') setCurrentStep('Items');
    else if (currentStep === 'Payment') setCurrentStep('Customer');
  };

  const steps: { id: Step; label: string; icon: any }[] = [
    { id: 'Basics', label: 'Type & Info', icon: Zap },
    { id: 'Items', label: 'Products', icon: ShoppingBag },
    { id: 'Customer', label: 'Profile', icon: UserCircle },
    { id: 'Payment', label: 'Review', icon: Receipt },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);

  return (
    <div className={cn("glass-card p-6 md:p-8 bg-white border-slate-200 shadow-sm overflow-hidden", editingTransaction && "border-amber-500/50 shadow-lg shadow-amber-500/5")}>
      {/* Header & Meta */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3">
            {editingTransaction ? <Edit3 size={28} className="text-amber-500" /> : <PlusCircle size={28} className="text-amber-500" />}
            <span className="premium-gradient-text">{editingTransaction ? 'Edit Transaction' : 'Quick Transaction'}</span>
          </h3>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Multi-step Transaction Wizard</p>
        </div>

        {editingTransaction && onCancelEdit && (
          <button 
            type="button"
            onClick={onCancelEdit}
            className="text-[10px] font-black text-slate-400 hover:text-rose-500 transition-colors uppercase tracking-[0.2em] px-4 py-2 bg-slate-50 rounded-full border border-slate-100"
          >
            Cancel Edit
          </button>
        )}
      </div>

      {/* Form Wrapper */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Progress Bar */}
      <div className="relative mb-12">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-50 -translate-y-1/2 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-amber-500"
            initial={{ width: 0 }}
            animate={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
            transition={{ duration: 0.5, ease: "circOut" }}
          />
        </div>
        <div className="relative flex justify-between">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isActive = idx <= currentStepIndex;
            const isCurrent = idx === currentStepIndex;

            return (
              <button
                key={step.id}
                type="button"
                onClick={() => {
                  if (idx < currentStepIndex || (items.length > 0)) {
                    setCurrentStep(step.id);
                  }
                }}
                className="flex flex-col items-center group relative z-10"
              >
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center border-2 transition-all duration-500",
                  isCurrent ? "bg-amber-500 border-amber-600 text-white shadow-lg shadow-amber-500/20 scale-110" :
                  isActive ? "bg-white border-amber-500 text-amber-500" :
                  "bg-white border-slate-100 text-slate-300"
                )}>
                  {isActive && idx < currentStepIndex ? <CheckCircle2 size={20} /> : <Icon size={20} />}
                </div>
                <span className={cn(
                  "text-[9px] font-black uppercase tracking-widest mt-2 hidden sm:block",
                  isCurrent ? "text-amber-600" : isActive ? "text-slate-600" : "text-slate-300"
                )}>
                  {step.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, rotateY: 90, scale: 0.9 }}
          animate={{ opacity: 1, rotateY: 0, scale: 1 }}
          exit={{ opacity: 0, rotateY: -90, scale: 0.9 }}
          transition={{ 
            duration: 0.5, 
            type: "spring",
            stiffness: 100,
            damping: 15
          }}
          className="min-h-[400px] [transform-style:preserve-3d]"
        >
          {currentStep === 'Basics' && (
            <div className="space-y-6">
              <div className="bg-slate-50 p-2 rounded-2xl flex gap-2 border border-slate-100 shadow-sm">
                {(['income', 'expense', 'refund'] as const).map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={cn(
                      "flex-1 py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                      type === t ? (
                        t === 'income' ? "bg-emerald-600 text-white shadow-lg" :
                        t === 'expense' ? "bg-rose-600 text-white shadow-lg" :
                        "bg-amber-600 text-white shadow-lg"
                      ) : "text-slate-400 hover:text-slate-600"
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 mb-2 block uppercase tracking-widest pl-1">Transaction Date & Time</label>
                  <input
                    type="datetime-local"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="glass-input h-14 w-full px-6 text-base font-black bg-white border-slate-200 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 mb-2 block uppercase tracking-widest pl-1">Process Status</label>
                  <select
                    value={workStatus}
                    onChange={(e) => setWorkStatus(e.target.value as WorkStatus)}
                    className="glass-input h-14 w-full px-6 text-base font-black bg-white border-slate-200 appearance-none"
                  >
                    {WORK_STATUSES.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                  <div className="flex items-center gap-1.5 flex-wrap mt-2">
                    {WORK_STATUSES.map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setWorkStatus(s)}
                        className={cn(
                          "px-2.5 py-1 rounded-lg text-[10px] font-black transition-all border cursor-pointer uppercase",
                          workStatus === s
                            ? (s === 'Pre-Order' ? "bg-purple-600 text-white border-purple-700 shadow-xs" : "bg-amber-500 text-white border-amber-600 shadow-xs")
                            : "bg-white text-slate-600 border-slate-200 hover:bg-amber-50 hover:text-amber-700"
                        )}
                      >
                        {s === 'Pre-Order' ? '📦 Pre-Order' : s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] font-black text-slate-400 block uppercase tracking-widest pl-1">Internal Log / Note</label>
                  <button
                    type="button"
                    onClick={toggleListening}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-black transition-all border shadow-sm cursor-pointer",
                      isListening
                        ? "bg-rose-600 text-white border-rose-700 animate-pulse ring-2 ring-rose-200"
                        : "bg-slate-100 text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 border-slate-200"
                    )}
                    title={isListening ? "Stop Voice Input" : "Click to speak and auto-type into Internal Log"}
                  >
                    {isListening ? (
                      <>
                        <MicOff size={14} className="animate-spin text-white" />
                        <span>Listening... (Click to Stop)</span>
                      </>
                    ) : (
                      <>
                        <Mic size={14} className="text-indigo-600" />
                        <span>Voice Recognition</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="relative">
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder={isListening ? "Listening... Speak now and text will appear here automatically..." : "Additional details about this transaction..."}
                    rows={4}
                    className={cn(
                      "glass-input w-full p-6 text-sm font-black bg-white border-slate-200 resize-none h-32 transition-all",
                      isListening && "border-rose-400 ring-2 ring-rose-100 bg-rose-50/20"
                    )}
                  />
                  {isListening && (
                    <div className="absolute bottom-3 right-3 flex items-center gap-2 bg-rose-600 text-white text-[10px] font-black px-3 py-1 rounded-full animate-bounce shadow-md">
                      <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                      Live Mic Active
                    </div>
                  )}
                </div>
              </div>

              {/* AI Auto-Categorization Banner */}
              {renderAICategoryBanner()}

              {/* Diagnostic & Repair Checklist (Auto-Save Enabled) */}
              <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3.5">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Wrench size={16} className="text-amber-600" />
                    <span className="text-xs font-black uppercase tracking-widest text-slate-800">Diagnostic & Repair Checklist</span>
                    <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-black">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Auto-Save Enabled
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-600 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                      {repairChecklist.filter(i => i.checked).length} / {repairChecklist.length} Completed
                    </span>
                    <button
                      type="button"
                      onClick={resetChecklist}
                      className="text-[10px] font-black text-slate-500 hover:text-rose-600 uppercase tracking-wider px-2 py-1 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer flex items-center gap-1"
                      title="Reset all checks to default"
                    >
                      <RotateCcw size={11} /> Reset
                    </button>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 font-medium">
                  Mark off diagnostic checks as you complete repairs. Progress is auto-saved automatically.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
                  {repairChecklist.map(item => (
                    <div
                      key={item.id}
                      onClick={() => toggleChecklistItem(item.id)}
                      className={cn(
                        "flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all",
                        item.checked ? "bg-emerald-50/80 border-emerald-300 text-emerald-950 font-bold" : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        {item.checked ? (
                          <CheckSquare size={16} className="text-emerald-600 shrink-0" />
                        ) : (
                          <Square size={16} className="text-slate-400 shrink-0" />
                        )}
                        <span className={cn("text-xs", item.checked && "line-through text-slate-500")}>{item.label}</span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); removeChecklistItem(item.id); }}
                        className="text-slate-300 hover:text-rose-500 p-1 transition-colors cursor-pointer"
                        title="Remove diagnostic step"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                  <input
                    type="text"
                    value={newChecklistLabel}
                    onChange={(e) => setNewChecklistLabel(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addChecklistItem(); } }}
                    placeholder="Add custom diagnostic test step..."
                    className="flex-1 px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 font-medium text-slate-800"
                  />
                  <button
                    type="button"
                    onClick={addChecklistItem}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-black rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Plus size={13} /> Add Step
                  </button>
                </div>
              </div>
            </div>
          )}

          {currentStep === 'Items' && (
            <div className="space-y-6">
              {/* Item Builder */}
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <label className="text-base font-black text-slate-400 block uppercase tracking-[0.2em]">Add Products / Services</label>
                  {(itemAmount || itemCost) && (
                    <div className={cn(
                      "flex items-center gap-2 text-[10px] font-black uppercase px-3 py-1 rounded-full border",
                      ((parseFloat(itemAmount) || parseFloat(itemCost) || 0) - (parseFloat(itemCost) || 0)) > 0
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                    )}>
                      <span>
                        {((parseFloat(itemAmount) || parseFloat(itemCost) || 0) - (parseFloat(itemCost) || 0)) > 0
                          ? "Profit / Money Made:"
                          : "Expense / At-Cost ($0 Profit):"}
                      </span>
                      <span className="font-mono text-xs">
                        ${(((parseFloat(itemAmount) || parseFloat(itemCost) || 0) - (parseFloat(itemCost) || 0)) * (parseInt(itemQuantity) || 1)).toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>

                {/* AI Auto-Categorization Banner */}
                {renderAICategoryBanner()}

                {/* Pre-Order & Advance Money Bar */}
                <div className={cn(
                  "p-4 rounded-2xl border transition-all space-y-3 shadow-2xs",
                  isItemPreOrder
                    ? "bg-gradient-to-r from-purple-50 via-indigo-50 to-amber-50 border-purple-300 ring-2 ring-purple-200/60"
                    : "bg-white border-slate-200/90 hover:border-slate-300"
                )}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => {
                          const next = !isItemPreOrder;
                          setIsItemPreOrder(next);
                          if (next && workStatus !== 'Pre-Order') {
                            setWorkStatus('Pre-Order');
                          }
                        }}
                        className={cn(
                          "px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer shadow-xs border",
                          isItemPreOrder
                            ? "bg-purple-600 text-white border-purple-700 shadow-purple-500/20 scale-[1.02]"
                            : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200"
                        )}
                      >
                        <Package size={16} className={isItemPreOrder ? "text-amber-300 animate-bounce" : "text-purple-500"} />
                        <span>Pre-Order Option: {isItemPreOrder ? 'ENABLED' : 'OFF'}</span>
                      </button>

                      {isItemPreOrder && (
                        <span className="text-[10px] font-black uppercase bg-purple-100 text-purple-800 px-2.5 py-1 rounded-lg border border-purple-300 flex items-center gap-1">
                          <Clock size={12} className="text-purple-600" />
                          <span>Status: Pre-Order</span>
                        </span>
                      )}
                    </div>

                    {/* Advance Money Input */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider flex items-center gap-1">
                        <DollarSign size={12} className="text-emerald-600" />
                        <span>Advance Deposit ($):</span>
                      </span>
                      <div className="relative w-36">
                        <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600" />
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={itemAdvanceMoney}
                          onChange={(e) => {
                            setItemAdvanceMoney(e.target.value);
                            if (parseFloat(e.target.value) > 0 && !isItemPreOrder) {
                              setIsItemPreOrder(true);
                              setWorkStatus('Pre-Order');
                            }
                          }}
                          placeholder="0.00"
                          className="glass-input h-10 w-full pl-7 pr-2 text-xs font-black border-emerald-300 bg-white text-emerald-700 focus:border-emerald-500 rounded-xl"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Advance Quick Presets & Live Summary */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/60">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Quick Presets:</span>
                      <button
                        type="button"
                        onClick={() => setItemAdvanceMoney('0')}
                        className="text-[9px] font-black px-2 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-600 hover:bg-slate-200 cursor-pointer"
                      >
                        $0 Advance
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const itemTotal = (parseFloat(itemAmount) || 0) * (parseInt(itemQuantity) || 1);
                          setItemAdvanceMoney((itemTotal / 2).toFixed(2));
                          if (!isItemPreOrder) {
                            setIsItemPreOrder(true);
                            setWorkStatus('Pre-Order');
                          }
                        }}
                        className="text-[9px] font-black px-2 py-1 rounded-lg bg-amber-100 border border-amber-300 text-amber-800 hover:bg-amber-200 cursor-pointer"
                      >
                        50% Deposit
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const itemTotal = (parseFloat(itemAmount) || 0) * (parseInt(itemQuantity) || 1);
                          setItemAdvanceMoney(itemTotal.toFixed(2));
                          if (!isItemPreOrder) {
                            setIsItemPreOrder(true);
                            setWorkStatus('Pre-Order');
                          }
                        }}
                        className="text-[9px] font-black px-2 py-1 rounded-lg bg-emerald-100 border border-emerald-300 text-emerald-800 hover:bg-emerald-200 cursor-pointer"
                      >
                        Full Advance
                      </button>
                      {[20, 50, 100].map(val => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => {
                            setItemAdvanceMoney(val.toString());
                            if (!isItemPreOrder) {
                              setIsItemPreOrder(true);
                              setWorkStatus('Pre-Order');
                            }
                          }}
                          className="text-[9px] font-black px-2 py-1 rounded-lg bg-white border border-purple-200 text-purple-700 hover:bg-purple-50 cursor-pointer"
                        >
                          +${val}
                        </button>
                      ))}
                    </div>

                    {((parseFloat(itemAmount) || 0) > 0) && (
                      <div className="text-[10px] font-black text-slate-600 flex items-center gap-2 font-mono bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                        <span>Total: ${((parseFloat(itemAmount) || 0) * (parseInt(itemQuantity) || 1)).toFixed(2)}</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-emerald-600">Advance: ${(parseFloat(itemAdvanceMoney) || 0).toFixed(2)}</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-rose-600">Due: ${Math.max(0, ((parseFloat(itemAmount) || 0) * (parseInt(itemQuantity) || 1)) - (parseFloat(itemAdvanceMoney) || 0)).toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap sm:flex-nowrap gap-3">
                  <select
                    value={itemCategory}
                    onChange={(e) => setItemCategory(e.target.value as Category)}
                    className="glass-input h-16 flex-1 pr-8 text-base font-black appearance-none border-slate-200 bg-white min-w-[140px]"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat} className="bg-white">{cat}</option>
                    ))}
                  </select>

                  {itemCategory === 'Custom Name' && (
                    <input
                      type="text"
                      value={customItemName}
                      onChange={(e) => setCustomItemName(e.target.value)}
                      placeholder="Enter item name..."
                      className="glass-input h-16 flex-1 px-4 text-base font-black border-amber-300 bg-amber-50/50 min-w-[140px]"
                    />
                  )}

                  <div className="relative w-24">
                    <input
                      type="number"
                      value={itemQuantity}
                      onChange={(e) => setItemQuantity(e.target.value)}
                      placeholder="Qty"
                      className="glass-input h-16 w-full px-2 text-base font-black text-center border-slate-200 bg-white"
                    />
                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[9px] font-black text-amber-600 bg-white px-1.5 uppercase tracking-widest leading-none border border-amber-600/10 shadow-xs rounded-full">QTY</span>
                  </div>

                  <div className="relative w-32">
                    <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-rose-400" />
                    <input
                      type="number"
                      step="0.01"
                      value={itemCost}
                      onChange={(e) => setItemCost(e.target.value)}
                      placeholder="Cost"
                      className="glass-input h-16 w-full pl-8 pr-2 text-base font-black border-slate-200 bg-white text-rose-600"
                    />
                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[9px] font-black text-rose-600 bg-white px-1.5 uppercase tracking-widest leading-none border border-rose-600/10 shadow-xs rounded-full">COST</span>
                  </div>

                  <div className="relative w-36">
                    <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500" />
                    <input
                      type="number"
                      step="0.01"
                      value={itemAmount}
                      onChange={(e) => setItemAmount(e.target.value)}
                      placeholder={itemCost ? "Optional" : "Sell Price"}
                      className="glass-input h-16 w-full pl-8 pr-2 text-base font-black border-slate-200 bg-white text-emerald-600"
                    />
                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[9px] font-black text-emerald-600 bg-white px-1.5 uppercase tracking-widest leading-none border border-emerald-600/10 shadow-xs rounded-full">
                      {itemCost && !itemAmount ? 'PRICE (OPTIONAL)' : 'PRICE'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={addItem}
                    className="h-16 px-6 bg-amber-500 hover:bg-amber-400 text-white rounded-[1.25rem] transition-all duration-300 flex items-center justify-center shadow-lg shadow-amber-500/10 active:scale-95 border border-amber-600/20 cursor-pointer"
                    title="Add Item"
                  >
                    <Plus size={28} />
                  </button>
                </div>

                {/* Device Brand, Model, and Quality Grade Picker */}
                <div className="bg-white p-4 rounded-xl border border-slate-200/90 space-y-3.5 shadow-2xs">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Smartphone size={15} className="text-amber-500" />
                      <span>Device Brand & Model Details</span>
                    </label>
                    <span className="text-[10px] font-bold text-slate-400">Model & Quality Options (AQ7, XO7, ORIGINAL)</span>
                  </div>

                  {/* Brand Tabs */}
                  <div className="space-y-1">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Select Brand:</span>
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                      <button
                        type="button"
                        onClick={() => {
                          setDeviceBrand('None');
                          setDeviceModel('');
                        }}
                        className={cn(
                          "px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1 whitespace-nowrap cursor-pointer border",
                          deviceBrand === 'None' || !deviceBrand
                            ? "bg-slate-800 text-white border-slate-900 shadow-sm"
                            : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                        )}
                      >
                        <span>None</span>
                      </button>
                      {DEVICE_BRANDS.map(b => (
                        <button
                          key={b.brand}
                          type="button"
                          onClick={() => setDeviceBrand(b.brand)}
                          className={cn(
                            "px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1 whitespace-nowrap cursor-pointer border",
                            deviceBrand === b.brand
                              ? "bg-amber-500 text-white border-amber-600 shadow-sm"
                              : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                          )}
                        >
                          <span>{b.brand}</span>
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => setDeviceBrand('Other')}
                        className={cn(
                          "px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1 whitespace-nowrap cursor-pointer border",
                          deviceBrand === 'Other'
                            ? "bg-amber-500 text-white border-amber-600 shadow-sm"
                            : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                        )}
                      >
                        <span>Other</span>
                      </button>
                    </div>
                  </div>

                  {/* Model Number & Quality Grade Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-black text-slate-500 block uppercase tracking-wider mb-1">
                        Model Number / Name
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          list="quick-models-list"
                          value={deviceModel}
                          onChange={(e) => setDeviceModel(e.target.value)}
                          placeholder={`Type or select ${deviceBrand} model...`}
                          className="glass-input h-11 w-full px-3 text-xs font-black bg-white border-slate-200 focus:border-amber-500 rounded-xl"
                        />
                        <datalist id="quick-models-list">
                          {currentBrandModels.map(m => (
                            <option key={m} value={m} />
                          ))}
                        </datalist>
                      </div>
                    </div>

                    {/* Quality Grade: None, AQ7, XO7, ORIGINAL, or Custom Manual Input */}
                    <div>
                      <label className="text-[10px] font-black text-slate-500 block uppercase tracking-wider mb-1 flex items-center justify-between">
                        <span>Quality / Grade</span>
                        <span className="text-amber-600 font-black">{deviceQuality || 'None'}</span>
                      </label>
                      <div className="grid grid-cols-4 gap-1 h-9 mb-1.5">
                        <button
                          type="button"
                          onClick={() => setDeviceQuality('')}
                          className={cn(
                            "h-full rounded-xl text-[11px] font-black transition-all flex items-center justify-center border cursor-pointer uppercase tracking-wider",
                            !deviceQuality
                              ? "bg-slate-800 text-white border-slate-900 shadow-xs"
                              : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"
                          )}
                        >
                          None
                        </button>
                        {QUALITY_OPTIONS.map(q => (
                          <button
                            key={q}
                            type="button"
                            onClick={() => setDeviceQuality(q)}
                            className={cn(
                              "h-full rounded-xl text-[11px] font-black transition-all flex items-center justify-center border cursor-pointer uppercase tracking-wider",
                              deviceQuality === q
                                ? "bg-amber-500 text-white border-amber-600 shadow-md shadow-amber-500/20 scale-[1.02]"
                                : "bg-slate-50 text-slate-700 border-slate-200 hover:border-amber-300 hover:bg-amber-50/50"
                            )}
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                      <input
                        type="text"
                        value={deviceQuality}
                        onChange={(e) => setDeviceQuality(e.target.value)}
                        placeholder="Or type manual grade (e.g. OLED, Grade A)..."
                        className="glass-input h-8 w-full px-2.5 text-[11px] font-black bg-white border-slate-200 focus:border-amber-500 rounded-xl"
                      />
                    </div>
                  </div>

                  {/* Quick-Click Model Chips */}
                  {currentBrandModels.length > 0 && (
                    <div className="space-y-1 pt-1 border-t border-slate-100">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                        Popular {deviceBrand} Models (Click to select):
                      </span>
                      <div className="flex items-center gap-1.5 flex-wrap max-h-24 overflow-y-auto p-1.5 bg-slate-50 border border-slate-100 rounded-xl">
                        {currentBrandModels.map(m => (
                          <button
                            key={m}
                            type="button"
                            onClick={() => setDeviceModel(m)}
                            className={cn(
                              "px-2.5 py-1 rounded-lg text-[10px] font-black transition-all border cursor-pointer",
                              deviceModel === m
                                ? "bg-amber-500 text-white border-amber-600 shadow-xs"
                                : "bg-white text-slate-700 border-slate-200 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200"
                            )}
                          >
                            {m}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {(itemCategory === 'Phone sell' || itemCategory === 'Tablet Sell') && (
                  <div className="grid grid-cols-2 gap-2 mt-2 animate-in fade-in slide-in-from-top-1">
                    <input type="text" value={deviceImei} onChange={e => setDeviceImei(e.target.value)} placeholder="IMEI" className="glass-input text-[10px] py-1.5" />
                    <input type="text" value={deviceStorage} onChange={e => setDeviceStorage(e.target.value)} placeholder="Storage" className="glass-input text-[10px] py-1.5" />
                    <input type="text" value={deviceColor} onChange={e => setDeviceColor(e.target.value)} placeholder="Color" className="glass-input text-[10px] py-1.5" />
                    <input type="text" value={deviceWarranty} onChange={e => setDeviceWarranty(e.target.value)} placeholder="Warranty" className="glass-input text-[10px] py-1.5" />
                  </div>
                )}

                {itemCategory === 'Carrier sell' && (
                  <div className="grid grid-cols-2 gap-2 mt-2 animate-in fade-in slide-in-from-top-1">
                    <select value={carrier} onChange={e => setCarrier(e.target.value)} className="glass-input text-[10px] py-1.5 pr-8 appearance-none bg-white border-slate-200">
                      <option value="">Carrier</option>
                      {CARRIERS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <input type="text" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} placeholder="Phone Number" className="glass-input text-[10px] py-1.5" />
                  </div>
                )}
              </div>

              {items.length > 0 && (
                <div className="mt-6 space-y-3">
                  <div className="flex items-center justify-between px-2">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Selected Items ({items.length})</h4>
                    <div className="flex items-center gap-3 text-xs font-black">
                      <span className="text-slate-500">Sell Total: <span className="text-emerald-600 font-mono">${sVal.toFixed(2)}</span></span>
                      {totalCostVal > 0 && (
                        <span className="text-slate-500">Cost: <span className="text-rose-500 font-mono">${totalCostVal.toFixed(2)}</span></span>
                      )}
                    </div>
                  </div>
                  {items.map(item => {
                    const itemTotalSell = item.amount * item.quantity;
                    const itemTotalCost = (item.cost || 0) * item.quantity;
                    const itemProfit = itemTotalSell - itemTotalCost;

                    return (
                      <div key={item.id} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm group">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 font-black text-[10px]">
                            {item.quantity}x
                          </div>
                          <div>
                            <div className="text-sm font-black text-slate-800 uppercase tracking-tight">{item.category}</div>
                            {(item.brand || item.model || item.quality || item.imei) && (
                              <div className="text-[9px] font-black uppercase flex items-center gap-1.5 flex-wrap mt-0.5">
                                {item.brand && <span className="text-slate-600 font-bold">{item.brand}</span>}
                                {item.model && <span className="text-amber-600 font-extrabold">{item.model}</span>}
                                {item.quality && (
                                  <span className="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-md font-black border border-amber-200">
                                    Grade: {item.quality}
                                  </span>
                                )}
                                {item.imei && <span className="text-slate-400">IMEI: {item.imei}</span>}
                              </div>
                            )}
                            <div className="flex items-center gap-2 mt-0.5 text-[10px] font-black">
                              {item.cost !== undefined && item.cost > 0 && (
                                <span className="text-rose-500/80">Cost: ${item.cost.toFixed(2)} ea</span>
                              )}
                              <span className="text-slate-500">Sell: ${item.amount.toFixed(2)} ea</span>
                            </div>

                            {(item.isPreOrder || (item.advance !== undefined && item.advance > 0)) && (
                              <div className="flex items-center gap-1.5 flex-wrap mt-1">
                                {item.isPreOrder && (
                                  <span className="bg-purple-600 text-white text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1 shadow-2xs">
                                    <Package size={10} /> PRE-ORDER
                                  </span>
                                )}
                                {item.advance !== undefined && item.advance > 0 && (
                                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-black px-2 py-0.5 rounded-md font-mono flex items-center gap-1">
                                    <DollarSign size={10} className="text-emerald-600" />
                                    Adv Paid: ${item.advance.toFixed(2)} | Due: ${Math.max(0, itemTotalSell - item.advance).toFixed(2)}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-sm font-black text-slate-900 font-mono">${itemTotalSell.toFixed(2)}</div>
                            {item.cost !== undefined && item.cost > 0 && (
                              <div className="text-[10px] font-black text-emerald-600">
                                Profit: +${itemProfit.toFixed(2)}
                              </div>
                            )}
                          </div>
                          <button type="button" onClick={() => removeItem(item.id)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors cursor-pointer">
                            <X size={18} />
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {/* Summary Footer for Costing & Money Made */}
                  <div className="p-4 bg-slate-900 rounded-2xl text-white flex flex-wrap items-center justify-between gap-3 shadow-md">
                    <div className="flex items-center gap-4">
                      <div>
                        <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">Total Items Cost</span>
                        <span className="text-base font-black font-mono text-rose-400">${totalCostVal.toFixed(2)}</span>
                      </div>
                      <div className="h-8 w-px bg-slate-800" />
                      <div>
                        <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">Gross Sales</span>
                        <span className="text-base font-black font-mono text-emerald-400">${sVal.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="bg-emerald-500/20 border border-emerald-500/40 px-4 py-2 rounded-xl text-right">
                      <span className="text-[9px] font-black uppercase text-emerald-300 tracking-widest block">Net Money Made (Profit)</span>
                      <span className="text-lg font-black font-mono text-emerald-400">
                        +${(sVal - totalCostVal).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

    {currentStep === 'Customer' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500 shadow-sm border border-indigo-100">
                    <UserCircle size={24} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">Customer Profile</h4>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-tight">Optional but recommended for warranty</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCustomer(!showCustomer)}
                  className={cn(
                    "px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all shadow-sm",
                    showCustomer ? "bg-rose-50 text-rose-500 border border-rose-100" : "bg-indigo-50 text-indigo-600 border border-indigo-100"
                  )}
                >
                  {showCustomer ? 'Remove Profile' : 'Add Profile'}
                </button>
              </div>

              {showCustomer ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-slate-50 rounded-3xl border border-slate-100 shadow-sm animate-in zoom-in-95 duration-300">
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 mb-1.5 block uppercase tracking-widest pl-1">Full Name</label>
                      <div className="relative">
                        <User size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                        <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Customer Name" className="glass-input h-12 w-full pl-10 px-4 bg-white border-slate-200" />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 mb-1.5 block uppercase tracking-widest pl-1">Phone Number</label>
                      <div className="relative">
                        <Phone size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                        <input type="tel" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} placeholder="(555) 000-0000" className="glass-input h-12 w-full pl-10 px-4 bg-white border-slate-200" />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 mb-1.5 block uppercase tracking-widest pl-1">Identification</label>
                      <div className="grid grid-cols-2 gap-2">
                        <select value={idType} onChange={e => setIdType(e.target.value)} className="glass-input h-12 px-4 bg-white border-slate-200 text-xs font-black">
                          <option value="">ID Type</option>
                          {ID_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                        <input type="text" value={idNumber} onChange={e => setIdNumber(e.target.value)} placeholder="ID Reference" className="glass-input h-12 px-4 bg-white border-slate-200 text-xs font-black" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 mb-1.5 block uppercase tracking-widest pl-1">Email Address</label>
                      <input type="email" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} placeholder="email@address.com" className="glass-input h-12 w-full px-4 bg-white border-slate-200" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 mb-1.5 block uppercase tracking-widest pl-1">Warranty Period</label>
                      <input type="text" value={warranty} onChange={e => setWarranty(e.target.value)} placeholder="e.g. 6 Months / Lifetime" className="glass-input h-12 w-full px-4 bg-white border-slate-200" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-20 border-2 border-dashed border-slate-100 rounded-3xl flex flex-col items-center justify-center text-slate-300">
                  <p className="text-[10px] font-black uppercase tracking-widest">No customer info attached</p>
                  <p className="text-[9px] font-medium text-slate-300 mt-2">Recommended for high-value transactions</p>
                </div>
              )}
            </div>
          )}

          {currentStep === 'Payment' && (
            <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                      <span>Subtotal</span>
                      <span className="text-slate-800 font-mono">${sVal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                      <span>Discount</span>
                      <div className="flex items-center gap-2">
                        <DollarSign size={10} className="text-rose-500" />
                        <input type="number" value={discount} onChange={e => setDiscount(e.target.value)} className="w-16 text-right bg-transparent border-b border-rose-200 font-black text-rose-600 outline-none" />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5 pt-1">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                            Sales Tax
                          </span>
                          <button 
                            type="button" 
                            onClick={() => setTaxEnabled(!taxEnabled)} 
                            className={cn("text-[8px] font-black px-2 py-0.5 rounded uppercase transition-colors", taxEnabled ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-500")}
                          >
                            {taxEnabled ? 'ON' : 'OFF'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsEditingTax(!isEditingTax)}
                            className="text-[9px] font-bold text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded border border-amber-200/60 transition-all flex items-center gap-1 cursor-pointer"
                            title="Customize Tax Rate %"
                          >
                            <Edit3 size={10} />
                            <span>{(currentTaxRate * 100).toFixed(1)}%</span>
                          </button>
                        </div>
                        <span className="text-[10px] font-black text-indigo-600 font-mono">${taxVal.toFixed(2)}</span>
                      </div>

                      {isEditingTax && (
                        <div className="p-2.5 bg-amber-50/80 border border-amber-200/80 rounded-xl space-y-2 animate-in fade-in duration-200">
                          <div className="flex items-center justify-between gap-2">
                            <label className="text-[9px] font-black uppercase text-amber-900 tracking-wider">Set Custom Tax %</label>
                            <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-amber-300 shadow-2xs">
                              <input
                                type="number"
                                step="0.1"
                                min="0"
                                max="100"
                                value={taxRateInput}
                                onChange={(e) => {
                                  setTaxRateInput(e.target.value);
                                  const val = parseFloat(e.target.value);
                                  if (!isNaN(val) && val >= 0) {
                                    onUpdateTaxRate(val / 100);
                                  }
                                }}
                                className="w-14 text-right font-black text-xs text-slate-800 outline-none"
                              />
                              <span className="text-xs font-black text-amber-700">%</span>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-amber-200/60">
                            <span className="text-[8px] font-bold uppercase text-slate-400">Quick Presets:</span>
                            {[0, 5, 7, 8.1, 8.6, 10].map((preset) => (
                              <button
                                key={preset}
                                type="button"
                                onClick={() => {
                                  setTaxRateInput(preset.toString());
                                  onUpdateTaxRate(preset / 100);
                                }}
                                className={cn(
                                  "text-[8px] font-black px-1.5 py-0.5 rounded transition-all cursor-pointer",
                                  (currentTaxRate * 100).toFixed(1) === preset.toFixed(1)
                                    ? "bg-amber-600 text-white"
                                    : "bg-white border border-amber-200 text-amber-800 hover:bg-amber-100"
                                )}
                              >
                                {preset}%
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
                      <span className="text-sm font-black uppercase tracking-widest text-slate-900">Total Amount</span>
                      <span className="text-3xl font-black text-amber-600 font-mono tracking-tighter">${totalAmount.toFixed(2)}</span>
                    </div>

                    {totalCostVal > 0 && (
                      <div className="pt-3 mt-3 border-t border-slate-200 flex items-center justify-between bg-emerald-50/70 p-3 rounded-xl border border-emerald-100">
                        <div>
                          <span className="text-[9px] font-black uppercase tracking-wider text-slate-500 block">Costing Analysis</span>
                          <span className="text-[10px] font-bold text-rose-500 font-mono">Total Cost: ${totalCostVal.toFixed(2)}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[9px] font-black uppercase tracking-widest text-emerald-700 block">Money Made (Profit)</span>
                          <span className="text-sm font-black text-emerald-600 font-mono">+${totalProfitVal.toFixed(2)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="flex-1 p-6 bg-emerald-50 rounded-2xl border border-emerald-100 flex flex-col justify-center">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-[10px] font-black text-emerald-700/60 uppercase tracking-widest">Amount Paid</label>
                      {isManualAdvance && !isSplit ? (
                        <button
                          type="button"
                          onClick={() => {
                            setIsManualAdvance(false);
                            setAdvance(totalAmount.toFixed(2));
                          }}
                          className="text-[9px] font-black text-emerald-700 bg-emerald-100 hover:bg-emerald-200 px-2.5 py-1 rounded-full transition-all cursor-pointer border border-emerald-200"
                          title="Reset to automatically match full total amount"
                        >
                          Auto Full Paid
                        </button>
                      ) : (
                        <span className="text-[8px] font-extrabold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full uppercase">
                          Auto-Detected
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <DollarSign size={20} className="absolute left-0 top-1/2 -translate-y-1/2 text-emerald-500" />
                      <input 
                        type="number" 
                        step="0.01"
                        value={isSplit ? aVal.toFixed(2) : advance} 
                        onChange={e => {
                          setIsManualAdvance(true);
                          setAdvance(e.target.value);
                        }} 
                        disabled={isSplit}
                        className="w-full bg-transparent text-4xl font-black text-emerald-700 outline-none pl-6 font-mono tracking-tighter" 
                      />
                    </div>
                  </div>
                  <div className="flex-1 p-6 bg-rose-50 rounded-2xl border border-rose-100 flex flex-col justify-center">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-[10px] font-black text-rose-700/60 uppercase tracking-widest">Balance Due</label>
                      {!isSplit && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-[8px] font-bold uppercase text-rose-600/70">Quick Due:</span>
                          <button
                            type="button"
                            onClick={() => {
                              setIsManualAdvance(false);
                              setAdvance(totalAmount.toFixed(2));
                            }}
                            className="text-[8px] font-black px-2 py-0.5 rounded bg-white text-rose-700 border border-rose-200 hover:bg-rose-100 transition-all cursor-pointer shadow-2xs"
                          >
                            $0 Due
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setIsManualAdvance(true);
                              setAdvance((totalAmount / 2).toFixed(2));
                            }}
                            className="text-[8px] font-black px-2 py-0.5 rounded bg-white text-rose-700 border border-rose-200 hover:bg-rose-100 transition-all cursor-pointer shadow-2xs"
                          >
                            50% Deposit
                          </button>
                        </div>
                      )}
                    </div>
                    <p className="text-4xl font-black text-rose-700 font-mono tracking-tighter">${dueAmount.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="space-y-4 pt-6 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Payment Strategy</label>
                  <button type="button" onClick={() => setIsSplit(!isSplit)} className={cn("text-[8px] font-black px-3 py-1.5 rounded-full transition-all", isSplit ? "bg-indigo-600 text-white" : "bg-white border border-slate-200 text-slate-400")}>
                    {isSplit ? 'Split Enabled' : 'Simple Payment'}
                  </button>
                </div>

                {!isSplit ? (
                  <div className="grid grid-cols-3 gap-3">
                    {(['CASH', 'CARD', 'ZELLE'] as const).map(m => {
                      const Icon = m === 'CASH' ? Banknote : m === 'CARD' ? CreditCard : Zap;
                      return (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setPaymentMethod(m)}
                          className={cn(
                            "py-4 rounded-xl flex flex-col items-center gap-2 border-2 transition-all duration-300",
                            paymentMethod === m ? "bg-white border-amber-500 text-amber-600 shadow-xl shadow-amber-500/10" : "bg-slate-50 border-transparent text-slate-400"
                          )}
                        >
                          <Icon size={20} />
                          <span className="text-[10px] font-black uppercase tracking-widest">{m}</span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    {(['cash', 'card', 'zelle'] as const).map(f => (
                      <div key={f}>
                        <label className="text-[8px] font-black text-slate-400 block mb-1 uppercase tracking-widest">{f}</label>
                        <input 
                          type="number" 
                          value={f === 'cash' ? splitCash : f === 'card' ? splitCard : splitZelle} 
                          onChange={e => f === 'cash' ? setSplitCash(e.target.value) : f === 'card' ? setSplitCard(e.target.value) : setSplitZelle(e.target.value)} 
                          className="w-full bg-white border border-slate-200 rounded-lg h-10 px-3 text-xs font-black outline-none focus:border-amber-500" 
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {(paymentMethod === 'CASH' || isSplit) && (
                <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-1">
                  <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100">
                    <label className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1 block">Cash Received</label>
                    <input type="number" value={cashReceived} onChange={e => setCashReceived(e.target.value)} className="w-full bg-white border border-emerald-200 rounded-lg h-12 px-4 text-lg font-black text-emerald-700" placeholder="0.00" />
                  </div>
                  <div className="p-4 bg-white rounded-xl border border-slate-100 flex flex-col justify-center">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Change to Return</label>
                    <p className="text-2xl font-black text-slate-900 font-mono">${changeVal.toFixed(2)}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation Buttons */}
      <div className="mt-12 flex gap-4">
        {currentStepIndex > 0 && (
          <button
            type="button"
            onClick={prevStep}
            className="flex-1 h-16 rounded-2xl border-2 border-slate-100 text-slate-400 font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-slate-50 transition-all active:scale-95"
          >
            <ArrowLeft size={20} />
            Back
          </button>
        )}
        
        {currentStep === 'Payment' ? (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={items.length === 0}
            className={cn(
              "flex-[2] h-16 rounded-2xl font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl",
              items.length === 0 ? "bg-slate-100 text-slate-300 cursor-not-allowed" : "bg-emerald-600 text-white shadow-emerald-600/20 hover:bg-emerald-500"
            )}
          >
            {editingTransaction ? '✓ Update Transaction' : 'Finalize Record'}
          </button>
        ) : (
          <button
            type="button"
            onClick={nextStep}
            disabled={currentStep === 'Items' && items.length === 0}
            className={cn(
              "flex-[2] h-16 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-amber-500/10",
              currentStep === 'Items' && items.length === 0 ? "bg-slate-100 text-slate-300 cursor-not-allowed" : "bg-amber-500 text-white shadow-amber-500/20 hover:bg-amber-400"
            )}
          >
            Continue
            <ArrowRight size={20} />
          </button>
        )}
      </div>

      {/* Item summary footer */}
      {currentStep !== 'Items' && items.length > 0 && (
        <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between animate-in fade-in duration-500">
           <div className="flex -space-x-2">
            {items.slice(0, 3).map((item, i) => (
              <div key={i} className="w-8 h-8 rounded-full bg-indigo-50 border-2 border-white flex items-center justify-center text-[8px] font-black text-indigo-600 uppercase">
                {item.category.charAt(0)}
              </div>
            ))}
            {items.length > 3 && (
              <div className="w-8 h-8 rounded-full bg-slate-50 border-2 border-white flex items-center justify-center text-[8px] font-black text-slate-400">
                +{items.length - 3}
              </div>
            )}
           </div>
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            {items.length} Item{items.length !== 1 ? 's' : ''} in cart — <span className="text-amber-500 font-mono">${sVal.toFixed(2)}</span>
           </p>
        </div>
      )}
      </form>
    </div>
  );
}
