import React, { useState } from 'react';
import { 
  AlertTriangle, 
  ShoppingCart, 
  X, 
  ChevronDown, 
  ChevronUp, 
  Copy, 
  Check, 
  Printer, 
  Plus, 
  Minus, 
  AlertOctagon, 
  FileText,
  Building2,
  DollarSign,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { InventoryItem, Transaction } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface LowStockBannerProps {
  lowStockItems: InventoryItem[];
  onNavigateToInventory: () => void;
  onAddTransaction?: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
  onUpdateInventoryItem?: (item: InventoryItem) => void;
}

export default function LowStockBanner({ 
  lowStockItems, 
  onNavigateToInventory,
  onAddTransaction,
  onUpdateInventoryItem
}: LowStockBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showPurchaseDraftModal, setShowPurchaseDraftModal] = useState(false);

  // Draft state
  const [vendorName, setVendorName] = useState('MobileSentrix / Wholesale');
  const [poNumber, setPoNumber] = useState(`PO-${Math.floor(1000 + Math.random() * 9000)}`);
  const [draftNotes, setDraftNotes] = useState('Urgent restock draft for parts below minimum threshold.');
  
  // Customizable reorder quantities & estimated unit costs for items in draft
  const [draftItems, setDraftItems] = useState<{
    id: string;
    name: string;
    category: string;
    currentQty: number;
    minStock: number;
    reorderQty: number;
    estimatedCost: number;
    brand?: string;
    model?: string;
  }[]>([]);

  const [copiedDraft, setCopiedDraft] = useState(false);
  const [createdExpense, setCreatedExpense] = useState(false);

  // Open modal and prefill items
  const handleOpenDraftModal = () => {
    const itemsForDraft = lowStockItems.map(item => {
      // Default reorder quantity = minStock * 2 - quantity (minimum 1)
      const suggestedQty = Math.max(1, (item.minStock * 2) - item.quantity);
      return {
        id: item.id,
        name: item.name,
        category: item.category,
        currentQty: item.quantity,
        minStock: item.minStock,
        reorderQty: suggestedQty,
        estimatedCost: item.price || 25,
        brand: item.brand,
        model: item.model
      };
    });
    setDraftItems(itemsForDraft);
    setShowPurchaseDraftModal(true);
    setCopiedDraft(false);
    setCreatedExpense(false);
  };

  if (lowStockItems.length === 0) return null;

  if (isDismissed) {
    return (
      <div className="mb-6 flex justify-end">
        <button
          onClick={() => setIsDismissed(false)}
          className="flex items-center gap-2 px-4 py-2 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs font-black uppercase tracking-wider hover:bg-rose-100 transition-all cursor-pointer shadow-sm"
        >
          <AlertTriangle size={14} className="text-rose-600 animate-pulse" />
          <span>{lowStockItems.length} Low Stock Alert{lowStockItems.length > 1 ? 's' : ''}</span>
        </button>
      </div>
    );
  }

  const handleQtyChange = (id: string, delta: number) => {
    setDraftItems(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, reorderQty: Math.max(1, item.reorderQty + delta) };
      }
      return item;
    }));
  };

  const handleCostChange = (id: string, cost: number) => {
    setDraftItems(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, estimatedCost: Math.max(0, cost) };
      }
      return item;
    }));
  };

  const handleRemoveFromDraft = (id: string) => {
    setDraftItems(prev => prev.filter(item => item.id !== id));
  };

  const totalEstimatedCost = draftItems.reduce((sum, item) => sum + (item.reorderQty * item.estimatedCost), 0);

  // Generate plain text PO draft for copying
  const formattedPoText = `PURCHASE ORDER DRAFT (${poNumber})
Supplier: ${vendorName}
Date: ${new Date().toLocaleDateString()}
--------------------------------------------------
${draftItems.map((item, idx) => 
  `${idx + 1}. ${item.name} ${item.model ? `(${item.model})` : ''}
   - Qty: ${item.reorderQty} units @ $${item.estimatedCost.toFixed(2)}/ea = $${(item.reorderQty * item.estimatedCost).toFixed(2)}
   - Current Stock: ${item.currentQty} (Min Threshold: ${item.minStock})`
).join('\n\n')}
--------------------------------------------------
TOTAL ESTIMATED ORDER COST: $${totalEstimatedCost.toFixed(2)}
Notes: ${draftNotes}
`;

  const handleCopyDraft = () => {
    navigator.clipboard.writeText(formattedPoText);
    setCopiedDraft(true);
    setTimeout(() => setCopiedDraft(false), 3000);
  };

  const handleCreatePreOrderExpense = async () => {
    if (!onAddTransaction || draftItems.length === 0) return;
    
    const today = new Date().toISOString().split('T')[0];
    
    const newTx: Omit<Transaction, 'id'> = {
      amount: totalEstimatedCost,
      subTotal: totalEstimatedCost,
      discount: 0,
      tax: 0,
      advance: 0,
      due: totalEstimatedCost,
      type: 'expense',
      category: 'Parts Sell',
      paymentMethod: 'CASH',
      workStatus: 'Pre-Order',
      date: today,
      note: `[Purchase Order Draft #${poNumber}] Supplier: ${vendorName}. Items: ${draftItems.map(i => `${i.name} (x${i.reorderQty})`).join(', ')}`,
      items: draftItems.map(i => ({
        id: `po-item-${Date.now()}-${Math.random()}`,
        category: 'Parts Sell',
        amount: i.reorderQty * i.estimatedCost,
        cost: i.estimatedCost,
        quantity: i.reorderQty,
        brand: i.brand,
        model: i.model
      }))
    };

    await onAddTransaction(newTx);
    setCreatedExpense(true);
  };

  const handlePrintPo = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Purchase Order Draft - ${poNumber}</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; padding: 40px; color: #1e293b; line-height: 1.5; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 20px; }
            h1 { font-size: 24px; margin: 0; color: #0f172a; text-transform: uppercase; }
            .meta { font-size: 14px; color: #64748b; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { text-align: left; padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
            th { background: #f8fafc; font-weight: 700; text-transform: uppercase; font-size: 12px; color: #475569; }
            .total { font-size: 18px; font-weight: 800; text-align: right; padding-top: 20px; }
            .badge { display: inline-block; padding: 2px 8px; background: #fee2e2; color: #991b1b; border-radius: 4px; font-size: 12px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1>PURCHASE DRAFT / REORDER SHEET</h1>
              <div class="meta">PO Ref: <strong>${poNumber}</strong></div>
              <div class="meta">Vendor: <strong>${vendorName}</strong></div>
            </div>
            <div style="text-align: right;">
              <div class="meta">Date: ${new Date().toLocaleDateString()}</div>
              <div class="meta">Status: DRAFT</div>
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Item / Part Description</th>
                <th>Current Qty</th>
                <th>Min Stock</th>
                <th>Reorder Qty</th>
                <th>Est. Unit Cost</th>
                <th>Line Total</th>
              </tr>
            </thead>
            <tbody>
              ${draftItems.map(item => `
                <tr>
                  <td><strong>${item.name}</strong> ${item.model ? `<br><small style="color:#64748b">${item.model}</small>` : ''}</td>
                  <td><span class="badge">${item.currentQty} in stock</span></td>
                  <td>${item.minStock}</td>
                  <td><strong>${item.reorderQty}</strong></td>
                  <td>$${item.estimatedCost.toFixed(2)}</td>
                  <td><strong>$${(item.reorderQty * item.estimatedCost).toFixed(2)}</strong></td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="total">
            TOTAL ESTIMATED REORDER COST: $${totalEstimatedCost.toFixed(2)}
          </div>

          <div style="margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 20px; font-size: 12px; color: #64748b;">
            Notes: ${draftNotes}
          </div>

          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <>
      {/* AUTOMATED DASHBOARD BANNER */}
      <motion.div 
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 overflow-hidden rounded-3xl border border-rose-200 bg-gradient-to-r from-rose-500/10 via-amber-500/10 to-rose-500/5 p-4 sm:p-5 shadow-[0_10px_30px_rgba(244,63,94,0.08)] backdrop-blur-xl relative"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-3 bg-rose-600 text-white rounded-2xl shadow-lg shadow-rose-600/30 shrink-0 mt-0.5 animate-pulse">
              <AlertOctagon size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-rose-600 text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full shadow-xs">
                  Inventory Alert
                </span>
                <h3 className="text-sm sm:text-base font-black text-slate-900 uppercase tracking-tight">
                  {lowStockItems.length} {lowStockItems.length === 1 ? 'Part is' : 'Parts are'} Under Minimum Stock Level
                </h3>
              </div>
              
              <p className="text-xs text-slate-600 font-medium mt-1">
                Restock needed to avoid service delays. Automatically generated reorder draft is ready.
              </p>

              {/* Quick Item Pills Preview */}
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                {lowStockItems.slice(0, 4).map(item => (
                  <span 
                    key={item.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/80 border border-rose-200 rounded-xl text-xs font-bold text-slate-800 shadow-2xs"
                  >
                    <span className="truncate max-w-[140px]">{item.name}</span>
                    <span className="text-[10px] font-black text-rose-600 bg-rose-100 px-1.5 py-0.5 rounded-md">
                      Qty: {item.quantity} / Min: {item.minStock}
                    </span>
                  </span>
                ))}
                {lowStockItems.length > 4 && (
                  <span className="text-xs font-black text-rose-700 bg-rose-100 px-2.5 py-1 rounded-xl">
                    +{lowStockItems.length - 4} more
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action Controls */}
          <div className="flex items-center gap-2 self-end md:self-center shrink-0 flex-wrap">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2.5 rounded-xl bg-white/80 hover:bg-white text-slate-600 border border-slate-200 text-xs font-black uppercase tracking-wider flex items-center gap-1 transition-all"
              title="Expand Low Stock List"
            >
              <span>{isExpanded ? 'Hide Details' : 'View List'}</span>
              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            <button
              onClick={handleOpenDraftModal}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-rose-600/25 transition-all transform active:scale-95 cursor-pointer"
            >
              <ShoppingCart size={16} />
              <span>Reorder / Generate Draft</span>
            </button>

            <button
              onClick={() => setIsDismissed(true)}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white/50 rounded-xl transition-all"
              title="Dismiss banner"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* EXPANDED PART DETAILS DRAWER */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-rose-200/60 overflow-hidden"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {lowStockItems.map(item => (
                  <div 
                    key={item.id}
                    className="p-3 bg-white rounded-2xl border border-rose-200/80 shadow-2xs flex items-center justify-between gap-2"
                  >
                    <div>
                      <h4 className="text-xs font-black text-slate-900 truncate max-w-[180px]">{item.name}</h4>
                      <p className="text-[10px] text-slate-500 font-bold">
                        {item.category} {item.model ? `• ${item.model}` : ''}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[10px] font-black uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">
                          Stock: {item.quantity} (Min: {item.minStock})
                        </span>
                        <span className="text-[10px] font-bold text-slate-500">
                          Est Cost: ${item.price || 0}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={onNavigateToInventory}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all shrink-0"
                      title="Edit Item in Inventory"
                    >
                      <ExternalLink size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* REORDER / PURCHASE DRAFT MODAL */}
      <AnimatePresence>
        {showPurchaseDraftModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl max-w-4xl w-full p-6 sm:p-8 my-8 relative overflow-hidden max-h-[90vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-5 shrink-0">
                <div className="flex items-center gap-3.5">
                  <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-600 border border-amber-500/20">
                    <FileText size={24} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="bg-amber-100 text-amber-800 text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full">
                        Automated Draft
                      </span>
                      <span className="text-xs text-slate-400 font-mono font-bold">{poNumber}</span>
                    </div>
                    <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight mt-0.5">
                      Purchase Order & Restock Draft
                    </h2>
                  </div>
                </div>

                <button
                  onClick={() => setShowPurchaseDraftModal(false)}
                  className="p-2.5 rounded-2xl bg-slate-100 text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-all cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Scrollable Modal Content */}
              <div className="overflow-y-auto pr-1 py-5 space-y-6 flex-1">
                {/* Vendor & PO Config */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                      Supplier / Vendor
                    </label>
                    <input
                      type="text"
                      value={vendorName}
                      onChange={(e) => setVendorName(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-amber-500"
                      placeholder="e.g. MobileSentrix, InjuredGadgets"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                      PO Reference Number
                    </label>
                    <input
                      type="text"
                      value={poNumber}
                      onChange={(e) => setPoNumber(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold font-mono text-slate-800 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                      Order Notes
                    </label>
                    <input
                      type="text"
                      value={draftNotes}
                      onChange={(e) => setDraftNotes(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* Items Table / List */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
                      <span>Low Stock Items Selected for Reorder ({draftItems.length})</span>
                    </h3>
                    <span className="text-xs font-black text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-100">
                      Auto-filled based on Minimum Thresholds
                    </span>
                  </div>

                  {draftItems.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-400 text-xs font-bold">
                      No items in this purchase draft.
                    </div>
                  ) : (
                    <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black text-slate-500 uppercase tracking-wider">
                              <th className="p-3">Part Description</th>
                              <th className="p-3 text-center">Current Stock</th>
                              <th className="p-3 text-center">Min Threshold</th>
                              <th className="p-3 text-center">Reorder Qty</th>
                              <th className="p-3 text-right">Est. Unit Cost</th>
                              <th className="p-3 text-right">Line Total</th>
                              <th className="p-3 text-center">Remove</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {draftItems.map((item) => {
                              const lineTotal = item.reorderQty * item.estimatedCost;
                              return (
                                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                                  <td className="p-3 font-bold text-slate-800">
                                    <div>{item.name}</div>
                                    <div className="text-[10px] text-slate-400 font-normal">
                                      {item.category} {item.model ? `• ${item.model}` : ''}
                                    </div>
                                  </td>
                                  <td className="p-3 text-center">
                                    <span className="px-2 py-0.5 bg-rose-100 text-rose-700 rounded-md font-black text-[11px]">
                                      {item.currentQty}
                                    </span>
                                  </td>
                                  <td className="p-3 text-center text-slate-500 font-bold">
                                    {item.minStock}
                                  </td>
                                  <td className="p-3 text-center">
                                    <div className="inline-flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
                                      <button
                                        type="button"
                                        onClick={() => handleQtyChange(item.id, -1)}
                                        className="w-6 h-6 flex items-center justify-center bg-white rounded-lg text-slate-600 hover:bg-slate-200 font-bold transition-all"
                                      >
                                        <Minus size={12} />
                                      </button>
                                      <span className="w-8 text-center font-black text-slate-900 text-xs">
                                        {item.reorderQty}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => handleQtyChange(item.id, 1)}
                                        className="w-6 h-6 flex items-center justify-center bg-white rounded-lg text-slate-600 hover:bg-slate-200 font-bold transition-all"
                                      >
                                        <Plus size={12} />
                                      </button>
                                    </div>
                                  </td>
                                  <td className="p-3 text-right">
                                    <div className="inline-flex items-center gap-1 justify-end">
                                      <span className="text-slate-400 font-bold">$</span>
                                      <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={item.estimatedCost}
                                        onChange={(e) => handleCostChange(item.id, parseFloat(e.target.value) || 0)}
                                        className="w-20 text-right bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-800 focus:outline-none focus:border-amber-500"
                                      />
                                    </div>
                                  </td>
                                  <td className="p-3 text-right font-black text-slate-900 text-xs">
                                    ${lineTotal.toFixed(2)}
                                  </td>
                                  <td className="p-3 text-center">
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveFromDraft(item.id)}
                                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                    >
                                      <X size={14} />
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {/* Total Cost Banner */}
                      <div className="bg-slate-900 text-white p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <DollarSign size={20} className="text-amber-400" />
                          <span className="text-xs font-black uppercase tracking-wider text-slate-300">
                            Estimated Total Purchase Order Value:
                          </span>
                        </div>
                        <div className="text-xl font-black text-amber-400 tracking-tight">
                          ${totalEstimatedCost.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer Controls */}
              <div className="border-t border-slate-100 pt-5 mt-auto flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleCopyDraft}
                    className="flex-1 sm:flex-initial px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    {copiedDraft ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
                    <span>{copiedDraft ? 'Copied Draft!' : 'Copy Draft Text'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handlePrintPo}
                    className="flex-1 sm:flex-initial px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Printer size={16} />
                    <span>Print PO</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {onAddTransaction && (
                    <button
                      type="button"
                      onClick={handleCreatePreOrderExpense}
                      disabled={createdExpense || draftItems.length === 0}
                      className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        createdExpense
                          ? 'bg-emerald-600 text-white'
                          : 'bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20'
                      }`}
                    >
                      {createdExpense ? <CheckCircle2 size={16} /> : <FileText size={16} />}
                      <span>{createdExpense ? 'Pre-Order Logged!' : 'Log Pre-Order Expense'}</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setShowPurchaseDraftModal(false)}
                    className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
