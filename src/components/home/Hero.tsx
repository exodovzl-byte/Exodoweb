import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  ArrowRight, 
  Sparkles, 
  Flame, 
  ChevronLeft, 
  ChevronRight, 
  ShoppingBag, 
  Eye, 
  Tag, 
  Instagram, 
  ExternalLink,
  BookOpen,
  Pause,
  Play
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { HeroSlide, Product } from '../../types';
import { INITIAL_HERO_SLIDES, INITIAL_COMMUNITY_POSTS } from '../../data/initialData';

export const Hero: React.FC = () => {
  const { 
    setCurrentPage, 
    setSelectedCategory, 
    heroSlides, 
    carouselConfig,
    products,
    communityPosts,
    socialLinks,
    setActivePdpProduct,
    addToCart,
    exchangeRateBCV
  } = useStore();

  // 1. Filter and organize active slides with primary slide first
  const activeSlides: HeroSlide[] = useMemo(() => {
    const list = (heroSlides && heroSlides.length > 0 ? heroSlides : INITIAL_HERO_SLIDES)
      .filter((s) => s.active !== false);

    if (list.length === 0) return INITIAL_HERO_SLIDES;

    const primaryId = carouselConfig?.primarySlideId;
    if (primaryId) {
      const primaryIdx = list.findIndex((s) => s.id === primaryId || s.isPrimary);
      if (primaryIdx > 0) {
        const primary = list[primaryIdx];
        const rest = list.filter((_, i) => i !== primaryIdx);
        return [primary, ...rest];
      }
    }
    return list;
  }, [heroSlides, carouselConfig?.primarySlideId]);

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  // Auto-play interval
  const intervalSeconds = Math.max(3, carouselConfig?.transitionIntervalSeconds || 5);
  const autoPlayEnabled = carouselConfig?.autoPlay !== false;

  useEffect(() => {
    if (!autoPlayEnabled || isPaused || activeSlides.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeSlides.length);
    }, intervalSeconds * 1000);

    return () => clearInterval(timer);
  }, [autoPlayEnabled, isPaused, activeSlides.length, intervalSeconds]);

  // Handle index bounds safety
  const safeIndex = currentIndex < activeSlides.length ? currentIndex : 0;
  const currentSlide = activeSlides[safeIndex] || activeSlides[0] || INITIAL_HERO_SLIDES[0];

  const handlePrev = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + activeSlides.length) % activeSlides.length);
  };

  const handleNext = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % activeSlides.length);
  };

  // Touch swipe support for mobile devices
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;

    // Minimum swipe threshold
    if (Math.abs(diff) > 45) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    setTouchStartX(null);
  };

  // Quick add helper for featured slide
  const handleQuickAdd = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart({
      cartId: `${product.id}-${Date.now()}`,
      productId: product.id,
      product: product,
      quantity: 1,
      selectedSize: product.availableSizes[0] || 'M',
      fitType: product.category === 'franelas' ? 'Corte Normal' : undefined,
      selectedColor: product.availableColors[0],
      selectedFinish: product.stickerFinishes?.[0],
      unitPrice: product.discountPrice || product.basePrice,
    });
  };

  // Top featured products for slide 2
  const featuredPreviewProducts = useMemo(() => {
    const list = products.filter((p) => p.isFeatured);
    return list.slice(0, 4);
  }, [products]);

  // Community posts for slide 3
  const communityPreviewPosts = useMemo(() => {
    const posts = communityPosts && communityPosts.length > 0 ? communityPosts : INITIAL_COMMUNITY_POSTS;
    return posts.slice(0, 4);
  }, [communityPosts]);

  const instagramUrl = socialLinks?.instagram?.url || 'https://instagram.com/exodo.vzl';

  // Helper to determine contrast text color (black or white)
  const getContrastTextColor = (bgColor?: string, fallback: string = '#000000'): string => {
    if (!bgColor) return fallback;
    const hex = bgColor.replace('#', '').trim();
    if (hex.length === 3) {
      const r = parseInt(hex[0] + hex[0], 16);
      const g = parseInt(hex[1] + hex[1], 16);
      const b = parseInt(hex[2] + hex[2], 16);
      return (r * 299 + g * 587 + b * 114) / 1000 >= 128 ? '#000000' : '#FFFFFF';
    }
    if (hex.length === 6) {
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      return (r * 299 + g * 587 + b * 114) / 1000 >= 128 ? '#000000' : '#FFFFFF';
    }
    return fallback;
  };

  // Helper to navigate to appropriate section or external URL
  const navigateToLink = (link?: string) => {
    if (!link) return;
    if (link.startsWith('http://') || link.startsWith('https://')) {
      window.open(link, '_blank', 'noopener,noreferrer');
      return;
    }
    const cleanLink = link.toLowerCase().trim();
    if (cleanLink === 'tienda' || cleanLink === 'catalogo') {
      setSelectedCategory('todas');
      setCurrentPage('tienda');
    } else if (cleanLink === 'personalizador') {
      setCurrentPage('personalizador');
    } else if (cleanLink === 'palabra' || cleanLink === 'devocionales') {
      setCurrentPage('palabra');
    } else if (cleanLink === 'descuentos') {
      setCurrentPage('descuentos');
    } else if (cleanLink === 'nosotros') {
      setCurrentPage('nosotros');
    } else if (cleanLink === 'inicio') {
      setCurrentPage('inicio');
    } else {
      setSelectedCategory('todas');
      setCurrentPage('tienda');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section 
      className="relative w-full overflow-hidden bg-black text-white select-none group/carousel"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background Media Container */}
      <div className="absolute inset-0 z-0">
        <img
          key={currentSlide.id + '-bg'}
          src={currentSlide.image || '/src/assets/images/hero_streetwear_1791054715974.jpg'}
          alt={currentSlide.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center filter brightness-[0.38] contrast-125 transition-all duration-700 animate-in fade-in zoom-in-105 duration-1000"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = '/src/assets/images/hero_streetwear_1791054715974.jpg';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-[#0D253A]/60"></div>
        {/* Street Texture Grain Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(#C8C3B3_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none"></div>
      </div>

      {/* Main Slide Content Wrapper */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 sm:pt-24 sm:pb-28 flex flex-col justify-end min-h-[580px] sm:min-h-[660px]">
        
        {/* ======================================================== */}
        {/* SLIDE TYPE 1: PORTADA PRINCIPAL / MANIFIESTO              */}
        {/* ======================================================== */}
        {(currentSlide.slideType === 'hero_principal' || (!currentSlide.slideType && safeIndex === 0)) && (
          <div className="animate-in fade-in slide-in-from-bottom-3 duration-500 max-w-4xl">
            {/* Tagline Badge */}
            {currentSlide.tagline && (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-900/90 border border-neutral-700/80 backdrop-blur-md text-[#C8C3B3] text-xs font-semibold uppercase tracking-widest mb-6 w-fit shadow-lg">
                <Flame size={14} className="text-amber-400" />
                <span>{currentSlide.tagline}</span>
              </div>
            )}

            {/* Hero Title */}
            <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black tracking-tight leading-[0.95] text-white uppercase font-brand-heading">
              {(() => {
                const text = currentSlide.title || 'LA PALABRA DE DIOS EN EL ASFALTO Y LA CALLE';
                if (text.includes('\n')) {
                  const lines = text.split('\n');
                  return (
                    <>
                      {lines[0]} <br />
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C8C3B3] via-white to-amber-200">
                        {lines.slice(1).join(' ')}
                      </span>
                    </>
                  );
                }
                if (text.includes('EN ')) {
                  const parts = text.split('EN ');
                  return (
                    <>
                      {parts[0]}EN <br />
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C8C3B3] via-white to-amber-200">
                        {parts.slice(1).join('EN ')}
                      </span>
                    </>
                  );
                }
                return (
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C8C3B3] via-white to-amber-200">
                    {text}
                  </span>
                );
              })()}
            </h1>

            {/* Subtitle / Statement */}
            <p className="mt-4 sm:mt-5 text-xs sm:text-base lg:text-lg text-neutral-300 max-w-2xl font-normal leading-relaxed">
              {currentSlide.subtitle || 'Moda y artículos personalizados con propósito: Diseños urbanos que llevan la Palabra de Dios a todos lados, creados por nosotros o diseñados por ti.'}
            </p>

            {/* Action Buttons */}
            <div className="mt-7 sm:mt-8 flex flex-wrap items-center gap-3 sm:gap-4">
              <button
                onClick={() => navigateToLink(currentSlide.buttonLink || 'tienda')}
                style={{
                  backgroundColor: currentSlide.buttonColor || '#C8C3B3',
                  color: currentSlide.buttonTextColor || getContrastTextColor(currentSlide.buttonColor || '#C8C3B3', '#000000'),
                }}
                className="flex items-center justify-center gap-2.5 px-6 sm:px-8 py-3.5 font-extrabold text-xs sm:text-sm uppercase tracking-wider rounded-xl transition-all shadow-xl hover:opacity-90 active:scale-95 cursor-pointer"
              >
                <span>{currentSlide.buttonText || 'Explorar Colección'}</span>
                <ArrowRight size={17} />
              </button>

              {(currentSlide.secondaryButtonText || currentSlide.secondaryButtonLink) && (
                <button
                  onClick={() => navigateToLink(currentSlide.secondaryButtonLink || 'personalizador')}
                  style={{
                    backgroundColor: currentSlide.secondaryButtonColor || '#0D253A',
                    color: currentSlide.secondaryButtonTextColor || getContrastTextColor(currentSlide.secondaryButtonColor || '#0D253A', '#FFFFFF'),
                  }}
                  className="flex items-center justify-center gap-2 px-5 sm:px-7 py-3.5 border border-neutral-700/80 font-bold text-xs sm:text-sm uppercase tracking-wider rounded-xl transition-all backdrop-blur-md hover:opacity-90 active:scale-95 cursor-pointer"
                >
                  <Sparkles size={16} className="text-amber-400" />
                  <span>{currentSlide.secondaryButtonText || 'Personaliza Tu Fe (Custom Lab)'}</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* SLIDE TYPE 2: PIEZAS DESTACADAS (DROPS & CATÁLOGO)       */}
        {/* ======================================================== */}
        {currentSlide.slideType === 'piezas_destacadas' && (
          <div className="animate-in fade-in slide-in-from-bottom-3 duration-500 w-full">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-[10px] font-mono uppercase tracking-widest mb-2">
                  <Tag size={12} />
                  <span>{currentSlide.tagline || 'Drops & Catálogo ÉXODO'}</span>
                </div>
                <h2 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight font-brand-heading">
                  {currentSlide.title || 'PIEZAS DESTACADAS'}
                </h2>
                <p className="text-xs sm:text-sm text-neutral-300 max-w-xl mt-1">
                  {currentSlide.subtitle || 'Descubre los drops exclusivos de ÉXODO, arte sacro urbano y prendas de autor listas para llevar la Palabra.'}
                </p>
              </div>

              <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
                <button
                  onClick={() => navigateToLink(currentSlide.buttonLink || 'tienda')}
                  style={{
                    backgroundColor: currentSlide.buttonColor || '#FBBF24',
                    color: currentSlide.buttonTextColor || getContrastTextColor(currentSlide.buttonColor || '#FBBF24', '#000000'),
                  }}
                  className="px-4 py-2 font-extrabold text-xs uppercase tracking-wider rounded-lg transition-all flex items-center gap-1.5 shadow-lg hover:opacity-90 active:scale-95 cursor-pointer"
                >
                  <span>{currentSlide.buttonText || 'Ver Todo el Catálogo'}</span>
                  <ArrowRight size={14} />
                </button>
                {currentSlide.secondaryButtonText && (
                  <button
                    onClick={() => navigateToLink(currentSlide.secondaryButtonLink || 'descuentos')}
                    style={{
                      backgroundColor: currentSlide.secondaryButtonColor || '#171717',
                      color: currentSlide.secondaryButtonTextColor || getContrastTextColor(currentSlide.secondaryButtonColor || '#171717', '#FFFFFF'),
                    }}
                    className="px-3.5 py-2 border border-neutral-700 text-xs font-bold uppercase tracking-wider rounded-lg transition-all hover:opacity-90 cursor-pointer"
                  >
                    {currentSlide.secondaryButtonText}
                  </button>
                )}
              </div>
            </div>

            {/* Embedded Featured Products Grid Showcase */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-2">
              {featuredPreviewProducts.map((prod) => {
                const hasDiscount = prod.discountPrice && prod.discountPrice < prod.basePrice;
                const price = hasDiscount ? prod.discountPrice : prod.basePrice;
                return (
                  <div
                    key={prod.id}
                    onClick={() => setActivePdpProduct(prod)}
                    className="group cursor-pointer rounded-xl bg-neutral-950/80 border border-neutral-800/90 hover:border-amber-400/80 transition-all p-2.5 flex flex-col justify-between backdrop-blur-md shadow-xl hover:-translate-y-1"
                  >
                    <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-neutral-900 mb-2">
                      <img
                        src={prod.images?.[0] || '/assets/aistudio/exodo-appIcon_cbe32977.png'}
                        alt={prod.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = '/assets/aistudio/exodo-appIcon_cbe32977.png';
                        }}
                      />
                      {hasDiscount && (
                        <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-amber-500 text-black font-black text-[9px] uppercase rounded">
                          Oferta
                        </span>
                      )}
                    </div>
                    <div>
                      <span className="text-[9px] font-mono text-amber-400 truncate block">
                        {prod.scripture ? prod.scripture.split('—')[0] : prod.collection}
                      </span>
                      <h4 className="text-xs font-bold text-white truncate group-hover:text-amber-200">
                        {prod.name}
                      </h4>
                      <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-neutral-800">
                        <span className="text-xs sm:text-sm font-black text-white">
                          ${price}
                        </span>
                        <button
                          onClick={(e) => handleQuickAdd(prod, e)}
                          className="p-1.5 rounded-md bg-[#0D253A] hover:bg-amber-400 hover:text-black text-neutral-200 transition-colors"
                          title="Añadir rápido"
                        >
                          <ShoppingBag size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* SLIDE TYPE 3: #DIOSFUERADELTEMPLO (COMUNIDAD & CALLE)    */}
        {/* ======================================================== */}
        {currentSlide.slideType === 'dios_fuera_del_templo' && (
          <div className="animate-in fade-in slide-in-from-bottom-3 duration-500 w-full">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/20 border border-pink-500/40 text-pink-300 text-[10px] font-mono uppercase tracking-widest mb-2">
                  <Sparkles size={12} />
                  <span>{currentSlide.tagline || 'Comunidad Urbana • Fe en la Calle'}</span>
                </div>
                <h2 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight font-brand-heading">
                  {currentSlide.title || '#DIOSFUERADELTEMPLO'}
                </h2>
                <p className="text-xs sm:text-sm text-neutral-300 max-w-xl mt-1">
                  {currentSlide.subtitle || 'Nuestra fe no se queda en las bancas. Camina en el bulevar, en el metro y en cada rincón de Venezuela.'}
                </p>
              </div>

              <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
                <button
                  onClick={() => navigateToLink(currentSlide.buttonLink || instagramUrl)}
                  style={{
                    backgroundColor: currentSlide.buttonColor || '#EC4899',
                    color: currentSlide.buttonTextColor || getContrastTextColor(currentSlide.buttonColor || '#EC4899', '#FFFFFF'),
                  }}
                  className="px-4 py-2 font-extrabold text-xs uppercase tracking-wider rounded-lg transition-all flex items-center gap-1.5 shadow-lg hover:opacity-90 active:scale-95 cursor-pointer"
                >
                  <Instagram size={14} />
                  <span>{currentSlide.buttonText || 'Comunidad en Instagram'}</span>
                  <ExternalLink size={12} />
                </button>
                {currentSlide.secondaryButtonText && (
                  <button
                    onClick={() => navigateToLink(currentSlide.secondaryButtonLink || 'palabra')}
                    style={{
                      backgroundColor: currentSlide.secondaryButtonColor || '#0D253A',
                      color: currentSlide.secondaryButtonTextColor || getContrastTextColor(currentSlide.secondaryButtonColor || '#0D253A', '#FFFFFF'),
                    }}
                    className="px-3.5 py-2 border border-neutral-700 text-xs font-bold uppercase tracking-wider rounded-lg transition-all flex items-center gap-1.5 hover:opacity-90 cursor-pointer"
                  >
                    <BookOpen size={13} className="text-amber-400" />
                    <span>{currentSlide.secondaryButtonText || 'Devocionales'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Embedded Community Lifestyle Gallery */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-2">
              {communityPreviewPosts.map((post) => (
                <a
                  key={post.id}
                  href={post.postUrl || instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative aspect-square rounded-xl overflow-hidden bg-neutral-950 border border-neutral-800 hover:border-pink-500/80 transition-all shadow-xl block"
                  title="Ver en Instagram"
                >
                  <img
                    src={post.image}
                    alt={post.caption}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-2.5">
                    <span className="text-[10px] font-mono text-pink-300 font-bold truncate">
                      @{post.username}
                    </span>
                    <span className="text-[9px] text-neutral-300 truncate">
                      {post.caption}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* SLIDE TYPE 4: PROMOCIONES / DROPS PERSONALIZADOS         */}
        {/* ======================================================== */}
        {currentSlide.slideType === 'promocion' && (
          <div className="animate-in fade-in slide-in-from-bottom-3 duration-500 max-w-4xl">
            {currentSlide.tagline && (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-mono uppercase tracking-widest mb-4">
                <Sparkles size={13} />
                <span>{currentSlide.tagline}</span>
              </div>
            )}
            <h2 className="text-3xl sm:text-6xl font-black text-white uppercase tracking-tight font-brand-heading">
              {currentSlide.title}
            </h2>
            <p className="mt-3 text-xs sm:text-base text-neutral-300 max-w-2xl leading-relaxed">
              {currentSlide.subtitle || 'Descubre las piezas y colecciones especiales creadas para proclamar la fe.'}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              {currentSlide.buttonText && (
                <button
                  onClick={() => navigateToLink(currentSlide.buttonLink || 'tienda')}
                  style={{
                    backgroundColor: currentSlide.buttonColor || '#FBBF24',
                    color: currentSlide.buttonTextColor || getContrastTextColor(currentSlide.buttonColor || '#FBBF24', '#000000'),
                  }}
                  className="px-6 py-3 font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-xl flex items-center gap-2 hover:opacity-90 active:scale-95 cursor-pointer"
                >
                  <span>{currentSlide.buttonText}</span>
                  <ArrowRight size={15} />
                </button>
              )}
              {currentSlide.secondaryButtonText && (
                <button
                  onClick={() => navigateToLink(currentSlide.secondaryButtonLink)}
                  style={{
                    backgroundColor: currentSlide.secondaryButtonColor || '#171717',
                    color: currentSlide.secondaryButtonTextColor || getContrastTextColor(currentSlide.secondaryButtonColor || '#171717', '#FFFFFF'),
                  }}
                  className="px-5 py-3 border border-neutral-700 text-xs font-bold uppercase tracking-wider rounded-xl transition-all hover:opacity-90 active:scale-95 cursor-pointer"
                >
                  {currentSlide.secondaryButtonText}
                </button>
              )}
            </div>
          </div>
        )}

      </div>

      {/* ======================================================== */}
      {/* CAROUSEL NAVIGATION CONTROLS (ARROWS & DOTS)             */}
      {/* ======================================================== */}
      {activeSlides.length > 1 && (
        <>
          {/* Previous Arrow */}
          <button
            onClick={handlePrev}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/60 hover:bg-[#0D253A] border border-neutral-800 text-neutral-200 hover:text-white flex items-center justify-center backdrop-blur-md transition-all shadow-xl hover:scale-110 active:scale-95 cursor-pointer"
            aria-label="Apartado Anterior"
          >
            <ChevronLeft size={22} />
          </button>

          {/* Next Arrow */}
          <button
            onClick={handleNext}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/60 hover:bg-[#0D253A] border border-neutral-800 text-neutral-200 hover:text-white flex items-center justify-center backdrop-blur-md transition-all shadow-xl hover:scale-110 active:scale-95 cursor-pointer"
            aria-label="Apartado Siguiente"
          >
            <ChevronRight size={22} />
          </button>

          {/* Slide Indicator Bar, Dots & Pause Control */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-black/75 border border-neutral-800/80 backdrop-blur-md shadow-lg">
            {activeSlides.map((slide, idx) => {
              const isActive = idx === safeIndex;
              return (
                <button
                  key={slide.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`group relative h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    isActive ? 'w-8 bg-amber-400' : 'w-2 bg-neutral-600 hover:bg-neutral-400'
                  }`}
                  aria-label={`Ir al apartado ${idx + 1}`}
                  title={slide.title}
                />
              );
            })}

            {/* Subtle autoplay pause indicator */}
            <div className="w-px h-3 bg-neutral-700 mx-0.5" />
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="text-neutral-400 hover:text-white transition-colors p-0.5"
              title={isPaused ? 'Reanudar rotación automática' : 'Pausar rotación automática'}
            >
              {isPaused ? <Play size={11} className="text-amber-400" /> : <Pause size={11} />}
            </button>
          </div>
        </>
      )}
    </section>
  );
};
