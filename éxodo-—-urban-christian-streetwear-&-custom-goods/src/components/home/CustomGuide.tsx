import React from 'react';
import { Layers, Wand2, Truck, ArrowRight, Sparkles } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const CustomGuide: React.FC = () => {
  const { setCurrentPage } = useStore();

  const steps = [
    {
      step: '01',
      icon: Layers,
      title: 'Elige tu Soporte Urbano',
      description: 'Selecciona entre Franelas 100% Algodón pesado (Corte Normal u Oversize 240g), Tote Bags de lona, Láminas metálicas o Stickers UV DTF con relieve.',
      tag: 'Base Confección',
    },
    {
      step: '02',
      icon: Wand2,
      title: 'Crea tu Mensaje con IA o Versículo',
      description: 'Usa nuestro Generador de IA Gemini para crear arte conceptual cristiano o busca versículos bíblicos y compón tu tipografía urbana en tiempo real.',
      tag: 'Estudio de Diseño',
    },
    {
      step: '03',
      icon: Truck,
      title: 'Estampado DTF y Envío en 3 Días',
      description: 'Producimos con micropigmentos textiles de alta resistencia en nuestro taller en Caracas y enviamos por MRW, Zoom, Tealca o motorizado.',
      tag: 'Entrega Ágil',
    },
  ];

  return (
    <section className="bg-neutral-950 py-16 px-4 sm:px-6 lg:px-8 border-b border-neutral-900">
      <div className="max-w-7xl mx-auto">
        
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0D253A] border border-neutral-800 text-amber-400 text-[11px] font-bold uppercase tracking-widest mb-3">
            <Sparkles size={13} />
            <span>Personaliza Tu Fe</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight font-brand-heading">
            CREA TU PROPIO MENSAJE
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-neutral-400">
            "Diseños urbanos que llevan la Palabra de Dios a todos lados, creados por nosotros o diseñados por ti en 3 simples pasos."
          </p>
        </div>

        {/* 3 Step Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {steps.map((st, idx) => {
            const Icon = st.icon;
            return (
              <div
                key={idx}
                className="relative p-6 sm:p-8 rounded-2xl bg-neutral-900/40 border border-neutral-800/80 hover:border-neutral-600 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-3xl sm:text-4xl font-black text-neutral-700 group-hover:text-amber-400/80 font-mono transition-colors">
                      {st.step}
                    </span>
                    <div className="w-12 h-12 rounded-xl bg-neutral-800/80 border border-neutral-700/60 flex items-center justify-center text-[#C8C3B3] group-hover:bg-[#0D253A] group-hover:text-white transition-colors">
                      <Icon size={22} />
                    </div>
                  </div>

                  <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400 font-mono">
                    {st.tag}
                  </span>
                  
                  <h3 className="text-lg font-bold text-white mt-1 mb-2">
                    {st.title}
                  </h3>

                  <p className="text-xs text-neutral-400 leading-relaxed">
                    {st.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-neutral-800/60 flex items-center justify-between text-[11px] text-neutral-400">
                  <span>Paso {idx + 1} de 3</span>
                  <span className="group-hover:translate-x-1 transition-transform text-white">→</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA Bar */}
        <div className="mt-12 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-[#0D253A] via-neutral-900 to-black border border-neutral-700/70 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
          <div>
            <h4 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              ¿Listo para plasmar tu versículo o testimonio?
            </h4>
            <p className="text-xs text-neutral-300 mt-1">
              Entra a nuestro Estudio de Diseño interactivo y previsualiza tu prenda en tiempo real.
            </p>
          </div>

          <button
            onClick={() => setCurrentPage('personalizador')}
            className="flex items-center gap-2 px-7 py-3.5 bg-[#C8C3B3] hover:bg-white text-black font-extrabold text-xs uppercase tracking-wider rounded-lg transition-all shadow-lg active:scale-95 shrink-0 cursor-pointer"
          >
            <Sparkles size={16} />
            <span>Abrir Custom Lab</span>
            <ArrowRight size={16} />
          </button>
        </div>

      </div>
    </section>
  );
};
