import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Sparkles, 
  Check, 
  Flame, 
  ArrowRight, 
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Crown,
  Eye,
  Sliders,
  Image as ImageIcon,
  Tag,
  Instagram,
  Clock,
  Layers,
  X
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { HeroSlide, SlideType } from '../../types';
import { compressImageFile } from '../../utils/imageCompressor';
import { INITIAL_HERO_SLIDES } from '../../data/initialData';

export const BUTTON_COLOR_PRESETS = [
  { label: 'Oro Éxodo', hex: '#FBBF24' },
  { label: 'Blanco Streetwear', hex: '#FFFFFF' },
  { label: 'Arena Crudo', hex: '#C8C3B3' },
  { label: 'Azul Éxodo', hex: '#0D253A' },
  { label: 'Rosa Neón', hex: '#EC4899' },
  { label: 'Verde Esmeralda', hex: '#10B981' },
  { label: 'Rojo Fuego', hex: '#EF4444' },
  { label: 'Negro Mate', hex: '#171717' },
];

export const getButtonContrastText = (bgColor?: string): string => {
  if (!bgColor) return '#000000';
  const hex = bgColor.replace('#', '').trim();
  if (hex.length === 3) {
    const r = parseInt(hex[0] + hex[0], 16);
    const g = parseInt(hex[1] + hex[1], 16);
    const b = parseInt(hex[2] + hex[2], 16);
    return (r * 299 + g * 587 + b * 114) / 1000 >= 128 ? '#000000' : '#FFFFFF';
  }
  if (hex.length === 6) {
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return (r * 299 + g * 587 + b * 114) / 1000 >= 128 ? '#000000' : '#FFFFFF';
  }
  return '#FFFFFF';
};

export const HeroBannerManager: React.FC = () => {
  const { 
    heroSlides, 
    updateHeroSlides, 
    addHeroSlide, 
    deleteHeroSlide, 
    setPrimaryHeroSlide,
    carouselConfig,
    updateCarouselConfig
  } = useStore();

  const slides = heroSlides && heroSlides.length > 0 ? heroSlides : INITIAL_HERO_SLIDES;
  const primaryId = carouselConfig?.primarySlideId || slides.find((s) => s.isPrimary)?.id || slides[0]?.id;

  // Global Config state
  const [transitionSeconds, setTransitionSeconds] = useState<number>(carouselConfig?.transitionIntervalSeconds || 5);
  const [autoPlay, setAutoPlay] = useState<boolean>(carouselConfig?.autoPlay !== false);
  const [globalSaveFeedback, setGlobalSaveFeedback] = useState<string | null>(null);

  // Edit / Add Slide Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [modalSlideType, setModalSlideType] = useState<SlideType>('hero_principal');
  const [modalTitle, setModalTitle] = useState<string>('');
  const [modalTagline, setModalTagline] = useState<string>('');
  const [modalSubtitle, setModalSubtitle] = useState<string>('');
  const [modalImage, setModalImage] = useState<string>('');
  const [modalButtonText, setModalButtonText] = useState<string>('');
  const [modalButtonLink, setModalButtonLink] = useState<string>('tienda');
  const [modalButtonColor, setModalButtonColor] = useState<string>('#FBBF24');
  const [modalSecondaryButtonText, setModalSecondaryButtonText] = useState<string>('');
  const [modalSecondaryButtonLink, setModalSecondaryButtonLink] = useState<string>('personalizador');
  const [modalSecondaryButtonColor, setModalSecondaryButtonColor] = useState<string>('#0D253A');
  const [modalIsPrimary, setModalIsPrimary] = useState<boolean>(false);
  const [modalFormError, setModalFormError] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const quickUploadSlideIdRef = useRef<string | null>(null);
  const quickFileInputRef = useRef<HTMLInputElement | null>(null);

  // Apply Global Carousel Settings
  const handleSaveGlobalConfig = () => {
    updateCarouselConfig({
      transitionIntervalSeconds: Number(transitionSeconds),
      autoPlay: Boolean(autoPlay),
      primarySlideId: primaryId,
    });
    setGlobalSaveFeedback('¡Configuración del carrusel guardada con éxito!');
    setTimeout(() => setGlobalSaveFeedback(null), 3000);
  };

  // Open Add Slide Modal
  const handleOpenAddModal = () => {
    setEditingSlide(null);
    setModalFormError(null);
    setModalSlideType('promocion');
    setModalTitle('');
    setModalTagline('Drop Especial • ÉXODO Caracas');
    setModalSubtitle('');
    setModalImage('/src/assets/images/hero_streetwear_1791054715974.jpg');
    setModalButtonText('Explorar Catálogo');
    setModalButtonLink('tienda');
    setModalButtonColor('#FBBF24');
    setModalSecondaryButtonText('');
    setModalSecondaryButtonLink('');
    setModalSecondaryButtonColor('#0D253A');
    setModalIsPrimary(false);
    setIsModalOpen(true);
  };

  // Open Edit Slide Modal
  const handleOpenEditModal = (slide: HeroSlide) => {
    setEditingSlide(slide);
    setModalFormError(null);
    setModalSlideType(slide.slideType || 'hero_principal');
    setModalTitle(slide.title);
    setModalTagline(slide.tagline || '');
    setModalSubtitle(slide.subtitle || '');
    setModalImage(slide.image || '/src/assets/images/hero_streetwear_1791054715974.jpg');
    setModalButtonText(slide.buttonText || '');
    setModalButtonLink(slide.buttonLink || 'tienda');
    setModalButtonColor(slide.buttonColor || (slide.slideType === 'hero_principal' ? '#C8C3B3' : slide.slideType === 'dios_fuera_del_templo' ? '#EC4899' : '#FBBF24'));
    setModalSecondaryButtonText(slide.secondaryButtonText || '');
    setModalSecondaryButtonLink(slide.secondaryButtonLink || 'personalizador');
    setModalSecondaryButtonColor(slide.secondaryButtonColor || '#0D253A');
    setModalIsPrimary(slide.id === primaryId || Boolean(slide.isPrimary));
    setIsModalOpen(true);
  };

  // Save Modal (Create or Edit)
  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalTitle.trim()) {
      setModalFormError('Por favor ingresa un título para el apartado.');
      return;
    }

    const slideToSave: HeroSlide = {
      id: editingSlide ? editingSlide.id : `slide-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      slideType: modalSlideType,
      title: modalTitle.trim(),
      tagline: modalTagline.trim(),
      subtitle: modalSubtitle.trim(),
      image: modalImage || '/src/assets/images/hero_streetwear_1791054715974.jpg',
      buttonText: modalButtonText.trim(),
      buttonLink: modalButtonLink.trim() || 'tienda',
      buttonColor: modalButtonColor.trim() || undefined,
      secondaryButtonText: modalSecondaryButtonText.trim() || undefined,
      secondaryButtonLink: modalSecondaryButtonLink.trim() || undefined,
      secondaryButtonColor: modalSecondaryButtonColor.trim() || undefined,
      active: editingSlide ? editingSlide.active !== false : true,
      order: editingSlide ? editingSlide.order : slides.length + 1,
      isPrimary: modalIsPrimary,
    };

    if (editingSlide) {
      const updatedList = slides.map((s) => (s.id === slideToSave.id ? slideToSave : s));
      updateHeroSlides(updatedList);
      if (modalIsPrimary) {
        setPrimaryHeroSlide(slideToSave.id);
      }
    } else {
      addHeroSlide(slideToSave);
      if (modalIsPrimary) {
        setPrimaryHeroSlide(slideToSave.id);
      }
    }

    setIsModalOpen(false);
  };

  // Toggle Slide Active (Show / Hide in carousel)
  const handleToggleSlideActive = (id: string, currentActive: boolean) => {
    const updated = slides.map((s) => (s.id === id ? { ...s, active: !currentActive } : s));
    updateHeroSlides(updated);
  };

  // Move Slide Up / Down
  const handleMoveSlide = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= slides.length) return;

    const list = [...slides];
    const item = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = item;

    // reassign orders
    const reordered = list.map((s, idx) => ({ ...s, order: idx + 1 }));
    updateHeroSlides(reordered);
  };

  // Handle Quick Image Upload for a specific slide
  const handleQuickImageClick = (slideId: string) => {
    quickUploadSlideIdRef.current = slideId;
    if (quickFileInputRef.current) {
      quickFileInputRef.current.click();
    }
  };

  const handleQuickImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const targetId = quickUploadSlideIdRef.current;
    if (!file || !targetId) return;

    try {
      const compressed = await compressImageFile(file, 1600, 0.85);
      const updated = slides.map((s) => (s.id === targetId ? { ...s, image: compressed } : s));
      updateHeroSlides(updated);
      setGlobalSaveFeedback('¡Imagen actualizada con éxito!');
      setTimeout(() => setGlobalSaveFeedback(null), 3000);
    } catch (err) {
      console.error('Error optimizando imagen:', err);
      alert('Error al procesar la imagen.');
    } finally {
      if (e.target) e.target.value = '';
      quickUploadSlideIdRef.current = null;
    }
  };

  // Modal Image Upload
  const handleModalImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingImage(true);
      const compressed = await compressImageFile(file, 1600, 0.85);
      setModalImage(compressed);
    } catch (err) {
      console.error('Error optimizando imagen:', err);
      alert('Error al procesar la imagen.');
    } finally {
      setIsUploadingImage(false);
      if (e.target) e.target.value = '';
    }
  };

  // Helper for slide type badge label
  const getSlideTypeInfo = (type?: SlideType) => {
    switch (type) {
      case 'hero_principal':
        return { label: 'Portada Principal', icon: Flame, color: 'text-amber-400 border-amber-400/40 bg-amber-400/10' };
      case 'piezas_destacadas':
        return { label: 'Piezas Destacadas', icon: Tag, color: 'text-emerald-400 border-emerald-400/40 bg-emerald-400/10' };
      case 'dios_fuera_del_templo':
        return { label: '#DIOSFUERADELTEMPLO', icon: Instagram, color: 'text-pink-400 border-pink-400/40 bg-pink-400/10' };
      case 'promocion':
      default:
        return { label: 'Promoción / Drop', icon: Sparkles, color: 'text-cyan-400 border-cyan-400/40 bg-cyan-400/10' };
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Hidden file input for quick direct image upload */}
      <input
        type="file"
        ref={quickFileInputRef}
        onChange={handleQuickImageChange}
        accept="image/*"
        className="hidden"
      />

      {/* Header & Description */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-400 text-[10px] font-mono uppercase tracking-widest mb-1.5">
            <Flame size={12} />
            <span>Gestor del Carrusel de Inicio</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black uppercase text-white tracking-tight font-brand-heading">
            Carrusel de Inicio (Portada, Destacados y Promociones)
          </h2>
          <p className="text-xs text-neutral-400 max-w-2xl mt-0.5">
            Personaliza el orden de los apartados, añade nuevas imágenes o promociones, define cuál es la portada principal y ajusta el tiempo de rotación automática.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-black text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-amber-400/20 cursor-pointer self-start sm:self-auto shrink-0"
        >
          <Plus size={15} />
          <span>+ Agregar Apartado / Promo</span>
        </button>
      </div>

      {/* Save feedback alert */}
      {globalSaveFeedback && (
        <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <Check size={16} />
          <span>{globalSaveFeedback}</span>
        </div>
      )}

      {/* ======================================================== */}
      {/* PANEL 1: CONTROL DE TIEMPO Y CONFIGURACIÓN GLOBAL        */}
      {/* ======================================================== */}
      <div className="p-4 sm:p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-neutral-800/80">
          <Clock size={16} className="text-amber-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-200">
            Control de Rotación y Transición del Carrusel
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
          {/* Transition Time Slider */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="text-neutral-400">Tiempo de Transición:</span>
              <span className="text-amber-400 font-mono font-bold">{transitionSeconds} Segundos</span>
            </div>
            <input
              type="range"
              min={3}
              max={15}
              step={1}
              value={transitionSeconds}
              onChange={(e) => setTransitionSeconds(parseInt(e.target.value))}
              className="w-full accent-amber-400 bg-neutral-800 cursor-pointer"
            />
            <p className="text-[10px] text-neutral-500">
              Tiempo que permanece cada apartado en pantalla antes de avanzar automáticamente.
            </p>
          </div>

          {/* Autoplay Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-950 border border-neutral-800">
            <div>
              <span className="text-xs font-bold text-white block">Rotación Automática</span>
              <span className="text-[10px] text-neutral-400 block">
                {autoPlay ? 'El carrusel avanza solo' : 'Avance manual por botones'}
              </span>
            </div>
            <button
              onClick={() => setAutoPlay(!autoPlay)}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                autoPlay ? 'bg-amber-400' : 'bg-neutral-800'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-black transition-transform absolute top-1 ${
                  autoPlay ? 'left-6' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* Save Button */}
          <div className="flex items-end">
            <button
              onClick={handleSaveGlobalConfig}
              className="w-full py-2.5 bg-neutral-800 hover:bg-[#0D253A] hover:border-amber-400/50 border border-neutral-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <Check size={14} className="text-amber-400" />
              <span>Guardar Configuración de Tiempo</span>
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* PANEL 2: LISTADO DE APARTADOS / SLIDES ACTIVOS           */}
      {/* ======================================================== */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 font-mono">
            Apartados en el Carrusel ({slides.length})
          </span>
          <span className="text-[11px] text-neutral-500">
            La portada principal es la primera imagen/apartado que verán tus visitantes.
          </span>
        </div>

        <div className="space-y-3">
          {slides.map((slide, idx) => {
            const isPrimary = slide.id === primaryId || Boolean(slide.isPrimary);
            const typeInfo = getSlideTypeInfo(slide.slideType);
            const TypeIcon = typeInfo.icon;
            const isActive = slide.active !== false;

            return (
              <div
                key={slide.id}
                className={`p-3.5 sm:p-5 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isPrimary
                    ? 'bg-neutral-900/90 border-amber-400/70 shadow-lg shadow-amber-400/10 ring-1 ring-amber-400/30'
                    : isActive
                    ? 'bg-neutral-900/40 border-neutral-800/80 hover:border-neutral-700'
                    : 'bg-neutral-950/40 border-neutral-900 opacity-60'
                }`}
              >
                {/* Left: Thumbnail & Info */}
                <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
                  {/* Thumbnail with quick upload overlay */}
                  <div className="relative w-20 h-20 sm:w-28 sm:h-24 rounded-xl overflow-hidden bg-neutral-950 border border-neutral-800 shrink-0 group">
                    <img
                      src={slide.image || '/src/assets/images/hero_streetwear_1791054715974.jpg'}
                      alt={slide.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = '/src/assets/images/hero_streetwear_1791054715974.jpg';
                      }}
                    />
                    <button
                      onClick={() => handleQuickImageClick(slide.id)}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 text-[9px] font-mono uppercase text-white cursor-pointer"
                      title="Cambiar imagen de este apartado"
                    >
                      <Upload size={14} className="text-amber-400" />
                      <span>Cambiar</span>
                    </button>
                  </div>

                  {/* Text Description */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5 mb-1">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-mono uppercase font-bold border ${typeInfo.color}`}>
                        <TypeIcon size={10} />
                        <span>{typeInfo.label}</span>
                      </span>

                      {isPrimary && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-mono uppercase font-black bg-amber-400 text-black shadow-sm">
                          <Crown size={10} />
                          <span>PORTADA PRINCIPAL</span>
                        </span>
                      )}

                      {!isActive && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono uppercase bg-neutral-800 text-neutral-400">
                          Oculto
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm sm:text-base font-bold text-white truncate font-brand-heading">
                      {slide.title}
                    </h4>

                    {slide.subtitle && (
                      <p className="text-xs text-neutral-400 line-clamp-1 mt-0.5">
                        {slide.subtitle}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-3 mt-2 text-[10px] font-mono text-neutral-400">
                      <span className="flex items-center gap-1.5 bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800">
                        <span>Botón:</span>
                        <span 
                          className="w-2.5 h-2.5 rounded-full inline-block border border-black/40" 
                          style={{ backgroundColor: slide.buttonColor || '#FBBF24' }} 
                          title={`Color: ${slide.buttonColor || '#FBBF24'}`}
                        />
                        <strong className="text-neutral-200">{slide.buttonText || 'Ver Más'}</strong>
                        <span className="text-neutral-500">→ {slide.buttonLink || 'tienda'}</span>
                      </span>
                      {slide.secondaryButtonText && (
                        <span className="flex items-center gap-1.5 bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800">
                          <span>Botón 2:</span>
                          <span 
                            className="w-2.5 h-2.5 rounded-full inline-block border border-black/40" 
                            style={{ backgroundColor: slide.secondaryButtonColor || '#0D253A' }} 
                            title={`Color: ${slide.secondaryButtonColor || '#0D253A'}`}
                          />
                          <strong className="text-neutral-200">{slide.secondaryButtonText}</strong>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex flex-wrap items-center gap-2 self-end md:self-auto shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-neutral-800/80 w-full md:w-auto justify-end">
                  
                  {/* Reorder Up / Down */}
                  <div className="flex items-center border border-neutral-800 rounded-lg overflow-hidden bg-neutral-950">
                    <button
                      onClick={() => handleMoveSlide(idx, 'up')}
                      disabled={idx === 0}
                      className="p-2 text-neutral-400 hover:text-white disabled:opacity-30 disabled:hover:text-neutral-400 transition-colors cursor-pointer"
                      title="Mover arriba"
                    >
                      <ChevronUp size={15} />
                    </button>
                    <div className="w-[1px] h-4 bg-neutral-800" />
                    <button
                      onClick={() => handleMoveSlide(idx, 'down')}
                      disabled={idx === slides.length - 1}
                      className="p-2 text-neutral-400 hover:text-white disabled:opacity-30 disabled:hover:text-neutral-400 transition-colors cursor-pointer"
                      title="Mover abajo"
                    >
                      <ChevronDown size={15} />
                    </button>
                  </div>

                  {/* Make Primary Slide */}
                  {!isPrimary && (
                    <button
                      onClick={() => setPrimaryHeroSlide(slide.id)}
                      className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-amber-400 hover:text-black text-amber-300 border border-neutral-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                      title="Hacer que este apartado aparezca de primero en el inicio"
                    >
                      <Crown size={13} />
                      <span className="hidden sm:inline">Hacer Principal</span>
                    </button>
                  )}

                  {/* Toggle Active */}
                  <button
                    onClick={() => handleToggleSlideActive(slide.id, isActive)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer border ${
                      isActive
                        ? 'bg-neutral-900 border-neutral-700 text-neutral-300 hover:text-white'
                        : 'bg-emerald-950 border-emerald-600/50 text-emerald-300'
                    }`}
                  >
                    {isActive ? 'Ocultar' : 'Activar'}
                  </button>

                  {/* Edit Slide Button */}
                  <button
                    onClick={() => handleOpenEditModal(slide)}
                    className="px-3 py-1.5 rounded-lg bg-[#0D253A] hover:bg-[#133754] text-white border border-neutral-700 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Editar
                  </button>

                  {/* Delete Slide Button (Only if more than 1 slide) */}
                  {slides.length > 1 && (
                    <button
                      onClick={() => {
                        const confirmed = window.confirm(`¿Seguro que deseas eliminar el apartado "${slide.title}" del carrusel?`);
                        if (confirmed) {
                          deleteHeroSlide(slide.id);
                        }
                      }}
                      className="p-2 rounded-lg bg-neutral-900 hover:bg-red-950/80 text-neutral-400 hover:text-red-400 border border-neutral-800 transition-colors cursor-pointer"
                      title="Eliminar este apartado"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODAL: AGREGAR O EDITAR APARTADO DEL CARRUSEL            */}
      {/* ======================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl bg-neutral-950 border border-neutral-800 p-5 sm:p-7 shadow-2xl text-left space-y-5">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <Flame size={18} className="text-amber-400" />
                <h3 className="text-base sm:text-lg font-black uppercase text-white font-brand-heading">
                  {editingSlide ? 'Editar Apartado del Carrusel' : 'Agregar Nuevo Apartado al Carrusel'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full bg-neutral-900 text-neutral-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-4">
              
              {/* Type selector */}
              <div>
                <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider block mb-1.5">
                  Tipo de Apartado:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'hero_principal', label: 'Portada Principal', icon: Flame },
                    { id: 'piezas_destacadas', label: 'Piezas Destacadas', icon: Tag },
                    { id: 'dios_fuera_del_templo', label: '#DIOSFUERADELTEMPLO', icon: Instagram },
                    { id: 'promocion', label: 'Promoción / Drop', icon: Sparkles },
                  ].map((t) => {
                    const isSelected = modalSlideType === t.id;
                    const Icon = t.icon;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setModalSlideType(t.id as SlideType)}
                        className={`p-2.5 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-amber-400/20 border-amber-400 text-white shadow-md'
                            : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                        }`}
                      >
                        <Icon size={14} className={isSelected ? 'text-amber-400' : 'text-neutral-500'} />
                        <span className="text-[11px] font-bold uppercase">{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Image Upload / Preview */}
              <div>
                <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider block mb-1.5">
                  Imagen de Fondo del Apartado:
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-20 rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800 shrink-0">
                    <img
                      src={modalImage || '/src/assets/images/hero_streetwear_1791054715974.jpg'}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingImage}
                      className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <Upload size={14} className="text-amber-400" />
                      <span>{isUploadingImage ? 'Optimizando imagen...' : 'Subir Imagen desde PC/Teléfono'}</span>
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleModalImageUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <input
                      type="text"
                      placeholder="O pega URL de imagen (ej. /src/assets/...)"
                      value={modalImage}
                      onChange={(e) => setModalImage(e.target.value)}
                      className="w-full p-2 rounded-lg bg-neutral-900 border border-neutral-800 text-xs text-white placeholder-neutral-500"
                    />
                  </div>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider block mb-1">
                  Título Principal:
                </label>
                <input
                  type="text"
                  required
                  value={modalTitle}
                  onChange={(e) => setModalTitle(e.target.value)}
                  placeholder="ej. LA PALABRA DE DIOS EN EL ASFALTO Y LA CALLE"
                  className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-sm font-bold text-white placeholder-neutral-500"
                />
              </div>

              {/* Tagline */}
              <div>
                <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider block mb-1">
                  Etiqueta / Tagline Superior:
                </label>
                <input
                  type="text"
                  value={modalTagline}
                  onChange={(e) => setModalTagline(e.target.value)}
                  placeholder="ej. Street Resilience • Moda Cristiana con Propósito"
                  className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white placeholder-neutral-500"
                />
              </div>

              {/* Subtitle / Small Description */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider block">
                    Pequeña Descripción del Apartado:
                  </label>
                  <span className="text-[10px] text-amber-400 font-mono">Requerido para la portada</span>
                </div>
                <textarea
                  rows={2}
                  value={modalSubtitle}
                  onChange={(e) => setModalSubtitle(e.target.value)}
                  placeholder='ej. "Moda y artículos personalizados con propósito: Diseños urbanos que llevan la Palabra de Dios a todos lados..."'
                  className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Error feedback if any */}
              {modalFormError && (
                <div className="p-3 rounded-xl bg-red-950/80 border border-red-800/80 text-red-200 text-xs">
                  {modalFormError}
                </div>
              )}

              {/* Buttons Configuration Section */}
              <div className="space-y-4 pt-3 border-t border-neutral-800/80">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Configuración de Botones y Colores del Apartado
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Button 1 (Principal) */}
                  <div className="p-3.5 rounded-xl bg-neutral-900/80 border border-neutral-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                        1. Botón Principal
                      </label>
                      <span className="text-[10px] font-mono text-neutral-400">Acción primaria</span>
                    </div>

                    <div>
                      <span className="text-[11px] text-neutral-400 block mb-1">¿Qué dirá el botón?</span>
                      <input
                        type="text"
                        placeholder="ej. Explorar Colección, Ver Catálogo, Ir a Tienda..."
                        value={modalButtonText}
                        onChange={(e) => setModalButtonText(e.target.value)}
                        className="w-full p-2 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <span className="text-[11px] text-neutral-400 block mb-1">¿A qué apartado lo lleva?</span>
                      <select
                        value={modalButtonLink}
                        onChange={(e) => setModalButtonLink(e.target.value)}
                        className="w-full p-2 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-amber-400"
                      >
                        <option value="tienda">Tienda / Todo el Catálogo</option>
                        <option value="personalizador">Personaliza Tu Fe (Custom Lab)</option>
                        <option value="descuentos">Piezas con Descuento</option>
                        <option value="palabra">La Palabra (Devocionales)</option>
                        <option value="nosotros">Nosotros</option>
                        <option value="https://instagram.com/exodo.vzl">Instagram Oficial (@exodo.vzl)</option>
                      </select>
                    </div>

                    {/* Button 1 Color Picker */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] text-neutral-400">Color del Botón:</span>
                        <span className="text-[10px] font-mono text-neutral-400">{modalButtonColor}</span>
                      </div>

                      {/* Presets Grid */}
                      <div className="grid grid-cols-4 gap-1.5 mb-2">
                        {BUTTON_COLOR_PRESETS.map((preset) => (
                          <button
                            key={preset.hex}
                            type="button"
                            onClick={() => setModalButtonColor(preset.hex)}
                            className={`p-1.5 rounded-lg border text-[10px] font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
                              modalButtonColor.toLowerCase() === preset.hex.toLowerCase()
                                ? 'border-amber-400 bg-neutral-800 text-white'
                                : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white'
                            }`}
                            title={preset.label}
                          >
                            <span 
                              className="w-3 h-3 rounded-full shrink-0 border border-black/30"
                              style={{ backgroundColor: preset.hex }} 
                            />
                            <span className="truncate">{preset.label.split(' ')[0]}</span>
                          </button>
                        ))}
                      </div>

                      {/* Custom Color input + Hex text */}
                      <div className="flex items-center gap-2">
                        <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-neutral-700 shrink-0">
                          <input
                            type="color"
                            value={modalButtonColor.startsWith('#') ? modalButtonColor : '#FBBF24'}
                            onChange={(e) => setModalButtonColor(e.target.value)}
                            className="absolute -inset-2 w-12 h-12 cursor-pointer"
                            title="Seleccionar color personalizado"
                          />
                        </div>
                        <input
                          type="text"
                          value={modalButtonColor}
                          onChange={(e) => setModalButtonColor(e.target.value)}
                          placeholder="#FBBF24"
                          className="flex-1 p-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-xs font-mono text-white"
                        />
                      </div>

                      {/* Live Button Preview */}
                      <div className="mt-2.5 pt-2 border-t border-neutral-800 flex items-center justify-between">
                        <span className="text-[10px] text-neutral-500 font-mono">Vista previa:</span>
                        <div 
                          style={{
                            backgroundColor: modalButtonColor,
                            color: getButtonContrastText(modalButtonColor),
                          }}
                          className="px-3 py-1.5 rounded-lg text-xs font-extrabold uppercase tracking-wider shadow"
                        >
                          {modalButtonText || 'Explorar Colección'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Button 2 (Secundario Opcional) */}
                  <div className="p-3.5 rounded-xl bg-neutral-900/80 border border-neutral-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                        2. Botón Secundario (Opcional)
                      </label>
                      <span className="text-[10px] font-mono text-neutral-500">Dejar vacío para omitir</span>
                    </div>

                    <div>
                      <span className="text-[11px] text-neutral-400 block mb-1">¿Qué dirá el botón?</span>
                      <input
                        type="text"
                        placeholder="ej. Personaliza Tu Fe, Descuentos..."
                        value={modalSecondaryButtonText}
                        onChange={(e) => setModalSecondaryButtonText(e.target.value)}
                        className="w-full p-2 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <span className="text-[11px] text-neutral-400 block mb-1">¿A qué apartado lo lleva?</span>
                      <select
                        value={modalSecondaryButtonLink}
                        onChange={(e) => setModalSecondaryButtonLink(e.target.value)}
                        className="w-full p-2 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-amber-400"
                      >
                        <option value="personalizador">Personaliza Tu Fe (Custom Lab)</option>
                        <option value="tienda">Tienda / Todo el Catálogo</option>
                        <option value="descuentos">Piezas con Descuento</option>
                        <option value="palabra">La Palabra (Devocionales)</option>
                        <option value="nosotros">Nosotros</option>
                        <option value="https://instagram.com/exodo.vzl">Instagram Oficial (@exodo.vzl)</option>
                      </select>
                    </div>

                    {/* Button 2 Color Picker */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] text-neutral-400">Color del Botón Secundario:</span>
                        <span className="text-[10px] font-mono text-neutral-400">{modalSecondaryButtonColor}</span>
                      </div>

                      {/* Presets Grid */}
                      <div className="grid grid-cols-4 gap-1.5 mb-2">
                        {BUTTON_COLOR_PRESETS.map((preset) => (
                          <button
                            key={preset.hex}
                            type="button"
                            onClick={() => setModalSecondaryButtonColor(preset.hex)}
                            className={`p-1.5 rounded-lg border text-[10px] font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
                              modalSecondaryButtonColor.toLowerCase() === preset.hex.toLowerCase()
                                ? 'border-amber-400 bg-neutral-800 text-white'
                                : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white'
                            }`}
                            title={preset.label}
                          >
                            <span 
                              className="w-3 h-3 rounded-full shrink-0 border border-black/30"
                              style={{ backgroundColor: preset.hex }} 
                            />
                            <span className="truncate">{preset.label.split(' ')[0]}</span>
                          </button>
                        ))}
                      </div>

                      {/* Custom Color input + Hex text */}
                      <div className="flex items-center gap-2">
                        <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-neutral-700 shrink-0">
                          <input
                            type="color"
                            value={modalSecondaryButtonColor.startsWith('#') ? modalSecondaryButtonColor : '#0D253A'}
                            onChange={(e) => setModalSecondaryButtonColor(e.target.value)}
                            className="absolute -inset-2 w-12 h-12 cursor-pointer"
                            title="Seleccionar color personalizado"
                          />
                        </div>
                        <input
                          type="text"
                          value={modalSecondaryButtonColor}
                          onChange={(e) => setModalSecondaryButtonColor(e.target.value)}
                          placeholder="#0D253A"
                          className="flex-1 p-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-xs font-mono text-white"
                        />
                      </div>

                      {/* Live Button Preview */}
                      {modalSecondaryButtonText ? (
                        <div className="mt-2.5 pt-2 border-t border-neutral-800 flex items-center justify-between">
                          <span className="text-[10px] text-neutral-500 font-mono">Vista previa:</span>
                          <div 
                            style={{
                              backgroundColor: modalSecondaryButtonColor,
                              color: getButtonContrastText(modalSecondaryButtonColor),
                            }}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider shadow border border-neutral-700/60"
                          >
                            {modalSecondaryButtonText}
                          </div>
                        </div>
                      ) : (
                        <div className="mt-2.5 pt-2 border-t border-neutral-800 text-[10px] text-neutral-500 font-mono text-center">
                          (Botón secundario desactivado al estar vacío)
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Set as Primary Checkbox */}
              <div className="pt-2">
                <label className="flex items-center gap-2.5 p-3 rounded-xl bg-neutral-900 border border-neutral-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={modalIsPrimary}
                    onChange={(e) => setModalIsPrimary(e.target.checked)}
                    className="rounded accent-amber-400 w-4 h-4"
                  />
                  <div>
                    <span className="text-xs font-bold text-white block">Establecer como Portada Principal del Inicio</span>
                    <span className="text-[10px] text-neutral-400 block">
                      Este apartado será el primero que se mostrará al entrar a la página.
                    </span>
                  </div>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-bold uppercase transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-amber-400/20 cursor-pointer"
                >
                  {editingSlide ? 'Guardar Cambios' : 'Crear Apartado'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
