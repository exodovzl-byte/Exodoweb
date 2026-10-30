import React from 'react';
import { 
  Instagram, 
  MessageCircle, 
  MapPin, 
  Sparkles, 
  ShieldCheck, 
  Heart, 
  Truck, 
  ArrowUpRight 
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { ExodoSwordLogo, ExodoEmblemLogo } from '../common/ExodoLogos';
import { PWAInstallButton } from '../common/PWAInstallButton';

export const Footer: React.FC = () => {
  const { 
    setCurrentPage, 
    setSelectedCategory, 
    setIsTrackingModalOpen,
    setIsAdminLoginModalOpen,
    isAdminAuthenticated,
    brandConfig
  } = useStore();

  return (
    <footer className="bg-neutral-950 border-t border-neutral-900 text-neutral-400">
      {/* Upper Brand Street Bar */}
      <div className="border-b border-neutral-900 bg-neutral-900/40 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <h3 className="text-2xl font-black tracking-tight text-white font-brand-heading">
              #DIOSFUERADELTEMPLO
            </h3>
            <p className="text-xs text-neutral-400 mt-1 max-w-xl">
              "Moda y artículos personalizados con propósito: Diseños urbanos que llevan la Palabra de Dios a todos lados, creados por nosotros o diseñados por ti."
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <a
              href="https://instagram.com/exodo.vzl"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-neutral-800/80 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold transition-colors"
            >
              <Instagram size={15} className="text-pink-400" />
              <span>@exodo.vzl</span>
            </a>
            <a
              href="https://tiktok.com/@exodo.vzl"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-neutral-800/80 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold transition-colors"
            >
              <span className="font-mono text-cyan-400 font-bold text-xs">TT</span>
              <span>@exodo.vzl</span>
            </a>
            <a
              href="https://wa.me/584140153904"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-950/60 border border-emerald-800/50 hover:bg-emerald-900/60 text-emerald-300 text-xs font-semibold transition-colors"
            >
              <MessageCircle size={15} />
              <span>+58 414-0153904</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* PWA Direct Installation Banner */}
        <PWAInstallButton variant="banner" className="mb-10" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          
          {/* Col 1 & 2: Brand Identity */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              {brandConfig.activeLogoVersion === 'custom_uploaded' && (brandConfig.logoAssets?.logoWhite || brandConfig.logoAssets?.logoTransparent || brandConfig.logoAssets?.logoBlack) ? (
                <img
                  src={brandConfig.logoAssets?.logoWhite || brandConfig.logoAssets?.logoTransparent || brandConfig.logoAssets?.logoBlack || ''}
                  alt="ÉXODO Logo Oficial"
                  className="h-10 sm:h-12 w-auto max-w-[200px] object-contain drop-shadow"
                />
              ) : (
                <ExodoSwordLogo color="#C8C3B3" className="h-10 w-auto" />
              )}
            </div>
            
            <p className="text-xs leading-relaxed text-neutral-400 max-w-sm">
              Nacidos en el fragor y la resistencia de las calles caraqueñas. Creamos streetwear cristiano de alta gama con 100% algodón pesado de 240g y estampado DTF textil para hombres y mujeres que no se avergüenzan del evangelio.
            </p>

            <div className="flex items-center gap-2 text-xs text-neutral-400 pt-2">
              <MapPin size={15} className="text-amber-400 shrink-0" />
              <span>Taller de Confección & DTF: Caracas, Distrito Capital, Venezuela.</span>
            </div>
          </div>

          {/* Col 3: Categorías */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-neutral-200">
              Colecciones
            </p>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => {
                    setSelectedCategory('franelas');
                    setCurrentPage('tienda');
                  }}
                  className="hover:text-white transition-colors"
                >
                  Franelas Oversize 240g
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setSelectedCategory('tote-bags');
                    setCurrentPage('tienda');
                  }}
                  className="hover:text-white transition-colors"
                >
                  Tote Bags Lona 12oz
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setSelectedCategory('laminas');
                    setCurrentPage('tienda');
                  }}
                  className="hover:text-white transition-colors"
                >
                  Láminas Metálicas Sublimadas
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setSelectedCategory('stickers');
                    setCurrentPage('tienda');
                  }}
                  className="hover:text-white transition-colors"
                >
                  Stickers UV DTF Relieve
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setSelectedCategory('todas');
                    setCurrentPage('tienda');
                  }}
                  className="text-amber-400 hover:underline flex items-center gap-1"
                >
                  <span>Ver Catálogo Completo</span>
                  <ArrowUpRight size={12} />
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Personaliza & Fe */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-neutral-200">
              Estudio & Comunidad
            </p>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => setCurrentPage('personalizador')}
                  className="hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <Sparkles size={12} className="text-amber-400" />
                  <span>Personaliza Tu Fe (Custom Lab)</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentPage('palabra')}
                  className="hover:text-white transition-colors"
                >
                  La Palabra (Devocionales & Galería)
                </button>
              </li>
              <li>
                <button
                  onClick={() => setIsTrackingModalOpen(true)}
                  className="hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <Truck size={12} className="text-amber-400" />
                  <span>Rastreo en Vivo de Pedidos</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentPage('nosotros')}
                  className="hover:text-white transition-colors"
                >
                  Manifiesto de Resistencia Espiritual
                </button>
              </li>
            </ul>
          </div>

          {/* Col 5: Envíos & Seguridad */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-neutral-200">
              Logística Nacional
            </p>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Envíos cobro en destino a través de MRW, Zoom y Tealca en toda Venezuela. Delivery exprés motorizado en Caracas.
            </p>
            <div className="pt-2">
              <button
                onClick={() => {
                  if (isAdminAuthenticated) {
                    setCurrentPage('admin');
                  } else {
                    setIsAdminLoginModalOpen(true);
                  }
                }}
                className="inline-flex items-center gap-1 text-[11px] text-neutral-500 hover:text-neutral-300 transition-colors"
              >
                <ShieldCheck size={13} />
                <span>Gestión Backoffice (Clave 2412)</span>
              </button>
            </div>
          </div>

        </div>

        {/* Bottom Credits */}
        <div className="mt-12 pt-6 border-t border-neutral-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-400">
          <p>
            © {new Date().getFullYear()} ÉXODO — Hecho con fe y gallardía en Caracas, Venezuela.
          </p>
          <p className="flex items-center gap-1">
            <span>"Llevando la Palabra a todos lados"</span>
            <Heart size={12} className="text-red-500 fill-red-500" />
          </p>
        </div>
      </div>
    </footer>
  );
};
