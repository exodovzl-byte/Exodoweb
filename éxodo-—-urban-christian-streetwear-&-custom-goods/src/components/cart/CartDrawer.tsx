import React from 'react';
import { X, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const CartDrawer: React.FC<{ onOpenCheckout: () => void }> = ({ onOpenCheckout }) => {
  const {
    cart,
    removeFromCart,
    updateCartQuantity,
    isCartOpen,
    setIsCartOpen,
    cartTotalUSD,
    cartTotalVES,
    exchangeRateBCV,
    clearCart,
  } = useStore();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-neutral-950 border-l border-neutral-800 text-white shadow-2xl flex flex-col justify-between">
          
          {/* Header */}
          <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag size={18} className="text-amber-400" />
              <h2 className="text-lg font-black uppercase tracking-tight font-brand-heading">
                TU BOLSA DE COMPRAS ({cart.reduce((t, i) => t + i.quantity, 0)})
              </h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 rounded-lg bg-neutral-900 text-neutral-400 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="py-20 text-center space-y-3">
                <ShoppingBag size={42} className="mx-auto text-neutral-600" />
                <p className="text-sm font-bold text-neutral-300">
                  Tu bolsa está vacía
                </p>
                <p className="text-xs text-neutral-500 max-w-xs mx-auto">
                  Explora las colecciones y añade franelas con propósito o personaliza tu diseño.
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="mt-3 px-5 py-2.5 bg-[#0D253A] text-white text-xs font-bold uppercase rounded-lg hover:bg-neutral-800 transition-colors"
                >
                  Continuar Comprando
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.cartId}
                  className="p-3.5 rounded-xl bg-neutral-900/60 border border-neutral-800 flex gap-3.5 items-start"
                >
                  {/* Thumbnail */}
                  <div className="w-18 h-18 rounded-lg overflow-hidden bg-black shrink-0 border border-neutral-800">
                    <img
                      src={item.customDesign?.mockupUrl || item.product.images[0]}
                      alt={item.product.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-white truncate">
                      {item.product.name}
                    </h4>

                    {/* Variant specs */}
                    <div className="mt-1 flex flex-wrap gap-1 text-[10px] text-neutral-400 font-mono">
                      {item.selectedSize && (
                        <span className="px-1.5 py-0.5 rounded bg-neutral-800 border border-neutral-700">
                          Talla: {item.selectedSize}
                        </span>
                      )}
                      {item.fitType && (
                        <span className="px-1.5 py-0.5 rounded bg-[#0D253A] text-amber-300 border border-neutral-700">
                          {item.fitType}
                        </span>
                      )}
                      {item.selectedColor && (
                        <span className="px-1.5 py-0.5 rounded bg-neutral-800 border border-neutral-700">
                          {item.selectedColor.name}
                        </span>
                      )}
                      {item.selectedFinish && (
                        <span className="px-1.5 py-0.5 rounded bg-neutral-800 border border-neutral-700">
                          {item.selectedFinish}
                        </span>
                      )}
                    </div>

                    {/* Price and Quantities */}
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center rounded border border-neutral-800 bg-black">
                        <button
                          onClick={() => updateCartQuantity(item.cartId, item.quantity - 1)}
                          className="px-2 py-0.5 text-xs text-neutral-400 hover:text-white"
                        >
                          -
                        </button>
                        <span className="px-2 py-0.5 text-xs font-mono font-bold text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQuantity(item.cartId, item.quantity + 1)}
                          className="px-2 py-0.5 text-xs text-neutral-400 hover:text-white"
                        >
                          +
                        </button>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-black text-amber-400">
                          ${(item.unitPrice * item.quantity).toFixed(2)}
                        </span>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.cartId)}
                        className="text-neutral-500 hover:text-red-400 p-1"
                        title="Eliminar artículo"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout Trigger */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-neutral-800 bg-neutral-900/50 space-y-4">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-neutral-400">
                  <span>Subtotal en Divisas:</span>
                  <span className="font-bold text-white">${cartTotalUSD.toFixed(2)} USD</span>
                </div>
                <div className="flex justify-between text-neutral-400">
                  <span>Tasa Referencial BCV:</span>
                  <span className="font-mono">{exchangeRateBCV.toFixed(2)} VES/$</span>
                </div>
                <div className="flex justify-between text-base font-black pt-2 border-t border-neutral-800">
                  <span className="text-white">Total en Bolívares:</span>
                  <span className="text-amber-400">Bs. {cartTotalVES.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsCartOpen(false);
                  onOpenCheckout();
                }}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#C8C3B3] hover:bg-white text-black font-extrabold text-xs uppercase tracking-wider rounded-lg transition-all shadow-xl active:scale-95 cursor-pointer"
              >
                <span>Proceder al Pago Móvil / Envíos</span>
                <ArrowRight size={15} />
              </button>

              <div className="flex items-center justify-between text-[10px] text-neutral-500">
                <button
                  onClick={clearCart}
                  className="hover:text-red-400 underline cursor-pointer"
                >
                  Vaciar Bolsa
                </button>
                <span>Envíos por MRW / Zoom / Delivery Caracas</span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
