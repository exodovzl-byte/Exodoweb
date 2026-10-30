import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShoppingBag, 
  MessageCircle, 
  Check, 
  ShieldCheck, 
  Truck, 
  Layers, 
  Sparkles, 
  Heart,
  Shirt,
  ShoppingBag as BagIcon,
  Frame,
  Sticker
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { ProductColor, ProductSupportType } from '../../types';

export const ProductDetailModal: React.FC = () => {
  const { activePdpProduct, setActivePdpProduct, addToCart, exchangeRateBCV } = useStore();

  if (!activePdpProduct) return null;

  const product = activePdpProduct;

  // Multi-support converter state for VeneCristiana designs
  const isMultiSupport = Boolean(product.isMultiSupport);
  const [selectedSupport, setSelectedSupport] = useState<ProductSupportType>(
    product.category === 'tote-bags'
      ? 'tote'
      : product.category === 'laminas'
      ? 'lamina'
      : product.category === 'stickers'
      ? 'stickers'
      : 'franela'
  );

  const effectiveCategory = isMultiSupport
    ? selectedSupport === 'franela'
      ? 'franelas'
      : selectedSupport === 'tote'
      ? 'tote-bags'
      : selectedSupport === 'lamina'
      ? 'laminas'
      : 'stickers'
    : product.category;

  const isApparel = effectiveCategory === 'franelas';
  const isSticker = effectiveCategory === 'stickers';
  const isTote = effectiveCategory === 'tote-bags';
  const isLamina = effectiveCategory === 'laminas';

  // Variant States
  const [selectedSize, setSelectedSize] = useState<string>(product.availableSizes[0] || 'M');
  const [selectedColor, setSelectedColor] = useState<ProductColor>(
    product.availableColors[0] || { name: 'Negro Pitch', hex: '#000000' }
  );
  const [fitType, setFitType] = useState<'Corte Normal' | 'Oversize'>('Oversize');
  const [selectedFinish, setSelectedFinish] = useState<'Vinilo' | 'Papel Fotográfico' | 'UV DTF'>(
    product.stickerFinishes?.[0] || 'UV DTF'
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [addedToast, setAddedToast] = useState(false);

  // Reset when product changes
  useEffect(() => {
    setSelectedSupport(
      product.category === 'tote-bags'
        ? 'tote'
        : product.category === 'laminas'
        ? 'lamina'
        : product.category === 'stickers'
        ? 'stickers'
        : 'franela'
    );
    setSelectedSize(product.availableSizes[0] || 'M');
    setSelectedColor(product.availableColors[0] || { name: 'Negro Pitch', hex: '#000000' });
    setFitType('Oversize');
    if (product.stickerFinishes) setSelectedFinish(product.stickerFinishes[0]);
    setQuantity(1);
    setActiveImageIndex(0);
    setAddedToast(false);
  }, [product]);

  // Real-time Dynamic Price Calculation based on active support
  const getBaseSupportPrice = () => {
    if (isMultiSupport && product.supportPrices) {
      return product.supportPrices[selectedSupport] || product.basePrice;
    }
    return product.discountPrice || product.basePrice;
  };

  const baseEffectivePrice = getBaseSupportPrice();
  const oversizeDelta = isApparel && fitType === 'Oversize' ? product.oversizePriceDelta : 0;
  const unitPrice = baseEffectivePrice + oversizeDelta;
  const totalPrice = unitPrice * quantity;
  const totalPriceVES = totalPrice * exchangeRateBCV;

  // Material specs description based on selected support
  const getDynamicMaterialSpecs = () => {
    if (isApparel) return '100% Algodón Peinado Pesado 240g/m² • DTF Textil HD de máxima resistencia a lavadas';
    if (isTote) return 'Lona 100% Algodón Crudo 12oz • Manijas reforzadas en cruz con estampado DTF';
    if (isLamina) return 'Aluminio Electropintado 0.8mm • Sublimación Ultra HD con brillo espejo y anclaje flotante';
    return 'Calcomanías con relieve táctil 3D UV DTF / Vinilo impermeable para termos, cascos y laptops';
  };

  const handleAddToCart = () => {
    const supportSuffix = isMultiSupport ? ` [${selectedSupport.toUpperCase()}]` : '';
    addToCart({
      cartId: `${product.id}-${selectedSupport}-${selectedSize}-${fitType}-${selectedColor.name}-${Date.now()}`,
      productId: product.id,
      product: {
        ...product,
        name: `${product.name}${supportSuffix}`,
      },
      quantity,
      selectedSupport: isMultiSupport ? selectedSupport : undefined,
      selectedSize: isApparel ? selectedSize : isLamina ? '30x40 cm' : undefined,
      selectedColor,
      fitType: isApparel ? fitType : undefined,
      selectedFinish: isSticker ? selectedFinish : undefined,
      unitPrice,
    });

    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2500);
  };

  const handleWhatsAppOrder = () => {
    const details = [
      `Prenda/Diseño: ${product.name}`,
      isMultiSupport ? `Soporte Elegido: ${selectedSupport.toUpperCase()}` : '',
      isApparel ? `Talla: ${selectedSize}` : '',
      isApparel ? `Corte: ${fitType} (100% Algodón 240g DTF)` : '',
      `Color: ${selectedColor.name}`,
      isSticker ? `Acabado: ${selectedFinish}` : '',
      `Cantidad: ${quantity}`,
      `Total: $${totalPrice.toFixed(2)} USD (Bs. ${totalPriceVES.toFixed(2)})`,
      `Versículo clave: ${product.scripture.split('—')[0]}`,
    ]
      .filter(Boolean)
      .join('\n• ');

    const message = encodeURIComponent(
      `¡Hola ÉXODO Caracas! Quiero adquirir esta pieza:\n\n• ${details}\n\n¿Tienen entrega inmediata o confección en 3 días?`
    );

    window.open(`https://wa.me/584140153904?text=${message}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      
      <div className="relative w-full max-w-4xl bg-neutral-950 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden my-auto">
        
        {/* Close Modal Button */}
        <button
          onClick={() => setActivePdpProduct(null)}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-neutral-900/80 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors border border-neutral-700 cursor-pointer"
          aria-label="Cerrar modal de producto"
        >
          <X size={18} />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 max-h-[90vh] overflow-y-auto">
          
          {/* LEFT: Image Gallery */}
          <div className="p-6 bg-neutral-900/40 flex flex-col justify-between border-b md:border-b-0 md:border-r border-neutral-800">
            <div>
              {/* Main Image Frame */}
              <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-black border border-neutral-800">
                <img
                  src={product.images[activeImageIndex] || product.images[0]}
                  alt={product.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />

                {/* Badge overlay */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                  <span className="px-2.5 py-1 bg-[#0D253A] text-white text-[10px] font-bold uppercase tracking-wider rounded border border-neutral-700 shadow-md">
                    {product.collection}
                  </span>
                  {product.badge && (
                    <span className="px-2.5 py-1 bg-amber-500 text-black text-[10px] font-black uppercase tracking-wider rounded shadow-md">
                      {product.badge}
                    </span>
                  )}
                </div>
              </div>

              {/* Thumbnails if multiple */}
              {product.images.length > 1 && (
                <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                        activeImageIndex === idx ? 'border-amber-400 scale-95' : 'border-neutral-800 opacity-60'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quality Badges */}
            <div className="mt-6 pt-4 border-t border-neutral-800/80 space-y-2 text-[11px] text-neutral-400">
              <div className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-emerald-400 shrink-0" />
                <span>{getDynamicMaterialSpecs()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck size={14} className="text-amber-400 shrink-0" />
                <span>Despacho ágil en 3 días hábiles desde Caracas</span>
              </div>
            </div>
          </div>

          {/* RIGHT: Product Details & Variant Selectors */}
          <div className="p-6 sm:p-8 flex flex-col justify-between space-y-6">
            
            <div>
              {/* Collection & Scripture Tag */}
              <div className="flex items-center gap-2 text-xs font-mono text-amber-400 font-semibold uppercase tracking-wider">
                <Sparkles size={13} />
                <span>{product.scripture.split('—')[0]}</span>
              </div>

              {/* Title */}
              <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight mt-1 font-brand-heading">
                {product.name}
              </h2>

              {/* Price display with real-time update */}
              <div className="mt-3 flex items-baseline gap-3">
                <span className="text-2xl sm:text-3xl font-black text-white">
                  ${unitPrice.toFixed(2)}
                </span>
                {oversizeDelta > 0 && isApparel && (
                  <span className="text-xs text-amber-400 font-mono font-semibold">
                    (+${oversizeDelta} corte Oversize 240g)
                  </span>
                )}
                <span className="text-xs text-neutral-400 font-mono">
                  ~ Bs. {(unitPrice * exchangeRateBCV).toFixed(2)} (BCV)
                </span>
              </div>

              {/* VENECRISTIANA SUPPORT CONVERTER (Franela / Tote / Lámina / Stickers) */}
              {isMultiSupport && (
                <div className="mt-5 p-3.5 rounded-xl bg-[#0D253A]/40 border border-amber-400/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase text-amber-400 font-mono tracking-wider">
                      ★ Convertidor de Soporte VeneCristiana
                    </span>
                    <span className="text-[10px] text-neutral-400">Elige dónde llevar este diseño</span>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: 'franela', label: 'Franela', icon: Shirt, price: product.supportPrices?.franela || 25 },
                      { id: 'tote', label: 'Tote Bag', icon: BagIcon, price: product.supportPrices?.tote || 15 },
                      { id: 'lamina', label: 'Lámina', icon: Frame, price: product.supportPrices?.lamina || 18 },
                      { id: 'stickers', label: 'Stickers', icon: Sticker, price: product.supportPrices?.stickers || 8 },
                    ].map((sup) => {
                      const Icon = sup.icon;
                      const isActive = selectedSupport === sup.id;
                      return (
                        <button
                          key={sup.id}
                          type="button"
                          onClick={() => setSelectedSupport(sup.id as ProductSupportType)}
                          className={`p-2 rounded-lg border text-center transition-all flex flex-col items-center gap-1 ${
                            isActive
                              ? 'bg-amber-500 text-black border-amber-400 font-black shadow-lg scale-102'
                              : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:border-neutral-600 hover:text-white'
                          }`}
                        >
                          <Icon size={16} />
                          <span className="text-[10px] uppercase font-bold tracking-tight block">
                            {sup.label}
                          </span>
                          <span className="text-[9px] font-mono">
                            ${sup.price}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* UNIFIED PRODUCT DESCRIPTION SECTION */}
              <div className="mt-4 p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 text-xs leading-relaxed space-y-2.5">
                <p className="font-semibold text-neutral-200">
                  {product.unifiedDescription}
                </p>
                <div className="pt-2 border-t border-neutral-800/80 text-[11px] text-neutral-400">
                  <strong className="text-amber-400 uppercase font-mono block mb-0.5">Versículo Central:</strong>
                  <span className="italic">"{product.scripture}"</span>
                </div>
              </div>

              {/* APPAREL VARIANT SELECTORS */}
              {isApparel && (
                <div className="mt-5 space-y-4">
                  {/* Fit Type Picker */}
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-neutral-300 mb-2">
                      <span>Corte & Caída</span>
                      <span className="text-amber-400 font-mono text-[11px]">
                        {fitType === 'Oversize' ? 'Caída Boxy pesada 240g (+ $4)' : 'Regular Fit estándar'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setFitType('Corte Normal')}
                        className={`py-2 px-3 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all text-center ${
                          fitType === 'Corte Normal'
                            ? 'bg-[#0D253A] text-white border-amber-400 shadow-md ring-1 ring-amber-400/30'
                            : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:border-neutral-700'
                        }`}
                      >
                        Corte Normal
                      </button>

                      <button
                        type="button"
                        onClick={() => setFitType('Oversize')}
                        className={`py-2 px-3 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all text-center flex items-center justify-center gap-1.5 ${
                          fitType === 'Oversize'
                            ? 'bg-[#0D253A] text-white border-amber-400 shadow-md ring-1 ring-amber-400/30'
                            : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:border-neutral-700'
                        }`}
                      >
                        <span>Oversize 240g</span>
                        <span className="text-[10px] text-amber-400 font-mono">+$4</span>
                      </button>
                    </div>
                  </div>

                  {/* Size Picker (S, M, L, XL, 2XL) */}
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-neutral-300 mb-2">
                      <span>Talla Disponible</span>
                      <span className="text-[11px] text-neutral-500 font-mono">Guía Caracas</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {product.availableSizes.map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => setSelectedSize(size)}
                          className={`w-10 h-9 rounded-lg text-xs font-black uppercase tracking-wider transition-all border ${
                            selectedSize === size
                              ? 'bg-white text-black border-white shadow-md scale-105'
                              : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:border-neutral-600'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Color Swatches */}
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-300 mb-2 block">
                      Color: <span className="text-white font-normal">{selectedColor.name}</span>
                    </span>

                    <div className="flex items-center gap-2">
                      {product.availableColors.map((color) => (
                        <button
                          key={color.name}
                          type="button"
                          onClick={() => setSelectedColor(color)}
                          className={`group flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs transition-all ${
                            selectedColor.name === color.name
                              ? 'border-amber-400 bg-neutral-900 text-white shadow-md'
                              : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:border-neutral-700'
                          }`}
                        >
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-neutral-600 shrink-0"
                            style={{ backgroundColor: color.hex }}
                          ></span>
                          <span>{color.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* STICKERS VARIANT SELECTORS */}
              {isSticker && (
                <div className="mt-5 space-y-4">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-300 mb-2 block">
                      Acabado del Adhesivo
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      {(product.stickerFinishes || ['UV DTF', 'Vinilo', 'Papel Fotográfico']).map((fin) => (
                        <button
                          key={fin}
                          type="button"
                          onClick={() => setSelectedFinish(fin as any)}
                          className={`py-2 px-2 text-[11px] font-bold uppercase tracking-wider rounded-lg border transition-all text-center ${
                            selectedFinish === fin
                              ? 'bg-[#0D253A] text-white border-amber-400 shadow-md'
                              : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:border-neutral-700'
                          }`}
                        >
                          {fin}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="mt-5 flex items-center gap-4">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                  Cantidad:
                </span>
                <div className="flex items-center rounded-lg border border-neutral-800 bg-neutral-900 overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1 text-neutral-400 hover:text-white text-sm font-black transition-colors"
                  >
                    -
                  </button>
                  <span className="px-3 py-1 text-xs font-bold text-white min-w-8 text-center font-mono">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-1 text-neutral-400 hover:text-white text-sm font-black transition-colors"
                  >
                    +
                  </button>
                </div>

                <div className="ml-auto text-right">
                  <span className="text-[10px] text-neutral-500 uppercase block">Total Pieza:</span>
                  <span className="text-base font-black text-amber-400 font-mono">
                    ${totalPrice.toFixed(2)} USD
                  </span>
                </div>
              </div>

            </div>

            {/* ACTION BUTTONS */}
            <div className="pt-4 border-t border-neutral-800 space-y-2.5">
              {addedToast && (
                <div className="p-2.5 rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-2 animate-in fade-in duration-150">
                  <Check size={16} />
                  <span>¡Añadido al carrito ({isMultiSupport ? selectedSupport.toUpperCase() : 'Prenda'})!</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={handleAddToCart}
                  className="flex items-center justify-center gap-2 w-full py-3.5 bg-[#C8C3B3] hover:bg-white text-black font-extrabold text-xs uppercase tracking-wider rounded-lg transition-all shadow-lg active:scale-95 cursor-pointer"
                >
                  <ShoppingBag size={16} />
                  <span>Añadir al Carrito</span>
                </button>

                <button
                  onClick={handleWhatsAppOrder}
                  className="flex items-center justify-center gap-2 w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-lg transition-all shadow-lg active:scale-95 cursor-pointer"
                >
                  <MessageCircle size={16} />
                  <span>Pedir por WhatsApp</span>
                </button>
              </div>

              <p className="text-[10px] text-center text-neutral-500">
                Pagos en Bs vía Pago Móvil (BCV) o Efectivo/Zelle en Caracas • Confección ágil en 3 días.
              </p>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
