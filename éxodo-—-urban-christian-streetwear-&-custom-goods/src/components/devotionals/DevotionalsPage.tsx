import React, { useState } from 'react';
import { 
  BookOpen, 
  Share2, 
  QrCode, 
  Copy, 
  Check, 
  X, 
  Sparkles, 
  ExternalLink,
  MessageCircle,
  Clock,
  ArrowRight
} from 'lucide-react';
import { INITIAL_DEVOTIONALS } from '../../data/initialData';
import { Devotional } from '../../types';
import { PrayerRequestForm } from '../common/PrayerRequestForm';

export const DevotionalsPage: React.FC = () => {
  const [selectedDevotional, setSelectedDevotional] = useState<Devotional | null>(null);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShareLink = (devo: Devotional) => {
    const url = window.location.origin + '#devo-' + devo.id;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppShare = (devo: Devotional) => {
    const text = encodeURIComponent(
      `📖 *${devo.title}* — ÉXODO La Palabra\n\n"${devo.scripture}"\n\n${devo.excerpt}\n\nLee más en https://exodo.vzl`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div className="bg-black min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-10 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-amber-400">
            <BookOpen size={14} />
            <span>La Palabra • Alimento para la Calle</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight mt-1 font-brand-heading">
            DEVOCIONALES & COMPARTE TU FE
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-2">
            Imágenes de arte bíblico en formatos 4:5 y 9:16 listas para compartir en tus historias, estados y redes. La fe se comunica con poder y belleza.
          </p>
        </div>

        {/* 1. "COMPARTE TU FE" PINTEREST-STYLE MASONRY GALLERY */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-6 pb-2 border-b border-neutral-800">
            <h2 className="text-xl font-bold uppercase tracking-tight text-white font-brand-heading">
              Galería "Comparte Tu Fe" (Formatos 4:5 & 9:16)
            </h2>
            <span className="text-xs text-neutral-400 font-mono">
              Haz clic para leer la reflexión y generar código QR
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
            {INITIAL_DEVOTIONALS.map((devo) => (
              <div
                key={devo.id}
                onClick={() => setSelectedDevotional(devo)}
                className="group cursor-pointer rounded-2xl bg-neutral-900/60 border border-neutral-800 overflow-hidden hover:border-neutral-600 transition-all duration-300 hover:-translate-y-1 shadow-xl"
              >
                {/* Image Frame with Aspect Ratio */}
                <div
                  className={`relative w-full bg-neutral-950 overflow-hidden ${
                    devo.aspectRatio === '9:16' ? 'aspect-[9/16]' : 'aspect-[4/5]'
                  }`}
                >
                  <img
                    src={devo.image}
                    alt={devo.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>

                  {/* Content Overlay */}
                  <div className="absolute inset-0 p-5 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded bg-black/80 backdrop-blur-md text-amber-400 text-[10px] font-mono uppercase font-bold border border-neutral-800">
                        {devo.theme}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-black/60 text-neutral-400 text-[9px] font-mono">
                        {devo.aspectRatio}
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] font-mono text-amber-300 font-semibold block uppercase">
                        {devo.scripture.split('—')[0]}
                      </span>
                      <h3 className="text-lg font-bold text-white mt-1 leading-snug group-hover:text-amber-200 transition-colors">
                        {devo.title}
                      </h3>
                      <p className="text-xs text-neutral-300 mt-2 line-clamp-2">
                        {devo.excerpt}
                      </p>

                      <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-neutral-300">
                        <span className="text-[11px] text-neutral-400">{devo.date}</span>
                        <span className="text-amber-400 font-bold group-hover:translate-x-1 transition-transform">
                          Ver y Compartir →
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. DEVOTIONAL ARTICLES FEED */}
        <div className="mt-16 pt-10 border-t border-neutral-900">
          <div className="mb-8">
            <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400 font-mono">
              Lecturas & Enseñanzas
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight font-brand-heading">
              ARTÍCULOS Y REFLEXIONES COMPLETAS
            </h2>
          </div>

          <div className="space-y-6">
            {INITIAL_DEVOTIONALS.map((devo) => (
              <article
                key={devo.id}
                className="p-6 sm:p-8 rounded-2xl bg-neutral-950 border border-neutral-800/80 hover:border-neutral-700 transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-neutral-850">
                  <div>
                    <span className="text-[11px] font-mono text-amber-400 uppercase font-bold">
                      {devo.scripture.split('—')[0]}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-bold text-white mt-0.5">
                      {devo.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedDevotional(devo);
                        setIsQrModalOpen(true);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-700 text-xs font-semibold text-neutral-200 hover:text-white"
                      title="Generar código QR"
                    >
                      <QrCode size={14} className="text-amber-400" />
                      <span>QR</span>
                    </button>

                    <button
                      onClick={() => handleShareLink(devo)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-700 text-xs font-semibold text-neutral-200 hover:text-white"
                      title="Copiar enlace"
                    >
                      {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                      <span>{copied ? 'Copiado' : 'Link'}</span>
                    </button>

                    <button
                      onClick={() => handleWhatsAppShare(devo)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-800 text-xs font-semibold text-emerald-300 hover:bg-emerald-900"
                    >
                      <MessageCircle size={14} />
                      <span>WhatsApp</span>
                    </button>
                  </div>
                </div>

                <div className="my-5 p-4 rounded-xl bg-neutral-900/60 border border-neutral-800/80 italic text-amber-200/90 text-sm">
                  "{devo.scripture}"
                </div>

                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                  {devo.content}
                </p>

                <div className="mt-6 pt-4 border-t border-neutral-850 flex items-center justify-between text-xs text-neutral-500 font-mono">
                  <span>Autor: {devo.author}</span>
                  <span>{devo.date}</span>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* PRAYER REQUEST FORM (RESTABLECIDO EN LA SECCIÓN PALABRA) */}
        <div className="mt-16 pt-10 border-t border-neutral-900">
          <PrayerRequestForm 
            source="devocionales" 
            title="Petición de Oración • La Palabra en Tu Vida"
            subtitle="En ÉXODO oramos por cada persona y familia que lee estas reflexiones. Comparte tu necesidad o motivo de agradecimiento y nuestro equipo estará intercediendo por ti con reserva absoluta."
          />
        </div>

      </div>

      {/* DEVOTIONAL DETAIL & QR MODAL */}
      {selectedDevotional && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-neutral-950 border border-neutral-800 rounded-2xl p-6 sm:p-8 shadow-2xl my-auto">
            
            <button
              onClick={() => {
                setSelectedDevotional(null);
                setIsQrModalOpen(false);
              }}
              className="absolute top-4 right-4 p-2 rounded-full bg-neutral-900 text-neutral-400 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase font-bold">
              <Sparkles size={13} />
              <span>{selectedDevotional.theme}</span>
            </div>

            <h3 className="text-2xl font-black text-white uppercase mt-1 font-brand-heading">
              {selectedDevotional.title}
            </h3>

            {/* Reflection Scripture */}
            <div className="my-4 p-4 rounded-xl bg-[#0D253A]/40 border border-neutral-700 italic text-amber-300 text-xs sm:text-sm">
              "{selectedDevotional.scripture}"
            </div>

            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed max-h-60 overflow-y-auto pr-1">
              {selectedDevotional.content}
            </p>

            {/* QR CODE & SHARING ACTIONS */}
            <div className="mt-6 pt-6 border-t border-neutral-800">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                
                {/* Mock QR Code Display */}
                <div className="flex items-center gap-3 p-3 bg-neutral-900 rounded-xl border border-neutral-800 w-full sm:w-auto">
                  <div className="w-16 h-16 bg-white rounded-lg p-1 flex items-center justify-center shrink-0">
                    {/* SVG QR Code pattern */}
                    <svg viewBox="0 0 100 100" className="w-full h-full fill-black">
                      <rect x="10" y="10" width="25" height="25" fill="black" />
                      <rect x="15" y="15" width="15" height="15" fill="white" />
                      <rect x="18" y="18" width="9" height="9" fill="black" />
                      
                      <rect x="65" y="10" width="25" height="25" fill="black" />
                      <rect x="70" y="15" width="15" height="15" fill="white" />
                      <rect x="73" y="18" width="9" height="9" fill="black" />

                      <rect x="10" y="65" width="25" height="25" fill="black" />
                      <rect x="15" y="70" width="15" height="15" fill="white" />
                      <rect x="18" y="73" width="9" height="9" fill="black" />

                      <rect x="45" y="15" width="8" height="8" fill="black" />
                      <rect x="45" y="30" width="8" height="8" fill="black" />
                      <rect x="45" y="60" width="8" height="8" fill="black" />
                      <rect x="45" y="75" width="8" height="8" fill="black" />
                      <rect x="65" y="45" width="8" height="8" fill="black" />
                      <rect x="75" y="65" width="8" height="8" fill="black" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">Código QR de Fe</span>
                    <span className="text-[10px] text-neutral-400 block mt-0.5">
                      Escanear para abrir devocional
                    </span>
                  </div>
                </div>

                {/* Direct Action Buttons */}
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    onClick={() => handleShareLink(selectedDevotional)}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-neutral-900 border border-neutral-700 text-xs font-bold text-white hover:bg-neutral-800"
                  >
                    {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    <span>{copied ? 'Enlace Copiado' : 'Copiar Link'}</span>
                  </button>

                  <button
                    onClick={() => handleWhatsAppShare(selectedDevotional)}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white"
                  >
                    <MessageCircle size={14} />
                    <span>Compartir</span>
                  </button>
                </div>

              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
