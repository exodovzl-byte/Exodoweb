import React from 'react';
import { ShieldCheck, MapPin, Sparkles, Heart, ArrowRight } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { PrayerRequestForm } from '../common/PrayerRequestForm';

export const AboutSection: React.FC = () => {
  const { setCurrentPage, aboutContent } = useStore();

  return (
    <div className="bg-black min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* Banner */}
        <div className="relative rounded-3xl overflow-hidden aspect-[16/9] border border-neutral-800">
          <img
            src={aboutContent?.mainImage || "/src/assets/images/hero_streetwear_1791054715974.jpg"}
            alt="ÉXODO Caracas"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover filter contrast-125 brightness-75"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
          <div className="absolute bottom-6 left-6 right-6">
            <span className="text-xs uppercase font-mono tracking-widest text-amber-400 font-bold">
              {aboutContent?.tagline || "Manifiesto de Marca • Caracas, Venezuela"}
            </span>
            <h1 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight mt-1 font-brand-heading">
              {aboutContent?.title || "LA FE EN LA CALLE: STREET RESILIENCE"}
            </h1>
          </div>
        </div>

        {/* Brand Story */}
        <div className="p-8 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-6 text-sm leading-relaxed text-neutral-300">
          <div className="p-4 rounded-xl bg-[#0D253A]/60 border border-neutral-700 italic text-amber-200 text-base font-serif">
            {aboutContent?.manifestoQuote || `"Moda y artículos personalizados con propósito: Diseños urbanos que llevan la Palabra de Dios a todos lados, creados por nosotros o diseñados por ti."`}
          </div>

          <h2 className="text-2xl font-black text-white uppercase tracking-tight font-brand-heading">
            {aboutContent?.historyTitle || "Nacidos en el Corazón de Caracas"}
          </h2>

          <p>
            {aboutContent?.historyParagraph1 || `ÉXODO no nació en una oficina estéril; nació caminando las aceras de Caracas, viendo el esfuerzo del venezolano que se levanta a las 5:00 a.m. a trabajar con honestidad, fe y gallardía. Entendimos que la ropa no es solo tela: es un púlpito móvil, un manifiesto visual y una declaración de a quién le pertenecemos.`}
          </p>

          <p>
            {aboutContent?.historyParagraph2 || `Durante décadas, la indumentaria cristiana estuvo relegada a diseños genéricos o tímidos. En ÉXODO rompemos ese molde trayendo la crudeza, la fuerza tipográfica y el corte pesado (oversize 240g) de la cultura streetwear internacional, fusionada con la verdad innegociable de las Sagradas Escrituras.`}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
            {(aboutContent?.stats || [
              { value: '240g', label: '100% Algodón Pesado' },
              { value: '3 Días', label: 'Producción en Taller' },
              { value: 'DTF HD', label: 'Estampado Inalterable' }
            ]).map((st, i) => (
              <div key={i} className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 text-center">
                <span className="text-2xl font-black text-white font-mono block">{st.value}</span>
                <span className="text-xs text-neutral-400 uppercase font-mono mt-1 block">{st.label}</span>
              </div>
            ))}
          </div>

          <h2 className="text-2xl font-black text-white uppercase tracking-tight font-brand-heading pt-4">
            {aboutContent?.visionTitle || "Nuestra Visión: #Diosfueradeltemplo"}
          </h2>

          <p>
            {aboutContent?.visionParagraph || `Creemos que la adoración no termina cuando se apagan los micrófonos el domingo. La verdadera prueba de carácter está en el tráfico, en la escasez, en la victoria y en la generosidad diaria. Por eso cada franela, cada tote bag, cada lámina metálica y cada sticker está concebido para iniciar una conversación de esperanza en medio de una sociedad que la necesita urgentemente.`}
          </p>

          <div className="pt-6 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-neutral-400">
              <MapPin size={16} className="text-amber-400" />
              <span>{aboutContent?.workshopLocation || "Taller Principal: Caracas, Distrito Capital, Venezuela"}</span>
            </div>

            <button
              onClick={() => setCurrentPage('tienda')}
              className="flex items-center gap-2 px-6 py-3 bg-[#C8C3B3] hover:bg-white text-black font-extrabold text-xs uppercase tracking-wider rounded-lg transition-all"
            >
              <span>Ver las Colecciones</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>

        {/* RESTORED PRAYER REQUEST FORM AT THE END OF ABOUT */}
        <div className="pt-4">
          <PrayerRequestForm 
            source="nosotros" 
            title="Petición de Oración • Apoyo Pastoral ÉXODO"
            subtitle="¿Estás pasando por una dificultad o celebrando una victoria? Déjanos tu petición y nuestro equipo estará orando por ti."
          />
        </div>

      </div>
    </div>
  );
};
