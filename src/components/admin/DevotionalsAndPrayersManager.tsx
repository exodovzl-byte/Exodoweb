import React, { useState, useRef } from 'react';
import { 
  BookOpen, 
  Heart, 
  Plus, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  Upload, 
  MessageCircle, 
  Calendar, 
  Clock, 
  Sparkles, 
  Share2, 
  ExternalLink,
  Filter,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Phone,
  Mail,
  User
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Devotional, PrayerRequest } from '../../types';
import { compressImageFile } from '../../utils/imageCompressor';

export const DevotionalsAndPrayersManager: React.FC = () => {
  const { 
    devotionals, 
    addDevotional, 
    updateDevotional, 
    deleteDevotional,
    prayerRequests,
    updatePrayerRequestStatus,
    deletePrayerRequest 
  } = useStore();

  const [activeSubTab, setActiveSubTab] = useState<'devotionals' | 'prayers'>('devotionals');
  const [prayerFilter, setPrayerFilter] = useState<'todas' | 'nueva' | 'en_oracion' | 'respondida'>('todas');
  
  // Devotional Modal state
  const [isDevoModalOpen, setIsDevoModalOpen] = useState(false);
  const [editingDevo, setEditingDevo] = useState<Devotional | null>(null);
  const [devoTitle, setDevoTitle] = useState('');
  const [devoScripture, setDevoScripture] = useState('');
  const [devoExcerpt, setDevoExcerpt] = useState('');
  const [devoContent, setDevoContent] = useState('');
  const [devoTheme, setDevoTheme] = useState('Fe & Valentía');
  const [devoAspectRatio, setDevoAspectRatio] = useState<'4:5' | '9:16'>('4:5');
  const [devoImage, setDevoImage] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const pendingPrayersCount = prayerRequests.filter(p => p.status === 'nueva').length;

  const handleOpenAddDevo = () => {
    setEditingDevo(null);
    setDevoTitle('');
    setDevoScripture('');
    setDevoExcerpt('');
    setDevoContent('');
    setDevoTheme('Fe & Valentía');
    setDevoAspectRatio('4:5');
    setDevoImage('/src/assets/images/hero_streetwear_1791054715974.jpg');
    setIsDevoModalOpen(true);
  };

  const handleOpenEditDevo = (devo: Devotional) => {
    setEditingDevo(devo);
    setDevoTitle(devo.title);
    setDevoScripture(devo.scripture);
    setDevoExcerpt(devo.excerpt);
    setDevoContent(devo.content);
    setDevoTheme(devo.theme);
    setDevoAspectRatio(devo.aspectRatio);
    setDevoImage(devo.image);
    setIsDevoModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingImage(true);
      const compressed = await compressImageFile(file, 1200, 0.85);
      setDevoImage(compressed);
    } catch (err) {
      console.error('Error optimizando imagen del devocional:', err);
      alert('Error al procesar la imagen.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSaveDevotional = (e: React.FormEvent) => {
    e.preventDefault();
    if (!devoTitle.trim() || !devoScripture.trim()) {
      alert('Por favor ingresa al menos el título y el versículo bíblico.');
      return;
    }

    if (editingDevo) {
      updateDevotional({
        ...editingDevo,
        title: devoTitle.trim(),
        scripture: devoScripture.trim(),
        excerpt: devoExcerpt.trim(),
        content: devoContent.trim(),
        theme: devoTheme.trim(),
        aspectRatio: devoAspectRatio,
        image: devoImage || editingDevo.image,
      });
    } else {
      addDevotional({
        title: devoTitle.trim(),
        scripture: devoScripture.trim(),
        excerpt: devoExcerpt.trim() || devoContent.trim().substring(0, 150) + '...',
        content: devoContent.trim() || devoExcerpt.trim(),
        theme: devoTheme.trim(),
        aspectRatio: devoAspectRatio,
        image: devoImage || '/src/assets/images/hero_streetwear_1791054715974.jpg',
        author: 'Equipo Pastoral ÉXODO',
        date: new Date().toISOString().split('T')[0],
      });
    }

    setIsDevoModalOpen(false);
  };

  const handleDeleteDevo = (id: string, title: string) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar el devocional "${title}"?`)) {
      deleteDevotional(id);
    }
  };

  const handleContactWhatsApp = (prayer: PrayerRequest) => {
    const cleanPhone = prayer.phone.replace(/[^0-9]/g, '');
    const clientName = prayer.name || prayer.fullName || 'Hermano/a';
    const textSnippet = prayer.requestText || prayer.request || '';
    const text = encodeURIComponent(
      `Hola ${clientName}, paz y bendiciones. Te escribimos desde el equipo pastoral de ÉXODO.\n\nHemos recibido tu petición de oración respecto a: "${textSnippet.substring(0, 100)}..."\n\nQueremos que sepas que estamos orando por ti y nos ponemos a tu disposición.`
    );
    window.open(`https://wa.me/${cleanPhone.startsWith('58') ? cleanPhone : '58' + cleanPhone}?text=${text}`, '_blank');
  };

  const filteredPrayers = prayerRequests.filter(p => {
    if (prayerFilter === 'todas') return true;
    return p.status === prayerFilter;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400 font-mono">
            Pastoral & Contenido Espiritual
          </span>
          <h2 className="text-2xl font-black uppercase tracking-tight font-brand-heading text-white">
            LA PALABRA & PETICIONES DE ORACIÓN
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Administra los devocionales públicos de la tienda y atiende las peticiones pastorales recibidas en tiempo real.
          </p>
        </div>

        {/* Sub-tabs pills */}
        <div className="flex items-center gap-2 bg-neutral-900 p-1 rounded-xl border border-neutral-800">
          <button
            onClick={() => setActiveSubTab('devotionals')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${
              activeSubTab === 'devotionals'
                ? 'bg-[#0D253A] text-amber-400 shadow-md font-black'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <BookOpen size={14} />
            <span>Devocionales ({devotionals.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('prayers')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer relative ${
              activeSubTab === 'prayers'
                ? 'bg-[#0D253A] text-amber-400 shadow-md font-black'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Heart size={14} className={pendingPrayersCount > 0 ? 'text-amber-400 fill-amber-400/20' : ''} />
            <span>Peticiones ({prayerRequests.length})</span>
            {pendingPrayersCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-amber-500 text-black text-[9px] font-black animate-pulse">
                {pendingPrayersCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SUBTAB 1: DEVOCIONALES (LA PALABRA)                     */}
      {/* ======================================================== */}
      {activeSubTab === 'devotionals' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Artículos & Diseños "Comparte Tu Fe" ({devotionals.length})
              </h3>
              <p className="text-xs text-neutral-400">
                Se sincronizan en vivo con todos los clientes en la sección La Palabra.
              </p>
            </div>

            <button
              onClick={handleOpenAddDevo}
              className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black text-xs font-black uppercase rounded-xl transition-all shadow-lg active:scale-95 cursor-pointer"
            >
              <Plus size={15} />
              <span>Nuevo Devocional</span>
            </button>
          </div>

          {/* Devotionals Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {devotionals.map((devo) => (
              <div
                key={devo.id}
                className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex flex-col justify-between hover:border-neutral-700 transition-all shadow-md group"
              >
                <div>
                  {/* Image & aspect ratio badge */}
                  <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden bg-black border border-neutral-800 mb-3">
                    <img
                      src={devo.image}
                      alt={devo.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = '/assets/aistudio/exodo-appIcon_cbe32977.png';
                      }}
                    />
                    <div className="absolute top-2 left-2 flex items-center gap-1">
                      <span className="px-2 py-0.5 rounded bg-black/85 backdrop-blur-md text-amber-400 text-[9px] font-mono uppercase font-bold border border-neutral-800">
                        {devo.theme}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-black/60 text-neutral-400 text-[9px] font-mono">
                        {devo.aspectRatio}
                      </span>
                    </div>
                    <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/80 text-[10px] font-mono text-neutral-400">
                      {devo.date}
                    </div>
                  </div>

                  {/* Title & Scripture */}
                  <span className="text-[11px] font-mono text-amber-300 font-semibold block uppercase truncate">
                    {devo.scripture.split('—')[0]}
                  </span>
                  <h4 className="text-base font-black text-white leading-snug mt-0.5 font-brand-heading">
                    {devo.title}
                  </h4>
                  <p className="text-xs text-neutral-300 mt-1.5 line-clamp-2 leading-relaxed">
                    {devo.excerpt}
                  </p>
                </div>

                {/* Actions */}
                <div className="mt-4 pt-3 border-t border-neutral-800 flex items-center justify-between">
                  <span className="text-[10px] text-neutral-500 font-mono">
                    ID: {devo.id.substring(0, 12)}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditDevo(devo)}
                      className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white transition-colors cursor-pointer"
                      title="Editar devocional"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteDevo(devo.id, devo.title)}
                      className="p-1.5 rounded-lg bg-neutral-800 hover:bg-red-950 text-neutral-400 hover:text-red-400 transition-colors cursor-pointer"
                      title="Eliminar devocional"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {devotionals.length === 0 && (
              <div className="col-span-full py-16 text-center bg-neutral-950 rounded-2xl border border-neutral-800">
                <BookOpen size={32} className="mx-auto text-neutral-600 mb-2" />
                <p className="text-sm text-neutral-300 font-bold">No hay devocionales publicados aún.</p>
                <p className="text-xs text-neutral-500 mt-1">Crea el primer devocional para inspirar a tu comunidad.</p>
                <button
                  onClick={handleOpenAddDevo}
                  className="mt-4 px-4 py-2 bg-amber-500 text-black text-xs font-bold uppercase rounded-lg"
                >
                  + Crear Devocional
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUBTAB 2: BANDEJA DE PETICIONES DE ORACIÓN              */}
      {/* ======================================================== */}
      {activeSubTab === 'prayers' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Bandeja Pastoral de Oración
              </h3>
              <p className="text-xs text-neutral-400">
                Peticiones enviadas por visitantes y clientes de ÉXODO.
              </p>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
              {[
                { id: 'todas', label: 'Todas' },
                { id: 'nueva', label: 'Nuevas' },
                { id: 'en_oracion', label: 'En Oración' },
                { id: 'respondida', label: 'Respondidas' },
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setPrayerFilter(filter.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    prayerFilter === filter.id
                      ? 'bg-amber-400 text-black shadow-md'
                      : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* Prayer requests list */}
          <div className="space-y-3">
            {filteredPrayers.map((prayer) => {
              const isNew = prayer.status === 'nueva';
              const isInPrayer = prayer.status === 'en_oracion';
              const isAnswered = prayer.status === 'respondida';

              return (
                <div
                  key={prayer.id}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                    isNew
                      ? 'bg-amber-950/20 border-amber-500/40'
                      : isInPrayer
                      ? 'bg-blue-950/20 border-blue-500/30'
                      : 'bg-neutral-950 border-neutral-850 opacity-80'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-800/80">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-white flex items-center gap-1.5">
                        <User size={14} className="text-neutral-400" />
                        {prayer.name || prayer.fullName || 'Hermano/a'}
                      </span>
                      
                      {/* Status Tag */}
                      {isNew && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500 text-black text-[10px] font-black uppercase tracking-wider animate-pulse">
                          ● Nueva Petición
                        </span>
                      )}
                      {isInPrayer && (
                        <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40 text-[10px] font-bold uppercase">
                          En Oración
                        </span>
                      )}
                      {isAnswered && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold uppercase">
                          Respondida
                        </span>
                      )}

                      {(prayer.category || prayer.source) && (
                        <span className="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-750 text-[10px] font-mono text-neutral-300 uppercase">
                          {prayer.category || prayer.source}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-neutral-400 font-mono">
                      <Calendar size={12} />
                      <span>{prayer.createdAt}</span>
                    </div>
                  </div>

                  {/* Body text */}
                  <div className="py-3 text-xs sm:text-sm text-neutral-200 leading-relaxed font-sans bg-neutral-900/40 p-3 rounded-xl my-2 border border-neutral-850">
                    <p className="italic">"{prayer.requestText || prayer.request}"</p>
                  </div>

                  {/* Contact info & Action Buttons */}
                  <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3 text-neutral-400 flex-wrap">
                      {prayer.phone && (
                        <span className="flex items-center gap-1 font-mono text-amber-300">
                          <Phone size={12} />
                          {prayer.phone}
                        </span>
                      )}
                      {prayer.email && (
                        <span className="flex items-center gap-1 font-mono">
                          <Mail size={12} />
                          {prayer.email}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {prayer.phone && (
                        <button
                          onClick={() => handleContactWhatsApp(prayer)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                          title="Contactar por WhatsApp"
                        >
                          <MessageCircle size={13} />
                          <span>WhatsApp Pastoral</span>
                        </button>
                      )}

                      {/* Status switchers */}
                      {prayer.status !== 'en_oracion' && (
                        <button
                          onClick={() => updatePrayerRequestStatus(prayer.id, 'en_oracion')}
                          className="px-2.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-blue-300 border border-neutral-700 transition-colors text-[11px] font-bold cursor-pointer"
                        >
                          En Oración
                        </button>
                      )}

                      {prayer.status !== 'respondida' && (
                        <button
                          onClick={() => updatePrayerRequestStatus(prayer.id, 'respondida')}
                          className="px-2.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-emerald-300 border border-neutral-700 transition-colors text-[11px] font-bold cursor-pointer"
                        >
                          Respondida
                        </button>
                      )}

                      <button
                        onClick={() => {
                          if (window.confirm('¿Deseas eliminar esta petición de oración?')) {
                            deletePrayerRequest(prayer.id);
                          }
                        }}
                        className="p-1.5 rounded-lg bg-neutral-900 hover:bg-red-950 text-neutral-500 hover:text-red-400 border border-neutral-800 transition-colors cursor-pointer"
                        title="Eliminar petición"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredPrayers.length === 0 && (
              <div className="py-16 text-center bg-neutral-950 rounded-2xl border border-neutral-800">
                <Heart size={32} className="mx-auto text-neutral-600 mb-2" />
                <p className="text-sm text-neutral-300 font-bold">
                  {prayerFilter === 'todas'
                    ? 'No hay peticiones de oración registradas.'
                    : `No hay peticiones con estado "${prayerFilter}".`}
                </p>
                <p className="text-xs text-neutral-500 mt-1">
                  Cuando alguien envíe una petición desde Devocionales, aparecerá aquí inmediatamente.
                </p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: ADD / EDIT DEVOTIONAL                             */}
      {/* ======================================================== */}
      {isDevoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-xl bg-neutral-950 border border-neutral-800 rounded-2xl shadow-2xl p-6 sm:p-8 my-auto">
            <button
              onClick={() => setIsDevoModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white cursor-pointer"
            >
              <X size={18} />
            </button>

            <h3 className="text-xl font-black uppercase text-white font-brand-heading mb-4">
              {editingDevo ? 'Editar Devocional' : 'Nuevo Devocional • La Palabra'}
            </h3>

            <form onSubmit={handleSaveDevotional} className="space-y-4 text-xs">
              <div>
                <label className="text-neutral-300 block mb-1 font-bold">Título de la Enseñanza *</label>
                <input
                  type="text"
                  required
                  value={devoTitle}
                  onChange={(e) => setDevoTitle(e.target.value)}
                  placeholder="Ej. Resiliencia en la Tormenta"
                  className="w-full p-2.5 rounded bg-neutral-900 border border-neutral-800 text-white font-sans"
                />
              </div>

              <div>
                <label className="text-neutral-300 block mb-1 font-bold">Versículo Bíblico Completo *</label>
                <input
                  type="text"
                  required
                  value={devoScripture}
                  onChange={(e) => setDevoScripture(e.target.value)}
                  placeholder="Ej. Isaías 40:31 — Los que esperan en Jehová tendrán nuevas fuerzas..."
                  className="w-full p-2.5 rounded bg-neutral-900 border border-neutral-800 text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-300 block mb-1 font-bold">Tema / Enfoque</label>
                  <select
                    value={devoTheme}
                    onChange={(e) => setDevoTheme(e.target.value)}
                    className="w-full p-2.5 rounded bg-neutral-900 border border-neutral-800 text-white"
                  >
                    <option value="Fe & Valentía">Fe & Valentía</option>
                    <option value="Esperanza">Esperanza</option>
                    <option value="Paz & Quietud">Paz & Quietud</option>
                    <option value="Fuerza Urbana">Fuerza Urbana</option>
                    <option value="Propósito">Propósito</option>
                    <option value="Gratitud">Gratitud</option>
                  </select>
                </div>

                <div>
                  <label className="text-neutral-300 block mb-1 font-bold">Formato Visual</label>
                  <select
                    value={devoAspectRatio}
                    onChange={(e) => setDevoAspectRatio(e.target.value as any)}
                    className="w-full p-2.5 rounded bg-neutral-900 border border-neutral-800 text-white"
                  >
                    <option value="4:5">4:5 (Post / Cuadro)</option>
                    <option value="9:16">9:16 (Historia / Reels)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-neutral-300 block mb-1 font-bold">Extracto Resumen (Visible en Tarjeta)</label>
                <textarea
                  rows={2}
                  value={devoExcerpt}
                  onChange={(e) => setDevoExcerpt(e.target.value)}
                  placeholder="Breve reflexión de 1 o 2 líneas..."
                  className="w-full p-2.5 rounded bg-neutral-900 border border-neutral-800 text-white font-sans"
                />
              </div>

              <div>
                <label className="text-neutral-300 block mb-1 font-bold">Lectura Completa / Reflexión</label>
                <textarea
                  rows={5}
                  value={devoContent}
                  onChange={(e) => setDevoContent(e.target.value)}
                  placeholder="Escribe la enseñanza completa para que la congregación o cliente la lea y comparta..."
                  className="w-full p-2.5 rounded bg-neutral-900 border border-neutral-800 text-white font-sans leading-relaxed"
                />
              </div>

              {/* Image Manager */}
              <div className="p-3.5 rounded-xl bg-neutral-900/80 border border-neutral-800 space-y-2">
                <label className="text-xs font-bold text-amber-300 uppercase tracking-wider block">
                  Foto o Arte del Devocional
                </label>

                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-black border border-neutral-700 shrink-0">
                    <img
                      src={devoImage || '/assets/aistudio/exodo-appIcon_cbe32977.png'}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 space-y-1.5">
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      disabled={isUploadingImage}
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Upload size={13} />
                      <span>{isUploadingImage ? 'Comprimiendo...' : 'Subir Imagen desde Dispositivo'}</span>
                    </button>
                    <input
                      type="text"
                      value={devoImage}
                      onChange={(e) => setDevoImage(e.target.value)}
                      placeholder="O pega la URL de la imagen..."
                      className="w-full p-1.5 rounded bg-neutral-950 border border-neutral-800 text-xs text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsDevoModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-black uppercase cursor-pointer"
                >
                  {editingDevo ? 'Actualizar Devocional' : 'Publicar Devocional'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
