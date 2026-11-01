import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, 
  Trash2, 
  Check, 
  Eye, 
  Download, 
  Sparkles, 
  ShieldCheck, 
  Layers, 
  Globe, 
  Image as ImageIcon, 
  FileCheck,
  RefreshCw,
  ExternalLink,
  Info
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { BrandLogoAssets } from '../../types';
import { ExodoEmblemLogo, ExodoWordmarkLogo, ExodoSwordLogo, ExodoBadgeLogo } from '../common/ExodoLogos';

interface AssetSlotDef {
  key: keyof BrandLogoAssets;
  title: string;
  badge: string;
  description: string;
  recommendedSize: string;
  recommendedFormat: string;
  idealSurface: 'dark' | 'light' | 'transparent';
  targetUsecase: string;
}

const ASSET_SLOTS: AssetSlotDef[] = [
  {
    key: 'logoWhite',
    title: 'Logo Blanco / Sand (Dark UI)',
    badge: 'Principal Tienda',
    description: 'Versión en color blanco o arena (#C8C3B3) optimizada para la barra de navegación oscura, menú móvil y estética nocturna de ÉXODO.',
    recommendedSize: '500 x 150 px (o vector SVG)',
    recommendedFormat: 'PNG Transparente o SVG',
    idealSurface: 'dark',
    targetUsecase: 'Navbar fija, Drawer de navegación, banners oscuros y etiquetas sobre prendas negras.',
  },
  {
    key: 'logoBlack',
    title: 'Logo Negro (Light UI & Impresión)',
    badge: 'Facturación & Guías',
    description: 'Versión en negro puro (#000000) o azul profundo (#0D253A) para superficies claras, guías de despacho MRW/Zoom y notas de entrega.',
    recommendedSize: '500 x 150 px (o vector SVG)',
    recommendedFormat: 'PNG Transparente o SVG',
    idealSurface: 'light',
    targetUsecase: 'Comprobantes de Pago Móvil, recibos de pedido, etiquetas de envío y fondos blancos.',
  },
  {
    key: 'logoTransparent',
    title: 'Logo Transparente (Canal Alfa Puro)',
    badge: 'Personalizador & Mockups',
    description: 'Versión de alto contraste sin fondo ni bordes residuales para superponer directamente en mockups de franelas, tote bags y láminas.',
    recommendedSize: '800 x 800 px (300 DPI)',
    recommendedFormat: 'PNG 24-bit Transparente o SVG',
    idealSurface: 'transparent',
    targetUsecase: 'Estudio de diseño (Custom Lab), estampados DTF digitales y marcas de agua.',
  },
  {
    key: 'appIcon',
    title: 'Ícono de Aplicación / Favicon',
    badge: 'Navegador & PWA',
    description: 'Símbolo compacto y reconocible para la pestaña del navegador, accesos directos web y pantalla de inicio móvil.',
    recommendedSize: '192 x 192 px (mínimo 64x64)',
    recommendedFormat: 'PNG cuadrado o SVG',
    idealSurface: 'dark',
    targetUsecase: 'Favicon del navegador, icono de aplicación móvil instalable (PWA) y barra de marcadores.',
  },
  {
    key: 'appIconSquare',
    title: 'Ícono Cuadrado HD (Splash / Social)',
    badge: '512x512 Master',
    description: 'Logomarca de alta resolución enmarcada en formato cuadrado para portadas de redes sociales, avatar de WhatsApp y splash screen.',
    recommendedSize: '512 x 512 px',
    recommendedFormat: 'PNG HD o WebP',
    idealSurface: 'dark',
    targetUsecase: 'Splash screen de carga, tarjeta social OpenGraph, avatar de soporte de WhatsApp y empaques.',
  },
];

export const BrandAssetManager: React.FC = () => {
  const { brandConfig, updateBrandConfig } = useStore();
  const [activePreviewSurface, setActivePreviewSurface] = useState<'dark' | 'light' | 'checkerboard'>('dark');
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [dragActiveKey, setDragActiveKey] = useState<string | null>(null);

  const currentAssets: BrandLogoAssets = brandConfig.logoAssets || {
    logoBlack: null,
    logoWhite: null,
    logoTransparent: null,
    appIcon: null,
    appIconSquare: null,
  };

  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const showNotification = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  // Sync Favicon to document head when appIcon changes
  useEffect(() => {
    if (currentAssets.appIcon) {
      let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'shortcut icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.type = 'image/png';
      link.href = currentAssets.appIcon;
    }
  }, [currentAssets.appIcon]);

  // Helper to optimize uploaded brand assets (max 800px, PNG with alpha, under 60KB for instant Firestore sync)
  const optimizeImageFile = (file: File, maxDimension: number = 800): Promise<string> => {
    return new Promise((resolve, reject) => {
      // If SVG and under 150KB, read directly as dataUrl to preserve vectors
      if (file.type === 'image/svg+xml' && file.size < 150 * 1024) {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let width = img.width;
          let height = img.height;
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(e.target?.result as string);
            return;
          }
          ctx.clearRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);
          const optimized = canvas.toDataURL('image/png', 0.92);
          resolve(optimized);
        };
        img.onerror = () => resolve(e.target?.result as string);
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Handle file reading to optimized base64 DataURL
  const handleFileUpload = async (key: keyof BrandLogoAssets, file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido (PNG, SVG, JPG, WEBP).');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      alert('La imagen no debe superar los 8MB.');
      return;
    }

    try {
      const maxDim = (key === 'appIcon' || key === 'appIconSquare') ? 512 : 800;
      const dataUrl = await optimizeImageFile(file, maxDim);

      const updatedAssets: BrandLogoAssets = {
        ...currentAssets,
        [key]: dataUrl,
      };

      updateBrandConfig({
        logoAssets: updatedAssets,
        activeLogoVersion: 'custom_uploaded',
        activeLogoColorVariant: key === 'logoBlack' ? 'black' : key === 'logoTransparent' ? 'transparent' : 'white',
      });

      showNotification(`¡${file.name} guardado y optimizado con éxito!`);
    } catch (err) {
      console.error('Error optimizando logo:', err);
      alert('Hubo un problema al procesar la imagen.');
    }
  };

  const handleRemoveAsset = (key: keyof BrandLogoAssets, title: string) => {
    const updatedAssets: BrandLogoAssets = {
      ...currentAssets,
      [key]: null,
    };
    updateBrandConfig({ logoAssets: updatedAssets });
    showNotification(`Asset "${title}" restablecido.`);
  };

  const handleClearAllAssets = () => {
    if (window.confirm('¿Deseas vaciar todos los slots y eliminar los logos guardados? Podrás subir tus archivos originales en cualquier momento.')) {
      updateBrandConfig({
        logoAssets: {
          logoBlack: null,
          logoWhite: null,
          logoTransparent: null,
          appIcon: null,
          appIconSquare: null,
        },
        activeLogoVersion: 'emblem',
      });
      showNotification('Todos los logos guardados han sido eliminados.');
    }
  };

  const uploadedCount = Object.values(currentAssets).filter(Boolean).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl bg-emerald-500 text-black text-xs font-black shadow-2xl flex items-center gap-2 animate-bounce">
          <Check size={16} />
          <span>{successToast}</span>
        </div>
      )}

      {/* Header & Controls */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-neutral-900/90 via-neutral-900/50 to-neutral-950 border border-neutral-800 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-400/10 text-amber-400 border border-amber-400/20">
                <Layers size={18} />
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight font-brand-heading">
                Brand Asset Manager (Gestor de Logos & Íconos)
              </h2>
            </div>
            <p className="text-xs text-neutral-400 mt-1 max-w-2xl leading-relaxed">
              Carga tus archivos originales en alta resolución: logos primarios (Negro, Blanco, Transparente) e íconos de aplicación. Se sincronizan en el estado global para garantizar máxima nitidez y coherencia en la tienda, facturas y PWA.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Asset count badge */}
            <div className="px-3 py-1.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs font-mono text-neutral-300 flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${uploadedCount > 0 ? 'bg-emerald-400' : 'bg-neutral-600'}`}></span>
              <span>Slots: <strong className="text-amber-400">{uploadedCount}/5</strong> archivos</span>
            </div>

            {/* Clear all saved assets button */}
            {uploadedCount > 0 && (
              <button
                type="button"
                onClick={handleClearAllAssets}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-red-950/70 text-neutral-400 hover:text-red-300 border border-neutral-800 hover:border-red-800/80 text-xs font-mono transition-colors cursor-pointer"
                title="Vaciar todos los slots y eliminar datos guardados"
              >
                <Trash2 size={13} className="text-red-400" />
                <span>Limpiar Logos Guardados</span>
              </button>
            )}
          </div>
        </div>

        {/* Global Active Logo Mode Selector in UI */}
        <div className="mt-6 pt-5 border-t border-neutral-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-bold text-white uppercase tracking-wider">Logo Activo en la Tienda:</span>
            <span className="text-neutral-400">Selecciona qué versión renderiza el Navbar y Footer.</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 bg-neutral-950 p-1 rounded-xl border border-neutral-800">
            <button
              type="button"
              onClick={() => updateBrandConfig({ activeLogoVersion: 'custom_uploaded', activeLogoColorVariant: 'white' })}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                brandConfig.activeLogoVersion === 'custom_uploaded' && brandConfig.activeLogoColorVariant === 'white'
                  ? 'bg-amber-400 text-black shadow-md'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Custom Blanco
            </button>
            <button
              type="button"
              onClick={() => updateBrandConfig({ activeLogoVersion: 'custom_uploaded', activeLogoColorVariant: 'transparent' })}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                brandConfig.activeLogoVersion === 'custom_uploaded' && brandConfig.activeLogoColorVariant === 'transparent'
                  ? 'bg-amber-400 text-black shadow-md'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Custom Transparente
            </button>
            <button
              type="button"
              onClick={() => updateBrandConfig({ activeLogoVersion: 'custom_uploaded', activeLogoColorVariant: 'black' })}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                brandConfig.activeLogoVersion === 'custom_uploaded' && brandConfig.activeLogoColorVariant === 'black'
                  ? 'bg-amber-400 text-black shadow-md'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Custom Negro
            </button>
            <button
              type="button"
              onClick={() => updateBrandConfig({ activeLogoVersion: 'emblem' })}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                brandConfig.activeLogoVersion === 'emblem'
                  ? 'bg-neutral-800 text-amber-400 shadow-md'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Vector Oficial (Σ)
            </button>
          </div>
        </div>
      </div>

      {/* Surface Preview Mode Toggles */}
      <div className="flex items-center justify-between text-xs px-1">
        <div className="flex items-center gap-2 text-neutral-400">
          <Eye size={14} className="text-amber-400" />
          <span>Superficie de prueba para previsualización:</span>
        </div>
        <div className="flex items-center gap-1 bg-neutral-900 p-1 rounded-lg border border-neutral-800 text-[11px] font-mono">
          <button
            type="button"
            onClick={() => setActivePreviewSurface('dark')}
            className={`px-2.5 py-1 rounded transition-colors ${
              activePreviewSurface === 'dark' ? 'bg-black text-amber-300 font-bold border border-neutral-700' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Fondo Oscuro (#000)
          </button>
          <button
            type="button"
            onClick={() => setActivePreviewSurface('light')}
            className={`px-2.5 py-1 rounded transition-colors ${
              activePreviewSurface === 'light' ? 'bg-neutral-200 text-black font-bold' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Fondo Claro (#FFF)
          </button>
          <button
            type="button"
            onClick={() => setActivePreviewSurface('checkerboard')}
            className={`px-2.5 py-1 rounded transition-colors ${
              activePreviewSurface === 'checkerboard' ? 'bg-neutral-800 text-white font-bold border border-neutral-600' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Canal Alfa (Malla)
          </button>
        </div>
      </div>

      {/* 5 Asset Slots Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ASSET_SLOTS.map((slot) => {
          const uploadedAsset = currentAssets[slot.key];
          const isDragOver = dragActiveKey === slot.key;

          return (
            <div
              key={slot.key}
              onDragOver={(e) => {
                e.preventDefault();
                setDragActiveKey(slot.key);
              }}
              onDragLeave={() => setDragActiveKey(null)}
              onDrop={(e) => {
                e.preventDefault();
                setDragActiveKey(null);
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  handleFileUpload(slot.key, e.dataTransfer.files[0]);
                }
              }}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                isDragOver
                  ? 'bg-amber-400/5 border-amber-400 ring-2 ring-amber-400/30'
                  : uploadedAsset
                  ? 'bg-neutral-900/50 border-neutral-700 shadow-lg'
                  : 'bg-neutral-950/60 border-neutral-850 hover:border-neutral-700'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2 pb-3 border-b border-neutral-800">
                  <div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-neutral-800 text-amber-400">
                      {slot.badge}
                    </span>
                    <h3 className="text-sm font-black text-white uppercase tracking-tight mt-1.5 font-brand-heading">
                      {slot.title}
                    </h3>
                  </div>

                  {uploadedAsset ? (
                    <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-800/80">
                      <FileCheck size={12} />
                      <span>Cargado</span>
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-neutral-500 bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800">
                      Predeterminado
                    </span>
                  )}
                </div>

                {/* Description */}
                <p className="text-[11px] text-neutral-400 mt-2.5 leading-relaxed">
                  {slot.description}
                </p>

                {/* Visual Preview Box */}
                <div className="mt-4">
                  <div
                    className={`relative w-full h-36 rounded-xl border flex items-center justify-center p-4 transition-colors overflow-hidden ${
                      activePreviewSurface === 'light'
                        ? 'bg-neutral-100 border-neutral-300'
                        : activePreviewSurface === 'checkerboard'
                        ? 'bg-[linear-gradient(45deg,#1f1f1f_25%,transparent_25%),linear-gradient(-45deg,#1f1f1f_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#1f1f1f_75%),linear-gradient(-45deg,transparent_75%,#1f1f1f_75%)] bg-[size:16px_16px] bg-[position:0_0,0_8px,8px_-8px,-8px_0] bg-neutral-900 border-neutral-700'
                        : 'bg-black border-neutral-800'
                    }`}
                  >
                    {uploadedAsset ? (
                      <img
                        src={uploadedAsset}
                        alt={slot.title}
                        className="max-h-full max-w-full object-contain drop-shadow-md"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-center opacity-70">
                        {slot.key === 'appIcon' || slot.key === 'appIconSquare' ? (
                          <ExodoEmblemLogo
                            color={activePreviewSurface === 'light' ? '#000000' : '#C8C3B3'}
                            className="w-16 h-16"
                          />
                        ) : slot.key === 'logoBlack' ? (
                          <ExodoWordmarkLogo color="#000000" className="h-8 w-auto" />
                        ) : (
                          <ExodoWordmarkLogo
                            color={activePreviewSurface === 'light' ? '#000000' : '#C8C3B3'}
                            className="h-8 w-auto"
                          />
                        )}
                        <span className="text-[9px] uppercase font-mono tracking-widest text-neutral-400 mt-2">
                          (Render Vectorial de Referencia)
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Specs Box */}
                <div className="mt-3 p-2.5 rounded-lg bg-neutral-950/80 border border-neutral-850 text-[10px] font-mono space-y-1 text-neutral-400">
                  <div className="flex justify-between">
                    <span>Dimensión sugerida:</span>
                    <strong className="text-neutral-200">{slot.recommendedSize}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Formato:</span>
                    <span className="text-amber-400 font-bold">{slot.recommendedFormat}</span>
                  </div>
                  <p className="text-[9px] text-neutral-500 pt-1 border-t border-neutral-850 truncate" title={slot.targetUsecase}>
                    Uso: {slot.targetUsecase}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-neutral-800 flex items-center gap-2">
                <input
                  type="file"
                  ref={(el) => {
                    fileInputRefs.current[slot.key] = el;
                  }}
                  accept="image/png,image/svg+xml,image/jpeg,image/webp"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileUpload(slot.key, e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRefs.current[slot.key]?.click()}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider border border-neutral-700 transition-colors cursor-pointer active:scale-95"
                >
                  <Upload size={14} className="text-amber-400" />
                  <span>{uploadedAsset ? 'Reemplazar' : 'Subir Imagen'}</span>
                </button>

                {uploadedAsset && (
                  <>
                    <a
                      href={uploadedAsset}
                      download={`exodo-${String(slot.key)}`}
                      className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700 transition-colors"
                      title="Descargar imagen"
                    >
                      <Download size={14} />
                    </a>

                    <button
                      type="button"
                      onClick={() => handleRemoveAsset(slot.key, slot.title)}
                      className="p-2 rounded-xl bg-neutral-900 hover:bg-red-950/80 text-neutral-400 hover:text-red-400 border border-neutral-700 transition-colors cursor-pointer"
                      title="Eliminar asset personalizado"
                    >
                      <Trash2 size={14} />
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Real-world UI Consistency Checker */}
      <div className="p-6 rounded-2xl bg-neutral-950 border border-neutral-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-white uppercase tracking-tight font-brand-heading">
              Simulador de Coherencia en la Interfaz (UI Consistency Check)
            </h3>
            <p className="text-xs text-neutral-400">
              Verifica en tiempo real cómo lucen los assets cargados en los tres puntos críticos de contacto con el cliente.
            </p>
          </div>
          <span className="px-2.5 py-1 rounded bg-[#0D253A] text-[#C8C3B3] text-[10px] font-mono border border-neutral-700">
            En vivo
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          
          {/* Mock 1: Sticky Navbar */}
          <div className="p-4 rounded-xl bg-[#000000] border border-neutral-800 flex flex-col justify-between">
            <span className="text-[10px] uppercase font-mono text-amber-400 font-bold block mb-2">
              1. Cabecera / Sticky Navbar (Dark)
            </span>
            <div className="h-16 flex items-center justify-between px-3 bg-neutral-900/60 rounded-lg border border-neutral-800">
              <div className="flex items-center gap-2">
                {currentAssets.logoWhite || currentAssets.logoTransparent ? (
                  <img
                    src={currentAssets.logoWhite || currentAssets.logoTransparent || ''}
                    alt="Logo preview"
                    className="h-8 max-w-[120px] object-contain"
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <ExodoEmblemLogo color="#C8C3B3" className="w-7 h-7" />
                    <span className="text-lg font-black text-[#C8C3B3] font-brand-heading">ΣXODO</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 text-[10px] text-neutral-500 font-mono">
                <span>INICIO</span>
                <span>TIENDA</span>
                <span className="w-6 h-6 rounded-full bg-neutral-800 flex items-center justify-center text-white">🛒</span>
              </div>
            </div>
            <p className="text-[10px] text-neutral-500 mt-2">
              Usa el <strong>Logo Blanco o Transparente</strong> para máximo contraste sobre negro.
            </p>
          </div>

          {/* Mock 2: Receipt / Invoice (Light) */}
          <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 flex flex-col justify-between">
            <span className="text-[10px] uppercase font-mono text-emerald-400 font-bold block mb-2">
              2. Comprobante Pago Móvil (Light)
            </span>
            <div className="p-3 bg-white rounded-lg border border-neutral-300 text-black">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
                {currentAssets.logoBlack ? (
                  <img
                    src={currentAssets.logoBlack}
                    alt="Logo black preview"
                    className="h-6 max-w-[100px] object-contain"
                  />
                ) : (
                  <ExodoWordmarkLogo color="#000000" className="h-5 w-auto" />
                )}
                <span className="text-[9px] font-mono text-neutral-500">EXD-8941-CCS</span>
              </div>
              <div className="pt-2 text-[9px] font-mono space-y-0.5 text-neutral-700">
                <p>Banco: Banesco (0134)</p>
                <p className="font-bold">Total: $28.00 / Bs. 1,288.00</p>
              </div>
            </div>
            <p className="text-[10px] text-neutral-400 mt-2">
              Usa el <strong>Logo Negro</strong> para comprobantes nítidos en impresión y PDF.
            </p>
          </div>

          {/* Mock 3: Browser Tab & Favicon */}
          <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 flex flex-col justify-between">
            <span className="text-[10px] uppercase font-mono text-sky-400 font-bold block mb-2">
              3. Pestaña del Navegador (Favicon)
            </span>
            <div className="p-2.5 bg-neutral-950 rounded-lg border border-neutral-800">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-t-lg bg-neutral-800 border-t border-x border-neutral-700 text-xs text-white max-w-full">
                {currentAssets.appIcon ? (
                  <img
                    src={currentAssets.appIcon}
                    alt="Favicon preview"
                    className="w-4 h-4 rounded-full object-contain shrink-0"
                  />
                ) : (
                  <span className="w-3.5 h-3.5 rounded-full bg-amber-400 shrink-0"></span>
                )}
                <span className="truncate text-[11px] font-medium">ÉXODO — Urban Christian</span>
                <span className="text-neutral-500 text-[10px] ml-1">×</span>
              </div>
              <div className="h-6 bg-neutral-900 rounded-b border-t border-neutral-800 flex items-center px-2 text-[9px] font-mono text-neutral-500">
                https://exodovzla.com
              </div>
            </div>
            <p className="text-[10px] text-neutral-400 mt-2">
              Usa el <strong>Ícono de Aplicación</strong> para una presencia profesional en el navegador.
            </p>
          </div>

        </div>
      </div>

    </div>
  );
};
