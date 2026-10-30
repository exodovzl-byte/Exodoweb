import React, { useState } from 'react';
import { Download, Smartphone, Share, X, Check, Sparkles } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'compact' | 'badge' | 'banner' | 'card';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ 
  variant = 'compact',
  className = '' 
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  // If already running as an installed PWA on the home screen, hide
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const success = await install();
      if (success) {
        setInstallSuccess(true);
        setTimeout(() => setInstallSuccess(false), 4000);
      }
    } else if (isIOS) {
      setShowIOSGuide(true);
    } else {
      // Fallback for browsers that support manual install via Chrome menu (3 dots)
      alert('Para instalar ÉXODO en Google Chrome:\n1. Toca el menú de 3 puntos (⋮) o el icono de instalación en la barra de direcciones.\n2. Selecciona "Instalar ÉXODO" o "Agregar a la pantalla principal".');
    }
  };

  // Banner variant for home/footer
  if (variant === 'banner') {
    return (
      <>
        <div className={`p-4 rounded-2xl bg-gradient-to-r from-neutral-900 via-[#0D253A]/50 to-neutral-950 border border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl ${className}`}>
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="w-11 h-11 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
              <Smartphone size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold">App Progresiva (PWA)</span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-mono">Chrome / Android / iOS</span>
              </div>
              <h4 className="text-sm font-black text-white uppercase tracking-tight font-brand-heading">
                Instala ÉXODO en tu Teléfono o PC
              </h4>
              <p className="text-xs text-neutral-400">
                Acceso ultra-rápido sin abrir el navegador, alertas de pedidos y modo offline.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleInstallClick}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black text-xs font-black uppercase tracking-wider shadow-lg shadow-amber-400/20 transition-all cursor-pointer shrink-0"
          >
            <Download size={15} />
            <span>Instalar Aplicación</span>
          </button>
        </div>

        {/* iOS Instruction Modal */}
        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
            <div className="relative w-full max-w-sm rounded-2xl bg-neutral-950 border border-neutral-800 p-6 text-center space-y-4 shadow-2xl">
              <button
                onClick={() => setShowIOSGuide(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-neutral-900 text-neutral-400 hover:text-white"
              >
                <X size={16} />
              </button>
              <div className="w-12 h-12 rounded-full bg-sky-500/10 text-sky-400 flex items-center justify-center mx-auto border border-sky-500/30">
                <Share size={20} />
              </div>
              <h3 className="text-base font-bold text-white uppercase tracking-wide">
                Instalar ÉXODO en iPhone / iPad
              </h3>
              <p className="text-xs text-neutral-300 leading-relaxed text-left bg-neutral-900/60 p-3 rounded-xl border border-neutral-800">
                1. Toca el botón <strong>Compartir</strong> <Share size={12} className="inline mx-1 text-sky-400" /> en la barra inferior de Safari.<br />
                2. Desliza hacia abajo y pulsa <strong>"Agregar a pantalla de inicio"</strong>.<br />
                3. Pulsa <strong>Agregar</strong> en la esquina superior derecha.
              </p>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold transition-colors"
              >
                Entendido
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Compact variant for Navbar
  return (
    <>
      <button
        type="button"
        onClick={handleInstallClick}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30 text-amber-300 hover:text-amber-200 text-[11px] font-bold font-mono tracking-wider transition-all cursor-pointer ${className}`}
        title="Instalar ÉXODO como aplicación en tu pantalla principal"
      >
        <Download size={13} className="text-amber-400" />
        <span className="hidden sm:inline">Descargar App</span>
        <span className="sm:hidden">App</span>
      </button>

      {/* iOS Instruction Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-sm rounded-2xl bg-neutral-950 border border-neutral-800 p-6 text-center space-y-4 shadow-2xl">
            <button
              onClick={() => setShowIOSGuide(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-neutral-900 text-neutral-400 hover:text-white"
            >
              <X size={16} />
            </button>
            <div className="w-12 h-12 rounded-full bg-sky-500/10 text-sky-400 flex items-center justify-center mx-auto border border-sky-500/30">
              <Share size={20} />
            </div>
            <h3 className="text-base font-bold text-white uppercase tracking-wide">
              Instalar ÉXODO en iOS
            </h3>
            <p className="text-xs text-neutral-300 leading-relaxed text-left bg-neutral-900/60 p-3 rounded-xl border border-neutral-800">
              1. En Safari, toca el botón <strong>Compartir</strong> <Share size={12} className="inline mx-1 text-sky-400" />.<br />
              2. Selecciona <strong>"Agregar a pantalla de inicio"</strong>.<br />
              3. Toca <strong>Agregar</strong>.
            </p>
            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold transition-colors"
            >
              Listo
            </button>
          </div>
        </div>
      )}
    </>
  );
};
