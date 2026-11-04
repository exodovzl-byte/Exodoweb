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
  const [showDesktopGuide, setShowDesktopGuide] = useState(false);
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
      setShowDesktopGuide(true);
    }
  };

  // Compact variant for Navbar
  return (
    <>
      <button
        type="button"
        onClick={handleInstallClick}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30 text-amber-300 hover:text-amber-200 text-[11px] font-bold font-mono tracking-wider transition-all cursor-pointer ${className}`}
        title="Instalar ÉXODO como aplicación en tu dispositivo"
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
              Instalar ÉXODO en iPhone / iPad
            </h3>
            <p className="text-xs text-neutral-300 leading-relaxed text-left bg-neutral-900/60 p-3 rounded-xl border border-neutral-800">
              1. En Safari, toca el botón <strong>Compartir</strong> <Share size={12} className="inline mx-1 text-sky-400" />.<br />
              2. Selecciona <strong>"Agregar a pantalla de inicio"</strong>.<br />
              3. Toca <strong>Agregar</strong> en la esquina superior derecha.
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

      {/* Desktop / Chrome Instruction Modal */}
      {showDesktopGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-sm rounded-2xl bg-neutral-950 border border-neutral-800 p-6 text-center space-y-4 shadow-2xl">
            <button
              onClick={() => setShowDesktopGuide(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-neutral-900 text-neutral-400 hover:text-white"
            >
              <X size={16} />
            </button>
            <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/30">
              <Download size={20} />
            </div>
            <h3 className="text-base font-bold text-white uppercase tracking-wide">
              Instalar ÉXODO en tu Navegador
            </h3>
            <div className="text-xs text-neutral-300 leading-relaxed text-left bg-neutral-900/60 p-3.5 rounded-xl border border-neutral-800 space-y-2">
              <p>
                <strong>Opción 1:</strong> Haz clic en el ícono de instalación <Download size={12} className="inline mx-0.5 text-amber-400" /> ubicado al final de la barra de direcciones de tu navegador.
              </p>
              <p>
                <strong>Opción 2:</strong> Abre el menú de 3 puntos (⋮), ve a <em>"Guardar y compartir"</em> o <em>"Instalar ÉXODO"</em> y pulsa Instalar.
              </p>
            </div>
            <button
              onClick={() => setShowDesktopGuide(false)}
              className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black text-xs font-black uppercase tracking-wider transition-colors"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
};
