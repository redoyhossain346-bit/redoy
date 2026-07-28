import ExcelJS from 'exceljs';
import { PhoneModelCatalogItem, PhoneColorVariant } from '../data/phoneColorsCatalog';

export async function exportPhoneCatalogToExcel(items: PhoneModelCatalogItem[]): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'All Cellular & Repair - Device Catalog Engine';
  workbook.created = new Date();

  // Helper to format header row
  const formatHeader = (sheet: ExcelJS.Worksheet) => {
    const headerRow = sheet.getRow(1);
    headerRow.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '1E293B' } // Slate 800
    };
    headerRow.height = 24;
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
  };

  // ---------------- SHEET 1: MASTER CATALOG ----------------
  const masterSheet = workbook.addWorksheet('Master Catalog');
  masterSheet.columns = [
    { header: 'Brand', key: 'brand', width: 14 },
    { header: 'Model Name', key: 'model', width: 26 },
    { header: 'Release Year', key: 'releaseYear', width: 14 },
    { header: 'Official Color Name', key: 'colorName', width: 24 },
    { header: 'Color HEX', key: 'hex', width: 14 },
    { header: 'Color Family', key: 'colorFamily', width: 20 },
    { header: 'Hero Finish', key: 'isHero', width: 12 },
    { header: 'MSRP ($)', key: 'msrp', width: 12 },
    { header: 'Chipset Processor', key: 'chipset', width: 26 },
    { header: 'Display Specs', key: 'display', width: 32 },
    { header: 'Camera Hardware', key: 'camera', width: 36 },
  ];
  formatHeader(masterSheet);

  items.forEach(item => {
    item.officialColors.forEach(color => {
      const row = masterSheet.addRow({
        brand: item.brand,
        model: item.model,
        releaseYear: item.releaseYear,
        colorName: color.name,
        hex: color.hex,
        colorFamily: color.colorFamily,
        isHero: color.isHeroFinish ? 'YES ★' : 'NO',
        msrp: item.msrp,
        chipset: item.chipset,
        display: item.display,
        camera: item.camera
      });

      // Style hex cell with actual color background if valid
      const hexCell = row.getCell('hex');
      const cleanHex = color.hex.replace('#', '');
      if (cleanHex.length === 6) {
        hexCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF' + cleanHex }
        };
        // Determine light vs dark text contrast
        const r = parseInt(cleanHex.substring(0, 2), 16);
        const g = parseInt(cleanHex.substring(2, 4), 16);
        const b = parseInt(cleanHex.substring(4, 6), 16);
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        hexCell.font = {
          color: { argb: brightness > 128 ? 'FF000000' : 'FFFFFFFF' },
          bold: true
        };
        hexCell.alignment = { horizontal: 'center' };
      }
    });
  });

  // ---------------- BRAND SPECIFIC SHEETS ----------------
  const brands: Array<'Apple' | 'Google' | 'Samsung' | 'Motorola'> = ['Apple', 'Google', 'Samsung', 'Motorola'];
  brands.forEach(brand => {
    const brandItems = items.filter(i => i.brand === brand);
    if (brandItems.length === 0) return;

    const sheet = workbook.addWorksheet(`${brand} Catalog`);
    sheet.columns = [
      { header: 'Model', key: 'model', width: 26 },
      { header: 'Official Color Variant', key: 'colorName', width: 24 },
      { header: 'HEX', key: 'hex', width: 14 },
      { header: 'Color Family', key: 'colorFamily', width: 20 },
      { header: 'MSRP ($)', key: 'msrp', width: 12 },
      { header: 'Chipset', key: 'chipset', width: 24 },
      { header: 'Display', key: 'display', width: 30 }
    ];
    formatHeader(sheet);

    brandItems.forEach(item => {
      item.officialColors.forEach(color => {
        const row = sheet.addRow({
          model: item.model,
          colorName: color.name,
          hex: color.hex,
          colorFamily: color.colorFamily,
          msrp: item.msrp,
          chipset: item.chipset,
          display: item.display
        });

        const hexCell = row.getCell('hex');
        const cleanHex = color.hex.replace('#', '');
        if (cleanHex.length === 6) {
          hexCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF' + cleanHex }
          };
          const r = parseInt(cleanHex.substring(0, 2), 16);
          const g = parseInt(cleanHex.substring(2, 4), 16);
          const b = parseInt(cleanHex.substring(4, 6), 16);
          const brightness = (r * 299 + g * 587 + b * 114) / 1000;
          hexCell.font = { color: { argb: brightness > 128 ? 'FF000000' : 'FFFFFFFF' }, bold: true };
          hexCell.alignment = { horizontal: 'center' };
        }
      });
    });
  });

  // ---------------- SHEET 6: COLOR FAMILY MATRIX ----------------
  const matrixSheet = workbook.addWorksheet('Color Family Matrix');
  matrixSheet.columns = [
    { header: 'Color Family Category', key: 'family', width: 26 },
    { header: 'Apple Variants', key: 'appleCount', width: 16 },
    { header: 'Google Variants', key: 'googleCount', width: 16 },
    { header: 'Samsung Variants', key: 'samsungCount', width: 18 },
    { header: 'Motorola Variants', key: 'motorolaCount', width: 18 },
    { header: 'Total Industry Color Count', key: 'totalCount', width: 24 }
  ];
  formatHeader(matrixSheet);

  const families = [
    'Titanium / Neutral',
    'Pink / Red',
    'Blue',
    'Green',
    'Black / Dark',
    'White / Silver',
    'Gold / Bronze',
    'Purple / Violet'
  ];

  families.forEach(family => {
    let apple = 0, google = 0, samsung = 0, motorola = 0;
    items.forEach(item => {
      item.officialColors.forEach(c => {
        if (c.colorFamily === family) {
          if (item.brand === 'Apple') apple++;
          else if (item.brand === 'Google') google++;
          else if (item.brand === 'Samsung') samsung++;
          else if (item.brand === 'Motorola') motorola++;
        }
      });
    });

    matrixSheet.addRow({
      family,
      appleCount: apple,
      googleCount: google,
      samsungCount: samsung,
      motorolaCount: motorola,
      totalCount: apple + google + samsung + motorola
    });
  });

  // Generate buffer and trigger browser download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `Phone_Models_Official_Colors_Catalog_${new Date().toISOString().split('T')[0]}.xlsx`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export function exportPhoneCatalogToCSV(items: PhoneModelCatalogItem[]): void {
  const headers = ['Brand', 'Model', 'Release Year', 'Official Color Name', 'HEX Code', 'Color Family', 'Is Hero Finish', 'MSRP ($)', 'Chipset', 'Display', 'Camera'];
  const rows: string[][] = [headers];

  items.forEach(item => {
    item.officialColors.forEach(color => {
      rows.push([
        `"${item.brand}"`,
        `"${item.model}"`,
        `"${item.releaseYear}"`,
        `"${color.name}"`,
        `"${color.hex}"`,
        `"${color.colorFamily}"`,
        `"${color.isHeroFinish ? 'Yes' : 'No'}"`,
        `"${item.msrp}"`,
        `"${item.chipset.replace(/"/g, '""')}"`,
        `"${item.display.replace(/"/g, '""')}"`,
        `"${item.camera.replace(/"/g, '""')}"`
      ]);
    });
  });

  const csvContent = rows.map(r => r.join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Phone_Models_Official_Colors_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
