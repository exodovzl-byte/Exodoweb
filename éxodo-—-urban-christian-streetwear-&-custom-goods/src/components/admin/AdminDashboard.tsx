import React, { useState } from 'react';
import { 
  ShieldCheck, 
  LogOut, 
  Package, 
  Kanban, 
  Palette, 
  FileSpreadsheet, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  Upload, 
  Move, 
  RefreshCw, 
  Search, 
  Eye, 
  ExternalLink,
  Sliders,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  ChevronUp,
  ChevronDown, 
  X,
  Layers,
  Image as ImageIcon,
  Wallet,
  Bell,
  CheckCircle2,
  Ban,
  Receipt,
  FileCheck
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Product, Order, KanbanColumn, CategoryCircle, ProductCategory, ProductCollection } from '../../types';
import { GoogleSignInButton } from '../common/GoogleSignInButton';
import { googleSignIn, getAccessToken, logoutGoogle } from '../../services/firebaseAuth';
import { createOrdersSpreadsheet, createInventorySpreadsheet } from '../../services/googleSheets';
import { BrandAssetManager } from './BrandAssetManager';
import { CollectionAssetLibrary } from './CollectionAssetLibrary';
import { MultiFontManager } from './MultiFontManager';
import { TreasuryManager } from './TreasuryManager';
import { CashCloseModal } from './CashCloseModal';
import { OrderDetailModal } from './OrderDetailModal';
import { ManualOrderModal } from './ManualOrderModal';
import { CustomLabAdminConfig } from './CustomLabAdminConfig';

export const AdminDashboard: React.FC = () => {
  const {
    adminLogout,
    orders,
    updateOrderStatus,
    updateOrderPaymentStatus,
    markOrderDelivered,
    cancelOrder,
    kanbanColumns,
    addKanbanColumn,
    updateKanbanColumn,
    deleteKanbanColumn,
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    artworkDesigns,
    brandConfig,
    updateBrandConfig,
    uploadCustomFont,
    resetBrandDefaults,
    categoryCircles,
    collectionCircles,
    addCategoryCircle,
    updateCategoryCircle,
    deleteCategoryCircle,
    googleSheetsUrl,
    setGoogleSheetsUrl,
    lastSyncedTimestamp,
    setLastSyncedTimestamp,
    exchangeRateBCV,
    treasuryAccounts,
    adminNotifications,
    markNotificationRead,
    clearNotifications,
  } = useStore();

  const [activeTab, setActiveTab] = useState<'kanban' | 'products' | 'artworks' | 'brand' | 'treasury' | 'custom_lab' | 'sheets'>('kanban');

  // Kanban Filters
  const [kanbanSearch, setKanbanSearch] = useState('');
  const [kanbanProductFilter, setKanbanProductFilter] = useState<string>('todos');

  // Modals for Orders & Treasury
  const [isCashCloseModalOpen, setIsCashCloseModalOpen] = useState(false);
  const [isManualOrderModalOpen, setIsManualOrderModalOpen] = useState(false);
  const [selectedDetailOrder, setSelectedDetailOrder] = useState<Order | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState(false);

  // Column configurator modal
  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [newColumnColor, setNewColumnColor] = useState('#2563EB');

  // Product Add / Edit Modal
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Google Sheets state
  const [isGoogleSignedIn, setIsGoogleSignedIn] = useState(false);
  const [isSyncingSheets, setIsSyncingSheets] = useState(false);
  const [sheetsError, setSheetsError] = useState<string | null>(null);
  const [sheetsSuccessMessage, setSheetsSuccessMessage] = useState<string | null>(null);

  // New Circle Form
  const [newCircleTitle, setNewCircleTitle] = useState('');
  const [newCircleImage, setNewCircleImage] = useState('');
  const [newCircleType, setNewCircleType] = useState<'category' | 'collection'>('collection');
  const [newCircleValue, setNewCircleValue] = useState('');

  // ----------------------------------------------------
  // GOOGLE SHEETS SYNC
  // ----------------------------------------------------
  const handleGoogleAuth = async () => {
    try {
      setSheetsError(null);
      const res = await googleSignIn();
      if (res) {
        setIsGoogleSignedIn(true);
        setSheetsSuccessMessage(`Conectado con cuenta de Google: ${res.user.email}`);
      }
    } catch (err: any) {
      setSheetsError(err?.message || 'Error al iniciar sesión con Google');
    }
  };

  const handleSyncOrdersToSheets = async () => {
    try {
      setIsSyncingSheets(true);
      setSheetsError(null);
      setSheetsSuccessMessage(null);

      const token = await getAccessToken();
      if (!token) {
        await handleGoogleAuth();
      }

      // Explicit confirmation for destructive or creation operations per skill rules
      const confirmed = window.confirm(
        `¿Deseas exportar y sincronizar los ${orders.length} pedidos de ÉXODO en una nueva hoja de cálculo de Google Sheets?`
      );
      if (!confirmed) {
        setIsSyncingSheets(false);
        return;
      }

      const result = await createOrdersSpreadsheet(orders);
      setGoogleSheetsUrl(result.spreadsheetUrl);
      const now = new Date().toLocaleString('es-VE');
      setLastSyncedTimestamp(now);
      setSheetsSuccessMessage(`¡Hoja de cálculo generada con éxito!`);
    } catch (err: any) {
      console.error(err);
      setSheetsError(err?.message || 'Error al sincronizar con Google Sheets');
    } finally {
      setIsSyncingSheets(false);
    }
  };

  const handleSyncInventoryToSheets = async () => {
    try {
      setIsSyncingSheets(true);
      setSheetsError(null);
      const confirmed = window.confirm(
        `¿Deseas exportar el catálogo completo de ${products.length} productos a Google Sheets?`
      );
      if (!confirmed) {
        setIsSyncingSheets(false);
        return;
      }
      const result = await createInventorySpreadsheet(products);
      setGoogleSheetsUrl(result.spreadsheetUrl);
      setSheetsSuccessMessage(`¡Inventario exportado a Google Sheets con éxito!`);
    } catch (err: any) {
      setSheetsError(err?.message || 'Error exportando inventario');
    } finally {
      setIsSyncingSheets(false);
    }
  };

  // ----------------------------------------------------
  // PRODUCT FORM SUBMIT
  // ----------------------------------------------------
  const handleSaveProduct = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const name = formData.get('name') as string;
    const category = formData.get('category') as ProductCategory;
    const collection = formData.get('collection') as ProductCollection;
    const basePrice = parseFloat(formData.get('basePrice') as string) || 20;
    const discountPriceRaw = formData.get('discountPrice') as string;
    const discountPrice = discountPriceRaw ? parseFloat(discountPriceRaw) : undefined;
    const oversizePriceDelta = parseFloat(formData.get('oversizePriceDelta') as string) || 0;
    const imageUrl = (formData.get('imageUrl') as string) || '/src/assets/images/franela_oversize_1791054727426.jpg';
    const scripture = formData.get('scripture') as string;
    const unifiedDescription = formData.get('unifiedDescription') as string;
    const stock = parseInt(formData.get('stock') as string) || 20;

    const updatedOrNew: Product = {
      id: editingProduct ? editingProduct.id : `prod-${Date.now()}`,
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      category,
      collection,
      basePrice,
      discountPrice,
      oversizePriceDelta,
      images: [imageUrl],
      scripture,
      spiritualMeaning: 'Diseño inspirado en la resistencia espiritual y la gloria de Cristo.',
      materialSpecs: category === 'franelas' ? '100% Algodón Peinado Pesado 240g, estampado DTF' : 'Material premium resistente',
      unifiedDescription,
      availableSizes: ['S', 'M', 'L', 'XL', '2XL'],
      availableColors: [
        { name: 'Negro Pitch', hex: '#000000' },
        { name: 'Azul Éxodo', hex: '#0D253A' },
        { name: 'Arena Concreto', hex: '#C8C3B3' },
      ],
      stock,
      isFeatured: true,
      createdAt: editingProduct ? editingProduct.createdAt : new Date().toISOString(),
    };

    if (editingProduct) {
      updateProduct(updatedOrNew);
    } else {
      addProduct(updatedOrNew);
    }

    setIsProductModalOpen(false);
    setEditingProduct(null);
  };

  // Filtered orders for Kanban
  const filteredOrders = orders.filter((ord) => {
    if (kanbanSearch.trim()) {
      const q = kanbanSearch.toLowerCase();
      const matchCode = ord.orderCode.toLowerCase().includes(q);
      const matchPhone = ord.customerPhone.toLowerCase().includes(q);
      const matchName = ord.customerName.toLowerCase().includes(q);
      if (!matchCode && !matchPhone && !matchName) return false;
    }
    if (kanbanProductFilter !== 'todos') {
      const hasCategory = ord.items.some((it) => it.product.category === kanbanProductFilter);
      if (!hasCategory) return false;
    }
    return true;
  });

  return (
    <div className="bg-neutral-950 min-h-screen text-white pb-20">
      
      {/* Top Admin Bar */}
      <div className="bg-black border-b border-neutral-800 sticky top-0 z-30 px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold shrink-0">
            <ShieldCheck size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black uppercase tracking-tight font-brand-heading">
                ÉXODO BACKOFFICE ADMIN
              </h1>
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[10px] font-mono font-bold uppercase">
                Clave 2412 Activa
              </span>
            </div>
            {/* Quick Treasury Pill */}
            <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-400 mt-0.5 flex-wrap">
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Binance: ${treasuryAccounts?.binanceUSDT?.toFixed(2) || '0.00'} USDT
              </span>
              <span>•</span>
              <span className="text-amber-400 font-bold">
                Tesoro: Bs. {(treasuryAccounts?.bancoDelTesoroVES || 0).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span>•</span>
              <span className="text-emerald-300 font-bold">
                Efectivo: ${treasuryAccounts?.efectivoUSD?.toFixed(2) || '0.00'} USD
              </span>
              <span>•</span>
              <span className="text-neutral-500">
                Tasa BCV: Bs. {exchangeRateBCV.toFixed(2)}/$
              </span>
            </div>
          </div>
        </div>

        {/* Action Tabs, Notifications & Logout */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex bg-neutral-900 p-1 rounded-xl border border-neutral-800 flex-wrap gap-1">
            <button
              onClick={() => setActiveTab('kanban')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                activeTab === 'kanban' ? 'bg-[#0D253A] text-amber-400 shadow-md' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Kanban size={14} />
              <span>Kanban OMS</span>
            </button>

            <button
              onClick={() => setActiveTab('treasury')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                activeTab === 'treasury' ? 'bg-[#0D253A] text-amber-400 shadow-md' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Wallet size={14} />
              <span>Tesorería & Flujo de Caja</span>
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                activeTab === 'products' ? 'bg-[#0D253A] text-amber-400 shadow-md' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Package size={14} />
              <span>Productos ({products.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('artworks')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                activeTab === 'artworks' ? 'bg-[#0D253A] text-amber-400 shadow-md' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <ImageIcon size={14} />
              <span>Asset Library ({artworkDesigns.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('brand')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                activeTab === 'brand' ? 'bg-[#0D253A] text-amber-400 shadow-md' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Palette size={14} />
              <span>Marca & Logos</span>
            </button>

            <button
              onClick={() => setActiveTab('custom_lab')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                activeTab === 'custom_lab' ? 'bg-[#0D253A] text-amber-400 shadow-md' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Sliders size={14} />
              <span>Custom Lab & Precios</span>
            </button>

            <button
              onClick={() => setActiveTab('sheets')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                activeTab === 'sheets' ? 'bg-[#0D253A] text-amber-400 shadow-md' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <FileSpreadsheet size={14} />
              <span>Google Sheets</span>
            </button>
          </div>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsNotifDropdownOpen(!isNotifDropdownOpen)}
              className="relative p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-amber-400 hover:border-neutral-700 transition-colors"
              title="Notificaciones y comprobantes"
            >
              <Bell size={16} />
              {adminNotifications.some((n) => !n.read) && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-black text-[9px] font-black flex items-center justify-center animate-bounce">
                  {adminNotifications.filter((n) => !n.read).length}
                </span>
              )}
            </button>

            {isNotifDropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-neutral-950 border border-neutral-800 rounded-2xl shadow-2xl z-50 p-3 space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                  <span className="text-xs font-bold text-white uppercase font-mono">
                    Notificaciones Push ({adminNotifications.length})
                  </span>
                  {adminNotifications.length > 0 && (
                    <button
                      onClick={clearNotifications}
                      className="text-[10px] text-neutral-400 hover:text-red-400 transition-colors"
                    >
                      Limpiar
                    </button>
                  )}
                </div>

                <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                  {adminNotifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markNotificationRead(n.id)}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer text-xs ${
                        n.read
                          ? 'bg-neutral-900/40 border-neutral-850 opacity-60'
                          : 'bg-neutral-900 border-amber-500/40'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <span className="font-bold text-white">{n.title}</span>
                        <span className="text-[9px] text-neutral-500 font-mono">
                          {new Date(n.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-300 mt-1 leading-snug">{n.message}</p>
                      {n.orderCode && (
                        <span className="mt-1.5 inline-block text-[9px] font-mono text-amber-400 bg-black/60 px-1.5 py-0.5 rounded border border-neutral-800">
                          {n.orderCode}
                        </span>
                      )}
                    </div>
                  ))}

                  {adminNotifications.length === 0 && (
                    <p className="text-center py-6 text-xs text-neutral-500 font-mono">
                      No hay notificaciones pendientes
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={adminLogout}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-red-800 text-neutral-400 hover:text-red-400 text-xs font-bold uppercase transition-colors"
            title="Cerrar panel de administración"
          >
            <LogOut size={14} />
            <span className="hidden sm:inline">Salir</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">

        {/* ======================================================== */}
        {/* TAB 1: KANBAN PRODUCTION & ORDER MANAGEMENT SYSTEM (OMS) */}
        {/* ======================================================== */}
        {activeTab === 'kanban' && (
          <div className="space-y-6">
            
            {/* Top Toolbar */}
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800">
              <div className="flex items-center gap-3 w-full lg:w-auto flex-wrap">
                <div className="relative flex-1 sm:w-64">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                  <input
                    type="text"
                    placeholder="Buscar código, cliente o tlf..."
                    value={kanbanSearch}
                    onChange={(e) => setKanbanSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>

                <select
                  value={kanbanProductFilter}
                  onChange={(e) => setKanbanProductFilter(e.target.value)}
                  className="bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-neutral-300 focus:outline-none"
                >
                  <option value="todos">Todos los Productos</option>
                  <option value="franelas">Solo Franelas</option>
                  <option value="tote-bags">Solo Tote Bags</option>
                  <option value="laminas">Solo Láminas</option>
                  <option value="stickers">Solo Stickers</option>
                </select>
              </div>

              {/* Action Buttons: Cierre de Caja, Nuevo Pedido Manual, Configurar, Exportar */}
              <div className="flex items-center gap-2 w-full lg:w-auto justify-end flex-wrap">
                <button
                  onClick={() => setIsManualOrderModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black text-xs font-black uppercase tracking-wider rounded-lg transition-all shadow-md cursor-pointer"
                  title="Registrar pedidos anteriores a la web o recibidos por WhatsApp/Instagram"
                >
                  <Plus size={14} />
                  <span>+ Pedido Manual</span>
                </button>

                <button
                  onClick={() => setIsCashCloseModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-neutral-900 border border-neutral-700 hover:border-amber-400 text-xs font-bold uppercase tracking-wider rounded-lg text-amber-300 transition-colors shadow-sm cursor-pointer"
                  title="Cierre de caja del día con totales en USD y Bs. y arqueo detallado"
                >
                  <Receipt size={14} />
                  <span>Cierre de Caja del Día</span>
                </button>

                <button
                  onClick={() => setIsColumnModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-neutral-950 border border-neutral-700 hover:border-neutral-500 text-xs font-bold uppercase tracking-wider rounded-lg text-neutral-200 transition-colors"
                >
                  <Sliders size={13} />
                  <span className="hidden sm:inline">Etapas</span>
                </button>

                <button
                  onClick={handleSyncOrdersToSheets}
                  disabled={isSyncingSheets}
                  className="flex items-center gap-1.5 px-3 py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors shadow-md disabled:opacity-50"
                >
                  <FileSpreadsheet size={14} />
                  <span>{isSyncingSheets ? 'Exportando...' : 'Google Sheets'}</span>
                </button>
              </div>
            </div>

            {/* KANBAN BOARD COLUMNS */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto pb-4">
              {kanbanColumns.map((col, colIdx) => {
                const columnOrders = filteredOrders.filter((o) => o.productionStage === col.id);

                return (
                  <div
                    key={col.id}
                    className="flex flex-col rounded-2xl bg-neutral-900/40 border border-neutral-800 min-h-[500px]"
                  >
                    {/* Column Header */}
                    <div className="p-3.5 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/80 rounded-t-2xl">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: col.color }}
                        ></span>
                        <h3 className="text-xs font-bold text-white uppercase tracking-tight truncate max-w-[130px]">
                          {col.title}
                        </h3>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-neutral-800 text-[10px] font-mono font-bold text-neutral-400">
                        {columnOrders.length}
                      </span>
                    </div>

                    {/* Column Cards Drop Area */}
                    <div className="p-3 flex-1 space-y-3 overflow-y-auto max-h-[640px]">
                      {columnOrders.map((ord) => (
                        <div
                          key={ord.orderCode}
                          className={`p-3.5 rounded-xl border transition-all shadow-md space-y-2.5 relative group ${
                            ord.status === 'entregado'
                              ? 'bg-neutral-950/90 border-emerald-900/60'
                              : ord.status === 'cancelado'
                              ? 'bg-neutral-950/90 border-red-900/60 opacity-60'
                              : 'bg-neutral-950 border-neutral-800 hover:border-amber-500/50'
                          }`}
                        >
                          {/* Card Top: Code, Badges & Date */}
                          <div className="flex items-start justify-between gap-1 text-[11px] font-mono">
                            <div>
                              <span className="font-black text-amber-400 tracking-wider block">
                                {ord.orderCode}
                              </span>
                              <div className="flex items-center gap-1 mt-1 flex-wrap">
                                {ord.status === 'entregado' && (
                                  <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-0.5">
                                    <CheckCircle2 size={9} /> Entregado
                                  </span>
                                )}
                                {ord.status === 'cancelado' && (
                                  <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase bg-red-950 text-red-300 border border-red-800 flex items-center gap-0.5">
                                    <Ban size={9} /> Cancelado
                                  </span>
                                )}
                                {ord.isHistorical && (
                                  <span className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase bg-purple-950 text-purple-300 border border-purple-800">
                                    Manual
                                  </span>
                                )}
                              </div>
                            </div>
                            <span className="text-neutral-500 text-[9px] shrink-0">
                              {new Date(ord.createdAt).toLocaleDateString('es-VE')}
                            </span>
                          </div>

                          {/* Customer Name & Phone */}
                          <div>
                            <p className="text-xs font-bold text-white truncate">
                              {ord.customerName}
                            </p>
                            <p className="text-[10px] text-neutral-400 font-mono">
                              {ord.customerPhone}
                            </p>
                          </div>

                          {/* Items summary */}
                          <div className="text-[10px] text-neutral-300 space-y-0.5 line-clamp-2">
                            {ord.items.map((it, idx) => (
                              <div key={idx} className="truncate">
                                • {it.product.name} (x{it.quantity})
                              </div>
                            ))}
                          </div>

                          {/* Agency, Payment Method & Total */}
                          <div className="pt-2 border-t border-neutral-850 flex items-center justify-between text-[11px]">
                            <span className="text-[10px] text-neutral-400 font-mono truncate max-w-[100px]">
                              {ord.paymentMethod === 'binance' ? 'Binance USDT' : (ord.paymentMethod === 'pago_movil' || ord.paymentMethod === 'transferencia') ? 'Bco. Tesoro' : 'Efectivo'}
                            </span>
                            <span className="font-black text-white font-mono">
                              ${ord.totalUSD.toFixed(2)}
                            </span>
                          </div>

                          {/* Payment status badge toggle & Quick Deliver */}
                          <div className="flex items-center justify-between pt-1 gap-1">
                            <button
                              onClick={() =>
                                updateOrderPaymentStatus(
                                  ord.orderCode,
                                  ord.paymentStatus === 'Verificado' ? 'Pendiente' : 'Verificado'
                                )
                              }
                              className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold uppercase transition-colors shrink-0 ${
                                ord.paymentStatus === 'Verificado'
                                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                  : 'bg-amber-950 text-amber-300 border border-amber-800'
                              }`}
                            >
                              Pago: {ord.paymentStatus}
                            </button>

                            {ord.status !== 'entregado' && ord.status !== 'cancelado' && (
                              <button
                                onClick={() => markOrderDelivered(ord.orderCode)}
                                className="px-2 py-0.5 rounded bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 text-[9px] font-bold uppercase transition-colors flex items-center gap-1 cursor-pointer"
                                title="Marcar producto como entregado al cliente"
                              >
                                <CheckCircle2 size={10} />
                                <span>Entregar</span>
                              </button>
                            )}
                          </div>

                          {/* Card Footer: Detail Modal Opener & Stage Arrow Controls */}
                          <div className="pt-1.5 border-t border-neutral-900 flex items-center justify-between">
                            <button
                              onClick={() => {
                                setSelectedDetailOrder(ord);
                                setIsDetailModalOpen(true);
                              }}
                              className="text-[10px] text-amber-400 hover:text-amber-300 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <span>Ver / Modificar</span>
                              <ArrowRight size={10} />
                            </button>

                            <div className="flex items-center gap-1">
                              {colIdx > 0 && (
                                <button
                                  onClick={() =>
                                    updateOrderStatus(ord.orderCode, kanbanColumns[colIdx - 1].id)
                                  }
                                  className="p-1 rounded bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white"
                                  title="Mover a etapa anterior"
                                >
                                  <ArrowLeft size={11} />
                                </button>
                              )}
                              {colIdx < kanbanColumns.length - 1 && (
                                <button
                                  onClick={() =>
                                    updateOrderStatus(ord.orderCode, kanbanColumns[colIdx + 1].id)
                                  }
                                  className="p-1 rounded bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white"
                                  title="Avanzar etapa"
                                >
                                  <ArrowRight size={11} />
                                </button>
                              )}
                            </div>
                          </div>

                        </div>
                      ))}

                      {columnOrders.length === 0 && (
                        <div className="py-8 text-center text-[11px] text-neutral-600 font-mono">
                          Sin pedidos aquí
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: PRODUCT & INVENTORY MANAGEMENT (CRUD)             */}
        {/* ======================================================== */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black uppercase tracking-tight font-brand-heading">
                  Catálogo Global de Productos
                </h2>
                <p className="text-xs text-neutral-400">
                  Edición de precios base, deltas oversize, stock y versículos unificados.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveTab('artworks')}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-neutral-900 border border-neutral-700 hover:border-amber-400 text-neutral-200 text-xs font-bold uppercase rounded-lg transition-colors cursor-pointer"
                  title="Abrir Colección Asset Library"
                >
                  <ImageIcon size={14} className="text-amber-400" />
                  <span>Asset Library ({artworkDesigns.length})</span>
                </button>

                <button
                  onClick={handleSyncInventoryToSheets}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-neutral-900 border border-neutral-700 hover:border-neutral-500 text-neutral-200 text-xs font-bold uppercase rounded-lg"
                >
                  <FileSpreadsheet size={14} className="text-emerald-400" />
                  <span>Exportar Catálogo a Sheets</span>
                </button>

                <button
                  onClick={() => {
                    setEditingProduct(null);
                    setIsProductModalOpen(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black text-xs font-extrabold uppercase rounded-lg shadow-lg active:scale-95"
                >
                  <Plus size={16} />
                  <span>Nuevo Producto</span>
                </button>
              </div>
            </div>

            {/* Catalog Table */}
            <div className="overflow-x-auto rounded-2xl bg-neutral-900/40 border border-neutral-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-900/80 text-[10px] uppercase font-mono text-neutral-400 border-b border-neutral-800">
                  <tr>
                    <th className="py-3 px-4">Producto</th>
                    <th className="py-3 px-4">Categoría / Colección</th>
                    <th className="py-3 px-4">Precio Base</th>
                    <th className="py-3 px-4">Precio Oferta</th>
                    <th className="py-3 px-4">Delta Oversize</th>
                    <th className="py-3 px-4">Stock</th>
                    <th className="py-3 px-4">Versículo Bíblico</th>
                    <th className="py-3 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-850">
                  {products.map((prod) => (
                    <tr key={prod.id} className="hover:bg-neutral-900/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={prod.images[0]}
                            alt=""
                            className="w-10 h-10 object-cover rounded-lg bg-black border border-neutral-800 shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <span className="font-bold text-white block">{prod.name}</span>
                            <span className="text-[10px] text-neutral-500 font-mono">{prod.id}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 text-[10px] font-mono mr-1">
                          {prod.category}
                        </span>
                        <span className="text-[11px] text-amber-400">{prod.collection}</span>
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-white">
                        ${prod.basePrice.toFixed(2)}
                      </td>

                      <td className="py-3 px-4 font-mono">
                        {prod.discountPrice ? (
                          <span className="text-amber-400 font-bold">${prod.discountPrice.toFixed(2)}</span>
                        ) : (
                          <span className="text-neutral-500">—</span>
                        )}
                      </td>

                      <td className="py-3 px-4 font-mono text-neutral-300">
                        {prod.category === 'franelas' ? `+$${prod.oversizePriceDelta}` : '—'}
                      </td>

                      <td className="py-3 px-4 font-mono">
                        <span className={`px-2 py-0.5 rounded text-[10px] ${
                          prod.stock > 10 ? 'bg-emerald-950 text-emerald-300' : 'bg-red-950 text-red-300'
                        }`}>
                          {prod.stock} un.
                        </span>
                      </td>

                      <td className="py-3 px-4 text-[11px] text-neutral-400 truncate max-w-xs">
                        {prod.scripture.split('—')[0]}
                      </td>

                      <td className="py-3 px-4 text-right space-x-1">
                        <button
                          onClick={() => {
                            setEditingProduct(prod);
                            setIsProductModalOpen(true);
                          }}
                          className="p-1.5 rounded hover:bg-neutral-800 text-neutral-300 hover:text-white"
                          title="Editar producto"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`¿Eliminar producto "${prod.name}"?`)) {
                              deleteProduct(prod.id);
                            }
                          }}
                          className="p-1.5 rounded hover:bg-red-950 text-neutral-400 hover:text-red-400"
                          title="Eliminar producto"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* ======================================================== */}
        {/* TAB: COLECCIÓN ASSET LIBRARY (ARTWORKS & SUPPORTS)       */}
        {/* ======================================================== */}
        {activeTab === 'artworks' && (
          <div className="space-y-6">
            <CollectionAssetLibrary />
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB: TESORERÍA, CUENTAS & FLUJO DE CAJA                  */}
        {/* ======================================================== */}
        {activeTab === 'treasury' && (
          <div className="space-y-6">
            <TreasuryManager />
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB: CUSTOM LAB MOCKUPS & MOTOR DE PRECIOS AUTOMÁTICO    */}
        {/* ======================================================== */}
        {activeTab === 'custom_lab' && (
          <div className="space-y-6">
            <CustomLabAdminConfig />
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB: MARCA, LOGOS OFICIALES, FUENTES & CÍRCULOS          */}
        {/* ======================================================== */}
        {activeTab === 'brand' && (
          <div className="space-y-8">
            
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400 font-mono">
                Brand Identity & Typography Hub
              </span>
              <h2 className="text-xl font-black uppercase tracking-tight font-brand-heading">
                Identidad de Marca, Logos & Fuentes Tipográficas
              </h2>
              <p className="text-xs text-neutral-400">
                Sube los archivos originales de tus logotipos (fondos oscuros, claros y transparentes), administra el favicon/app icon, paleta urbana (#0D253A) y tipografías oficiales.
              </p>
            </div>

            {/* Integrated Brand Asset Manager (Official original logos & App Icon) */}
            <BrandAssetManager />

            {/* Colors Grid */}
            <div className="p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 font-mono block">
                Paleta de Colores Oficial de Marca
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[11px] text-neutral-400 block mb-1">
                    Color Primario (Deep Navy Street Blue):
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={brandConfig.primaryColor}
                      onChange={(e) => updateBrandConfig({ primaryColor: e.target.value })}
                      className="w-10 h-10 rounded border border-neutral-700 bg-transparent cursor-pointer"
                    />
                    <input
                      type="text"
                      value={brandConfig.primaryColor}
                      onChange={(e) => updateBrandConfig({ primaryColor: e.target.value })}
                      className="p-2 rounded bg-neutral-950 border border-neutral-800 text-xs font-mono text-white flex-1"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-neutral-400 block mb-1">
                    Color Secundario (Pitch Black):
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={brandConfig.secondaryColor}
                      onChange={(e) => updateBrandConfig({ secondaryColor: e.target.value })}
                      className="w-10 h-10 rounded border border-neutral-700 bg-transparent cursor-pointer"
                    />
                    <input
                      type="text"
                      value={brandConfig.secondaryColor}
                      onChange={(e) => updateBrandConfig({ secondaryColor: e.target.value })}
                      className="p-2 rounded bg-neutral-950 border border-neutral-800 text-xs font-mono text-white flex-1"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-neutral-400 block mb-1">
                    Color Acento (Concrete / Urban Sand):
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={brandConfig.accentColor}
                      onChange={(e) => updateBrandConfig({ accentColor: e.target.value })}
                      className="w-10 h-10 rounded border border-neutral-700 bg-transparent cursor-pointer"
                    />
                    <input
                      type="text"
                      value={brandConfig.accentColor}
                      onChange={(e) => updateBrandConfig({ accentColor: e.target.value })}
                      className="p-2 rounded bg-neutral-950 border border-neutral-800 text-xs font-mono text-white flex-1"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={resetBrandDefaults}
                className="text-xs text-neutral-400 hover:text-white underline cursor-pointer"
              >
                Restablecer colores por defecto (#0D253A, #000000, #C8C3B3)
              </button>
            </div>

            {/* Multi-Font Typography Manager Component */}
            <MultiFontManager />

            {/* Circle Manager: Add/Edit/Delete circular category icons */}
            <div className="p-6 rounded-2xl bg-neutral-900/40 border border-neutral-800 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white uppercase tracking-tight font-brand-heading">
                    Gestor de Círculos (Home & Catálogo)
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Control de iconos circulares de colecciones y categorías.
                  </p>
                </div>
              </div>

              {/* Add Circle Form */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-neutral-950 border border-neutral-800">
                <input
                  type="text"
                  placeholder="Título (ej. BeneCristiana)"
                  value={newCircleTitle}
                  onChange={(e) => setNewCircleTitle(e.target.value)}
                  className="p-2 rounded bg-neutral-900 border border-neutral-800 text-xs text-white"
                />
                <input
                  type="text"
                  placeholder="URL Imagen o /src/assets/..."
                  value={newCircleImage}
                  onChange={(e) => setNewCircleImage(e.target.value)}
                  className="p-2 rounded bg-neutral-900 border border-neutral-800 text-xs text-white"
                />
                <input
                  type="text"
                  placeholder="Valor de Filtro (ej. BeneCristiana)"
                  value={newCircleValue}
                  onChange={(e) => setNewCircleValue(e.target.value)}
                  className="p-2 rounded bg-neutral-900 border border-neutral-800 text-xs text-white"
                />
                <button
                  onClick={() => {
                    if (!newCircleTitle || !newCircleValue) return;
                    addCategoryCircle({
                      id: `circle-${Date.now()}`,
                      title: newCircleTitle,
                      image: newCircleImage || '/src/assets/images/franela_oversize_1791054727426.jpg',
                      type: newCircleType,
                      value: newCircleValue,
                    });
                    setNewCircleTitle('');
                    setNewCircleImage('');
                    setNewCircleValue('');
                  }}
                  className="py-2 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold uppercase rounded"
                >
                  + Agregar Círculo
                </button>
              </div>

              {/* Existing Circles list */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
                {collectionCircles.map((circle) => (
                  <div
                    key={circle.id}
                    className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 flex flex-col items-center text-center relative group"
                  >
                    <div className="w-14 h-14 rounded-full overflow-hidden border border-neutral-700 mb-2">
                      <img src={circle.image} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <span className="text-xs font-bold text-white truncate max-w-full">
                      {circle.title}
                    </span>
                    <span className="text-[10px] text-neutral-500 font-mono truncate max-w-full">
                      {circle.value}
                    </span>
                    <button
                      onClick={() => deleteCategoryCircle(circle.id)}
                      className="absolute top-2 right-2 p-1 text-neutral-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>

            </div>

          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: GOOGLE SHEETS INTEGRATION PANEL                   */}
        {/* ======================================================== */}
        {activeTab === 'sheets' && (
          <div className="space-y-6">
            
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400 font-mono">
                Google Workspace Integration
              </span>
              <h2 className="text-2xl font-black uppercase tracking-tight font-brand-heading">
                Sincronización con Google Sheets
              </h2>
              <p className="text-xs text-neutral-400 mt-1 max-w-2xl">
                Conecta tu cuenta de Google para exportar pedidos, crear hojas de control de producción para el taller y sincronizar el inventario en tiempo real.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-6 max-w-3xl">
              
              {/* Google Sign In status */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
                <div>
                  <h3 className="text-sm font-bold text-white">Estado de Conexión Google</h3>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Se utiliza Firebase Auth y token OAuth con permiso <code className="text-amber-300 font-mono">spreadsheets</code>.
                  </p>
                </div>

                <GoogleSignInButton
                  onClick={handleGoogleAuth}
                  label={isGoogleSignedIn ? 'Google Conectado' : 'Conectar Google Sheets'}
                />
              </div>

              {/* Sync Actions */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-neutral-950 border border-neutral-800">
                  <div>
                    <span className="text-xs font-bold text-white block">
                      Exportar Todos los Pedidos ({orders.length} pedidos)
                    </span>
                    <span className="text-[11px] text-neutral-400">
                      Crea o actualiza una hoja titulada "Control de Producción y Envíos" con teléfonos, montos y etapas.
                    </span>
                  </div>
                  <button
                    onClick={handleSyncOrdersToSheets}
                    disabled={isSyncingSheets}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase rounded-lg transition-colors shrink-0 disabled:opacity-50 cursor-pointer"
                  >
                    {isSyncingSheets ? 'Exportando...' : 'Exportar Pedidos'}
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-neutral-950 border border-neutral-800">
                  <div>
                    <span className="text-xs font-bold text-white block">
                      Exportar Catálogo e Inventario ({products.length} productos)
                    </span>
                    <span className="text-[11px] text-neutral-400">
                      Genera hoja de cálculo con referencias bíblicas, precios base, deltas y stock.
                    </span>
                  </div>
                  <button
                    onClick={handleSyncInventoryToSheets}
                    disabled={isSyncingSheets}
                    className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold uppercase rounded-lg transition-colors shrink-0 disabled:opacity-50 cursor-pointer"
                  >
                    Exportar Inventario
                  </button>
                </div>
              </div>

              {/* Status and Direct Link */}
              {googleSheetsUrl && (
                <div className="p-4 rounded-xl bg-[#0D253A]/50 border border-neutral-700 space-y-2">
                  <span className="text-[10px] text-amber-400 font-mono uppercase font-bold block">
                    Última Hoja Generada:
                  </span>
                  <a
                    href={googleSheetsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs font-bold text-emerald-400 hover:underline"
                  >
                    <span>Abrir Hoja de Cálculo en Google Sheets</span>
                    <ExternalLink size={14} />
                  </a>
                  {lastSyncedTimestamp && (
                    <span className="text-[10px] text-neutral-400 block font-mono">
                      Última sincronización: {lastSyncedTimestamp}
                    </span>
                  )}
                </div>
              )}

              {sheetsSuccessMessage && (
                <div className="p-3 rounded-lg bg-emerald-950/70 border border-emerald-800 text-xs text-emerald-300 font-semibold flex items-center gap-2">
                  <Check size={16} />
                  <span>{sheetsSuccessMessage}</span>
                </div>
              )}

              {sheetsError && (
                <div className="p-3 rounded-lg bg-red-950/70 border border-red-800 text-xs text-red-300">
                  {sheetsError}
                </div>
              )}

            </div>

          </div>
        )}

      </div>

      {/* MODAL: ADD / EDIT PRODUCT */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-xl bg-neutral-950 border border-neutral-800 rounded-2xl shadow-2xl p-6 sm:p-8 my-auto">
            <button
              onClick={() => setIsProductModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white"
            >
              <X size={18} />
            </button>

            <h3 className="text-xl font-black uppercase text-white font-brand-heading mb-4">
              {editingProduct ? 'Editar Producto' : 'Nuevo Producto ÉXODO'}
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div>
                <label className="text-neutral-300 block mb-1 font-bold">Nombre del Producto *</label>
                <input
                  name="name"
                  type="text"
                  required
                  defaultValue={editingProduct?.name || ''}
                  placeholder="Ej. Franela 'El León de Judá' 240g"
                  className="w-full p-2.5 rounded bg-neutral-900 border border-neutral-800 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-300 block mb-1 font-bold">Categoría *</label>
                  <select
                    name="category"
                    defaultValue={editingProduct?.category || 'franelas'}
                    className="w-full p-2.5 rounded bg-neutral-900 border border-neutral-800 text-white"
                  >
                    <option value="franelas">Franelas</option>
                    <option value="tote-bags">Tote Bags</option>
                    <option value="laminas">Láminas Metálicas</option>
                    <option value="stickers">Stickers & UV</option>
                  </select>
                </div>

                <div>
                  <label className="text-neutral-300 block mb-1 font-bold">Colección *</label>
                  <select
                    name="collection"
                    defaultValue={editingProduct?.collection || 'BeneCristiana'}
                    className="w-full p-2.5 rounded bg-neutral-900 border border-neutral-800 text-white"
                  >
                    <option value="BeneCristiana">BeneCristiana</option>
                    <option value="El Museo">El Museo</option>
                    <option value="El Ángel Caído">El Ángel Caído</option>
                    <option value="Anime">Anime</option>
                    <option value="Música">Música</option>
                    <option value="Venezuela">Venezuela</option>
                    <option value="Básicos con Propósito">Básicos con Propósito</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-neutral-300 block mb-1 font-bold">Precio Base ($) *</label>
                  <input
                    name="basePrice"
                    type="number"
                    step="0.5"
                    required
                    defaultValue={editingProduct?.basePrice || 25}
                    className="w-full p-2.5 rounded bg-neutral-900 border border-neutral-800 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-neutral-300 block mb-1 font-bold">Precio Oferta ($)</label>
                  <input
                    name="discountPrice"
                    type="number"
                    step="0.5"
                    defaultValue={editingProduct?.discountPrice || ''}
                    placeholder="Opcional"
                    className="w-full p-2.5 rounded bg-neutral-900 border border-neutral-800 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-neutral-300 block mb-1 font-bold">Delta Oversize ($)</label>
                  <input
                    name="oversizePriceDelta"
                    type="number"
                    step="0.5"
                    defaultValue={editingProduct?.oversizePriceDelta ?? 4}
                    className="w-full p-2.5 rounded bg-neutral-900 border border-neutral-800 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-neutral-300 block mb-1 font-bold">Versículo Bíblico de Referencia *</label>
                <input
                  name="scripture"
                  type="text"
                  required
                  defaultValue={editingProduct?.scripture || 'Romanos 8:37 — Más que vencedores por medio de aquel que nos amó.'}
                  className="w-full p-2.5 rounded bg-neutral-900 border border-neutral-800 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-neutral-300 block mb-1 font-bold">Descripción Unificada (Texto Completo) *</label>
                <textarea
                  name="unifiedDescription"
                  rows={3}
                  required
                  defaultValue={editingProduct?.unifiedDescription || 'Pieza con propósito espiritual confeccionada en 100% algodón pesado de 240g con DTF textil.'}
                  className="w-full p-2.5 rounded bg-neutral-900 border border-neutral-800 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-300 block mb-1 font-bold">Stock Inicial</label>
                  <input
                    name="stock"
                    type="number"
                    defaultValue={editingProduct?.stock || 30}
                    className="w-full p-2.5 rounded bg-neutral-900 border border-neutral-800 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-neutral-300 block mb-1 font-bold">URL Imagen Principal</label>
                  <input
                    name="imageUrl"
                    type="text"
                    defaultValue={editingProduct?.images[0] || '/src/assets/images/franela_oversize_1791054727426.jpg'}
                    className="w-full p-2.5 rounded bg-neutral-900 border border-neutral-800 text-white text-[11px]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-extrabold uppercase rounded-lg text-xs"
              >
                Guardar Producto
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: KANBAN COLUMN CONFIGURATOR */}
      {isColumnModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-neutral-950 border border-neutral-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <button
              onClick={() => setIsColumnModalOpen(false)}
              className="absolute top-4 right-4 p-1 text-neutral-400 hover:text-white"
            >
              <X size={16} />
            </button>

            <h3 className="text-base font-bold text-white uppercase font-brand-heading">
              Configurador de Etapas Kanban
            </h3>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {kanbanColumns.map((col, idx) => (
                <div key={col.id} className="flex items-center justify-between p-2.5 rounded bg-neutral-900 border border-neutral-800 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: col.color }}></span>
                    <span className="font-bold text-white">{col.title}</span>
                  </div>
                  {kanbanColumns.length > 2 && (
                    <button
                      onClick={() => deleteKanbanColumn(col.id)}
                      className="text-neutral-500 hover:text-red-400 p-1"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-neutral-800 space-y-3">
              <span className="text-xs font-bold text-neutral-300 block">Agregar Nueva Etapa:</span>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Nombre de la etapa..."
                  value={newColumnTitle}
                  onChange={(e) => setNewColumnTitle(e.target.value)}
                  className="flex-1 p-2 rounded bg-neutral-900 border border-neutral-800 text-xs text-white"
                />
                <input
                  type="color"
                  value={newColumnColor}
                  onChange={(e) => setNewColumnColor(e.target.value)}
                  className="w-9 h-9 rounded border border-neutral-700 bg-transparent cursor-pointer"
                />
              </div>
              <button
                onClick={() => {
                  if (!newColumnTitle.trim()) return;
                  addKanbanColumn({
                    id: `col-${Date.now()}`,
                    title: newColumnTitle.trim(),
                    color: newColumnColor,
                    order: kanbanColumns.length,
                  });
                  setNewColumnTitle('');
                }}
                className="w-full py-2 bg-[#0D253A] text-white rounded text-xs font-bold uppercase"
              >
                + Añadir Etapa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: DAILY CASH CLOSE */}
      <CashCloseModal
        isOpen={isCashCloseModalOpen}
        onClose={() => setIsCashCloseModalOpen(false)}
      />

      {/* MODAL: MANUAL / HISTORICAL ORDER CREATION */}
      <ManualOrderModal
        isOpen={isManualOrderModalOpen}
        onClose={() => setIsManualOrderModalOpen(false)}
      />

      {/* MODAL: ORDER DETAIL, EDIT & CANCEL */}
      {selectedDetailOrder && (
        <OrderDetailModal
          order={selectedDetailOrder}
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedDetailOrder(null);
          }}
          kanbanColumns={kanbanColumns}
        />
      )}

    </div>
  );
};
