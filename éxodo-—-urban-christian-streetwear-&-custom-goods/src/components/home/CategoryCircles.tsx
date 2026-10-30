import React from 'react';
import { useStore } from '../../context/StoreContext';
import { ProductCategory } from '../../types';

export const CategoryCircles: React.FC = () => {
  const { categoryCircles, setSelectedCategory, setCurrentPage } = useStore();

  const handleCategoryClick = (categoryValue: string) => {
    setSelectedCategory(categoryValue as ProductCategory);
    setCurrentPage('tienda');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="bg-black py-8 border-b border-neutral-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6">
          <div className="text-center sm:text-left mx-auto sm:mx-0">
            <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-500 block">
              Explora por Línea
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight font-brand-heading">
              CATEGORÍAS PRINCIPALES
            </h2>
          </div>
          <button
            onClick={() => {
              setSelectedCategory('todas');
              setCurrentPage('tienda');
            }}
            className="text-xs font-semibold text-neutral-400 hover:text-white transition-colors uppercase tracking-wider"
          >
            Ver Todo →
          </button>
        </div>

        {/* Completely centered row of CIRCULAR ICONS */}
        <div className="w-full flex items-center justify-center gap-6 sm:gap-10 overflow-x-auto pb-4 pt-2 no-scrollbar scroll-smooth">
          {categoryCircles.map((circle) => (
            <button
              key={circle.id}
              onClick={() => handleCategoryClick(circle.value)}
              className="group flex flex-col items-center shrink-0 cursor-pointer focus:outline-none"
            >
              {/* Circular Icon with hover effect */}
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full p-1 border-2 border-neutral-800 group-hover:border-amber-400/80 transition-all duration-300 group-hover:scale-105 shadow-lg group-hover:shadow-amber-400/20 bg-neutral-900">
                <div className="w-full h-full rounded-full overflow-hidden">
                  <img
                    src={circle.image}
                    alt={circle.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                {/* Glow ring */}
                <div className="absolute inset-0 rounded-full border border-white/10 pointer-events-none"></div>
              </div>

              {/* Title & Badge */}
              <span className="mt-2.5 text-xs sm:text-sm font-bold text-neutral-200 group-hover:text-white transition-colors tracking-tight text-center">
                {circle.title}
              </span>
              <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-mono group-hover:text-amber-400/80 transition-colors">
                {circle.linkText || 'Ver piezas'}
              </span>
            </button>
          ))}
        </div>

      </div>
    </section>
  );
};
