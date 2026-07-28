export interface PhoneColorVariant {
  name: string;
  hex: string;
  colorFamily: 'Titanium / Neutral' | 'Pink / Red' | 'Blue' | 'Green' | 'Black / Dark' | 'White / Silver' | 'Gold / Bronze' | 'Purple / Violet';
  isHeroFinish?: boolean;
}

export interface PhoneModelCatalogItem {
  id: string;
  brand: 'Apple' | 'Google' | 'Samsung' | 'Motorola';
  model: string;
  releaseYear: number;
  msrp: number;
  chipset: string;
  display: string;
  camera: string;
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
  'Purple / Violet'
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
      { name: 'Titanium Gold', hex: '#D4AF37', colorFamily: 'Gold / Bronze', isHeroFinish: true },
      { name: 'Dark Teal Titanium', hex: '#1F4E5B', colorFamily: 'Green' },
      { name: 'Natural Titanium', hex: '#B8B5B0', colorFamily: 'Titanium / Neutral' },
      { name: 'Space Black Titanium', hex: '#2B2B2D', colorFamily: 'Black / Dark' }
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
      { name: 'Titanium Gold', hex: '#D4AF37', colorFamily: 'Gold / Bronze', isHeroFinish: true },
      { name: 'Dark Teal Titanium', hex: '#1F4E5B', colorFamily: 'Green' },
      { name: 'Natural Titanium', hex: '#B8B5B0', colorFamily: 'Titanium / Neutral' },
      { name: 'Space Black Titanium', hex: '#2B2B2D', colorFamily: 'Black / Dark' }
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
    display: '6.9" Dynamic AMOLED 2X (120Hz)',
    camera: '200MP Main + 50MP Ultra Wide + 50MP 5x Telephoto + 10MP 3x Telephoto',
    officialColors: [
      { name: 'Titanium Black', hex: '#2B2B2C', colorFamily: 'Black / Dark', isHeroFinish: true },
      { name: 'Titanium Silver', hex: '#C2C4C8', colorFamily: 'White / Silver' },
      { name: 'Titanium Blue', hex: '#6C839B', colorFamily: 'Blue' },
      { name: 'Titanium Gray', hex: '#7C7C7E', colorFamily: 'Titanium / Neutral' }
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
      { name: 'Midnight Black', hex: '#222325', colorFamily: 'Black / Dark' },
      { name: 'Icy Blue', hex: '#B2C6DB', colorFamily: 'Blue', isHeroFinish: true },
      { name: 'Silver Shadow', hex: '#C0C3C8', colorFamily: 'White / Silver' },
      { name: 'Mint', hex: '#C3E4D6', colorFamily: 'Green' }
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
      { name: 'Icy Blue', hex: '#B2C6DB', colorFamily: 'Blue', isHeroFinish: true },
      { name: 'Mint Green', hex: '#C3E4D6', colorFamily: 'Green' },
      { name: 'Silver Shadow', hex: '#C0C3C8', colorFamily: 'White / Silver' },
      { name: 'Midnight Black', hex: '#222325', colorFamily: 'Black / Dark' }
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
  }
];
