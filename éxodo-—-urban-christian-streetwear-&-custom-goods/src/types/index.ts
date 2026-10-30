export type ProductCategory = 'franelas' | 'tote-bags' | 'laminas' | 'stickers';

export type ProductCollection = 
  | 'BeneCristiana' 
  | 'El Museo' 
  | 'El Ángel Caído' 
  | 'Anime' 
  | 'Música' 
  | 'Venezuela' 
  | 'Básicos con Propósito'
  | 'Personalizado en Laboratorio';

export type ProductSupportType = 'franela' | 'tote' | 'lamina' | 'stickers';

export interface ProductColor {
  name: string;
  hex: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: ProductCategory;
  collection: ProductCollection;
  basePrice: number;
  discountPrice?: number;
  oversizePriceDelta: number; // e.g., +4 USD for Oversize
  images: string[];
  scripture: string; // Biblical reference
  spiritualMeaning: string;
  materialSpecs: string;
  unifiedDescription: string;
  availableSizes: string[];
  availableColors: ProductColor[];
  stickerFinishes?: ('Vinilo' | 'Papel Fotográfico' | 'UV DTF')[];
  stickerQuantities?: number[];
  isMultiSupport?: boolean; // Can convert to tote, franela, lamina, or stickers
  supportPrices?: {
    franela: number;
    tote: number;
    lamina: number;
    stickers: number;
  };
  stock: number;
  isFeatured: boolean;
  badge?: string;
  createdAt: string;
}

export interface CartItem {
  cartId: string;
  productId: string;
  product: Product;
  quantity: number;
  selectedSupport?: ProductSupportType;
  selectedSize?: string;
  selectedColor?: ProductColor;
  fitType?: 'Corte Normal' | 'Oversize';
  selectedFinish?: 'Vinilo' | 'Papel Fotográfico' | 'UV DTF';
  unitPrice: number;
  customDesign?: {
    mockupUrl?: string;
    verseText?: string;
    customPrompt?: string;
    customArtworkUrl?: string;
    laminaMeasure?: string;
    laminaQuantity?: number;
    scale?: number;
    rotate?: number;
    posX?: number;
    posY?: number;
    printLocation?: 'delante' | 'detras' | 'ambos_lados';
    printDimensionsCm?: string;
    selectedMockupId?: string;
  };
}

export type ProductionStage = 
  | 'pedido_recibido' 
  | 'confeccion' 
  | 'estampado' 
  | 'listo_envio' 
  | 'entregado';

export interface KanbanColumn {
  id: ProductionStage | string;
  title: string;
  color: string;
  order: number;
  applicableProductTypes?: ProductCategory[];
}

export interface Order {
  orderCode: string; // e.g. "EXD-2412-CCS"
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
  shippingAgency: 'MRW' | 'Zoom' | 'Tealca' | 'Delivery Motorizado Caracas' | 'Retiro en Taller (Caracas)';
  items: CartItem[];
  totalUSD: number;
  totalVES: number;
  exchangeRateBCV: number;
  paymentStatus: 'Pendiente' | 'Verificado';
  productionStage: string; // matches KanbanColumn id ('pedido_recibido' | 'confeccion' | 'estampado' | 'listo_envio' | 'entregado')
  createdAt: string;
  notes?: string;
  pagoMovilRef?: string;
  paymentProofImage?: string;
  status?: 'activo' | 'cancelado' | 'entregado';
  deliveredAt?: string;
  cancelledAt?: string;
  cancelReason?: string;
  paymentMethod?: 'pago_movil' | 'binance' | 'efectivo' | 'transferencia' | 'otro';
  accountCredited?: 'banco_del_tesoro_ves' | 'binance_usdt' | 'efectivo_usd' | 'efectivo_ves';
  isHistorical?: boolean;
}

export interface TreasuryAccounts {
  efectivoUSD: number;
  efectivoVES: number;
  binanceUSDT: number;
  bancoDelTesoroVES: number;
  lastUpdated?: string;
}

export interface CashTransaction {
  id: string;
  account: 'binance_usdt' | 'banco_del_tesoro_ves' | 'efectivo_usd' | 'efectivo_ves';
  type: 'ingreso' | 'egreso' | 'compra_efectivo' | 'venta_efectivo' | 'cambio_divisa' | 'ajuste';
  amount: number; // in currency of account
  amountUSD?: number;
  concept: string;
  category: 'pedido' | 'retiro' | 'proveedor' | 'gasto_operativo' | 'abono_deuda' | 'ajuste_manual' | 'compra_venta_efectivo' | 'otro';
  date: string;
  relatedOrderCode?: string;
  registeredBy?: string;
  counterpartAccount?: 'binance_usdt' | 'banco_del_tesoro_ves' | 'efectivo_usd' | 'efectivo_ves';
  exchangeRateUsed?: number;
}

export interface DebtRecord {
  id: string;
  debtorName: string;
  debtorPhone: string;
  concept: string;
  totalUSD: number;
  totalVES: number;
  paidUSD: number;
  paidVES: number;
  remainingUSD: number;
  remainingVES: number;
  status: 'pendiente' | 'abonado' | 'cobrado';
  createdAt: string;
  dueDate?: string;
  notes?: string;
}

export interface DailyCashClose {
  id: string;
  date: string; // YYYY-MM-DD
  closedAt: string;
  totalUSD: number;
  totalVES: number;
  binanceUSD: number;
  tesoroVES: number;
  ordersCount: number;
  ordersDeliveredCount: number;
  ordersSummary: {
    orderCode: string;
    customerName: string;
    totalUSD: number;
    totalVES: number;
    paymentMethod: string;
    status: string;
  }[];
  expensesUSD?: number;
  expensesVES?: number;
  notes?: string;
  closedBy: string;
}

export interface CategoryCircle {
  id: string;
  title: string;
  image: string;
  type: 'category' | 'collection';
  value: string;
  linkText?: string;
}

export interface Devotional {
  id: string;
  title: string;
  scripture: string;
  excerpt: string;
  content: string;
  image: string;
  aspectRatio: '4:5' | '9:16';
  author: string;
  date: string;
  theme: string;
}

export interface CommunityPost {
  id: string;
  username: string;
  platform: 'instagram' | 'tiktok';
  image: string;
  caption: string;
  likes: number;
  tag: string;
  postUrl?: string;
}

export interface CustomerUser {
  phone: string; // Primary Username
  fullName: string;
  shippingAddress: string;
  password?: string;
  registeredAt: string;
}

export interface BrandLogoAssets {
  logoBlack?: string | null;       // Black version (for light backgrounds / invoices / white apparel)
  logoWhite?: string | null;       // White / Sand version (for dark streetwear UI / navbar / dark apparel)
  logoTransparent?: string | null; // Transparent PNG / SVG (versatile overlay / apparel mockup preview)
  appIcon?: string | null;         // App favicon / PWA icon / browser tab
  appIconSquare?: string | null;   // App icon 512x512 (splash / social preview)
}

export interface InstalledFont {
  id: string;
  name: string;
  fileName: string;
  format: 'truetype' | 'opentype' | 'woff' | 'woff2';
  url: string; // Base64 dataUrl or web font URL
  installedAt: string;
  sizeBytes?: number;
  isPreset?: boolean;
}

export interface BrandConfig {
  primaryColor: string; // #0D253A
  secondaryColor: string; // #000000
  accentColor: string; // #C8C3B3
  activeLogoVersion?: 'emblem' | 'wordmark' | 'sword' | 'badge' | 'custom_uploaded';
  activeLogoColorVariant?: 'white' | 'black' | 'transparent';
  logoAssets?: BrandLogoAssets;
  customFontName: string;
  customFontUrl: string | null;
  installedFonts?: InstalledFont[];
  activeHeadingFontId?: string; // Font used for Titulares / Banners (.font-brand-heading)
  activeBodyFontId?: string;    // Font used for Textos / Descripciones
  activeAccentFontId?: string;  // Font used for Badges / Versículos / Citas
  customIcons: Record<string, string>;
  homeSectionsOrder: string[];
}

export type ArtworkCollection = 
  | 'La calle es un museo' 
  | 'Venecristiana' 
  | 'El Ángel Caído' 
  | 'Básicos con Propósito' 
  | 'Anime Fe' 
  | 'Música & Selah';

export interface ArtworkDesign {
  id: string;
  title: string;
  collection: ArtworkCollection;
  highResGraphic: string; // High-res artwork URL or Base64 DataURL
  thumbnail?: string;
  scripture: string; // Biblical reference e.g., "2 Corintios 5:21"
  spiritualMeaning: string;
  technique: string; // e.g., "DTF Textil HD", "Sublimación", "UV DTF 3D"
  availableSupports: {
    franela: boolean;
    tote: boolean;
    lamina: boolean;
    stickers: boolean;
  };
  tags: string[]; // e.g., ['Franela', 'Tote Bag', 'Lámina', 'Sticker', 'DTF Textil', '240g']
  printDimensions?: string; // e.g., "40 x 50 cm (Espalda completa)"
  dpi?: number; // e.g., 300
  colorProfile?: string; // e.g., "CMYK FOGRA39", "sRGB"
  createdAt: string;
  associatedProductId?: string;
  notes?: string;
}

export interface PrayerRequest {
  id: string;
  name: string;
  phone: string;
  requestText: string;
  source: 'devocionales' | 'nosotros' | 'general';
  createdAt: string;
  status: 'nueva' | 'en_oracion' | 'respondida';
}

export interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  tagline: string;
  image: string;
  buttonText: string;
  buttonLink: string; // 'tienda' | 'personalizador' | 'descuentos' | etc.
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  active: boolean;
  order: number;
}

export interface LaminaSizeConfig {
  id: string;
  name: string;
  dimensions: string;
  priceUSD: number;
}

export interface PrintAreaSizeConfig {
  id: string;
  label: string;
  dimensionsCm: string;
  surchargeUSD: number;
  recommendedFor: string;
}

export interface CustomLabMockup {
  id: string;
  name: string;
  category: ProductCategory | 'franela' | 'tote' | 'lamina' | 'stickers';
  view: 'delante' | 'detras' | 'frontal';
  imageUrl: string;
  colorName?: string;
  colorHex?: string;
  isDefault?: boolean;
  widthCm?: number;
  heightCm?: number;
  createdAt?: string;
}

export interface LabPricingConfig {
  franelaBasePrice: number;
  oversizeExtraDelta: number;
  xlExtraDeltaPerX: number; // $1.00 per extra X (XL: +1, 2XL: +2, 3XL: +3, 4XL: +4)
  bothSidesDelta: number; // e.g. +$6.00 for Front + Back double printing
  printAreaSizes: PrintAreaSizeConfig[];
  toteBasePrice: number;
  laminaSizes: LaminaSizeConfig[];
  stickerPacks: {
    quantity: number;
    priceUSD: number;
  }[];
}

export interface AboutContent {
  tagline: string;
  title: string;
  manifestoQuote: string;
  historyTitle: string;
  historyParagraph1: string;
  historyParagraph2: string;
  visionTitle: string;
  visionParagraph: string;
  mainImage: string;
  stats: {
    value: string;
    label: string;
  }[];
  workshopLocation: string;
}

export interface SocialLinks {
  instagram: { url: string; active: boolean; username: string };
  tiktok: { url: string; active: boolean; username: string };
  whatsapp: { url: string; active: boolean; phone: string };
  youtube?: { url: string; active: boolean };
  facebook?: { url: string; active: boolean };
}

