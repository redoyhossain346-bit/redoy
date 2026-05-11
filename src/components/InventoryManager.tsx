import React, { useState, useEffect } from 'react';
import { Package, Plus, Minus, History, User, AlertTriangle, Search, Filter, ClipboardList, X, RotateCcw, Edit2, Trash2, Check, AlertCircle } from 'lucide-react';
import { InventoryItem, PartUsage } from '../types';
import { cn, uuid } from '../lib/utils';
import { format } from 'date-fns';
import { AnimatePresence, motion } from 'motion/react';

interface InventoryManagerProps {
  inventory: InventoryItem[];
  usageHistory: PartUsage[];
  categories: string[];
  onUpdateInventory: (inventory: InventoryItem[]) => void;
  onUpdateUsage: (usageHistory: PartUsage[]) => void;
  onUpdateCategories: (categories: string[]) => void;
}

export default function InventoryManager({ 
  inventory, 
  usageHistory, 
  categories,
  onUpdateInventory, 
  onUpdateUsage,
  onUpdateCategories
}: InventoryManagerProps) {
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [isTakingPart, setIsTakingPart] = useState(false);
  const [isReturningPart, setIsReturningPart] = useState(false);
  const [isManagingCategories, setIsManagingCategories] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editCategoryName, setEditCategoryName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const [newItem, setNewItem] = useState<Omit<InventoryItem, 'id'>>({
    name: '',
    category: categories[0] || 'Uncategorized',
    quantity: 0,
    price: 0,
    minStock: 2
  });

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = newCategoryName.trim();
    if (!trimmedName) return;

    if (categories.some(cat => cat.toLowerCase() === trimmedName.toLowerCase())) {
      setNotification({ message: 'Category already exists!', type: 'error' });
      return;
    }

    onUpdateCategories([...categories, trimmedName]);
    setNewCategoryName('');
    setNotification({ message: 'Category added successfully!', type: 'success' });
  };

  const handleDeleteCategory = (cat: string) => {
    // Check if any items are using this category
    const inUse = inventory.some(item => item.category === cat);
    if (inUse) {
      setNotification({ message: 'Cannot delete: Category is in use by assets!', type: 'error' });
      return;
    }

    onUpdateCategories(categories.filter(c => c !== cat));
    setNotification({ message: 'Category removed!', type: 'success' });
  };

  const handleStartEdit = (cat: string) => {
    setEditingCategory(cat);
    setEditCategoryName(cat);
  };

  const handleSaveEdit = (oldName: string) => {
    const trimmedNewName = editCategoryName.trim();
    if (!trimmedNewName || trimmedNewName === oldName) {
      setEditingCategory(null);
      return;
    }

    if (categories.some(cat => cat !== oldName && cat.toLowerCase() === trimmedNewName.toLowerCase())) {
      setNotification({ message: 'Target category name already exists!', type: 'error' });
      return;
    }

    // Update categories list
    const updatedCategories = categories.map(cat => cat === oldName ? trimmedNewName : cat);
    onUpdateCategories(updatedCategories);

    // Update all inventory items using this category
    const updatedInventory = inventory.map(item => 
      item.category === oldName ? { ...item, category: trimmedNewName } : item
    );
    onUpdateInventory(updatedInventory);

    setEditingCategory(null);
    setNotification({ message: 'Category updated!', type: 'success' });
  };

  const [newUsage, setNewUsage] = useState<Omit<PartUsage, 'id' | 'timestamp'>>({
    partId: '',
    quantity: 1,
    takenBy: '',
    reason: 'repair',
  });

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    const item: InventoryItem = {
      ...newItem,
      id: uuid()
    };
    onUpdateInventory([...inventory, item]);
    setIsAddingItem(false);
    setNewItem({ name: '', category: categories[0] || 'Uncategorized', quantity: 0, price: 0, minStock: 2 });
  };

  const handleTakePart = (e: React.FormEvent) => {
    e.preventDefault();
    const part = inventory.find(i => i.id === newUsage.partId);
    if (!part || part.quantity < newUsage.quantity) {
      setNotification({ message: 'Insufficient Asset Stock!', type: 'error' });
      return;
    }

    const usage: PartUsage = {
      ...newUsage,
      id: uuid(),
      timestamp: new Date().toISOString()
    };

    // Update Inventory
    const updatedInventory = inventory.map(i => 
      i.id === newUsage.partId ? { ...i, quantity: i.quantity - newUsage.quantity } : i
    );
    
    // Update History
    const updatedHistory = [usage, ...usageHistory];
    
    onUpdateInventory(updatedInventory);
    onUpdateUsage(updatedHistory);
    
    setIsTakingPart(false);
    setNewUsage({ partId: '', quantity: 1, takenBy: '', reason: 'repair' });
  };

  const handleReturnPart = (e: React.FormEvent) => {
    e.preventDefault();
    const part = inventory.find(i => i.id === newUsage.partId);
    if (!part) {
      setNotification({ message: 'Select a valid Registry Asset!', type: 'error' });
      return;
    }

    const usage: PartUsage = {
      ...newUsage,
      reason: 'return',
      id: uuid(),
      timestamp: new Date().toISOString()
    };

    // Update Inventory
    const updatedInventory = inventory.map(i => 
      i.id === newUsage.partId ? { ...i, quantity: i.quantity + newUsage.quantity } : i
    );
    
    // Update History
    const updatedHistory = [usage, ...usageHistory];
    
    onUpdateInventory(updatedInventory);
    onUpdateUsage(updatedHistory);
    
    setIsReturningPart(false);
    setNewUsage({ partId: '', quantity: 1, takenBy: '', reason: 'repair' });
  };

  const filteredInventory = inventory.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleSelectItem = (id: string) => {
    setSelectedItemIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedItemIds.length === filteredInventory.length) {
      setSelectedItemIds([]);
    } else {
      setSelectedItemIds(filteredInventory.map(item => item.id));
    }
  };

  const handleBulkDelete = () => {
    const updatedInventory = inventory.filter(item => !selectedItemIds.includes(item.id));
    onUpdateInventory(updatedInventory);
    setSelectedItemIds([]);
    setShowBulkDeleteConfirm(false);
    setNotification({ message: `Purged ${selectedItemIds.length} assets from registry`, type: 'success' });
  };

  return (
    <div className="glass-card p-10 flex flex-col h-full bg-white border-slate-200 shadow-sm">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-amber-500/5 rounded-2xl text-amber-600 border border-amber-500/10 shadow-sm">
            <Package size={28} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase">Inventory Control</h2>
            <p className="text-[10px] text-amber-600 font-black uppercase tracking-[0.3em]">Master Asset Registry</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {selectedItemIds.length > 0 && (
            <motion.button
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={() => setShowBulkDeleteConfirm(true)}
              className="flex-1 sm:flex-none px-6 py-3 bg-rose-50 text-rose-600 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-rose-200 flex items-center justify-center gap-3 shadow-sm hover:bg-rose-100"
            >
              <Trash2 size={16} />
              Purge ({selectedItemIds.length})
            </motion.button>
          )}
          <button 
            onClick={() => setIsManagingCategories(true)}
            className="flex-1 sm:flex-none px-6 py-3 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-700 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-slate-200 flex items-center justify-center gap-3 shadow-sm"
          >
            <Filter size={16} />
            Categories
          </button>
          <button 
            onClick={() => setIsReturningPart(true)}
            className="flex-1 sm:flex-none px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-[0_5px_15px_rgba(5,150,105,0.2)] flex items-center justify-center gap-3"
          >
            <RotateCcw size={16} />
            Return
          </button>
          <button 
            onClick={() => setIsTakingPart(true)}
            className="flex-1 sm:flex-none px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-[0_5px_15px_rgba(225,29,72,0.2)] flex items-center justify-center gap-3"
          >
            <Minus size={16} />
            Withdraw
          </button>
          <button 
            onClick={() => setIsAddingItem(true)}
            className="flex-1 sm:flex-none px-6 py-3 bg-amber-500 hover:bg-amber-400 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-[0_5px_15px_rgba(245,158,11,0.2)] flex items-center justify-center gap-3"
          >
            <Plus size={16} />
            Supply
          </button>
        </div>
      </div>

      <div className="relative mb-8">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-amber-500" size={18} />
        <input 
          type="text"
          placeholder="SEARCH ASSETS BY NAME, CATEGORY OR SERIAL..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-14 pr-10 text-[11px] font-black text-slate-900 focus:outline-none focus:border-amber-500/40 transition-all uppercase tracking-widest shadow-sm placeholder:text-slate-400"
        />
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery('')}
            className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
          >
            <X size={18} />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 overflow-hidden">
        {/* Inventory List */}
        <div className="flex flex-col overflow-hidden">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3">
              <ClipboardList size={14} className="text-amber-500" /> Active Stock Levels
            </h3>
            {filteredInventory.length > 0 && (
              <label className="flex items-center gap-2 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={selectedItemIds.length === filteredInventory.length && filteredInventory.length > 0} 
                  onChange={toggleSelectAll}
                  className="w-4 h-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500/20 transition-all cursor-pointer"
                />
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest group-hover:text-slate-600 transition-colors">Select All</span>
              </label>
            )}
          </div>
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
            {filteredInventory.length === 0 ? (
              <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-3xl">
                <p className="text-[11px] font-black text-slate-300 uppercase tracking-widest">No matching assets</p>
              </div>
            ) : (
              filteredInventory.map(item => (
                <div key={item.id} className={cn(
                  "p-5 bg-slate-50 border border-slate-200 rounded-2xl flex justify-between items-center group hover:bg-white transition-all duration-300 shadow-sm",
                  selectedItemIds.includes(item.id) ? "border-amber-500/40 bg-amber-500/5 ring-1 ring-amber-500/10" : "hover:border-amber-500/20"
                )}>
                  <div className="flex items-center gap-4">
                    <input 
                      type="checkbox" 
                      checked={selectedItemIds.includes(item.id)}
                      onChange={() => toggleSelectItem(item.id)}
                      className="w-4 h-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500/20 transition-all cursor-pointer"
                    />
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-black text-slate-800 uppercase tracking-tight">{item.name}</span>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.category}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className={cn(
                        "text-base font-black tracking-tight",
                        item.quantity <= item.minStock ? "text-rose-500 animate-pulse" : "text-emerald-600"
                      )}>
                        {item.quantity} <span className="text-[10px] font-black uppercase text-slate-400 ml-1">UNITS</span>
                      </div>
                      <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Threshold: {item.minStock}</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Usage History */}
        <div className="flex flex-col overflow-hidden">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 flex items-center gap-3 border-b border-slate-100 pb-3">
            <History size={14} className="text-amber-500" /> Movement Manifest
          </h3>
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
            {usageHistory.length === 0 ? (
              <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-3xl">
                <p className="text-[11px] font-black text-slate-300 uppercase tracking-widest">Archive empty</p>
              </div>
            ) : (
              usageHistory.map(log => {
                const part = inventory.find(i => i.id === log.partId);
                return (
                  <div key={log.id} className="p-5 bg-slate-50 border border-slate-200 rounded-2xl flex justify-between items-center group hover:bg-white transition-all duration-300 shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-amber-500/5 flex items-center justify-center text-amber-600 border border-amber-500/10">
                        <User size={20} />
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[11px] font-black text-slate-800 uppercase tracking-tight">{log.takenBy || 'GUEST OPERATOR'}</span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{part?.name || 'TERMINATED ASSET'}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={cn(
                        "text-lg font-black tracking-tighter",
                        log.reason === 'return' ? "text-emerald-600" : "text-rose-600"
                      )}>
                        {log.reason === 'return' ? '+' : '-'}{log.quantity}
                      </div>
                      <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{format(new Date(log.timestamp), 'dd MMM • HH:mm')}</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>      {/* Modals & Notifications */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className={cn(
              "fixed top-10 left-1/2 z-[200] px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center gap-3 shadow-2xl border",
              notification.type === 'success' ? "bg-emerald-600 text-white border-emerald-500" : "bg-rose-600 text-white border-rose-500"
            )}
          >
            {notification.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showBulkDeleteConfirm && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md"
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-sm glass-card p-10 border-rose-200 bg-white shadow-2xl text-center"
          >
            <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={40} />
            </div>
            <h2 className="text-xl font-black text-slate-900 mb-2 uppercase tracking-tighter">Confirm Mass Purge</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed mb-8">
              You are about to delete <span className="text-rose-600">{selectedItemIds.length} assets</span> from the central registry. This action cannot be reversed.
            </p>
            
            <div className="flex gap-4">
              <button 
                onClick={() => setShowBulkDeleteConfirm(false)}
                className="flex-1 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleBulkDelete}
                className="flex-[1.5] bg-rose-600 text-white shadow-md rounded-2xl text-[10px] font-black uppercase tracking-widest py-4 transition-all active:scale-95 shadow-rose-200"
              >
                Confirm Purge
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {isAddingItem && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm glass-card p-10 border-slate-200 bg-white shadow-2xl"
            >
              <h2 className="text-xl font-black text-slate-900 mb-8 uppercase tracking-tighter premium-gradient-text">Register New Asset</h2>
            <form onSubmit={handleAddItem} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Resource Label</label>
                <input 
                  required
                  value={newItem.name}
                  onChange={e => setNewItem({...newItem, name: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-black text-slate-900 focus:outline-none focus:border-amber-500/40 uppercase tracking-widest placeholder:text-slate-300 shadow-sm"
                  placeholder="E.G IPHONE 15 PANEL"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Security Classification</label>
                <div className="relative">
                  <select 
                    required
                    value={newItem.category}
                    onChange={e => setNewItem({...newItem, category: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-black text-slate-900 appearance-none uppercase tracking-widest cursor-pointer shadow-sm"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat} className="bg-white">{cat.toUpperCase()}</option>
                    ))}
                    {categories.length === 0 && <option value="Uncategorized" className="bg-white">UNCATEGORIZED</option>}
                  </select>
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-amber-500">
                    <Filter size={18} />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Quantity</label>
                  <input 
                    type="number"
                    required
                    value={newItem.quantity}
                    onChange={e => setNewItem({...newItem, quantity: parseInt(e.target.value) || 0})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-black text-slate-900 focus:outline-none focus:border-amber-500/40 shadow-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Unit Cost</label>
                  <input 
                    type="number"
                    required
                    step="0.01"
                    value={newItem.price}
                    onChange={e => setNewItem({...newItem, price: parseFloat(e.target.value) || 0})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-black text-slate-900 focus:outline-none focus:border-amber-500/40 shadow-sm"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Min Threshold</label>
                <input 
                  type="number"
                  required
                  value={newItem.minStock}
                  onChange={e => setNewItem({...newItem, minStock: parseInt(e.target.value) || 0})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-black text-slate-900 focus:outline-none focus:border-amber-500/40 shadow-sm"
                />
              </div>
              <div className="flex gap-4 pt-6">
                <button type="button" onClick={() => setIsAddingItem(false)} className="flex-1 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors">Aborted</button>
                <button type="submit" className="flex-1 bg-amber-500 text-white shadow-md rounded-2xl text-[10px] font-black uppercase tracking-widest py-4 active:scale-95 transition-all">Execute Registration</button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      {isTakingPart && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md"
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-sm glass-card p-10 border-rose-200 bg-white shadow-2xl"
          >
            <h2 className="text-xl font-black text-rose-600 mb-8 uppercase tracking-tighter">Withdrawal Log</h2>
            <form onSubmit={handleTakePart} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Security Registry</label>
                <div className="relative">
                  <select 
                    required
                    value={newUsage.partId}
                    onChange={e => setNewUsage({...newUsage, partId: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-black text-slate-900 appearance-none uppercase tracking-widest cursor-pointer shadow-sm"
                  >
                    <option value="" className="bg-white">SELECT ASSET...</option>
                    {inventory.map(i => (
                      <option key={i.id} value={i.id} disabled={i.quantity <= 0} className="bg-white">
                        {i.name.toUpperCase()} [{i.quantity} UNITS]
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-rose-500">
                    <Package size={18} />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Withdrawal Qty</label>
                  <input 
                    type="number"
                    min="1"
                    required
                    value={newUsage.quantity}
                    onChange={e => setNewUsage({...newUsage, quantity: parseInt(e.target.value)})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-black text-slate-900 focus:outline-none focus:border-rose-500/40 shadow-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Operator ID</label>
                  <input 
                    required
                    value={newUsage.takenBy}
                    onChange={e => setNewUsage({...newUsage, takenBy: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-black text-slate-900 focus:outline-none focus:border-rose-500/40 uppercase tracking-widest placeholder:text-slate-300 shadow-sm"
                    placeholder="NAME"
                  />
                </div>
              </div>
              <div className="flex gap-4 pt-6">
                <button type="button" onClick={() => setIsTakingPart(false)} className="flex-1 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors">Aborted</button>
                <button type="submit" className="flex-1 bg-rose-600 text-white shadow-md rounded-2xl text-[10px] font-black uppercase tracking-widest py-4 transition-all active:scale-95">Commit Log</button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      {isReturningPart && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md"
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-sm glass-card p-10 border-emerald-200 bg-white shadow-2xl"
          >
            <h2 className="text-xl font-black text-emerald-600 mb-8 uppercase tracking-tighter">Part Return Registry</h2>
            <form onSubmit={handleReturnPart} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Security Registry</label>
                <div className="relative">
                  <select 
                    required
                    value={newUsage.partId}
                    onChange={e => setNewUsage({...newUsage, partId: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-black text-slate-900 appearance-none uppercase tracking-widest cursor-pointer shadow-sm"
                  >
                    <option value="" className="bg-white">SELECT ASSET...</option>
                    {inventory.map(i => (
                      <option key={i.id} value={i.id} className="bg-white">
                        {i.name.toUpperCase()} [{i.quantity} IN STOCK]
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-emerald-500">
                    <RotateCcw size={18} />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Return Qty</label>
                  <input 
                    type="number"
                    min="1"
                    required
                    value={newUsage.quantity}
                    onChange={e => setNewUsage({...newUsage, quantity: parseInt(e.target.value)})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-black text-slate-900 focus:outline-none focus:border-emerald-500/40 shadow-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Registry By</label>
                  <input 
                    required
                    value={newUsage.takenBy}
                    onChange={e => setNewUsage({...newUsage, takenBy: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-black text-slate-900 focus:outline-none focus:border-emerald-500/40 uppercase tracking-widest placeholder:text-slate-300 shadow-sm"
                    placeholder="NAME"
                  />
                </div>
              </div>
              <div className="flex gap-4 pt-6">
                <button type="button" onClick={() => setIsReturningPart(false)} className="flex-1 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors">Aborted</button>
                <button type="submit" className="flex-1 bg-emerald-600 text-white shadow-md rounded-2xl text-[10px] font-black uppercase tracking-widest py-4 transition-all active:scale-95">Commit Registry</button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      {isManagingCategories && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md"
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-sm glass-card p-10 border-slate-200 bg-white shadow-2xl"
          >
            <h2 className="text-xl font-black text-slate-900 mb-8 uppercase tracking-tighter premium-gradient-text">Asset Classifiers</h2>
            
            <form onSubmit={handleAddCategory} className="mb-8 flex gap-3">
              <input 
                required
                value={newCategoryName}
                onChange={e => setNewCategoryName(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-xs font-black text-slate-900 focus:outline-none focus:border-amber-500/40 uppercase tracking-widest placeholder:text-slate-300 shadow-sm"
                placeholder="NEW LABEL..."
              />
              <button type="submit" className="w-14 h-14 bg-amber-500 text-white rounded-2xl hover:bg-amber-400 transition-all flex items-center justify-center shadow-md active:scale-90">
                <Plus size={24} />
              </button>
            </form>

            <div className="max-h-80 overflow-y-auto mb-8 space-y-3 pr-2 custom-scrollbar">
              <AnimatePresence initial={false}>
                {categories.map(cat => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    key={cat} 
                    className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-200 hover:border-amber-500/20 transition-all duration-300 shadow-sm"
                  >
                    {editingCategory === cat ? (
                      <div className="flex-1 flex gap-2">
                        <input 
                          autoFocus
                          value={editCategoryName}
                          onChange={e => setEditCategoryName(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') handleSaveEdit(cat);
                            if (e.key === 'Escape') setEditingCategory(null);
                          }}
                          className="flex-1 bg-white border border-amber-500/40 rounded-xl px-4 py-2 text-xs font-black text-slate-900 uppercase tracking-widest outline-none"
                        />
                        <button 
                          onClick={() => handleSaveEdit(cat)}
                          className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                        >
                          <Check size={18} />
                        </button>
                        <button 
                          onClick={() => setEditingCategory(null)}
                          className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl transition-all"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="text-xs font-black text-slate-800 uppercase tracking-widest truncate max-w-[160px]">{cat}</span>
                        <div className="flex items-center gap-1">
                          <button 
                            onClick={() => handleStartEdit(cat)}
                            className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-500/10 rounded-xl transition-all"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => handleDeleteCategory(cat)}
                            className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
              {categories.length === 0 && (
                <div className="py-12 text-center border-2 border-dashed border-slate-100 rounded-3xl">
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">Global registry empty</p>
                </div>
              )}
            </div>

            <button 
              onClick={() => setIsManagingCategories(false)} 
              className="w-full py-5 bg-slate-50 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-slate-100 hover:text-slate-700 transition-all border border-slate-200 shadow-sm"
            >
              Terminate View
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    </div>
  );
}
