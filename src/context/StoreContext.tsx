import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Product, 
  CartItem, 
  Order, 
  KanbanColumn, 
  CategoryCircle, 
  CustomerUser, 
  BrandConfig, 
  ProductCategory,
  ArtworkDesign,
  InstalledFont,
  HeroSlide,
  LabPricingConfig,
  AboutContent,
  SocialLinks,
  PrayerRequest,
  CommunityPost,
  TreasuryAccounts,
  CashTransaction,
  DebtRecord,
  DailyCashClose,
  CustomLabMockup
} from '../types';
import { 
  INITIAL_PRODUCTS, 
  INITIAL_KANBAN_COLUMNS, 
  INITIAL_ORDERS, 
  INITIAL_CATEGORY_CIRCLES, 
  INITIAL_COLLECTION_CIRCLES, 
  INITIAL_BRAND_CONFIG,
  INITIAL_ARTWORK_DESIGNS,
  INITIAL_INSTALLED_FONTS,
  INITIAL_HERO_SLIDES,
  INITIAL_LAB_PRICING_CONFIG,
  INITIAL_ABOUT_CONTENT,
  INITIAL_SOCIAL_LINKS,
  INITIAL_PRAYER_REQUESTS,
  INITIAL_COLLECTIONS,
  INITIAL_COMMUNITY_POSTS,
  INITIAL_TREASURY_ACCOUNTS,
  INITIAL_TRANSACTIONS,
  INITIAL_DEBTS,
  INITIAL_CASH_CLOSES,
  INITIAL_CUSTOM_LAB_MOCKUPS
} from '../data/initialData';
import { sendOrderEmailNotification, sendPrayerEmailNotification } from '../services/emailService';
import { triggerOrderNotificationFlow, sendNativeNotification, playNotificationChime } from '../utils/notificationUtils';
import { 
  saveCashBalancesToFirestore, 
  saveCashTransactionToFirestore, 
  subscribeToFirestoreCashBalances 
} from '../services/firestoreCashService';
import confetti from 'canvas-confetti';

interface StoreContextType {
  // Navigation & View
  currentPage: string;
  setCurrentPage: (page: string) => void;
  selectedCategory: ProductCategory | 'todas';
  setSelectedCategory: (cat: ProductCategory | 'todas') => void;
  selectedCollection: string | null;
  setSelectedCollection: (col: string | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  
  // PDP Modal
  activePdpProduct: Product | null;
  setActivePdpProduct: (prod: Product | null) => void;

  // Cart
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (cartId: string) => void;
  updateCartQuantity: (cartId: string, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  cartTotalUSD: number;
  cartTotalVES: number;
  exchangeRateBCV: number;

  // Products
  products: Product[];
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;

  // Orders & Kanban OMS
  orders: Order[];
  kanbanColumns: KanbanColumn[];
  createOrder: (order: Order) => void;
  updateOrderStatus: (orderCode: string, newStage: string) => void;
  updateOrderPaymentStatus: (orderCode: string, paymentStatus: 'Pendiente' | 'Verificado') => void;
  addKanbanColumn: (column: KanbanColumn) => void;
  updateKanbanColumn: (column: KanbanColumn) => void;
  deleteKanbanColumn: (id: string) => void;
  findOrderByCode: (code: string) => Order | undefined;

  // Circles
  categoryCircles: CategoryCircle[];
  collectionCircles: CategoryCircle[];
  addCategoryCircle: (circle: CategoryCircle) => void;
  updateCategoryCircle: (circle: CategoryCircle) => void;
  deleteCategoryCircle: (id: string) => void;

  // User Auth
  currentUser: CustomerUser | null;
  registerUser: (user: CustomerUser) => void;
  loginUser: (phone: string, password?: string) => boolean;
  logoutUser: () => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;

  // Tracking Modal
  isTrackingModalOpen: boolean;
  setIsTrackingModalOpen: (open: boolean) => void;
  trackingOrderCode: string;
  setTrackingOrderCode: (code: string) => void;

  // Admin Security
  isAdminAuthenticated: boolean;
  adminLogin: (key: string) => boolean;
  adminLogout: () => void;
  isAdminLoginModalOpen: boolean;
  setIsAdminLoginModalOpen: (open: boolean) => void;

  // Brand Customizer & Multi-Fonts
  brandConfig: BrandConfig;
  updateBrandConfig: (config: Partial<BrandConfig>) => void;
  uploadCustomFont: (file: File) => Promise<string>;
  installCustomFont: (file: File) => Promise<InstalledFont>;
  removeInstalledFont: (fontId: string) => void;
  setActiveFontRole: (fontId: string, role: 'heading' | 'body' | 'accent') => void;
  resetFontsToPresets: () => void;
  resetBrandDefaults: () => void;

  // Colección Asset Library
  artworkDesigns: ArtworkDesign[];
  addArtworkDesign: (design: ArtworkDesign) => void;
  updateArtworkDesign: (id: string, updates: Partial<ArtworkDesign>) => void;
  deleteArtworkDesign: (id: string) => void;
  toggleArtworkSupport: (id: string, support: 'franela' | 'tote' | 'lamina' | 'stickers') => void;

  // Home Banners & Hero Carousel
  heroSlides: HeroSlide[];
  updateHeroSlides: (slides: HeroSlide[]) => void;

  // Collections Dynamic Management
  collections: string[];
  addCollection: (name: string) => void;
  updateCollection: (oldName: string, newName: string) => void;
  deleteCollection: (name: string) => void;

  // Featured & Discounts Management
  setProductFeatured: (productId: string, isFeatured: boolean) => void;
  setProductDiscount: (productId: string, discountPrice?: number) => void;

  // Instagram Community Posts
  communityPosts: CommunityPost[];
  updateCommunityPosts: (posts: CommunityPost[]) => void;

  // Social Links (Footer)
  socialLinks: SocialLinks;
  updateSocialLinks: (links: Partial<SocialLinks>) => void;

  // About Page Content
  aboutContent: AboutContent;
  updateAboutContent: (content: Partial<AboutContent>) => void;

  // Lab & Láminas Pricing Configuration
  labPricingConfig: LabPricingConfig;
  updateLabPricingConfig: (pricing: Partial<LabPricingConfig>) => void;

  // Custom Lab Mockups (Subida y Gestión de Mockups tipo Imagen)
  customLabMockups: CustomLabMockup[];
  addCustomLabMockup: (mockup: CustomLabMockup) => void;
  deleteCustomLabMockup: (id: string) => void;
  updateCustomLabMockup: (id: string, updates: Partial<CustomLabMockup>) => void;

  // Prayer Requests
  prayerRequests: PrayerRequest[];
  addPrayerRequest: (req: Omit<PrayerRequest, 'id' | 'createdAt' | 'status'>) => Promise<void>;
  updatePrayerRequestStatus: (id: string, status: 'nueva' | 'en_oracion' | 'respondida') => void;
  deletePrayerRequest: (id: string) => void;

  // Google Sheets integration state
  googleSheetsUrl: string | null;
  setGoogleSheetsUrl: (url: string | null) => void;
  lastSyncedTimestamp: string | null;
  setLastSyncedTimestamp: (time: string | null) => void;

  // Order Management (Cancel, Delivery, Edit, Manual/Historic)
  markOrderDelivered: (orderCode: string) => void;
  cancelOrder: (orderCode: string, reason?: string) => void;
  updateOrder: (orderCode: string, updates: Partial<Order>) => void;
  addManualOrder: (order: Order, creditAccount?: boolean) => void;

  // Treasury & Cash Flow (Caja Efectivo USD/VES, Binance USDT, Banco del Tesoro)
  treasuryAccounts: TreasuryAccounts;
  updateTreasuryBalance: (account: 'binance_usdt' | 'banco_del_tesoro_ves' | 'efectivo_usd' | 'efectivo_ves', newBalance: number, note?: string) => void;
  recordCashOperation: (params: {
    account: 'binance_usdt' | 'banco_del_tesoro_ves' | 'efectivo_usd' | 'efectivo_ves';
    type: 'ingreso' | 'egreso' | 'compra_efectivo' | 'venta_efectivo' | 'cambio_divisa' | 'ajuste';
    amount: number;
    concept: string;
    category?: any;
    counterpartAccount?: 'binance_usdt' | 'banco_del_tesoro_ves' | 'efectivo_usd' | 'efectivo_ves';
    exchangeRateUsed?: number;
  }) => void;
  isFirestoreSynced: boolean;
  transactions: CashTransaction[];
  addTransaction: (tx: Omit<CashTransaction, 'id' | 'date'>) => void;
  deleteTransaction: (id: string) => void;
  debts: DebtRecord[];
  addDebt: (debt: Omit<DebtRecord, 'id' | 'createdAt' | 'paidUSD' | 'paidVES' | 'remainingUSD' | 'remainingVES' | 'status'>) => void;
  updateDebt: (id: string, updates: Partial<DebtRecord>) => void;
  deleteDebt: (id: string) => void;
  recordDebtPayment: (id: string, amountUSD: number, amountVES: number, targetAccount: 'binance_usdt' | 'banco_del_tesoro_ves' | 'efectivo_usd' | 'efectivo_ves') => void;
  cashCloses: DailyCashClose[];
  closeDailyCash: (date: string, notes?: string, closedBy?: string) => DailyCashClose;

  // Push Notifications (Admin alerts & Client tracking)
  adminNotifications: { id: string; title: string; message: string; date: string; read: boolean; type: 'order' | 'prayer' | 'delivery'; orderCode?: string }[];
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  sendPushNotification: (title: string, body: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation
  const [currentPage, setCurrentPage] = useState<string>('inicio');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'todas'>('todas');
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activePdpProduct, setActivePdpProduct] = useState<Product | null>(null);

  // Cart
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('exodo_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const exchangeRateBCV = 46.0; // Current reference rate

  // Products
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('exodo_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  // Orders
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('exodo_orders');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  // Kanban Columns
  const [kanbanColumns, setKanbanColumns] = useState<KanbanColumn[]>(() => {
    const saved = localStorage.getItem('exodo_kanban_columns');
    return saved ? JSON.parse(saved) : INITIAL_KANBAN_COLUMNS;
  });

  // Category & Collection Circles
  const [categoryCircles, setCategoryCircles] = useState<CategoryCircle[]>(() => {
    const saved = localStorage.getItem('exodo_category_circles');
    return saved ? JSON.parse(saved) : INITIAL_CATEGORY_CIRCLES;
  });

  const [collectionCircles, setCollectionCircles] = useState<CategoryCircle[]>(() => {
    const saved = localStorage.getItem('exodo_collection_circles');
    return saved ? JSON.parse(saved) : INITIAL_COLLECTION_CIRCLES;
  });

  // User
  const [currentUser, setCurrentUser] = useState<CustomerUser | null>(() => {
    const saved = localStorage.getItem('exodo_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Tracking
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
  const [trackingOrderCode, setTrackingOrderCode] = useState('');

  // Admin
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('exodo_admin_auth') === 'true';
  });
  const [isAdminLoginModalOpen, setIsAdminLoginModalOpen] = useState(false);

  // Brand config
  const [brandConfig, setBrandConfig] = useState<BrandConfig>(() => {
    const saved = localStorage.getItem('exodo_brand_config');
    if (!saved) return INITIAL_BRAND_CONFIG;
    try {
      const parsed = JSON.parse(saved);
      if (!parsed.installedFonts || parsed.installedFonts.length === 0) {
        parsed.installedFonts = INITIAL_INSTALLED_FONTS;
        parsed.activeHeadingFontId = parsed.activeHeadingFontId || 'font-bebas-neue';
        parsed.activeBodyFontId = parsed.activeBodyFontId || 'font-montserrat';
        parsed.activeAccentFontId = parsed.activeAccentFontId || 'font-cinzel';
      }
      if (parsed.logoAssets) {
        const isLegacy = (val: any) => typeof val === 'string' && val.includes('viewBox="0 0 1000');
        if (Object.values(parsed.logoAssets).some(isLegacy)) {
          parsed.logoAssets = {
            logoBlack: isLegacy(parsed.logoAssets.logoBlack) ? null : parsed.logoAssets.logoBlack,
            logoWhite: isLegacy(parsed.logoAssets.logoWhite) ? null : parsed.logoAssets.logoWhite,
            logoTransparent: isLegacy(parsed.logoAssets.logoTransparent) ? null : parsed.logoAssets.logoTransparent,
            appIcon: isLegacy(parsed.logoAssets.appIcon) ? null : parsed.logoAssets.appIcon,
            appIconSquare: isLegacy(parsed.logoAssets.appIconSquare) ? null : parsed.logoAssets.appIconSquare,
          };
          if (parsed.activeLogoVersion === 'custom_uploaded') {
            parsed.activeLogoVersion = 'emblem';
          }
          localStorage.setItem('exodo_brand_config', JSON.stringify(parsed));
        }
      }
      return parsed;
    } catch {
      return INITIAL_BRAND_CONFIG;
    }
  });

  // Colección Asset Library (Artwork Designs)
  const [artworkDesigns, setArtworkDesigns] = useState<ArtworkDesign[]>(() => {
    const saved = localStorage.getItem('exodo_artwork_library');
    return saved ? JSON.parse(saved) : INITIAL_ARTWORK_DESIGNS;
  });

  // Hero Carousel Slides
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>(() => {
    const saved = localStorage.getItem('exodo_hero_slides');
    return saved ? JSON.parse(saved) : INITIAL_HERO_SLIDES;
  });

  // Dynamic Collections
  const [collections, setCollections] = useState<string[]>(() => {
    const saved = localStorage.getItem('exodo_collections');
    return saved ? JSON.parse(saved) : INITIAL_COLLECTIONS;
  });

  // Lab & Láminas Pricing Configuration
  const [labPricingConfig, setLabPricingConfig] = useState<LabPricingConfig>(() => {
    const saved = localStorage.getItem('exodo_lab_pricing');
    return saved ? JSON.parse(saved) : INITIAL_LAB_PRICING_CONFIG;
  });

  // About Content
  const [aboutContent, setAboutContent] = useState<AboutContent>(() => {
    const saved = localStorage.getItem('exodo_about_content');
    return saved ? JSON.parse(saved) : INITIAL_ABOUT_CONTENT;
  });

  // Social Links
  const [socialLinks, setSocialLinks] = useState<SocialLinks>(() => {
    const saved = localStorage.getItem('exodo_social_links');
    return saved ? JSON.parse(saved) : INITIAL_SOCIAL_LINKS;
  });

  // Prayer Requests
  const [prayerRequests, setPrayerRequests] = useState<PrayerRequest[]>(() => {
    const saved = localStorage.getItem('exodo_prayer_requests');
    return saved ? JSON.parse(saved) : INITIAL_PRAYER_REQUESTS;
  });

  // Community Posts
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>(() => {
    const saved = localStorage.getItem('exodo_community_posts');
    return saved ? JSON.parse(saved) : INITIAL_COMMUNITY_POSTS;
  });

  // Custom Lab Mockups State (Mockups subidos por el Administrador)
  const [customLabMockups, setCustomLabMockups] = useState<CustomLabMockup[]>(() => {
    const saved = localStorage.getItem('exodo_custom_lab_mockups');
    return saved ? JSON.parse(saved) : INITIAL_CUSTOM_LAB_MOCKUPS;
  });

  useEffect(() => {
    localStorage.setItem('exodo_custom_lab_mockups', JSON.stringify(customLabMockups));
  }, [customLabMockups]);

  const addCustomLabMockup = (mockup: CustomLabMockup) => {
    setCustomLabMockups((prev) => [mockup, ...prev]);
  };

  const deleteCustomLabMockup = (id: string) => {
    setCustomLabMockups((prev) => prev.filter((m) => m.id !== id));
  };

  const updateCustomLabMockup = (id: string, updates: Partial<CustomLabMockup>) => {
    setCustomLabMockups((prev) => prev.map((m) => (m.id === id ? { ...m, ...updates } : m)));
  };

  // Treasury Accounts (Caja Efectivo USD, Caja Efectivo VES, Binance USDT, Banco del Tesoro)
  const [treasuryAccounts, setTreasuryAccounts] = useState<TreasuryAccounts>(() => {
    const saved = localStorage.getItem('exodo_treasury_accounts');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          efectivoUSD: parsed.efectivoUSD !== undefined ? Number(parsed.efectivoUSD) : 340.0,
          efectivoVES: parsed.efectivoVES !== undefined ? Number(parsed.efectivoVES) : 4800.0,
          binanceUSDT: parsed.binanceUSDT !== undefined ? Number(parsed.binanceUSDT) : 485.5,
          bancoDelTesoroVES: parsed.bancoDelTesoroVES !== undefined ? Number(parsed.bancoDelTesoroVES) : 18450.0,
          lastUpdated: parsed.lastUpdated || new Date().toISOString(),
        };
      } catch {}
    }
    return INITIAL_TREASURY_ACCOUNTS;
  });

  const [isFirestoreSynced, setIsFirestoreSynced] = useState<boolean>(false);

  // Real-time Firestore sync listener for multi-device admin support
  useEffect(() => {
    const unsubscribe = subscribeToFirestoreCashBalances(
      (firestoreData) => {
        setTreasuryAccounts((prev) => ({
          ...prev,
          efectivoUSD: firestoreData.efectivoUSD ?? prev.efectivoUSD,
          efectivoVES: firestoreData.efectivoVES ?? prev.efectivoVES,
          binanceUSDT: firestoreData.binanceUSDT ?? prev.binanceUSDT,
          bancoDelTesoroVES: firestoreData.bancoDelTesoroVES ?? prev.bancoDelTesoroVES,
          lastUpdated: firestoreData.lastUpdated,
        }));
        setIsFirestoreSynced(true);
      },
      () => {
        setIsFirestoreSynced(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // Cash Transactions (Ingresos, Egresos, Retiros)
  const [transactions, setTransactions] = useState<CashTransaction[]>(() => {
    const saved = localStorage.getItem('exodo_cash_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  // Debts / Cuentas por Cobrar ("Quién me debe")
  const [debts, setDebts] = useState<DebtRecord[]>(() => {
    const saved = localStorage.getItem('exodo_debts');
    return saved ? JSON.parse(saved) : INITIAL_DEBTS;
  });

  // Daily Cash Closes (Historial de cierres de caja)
  const [cashCloses, setCashCloses] = useState<DailyCashClose[]>(() => {
    const saved = localStorage.getItem('exodo_cash_closes');
    return saved ? JSON.parse(saved) : INITIAL_CASH_CLOSES;
  });

  // Admin Push Notifications Alert Queue
  const [adminNotifications, setAdminNotifications] = useState<{
    id: string;
    title: string;
    message: string;
    date: string;
    read: boolean;
    type: 'order' | 'prayer' | 'delivery';
  }[]>(() => {
    const saved = localStorage.getItem('exodo_admin_notifications');
    return saved ? JSON.parse(saved) : [
      {
        id: 'notif-welcome',
        title: 'Sistema ÉXODO OMS Listo',
        message: 'Panel de administración sincronizado con Binance Pay y Banco del Tesoro.',
        date: new Date().toISOString(),
        read: false,
        type: 'order'
      }
    ];
  });

  // Google Sheets state
  const [googleSheetsUrl, setGoogleSheetsUrl] = useState<string | null>(() => {
    return localStorage.getItem('exodo_sheets_url');
  });
  const [lastSyncedTimestamp, setLastSyncedTimestamp] = useState<string | null>(() => {
    return localStorage.getItem('exodo_sheets_last_sync');
  });

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('exodo_treasury_accounts', JSON.stringify(treasuryAccounts));
  }, [treasuryAccounts]);

  useEffect(() => {
    localStorage.setItem('exodo_cash_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('exodo_debts', JSON.stringify(debts));
  }, [debts]);

  useEffect(() => {
    localStorage.setItem('exodo_cash_closes', JSON.stringify(cashCloses));
  }, [cashCloses]);

  useEffect(() => {
    localStorage.setItem('exodo_admin_notifications', JSON.stringify(adminNotifications));
  }, [adminNotifications]);
  useEffect(() => {
    localStorage.setItem('exodo_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('exodo_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('exodo_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('exodo_kanban_columns', JSON.stringify(kanbanColumns));
  }, [kanbanColumns]);

  useEffect(() => {
    localStorage.setItem('exodo_category_circles', JSON.stringify(categoryCircles));
  }, [categoryCircles]);

  useEffect(() => {
    localStorage.setItem('exodo_collection_circles', JSON.stringify(collectionCircles));
  }, [collectionCircles]);

  useEffect(() => {
    localStorage.setItem('exodo_hero_slides', JSON.stringify(heroSlides));
  }, [heroSlides]);

  useEffect(() => {
    localStorage.setItem('exodo_collections', JSON.stringify(collections));
  }, [collections]);

  useEffect(() => {
    localStorage.setItem('exodo_lab_pricing', JSON.stringify(labPricingConfig));
  }, [labPricingConfig]);

  useEffect(() => {
    localStorage.setItem('exodo_about_content', JSON.stringify(aboutContent));
  }, [aboutContent]);

  useEffect(() => {
    localStorage.setItem('exodo_social_links', JSON.stringify(socialLinks));
  }, [socialLinks]);

  useEffect(() => {
    localStorage.setItem('exodo_prayer_requests', JSON.stringify(prayerRequests));
  }, [prayerRequests]);

  useEffect(() => {
    localStorage.setItem('exodo_community_posts', JSON.stringify(communityPosts));
  }, [communityPosts]);

  useEffect(() => {
    localStorage.setItem('exodo_brand_config', JSON.stringify(brandConfig));
    // Apply dynamic CSS variables for theme colors
    document.documentElement.style.setProperty('--primary-color', brandConfig.primaryColor);
    document.documentElement.style.setProperty('--secondary-color', brandConfig.secondaryColor);
    document.documentElement.style.setProperty('--accent-color', brandConfig.accentColor);
  }, [brandConfig]);

  useEffect(() => {
    localStorage.setItem('exodo_artwork_library', JSON.stringify(artworkDesigns));
  }, [artworkDesigns]);

  // Apply multiple installed fonts dynamically into the document
  useEffect(() => {
    const styleId = 'exodo-multi-font-style';
    let styleTag = document.getElementById(styleId) as HTMLStyleElement;
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = styleId;
      document.head.appendChild(styleTag);
    }

    const fonts = brandConfig.installedFonts && brandConfig.installedFonts.length > 0 
      ? brandConfig.installedFonts 
      : INITIAL_INSTALLED_FONTS;

    // 1. Generate @font-face rules for all installed fonts
    let cssRules = '';
    fonts.forEach((font) => {
      const sanitizedFamily = `ExodoFont_${font.id.replace(/[^a-zA-Z0-9]/g, '_')}`;
      cssRules += `
        @font-face {
          font-family: '${sanitizedFamily}';
          src: url('${font.url}') format('${font.format || 'truetype'}');
          font-display: swap;
        }
      `;
    });

    // 2. Identify active fonts
    const activeHeadingFont = fonts.find((f) => f.id === brandConfig.activeHeadingFontId) || fonts[0];
    const activeBodyFont = fonts.find((f) => f.id === brandConfig.activeBodyFontId) || fonts[4] || fonts[0];
    const activeAccentFont = fonts.find((f) => f.id === brandConfig.activeAccentFontId) || fonts[2] || fonts[0];

    const headingFamily = activeHeadingFont ? `'ExodoFont_${activeHeadingFont.id.replace(/[^a-zA-Z0-9]/g, '_')}'` : `'Bebas Neue'`;
    const bodyFamily = activeBodyFont ? `'ExodoFont_${activeBodyFont.id.replace(/[^a-zA-Z0-9]/g, '_')}'` : `'Montserrat'`;
    const accentFamily = activeAccentFont ? `'ExodoFont_${activeAccentFont.id.replace(/[^a-zA-Z0-9]/g, '_')}'` : `'Cinzel'`;

    cssRules += `
      :root {
        --brand-font-heading: ${headingFamily}, 'Bebas Neue', 'Anton', sans-serif;
        --brand-font-body: ${bodyFamily}, system-ui, -apple-system, sans-serif;
        --brand-font-accent: ${accentFamily}, serif;
      }
      .font-brand-heading {
        font-family: var(--brand-font-heading) !important;
      }
      .font-brand-body {
        font-family: var(--brand-font-body) !important;
      }
      .font-brand-accent {
        font-family: var(--brand-font-accent) !important;
      }
    `;

    styleTag.innerHTML = cssRules;
  }, [
    brandConfig.installedFonts,
    brandConfig.activeHeadingFontId,
    brandConfig.activeBodyFontId,
    brandConfig.activeAccentFontId,
    brandConfig.customFontUrl
  ]);

  // Cart operations
  const addToCart = (item: CartItem) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (i) =>
          i.productId === item.productId &&
          i.selectedSize === item.selectedSize &&
          i.fitType === item.fitType &&
          i.selectedColor?.name === item.selectedColor?.name &&
          i.selectedFinish === item.selectedFinish &&
          !i.customDesign
      );

      if (existingIndex > -1 && !item.customDesign) {
        const next = [...prev];
        next[existingIndex].quantity += item.quantity;
        return next;
      }
      return [...prev, item];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (cartId: string) => {
    setCart((prev) => prev.filter((i) => i.cartId !== cartId));
  };

  const updateCartQuantity = (cartId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartId);
      return;
    }
    setCart((prev) =>
      prev.map((i) => (i.cartId === cartId ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => setCart([]);

  const cartTotalUSD = cart.reduce((acc, it) => acc + it.unitPrice * it.quantity, 0);
  const cartTotalVES = cartTotalUSD * exchangeRateBCV;

  // Product operations
  const addProduct = (product: Product) => {
    setProducts((prev) => [product, ...prev]);
  };

  const updateProduct = (product: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === product.id ? product : p)));
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  // Push Notification dispatcher
  const sendPushNotification = (title: string, body: string) => {
    try {
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'granted') {
          new Notification(title, { body, icon: '/favicon.ico' });
        } else if (Notification.permission !== 'denied') {
          Notification.requestPermission().then((perm) => {
            if (perm === 'granted') {
              new Notification(title, { body, icon: '/favicon.ico' });
            }
          });
        }
      }
    } catch (e) {
      console.warn('Push notification warning:', e);
    }
  };

  const addAdminNotification = (notif: { title: string; message: string; type: 'order' | 'prayer' | 'delivery' }) => {
    const newEntry = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title: notif.title,
      message: notif.message,
      date: new Date().toISOString(),
      read: false,
      type: notif.type,
    };
    setAdminNotifications((prev) => [newEntry, ...prev.slice(0, 49)]);
    sendPushNotification(notif.title, notif.message);
  };

  const markNotificationRead = (id: string) => {
    setAdminNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const clearNotifications = () => {
    setAdminNotifications([]);
  };

  // Order operations
  const createOrder = (order: Order) => {
    const enrichedOrder: Order = {
      ...order,
      status: order.status || 'activo',
      paymentMethod: order.paymentMethod || (order.pagoMovilRef ? 'pago_movil' : 'efectivo'),
    };
    setOrders((prev) => [enrichedOrder, ...prev]);

    // Save to user if logged in
    if (currentUser) {
      const updatedUser = {
        ...currentUser,
        orders: [...(currentUser as any).orders || [], order.orderCode],
      };
      setCurrentUser(updatedUser);
      localStorage.setItem('exodo_user', JSON.stringify(updatedUser));
    }

    // Trigger Admin Push Notification alert
    addAdminNotification({
      title: `🔥 ¡Nuevo Pedido Recibido! #${order.orderCode}`,
      message: `Cliente: ${order.customerName} (${order.customerPhone}) • Total: $${order.totalUSD.toFixed(2)} USD (Bs. ${order.totalVES.toFixed(2)}) • Comprobante adjunto.`,
      type: 'order',
    });

    // Trigger Native Push Notification & Audio Chime
    triggerOrderNotificationFlow(enrichedOrder).catch((e) => console.warn('Push trigger warning:', e));

    // Automatically trigger email notification to exodovzl@gmail.com
    sendOrderEmailNotification(enrichedOrder);
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#0D253A', '#C8C3B3', '#D97706'],
    });
  };

  const updateOrderStatus = (orderCode: string, newStage: string) => {
    const now = new Date().toISOString();
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.orderCode !== orderCode) return ord;
        const isDelivered = newStage === 'entregado';
        return {
          ...ord,
          productionStage: newStage,
          status: isDelivered ? 'entregado' : ord.status || 'activo',
          deliveredAt: isDelivered ? now : ord.deliveredAt,
        };
      })
    );

    if (newStage === 'entregado') {
      addAdminNotification({
        title: `📦 Pedido Entregado: ${orderCode}`,
        message: `El pedido ${orderCode} ha sido marcado como ENTREGADO al cliente.`,
        type: 'delivery',
      });
    }
  };

  const updateOrderPaymentStatus = (orderCode: string, paymentStatus: 'Pendiente' | 'Verificado') => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.orderCode !== orderCode) return ord;
        return { ...ord, paymentStatus };
      })
    );

    // If verified, notify admin & credit account
    if (paymentStatus === 'Verificado') {
      const targetOrder = orders.find((o) => o.orderCode === orderCode);
      if (targetOrder) {
        addAdminNotification({
          title: `✅ Pago Verificado: ${orderCode}`,
          message: `Comprobante de pago para ${targetOrder.customerName} validado con éxito.`,
          type: 'order',
        });

        // Credit treasury
        const isBinance = targetOrder.paymentMethod === 'binance';
        if (isBinance) {
          setTreasuryAccounts((prev) => ({
            ...prev,
            binanceUSDT: prev.binanceUSDT + targetOrder.totalUSD,
            lastUpdated: new Date().toISOString(),
          }));
          setTransactions((prev) => [
            {
              id: `tx-ord-${Date.now()}`,
              account: 'binance_usdt',
              type: 'ingreso',
              amount: targetOrder.totalUSD,
              amountUSD: targetOrder.totalUSD,
              concept: `Ingreso automático por Pedido Verificado ${targetOrder.orderCode} (${targetOrder.customerName})`,
              category: 'pedido',
              date: new Date().toISOString(),
              relatedOrderCode: targetOrder.orderCode,
              registeredBy: 'Sistema Automático',
            },
            ...prev,
          ]);
        } else {
          setTreasuryAccounts((prev) => ({
            ...prev,
            bancoDelTesoroVES: prev.bancoDelTesoroVES + targetOrder.totalVES,
            lastUpdated: new Date().toISOString(),
          }));
          setTransactions((prev) => [
            {
              id: `tx-ord-${Date.now()}`,
              account: 'banco_del_tesoro_ves',
              type: 'ingreso',
              amount: targetOrder.totalVES,
              amountUSD: targetOrder.totalUSD,
              concept: `Ingreso automático Pago Móvil por Pedido Verificado ${targetOrder.orderCode} (${targetOrder.customerName})`,
              category: 'pedido',
              date: new Date().toISOString(),
              relatedOrderCode: targetOrder.orderCode,
              registeredBy: 'Sistema Automático',
            },
            ...prev,
          ]);
        }
      }
    }
  };

  const markOrderDelivered = (orderCode: string) => {
    updateOrderStatus(orderCode, 'entregado');
  };

  const cancelOrder = (orderCode: string, reason?: string) => {
    const now = new Date().toISOString();
    setOrders((prev) =>
      prev.map((ord) =>
        ord.orderCode === orderCode
          ? {
              ...ord,
              status: 'cancelado',
              cancelledAt: now,
              cancelReason: reason || 'Cancelado por solicitud del cliente/administración',
            }
          : ord
      )
    );
    addAdminNotification({
      title: `⚠️ Pedido Cancelado: ${orderCode}`,
      message: `El pedido ${orderCode} fue marcado como CANCELADO. Motivo: ${reason || 'Sin motivo especificado'}.`,
      type: 'order',
    });
  };

  const updateOrder = (orderCode: string, updates: Partial<Order>) => {
    setOrders((prev) =>
      prev.map((ord) => (ord.orderCode === orderCode ? { ...ord, ...updates } : ord))
    );
  };

  const addManualOrder = (order: Order, creditAccount: boolean = true) => {
    const enriched: Order = {
      ...order,
      isHistorical: true,
      status: order.status || (order.productionStage === 'entregado' ? 'entregado' : 'activo'),
    };
    setOrders((prev) => [enriched, ...prev]);

    addAdminNotification({
      title: `📝 Nuevo Pedido Manual / Histórico: ${order.orderCode}`,
      message: `Registrado para ${order.customerName} ($${order.totalUSD.toFixed(2)})`,
      type: 'order',
    });

    if (creditAccount && order.paymentStatus === 'Verificado') {
      const isBinance = order.paymentMethod === 'binance';
      if (isBinance) {
        setTreasuryAccounts((prev) => ({
          ...prev,
          binanceUSDT: prev.binanceUSDT + order.totalUSD,
          lastUpdated: new Date().toISOString(),
        }));
        setTransactions((prev) => [
          {
            id: `tx-man-${Date.now()}`,
            account: 'binance_usdt',
            type: 'ingreso',
            amount: order.totalUSD,
            amountUSD: order.totalUSD,
            concept: `Ingreso automático por Pedido Manual ${order.orderCode} (${order.customerName})`,
            category: 'pedido',
            date: order.createdAt || new Date().toISOString(),
            relatedOrderCode: order.orderCode,
            registeredBy: 'Admin Manual',
          },
          ...prev,
        ]);
      } else {
        setTreasuryAccounts((prev) => ({
          ...prev,
          bancoDelTesoroVES: prev.bancoDelTesoroVES + order.totalVES,
          lastUpdated: new Date().toISOString(),
        }));
        setTransactions((prev) => [
          {
            id: `tx-man-${Date.now()}`,
            account: 'banco_del_tesoro_ves',
            type: 'ingreso',
            amount: order.totalVES,
            amountUSD: order.totalUSD,
            concept: `Ingreso automático Pago Móvil por Pedido Manual ${order.orderCode} (${order.customerName})`,
            category: 'pedido',
            date: order.createdAt || new Date().toISOString(),
            relatedOrderCode: order.orderCode,
            registeredBy: 'Admin Manual',
          },
          ...prev,
        ]);
      }
    }
  };

  // Treasury Operations (Efectivo USD/VES, Binance USDT, Banco del Tesoro VES)
  const updateTreasuryBalance = (
    account: 'binance_usdt' | 'banco_del_tesoro_ves' | 'efectivo_usd' | 'efectivo_ves',
    newBalance: number,
    note?: string
  ) => {
    const fieldKey: keyof TreasuryAccounts = 
      account === 'binance_usdt' ? 'binanceUSDT' :
      account === 'banco_del_tesoro_ves' ? 'bancoDelTesoroVES' :
      account === 'efectivo_usd' ? 'efectivoUSD' : 'efectivoVES';

    const currentVal = Number(treasuryAccounts[fieldKey] || 0);
    const diff = newBalance - currentVal;

    const updatedAccounts: TreasuryAccounts = {
      ...treasuryAccounts,
      [fieldKey]: Math.max(0, newBalance),
      lastUpdated: new Date().toISOString(),
    };
    setTreasuryAccounts(updatedAccounts);
    saveCashBalancesToFirestore(updatedAccounts);

    if (Math.abs(diff) > 0.001) {
      const isUSD = account === 'binance_usdt' || account === 'efectivo_usd';
      const amountUSD = isUSD ? Math.abs(diff) : Math.abs(diff) / exchangeRateBCV;
      const accountLabel = 
        account === 'binance_usdt' ? 'Binance Pay (USDT)' :
        account === 'banco_del_tesoro_ves' ? 'Banco del Tesoro (Bs.)' :
        account === 'efectivo_usd' ? 'Caja Efectivo ($ USD)' : 'Caja Efectivo (Bs.)';

      const adjTx: CashTransaction = {
        id: `tx-adj-${Date.now()}`,
        account,
        type: 'ajuste',
        amount: Math.abs(diff),
        amountUSD,
        concept: `Ajuste manual de saldo en ${accountLabel}: ${diff >= 0 ? '+' : '-'}${Math.abs(diff).toFixed(2)}. ${note || ''}`,
        category: 'ajuste_manual',
        date: new Date().toISOString(),
        registeredBy: 'Administrador',
      };

      setTransactions((prev) => [adjTx, ...prev]);
      saveCashTransactionToFirestore(adjTx);
    }
  };

  const recordCashOperation = (params: {
    account: 'binance_usdt' | 'banco_del_tesoro_ves' | 'efectivo_usd' | 'efectivo_ves';
    type: 'ingreso' | 'egreso' | 'compra_efectivo' | 'venta_efectivo' | 'cambio_divisa' | 'ajuste';
    amount: number;
    concept: string;
    category?: any;
    counterpartAccount?: 'binance_usdt' | 'banco_del_tesoro_ves' | 'efectivo_usd' | 'efectivo_ves';
    exchangeRateUsed?: number;
  }) => {
    const isUSD = params.account === 'binance_usdt' || params.account === 'efectivo_usd';
    const amountUSD = isUSD ? params.amount : params.amount / (params.exchangeRateUsed || exchangeRateBCV);

    const tx: CashTransaction = {
      id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      account: params.account,
      type: params.type,
      amount: params.amount,
      amountUSD,
      concept: params.concept,
      category: params.category || (params.type === 'ingreso' ? 'pedido' : 'gasto_operativo'),
      date: new Date().toISOString(),
      registeredBy: 'Administrador',
      counterpartAccount: params.counterpartAccount,
      exchangeRateUsed: params.exchangeRateUsed,
    };

    setTransactions((prev) => [tx, ...prev]);
    saveCashTransactionToFirestore(tx);

    setTreasuryAccounts((prev) => {
      const next: TreasuryAccounts = { ...prev };
      const getField = (acc: string): keyof TreasuryAccounts =>
        acc === 'binance_usdt' ? 'binanceUSDT' :
        acc === 'banco_del_tesoro_ves' ? 'bancoDelTesoroVES' :
        acc === 'efectivo_usd' ? 'efectivoUSD' : 'efectivoVES';

      const mainField = getField(params.account);

      if (params.type === 'ingreso') {
        (next[mainField] as number) = Number(next[mainField] || 0) + params.amount;
      } else if (params.type === 'egreso') {
        (next[mainField] as number) = Math.max(0, Number(next[mainField] || 0) - params.amount);
      } else if (params.type === 'compra_efectivo') {
        // Ingresa efectivo al account seleccionado
        (next[mainField] as number) = Number(next[mainField] || 0) + params.amount;
        if (params.counterpartAccount) {
          const cpField = getField(params.counterpartAccount);
          const cpRate = params.exchangeRateUsed || exchangeRateBCV;
          const cpAmount = (params.counterpartAccount === 'banco_del_tesoro_ves' || params.counterpartAccount === 'efectivo_ves')
            ? (params.account === 'efectivo_usd' || params.account === 'binance_usdt' ? params.amount * cpRate : params.amount)
            : (params.account === 'efectivo_ves' || params.account === 'banco_del_tesoro_ves' ? params.amount / cpRate : params.amount);
          (next[cpField] as number) = Math.max(0, Number(next[cpField] || 0) - cpAmount);
        }
      } else if (params.type === 'venta_efectivo') {
        // Egresa efectivo del account seleccionado
        (next[mainField] as number) = Math.max(0, Number(next[mainField] || 0) - params.amount);
        if (params.counterpartAccount) {
          const cpField = getField(params.counterpartAccount);
          const cpRate = params.exchangeRateUsed || exchangeRateBCV;
          const cpAmount = (params.counterpartAccount === 'banco_del_tesoro_ves' || params.counterpartAccount === 'efectivo_ves')
            ? (params.account === 'efectivo_usd' || params.account === 'binance_usdt' ? params.amount * cpRate : params.amount)
            : (params.account === 'efectivo_ves' || params.account === 'banco_del_tesoro_ves' ? params.amount / cpRate : params.amount);
          (next[cpField] as number) = Number(next[cpField] || 0) + cpAmount;
        }
      }

      next.lastUpdated = new Date().toISOString();
      saveCashBalancesToFirestore(next);
      return next;
    });
  };

  const addTransaction = (tx: Omit<CashTransaction, 'id' | 'date'>) => {
    const isUSD = tx.account === 'binance_usdt' || tx.account === 'efectivo_usd';
    const newTx: CashTransaction = {
      ...tx,
      amountUSD: tx.amountUSD ?? (isUSD ? tx.amount : tx.amount / exchangeRateBCV),
      id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      date: new Date().toISOString(),
    };
    setTransactions((prev) => [newTx, ...prev]);
    saveCashTransactionToFirestore(newTx);

    // Update account balance
    setTreasuryAccounts((prev) => {
      const getField = (acc: string): keyof TreasuryAccounts =>
        acc === 'binance_usdt' ? 'binanceUSDT' :
        acc === 'banco_del_tesoro_ves' ? 'bancoDelTesoroVES' :
        acc === 'efectivo_usd' ? 'efectivoUSD' : 'efectivoVES';

      const fieldKey = getField(tx.account);
      const current = Number(prev[fieldKey] || 0);
      const updated = tx.type === 'ingreso' ? current + tx.amount : current - tx.amount;
      const nextAccounts: TreasuryAccounts = {
        ...prev,
        [fieldKey]: Math.max(0, updated),
        lastUpdated: new Date().toISOString(),
      };
      saveCashBalancesToFirestore(nextAccounts);
      return nextAccounts;
    });
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  // Debts Operations ("Quién me debe")
  const addDebt = (debt: Omit<DebtRecord, 'id' | 'createdAt' | 'paidUSD' | 'paidVES' | 'remainingUSD' | 'remainingVES' | 'status'>) => {
    const newDebt: DebtRecord = {
      ...debt,
      id: `debt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      paidUSD: 0,
      paidVES: 0,
      remainingUSD: debt.totalUSD,
      remainingVES: debt.totalVES,
      status: 'pendiente',
      createdAt: new Date().toISOString().split('T')[0],
    };
    setDebts((prev) => [newDebt, ...prev]);
  };

  const updateDebt = (id: string, updates: Partial<DebtRecord>) => {
    setDebts((prev) => prev.map((d) => (d.id === id ? { ...d, ...updates } : d)));
  };

  const deleteDebt = (id: string) => {
    setDebts((prev) => prev.filter((d) => d.id !== id));
  };

  const recordDebtPayment = (
    id: string,
    amountUSD: number,
    amountVES: number,
    targetAccount: 'binance_usdt' | 'banco_del_tesoro_ves' | 'efectivo_usd' | 'efectivo_ves'
  ) => {
    setDebts((prev) =>
      prev.map((d) => {
        if (d.id !== id) return d;
        const newPaidUSD = d.paidUSD + amountUSD;
        const newPaidVES = d.paidVES + amountVES;
        const newRemainingUSD = Math.max(0, d.totalUSD - newPaidUSD);
        const newRemainingVES = Math.max(0, d.totalVES - newPaidVES);
        const newStatus = newRemainingUSD <= 0.05 ? 'cobrado' : 'abonado';
        return {
          ...d,
          paidUSD: newPaidUSD,
          paidVES: newPaidVES,
          remainingUSD: newRemainingUSD,
          remainingVES: newRemainingVES,
          status: newStatus,
        };
      })
    );

    // Auto-create income transaction
    const targetAmount = targetAccount === 'binance_usdt' ? amountUSD : amountVES;
    addTransaction({
      account: targetAccount,
      type: 'ingreso',
      amount: targetAmount,
      amountUSD: amountUSD,
      concept: `Abono de deuda recibido de cliente (ID: ${id})`,
      category: 'abono_deuda',
      registeredBy: 'Administrador',
    });
  };

  // Daily Cash Close
  const closeDailyCash = (date: string, notes?: string, closedBy: string = 'Administrador ÉXODO') => {
    const dayOrders = orders.filter((o) => {
      if (!o.createdAt) return false;
      return o.createdAt.startsWith(date);
    });

    const deliveredOrders = dayOrders.filter((o) => o.productionStage === 'entregado' || o.status === 'entregado');
    const totalUSD = dayOrders.reduce((acc, o) => acc + (o.totalUSD || 0), 0);
    const totalVES = dayOrders.reduce((acc, o) => acc + (o.totalVES || 0), 0);

    const binanceOrders = dayOrders.filter((o) => o.paymentMethod === 'binance');
    const binanceUSD = binanceOrders.reduce((acc, o) => acc + (o.totalUSD || 0), 0);

    const tesoroOrders = dayOrders.filter((o) => o.paymentMethod !== 'binance');
    const tesoroVES = tesoroOrders.reduce((acc, o) => acc + (o.totalVES || 0), 0);

    const newClose: DailyCashClose = {
      id: `close-${date}-${Date.now()}`,
      date,
      closedAt: new Date().toISOString(),
      totalUSD,
      totalVES,
      binanceUSD,
      tesoroVES,
      ordersCount: dayOrders.length,
      ordersDeliveredCount: deliveredOrders.length,
      ordersSummary: dayOrders.map((o) => ({
        orderCode: o.orderCode,
        customerName: o.customerName,
        totalUSD: o.totalUSD,
        totalVES: o.totalVES,
        paymentMethod: o.paymentMethod || 'Pago Móvil (Banco del Tesoro)',
        status: o.status || o.productionStage,
      })),
      notes: notes || 'Cierre de caja generado automáticamente por el sistema OMS.',
      closedBy,
    };

    setCashCloses((prev) => [newClose, ...prev]);
    addAdminNotification({
      title: `📊 Cierre de Caja Realizado: ${date}`,
      message: `Total Facturado: $${totalUSD.toFixed(2)} (${dayOrders.length} pedidos, ${deliveredOrders.length} entregados).`,
      type: 'order',
    });

    return newClose;
  };

  const addKanbanColumn = (column: KanbanColumn) => {
    setKanbanColumns((prev) => [...prev, column]);
  };

  const updateKanbanColumn = (column: KanbanColumn) => {
    setKanbanColumns((prev) => prev.map((c) => (c.id === column.id ? column : c)));
  };

  const deleteKanbanColumn = (id: string) => {
    setKanbanColumns((prev) => prev.filter((c) => c.id !== id));
  };

  const findOrderByCode = (code: string) => {
    const clean = code.trim().toUpperCase();
    return orders.find((o) => o.orderCode.toUpperCase() === clean);
  };

  // Circles
  const addCategoryCircle = (circle: CategoryCircle) => {
    setCategoryCircles((prev) => [...prev, circle]);
  };

  const updateCategoryCircle = (circle: CategoryCircle) => {
    setCategoryCircles((prev) => prev.map((c) => (c.id === circle.id ? circle : c)));
  };

  const deleteCategoryCircle = (id: string) => {
    setCategoryCircles((prev) => prev.filter((c) => c.id !== id));
  };

  // User auth
  const registerUser = (user: CustomerUser) => {
    setCurrentUser(user);
    localStorage.setItem('exodo_user', JSON.stringify(user));
    // also save in registered users map
    const existingUsers = JSON.parse(localStorage.getItem('exodo_registered_users') || '[]');
    existingUsers.push(user);
    localStorage.setItem('exodo_registered_users', JSON.stringify(existingUsers));
    setIsAuthModalOpen(false);
  };

  const loginUser = (phone: string, password?: string) => {
    const users: CustomerUser[] = JSON.parse(localStorage.getItem('exodo_registered_users') || '[]');
    const found = users.find((u) => u.phone.trim() === phone.trim());
    if (found) {
      if (password && found.password && found.password !== password) {
        return false;
      }
      setCurrentUser(found);
      localStorage.setItem('exodo_user', JSON.stringify(found));
      setIsAuthModalOpen(false);
      return true;
    }
    // If not found, auto-create account for frictionless Venezuelan checkout
    const newUser: CustomerUser = {
      phone,
      fullName: 'Cliente ÉXODO',
      shippingAddress: 'Caracas, Venezuela',
      registeredAt: new Date().toISOString(),
    };
    registerUser(newUser);
    return true;
  };

  const logoutUser = () => {
    setCurrentUser(null);
    localStorage.removeItem('exodo_user');
  };

  // Admin auth
  const adminLogin = (key: string): boolean => {
    if (key.trim() === '2412') {
      setIsAdminAuthenticated(true);
      sessionStorage.setItem('exodo_admin_auth', 'true');
      setIsAdminLoginModalOpen(false);
      setCurrentPage('admin');
      return true;
    }
    return false;
  };

  const adminLogout = () => {
    setIsAdminAuthenticated(false);
    sessionStorage.removeItem('exodo_admin_auth');
    setCurrentPage('inicio');
  };

  // Brand & Font Management
  const updateBrandConfig = (config: Partial<BrandConfig>) => {
    setBrandConfig((prev) => ({ ...prev, ...config }));
  };

  const uploadCustomFont = async (file: File): Promise<string> => {
    const installed = await installCustomFont(file);
    return installed.name;
  };

  const installCustomFont = async (file: File): Promise<InstalledFont> => {
    return new Promise((resolve, reject) => {
      const ext = file.name.split('.').pop()?.toLowerCase();
      let format: 'truetype' | 'opentype' | 'woff' | 'woff2' = 'truetype';
      if (ext === 'otf') format = 'opentype';
      else if (ext === 'woff') format = 'woff';
      else if (ext === 'woff2') format = 'woff2';

      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        const newFont: InstalledFont = {
          id: `font-custom-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          name: cleanName,
          fileName: file.name,
          format,
          url: dataUrl,
          sizeBytes: file.size,
          installedAt: new Date().toISOString().split('T')[0],
          isPreset: false,
        };

        setBrandConfig((prev) => {
          const currentList = prev.installedFonts || INITIAL_INSTALLED_FONTS;
          return {
            ...prev,
            installedFonts: [newFont, ...currentList],
            activeHeadingFontId: newFont.id,
            customFontName: cleanName,
            customFontUrl: dataUrl,
          };
        });

        resolve(newFont);
      };
      reader.onerror = () => reject(new Error('Error al leer el archivo de tipografía'));
      reader.readAsDataURL(file);
    });
  };

  const removeInstalledFont = (fontId: string) => {
    setBrandConfig((prev) => {
      const currentList = prev.installedFonts || INITIAL_INSTALLED_FONTS;
      const updatedList = currentList.filter((f) => f.id !== fontId);
      
      let newHeadingId = prev.activeHeadingFontId;
      let newBodyId = prev.activeBodyFontId;
      let newAccentId = prev.activeAccentFontId;

      if (newHeadingId === fontId) {
        newHeadingId = updatedList[0]?.id || 'font-bebas-neue';
      }
      if (newBodyId === fontId) {
        newBodyId = updatedList[0]?.id || 'font-montserrat';
      }
      if (newAccentId === fontId) {
        newAccentId = updatedList[0]?.id || 'font-cinzel';
      }

      return {
        ...prev,
        installedFonts: updatedList,
        activeHeadingFontId: newHeadingId,
        activeBodyFontId: newBodyId,
        activeAccentFontId: newAccentId,
      };
    });
  };

  const setActiveFontRole = (fontId: string, role: 'heading' | 'body' | 'accent') => {
    setBrandConfig((prev) => {
      const updates: Partial<BrandConfig> = {};
      if (role === 'heading') {
        updates.activeHeadingFontId = fontId;
        const font = prev.installedFonts?.find((f) => f.id === fontId);
        if (font) {
          updates.customFontName = font.name;
          updates.customFontUrl = font.url;
        }
      } else if (role === 'body') {
        updates.activeBodyFontId = fontId;
      } else if (role === 'accent') {
        updates.activeAccentFontId = fontId;
      }
      return { ...prev, ...updates };
    });
  };

  const resetFontsToPresets = () => {
    setBrandConfig((prev) => ({
      ...prev,
      installedFonts: INITIAL_INSTALLED_FONTS,
      activeHeadingFontId: 'font-bebas-neue',
      activeBodyFontId: 'font-montserrat',
      activeAccentFontId: 'font-cinzel',
      customFontName: 'Bebas Neue',
      customFontUrl: null,
    }));
  };

  const resetBrandDefaults = () => {
    setBrandConfig(INITIAL_BRAND_CONFIG);
    const styleTag = document.getElementById('exodo-custom-font-style');
    if (styleTag) styleTag.remove();
  };

  // Colección Asset Library Functions
  const addArtworkDesign = (design: ArtworkDesign) => {
    setArtworkDesigns((prev) => [design, ...prev]);
  };

  const updateArtworkDesign = (id: string, updates: Partial<ArtworkDesign>) => {
    setArtworkDesigns((prev) =>
      prev.map((art) => (art.id === id ? { ...art, ...updates } : art))
    );
  };

  const deleteArtworkDesign = (id: string) => {
    setArtworkDesigns((prev) => prev.filter((art) => art.id !== id));
  };

  const toggleArtworkSupport = (id: string, support: 'franela' | 'tote' | 'lamina' | 'stickers') => {
    setArtworkDesigns((prev) =>
      prev.map((art) => {
        if (art.id !== id) return art;
        const currentVal = art.availableSupports[support];
        const updatedSupports = {
          ...art.availableSupports,
          [support]: !currentVal,
        };
        const tagMap: Record<string, string> = {
          franela: 'Franela',
          tote: 'Tote Bag',
          lamina: 'Lámina',
          stickers: 'Sticker',
        };
        const tagName = tagMap[support];
        let newTags = [...art.tags];
        if (!currentVal) {
          if (!newTags.includes(tagName)) newTags.push(tagName);
        } else {
          newTags = newTags.filter((t) => t !== tagName);
        }
        return {
          ...art,
          availableSupports: updatedSupports,
          tags: newTags,
        };
      })
    );
  };

  // CMS Handlers
  const setProductFeatured = (productId: string, isFeatured: boolean) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, isFeatured } : p))
    );
  };

  const setProductDiscount = (productId: string, discountPrice?: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, discountPrice } : p))
    );
  };

  const updateHeroSlides = (slides: HeroSlide[]) => {
    setHeroSlides(slides);
  };

  const addCollection = (name: string) => {
    if (!name.trim()) return;
    const clean = name.trim();
    if (!collections.includes(clean)) {
      setCollections((prev) => [...prev, clean]);
    }
  };

  const updateCollection = (oldName: string, newName: string) => {
    if (!newName.trim()) return;
    const clean = newName.trim();
    setCollections((prev) => prev.map((c) => (c === oldName ? clean : c)));
    setProducts((prev) =>
      prev.map((p) => (p.collection === (oldName as any) ? { ...p, collection: clean as any } : p))
    );
  };

  const deleteCollection = (name: string) => {
    setCollections((prev) => prev.filter((c) => c !== name));
  };

  const updateLabPricingConfig = (pricing: Partial<LabPricingConfig>) => {
    setLabPricingConfig((prev) => ({ ...prev, ...pricing }));
  };

  const updateAboutContent = (content: Partial<AboutContent>) => {
    setAboutContent((prev) => ({ ...prev, ...content }));
  };

  const updateSocialLinks = (links: Partial<SocialLinks>) => {
    setSocialLinks((prev) => ({ ...prev, ...links }));
  };

  const updateCommunityPosts = (posts: CommunityPost[]) => {
    setCommunityPosts(posts);
  };

  const addPrayerRequest = async (req: Omit<PrayerRequest, 'id' | 'createdAt' | 'status'>) => {
    const newRequest: PrayerRequest = {
      ...req,
      id: `prayer-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      status: 'nueva',
    };
    setPrayerRequests((prev) => [newRequest, ...prev]);
    await sendPrayerEmailNotification(newRequest);
  };

  const updatePrayerRequestStatus = (id: string, status: 'nueva' | 'en_oracion' | 'respondida') => {
    setPrayerRequests((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status } : p))
    );
  };

  const deletePrayerRequest = (id: string) => {
    setPrayerRequests((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <StoreContext.Provider
      value={{
        currentPage,
        setCurrentPage,
        selectedCategory,
        setSelectedCategory,
        selectedCollection,
        setSelectedCollection,
        searchQuery,
        setSearchQuery,
        activePdpProduct,
        setActivePdpProduct,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        cartTotalUSD,
        cartTotalVES,
        exchangeRateBCV,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        setProductFeatured,
        setProductDiscount,
        orders,
        kanbanColumns,
        createOrder,
        updateOrderStatus,
        updateOrderPaymentStatus,
        addKanbanColumn,
        updateKanbanColumn,
        deleteKanbanColumn,
        findOrderByCode,
        categoryCircles,
        collectionCircles,
        addCategoryCircle,
        updateCategoryCircle,
        deleteCategoryCircle,
        currentUser,
        registerUser,
        loginUser,
        logoutUser,
        isAuthModalOpen,
        setIsAuthModalOpen,
        isTrackingModalOpen,
        setIsTrackingModalOpen,
        trackingOrderCode,
        setTrackingOrderCode,
        isAdminAuthenticated,
        adminLogin,
        adminLogout,
        isAdminLoginModalOpen,
        setIsAdminLoginModalOpen,
        brandConfig,
        updateBrandConfig,
        uploadCustomFont,
        installCustomFont,
        removeInstalledFont,
        setActiveFontRole,
        resetFontsToPresets,
        resetBrandDefaults,
        artworkDesigns,
        addArtworkDesign,
        updateArtworkDesign,
        deleteArtworkDesign,
        toggleArtworkSupport,
        heroSlides,
        updateHeroSlides,
        collections,
        addCollection,
        updateCollection,
        deleteCollection,
        labPricingConfig,
        updateLabPricingConfig,
        aboutContent,
        updateAboutContent,
        socialLinks,
        updateSocialLinks,
        communityPosts,
        updateCommunityPosts,
        prayerRequests,
        addPrayerRequest,
        updatePrayerRequestStatus,
        deletePrayerRequest,
        googleSheetsUrl,
        setGoogleSheetsUrl,
        lastSyncedTimestamp,
        setLastSyncedTimestamp,
        // Custom Lab Mockups (Subida y Gestión de Mockups tipo Imagen)
        customLabMockups,
        addCustomLabMockup,
        deleteCustomLabMockup,
        updateCustomLabMockup,
        // Order Management & Cancellation & Delivery
        markOrderDelivered,
        cancelOrder,
        updateOrder,
        addManualOrder,
        // Treasury & Cash Flow
        treasuryAccounts,
        updateTreasuryBalance,
        recordCashOperation,
        isFirestoreSynced,
        transactions,
        addTransaction,
        deleteTransaction,
        debts,
        addDebt,
        updateDebt,
        deleteDebt,
        recordDebtPayment,
        cashCloses,
        closeDailyCash,
        // Notifications
        adminNotifications,
        markNotificationRead,
        clearNotifications,
        sendPushNotification,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
