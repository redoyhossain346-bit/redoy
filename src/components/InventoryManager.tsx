import React, { useState, useEffect } from 'react';
import { Package, Plus, Minus, History, User, AlertTriangle, Search, Filter, ClipboardList, X, RotateCcw } from 'lucide-react';
import { InventoryItem, PartUsage } from '../types';
import { storage } from '../lib/storage';
import { cn, uuid } from '../lib/utils';
import { format } from 'date-fns';

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
  const [searchQuery, setSearchQuery] = useState('');
  
  const [newItem, setNewItem] = useState<Omit<InventoryItem, 'id'>>({
    name: '',
    category: categories[0] || 'Uncategorized',
    quantity: 0,
    price: 0,
    minStock: 2
  });

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCategoryName && !categories.includes(newCategoryName)) {
      onUpdateCategories([...categories, newCategoryName]);
      setNewCategoryName('');
    }
  };

  const handleDeleteCategory = (cat: string) => {
    onUpdateCategories(categories.filter(c => c !== cat));
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
      alert("Insufficient stock!");
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
      alert("Select a valid part!");
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

  return (
    <div className="glass-card p-6 flex flex-col h-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400">
            <Package size={20} />
          </div>
          <div>
            <h2 className="text-sm font-black text-white">Inventory & Parts</h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Stock Control System</p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button 
            onClick={() => setIsManagingCategories(true)}
            className="flex-1 sm:flex-none px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-[10px] font-bold transition-all border border-white/5 flex items-center justify-center gap-2"
          >
            <Filter size={14} />
            Categories
          </button>
          <button 
            onClick={() => setIsReturningPart(true)}
            className="flex-1 sm:flex-none px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-[10px] font-bold transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
          >
            <RotateCcw size={14} />
            Return Part
          </button>
          <button 
            onClick={() => setIsTakingPart(true)}
            className="flex-1 sm:flex-none px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-[10px] font-bold transition-all shadow-lg shadow-rose-500/20 flex items-center justify-center gap-2"
          >
            <Minus size={14} />
            Take Part
          </button>
          <button 
            onClick={() => setIsAddingItem(true)}
            className="flex-1 sm:flex-none px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-[10px] font-bold transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
          >
            <Plus size={14} />
            Add Stock
          </button>
        </div>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
        <input 
          type="text"
          placeholder="Search items, categories, or IDs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-900/50 border border-white/5 rounded-xl py-2 pl-10 pr-10 text-[10px] font-bold text-white focus:outline-none focus:border-indigo-500/30 transition-all"
        />
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors p-1"
          >
            <X size={14} />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-hidden">
        {/* Inventory List */}
        <div className="flex flex-col overflow-hidden">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
            <ClipboardList size={12} /> Current Stock
          </h3>
          <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
            {filteredInventory.length === 0 ? (
              <div className="py-10 text-center border border-dashed border-white/5 rounded-2xl">
                <p className="text-[10px] font-bold text-slate-600">No items found</p>
              </div>
            ) : (
              filteredInventory.map(item => (
                <div key={item.id} className="p-3 bg-slate-800/40 border border-white/5 rounded-xl flex justify-between items-center group hover:bg-slate-800/60 transition-all">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-white">{item.name}</span>
                    <span className="text-[9px] font-bold text-slate-500 uppercase">{item.category}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className={cn(
                        "text-xs font-black",
                        item.quantity <= item.minStock ? "text-rose-500 animate-pulse" : "text-emerald-400"
                      )}>
                        {item.quantity} units
                      </div>
                      <div className="text-[9px] font-bold text-slate-600">Min: {item.minStock}</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Usage History */}
        <div className="flex flex-col overflow-hidden">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
            <History size={12} /> Withdrawal Logs
          </h3>
          <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
            {usageHistory.length === 0 ? (
              <div className="py-10 text-center border border-dashed border-white/5 rounded-2xl">
                <p className="text-[10px] font-bold text-slate-600">No history yet</p>
              </div>
            ) : (
              usageHistory.map(log => {
                const part = inventory.find(i => i.id === log.partId);
                return (
                  <div key={log.id} className="p-3 bg-slate-900/40 border border-white/5 rounded-xl flex justify-between items-center text-[10px]">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400">
                        <User size={14} />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-white">{log.takenBy || 'Unknown Operator'}</span>
                        <span className="text-[9px] text-slate-500">{part?.name || 'Deleted Part'}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={cn(
                        "font-black",
                        log.reason === 'return' ? "text-emerald-400" : "text-rose-400"
                      )}>
                        {log.reason === 'return' ? '+' : '-'}{log.quantity}
                      </div>
                      <div className="text-[9px] text-slate-600">{format(new Date(log.timestamp), 'dd MMM, HH:mm')}</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {isAddingItem && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-sm glass-card p-6 border-indigo-500/30">
            <h2 className="text-sm font-black text-white mb-6 uppercase tracking-widest">Register New Stock</h2>
            <form onSubmit={handleAddItem} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-500 uppercase">Part Name</label>
                <input 
                  required
                  value={newItem.name}
                  onChange={e => setNewItem({...newItem, name: e.target.value})}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-white"
                  placeholder="e.g iPhone 13 Pro Screen"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-500 uppercase">Category</label>
                <select 
                  required
                  value={newItem.category}
                  onChange={e => setNewItem({...newItem, category: e.target.value})}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-white appearance-none"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                  {categories.length === 0 && <option value="Uncategorized">Uncategorized</option>}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-500 uppercase">Quantity</label>
                  <input 
                    type="number"
                    required
                    value={newItem.quantity}
                    onChange={e => setNewItem({...newItem, quantity: parseInt(e.target.value)})}
                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-500 uppercase">Min Alert</label>
                  <input 
                    type="number"
                    required
                    value={newItem.minStock}
                    onChange={e => setNewItem({...newItem, minStock: parseInt(e.target.value)})}
                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-white"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <button type="button" onClick={() => setIsAddingItem(false)} className="flex-1 py-3 text-[10px] font-bold text-slate-500 uppercase">Cancel</button>
                <button type="submit" className="flex-1 bg-indigo-500 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest py-3">Confirm Add</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isTakingPart && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-sm glass-card p-6 border-rose-500/30">
            <h2 className="text-sm font-black text-white mb-6 uppercase tracking-widest">Withdrawal Authorization</h2>
            <form onSubmit={handleTakePart} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-500 uppercase">Select Part</label>
                <select 
                  required
                  value={newUsage.partId}
                  onChange={e => setNewUsage({...newUsage, partId: e.target.value})}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-white appearance-none"
                >
                  <option value="">Choose item...</option>
                  {inventory.map(i => (
                    <option key={i.id} value={i.id} disabled={i.quantity <= 0}>
                      {i.name} ({i.quantity} left)
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-500 uppercase">Quantity</label>
                  <input 
                    type="number"
                    min="1"
                    required
                    value={newUsage.quantity}
                    onChange={e => setNewUsage({...newUsage, quantity: parseInt(e.target.value)})}
                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-500 uppercase">Operator</label>
                  <input 
                    required
                    value={newUsage.takenBy}
                    onChange={e => setNewUsage({...newUsage, takenBy: e.target.value})}
                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-white"
                    placeholder="Name"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <button type="button" onClick={() => setIsTakingPart(false)} className="flex-1 py-3 text-[10px] font-bold text-slate-500 uppercase">Back</button>
                <button type="submit" className="flex-1 bg-rose-500 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest py-3">Log Withdrawal</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isReturningPart && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-sm glass-card p-6 border-emerald-500/30">
            <h2 className="text-sm font-black text-white mb-6 uppercase tracking-widest">Part Return Authorization</h2>
            <form onSubmit={handleReturnPart} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-500 uppercase">Select Part</label>
                <select 
                  required
                  value={newUsage.partId}
                  onChange={e => setNewUsage({...newUsage, partId: e.target.value})}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-white appearance-none"
                >
                  <option value="">Choose item...</option>
                  {inventory.map(i => (
                    <option key={i.id} value={i.id}>
                      {i.name} ({i.quantity} in stock)
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-500 uppercase">Quantity To Return</label>
                  <input 
                    type="number"
                    min="1"
                    required
                    value={newUsage.quantity}
                    onChange={e => setNewUsage({...newUsage, quantity: parseInt(e.target.value)})}
                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-500 uppercase">Return By</label>
                  <input 
                    required
                    value={newUsage.takenBy}
                    onChange={e => setNewUsage({...newUsage, takenBy: e.target.value})}
                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-white"
                    placeholder="Name"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <button type="button" onClick={() => setIsReturningPart(false)} className="flex-1 py-3 text-[10px] font-bold text-slate-500 uppercase">Back</button>
                <button type="submit" className="flex-1 bg-emerald-500 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest py-3">Confirm Return</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isManagingCategories && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-sm glass-card p-6 border-indigo-500/30">
            <h2 className="text-sm font-black text-white mb-6 uppercase tracking-widest">Manage Categories</h2>
            
            <form onSubmit={handleAddCategory} className="mb-6 flex gap-2">
              <input 
                required
                value={newCategoryName}
                onChange={e => setNewCategoryName(e.target.value)}
                className="flex-1 bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2 text-xs font-bold text-white"
                placeholder="New category..."
              />
              <button type="submit" className="p-2 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-colors">
                <Plus size={20} />
              </button>
            </form>

            <div className="max-h-60 overflow-y-auto mb-6 space-y-2 pr-2 custom-scrollbar">
              {categories.map(cat => (
                <div key={cat} className="flex justify-between items-center p-3 bg-slate-800/40 rounded-xl border border-white/5">
                  <span className="text-xs font-bold text-white">{cat}</span>
                  <button 
                    onClick={() => handleDeleteCategory(cat)}
                    className="p-1.5 text-slate-500 hover:text-rose-500 transition-colors"
                  >
                    <Minus size={16} />
                  </button>
                </div>
              ))}
              {categories.length === 0 && (
                <p className="text-[10px] font-bold text-slate-600 text-center py-4 italic">No custom categories yet</p>
              )}
            </div>

            <button 
              onClick={() => setIsManagingCategories(false)} 
              className="w-full py-3 bg-slate-800 text-slate-300 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
