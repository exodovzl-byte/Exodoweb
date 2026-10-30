import React, { useState, useRef } from 'react';
import { 
  Sliders, 
  Upload, 
  Trash2, 
  Check, 
  Plus, 
  Image as ImageIcon, 
  Layers, 
  Sparkles, 
  DollarSign, 
  Maximize2,
  RefreshCw,
  Info
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { CustomLabMockup, ProductCategory, PrintAreaSizeConfig } from '../../types';

export const CustomLabAdminConfig: React.FC = () => {
  const { 
    labPricingConfig, 
    updateLabPricingConfig, 
    customLabMockups, 
    addCustomLabMockup, 
    deleteCustomLabMockup,
    updateCustomLabMockup,
    exchangeRateBCV 
  } = useStore();

  const [activeTab, setActiveTab] = useState<'mockups' | 'pricing'>('mockups');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // New Mockup Form State
  const [mockupName, setMockupName] = useState('');
  const [mockupCategory, setMockupCategory] = useState<ProductCategory | 'franela' | 'tote' | 'lamina' | 'stickers'>('franela');
  const [mockupView, setMockupView] = useState<'delante' | 'detras' | 'frontal'>('delante');
  const [mockupColorName, setMockupColorName] = useState('Negro Pitch');
  const [mockupColorHex, setMockupColorHex] = useState('#000000');
  const [mockupWidthCm, setMockupWidthCm] = useState('35');
  const [mockupHeightCm, setMockupHeightCm] = useState('45');
  const [mockupImageData, setMockupImageData] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Pricing Form State (Local editing state)
  const [pricingState, setPricingState] = useState(labPricingConfig);

  const showNotification = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3000);
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

    // Reset Form
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
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl bg-emerald-500 text-black text-xs font-black shadow-2xl flex items-center gap-2 animate-bounce">
          <Check size={16} />
          <span>{successToast}</span>
        </div>
      )}

      {/* Header & Sub-Tabs */}
      <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-400/10 text-amber-400 border border-amber-400/20">
              <Sparkles size={18} />
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight font-brand-heading">
              Personalizador Pro: Mockups & Precios Automáticos
            </h2>
          </div>
          <p className="text-xs text-neutral-400 mt-1 max-w-2xl">
            Gestiona los mockups tipo imagen (frente y espalda), medidas de estampado en centímetros y la matriz de cálculo automático de precios para el Custom Lab.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 p-1 bg-neutral-950 rounded-xl border border-neutral-800 self-start md:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('mockups')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
              activeTab === 'mockups'
                ? 'bg-amber-400 text-black shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <ImageIcon size={14} />
            <span>Mockups Imagen ({customLabMockups.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('pricing')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
              activeTab === 'pricing'
                ? 'bg-amber-400 text-black shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <DollarSign size={14} />
            <span>Motor de Precios</span>
          </button>
        </div>
      </div>

      {/* TAB 1: MOCKUPS MANAGEMENT */}
      {activeTab === 'mockups' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Col 1: Upload New Mockup Form */}
          <div className="lg:col-span-1 p-6 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-xl space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-neutral-800">
              <Plus size={16} className="text-amber-400" />
              <h3 className="text-sm font-black text-white uppercase tracking-wider font-brand-heading">
                Subir Nuevo Mockup al Lab
              </h3>
            </div>

            <form onSubmit={handleSaveMockup} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-mono text-neutral-400 mb-1">
                  Nombre del Mockup
                </label>
                <input
                  type="text"
                  placeholder="ej. Franela Negra Vista Frente 240g"
                  value={mockupName}
                  onChange={(e) => setMockupName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-neutral-400 mb-1">
                    Categoría
                  </label>
                  <select
                    value={mockupCategory}
                    onChange={(e) => setMockupCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="franela">Franela</option>
                    <option value="tote">Tote Bag</option>
                    <option value="lamina">Lámina Aluminio</option>
                    <option value="stickers">Stickers UV</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-neutral-400 mb-1">
                    Vista / Perspectiva
                  </label>
                  <select
                    value={mockupView}
                    onChange={(e) => setMockupView(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="delante">Delante (Pecho / Frente)</option>
                    <option value="detras">Detrás (Espalda)</option>
                    <option value="frontal">Frontal 100%</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-neutral-400 mb-1">
                    Color Prenda
                  </label>
                  <input
                    type="text"
                    value={mockupColorName}
                    onChange={(e) => setMockupColorName(e.target.value)}
                    placeholder="Negro Pitch"
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-neutral-400 mb-1">
                    Medida Área (cm)
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      value={mockupWidthCm}
                      onChange={(e) => setMockupWidthCm(e.target.value)}
                      placeholder="Ancho"
                      className="w-1/2 px-2 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-center"
                    />
                    <span className="text-neutral-500">×</span>
                    <input
                      type="number"
                      value={mockupHeightCm}
                      onChange={(e) => setMockupHeightCm(e.target.value)}
                      placeholder="Alto"
                      className="w-1/2 px-2 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-center"
                    />
                  </div>
                </div>
              </div>

              {/* Upload Dropzone */}
              <div>
                <label className="block text-[11px] font-mono text-neutral-400 mb-1.5">
                  Imagen del Mockup (PNG con fondo limpio / transparente)
                </label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-4 rounded-xl border-2 border-dashed border-neutral-700 hover:border-amber-400 bg-neutral-950/60 text-center cursor-pointer transition-colors"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                  />
                  {mockupImageData ? (
                    <div className="space-y-2">
                      <img 
                        src={mockupImageData} 
                        alt="Preview" 
                        className="h-28 mx-auto object-contain rounded-lg drop-shadow-md" 
                      />
                      <span className="text-[10px] text-emerald-400 font-mono block">
                        ✓ Imagen cargada. Clic para cambiar.
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-1.5 py-3">
                      <Upload size={24} className="mx-auto text-amber-400/80" />
                      <p className="text-neutral-300 font-medium">Haz clic para subir imagen</p>
                      <p className="text-[10px] text-neutral-500">PNG transparente recomendado (hasta 8MB)</p>
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={!mockupImageData}
                className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-50 disabled:cursor-not-allowed text-black font-black uppercase tracking-wider text-xs shadow-lg shadow-amber-400/20 transition-all cursor-pointer"
              >
                Guardar Mockup en Catálogo
              </button>
            </form>
          </div>

          {/* Col 2 & 3: Existing Mockups Grid */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-white uppercase tracking-wider font-brand-heading">
                Mockups Activos en el Custom Lab ({customLabMockups.length})
              </h3>
              <span className="text-[11px] font-mono text-neutral-400">
                Disponibles para selección inmediata por los clientes
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {customLabMockups.map((m) => (
                <div 
                  key={m.id}
                  className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 flex flex-col justify-between transition-all group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="px-2 py-0.5 rounded-md bg-neutral-800 text-amber-400 uppercase font-bold">
                        {m.category} • {m.view}
                      </span>
                      {m.isDefault && (
                        <span className="text-emerald-400 flex items-center gap-1">
                          <Check size={12} /> Default
                        </span>
                      )}
                    </div>

                    <div className="h-44 w-full bg-neutral-950 rounded-xl border border-neutral-800/80 p-2 flex items-center justify-center overflow-hidden">
                      <img 
                        src={m.imageUrl} 
                        alt={m.name} 
                        className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform" 
                      />
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-white truncate">{m.name}</h4>
                      <p className="text-[10px] text-neutral-400 font-mono mt-0.5">
                        {m.colorName || 'Base'} • Área: {m.widthCm} × {m.heightCm} cm
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 mt-3 border-t border-neutral-800 flex items-center justify-between">
                    <span className="text-[9px] font-mono text-neutral-500">
                      ID: {m.id.split('-').slice(0, 2).join('-')}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`¿Eliminar mockup "${m.name}" del Custom Lab?`)) {
                          deleteCustomLabMockup(m.id);
                          showNotification('Mockup eliminado.');
                        }
                      }}
                      className="p-1.5 rounded-lg bg-neutral-800 hover:bg-red-950 text-neutral-400 hover:text-red-400 transition-colors cursor-pointer"
                      title="Eliminar mockup"
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

      {/* TAB 2: PRICING ENGINE CONFIGURATION */}
      {activeTab === 'pricing' && (
        <form onSubmit={handleSavePricing} className="space-y-8">
          
          {/* Section 1: Franelas & Camisetas */}
          <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-xl space-y-4">
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

          {/* Section 2: Medidas de Estampado en Centímetros (cm) */}
          <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-xl space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-neutral-800">
              <span className="p-1.5 rounded-lg bg-amber-400/10 text-amber-400 font-bold font-mono text-xs">
                02
              </span>
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider font-brand-heading">
                  Escalas de Medidas en Centímetros & Recargos de Impresión
                </h3>
                <p className="text-[11px] text-neutral-400">
                  Tarifas automáticas según los centímetros del arte que el cliente ubique en el lienzo.
                </p>
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

          {/* Section 3: Láminas & Tote Bags & Stickers */}
          <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-xl space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-neutral-800">
              <span className="p-1.5 rounded-lg bg-amber-400/10 text-amber-400 font-bold font-mono text-xs">
                03
              </span>
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider font-brand-heading">
                  Láminas de Aluminio, Tote Bags & Packs de Stickers
                </h3>
                <p className="text-[11px] text-neutral-400">
                  Precios por medida para sublimación metálica y cantidades por lote.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono text-neutral-300 mb-1">
                  Precio Base Tote Bag Lienzo Pesado ($ USD)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={pricingState.toteBasePrice}
                  onChange={(e) => setPricingState({ ...pricingState, toteBasePrice: parseFloat(e.target.value) || 0 })}
                  className="w-48 px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-neutral-300 mb-2">
                  Precios por Medida de Lámina Sublimada ($ USD)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {pricingState.laminaSizes.map((l, idx) => (
                    <div key={l.id} className="p-3 bg-neutral-950 rounded-xl border border-neutral-800">
                      <span className="text-xs font-bold text-white block">{l.name}</span>
                      <span className="text-[10px] text-neutral-400 font-mono">{l.dimensions}</span>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-[10px] text-neutral-500 font-mono">Precio:</span>
                        <div className="flex items-center gap-1">
                          <span className="text-neutral-500 font-mono text-xs">$</span>
                          <input
                            type="number"
                            step="0.5"
                            value={l.priceUSD}
                            onChange={(e) => {
                              const nextLam = [...pricingState.laminaSizes];
                              nextLam[idx] = { ...l, priceUSD: parseFloat(e.target.value) || 0 };
                              setPricingState({ ...pricingState, laminaSizes: nextLam });
                            }}
                            className="w-16 px-2 py-1 rounded bg-neutral-900 border border-neutral-700 text-white font-mono text-xs text-right"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
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
