export interface PhoneColorVariant {
  name: string;
  hex: string;
  colorFamily: 'Titanium / Neutral' | 'Pink / Red' | 'Blue' | 'Green' | 'Black / Dark' | 'White / Silver' | 'Gold / Bronze' | 'Purple / Violet' | 'Orange / Yellow';
  isHeroFinish?: boolean;
}

export interface PhoneModelCatalogItem {
  id: string;
  brand: string;
  model: string;
  releaseYear: number;
  msrp?: number;
  chipset?: string;
  display?: string;
  camera?: string;
  officialColors: PhoneColorVariant[];
}

export const COLOR_FAMILIES = [
  'All Families',
  'Titanium / Neutral',
  'Pink / Red',
  'Blue',
  'Green',
  'Black / Dark',
  'White / Silver',
  'Gold / Bronze',
  'Purple / Violet',
  'Orange / Yellow'
] as const;

export const PHONE_COLORS_CATALOG: PhoneModelCatalogItem[] = [
  // ==========================================
  // APPLE IPHONE MODELS (COMPLETE CATALOG)
  // ==========================================
  {
    id: 'apple-iphone-17-pro-max',
    brand: 'Apple',
    model: 'iPhone 17 Pro Max',
    releaseYear: 2025,
    msrp: 1299,
    chipset: 'Apple A19 Pro (2nm)',
    display: '6.9" Super Retina XDR OLED (120Hz ProMotion + Anti-Reflective)',
    camera: '48MP Main + 48MP Ultra Wide + 48MP Periscope Telephoto',
    officialColors: [
      { name: 'Cosmic Orange', hex: '#E65100', colorFamily: 'Orange / Yellow', isHeroFinish: true },
      { name: 'Deep Blue', hex: '#0F1B2A', colorFamily: 'Blue' },
      { name: 'Silver', hex: '#E0E0E2', colorFamily: 'White / Silver' }
    ]
  },
  {
    id: 'apple-iphone-17-pro',
    brand: 'Apple',
    model: 'iPhone 17 Pro',
    releaseYear: 2025,
    msrp: 1099,
    chipset: 'Apple A19 Pro (2nm)',
    display: '6.3" Super Retina XDR OLED (120Hz ProMotion + Anti-Reflective)',
    camera: '48MP Main + 48MP Ultra Wide + 48MP Telephoto',
    officialColors: [
      { name: 'Cosmic Orange', hex: '#E65100', colorFamily: 'Orange / Yellow', isHeroFinish: true },
      { name: 'Deep Blue', hex: '#0F1B2A', colorFamily: 'Blue' },
      { name: 'Silver', hex: '#E0E0E2', colorFamily: 'White / Silver' }
    ]
  },
  {
    id: 'apple-iphone-17-air',
    brand: 'Apple',
    model: 'iPhone 17 Air / Slim',
    releaseYear: 2025,
    msrp: 999,
    chipset: 'Apple A19',
    display: '6.6" Super Retina XDR OLED (120Hz ProMotion, Ultra Thin 5mm)',
    camera: '48MP Single Fusion Camera',
    officialColors: [
      { name: 'Liquid Platinum', hex: '#E5E4E2', colorFamily: 'White / Silver', isHeroFinish: true },
      { name: 'Champagne Gold', hex: '#F7E7CE', colorFamily: 'Gold / Bronze' },
      { name: 'Obsidian Black', hex: '#1C1C1E', colorFamily: 'Black / Dark' },
      { name: 'Sky Blue', hex: '#87CEEB', colorFamily: 'Blue' }
    ]
  },
  {
    id: 'apple-iphone-17-plus',
    brand: 'Apple',
    model: 'iPhone 17 Plus',
    releaseYear: 2025,
    msrp: 899,
    chipset: 'Apple A19',
    display: '6.7" Super Retina XDR OLED (120Hz)',
    camera: '48MP Main + 48MP Ultra Wide',
    officialColors: [
      { name: 'Deep Emerald', hex: '#004B3B', colorFamily: 'Green', isHeroFinish: true },
      { name: 'Cobalt Blue', hex: '#0047AB', colorFamily: 'Blue' },
      { name: 'Blush Pink', hex: '#FFD1DC', colorFamily: 'Pink / Red' },
      { name: 'Pure White', hex: '#FFFFFF', colorFamily: 'White / Silver' },
      { name: 'Midnight', hex: '#2C2D30', colorFamily: 'Black / Dark' }
    ]
  },
  {
    id: 'apple-iphone-17',
    brand: 'Apple',
    model: 'iPhone 17',
    releaseYear: 2025,
    msrp: 799,
    chipset: 'Apple A19',
    display: '6.1" Super Retina XDR OLED (120Hz ProMotion)',
    camera: '48MP Main + 48MP Ultra Wide',
    officialColors: [
      { name: 'Deep Emerald', hex: '#004B3B', colorFamily: 'Green', isHeroFinish: true },
      { name: 'Cobalt Blue', hex: '#0047AB', colorFamily: 'Blue' },
      { name: 'Blush Pink', hex: '#FFD1DC', colorFamily: 'Pink / Red' },
      { name: 'Pure White', hex: '#FFFFFF', colorFamily: 'White / Silver' },
      { name: 'Midnight', hex: '#2C2D30', colorFamily: 'Black / Dark' }
    ]
  },
  {
    id: 'apple-iphone-16-pro-max',
    brand: 'Apple',
    model: 'iPhone 16 Pro Max',
    releaseYear: 2024,
    msrp: 1199,
    chipset: 'Apple A18 Pro',
    display: '6.9" Super Retina XDR OLED (120Hz ProMotion)',
    camera: '48MP Main + 48MP Ultra Wide + 12MP 5x Telephoto',
    officialColors: [
      { name: 'Desert Titanium', hex: '#C3B1A0', colorFamily: 'Titanium / Neutral', isHeroFinish: true },
      { name: 'Natural Titanium', hex: '#B8B5B0', colorFamily: 'Titanium / Neutral' },
      { name: 'White Titanium', hex: '#F2F1ED', colorFamily: 'White / Silver' },
      { name: 'Black Titanium', hex: '#3B3B3D', colorFamily: 'Black / Dark' }
    ]
  },
  {
    id: 'apple-iphone-16-pro',
    brand: 'Apple',
    model: 'iPhone 16 Pro',
    releaseYear: 2024,
    msrp: 999,
    chipset: 'Apple A18 Pro',
    display: '6.3" Super Retina XDR OLED (120Hz ProMotion)',
    camera: '48MP Main + 48MP Ultra Wide + 12MP 5x Telephoto',
    officialColors: [
      { name: 'Desert Titanium', hex: '#C3B1A0', colorFamily: 'Titanium / Neutral', isHeroFinish: true },
      { name: 'Natural Titanium', hex: '#B8B5B0', colorFamily: 'Titanium / Neutral' },
      { name: 'White Titanium', hex: '#F2F1ED', colorFamily: 'White / Silver' },
      { name: 'Black Titanium', hex: '#3B3B3D', colorFamily: 'Black / Dark' }
    ]
  },
  {
    id: 'apple-iphone-16-plus',
    brand: 'Apple',
    model: 'iPhone 16 Plus',
    releaseYear: 2024,
    msrp: 899,
    chipset: 'Apple A18',
    display: '6.7" Super Retina XDR OLED',
    camera: '48MP Fusion + 12MP Ultra Wide',
    officialColors: [
      { name: 'Ultramarine', hex: '#5E6A8A', colorFamily: 'Blue', isHeroFinish: true },
      { name: 'Teal', hex: '#4B8380', colorFamily: 'Green' },
      { name: 'Pink', hex: '#EAC0C8', colorFamily: 'Pink / Red' },
      { name: 'White', hex: '#F7F7F7', colorFamily: 'White / Silver' },
      { name: 'Black', hex: '#2C2D30', colorFamily: 'Black / Dark' }
    ]
  },
  {
    id: 'apple-iphone-16',
    brand: 'Apple',
    model: 'iPhone 16',
    releaseYear: 2024,
    msrp: 799,
    chipset: 'Apple A18',
    display: '6.1" Super Retina XDR OLED',
    camera: '48MP Fusion + 12MP Ultra Wide',
    officialColors: [
      { name: 'Ultramarine', hex: '#5E6A8A', colorFamily: 'Blue', isHeroFinish: true },
      { name: 'Teal', hex: '#4B8380', colorFamily: 'Green' },
      { name: 'Pink', hex: '#EAC0C8', colorFamily: 'Pink / Red' },
      { name: 'White', hex: '#F7F7F7', colorFamily: 'White / Silver' },
      { name: 'Black', hex: '#2C2D30', colorFamily: 'Black / Dark' }
    ]
  },
  {
    id: 'apple-iphone-16e',
    brand: 'Apple',
    model: 'iPhone 16e',
    releaseYear: 2025,
    msrp: 599,
    chipset: 'Apple A18',
    display: '6.1" Super Retina XDR OLED',
    camera: '48MP Fusion Camera',
    officialColors: [
      { name: 'Black', hex: '#2C2D30', colorFamily: 'Black / Dark' },
      { name: 'White', hex: '#F7F7F7', colorFamily: 'White / Silver' },
      { name: 'Blue', hex: '#6A829E', colorFamily: 'Blue' }
    ]
  },
  {
    id: 'apple-iphone-15-pro-max',
    brand: 'Apple',
    model: 'iPhone 15 Pro Max',
    releaseYear: 2023,
    msrp: 1199,
    chipset: 'Apple A17 Pro',
    display: '6.7" Super Retina XDR OLED (120Hz ProMotion)',
    camera: '48MP Main + 12MP Ultra Wide + 12MP 5x Telephoto',
    officialColors: [
      { name: 'Natural Titanium', hex: '#B8B5B0', colorFamily: 'Titanium / Neutral', isHeroFinish: true },
      { name: 'Blue Titanium', hex: '#3B4859', colorFamily: 'Blue' },
      { name: 'White Titanium', hex: '#F2F1ED', colorFamily: 'White / Silver' },
      { name: 'Black Titanium', hex: '#3B3B3D', colorFamily: 'Black / Dark' }
    ]
  },
  {
    id: 'apple-iphone-15-pro',
    brand: 'Apple',
    model: 'iPhone 15 Pro',
    releaseYear: 2023,
    msrp: 999,
    chipset: 'Apple A17 Pro',
    display: '6.1" Super Retina XDR OLED (120Hz ProMotion)',
    camera: '48MP Main + 12MP Ultra Wide + 12MP 3x Telephoto',
    officialColors: [
      { name: 'Natural Titanium', hex: '#B8B5B0', colorFamily: 'Titanium / Neutral', isHeroFinish: true },
      { name: 'Blue Titanium', hex: '#3B4859', colorFamily: 'Blue' },
      { name: 'White Titanium', hex: '#F2F1ED', colorFamily: 'White / Silver' },
      { name: 'Black Titanium', hex: '#3B3B3D', colorFamily: 'Black / Dark' }
    ]
  },
  {
    id: 'apple-iphone-15-plus',
    brand: 'Apple',
    model: 'iPhone 15 Plus',
    releaseYear: 2023,
    msrp: 799,
    chipset: 'Apple A16 Bionic',
    display: '6.7" Super Retina XDR OLED',
    camera: '48MP Main + 12MP Ultra Wide',
    officialColors: [
      { name: 'Pink', hex: '#F4D3D9', colorFamily: 'Pink / Red', isHeroFinish: true },
      { name: 'Yellow', hex: '#F3ECB9', colorFamily: 'Gold / Bronze' },
      { name: 'Green', hex: '#D8E2DC', colorFamily: 'Green' },
      { name: 'Blue', hex: '#D3E1E9', colorFamily: 'Blue' },
      { name: 'Black', hex: '#2D3136', colorFamily: 'Black / Dark' }
    ]
  },
  {
    id: 'apple-iphone-15',
    brand: 'Apple',
    model: 'iPhone 15',
    releaseYear: 2023,
    msrp: 699,
    chipset: 'Apple A16 Bionic',
    display: '6.1" Super Retina XDR OLED',
    camera: '48MP Main + 12MP Ultra Wide',
    officialColors: [
      { name: 'Pink', hex: '#F4D3D9', colorFamily: 'Pink / Red', isHeroFinish: true },
      { name: 'Yellow', hex: '#F3ECB9', colorFamily: 'Gold / Bronze' },
      { name: 'Green', hex: '#D8E2DC', colorFamily: 'Green' },
      { name: 'Blue', hex: '#D3E1E9', colorFamily: 'Blue' },
      { name: 'Black', hex: '#2D3136', colorFamily: 'Black / Dark' }
    ]
  },
  {
    id: 'apple-iphone-14-pro-max',
    brand: 'Apple',
    model: 'iPhone 14 Pro Max',
    releaseYear: 2022,
    msrp: 1099,
    chipset: 'Apple A16 Bionic',
    display: '6.7" Super Retina XDR OLED (120Hz)',
    camera: '48MP Main + 12MP Ultra Wide + 12MP 3x Telephoto',
    officialColors: [
      { name: 'Deep Purple', hex: '#483F53', colorFamily: 'Purple / Violet', isHeroFinish: true },
      { name: 'Space Black', hex: '#2B2A2D', colorFamily: 'Black / Dark' },
      { name: 'Gold', hex: '#F5E7D3', colorFamily: 'Gold / Bronze' },
      { name: 'Silver', hex: '#E3E4E6', colorFamily: 'White / Silver' }
    ]
  },
  {
    id: 'apple-iphone-14-pro',
    brand: 'Apple',
    model: 'iPhone 14 Pro',
    releaseYear: 2022,
    msrp: 999,
    chipset: 'Apple A16 Bionic',
    display: '6.1" Super Retina XDR OLED (120Hz)',
    camera: '48MP Main + 12MP Ultra Wide + 12MP 3x Telephoto',
    officialColors: [
      { name: 'Deep Purple', hex: '#483F53', colorFamily: 'Purple / Violet', isHeroFinish: true },
      { name: 'Space Black', hex: '#2B2A2D', colorFamily: 'Black / Dark' },
      { name: 'Gold', hex: '#F5E7D3', colorFamily: 'Gold / Bronze' },
      { name: 'Silver', hex: '#E3E4E6', colorFamily: 'White / Silver' }
    ]
  },
  {
    id: 'apple-iphone-14-plus',
    brand: 'Apple',
    model: 'iPhone 14 Plus',
    releaseYear: 2022,
    msrp: 899,
    chipset: 'Apple A15 Bionic',
    display: '6.7" Super Retina XDR OLED',
    camera: '12MP Main + 12MP Ultra Wide',
    officialColors: [
      { name: 'Yellow', hex: '#F8EA78', colorFamily: 'Gold / Bronze', isHeroFinish: true },
      { name: 'Purple', hex: '#E2D3E9', colorFamily: 'Purple / Violet' },
      { name: 'Blue', hex: '#A0B4C8', colorFamily: 'Blue' },
      { name: 'Midnight', hex: '#22272C', colorFamily: 'Black / Dark' },
      { name: 'Starlight', hex: '#FAF6F0', colorFamily: 'White / Silver' },
      { name: '(PRODUCT)RED', hex: '#E3000B', colorFamily: 'Pink / Red' }
    ]
  },
  {
    id: 'apple-iphone-14',
    brand: 'Apple',
    model: 'iPhone 14',
    releaseYear: 2022,
    msrp: 799,
    chipset: 'Apple A15 Bionic',
    display: '6.1" Super Retina XDR OLED',
    camera: '12MP Main + 12MP Ultra Wide',
    officialColors: [
      { name: 'Yellow', hex: '#F8EA78', colorFamily: 'Gold / Bronze', isHeroFinish: true },
      { name: 'Purple', hex: '#E2D3E9', colorFamily: 'Purple / Violet' },
      { name: 'Blue', hex: '#A0B4C8', colorFamily: 'Blue' },
      { name: 'Midnight', hex: '#22272C', colorFamily: 'Black / Dark' },
      { name: 'Starlight', hex: '#FAF6F0', colorFamily: 'White / Silver' },
      { name: '(PRODUCT)RED', hex: '#E3000B', colorFamily: 'Pink / Red' }
    ]
  },
  {
    id: 'apple-iphone-13-pro-max',
    brand: 'Apple',
    model: 'iPhone 13 Pro Max',
    releaseYear: 2021,
    msrp: 1099,
    chipset: 'Apple A15 Bionic',
    display: '6.7" Super Retina XDR OLED (120Hz)',
    camera: '12MP Main + 12MP Ultra Wide + 12MP 3x Telephoto',
    officialColors: [
      { name: 'Sierra Blue', hex: '#9BB5CE', colorFamily: 'Blue', isHeroFinish: true },
      { name: 'Alpine Green', hex: '#526252', colorFamily: 'Green' },
      { name: 'Graphite', hex: '#4C4B49', colorFamily: 'Black / Dark' },
      { name: 'Gold', hex: '#F4E8CE', colorFamily: 'Gold / Bronze' },
      { name: 'Silver', hex: '#E5E6E8', colorFamily: 'White / Silver' }
    ]
  },
  {
    id: 'apple-iphone-13-pro',
    brand: 'Apple',
    model: 'iPhone 13 Pro',
    releaseYear: 2021,
    msrp: 999,
    chipset: 'Apple A15 Bionic',
    display: '6.1" Super Retina XDR OLED (120Hz)',
    camera: '12MP Main + 12MP Ultra Wide + 12MP 3x Telephoto',
    officialColors: [
      { name: 'Sierra Blue', hex: '#9BB5CE', colorFamily: 'Blue', isHeroFinish: true },
      { name: 'Alpine Green', hex: '#526252', colorFamily: 'Green' },
      { name: 'Graphite', hex: '#4C4B49', colorFamily: 'Black / Dark' },
      { name: 'Gold', hex: '#F4E8CE', colorFamily: 'Gold / Bronze' },
      { name: 'Silver', hex: '#E5E6E8', colorFamily: 'White / Silver' }
    ]
  },
  {
    id: 'apple-iphone-13',
    brand: 'Apple',
    model: 'iPhone 13',
    releaseYear: 2021,
    msrp: 699,
    chipset: 'Apple A15 Bionic',
    display: '6.1" Super Retina XDR OLED',
    camera: '12MP Main + 12MP Ultra Wide',
    officialColors: [
      { name: 'Pink', hex: '#FAD7DC', colorFamily: 'Pink / Red' },
      { name: 'Blue', hex: '#436B84', colorFamily: 'Blue', isHeroFinish: true },
      { name: 'Midnight', hex: '#232A31', colorFamily: 'Black / Dark' },
      { name: 'Starlight', hex: '#FAF6F0', colorFamily: 'White / Silver' },
      { name: 'Green', hex: '#3B5240', colorFamily: 'Green' },
      { name: '(PRODUCT)RED', hex: '#BF0D18', colorFamily: 'Pink / Red' }
    ]
  },
  {
    id: 'apple-iphone-13-mini',
    brand: 'Apple',
    model: 'iPhone 13 mini',
    releaseYear: 2021,
    msrp: 599,
    chipset: 'Apple A15 Bionic',
    display: '5.4" Super Retina XDR OLED',
    camera: '12MP Main + 12MP Ultra Wide',
    officialColors: [
      { name: 'Pink', hex: '#FAD7DC', colorFamily: 'Pink / Red' },
      { name: 'Blue', hex: '#436B84', colorFamily: 'Blue', isHeroFinish: true },
      { name: 'Midnight', hex: '#232A31', colorFamily: 'Black / Dark' },
      { name: 'Starlight', hex: '#FAF6F0', colorFamily: 'White / Silver' },
      { name: 'Green', hex: '#3B5240', colorFamily: 'Green' },
      { name: '(PRODUCT)RED', hex: '#BF0D18', colorFamily: 'Pink / Red' }
    ]
  },
  {
    id: 'apple-iphone-12-pro-max',
    brand: 'Apple',
    model: 'iPhone 12 Pro Max',
    releaseYear: 2020,
    msrp: 1099,
    chipset: 'Apple A14 Bionic',
    display: '6.7" Super Retina XDR OLED',
    camera: '12MP Main + 12MP Ultra Wide + 12MP 2.5x Telephoto',
    officialColors: [
      { name: 'Pacific Blue', hex: '#2D4E5E', colorFamily: 'Blue', isHeroFinish: true },
      { name: 'Graphite', hex: '#545351', colorFamily: 'Black / Dark' },
      { name: 'Gold', hex: '#FAD399', colorFamily: 'Gold / Bronze' },
      { name: 'Silver', hex: '#E2E3E5', colorFamily: 'White / Silver' }
    ]
  },
  {
    id: 'apple-iphone-12',
    brand: 'Apple',
    model: 'iPhone 12',
    releaseYear: 2020,
    msrp: 599,
    chipset: 'Apple A14 Bionic',
    display: '6.1" Super Retina XDR OLED',
    camera: '12MP Main + 12MP Ultra Wide',
    officialColors: [
      { name: 'Purple', hex: '#BCAAD1', colorFamily: 'Purple / Violet' },
      { name: 'Blue', hex: '#1F3C59', colorFamily: 'Blue', isHeroFinish: true },
      { name: 'Green', hex: '#DAE7D8', colorFamily: 'Green' },
      { name: 'White', hex: '#F9F6EF', colorFamily: 'White / Silver' },
      { name: 'Black', hex: '#1C1D21', colorFamily: 'Black / Dark' },
      { name: '(PRODUCT)RED', hex: '#D2232A', colorFamily: 'Pink / Red' }
    ]
  },
  {
    id: 'apple-iphone-11-pro-max',
    brand: 'Apple',
    model: 'iPhone 11 Pro Max',
    releaseYear: 2019,
    msrp: 1099,
    chipset: 'Apple A13 Bionic',
    display: '6.5" Super Retina XDR OLED',
    camera: '12MP Main + 12MP Ultra Wide + 12MP 2x Telephoto',
    officialColors: [
      { name: 'Midnight Green', hex: '#4E5851', colorFamily: 'Green', isHeroFinish: true },
      { name: 'Space Gray', hex: '#535254', colorFamily: 'Black / Dark' },
      { name: 'Gold', hex: '#F0D4B2', colorFamily: 'Gold / Bronze' },
      { name: 'Silver', hex: '#EAD3CB', colorFamily: 'White / Silver' }
    ]
  },
  {
    id: 'apple-iphone-11',
    brand: 'Apple',
    model: 'iPhone 11',
    releaseYear: 2019,
    msrp: 499,
    chipset: 'Apple A13 Bionic',
    display: '6.1" Liquid Retina HD LCD',
    camera: '12MP Main + 12MP Ultra Wide',
    officialColors: [
      { name: 'Purple', hex: '#D1CDDA', colorFamily: 'Purple / Violet', isHeroFinish: true },
      { name: 'Green', hex: '#B3E5D1', colorFamily: 'Green' },
      { name: 'Yellow', hex: '#FFE680', colorFamily: 'Gold / Bronze' },
      { name: 'Black', hex: '#1F2022', colorFamily: 'Black / Dark' },
      { name: 'White', hex: '#FAF8F5', colorFamily: 'White / Silver' },
      { name: '(PRODUCT)RED', hex: '#BA0C2F', colorFamily: 'Pink / Red' }
    ]
  },
  {
    id: 'apple-iphone-se-3rd',
    brand: 'Apple',
    model: 'iPhone SE (3rd Gen)',
    releaseYear: 2022,
    msrp: 429,
    chipset: 'Apple A15 Bionic',
    display: '4.7" Retina HD LCD',
    camera: '12MP Main Camera',
    officialColors: [
      { name: 'Midnight', hex: '#232A31', colorFamily: 'Black / Dark' },
      { name: 'Starlight', hex: '#FAF6F0', colorFamily: 'White / Silver' },
      { name: '(PRODUCT)RED', hex: '#E3000B', colorFamily: 'Pink / Red', isHeroFinish: true }
    ]
  },

  // ==========================================
  // SAMSUNG GALAXY MODELS (COMPLETE CATALOG)
  // ==========================================
  {
    id: 'samsung-galaxy-s26-ultra',
    brand: 'Samsung',
    model: 'Galaxy S26 Ultra',
    releaseYear: 2026,
    msrp: 1399,
    chipset: 'Snapdragon 8 Elite Gen 2 for Galaxy (3nm)',
    display: '6.9" Dynamic AMOLED 3X (1-144Hz LPTO, Anti-Glare Privacy Display)',
    camera: '200MP ISOCELL Main + 50MP Ultra Wide + 50MP 5x Periscope + 50MP 3x Telephoto',
    officialColors: [
      { name: 'Titanium Emerald', hex: '#004225', colorFamily: 'Green', isHeroFinish: true },
      { name: 'Titanium Onyx Black', hex: '#1C1C1E', colorFamily: 'Black / Dark' },
      { name: 'Titanium Platinum Silver', hex: '#D1D5DB', colorFamily: 'White / Silver' },
      { name: 'Titanium Cobalt Blue', hex: '#1E3A8A', colorFamily: 'Blue' }
    ]
  },
  {
    id: 'samsung-galaxy-s26-plus',
    brand: 'Samsung',
    model: 'Galaxy S26+',
    releaseYear: 2026,
    msrp: 1049,
    chipset: 'Snapdragon 8 Elite Gen 2 for Galaxy',
    display: '6.7" Dynamic AMOLED 3X (120Hz)',
    camera: '50MP Main + 50MP Ultra Wide + 12MP 3x Telephoto',
    officialColors: [
      { name: 'Celestial Navy', hex: '#1B263B', colorFamily: 'Blue', isHeroFinish: true },
      { name: 'Shadow Black', hex: '#18181B', colorFamily: 'Black / Dark' },
      { name: 'Starlight Silver', hex: '#E5E7EB', colorFamily: 'White / Silver' },
      { name: 'Sage Mint', hex: '#94A3B8', colorFamily: 'Green' }
    ]
  },
  {
    id: 'samsung-galaxy-s26',
    brand: 'Samsung',
    model: 'Galaxy S26',
    releaseYear: 2026,
    msrp: 849,
    chipset: 'Snapdragon 8 Elite Gen 2 / Exynos 2600',
    display: '6.3" Dynamic AMOLED 3X (120Hz)',
    camera: '50MP Main + 50MP Ultra Wide + 12MP 3x Telephoto',
    officialColors: [
      { name: 'Celestial Navy', hex: '#1B263B', colorFamily: 'Blue', isHeroFinish: true },
      { name: 'Shadow Black', hex: '#18181B', colorFamily: 'Black / Dark' },
      { name: 'Starlight Silver', hex: '#E5E7EB', colorFamily: 'White / Silver' },
      { name: 'Sage Mint', hex: '#94A3B8', colorFamily: 'Green' }
    ]
  },
  {
    id: 'samsung-galaxy-s25-ultra',
    brand: 'Samsung',
    model: 'Galaxy S25 Ultra',
    releaseYear: 2025,
    msrp: 1299,
    chipset: 'Snapdragon 8 Elite for Galaxy',
    display: '6.9" Dynamic AMOLED 2X (120Hz, Anti-Reflective Corning Gorilla Armor 2)',
    camera: '200MP Main + 50MP Ultra Wide + 50MP 5x Telephoto + 10MP 3x Telephoto',
    officialColors: [
      { name: 'Titanium Silver Shadow', hex: '#C2C4C8', colorFamily: 'Titanium / Neutral', isHeroFinish: true },
      { name: 'Titanium Black', hex: '#222325', colorFamily: 'Black / Dark' },
      { name: 'Titanium Gray', hex: '#7C7C7E', colorFamily: 'Titanium / Neutral' },
      { name: 'Titanium Blue', hex: '#6C839B', colorFamily: 'Blue' },
      { name: 'Titanium Jade Green', hex: '#88A392', colorFamily: 'Green' },
      { name: 'Titanium Pink Gold', hex: '#E8C4C4', colorFamily: 'Pink / Red' },
      { name: 'Titanium White', hex: '#F4F4F6', colorFamily: 'White / Silver' }
    ]
  },
  {
    id: 'samsung-galaxy-s25-plus',
    brand: 'Samsung',
    model: 'Galaxy S25+',
    releaseYear: 2025,
    msrp: 999,
    chipset: 'Snapdragon 8 Elite for Galaxy',
    display: '6.7" Dynamic AMOLED 2X (120Hz)',
    camera: '50MP Main + 12MP Ultra Wide + 10MP 3x Telephoto',
    officialColors: [
      { name: 'Moonrock Gray', hex: '#92969C', colorFamily: 'Titanium / Neutral', isHeroFinish: true },
      { name: 'Sparkling Blue', hex: '#5A7B9A', colorFamily: 'Blue' },
      { name: 'Sparkling Green', hex: '#86A598', colorFamily: 'Green' },
      { name: 'Silver Shadow', hex: '#D1D3D8', colorFamily: 'White / Silver' },
      { name: 'Midnight Black', hex: '#222325', colorFamily: 'Black / Dark' },
      { name: 'Coral Red', hex: '#D9534F', colorFamily: 'Pink / Red' },
      { name: 'Pink Gold', hex: '#E8C4C4', colorFamily: 'Pink / Red' }
    ]
  },
  {
    id: 'samsung-galaxy-s25',
    brand: 'Samsung',
    model: 'Galaxy S25',
    releaseYear: 2025,
    msrp: 799,
    chipset: 'Snapdragon 8 Elite for Galaxy',
    display: '6.2" Dynamic AMOLED 2X (120Hz)',
    camera: '50MP Main + 12MP Ultra Wide + 10MP 3x Telephoto',
    officialColors: [
      { name: 'Moonrock Gray', hex: '#92969C', colorFamily: 'Titanium / Neutral', isHeroFinish: true },
      { name: 'Sparkling Blue', hex: '#5A7B9A', colorFamily: 'Blue' },
      { name: 'Sparkling Green', hex: '#86A598', colorFamily: 'Green' },
      { name: 'Silver Shadow', hex: '#D1D3D8', colorFamily: 'White / Silver' },
      { name: 'Midnight Black', hex: '#222325', colorFamily: 'Black / Dark' },
      { name: 'Coral Red', hex: '#D9534F', colorFamily: 'Pink / Red' },
      { name: 'Pink Gold', hex: '#E8C4C4', colorFamily: 'Pink / Red' }
    ]
  },
  {
    id: 'samsung-galaxy-s24-ultra',
    brand: 'Samsung',
    model: 'Galaxy S24 Ultra',
    releaseYear: 2024,
    msrp: 1299,
    chipset: 'Snapdragon 8 Gen 3 for Galaxy',
    display: '6.8" Dynamic AMOLED 2X (120Hz)',
    camera: '200MP Main + 12MP Ultra Wide + 50MP 5x Telephoto + 10MP 3x Telephoto',
    officialColors: [
      { name: 'Titanium Violet', hex: '#5C5268', colorFamily: 'Purple / Violet', isHeroFinish: true },
      { name: 'Titanium Black', hex: '#2B2B2C', colorFamily: 'Black / Dark' },
      { name: 'Titanium Gray', hex: '#7C7C7E', colorFamily: 'Titanium / Neutral' },
      { name: 'Titanium Yellow', hex: '#EDE1A7', colorFamily: 'Gold / Bronze' }
    ]
  },
  {
    id: 'samsung-galaxy-s24-plus',
    brand: 'Samsung',
    model: 'Galaxy S24+',
    releaseYear: 2024,
    msrp: 999,
    chipset: 'Snapdragon 8 Gen 3 / Exynos 2400',
    display: '6.7" Dynamic AMOLED 2X (120Hz)',
    camera: '50MP Main + 12MP Ultra Wide + 10MP 3x Telephoto',
    officialColors: [
      { name: 'Cobalt Violet', hex: '#5C5268', colorFamily: 'Purple / Violet', isHeroFinish: true },
      { name: 'Onyx Black', hex: '#222325', colorFamily: 'Black / Dark' },
      { name: 'Marble Gray', hex: '#C2C4C8', colorFamily: 'White / Silver' },
      { name: 'Amber Yellow', hex: '#EDE1A7', colorFamily: 'Gold / Bronze' }
    ]
  },
  {
    id: 'samsung-galaxy-s24',
    brand: 'Samsung',
    model: 'Galaxy S24',
    releaseYear: 2024,
    msrp: 799,
    chipset: 'Snapdragon 8 Gen 3 / Exynos 2400',
    display: '6.2" Dynamic AMOLED 2X (120Hz)',
    camera: '50MP Main + 12MP Ultra Wide + 10MP 3x Telephoto',
    officialColors: [
      { name: 'Cobalt Violet', hex: '#5C5268', colorFamily: 'Purple / Violet', isHeroFinish: true },
      { name: 'Onyx Black', hex: '#222325', colorFamily: 'Black / Dark' },
      { name: 'Marble Gray', hex: '#C2C4C8', colorFamily: 'White / Silver' },
      { name: 'Amber Yellow', hex: '#EDE1A7', colorFamily: 'Gold / Bronze' }
    ]
  },
  {
    id: 'samsung-galaxy-s24-fe',
    brand: 'Samsung',
    model: 'Galaxy S24 FE',
    releaseYear: 2024,
    msrp: 649,
    chipset: 'Exynos 2400e',
    display: '6.7" Dynamic AMOLED 2X (120Hz)',
    camera: '50MP Main + 12MP Ultra Wide + 8MP 3x Telephoto',
    officialColors: [
      { name: 'Blue', hex: '#87A2C0', colorFamily: 'Blue', isHeroFinish: true },
      { name: 'Mint', hex: '#C3E4D6', colorFamily: 'Green' },
      { name: 'Yellow', hex: '#F0E6B2', colorFamily: 'Gold / Bronze' },
      { name: 'Graphite', hex: '#3A3C3E', colorFamily: 'Black / Dark' }
    ]
  },
  {
    id: 'samsung-galaxy-s23-ultra',
    brand: 'Samsung',
    model: 'Galaxy S23 Ultra',
    releaseYear: 2023,
    msrp: 1199,
    chipset: 'Snapdragon 8 Gen 2 for Galaxy',
    display: '6.8" Dynamic AMOLED 2X (120Hz)',
    camera: '200MP Main + 12MP Ultra Wide + 10MP 10x Telephoto + 10MP 3x Telephoto',
    officialColors: [
      { name: 'Green', hex: '#485548', colorFamily: 'Green', isHeroFinish: true },
      { name: 'Phantom Black', hex: '#232426', colorFamily: 'Black / Dark' },
      { name: 'Cream', hex: '#F3EFE6', colorFamily: 'White / Silver' },
      { name: 'Lavender', hex: '#D8C6D9', colorFamily: 'Purple / Violet' }
    ]
  },
  {
    id: 'samsung-galaxy-s23',
    brand: 'Samsung',
    model: 'Galaxy S23',
    releaseYear: 2023,
    msrp: 699,
    chipset: 'Snapdragon 8 Gen 2 for Galaxy',
    display: '6.1" Dynamic AMOLED 2X (120Hz)',
    camera: '50MP Main + 12MP Ultra Wide + 10MP 3x Telephoto',
    officialColors: [
      { name: 'Lavender', hex: '#D8C6D9', colorFamily: 'Purple / Violet', isHeroFinish: true },
      { name: 'Phantom Black', hex: '#232426', colorFamily: 'Black / Dark' },
      { name: 'Cream', hex: '#F3EFE6', colorFamily: 'White / Silver' },
      { name: 'Green', hex: '#485548', colorFamily: 'Green' }
    ]
  },
  {
    id: 'samsung-galaxy-s22-ultra',
    brand: 'Samsung',
    model: 'Galaxy S22 Ultra',
    releaseYear: 2022,
    msrp: 1199,
    chipset: 'Snapdragon 8 Gen 1 / Exynos 2200',
    display: '6.8" Dynamic AMOLED 2X (120Hz)',
    camera: '108MP Main + 12MP Ultra Wide + 10MP 10x Telephoto',
    officialColors: [
      { name: 'Burgundy', hex: '#582B35', colorFamily: 'Pink / Red', isHeroFinish: true },
      { name: 'Phantom Black', hex: '#232426', colorFamily: 'Black / Dark' },
      { name: 'Phantom White', hex: '#F4F4F6', colorFamily: 'White / Silver' },
      { name: 'Green', hex: '#374942', colorFamily: 'Green' }
    ]
  },
  {
    id: 'samsung-galaxy-note-20-ultra',
    brand: 'Samsung',
    model: 'Galaxy Note 20 Ultra',
    releaseYear: 2020,
    msrp: 1299,
    chipset: 'Snapdragon 865+ / Exynos 990',
    display: '6.9" Dynamic AMOLED 2X (120Hz)',
    camera: '108MP Main + 12MP Ultra Wide + 12MP 5x Periscope',
    officialColors: [
      { name: 'Mystic Bronze', hex: '#9E7465', colorFamily: 'Gold / Bronze', isHeroFinish: true },
      { name: 'Mystic Black', hex: '#1E1F21', colorFamily: 'Black / Dark' },
      { name: 'Mystic White', hex: '#F0EFF4', colorFamily: 'White / Silver' }
    ]
  },
  {
    id: 'samsung-galaxy-z-fold-6',
    brand: 'Samsung',
    model: 'Galaxy Z Fold 6',
    releaseYear: 2024,
    msrp: 1899,
    chipset: 'Snapdragon 8 Gen 3 for Galaxy',
    display: '7.6" Main Dynamic AMOLED 2X + 6.3" Cover Screen',
    camera: '50MP Main + 12MP Ultra Wide + 10MP 3x Telephoto',
    officialColors: [
      { name: 'Silver Shadow', hex: '#C0C3C8', colorFamily: 'White / Silver', isHeroFinish: true },
      { name: 'Pink', hex: '#E8C1C8', colorFamily: 'Pink / Red' },
      { name: 'Navy', hex: '#243248', colorFamily: 'Blue' },
      { name: 'Craft Black', hex: '#232425', colorFamily: 'Black / Dark' }
    ]
  },
  {
    id: 'samsung-galaxy-z-fold-5',
    brand: 'Samsung',
    model: 'Galaxy Z Fold 5',
    releaseYear: 2023,
    msrp: 1799,
    chipset: 'Snapdragon 8 Gen 2 for Galaxy',
    display: '7.6" Main Dynamic AMOLED 2X + 6.2" Cover Screen',
    camera: '50MP Main + 12MP Ultra Wide + 10MP 3x Telephoto',
    officialColors: [
      { name: 'Icy Blue', hex: '#B2C6DB', colorFamily: 'Blue', isHeroFinish: true },
      { name: 'Phantom Black', hex: '#232426', colorFamily: 'Black / Dark' },
      { name: 'Cream', hex: '#F3EFE6', colorFamily: 'White / Silver' }
    ]
  },
  {
    id: 'samsung-galaxy-z-flip-6',
    brand: 'Samsung',
    model: 'Galaxy Z Flip 6',
    releaseYear: 2024,
    msrp: 1099,
    chipset: 'Snapdragon 8 Gen 3 for Galaxy',
    display: '6.7" Main Dynamic AMOLED 2X + 3.4" Flex Window',
    camera: '50MP Main + 12MP Ultra Wide',
    officialColors: [
      { name: 'Mint', hex: '#C3E4D6', colorFamily: 'Green', isHeroFinish: true },
      { name: 'Yellow', hex: '#F3EEA8', colorFamily: 'Gold / Bronze' },
      { name: 'Blue', hex: '#87A2C0', colorFamily: 'Blue' },
      { name: 'Silver Shadow', hex: '#C0C3C8', colorFamily: 'White / Silver' }
    ]
  },
  {
    id: 'samsung-galaxy-z-flip-5',
    brand: 'Samsung',
    model: 'Galaxy Z Flip 5',
    releaseYear: 2023,
    msrp: 999,
    chipset: 'Snapdragon 8 Gen 2 for Galaxy',
    display: '6.7" Main Dynamic AMOLED 2X + 3.4" Flex Window',
    camera: '12MP Main + 12MP Ultra Wide',
    officialColors: [
      { name: 'Mint', hex: '#C3E4D6', colorFamily: 'Green', isHeroFinish: true },
      { name: 'Lavender', hex: '#D8C6D9', colorFamily: 'Purple / Violet' },
      { name: 'Cream', hex: '#F3EFE6', colorFamily: 'White / Silver' },
      { name: 'Graphite', hex: '#3A3C3E', colorFamily: 'Black / Dark' }
    ]
  },
  {
    id: 'samsung-galaxy-a55-5g',
    brand: 'Samsung',
    model: 'Galaxy A55 5G',
    releaseYear: 2024,
    msrp: 449,
    chipset: 'Exynos 1480',
    display: '6.6" Super AMOLED (120Hz)',
    camera: '50MP Main + 12MP Ultra Wide + 5MP Macro',
    officialColors: [
      { name: 'Awesome Iceblue', hex: '#D2E5F2', colorFamily: 'Blue', isHeroFinish: true },
      { name: 'Awesome Navy', hex: '#232D3F', colorFamily: 'Black / Dark' },
      { name: 'Awesome Lemon', hex: '#F3EEA8', colorFamily: 'Gold / Bronze' },
      { name: 'Awesome Lilac', hex: '#E3D7EC', colorFamily: 'Purple / Violet' }
    ]
  },
  {
    id: 'samsung-galaxy-a35-5g',
    brand: 'Samsung',
    model: 'Galaxy A35 5G',
    releaseYear: 2024,
    msrp: 399,
    chipset: 'Exynos 1380',
    display: '6.6" Super AMOLED (120Hz)',
    camera: '50MP Main + 8MP Ultra Wide + 5MP Macro',
    officialColors: [
      { name: 'Awesome Iceblue', hex: '#D2E5F2', colorFamily: 'Blue' },
      { name: 'Awesome Navy', hex: '#232D3F', colorFamily: 'Black / Dark' },
      { name: 'Awesome Lemon', hex: '#F3EEA8', colorFamily: 'Gold / Bronze' },
      { name: 'Awesome Lilac', hex: '#E3D7EC', colorFamily: 'Purple / Violet', isHeroFinish: true }
    ]
  },
  {
    id: 'samsung-galaxy-a15-5g',
    brand: 'Samsung',
    model: 'Galaxy A15 5G',
    releaseYear: 2024,
    msrp: 199,
    chipset: 'MediaTek Dimensity 6100+',
    display: '6.5" Super AMOLED (90Hz)',
    camera: '50MP Main + 5MP Ultra Wide + 2MP Macro',
    officialColors: [
      { name: 'Blue Black', hex: '#1E2530', colorFamily: 'Black / Dark' },
      { name: 'Light Blue', hex: '#C2DCF2', colorFamily: 'Blue', isHeroFinish: true },
      { name: 'Yellow', hex: '#F5ECB2', colorFamily: 'Gold / Bronze' }
    ]
  },

  // ==========================================
  // GOOGLE PIXEL MODELS (COMPLETE CATALOG)
  // ==========================================
  {
    id: 'google-pixel-10-pro-xl',
    brand: 'Google',
    model: 'Pixel 10 Pro XL',
    releaseYear: 2025,
    msrp: 1199,
    chipset: 'Google Tensor G5 (TSMC 3nm)',
    display: '6.8" Super Actua Pro LTPO OLED (1-120Hz)',
    camera: '50MP Sony Main + 48MP Ultra Wide + 48MP 5x Periscope Telephoto',
    officialColors: [
      { name: 'Jade Green', hex: '#87A99C', colorFamily: 'Green', isHeroFinish: true },
      { name: 'Rose Quartz', hex: '#E8C5CE', colorFamily: 'Pink / Red' },
      { name: 'Porcelain White', hex: '#F0EDE6', colorFamily: 'White / Silver' },
      { name: 'Obsidian Black', hex: '#27292B', colorFamily: 'Black / Dark' }
    ]
  },
  {
    id: 'google-pixel-10-pro',
    brand: 'Google',
    model: 'Pixel 10 Pro',
    releaseYear: 2025,
    msrp: 999,
    chipset: 'Google Tensor G5 (TSMC 3nm)',
    display: '6.3" Super Actua Pro LTPO OLED (1-120Hz)',
    camera: '50MP Sony Main + 48MP Ultra Wide + 48MP 5x Telephoto',
    officialColors: [
      { name: 'Jade Green', hex: '#87A99C', colorFamily: 'Green', isHeroFinish: true },
      { name: 'Rose Quartz', hex: '#E8C5CE', colorFamily: 'Pink / Red' },
      { name: 'Porcelain White', hex: '#F0EDE6', colorFamily: 'White / Silver' },
      { name: 'Obsidian Black', hex: '#27292B', colorFamily: 'Black / Dark' }
    ]
  },
  {
    id: 'google-pixel-10-pro-fold',
    brand: 'Google',
    model: 'Pixel 10 Pro Fold',
    releaseYear: 2025,
    msrp: 1799,
    chipset: 'Google Tensor G5 (TSMC 3nm)',
    display: '8.0" Super Actua Flex Inner OLED + 6.3" Cover OLED',
    camera: '50MP Main + 12MP Ultra Wide + 10.8MP 5x Telephoto',
    officialColors: [
      { name: 'Obsidian Black', hex: '#27292B', colorFamily: 'Black / Dark', isHeroFinish: true },
      { name: 'Porcelain White', hex: '#F0EDE6', colorFamily: 'White / Silver' },
      { name: 'Jade Green', hex: '#87A99C', colorFamily: 'Green' }
    ]
  },
  {
    id: 'google-pixel-10',
    brand: 'Google',
    model: 'Pixel 10',
    releaseYear: 2025,
    msrp: 799,
    chipset: 'Google Tensor G5 (TSMC 3nm)',
    display: '6.3" Actua OLED (120Hz)',
    camera: '50MP Main + 48MP Ultra Wide',
    officialColors: [
      { name: 'Iris Purple', hex: '#A8A0C8', colorFamily: 'Purple / Violet', isHeroFinish: true },
      { name: 'Lemon Grass', hex: '#E2E8B0', colorFamily: 'Green' },
      { name: 'Porcelain White', hex: '#F0EDE6', colorFamily: 'White / Silver' },
      { name: 'Obsidian Black', hex: '#27292B', colorFamily: 'Black / Dark' }
    ]
  },
  {
    id: 'google-pixel-9-pro-xl',
    brand: 'Google',
    model: 'Pixel 9 Pro XL',
    releaseYear: 2024,
    msrp: 1099,
    chipset: 'Google Tensor G4',
    display: '6.8" Super Actua LTPO OLED (120Hz)',
    camera: '50MP Main + 48MP Ultra Wide + 48MP 5x Telephoto',
    officialColors: [
      { name: 'Rose Quartz', hex: '#E8C5CE', colorFamily: 'Pink / Red', isHeroFinish: true },
      { name: 'Hazel', hex: '#6B716A', colorFamily: 'Titanium / Neutral' },
      { name: 'Porcelain', hex: '#F0EDE6', colorFamily: 'White / Silver' },
      { name: 'Obsidian', hex: '#27292B', colorFamily: 'Black / Dark' }
    ]
  },
  {
    id: 'google-pixel-9-pro',
    brand: 'Google',
    model: 'Pixel 9 Pro',
    releaseYear: 2024,
    msrp: 999,
    chipset: 'Google Tensor G4',
    display: '6.3" Super Actua LTPO OLED (120Hz)',
    camera: '50MP Main + 48MP Ultra Wide + 48MP 5x Telephoto',
    officialColors: [
      { name: 'Rose Quartz', hex: '#E8C5CE', colorFamily: 'Pink / Red', isHeroFinish: true },
      { name: 'Hazel', hex: '#6B716A', colorFamily: 'Titanium / Neutral' },
      { name: 'Porcelain', hex: '#F0EDE6', colorFamily: 'White / Silver' },
      { name: 'Obsidian', hex: '#27292B', colorFamily: 'Black / Dark' }
    ]
  },
  {
    id: 'google-pixel-9-pro-fold',
    brand: 'Google',
    model: 'Pixel 9 Pro Fold',
    releaseYear: 2024,
    msrp: 1799,
    chipset: 'Google Tensor G4',
    display: '8.0" Super Actua Flex OLED + 6.3" Cover Screen',
    camera: '48MP Main + 10.5MP Ultra Wide + 10.8MP 5x Telephoto',
    officialColors: [
      { name: 'Obsidian', hex: '#27292B', colorFamily: 'Black / Dark', isHeroFinish: true },
      { name: 'Porcelain', hex: '#F0EDE6', colorFamily: 'White / Silver' }
    ]
  },
  {
    id: 'google-pixel-9',
    brand: 'Google',
    model: 'Pixel 9',
    releaseYear: 2024,
    msrp: 799,
    chipset: 'Google Tensor G4',
    display: '6.3" Actua OLED (120Hz)',
    camera: '50MP Main + 48MP Ultra Wide',
    officialColors: [
      { name: 'Wintergreen', hex: '#B8D8C8', colorFamily: 'Green', isHeroFinish: true },
      { name: 'Peony', hex: '#EAA6B8', colorFamily: 'Pink / Red' },
      { name: 'Porcelain', hex: '#F0EDE6', colorFamily: 'White / Silver' },
      { name: 'Obsidian', hex: '#27292B', colorFamily: 'Black / Dark' }
    ]
  },
  {
    id: 'google-pixel-8-pro',
    brand: 'Google',
    model: 'Pixel 8 Pro',
    releaseYear: 2023,
    msrp: 999,
    chipset: 'Google Tensor G3',
    display: '6.7" Super Actua LTPO OLED (120Hz)',
    camera: '50MP Main + 48MP Ultra Wide + 48MP 5x Telephoto',
    officialColors: [
      { name: 'Bay', hex: '#8FAEC4', colorFamily: 'Blue', isHeroFinish: true },
      { name: 'Mint', hex: '#D0E3D3', colorFamily: 'Green' },
      { name: 'Porcelain', hex: '#F0EDE6', colorFamily: 'White / Silver' },
      { name: 'Obsidian', hex: '#27292B', colorFamily: 'Black / Dark' }
    ]
  },
  {
    id: 'google-pixel-8',
    brand: 'Google',
    model: 'Pixel 8',
    releaseYear: 2023,
    msrp: 699,
    chipset: 'Google Tensor G3',
    display: '6.2" Actua OLED (120Hz)',
    camera: '50MP Main + 12MP Ultra Wide',
    officialColors: [
      { name: 'Hazel', hex: '#6B716A', colorFamily: 'Titanium / Neutral' },
      { name: 'Rose', hex: '#E2B8B3', colorFamily: 'Pink / Red', isHeroFinish: true },
      { name: 'Obsidian', hex: '#27292B', colorFamily: 'Black / Dark' },
      { name: 'Mint', hex: '#D0E3D3', colorFamily: 'Green' }
    ]
  },
  {
    id: 'google-pixel-8a',
    brand: 'Google',
    model: 'Pixel 8a',
    releaseYear: 2024,
    msrp: 499,
    chipset: 'Google Tensor G3',
    display: '6.1" Actua OLED (120Hz)',
    camera: '64MP Main + 13MP Ultra Wide',
    officialColors: [
      { name: 'Aloe', hex: '#C2DCBA', colorFamily: 'Green', isHeroFinish: true },
      { name: 'Bay', hex: '#8FAEC4', colorFamily: 'Blue' },
      { name: 'Porcelain', hex: '#F0EDE6', colorFamily: 'White / Silver' },
      { name: 'Obsidian', hex: '#27292B', colorFamily: 'Black / Dark' }
    ]
  },
  {
    id: 'google-pixel-fold',
    brand: 'Google',
    model: 'Pixel Fold (1st Gen)',
    releaseYear: 2023,
    msrp: 1799,
    chipset: 'Google Tensor G2',
    display: '7.6" OLED Inner + 5.8" OLED Cover',
    camera: '48MP Main + 10.8MP Ultra Wide + 10.8MP 5x Telephoto',
    officialColors: [
      { name: 'Obsidian', hex: '#27292B', colorFamily: 'Black / Dark', isHeroFinish: true },
      { name: 'Porcelain', hex: '#F0EDE6', colorFamily: 'White / Silver' }
    ]
  },
  {
    id: 'google-pixel-7-pro',
    brand: 'Google',
    model: 'Pixel 7 Pro',
    releaseYear: 2022,
    msrp: 899,
    chipset: 'Google Tensor G2',
    display: '6.7" LTPO AMOLED (120Hz)',
    camera: '50MP Main + 12MP Ultra Wide + 48MP 5x Telephoto',
    officialColors: [
      { name: 'Hazel', hex: '#6B716A', colorFamily: 'Titanium / Neutral', isHeroFinish: true },
      { name: 'Snow', hex: '#F5F5F7', colorFamily: 'White / Silver' },
      { name: 'Obsidian', hex: '#27292B', colorFamily: 'Black / Dark' }
    ]
  },
  {
    id: 'google-pixel-7a',
    brand: 'Google',
    model: 'Pixel 7a',
    releaseYear: 2023,
    msrp: 499,
    chipset: 'Google Tensor G2',
    display: '6.1" OLED (90Hz)',
    camera: '64MP Main + 13MP Ultra Wide',
    officialColors: [
      { name: 'Sea', hex: '#A3C2DC', colorFamily: 'Blue', isHeroFinish: true },
      { name: 'Coral', hex: '#E87D63', colorFamily: 'Pink / Red' },
      { name: 'Snow', hex: '#F5F5F7', colorFamily: 'White / Silver' },
      { name: 'Charcoal', hex: '#3C3E42', colorFamily: 'Black / Dark' }
    ]
  },
  {
    id: 'google-pixel-6-pro',
    brand: 'Google',
    model: 'Pixel 6 Pro',
    releaseYear: 2021,
    msrp: 899,
    chipset: 'Google Tensor (1st Gen)',
    display: '6.7" LTPO AMOLED (120Hz)',
    camera: '50MP Main + 12MP Ultra Wide + 48MP 4x Telephoto',
    officialColors: [
      { name: 'Sorta Sunny', hex: '#F7D6B0', colorFamily: 'Gold / Bronze', isHeroFinish: true },
      { name: 'Cloudy White', hex: '#E4E6E8', colorFamily: 'White / Silver' },
      { name: 'Stormy Black', hex: '#2D3033', colorFamily: 'Black / Dark' }
    ]
  },

  // ==========================================
  // MOTOROLA MODELS (COMPLETE CATALOG)
  // ==========================================
  {
    id: 'motorola-razr-50-ultra',
    brand: 'Motorola',
    model: 'Razr 50 Ultra / Razr+ (2024)',
    releaseYear: 2024,
    msrp: 999,
    chipset: 'Snapdragon 8s Gen 3',
    display: '6.9" Main pOLED (165Hz) + 4.0" External pOLED',
    camera: '50MP Main + 50MP 2x Telephoto',
    officialColors: [
      { name: 'Peach Fuzz (Pantone)', hex: '#FFBE98', colorFamily: 'Pink / Red', isHeroFinish: true },
      { name: 'Midnight Blue', hex: '#1B263B', colorFamily: 'Blue' },
      { name: 'Spring Green', hex: '#88D49E', colorFamily: 'Green' },
      { name: 'Hot Pink', hex: '#FF69B4', colorFamily: 'Pink / Red' }
    ]
  },
  {
    id: 'motorola-razr-50',
    brand: 'Motorola',
    model: 'Razr 50 / Razr (2024)',
    releaseYear: 2024,
    msrp: 699,
    chipset: 'MediaTek Dimensity 7300X',
    display: '6.9" Main pOLED (120Hz) + 3.6" External pOLED',
    camera: '50MP Main + 13MP Ultra Wide',
    officialColors: [
      { name: 'Beach Sand', hex: '#D8CBB6', colorFamily: 'Titanium / Neutral' },
      { name: 'Koala Grey', hex: '#636569', colorFamily: 'Black / Dark', isHeroFinish: true },
      { name: 'Spritz Orange', hex: '#E87D3E', colorFamily: 'Gold / Bronze' }
    ]
  },
  {
    id: 'motorola-edge-50-ultra',
    brand: 'Motorola',
    model: 'Edge 50 Ultra',
    releaseYear: 2024,
    msrp: 999,
    chipset: 'Snapdragon 8s Gen 3',
    display: '6.7" pOLED (144Hz, LTPS)',
    camera: '50MP Main + 50MP Ultra Wide + 64MP 3x Periscope',
    officialColors: [
      { name: 'Peach Fuzz (Pantone)', hex: '#FFBE98', colorFamily: 'Pink / Red', isHeroFinish: true },
      { name: 'Nordic Wood', hex: '#8D7B68', colorFamily: 'Titanium / Neutral' },
      { name: 'Forest Grey', hex: '#3B413E', colorFamily: 'Black / Dark' }
    ]
  },
  {
    id: 'motorola-edge-50-pro',
    brand: 'Motorola',
    model: 'Edge 50 Pro',
    releaseYear: 2024,
    msrp: 699,
    chipset: 'Snapdragon 7 Gen 3',
    display: '6.7" pOLED (144Hz)',
    camera: '50MP Main + 13MP Ultra Wide + 10MP 3x Telephoto',
    officialColors: [
      { name: 'Luxe Lavender', hex: '#C3B9D8', colorFamily: 'Purple / Violet', isHeroFinish: true },
      { name: 'Moonlight Pearl', hex: '#F4F3EF', colorFamily: 'White / Silver' },
      { name: 'Black Beauty', hex: '#222325', colorFamily: 'Black / Dark' }
    ]
  },
  {
    id: 'motorola-edge-50-fusion',
    brand: 'Motorola',
    model: 'Edge 50 Fusion',
    releaseYear: 2024,
    msrp: 399,
    chipset: 'Snapdragon 7s Gen 2',
    display: '6.7" pOLED (144Hz)',
    camera: '50MP Main + 13MP Ultra Wide',
    officialColors: [
      { name: 'Marshmallow Blue', hex: '#D6E4F0', colorFamily: 'Blue', isHeroFinish: true },
      { name: 'Hot Pink', hex: '#FF69B4', colorFamily: 'Pink / Red' },
      { name: 'Forest Blue', hex: '#2A3C4B', colorFamily: 'Blue' }
    ]
  },
  {
    id: 'motorola-moto-g-stylus-5g-2024',
    brand: 'Motorola',
    model: 'Moto G Stylus 5G (2024)',
    releaseYear: 2024,
    msrp: 399,
    chipset: 'Snapdragon 6 Gen 1',
    display: '6.7" pOLED (120Hz) with Built-in Stylus',
    camera: '50MP Main + 13MP Ultra Wide',
    officialColors: [
      { name: 'Caramel Latte', hex: '#C2A383', colorFamily: 'Titanium / Neutral', isHeroFinish: true },
      { name: 'Scarlet Wave', hex: '#9E2A2B', colorFamily: 'Pink / Red' }
    ]
  },
  {
    id: 'motorola-moto-g-power-5g-2024',
    brand: 'Motorola',
    model: 'Moto G Power 5G (2024)',
    releaseYear: 2024,
    msrp: 299,
    chipset: 'MediaTek Dimensity 7020',
    display: '6.7" FHD+ LCD (120Hz)',
    camera: '50MP Main + 8MP Ultra Wide',
    officialColors: [
      { name: 'Midnight Blue', hex: '#1B263B', colorFamily: 'Blue', isHeroFinish: true },
      { name: 'Pale Lilac', hex: '#D8C8E3', colorFamily: 'Purple / Violet' }
    ]
  },
  {
    id: 'motorola-moto-g85',
    brand: 'Motorola',
    model: 'Moto G85 5G',
    releaseYear: 2024,
    msrp: 299,
    chipset: 'Snapdragon 6s Gen 3',
    display: '6.67" 3D Curved pOLED (120Hz)',
    camera: '50MP Sony LYT-600 + 8MP Ultra Wide',
    officialColors: [
      { name: 'Olive Green', hex: '#68745A', colorFamily: 'Green', isHeroFinish: true },
      { name: 'Cobalt Blue', hex: '#2E5B88', colorFamily: 'Blue' },
      { name: 'Urban Grey', hex: '#424548', colorFamily: 'Black / Dark' }
    ]
  },
  // MOTO EDGE SERIES
  {
    id: 'motorola-edge-xt2609-2026',
    brand: 'Motorola',
    model: 'Moto Edge (XT2609 / 2026)',
    releaseYear: 2026,
    msrp: 699,
    chipset: 'Snapdragon 7s Gen 3',
    display: '6.7" Endless Edge pOLED (144Hz)',
    camera: '50MP Sony LYT Main + 13MP Ultra Wide',
    officialColors: [
      { name: 'Pantone Azure', hex: '#0070B8', colorFamily: 'Blue', isHeroFinish: true },
      { name: 'Shadow Black', hex: '#1C1C1E', colorFamily: 'Black / Dark' },
      { name: 'Lunar Grey', hex: '#8E8E93', colorFamily: 'White / Silver' }
    ]
  },
  {
    id: 'motorola-edge-70-fusion-plus-xt2605-2026',
    brand: 'Motorola',
    model: 'Moto Edge 70 Fusion Plus (XT2605 / 2026)',
    releaseYear: 2026,
    msrp: 549,
    chipset: 'Snapdragon 7 Gen 3',
    display: '6.7" Quad-Curved pOLED (144Hz)',
    camera: '50MP OIS Main + 50MP Ultra Wide',
    officialColors: [
      { name: 'Pantone Mocha', hex: '#6F4E37', colorFamily: 'Gold / Bronze', isHeroFinish: true },
      { name: 'Deep Sea Blue', hex: '#112233', colorFamily: 'Blue' }
    ]
  },
  {
    id: 'motorola-edge-70-fusion-xt2605-2026',
    brand: 'Motorola',
    model: 'Moto Edge 70 Fusion (XT2605 / 2026)',
    releaseYear: 2026,
    msrp: 449,
    chipset: 'MediaTek Dimensity 7300',
    display: '6.67" Curved pOLED (120Hz)',
    camera: '50MP Sony LYT-700C + 13MP Ultra Wide',
    officialColors: [
      { name: 'Marshmallow Mint', hex: '#A8E6CF', colorFamily: 'Green', isHeroFinish: true },
      { name: 'Hot Crimson', hex: '#C0392B', colorFamily: 'Pink / Red' }
    ]
  },
  {
    id: 'motorola-edge-70-xt2601-2025',
    brand: 'Motorola',
    model: 'Moto Edge 70 (XT2601 / 2025)',
    releaseYear: 2025,
    msrp: 599,
    chipset: 'Snapdragon 7s Gen 2',
    display: '6.7" Borderless pOLED (144Hz)',
    camera: '50MP Main + 13MP Macro/Ultra Wide',
    officialColors: [
      { name: 'Pantone Cloud Dancer', hex: '#F0EAD6', colorFamily: 'White / Silver', isHeroFinish: true },
      { name: 'Volcanic Black', hex: '#2C2C2E', colorFamily: 'Black / Dark' }
    ]
  },
  {
    id: 'motorola-edge-xt2519-2025',
    brand: 'Motorola',
    model: 'Moto Edge (XT2519 / 2025)',
    releaseYear: 2025,
    msrp: 549,
    chipset: 'Snapdragon 7s Gen 2',
    display: '6.6" 144Hz pOLED Screen',
    camera: '50MP OIS + 13MP Ultra Wide',
    officialColors: [
      { name: 'Eclipse Black', hex: '#1A1A1A', colorFamily: 'Black / Dark', isHeroFinish: true },
      { name: 'Glacier White', hex: '#F5F5F7', colorFamily: 'White / Silver' }
    ]
  },
  {
    id: 'motorola-edge-60-neo-xt2509-1-2025',
    brand: 'Motorola',
    model: 'Moto Edge 60 Neo (XT2509-1 / 2025)',
    releaseYear: 2025,
    msrp: 399,
    chipset: 'MediaTek Dimensity 7300',
    display: '6.36" Compact pOLED (120Hz)',
    camera: '50MP Sony LYT-700C + 13MP Ultra Wide',
    officialColors: [
      { name: 'Pantone Poinciana', hex: '#CC3333', colorFamily: 'Pink / Red', isHeroFinish: true },
      { name: 'Pantone Lattè', hex: '#C5A059', colorFamily: 'Gold / Bronze' },
      { name: 'Grisaille Grey', hex: '#6C757D', colorFamily: 'Titanium / Neutral' }
    ]
  },
  {
    id: 'motorola-edge-60-stylus-xt2517-4-2025',
    brand: 'Motorola',
    model: 'Moto Edge 60 Stylus (XT2517-4 / 2025)',
    releaseYear: 2025,
    msrp: 429,
    chipset: 'Snapdragon 6 Gen 1',
    display: '6.7" pOLED (120Hz) with Integrated Stylus',
    camera: '50MP OIS Main + 13MP Ultra Wide',
    officialColors: [
      { name: 'Caramel Gold', hex: '#C59B27', colorFamily: 'Gold / Bronze', isHeroFinish: true },
      { name: 'Scarlet Wave', hex: '#8B0000', colorFamily: 'Pink / Red' }
    ]
  },
  {
    id: 'motorola-edge-60-pro-xt2507-2025',
    brand: 'Motorola',
    model: 'Moto Edge 60 Pro (XT2507 / 2025)',
    releaseYear: 2025,
    msrp: 799,
    chipset: 'Snapdragon 8s Gen 3',
    display: '6.7" Quad-Curved 144Hz pOLED',
    camera: '50MP Main + 50MP Ultra Wide + 10MP 3x Telephoto',
    officialColors: [
      { name: 'Pantone Very Peri', hex: '#6667AB', colorFamily: 'Purple / Violet', isHeroFinish: true },
      { name: 'Obsidian Black', hex: '#0B0B0C', colorFamily: 'Black / Dark' }
    ]
  },
  {
    id: 'motorola-edge-60-xt2505-2025',
    brand: 'Motorola',
    model: 'Moto Edge 60 (XT2505 / 2025)',
    releaseYear: 2025,
    msrp: 549,
    chipset: 'Snapdragon 7 Gen 3',
    display: '6.7" 144Hz Curved pOLED',
    camera: '50MP Main + 13MP Ultra Wide',
    officialColors: [
      { name: 'Pantone Emerald', hex: '#009B77', colorFamily: 'Green', isHeroFinish: true },
      { name: 'Midnight Violet', hex: '#2E1A47', colorFamily: 'Purple / Violet' }
    ]
  },
  {
    id: 'motorola-edge-60-fusion-xt2503-2025',
    brand: 'Motorola',
    model: 'Moto Edge 60 Fusion (XT2503 / 2025)',
    releaseYear: 2025,
    msrp: 399,
    chipset: 'Snapdragon 7s Gen 2',
    display: '6.7" Endless Edge pOLED (144Hz)',
    camera: '50MP Sony LYT-600 + 13MP Ultra Wide',
    officialColors: [
      { name: 'Fiesta Pink', hex: '#E75480', colorFamily: 'Pink / Red', isHeroFinish: true },
      { name: 'Forest Blue', hex: '#1C2833', colorFamily: 'Blue' }
    ]
  },
  {
    id: 'motorola-edge-50-fusion-5g-xt2429-2024',
    brand: 'Motorola',
    model: 'Moto Edge 50 Fusion 5G (XT2429 / 2024)',
    releaseYear: 2024,
    msrp: 399,
    chipset: 'Snapdragon 7s Gen 2',
    display: '6.7" pOLED (144Hz)',
    camera: '50MP Sony LYT-700C + 13MP Ultra Wide',
    officialColors: [
      { name: 'Marshmallow Blue', hex: '#D6E4F0', colorFamily: 'Blue', isHeroFinish: true },
      { name: 'Hot Pink', hex: '#FF69B4', colorFamily: 'Pink / Red' },
      { name: 'Forest Blue', hex: '#2A3C4B', colorFamily: 'Blue' }
    ]
  },
  {
    id: 'motorola-edge-s50-xt2409-2024',
    brand: 'Motorola',
    model: 'Moto Edge S50 (XT2409 / 2024)',
    releaseYear: 2024,
    msrp: 449,
    chipset: 'MediaTek Dimensity 7300',
    display: '6.36" 1.5K pOLED (120Hz)',
    camera: '50MP Sony LYT-700C + 13MP Ultra Wide + 10MP 3x Telephoto',
    officialColors: [
      { name: 'Pantone Latte', hex: '#C5A059', colorFamily: 'Gold / Bronze', isHeroFinish: true },
      { name: 'Grisaille Grey', hex: '#53565A', colorFamily: 'Titanium / Neutral' }
    ]
  },
  {
    id: 'motorola-edge-50-neo-xt2409-2024',
    brand: 'Motorola',
    model: 'Moto Edge 50 Neo (XT2409 / 2024)',
    releaseYear: 2024,
    msrp: 449,
    chipset: 'MediaTek Dimensity 7300',
    display: '6.36" LTPO pOLED (120Hz)',
    camera: '50MP Sony LYT-700C + 13MP Ultra Wide + 10MP Telephoto',
    officialColors: [
      { name: 'Pantone Poinciana', hex: '#CC3333', colorFamily: 'Pink / Red', isHeroFinish: true },
      { name: 'Pantone Lattè', hex: '#C5A059', colorFamily: 'Gold / Bronze' },
      { name: 'Grisaille Grey', hex: '#53565A', colorFamily: 'Titanium / Neutral' },
      { name: 'Nautical Blue', hex: '#1C39BB', colorFamily: 'Blue' }
    ]
  },
  {
    id: 'motorola-edge-50-xt2407-3-2024',
    brand: 'Motorola',
    model: 'Moto Edge 50 (XT2407-3 / 2024)',
    releaseYear: 2024,
    msrp: 549,
    chipset: 'Snapdragon 7 Gen 1 Accelerated',
    display: '6.7" Endless Edge pOLED (120Hz)',
    camera: '50MP Main + 13MP Ultra Wide + 10MP 3x Telephoto',
    officialColors: [
      { name: 'Jungle Green', hex: '#2D5A27', colorFamily: 'Green', isHeroFinish: true },
      { name: 'Peach Fuzz', hex: '#FFBE98', colorFamily: 'Pink / Red' },
      { name: 'Koala Grey', hex: '#636569', colorFamily: 'Black / Dark' }
    ]
  },
  {
    id: 'motorola-edge-xt2405-2024',
    brand: 'Motorola',
    model: 'Moto Edge (XT2405 / 2024)',
    releaseYear: 2024,
    msrp: 599,
    chipset: 'Snapdragon 7s Gen 2',
    display: '6.6" Curved pOLED (144Hz)',
    camera: '50MP Main + 13MP Ultra Wide',
    officialColors: [
      { name: 'Midnight Blue', hex: '#191970', colorFamily: 'Blue', isHeroFinish: true },
      { name: 'Lunar Grey', hex: '#708090', colorFamily: 'Titanium / Neutral' }
    ]
  },
  {
    id: 'motorola-edge-50-pro-xt2403-2024',
    brand: 'Motorola',
    model: 'Moto Edge 50 Pro (XT2403 / 2024)',
    releaseYear: 2024,
    msrp: 699,
    chipset: 'Snapdragon 7 Gen 3',
    display: '6.7" 1.5K pOLED (144Hz)',
    camera: '50MP Main + 13MP Ultra Wide + 10MP Telephoto',
    officialColors: [
      { name: 'Luxe Lavender', hex: '#C3B9D8', colorFamily: 'Purple / Violet', isHeroFinish: true },
      { name: 'Moonlight Pearl', hex: '#F4F3EF', colorFamily: 'White / Silver' },
      { name: 'Black Beauty', hex: '#222325', colorFamily: 'Black / Dark' }
    ]
  },
  {
    id: 'motorola-edge-50-ultra-xt2401-2-2024',
    brand: 'Motorola',
    model: 'Moto Edge 50 Ultra (XT2401-2 / 2024)',
    releaseYear: 2024,
    msrp: 999,
    chipset: 'Snapdragon 8s Gen 3',
    display: '6.7" LTPS pOLED (144Hz)',
    camera: '50MP Main + 50MP Ultra Wide + 64MP 3x Periscope',
    officialColors: [
      { name: 'Peach Fuzz (Pantone)', hex: '#FFBE98', colorFamily: 'Pink / Red', isHeroFinish: true },
      { name: 'Nordic Wood', hex: '#8D7B68', colorFamily: 'Titanium / Neutral' },
      { name: 'Forest Grey', hex: '#3B413E', colorFamily: 'Black / Dark' }
    ]
  },
  {
    id: 'motorola-edge-40-neo-xt2307-1-2023',
    brand: 'Motorola',
    model: 'Moto Edge 40 Neo (XT2307-1 / 2023)',
    releaseYear: 2023,
    msrp: 399,
    chipset: 'MediaTek Dimensity 7030',
    display: '6.55" Curved pOLED (144Hz)',
    camera: '50MP OIS Main + 13MP Ultra Wide',
    officialColors: [
      { name: 'Caneel Bay Blue', hex: '#008B8B', colorFamily: 'Blue', isHeroFinish: true },
      { name: 'Soothing Sea', hex: '#8FBC8F', colorFamily: 'Green' },
      { name: 'Black Beauty', hex: '#1C1C1C', colorFamily: 'Black / Dark' }
    ]
  },
  {
    id: 'motorola-edge-xt2305-2023',
    brand: 'Motorola',
    model: 'Moto Edge (XT2305 / 2023)',
    releaseYear: 2023,
    msrp: 599,
    chipset: 'MediaTek Dimensity 7030',
    display: '6.6" Curved 144Hz pOLED',
    camera: '50MP OIS + 13MP Ultra Wide',
    officialColors: [
      { name: 'Eclipse Black', hex: '#111111', colorFamily: 'Black / Dark', isHeroFinish: true }
    ]
  },
  {
    id: 'motorola-edge-40-xt2303-2-2023',
    brand: 'Motorola',
    model: 'Moto Edge 40 (XT2303-2 / 2023)',
    releaseYear: 2023,
    msrp: 549,
    chipset: 'MediaTek Dimensity 8020',
    display: '6.55" 3D Curved 144Hz pOLED',
    camera: '50MP f/1.4 OIS + 13MP Ultra Wide',
    officialColors: [
      { name: 'Viva Magenta', hex: '#BB2649', colorFamily: 'Pink / Red', isHeroFinish: true },
      { name: 'Eclipse Black', hex: '#1B1B1B', colorFamily: 'Black / Dark' },
      { name: 'Nebula Green', hex: '#3B7A57', colorFamily: 'Green' }
    ]
  },
  {
    id: 'motorola-edge-plus-edge-40-pro-xt2301-2023',
    brand: 'Motorola',
    model: 'Moto Edge Plus / Edge 40 Pro (XT2301 / 2023)',
    releaseYear: 2023,
    msrp: 799,
    chipset: 'Snapdragon 8 Gen 2',
    display: '6.67" Quad-Curved 165Hz pOLED',
    camera: '50MP Main + 50MP Ultra Wide + 12MP 2x Telephoto',
    officialColors: [
      { name: 'Interstellar Black', hex: '#121315', colorFamily: 'Black / Dark', isHeroFinish: true },
      { name: 'Lunar Blue', hex: '#2B3E50', colorFamily: 'Blue' }
    ]
  },
  {
    id: 'motorola-edge-30-neo-xt2245-1-2022',
    brand: 'Motorola',
    model: 'Moto Edge 30 Neo (XT2245-1 / 2022)',
    releaseYear: 2022,
    msrp: 399,
    chipset: 'Snapdragon 695 5G',
    display: '6.28" Compact pOLED (120Hz)',
    camera: '64MP OIS + 13MP Ultra Wide',
    officialColors: [
      { name: 'Very Peri (Pantone)', hex: '#6667AB', colorFamily: 'Purple / Violet', isHeroFinish: true },
      { name: 'Ice Palace', hex: '#EAEAEA', colorFamily: 'White / Silver' },
      { name: 'Aqua Foam', hex: '#A2E8DD', colorFamily: 'Green' },
      { name: 'Black Onyx', hex: '#1C1C1E', colorFamily: 'Black / Dark' }
    ]
  },
  {
    id: 'motorola-edge-30-fusion-xt2243-2022',
    brand: 'Motorola',
    model: 'Moto Edge 30 Fusion (XT2243 / 2022)',
    releaseYear: 2022,
    msrp: 699,
    chipset: 'Snapdragon 888+ 5G',
    display: '6.55" Curved 144Hz pOLED',
    camera: '50MP OIS + 13MP Ultra Wide + Depth',
    officialColors: [
      { name: 'Viva Magenta', hex: '#BB2649', colorFamily: 'Pink / Red', isHeroFinish: true },
      { name: 'Cosmic Grey', hex: '#4F5B66', colorFamily: 'Black / Dark' },
      { name: 'Aurora White', hex: '#F7F9FA', colorFamily: 'White / Silver' },
      { name: 'Neptune Blue', hex: '#2A4B7C', colorFamily: 'Blue' }
    ]
  },
  {
    id: 'motorola-edge-xt2205-1-2022',
    brand: 'Motorola',
    model: 'Moto Edge (XT2205-1 / 2022)',
    releaseYear: 2022,
    msrp: 499,
    chipset: 'MediaTek Dimensity 1050',
    display: '6.6" 144Hz OLED',
    camera: '50MP Main + 13MP Ultra Wide',
    officialColors: [
      { name: 'Mineral Grey', hex: '#3C4043', colorFamily: 'Black / Dark', isHeroFinish: true }
    ]
  },
  {
    id: 'motorola-edge-30-xt2203-2022',
    brand: 'Motorola',
    model: 'Moto Edge 30 (XT2203 / 2022)',
    releaseYear: 2022,
    msrp: 449,
    chipset: 'Snapdragon 778G+ 5G',
    display: '6.5" AMOLED (144Hz, Ultra Thin 6.79mm)',
    camera: '50MP Main + 50MP Ultra Wide + 2MP Depth',
    officialColors: [
      { name: 'Meteor Grey', hex: '#2A2E33', colorFamily: 'Black / Dark', isHeroFinish: true },
      { name: 'Supermoon Silver', hex: '#D1D5DB', colorFamily: 'White / Silver' },
      { name: 'Aurora Green', hex: '#3E6B5C', colorFamily: 'Green' }
    ]
  },
  {
    id: 'motorola-edge-plus-edge-30-pro-xt2201-1-4-2022',
    brand: 'Motorola',
    model: 'Moto Edge Plus / Edge 30 Pro (XT2201-1/4 / 2022)',
    releaseYear: 2022,
    msrp: 899,
    chipset: 'Snapdragon 8 Gen 1',
    display: '6.7" Max Vision OLED (144Hz)',
    camera: '50MP Main + 50MP Ultra Wide + 2MP Depth',
    officialColors: [
      { name: 'Cosmos Blue', hex: '#1E2A38', colorFamily: 'Blue', isHeroFinish: true },
      { name: 'Stardust White', hex: '#F0F2F5', colorFamily: 'White / Silver' }
    ]
  },
  {
    id: 'motorola-edge-30-ultra-xt2201-2022',
    brand: 'Motorola',
    model: 'Moto Edge 30 Ultra (XT2201 / 2022)',
    releaseYear: 2022,
    msrp: 899,
    chipset: 'Snapdragon 8+ Gen 1',
    display: '6.67" Curved 144Hz pOLED',
    camera: '200MP Main + 50MP Ultra Wide + 12MP 2x Telephoto',
    officialColors: [
      { name: 'Interstellar Black', hex: '#121315', colorFamily: 'Black / Dark', isHeroFinish: true },
      { name: 'Starlight White', hex: '#F5F5F7', colorFamily: 'White / Silver' }
    ]
  },
  {
    id: 'motorola-edge-x30-5g-xt2201-2-6-2021',
    brand: 'Motorola',
    model: 'Moto Edge X30 5G (XT2201-2/6 / 2021)',
    releaseYear: 2021,
    msrp: 649,
    chipset: 'Snapdragon 8 Gen 1',
    display: '6.7" OLED (144Hz)',
    camera: '50MP Main + 50MP Ultra Wide + 2MP Depth',
    officialColors: [
      { name: 'Phantom Black', hex: '#1A1A1D', colorFamily: 'Black / Dark', isHeroFinish: true },
      { name: 'Glacier Blue', hex: '#ADD8E6', colorFamily: 'Blue' }
    ]
  },
  {
    id: 'motorola-edge-20-pro-xt2153-1-2021',
    brand: 'Motorola',
    model: 'Moto Edge 20 Pro (XT2153-1 / 2021)',
    releaseYear: 2021,
    msrp: 699,
    chipset: 'Snapdragon 870 5G',
    display: '6.7" OLED (144Hz)',
    camera: '108MP Main + 16MP Ultra Wide + 8MP 5x Periscope',
    officialColors: [
      { name: 'Midnight Blue', hex: '#121F33', colorFamily: 'Blue', isHeroFinish: true },
      { name: 'Iridescent White', hex: '#E6E8FA', colorFamily: 'White / Silver' },
      { name: 'Blue Vegan Leather', hex: '#2A52BE', colorFamily: 'Blue' }
    ]
  },
  {
    id: 'motorola-edge-20-xt2143-2021',
    brand: 'Motorola',
    model: 'Moto Edge 20 (XT2143 / 2021)',
    releaseYear: 2021,
    msrp: 499,
    chipset: 'Snapdragon 778G 5G',
    display: '6.7" OLED (144Hz, 6.99mm Thin)',
    camera: '108MP Main + 16MP Ultra Wide + 8MP 3x Telephoto',
    officialColors: [
      { name: 'Frosted Grey', hex: '#4A4E51', colorFamily: 'Black / Dark', isHeroFinish: true },
      { name: 'Frosted White', hex: '#FAFAFA', colorFamily: 'White / Silver' },
      { name: 'Frosted Emerald', hex: '#20B2AA', colorFamily: 'Green' }
    ]
  },
  {
    id: 'motorola-edge-5g-xt2141-2021',
    brand: 'Motorola',
    model: 'Moto Edge 5G (XT2141 / 2021)',
    releaseYear: 2021,
    msrp: 699,
    chipset: 'Snapdragon 778G 5G',
    display: '6.8" FHD+ LCD (144Hz)',
    camera: '108MP Main + 8MP Ultra Wide + Depth',
    officialColors: [
      { name: 'Nebula Blue', hex: '#1E375C', colorFamily: 'Blue', isHeroFinish: true }
    ]
  },
  {
    id: 'motorola-edge-20-fusion-xt2139-2-2021',
    brand: 'Motorola',
    model: 'Moto Edge 20 Fusion (XT2139-2 / 2021)',
    releaseYear: 2021,
    msrp: 349,
    chipset: 'MediaTek Dimensity 800U',
    display: '6.7" OLED (90Hz)',
    camera: '108MP Main + 8MP Ultra Wide + 2MP Depth',
    officialColors: [
      { name: 'Electric Graphite', hex: '#2C2D30', colorFamily: 'Black / Dark', isHeroFinish: true },
      { name: 'Cyber Teal', hex: '#008080', colorFamily: 'Green' }
    ]
  },
  {
    id: 'motorola-edge-20-lite-xt2139-1-2021',
    brand: 'Motorola',
    model: 'Moto Edge 20 Lite (XT2139-1 / 2021)',
    releaseYear: 2021,
    msrp: 349,
    chipset: 'MediaTek Dimensity 720',
    display: '6.7" OLED (90Hz)',
    camera: '108MP Main + 8MP Ultra Wide + Depth',
    officialColors: [
      { name: 'Electric Graphite', hex: '#2C2D30', colorFamily: 'Black / Dark', isHeroFinish: true },
      { name: 'LAGOON GREEN', hex: '#2E8B57', colorFamily: 'Green' }
    ]
  },
  {
    id: 'motorola-edge-5g-xt2063-2020',
    brand: 'Motorola',
    model: 'Moto Edge 5G (XT2063 / 2020)',
    releaseYear: 2020,
    msrp: 699,
    chipset: 'Snapdragon 765G 5G',
    display: '6.7" 90° Endless Edge OLED (90Hz)',
    camera: '64MP Main + 16MP Ultra Wide + 8MP Telephoto',
    officialColors: [
      { name: 'Solar Black', hex: '#1A1A1A', colorFamily: 'Black / Dark', isHeroFinish: true },
      { name: 'Midnight Magenta', hex: '#8B008B', colorFamily: 'Purple / Violet' }
    ]
  },
  {
    id: 'motorola-edge-plus-xt2061-2020',
    brand: 'Motorola',
    model: 'Moto Edge Plus (XT2061 / 2020)',
    releaseYear: 2020,
    msrp: 999,
    chipset: 'Snapdragon 865 5G',
    display: '6.7" 90° Endless Edge OLED (90Hz)',
    camera: '108MP OIS Main + 16MP Ultra Wide + 8MP 3x Telephoto',
    officialColors: [
      { name: 'Smoky Sangria', hex: '#660033', colorFamily: 'Pink / Red', isHeroFinish: true },
      { name: 'Thunder Grey', hex: '#4A5568', colorFamily: 'Titanium / Neutral' }
    ]
  },
  // MOTO G SERIES (COMPLETE CATALOG)
  {
    id: 'motorola-g47-xt2625-2026',
    brand: 'Motorola',
    model: 'Moto G47 (XT2625 / 2026)',
    releaseYear: 2026,
    msrp: 299,
    chipset: 'Snapdragon 6 Gen 1',
    display: '6.6" FHD+ IPS LCD (120Hz)',
    camera: '50MP Quad Pixel + 8MP Ultra Wide',
    officialColors: [
      { name: 'Pantone Sage Green', hex: '#87A96B', colorFamily: 'Green', isHeroFinish: true },
      { name: 'Midnight Black', hex: '#1E2022', colorFamily: 'Black / Dark' }
    ]
  },
  {
    id: 'motorola-g37-power-xt2625-2026',
    brand: 'Motorola',
    model: 'Moto G37 Power (XT2625 / 2026)',
    releaseYear: 2026,
    msrp: 269,
    chipset: 'MediaTek Helio G88',
    display: '6.6" HD+ IPS LCD (90Hz, 6000mAh)',
    camera: '50MP Main + 2MP Macro',
    officialColors: [
      { name: 'Ocean Blue', hex: '#006699', colorFamily: 'Blue', isHeroFinish: true },
      { name: 'Dark Charcoal', hex: '#333333', colorFamily: 'Black / Dark' }
    ]
  },
  {
    id: 'motorola-g37-xt2625-2026',
    brand: 'Motorola',
    model: 'Moto G37 (XT2625 / 2026)',
    releaseYear: 2026,
    msrp: 229,
    chipset: 'MediaTek Helio G85',
    display: '6.56" HD+ LCD (90Hz)',
    camera: '50MP Main + 2MP Macro',
    officialColors: [
      { name: 'Lavender Frost', hex: '#E6E6FA', colorFamily: 'Purple / Violet', isHeroFinish: true },
      { name: 'Cosmic Black', hex: '#1C1C1C', colorFamily: 'Black / Dark' }
    ]
  },
  {
    id: 'motorola-g17-power-xt2623-2026',
    brand: 'Motorola',
    model: 'Moto G17 Power (XT2623 / 2026)',
    releaseYear: 2026,
    msrp: 199,
    chipset: 'UNISOC T616',
    display: '6.5" HD+ LCD (90Hz, 6000mAh)',
    camera: '50MP Main + 2MP Depth',
    officialColors: [
      { name: 'Forest Green', hex: '#228B22', colorFamily: 'Green', isHeroFinish: true },
      { name: 'Graphite Grey', hex: '#383838', colorFamily: 'Black / Dark' }
    ]
  },
  {
    id: 'motorola-g17-xt2623-2026',
    brand: 'Motorola',
    model: 'Moto G17 (XT2623 / 2026)',
    releaseYear: 2026,
    msrp: 169,
    chipset: 'UNISOC T606',
    display: '6.5" HD+ LCD (90Hz)',
    camera: '50MP Main + 2MP Depth',
    officialColors: [
      { name: 'Satin Blue', hex: '#4682B4', colorFamily: 'Blue', isHeroFinish: true },
      { name: 'Matte Grey', hex: '#708090', colorFamily: 'Titanium / Neutral' }
    ]
  },
  {
    id: 'motorola-g77-xt2621-2026',
    brand: 'Motorola',
    model: 'Moto G77 (XT2621 / 2026)',
    releaseYear: 2026,
    msrp: 349,
    chipset: 'MediaTek Dimensity 7025',
    display: '6.7" FHD+ pOLED (120Hz)',
    camera: '50MP OIS Sony LYT + 8MP Ultra Wide',
    officialColors: [
      { name: 'Pantone Steel Blue', hex: '#4682B4', colorFamily: 'Blue', isHeroFinish: true },
      { name: 'Charcoal Black', hex: '#232323', colorFamily: 'Black / Dark' }
    ]
  },
  {
    id: 'motorola-g67-xt2621-2-2026',
    brand: 'Motorola',
    model: 'Moto G67 (XT2621-2 / 2026)',
    releaseYear: 2026,
    msrp: 299,
    chipset: 'Snapdragon 6 Gen 1',
    display: '6.67" FHD+ IPS LCD (120Hz)',
    camera: '50MP Main + 8MP Ultra Wide',
    officialColors: [
      { name: 'Emerald Teal', hex: '#008080', colorFamily: 'Green', isHeroFinish: true },
      { name: 'Meteorite Black', hex: '#181818', colorFamily: 'Black / Dark' }
    ]
  },
  {
    id: 'motorola-g-power-xt2617-2026',
    brand: 'Motorola',
    model: 'Moto G Power (XT2617 / 2026)',
    releaseYear: 2026,
    msrp: 299,
    chipset: 'MediaTek Dimensity 7020',
    display: '6.7" FHD+ 120Hz Display',
    camera: '50MP OIS + 8MP Ultra Wide',
    officialColors: [
      { name: 'Midnight Gray', hex: '#2F3136', colorFamily: 'Black / Dark', isHeroFinish: true },
      { name: 'Pale Mint', hex: '#C5E1A5', colorFamily: 'Green' }
    ]
  },
  {
    id: 'motorola-g-play-xt2615-2026',
    brand: 'Motorola',
    model: 'Moto G Play (XT2615 / 2026)',
    releaseYear: 2026,
    msrp: 149,
    chipset: 'Snapdragon 680',
    display: '6.5" 90Hz HD+ Display',
    camera: '50MP Main Camera',
    officialColors: [
      { name: 'Sapphire Blue', hex: '#0F52BA', colorFamily: 'Blue', isHeroFinish: true },
      { name: 'Black Velvet', hex: '#121212', colorFamily: 'Black / Dark' }
    ]
  },
  {
    id: 'motorola-g-5g-xt2613-2026',
    brand: 'Motorola',
    model: 'Moto G 5G (XT2613 / 2026)',
    releaseYear: 2026,
    msrp: 199,
    chipset: 'Snapdragon 4 Gen 1',
    display: '6.6" 120Hz HD+ Display',
    camera: '50MP Quad Pixel + 2MP Macro',
    officialColors: [
      { name: 'Sage Green', hex: '#9CAF88', colorFamily: 'Green', isHeroFinish: true },
      { name: 'Volcanic Black', hex: '#1F1F1F', colorFamily: 'Black / Dark' }
    ]
  },
  {
    id: 'motorola-g-stylus-5g-xt2619-2026',
    brand: 'Motorola',
    model: 'Moto G Stylus 5G (XT2619 / 2026)',
    releaseYear: 2026,
    msrp: 399,
    chipset: 'Snapdragon 6 Gen 1',
    display: '6.7" FHD+ pOLED (120Hz) with Built-in Stylus',
    camera: '50MP OIS + 13MP Ultra Wide',
    officialColors: [
      { name: 'Caramel Latte', hex: '#C5A059', colorFamily: 'Gold / Bronze', isHeroFinish: true },
      { name: 'Scarlet Red', hex: '#A91B0D', colorFamily: 'Pink / Red' }
    ]
  },
  {
    id: 'motorola-g06-power-xt2535-10-2025',
    brand: 'Motorola',
    model: 'Moto G06 Power (XT2535-10 / 2025)',
    releaseYear: 2025,
    msrp: 179,
    chipset: 'UNISOC T606',
    display: '6.56" HD+ 90Hz (6000mAh)',
    camera: '50MP Main Camera',
    officialColors: [
      { name: 'Sunrise Orange', hex: '#FF7F50', colorFamily: 'Orange / Yellow', isHeroFinish: true },
      { name: 'Matte Charcoal', hex: '#2B2B2B', colorFamily: 'Black / Dark' }
    ]
  },
  {
    id: 'motorola-g06-xt2535-2025',
    brand: 'Motorola',
    model: 'Moto G06 (XT2535 / 2025)',
    releaseYear: 2025,
    msrp: 139,
    chipset: 'UNISOC T606',
    display: '6.56" HD+ 90Hz Display',
    camera: '50MP Quad Pixel',
    officialColors: [
      { name: 'Concord Black', hex: '#1A1A1A', colorFamily: 'Black / Dark', isHeroFinish: true },
      { name: 'Seafoam Green', hex: '#93E9BE', colorFamily: 'Green' }
    ]
  },
  {
    id: 'motorola-g57-power-xt2537-5-2025',
    brand: 'Motorola',
    model: 'Moto G57 Power (XT2537-5 / 2025)',
    releaseYear: 2025,
    msrp: 249,
    chipset: 'Snapdragon 6s Gen 3',
    display: '6.5" FHD+ LCD (120Hz, 6000mAh)',
    camera: '50MP Main + 8MP Ultra Wide',
    officialColors: [
      { name: 'Midnight Blue', hex: '#1B263B', colorFamily: 'Blue', isHeroFinish: true },
      { name: 'Pewter Grey', hex: '#8A8D8F', colorFamily: 'Titanium / Neutral' }
    ]
  },
  {
    id: 'motorola-g57-xt2537-2025',
    brand: 'Motorola',
    model: 'Moto G57 (XT2537 / 2025)',
    releaseYear: 2025,
    msrp: 219,
    chipset: 'Snapdragon 6s Gen 3',
    display: '6.5" FHD+ LCD (120Hz)',
    camera: '50MP Main + 2MP Macro',
    officialColors: [
      { name: 'Icy Blue', hex: '#A0C4DF', colorFamily: 'Blue', isHeroFinish: true },
      { name: 'Shadow Black', hex: '#212121', colorFamily: 'Black / Dark' }
    ]
  },
  {
    id: 'motorola-g67-power-5g-xt2533-2025',
    brand: 'Motorola',
    model: 'Moto G67 Power 5G (XT2533 / 2025)',
    releaseYear: 2025,
    msrp: 279,
    chipset: 'MediaTek Dimensity 7025',
    display: '6.6" FHD+ 120Hz LCD (6000mAh)',
    camera: '50MP OIS Main + 8MP Ultra Wide',
    officialColors: [
      { name: 'Forest Blue', hex: '#1E3A5F', colorFamily: 'Blue', isHeroFinish: true },
      { name: 'Slate Gray', hex: '#708090', colorFamily: 'Titanium / Neutral' }
    ]
  },
  {
    id: 'motorola-g96-xt2531-2025',
    brand: 'Motorola',
    model: 'Moto G96 (XT2531 / 2025)',
    releaseYear: 2025,
    msrp: 329,
    chipset: 'Snapdragon 695 5G',
    display: '6.7" FHD+ pOLED (120Hz)',
    camera: '50MP Sony LYT OIS + 8MP Ultra Wide',
    officialColors: [
      { name: 'Pantone Viva Magenta', hex: '#BB2649', colorFamily: 'Pink / Red', isHeroFinish: true },
      { name: 'Cosmic Black', hex: '#121212', colorFamily: 'Black / Dark' }
    ]
  },
  {
    id: 'motorola-g56-5g-xt2529-2025',
    brand: 'Motorola',
    model: 'Moto G56 5G (XT2529 / 2025)',
    releaseYear: 2025,
    msrp: 229,
    chipset: 'MediaTek Dimensity 7020',
    display: '6.5" FHD+ 120Hz LCD',
    camera: '50MP OIS Main + 8MP Ultra Wide',
    officialColors: [
      { name: 'Indigo Blue', hex: '#4B0082', colorFamily: 'Purple / Violet', isHeroFinish: true },
      { name: 'Mint Green', hex: '#98FF98', colorFamily: 'Green' }
    ]
  },
  {
    id: 'motorola-g86-xt2527-2025',
    brand: 'Motorola',
    model: 'Moto G86 (XT2527 / 2025)',
    releaseYear: 2025,
    msrp: 349,
    chipset: 'Snapdragon 7s Gen 2',
    display: '6.67" Curved 120Hz pOLED',
    camera: '50MP OIS Sony LYT-700C + 13MP Ultra Wide',
    officialColors: [
      { name: 'Pantone Peach Fuzz', hex: '#FFBE98', colorFamily: 'Pink / Red', isHeroFinish: true },
      { name: 'Charcoal Black', hex: '#1C1C1E', colorFamily: 'Black / Dark' }
    ]
  },
  {
    id: 'motorola-g05-xt2523-2025',
    brand: 'Motorola',
    model: 'Moto G05 (XT2523 / 2025)',
    releaseYear: 2025,
    msrp: 129,
    chipset: 'UNISOC T606',
    display: '6.56" HD+ 90Hz Display',
    camera: '50MP Main Camera',
    officialColors: [
      { name: 'Satin Blue', hex: '#5B84B1', colorFamily: 'Blue', isHeroFinish: true },
      { name: 'Plum Purple', hex: '#4B2E4C', colorFamily: 'Purple / Violet' }
    ]
  },
  {
    id: 'motorola-g15-power-xt2521-5-2025',
    brand: 'Motorola',
    model: 'Moto G15 Power (XT2521-5 / 2025)',
    releaseYear: 2025,
    msrp: 189,
    chipset: 'MediaTek Helio G81',
    display: '6.5" HD+ 90Hz (6000mAh)',
    camera: '50MP Main + 2MP Macro',
    officialColors: [
      { name: 'Forest Green', hex: '#225B3E', colorFamily: 'Green', isHeroFinish: true },
      { name: 'Titanium Grey', hex: '#5A5D64', colorFamily: 'Titanium / Neutral' }
    ]
  },
  {
    id: 'motorola-g15-xt2521-2025',
    brand: 'Motorola',
    model: 'Moto G15 (XT2521 / 2025)',
    releaseYear: 2025,
    msrp: 159,
    chipset: 'MediaTek Helio G81',
    display: '6.5" HD+ 90Hz Display',
    camera: '50MP Main Camera',
    officialColors: [
      { name: 'Ocean Blue', hex: '#1E5162', colorFamily: 'Blue', isHeroFinish: true },
      { name: 'Gravity Black', hex: '#18181A', colorFamily: 'Black / Dark' }
    ]
  },
  {
    id: 'motorola-g-stylus-5g-xt2517-2025',
    brand: 'Motorola',
    model: 'Moto G Stylus 5G (XT2517 / 2025)',
    releaseYear: 2025,
    msrp: 399,
    chipset: 'Snapdragon 6 Gen 1',
    display: '6.7" FHD+ pOLED (120Hz) with Stylus',
    camera: '50MP OIS + 13MP Ultra Wide',
    officialColors: [
      { name: 'Caramel Latte', hex: '#C5A059', colorFamily: 'Gold / Bronze', isHeroFinish: true },
      { name: 'Scarlet Wave', hex: '#8B0000', colorFamily: 'Pink / Red' }
    ]
  },
  {
    id: 'motorola-g-power-xt2515-2025',
    brand: 'Motorola',
    model: 'Moto G Power (XT2515 / 2025)',
    releaseYear: 2025,
    msrp: 299,
    chipset: 'MediaTek Dimensity 7020',
    display: '6.7" FHD+ 120Hz Display',
    camera: '50MP OIS + 8MP Ultra Wide',
    officialColors: [
      { name: 'Midnight Gray', hex: '#2F3136', colorFamily: 'Black / Dark', isHeroFinish: true },
      { name: 'Pale Mint', hex: '#C5E1A5', colorFamily: 'Green' }
    ]
  },
  {
    id: 'motorola-g-5g-xt2513-2025',
    brand: 'Motorola',
    model: 'Moto G 5G (XT2513 / 2025)',
    releaseYear: 2025,
    msrp: 199,
    chipset: 'Snapdragon 4 Gen 1',
    display: '6.6" 120Hz HD+ Display',
    camera: '50MP Main + 2MP Macro',
    officialColors: [
      { name: 'Sage Green', hex: '#9CAF88', colorFamily: 'Green', isHeroFinish: true },
      { name: 'Shadow Black', hex: '#212121', colorFamily: 'Black / Dark' }
    ]
  },
  {
    id: 'motorola-g75-5g-xt2437-2024',
    brand: 'Motorola',
    model: 'Moto G75 5G (XT2437 / 2024)',
    releaseYear: 2024,
    msrp: 349,
    chipset: 'Snapdragon 6 Gen 3',
    display: '6.78" FHD+ IPS LCD (120Hz, MIL-STD-810H)',
    camera: '50MP Sony LYT-600 OIS + 8MP Ultra Wide',
    officialColors: [
      { name: 'Pantone Aqua Blue', hex: '#00A86B', colorFamily: 'Blue', isHeroFinish: true },
      { name: 'Succulent Green', hex: '#3B7A57', colorFamily: 'Green' },
      { name: 'Charcoal Grey', hex: '#333333', colorFamily: 'Black / Dark' }
    ]
  },
  {
    id: 'motorola-g55-5g-xt2435-2024',
    brand: 'Motorola',
    model: 'Moto G55 5G (XT2435 / 2024)',
    releaseYear: 2024,
    msrp: 249,
    chipset: 'MediaTek Dimensity 7025',
    display: '6.49" FHD+ LCD (120Hz)',
    camera: '50MP OIS Main + 8MP Ultra Wide',
    officialColors: [
      { name: 'Forest Grey', hex: '#3A423A', colorFamily: 'Black / Dark', isHeroFinish: true },
      { name: 'Smoky Green', hex: '#556B2F', colorFamily: 'Green' },
      { name: 'Twilight Purple', hex: '#4B0082', colorFamily: 'Purple / Violet' }
    ]
  },
  {
    id: 'motorola-g35-xt2433-2024',
    brand: 'Motorola',
    model: 'Moto G35 (XT2433 / 2024)',
    releaseYear: 2024,
    msrp: 199,
    chipset: 'UNISOC T760 5G',
    display: '6.72" FHD+ LCD (120Hz)',
    camera: '50MP Main + 8MP Ultra Wide',
    officialColors: [
      { name: 'Leaf Green', hex: '#789262', colorFamily: 'Green', isHeroFinish: true },
      { name: 'Guava Red', hex: '#D24D57', colorFamily: 'Pink / Red' },
      { name: 'Midnight Black', hex: '#1C1C1C', colorFamily: 'Black / Dark' }
    ]
  },
  {
    id: 'motorola-g64-5g-xt2431-2024',
    brand: 'Motorola',
    model: 'Moto G64 5G (XT2431 / 2024)',
    releaseYear: 2024,
    msrp: 229,
    chipset: 'MediaTek Dimensity 7025',
    display: '6.5" FHD+ LCD (120Hz, 6000mAh)',
    camera: '50MP OIS + 8MP Ultra Wide',
    officialColors: [
      { name: 'Mint Green', hex: '#98FF98', colorFamily: 'Green', isHeroFinish: true },
      { name: 'Pearl Blue', hex: '#B0C4DE', colorFamily: 'Blue' },
      { name: 'Ice Lilac', hex: '#C8A2C8', colorFamily: 'Purple / Violet' }
    ]
  },
  {
    id: 'motorola-g85-xt2427-2024',
    brand: 'Motorola',
    model: 'Moto G85 (XT2427 / 2024)',
    releaseYear: 2024,
    msrp: 329,
    chipset: 'Snapdragon 6s Gen 3',
    display: '6.67" 3D Curved 120Hz pOLED',
    camera: '50MP Sony LYT-600 OIS + 8MP Ultra Wide',
    officialColors: [
      { name: 'Olive Green', hex: '#556B2F', colorFamily: 'Green', isHeroFinish: true },
      { name: 'Cobalt Blue', hex: '#0047AB', colorFamily: 'Blue' },
      { name: 'Urban Grey', hex: '#36454F', colorFamily: 'Black / Dark' }
    ]
  },
  {
    id: 'motorola-g24-power-xt2425-2024',
    brand: 'Motorola',
    model: 'Moto G24 Power (XT2425 / 2024)',
    releaseYear: 2024,
    msrp: 149,
    chipset: 'MediaTek Helio G85',
    display: '6.56" HD+ 90Hz (6000mAh)',
    camera: '50MP Main + 2MP Macro',
    officialColors: [
      { name: 'Glacier Blue', hex: '#ADD8E6', colorFamily: 'Blue', isHeroFinish: true },
      { name: 'Ink Blue', hex: '#000080', colorFamily: 'Blue' }
    ]
  },
  {
    id: 'motorola-g24-xt2423-2024',
    brand: 'Motorola',
    model: 'Moto G24 (XT2423 / 2024)',
    releaseYear: 2024,
    msrp: 129,
    chipset: 'MediaTek Helio G85',
    display: '6.56" HD+ 90Hz LCD',
    camera: '50MP Main + 2MP Macro',
    officialColors: [
      { name: 'Matte Charcoal', hex: '#2A2A2A', colorFamily: 'Black / Dark', isHeroFinish: true },
      { name: 'Ice Green', hex: '#A2E8DD', colorFamily: 'Green' },
      { name: 'Pink Lavender', hex: '#D8B4F8', colorFamily: 'Purple / Violet' }
    ]
  },
  {
    id: 'motorola-g04-g04s-xt2421-2024',
    brand: 'Motorola',
    model: 'Moto G04 / G04s (XT2421 / 2024)',
    releaseYear: 2024,
    msrp: 119,
    chipset: 'UNISOC T606',
    display: '6.56" HD+ 90Hz LCD',
    camera: '50MP (G04s) / 16MP (G04) Main',
    officialColors: [
      { name: 'Concord Black', hex: '#1C1C1E', colorFamily: 'Black / Dark', isHeroFinish: true },
      { name: 'Sea Green', hex: '#2E8B57', colorFamily: 'Green' },
      { name: 'Satin Blue', hex: '#4682B4', colorFamily: 'Blue' },
      { name: 'Sunrise Orange', hex: '#FF7F50', colorFamily: 'Orange / Yellow' }
    ]
  },
  {
    id: 'motorola-g-stylus-5g-xt2419-2024',
    brand: 'Motorola',
    model: 'Moto G Stylus 5G (XT2419 / 2024)',
    releaseYear: 2024,
    msrp: 399,
    chipset: 'Snapdragon 6 Gen 1',
    display: '6.7" FHD+ pOLED (120Hz) with Stylus',
    camera: '50MP OIS + 13MP Ultra Wide',
    officialColors: [
      { name: 'Caramel Latte', hex: '#C5A059', colorFamily: 'Gold / Bronze', isHeroFinish: true },
      { name: 'Scarlet Wave', hex: '#8B0000', colorFamily: 'Pink / Red' }
    ]
  },
  {
    id: 'motorola-g-5g-xt2417-2024',
    brand: 'Motorola',
    model: 'Moto G 5G (XT2417 / 2024)',
    releaseYear: 2024,
    msrp: 199,
    chipset: 'Snapdragon 4 Gen 1',
    display: '6.6" 120Hz HD+ Display',
    camera: '50MP Quad Pixel + 2MP Macro',
    officialColors: [
      { name: 'Sage Green', hex: '#9CAF88', colorFamily: 'Green', isHeroFinish: true }
    ]
  },
  {
    id: 'motorola-g-power-5g-xt2415-2024',
    brand: 'Motorola',
    model: 'Moto G Power 5G (XT2415 / 2024)',
    releaseYear: 2024,
    msrp: 299,
    chipset: 'MediaTek Dimensity 7020',
    display: '6.7" FHD+ 120Hz Display',
    camera: '50MP OIS + 8MP Ultra Wide',
    officialColors: [
      { name: 'Midnight Gray', hex: '#2F3136', colorFamily: 'Black / Dark', isHeroFinish: true },
      { name: 'Pale Mint', hex: '#C5E1A5', colorFamily: 'Green' }
    ]
  },
  {
    id: 'motorola-g-play-xt2413-2024',
    brand: 'Motorola',
    model: 'Moto G Play (XT2413 / 2024)',
    releaseYear: 2024,
    msrp: 149,
    chipset: 'Snapdragon 680',
    display: '6.5" 90Hz HD+ Display',
    camera: '50MP Main Camera',
    officialColors: [
      { name: 'Sapphire Blue', hex: '#0F52BA', colorFamily: 'Blue', isHeroFinish: true }
    ]
  },
  {
    id: 'motorola-g45-5g-xt2369-2024',
    brand: 'Motorola',
    model: 'Moto G45 5G (XT2369 / 2024)',
    releaseYear: 2024,
    msrp: 169,
    chipset: 'Snapdragon 6s Gen 3',
    display: '6.5" HD+ 120Hz Display',
    camera: '50MP Quad Pixel + 2MP Macro',
    officialColors: [
      { name: 'Brilliant Blue', hex: '#007FFF', colorFamily: 'Blue', isHeroFinish: true },
      { name: 'Brilliant Green', hex: '#66CDAA', colorFamily: 'Green' },
      { name: 'Viva Magenta', hex: '#BB2649', colorFamily: 'Pink / Red' }
    ]
  },
  {
    id: 'motorola-g34-xt2363-2023',
    brand: 'Motorola',
    model: 'Moto G34 (XT2363 / 2023)',
    releaseYear: 2023,
    msrp: 169,
    chipset: 'Snapdragon 695 5G',
    display: '6.5" HD+ 120Hz Display',
    camera: '50MP Quad Pixel + 2MP Macro',
    officialColors: [
      { name: 'Ocean Green (Vegan Leather)', hex: '#2E8B57', colorFamily: 'Green', isHeroFinish: true },
      { name: 'Ice Blue', hex: '#AFEEEE', colorFamily: 'Blue' },
      { name: 'Charcoal Black', hex: '#1C1C1C', colorFamily: 'Black / Dark' }
    ]
  },
  {
    id: 'motorola-g84-xt2347-2023',
    brand: 'Motorola',
    model: 'Moto G84 (XT2347 / 2023)',
    releaseYear: 2023,
    msrp: 299,
    chipset: 'Snapdragon 695 5G',
    display: '6.55" FHD+ 120Hz pOLED',
    camera: '50MP OIS + 8MP Ultra Wide',
    officialColors: [
      { name: 'Pantone Viva Magenta', hex: '#BB2649', colorFamily: 'Pink / Red', isHeroFinish: true },
      { name: 'Marshmallow Blue', hex: '#7092BE', colorFamily: 'Blue' },
      { name: 'Midnight Blue', hex: '#191970', colorFamily: 'Blue' }
    ]
  },
  {
    id: 'motorola-g14-xt2341-2023',
    brand: 'Motorola',
    model: 'Moto G14 (XT2341 / 2023)',
    releaseYear: 2023,
    msrp: 139,
    chipset: 'UNISOC T616',
    display: '6.5" FHD+ Display',
    camera: '50MP Quad Pixel + 2MP Macro',
    officialColors: [
      { name: 'Steel Gray', hex: '#4682B4', colorFamily: 'Titanium / Neutral', isHeroFinish: true },
      { name: 'Sky Blue', hex: '#87CEEB', colorFamily: 'Blue' },
      { name: 'Butter Cream', hex: '#FFFDD0', colorFamily: 'Gold / Bronze' },
      { name: 'Pale Lilac', hex: '#DCD0FF', colorFamily: 'Purple / Violet' }
    ]
  },
  {
    id: 'motorola-g54-xt2343-2023',
    brand: 'Motorola',
    model: 'Moto G54 (XT2343 / 2023)',
    releaseYear: 2023,
    msrp: 219,
    chipset: 'MediaTek Dimensity 7020',
    display: '6.5" FHD+ 120Hz Display',
    camera: '50MP OIS + 8MP Ultra Wide',
    officialColors: [
      { name: 'Midnight Blue', hex: '#191970', colorFamily: 'Blue', isHeroFinish: true },
      { name: 'Mint Green', hex: '#98FF98', colorFamily: 'Green' },
      { name: 'Pearl Blue', hex: '#B0C4DE', colorFamily: 'Blue' }
    ]
  },
  {
    id: 'motorola-g53-xt2335-2022',
    brand: 'Motorola',
    model: 'Moto G53 (XT2335 / 2022)',
    releaseYear: 2022,
    msrp: 199,
    chipset: 'Snapdragon 480+ 5G',
    display: '6.5" HD+ 120Hz Display',
    camera: '50MP Quad Pixel + 2MP Macro',
    officialColors: [
      { name: 'Ink Blue', hex: '#000080', colorFamily: 'Blue', isHeroFinish: true },
      { name: 'Arctic Silver', hex: '#E0E0E0', colorFamily: 'White / Silver' },
      { name: 'Pale Pink', hex: '#FFD1DC', colorFamily: 'Pink / Red' }
    ]
  },
  {
    id: 'motorola-g23-xt2333-2023',
    brand: 'Motorola',
    model: 'Moto G23 (XT2333 / 2023)',
    releaseYear: 2023,
    msrp: 179,
    chipset: 'MediaTek Helio G85',
    display: '6.5" HD+ 90Hz Display',
    camera: '50MP Main + 5MP Ultra Wide + 2MP Macro',
    officialColors: [
      { name: 'Matte Charcoal', hex: '#2A2A2A', colorFamily: 'Black / Dark', isHeroFinish: true },
      { name: 'Pearl White', hex: '#F8F9FA', colorFamily: 'White / Silver' },
      { name: 'Steel Blue', hex: '#4682B4', colorFamily: 'Blue' }
    ]
  },
  {
    id: 'motorola-g13-xt2331-2023',
    brand: 'Motorola',
    model: 'Moto G13 (XT2331 / 2023)',
    releaseYear: 2023,
    msrp: 149,
    chipset: 'MediaTek Helio G85',
    display: '6.5" HD+ 90Hz Display',
    camera: '50MP Main + 2MP Macro + 2MP Depth',
    officialColors: [
      { name: 'Matte Charcoal', hex: '#2A2A2A', colorFamily: 'Black / Dark', isHeroFinish: true },
      { name: 'Blue Lavender', hex: '#A8A2D8', colorFamily: 'Purple / Violet' },
      { name: 'Rose Gold', hex: '#B76E79', colorFamily: 'Gold / Bronze' }
    ]
  },
  {
    id: 'motorola-g-stylus-4g-xt2317-2023',
    brand: 'Motorola',
    model: 'Moto G Stylus 4G (XT2317 / 2023)',
    releaseYear: 2023,
    msrp: 199,
    chipset: 'MediaTek Helio G85',
    display: '6.5" HD+ 90Hz Display with Stylus',
    camera: '50MP Main + 2MP Macro',
    officialColors: [
      { name: 'Glam Pink', hex: '#FFB6C1', colorFamily: 'Pink / Red', isHeroFinish: true },
      { name: 'Midnight Blue', hex: '#191970', colorFamily: 'Blue' }
    ]
  },
  {
    id: 'motorola-g-stylus-5g-xt2315-2023',
    brand: 'Motorola',
    model: 'Moto G Stylus 5G (XT2315 / 2023)',
    releaseYear: 2023,
    msrp: 399,
    chipset: 'Snapdragon 6 Gen 1',
    display: '6.6" FHD+ 120Hz Display',
    camera: '50MP OIS + 8MP Ultra Wide',
    officialColors: [
      { name: 'Cosmic Black', hex: '#121212', colorFamily: 'Black / Dark', isHeroFinish: true },
      { name: 'Rose Champagne', hex: '#E8C5C8', colorFamily: 'Gold / Bronze' }
    ]
  },
  {
    id: 'motorola-g-5g-xt2313-2023',
    brand: 'Motorola',
    model: 'Moto G 5G (XT2313 / 2023)',
    releaseYear: 2023,
    msrp: 249,
    chipset: 'Snapdragon 480+ 5G',
    display: '6.5" 120Hz HD+ Display',
    camera: '48MP Quad Pixel + 2MP Macro',
    officialColors: [
      { name: 'Ink Blue', hex: '#000080', colorFamily: 'Blue', isHeroFinish: true }
    ]
  },
  {
    id: 'motorola-g-power-5g-xt2311-2023',
    brand: 'Motorola',
    model: 'Moto G Power 5G (XT2311 / 2023)',
    releaseYear: 2023,
    msrp: 299,
    chipset: 'MediaTek Dimensity 930',
    display: '6.5" FHD+ 120Hz Display',
    camera: '50MP Main + 2MP Depth + 2MP Macro',
    officialColors: [
      { name: 'Mineral Black', hex: '#242526', colorFamily: 'Black / Dark', isHeroFinish: true },
      { name: 'Bright White', hex: '#FFFFFF', colorFamily: 'White / Silver' }
    ]
  },
  {
    id: 'motorola-g-play-xt2271-2023',
    brand: 'Motorola',
    model: 'Moto G Play (XT2271 / 2023)',
    releaseYear: 2023,
    msrp: 169,
    chipset: 'MediaTek Helio G37',
    display: '6.5" 90Hz HD+ Display',
    camera: '16MP Main + 2MP Macro + 2MP Depth',
    officialColors: [
      { name: 'Deep Sapphire', hex: '#082567', colorFamily: 'Blue', isHeroFinish: true }
    ]
  },
  {
    id: 'motorola-g73-xt2237-2022',
    brand: 'Motorola',
    model: 'Moto G73 (XT2237 / 2022)',
    releaseYear: 2022,
    msrp: 299,
    chipset: 'MediaTek Dimensity 930',
    display: '6.5" FHD+ 120Hz Display',
    camera: '50MP Ultra Pixel + 8MP Ultra Wide',
    officialColors: [
      { name: 'Midnight Blue', hex: '#191970', colorFamily: 'Blue', isHeroFinish: true },
      { name: 'Lucent White', hex: '#F5F5F7', colorFamily: 'White / Silver' }
    ]
  },
  {
    id: 'motorola-g32-xt2235-2022',
    brand: 'Motorola',
    model: 'Moto G32 (XT2235 / 2022)',
    releaseYear: 2022,
    msrp: 199,
    chipset: 'Snapdragon 680 4G',
    display: '6.5" FHD+ 90Hz Display',
    camera: '50MP Main + 8MP Ultra Wide + 2MP Macro',
    officialColors: [
      { name: 'Mineral Grey', hex: '#3C4043', colorFamily: 'Black / Dark', isHeroFinish: true },
      { name: 'Satin Silver', hex: '#C0C0C0', colorFamily: 'White / Silver' },
      { name: 'Rose Gold', hex: '#B76E79', colorFamily: 'Gold / Bronze' }
    ]
  },
  {
    id: 'motorola-g42-xt2233-2022',
    brand: 'Motorola',
    model: 'Moto G42 (XT2233 / 2022)',
    releaseYear: 2022,
    msrp: 229,
    chipset: 'Snapdragon 680 4G',
    display: '6.4" FHD+ OLED Display',
    camera: '50MP Main + 8MP Ultra Wide + 2MP Macro',
    officialColors: [
      { name: 'Atlantic Green', hex: '#006A4E', colorFamily: 'Green', isHeroFinish: true },
      { name: 'Metallic Rose', hex: '#D4AF37', colorFamily: 'Gold / Bronze' }
    ]
  },
  {
    id: 'motorola-g22-xt2231-2022',
    brand: 'Motorola',
    model: 'Moto G22 (XT2231 / 2022)',
    releaseYear: 2022,
    msrp: 169,
    chipset: 'MediaTek Helio G37',
    display: '6.5" HD+ 90Hz Display',
    camera: '50MP Quad Pixel + 8MP Ultra Wide + 2MP Macro + Depth',
    officialColors: [
      { name: 'Cosmic Black', hex: '#1C1C1C', colorFamily: 'Black / Dark', isHeroFinish: true },
      { name: 'Iceberg Blue', hex: '#71A6D2', colorFamily: 'Blue' },
      { name: 'Mint Green', hex: '#98FF98', colorFamily: 'Green' }
    ]
  },
  {
    id: 'motorola-g72-xt2255-1-2022',
    brand: 'Motorola',
    model: 'Moto G72 (XT2255-1 / 2022)',
    releaseYear: 2022,
    msrp: 299,
    chipset: 'MediaTek Helio G99',
    display: '6.6" FHD+ pOLED (120Hz, 10-bit)',
    camera: '108MP Main + 8MP Ultra Wide + 2MP Macro',
    officialColors: [
      { name: 'Meteorite Grey', hex: '#2A2E33', colorFamily: 'Black / Dark', isHeroFinish: true },
      { name: 'Mineral White', hex: '#F0F0F0', colorFamily: 'White / Silver' },
      { name: 'Polar Blue', hex: '#87CEEB', colorFamily: 'Blue' }
    ]
  },
  {
    id: 'motorola-g82-5g-xt2225-1-2022',
    brand: 'Motorola',
    model: 'Moto G82 5G (XT2225-1 / 2022)',
    releaseYear: 2022,
    msrp: 349,
    chipset: 'Snapdragon 695 5G',
    display: '6.6" FHD+ 120Hz AMOLED',
    camera: '50MP OIS Main + 8MP Ultra Wide + 2MP Macro',
    officialColors: [
      { name: 'Meteorite Gray', hex: '#2A2E33', colorFamily: 'Black / Dark', isHeroFinish: true },
      { name: 'White Lily', hex: '#FAF9F6', colorFamily: 'White / Silver' }
    ]
  },
  {
    id: 'motorola-g71s-xt2225-2-2022',
    brand: 'Motorola',
    model: 'Moto G71S (XT2225-2 / 2022)',
    releaseYear: 2022,
    msrp: 279,
    chipset: 'Snapdragon 695 5G',
    display: '6.6" FHD+ OLED (120Hz)',
    camera: '50MP OIS + 8MP Ultra Wide + 2MP Macro',
    officialColors: [
      { name: 'Phantom Black', hex: '#1C1C1E', colorFamily: 'Black / Dark', isHeroFinish: true },
      { name: 'Titanium White', hex: '#F5F5F7', colorFamily: 'White / Silver' }
    ]
  },
  {
    id: 'motorola-g62-5g-xt2223-2022',
    brand: 'Motorola',
    model: 'Moto G62 5G (XT2223 / 2022)',
    releaseYear: 2022,
    msrp: 249,
    chipset: 'Snapdragon 480+ 5G',
    display: '6.5" FHD+ 120Hz Display',
    camera: '50MP Main + 8MP Ultra Wide + 2MP Macro',
    officialColors: [
      { name: 'Midnight Gray', hex: '#2F3136', colorFamily: 'Black / Dark', isHeroFinish: true },
      { name: 'Frosted Blue', hex: '#87CEEB', colorFamily: 'Blue' }
    ]
  },
  {
    id: 'motorola-g52-xt2221-2022',
    brand: 'Motorola',
    model: 'Moto G52 (XT2221 / 2022)',
    releaseYear: 2022,
    msrp: 219,
    chipset: 'Snapdragon 680 4G',
    display: '6.6" FHD+ 90Hz AMOLED',
    camera: '50MP Main + 8MP Ultra Wide + 2MP Macro',
    officialColors: [
      { name: 'Charcoal Grey', hex: '#333333', colorFamily: 'Black / Dark', isHeroFinish: true },
      { name: 'Porcelain White', hex: '#FDFDFD', colorFamily: 'White / Silver' }
    ]
  },
  {
    id: 'motorola-g-stylus-5g-xt2215-2022',
    brand: 'Motorola',
    model: 'Moto G Stylus 5G (XT2215 / 2022)',
    releaseYear: 2022,
    msrp: 499,
    chipset: 'Snapdragon 695 5G',
    display: '6.8" Max Vision FHD+ 120Hz',
    camera: '50MP OIS + 8MP Ultra Wide + Depth',
    officialColors: [
      { name: 'Steel Blue', hex: '#4682B4', colorFamily: 'Blue', isHeroFinish: true },
      { name: 'Seafoam Green', hex: '#93E9BE', colorFamily: 'Green' }
    ]
  },
  {
    id: 'motorola-g-5g-xt2213-2022',
    brand: 'Motorola',
    model: 'Moto G 5G (XT2213 / 2022)',
    releaseYear: 2022,
    msrp: 399,
    chipset: 'MediaTek Dimensity 700',
    display: '6.5" HD+ 90Hz Display',
    camera: '50MP Main + 2MP Macro + 2MP Depth',
    officialColors: [
      { name: 'Moonlight Grey', hex: '#708090', colorFamily: 'Titanium / Neutral', isHeroFinish: true }
    ]
  },
  {
    id: 'motorola-g-stylus-4g-xt2211-2022',
    brand: 'Motorola',
    model: 'Moto G Stylus 4G (XT2211 / 2022)',
    releaseYear: 2022,
    msrp: 299,
    chipset: 'MediaTek Helio G88',
    display: '6.8" FHD+ 90Hz Display with Stylus',
    camera: '50MP Main + 8MP Ultra Wide + 2MP Depth',
    officialColors: [
      { name: 'Twilight Blue', hex: '#1E3A5F', colorFamily: 'Blue', isHeroFinish: true },
      { name: 'Metallic Rose', hex: '#B76E79', colorFamily: 'Gold / Bronze' }
    ]
  },
  {
    id: 'motorola-g200-5g-xt2175-2022',
    brand: 'Motorola',
    model: 'Moto G200 5G (XT2175 / 2022)',
    releaseYear: 2022,
    msrp: 549,
    chipset: 'Snapdragon 888+ 5G',
    display: '6.8" FHD+ 144Hz Display',
    camera: '108MP Main + 8MP Ultra Wide + 2MP Depth',
    officialColors: [
      { name: 'Stellar Blue', hex: '#1B365D', colorFamily: 'Blue', isHeroFinish: true },
      { name: 'Glacier Green', hex: '#4E927F', colorFamily: 'Green' }
    ]
  },
  {
    id: 'motorola-g31-xt2173-2021',
    brand: 'Motorola',
    model: 'Moto G31 (XT2173 / 2021)',
    releaseYear: 2021,
    msrp: 199,
    chipset: 'MediaTek Helio G85',
    display: '6.4" FHD+ OLED Display',
    camera: '50MP Main + 8MP Ultra Wide + 2MP Macro',
    officialColors: [
      { name: 'Mineral Grey', hex: '#3C4043', colorFamily: 'Black / Dark', isHeroFinish: true },
      { name: 'Baby Blue', hex: '#89CFF0', colorFamily: 'Blue' }
    ]
  },
  {
    id: 'motorola-g51-5g-xt2171-2021',
    brand: 'Motorola',
    model: 'Moto G51 5G (XT2171 / 2021)',
    releaseYear: 2021,
    msrp: 229,
    chipset: 'Snapdragon 480+ 5G',
    display: '6.8" FHD+ 120Hz Display',
    camera: '50MP Main + 8MP Ultra Wide + 2MP Macro',
    officialColors: [
      { name: 'Bright Silver', hex: '#C0C0C0', colorFamily: 'White / Silver', isHeroFinish: true },
      { name: 'Aqua Blue', hex: '#00FFFF', colorFamily: 'Blue' }
    ]
  },
  {
    id: 'motorola-g71-5g-xt2169-2022',
    brand: 'Motorola',
    model: 'Moto G71 5G (XT2169 / 2022)',
    releaseYear: 2022,
    msrp: 299,
    chipset: 'Snapdragon 695 5G',
    display: '6.4" FHD+ OLED Display',
    camera: '50MP Main + 8MP Ultra Wide + 2MP Macro',
    officialColors: [
      { name: 'Neptune Green', hex: '#2E8B57', colorFamily: 'Green', isHeroFinish: true },
      { name: 'Arctic Blue', hex: '#A0C4DF', colorFamily: 'Blue' },
      { name: 'Iron Black', hex: '#1C1C1C', colorFamily: 'Black / Dark' }
    ]
  },
  {
    id: 'motorola-g-power-xt2165-2022',
    brand: 'Motorola',
    model: 'Moto G Power (XT2165 / 2022)',
    releaseYear: 2022,
    msrp: 199,
    chipset: 'MediaTek Helio G37',
    display: '6.5" HD+ 90Hz Display',
    camera: '50MP Main + 2MP Macro + 2MP Depth',
    officialColors: [
      { name: 'Dark Grove', hex: '#2B3E2C', colorFamily: 'Green', isHeroFinish: true },
      { name: 'Ice Blue', hex: '#ADD8E6', colorFamily: 'Blue' }
    ]
  },
  {
    id: 'motorola-g41-xt2167-2022',
    brand: 'Motorola',
    model: 'Moto G41 (XT2167 / 2022)',
    releaseYear: 2022,
    msrp: 249,
    chipset: 'MediaTek Helio G85',
    display: '6.4" FHD+ OLED Display',
    camera: '48MP OIS + 8MP Ultra Wide + 2MP Macro',
    officialColors: [
      { name: 'Meteorite Black', hex: '#181818', colorFamily: 'Black / Dark', isHeroFinish: true },
      { name: 'Pearl Gold', hex: '#E6CA65', colorFamily: 'Gold / Bronze' }
    ]
  },
  {
    id: 'motorola-g-pure-xt2163-2021',
    brand: 'Motorola',
    model: 'Moto G Pure (XT2163 / 2021)',
    releaseYear: 2021,
    msrp: 159,
    chipset: 'MediaTek Helio G25',
    display: '6.5" HD+ Display',
    camera: '13MP Main + 2MP Depth',
    officialColors: [
      { name: 'Deep Indigo', hex: '#282C35', colorFamily: 'Blue', isHeroFinish: true }
    ]
  },
  {
    id: 'motorola-g50-5g-xt2149-2021',
    brand: 'Motorola',
    model: 'Moto G50 5G (XT2149 / 2021)',
    releaseYear: 2021,
    msrp: 279,
    chipset: 'MediaTek Dimensity 700',
    display: '6.5" HD+ 90Hz Display',
    camera: '48MP Main + 2MP Macro + 2MP Depth',
    officialColors: [
      { name: 'Steel Grey', hex: '#4682B4', colorFamily: 'Titanium / Neutral', isHeroFinish: true },
      { name: 'Aqua Green', hex: '#00FFFF', colorFamily: 'Green' }
    ]
  },
  {
    id: 'motorola-g40-fusion-xt2147-2021',
    brand: 'Motorola',
    model: 'Moto G40 Fusion (XT2147 / 2021)',
    releaseYear: 2021,
    msrp: 229,
    chipset: 'Snapdragon 732G',
    display: '6.8" FHD+ 120Hz Display',
    camera: '64MP Main + 8MP Ultra Wide + 2MP Depth',
    officialColors: [
      { name: 'Dynamic Gray', hex: '#505050', colorFamily: 'Titanium / Neutral', isHeroFinish: true },
      { name: 'Frosted Champagne', hex: '#E6D7C3', colorFamily: 'Gold / Bronze' }
    ]
  },
  {
    id: 'motorola-g50-xt2137-2021',
    brand: 'Motorola',
    model: 'Moto G50 (XT2137 / 2021)',
    releaseYear: 2021,
    msrp: 249,
    chipset: 'Snapdragon 480 5G',
    display: '6.5" HD+ 90Hz Display',
    camera: '48MP Main + 5MP Macro + 2MP Depth',
    officialColors: [
      { name: 'Steel Grey', hex: '#4682B4', colorFamily: 'Titanium / Neutral', isHeroFinish: true },
      { name: 'Aqua Green', hex: '#00FFFF', colorFamily: 'Green' }
    ]
  },
  {
    id: 'motorola-g60-xt2135-2021',
    brand: 'Motorola',
    model: 'Moto G60 (XT2135 / 2021)',
    releaseYear: 2021,
    msrp: 279,
    chipset: 'Snapdragon 732G',
    display: '6.8" FHD+ 120Hz HDR10 Display',
    camera: '108MP Main + 8MP Ultra Wide + 2MP Depth',
    officialColors: [
      { name: 'Dynamic Gray', hex: '#505050', colorFamily: 'Titanium / Neutral', isHeroFinish: true },
      { name: 'Frosted Champagne', hex: '#E6D7C3', colorFamily: 'Gold / Bronze' }
    ]
  },
  {
    id: 'motorola-g60s-xt2133-2021',
    brand: 'Motorola',
    model: 'Moto G60S (XT2133 / 2021)',
    releaseYear: 2021,
    msrp: 299,
    chipset: 'MediaTek Helio G95',
    display: '6.8" FHD+ 120Hz Display (50W Charging)',
    camera: '64MP Main + 8MP Ultra Wide + 5MP Macro + 2MP Depth',
    officialColors: [
      { name: 'Iced Mint', hex: '#98FF98', colorFamily: 'Green', isHeroFinish: true },
      { name: 'Ink Blue', hex: '#000080', colorFamily: 'Blue' }
    ]
  },
  {
    id: 'motorola-g-stylus-5g-xt2131-2021',
    brand: 'Motorola',
    model: 'Moto G Stylus 5G (XT2131 / 2021)',
    releaseYear: 2021,
    msrp: 399,
    chipset: 'Snapdragon 480 5G',
    display: '6.8" FHD+ Max Vision Display',
    camera: '48MP Main + 8MP Ultra Wide + 5MP Macro + 2MP Depth',
    officialColors: [
      { name: 'Cosmic Emerald', hex: '#004B49', colorFamily: 'Green', isHeroFinish: true }
    ]
  },
  {
    id: 'motorola-g30-xt2129-2021',
    brand: 'Motorola',
    model: 'Moto G30 (XT2129 / 2021)',
    releaseYear: 2021,
    msrp: 199,
    chipset: 'Snapdragon 662',
    display: '6.5" HD+ 90Hz Display',
    camera: '64MP Main + 8MP Ultra Wide + 2MP Macro + 2MP Depth',
    officialColors: [
      { name: 'Phantom Black', hex: '#1C1C1E', colorFamily: 'Black / Dark', isHeroFinish: true },
      { name: 'Pastel Sky', hex: '#FFC0CB', colorFamily: 'Pink / Red' }
    ]
  },
  {
    id: 'motorola-g20-xt2128-2021',
    brand: 'Motorola',
    model: 'Moto G20 (XT2128 / 2021)',
    releaseYear: 2021,
    msrp: 169,
    chipset: 'UNISOC T700',
    display: '6.5" HD+ 90Hz Display',
    camera: '48MP Main + 8MP Ultra Wide + 2MP Macro + 2MP Depth',
    officialColors: [
      { name: 'Breeze Blue', hex: '#87CEEB', colorFamily: 'Blue', isHeroFinish: true },
      { name: 'Flamingo Pink', hex: '#FC8EAC', colorFamily: 'Pink / Red' }
    ]
  },
  {
    id: 'motorola-g10-power-xt2127-4-2021',
    brand: 'Motorola',
    model: 'Moto G10 Power (XT2127-4 / 2021)',
    releaseYear: 2021,
    msrp: 159,
    chipset: 'Snapdragon 460',
    display: '6.5" HD+ (6000mAh Battery)',
    camera: '48MP Main + 8MP Ultra Wide + 2MP Macro + 2MP Depth',
    officialColors: [
      { name: 'Breeze Blue', hex: '#87CEEB', colorFamily: 'Blue', isHeroFinish: true },
      { name: 'Aurora Grey', hex: '#708090', colorFamily: 'Titanium / Neutral' }
    ]
  },
  {
    id: 'motorola-g10-xt2127-2-2021',
    brand: 'Motorola',
    model: 'Moto G10 (XT2127-2 / 2021)',
    releaseYear: 2021,
    msrp: 149,
    chipset: 'Snapdragon 460',
    display: '6.5" HD+ Display',
    camera: '48MP Main + 8MP Ultra Wide + 2MP Macro + 2MP Depth',
    officialColors: [
      { name: 'Aurora Grey', hex: '#708090', colorFamily: 'Titanium / Neutral', isHeroFinish: true },
      { name: 'Iridescent Pearl', hex: '#F0E68C', colorFamily: 'White / Silver' }
    ]
  },
  {
    id: 'motorola-g100-xt2125-2021',
    brand: 'Motorola',
    model: 'Moto G100 (XT2125 / 2021)',
    releaseYear: 2021,
    msrp: 499,
    chipset: 'Snapdragon 870 5G',
    display: '6.7" FHD+ 90Hz HDR10 CinemaVision',
    camera: '64MP Main + 16MP Ultra Wide + 2MP Depth + TOF 3D',
    officialColors: [
      { name: 'Iridescent Ocean', hex: '#006699', colorFamily: 'Blue', isHeroFinish: true },
      { name: 'Iridescent Sky', hex: '#E0FFFF', colorFamily: 'White / Silver' },
      { name: 'Slate Grey', hex: '#708090', colorFamily: 'Titanium / Neutral' }
    ]
  },
  {
    id: 'motorola-g-power-xt2117-2021',
    brand: 'Motorola',
    model: 'Moto G Power (XT2117 / 2021)',
    releaseYear: 2021,
    msrp: 199,
    chipset: 'Snapdragon 662',
    display: '6.6" Max Vision HD+ Display',
    camera: '48MP Main + 2MP Macro + 2MP Depth',
    officialColors: [
      { name: 'Flash Gray', hex: '#505050', colorFamily: 'Titanium / Neutral', isHeroFinish: true },
      { name: 'Polar Silver', hex: '#E0E0E0', colorFamily: 'White / Silver' }
    ]
  },
  {
    id: 'motorola-g-stylus-6-8-xt2115-2021',
    brand: 'Motorola',
    model: 'Moto G Stylus 6.8" (XT2115 / 2021)',
    releaseYear: 2021,
    msrp: 299,
    chipset: 'Snapdragon 678',
    display: '6.8" FHD+ Max Vision with Stylus',
    camera: '48MP Main + 8MP Ultra Wide + 2MP Macro + Depth',
    officialColors: [
      { name: 'Aurora Black', hex: '#1C1C1E', colorFamily: 'Black / Dark', isHeroFinish: true },
      { name: 'White White', hex: '#FAFAFA', colorFamily: 'White / Silver' }
    ]
  },
  {
    id: 'motorola-g-5g-xt2113-2020',
    brand: 'Motorola',
    model: 'Moto G 5G (XT2113 / 2020)',
    releaseYear: 2020,
    msrp: 299,
    chipset: 'Snapdragon 750G 5G',
    display: '6.7" FHD+ LTPS IPS Display',
    camera: '48MP Main + 8MP Ultra Wide + 2MP Macro',
    officialColors: [
      { name: 'Volcanic Grey', hex: '#3C4043', colorFamily: 'Black / Dark', isHeroFinish: true },
      { name: 'Frosted Silver', hex: '#D3D3D3', colorFamily: 'White / Silver' }
    ]
  },
  {
    id: 'motorola-g-play-xt2093-2021',
    brand: 'Motorola',
    model: 'Moto G Play (XT2093 / 2021)',
    releaseYear: 2021,
    msrp: 169,
    chipset: 'Snapdragon 460',
    display: '6.5" HD+ Max Vision Display',
    camera: '13MP Main + 2MP Depth',
    officialColors: [
      { name: 'Mist Blue', hex: '#6495ED', colorFamily: 'Blue', isHeroFinish: true }
    ]
  },
  {
    id: 'motorola-g9-power-xt2091-2020',
    brand: 'Motorola',
    model: 'Moto G9 Power (XT2091 / 2020)',
    releaseYear: 2020,
    msrp: 229,
    chipset: 'Snapdragon 662',
    display: '6.8" HD+ (6000mAh Battery)',
    camera: '64MP Main + 2MP Macro + 2MP Depth',
    officialColors: [
      { name: 'Electric Violet', hex: '#8A2BE2', colorFamily: 'Purple / Violet', isHeroFinish: true },
      { name: 'Metallic Sage', hex: '#8FBC8F', colorFamily: 'Green' }
    ]
  },
  {
    id: 'motorola-g9-plus-xt2087-2020',
    brand: 'Motorola',
    model: 'Moto G9 Plus (XT2087 / 2020)',
    releaseYear: 2020,
    msrp: 269,
    chipset: 'Snapdragon 730G',
    display: '6.81" FHD+ Max Vision Display',
    camera: '64MP Main + 8MP Ultra Wide + 2MP Macro + 2MP Depth',
    officialColors: [
      { name: 'Navy Blue', hex: '#000080', colorFamily: 'Blue', isHeroFinish: true },
      { name: 'Blush Gold', hex: '#DEB887', colorFamily: 'Gold / Bronze' }
    ]
  },
  {
    id: 'motorola-g9-play-xt2083-2020',
    brand: 'Motorola',
    model: 'Moto G9 Play (XT2083 / 2020)',
    releaseYear: 2020,
    msrp: 189,
    chipset: 'Snapdragon 662',
    display: '6.5" HD+ Max Vision Display',
    camera: '48MP Main + 2MP Macro + 2MP Depth',
    officialColors: [
      { name: 'Sapphire Blue', hex: '#0F52BA', colorFamily: 'Blue', isHeroFinish: true },
      { name: 'Forest Green', hex: '#228B22', colorFamily: 'Green' },
      { name: 'Spring Pink', hex: '#FFB6C1', colorFamily: 'Pink / Red' }
    ]
  },
  {
    id: 'motorola-g9-xt2083-2020',
    brand: 'Motorola',
    model: 'Moto G9 (XT2083 / 2020)',
    releaseYear: 2020,
    msrp: 189,
    chipset: 'Snapdragon 662',
    display: '6.5" HD+ Max Vision Display',
    camera: '48MP Main + 2MP Macro + 2MP Depth',
    officialColors: [
      { name: 'Forest Green', hex: '#228B22', colorFamily: 'Green', isHeroFinish: true },
      { name: 'Sapphire Blue', hex: '#0F52BA', colorFamily: 'Blue' }
    ]
  },
  {
    id: 'motorola-g-5g-plus-xt2075-2020',
    brand: 'Motorola',
    model: 'Moto G 5G Plus (XT2075 / 2020)',
    releaseYear: 2020,
    msrp: 399,
    chipset: 'Snapdragon 765 5G',
    display: '6.7" FHD+ 90Hz CinemaVision',
    camera: '48MP Main + 8MP Ultra Wide + 5MP Macro + 2MP Depth',
    officialColors: [
      { name: 'Surfing Blue', hex: '#1E90FF', colorFamily: 'Blue', isHeroFinish: true },
      { name: 'Mystic Lilac', hex: '#C8A2C8', colorFamily: 'Purple / Violet' }
    ]
  },
  {
    id: 'motorola-g8-power-lite-xt2055-2020',
    brand: 'Motorola',
    model: 'Moto G8 Power Lite (XT2055 / 2020)',
    releaseYear: 2020,
    msrp: 149,
    chipset: 'MediaTek Helio P35',
    display: '6.5" HD+ Max Vision Display',
    camera: '16MP Main + 2MP Macro + 2MP Depth',
    officialColors: [
      { name: 'Royal Blue', hex: '#4169E1', colorFamily: 'Blue', isHeroFinish: true },
      { name: 'Arctic Blue', hex: '#A0C4DF', colorFamily: 'Blue' }
    ]
  },
  {
    id: 'motorola-g8-xt2045-1-2020',
    brand: 'Motorola',
    model: 'Moto G8 (XT2045-1 / 2020)',
    releaseYear: 2020,
    msrp: 199,
    chipset: 'Snapdragon 665',
    display: '6.4" HD+ Max Vision Display',
    camera: '16MP Main + 8MP Ultra Wide + 2MP Macro',
    officialColors: [
      { name: 'White Prism', hex: '#F0F8FF', colorFamily: 'White / Silver', isHeroFinish: true },
      { name: 'Neon Blue', hex: '#1E90FF', colorFamily: 'Blue' }
    ]
  },
  {
    id: 'motorola-g-fast-xt2045-3-2020',
    brand: 'Motorola',
    model: 'Moto G Fast (XT2045-3 / 2020)',
    releaseYear: 2020,
    msrp: 199,
    chipset: 'Snapdragon 665',
    display: '6.4" Max Vision HD+ Display',
    camera: '16MP Main + 8MP Ultra Wide + 2MP Macro',
    officialColors: [
      { name: 'Pearl White', hex: '#FDFDFD', colorFamily: 'White / Silver', isHeroFinish: true }
    ]
  },
  {
    id: 'motorola-g-stylus-6-4-xt2043-2020',
    brand: 'Motorola',
    model: 'Moto G Stylus 6.4" (XT2043 / 2020)',
    releaseYear: 2020,
    msrp: 299,
    chipset: 'Snapdragon 665',
    display: '6.4" FHD+ Max Vision Display with Stylus',
    camera: '48MP Main + 16MP Action Cam + 2MP Macro',
    officialColors: [
      { name: 'Mystic Black', hex: '#1C1C1E', colorFamily: 'Black / Dark', isHeroFinish: true }
    ]
  },
  {
    id: 'motorola-g-power-xt2041-4-2020',
    brand: 'Motorola',
    model: 'Moto G Power (XT2041-4 / 2020)',
    releaseYear: 2020,
    msrp: 249,
    chipset: 'Snapdragon 665',
    display: '6.4" FHD+ Max Vision Display',
    camera: '16MP Main + 8MP Ultra Wide + 2MP Macro',
    officialColors: [
      { name: 'Smoke Black', hex: '#2A2A2A', colorFamily: 'Black / Dark', isHeroFinish: true }
    ]
  },
  {
    id: 'motorola-g8-power-xt2041-1-2020',
    brand: 'Motorola',
    model: 'Moto G8 Power (XT2041-1 / 2020)',
    releaseYear: 2020,
    msrp: 249,
    chipset: 'Snapdragon 665',
    display: '6.4" FHD+ Max Vision Display',
    camera: '16MP Main + 8MP Ultra Wide + 8MP Telephoto + 2MP Macro',
    officialColors: [
      { name: 'Smoke Black', hex: '#2A2A2A', colorFamily: 'Black / Dark', isHeroFinish: true },
      { name: 'Capri Blue', hex: '#00BFFF', colorFamily: 'Blue' }
    ]
  },
  {
    id: 'motorola-g8-plus-xt2019-2019',
    brand: 'Motorola',
    model: 'Moto G8 Plus (XT2019 / 2019)',
    releaseYear: 2019,
    msrp: 269,
    chipset: 'Snapdragon 665',
    display: '6.3" FHD+ Max Vision Display',
    camera: '48MP Main + 16MP Action Cam + 5MP Depth',
    officialColors: [
      { name: 'Cosmic Blue', hex: '#1E3A5F', colorFamily: 'Blue', isHeroFinish: true },
      { name: 'Crystal Pink', hex: '#FFC0CB', colorFamily: 'Pink / Red' }
    ]
  },
  {
    id: 'motorola-g8-play-xt2015-2019',
    brand: 'Motorola',
    model: 'Moto G8 Play (XT2015 / 2019)',
    releaseYear: 2019,
    msrp: 179,
    chipset: 'MediaTek Helio P70',
    display: '6.2" HD+ Max Vision Display',
    camera: '13MP Main + 8MP Ultra Wide + 2MP Depth',
    officialColors: [
      { name: 'Black Onyx', hex: '#1C1C1E', colorFamily: 'Black / Dark', isHeroFinish: true },
      { name: 'Royal Magenta', hex: '#8B008B', colorFamily: 'Purple / Violet' }
    ]
  },
  {
    id: 'motorola-g7-plus-xt1965-2019',
    brand: 'Motorola',
    model: 'Moto G7 Plus (XT1965 / 2019)',
    releaseYear: 2019,
    msrp: 299,
    chipset: 'Snapdragon 636',
    display: '6.2" FHD+ Max Vision Display',
    camera: '16MP OIS + 5MP Depth',
    officialColors: [
      { name: 'Deep Indigo', hex: '#282C35', colorFamily: 'Blue', isHeroFinish: true },
      { name: 'Viva Red', hex: '#FF2400', colorFamily: 'Pink / Red' }
    ]
  },
  {
    id: 'motorola-g7-xt1962-2019',
    brand: 'Motorola',
    model: 'Moto G7 (XT1962 / 2019)',
    releaseYear: 2019,
    msrp: 299,
    chipset: 'Snapdragon 632',
    display: '6.2" FHD+ Max Vision Display',
    camera: '12MP Main + 5MP Depth',
    officialColors: [
      { name: 'Clear White', hex: '#FFFFFF', colorFamily: 'White / Silver', isHeroFinish: true },
      { name: 'Ceramic Black', hex: '#1C1C1C', colorFamily: 'Black / Dark' }
    ]
  },
  {
    id: 'motorola-g7-supra-xt1955-5-2019',
    brand: 'Motorola',
    model: 'Moto G7 Supra (XT1955-5 / 2019)',
    releaseYear: 2019,
    msrp: 249,
    chipset: 'Snapdragon 632',
    display: '6.2" HD+ Max Vision (5000mAh Battery)',
    camera: '12MP Main Camera',
    officialColors: [
      { name: 'Marine Blue', hex: '#000080', colorFamily: 'Blue', isHeroFinish: true }
    ]
  },
  {
    id: 'motorola-g7-power-xt1955-2019',
    brand: 'Motorola',
    model: 'Moto G7 Power (XT1955 / 2019)',
    releaseYear: 2019,
    msrp: 249,
    chipset: 'Snapdragon 632',
    display: '6.2" HD+ Max Vision (5000mAh Battery)',
    camera: '12MP Main Camera',
    officialColors: [
      { name: 'Marine Blue', hex: '#000080', colorFamily: 'Blue', isHeroFinish: true },
      { name: 'Iced Violet', hex: '#8A2BE2', colorFamily: 'Purple / Violet' }
    ]
  },
  {
    id: 'motorola-g7-play-xt1952-2019',
    brand: 'Motorola',
    model: 'Moto G7 Play (XT1952 / 2019)',
    releaseYear: 2019,
    msrp: 199,
    chipset: 'Snapdragon 632',
    display: '5.7" HD+ Max Vision Display',
    camera: '13MP Main Camera',
    officialColors: [
      { name: 'Starry Black', hex: '#1C1C1E', colorFamily: 'Black / Dark', isHeroFinish: true },
      { name: 'Fine Gold', hex: '#D4AF37', colorFamily: 'Gold / Bronze' }
    ]
  },
  {
    id: 'motorola-g6-plus-xt1926-2018',
    brand: 'Motorola',
    model: 'Moto G6 Plus (XT1926 / 2018)',
    releaseYear: 2018,
    msrp: 299,
    chipset: 'Snapdragon 630',
    display: '5.9" FHD+ Max Vision Display',
    camera: '12MP Dual Autofocus Pixel + 5MP Depth',
    officialColors: [
      { name: 'Deep Indigo', hex: '#282C35', colorFamily: 'Blue', isHeroFinish: true },
      { name: 'Nimbus', hex: '#808080', colorFamily: 'Titanium / Neutral' }
    ]
  },
  {
    id: 'motorola-g6-xt1925-2018',
    brand: 'Motorola',
    model: 'Moto G6 (XT1925 / 2018)',
    releaseYear: 2018,
    msrp: 249,
    chipset: 'Snapdragon 450',
    display: '5.7" FHD+ Max Vision Display',
    camera: '12MP Main + 5MP Depth',
    officialColors: [
      { name: 'Deep Indigo', hex: '#282C35', colorFamily: 'Blue', isHeroFinish: true },
      { name: 'Oyster Blush', hex: '#FFE4E1', colorFamily: 'Pink / Red' },
      { name: 'Fine Gold', hex: '#D4AF37', colorFamily: 'Gold / Bronze' }
    ]
  },
  {
    id: 'motorola-g6-play-xt1922-2018',
    brand: 'Motorola',
    model: 'Moto G6 Play (XT1922 / 2018)',
    releaseYear: 2018,
    msrp: 199,
    chipset: 'Snapdragon 427',
    display: '5.7" HD+ Max Vision Display',
    camera: '13MP Main Camera',
    officialColors: [
      { name: 'Deep Indigo', hex: '#282C35', colorFamily: 'Blue', isHeroFinish: true },
      { name: 'Fine Gold', hex: '#D4AF37', colorFamily: 'Gold / Bronze' }
    ]
  },
  {
    id: 'motorola-g5s-plus-xt1806-2017',
    brand: 'Motorola',
    model: 'Moto G5S Plus (XT1806 / 2017)',
    releaseYear: 2017,
    msrp: 279,
    chipset: 'Snapdragon 625',
    display: '5.5" FHD IPS LCD Display',
    camera: '13MP Dual Rear Cameras',
    officialColors: [
      { name: 'Lunar Gray', hex: '#505050', colorFamily: 'Titanium / Neutral', isHeroFinish: true },
      { name: 'Blush Gold', hex: '#DEB887', colorFamily: 'Gold / Bronze' }
    ]
  },
  {
    id: 'motorola-g5s-xt1793-2017',
    brand: 'Motorola',
    model: 'Moto G5S (XT1793 / 2017)',
    releaseYear: 2017,
    msrp: 229,
    chipset: 'Snapdragon 430',
    display: '5.2" FHD IPS LCD Display',
    camera: '16MP PDAF Main Camera',
    officialColors: [
      { name: 'Lunar Gray', hex: '#505050', colorFamily: 'Titanium / Neutral', isHeroFinish: true },
      { name: 'Fine Gold', hex: '#D4AF37', colorFamily: 'Gold / Bronze' }
    ]
  },
  {
    id: 'motorola-g5-plus-xt1687-2017',
    brand: 'Motorola',
    model: 'Moto G5 Plus (XT1687 / 2017)',
    releaseYear: 2017,
    msrp: 229,
    chipset: 'Snapdragon 625',
    display: '5.2" FHD IPS LCD Display',
    camera: '12MP Dual Autofocus Pixel',
    officialColors: [
      { name: 'Lunar Gray', hex: '#505050', colorFamily: 'Titanium / Neutral', isHeroFinish: true },
      { name: 'Fine Gold', hex: '#D4AF37', colorFamily: 'Gold / Bronze' }
    ]
  },
  {
    id: 'motorola-g5-xt1670-2017',
    brand: 'Motorola',
    model: 'Moto G5 (XT1670 / 2017)',
    releaseYear: 2017,
    msrp: 199,
    chipset: 'Snapdragon 430',
    display: '5.0" FHD IPS LCD Display',
    camera: '13MP Main Camera',
    officialColors: [
      { name: 'Lunar Gray', hex: '#505050', colorFamily: 'Titanium / Neutral', isHeroFinish: true },
      { name: 'Fine Gold', hex: '#D4AF37', colorFamily: 'Gold / Bronze' }
    ]
  },
  {
    id: 'motorola-g4-plus-xt1644-2016',
    brand: 'Motorola',
    model: 'Moto G4 Plus (XT1644 / 2016)',
    releaseYear: 2016,
    msrp: 249,
    chipset: 'Snapdragon 617',
    display: '5.5" FHD IPS LCD Display',
    camera: '16MP Laser Autofocus Camera',
    officialColors: [
      { name: 'Black', hex: '#1C1C1C', colorFamily: 'Black / Dark', isHeroFinish: true },
      { name: 'White', hex: '#FFFFFF', colorFamily: 'White / Silver' }
    ]
  },
  {
    id: 'motorola-g4-xt1625-2016',
    brand: 'Motorola',
    model: 'Moto G4 (XT1625 / 2016)',
    releaseYear: 2016,
    msrp: 199,
    chipset: 'Snapdragon 617',
    display: '5.5" FHD IPS LCD Display',
    camera: '13MP Main Camera',
    officialColors: [
      { name: 'Black', hex: '#1C1C1C', colorFamily: 'Black / Dark', isHeroFinish: true },
      { name: 'White', hex: '#FFFFFF', colorFamily: 'White / Silver' }
    ]
  },
  {
    id: 'motorola-g4-play-xt1607-2016',
    brand: 'Motorola',
    model: 'Moto G4 Play (XT1607 / 2016)',
    releaseYear: 2016,
    msrp: 149,
    chipset: 'Snapdragon 410',
    display: '5.0" HD IPS LCD Display',
    camera: '8MP Main Camera',
    officialColors: [
      { name: 'Black', hex: '#1C1C1C', colorFamily: 'Black / Dark', isHeroFinish: true },
      { name: 'White', hex: '#FFFFFF', colorFamily: 'White / Silver' }
    ]
  },
  {
    id: 'motorola-g3-xt1540-2015',
    brand: 'Motorola',
    model: 'Moto G3 (XT1540 / 2015)',
    releaseYear: 2015,
    msrp: 179,
    chipset: 'Snapdragon 410',
    display: '5.0" HD IPS LCD Display (IPX7 Waterproof)',
    camera: '13MP Dual-LED Flash',
    officialColors: [
      { name: 'Black', hex: '#1C1C1C', colorFamily: 'Black / Dark', isHeroFinish: true },
      { name: 'White', hex: '#FFFFFF', colorFamily: 'White / Silver' }
    ]
  },
  {
    id: 'motorola-g2-xt1068-2014',
    brand: 'Motorola',
    model: 'Moto G2 (XT1068 / 2014)',
    releaseYear: 2014,
    msrp: 179,
    chipset: 'Snapdragon 400',
    display: '5.0" HD IPS LCD Display (Stereo Speakers)',
    camera: '8MP Main Camera',
    officialColors: [
      { name: 'Black', hex: '#1C1C1C', colorFamily: 'Black / Dark', isHeroFinish: true },
      { name: 'White', hex: '#FFFFFF', colorFamily: 'White / Silver' }
    ]
  },
  {
    id: 'motorola-g-xt1032-2013',
    brand: 'Motorola',
    model: 'Moto G (XT1032 / 2013)',
    releaseYear: 2013,
    msrp: 179,
    chipset: 'Snapdragon 400',
    display: '4.5" HD IPS LCD Display (326 ppi)',
    camera: '5MP Main Camera',
    officialColors: [
      { name: 'Black', hex: '#1C1C1C', colorFamily: 'Black / Dark', isHeroFinish: true },
      { name: 'Chalk White', hex: '#FDFDFD', colorFamily: 'White / Silver' }
    ]
  }
];
