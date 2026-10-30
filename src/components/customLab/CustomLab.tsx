import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, 
  BookOpen, 
  RotateCw, 
  ShoppingBag, 
  Check, 
  Layers, 
  Trash2,
  RefreshCw,
  Move,
  Maximize2,
  Minimize2,
  Eye,
  Sparkles,
  SlidersHorizontal,
  ChevronRight,
  Info,
  Ruler,
  FlipHorizontal,
  Tag,
  ImageIcon
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { ProductColor, PrintAreaSizeConfig } from '../../types';

interface BiblicalVerse {
  book: string;
  reference: string;
  text: string;
}

interface LaminaMeasureItem {
  id: string;
  label: string;
  price: number;
  desc: string;
}

const PRESET_VERSES: BiblicalVerse[] = [
  {
    book: 'Romanos',
    reference: 'Romanos 8:31',
    text: 'Si Dios es por nosotros, ¿quién contra nosotros?',
  },
  {
    book: '1 Corintios',
    reference: '1 Corintios 15:57',
    text: 'Mas a Dios gracias, que nos da la victoria por medio de Jesucristo.',
  },
  {
    book: 'Josué',
    reference: 'Josué 1:9',
    text: 'Mira que te mando que te esfuerces y seas muy valiente.',
  },
  {
    book: 'Filipenses',
    reference: 'Filipenses 4:13',
    text: 'Todo lo puedo en Cristo que me fortalece.',
  },
  {
    book: 'Isaías',
    reference: 'Isaías 40:31',
    text: 'Los que esperan en Jehová tendrán nuevas fuerzas; levantarán alas como las águilas.',
  },
  {
    book: 'Apocalipsis',
    reference: 'Apocalipsis 5:5',
    text: 'He aquí que el León de la tribu de Judá ha vencido.',
  },
  {
    book: 'Salmos',
    reference: 'Salmos 23:1',
    text: 'Jehová es mi pastor; nada me faltará.',
  },
  {
    book: 'Salmos',
    reference: 'Salmos 33:12',
    text: 'Bienaventurada la nación cuyo Dios es Jehová.',
  },
  {
    book: '2 Corintios',
    reference: '2 Corintios 5:21',
    text: 'Al que no conoció pecado, por nosotros lo hizo pecado.',
  },
];

export const CustomLab: React.FC = () => {
  const { 
    addToCart, 
    exchangeRateBCV, 
    artworkDesigns, 
    labPricingConfig, 
    customLabMockups 
  } = useStore();

  // Selected Product Base Support
  const [productType, setProductType] = useState<'franela' | 'tote' | 'lamina' | 'stickers'>('franela');
  
  // Apparel Options
  const [fitType, setFitType] = useState<'Corte Normal' | 'Oversize'>('Corte Normal');
  const [size, setSize] = useState<string>('L');
  
  // Ubicación del Estampado (Delante / Detrás / Ambos Lados)
  const [printLocation, setPrintLocation] = useState<'delante' | 'detras' | 'ambos_lados'>('delante');
  const [canvasView, setCanvasView] = useState<'delante' | 'detras'>('delante');

  // Medidas en Centímetros del Estampado
  const printAreaSizes: PrintAreaSizeConfig[] = labPricingConfig?.printAreaSizes || [
    { id: 'pocket', label: 'Bolsillo / Pecho', dimensionsCm: '10 x 10 cm', surchargeUSD: 0, recommendedFor: 'Pecho o manga' },
    { id: 'a4', label: 'Estándar A4', dimensionsCm: '21 x 30 cm', surchargeUSD: 0, recommendedFor: 'Frente o espalda estándar' },
    { id: 'a3', label: 'Grande A3', dimensionsCm: '30 x 42 cm', surchargeUSD: 2, recommendedFor: 'Espalda completa protagonista' },
    { id: 'maxi', label: 'Maxi Print XL', dimensionsCm: '35 x 48 cm', surchargeUSD: 4, recommendedFor: 'Oversize full print' },
  ];
  const [selectedPrintSize, setSelectedPrintSize] = useState<PrintAreaSizeConfig>(printAreaSizes[1]); // Default A4

  // 4 Colors Available: Blanco, Negro, Arena, Azul
  const availableColors: ProductColor[] = [
    { name: 'Blanco Puro', hex: '#FFFFFF' },
    { name: 'Negro Pitch', hex: '#000000' },
    { name: 'Arena Concreto', hex: '#D2B48C' },
    { name: 'Azul Éxodo', hex: '#0D253A' },
  ];
  const [selectedColor, setSelectedColor] = useState<ProductColor>(availableColors[1]); // Default Negro

  // Sublimation Plate (Lámina) Parameters from config
  const laminaMeasures: LaminaMeasureItem[] = labPricingConfig?.laminaSizes?.map(l => ({
    id: l.id,
    label: l.dimensions,
    price: l.priceUSD,
    desc: l.name,
  })) || [
    { id: '20x30', label: '20 x 30 cm', price: 18, desc: 'Ideal para escritorio o repisa' },
    { id: '30x40', label: '30 x 40 cm', price: 25, desc: 'Formato cuadro mediano estándar' },
    { id: '40x50', label: '40 x 50 cm', price: 34, desc: 'Cuadro de pared protagonista' },
    { id: '50x70', label: '50 x 70 cm', price: 48, desc: 'Póster metálico gran formato' },
  ];
  const [laminaMeasure, setLaminaMeasure] = useState<LaminaMeasureItem>(laminaMeasures[1]); // default 30x40 cm
  const [laminaQuantity, setLaminaQuantity] = useState<number>(1);

  // Sticker Options
  const [stickerFinish, setStickerFinish] = useState<'Vinilo' | 'Papel Fotográfico' | 'UV DTF'>('UV DTF');
  const [stickerQuantity, setStickerQuantity] = useState<number>(10);

  // Active Tool Tab: 'upload' | 'presets' | 'verses' | 'options'
  const [activeTab, setActiveTab] = useState<'upload' | 'presets' | 'verses' | 'options'>('upload');

  // CLEAN CANVAS DEFAULT (No sample design pre-loaded as requested)
  const [placedArtworkUrl, setPlacedArtworkUrl] = useState<string | null>(null);
  const [placedText, setPlacedText] = useState<string>('');
  const [textColor, setTextColor] = useState<string>('#FFFFFF');
  const [textFont, setTextFont] = useState<string>('font-brand-heading');

  // Direct Interactive Canvas State (Canva-style dragging & scaling)
  const [artworkPos, setArtworkPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [artworkScale, setArtworkScale] = useState<number>(1);
  const [artworkRotate, setArtworkRotate] = useState<number>(0);

  // Dragging state
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Verse Search
  const [verseSearch, setVerseSearch] = useState<string>('');

  // Cart Toast
  const [addedToast, setAddedToast] = useState(false);

  // Synchronize canvas view with printLocation
  useEffect(() => {
    if (printLocation === 'detras') {
      setCanvasView('detras');
    } else if (printLocation === 'delante') {
      setCanvasView('delante');
    }
  }, [printLocation]);

  // Size restriction: Oversize only available up to 'L'
  useEffect(() => {
    if (fitType === 'Oversize' && (size === 'XL' || size === '2XL' || size === '3XL' || size === '4XL')) {
      setSize('L');
    }
  }, [fitType, size]);

  // Check for uploaded Image Mockups in customLabMockups matching productType and view
  const matchingUploadedMockup = customLabMockups?.find(
    (m) => m.category === (productType === 'franela' ? 'franela' : productType === 'tote' ? 'tote' : productType === 'lamina' ? 'lamina' : 'stickers')
      && (productType !== 'franela' || m.view === canvasView)
  );

  // Automated Pricing Engine Calculation (Itemized)
  const calculatePricingBreakdown = () => {
    let base = 25;
    let oversizeDelta = 0;
    let sizeExtra = 0;
    let locationDelta = 0;
    let sizeAreaDelta = 0;

    if (productType === 'franela') {
      base = labPricingConfig?.franelaBasePrice || 25;
      
      if (fitType === 'Oversize') {
        oversizeDelta = labPricingConfig?.oversizeExtraDelta ?? 4;
      } else {
        const perX = labPricingConfig?.xlExtraDeltaPerX ?? 1.0;
        if (size === 'XL') sizeExtra = 1 * perX;
        else if (size === '2XL') sizeExtra = 2 * perX;
        else if (size === '3XL') sizeExtra = 3 * perX;
        else if (size === '4XL') sizeExtra = 4 * perX;
      }

      if (printLocation === 'ambos_lados') {
        locationDelta = labPricingConfig?.bothSidesDelta ?? 6.0;
      }

      sizeAreaDelta = selectedPrintSize?.surchargeUSD || 0;

      const total = base + oversizeDelta + sizeExtra + locationDelta + sizeAreaDelta;
      return { base, oversizeDelta, sizeExtra, locationDelta, sizeAreaDelta, total };
    }

    if (productType === 'tote') {
      base = labPricingConfig?.toteBasePrice || 16;
      if (printLocation === 'ambos_lados') {
        locationDelta = labPricingConfig?.bothSidesDelta ? labPricingConfig.bothSidesDelta / 2 : 4;
      }
      sizeAreaDelta = selectedPrintSize?.surchargeUSD ? selectedPrintSize.surchargeUSD / 2 : 0;
      const total = base + locationDelta + sizeAreaDelta;
      return { base, oversizeDelta: 0, sizeExtra: 0, locationDelta, sizeAreaDelta, total };
    }

    if (productType === 'lamina') {
      const unit = laminaMeasure.price;
      const total = unit * laminaQuantity;
      return { base: unit, oversizeDelta: 0, sizeExtra: 0, locationDelta: 0, sizeAreaDelta: 0, total };
    }

    if (productType === 'stickers') {
      let total = 10;
      if (stickerQuantity === 5) total = 6;
      else if (stickerQuantity === 10) total = 10;
      else if (stickerQuantity === 25) total = 20;
      else total = 35;
      return { base: total, oversizeDelta: 0, sizeExtra: 0, locationDelta: 0, sizeAreaDelta: 0, total };
    }

    return { base: 25, oversizeDelta: 0, sizeExtra: 0, locationDelta: 0, sizeAreaDelta: 0, total: 25 };
  };

  const pricing = calculatePricingBreakdown();
  const currentPrice = pricing.total;

  // Pointer Handlers for Direct Canva-like Manipulation
  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - artworkPos.x,
      y: e.clientY - artworkPos.y,
    });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    setArtworkPos({
      x: Math.max(-130, Math.min(130, newX)),
      y: Math.max(-130, Math.min(130, newY)),
    });
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  // File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPlacedArtworkUrl(reader.result as string);
      setArtworkPos({ x: 0, y: 0 });
      setArtworkScale(1);
      setArtworkRotate(0);
    };
    reader.readAsDataURL(file);
  };

  // Add Custom Creation to Cart (Generates unique cartId for MULTIPLE customized products)
  const handleAddToCart = () => {
    const uniqueId = `custom-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    
    let customTitle = '';
    if (productType === 'franela') {
      const locLabel = printLocation === 'ambos_lados' ? 'Ambos Lados' : printLocation === 'detras' ? 'Espalda' : 'Frente';
      customTitle = `Franela ${fitType} (Talla ${size} - ${selectedColor.name} - ${locLabel} - ${selectedPrintSize.label})`;
    } else if (productType === 'tote') {
      const locLabel = printLocation === 'ambos_lados' ? 'Ambos Lados' : 'Frente';
      customTitle = `Tote Bag Personalizado (${locLabel} - ${selectedPrintSize.label})`;
    } else if (productType === 'lamina') {
      customTitle = `Lámina de Aluminio Sublimada (${laminaMeasure.label} x${laminaQuantity})`;
    } else {
      customTitle = `Pack Stickers Personalizados (${stickerQuantity}u - ${stickerFinish})`;
    }

    addToCart({
      cartId: uniqueId,
      productId: `custom-prod-${productType}-${Date.now()}`,
      product: {
        id: `custom-prod-${productType}-${Date.now()}`,
        name: customTitle,
        slug: `pieza-personalizada-${productType}-${uniqueId}`,
        category: productType === 'franela' ? 'franelas' : productType === 'tote' ? 'tote-bags' : productType === 'lamina' ? 'laminas' : 'stickers',
        collection: 'Personalizado en Laboratorio',
        basePrice: currentPrice,
        oversizePriceDelta: fitType === 'Oversize' ? 4 : 0,
        images: [placedArtworkUrl || matchingUploadedMockup?.imageUrl || '/src/assets/images/hero_streetwear_1791054715974.jpg'],
        scripture: placedText || 'Diseño Exclusivo ÉXODO Caracas',
        spiritualMeaning: 'Pieza personalizada creada por el cliente en el Laboratorio ÉXODO.',
        materialSpecs: productType === 'franela' 
          ? `100% Algodón Peinado Pesado 240g/m² (${fitType}) • Estampado DTF Textil HD • Estampado en: ${printLocation.toUpperCase()} (${selectedPrintSize.dimensionsCm})`
          : productType === 'lamina'
          ? `Placa de Aluminio Náutico Pulido (${laminaMeasure.label}) con 4 perforaciones de montaje`
          : productType === 'stickers'
          ? `Impresión ${stickerFinish} impermeable de alta adherencia`
          : 'Lienzo de algodón crudo 100% biodegradable',
        unifiedDescription: `Personalización directa: ${customTitle}. ${placedText ? `Texto incluido: "${placedText}".` : ''}`,
        availableSizes: [size],
        availableColors: [selectedColor],
        stock: 99,
        isFeatured: false,
        createdAt: new Date().toISOString(),
      },
      quantity: productType === 'lamina' ? laminaQuantity : 1,
      selectedSize: productType === 'franela' ? size : undefined,
      selectedColor: productType === 'franela' ? selectedColor : undefined,
      fitType: productType === 'franela' ? fitType : undefined,
      selectedFinish: productType === 'stickers' ? stickerFinish : undefined,
      unitPrice: productType === 'lamina' ? laminaMeasure.price : currentPrice,
      customDesign: {
        mockupUrl: matchingUploadedMockup?.imageUrl || placedArtworkUrl || undefined,
        customArtworkUrl: placedArtworkUrl || undefined,
        verseText: placedText || undefined,
        laminaMeasure: productType === 'lamina' ? laminaMeasure.label : undefined,
        laminaQuantity: productType === 'lamina' ? laminaQuantity : undefined,
        printLocation: printLocation,
        printDimensionsCm: `${selectedPrintSize.dimensionsCm} (${selectedPrintSize.label})`,
        scale: artworkScale,
        rotate: artworkRotate,
        posX: artworkPos.x,
        posY: artworkPos.y,
      },
    });

    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2500);
  };

  const filteredVerses = PRESET_VERSES.filter(
    (v) =>
      v.reference.toLowerCase().includes(verseSearch.toLowerCase()) ||
      v.text.toLowerCase().includes(verseSearch.toLowerCase()) ||
      v.book.toLowerCase().includes(verseSearch.toLowerCase())
  );

  return (
    <div className="bg-black min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-amber-400">
            <Sparkles size={14} />
            <span>Estudio de Diseño & Personalización ÉXODO Caracas</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight mt-1 font-brand-heading">
            LABORATORIO DE PERSONALIZACIÓN
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-2 max-w-3xl leading-relaxed">
            Personaliza con ubicación exacta (Frente / Espalda / Ambos lados), medidas de estampado en centímetros y cálculo automático de precio. Mockups limpios en perspectiva 100% frontal con herramientas de transformación directa estilo Canva.
          </p>
        </div>

        {/* Product Type Selector Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-6 sm:mb-8">
          {[
            { id: 'franela', label: '1. Franela 240g', specs: 'Algodón Pesado • Frente/Espalda' },
            { id: 'tote', label: '2. Tote Bag', specs: 'Lienzo Crudo Resistente' },
            { id: 'lamina', label: '3. Lámina Sublimada', specs: 'Aluminio Náutico Frontal' },
            { id: 'stickers', label: '4. Stickers Packs', specs: 'UV DTF Relieve & Vinilo' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setProductType(item.id as any);
                setArtworkPos({ x: 0, y: 0 });
              }}
              className={`p-2.5 sm:p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                productType === item.id
                  ? 'bg-[#0D253A] border-amber-400 text-white shadow-xl ring-1 ring-amber-400/40'
                  : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
              }`}
            >
              <span className="text-xs font-black uppercase tracking-wider block font-brand-heading">
                {item.label}
              </span>
              <span className="text-[10px] text-neutral-400 block mt-0.5 font-mono">
                {item.specs}
              </span>
            </button>
          ))}
        </div>

        {/* WORKSPACE GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 items-start">
          
          {/* LEFT: 100% Frontal Clean Mockup Canvas (7 cols) */}
          <div className="lg:col-span-7 bg-neutral-950 border border-neutral-800 rounded-2xl p-3 sm:p-6 flex flex-col justify-between shadow-2xl">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-200 block">
                    Lienzo Limpio {productType === 'franela' ? (canvasView === 'detras' ? '(Vista Espalda)' : '(Vista Frontal)') : '(Perspectiva Frontal)'}
                  </span>
                  {matchingUploadedMockup && (
                    <span className="px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 text-[9px] font-mono">
                      Foto Mockup Real
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-neutral-500 font-mono">
                  {placedArtworkUrl ? 'Arrastra para mover • Controles en esquinas' : 'Lienzo en blanco listo para cargar tu diseño'}
                </span>
              </div>

              {/* View Switcher for Apparel (Delante / Detrás) */}
              {productType === 'franela' && (
                <div className="flex items-center gap-1.5 bg-neutral-900 p-1 rounded-xl border border-neutral-800">
                  <button
                    onClick={() => setCanvasView('delante')}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase transition-all ${
                      canvasView === 'delante' ? 'bg-[#0D253A] text-amber-400 shadow' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    Frente
                  </button>
                  <button
                    onClick={() => setCanvasView('detras')}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase transition-all ${
                      canvasView === 'detras' ? 'bg-[#0D253A] text-amber-400 shadow' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    Espalda
                  </button>
                </div>
              )}

              {/* Direct Transform Helper Controls */}
              {placedArtworkUrl && (
                <div className="flex items-center gap-1.5 self-start sm:self-auto">
                  <button
                    onClick={() => setArtworkScale(Math.max(0.4, Number((artworkScale - 0.1).toFixed(2))))}
                    className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-700 text-neutral-300 hover:text-white cursor-pointer"
                    title="Reducir tamaño (-)"
                  >
                    <Minimize2 size={13} />
                  </button>
                  <span className="text-[10px] font-mono text-amber-400 px-1 font-bold">
                    {Math.round(artworkScale * 100)}%
                  </span>
                  <button
                    onClick={() => setArtworkScale(Math.min(2.2, Number((artworkScale + 0.1).toFixed(2))))}
                    className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-700 text-neutral-300 hover:text-white cursor-pointer"
                    title="Aumentar tamaño (+)"
                  >
                    <Maximize2 size={13} />
                  </button>
                  <button
                    onClick={() => setArtworkRotate((artworkRotate + 90) % 360)}
                    className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-700 text-neutral-300 hover:text-white cursor-pointer"
                    title="Rotar 90°"
                  >
                    <RotateCw size={13} />
                  </button>
                  <button
                    onClick={() => {
                      setArtworkPos({ x: 0, y: 0 });
                      setArtworkScale(1);
                      setArtworkRotate(0);
                    }}
                    className="px-2 py-1 rounded-lg bg-neutral-900 border border-neutral-700 text-neutral-300 hover:text-white text-[10px] font-mono cursor-pointer"
                    title="Centrar arte"
                  >
                    Centrar
                  </button>
                  <button
                    onClick={() => setPlacedArtworkUrl(null)}
                    className="p-1.5 rounded-lg bg-neutral-900 hover:bg-red-950 border border-neutral-700 text-red-400 cursor-pointer"
                    title="Eliminar arte"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              )}
            </div>

            {/* MOCKUP CANVAS CONTAINER: 100% Frontal Perspective */}
            <div 
              ref={canvasRef}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
              className="relative aspect-square w-full my-3 sm:my-6 bg-gradient-to-b from-neutral-900/60 to-black rounded-2xl overflow-hidden border border-neutral-800 flex items-center justify-center select-none touch-none"
            >
              
              {/* If an admin image mockup is uploaded, display it as background */}
              {matchingUploadedMockup && (
                <img
                  src={matchingUploadedMockup.imageUrl}
                  alt={matchingUploadedMockup.name}
                  className="absolute inset-0 w-full h-full object-contain p-4 drop-shadow-2xl pointer-events-none"
                />
              )}

              {/* ==================================================== */}
              {/* PRODUCT 1: FRANELA (100% FRONTAL O TRASERO VECTORIAL)*/}
              {/* ==================================================== */}
              {productType === 'franela' && !matchingUploadedMockup && (
                <div className="relative w-[85%] h-[85%] flex items-center justify-center transition-all duration-300">
                  <svg 
                    viewBox="0 0 400 440" 
                    className="w-full h-full drop-shadow-2xl filter"
                    style={{
                      filter: selectedColor.hex === '#FFFFFF' 
                        ? 'drop-shadow(0 20px 25px rgba(255,255,255,0.05)) drop-shadow(0 10px 10px rgba(0,0,0,0.8))' 
                        : 'drop-shadow(0 25px 30px rgba(0,0,0,0.9))'
                    }}
                  >
                    {/* Shirt Silhouette */}
                    <path
                      d="M 120 40 Q 200 85 280 40 L 375 110 L 325 180 L 290 155 L 290 400 L 110 400 L 110 155 L 75 180 L 25 110 Z"
                      fill={selectedColor.hex}
                      stroke={selectedColor.hex === '#FFFFFF' ? '#D1D5DB' : '#262626'}
                      strokeWidth="2"
                    />

                    {/* Front vs Back Neck Collar */}
                    {canvasView === 'delante' ? (
                      <>
                        {/* Ribbed Collar */}
                        <path
                          d="M 120 40 Q 200 85 280 40 Q 200 65 120 40 Z"
                          fill={selectedColor.hex === '#FFFFFF' ? '#F3F4F6' : '#171717'}
                          stroke={selectedColor.hex === '#FFFFFF' ? '#9CA3AF' : '#404040'}
                          strokeWidth="2"
                        />
                        {/* Inner Neck Crescent */}
                        <path
                          d="M 140 46 Q 200 30 260 46 Q 200 55 140 46 Z"
                          fill={selectedColor.hex === '#FFFFFF' ? '#E5E7EB' : '#0A0A0A'}
                        />
                      </>
                    ) : (
                      /* Back collar seam (Espalda) */
                      <path
                        d="M 120 40 Q 200 48 280 40 Q 200 52 120 40 Z"
                        fill={selectedColor.hex === '#FFFFFF' ? '#F3F4F6' : '#171717'}
                        stroke={selectedColor.hex === '#FFFFFF' ? '#9CA3AF' : '#404040'}
                        strokeWidth="2"
                      />
                    )}

                    {/* Subtle fold shading lines */}
                    <path
                      d="M 112 170 Q 150 200 115 250"
                      stroke={selectedColor.hex === '#FFFFFF' ? '#E5E7EB' : '#1C1C1C'}
                      strokeWidth="2"
                      fill="none"
                      opacity="0.6"
                    />
                    <path
                      d="M 288 170 Q 250 200 285 250"
                      stroke={selectedColor.hex === '#FFFFFF' ? '#E5E7EB' : '#1C1C1C'}
                      strokeWidth="2"
                      fill="none"
                      opacity="0.6"
                    />
                  </svg>
                </div>
              )}

              {/* ==================================================== */}
              {/* PRODUCT 2: TOTE BAG (100% FRONTAL CANVAS)           */}
              {/* ==================================================== */}
              {productType === 'tote' && !matchingUploadedMockup && (
                <div className="relative w-[75%] h-[85%] flex items-center justify-center">
                  <svg viewBox="0 0 360 440" className="w-full h-full drop-shadow-2xl">
                    <path
                      d="M 125 150 L 125 40 Q 180 20 235 40 L 235 150"
                      fill="none"
                      stroke="#B8B09D"
                      strokeWidth="16"
                      strokeLinecap="round"
                    />
                    <rect
                      x="60"
                      y="140"
                      width="240"
                      height="270"
                      rx="12"
                      fill="#E2DCce"
                      stroke="#C5BEAE"
                      strokeWidth="3"
                    />
                    <line x1="65" y1="155" x2="295" y2="155" stroke="#C5BEAE" strokeWidth="2" />
                    <line x1="125" y1="140" x2="125" y2="170" stroke="#9A9280" strokeWidth="3" />
                    <line x1="235" y1="140" x2="235" y2="170" stroke="#9A9280" strokeWidth="3" />
                  </svg>
                </div>
              )}

              {/* ==================================================== */}
              {/* PRODUCT 3: LÁMINA SUBLIMADA (100% FRONTAL, ALUMINIO) */}
              {/* ==================================================== */}
              {productType === 'lamina' && !matchingUploadedMockup && (
                <div className="relative w-[80%] h-[75%] flex items-center justify-center">
                  <div className="relative w-full h-full rounded-xl bg-gradient-to-br from-neutral-300 via-neutral-100 to-neutral-400 p-3 shadow-2xl border-2 border-neutral-400/80 flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/30 via-transparent to-black/20 pointer-events-none"></div>
                    
                    {/* 4 Corner Screws */}
                    <div className="absolute top-2.5 left-2.5 w-3 h-3 rounded-full bg-neutral-600 border border-neutral-300 flex items-center justify-center shadow-inner">
                      <div className="w-1.5 h-0.5 bg-neutral-800"></div>
                    </div>
                    <div className="absolute top-2.5 right-2.5 w-3 h-3 rounded-full bg-neutral-600 border border-neutral-300 flex items-center justify-center shadow-inner">
                      <div className="w-1.5 h-0.5 bg-neutral-800"></div>
                    </div>
                    <div className="absolute bottom-2.5 left-2.5 w-3 h-3 rounded-full bg-neutral-600 border border-neutral-300 flex items-center justify-center shadow-inner">
                      <div className="w-1.5 h-0.5 bg-neutral-800"></div>
                    </div>
                    <div className="absolute bottom-2.5 right-2.5 w-3 h-3 rounded-full bg-neutral-600 border border-neutral-300 flex items-center justify-center shadow-inner">
                      <div className="w-1.5 h-0.5 bg-neutral-800"></div>
                    </div>

                    {/* Sublimation Printable Core Area */}
                    <div className="w-full h-full rounded-lg bg-neutral-950/90 border border-neutral-700/60 flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-[#0D253A]/20 to-black pointer-events-none"></div>
                      {!placedArtworkUrl && !placedText && (
                        <div className="text-center p-4 text-neutral-500 font-mono text-xs">
                          <span className="block font-bold text-neutral-400 uppercase tracking-widest text-[11px] mb-1">
                            Lámina de Aluminio {laminaMeasure.label}
                          </span>
                          Sublimación directa de alta definición
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ==================================================== */}
              {/* PRODUCT 4: STICKERS (100% FRONTAL, CIRCULAR/DIE-CUT) */}
              {/* ==================================================== */}
              {productType === 'stickers' && !matchingUploadedMockup && (
                <div className="relative w-[75%] h-[75%] flex items-center justify-center">
                  <div className="relative w-64 h-64 rounded-full bg-neutral-900 border-4 border-white shadow-2xl p-1 flex items-center justify-center overflow-hidden">
                    <div className="absolute -bottom-1 -right-1 w-12 h-12 bg-gradient-to-tl from-neutral-400 to-white transform rotate-45 border-l border-t border-neutral-300 shadow-md pointer-events-none"></div>
                    <div className="w-full h-full rounded-full bg-black flex items-center justify-center relative overflow-hidden">
                      {!placedArtworkUrl && !placedText && (
                        <div className="text-center p-4 text-neutral-500 font-mono text-xs">
                          <span className="block font-bold text-neutral-400 uppercase tracking-widest text-[11px] mb-1">
                            Sticker UV DTF Relieve
                          </span>
                          Adhesivo impermeable de alto impacto
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ==================================================== */}
              {/* INTERACTIVE PRINTABLE BOUNDING BOX (CANVA STYLE)    */}
              {/* ==================================================== */}
              <div 
                className="absolute w-[58%] h-[58%] rounded-xl border border-dashed border-amber-400/40 pointer-events-none flex items-center justify-center"
              >
                {/* Visual Label with Exact Centimeters Badge */}
                <div className="absolute top-1.5 left-2 flex items-center gap-1.5">
                  <span className="text-[9px] font-mono uppercase text-amber-400/80 tracking-widest font-bold">
                    Área DTF {canvasView === 'detras' ? '(Espalda)' : '(Frente)'}
                  </span>
                  {(productType === 'franela' || productType === 'tote') && (
                    <span className="px-1.5 py-0.5 rounded bg-black/80 text-amber-300 border border-amber-400/30 text-[9px] font-mono">
                      📏 {selectedPrintSize.dimensionsCm}
                    </span>
                  )}
                </div>

                {/* Direct Transformable Graphic Box */}
                {(placedArtworkUrl || placedText) && (
                  <div
                    onPointerDown={handlePointerDown}
                    style={{
                      transform: `translate(${artworkPos.x}px, ${artworkPos.y}px) scale(${artworkScale}) rotate(${artworkRotate}deg)`,
                      cursor: isDragging ? 'grabbing' : 'grab',
                    }}
                    className="absolute pointer-events-auto group max-w-[85%] max-h-[85%] p-2 rounded-lg border border-transparent hover:border-amber-400/80 transition-shadow touch-none"
                  >
                    {/* Corner Drag Handles */}
                    <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-amber-400 rounded-full border border-black shadow pointer-events-none group-hover:scale-125 transition-transform"></div>
                    <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-amber-400 rounded-full border border-black shadow pointer-events-none group-hover:scale-125 transition-transform"></div>
                    <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-amber-400 rounded-full border border-black shadow pointer-events-none group-hover:scale-125 transition-transform"></div>
                    <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-amber-400 rounded-full border border-black shadow pointer-events-none group-hover:scale-125 transition-transform"></div>

                    {/* Placed Graphic Image */}
                    {placedArtworkUrl && (
                      <img
                        src={placedArtworkUrl}
                        alt="Placed artwork"
                        className="max-h-48 max-w-48 object-contain drop-shadow-2xl rounded select-none pointer-events-none"
                        draggable={false}
                      />
                    )}

                    {/* Placed Text */}
                    {placedText && (
                      <p 
                        style={{ color: textColor }}
                        className={`text-center font-black uppercase tracking-wider text-sm sm:text-base select-none pointer-events-none drop-shadow-lg mt-1 ${textFont}`}
                      >
                        {placedText}
                      </p>
                    )}
                  </div>
                )}

                {/* Blank Placeholder Hint */}
                {!placedArtworkUrl && !placedText && (
                  <div className="text-center p-4">
                    <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider">
                      Lienzo en Blanco
                    </p>
                    <p className="text-[10px] text-neutral-600 mt-1 max-w-[200px]">
                      Sube una imagen o selecciona un arte en el panel lateral para previsualizarlo aquí.
                    </p>
                  </div>
                )}
              </div>

              {/* Bottom spec pill */}
              <div className="absolute bottom-3 left-3 bg-black/85 backdrop-blur-md border border-neutral-700/80 rounded-lg px-2.5 py-1 text-[10px] text-neutral-300 font-mono flex items-center gap-2">
                {productType === 'franela' ? (
                  <span>Algodón 240g • {fitType} • {selectedColor.name} • {printLocation === 'ambos_lados' ? 'Ambos Lados' : printLocation === 'detras' ? 'Espalda' : 'Frente'}</span>
                ) : productType === 'lamina' ? (
                  <span>Lámina Sublimada {laminaMeasure.label} • x{laminaQuantity}</span>
                ) : productType === 'stickers' ? (
                  <span>Pack {stickerQuantity}u • {stickerFinish}</span>
                ) : (
                  <span>Tote Bag Lienzo Crudo • {printLocation === 'ambos_lados' ? '2 Lados' : '1 Lado'}</span>
                )}
              </div>

            </div>

            {/* Itemized Price Breakdown Card */}
            <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-2 mb-4">
              <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-bold block">
                Desglose Automático de Precio:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                <div className="p-2 rounded bg-neutral-950 border border-neutral-850">
                  <span className="text-[10px] text-neutral-500 block">Base:</span>
                  <span className="text-white font-bold">${pricing.base.toFixed(2)}</span>
                </div>
                {pricing.oversizeDelta > 0 && (
                  <div className="p-2 rounded bg-neutral-950 border border-neutral-850">
                    <span className="text-[10px] text-neutral-500 block">Oversize:</span>
                    <span className="text-amber-400 font-bold">+${pricing.oversizeDelta.toFixed(2)}</span>
                  </div>
                )}
                {pricing.sizeExtra > 0 && (
                  <div className="p-2 rounded bg-neutral-950 border border-neutral-850">
                    <span className="text-[10px] text-neutral-500 block">Talla {size}:</span>
                    <span className="text-amber-400 font-bold">+${pricing.sizeExtra.toFixed(2)}</span>
                  </div>
                )}
                {pricing.locationDelta > 0 && (
                  <div className="p-2 rounded bg-neutral-950 border border-neutral-850">
                    <span className="text-[10px] text-neutral-500 block">Ambos Lados:</span>
                    <span className="text-amber-400 font-bold">+${pricing.locationDelta.toFixed(2)}</span>
                  </div>
                )}
                {pricing.sizeAreaDelta > 0 && (
                  <div className="p-2 rounded bg-neutral-950 border border-neutral-850">
                    <span className="text-[10px] text-neutral-500 block">Área {selectedPrintSize.label}:</span>
                    <span className="text-amber-400 font-bold">+${pricing.sizeAreaDelta.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Price & Add to Cart Footer */}
            <div className="pt-2 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-[11px] text-neutral-400 uppercase font-mono block">
                  Precio Total Cotizado:
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-amber-400 font-mono">
                    ${currentPrice.toFixed(2)} USD
                  </span>
                  <span className="text-xs text-neutral-500 font-mono">
                    ~ Bs. {(currentPrice * exchangeRateBCV).toFixed(2)} (Tasa BCV)
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                {addedToast && (
                  <span className="text-emerald-400 text-xs font-bold flex items-center gap-1 animate-pulse">
                    <Check size={14} /> ¡Guardado en Carrito!
                  </span>
                )}
                <button
                  onClick={handleAddToCart}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-3.5 bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg active:scale-95 cursor-pointer"
                >
                  <ShoppingBag size={16} />
                  <span>Añadir al Carrito</span>
                </button>
              </div>
            </div>

          </div>

          {/* RIGHT: Tools & Configurations Panel (5 cols) */}
          <div className="lg:col-span-5 bg-neutral-950 border border-neutral-800 rounded-2xl p-3.5 sm:p-6 space-y-5 sm:space-y-6 shadow-2xl">
            
            {/* Tool Navigation Bar (No AI) */}
            <div className="grid grid-cols-4 gap-1 p-1 bg-neutral-900 rounded-xl border border-neutral-800">
              <button
                onClick={() => setActiveTab('upload')}
                className={`py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all flex flex-col items-center gap-1 cursor-pointer ${
                  activeTab === 'upload' ? 'bg-[#0D253A] text-amber-400 shadow-md font-black' : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Upload size={14} />
                <span>Subir Arte</span>
              </button>

              <button
                onClick={() => setActiveTab('presets')}
                className={`py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all flex flex-col items-center gap-1 cursor-pointer ${
                  activeTab === 'presets' ? 'bg-[#0D253A] text-amber-400 shadow-md font-black' : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Eye size={14} />
                <span>Colección</span>
              </button>

              <button
                onClick={() => setActiveTab('verses')}
                className={`py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all flex flex-col items-center gap-1 cursor-pointer ${
                  activeTab === 'verses' ? 'bg-[#0D253A] text-amber-400 shadow-md font-black' : 'text-neutral-400 hover:text-white'
                }`}
              >
                <BookOpen size={14} />
                <span>Versículos</span>
              </button>

              <button
                onClick={() => setActiveTab('options')}
                className={`py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all flex flex-col items-center gap-1 cursor-pointer ${
                  activeTab === 'options' ? 'bg-[#0D253A] text-amber-400 shadow-md font-black' : 'text-neutral-400 hover:text-white'
                }`}
              >
                <SlidersHorizontal size={14} />
                <span>Medidas & Prenda</span>
              </button>
            </div>

            {/* ==================================================== */}
            {/* TAB 1: UPLOAD OWN GRAPHIC / ARTWORK                 */}
            {/* ==================================================== */}
            {activeTab === 'upload' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="p-8 border-2 border-dashed border-neutral-700 hover:border-amber-400 rounded-2xl bg-neutral-900/50 text-center cursor-pointer transition-colors"
                >
                  <div className="w-12 h-12 rounded-xl bg-amber-400/10 text-amber-400 flex items-center justify-center mx-auto mb-3">
                    <Upload size={24} />
                  </div>
                  <h3 className="text-xs font-black text-white uppercase tracking-wider">
                    Sube tu diseño, logo o arte en alta resolución
                  </h3>
                  <p className="text-[11px] text-neutral-400 mt-1 max-w-xs mx-auto">
                    Formatos compatibles: PNG, JPG, SVG. Recomendado fondo transparente para estampado DTF textil o láminas sublimadas.
                  </p>
                  <button
                    type="button"
                    className="mt-4 px-4 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-amber-400 text-xs font-bold uppercase tracking-wider"
                  >
                    Examinar Archivos
                  </button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                {placedArtworkUrl && (
                  <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src={placedArtworkUrl} alt="Preview" className="w-12 h-12 object-contain rounded bg-black p-1 border border-neutral-800" />
                      <div>
                        <span className="text-xs font-bold text-white block">Arte Activo en Mockup</span>
                        <span className="text-[10px] text-emerald-400 font-mono">✓ Cargado para personalización</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setPlacedArtworkUrl(null)}
                      className="p-2 text-neutral-400 hover:text-red-400 transition-colors cursor-pointer"
                      title="Quitar arte del lienzo"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ==================================================== */}
            {/* TAB 2: ARTWORK DESIGNS FROM THE BRAND LIBRARY       */}
            {/* ==================================================== */}
            {activeTab === 'presets' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <span className="text-xs font-bold text-neutral-300 uppercase tracking-wider block">
                  Artes Disponibles de la Colección ÉXODO
                </span>
                <p className="text-[11px] text-neutral-400">
                  Selecciona uno de nuestros artes oficiales ("La calle es un museo" o "Venecristiana") para probarlo sobre tu prenda o artículo:
                </p>

                <div className="max-h-80 overflow-y-auto space-y-2.5 pr-1">
                  {artworkDesigns.map((art) => (
                    <button
                      key={art.id}
                      onClick={() => {
                        setPlacedArtworkUrl(art.highResGraphic);
                        setArtworkPos({ x: 0, y: 0 });
                        setArtworkScale(1);
                      }}
                      className="w-full p-2.5 rounded-xl bg-neutral-900/60 border border-neutral-800 hover:border-amber-400/80 text-left transition-all flex items-center gap-3 group cursor-pointer"
                    >
                      <img
                        src={art.highResGraphic}
                        alt={art.title}
                        className="w-12 h-12 object-contain rounded bg-black p-1 border border-neutral-800 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-black text-white group-hover:text-amber-300 block truncate">
                          {art.title}
                        </span>
                        <span className="text-[10px] text-neutral-400 font-mono block truncate">
                          {art.collection} • {art.technique}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono uppercase text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        Aplicar →
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ==================================================== */}
            {/* TAB 3: BIBLICAL VERSES & CUSTOM TYPOGRAPHY          */}
            {/* ==================================================== */}
            {activeTab === 'verses' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block mb-1">
                    Buscar Versículo Bíblico:
                  </label>
                  <input
                    type="text"
                    placeholder="Filipenses, Salmos, Isaías..."
                    value={verseSearch}
                    onChange={(e) => setVerseSearch(e.target.value)}
                    className="w-full p-2.5 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="max-h-52 overflow-y-auto space-y-2 pr-1">
                  {filteredVerses.map((verse, idx) => (
                    <button
                      key={idx}
                      onClick={() => setPlacedText(`${verse.text} — ${verse.reference}`)}
                      className="w-full p-3 rounded-lg bg-neutral-900/60 border border-neutral-800 hover:border-amber-400/80 text-left transition-all group cursor-pointer"
                    >
                      <span className="text-[11px] font-mono text-amber-400 font-bold block uppercase">
                        {verse.reference}
                      </span>
                      <p className="text-xs text-neutral-300 mt-1 line-clamp-2">
                        "{verse.text}"
                      </p>
                      <span className="text-[9px] text-neutral-500 mt-1 block group-hover:text-white">
                        + Añadir al diseño
                      </span>
                    </button>
                  ))}
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block mb-1">
                    O Escribe tu Propio Texto:
                  </label>
                  <input
                    type="text"
                    value={placedText}
                    onChange={(e) => setPlacedText(e.target.value)}
                    placeholder="Ej. JESÚS ES MI PASTOR"
                    className="w-full p-2.5 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                {placedText && (
                  <div className="flex items-center gap-3 pt-2">
                    <span className="text-xs text-neutral-400">Color texto:</span>
                    {['#FFFFFF', '#C8C3B3', '#D97706', '#000000'].map((col) => (
                      <button
                        key={col}
                        onClick={() => setTextColor(col)}
                        style={{ backgroundColor: col }}
                        className={`w-6 h-6 rounded-full border ${textColor === col ? 'ring-2 ring-amber-400' : 'border-neutral-600'}`}
                      />
                    ))}
                    <button
                      onClick={() => setPlacedText('')}
                      className="ml-auto text-xs text-red-400 hover:underline"
                    >
                      Quitar texto
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ==================================================== */}
            {/* TAB 4: PRODUCT CONFIGURATION, UBICACIÓN & MEDIDAS    */}
            {/* ==================================================== */}
            {activeTab === 'options' && (
              <div className="space-y-5 animate-in fade-in duration-200">
                
                {/* 1. UBICACIÓN DEL ESTAMPADO (Delante / Detrás / Ambos) */}
                {(productType === 'franela' || productType === 'tote') && (
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block mb-2 flex items-center justify-between">
                      <span>Ubicación del Estampado</span>
                      {printLocation === 'ambos_lados' && (
                        <span className="text-[10px] text-amber-400 font-mono font-bold">
                          +${labPricingConfig?.bothSidesDelta || 6}.00 USD
                        </span>
                      )}
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setPrintLocation('delante')}
                        className={`py-2 px-2 rounded-xl text-xs font-bold uppercase border transition-all cursor-pointer ${
                          printLocation === 'delante'
                            ? 'bg-[#0D253A] border-amber-400 text-white shadow-md'
                            : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                        }`}
                      >
                        Delante (Pecho)
                      </button>
                      <button
                        type="button"
                        onClick={() => setPrintLocation('detras')}
                        className={`py-2 px-2 rounded-xl text-xs font-bold uppercase border transition-all cursor-pointer ${
                          printLocation === 'detras'
                            ? 'bg-[#0D253A] border-amber-400 text-white shadow-md'
                            : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                        }`}
                      >
                        Detrás (Espalda)
                      </button>
                      <button
                        type="button"
                        onClick={() => setPrintLocation('ambos_lados')}
                        className={`py-2 px-2 rounded-xl text-xs font-bold uppercase border transition-all cursor-pointer ${
                          printLocation === 'ambos_lados'
                            ? 'bg-[#0D253A] border-amber-400 text-white shadow-md'
                            : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                        }`}
                      >
                        Ambos Lados
                      </button>
                    </div>
                  </div>
                )}

                {/* 2. MEDIDAS EN CENTÍMETROS DEL ESTAMPADO */}
                {(productType === 'franela' || productType === 'tote') && (
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block mb-2 flex items-center gap-1.5">
                      <Ruler size={14} className="text-amber-400" />
                      <span>Medida del Estampado (Centímetros):</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {printAreaSizes.map((area) => (
                        <button
                          key={area.id}
                          type="button"
                          onClick={() => setSelectedPrintSize(area)}
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                            selectedPrintSize.id === area.id
                              ? 'bg-amber-400/10 border-amber-400 text-white shadow-md'
                              : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black block font-brand-heading text-white">
                              {area.label}
                            </span>
                            {area.surchargeUSD > 0 ? (
                              <span className="text-[10px] text-amber-400 font-mono font-bold">
                                +${area.surchargeUSD}
                              </span>
                            ) : (
                              <span className="text-[9px] text-neutral-500 font-mono">
                                Incluido
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-amber-300 font-mono block mt-0.5">
                            {area.dimensionsCm}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. FRANELA RULES */}
                {productType === 'franela' && (
                  <>
                    {/* Fit Type Picker */}
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block mb-2">
                        Corte de Prenda
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setFitType('Corte Normal')}
                          className={`py-2 px-3 rounded-xl text-xs font-bold uppercase border transition-all cursor-pointer ${
                            fitType === 'Corte Normal'
                              ? 'bg-[#0D253A] border-amber-400 text-white shadow-md'
                              : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                          }`}
                        >
                          Corte Normal (Básico)
                        </button>
                        <button
                          type="button"
                          onClick={() => setFitType('Oversize')}
                          className={`py-2 px-3 rounded-xl text-xs font-bold uppercase border transition-all cursor-pointer ${
                            fitType === 'Oversize'
                              ? 'bg-[#0D253A] border-amber-400 text-white shadow-md'
                              : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                          }`}
                        >
                          Oversize 240g (+ ${labPricingConfig?.oversizeExtraDelta || 4}.00)
                        </button>
                      </div>
                    </div>

                    {/* Size Picker with Surcharge Rules */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                          Talla Seleccionada: <strong className="text-white">{size}</strong>
                        </label>
                        {fitType === 'Oversize' && (
                          <span className="text-[10px] text-amber-400 font-mono">
                            Oversize solo disponible hasta L
                          </span>
                        )}
                      </div>

                      {/* Normal Sizes */}
                      {fitType === 'Corte Normal' ? (
                        <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                          {[
                            { s: 'S', extra: 0 },
                            { s: 'M', extra: 0 },
                            { s: 'L', extra: 0 },
                            { s: 'XL', extra: 1 },
                            { s: '2XL', extra: 2 },
                            { s: '3XL', extra: 3 },
                            { s: '4XL', extra: 4 },
                          ].map((item) => (
                            <button
                              key={item.s}
                              type="button"
                              onClick={() => setSize(item.s)}
                              className={`py-2 rounded-xl text-xs font-bold uppercase border transition-all cursor-pointer flex flex-col items-center justify-center ${
                                size === item.s
                                  ? 'bg-amber-400 text-black border-amber-400 font-black'
                                  : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:border-neutral-700'
                              }`}
                            >
                              <span>{item.s}</span>
                              {item.extra > 0 && (
                                <span className={`text-[9px] ${size === item.s ? 'text-black' : 'text-amber-400'}`}>
                                  +${item.extra}
                                </span>
                              )}
                            </button>
                          ))}
                        </div>
                      ) : (
                        /* Oversize Sizes: STRICTLY S, M, L */
                        <div className="grid grid-cols-3 gap-2">
                          {['S', 'M', 'L'].map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => setSize(s)}
                              className={`py-2.5 rounded-xl text-xs font-bold uppercase border transition-all cursor-pointer ${
                                size === s
                                  ? 'bg-amber-400 text-black border-amber-400 font-black'
                                  : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:border-neutral-700'
                              }`}
                            >
                              {s} (Oversize)
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Color Palette (Includes Blanco, Negro, Arena, Azul) */}
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block mb-2">
                        Color de Franela: <strong className="text-white">{selectedColor.name}</strong>
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {availableColors.map((col) => (
                          <button
                            key={col.name}
                            type="button"
                            onClick={() => setSelectedColor(col)}
                            className={`flex items-center gap-2 p-2 rounded-xl border text-xs transition-all cursor-pointer ${
                              selectedColor.name === col.name
                                ? 'border-amber-400 bg-neutral-900 text-white shadow-md'
                                : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white'
                            }`}
                          >
                            <span 
                              className="w-4 h-4 rounded-full border border-neutral-600 shrink-0" 
                              style={{ backgroundColor: col.hex }}
                            />
                            <span className="truncate text-[11px] font-bold">{col.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* 4. LÁMINAS SUBLIMADAS CONFIG (Medidas y Cantidad) */}
                {productType === 'lamina' && (
                  <div className="space-y-4">
                    <div className="p-3 rounded-xl bg-[#0D253A]/40 border border-neutral-700 text-xs">
                      <span className="font-bold text-amber-400 block mb-0.5">Lámina de Aluminio Náutico:</span>
                      <span className="text-neutral-300 text-[11px]">
                        Sublimada a 200°C con tintas de ultra-durabilidad, 4 orificios para fijación en pared o soporte.
                      </span>
                    </div>

                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block mb-2">
                        Selecciona las Medidas:
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {laminaMeasures.map((measure) => (
                          <button
                            key={measure.id}
                            type="button"
                            onClick={() => setLaminaMeasure(measure)}
                            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                              laminaMeasure.id === measure.id
                                ? 'bg-amber-400/10 border-amber-400 text-white shadow-md'
                                : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                            }`}
                          >
                            <span className="text-xs font-black block font-brand-heading text-white">
                              {measure.label}
                            </span>
                            <span className="text-xs font-bold text-amber-400 font-mono block mt-0.5">
                              ${measure.price}.00 USD
                            </span>
                            <span className="text-[10px] text-neutral-500 block mt-0.5">
                              {measure.desc}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block mb-2">
                        Cantidad de Láminas:
                      </label>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setLaminaQuantity(Math.max(1, laminaQuantity - 1))}
                          className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-lg font-bold hover:bg-neutral-800 cursor-pointer"
                        >
                          -
                        </button>
                        <span className="w-14 text-center font-mono font-bold text-lg text-white">
                          {laminaQuantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => setLaminaQuantity(laminaQuantity + 1)}
                          className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-lg font-bold hover:bg-neutral-800 cursor-pointer"
                        >
                          +
                        </button>
                        <span className="text-xs font-mono text-neutral-400 ml-2">
                          Total: <strong className="text-amber-400">${(laminaMeasure.price * laminaQuantity).toFixed(2)} USD</strong>
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. STICKERS CONFIG */}
                {productType === 'stickers' && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block mb-2">
                        Acabado de los Stickers
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['Vinilo', 'Papel Fotográfico', 'UV DTF'] as const).map((fin) => (
                          <button
                            key={fin}
                            type="button"
                            onClick={() => setStickerFinish(fin)}
                            className={`py-2.5 px-1 text-[11px] font-bold uppercase border rounded-xl transition-all cursor-pointer ${
                              stickerFinish === fin
                                ? 'bg-[#0D253A] border-amber-400 text-white shadow-md'
                                : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                            }`}
                          >
                            {fin}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block mb-2">
                        Cantidad de Stickers
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {[5, 10, 25, 50].map((qty) => (
                          <button
                            key={qty}
                            type="button"
                            onClick={() => setStickerQuantity(qty)}
                            className={`py-2.5 text-xs font-bold border rounded-xl transition-all cursor-pointer ${
                              stickerQuantity === qty
                                ? 'bg-amber-400 text-black border-amber-400 font-black'
                                : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                            }`}
                          >
                            x{qty}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};
