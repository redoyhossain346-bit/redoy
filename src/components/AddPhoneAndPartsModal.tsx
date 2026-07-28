import React, { useState, useEffect, useMemo } from 'react';
import { X, Smartphone, Wrench, Plus, Search, Filter, Layers, Check, Sparkles, Tag, DollarSign, Package, FileSpreadsheet, FileText, Download } from 'lucide-react';
import { InventoryItem } from '../types';
import { PHONE_COLORS_CATALOG, PhoneModelCatalogItem, PhoneColorVariant } from '../data/phoneColorsCatalog';
import { DEVICE_BRANDS } from '../data/deviceModels';
import { uuid } from '../lib/utils';
import { getMobileSentrixPartPricing } from '../data/mobileSentrixPrices';
import { motion, AnimatePresence } from 'framer-motion';
import ExcelJS from 'exceljs';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

interface AddPhoneAndPartsModalProps {
  isOpen?: boolean;
  isInline?: boolean;
  onClose?: () => void;
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
  isOpen = false,
  isInline = false,
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
  const targetBrand = isCustomModel ? customBrand : selectedModelObj?.brand || 'Phone';
  const targetModel = isCustomModel ? (customModel || 'Custom Phone') : selectedModelObj?.model || 'Device';
  const availableColors = selectedModelObj?.officialColors || DEFAULT_STANDARD_COLORS;

  useEffect(() => {
    if (!isCustomModel && selectedModelObj) {
      if (selectedModelObj.officialColors && selectedModelObj.officialColors.length > 0) {
        setColorVariant(selectedModelObj.officialColors[0].name);
      }
      if (selectedModelObj.msrp) {
        setPhoneCost(selectedModelObj.msrp);
      }

      // Auto-populate MobileSentrix wholesale prices for selected device model
      setSpareParts(prev => prev.map(part => {
        const pType = part.id as 'screen' | 'battery' | 'port' | 'backglass' | 'camera' | 'housing' | 'board';
        const ms = getMobileSentrixPartPricing(selectedModelObj.model, pType, selectedModelObj.brand);
        return {
          ...part,
          unitCost: ms.wholesaleCost,
          quality: (ms.qualityGrade.includes('OLED') || ms.qualityGrade.includes('Service Pack') ? 'Original / OLED' : 
                   ms.qualityGrade.includes('Ampsentrix') || ms.qualityGrade.includes('OEM') ? 'OEM Original' : 'Aftermarket') as QualityGrade
        };
      }));
    }
  }, [selectedCatalogId, isCustomModel, selectedModelObj]);

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

  if (!isInline && !isOpen) return null;

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
      // Automatic model-by-model batch stock entry using MobileSentrix Wholesale Rates
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

        // 2. OLED Display Screen (MobileSentrix XO7 / Service Pack)
        if (qtyMap.screen > 0) {
          const ms = getMobileSentrixPartPricing(model, 'screen', brand);
          itemsToAdd.push({
            id: uuid(),
            name: `${model} - ${ms.partName} [${ms.qualityGrade}]`,
            category: categories.find(c => c.toLowerCase().includes('screen') || c.toLowerCase().includes('display')) || 'Screen & Display',
            quantity: qtyMap.screen,
            price: ms.wholesaleCost,
            minStock: 2,
            brand,
            model,
            color: heroColor,
            serialNumber: `${ms.qualityGrade} • MS SKU: ${ms.msSku}`
          });
        }

        // 3. Battery Replacement (Ampsentrix)
        if (qtyMap.battery > 0) {
          const ms = getMobileSentrixPartPricing(model, 'battery', brand);
          itemsToAdd.push({
            id: uuid(),
            name: `${model} - ${ms.partName} [${ms.qualityGrade}]`,
            category: categories.find(c => c.toLowerCase().includes('battery') || c.toLowerCase().includes('batteries')) || 'Batteries',
            quantity: qtyMap.battery,
            price: ms.wholesaleCost,
            minStock: 2,
            brand,
            model,
            serialNumber: `${ms.qualityGrade} • MS SKU: ${ms.msSku}`
          });
        }

        // 4. Charging Port Flex (MobileSentrix Flex)
        if (qtyMap.port > 0) {
          const ms = getMobileSentrixPartPricing(model, 'port', brand);
          itemsToAdd.push({
            id: uuid(),
            name: `${model} - ${ms.partName} [${ms.qualityGrade}]`,
            category: categories.find(c => c.toLowerCase().includes('flex') || c.toLowerCase().includes('port')) || 'Flex Cables',
            quantity: qtyMap.port,
            price: ms.wholesaleCost,
            minStock: 2,
            brand,
            model,
            serialNumber: `${ms.qualityGrade} • MS SKU: ${ms.msSku}`
          });
        }

        // 5. Back Glass Cover
        if (qtyMap.backglass > 0) {
          const ms = getMobileSentrixPartPricing(model, 'backglass', brand);
          itemsToAdd.push({
            id: uuid(),
            name: `${model} - ${ms.partName} [${ms.qualityGrade}]`,
            category: categories.find(c => c.toLowerCase().includes('back glass') || c.toLowerCase().includes('housing')) || 'Back Glass & Housing',
            quantity: qtyMap.backglass,
            price: ms.wholesaleCost,
            minStock: 2,
            brand,
            model,
            color: heroColor,
            serialNumber: `${ms.qualityGrade} • MS SKU: ${ms.msSku}`
          });
        }

        // 6. Camera Lens / Module
        if (qtyMap.camera > 0) {
          const ms = getMobileSentrixPartPricing(model, 'camera', brand);
          itemsToAdd.push({
            id: uuid(),
            name: `${model} - ${ms.partName} [${ms.qualityGrade}]`,
            category: categories.find(c => c.toLowerCase().includes('camera')) || 'Cameras',
            quantity: qtyMap.camera,
            price: ms.wholesaleCost,
            minStock: 2,
            brand,
            model,
            serialNumber: `${ms.qualityGrade} • MS SKU: ${ms.msSku}`
          });
        }

        // 7. Logic Board Assembly
        if (qtyMap.board > 0) {
          const ms = getMobileSentrixPartPricing(model, 'board', brand);
          itemsToAdd.push({
            id: uuid(),
            name: `${model} - ${ms.partName} [${ms.qualityGrade}]`,
            category: categories.find(c => c.toLowerCase().includes('board') || c.toLowerCase().includes('motherboard')) || 'Motherboards / Logic Boards',
            quantity: qtyMap.board,
            price: ms.wholesaleCost,
            minStock: 1,
            brand,
            model,
            serialNumber: `${ms.qualityGrade} • MS SKU: ${ms.msSku}`
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
      onClose?.();
    }
  };

  // EXPORT FUNCTIONS (Excel XLSX & PDF)
  const handleExportExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    
    // Worksheet 1: MobileSentrix Catalog & Parts Matrix
    const sheet1 = workbook.addWorksheet('Phone Models & Parts Matrix');
    
    const matrixData = filteredCatalog.map(item => {
      const msScreen = getMobileSentrixPartPricing(item.model, 'screen', item.brand);
      const msBatt = getMobileSentrixPartPricing(item.model, 'battery', item.brand);
      const msPort = getMobileSentrixPartPricing(item.model, 'port', item.brand);
      const msGlass = getMobileSentrixPartPricing(item.model, 'backglass', item.brand);
      const msCam = getMobileSentrixPartPricing(item.model, 'camera', item.brand);
      const msBoard = getMobileSentrixPartPricing(item.model, 'board', item.brand);
      const batchQty = batchQuantities[item.id] || { phoneUnits: 0, screen: 0, battery: 0, port: 0, backglass: 0, camera: 0, board: 0 };

      return {
        'Brand': item.brand,
        'Phone Model': item.model,
        'Official Colors': item.officialColors.map(c => c.name).join(', '),
        'MSRP ($)': item.msrp || 799,
        'OLED Screen XO7 ($)': msScreen.wholesaleCost,
        'Screen Grade': msScreen.qualityGrade,
        'Battery Ampsentrix ($)': msBatt.wholesaleCost,
        'Charge Port Flex ($)': msPort.wholesaleCost,
        'Back Glass ($)': msGlass.wholesaleCost,
        'Camera Module ($)': msCam.wholesaleCost,
        'Logic Board ($)': msBoard.wholesaleCost,
        'Batch Phone Units': batchQty.phoneUnits || 0,
        'Batch Screens': batchQty.screen || 0,
        'Batch Batteries': batchQty.battery || 0,
        'Batch Ports': batchQty.port || 0,
        'Batch Glass': batchQty.backglass || 0,
        'Batch Cameras': batchQty.camera || 0,
        'Batch Boards': batchQty.board || 0
      };
    });

    if (matrixData.length > 0) {
      sheet1.columns = Object.keys(matrixData[0]).map(key => ({ header: key, key: key, width: 22 }));
      sheet1.addRows(matrixData);
      sheet1.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      sheet1.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } };
    }

    // Worksheet 2: Quick Summary Metrics
    const sheet2 = workbook.addWorksheet('Catalog Summary');
    sheet2.columns = [
      { header: 'Catalog Metric', key: 'metric', width: 35 },
      { header: 'Details / Value', key: 'value', width: 35 }
    ];
    sheet2.addRows([
      { metric: 'Total Models Exported', value: filteredCatalog.length },
      { metric: 'Total Catalog Models', value: fullCatalog.length },
      { metric: 'Supplier Baseline', value: 'MobileSentrix Wholesale Pricing Matrix (mobilesentrix.com)' },
      { metric: 'Export Generated Date', value: format(new Date(), 'yyyy-MM-dd HH:mm:ss') }
    ]);
    sheet2.getRow(1).font = { bold: true };

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Store_Phone_Models_And_MobileSentrix_Parts_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF('l', 'pt', 'a4');
    const pageWidth = doc.internal.pageSize.width;

    // Header Banner
    doc.setFillColor(30, 41, 59); // Slate-900
    doc.rect(0, 0, pageWidth, 50, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(15);
    doc.text("Store Phone Models & MobileSentrix Wholesale Parts Price Matrix", 35, 32);
    
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.text(`Generated: ${format(new Date(), 'dd MMM yyyy, hh:mm a')}  |  Models: ${filteredCatalog.length}`, pageWidth - 260, 32);

    const tableRows = filteredCatalog.map(item => {
      const msScreen = getMobileSentrixPartPricing(item.model, 'screen', item.brand);
      const msBatt = getMobileSentrixPartPricing(item.model, 'battery', item.brand);
      const msPort = getMobileSentrixPartPricing(item.model, 'port', item.brand);
      const msGlass = getMobileSentrixPartPricing(item.model, 'backglass', item.brand);
      const msCam = getMobileSentrixPartPricing(item.model, 'camera', item.brand);
      const msBoard = getMobileSentrixPartPricing(item.model, 'board', item.brand);

      return [
        item.brand,
        item.model,
        item.officialColors.map(c => c.name).slice(0, 3).join(', '),
        `$${item.msrp || 799}`,
        `$${msScreen.wholesaleCost} (${msScreen.qualityGrade.split(' ')[0]})`,
        `$${msBatt.wholesaleCost} (Ampsentrix)`,
        `$${msPort.wholesaleCost}`,
        `$${msGlass.wholesaleCost}`,
        `$${msCam.wholesaleCost}`,
        `$${msBoard.wholesaleCost}`
      ];
    });

    autoTable(doc, {
      startY: 65,
      head: [['Brand', 'Model', 'Colors', 'MSRP', 'Screen XO7', 'Battery', 'Port', 'Glass', 'Camera', 'Board']],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229], textColor: 255, fontStyle: 'bold', fontSize: 9 },
      styles: { fontSize: 8, cellPadding: 5 },
      alternateRowStyles: { fillColor: [248, 250, 252] }
    });

    doc.save(`Store_Phone_Models_And_MobileSentrix_Parts_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  if (isInline) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl w-full min-h-[85vh] flex flex-col relative overflow-hidden my-2">
        {/* TOP HEADER - Gradient Banner */}
        <div className="bg-slate-900 text-white p-4 sm:p-6 flex items-center justify-between border-b border-slate-800 relative overflow-hidden shrink-0">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/90 via-purple-900/70 to-slate-900 pointer-events-none" />
          
          <div className="flex items-center gap-3.5 relative z-10">
            <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-600/30 flex items-center justify-center border border-indigo-400/30 shrink-0">
              <Smartphone size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black tracking-tight text-white flex items-center gap-2">
                  Store Phone Models & Repair Parts Manager
                </h2>
                <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full">
                  Full Page Workspace
                </span>
              </div>
              <p className="text-xs sm:text-sm text-indigo-200 font-medium mt-0.5">
                Register store phone units & initialize matching repair spare parts across {fullCatalog.length}+ phone models
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 relative z-10">
            <button
              type="button"
              onClick={handleExportExcel}
              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer border border-emerald-400/30"
              title="Export Phone Models & MobileSentrix Parts to Excel"
            >
              <FileSpreadsheet size={16} />
              <span className="hidden sm:inline">Export Excel</span>
            </button>
            <button
              type="button"
              onClick={handleExportPDF}
              className="px-3 py-2 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer border border-rose-400/30"
              title="Export Phone Models & MobileSentrix Parts to PDF"
            >
              <FileText size={16} />
              <span className="hidden sm:inline">Export PDF</span>
            </button>

            {onClose && (
              <button
                onClick={onClose}
                type="button"
                className="p-2.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-2xl transition-all cursor-pointer flex items-center gap-2 bg-slate-800/80 border border-slate-700 ml-1"
              >
                <span className="text-xs font-bold hidden sm:inline">Back to Stock</span>
                <X size={20} />
              </button>
            )}
          </div>
        </div>

        {/* FORM BODY */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 md:p-8 space-y-5 overflow-y-auto flex-1 flex flex-col custom-scrollbar">
          
          {/* TOP MODE SWITCHER */}
          <div className="flex items-center gap-3 p-2 bg-slate-100 rounded-2xl border border-slate-200 shrink-0">
            <button
              type="button"
              onClick={() => setEntryMode('auto_batch')}
              className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                entryMode === 'auto_batch'
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Sparkles size={16} className="text-amber-400 shrink-0" />
              <span>⚡ Automatic Quantity Entry (Model by Model)</span>
              {totalBatchItemsCount > 0 && (
                <span className="bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full ml-1 animate-pulse">
                  {totalBatchItemsCount} Items Ready
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setEntryMode('single_model')}
              className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                entryMode === 'single_model'
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Smartphone size={16} className="text-indigo-400 shrink-0" />
              <span>🛠 Single Model Detailed Setup</span>
            </button>
          </div>

          {/* MODE 1: AUTO BATCH */}
          {entryMode === 'auto_batch' && (
            <div className="space-y-4 flex-1 flex flex-col">
              {/* SEARCH & FILTERS ROW */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200 shrink-0">
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search model (e.g. iPhone 16 Pro Max, S25 Ultra, Pixel)..."
                    className="w-full pl-10 pr-4 py-2 text-xs font-bold bg-white border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
                  {['All', 'Apple', 'Samsung', 'Google', 'Motorola', 'Xiaomi', 'OnePlus'].map(brand => (
                    <button
                      key={brand}
                      type="button"
                      onClick={() => setSelectedBrandFilter(brand)}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer border ${
                        selectedBrandFilter === brand
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {brand === 'Google' ? 'Google Pixel' : brand}
                    </button>
                  ))}
                </div>
              </div>

              {/* EXPORT & CATALOG MATRIX ACTION BAR */}
              <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-900 text-white rounded-2xl text-xs font-medium shadow-xs border border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="font-black text-amber-300 flex items-center gap-1.5">
                    <Sparkles size={14} className="text-amber-400" />
                    MobileSentrix Wholesale Matrix
                  </span>
                  <span className="text-slate-300 text-[11px] hidden sm:inline">| {filteredCatalog.length} Phone Models & Parts</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleExportExcel}
                    className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[11px] rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                  >
                    <FileSpreadsheet size={14} />
                    <span>Export Excel (.xlsx)</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleExportPDF}
                    className="px-3 py-1.5 bg-rose-500 hover:bg-rose-400 text-white font-black text-[11px] rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                  >
                    <FileText size={14} />
                    <span>Export PDF</span>
                  </button>
                </div>
              </div>

              {/* MODEL BY MODEL CARDS LIST */}
              <div className="space-y-4 flex-1 min-h-[420px] overflow-y-auto pr-2 custom-scrollbar">
                {filteredCatalog.map((item) => {
                  const qty = getModelBatchQty(item.id);
                  const heroColor = item.officialColors.find(c => c.isHeroFinish)?.name || item.officialColors[0]?.name || 'Standard';
                  const modelTotalCount = (qty.phoneUnits || 0) + (qty.screen || 0) + (qty.battery || 0) + (qty.port || 0) + (qty.backglass || 0) + (qty.camera || 0) + (qty.board || 0);

                  return (
                    <div
                      key={item.id}
                      className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                        modelTotalCount > 0
                          ? 'bg-indigo-50/50 border-indigo-400 shadow-sm ring-2 ring-indigo-500/20'
                          : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                      }`}
                    >
                      {/* CARD HEADER */}
                      <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-200/80">
                        <div className="flex items-center gap-2.5">
                          <span className="text-[11px] font-black uppercase tracking-wider text-white bg-slate-900 px-3 py-1 rounded-xl shadow-xs">
                            {item.brand}
                          </span>
                          <h3 className="text-base font-black text-slate-900">
                            {item.model}
                          </h3>
                          <span className="text-xs font-semibold text-slate-500">
                            ({item.releaseYear})
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Hero Color Badge */}
                          <span className="text-xs font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-full flex items-center gap-1.5">
                            <span
                              className="w-3 h-3 rounded-full border border-slate-300"
                              style={{ backgroundColor: item.officialColors[0]?.hex || '#64748b' }}
                            />
                            {heroColor}
                          </span>

                          <button
                            type="button"
                            onClick={() => quickSetAllModelParts(item.id, 1)}
                            className="text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-2.5 py-1 rounded-xl cursor-pointer transition-all active:scale-95"
                          >
                            +1 All
                          </button>
                          <button
                            type="button"
                            onClick={() => updateModelBatchQty(item.id, 'battery', (qty.battery || 0) + 5)}
                            className="text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-xl cursor-pointer transition-all active:scale-95"
                          >
                            +5 Batteries
                          </button>
                          {modelTotalCount > 0 && (
                            <button
                              type="button"
                              onClick={() => clearModelBatchQty(item.id)}
                              className="text-xs font-bold text-rose-600 hover:bg-rose-50 px-2.5 py-1 rounded-xl cursor-pointer transition-all border border-transparent hover:border-rose-200"
                            >
                              Reset
                            </button>
                          )}
                        </div>
                      </div>

                      {/* ITEM QUANTITY INPUTS GRID */}
                      {(() => {
                        const msScreen = getMobileSentrixPartPricing(item.model, 'screen', item.brand);
                        const msBatt = getMobileSentrixPartPricing(item.model, 'battery', item.brand);
                        const msPort = getMobileSentrixPartPricing(item.model, 'port', item.brand);
                        const msGlass = getMobileSentrixPartPricing(item.model, 'backglass', item.brand);
                        const msCam = getMobileSentrixPartPricing(item.model, 'camera', item.brand);
                        const msBoard = getMobileSentrixPartPricing(item.model, 'board', item.brand);

                        return (
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2.5 pt-3.5">
                            {/* 1. Phone Units */}
                            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between gap-2">
                              <div>
                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-700 block">📱 Phone Units</span>
                                <span className="text-[9px] text-emerald-600 font-black">${item.msrp || 799} msrp</span>
                              </div>
                              <input
                                type="number"
                                min="0"
                                value={qty.phoneUnits || ''}
                                onChange={(e) => updateModelBatchQty(item.id, 'phoneUnits', parseInt(e.target.value) || 0)}
                                placeholder="0"
                                className="w-12 py-1 px-1.5 text-center font-mono font-black text-xs bg-white border border-slate-300 rounded-lg outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                              />
                            </div>

                            {/* 2. Screen Assembly */}
                            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between gap-2">
                              <div>
                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-700 block">🖥 Screen OLED</span>
                                <span className="text-[9px] text-indigo-600 font-black">${msScreen.wholesaleCost} MS XO7</span>
                              </div>
                              <input
                                type="number"
                                min="0"
                                value={qty.screen || ''}
                                onChange={(e) => updateModelBatchQty(item.id, 'screen', parseInt(e.target.value) || 0)}
                                placeholder="0"
                                className="w-12 py-1 px-1.5 text-center font-mono font-black text-xs bg-white border border-slate-300 rounded-lg outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                              />
                            </div>

                            {/* 3. Battery Replacement */}
                            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between gap-2">
                              <div>
                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-700 block">🔋 Battery Pack</span>
                                <span className="text-[9px] text-amber-600 font-black">${msBatt.wholesaleCost} Ampsentrix</span>
                              </div>
                              <input
                                type="number"
                                min="0"
                                value={qty.battery || ''}
                                onChange={(e) => updateModelBatchQty(item.id, 'battery', parseInt(e.target.value) || 0)}
                                placeholder="0"
                                className="w-12 py-1 px-1.5 text-center font-mono font-black text-xs bg-white border border-slate-300 rounded-lg outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                              />
                            </div>

                            {/* 4. Charging Port */}
                            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between gap-2">
                              <div>
                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-700 block">⚡ Charge Port</span>
                                <span className="text-[9px] text-slate-500 font-black">${msPort.wholesaleCost} MS Flex</span>
                              </div>
                              <input
                                type="number"
                                min="0"
                                value={qty.port || ''}
                                onChange={(e) => updateModelBatchQty(item.id, 'port', parseInt(e.target.value) || 0)}
                                placeholder="0"
                                className="w-12 py-1 px-1.5 text-center font-mono font-black text-xs bg-white border border-slate-300 rounded-lg outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                              />
                            </div>

                            {/* 5. Rear Back Glass */}
                            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between gap-2">
                              <div>
                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-700 block">🛡 Back Glass</span>
                                <span className="text-[9px] text-slate-500 font-black">${msGlass.wholesaleCost} MS Glass</span>
                              </div>
                              <input
                                type="number"
                                min="0"
                                value={qty.backglass || ''}
                                onChange={(e) => updateModelBatchQty(item.id, 'backglass', parseInt(e.target.value) || 0)}
                                placeholder="0"
                                className="w-12 py-1 px-1.5 text-center font-mono font-black text-xs bg-white border border-slate-300 rounded-lg outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                              />
                            </div>

                            {/* 6. Camera Lens / Module */}
                            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between gap-2">
                              <div>
                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-700 block">📷 Camera</span>
                                <span className="text-[9px] text-slate-500 font-black">${msCam.wholesaleCost} MS Cam</span>
                              </div>
                              <input
                                type="number"
                                min="0"
                                value={qty.camera || ''}
                                onChange={(e) => updateModelBatchQty(item.id, 'camera', parseInt(e.target.value) || 0)}
                                placeholder="0"
                                className="w-12 py-1 px-1.5 text-center font-mono font-black text-xs bg-white border border-slate-300 rounded-lg outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                              />
                            </div>

                            {/* 7. Logic Board */}
                            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between gap-2">
                              <div>
                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-700 block">📟 Logic Board</span>
                                <span className="text-[9px] text-slate-500 font-black">${msBoard.wholesaleCost} MS Board</span>
                              </div>
                              <input
                                type="number"
                                min="0"
                                value={qty.board || ''}
                                onChange={(e) => updateModelBatchQty(item.id, 'board', parseInt(e.target.value) || 0)}
                                placeholder="0"
                                className="w-12 py-1 px-1.5 text-center font-mono font-black text-xs bg-white border border-slate-300 rounded-lg outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                              />
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* MODE 2: SINGLE MODEL SETUP */}
          {entryMode === 'single_model' && (
            <div className="space-y-5">
              {/* BRAND & MODEL CATALOG PICKER */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">
                    1. Select Official Model from Catalog
                  </label>
                  <select
                    value={selectedCatalogId}
                    onChange={(e) => setSelectedCatalogId(e.target.value)}
                    className="w-full py-2.5 px-3 text-xs font-bold bg-white border border-slate-300 rounded-xl outline-none focus:border-indigo-600"
                  >
                    {fullCatalog.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.brand} - {item.model} ({item.releaseYear})
                      </option>
                    ))}
                    <option value="custom">+ Add Custom / Other Phone Model</option>
                  </select>
                </div>

                {isCustomModel ? (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">Brand</label>
                      <input
                        type="text"
                        value={customBrand}
                        onChange={(e) => setCustomBrand(e.target.value)}
                        placeholder="e.g. Apple / Samsung"
                        className="w-full py-2 px-3 text-xs font-bold bg-white border border-slate-300 rounded-xl outline-none focus:border-indigo-600"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">Model Name</label>
                      <input
                        type="text"
                        value={customModel}
                        onChange={(e) => setCustomModel(e.target.value)}
                        placeholder="e.g. iPhone SE 3"
                        className="w-full py-2 px-3 text-xs font-bold bg-white border border-slate-300 rounded-xl outline-none focus:border-indigo-600"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">
                      2. Official Color Finish
                    </label>
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                      {availableColors.map((col) => (
                        <button
                          key={col.name}
                          type="button"
                          onClick={() => setColorVariant(col.name)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer border ${
                            colorVariant === col.name
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          <span
                            className="w-3 h-3 rounded-full border border-slate-300 shrink-0"
                            style={{ backgroundColor: col.hex }}
                          />
                          <span>{col.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* PHONE UNIT DETAILS SECTION */}
              <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
                    📱 Phone Unit Details ({targetModel})
                  </span>
                  <span className="text-[10px] font-black text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-md">
                    Category: Store Phone Inventory
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">Storage</label>
                    <select
                      value={storageSpec}
                      onChange={(e) => setStorageSpec(e.target.value)}
                      className="w-full py-2 px-3 text-xs font-bold bg-white border border-slate-300 rounded-xl outline-none focus:border-indigo-600"
                    >
                      <option value="64GB">64GB</option>
                      <option value="128GB">128GB</option>
                      <option value="256GB">256GB</option>
                      <option value="512GB">512GB</option>
                      <option value="1TB">1TB</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">Phone Units Qty</label>
                    <input
                      type="number"
                      min="0"
                      value={phoneUnits}
                      onChange={(e) => setPhoneUnits(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full py-2 px-3 text-xs font-mono font-bold bg-white border border-slate-300 rounded-xl outline-none focus:border-indigo-600"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">Unit Price ($)</label>
                    <input
                      type="number"
                      min="0"
                      value={phoneCost}
                      onChange={(e) => setPhoneCost(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-full py-2 px-3 text-xs font-mono font-bold bg-white border border-slate-300 rounded-xl outline-none focus:border-indigo-600"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">Shelf Bin / Location</label>
                    <input
                      type="text"
                      value={shelfBin}
                      onChange={(e) => setShelfBin(e.target.value)}
                      placeholder="e.g. Cabinet A-3"
                      className="w-full py-2 px-3 text-xs font-bold bg-white border border-slate-300 rounded-xl outline-none focus:border-indigo-600"
                    />
                  </div>
                </div>
              </div>

              {/* REPAIR SPARE PARTS CONFIGURATION GRID */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
                    <Wrench size={15} className="text-purple-600" />
                    Matching Repair Parts to Add for {targetModel}
                  </h3>
                  <span className="text-[10px] text-slate-500 font-bold">
                    {spareParts.filter(p => p.enabled).length} Parts Selected
                  </span>
                </div>

                <p className="text-[11px] text-slate-500 font-medium">
                  Check parts you want to initialize for this model. Each selected part will be created as a separate inventory item.
                </p>

                {/* SPARE PARTS GRID */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
                  {spareParts.map((part) => (
                    <div
                      key={part.id}
                      className={`p-3.5 rounded-2xl border transition-all ${
                        part.enabled
                          ? 'bg-white border-purple-400 shadow-sm ring-1 ring-purple-500/10'
                          : 'bg-slate-50/60 border-slate-200 opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 pb-2">
                        <label className="flex items-center gap-2 cursor-pointer flex-1 min-w-0">
                          <input
                            type="checkbox"
                            checked={part.enabled}
                            onChange={() => handleTogglePart(part.id)}
                            className="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500"
                          />
                          <span className="text-xs font-black text-slate-900 truncate">{part.name}</span>
                        </label>
                      </div>

                      {part.enabled && (
                        <div className="space-y-2 pt-2 border-t border-slate-100">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">Pieces Qty</label>
                              <input
                                type="number"
                                min="1"
                                value={part.piecesCount}
                                onChange={(e) => handlePiecesCountChange(part.id, parseInt(e.target.value) || 1)}
                                className="w-full py-1 px-2 text-xs font-mono font-bold bg-white border border-slate-300 rounded-lg outline-none focus:border-purple-600"
                              />
                            </div>
                            <div>
                              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">Unit Cost ($)</label>
                              <input
                                type="number"
                                min="0"
                                value={part.unitCost}
                                onChange={(e) => handleCostChange(part.id, parseFloat(e.target.value) || 0)}
                                className="w-full py-1 px-2 text-xs font-mono font-bold bg-white border border-slate-300 rounded-lg outline-none focus:border-purple-600"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-0.5">Quality Grade</label>
                            <select
                              value={part.quality}
                              onChange={(e) => handleQualityChange(part.id, e.target.value as QualityGrade)}
                              className="w-full py-1 px-2 text-[10px] font-bold bg-white border border-slate-300 rounded-lg outline-none focus:border-purple-600"
                            >
                              <option value="Original / OLED">Original / OLED</option>
                              <option value="OEM Original">OEM Original</option>
                              <option value="Aftermarket">Aftermarket</option>
                              <option value="Refurbished">Refurbished</option>
                              <option value="Premium Copy">Premium Copy</option>
                            </select>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SUBMIT BUTTON BAR */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
            <p className="text-xs text-slate-500 font-medium">
              {entryMode === 'auto_batch' ? (
                <span>Batch Mode: Quick enter quantities per model across {fullCatalog.length} models.</span>
              ) : (
                <span>Configuring model <strong className="text-slate-900">{targetModel}</strong> ({colorVariant}).</span>
              )}
            </p>

            <button
              type="submit"
              className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg shadow-indigo-600/30 transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2"
            >
              <Check size={18} />
              <span>Register & Add Selected Items to Store Inventory</span>
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/85 backdrop-blur-xl overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: 10 }}
        className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-[98vw] xl:max-w-[1600px] h-[95vh] flex flex-col relative overflow-hidden my-auto"
      >
        {/* TOP HEADER - Gradient Banner */}
        <div className="bg-slate-900 text-white p-4 sm:p-6 flex items-center justify-between border-b border-slate-800 relative overflow-hidden shrink-0">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/90 via-purple-900/70 to-slate-900 pointer-events-none" />
          
          <div className="flex items-center gap-3.5 relative z-10">
            <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-600/30 flex items-center justify-center border border-indigo-400/30 shrink-0">
              <Smartphone size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black tracking-tight text-white flex items-center gap-2">
                  Store Phone Models & Repair Parts Manager
                </h2>
                <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full hidden sm:inline-block">
                  Full Page Workspace
                </span>
              </div>
              <p className="text-xs sm:text-sm text-indigo-200 font-medium mt-0.5">
                Register store phone units & initialize matching repair spare parts across {fullCatalog.length}+ phone models
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 relative z-10">
            <button
              type="button"
              onClick={handleExportExcel}
              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer border border-emerald-400/30"
              title="Export Phone Models & MobileSentrix Parts to Excel"
            >
              <FileSpreadsheet size={16} />
              <span className="hidden sm:inline">Export Excel</span>
            </button>
            <button
              type="button"
              onClick={handleExportPDF}
              className="px-3 py-2 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer border border-rose-400/30"
              title="Export Phone Models & MobileSentrix Parts to PDF"
            >
              <FileText size={16} />
              <span className="hidden sm:inline">Export PDF</span>
            </button>

            <button
              onClick={onClose}
              type="button"
              className="p-2.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-2xl transition-all cursor-pointer flex items-center gap-2 bg-slate-800/80 border border-slate-700 ml-1"
            >
              <span className="text-xs font-bold hidden sm:inline">Close Workspace</span>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* MODAL FORM BODY */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 md:p-8 space-y-5 overflow-y-auto flex-1 flex flex-col custom-scrollbar">
          
          {/* TOP MODE SWITCHER */}
          <div className="flex items-center gap-3 p-2 bg-slate-100 rounded-2xl border border-slate-200 shrink-0">
            <button
              type="button"
              onClick={() => setEntryMode('auto_batch')}
              className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                entryMode === 'auto_batch'
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Sparkles size={16} className="text-amber-400 shrink-0" />
              <span>⚡ Automatic Quantity Entry (Model by Model)</span>
              {totalBatchItemsCount > 0 && (
                <span className="bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full ml-1 animate-pulse">
                  {totalBatchItemsCount} Items Ready
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setEntryMode('single_model')}
              className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                entryMode === 'single_model'
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Smartphone size={16} className="text-indigo-400 shrink-0" />
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
              <div className="space-y-4 flex-1 min-h-[420px] overflow-y-auto pr-2 custom-scrollbar">
                {filteredCatalog.map((item) => {
                  const qty = getModelBatchQty(item.id);
                  const heroColor = item.officialColors.find(c => c.isHeroFinish)?.name || item.officialColors[0]?.name || 'Standard';
                  const modelTotalCount = (qty.phoneUnits || 0) + (qty.screen || 0) + (qty.battery || 0) + (qty.port || 0) + (qty.backglass || 0) + (qty.camera || 0) + (qty.board || 0);

                  return (
                    <div
                      key={item.id}
                      className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                        modelTotalCount > 0
                          ? 'bg-indigo-50/50 border-indigo-400 shadow-sm ring-2 ring-indigo-500/20'
                          : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                      }`}
                    >
                      {/* CARD HEADER */}
                      <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-200/80">
                        <div className="flex items-center gap-2.5">
                          <span className="text-[11px] font-black uppercase tracking-wider text-white bg-slate-900 px-3 py-1 rounded-xl shadow-xs">
                            {item.brand}
                          </span>
                          <h3 className="text-base font-black text-slate-900">
                            {item.model}
                          </h3>
                          <span className="text-xs font-semibold text-slate-500">
                            ({item.releaseYear})
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Hero Color Badge */}
                          <span className="text-xs font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-full flex items-center gap-1.5">
                            <span
                              className="w-3 h-3 rounded-full border border-slate-300"
                              style={{ backgroundColor: item.officialColors[0]?.hex || '#64748b' }}
                            />
                            {heroColor}
                          </span>

                          {/* Quick preset buttons */}
                          <button
                            type="button"
                            onClick={() => quickSetAllModelParts(item.id, 1)}
                            className="text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-2.5 py-1 rounded-xl cursor-pointer transition-all active:scale-95"
                          >
                            +1 All
                          </button>

                          <button
                            type="button"
                            onClick={() => updateModelBatchQty(item.id, 'battery', (qty.battery || 0) + 5)}
                            className="text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-xl cursor-pointer transition-all active:scale-95"
                          >
                            +5 Batteries
                          </button>

                          {modelTotalCount > 0 && (
                            <button
                              type="button"
                              onClick={() => clearModelBatchQty(item.id)}
                              className="text-xs font-bold text-rose-600 hover:bg-rose-50 px-2.5 py-1 rounded-xl cursor-pointer transition-all border border-transparent hover:border-rose-200"
                            >
                              Reset
                            </button>
                          )}
                        </div>
                      </div>

                      {/* ITEM QUANTITY INPUTS GRID */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2.5 pt-3.5">
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
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

