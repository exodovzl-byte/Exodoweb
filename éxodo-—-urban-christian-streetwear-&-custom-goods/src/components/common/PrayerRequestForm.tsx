import React, { useState } from 'react';
import { Heart, Send, CheckCircle2, Shield, Sparkles, MessageCircle } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

interface PrayerRequestFormProps {
  source?: 'devocionales' | 'nosotros' | 'general';
  title?: string;
  subtitle?: string;
}

export const PrayerRequestForm: React.FC<PrayerRequestFormProps> = ({
  source = 'general',
  title = '¿Podemos orar por ti?',
  subtitle = 'En ÉXODO creemos firmemente en el poder de la oración intercesora. Comparte tu petición con nosotros y nuestro equipo estará orando por ti.',
}) => {
  const { addPrayerRequest } = useStore();
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [requestText, setRequestText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !requestText.trim()) {
      alert('Por favor completa todos los campos requeridos.');
      return;
    }

    setIsSubmitting(true);
    try {
      await addPrayerRequest({
        name: name.trim(),
        phone: phone.trim(),
        requestText: requestText.trim(),
        source,
      });

      setIsSubmitted(true);
      setName('');
      setPhone('');
      setRequestText('');
    } catch (err) {
      console.error(err);
      alert('Error al enviar la petición. Por favor intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-neutral-900 via-neutral-950 to-black border border-neutral-800 p-6 sm:p-10 shadow-2xl">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#0D253A]/30 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 max-w-2xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-400 text-xs font-mono uppercase tracking-widest mb-3">
            <Heart size={13} className="fill-amber-400/30" />
            <span>Acompañamiento Espiritual ÉXODO</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tight font-brand-heading">
            {title}
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 mt-2 leading-relaxed">
            {subtitle}
          </p>
        </div>

        {isSubmitted ? (
          <div className="p-8 rounded-2xl bg-neutral-900/90 border border-emerald-500/40 text-center space-y-4 animate-in fade-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 size={32} />
            </div>

            <h3 className="text-xl font-bold text-white uppercase tracking-tight font-brand-heading">
              ¡Tu petición de oración ha sido recibida!
            </h3>
            
            <p className="text-xs text-neutral-300 max-w-md mx-auto leading-relaxed">
              Hemos notificado a nuestro equipo pastoral (exodovzl@gmail.com). Estaremos intercediendo por tu vida y tu familia con fe y reserva absoluta.
            </p>

            <button
              onClick={() => setIsSubmitted(false)}
              className="mt-4 px-6 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-white uppercase tracking-wider transition-colors"
            >
              Enviar otra petición
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. David Márquez"
                  className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl text-xs sm:text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                  Número de Teléfono (WhatsApp) *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Ej. +58 412 1234567"
                  className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl text-xs sm:text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                Motivo / Petición de Oración *
              </label>
              <textarea
                required
                rows={4}
                value={requestText}
                onChange={(e) => setRequestText(e.target.value)}
                placeholder="Escribe con confianza tu necesidad o motivo de agradecimiento..."
                className="w-full p-4 bg-neutral-950 border border-neutral-800 rounded-xl text-xs sm:text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-amber-400 transition-colors leading-relaxed"
              />
            </div>

            {/* MANDATORY LEGAL DISCLAIMER NOTICE (CRITICAL REQUIREMENT) */}
            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800/80 flex items-start gap-3 text-left">
              <Shield size={18} className="text-amber-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-neutral-400 leading-relaxed font-sans">
                <strong>Nota Aclaratoria:</strong> "La información y número telefónico proporcionados en este formulario no serán utilizados con fines comerciales ni publicitarios; únicamente se recopilan para darle seguimiento y acompañamiento a su petición de oración."
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-xs sm:text-sm uppercase tracking-wider transition-all shadow-lg hover:shadow-amber-400/20 active:scale-98 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <span>Enviando petición...</span>
              ) : (
                <>
                  <Send size={15} />
                  <span>Enviar Petición de Oración</span>
                </>
              )}
            </button>

          </form>
        )}

      </div>
    </section>
  );
};
