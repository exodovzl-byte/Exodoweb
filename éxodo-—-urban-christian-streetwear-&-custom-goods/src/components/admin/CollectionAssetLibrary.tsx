import React, { useState, useRef } from 'react';
import { 
  Image as ImageIcon, 
  Upload, 
  Plus, 
  Search, 
  Filter, 
  Tag, 
  Check, 
  X, 
  Trash2, 
  Edit3, 
  Download, 
  Eye, 
  Sparkles, 
  Shirt, 
  ShoppingBag, 
  Frame, 
  Sticker, 
  Layers, 
  SlidersHorizontal,
  BookOpen,
  Info,
  Maximize2,
  FileCheck
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { ArtworkDesign, ArtworkCollection } from '../../types';

export const CollectionAssetLibrary: React.FC = () => {
  const { 
    artworkDesigns, 
    addArtworkDesign, 
    updateArtworkDesign, 
    deleteArtworkDesign, 
    toggleArtworkSupport 
  } = useStore();

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCollectionFilter, setSelectedCollectionFilter] = useState<string>('todas');
  const [selectedSupportFilter, setSelectedSupportFilter] = useState<string>('todos');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDesign, setEditingDesign] = useState<ArtworkDesign | null>(null);
  const [inspectImage, setInspectImage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formCollection, setFormCollection] = useState<ArtworkCollection>('La calle es un museo');
  const [formGraphic, setFormGraphic] = useState('');
  const [formScripture, setFormScripture] = useState('');
  const [formSpiritualMeaning, setFormSpiritualMeaning] = useState('');
  const [formTechnique, setFormTechnique] = useState('DTF Textil Digital (300 DPI)');
  const [formPrintDimensions, setFormPrintDimensions] = useState('40 x 50 cm (Espalda completa)');
  const [formDpi, setFormDpi] = useState<number>(300);
  const [formColorProfile, setFormColorProfile] = useState('CMYK FOGRA39');
  const [formNotes, setFormNotes] = useState('');
  
  // Support availability flags
  const [formSupports, setFormSupports] = useState({
    franela: true,
    tote: true,
    lamina: true,
    stickers: true,
  });

  // Custom tags
  const [formTags, setFormTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const quickUploadRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleOpenAddModal = () => {
    setEditingDesign(null);
    setFormTitle('');
    setFormCollection('La calle es un museo');
    setFormGraphic('/src/assets/images/mockup_inocentes_1791055607165.jpg');
    setFormScripture('');
    setFormSpiritualMeaning('');
    setFormTechnique('DTF Textil Digital (300 DPI)');
    setFormPrintDimensions('40 x 50 cm (Espalda completa)');
    setFormDpi(300);
    setFormColorProfile('CMYK FOGRA39');
    setFormNotes('');
    setFormSupports({
      franela: true,
      tote: true,
      lamina: true,
      stickers: true,
    });
    setFormTags(['Franela', 'Tote Bag', 'Lámina', 'Sticker', 'DTF Textil']);
    setTagInput('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (design: ArtworkDesign) => {
    setEditingDesign(design);
    setFormTitle(design.title);
    setFormCollection(design.collection);
    setFormGraphic(design.highResGraphic);
    setFormScripture(design.scripture);
    setFormSpiritualMeaning(design.spiritualMeaning);
    setFormTechnique(design.technique);
    setFormPrintDimensions(design.printDimensions || '40 x 50 cm');
    setFormDpi(design.dpi || 300);
    setFormColorProfile(design.colorProfile || 'CMYK FOGRA39');
    setFormNotes(design.notes || '');
    setFormSupports({ ...design.availableSupports });
    setFormTags([...design.tags]);
    setTagInput('');
    setIsModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido (PNG, SVG, JPG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFormGraphic(reader.result as string);
      showToast(`¡Gráfico "${file.name}" cargado en alta resolución!`);
    };
    reader.readAsDataURL(file);
  };

  const handleQuickGraphicReplace = (id: string, file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Archivo de imagen inválido.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      updateArtworkDesign(id, { highResGraphic: reader.result as string });
      showToast('¡Gráfico en alta resolución actualizado!');
    };
    reader.readAsDataURL(file);
  };

  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    const clean = tagInput.trim();
    if (!formTags.includes(clean)) {
      setFormTags([...formTags, clean]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormTags(formTags.filter((t) => t !== tagToRemove));
  };

  const handleToggleFormSupport = (support: 'franela' | 'tote' | 'lamina' | 'stickers') => {
    const newVal = !formSupports[support];
    const newSupports = { ...formSupports, [support]: newVal };
    setFormSupports(newSupports);

    // Sync corresponding tag in formTags
    const tagMap: Record<string, string> = {
      franela: 'Franela',
      tote: 'Tote Bag',
      lamina: 'Lámina',
      stickers: 'Sticker',
    };
    const tagName = tagMap[support];
    let newTags = [...formTags];
    if (newVal) {
      if (!newTags.includes(tagName)) newTags.push(tagName);
    } else {
      newTags = newTags.filter((t) => t !== tagName);
    }
    setFormTags(newTags);
  };

  const handleSaveDesign = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formTitle.trim()) {
      alert('El título del arte es obligatorio.');
      return;
    }

    if (!formGraphic) {
      alert('Debes subir o asignar un gráfico en alta resolución.');
      return;
    }

    const designPayload: ArtworkDesign = {
      id: editingDesign ? editingDesign.id : `art-${Date.now()}`,
      title: formTitle.trim(),
      collection: formCollection,
      highResGraphic: formGraphic,
      scripture: formScripture.trim() || 'Éxodo 24:12',
      spiritualMeaning: formSpiritualMeaning.trim() || 'Diseño con propósito para predicar la Palabra en el asfalto.',
      technique: formTechnique.trim(),
      availableSupports: formSupports,
      tags: formTags.length > 0 ? formTags : ['Franela'],
      printDimensions: formPrintDimensions.trim(),
      dpi: Number(formDpi) || 300,
      colorProfile: formColorProfile.trim(),
      createdAt: editingDesign ? editingDesign.createdAt : new Date().toISOString().split('T')[0],
      notes: formNotes.trim(),
    };

    if (editingDesign) {
      updateArtworkDesign(editingDesign.id, designPayload);
      showToast(`¡Arte "${designPayload.title}" actualizado con éxito!`);
    } else {
      addArtworkDesign(designPayload);
      showToast(`¡Nuevo arte "${designPayload.title}" guardado en la librería!`);
    }

    setIsModalOpen(false);
  };

  // Filtered artworks
  const filteredArtworks = artworkDesigns.filter((art) => {
    // Collection Filter
    if (selectedCollectionFilter !== 'todas') {
      if (selectedCollectionFilter === 'La calle es un museo' && art.collection !== 'La calle es un museo') return false;
      if (selectedCollectionFilter === 'Venecristiana' && art.collection !== 'Venecristiana') return false;
    }

    // Support Filter
    if (selectedSupportFilter !== 'todos') {
      if (selectedSupportFilter === 'franela' && !art.availableSupports.franela) return false;
      if (selectedSupportFilter === 'tote' && !art.availableSupports.tote) return false;
      if (selectedSupportFilter === 'lamina' && !art.availableSupports.lamina) return false;
      if (selectedSupportFilter === 'stickers' && !art.availableSupports.stickers) return false;
    }

    // Search Query Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchTitle = art.title.toLowerCase().includes(q);
      const matchScripture = art.scripture.toLowerCase().includes(q);
      const matchCollection = art.collection.toLowerCase().includes(q);
      const matchTags = art.tags.some((t) => t.toLowerCase().includes(q));
      if (!matchTitle && !matchScripture && !matchCollection && !matchTags) return false;
    }

    return true;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl bg-amber-400 text-black text-xs font-black shadow-2xl flex items-center gap-2 animate-bounce">
          <Check size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner & Description */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-neutral-900/90 via-[#0D253A]/40 to-neutral-950 border border-neutral-800 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-400/10 text-amber-400 border border-amber-400/20">
                <ImageIcon size={20} />
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight font-brand-heading">
                Colección Asset Library (Gestor de Artes Gráficos)
              </h2>
            </div>
            <p className="text-xs text-neutral-400 mt-1 max-w-3xl leading-relaxed">
              Repositorio centralizado de ilustraciones, composiciones tipográficas y artes de las colecciones <strong className="text-amber-400">"La calle es un museo"</strong> y <strong className="text-amber-400">"Venecristiana"</strong>. Sube gráficos en alta resolución para DTF/sublimación y define qué soportes están habilitados (<strong className="text-white">Franela, Tote Bag, Lámina o Sticker</strong>).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="px-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs font-mono text-neutral-300">
              Total Artes: <strong className="text-amber-400 font-bold">{artworkDesigns.length}</strong>
            </div>

            <button
              type="button"
              onClick={handleOpenAddModal}
              className="flex items-center gap-2 px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-black text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-lg active:scale-95 cursor-pointer"
            >
              <Plus size={16} />
              <span>Nuevo Arte Gráfico</span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="mt-6 pt-5 border-t border-neutral-800 flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Collection Pills */}
          <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
            <span className="text-[11px] font-mono text-neutral-400 mr-1 hidden sm:inline">Colección:</span>
            
            <button
              onClick={() => setSelectedCollectionFilter('todas')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedCollectionFilter === 'todas'
                  ? 'bg-neutral-100 text-black shadow-md font-black'
                  : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
              }`}
            >
              Todas ({artworkDesigns.length})
            </button>

            <button
              onClick={() => setSelectedCollectionFilter('La calle es un museo')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedCollectionFilter === 'La calle es un museo'
                  ? 'bg-amber-400 text-black shadow-md font-black'
                  : 'bg-neutral-900 text-neutral-400 hover:text-amber-300 border border-neutral-800'
              }`}
            >
              La calle es un museo ({artworkDesigns.filter(a => a.collection === 'La calle es un museo').length})
            </button>

            <button
              onClick={() => setSelectedCollectionFilter('Venecristiana')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedCollectionFilter === 'Venecristiana'
                  ? 'bg-amber-400 text-black shadow-md font-black'
                  : 'bg-neutral-900 text-neutral-400 hover:text-amber-300 border border-neutral-800'
              }`}
            >
              Venecristiana ({artworkDesigns.filter(a => a.collection === 'Venecristiana').length})
            </button>
          </div>

          {/* Support Filter & Search Bar */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            
            {/* Support dropdown filter */}
            <div className="flex items-center gap-1 bg-neutral-900 px-2 py-1 rounded-lg border border-neutral-800 text-xs">
              <Filter size={13} className="text-amber-400" />
              <select
                value={selectedSupportFilter}
                onChange={(e) => setSelectedSupportFilter(e.target.value)}
                className="bg-transparent text-neutral-200 text-xs focus:outline-none cursor-pointer"
              >
                <option value="todos" className="bg-neutral-900">Todos los soportes</option>
                <option value="franela" className="bg-neutral-900">👕 Apto Franela</option>
                <option value="tote" className="bg-neutral-900">👜 Apto Tote Bag</option>
                <option value="lamina" className="bg-neutral-900">🖼️ Apto Lámina</option>
                <option value="stickers" className="bg-neutral-900">✨ Apto Sticker</option>
              </select>
            </div>

            {/* In-library Search */}
            <div className="relative w-full sm:w-60">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input
                type="text"
                placeholder="Buscar por arte, versículo o tag..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-7 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
                >
                  <X size={12} />
                </button>
              )}
            </div>

          </div>

        </div>
      </div>

      {/* Artwork Grid */}
      {filteredArtworks.length === 0 ? (
        <div className="p-16 text-center rounded-2xl bg-neutral-950 border border-neutral-800">
          <ImageIcon size={36} className="mx-auto text-neutral-600 mb-3" />
          <h3 className="text-base font-bold text-white">No se encontraron diseños gráficos</h3>
          <p className="text-xs text-neutral-500 mt-1 max-w-md mx-auto">
            Prueba cambiando los filtros de colección, soporte o añade una nueva ilustración con el botón superior.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArtworks.map((art) => {
            const isMuseo = art.collection === 'La calle es un museo';
            return (
              <div
                key={art.id}
                className="rounded-2xl bg-neutral-900/40 border border-neutral-800/90 hover:border-neutral-700 transition-all flex flex-col justify-between overflow-hidden shadow-lg group"
              >
                <div>
                  
                  {/* High-res Graphic Frame */}
                  <div className="relative aspect-[4/3] w-full bg-black overflow-hidden border-b border-neutral-800">
                    <img
                      src={art.highResGraphic}
                      alt={art.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Gradient Overlay for Contrast */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 items-center">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider shadow-md ${
                        isMuseo
                          ? 'bg-[#0D253A] text-amber-300 border border-amber-400/40'
                          : 'bg-neutral-950 text-emerald-300 border border-emerald-500/40'
                      }`}>
                        {art.collection}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-black/80 text-[10px] font-mono text-neutral-300 border border-neutral-700">
                        {art.dpi ? `${art.dpi} DPI` : '300 DPI'}
                      </span>
                    </div>

                    {/* Inspect High-res Button */}
                    <div className="absolute top-3 right-3 flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setInspectImage(art.highResGraphic)}
                        className="p-1.5 rounded-lg bg-black/80 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700 transition-colors shadow-lg cursor-pointer"
                        title="Inspeccionar arte en alta resolución"
                      >
                        <Maximize2 size={13} />
                      </button>
                    </div>

                    {/* Quick Specs in bottom of image */}
                    <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[10px] font-mono text-neutral-300">
                      <span className="truncate max-w-[180px]">{art.printDimensions || '40x50 cm'}</span>
                      <span className="text-amber-400 font-bold">{art.technique.split(' ')[0]}</span>
                    </div>
                  </div>

                  {/* Body Info */}
                  <div className="p-5 space-y-3">
                    
                    <div>
                      <p className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider truncate">
                        {art.scripture.split('—')[0]}
                      </p>
                      <h3 className="text-base font-black text-white uppercase tracking-tight mt-0.5 line-clamp-1 font-brand-heading">
                        {art.title}
                      </h3>
                      <p className="text-xs text-neutral-400 mt-1.5 line-clamp-2 leading-relaxed">
                        {art.spiritualMeaning}
                      </p>
                    </div>

                    {/* SUPPORT AVAILABILITY TAGS MANAGER (CRITICAL REQUIREMENT) */}
                    <div className="pt-2 border-t border-neutral-800/80">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold uppercase font-mono tracking-wider text-neutral-300 flex items-center gap-1">
                          <Tag size={11} className="text-amber-400" />
                          <span>Soportes Disponibles:</span>
                        </span>
                        <span className="text-[9px] text-neutral-500 font-mono">
                          (Clic para alternar)
                        </span>
                      </div>

                      {/* Interactive Support Tag Badges */}
                      <div className="grid grid-cols-2 gap-1.5">
                        
                        {/* Franela Tag */}
                        <button
                          type="button"
                          onClick={() => toggleArtworkSupport(art.id, 'franela')}
                          className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                            art.availableSupports.franela
                              ? 'bg-sky-950/70 border-sky-500/60 text-sky-300 shadow-sm'
                              : 'bg-neutral-950 border-neutral-800/80 text-neutral-500 hover:text-neutral-300 opacity-60'
                          }`}
                          title={art.availableSupports.franela ? 'Habilitado para Franela 240g' : 'Deshabilitado para Franela'}
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            <Shirt size={12} className={art.availableSupports.franela ? 'text-sky-400' : 'text-neutral-600'} />
                            <span className="truncate">Franela 240g</span>
                          </div>
                          {art.availableSupports.franela ? (
                            <Check size={12} className="text-sky-400 shrink-0" />
                          ) : (
                            <span className="text-[9px] text-neutral-600">OFF</span>
                          )}
                        </button>

                        {/* Tote Bag Tag */}
                        <button
                          type="button"
                          onClick={() => toggleArtworkSupport(art.id, 'tote')}
                          className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                            art.availableSupports.tote
                              ? 'bg-amber-950/70 border-amber-500/60 text-amber-300 shadow-sm'
                              : 'bg-neutral-950 border-neutral-800/80 text-neutral-500 hover:text-neutral-300 opacity-60'
                          }`}
                          title={art.availableSupports.tote ? 'Habilitado para Tote Bag' : 'Deshabilitado para Tote Bag'}
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            <ShoppingBag size={12} className={art.availableSupports.tote ? 'text-amber-400' : 'text-neutral-600'} />
                            <span className="truncate">Tote Bag 12oz</span>
                          </div>
                          {art.availableSupports.tote ? (
                            <Check size={12} className="text-amber-400 shrink-0" />
                          ) : (
                            <span className="text-[9px] text-neutral-600">OFF</span>
                          )}
                        </button>

                        {/* Lámina Tag */}
                        <button
                          type="button"
                          onClick={() => toggleArtworkSupport(art.id, 'lamina')}
                          className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                            art.availableSupports.lamina
                              ? 'bg-purple-950/70 border-purple-500/60 text-purple-300 shadow-sm'
                              : 'bg-neutral-950 border-neutral-800/80 text-neutral-500 hover:text-neutral-300 opacity-60'
                          }`}
                          title={art.availableSupports.lamina ? 'Habilitado para Lámina Sublimada' : 'Deshabilitado para Lámina'}
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            <Frame size={12} className={art.availableSupports.lamina ? 'text-purple-400' : 'text-neutral-600'} />
                            <span className="truncate">Lámina Subl.</span>
                          </div>
                          {art.availableSupports.lamina ? (
                            <Check size={12} className="text-purple-400 shrink-0" />
                          ) : (
                            <span className="text-[9px] text-neutral-600">OFF</span>
                          )}
                        </button>

                        {/* Sticker Tag */}
                        <button
                          type="button"
                          onClick={() => toggleArtworkSupport(art.id, 'stickers')}
                          className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                            art.availableSupports.stickers
                              ? 'bg-emerald-950/70 border-emerald-500/60 text-emerald-300 shadow-sm'
                              : 'bg-neutral-950 border-neutral-800/80 text-neutral-500 hover:text-neutral-300 opacity-60'
                          }`}
                          title={art.availableSupports.stickers ? 'Habilitado para Sticker UV DTF' : 'Deshabilitado para Stickers'}
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            <Sticker size={12} className={art.availableSupports.stickers ? 'text-emerald-400' : 'text-neutral-600'} />
                            <span className="truncate">Stickers UV</span>
                          </div>
                          {art.availableSupports.stickers ? (
                            <Check size={12} className="text-emerald-400 shrink-0" />
                          ) : (
                            <span className="text-[9px] text-neutral-600">OFF</span>
                          )}
                        </button>

                      </div>
                    </div>

                    {/* All Associated Tags Chips */}
                    <div className="pt-2 flex flex-wrap gap-1">
                      {art.tags.map((t) => (
                        <span
                          key={t}
                          className="px-2 py-0.5 rounded bg-neutral-950 text-[10px] font-mono text-neutral-400 border border-neutral-800"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>

                  </div>
                </div>

                {/* Footer Action Buttons */}
                <div className="p-4 pt-3 bg-neutral-950/80 border-t border-neutral-800/80 flex items-center justify-between gap-2">
                  
                  {/* Hidden file input for quick replace */}
                  <input
                    type="file"
                    ref={(el) => { quickUploadRefs.current[art.id] = el; }}
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleQuickGraphicReplace(art.id, e.target.files[0]);
                      }
                    }}
                    className="hidden"
                  />

                  <div className="flex items-center gap-1.5">
                    {/* Quick upload graphic */}
                    <button
                      type="button"
                      onClick={() => quickUploadRefs.current[art.id]?.click()}
                      className="px-2.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                      title="Reemplazar archivo en alta resolución"
                    >
                      <Upload size={13} className="text-amber-400" />
                      <span className="text-[11px]">Subir HD</span>
                    </button>

                    {/* Download Graphic */}
                    <a
                      href={art.highResGraphic}
                      download={`exodo-arte-${art.id}`}
                      className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-700 transition-colors"
                      title="Descargar arte original"
                    >
                      <Download size={14} />
                    </a>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Edit Details */}
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(art)}
                      className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700 transition-colors cursor-pointer"
                      title="Editar metadatos, tags y versículo"
                    >
                      <Edit3 size={14} />
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`¿Deseas eliminar el diseño gráfico "${art.title}" de la librería?`)) {
                          deleteArtworkDesign(art.id);
                          showToast('Arte eliminado de la librería.');
                        }
                      }}
                      className="p-1.5 rounded-lg bg-neutral-900 hover:bg-red-950 text-neutral-400 hover:text-red-400 border border-neutral-700 transition-colors cursor-pointer"
                      title="Eliminar diseño"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: ADD / EDIT ARTWORK DESIGN & TAGS                  */}
      {/* ======================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl bg-neutral-950 border border-neutral-800 rounded-2xl shadow-2xl p-6 max-h-[92vh] overflow-y-auto my-auto text-white">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
              <div>
                <span className="text-[10px] font-mono uppercase text-amber-400 font-bold">
                  {editingDesign ? 'Modificar Arte Registrado' : 'Nuevo Registro de Arte'}
                </span>
                <h3 className="text-xl font-black uppercase tracking-tight font-brand-heading">
                  {editingDesign ? `Editar: ${editingDesign.title}` : 'Añadir Diseño Gráfico a la Librería'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveDesign} className="mt-5 space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* Left Column: Graphic Upload & Preview */}
                <div className="space-y-4">
                  
                  <div>
                    <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                      Gráfico en Alta Resolución (DTF / Sublimación) *
                    </label>
                    
                    {/* Image Preview Box */}
                    <div className="relative aspect-[4/3] w-full rounded-xl bg-black border border-neutral-800 overflow-hidden flex items-center justify-center p-2">
                      {formGraphic ? (
                        <img
                          src={formGraphic}
                          alt="Preview"
                          className="max-h-full max-w-full object-contain"
                        />
                      ) : (
                        <div className="text-center text-neutral-600">
                          <ImageIcon size={32} className="mx-auto mb-1 opacity-50" />
                          <span className="text-xs">Sin imagen asignada</span>
                        </div>
                      )}

                      {formGraphic && (
                        <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/80 text-[10px] font-mono text-emerald-400 border border-neutral-700">
                          {formDpi} DPI
                        </span>
                      )}
                    </div>

                    {/* Upload button */}
                    <div className="mt-2.5 flex items-center gap-2">
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/png,image/svg+xml,image/jpeg,image/webp,image/tiff"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider border border-neutral-700 cursor-pointer"
                      >
                        <Upload size={14} className="text-amber-400" />
                        <span>Subir Archivo Gráfico HD</span>
                      </button>
                    </div>
                  </div>

                  {/* Print Dimensions & Profile */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-neutral-400 mb-1">Dimensiones de Impresión:</label>
                      <input
                        type="text"
                        value={formPrintDimensions}
                        onChange={(e) => setFormPrintDimensions(e.target.value)}
                        placeholder="Ej. 40 x 50 cm"
                        className="w-full p-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-neutral-400 mb-1">Perfil de Color / Tinta:</label>
                      <input
                        type="text"
                        value={formColorProfile}
                        onChange={(e) => setFormColorProfile(e.target.value)}
                        placeholder="CMYK FOGRA39 / sRGB"
                        className="w-full p-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-neutral-400 mb-1">Técnica Textil Sugerida:</label>
                    <input
                      type="text"
                      value={formTechnique}
                      onChange={(e) => setFormTechnique(e.target.value)}
                      placeholder="Ej. DTF Textil HD, Sublimación Metálica, UV DTF"
                      className="w-full p-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white"
                    />
                  </div>

                </div>

                {/* Right Column: Title, Collection, Scripture & Supports */}
                <div className="space-y-4">
                  
                  {/* Title */}
                  <div>
                    <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1">
                      Nombre / Título del Diseño *
                    </label>
                    <input
                      type="text"
                      required
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      placeholder="Ej. Inocente por Culpable / Harina P.A.N. Pan de Vida"
                      className="w-full p-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  {/* Collection Selector */}
                  <div>
                    <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1">
                      Colección Principal *
                    </label>
                    <select
                      value={formCollection}
                      onChange={(e) => setFormCollection(e.target.value as ArtworkCollection)}
                      className="w-full p-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 cursor-pointer"
                    >
                      <option value="La calle es un museo">La calle es un museo</option>
                      <option value="Venecristiana">Venecristiana</option>
                      <option value="El Ángel Caído">El Ángel Caído</option>
                      <option value="Básicos con Propósito">Básicos con Propósito</option>
                      <option value="Anime Fe">Anime Fe</option>
                      <option value="Música & Selah">Música & Selah</option>
                    </select>
                  </div>

                  {/* Scripture Reference */}
                  <div>
                    <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1">
                      Versículo Bíblico de Inspiración *
                    </label>
                    <input
                      type="text"
                      value={formScripture}
                      onChange={(e) => setFormScripture(e.target.value)}
                      placeholder="Ej. 2 Corintios 5:21 — Al que no conoció pecado..."
                      className="w-full p-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  {/* Spiritual Meaning */}
                  <div>
                    <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1">
                      Significado Espiritual & Manifiesto
                    </label>
                    <textarea
                      rows={2}
                      value={formSpiritualMeaning}
                      onChange={(e) => setFormSpiritualMeaning(e.target.value)}
                      placeholder="Explica la visión profética o mensaje teológico del arte..."
                      className="w-full p-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  {/* SUPPORT AVAILABILITY SELECTOR */}
                  <div className="p-3.5 rounded-xl bg-neutral-900/80 border border-neutral-800">
                    <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <Tag size={13} className="text-amber-400" />
                      <span>Soportes Disponibles para este Arte *</span>
                    </label>
                    <p className="text-[11px] text-neutral-400 mb-3">
                      Marca los formatos en los que este diseño se puede comercializar o estampar:
                    </p>

                    <div className="grid grid-cols-2 gap-2">
                      
                      <button
                        type="button"
                        onClick={() => handleToggleFormSupport('franela')}
                        className={`flex items-center gap-2 p-2 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                          formSupports.franela
                            ? 'bg-sky-950/80 border-sky-500 text-sky-300'
                            : 'bg-neutral-950 border-neutral-800 text-neutral-500'
                        }`}
                      >
                        <Shirt size={14} className={formSupports.franela ? 'text-sky-400' : 'text-neutral-600'} />
                        <span className="truncate">Franela 240g</span>
                        {formSupports.franela && <Check size={13} className="ml-auto text-sky-400" />}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleFormSupport('tote')}
                        className={`flex items-center gap-2 p-2 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                          formSupports.tote
                            ? 'bg-amber-950/80 border-amber-500 text-amber-300'
                            : 'bg-neutral-950 border-neutral-800 text-neutral-500'
                        }`}
                      >
                        <ShoppingBag size={14} className={formSupports.tote ? 'text-amber-400' : 'text-neutral-600'} />
                        <span className="truncate">Tote Bag 12oz</span>
                        {formSupports.tote && <Check size={13} className="ml-auto text-amber-400" />}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleFormSupport('lamina')}
                        className={`flex items-center gap-2 p-2 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                          formSupports.lamina
                            ? 'bg-purple-950/80 border-purple-500 text-purple-300'
                            : 'bg-neutral-950 border-neutral-800 text-neutral-500'
                        }`}
                      >
                        <Frame size={14} className={formSupports.lamina ? 'text-purple-400' : 'text-neutral-600'} />
                        <span className="truncate">Lámina Sublimada</span>
                        {formSupports.lamina && <Check size={13} className="ml-auto text-purple-400" />}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleFormSupport('stickers')}
                        className={`flex items-center gap-2 p-2 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                          formSupports.stickers
                            ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                            : 'bg-neutral-950 border-neutral-800 text-neutral-500'
                        }`}
                      >
                        <Sticker size={14} className={formSupports.stickers ? 'text-emerald-400' : 'text-neutral-600'} />
                        <span className="truncate">Stickers UV DTF</span>
                        {formSupports.stickers && <Check size={13} className="ml-auto text-emerald-400" />}
                      </button>

                    </div>
                  </div>

                  {/* Custom Tags Section */}
                  <div>
                    <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1">
                      Etiquetas / Tags de Búsqueda
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddTag();
                          }
                        }}
                        placeholder="Ej. DTF Textil, Oversize 240g, Pop Gospel..."
                        className="flex-1 p-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white"
                      />
                      <button
                        type="button"
                        onClick={handleAddTag}
                        className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-bold"
                      >
                        + Tag
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {formTags.map((t) => (
                        <span
                          key={t}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-neutral-900 text-xs font-mono text-neutral-300 border border-neutral-800"
                        >
                          <span>#{t}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(t)}
                            className="text-neutral-500 hover:text-red-400 ml-1"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                </div>

              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-neutral-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-900 text-neutral-300 hover:text-white text-xs font-bold uppercase transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black text-xs font-black uppercase tracking-wider shadow-lg active:scale-95 transition-all cursor-pointer"
                >
                  {editingDesign ? 'Guardar Cambios' : 'Registrar Arte en Librería'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* HIGH-RES IMAGE INSPECT MODAL                             */}
      {/* ======================================================== */}
      {inspectImage && (
        <div 
          onClick={() => setInspectImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in cursor-zoom-out"
        >
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950 p-2 shadow-2xl">
            <button
              onClick={() => setInspectImage(null)}
              className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/80 text-white hover:bg-neutral-800 border border-neutral-700"
            >
              <X size={18} />
            </button>
            <img
              src={inspectImage}
              alt="High-res artwork inspection"
              className="max-h-[85vh] w-auto mx-auto object-contain rounded-xl"
            />
          </div>
        </div>
      )}

    </div>
  );
};
