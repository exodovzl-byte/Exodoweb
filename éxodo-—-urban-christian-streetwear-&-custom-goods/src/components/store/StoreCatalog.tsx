import React from 'react';
import { Search, Filter, X, Eye, ShoppingBag, MessageCircle, Tag, ArrowRight } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { ProductCategory, Product } from '../../types';

export const StoreCatalog: React.FC = () => {
  const {
    products,
    selectedCategory,
    setSelectedCategory,
    selectedCollection,
    setSelectedCollection,
    collectionCircles,
    searchQuery,
    setSearchQuery,
    setActivePdpProduct,
    addToCart,
  } = useStore();

  const categories: { id: ProductCategory | 'todas'; label: string }[] = [
    { id: 'todas', label: 'Todo el Catálogo' },
    { id: 'franelas', label: 'Franelas 240g' },
    { id: 'tote-bags', label: 'Tote Bags' },
    { id: 'laminas', label: 'Láminas Sublimadas' },
    { id: 'stickers', label: 'Stickers & UV DTF' },
  ];

  // Filtering
  const filteredProducts = products.filter((p) => {
    // Category filter
    if (selectedCategory !== 'todas' && p.category !== selectedCategory) {
      return false;
    }
    // Collection filter
    if (selectedCollection && p.collection !== selectedCollection) {
      return false;
    }
    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = p.name.toLowerCase().includes(q);
      const matchScripture = p.scripture.toLowerCase().includes(q);
      const matchCollection = p.collection.toLowerCase().includes(q);
      const matchMeaning = p.spiritualMeaning.toLowerCase().includes(q);
      if (!matchName && !matchScripture && !matchCollection && !matchMeaning) {
        return false;
      }
    }
    return true;
  });

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

  const handleWhatsAppQuickBuy = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    const price = product.discountPrice || product.basePrice;
    const msg = encodeURIComponent(
      `¡Hola ÉXODO Caracas! Quiero pedir la prenda: ${product.name} ($${price}). ¿Tienen disponibilidad inmediata?`
    );
    window.open(`https://wa.me/584140153904?text=${msg}`, '_blank');
  };

  return (
    <div className="bg-black min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Top Header & Breadcrumb */}
        <div className="mb-8">
          <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400 font-mono">
            Catálogo Oficial • Streetwear Cristiano Caracas
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight mt-1 font-brand-heading">
            {selectedCategory === 'todas' ? 'TODAS LAS COLECCIONES' : selectedCategory.replace('-', ' ')}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-2 max-w-2xl">
            Prendas con propósito espiritual confeccionadas en Caracas con algodón pesado de 240g y estampado DTF textil de máxima resistencia.
          </p>
        </div>

        {/* TOP SECTION: Search Bar + Horizontal row of CIRCULAR ICONS representing internal collections */}
        <div className="p-6 rounded-2xl bg-neutral-950 border border-neutral-800/80 mb-10 shadow-xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                Filtrar por Colección Interna
              </p>
              <p className="text-[11px] text-neutral-500">
                Haz clic en cualquier círculo para aislar los diseños de esa línea temática.
              </p>
            </div>

            {/* In-catalog Search Bar */}
            <div className="relative w-full md:w-72">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input
                type="text"
                placeholder="Buscar por versículo o estilo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-neutral-900 border border-neutral-700/80 rounded-lg text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Horizontal Row of Circular Collection Icons */}
          <div className="flex items-center gap-6 sm:gap-8 overflow-x-auto pb-3 pt-1 no-scrollbar scroll-smooth">
            {/* "Todas" Circle */}
            <button
              onClick={() => setSelectedCollection(null)}
              className={`group flex flex-col items-center shrink-0 cursor-pointer focus:outline-none transition-all ${
                selectedCollection === null ? 'scale-105' : 'opacity-70 hover:opacity-100'
              }`}
            >
              <div
                className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full p-1 border-2 flex items-center justify-center transition-all ${
                  selectedCollection === null
                    ? 'border-amber-400 bg-[#0D253A] shadow-lg shadow-amber-400/20'
                    : 'border-neutral-700 bg-neutral-900 group-hover:border-neutral-500'
                }`}
              >
                <div className="text-center">
                  <span className="text-[11px] font-black uppercase text-white tracking-widest block font-brand-heading">
                    TODAS
                  </span>
                  <span className="text-[9px] text-amber-400 font-mono">Ver Todo</span>
                </div>
              </div>
              <span className="mt-2 text-xs font-bold text-neutral-200">
                Todas las Líneas
              </span>
            </button>

            {/* Collection Circles */}
            {collectionCircles.map((circle) => {
              const isSelected = selectedCollection === circle.value;
              return (
                <button
                  key={circle.id}
                  onClick={() => setSelectedCollection(isSelected ? null : circle.value)}
                  className={`group flex flex-col items-center shrink-0 cursor-pointer focus:outline-none transition-all ${
                    isSelected ? 'scale-105' : 'opacity-75 hover:opacity-100'
                  }`}
                >
                  <div
                    className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-full p-1 border-2 transition-all overflow-hidden ${
                      isSelected
                        ? 'border-amber-400 shadow-lg shadow-amber-400/20 ring-2 ring-amber-400/50'
                        : 'border-neutral-800 group-hover:border-neutral-500'
                    }`}
                  >
                    <img
                      src={circle.image}
                      alt={circle.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover rounded-full group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <span className={`mt-2 text-xs font-bold transition-colors ${
                    isSelected ? 'text-amber-400' : 'text-neutral-300 group-hover:text-white'
                  }`}>
                    {circle.title}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Filter Pills Bar */}
          {(selectedCollection || selectedCategory !== 'todas' || searchQuery) && (
            <div className="mt-4 pt-4 border-t border-neutral-800/80 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-neutral-500 text-[11px] uppercase font-mono">Filtros activos:</span>
              
              {selectedCategory !== 'todas' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0D253A] text-white border border-neutral-700 text-xs">
                  <span>Categoría: {selectedCategory}</span>
                  <button onClick={() => setSelectedCategory('todas')} className="hover:text-amber-400">
                    <X size={12} />
                  </button>
                </span>
              )}

              {selectedCollection && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500 text-black font-bold text-xs">
                  <span>Colección: {selectedCollection}</span>
                  <button onClick={() => setSelectedCollection(null)} className="hover:opacity-70">
                    <X size={12} />
                  </button>
                </span>
              )}

              {searchQuery && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-800 text-neutral-200 text-xs">
                  <span>Búsqueda: "{searchQuery}"</span>
                  <button onClick={() => setSearchQuery('')} className="hover:text-white">
                    <X size={12} />
                  </button>
                </span>
              )}

              <button
                onClick={() => {
                  setSelectedCategory('todas');
                  setSelectedCollection(null);
                  setSearchQuery('');
                }}
                className="text-[11px] text-neutral-400 hover:text-white underline ml-2 cursor-pointer"
              >
                Limpiar todos
              </button>
            </div>
          )}
        </div>

        {/* Category Tabs Nav */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-neutral-100 text-black shadow-lg font-black'
                  : 'bg-neutral-900/80 text-neutral-400 hover:text-white hover:bg-neutral-800 border border-neutral-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="py-20 text-center bg-neutral-950 rounded-2xl border border-neutral-800">
            <p className="text-base text-neutral-300 font-bold">
              No se encontraron piezas con los filtros seleccionados.
            </p>
            <p className="text-xs text-neutral-500 mt-1">
              Prueba cambiando la colección o borrando el término de búsqueda.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('todas');
                setSelectedCollection(null);
                setSearchQuery('');
              }}
              className="mt-5 px-5 py-2.5 bg-[#0D253A] hover:bg-[#1a3854] text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors"
            >
              Restablecer Catálogo
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => {
              const hasDiscount = product.discountPrice && product.discountPrice < product.basePrice;
              const currentPrice = hasDiscount ? product.discountPrice : product.basePrice;

              return (
                <div
                  key={product.id}
                  onClick={() => setActivePdpProduct(product)}
                  className="group cursor-pointer rounded-xl bg-neutral-900/50 border border-neutral-800/80 hover:border-neutral-600 transition-all duration-300 flex flex-col overflow-hidden hover:-translate-y-1 shadow-md hover:shadow-xl"
                >
                  {/* Image Container */}
                  <div className="relative aspect-square w-full bg-neutral-950 overflow-hidden">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
                      {product.isMultiSupport && (
                        <span className="px-2 py-0.5 bg-emerald-950/95 text-emerald-300 text-[9px] font-bold uppercase tracking-wider rounded border border-emerald-600/70 shadow-md">
                          ✨ Convertible (4 en 1)
                        </span>
                      )}
                      {hasDiscount && (
                        <span className="px-2.5 py-1 bg-amber-500 text-black text-[10px] font-black uppercase tracking-wider rounded shadow-md">
                          Oferta
                        </span>
                      )}
                      {product.badge && !hasDiscount && !product.isMultiSupport && (
                        <span className="px-2.5 py-1 bg-[#0D253A] text-white text-[10px] font-bold uppercase tracking-wider rounded border border-neutral-700 shadow-md">
                          {product.badge}
                        </span>
                      )}
                      <span className="px-2 py-0.5 bg-black/85 backdrop-blur-md text-[#C8C3B3] text-[9px] uppercase tracking-wider rounded border border-neutral-800">
                        {product.collection}
                      </span>
                    </div>

                    {/* Quick actions hover overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2 p-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActivePdpProduct(product);
                        }}
                        className="p-3 bg-white text-black rounded-full hover:scale-110 active:scale-95 transition-transform shadow-xl"
                        title="Ver detalles"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={(e) => handleQuickAdd(product, e)}
                        className="p-3 bg-[#0D253A] text-white rounded-full hover:scale-110 active:scale-95 transition-transform shadow-xl"
                        title="Añadir al carrito"
                      >
                        <ShoppingBag size={18} />
                      </button>
                      <button
                        onClick={(e) => handleWhatsAppQuickBuy(product, e)}
                        className="p-3 bg-emerald-600 text-white rounded-full hover:scale-110 active:scale-95 transition-transform shadow-xl"
                        title="Pedir por WhatsApp"
                      >
                        <MessageCircle size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Body Info */}
                  <div className="p-4 flex flex-col flex-grow justify-between">
                    <div>
                      <p className="text-[10px] font-mono text-amber-400 font-semibold truncate uppercase">
                        {product.scripture.split('—')[0]}
                      </p>
                      
                      <h3 className="mt-1 text-sm font-bold text-white group-hover:text-[#C8C3B3] transition-colors line-clamp-1">
                        {product.name}
                      </h3>

                      {product.isMultiSupport ? (
                        <p className="mt-1 text-[10px] text-emerald-400 font-mono font-medium flex items-center gap-1">
                          <span>Soportes: Franela • Tote • Lámina • Sticker</span>
                        </p>
                      ) : (
                        <p className="mt-1 text-[11px] text-neutral-400 line-clamp-1">
                          {product.category === 'franelas' ? '100% Algodón 240g • DTF Textil' : product.materialSpecs.split(',')[0]}
                        </p>
                      )}
                    </div>

                    {/* Pricing */}
                    <div className="mt-4 pt-3 border-t border-neutral-800/80 flex items-center justify-between">
                      <div>
                        {hasDiscount ? (
                          <div className="flex items-baseline gap-2">
                            <span className="text-base font-black text-amber-400">
                              ${product.discountPrice}
                            </span>
                            <span className="text-xs text-neutral-500 line-through">
                              ${product.basePrice}
                            </span>
                          </div>
                        ) : (
                          <span className="text-base font-black text-white">
                            ${product.basePrice}
                          </span>
                        )}
                        <span className="text-[10px] text-neutral-500 block">
                          Bs. {((currentPrice || 0) * 46).toFixed(0)} (BCV)
                        </span>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActivePdpProduct(product);
                        }}
                        className="text-xs font-semibold text-neutral-300 hover:text-white flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                      >
                        <span>Detalles</span>
                        <ArrowRight size={13} />
                      </button>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};
