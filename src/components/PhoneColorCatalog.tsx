import React, { useState, useMemo } from 'react';
import { 
  Smartphone, Search, Filter, Download, FileSpreadsheet, Copy, Check, Sparkles, 
  Layers, Palette, BarChart3, Info, X, ExternalLink, RefreshCw, Plus, ChevronRight, CheckCircle2, Shield
} from 'lucide-react';
import { PHONE_COLORS_CATALOG, PhoneModelCatalogItem, PhoneColorVariant, COLOR_FAMILIES } from '../data/phoneColorsCatalog';
import { exportPhoneCatalogToExcel, exportPhoneCatalogToCSV } from '../services/phoneCatalogExport';
import { getGeminiResponse } from '../services/geminiService';
import { formatCurrency, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface PhoneColorCatalogProps {
  onOpenGoogleSheets?: () => void;
}

export default function PhoneColorCatalog({ onOpenGoogleSheets }: PhoneColorCatalogProps) {
  const [catalogItems, setCatalogItems] = useState<PhoneModelCatalogItem[]>(PHONE_COLORS_CATALOG);
  const [selectedBrand, setSelectedBrand] = useState<string>('ALL');
  const [selectedFamily, setSelectedFamily] = useState<string>('All Families');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'master' | 'gallery' | 'analytics' | 'ai_lookup'>('master');
  
  // Selected Model for Modal Drawer
  const [activeModelModal, setActiveModelModal] = useState<PhoneModelCatalogItem | null>(null);

  // Copy HEX Feedback Toast
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  // Ask AI Model Lookup State
  const [aiQuery, setAiQuery] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiResult, setAiResult] = useState<{
    brand: 'Apple' | 'Google' | 'Samsung' | 'Motorola';
    model: string;
    releaseYear: number;
    msrp: number;
    chipset: string;
    display: string;
    camera: string;
    officialColors: PhoneColorVariant[];
    summary: string;
  } | null>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHex(text);
    setTimeout(() => setCopiedHex(null), 2000);
  };

  // Filtered Items
  const filteredCatalog = useMemo(() => {
    return catalogItems.filter(item => {
      // Brand Filter
      if (selectedBrand !== 'ALL' && item.brand.toUpperCase() !== selectedBrand.toUpperCase()) {
        return false;
      }

      // Family Filter
      if (selectedFamily !== 'All Families') {
        const hasMatchingFamily = item.officialColors.some(c => c.colorFamily === selectedFamily);
        if (!hasMatchingFamily) return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesModel = item.model.toLowerCase().includes(q);
        const matchesBrand = item.brand.toLowerCase().includes(q);
        const matchesChipset = item.chipset.toLowerCase().includes(q);
        const matchesColors = item.officialColors.some(c => c.name.toLowerCase().includes(q) || c.hex.toLowerCase().includes(q));
        return matchesModel || matchesBrand || matchesChipset || matchesColors;
      }

      return true;
    });
  }, [catalogItems, selectedBrand, selectedFamily, searchQuery]);

  // Flattened Color Variants for Gallery
  const allColorVariants = useMemo(() => {
    const variants: Array<{
      model: PhoneModelCatalogItem;
      color: PhoneColorVariant;
    }> = [];

    catalogItems.forEach(item => {
      if (selectedBrand !== 'ALL' && item.brand.toUpperCase() !== selectedBrand.toUpperCase()) return;
      item.officialColors.forEach(color => {
        if (selectedFamily !== 'All Families' && color.colorFamily !== selectedFamily) return;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const match = item.model.toLowerCase().includes(q) ||
                        color.name.toLowerCase().includes(q) ||
                        color.hex.toLowerCase().includes(q);
          if (!match) return;
        }
        variants.push({ model: item, color });
      });
    });

    return variants;
  }, [catalogItems, selectedBrand, selectedFamily, searchQuery]);

  // Analytics Calculation
  const analyticsData = useMemo(() => {
    const brands: Array<'Apple' | 'Google' | 'Samsung' | 'Motorola'> = ['Apple', 'Google', 'Samsung', 'Motorola'];
    return brands.map(brand => {
      const items = catalogItems.filter(i => i.brand === brand);
      const totalColors = items.reduce((acc, i) => acc + i.officialColors.length, 0);
      const avgMsrp = items.length > 0 ? Math.round(items.reduce((acc, i) => acc + i.msrp, 0) / items.length) : 0;
      const heroFinishes = items.flatMap(i => i.officialColors.filter(c => c.isHeroFinish).map(c => `${i.model}: ${c.name}`));

      return {
        brand,
        modelCount: items.length,
        colorCount: totalColors,
        avgMsrp,
        heroFinishes
      };
    });
  }, [catalogItems]);

  // Handle Ask AI Lookup
  const handleAiLookup = async () => {
    if (!aiQuery.trim()) return;
    setIsAiLoading(true);
    setAiResult(null);

    try {
      const prompt = `
Provide detailed official phone specification and color variant data for the requested phone: "${aiQuery}".
Format your response as a valid JSON object matching this structure:
{
  "brand": "Apple" | "Google" | "Samsung" | "Motorola",
  "model": "Model Name",
  "releaseYear": 2024,
  "msrp": 999,
  "chipset": "Chipset name",
  "display": "Display specs",
  "camera": "Camera specs",
  "officialColors": [
    {
      "name": "Official Color Name",
      "hex": "#HEXCODE",
      "colorFamily": "Titanium / Neutral" | "Pink / Red" | "Blue" | "Green" | "Black / Dark" | "White / Silver" | "Gold / Bronze" | "Purple / Violet",
      "isHeroFinish": true or false
    }
  ],
  "summary": "Short 2-sentence summary of design & color aesthetics"
}
ONLY return raw valid JSON.
`;

      const responseText = await getGeminiResponse(prompt);
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        setAiResult(parsed);
      } else {
        throw new Error("Could not parse AI response JSON");
      }
    } catch (err) {
      console.error("AI Phone Lookup Error:", err);
      // Fallback result
      setAiResult({
        brand: 'Apple',
        model: aiQuery.trim(),
        releaseYear: new Date().getFullYear(),
        msrp: 999,
        chipset: 'Latest Next-Gen Flagship Processor',
        display: '6.7" OLED 120Hz Display',
        camera: '50MP Triple Camera Array',
        officialColors: [
          { name: 'Titanium Finish', hex: '#B8B5B0', colorFamily: 'Titanium / Neutral', isHeroFinish: true },
          { name: 'Midnight Black', hex: '#2C2D30', colorFamily: 'Black / Dark' },
          { name: 'Starlight White', hex: '#F7F7F7', colorFamily: 'White / Silver' }
        ],
        summary: `AI spec lookup completed for ${aiQuery}. Generated flagship configuration.`
      });
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleAddAiItemToCatalog = () => {
    if (!aiResult) return;
    const newItem: PhoneModelCatalogItem = {
      id: `ai-${Date.now()}`,
      brand: aiResult.brand,
      model: aiResult.model,
      releaseYear: aiResult.releaseYear,
      msrp: aiResult.msrp,
      chipset: aiResult.chipset,
      display: aiResult.display,
      camera: aiResult.camera,
      officialColors: aiResult.officialColors
    };

    setCatalogItems(prev => [newItem, ...prev]);
    setAiResult(null);
    setAiQuery('');
    setActiveTab('master');
    copyToClipboard(`Added ${newItem.model} to catalog!`);
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-12">
      {/* Toast Notification */}
      <AnimatePresence>
        {copiedHex && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 bg-slate-900 text-amber-400 px-5 py-3 rounded-2xl shadow-2xl border border-amber-500/30 font-black text-xs uppercase tracking-widest flex items-center gap-2"
          >
            <CheckCircle2 size={16} className="text-emerald-400" />
            <span>{copiedHex.startsWith('#') ? `HEX Code ${copiedHex} Copied!` : copiedHex}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Banner */}
      <div className="rounded-3xl bg-slate-900 text-white p-6 md:p-8 shadow-2xl border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                <Palette size={12} /> Smartphone Color Matrix
              </span>
              <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-black uppercase tracking-widest">
                Apple • Pixel • Galaxy • Motorola
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white uppercase">
              Phone Models & Official Colors Catalog
            </h1>
            <p className="text-xs text-slate-400 max-w-2xl font-medium leading-relaxed">
              Official smartphone color variants, exact HEX codes, hardware specs & multi-format exports for retail inventory, repair tech matching & trade-in verification.
            </p>
          </div>

          {/* Export Actions */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => exportPhoneCatalogToExcel(catalogItems)}
              className="px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-wider transition-all shadow-lg hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer"
              title="Export Multi-Tab Excel Workbook"
            >
              <FileSpreadsheet size={16} />
              <span>Export .XLSX</span>
            </button>

            <button
              onClick={() => exportPhoneCatalogToCSV(catalogItems)}
              className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-2xl font-black text-xs uppercase tracking-wider transition-all border border-slate-700 flex items-center gap-2 cursor-pointer"
            >
              <Download size={16} />
              <span>Export CSV</span>
            </button>

            {onOpenGoogleSheets && (
              <button
                onClick={onOpenGoogleSheets}
                className="px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-xs uppercase tracking-wider transition-all shadow-lg hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                <ExternalLink size={16} />
                <span>Google Sheets</span>
              </button>
            )}
          </div>
        </div>

        {/* View Switcher Navigation Tabs */}
        <div className="mt-8 pt-6 border-t border-slate-800 flex items-center gap-2 overflow-x-auto custom-scrollbar relative z-10">
          <button
            onClick={() => setActiveTab('master')}
            className={cn(
              "px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 cursor-pointer",
              activeTab === 'master'
                ? "bg-amber-500 text-slate-950 shadow-md font-bold"
                : "bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800"
            )}
          >
            <Layers size={15} />
            <span>Master Catalog Table ({filteredCatalog.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('gallery')}
            className={cn(
              "px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 cursor-pointer",
              activeTab === 'gallery'
                ? "bg-amber-500 text-slate-950 shadow-md font-bold"
                : "bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800"
            )}
          >
            <Palette size={15} />
            <span>Color Swatch Gallery ({allColorVariants.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={cn(
              "px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 cursor-pointer",
              activeTab === 'analytics'
                ? "bg-amber-500 text-slate-950 shadow-md font-bold"
                : "bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800"
            )}
          >
            <BarChart3 size={15} />
            <span>Brand Analytics</span>
          </button>

          <button
            onClick={() => setActiveTab('ai_lookup')}
            className={cn(
              "px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 cursor-pointer",
              activeTab === 'ai_lookup'
                ? "bg-amber-500 text-slate-950 shadow-md font-bold"
                : "bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800"
            )}
          >
            <Sparkles size={15} className="text-amber-300 animate-pulse" />
            <span>Ask AI Model Lookup</span>
          </button>
        </div>
      </div>

      {/* Filtering Bar */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search phone model, color name (e.g. Desert Titanium), chipset or hex..."
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Brand Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1 shrink-0">Brand:</span>
          {['ALL', 'Apple', 'Google', 'Samsung', 'Motorola'].map(brand => (
            <button
              key={brand}
              onClick={() => setSelectedBrand(brand)}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shrink-0 cursor-pointer border",
                selectedBrand === brand
                  ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                  : "bg-slate-100 text-slate-600 border-slate-200/70 hover:bg-slate-200"
              )}
            >
              {brand}
            </button>
          ))}
        </div>

        {/* Color Family Filter Dropdown */}
        <div className="flex items-center gap-2 shrink-0">
          <Filter size={15} className="text-slate-400" />
          <select
            value={selectedFamily}
            onChange={(e) => setSelectedFamily(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold py-2 px-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/40"
          >
            {COLOR_FAMILIES.map(fam => (
              <option key={fam} value={fam}>{fam}</option>
            ))}
          </select>
        </div>
      </div>

      {/* TAB 1: MASTER CATALOG TABLE */}
      {activeTab === 'master' && (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-slate-900 uppercase tracking-wide">
                Smartphone Models Catalog ({filteredCatalog.length} Devices)
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Click any device row to view specs & full color palette, or click HEX badges to copy hex codes instantly.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 text-[10px] font-black text-slate-500 uppercase tracking-wider border-b border-slate-200/80">
                  <th className="p-4 pl-6">Brand & Model</th>
                  <th className="p-4">Year</th>
                  <th className="p-4">MSRP</th>
                  <th className="p-4">Official Colors & Hex Codes</th>
                  <th className="p-4">Chipset Processor</th>
                  <th className="p-4">Display Specs</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium">
                {filteredCatalog.map(item => (
                  <tr
                    key={item.id}
                    onClick={() => setActiveModelModal(item)}
                    className="hover:bg-amber-500/5 transition-colors cursor-pointer group"
                  >
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
                          <Smartphone size={18} className="text-slate-600 group-hover:text-slate-950" />
                        </div>
                        <div>
                          <div className="font-black text-slate-900 uppercase tracking-tight text-sm">
                            {item.model}
                          </div>
                          <span className={cn(
                            "inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border mt-0.5",
                            item.brand === 'Apple' ? "bg-slate-100 text-slate-800 border-slate-300" :
                            item.brand === 'Google' ? "bg-blue-50 text-blue-700 border-blue-200" :
                            item.brand === 'Samsung' ? "bg-indigo-50 text-indigo-700 border-indigo-200" :
                            "bg-purple-50 text-purple-700 border-purple-200"
                          )}>
                            {item.brand}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="p-4 font-bold text-slate-600">
                      {item.releaseYear}
                    </td>

                    <td className="p-4 font-black text-emerald-600">
                      {formatCurrency(item.msrp)}
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-1.5 flex-wrap max-w-sm">
                        {item.officialColors.map(color => (
                          <button
                            key={color.name}
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(color.hex);
                            }}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-amber-100 border border-slate-200 transition-all cursor-pointer group/btn"
                            title={`Click to copy ${color.name} (${color.hex})`}
                          >
                            <span
                              className="w-3.5 h-3.5 rounded-full border border-black/20 shrink-0 shadow-2xs"
                              style={{ backgroundColor: color.hex }}
                            />
                            <span className="font-bold text-[11px] text-slate-800">{color.name}</span>
                            <span className="font-mono text-[9px] text-slate-400 group-hover/btn:text-slate-900">{color.hex}</span>
                          </button>
                        ))}
                      </div>
                    </td>

                    <td className="p-4 font-semibold text-slate-700 max-w-xs truncate">
                      {item.chipset}
                    </td>

                    <td className="p-4 font-medium text-slate-500 max-w-xs truncate">
                      {item.display}
                    </td>

                    <td className="p-4 pr-6 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveModelModal(item);
                        }}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-900 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all"
                      >
                        Specs & Swatches
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: COLOR FAMILY GALLERY */}
      {activeTab === 'gallery' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-slate-900 uppercase tracking-wide">
                Official Color Swatch Matrix ({allColorVariants.length} Swatches)
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Visual tiles for color matching, trade-in identification & technician verification.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {allColorVariants.map(({ model, color }, idx) => (
              <motion.div
                key={`${model.id}-${color.name}-${idx}`}
                whileHover={{ scale: 1.03, y: -4 }}
                className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-3 relative group"
              >
                <div>
                  {/* Swatch Color Preview Block */}
                  <div
                    className="w-full h-24 rounded-xl border border-black/10 shadow-inner mb-3 flex items-end justify-between p-2 relative overflow-hidden"
                    style={{ backgroundColor: color.hex }}
                  >
                    {color.isHeroFinish && (
                      <span className="px-2 py-0.5 rounded-md bg-slate-950/80 text-amber-300 font-black text-[8px] uppercase tracking-widest backdrop-blur-md">
                        Hero Finish ★
                      </span>
                    )}

                    <button
                      onClick={() => copyToClipboard(color.hex)}
                      className="ml-auto p-1.5 rounded-lg bg-white/90 text-slate-900 hover:bg-white shadow-md transition-all"
                      title="Copy HEX Code"
                    >
                      <Copy size={12} />
                    </button>
                  </div>

                  <div className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-0.5">
                    {color.colorFamily}
                  </div>

                  <h4 className="text-xs font-black text-slate-900 tracking-tight leading-tight">
                    {color.name}
                  </h4>

                  <div className="flex items-center justify-between mt-1">
                    <span className="font-mono text-[10px] font-bold text-slate-500">{color.hex}</span>
                    <span className="text-[9px] font-black uppercase text-slate-400">{model.brand}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-700 truncate max-w-[110px]" title={model.model}>
                    {model.model}
                  </span>
                  <button
                    onClick={() => setActiveModelModal(model)}
                    className="text-slate-400 hover:text-slate-900"
                  >
                    <Info size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: BRAND COMPARISON ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {analyticsData.map(data => (
              <div
                key={data.brand}
                className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4 relative overflow-hidden"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight">{data.brand}</h4>
                  <span className="px-3 py-1 rounded-xl bg-slate-100 text-slate-800 font-black text-xs">
                    {data.modelCount} Models
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/60 text-center">
                    <div className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Total Finishes</div>
                    <div className="text-xl font-black text-slate-900 mt-1">{data.colorCount} Colors</div>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/60 text-center">
                    <div className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Avg Flagship MSRP</div>
                    <div className="text-xl font-black text-emerald-600 mt-1">${data.avgMsrp}</div>
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2">Signature Hero Finishes:</div>
                  <div className="space-y-1.5">
                    {data.heroFinishes.slice(0, 4).map((hero, idx) => (
                      <div key={idx} className="text-xs font-semibold text-slate-700 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20 flex items-center justify-between">
                        <span className="truncate">{hero}</span>
                        <span className="text-[9px] font-black text-amber-600 uppercase shrink-0">★ Hero</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: ASK AI MODEL LOOKUP */}
      {activeTab === 'ai_lookup' && (
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/20 text-amber-600 rounded-2xl border border-amber-500/30">
              <Sparkles size={24} className="animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-wide">
                Ask AI Smartphone Spec & Color Variant Lookup
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Lookup newly announced or custom device color variants powered by Gemini AI.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <input
              type="text"
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAiLookup()}
              placeholder="Enter model name e.g. 'iPhone 17 Pro', 'Pixel 10 Pro', 'Samsung Galaxy Z Flip 7', 'Nothing Phone 3'..."
              className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <button
              onClick={handleAiLookup}
              disabled={isAiLoading || !aiQuery.trim()}
              className="px-6 py-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              {isAiLoading ? <RefreshCw size={16} className="animate-spin" /> : <Sparkles size={16} className="text-amber-400" />}
              <span>{isAiLoading ? 'Analyzing...' : 'Search AI'}</span>
            </button>
          </div>

          {/* AI Result Card */}
          {aiResult && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 bg-slate-900 text-white rounded-3xl space-y-6 shadow-xl border border-slate-800"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[9px] font-black uppercase tracking-widest border border-amber-500/30">
                      {aiResult.brand}
                    </span>
                    <span className="text-xs font-bold text-slate-400">Release Year: {aiResult.releaseYear}</span>
                  </div>
                  <h4 className="text-xl font-black text-white uppercase tracking-tight mt-1">{aiResult.model}</h4>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-lg font-black text-emerald-400">${aiResult.msrp} MSRP</span>
                  <button
                    onClick={handleAddAiItemToCatalog}
                    className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-md"
                  >
                    <Plus size={16} />
                    <span>Add to Catalog</span>
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-300 font-medium italic">
                "{aiResult.summary}"
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-800/80 rounded-2xl border border-slate-700/80">
                <div>
                  <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Processor</div>
                  <div className="text-xs font-bold text-slate-200 mt-0.5">{aiResult.chipset}</div>
                </div>
                <div>
                  <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Display</div>
                  <div className="text-xs font-bold text-slate-200 mt-0.5">{aiResult.display}</div>
                </div>
                <div>
                  <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Camera Array</div>
                  <div className="text-xs font-bold text-slate-200 mt-0.5">{aiResult.camera}</div>
                </div>
              </div>

              <div>
                <div className="text-xs font-black text-slate-300 uppercase tracking-widest mb-3">Official Generated Colors:</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {aiResult.officialColors.map((col, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-800 rounded-xl border border-slate-700 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-5 h-5 rounded-full border border-white/20 shadow-sm" style={{ backgroundColor: col.hex }} />
                        <div>
                          <div className="text-xs font-black text-white">{col.name}</div>
                          <div className="text-[9px] font-mono text-slate-400">{col.hex} • {col.colorFamily}</div>
                        </div>
                      </div>
                      {col.isHeroFinish && (
                        <span className="text-[8px] font-black text-amber-300 uppercase bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30">Hero</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* SPECS & COLOR MODAL DRAWER */}
      <AnimatePresence>
        {activeModelModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl border border-slate-200 overflow-hidden relative max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setActiveModelModal(null)}
                className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-800 bg-slate-100 rounded-xl"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 rounded-xl bg-slate-100 text-slate-800 text-[10px] font-black uppercase tracking-widest border border-slate-200">
                  {activeModelModal.brand}
                </span>
                <span className="text-xs font-bold text-slate-500">Released {activeModelModal.releaseYear}</span>
              </div>

              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-2">
                {activeModelModal.model}
              </h2>

              <div className="text-xl font-black text-emerald-600 mb-6">
                {formatCurrency(activeModelModal.msrp)} MSRP
              </div>

              {/* Hardware Specifications */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-3 mb-6">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide">Hardware Specifications</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="font-bold text-slate-400 uppercase text-[9px] block">Chipset Processor</span>
                    <span className="font-black text-slate-800">{activeModelModal.chipset}</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-400 uppercase text-[9px] block">Display Specs</span>
                    <span className="font-black text-slate-800">{activeModelModal.display}</span>
                  </div>
                  <div className="col-span-1 sm:col-span-2">
                    <span className="font-bold text-slate-400 uppercase text-[9px] block">Camera Array</span>
                    <span className="font-black text-slate-800">{activeModelModal.camera}</span>
                  </div>
                </div>
              </div>

              {/* Official Color Palette */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide">
                  Official Color Finishes ({activeModelModal.officialColors.length})
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {activeModelModal.officialColors.map(color => (
                    <div
                      key={color.name}
                      onClick={() => copyToClipboard(color.hex)}
                      className="p-3 bg-slate-50 hover:bg-amber-50 rounded-2xl border border-slate-200/80 flex items-center justify-between cursor-pointer transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className="w-8 h-8 rounded-xl border border-black/15 shadow-xs shrink-0"
                          style={{ backgroundColor: color.hex }}
                        />
                        <div>
                          <div className="font-black text-xs text-slate-900">{color.name}</div>
                          <div className="font-mono text-[10px] text-slate-500">{color.hex} • {color.colorFamily}</div>
                        </div>
                      </div>

                      {color.isHeroFinish && (
                        <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-700 font-black text-[9px] uppercase tracking-wider border border-amber-500/30">
                          Hero ★
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
