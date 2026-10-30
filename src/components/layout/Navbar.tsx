import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Search, 
  User, 
  Menu, 
  X, 
  ShieldCheck, 
  Sparkles, 
  Truck, 
  Tag, 
  BookOpen, 
  SlidersHorizontal 
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { ProductCategory } from '../../types';
import { ExodoEmblemLogo, ExodoWordmarkLogo, ExodoSwordLogo, ExodoBadgeLogo } from '../common/ExodoLogos';
import { PWAInstallButton } from '../common/PWAInstallButton';

export const Navbar: React.FC = () => {
  const {
    currentPage,
    setCurrentPage,
    setSelectedCategory,
    setSelectedCollection,
    cart,
    setIsCartOpen,
    searchQuery,
    setSearchQuery,
    currentUser,
    setIsAuthModalOpen,
    setIsTrackingModalOpen,
    isAdminAuthenticated,
    setIsAdminLoginModalOpen,
    brandConfig,
  } = useStore();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  const handleNavClick = (page: string, category?: ProductCategory | 'todas', collection?: string | null) => {
    setCurrentPage(page);
    if (category !== undefined) setSelectedCategory(category);
    if (collection !== undefined) setSelectedCollection(collection);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navLinks = [
    { id: 'inicio', label: 'Inicio', icon: null },
    { id: 'tienda', label: 'Tienda / Colecciones', icon: null },
    { id: 'personalizador', label: 'Personaliza Tu Fe (Lab)', icon: Sparkles },
    { id: 'palabra', label: 'La Palabra (Devocionales)', icon: BookOpen },
    { id: 'descuentos', label: 'Piezas con Descuento', icon: Tag },
    { id: 'nosotros', label: 'Nosotros', icon: null },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#000000]/95 backdrop-blur-md border-b border-neutral-800">
      {/* Top Banner ticker */}
      <div className="bg-[#0D253A] text-[#C8C3B3] text-[11px] font-medium tracking-widest py-1.5 px-4 text-center border-b border-neutral-800/80 flex items-center justify-center gap-2 overflow-hidden">
        <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
        <span className="uppercase">ENVIOS A TODA VENEZUELA • MRW, ZOOM, TEALCA Y DELIVERY CARACAS EN 3 DÍAS</span>
        <span className="hidden md:inline">• 100% ALGODÓN PESADO & DTF TEXTIL</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          
          {/* Mobile Menu Button */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md text-[#C8C3B3] hover:text-white hover:bg-neutral-900 transition-colors"
              aria-label="Abrir Menú"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Brand Logo - Supports Custom Uploaded, Emblem, Wordmark, Sword, and Badge */}
          <div className="flex items-center">
            <button
              onClick={() => handleNavClick('inicio')}
              className="flex items-center gap-2.5 text-left group"
            >
              {brandConfig.activeLogoVersion === 'custom_uploaded' && (brandConfig.logoAssets?.logoWhite || brandConfig.logoAssets?.logoTransparent || brandConfig.logoAssets?.logoBlack) ? (
                <div className="flex items-center gap-2.5">
                  <img
                    src={
                      brandConfig.activeLogoColorVariant === 'transparent'
                        ? (brandConfig.logoAssets?.logoTransparent || brandConfig.logoAssets?.logoWhite || brandConfig.logoAssets?.logoBlack || '')
                        : brandConfig.activeLogoColorVariant === 'black'
                        ? (brandConfig.logoAssets?.logoBlack || brandConfig.logoAssets?.logoWhite || '')
                        : (brandConfig.logoAssets?.logoWhite || brandConfig.logoAssets?.logoTransparent || brandConfig.logoAssets?.logoBlack || '')
                    }
                    alt="ÉXODO Logo Oficial"
                    className="h-9 sm:h-11 w-auto max-w-[190px] object-contain drop-shadow transition-all"
                  />
                  <span className="text-[9px] uppercase tracking-widest text-neutral-400 font-mono hidden sm:inline">
                    Caracas • Est. 2024
                  </span>
                </div>
              ) : brandConfig.activeLogoVersion === 'wordmark' ? (
                <div className="flex flex-col">
                  <ExodoWordmarkLogo color="#C8C3B3" className="h-8 sm:h-9 w-auto text-[#C8C3B3] group-hover:text-white transition-colors" />
                  <span className="text-[9px] uppercase tracking-widest text-neutral-400 font-mono">
                    Caracas • Est. 2024
                  </span>
                </div>
              ) : brandConfig.activeLogoVersion === 'sword' ? (
                <div className="flex flex-col">
                  <ExodoSwordLogo color="#C8C3B3" className="h-8 sm:h-10 w-auto text-[#C8C3B3] group-hover:text-white transition-colors" />
                  <span className="text-[9px] uppercase tracking-widest text-neutral-400 font-mono -mt-1">
                    Dios Fuera del Templo • Caracas
                  </span>
                </div>
              ) : brandConfig.activeLogoVersion === 'badge' ? (
                <div className="flex items-center gap-2">
                  <ExodoBadgeLogo color="#C8C3B3" className="w-9 h-9 sm:w-11 sm:h-11 text-[#C8C3B3] group-hover:text-white transition-colors" />
                  <div className="flex flex-col">
                    <span className="text-xl sm:text-2xl font-black tracking-tight text-[#C8C3B3] group-hover:text-white font-brand-heading leading-none">
                      ΣXODO
                    </span>
                    <span className="text-[9px] uppercase tracking-widest text-neutral-400 font-mono">
                      Caracas • Est. 2024
                    </span>
                  </div>
                </div>
              ) : (
                <>
                  {/* Official Emblem Logo (Σ with wings) */}
                  <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <ExodoEmblemLogo color="#C8C3B3" className="w-full h-full text-[#C8C3B3] group-hover:text-white transition-colors" />
                  </div>

                  {/* Official Typography Wordmark */}
                  <div className="flex flex-col">
                    <span className="text-2xl sm:text-3xl font-black tracking-tight text-[#C8C3B3] group-hover:text-white transition-colors font-brand-heading leading-none">
                      ΣXODO
                    </span>
                    <span className="text-[9px] uppercase tracking-widest text-neutral-400 font-mono -mt-0.5">
                      Caracas • Est. 2024
                    </span>
                  </div>
                </>
              )}
            </button>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = currentPage === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => {
                    if (link.id === 'descuentos') {
                      handleNavClick('tienda', 'todas');
                      // Filter handled in store
                    } else {
                      handleNavClick(link.id);
                    }
                  }}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-[#0D253A] text-white border border-neutral-700'
                      : 'text-neutral-300 hover:text-white hover:bg-neutral-900'
                  }`}
                >
                  {Icon && <Icon size={14} className="text-amber-400" />}
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            
            {/* Search Input on Desktop */}
            <div className="relative hidden md:block w-44 xl:w-56">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input
                type="text"
                placeholder="Buscar versículo o prenda..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (currentPage !== 'tienda') setCurrentPage('tienda');
                }}
                className="w-full pl-9 pr-3 py-1.5 bg-neutral-900/90 border border-neutral-800 rounded-lg text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-[#C8C3B3] transition-colors"
              />
            </div>

            {/* Search Toggle Mobile */}
            <button
              onClick={() => setIsSearchVisible(!isSearchVisible)}
              className="p-2 text-neutral-300 hover:text-white md:hidden"
              aria-label="Buscar"
            >
              <Search size={20} />
            </button>

            {/* Order Tracking button */}
            <button
              onClick={() => setIsTrackingModalOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-neutral-900/80 border border-neutral-800 text-neutral-300 hover:text-white text-xs font-medium transition-colors"
              title="Rastrear mi pedido con código"
            >
              <Truck size={14} className="text-amber-400" />
              <span className="hidden xl:inline">Rastrear</span>
            </button>

            {/* PWA Install Button (Chrome / Android / iOS) */}
            <PWAInstallButton variant="compact" />

            {/* User Account */}
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="p-2 text-neutral-300 hover:text-white hover:bg-neutral-900 rounded-lg transition-colors relative"
              title={currentUser ? `Cuenta: ${currentUser.fullName}` : 'Mi Cuenta'}
            >
              <User size={20} />
              {currentUser && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500"></span>
              )}
            </button>

            {/* Admin Key Lock / Panel Access */}
            <button
              onClick={() => {
                if (isAdminAuthenticated) {
                  setCurrentPage('admin');
                } else {
                  setIsAdminLoginModalOpen(true);
                }
              }}
              className={`p-2 rounded-lg transition-all ${
                isAdminAuthenticated
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
              }`}
              title={isAdminAuthenticated ? 'Panel Administrador Activo' : 'Acceso Backoffice (Clave 2412)'}
            >
              <ShieldCheck size={20} />
            </button>

            {/* Shopping Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="p-2 text-neutral-200 hover:text-white hover:bg-neutral-900 rounded-lg transition-colors relative"
              aria-label="Carrito de compras"
            >
              <ShoppingBag size={21} />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-black text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center animate-in zoom-in-50 duration-150">
                  {cartItemCount}
                </span>
              )}
            </button>

          </div>
        </div>

        {/* Mobile Search Input Drawer */}
        {isSearchVisible && (
          <div className="md:hidden py-2.5 border-t border-neutral-800">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input
                type="text"
                placeholder="Buscar por prenda, versículo, colección..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (currentPage !== 'tienda') setCurrentPage('tienda');
                }}
                className="w-full pl-9 pr-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-[#C8C3B3]"
              />
            </div>
          </div>
        )}
      </div>

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-neutral-950/98 border-b border-neutral-800 px-4 pt-3 pb-6 space-y-2 backdrop-blur-xl animate-in slide-in-from-top-2 duration-200">
          <p className="text-[10px] uppercase font-bold tracking-widest text-neutral-500 px-3 pb-1">
            Menú de Navegación
          </p>

          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = currentPage === link.id;
            return (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-semibold tracking-wider uppercase transition-colors ${
                  isActive
                    ? 'bg-[#0D253A] text-white border border-neutral-700'
                    : 'text-neutral-300 hover:bg-neutral-900 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-2">
                  {Icon && <Icon size={16} className="text-amber-400" />}
                  {link.label}
                </span>
                <span className="text-neutral-600 text-xs">→</span>
              </button>
            );
          })}

          <div className="pt-3 border-t border-neutral-800/80 flex flex-col gap-2">
            <button
              onClick={() => {
                setIsTrackingModalOpen(true);
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-200 text-xs font-semibold uppercase tracking-wider"
            >
              <Truck size={15} className="text-amber-400" />
              Rastrear Pedido con Código
            </button>

            <button
              onClick={() => {
                if (isAdminAuthenticated) {
                  setCurrentPage('admin');
                } else {
                  setIsAdminLoginModalOpen(true);
                }
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-neutral-900/60 border border-neutral-800 text-neutral-400 text-xs font-semibold uppercase tracking-wider"
            >
              <ShieldCheck size={15} />
              {isAdminAuthenticated ? 'Panel Admin ÉXODO' : 'Acceso Administrador (2412)'}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
