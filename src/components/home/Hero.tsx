import React from 'react';
import { ArrowRight, Sparkles, Flame } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const Hero: React.FC = () => {
  const { setCurrentPage, setSelectedCategory } = useStore();

  return (
    <section className="relative w-full overflow-hidden bg-black text-white">
      {/* Background Streetwear Visual with Gritty Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="/src/assets/images/hero_streetwear_1791054715974.jpg"
          alt="ÉXODO Caracas Urban Christian Streetwear"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center filter brightness-[0.45] contrast-125"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-[#0D253A]/50"></div>
        {/* Street Texture Grain Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(#C8C3B3_1px,transparent_1px)] [background-size:24px_24px] opacity-10"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 sm:pt-28 sm:pb-32 flex flex-col justify-end min-h-[580px] sm:min-h-[680px]">
        
        {/* Brand Tagline Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-900/90 border border-neutral-700/80 backdrop-blur-md text-[#C8C3B3] text-xs font-semibold uppercase tracking-widest mb-6 w-fit animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Flame size={14} className="text-amber-400" />
          <span>Street Resilience • Moda Cristiana con Propósito</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[0.95] text-white uppercase max-w-4xl font-brand-heading">
          LA PALABRA DE DIOS EN <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C8C3B3] via-white to-amber-200">
            EL ASFALTO Y LA CALLE
          </span>
        </h1>

        {/* Brand Concept Statement */}
        <p className="mt-5 text-sm sm:text-base lg:text-lg text-neutral-300 max-w-2xl font-normal leading-relaxed">
          "Moda y artículos personalizados con propósito: Diseños urbanos que llevan la Palabra de Dios a todos lados, creados por nosotros o diseñados por ti."
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap items-center gap-3.5">
          <button
            onClick={() => {
              setSelectedCategory('todas');
              setCurrentPage('tienda');
            }}
            className="flex items-center justify-center gap-2.5 px-7 py-3.5 bg-[#C8C3B3] hover:bg-white text-black font-extrabold text-xs sm:text-sm uppercase tracking-wider rounded-lg transition-all shadow-xl hover:shadow-[#C8C3B3]/20 active:scale-95 cursor-pointer"
          >
            <span>Explorar Colección</span>
            <ArrowRight size={17} />
          </button>

          <button
            onClick={() => setCurrentPage('personalizador')}
            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-neutral-900/90 hover:bg-[#0D253A] border border-neutral-700/80 text-white font-bold text-xs sm:text-sm uppercase tracking-wider rounded-lg transition-all backdrop-blur-md active:scale-95 cursor-pointer"
          >
            <Sparkles size={16} className="text-amber-400" />
            <span>Personaliza Tu Fe (Custom Lab)</span>
          </button>
        </div>

        {/* Streetwear Tech Specs summary */}
        <div className="mt-12 pt-6 border-t border-neutral-800/80 flex flex-wrap items-center gap-6 sm:gap-10 text-[11px] font-mono uppercase tracking-wider text-neutral-400">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>100% Algodón Pesado 240g</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            <span>DTF Textil & UV de Alta Resistencia</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
            <span>Caracas, Venezuela</span>
          </div>
        </div>

      </div>
    </section>
  );
};
