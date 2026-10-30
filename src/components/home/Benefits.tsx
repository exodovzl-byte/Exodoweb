import React from 'react';
import { Clock, ShieldCheck, Truck } from 'lucide-react';

export const Benefits: React.FC = () => {
  const benefits = [
    {
      icon: Clock,
      title: 'Entrega en 3 Días',
      tag: 'Producción Ágil',
      description: 'Confección y estampado inmediato en nuestro taller de Caracas para que no esperes semanas por tu pieza.',
    },
    {
      icon: ShieldCheck,
      title: 'Producción Nacional',
      tag: 'Calidad Pesada',
      description: '100% Algodón peinado de 240g/m² con tecnología DTF Textil que resiste lavadas sin perder nitidez.',
    },
    {
      icon: Truck,
      title: 'Delivery y Envíos a Todo el País',
      tag: 'Cobertura Total',
      description: 'Envíos asegurados por MRW, Zoom y Tealca a todos los estados, además de motorizado en Gran Caracas.',
    },
  ];

  return (
    <section className="bg-neutral-950 border-b border-neutral-900 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div
                key={index}
                className="group p-6 rounded-xl bg-neutral-900/60 border border-neutral-800/80 hover:border-neutral-700 transition-all duration-200 hover:-translate-y-0.5"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-[#0D253A] border border-neutral-700 flex items-center justify-center text-[#C8C3B3] shrink-0 group-hover:bg-[#C8C3B3] group-hover:text-black transition-colors">
                    <Icon size={24} />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400">
                      {benefit.tag}
                    </span>
                    <h3 className="text-base font-bold text-white tracking-tight">
                      {benefit.title}
                    </h3>
                  </div>
                </div>
                <p className="mt-3 text-xs text-neutral-400 leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
