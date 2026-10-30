import React, { useState } from 'react';
import { BookOpen, Copy, Check, Share2, Sparkles } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const VerseSpotlight: React.FC = () => {
  const { setCurrentPage } = useStore();
  const [copied, setCopied] = useState(false);

  const verseData = {
    citation: '1 Corintios 15:57',
    text: 'Mas gracias sean dadas a Dios, que nos da la victoria por medio de nuestro Señor Jesucristo.',
    theme: 'Victoria Sobre el Asfalto',
    reflection: 'En el ajetreo caraqueño, entre el tráfico, las colas y las cargas del día, recuerda que tu identidad no la define tu circunstancia. Cristo ya venció. Camina hoy con la cabeza en alto y el corazón en paz.',
    weekTag: 'Semana Actual • Drop BeneCristiana',
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`"${verseData.text}" — ${verseData.citation}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `📖 *Versículo de la Semana — ÉXODO Caracas*\n\n"${verseData.text}"\n— *${verseData.citation}*\n\nModa urbana con propósito: Lleva la Palabra a todos lados.`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <section className="bg-black py-16 px-4 sm:px-6 lg:px-8 border-b border-neutral-900">
      <div className="max-w-5xl mx-auto">
        
        <div className="relative rounded-2xl bg-gradient-to-b from-[#0D253A]/90 to-neutral-950 border border-neutral-700/80 p-6 sm:p-10 lg:p-12 overflow-hidden shadow-2xl">
          
          {/* Subtle cross / street graphic background watermark */}
          <div className="absolute -right-10 -bottom-10 opacity-5 pointer-events-none text-white select-none">
            <span className="text-[200px] font-black font-brand-heading">✝</span>
          </div>

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-neutral-800">
            <div>
              <div className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-amber-400">
                <Sparkles size={13} />
                <span>{verseData.weekTag}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight mt-1 font-brand-heading">
                EL MENSAJE DE LA SEMANA
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-xs font-semibold text-neutral-200 hover:text-white hover:bg-neutral-800 transition-colors"
              >
                {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                <span>{copied ? 'Copiado' : 'Copiar'}</span>
              </button>

              <button
                onClick={handleShareWhatsApp}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-950/80 border border-emerald-800/80 text-xs font-semibold text-emerald-300 hover:bg-emerald-900 transition-colors"
              >
                <Share2 size={14} />
                <span>Compartir</span>
              </button>
            </div>
          </div>

          <div className="relative z-10 my-8">
            <blockquote className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#C8C3B3] leading-snug tracking-tight font-serif italic">
              "{verseData.text}"
            </blockquote>
            
            <p className="mt-4 text-base sm:text-lg font-black text-amber-400 tracking-wider font-mono">
              — {verseData.citation}
            </p>

            <p className="mt-4 text-xs sm:text-sm text-neutral-300 leading-relaxed max-w-3xl">
              {verseData.reflection}
            </p>
          </div>

          <div className="relative z-10 pt-6 border-t border-neutral-800 flex flex-wrap items-center justify-between gap-4">
            <span className="text-xs text-neutral-400">
              Tema semanal: <strong className="text-white">{verseData.theme}</strong>
            </span>

            <button
              onClick={() => setCurrentPage('palabra')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 uppercase tracking-wider"
            >
              <BookOpen size={14} />
              <span>Ver más devocionales en "La Palabra" →</span>
            </button>
          </div>

        </div>

      </div>
    </section>
  );
};
