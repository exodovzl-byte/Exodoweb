import React from 'react';
import { 
  Home, 
  ShoppingBag, 
  Sparkles, 
  Search, 
  Download,
  BookOpen
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { usePWAInstall } from '../../hooks/usePWAInstall';

export const MobileBottomNav: React.FC = () => {
  const {
    currentPage,
    setCurrentPage,
    cart,
    setIsCartOpen,
    setSelectedCategory,
  } = useStore();

  const { isInstallable, install } = usePWAInstall();

  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  const handleNav = (page: string) => {
    setCurrentPage(page);
    if (page === 'tienda') setSelectedCategory('todas');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav 
      aria-label="Navegación Móvil Rápida"
      className="fixed bottom-0 left-0 right-0 z-40 bg-black/95 backdrop-blur-xl border-t border-neutral-800 lg:hidden pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-1.5 px-2 shadow-2xl"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        
        {/* Inicio */}
        <button
          onClick={() => handleNav('inicio')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg transition-all ${
            currentPage === 'inicio'
              ? 'text-amber-400 font-bold scale-105'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Home size={19} className={currentPage === 'inicio' ? 'stroke-[2.5]' : 'stroke-2'} />
          <span className="text-[10px] tracking-tight mt-0.5 font-medium">Inicio</span>
        </button>

        {/* Tienda / Catálogo */}
        <button
          onClick={() => handleNav('tienda')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg transition-all ${
            currentPage === 'tienda'
              ? 'text-amber-400 font-bold scale-105'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <ShoppingBag size={19} className={currentPage === 'tienda' ? 'stroke-[2.5]' : 'stroke-2'} />
          <span className="text-[10px] tracking-tight mt-0.5 font-medium">Tienda</span>
        </button>

        {/* Custom Lab (Destacado en el Centro) */}
        <button
          onClick={() => handleNav('personalizador')}
          className="relative -top-2.5 flex flex-col items-center justify-center group"
          title="Personalizador de Ropa y Accesorios"
        >
          <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all ${
            currentPage === 'personalizador'
              ? 'bg-amber-400 text-black shadow-amber-400/40 ring-2 ring-amber-300 scale-110'
              : 'bg-[#0D253A] text-amber-400 border border-amber-400/50 shadow-black hover:scale-105'
          }`}>
            <Sparkles size={22} className={currentPage === 'personalizador' ? 'animate-spin-slow' : ''} />
          </div>
          <span className={`text-[10px] tracking-tight font-black uppercase mt-0.5 ${
            currentPage === 'personalizador' ? 'text-amber-400' : 'text-neutral-300'
          }`}>
            Custom
          </span>
        </button>

        {/* Devocionales / Palabra */}
        <button
          onClick={() => handleNav('palabra')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg transition-all ${
            currentPage === 'palabra'
              ? 'text-amber-400 font-bold scale-105'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <BookOpen size={19} className={currentPage === 'palabra' ? 'stroke-[2.5]' : 'stroke-2'} />
          <span className="text-[10px] tracking-tight mt-0.5 font-medium">Palabra</span>
        </button>

        {/* Carrito con Contador */}
        <button
          onClick={() => setIsCartOpen(true)}
          className="flex flex-col items-center justify-center py-1 px-2.5 rounded-lg text-neutral-400 hover:text-white transition-all relative"
        >
          <div className="relative">
            <ShoppingBag size={19} className="stroke-2" />
            {cartItemCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-amber-400 text-black text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow">
                {cartItemCount}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-0.5 font-medium">Carrito</span>
        </button>

        {/* Botón de Instalar PWA rápido si es instalable y no está instalada */}
        {isInstallable && (
          <button
            onClick={install}
            className="flex flex-col items-center justify-center py-1 px-2 rounded-lg text-amber-300 hover:text-amber-200 transition-all"
            title="Instalar App en tu Teléfono"
          >
            <Download size={18} className="animate-bounce" />
            <span className="text-[9px] font-bold tracking-tight mt-0.5">App</span>
          </button>
        )}

      </div>
    </nav>
  );
};
