import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, 
  Trash2, 
  Check, 
  Plus, 
  Image as ImageIcon, 
  Sparkles, 
  DollarSign, 
  Info,
  Calculator,
  Copy,
  Clock,
  Package,
  Flame,
  FileSpreadsheet,
  Layers,
  ArrowRight,
  TrendingUp,
  Sliders
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { CustomLabMockup, ProductCategory, PrintAreaSizeConfig } from '../../types';

interface CustomCostItem {
  id: string;
  name: string;
  unitCost: number;
  quantity: number;
  isAutoLinked?: 'impresion' | 'mano_obra';
  category: 'franela' | 'impresion' | 'mano_obra' | 'planchado' | 'empaque' | 'otro';
  notes?: string;
}

export const CustomLabAdminConfig: React.FC = () => {
  const { 
    labPricingConfig, 
    updateLabPricingConfig, 
    customLabMockups, 
    addCustomLabMockup, 
    deleteCustomLabMockup,
    exchangeRateBCV 
  } = useStore();

  const [activeTab, setActiveTab] = useState<'calculator' | 'mockups' | 'pricing'>('calculator');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // ==========================================
  // CALCULADORA & MONITOR DE PRECIOS DTF (EXCEL)
  // ==========================================
  // Paso 1: Configuración del Rollo de Impresión DTF
  const [rollWidthCm, setRollWidthCm] = useState<number>(58); // Ancho rollo (ej. 58cm)
  const [rollLengthCm, setRollLengthCm] = useState<number>(100); // 1 metro lineal base (100cm)
  const [rollPriceUSD, setRollPriceUSD] = useState<number>(13.00); // Precio del metro lineal (ej. $13)

  // Medidas del Estampado para la cotización
  const [printWidthCm, setPrintWidthCm] = useState<number>(58); // Ancho estampado
  const [printHeightCm, setPrintHeightCm] = useState<number>(30); // Alto estampado
  const [includeSecondPrint, setIncludeSecondPrint] = useState<boolean>(false);
  const [print2WidthCm, setPrint2WidthCm] = useState<number>(12);
  const [print2HeightCm, setPrint2HeightCm] = useState<number>(12);

  // Paso 2: Tiempo de Mano de Obra
  const [laborMinutes, setLaborMinutes] = useState<number>(20); // Minutos trabajados
  const [laborRatePerMin, setLaborRatePerMin] = useState<number>(0.13); // $0.13 por minuto

  // Margen de ganancia (30% -> Divisor 0.70)
  const [marginPercent, setMarginPercent] = useState<number>(30);

  // Tabla Dinámica de Costos (Cargada desde caché local o inicial)
  const [costItems, setCostItems] = useState<CustomCostItem[]>(() => {
    const saved = localStorage.getItem('exodo_custom_cost_items');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      {
        id: 'item-franela',
        name: 'Franela Base 100% Algodón Pesado 240g',
        unitCost: 6.00,
        quantity: 1,
        category: 'franela',
        notes: 'Proveedor textil Caracas / Costura reforzada'
      },
      {
        id: 'item-impresion',
        name: 'Costo de Impresión DTF (Calculado por Medidas)',
        unitCost: 3.90,
        quantity: 1,
        isAutoLinked: 'impresion',
        category: 'impresion',
        notes: 'Fórmula: (Ancho × Alto) ÷ (Ancho Rollo × 100) × Precio Metro'
      },
      {
        id: 'item-mano-obra',
        name: 'Minuto de Trabajo / Confección (0.13$ × min)',
        unitCost: 2.60,
        quantity: 1,
        isAutoLinked: 'mano_obra',
        category: 'mano_obra',
        notes: 'Cálculo automático de minutos trabajados'
      },
      {
        id: 'item-planchado',
        name: 'Costo de Planchado Térmico & Fijación',
        unitCost: 1.00,
        quantity: 1,
        category: 'planchado',
        notes: 'Prensa térmica neumática 165°C / 15 seg + curado'
      },
      {
        id: 'item-empaque',
        name: 'Empaque & Presentación (Bolsa + Sticker)',
        unitCost: 0.20,
        quantity: 1,
        category: 'empaque',
        notes: 'Ajustable si el pedido lleva 2 o más productos'
      }
    ];
  });

  // Cálculo del Costo de Impresión DTF:
  // (Ancho × Alto) ÷ (Ancho Rollo × 100) × Precio Metro
  const calculateSinglePrintCost = (w: number, h: number): number => {
    const rollArea = rollWidthCm * rollLengthCm;
    if (rollArea <= 0) return 0;
    const printArea = w * h;
    return (printArea / rollArea) * rollPriceUSD;
  };

  const calculatedPrint1Cost = calculateSinglePrintCost(printWidthCm, printHeightCm);
  const calculatedPrint2Cost = includeSecondPrint ? calculateSinglePrintCost(print2WidthCm, print2HeightCm) : 0;
  const totalCalculatedPrintCost = calculatedPrint1Cost + calculatedPrint2Cost;

  // Cálculo del Costo de Mano de Obra:
  const totalCalculatedLaborCost = laborMinutes * laborRatePerMin;

  // Sincronizar ítems auto-vinculados cuando cambian las medidas o minutos
  useEffect(() => {
    setCostItems((prev) =>
      prev.map((item) => {
        if (item.isAutoLinked === 'impresion') {
          return { ...item, unitCost: Number(totalCalculatedPrintCost.toFixed(2)) };
        }
        if (item.isAutoLinked === 'mano_obra') {
          return { ...item, unitCost: Number(totalCalculatedLaborCost.toFixed(2)) };
        }
        return item;
      })
    );
  }, [totalCalculatedPrintCost, totalCalculatedLaborCost]);

  // Guardar tabla de cotización en localStorage
  useEffect(() => {
    localStorage.setItem('exodo_custom_cost_items', JSON.stringify(costItems));
  }, [costItems]);

  // Subtotal de todos los costos de insumos y producción
  const subtotalCostos = costItems.reduce((acc, item) => acc + (item.unitCost * item.quantity), 0);

  // Divisor de margen (ej: 30% margen -> divisor = 0.70)
  const marginDivisor = Math.max(0.1, (100 - marginPercent) / 100);

  // Precio Total de Venta: Subtotal Costos ÷ 0.70
  const precioTotalVentaUSD = subtotalCostos > 0 ? (subtotalCostos / marginDivisor) : 0;
  const gananciaNetaUSD = precioTotalVentaUSD - subtotalCostos;
  const precioTotalVentaVES = precioTotalVentaUSD * exchangeRateBCV;
  const gananciaNetaVES = gananciaNetaUSD * exchangeRateBCV;

  // Agregar nuevo insumo personalizado
  const handleAddNewCostItem = () => {
    const newItem: CustomCostItem = {
      id: `custom-cost-${Date.now()}`,
      name: 'Nuevo Insumo / Gasto Proveedor',
      unitCost: 1.00,
      quantity: 1,
      category: 'otro',
      notes: 'Gasto operativo o material adicional'
    };
    setCostItems([...costItems, newItem]);
    showNotification('Nueva fila agregada. Modifica su nombre, costo y cantidad.');
  };

  // Modificar fila de costo
  const handleUpdateCostItem = (id: string, updates: Partial<CustomCostItem>) => {
    setCostItems(costItems.map((item) => (item.id === id ? { ...item, ...updates } : item)));
  };

  // Eliminar fila de costo
  const handleDeleteCostItem = (id: string) => {
    setCostItems(costItems.filter((item) => item.id !== id));
    showNotification('Insumo eliminado de la tabla de cotización.');
  };

  // Copiar cotización formateada para WhatsApp
  const handleCopyWhatsAppQuote = () => {
    const text = 
`👕 *COTIZACIÓN DE FRANELA PERSONALIZADA — ÉXODO*
📍 *Prenda:* Franela 100% Algodón Pesado 240g
📐 *Estampado DTF:* ${printWidthCm}cm × ${printHeightCm}cm${includeSecondPrint ? ` + Secundario: ${print2WidthCm}cm × ${print2HeightCm}cm` : ''}

📊 *Desglose de Costos de Confección:*
${costItems.map((i) => `• ${i.name}: $${(i.unitCost * i.quantity).toFixed(2)} USD`).join('\n')}

💰 *PRECIO TOTAL DE VENTA:*
• *$${precioTotalVentaUSD.toFixed(2)} USD*
• *Bs. ${precioTotalVentaVES.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}* (Tasa BCV Oficial: Bs. ${exchangeRateBCV.toFixed(2)})

✨ *Acabado:* DTF Textil HD con tacto cero y máxima durabilidad al lavado.
⏳ *Tiempo de entrega:* 3 a 5 días hábiles en taller Caracas.
📲 ¡Responde a este mensaje para confirmar tu diseño e iniciar confección!`;

    navigator.clipboard.writeText(text);
    showNotification('¡Cotización copiada al portapapeles lista para enviar por WhatsApp!');
  };

  // Aplicar el precio calculado como Precio Base en el Custom Lab público
  const handleApplyAsPublicBasePrice = () => {
    const newPrice = Math.round(precioTotalVentaUSD);
    updateLabPricingConfig({
      ...labPricingConfig,
      franelaBasePrice: newPrice,
    });
    setPricingState((prev) => ({ ...prev, franelaBasePrice: newPrice }));
    showNotification(`¡Precio base de franela en el Custom Lab actualizado a $${newPrice}.00 USD!`);
  };

  // ==========================================
  // ESTADOS DE MOCKUPS & TARIFAS GENERALES
  // ==========================================
  const [mockupName, setMockupName] = useState('');
  const [mockupCategory, setMockupCategory] = useState<ProductCategory | 'franela' | 'tote' | 'lamina' | 'stickers'>('franela');
  const [mockupView, setMockupView] = useState<'delante' | 'detras' | 'frontal'>('delante');
  const [mockupColorName, setMockupColorName] = useState('Negro Pitch');
  const [mockupColorHex, setMockupColorHex] = useState('#000000');
  const [mockupWidthCm, setMockupWidthCm] = useState('35');
  const [mockupHeightCm, setMockupHeightCm] = useState('45');
  const [mockupImageData, setMockupImageData] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [pricingState, setPricingState] = useState(labPricingConfig);

  const showNotification = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido (PNG, JPG o WEBP).');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      alert('La imagen no debe superar los 8MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setMockupImageData(reader.result as string);
      showNotification(`Mockup "${file.name}" cargado listo para guardar.`);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveMockup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mockupImageData) {
      alert('Debes subir una imagen para el mockup.');
      return;
    }
    if (!mockupName.trim()) {
      alert('Ingresa un nombre representativo para el mockup.');
      return;
    }

    const newMockup: CustomLabMockup = {
      id: `mockup-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: mockupName.trim(),
      category: mockupCategory,
      view: mockupView,
      imageUrl: mockupImageData,
      colorName: mockupColorName,
      colorHex: mockupColorHex,
      widthCm: parseFloat(mockupWidthCm) || 35,
      heightCm: parseFloat(mockupHeightCm) || 45,
      createdAt: new Date().toISOString().split('T')[0],
      isDefault: false,
    };

    addCustomLabMockup(newMockup);
    showNotification(`¡Mockup "${newMockup.name}" agregado con éxito al catálogo del Custom Lab!`);

    setMockupName('');
    setMockupImageData(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSavePricing = (e: React.FormEvent) => {
    e.preventDefault();
    updateLabPricingConfig(pricingState);
    showNotification('¡Parámetros y tarifas del Custom Lab guardados exitosamente!');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Toast Alert */}
      {successToast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl bg-amber-400 text-black text-xs font-black shadow-2xl flex items-center gap-2 border border-black/20">
          <Check size={16} />
          <span>{successToast}</span>
        </div>
      )}

      {/* Header & Sub-Tabs */}
      <div className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-amber-400/10 text-amber-400 border border-amber-400/20 font-bold">
              <Calculator size={20} />
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight font-brand-heading">
              Custom Lab: Cotizador & Monitor de Precios DTF
            </h2>
          </div>
          <p className="text-xs text-neutral-400 mt-1.5 max-w-2xl leading-relaxed">
            Fórmulas exactas para cotizar franelas personalizadas: costo de impresión DTF por metro lineal, minutos de trabajo ($0.13/min), planchado, empaque, franela base y margen del 30% (divisor 0.70).
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-neutral-950 rounded-2xl border border-neutral-800 self-start lg:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('calculator')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
              activeTab === 'calculator'
                ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/20'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <FileSpreadsheet size={15} />
            <span>Monitor & Cotizador DTF</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('mockups')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
              activeTab === 'mockups'
                ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/20'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <ImageIcon size={15} />
            <span>Mockups ({customLabMockups.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('pricing')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
              activeTab === 'pricing'
                ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/20'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Sliders size={15} />
            <span>Reglas de Tarifas</span>
          </button>
        </div>
      </div>

      {/* ========================================================== */}
      {/* TAB 1: CALCULADORA & MONITOR DE COSTOS DTF (FÓRMULAS EXCEL) */}
      {/* ========================================================== */}
      {activeTab === 'calculator' && (
        <div className="space-y-8 animate-in fade-in duration-150">
          
          {/* PASO 1: CÁLCULO DEL COSTO DE IMPRESIÓN POR MEDIDAS */}
          <div className="p-6 rounded-3xl bg-neutral-950 border border-neutral-800 shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono text-xs font-bold">
                  01
                </span>
                <div>
                  <h3 className="text-base font-black text-white uppercase tracking-tight font-brand-heading">
                    Paso 1: Cálculo del Costo de Impresión DTF Textil
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Fórmula oficial: <code className="text-amber-400 font-mono">(Ancho × Alto) ÷ (Ancho Rollo × 100) × Precio Metro</code>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs font-mono">
                <span className="text-neutral-400">Tasa BCV:</span>
                <span className="text-amber-400 font-bold">Bs. {exchangeRateBCV.toFixed(2)}/$</span>
              </div>
            </div>

            {/* Configuración del Rollo del Proveedor */}
            <div className="p-4 rounded-2xl bg-neutral-900/70 border border-neutral-800 space-y-3">
              <span className="text-[11px] font-mono uppercase text-neutral-400 font-bold flex items-center gap-1.5">
                <Sliders size={13} className="text-blue-400" />
                Parámetros del Rollo de Impresión (Proveedor):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
                <div>
                  <label className="text-[11px] text-neutral-300 block mb-1">Ancho del Rollo DTF (cm):</label>
                  <input
                    type="number"
                    step="1"
                    min="10"
                    value={rollWidthCm}
                    onChange={(e) => setRollWidthCm(Math.max(1, parseFloat(e.target.value) || 0))}
                    className="w-full p-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white font-bold focus:border-amber-400"
                  />
                  <span className="text-[10px] text-neutral-500 mt-1 block">Estándar: 58 cm</span>
                </div>

                <div>
                  <label className="text-[11px] text-neutral-300 block mb-1">Largo Base del Metro (cm):</label>
                  <input
                    type="number"
                    disabled
                    value={rollLengthCm}
                    className="w-full p-2.5 bg-neutral-950/60 border border-neutral-800/60 rounded-xl text-neutral-400 font-bold"
                  />
                  <span className="text-[10px] text-neutral-500 mt-1 block">1 Metro Lineal = 100 cm</span>
                </div>

                <div>
                  <label className="text-[11px] text-neutral-300 block mb-1">Precio por Metro Lineal ($ USD):</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-400 font-bold">$</span>
                    <input
                      type="number"
                      step="0.5"
                      min="1"
                      value={rollPriceUSD}
                      onChange={(e) => setRollPriceUSD(parseFloat(e.target.value) || 0)}
                      className="w-full pl-7 pr-3 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white font-bold focus:border-amber-400"
                    />
                  </div>
                  <span className="text-[10px] text-neutral-500 mt-1 block">Ejemplo del taller: $13.00 USD</span>
                </div>
              </div>
            </div>

            {/* Medidas del Estampado Solicitado */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Estampado 1 (Principal) */}
              <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white uppercase font-mono flex items-center gap-1.5">
                    <Layers size={14} className="text-amber-400" />
                    Estampado Principal (Frente o Espalda):
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 font-mono text-[10px] font-bold border border-blue-500/20">
                    ${calculatedPrint1Cost.toFixed(2)} USD
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                  <div>
                    <label className="text-[11px] text-neutral-300 block mb-1">Ancho Arte (cm):</label>
                    <input
                      type="number"
                      step="1"
                      min="1"
                      value={printWidthCm}
                      onChange={(e) => setPrintWidthCm(parseFloat(e.target.value) || 0)}
                      className="w-full p-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white font-bold focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-neutral-300 block mb-1">Alto Arte (cm):</label>
                    <input
                      type="number"
                      step="1"
                      min="1"
                      value={printHeightCm}
                      onChange={(e) => setPrintHeightCm(parseFloat(e.target.value) || 0)}
                      className="w-full p-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white font-bold focus:border-amber-400"
                    />
                  </div>
                </div>

                {/* Explicación matemática en vivo */}
                <div className="p-3 rounded-xl bg-black/50 border border-neutral-800 text-[11px] font-mono text-neutral-300 space-y-1">
                  <span className="text-neutral-500 block text-[10px]">Demostración del cálculo:</span>
                  <div>
                    ({printWidthCm}cm × {printHeightCm}cm) ÷ ({rollWidthCm}cm × 100cm) × ${rollPriceUSD} = <strong className="text-amber-400">${calculatedPrint1Cost.toFixed(2)} USD</strong>
                  </div>
                  <div className="text-[10px] text-neutral-400">
                    Área: {printWidthCm * printHeightCm} cm² de {rollWidthCm * 100} cm² del metro lineal.
                  </div>
                </div>
              </div>

              {/* Estampado 2 (Secundario / Opcional) */}
              <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white uppercase font-mono flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeSecondPrint}
                      onChange={(e) => setIncludeSecondPrint(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-400 bg-neutral-950 border-neutral-700"
                    />
                    <span>¿Lleva 2do Estampado? (ej. Pecho pequeño)</span>
                  </label>
                  {includeSecondPrint && (
                    <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 font-mono text-[10px] font-bold border border-blue-500/20">
                      +${calculatedPrint2Cost.toFixed(2)} USD
                    </span>
                  )}
                </div>

                {includeSecondPrint ? (
                  <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                    <div>
                      <label className="text-[11px] text-neutral-300 block mb-1">Ancho 2do Arte (cm):</label>
                      <input
                        type="number"
                        step="1"
                        min="1"
                        value={print2WidthCm}
                        onChange={(e) => setPrint2WidthCm(parseFloat(e.target.value) || 0)}
                        className="w-full p-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white font-bold focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-neutral-300 block mb-1">Alto 2do Arte (cm):</label>
                      <input
                        type="number"
                        step="1"
                        min="1"
                        value={print2HeightCm}
                        onChange={(e) => setPrint2HeightCm(parseFloat(e.target.value) || 0)}
                        className="w-full p-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white font-bold focus:border-amber-400"
                      />
                    </div>
                  </div>
                ) : (
                  <p className="text-[11px] text-neutral-500 italic p-4 text-center border border-dashed border-neutral-800 rounded-xl">
                    Activa la casilla si la prenda lleva logo pequeño en el pecho, manga o etiqueta adicional.
                  </p>
                )}

                {/* Resumen Total Impresión */}
                <div className="pt-2 flex items-center justify-between text-xs font-mono border-t border-neutral-800">
                  <span className="text-neutral-400">Total Impresión DTF:</span>
                  <span className="text-base font-black text-amber-400 font-mono">
                    ${totalCalculatedPrintCost.toFixed(2)} USD
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* PASO 2: TIEMPO DE TRABAJO & PARÁMETROS DE MANO DE OBRA */}
          <div className="p-6 rounded-3xl bg-neutral-950 border border-neutral-800 shadow-2xl space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-neutral-800">
              <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono text-xs font-bold">
                02
              </span>
              <div>
                <h3 className="text-base font-black text-white uppercase tracking-tight font-brand-heading">
                  Paso 2: Minutos de Trabajo / Mano de Obra
                </h3>
                <p className="text-xs text-neutral-400">
                  Fórmula: <code className="text-emerald-400 font-mono">Minuto de trabajo ($0.13) × Horas o Minutos trabajados</code>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
              <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800">
                <label className="text-[11px] text-neutral-300 block mb-1">Costo por Minuto de Trabajo ($):</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400 font-bold">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={laborRatePerMin}
                    onChange={(e) => setLaborRatePerMin(parseFloat(e.target.value) || 0)}
                    className="w-full pl-7 pr-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white font-bold"
                  />
                </div>
                <span className="text-[10px] text-neutral-500 mt-1 block">Tasa solicitada: $0.13 / min</span>
              </div>

              <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800">
                <label className="text-[11px] text-neutral-300 block mb-1">Minutos Trabajados por Prenda:</label>
                <input
                  type="number"
                  step="1"
                  min="1"
                  value={laborMinutes}
                  onChange={(e) => setLaborMinutes(Math.max(1, parseInt(e.target.value) || 0))}
                  className="w-full p-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white font-bold"
                />
                <span className="text-[10px] text-neutral-500 mt-1 block">
                  Equivalente a {(laborMinutes / 60).toFixed(2)} horas de labor
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800/60 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] text-emerald-400 font-bold uppercase block">
                    Costo Total Mano de Obra:
                  </span>
                  <span className="text-2xl font-black text-white font-mono mt-1 block">
                    ${totalCalculatedLaborCost.toFixed(2)} <span className="text-xs text-neutral-400 font-normal">USD</span>
                  </span>
                </div>
                <span className="text-[10px] text-emerald-300/80 font-mono">
                  {laborMinutes} min × ${laborRatePerMin}/min = ${totalCalculatedLaborCost.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* PASO 3: TABLA DE COSTOS DE INSUMOS & PRODUCCIÓN (EXCEL EDITABLE) */}
          <div className="p-6 rounded-3xl bg-neutral-950 border border-neutral-800 shadow-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-amber-400/10 text-amber-400 border border-amber-400/20 font-mono text-xs font-bold">
                  03
                </span>
                <div>
                  <h3 className="text-base font-black text-white uppercase tracking-tight font-brand-heading">
                    Paso 3: Matriz de Costos de Insumos & Confección (Estilo Excel)
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Modifica los nombres, costos y cantidades libremente por si algún proveedor cambia de precio
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddNewCostItem}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-850 text-amber-400 border border-neutral-750 text-xs font-mono font-bold transition-all cursor-pointer self-start sm:self-auto"
              >
                <Plus size={14} />
                <span>+ Agregar Insumo / Gasto</span>
              </button>
            </div>

            {/* Tabla de Filas Editables */}
            <div className="overflow-x-auto rounded-2xl border border-neutral-850">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-neutral-900/90 text-neutral-400 uppercase text-[10px] border-b border-neutral-800">
                  <tr>
                    <th className="py-3 px-4">Concepto / Insumo</th>
                    <th className="py-3 px-4 w-32">Costo Unitario ($)</th>
                    <th className="py-3 px-4 w-24">Cantidad</th>
                    <th className="py-3 px-4 text-right w-32">Subtotal ($)</th>
                    <th className="py-3 px-4 w-12 text-center">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-850/80">
                  {costItems.map((item) => {
                    const rowTotal = item.unitCost * item.quantity;
                    return (
                      <tr key={item.id} className="hover:bg-neutral-900/40 transition-colors">
                        <td className="py-3 px-4">
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => handleUpdateCostItem(item.id, { name: e.target.value })}
                            className="w-full bg-transparent border-b border-transparent hover:border-neutral-700 focus:border-amber-400 focus:outline-none text-white font-medium py-1"
                          />
                          {item.notes && (
                            <span className="text-[10px] text-neutral-500 block">{item.notes}</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="relative">
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-neutral-500">$</span>
                            <input
                              type="number"
                              step="0.05"
                              min="0"
                              value={item.unitCost}
                              onChange={(e) => handleUpdateCostItem(item.id, { unitCost: parseFloat(e.target.value) || 0 })}
                              className="w-full pl-5 pr-2 py-1 bg-neutral-900 border border-neutral-800 rounded-lg text-white font-mono font-bold focus:border-amber-400 focus:outline-none text-right"
                            />
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <input
                            type="number"
                            step="1"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleUpdateCostItem(item.id, { quantity: Math.max(1, parseInt(e.target.value) || 1) })}
                            className="w-full px-2 py-1 bg-neutral-900 border border-neutral-800 rounded-lg text-white font-mono text-center focus:border-amber-400 focus:outline-none"
                          />
                        </td>
                        <td className="py-3 px-4 text-right font-black text-white">
                          ${rowTotal.toFixed(2)} USD
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleDeleteCostItem(item.id)}
                            className="text-neutral-500 hover:text-red-400 p-1 rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
                            title="Eliminar este insumo"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-neutral-900/60 font-bold border-t border-neutral-800">
                  <tr>
                    <td colSpan={3} className="py-3 px-4 text-neutral-300 uppercase">
                      Suma Total de Costos Operativos e Insumos:
                    </td>
                    <td className="py-3 px-4 text-right text-base text-amber-400 font-black">
                      ${subtotalCostos.toFixed(2)} USD
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* PASO 4: RESULTADO FINAL & MARGEN DE GANANCIA (DIVISOR 0.70) */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-neutral-950 via-[#0D253A]/40 to-neutral-950 border border-neutral-800 shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-amber-400/10 text-amber-400 border border-amber-400/20 font-mono text-xs font-bold">
                  04
                </span>
                <div>
                  <h3 className="text-base font-black text-white uppercase tracking-tight font-brand-heading">
                    Paso 4: Margen de Ganancia del 30% (Divisor 0.70) & Precio Total
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Fórmula oficial: <code className="text-amber-400 font-mono">Suma de Costos (${subtotalCostos.toFixed(2)}) ÷ 0.70 = Precio Total</code>
                  </p>
                </div>
              </div>

              {/* Selector de Margen */}
              <div className="flex items-center gap-2 bg-neutral-900 p-1.5 rounded-xl border border-neutral-800 text-xs font-mono">
                <span className="text-neutral-400">Margen:</span>
                {[25, 30, 35, 40].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMarginPercent(m)}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      marginPercent === m
                        ? 'bg-amber-400 text-black'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    {m}% ({((100 - m) / 100).toFixed(2)})
                  </button>
                ))}
              </div>
            </div>

            {/* Big Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              
              {/* Costos Base */}
              <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-1">
                <span className="text-[10px] font-mono uppercase text-neutral-400 font-bold block">
                  Costo de Fabricación & Confección:
                </span>
                <span className="text-2xl font-black text-white font-mono block">
                  ${subtotalCostos.toFixed(2)} <span className="text-xs text-neutral-400 font-normal">USD</span>
                </span>
                <span className="text-xs text-neutral-400 font-mono block">
                  ~ Bs. {(subtotalCostos * exchangeRateBCV).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <p className="text-[11px] text-neutral-500 pt-2 border-t border-neutral-800 mt-2">
                  Incluye tela, DTF, plancha, empaque y mano de obra.
                </p>
              </div>

              {/* Ganancia Neta */}
              <div className="p-5 rounded-2xl bg-emerald-950/40 border border-emerald-800/60 space-y-1">
                <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold block">
                  Ganancia Neta ({marginPercent}% de Margen):
                </span>
                <span className="text-2xl font-black text-emerald-400 font-mono block">
                  +${gananciaNetaUSD.toFixed(2)} <span className="text-xs text-emerald-300 font-normal">USD</span>
                </span>
                <span className="text-xs text-emerald-300/80 font-mono block">
                  ~ Bs. {gananciaNetaVES.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <p className="text-[11px] text-emerald-300/70 pt-2 border-t border-emerald-800/60 mt-2">
                  Retorno limpio para socios y reinversión de marca.
                </p>
              </div>

              {/* Precio Total de Venta al Cliente */}
              <div className="p-5 rounded-2xl bg-amber-400/10 border-2 border-amber-400/60 space-y-1 shadow-xl shadow-amber-400/5">
                <span className="text-[10px] font-mono uppercase text-amber-300 font-bold block">
                  PRECIO TOTAL DE VENTA SUGERIDO:
                </span>
                <span className="text-3xl font-black text-amber-400 font-mono block">
                  ${precioTotalVentaUSD.toFixed(2)} <span className="text-xs text-neutral-300 font-normal">USD</span>
                </span>
                <span className="text-xs text-amber-200/90 font-mono font-bold block">
                  ~ Bs. {precioTotalVentaVES.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (Tasa BCV)
                </span>
                <p className="text-[11px] text-neutral-300 pt-2 border-t border-amber-400/30 mt-2">
                  Tarifa final para WhatsApp o tienda online.
                </p>
              </div>

            </div>

            {/* Action Buttons for Quotation */}
            <div className="pt-3 flex flex-wrap items-center justify-between gap-3 border-t border-neutral-800">
              <span className="text-xs text-neutral-400 font-mono">
                Cálculo instantáneo listo para compartir con el cliente.
              </span>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleApplyAsPublicBasePrice}
                  className="px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-850 text-neutral-200 hover:text-white border border-neutral-700 text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-2"
                >
                  <ArrowRight size={14} className="text-amber-400" />
                  <span>Aplicar en Personalizador Público (${Math.round(precioTotalVentaUSD)}.00)</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyWhatsAppQuote}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-emerald-500/20 flex items-center gap-2"
                >
                  <Copy size={15} />
                  <span>Copiar Cotización para WhatsApp</span>
                </button>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ========================================================== */}
      {/* TAB 2: GESTIÓN DE MOCKUPS DE CATÁLOGO (IMAGEN)             */}
      {/* ========================================================== */}
      {activeTab === 'mockups' && (
        <div className="space-y-8 animate-in fade-in duration-150">
          
          {/* Form to Add New Mockup */}
          <div className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 shadow-xl space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-neutral-800">
              <span className="p-1.5 rounded-lg bg-amber-400/10 text-amber-400">
                <Plus size={16} />
              </span>
              <h3 className="text-base font-black text-white uppercase tracking-tight font-brand-heading">
                Subir Nuevo Mockup de Catálogo
              </h3>
            </div>

            <form onSubmit={handleSaveMockup} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-300 uppercase mb-1">
                    Nombre del Mockup *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Franela Oversize 240g Negro"
                    value={mockupName}
                    onChange={(e) => setMockupName(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-300 uppercase mb-1">
                    Prenda o Categoría
                  </label>
                  <select
                    value={mockupCategory}
                    onChange={(e) => setMockupCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white"
                  >
                    <option value="franela">Franelas & Camisetas</option>
                    <option value="tote">Tote Bags</option>
                    <option value="lamina">Láminas Sublimadas</option>
                    <option value="stickers">Packs de Stickers</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-300 uppercase mb-1">
                    Vista de la Prenda
                  </label>
                  <select
                    value={mockupView}
                    onChange={(e) => setMockupView(e.target.value as any)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white"
                  >
                    <option value="delante">Frente (Delantero)</option>
                    <option value="detras">Espalda (Trasero)</option>
                    <option value="frontal">Frontal Universal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-300 uppercase mb-1">
                    Color del Mockup
                  </label>
                  <input
                    type="text"
                    value={mockupColorName}
                    onChange={(e) => setMockupColorName(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-neutral-300 uppercase mb-1">
                    Archivo de Imagen del Mockup (PNG / JPG / WEBP) *
                  </label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full text-xs text-neutral-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-neutral-800 file:text-white hover:file:bg-neutral-700 cursor-pointer"
                  />
                </div>

                <div className="flex items-end justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-black uppercase tracking-wider text-xs shadow-lg transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus size={15} />
                    <span>Guardar Mockup en Catálogo</span>
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Existing Mockups Grid */}
          <div className="p-6 rounded-3xl bg-neutral-950 border border-neutral-800 space-y-4">
            <h3 className="text-base font-black text-white uppercase tracking-tight font-brand-heading">
              Mockups Activos en el Personalizador ({customLabMockups.length})
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {customLabMockups.map((m) => (
                <div key={m.id} className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="w-full h-44 rounded-xl bg-black border border-neutral-800 overflow-hidden flex items-center justify-center p-2 mb-2">
                      <img src={m.imageUrl} alt={m.name} className="max-h-full max-w-full object-contain" />
                    </div>
                    <span className="text-xs font-bold text-white block truncate">{m.name}</span>
                    <span className="text-[10px] text-neutral-400 font-mono block">
                      {m.category.toUpperCase()} • {m.view} • {m.colorName || 'Base'}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-neutral-800 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-neutral-500">{m.widthCm}x{m.heightCm} cm</span>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`¿Eliminar mockup "${m.name}"?`)) {
                          deleteCustomLabMockup(m.id);
                          showNotification('Mockup eliminado.');
                        }
                      }}
                      className="text-neutral-500 hover:text-red-400 p-1 cursor-pointer"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ========================================================== */}
      {/* TAB 3: REGLAS GENERALES DE TARIFAS PÚBLICAS                */}
      {/* ========================================================== */}
      {activeTab === 'pricing' && (
        <form onSubmit={handleSavePricing} className="space-y-8 animate-in fade-in duration-150">
          
          {/* Section 1: Franelas & Camisetas */}
          <div className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 shadow-xl space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-neutral-800">
              <span className="p-1.5 rounded-lg bg-amber-400/10 text-amber-400 font-bold font-mono text-xs">
                01
              </span>
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider font-brand-heading">
                  Precios & Reglas de Franelas (DTF Textil 240g)
                </h3>
                <p className="text-[11px] text-neutral-400">
                  Corte Normal, Oversize, recargo por tallas XL y estampado en ambos lados.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="block text-[11px] font-mono text-neutral-300 mb-1">
                  Precio Base Franela ($ USD)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={pricingState.franelaBasePrice}
                  onChange={(e) => setPricingState({ ...pricingState, franelaBasePrice: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono"
                />
                <span className="text-[10px] text-neutral-500 font-mono mt-1 block">
                  Eq: Bs. {(pricingState.franelaBasePrice * exchangeRateBCV).toFixed(2)}
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-neutral-300 mb-1">
                  Recargo Corte Oversize ($ USD)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={pricingState.oversizeExtraDelta}
                  onChange={(e) => setPricingState({ ...pricingState, oversizeExtraDelta: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono"
                />
                <span className="text-[10px] text-neutral-500 font-mono mt-1 block">
                  (Hasta talla L únicamente)
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-neutral-300 mb-1">
                  Recargo por cada "X" en Tallas ($)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={pricingState.xlExtraDeltaPerX}
                  onChange={(e) => setPricingState({ ...pricingState, xlExtraDeltaPerX: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono"
                />
                <span className="text-[10px] text-neutral-500 font-mono mt-1 block">
                  XL: +$1, 2XL: +$2, 3XL: +$3, 4XL: +$4
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-neutral-300 mb-1">
                  Recargo Doble Estampado (Frente + Espalda)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={pricingState.bothSidesDelta}
                  onChange={(e) => setPricingState({ ...pricingState, bothSidesDelta: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono"
                />
                <span className="text-[10px] text-neutral-500 font-mono mt-1 block">
                  Doble film DTF de alta resolución
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Medidas de Estampado */}
          <div className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 shadow-xl space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-neutral-800">
              <span className="p-1.5 rounded-lg bg-amber-400/10 text-amber-400 font-bold font-mono text-xs">
                02
              </span>
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider font-brand-heading">
                  Escalas de Medidas en Centímetros & Recargos de Impresión
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pricingState.printAreaSizes.map((area, idx) => (
                <div key={area.id} className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white font-mono">{area.label}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-800 text-amber-400">
                      {area.dimensionsCm}
                    </span>
                  </div>
                  <p className="text-[10px] text-neutral-400 leading-tight">{area.recommendedFor}</p>
                  
                  <div className="pt-2 flex items-center justify-between">
                    <label className="text-[11px] text-neutral-400 font-mono">Recargo de Impresión ($):</label>
                    <div className="flex items-center gap-1.5">
                      <span className="text-neutral-500 text-xs font-mono">+$</span>
                      <input
                        type="number"
                        step="0.5"
                        value={area.surchargeUSD}
                        onChange={(e) => {
                          const updated = [...pricingState.printAreaSizes];
                          updated[idx] = { ...area, surchargeUSD: parseFloat(e.target.value) || 0 };
                          setPricingState({ ...pricingState, printAreaSizes: updated });
                        }}
                        className="w-20 px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-700 text-white font-mono text-right text-xs"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-black uppercase tracking-wider text-xs shadow-xl shadow-amber-400/20 transition-all cursor-pointer flex items-center gap-2"
            >
              <Check size={16} />
              <span>Guardar Configuración de Precios</span>
            </button>
          </div>
        </form>
      )}

    </div>
  );
};
