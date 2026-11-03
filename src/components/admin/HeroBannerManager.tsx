import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, 
  Image as ImageIcon, 
  Sparkles, 
  Check, 
  Flame, 
  RefreshCw, 
  ArrowRight, 
  RotateCcw, 
  Link2, 
  Eye,
  Sliders
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { HeroSlide } from '../../types';
import { compressImageFile } from '../../utils/imageCompressor';
import { INITIAL_HERO_SLIDES } from '../../data/initialData';

export const HeroBannerManager: React.FC = () => {
  const { heroSlides, updateHeroSlides } = useStore();

  const currentSlide = heroSlides?.find((s) => s.id === 'slide-1' || s.active) || heroSlides?.[0] || INITIAL_HERO_SLIDES[0];

  const [image, setImage] = useState<string>(currentSlide.image || '/src/assets/images/hero_streetwear_1791054715974.jpg');
  const [title, setTitle] = useState<string>(currentSlide.title || 'LA PALABRA DE DIOS EN EL ASFALTO Y LA CALLE');
  const [tagline, setTagline] = useState<string>(currentSlide.tagline || 'Street Resilience • Moda Cristiana con Propósito');
  const [subtitle, setSubtitle] = useState<string>(currentSlide.subtitle || '"Moda y artículos personalizados con propósito: Diseños urbanos que llevan la Palabra de Dios a todos lados, creados por nosotros o diseñados por ti."');
  const [buttonText, setButtonText] = useState<string>(currentSlide.buttonText || 'Explorar Colección');
  const [buttonLink, setButtonLink] = useState<string>(currentSlide.buttonLink || 'tienda');
  const [secondaryButtonText, setSecondaryButtonText] = useState<string>(currentSlide.secondaryButtonText || 'Personaliza Tu Fe (Custom Lab)');
  const [secondaryButtonLink, setSecondaryButtonLink] = useState<string>(currentSlide.secondaryButtonLink || 'personalizador');

  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [isImageUrlInputOpen, setIsImageUrlInputOpen] = useState<boolean>(false);
  const [customImageUrl, setCustomImageUrl] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync state if external cloud updates heroSlides
  useEffect(() => {
    if (currentSlide) {
      setImage(currentSlide.image || '/src/assets/images/hero_streetwear_1791054715974.jpg');
      setTitle(currentSlide.title || 'LA PALABRA DE DIOS EN EL ASFALTO Y LA CALLE');
      setTagline(currentSlide.tagline || 'Street Resilience • Moda Cristiana con Propósito');
      setSubtitle(currentSlide.subtitle || '"Moda y artículos personalizados con propósito: Diseños urbanos que llevan la Palabra de Dios a todos lados, creados por nosotros o diseñados por ti."');
      setButtonText(currentSlide.buttonText || 'Explorar Colección');
      setButtonLink(currentSlide.buttonLink || 'tienda');
      setSecondaryButtonText(currentSlide.secondaryButtonText || 'Personaliza Tu Fe (Custom Lab)');
      setSecondaryButtonLink(currentSlide.secondaryButtonLink || 'personalizador');
    }
  }, [currentSlide.id, currentSlide.image, currentSlide.title, currentSlide.tagline, currentSlide.subtitle]);

  // Handle Image Upload with client compression
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      // Compress to high quality WebP/JPEG max 1600px
      const compressed = await compressImageFile(file, 1600, 0.85);
      setImage(compressed);
    } catch (err) {
      console.error('Error optimizando imagen de portada:', err);
      // Fallback to FileReader
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleApplyCustomUrl = () => {
    if (!customImageUrl.trim()) return;
    setImage(customImageUrl.trim());
    setCustomImageUrl('');
    setIsImageUrlInputOpen(false);
  };

  const handleResetDefault = () => {
    setImage('/src/assets/images/hero_streetwear_1791054715974.jpg');
    setTitle('LA PALABRA DE DIOS EN EL ASFALTO Y LA CALLE');
    setTagline('Street Resilience • Moda Cristiana con Propósito');
    setSubtitle('"Moda y artículos personalizados con propósito: Diseños urbanos que llevan la Palabra de Dios a todos lados, creados por nosotros o diseñados por ti."');
    setButtonText('Explorar Colección');
    setButtonLink('tienda');
    setSecondaryButtonText('Personaliza Tu Fe (Custom Lab)');
    setSecondaryButtonLink('personalizador');
  };

  const handleSave = () => {
    const updatedSlide: HeroSlide = {
      id: currentSlide.id || 'slide-1',
      title: title.trim() || 'LA PALABRA DE DIOS EN EL ASFALTO Y LA CALLE',
      tagline: tagline.trim() || 'Street Resilience • Moda Cristiana con Propósito',
      subtitle: subtitle.trim() || '"Moda y artículos personalizados con propósito: Diseños urbanos que llevan la Palabra de Dios a todos lados, creados por nosotros o diseñados por ti."',
      image: image || '/src/assets/images/hero_streetwear_1791054715974.jpg',
      buttonText: buttonText.trim() || 'Explorar Colección',
      buttonLink: buttonLink || 'tienda',
      secondaryButtonText: secondaryButtonText.trim() || 'Personaliza Tu Fe (Custom Lab)',
      secondaryButtonLink: secondaryButtonLink || 'personalizador',
      active: true,
      order: 1,
    };

    const remainingSlides = (heroSlides || []).filter((s) => s.id !== updatedSlide.id);
    const newSlides = [updatedSlide, ...remainingSlides];

    updateHeroSlides(newSlides);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3500);
  };

  return (
    <div className="p-4 sm:p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-400 text-[10px] font-mono uppercase tracking-widest mb-1.5">
            <Flame size={12} />
            <span>Encabezado de Inicio • Hero Banner</span>
          </div>
          <h3 className="text-base sm:text-lg font-black uppercase text-white tracking-tight font-brand-heading">
            Portada Principal del Inicio
          </h3>
          <p className="text-xs text-neutral-400 max-w-2xl">
            Modifica la imagen de fondo, el título principal ("LA PALABRA DE DIOS EN EL ASFALTO Y LA CALLE"), subtítulos y botones. Los cambios se guardan y sincronizan al instante en todos los dispositivos.
          </p>
        </div>

        <button
          onClick={handleResetDefault}
          type="button"
          className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-white text-xs font-mono transition-colors cursor-pointer"
          title="Restablecer a la imagen y textos por defecto"
        >
          <RotateCcw size={13} />
          <span>Restablecer Original</span>
        </button>
      </div>

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Grid: Left Editor & Right Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT FORM (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* 1. SELECCIÓN DE IMAGEN DE PORTADA */}
          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 font-mono block">
              1. Imagen de Fondo de Portada
            </span>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              {/* Direct upload button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95 cursor-pointer disabled:opacity-50"
              >
                {isUploading ? (
                  <>
                    <RefreshCw size={15} className="animate-spin" />
                    <span>Optimizando Imagen...</span>
                  </>
                ) : (
                  <>
                    <Upload size={15} />
                    <span>Subir Foto desde tu Teléfono / PC</span>
                  </>
                )}
              </button>

              {/* URL button */}
              <button
                type="button"
                onClick={() => setIsImageUrlInputOpen(!isImageUrlInputOpen)}
                className="w-full sm:w-auto py-3 px-3 rounded-xl bg-neutral-900 border border-neutral-700 hover:border-neutral-600 text-neutral-300 hover:text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Link2 size={15} />
                <span>Pegar Enlace / URL</span>
              </button>
            </div>

            {/* Expandable Image URL Input */}
            {isImageUrlInputOpen && (
              <div className="pt-2 flex items-center gap-2">
                <input
                  type="url"
                  placeholder="https://ejemplo.com/mi-imagen-streetwear.jpg"
                  value={customImageUrl}
                  onChange={(e) => setCustomImageUrl(e.target.value)}
                  className="flex-1 bg-black border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 font-mono"
                />
                <button
                  type="button"
                  onClick={handleApplyCustomUrl}
                  className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                >
                  Aplicar
                </button>
              </div>
            )}

            <div className="text-[11px] text-neutral-500 font-mono">
              Formato recomendado: Paisaje horizontal (16:9 o 1920x1080). Las fotos subidas desde tu dispositivo son comprimidas automáticamente para cargar velozmente en móviles.
            </div>
          </div>

          {/* 2. TEXTOS DE LA PORTADA */}
          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 font-mono block">
              2. Textos & Contenido de la Portada
            </span>

            {/* Título Principal */}
            <div>
              <label className="text-[11px] font-bold uppercase text-neutral-300 block mb-1">
                Título Principal de la Portada:
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="LA PALABRA DE DIOS EN EL ASFALTO Y LA CALLE"
                className="w-full bg-black border border-neutral-700 rounded-lg px-3 py-2.5 text-xs text-white placeholder-neutral-500 font-bold uppercase tracking-tight focus:outline-none focus:border-amber-400 font-brand-heading"
              />
              <span className="text-[10px] text-neutral-500 font-mono mt-1 block">
                Tip: La parte posterior a "EN" se resalta automáticamente con gradiente urbano.
              </span>
            </div>

            {/* Tagline / Insignia */}
            <div>
              <label className="text-[11px] font-bold uppercase text-neutral-300 block mb-1">
                Insignia Superior (Tagline):
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="Street Resilience • Moda Cristiana con Propósito"
                className="w-full bg-black border border-neutral-700 rounded-lg px-3 py-2 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>

            {/* Subtítulo / Frase Concepto */}
            <div>
              <label className="text-[11px] font-bold uppercase text-neutral-300 block mb-1">
                Frase de Concepto / Subtítulo:
              </label>
              <textarea
                rows={3}
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder='"Moda y artículos personalizados con propósito: Diseños urbanos que llevan la Palabra de Dios a todos lados, creados por nosotros o diseñados por ti."'
                className="w-full bg-black border border-neutral-700 rounded-lg p-3 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-amber-400 leading-relaxed"
              />
            </div>

            {/* Botones de Acción */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-[11px] font-bold uppercase text-neutral-300 block mb-1">
                  Texto Botón 1 (Principal):
                </label>
                <input
                  type="text"
                  value={buttonText}
                  onChange={(e) => setButtonText(e.target.value)}
                  className="w-full bg-black border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                />
                <select
                  value={buttonLink}
                  onChange={(e) => setButtonLink(e.target.value)}
                  className="w-full mt-1.5 bg-black border border-neutral-700 rounded-lg px-2.5 py-1 text-[11px] text-neutral-300 focus:outline-none focus:border-amber-400 font-mono"
                >
                  <option value="tienda">Llevar a: Catálogo / Tienda</option>
                  <option value="personalizador">Llevar a: Laboratorio (Custom Lab)</option>
                  <option value="descuentos">Llevar a: Descuentos</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase text-neutral-300 block mb-1">
                  Texto Botón 2 (Secundario):
                </label>
                <input
                  type="text"
                  value={secondaryButtonText}
                  onChange={(e) => setSecondaryButtonText(e.target.value)}
                  className="w-full bg-black border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                />
                <select
                  value={secondaryButtonLink}
                  onChange={(e) => setSecondaryButtonLink(e.target.value)}
                  className="w-full mt-1.5 bg-black border border-neutral-700 rounded-lg px-2.5 py-1 text-[11px] text-neutral-300 focus:outline-none focus:border-amber-400 font-mono"
                >
                  <option value="personalizador">Llevar a: Laboratorio (Custom Lab)</option>
                  <option value="tienda">Llevar a: Catálogo / Tienda</option>
                  <option value="descuentos">Llevar a: Descuentos</option>
                </select>
              </div>
            </div>

          </div>

          {/* SAVE BUTTON */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={handleSave}
              className="flex-1 py-3.5 px-6 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-black text-xs sm:text-sm uppercase tracking-wider transition-all shadow-xl hover:shadow-amber-400/20 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <Check size={16} />
              <span>Guardar Portada & Sincronizar en la Nube</span>
            </button>

            {saveSuccess && (
              <span className="text-emerald-400 text-xs font-bold flex items-center gap-1.5 font-mono animate-pulse">
                <Check size={15} /> ¡Portada Actualizada con Éxito!
              </span>
            )}
          </div>

        </div>

        {/* RIGHT LIVE PREVIEW (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 font-mono flex items-center gap-1.5">
              <Eye size={14} />
              <span>Vista Previa en Vivo (Inicio)</span>
            </span>
            <span className="text-[10px] text-neutral-500 font-mono">
              Cómo lo verán tus clientes
            </span>
          </div>

          {/* Scaled Preview Frame */}
          <div className="relative w-full rounded-2xl overflow-hidden border border-neutral-700 shadow-2xl bg-black min-h-[360px] flex flex-col justify-end p-5">
            {/* Background image preview */}
            <div className="absolute inset-0 z-0">
              <img
                src={image}
                alt="Vista previa de portada"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center filter brightness-[0.45] contrast-125"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/src/assets/images/hero_streetwear_1791054715974.jpg';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-[#0D253A]/50"></div>
              <div className="absolute inset-0 bg-[radial-gradient(#C8C3B3_1px,transparent_1px)] [background-size:18px_18px] opacity-10"></div>
            </div>

            {/* Content overlay */}
            <div className="relative z-10 space-y-3">
              {tagline && (
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-neutral-900/90 border border-neutral-700 text-[#C8C3B3] text-[9px] font-semibold uppercase tracking-wider">
                  <Flame size={11} className="text-amber-400" />
                  <span>{tagline}</span>
                </div>
              )}

              <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight leading-none font-brand-heading">
                {title}
              </h2>

              {subtitle && (
                <p className="text-[11px] text-neutral-300 leading-snug line-clamp-3">
                  {subtitle}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-2 pt-1">
                {buttonText && (
                  <div className="px-3.5 py-1.5 bg-[#C8C3B3] text-black font-extrabold text-[10px] uppercase tracking-wider rounded-lg flex items-center gap-1">
                    <span>{buttonText}</span>
                    <ArrowRight size={12} />
                  </div>
                )}
                {secondaryButtonText && (
                  <div className="px-3 py-1.5 bg-neutral-900/90 border border-neutral-700 text-white font-bold text-[10px] uppercase tracking-wider rounded-lg flex items-center gap-1">
                    <Sparkles size={11} className="text-amber-400" />
                    <span>{secondaryButtonText}</span>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-neutral-800/80 flex items-center gap-3 text-[9px] font-mono text-neutral-400">
                <span>● 100% Algodón 240g</span>
                <span>● DTF Textil HD</span>
                <span>● Caracas</span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-neutral-950/80 border border-neutral-850 text-[11px] text-neutral-400 flex items-start gap-2">
            <Sliders size={14} className="text-amber-400 shrink-0 mt-0.5" />
            <span>
              Cualquier cambio guardado aquí actualiza automáticamente la cabecera en la página web pública y en todos tus dispositivos sincronizados.
            </span>
          </div>

        </div>

      </div>

    </div>
  );
};
