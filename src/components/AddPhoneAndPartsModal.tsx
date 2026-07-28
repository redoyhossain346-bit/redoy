import React, { useState, useEffect, useMemo } from 'react';
import { X, Smartphone, Wrench, Plus, Search, Filter, Layers, Check, Sparkles, Tag, DollarSign, Package } from 'lucide-react';
import { InventoryItem } from '../types';
import { PHONE_COLORS_CATALOG, PhoneModelCatalogItem, PhoneColorVariant } from '../data/phoneColorsCatalog';
import { DEVICE_BRANDS } from '../data/deviceModels';
import { uuid } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface AddPhoneAndPartsModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: string[];
  onAddMultipleItems: (items: InventoryItem[]) => void;
}

export type QualityGrade = 'Original / OLED' | 'Aftermarket' | 'Refurbished' | 'OEM Original' | 'Premium Copy';

export interface ModelBatchQty {
  phoneUnits: number;
  screen: number;
  battery: number;
  port: number;
  backglass: number;
  camera: number;
  board: number;
}

interface SparePartConfig {
  id: string;
  name: string;
  category: string;
  enabled: boolean;
  piecesCount: number;
  quality: QualityGrade;
  unitCost: number;
}

const DEFAULT_STANDARD_COLORS: PhoneColorVariant[] = [
  { name: 'Space Black / Midnight', hex: '#1E1E24', colorFamily: 'Black / Dark', isHeroFinish: true },
  { name: 'Silver / Starlight', hex: '#E2E2E6', colorFamily: 'White / Silver' },
  { name: 'Pacific Blue', hex: '#3B5998', colorFamily: 'Blue' },
  { name: 'Gold / Rose Gold', hex: '#E8C4A2', colorFamily: 'Gold / Bronze' },
  { name: 'Emerald Green', hex: '#3B7A57', colorFamily: 'Green' }
];

export default function AddPhoneAndPartsModal({
  isOpen,
  onClose,
  categories,
  onAddMultipleItems
}: AddPhoneAndPartsModalProps) {
  // Combine PHONE_COLORS_CATALOG and DEVICE_BRANDS into a comprehensive catalog
  const fullCatalog = useMemo<PhoneModelCatalogItem[]>(() => {
    const catalogMap = new Map<string, PhoneModelCatalogItem>();

    // 1. First populate all items from rich PHONE_COLORS_CATALOG
    PHONE_COLORS_CATALOG.forEach(item => {
      const key = `${item.brand.toLowerCase()}-${item.model.toLowerCase()}`;
      catalogMap.set(key, item);
    });

    // 2. Add any missing models from DEVICE_BRANDS
    DEVICE_BRANDS.forEach(brandGroup => {
      let brandName = brandGroup.brand;
      if (brandName === 'iPhone') brandName = 'Apple';
      if (brandName === 'iPad') brandName = 'Apple';
      if (brandName === 'Apple Watch') brandName = 'Apple';
      if (brandName === 'Samsung Tab') brandName = 'Samsung';
      if (brandName === 'Pixel') brandName = 'Google';

      brandGroup.models.forEach(modelName => {
        const key = `${brandName.toLowerCase()}-${modelName.toLowerCase()}`;
        if (!catalogMap.has(key)) {
          // Estimate release year based on model name
          let year = 2024;
          if (modelName.includes('17') || modelName.includes('S25') || modelName.includes('15 Pro')) year = 2025;
          if (modelName.includes('16') || modelName.includes('S24') || modelName.includes('Fold 6')) year = 2024;
          if (modelName.includes('15') || modelName.includes('S23')) year = 2023;
          if (modelName.includes('14') || modelName.includes('S22')) year = 2022;

          catalogMap.set(key, {
            id: key,
            brand: brandName,
            model: modelName,
            releaseYear: year,
            officialColors: DEFAULT_STANDARD_COLORS,
            msrp: modelName.includes('Pro Max') || modelName.includes('Ultra') || modelName.includes('Fold') ? 1199 : 799
          });
        }
      });
    });

    return Array.from(catalogMap.values()).sort((a, b) => {
      if (a.brand !== b.brand) return a.brand.localeCompare(b.brand);
      return b.releaseYear - a.releaseYear || a.model.localeCompare(b.model);
    });
  }, []);

  // Mode state: 'auto_batch' vs 'single_model'
  const [entryMode, setEntryMode] = useState<'auto_batch' | 'single_model'>('auto_batch');

  // Filter & Search states
  const [selectedBrandFilter, setSelectedBrandFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCustomModel, setIsCustomModel] = useState(false);

  // Batch Model Quantities map: { modelId: { phoneUnits: 0, screen: 0, battery: 0, port: 0, backglass: 0, camera: 0, board: 0 } }
  const [batchQuantities, setBatchQuantities] = useState<Record<string, ModelBatchQty>>({});

  const getModelBatchQty = (modelId: string): ModelBatchQty => {
    return batchQuantities[modelId] || {
      phoneUnits: 0,
      screen: 0,
      battery: 0,
      port: 0,
      backglass: 0,
      camera: 0,
      board: 0
    };
  };

  const updateModelBatchQty = (modelId: string, itemKey: keyof ModelBatchQty, val: number) => {
    setBatchQuantities(prev => {
      const existing = prev[modelId] || {
        phoneUnits: 0,
        screen: 0,
        battery: 0,
        port: 0,
        backglass: 0,
        camera: 0,
        board: 0
      };
      return {
        ...prev,
        [modelId]: {
          ...existing,
          [itemKey]: Math.max(0, val)
        }
      };
    });
  };

  const quickSetAllModelParts = (modelId: string, count: number) => {
    setBatchQuantities(prev => ({
      ...prev,
      [modelId]: {
        phoneUnits: count,
        screen: count,
        battery: count,
        port: count,
        backglass: count,
        camera: count,
        board: count
      }
    }));
  };

  const clearModelBatchQty = (modelId: string) => {
    setBatchQuantities(prev => {
      const next = { ...prev };
      delete next[modelId];
      return next;
    });
  };

  // Selected catalog item for single model view
  const [selectedCatalogId, setSelectedCatalogId] = useState<string>(
    fullCatalog[0]?.id || ''
  );

  // Custom model inputs
  const [customBrand, setCustomBrand] = useState('Apple');
  const [customModel, setCustomModel] = useState('');

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

  // Filtered models list
  const filteredCatalog = useMemo(() => {
    return fullCatalog.filter(item => {
      // Brand filter
      if (selectedBrandFilter !== 'All') {
        if (selectedBrandFilter === 'Apple' && item.brand !== 'Apple') return false;
        if (selectedBrandFilter === 'Samsung' && item.brand !== 'Samsung') return false;
        if (selectedBrandFilter === 'Google' && item.brand !== 'Google') return false;
        if (selectedBrandFilter === 'Motorola' && item.brand !== 'Motorola') return false;
        if (selectedBrandFilter === 'Xiaomi' && item.brand !== 'Xiaomi') return false;
        if (selectedBrandFilter === 'OnePlus' && item.brand !== 'OnePlus') return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchBrand = item.brand.toLowerCase().includes(q);
        const matchModel = item.model.toLowerCase().includes(q);
        const matchColors = item.officialColors.some(c => c.name.toLowerCase().includes(q));
        if (!matchBrand && !matchModel && !matchColors) return false;
      }
      return true;
    });
  }, [fullCatalog, selectedBrandFilter, searchQuery]);

  // Selected model object
  const selectedModelObj = fullCatalog.find(m => m.id === selectedCatalogId) || fullCatalog[0];

  useEffect(() => {
    if (!isCustomModel && selectedModelObj) {
      if (selectedModelObj.officialColors && selectedModelObj.officialColors.length > 0) {
        setColorVariant(selectedModelObj.officialColors[0].name);
      }
      if (selectedModelObj.msrp) {
        setPhoneCost(selectedModelObj.msrp);
      }
    }
  }, [selectedCatalogId, isCustomModel, selectedModelObj]);

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

    const itemsToAdd: InventoryItem[] = [];

    if (entryMode === 'auto_batch') {
      // Automatic model-by-model batch stock entry
      Object.entries(batchQuantities).forEach(([modelId, qtyMapVal]) => {
        const qtyMap = qtyMapVal as ModelBatchQty;
        const catalogItem = fullCatalog.find(m => m.id === modelId);
        if (!catalogItem) return;

        const brand = catalogItem.brand;
        const model = catalogItem.model;
        const heroColor = catalogItem.officialColors.find(c => c.isHeroFinish)?.name || catalogItem.officialColors[0]?.name || 'Standard';
        const msrp = catalogItem.msrp || 799;

        // 1. Phone Units
        if (qtyMap.phoneUnits > 0) {
          itemsToAdd.push({
            id: uuid(),
            name: `${model} (256GB) - ${heroColor}`,
            category: categories.find(c => c.toLowerCase().includes('phone') || c.toLowerCase().includes('device')) || 'Smartphones',
            quantity: qtyMap.phoneUnits,
            price: msrp,
            minStock: 1,
            brand,
            model,
            color: heroColor,
            serialNumber: `SHELF: Auto Batch Stock Intake [In Stock]`
          });
        }

        // 2. OLED Display Screen
        if (qtyMap.screen > 0) {
          itemsToAdd.push({
            id: uuid(),
            name: `${model} - OLED Display Screen [Original / OLED]`,
            category: categories.find(c => c.toLowerCase().includes('screen') || c.toLowerCase().includes('display')) || 'Screen & Display',
            quantity: qtyMap.screen,
            price: 85,
            minStock: 2,
            brand,
            model,
            color: heroColor,
            serialNumber: `Original / OLED • Auto Batch Stock`
          });
        }

        // 3. Battery Replacement
        if (qtyMap.battery > 0) {
          itemsToAdd.push({
            id: uuid(),
            name: `${model} - Battery Replacement [OEM Original]`,
            category: categories.find(c => c.toLowerCase().includes('battery') || c.toLowerCase().includes('batteries')) || 'Batteries',
            quantity: qtyMap.battery,
            price: 25,
            minStock: 2,
            brand,
            model,
            serialNumber: `OEM Original • Auto Batch Stock`
          });
        }

        // 4. Charging Port Flex
        if (qtyMap.port > 0) {
          itemsToAdd.push({
            id: uuid(),
            name: `${model} - Charging Port Flex [Aftermarket]`,
            category: categories.find(c => c.toLowerCase().includes('flex') || c.toLowerCase().includes('port')) || 'Flex Cables',
            quantity: qtyMap.port,
            price: 12,
            minStock: 2,
            brand,
            model,
            serialNumber: `Aftermarket • Auto Batch Stock`
          });
        }

        // 5. Back Glass Cover
        if (qtyMap.backglass > 0) {
          itemsToAdd.push({
            id: uuid(),
            name: `${model} - Back Glass Cover [Refurbished]`,
            category: categories.find(c => c.toLowerCase().includes('back glass') || c.toLowerCase().includes('housing')) || 'Back Glass & Housing',
            quantity: qtyMap.backglass,
            price: 18,
            minStock: 2,
            brand,
            model,
            color: heroColor,
            serialNumber: `Refurbished • Auto Batch Stock`
          });
        }

        // 6. Camera Lens / Module
        if (qtyMap.camera > 0) {
          itemsToAdd.push({
            id: uuid(),
            name: `${model} - Camera Lens / Module [OEM Original]`,
            category: categories.find(c => c.toLowerCase().includes('camera')) || 'Cameras',
            quantity: qtyMap.camera,
            price: 35,
            minStock: 2,
            brand,
            model,
            serialNumber: `OEM Original • Auto Batch Stock`
          });
        }

        // 7. Logic Board Assembly
        if (qtyMap.board > 0) {
          itemsToAdd.push({
            id: uuid(),
            name: `${model} - Logic Board / Assembly [OEM Genuine]`,
            category: categories.find(c => c.toLowerCase().includes('board') || c.toLowerCase().includes('motherboard')) || 'Motherboards / Logic Boards',
            quantity: qtyMap.board,
            price: 65,
            minStock: 1,
            brand,
            model,
            serialNumber: `OEM Genuine • Auto Batch Stock`
          });
        }
      });
    } else {
      // Single model detailed entry
      const targetBrand = isCustomModel ? customBrand : selectedModelObj?.brand || 'Phone';
      const targetModel = isCustomModel ? (customModel || 'Custom Phone') : selectedModelObj?.model || 'Device';

      // 1. Add Phone Unit if quantity > 0
      if (phoneUnits > 0) {
        const phoneItemName = `${targetModel} (${storageSpec}) - ${colorVariant || 'Standard'}`;
        itemsToAdd.push({
          id: uuid(),
          name: phoneItemName,
          category: categories.find(c => c.toLowerCase().includes('phone') || c.toLowerCase().includes('device')) || 'Smartphones',
          quantity: phoneUnits,
          price: phoneCost || selectedModelObj?.msrp || 0,
          minStock: 1,
          brand: targetBrand,
          model: targetModel,
          color: colorVariant,
          serialNumber: shelfBin ? `SHELF: ${shelfBin} [${phoneCondition}]` : phoneCondition
        });
      }

      // 2. Add initialized Spare Parts
      const activeParts = spareParts.filter(p => p.enabled && p.piecesCount > 0);
      for (const part of activeParts) {
        const partItemName = `${targetModel} - ${part.name} [${part.quality}]`;
        itemsToAdd.push({
          id: uuid(),
          name: partItemName,
          category: categories.find(c => c.toLowerCase().includes(part.category.toLowerCase())) || 'Phone Parts',
          quantity: part.piecesCount,
          price: part.unitCost,
          minStock: 2,
          brand: targetBrand,
          model: targetModel,
          color: colorVariant || undefined,
          serialNumber: `${part.quality} • Location: ${shelfBin || 'General Stock'}`
        });
      }
    }

    if (itemsToAdd.length > 0) {
      onAddMultipleItems(itemsToAdd);
      onClose();
    }
  };

  const totalBatchItemsCount = useMemo(() => {
    return Object.values(batchQuantities).reduce((acc: number, q: ModelBatchQty) => 
      acc + (q.phoneUnits || 0) + (q.screen || 0) + (q.battery || 0) + (q.port || 0) + (q.backglass || 0) + (q.camera || 0) + (q.board || 0), 0
    );
  }, [batchQuantities]);

  const totalBatchModelsCount = useMemo(() => {
    return Object.values(batchQuantities).filter((q: ModelBatchQty) => 
      ((q.phoneUnits || 0) + (q.screen || 0) + (q.battery || 0) + (q.port || 0) + (q.backglass || 0) + (q.camera || 0) + (q.board || 0)) > 0
    ).length;
  }, [batchQuantities]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-3xl w-full my-6 overflow-hidden flex flex-col relative"
      >
        {/* TOP HEADER - Gradient Banner */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 flex items-center justify-between border-b border-slate-800 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/80 via-purple-900/60 to-slate-900 pointer-events-none" />
          
          <div className="flex items-center gap-3.5 relative z-10">
            <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-600/30 flex items-center justify-center border border-indigo-400/30 shrink-0">
              <Smartphone size={22} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                Store Phone Models & Parts Manager
              </h2>
              <p className="text-xs text-indigo-200 font-medium mt-0.5">
                Register phone store units & initialize matching repair spare parts across {fullCatalog.length}+ phone models
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
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 overflow-y-auto max-h-[82vh] custom-scrollbar">
          
          {/* TOP MODE SWITCHER */}
          <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
            <button
              type="button"
              onClick={() => setEntryMode('auto_batch')}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                entryMode === 'auto_batch'
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Sparkles size={15} className="text-amber-400 shrink-0" />
              <span>⚡ Automatic Quantity Entry (Model by Model)</span>
            </button>

            <button
              type="button"
              onClick={() => setEntryMode('single_model')}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                entryMode === 'single_model'
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Smartphone size={15} className="text-indigo-400 shrink-0" />
              <span>🛠 Single Model Detailed Setup</span>
            </button>
          </div>

          {/* MODE 1: AUTOMATIC MODEL BY MODEL QUANTITY ENTRY */}
          {entryMode === 'auto_batch' ? (
            <div className="space-y-4">
              {/* EXPLANATORY BANNER */}
              <div className="p-3.5 bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-purple-500/10 border border-amber-300/40 rounded-2xl flex items-center gap-3">
                <div className="p-2 bg-amber-500/20 text-amber-700 rounded-xl shrink-0">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900">
                    Model-by-Model Fast Stock Intake
                  </h4>
                  <p className="text-[11px] text-slate-600 font-medium">
                    Simply put the numbers for the stock you have! Official colors, categories, and standard part prices are pre-filled automatically for all models.
                  </p>
                </div>
              </div>

              {/* BRAND QUICK FILTERS & SEARCH */}
              <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <label className="text-xs font-black uppercase tracking-wider text-indigo-300 flex items-center gap-2">
                    <Filter size={14} />
                    Filter Catalog ({fullCatalog.length} Phone Models Available)
                  </label>

                  {totalBatchItemsCount > 0 && (
                    <span className="text-xs font-extrabold text-amber-400 bg-amber-500/20 px-3 py-1 rounded-full border border-amber-500/30">
                      {totalBatchItemsCount} Total Items ({totalBatchModelsCount} Models)
                    </span>
                  )}
                </div>

                {/* Search Bar */}
                <div className="relative">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search phone model (e.g. 17 Pro Max, S25 Ultra, Pixel 9 Pro)..."
                    className="w-full bg-slate-800/90 text-white border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs font-medium focus:outline-none focus:border-indigo-400 placeholder:text-slate-400"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Brand Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar">
                  {['All', 'Apple', 'Samsung', 'Google', 'Motorola', 'Xiaomi', 'OnePlus'].map(brand => (
                    <button
                      key={brand}
                      type="button"
                      onClick={() => setSelectedBrandFilter(brand)}
                      className={`px-3 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                        selectedBrandFilter === brand
                          ? 'bg-indigo-600 text-white shadow-md'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                      }`}
                    >
                      {brand === 'Google' ? 'Google Pixel' : brand}
                    </button>
                  ))}
                </div>
              </div>

              {/* MODEL BY MODEL CARDS LIST */}
              <div className="space-y-3.5 max-h-[52vh] overflow-y-auto pr-1 custom-scrollbar">
                {filteredCatalog.map((item) => {
                  const qty = getModelBatchQty(item.id);
                  const heroColor = item.officialColors.find(c => c.isHeroFinish)?.name || item.officialColors[0]?.name || 'Standard';
                  const modelTotalCount = (qty.phoneUnits || 0) + (qty.screen || 0) + (qty.battery || 0) + (qty.port || 0) + (qty.backglass || 0) + (qty.camera || 0) + (qty.board || 0);

                  return (
                    <div
                      key={item.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        modelTotalCount > 0
                          ? 'bg-indigo-50/40 border-indigo-400 shadow-sm ring-1 ring-indigo-500/20'
                          : 'bg-white border-slate-200/90 hover:border-slate-300'
                      }`}
                    >
                      {/* CARD HEADER */}
                      <div className="flex items-center justify-between flex-wrap gap-2 pb-2.5 border-b border-slate-200/80">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase tracking-wider text-white bg-slate-900 px-2.5 py-0.5 rounded-lg">
                            {item.brand}
                          </span>
                          <h3 className="text-sm font-black text-slate-900">
                            {item.model}
                          </h3>
                          <span className="text-[11px] font-medium text-slate-500">
                            ({item.releaseYear})
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Hero Color Badge */}
                          <span className="text-[10px] font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <span
                              className="w-2.5 h-2.5 rounded-full border border-slate-300"
                              style={{ backgroundColor: item.officialColors[0]?.hex || '#64748b' }}
                            />
                            {heroColor}
                          </span>

                          {/* Quick preset buttons */}
                          <button
                            type="button"
                            onClick={() => quickSetAllModelParts(item.id, 1)}
                            className="text-[10px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-2 py-0.5 rounded-lg cursor-pointer transition-all"
                          >
                            +1 All
                          </button>

                          <button
                            type="button"
                            onClick={() => updateModelBatchQty(item.id, 'battery', (qty.battery || 0) + 5)}
                            className="text-[10px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-lg cursor-pointer transition-all"
                          >
                            +5 Batteries
                          </button>

                          {modelTotalCount > 0 && (
                            <button
                              type="button"
                              onClick={() => clearModelBatchQty(item.id)}
                              className="text-[10px] font-bold text-rose-600 hover:bg-rose-50 px-2 py-0.5 rounded-lg cursor-pointer transition-all"
                            >
                              Reset
                            </button>
                          )}
                        </div>
                      </div>

                      {/* ITEM QUANTITY INPUTS GRID */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-3">
                        {/* 1. Phone Units */}
                        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between gap-2">
                          <div>
                            <span className="text-xs font-bold text-slate-900 block leading-tight">
                              📱 Phone Units
                            </span>
                            <span className="text-[10px] text-slate-500">
                              256GB • {heroColor}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => updateModelBatchQty(item.id, 'phoneUnits', qty.phoneUnits - 1)}
                              className="w-6 h-6 rounded-md bg-white border border-slate-300 text-slate-700 font-bold flex items-center justify-center hover:bg-slate-100 cursor-pointer text-xs"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              min="0"
                              value={qty.phoneUnits || ''}
                              onChange={(e) => updateModelBatchQty(item.id, 'phoneUnits', parseInt(e.target.value) || 0)}
                              placeholder="0"
                              className="w-11 bg-white border border-slate-300 rounded-md py-0.5 text-xs font-black text-indigo-700 text-center focus:outline-none focus:border-indigo-600"
                            />
                            <button
                              type="button"
                              onClick={() => updateModelBatchQty(item.id, 'phoneUnits', qty.phoneUnits + 1)}
                              className="w-6 h-6 rounded-md bg-indigo-600 text-white font-bold flex items-center justify-center hover:bg-indigo-700 cursor-pointer text-xs"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* 2. OLED Display Screen */}
                        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between gap-2">
                          <div>
                            <span className="text-xs font-bold text-slate-900 block leading-tight">
                              🖥️ OLED Displays
                            </span>
                            <span className="text-[10px] text-slate-500">
                              Original Screen
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => updateModelBatchQty(item.id, 'screen', qty.screen - 1)}
                              className="w-6 h-6 rounded-md bg-white border border-slate-300 text-slate-700 font-bold flex items-center justify-center hover:bg-slate-100 cursor-pointer text-xs"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              min="0"
                              value={qty.screen || ''}
                              onChange={(e) => updateModelBatchQty(item.id, 'screen', parseInt(e.target.value) || 0)}
                              placeholder="0"
                              className="w-11 bg-white border border-slate-300 rounded-md py-0.5 text-xs font-black text-slate-900 text-center focus:outline-none focus:border-indigo-600"
                            />
                            <button
                              type="button"
                              onClick={() => updateModelBatchQty(item.id, 'screen', qty.screen + 1)}
                              className="w-6 h-6 rounded-md bg-indigo-600 text-white font-bold flex items-center justify-center hover:bg-indigo-700 cursor-pointer text-xs"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* 3. Battery Replacement */}
                        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between gap-2">
                          <div>
                            <span className="text-xs font-bold text-slate-900 block leading-tight">
                              🔋 Batteries
                            </span>
                            <span className="text-[10px] text-slate-500">
                              OEM Original
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => updateModelBatchQty(item.id, 'battery', qty.battery - 1)}
                              className="w-6 h-6 rounded-md bg-white border border-slate-300 text-slate-700 font-bold flex items-center justify-center hover:bg-slate-100 cursor-pointer text-xs"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              min="0"
                              value={qty.battery || ''}
                              onChange={(e) => updateModelBatchQty(item.id, 'battery', parseInt(e.target.value) || 0)}
                              placeholder="0"
                              className="w-11 bg-white border border-slate-300 rounded-md py-0.5 text-xs font-black text-slate-900 text-center focus:outline-none focus:border-indigo-600"
                            />
                            <button
                              type="button"
                              onClick={() => updateModelBatchQty(item.id, 'battery', qty.battery + 1)}
                              className="w-6 h-6 rounded-md bg-indigo-600 text-white font-bold flex items-center justify-center hover:bg-indigo-700 cursor-pointer text-xs"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* 4. Charging Port Flex */}
                        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between gap-2">
                          <div>
                            <span className="text-xs font-bold text-slate-900 block leading-tight">
                              ⚡ Charging Ports
                            </span>
                            <span className="text-[10px] text-slate-500">
                              Flex Cable Assembly
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => updateModelBatchQty(item.id, 'port', qty.port - 1)}
                              className="w-6 h-6 rounded-md bg-white border border-slate-300 text-slate-700 font-bold flex items-center justify-center hover:bg-slate-100 cursor-pointer text-xs"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              min="0"
                              value={qty.port || ''}
                              onChange={(e) => updateModelBatchQty(item.id, 'port', parseInt(e.target.value) || 0)}
                              placeholder="0"
                              className="w-11 bg-white border border-slate-300 rounded-md py-0.5 text-xs font-black text-slate-900 text-center focus:outline-none focus:border-indigo-600"
                            />
                            <button
                              type="button"
                              onClick={() => updateModelBatchQty(item.id, 'port', qty.port + 1)}
                              className="w-6 h-6 rounded-md bg-indigo-600 text-white font-bold flex items-center justify-center hover:bg-indigo-700 cursor-pointer text-xs"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* 5. Back Glass Cover */}
                        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between gap-2">
                          <div>
                            <span className="text-xs font-bold text-slate-900 block leading-tight">
                              🖼️ Back Glass
                            </span>
                            <span className="text-[10px] text-slate-500">
                              Rear Glass Housing
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => updateModelBatchQty(item.id, 'backglass', qty.backglass - 1)}
                              className="w-6 h-6 rounded-md bg-white border border-slate-300 text-slate-700 font-bold flex items-center justify-center hover:bg-slate-100 cursor-pointer text-xs"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              min="0"
                              value={qty.backglass || ''}
                              onChange={(e) => updateModelBatchQty(item.id, 'backglass', parseInt(e.target.value) || 0)}
                              placeholder="0"
                              className="w-11 bg-white border border-slate-300 rounded-md py-0.5 text-xs font-black text-slate-900 text-center focus:outline-none focus:border-indigo-600"
                            />
                            <button
                              type="button"
                              onClick={() => updateModelBatchQty(item.id, 'backglass', qty.backglass + 1)}
                              className="w-6 h-6 rounded-md bg-indigo-600 text-white font-bold flex items-center justify-center hover:bg-indigo-700 cursor-pointer text-xs"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* 6. Camera Lens / Module */}
                        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between gap-2">
                          <div>
                            <span className="text-xs font-bold text-slate-900 block leading-tight">
                              📷 Camera Lenses
                            </span>
                            <span className="text-[10px] text-slate-500">
                              Rear / Front Camera
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => updateModelBatchQty(item.id, 'camera', qty.camera - 1)}
                              className="w-6 h-6 rounded-md bg-white border border-slate-300 text-slate-700 font-bold flex items-center justify-center hover:bg-slate-100 cursor-pointer text-xs"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              min="0"
                              value={qty.camera || ''}
                              onChange={(e) => updateModelBatchQty(item.id, 'camera', parseInt(e.target.value) || 0)}
                              placeholder="0"
                              className="w-11 bg-white border border-slate-300 rounded-md py-0.5 text-xs font-black text-slate-900 text-center focus:outline-none focus:border-indigo-600"
                            />
                            <button
                              type="button"
                              onClick={() => updateModelBatchQty(item.id, 'camera', qty.camera + 1)}
                              className="w-6 h-6 rounded-md bg-indigo-600 text-white font-bold flex items-center justify-center hover:bg-indigo-700 cursor-pointer text-xs"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* BATCH SUBMIT BOTTOM BAR */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between flex-wrap gap-3">
                <div>
                  <span className="text-xs font-black text-slate-900 block">
                    {totalBatchItemsCount > 0 ? (
                      <span className="text-emerald-600 font-black">
                        ✓ {totalBatchItemsCount} items ready across {totalBatchModelsCount} phone models
                      </span>
                    ) : (
                      <span className="text-slate-500 font-medium">
                        Enter quantity numbers above for the stock you have
                      </span>
                    )}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={totalBatchItemsCount === 0}
                    className={`px-6 py-2.5 rounded-xl font-black text-xs shadow-lg flex items-center gap-2 transition-all cursor-pointer transform active:scale-95 ${
                      totalBatchItemsCount > 0
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <Plus size={16} />
                    <span>🚀 Add All Stock Quantities to Store ({totalBatchItemsCount})</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* MODE 2: SINGLE MODEL DETAILED SETUP */
            <div className="space-y-5">
              {/* BRAND QUICK FILTERS & SEARCH */}
              <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <label className="text-xs font-black uppercase tracking-wider text-indigo-300 flex items-center gap-2">
                    <Filter size={14} />
                    Filter Catalog ({fullCatalog.length} Total)
                  </label>

                  <button
                    type="button"
                    onClick={() => setIsCustomModel(!isCustomModel)}
                    className={`text-[11px] font-bold px-3 py-1 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                      isCustomModel
                        ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                        : 'bg-white/10 hover:bg-white/20 text-indigo-200'
                    }`}
                  >
                    <Plus size={13} />
                    {isCustomModel ? 'Switch to Catalog Selector' : '+ Add Unlisted Custom Model'}
                  </button>
                </div>

                {!isCustomModel && (
                  <>
                    {/* Search Bar */}
                    <div className="relative">
                      <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search phone model, series, or color (e.g. 17 Pro Max, S25 Ultra, Cosmic Orange)..."
                        className="w-full bg-slate-800/90 text-white border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs font-medium focus:outline-none focus:border-indigo-400 placeholder:text-slate-400"
                      />
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => setSearchQuery('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>

                    {/* Brand Filter Pills */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar">
                      {['All', 'Apple', 'Samsung', 'Google', 'Motorola', 'Xiaomi', 'OnePlus'].map(brand => (
                        <button
                          key={brand}
                          type="button"
                          onClick={() => setSelectedBrandFilter(brand)}
                          className={`px-3 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                            selectedBrandFilter === brand
                              ? 'bg-indigo-600 text-white shadow-md'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                          }`}
                        >
                          {brand === 'Google' ? 'Google Pixel' : brand}
                        </button>
                      ))}
                    </div>

                    {/* MODEL DROPDOWN SELECTOR */}
                    <div>
                      <select
                        value={selectedCatalogId}
                        onChange={(e) => setSelectedCatalogId(e.target.value)}
                        className="w-full bg-white text-slate-900 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all shadow-2xs"
                      >
                        {filteredCatalog.length > 0 ? (
                          filteredCatalog.map((item) => (
                            <option key={item.id} value={item.id}>
                              [{item.brand}] {item.model} ({item.releaseYear}) • {item.officialColors.length} Color Finishes
                            </option>
                          ))
                        ) : (
                          <option value="" disabled>No phone models match your search "{searchQuery}"</option>
                        )}
                      </select>
                    </div>
                  </>
                )}

                {/* Custom Model Inputs if enabled */}
                {isCustomModel && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 block mb-1">
                        Brand Name
                      </label>
                      <input
                        type="text"
                        value={customBrand}
                        onChange={(e) => setCustomBrand(e.target.value)}
                        placeholder="e.g. Apple, Samsung, Nothing..."
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-indigo-400"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 block mb-1">
                        Phone Model Name
                      </label>
                      <input
                        type="text"
                        value={customModel}
                        onChange={(e) => setCustomModel(e.target.value)}
                        placeholder="e.g. Phone (2a) Plus"
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-indigo-400"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* PHONE SPECS CARD */}
              <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                  <span className="text-xs font-black text-slate-900 flex items-center gap-2">
                    <Smartphone size={15} className="text-indigo-600" />
                    {isCustomModel ? (customModel || 'Custom Model Specs') : `${selectedModelObj?.brand} ${selectedModelObj?.model}`}
                  </span>

                  {!isCustomModel && selectedModelObj?.msrp && (
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                      MSRP: ${selectedModelObj.msrp}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      Storage Capacity
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
                      <option value="2TB">2TB</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      Color Finish / Variant
                    </label>
                    {!isCustomModel && selectedModelObj?.officialColors && selectedModelObj.officialColors.length > 0 ? (
                      <div className="space-y-1.5">
                        <select
                          value={colorVariant}
                          onChange={(e) => setColorVariant(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-600"
                        >
                          {selectedModelObj.officialColors.map((c) => (
                            <option key={c.name} value={c.name}>
                              {c.name} {c.isHeroFinish ? '★ (Hero Finish)' : ''}
                            </option>
                          ))}
                        </select>
                        {/* Color swatches */}
                        <div className="flex items-center gap-1.5 flex-wrap pt-1">
                          {selectedModelObj.officialColors.map((c) => (
                            <button
                              key={c.name}
                              type="button"
                              onClick={() => setColorVariant(c.name)}
                              title={`${c.name}${c.isHeroFinish ? ' (Hero Finish)' : ''}`}
                              className={`w-5 h-5 rounded-full border border-slate-300 transition-all cursor-pointer flex items-center justify-center shrink-0 ${
                                colorVariant === c.name ? 'ring-2 ring-indigo-600 ring-offset-1 scale-110' : 'hover:scale-105'
                              }`}
                              style={{ backgroundColor: c.hex }}
                            >
                              {colorVariant === c.name && (
                                <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full border border-white" />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <input
                        type="text"
                        value={colorVariant}
                        onChange={(e) => setColorVariant(e.target.value)}
                        placeholder="e.g. Cosmic Orange, Titanium Black"
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-600"
                      />
                    )}
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
                      Store Bin / Shelf Location
                    </label>
                    <input
                      type="text"
                      value={shelfBin}
                      onChange={(e) => setShelfBin(e.target.value)}
                      placeholder="e.g. Shelf 1A, Safe 3"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-600"
                    />
                  </div>
                </div>
              </div>

              {/* INITIALIZE SPARE PARTS STOCK CONTAINER */}
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
                          {/* Quality selection */}
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
            </div>
          )}
        </form>
      </motion.div>
    </div>
  );
}

