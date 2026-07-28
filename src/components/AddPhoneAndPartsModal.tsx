import React, { useState, useEffect } from 'react';
import { X, Smartphone, Wrench, Plus, Check, Layers, Tag, DollarSign, Package, AlertCircle } from 'lucide-react';
import { InventoryItem } from '../types';
import { PHONE_COLORS_CATALOG } from '../data/phoneColorsCatalog';
import { uuid } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface AddPhoneAndPartsModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: string[];
  onAddMultipleItems: (items: InventoryItem[]) => void;
}

export type QualityGrade = 'Original / OLED' | 'Aftermarket' | 'Refurbished' | 'OEM Original' | 'Premium Copy';

interface SparePartConfig {
  id: string;
  name: string;
  category: string;
  enabled: boolean;
  piecesCount: number;
  quality: QualityGrade;
  unitCost: number;
}

export default function AddPhoneAndPartsModal({
  isOpen,
  onClose,
  categories,
  onAddMultipleItems
}: AddPhoneAndPartsModalProps) {
  // Catalog selection
  const [selectedCatalogId, setSelectedCatalogId] = useState<string>(
    PHONE_COLORS_CATALOG[0]?.id || ''
  );

  // Phone Unit specs
  const [storageSpec, setStorageSpec] = useState('256GB');
  const [colorVariant, setColorVariant] = useState('');
  const [phoneUnits, setPhoneUnits] = useState(1);
  const [phoneCondition, setPhoneCondition] = useState('In Stock (New)');
  const [shelfBin, setShelfBin] = useState('Shelf 1A');
  const [phoneCost, setPhoneCost] = useState<number>(0);

  // Notes
  const [additionalNotes, setAdditionalNotes] = useState('');

  // Spare Parts Stock Config
  const [spareParts, setSpareParts] = useState<SparePartConfig[]>([
    {
      id: 'screen',
      name: 'OLED Display Screen',
      category: 'Screen & Display',
      enabled: true,
      piecesCount: 1,
      quality: 'Original / OLED',
      unitCost: 85
    },
    {
      id: 'battery',
      name: 'Battery Replacement',
      category: 'Batteries',
      enabled: true,
      piecesCount: 2,
      quality: 'OEM Original',
      unitCost: 25
    },
    {
      id: 'port',
      name: 'Charging Port Flex',
      category: 'Flex Cables',
      enabled: true,
      piecesCount: 1,
      quality: 'Aftermarket',
      unitCost: 12
    },
    {
      id: 'backglass',
      name: 'Back Glass Cover',
      category: 'Back Glass & Housing',
      enabled: true,
      piecesCount: 2,
      quality: 'Refurbished',
      unitCost: 18
    },
    {
      id: 'camera',
      name: 'Camera Lens / Module',
      category: 'Cameras',
      enabled: false,
      piecesCount: 1,
      quality: 'Original / OLED',
      unitCost: 35
    },
    {
      id: 'housing',
      name: 'Rear Housing Frame Assembly',
      category: 'Back Glass & Housing',
      enabled: false,
      piecesCount: 1,
      quality: 'Refurbished',
      unitCost: 45
    }
  ]);

  // Update color suggestion when model changes
  const selectedModelObj = PHONE_COLORS_CATALOG.find(m => m.id === selectedCatalogId);

  useEffect(() => {
    if (selectedModelObj) {
      if (selectedModelObj.officialColors && selectedModelObj.officialColors.length > 0) {
        setColorVariant(selectedModelObj.officialColors[0].name);
      }
      if (selectedModelObj.msrp) {
        setPhoneCost(selectedModelObj.msrp);
      }
    }
  }, [selectedCatalogId]);

  if (!isOpen) return null;

  const handleTogglePart = (id: string) => {
    setSpareParts(prev => prev.map(p => p.id === id ? { ...p, enabled: !p.enabled } : p));
  };

  const handlePiecesCountChange = (id: string, count: number) => {
    setSpareParts(prev => prev.map(p => p.id === id ? { ...p, piecesCount: Math.max(1, count) } : p));
  };

  const handleQualityChange = (id: string, quality: QualityGrade) => {
    setSpareParts(prev => prev.map(p => p.id === id ? { ...p, quality } : p));
  };

  const handleCostChange = (id: string, cost: number) => {
    setSpareParts(prev => prev.map(p => p.id === id ? { ...p, unitCost: Math.max(0, cost) } : p));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedModelObj) return;

    const itemsToAdd: InventoryItem[] = [];

    // 1. Add Phone Unit if quantity > 0
    if (phoneUnits > 0) {
      const phoneItemName = `${selectedModelObj.model} (${storageSpec}) - ${colorVariant || 'Standard'}`;
      itemsToAdd.push({
        id: uuid(),
        name: phoneItemName,
        category: categories.find(c => c.toLowerCase().includes('phone') || c.toLowerCase().includes('device')) || 'Smartphones',
        quantity: phoneUnits,
        price: phoneCost || selectedModelObj.msrp || 0,
        minStock: 1,
        brand: selectedModelObj.brand,
        model: selectedModelObj.model,
        color: colorVariant,
        serialNumber: shelfBin ? `SHELF: ${shelfBin} [${phoneCondition}]` : phoneCondition
      });
    }

    // 2. Add initialized Spare Parts
    const activeParts = spareParts.filter(p => p.enabled && p.piecesCount > 0);
    for (const part of activeParts) {
      const partItemName = `${selectedModelObj.model} - ${part.name} [${part.quality}]`;
      itemsToAdd.push({
        id: uuid(),
        name: partItemName,
        category: categories.find(c => c.toLowerCase().includes(part.category.toLowerCase())) || 'Phone Parts',
        quantity: part.piecesCount,
        price: part.unitCost,
        minStock: 2,
        brand: selectedModelObj.brand,
        model: selectedModelObj.model,
        color: colorVariant || undefined,
        serialNumber: `${part.quality} • Location: ${shelfBin || 'General Stock'}`
      });
    }

    onAddMultipleItems(itemsToAdd);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full my-6 overflow-hidden flex flex-col relative"
      >
        {/* TOP HEADER - Purple/Dark Blue Gradient Banner matching image */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 flex items-center justify-between border-b border-slate-800 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/60 via-purple-900/40 to-slate-900 pointer-events-none" />
          
          <div className="flex items-center gap-3.5 relative z-10">
            <div className="p-3 bg-indigo-600/90 text-white rounded-2xl shadow-lg shadow-indigo-600/30 flex items-center justify-center border border-indigo-400/30 shrink-0">
              <Smartphone size={22} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                Add Phone Model & Parts to Store
              </h2>
              <p className="text-xs text-indigo-200 font-medium mt-0.5">
                Track phone inventory units and initialize spare parts with piece quantities
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            type="button"
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all cursor-pointer relative z-10"
          >
            <X size={20} />
          </button>
        </div>

        {/* MODAL FORM BODY */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 overflow-y-auto max-h-[80vh] custom-scrollbar">
          
          {/* CATALOG DROPDOWN */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Select Phone Model from Catalog <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedCatalogId}
              onChange={(e) => setSelectedCatalogId(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all shadow-2xs"
            >
              {PHONE_COLORS_CATALOG.map((item) => (
                <option key={item.id} value={item.id}>
                  [{item.brand}] {item.model} ({item.releaseYear}) - {item.brand} {item.model.split(' ')[0]} Series
                </option>
              ))}
            </select>
          </div>

          {/* PHONE SPECS CARD */}
          <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Storage Spec
                </label>
                <select
                  value={storageSpec}
                  onChange={(e) => setStorageSpec(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-600"
                >
                  <option value="64GB">64GB</option>
                  <option value="128GB">128GB</option>
                  <option value="256GB">256GB</option>
                  <option value="512GB">512GB</option>
                  <option value="1TB">1TB</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Color Variant
                </label>
                <input
                  type="text"
                  value={colorVariant}
                  onChange={(e) => setColorVariant(e.target.value)}
                  placeholder="e.g. Titanium Black"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Phone Units in Store Stock
                </label>
                <input
                  type="number"
                  min="0"
                  value={phoneUnits}
                  onChange={(e) => setPhoneUnits(parseInt(e.target.value) || 0)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-indigo-700 focus:outline-none focus:border-indigo-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Phone Unit Condition
                </label>
                <select
                  value={phoneCondition}
                  onChange={(e) => setPhoneCondition(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-600"
                >
                  <option value="In Stock (New)">In Stock (New)</option>
                  <option value="Used / Pre-Owned">Used / Pre-Owned</option>
                  <option value="Refurbished Grade A">Refurbished Grade A</option>
                  <option value="Open Box">Open Box</option>
                  <option value="For Parts / Repair">For Parts / Repair</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Store Bin / Shelf
                </label>
                <input
                  type="text"
                  value={shelfBin}
                  onChange={(e) => setShelfBin(e.target.value)}
                  placeholder="e.g. Shelf 1A"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-600"
                />
              </div>
            </div>
          </div>

          {/* INITIALIZE SPARE PARTS STOCK CONTAINER - Matching light blue image box */}
          <div className="p-4 sm:p-5 bg-indigo-50/40 rounded-2xl border border-indigo-100 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Wrench size={16} className="text-indigo-600" />
                <h3 className="text-xs font-black uppercase tracking-wider text-indigo-950">
                  INITIALIZE SPARE PARTS STOCK FOR THIS PHONE
                </h3>
              </div>
              <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                Pieces Tracker
              </span>
            </div>

            <p className="text-[11px] text-slate-600">
              Check the spare parts you currently have in stock for this phone model and enter their initial piece counts & quality grade:
            </p>

            {/* SPARE PARTS GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {spareParts.map((part) => (
                <div
                  key={part.id}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    part.enabled
                      ? 'bg-white border-indigo-300 shadow-2xs ring-1 ring-indigo-500/10'
                      : 'bg-white/60 border-slate-200 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={part.enabled}
                        onChange={() => handleTogglePart(part.id)}
                        className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                      <span className="text-xs font-bold text-slate-900">{part.name}</span>
                    </label>

                    {part.enabled && (
                      <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                        {part.piecesCount} {part.piecesCount === 1 ? 'piece' : 'pieces'}
                      </span>
                    )}
                  </div>

                  {part.enabled && (
                    <div className="mt-2 pt-2 border-t border-slate-100 space-y-2">
                      {/* Quality selection (AFTERMARKET / OLED / REFURBISHED / OEM) */}
                      <div>
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                          Quality / Grade
                        </label>
                        <select
                          value={part.quality}
                          onChange={(e) => handleQualityChange(part.id, e.target.value as QualityGrade)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-[11px] font-bold text-slate-800 focus:outline-none focus:border-indigo-600"
                        >
                          <option value="Original / OLED">OLED / Original Screen</option>
                          <option value="Aftermarket">AFTERMARKET</option>
                          <option value="Refurbished">REFURBISHED</option>
                          <option value="OEM Original">OEM Genuine</option>
                          <option value="Premium Copy">Premium Copy</option>
                        </select>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-slate-500 font-bold">Pieces count:</span>
                          <input
                            type="number"
                            min="1"
                            value={part.piecesCount}
                            onChange={(e) => handlePiecesCountChange(part.id, parseInt(e.target.value) || 1)}
                            className="w-16 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-900 text-center focus:outline-none focus:border-indigo-600"
                          />
                        </div>

                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-slate-500 font-bold">Cost: $</span>
                          <input
                            type="number"
                            min="0"
                            value={part.unitCost}
                            onChange={(e) => handleCostChange(part.id, parseFloat(e.target.value) || 0)}
                            className="w-16 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-900 text-right focus:outline-none focus:border-indigo-600"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ADDITIONAL NOTES */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Additional Notes
            </label>
            <textarea
              rows={2}
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              placeholder="e.g. Customer pre-ordered parts, flagship stock item..."
              className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-600"
            />
          </div>

          {/* FOOTER ACTIONS */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all cursor-pointer transform active:scale-95"
            >
              <Plus size={16} />
              <span>Add Phone & Parts to Store Tracker</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
