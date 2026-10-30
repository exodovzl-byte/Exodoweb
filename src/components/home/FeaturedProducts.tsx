import React, { useState } from 'react';
import { ShoppingBag, Eye, Tag, MessageCircle, ArrowRight } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Product } from '../../types';

export const FeaturedProducts: React.FC = () => {
  const { products, setActivePdpProduct, addToCart, setCurrentPage, setSelectedCategory } = useStore();
  const [activeTab, setActiveTab] = useState<'destacados' | 'descuentos'>('destacados');

  const displayedProducts = activeTab === 'destacados'
    ? products.filter((p) => p.isFeatured)
    : products.filter((p) => p.discountPrice && p.discountPrice < p.basePrice);

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
      `¡Hola ÉXODO! Deseo adquirir directamente: ${product.name} ($${price}). ¿Tienen disponibilidad en Caracas?`
    );
    window.open(`https://wa.me/584140153904?text=${msg}`, '_blank');
  };

  return (
    <section className="bg-black py-16 px-4 sm:px-6 lg:px-8 border-b border-neutral-900">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header & Tabs */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400">
              Drops & Catálogo ÉXODO
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight font-brand-heading">
              {activeTab === 'destacados' ? 'PIEZAS DESTACADAS' : 'PIEZAS CON DESCUENTO'}
            </h2>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 bg-neutral-900/80 p-1.5 rounded-lg border border-neutral-800 self-start md:self-auto">
            <button
              onClick={() => setActiveTab('destacados')}
              className={`px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === 'destacados'
                  ? 'bg-[#0D253A] text-white shadow-md'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Destacados
            </button>
            <button
              onClick={() => setActiveTab('descuentos')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === 'descuentos'
                  ? 'bg-amber-500 text-black shadow-md font-black'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Tag size={13} />
              <span>Con Descuento</span>
            </button>
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayedProducts.map((product) => {
            const hasDiscount = product.discountPrice && product.discountPrice < product.basePrice;
            const currentPrice = hasDiscount ? product.discountPrice : product.basePrice;

            return (
              <div
                key={product.id}
                onClick={() => setActivePdpProduct(product)}
                className="group cursor-pointer rounded-xl bg-neutral-900/50 border border-neutral-800/80 hover:border-neutral-600 transition-all duration-300 flex flex-col overflow-hidden hover:-translate-y-1 shadow-md hover:shadow-xl"
              >
                {/* Product Image Frame */}
                <div className="relative aspect-square w-full bg-neutral-950 overflow-hidden">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  
                  {/* Badges Overlay */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                    {hasDiscount && (
                      <span className="px-2.5 py-1 bg-amber-500 text-black text-[10px] font-black uppercase tracking-wider rounded shadow-md">
                        Oferta
                      </span>
                    )}
                    {product.badge && !hasDiscount && (
                      <span className="px-2.5 py-1 bg-[#0D253A] text-white text-[10px] font-bold uppercase tracking-wider rounded border border-neutral-700 shadow-md">
                        {product.badge}
                      </span>
                    )}
                    <span className="px-2 py-0.5 bg-black/75 backdrop-blur-md text-[#C8C3B3] text-[9px] uppercase tracking-wider rounded border border-neutral-800">
                      {product.collection}
                    </span>
                  </div>

                  {/* Hover Quick Action Buttons */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2 p-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActivePdpProduct(product);
                      }}
                      className="p-3 bg-white text-black rounded-full hover:scale-110 active:scale-95 transition-transform shadow-xl"
                      title="Ver detalles completos"
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

                {/* Card Content */}
                <div className="p-4 flex flex-col flex-grow justify-between">
                  <div>
                    {/* Biblical Verse Snippet */}
                    <p className="text-[10px] font-mono text-amber-400 font-semibold truncate uppercase">
                      {product.scripture.split('—')[0]}
                    </p>
                    
                    {/* Title */}
                    <h3 className="mt-1 text-sm font-bold text-white group-hover:text-[#C8C3B3] transition-colors line-clamp-1">
                      {product.name}
                    </h3>

                    {/* Specs snippet */}
                    <p className="mt-1 text-[11px] text-neutral-400 line-clamp-1">
                      {product.category === 'franelas' ? '100% Algodón 240g • DTF Textil' : product.materialSpecs.split(',')[0]}
                    </p>
                  </div>

                  {/* Pricing and Action */}
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
                      <span>Ver</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>

                </div>
              </div>
            );
          })}
        </div>

        {/* View All CTA */}
        <div className="mt-12 text-center">
          <button
            onClick={() => {
              setSelectedCategory('todas');
              setCurrentPage('tienda');
            }}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg border border-neutral-700 bg-neutral-900/60 hover:bg-neutral-800 text-neutral-200 hover:text-white text-xs font-bold uppercase tracking-wider transition-all"
          >
            <span>Ver Toda la Tienda & Colecciones</span>
            <ArrowRight size={15} />
          </button>
        </div>

      </div>
    </section>
  );
};
