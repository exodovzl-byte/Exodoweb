import React, { useState, useRef } from 'react';
import { 
  Type, 
  Upload, 
  Trash2, 
  Check, 
  Sparkles, 
  RefreshCw, 
  Download, 
  Eye, 
  Sliders, 
  Layers, 
  BookOpen,
  CheckCircle2,
  FileText,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { InstalledFont } from '../../types';
import { INITIAL_INSTALLED_FONTS } from '../../data/initialData';

export const MultiFontManager: React.FC = () => {
  const { 
    brandConfig, 
    installCustomFont, 
    removeInstalledFont, 
    setActiveFontRole, 
    resetFontsToPresets 
  } = useStore();

  const [testText, setTestText] = useState('JESÚS SIENDO INOCENTE • ÉXODO 24:12 • CARACAS');
  const [testFontSize, setTestFontSize] = useState<number>(28);
  const [isUploading, setIsUploading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const fonts: InstalledFont[] = brandConfig.installedFonts && brandConfig.installedFonts.length > 0 
    ? brandConfig.installedFonts 
    : INITIAL_INSTALLED_FONTS;

  const activeHeadingFont = fonts.find((f) => f.id === brandConfig.activeHeadingFontId) || fonts[0];
  const activeBodyFont = fonts.find((f) => f.id === brandConfig.activeBodyFontId) || fonts[4] || fonts[0];
  const activeAccentFont = fonts.find((f) => f.id === brandConfig.activeAccentFontId) || fonts[2] || fonts[0];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleFilesUpload = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setIsUploading(true);

    const validExtensions = ['.ttf', '.otf', '.woff', '.woff2'];
    let installedCount = 0;

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const hasValidExt = validExtensions.some((ext) => file.name.toLowerCase().endsWith(ext));
      
      if (!hasValidExt) {
        alert(`El archivo "${file.name}" no es una tipografía compatible (.ttf, .otf, .woff, .woff2).`);
        continue;
      }

      if (file.size > 15 * 1024 * 1024) {
        alert(`El archivo "${file.name}" supera el límite de 15MB.`);
        continue;
      }

      try {
        await installCustomFont(file);
        installedCount++;
      } catch (err) {
        console.error('Error al instalar fuente:', err);
      }
    }

    setIsUploading(false);
    if (installedCount > 0) {
      showToast(`¡${installedCount} tipografía(s) instalada(s) con éxito en la tienda!`);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl bg-amber-400 text-black text-xs font-black shadow-2xl flex items-center gap-2 animate-bounce">
          <Check size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-neutral-900/90 via-[#0D253A]/40 to-neutral-950 border border-neutral-800 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-400/10 text-amber-400 border border-amber-400/20">
                <Type size={20} />
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight font-brand-heading">
                Gestor & Instalador Multi-Tipográfico (Custom Fonts Suite)
              </h2>
            </div>
            <p className="text-xs text-neutral-400 mt-1 max-w-3xl leading-relaxed">
              Instala múltiples archivos de tipografía (<strong className="text-white">.TTF, .OTF, .WOFF, .WOFF2</strong>) de forma simultánea. Asigna diferentes fuentes a los <strong className="text-amber-400">Titulares Urbanos</strong>, al <strong className="text-amber-400">Texto de Lectura</strong> o a las <strong className="text-amber-400">Citas Bíblicas</strong> de las prendas.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="px-3.5 py-1.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs font-mono text-neutral-300">
              Instaladas: <strong className="text-amber-400 font-bold">{fonts.length}</strong>
            </div>

            <button
              type="button"
              onClick={() => {
                if (window.confirm('¿Restablecer tipografías al kit curado oficial de ÉXODO (Bebas Neue, Anton, Cinzel, Oswald, Montserrat)?')) {
                  resetFontsToPresets();
                  showToast('Tipografías restablecidas al kit oficial.');
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800 text-xs font-mono transition-colors cursor-pointer"
            >
              <RefreshCw size={13} />
              <span>Restablecer Kit</span>
            </button>
          </div>
        </div>

        {/* Active Role Assignments Quick Bar */}
        <div className="mt-6 pt-5 border-t border-neutral-800/80 grid grid-cols-1 sm:grid-cols-3 gap-3">
          
          {/* Active Heading */}
          <div className="p-3 rounded-xl bg-neutral-950/80 border border-neutral-800 flex flex-col justify-between">
            <span className="text-[10px] uppercase font-mono tracking-wider text-amber-400 font-bold">
              1. Titulares & Banners (.font-brand-heading)
            </span>
            <div className="mt-1">
              <span className="text-base font-black text-white font-brand-heading block truncate">
                {activeHeadingFont?.name || 'Bebas Neue'}
              </span>
              <span className="text-[10px] text-neutral-500 font-mono">
                {activeHeadingFont?.fileName || 'BebasNeue-Bold.ttf'}
              </span>
            </div>
          </div>

          {/* Active Body */}
          <div className="p-3 rounded-xl bg-neutral-950/80 border border-neutral-800 flex flex-col justify-between">
            <span className="text-[10px] uppercase font-mono tracking-wider text-sky-400 font-bold">
              2. Texto de Lectura (.font-brand-body)
            </span>
            <div className="mt-1">
              <span className="text-base font-black text-white font-brand-body block truncate">
                {activeBodyFont?.name || 'Montserrat'}
              </span>
              <span className="text-[10px] text-neutral-500 font-mono">
                {activeBodyFont?.fileName || 'Montserrat-Regular.ttf'}
              </span>
            </div>
          </div>

          {/* Active Accent */}
          <div className="p-3 rounded-xl bg-neutral-950/80 border border-neutral-800 flex flex-col justify-between">
            <span className="text-[10px] uppercase font-mono tracking-wider text-purple-400 font-bold">
              3. Citas & Versículos (.font-brand-accent)
            </span>
            <div className="mt-1">
              <span className="text-base font-black text-white font-brand-accent block truncate">
                {activeAccentFont?.name || 'Cinzel Serif'}
              </span>
              <span className="text-[10px] text-neutral-500 font-mono">
                {activeAccentFont?.fileName || 'Cinzel-Bold.ttf'}
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* Google Drive Font Repository Quick Access */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-neutral-900 to-neutral-950 border border-amber-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-400 text-black shrink-0 font-bold">
            <Type size={20} />
          </div>
          <div>
            <h4 className="text-sm font-black text-white uppercase tracking-tight font-brand-heading">
              Carpeta Oficial de Tipografías ÉXODO (Google Drive)
            </h4>
            <p className="text-xs text-neutral-300 mt-0.5 leading-relaxed">
              Descarga los archivos originales de la tipografía (.ttf / .otf) desde tu almacenamiento en la nube y arrástralos abajo para instalarlos:
            </p>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-[11px] text-amber-400 font-mono bg-neutral-950 px-2 py-0.5 rounded border border-neutral-800">
                Tipografía Secundaria: Montserrat (Activa) • Citas: Cinzel Serif (Activa)
              </span>
            </div>
          </div>
        </div>

        <a
          href="https://drive.google.com/drive/folders/1iGzvahSXzw16m90Lre1M-q-ahkBAywh8?usp=sharing"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black text-xs font-black uppercase tracking-wider transition-all shadow-md shrink-0 cursor-pointer"
        >
          <span>Abrir Carpeta Google Drive</span>
          <ExternalLink size={14} />
        </a>
      </div>

      {/* Upload Zone (Supports multiple files simultaneously) */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          handleFilesUpload(e.dataTransfer.files);
        }}
        className={`p-8 rounded-2xl border-2 border-dashed transition-all text-center flex flex-col items-center justify-center cursor-pointer ${
          dragActive
            ? 'bg-amber-400/10 border-amber-400 ring-4 ring-amber-400/20'
            : 'bg-neutral-950/70 border-neutral-800 hover:border-amber-400/80 hover:bg-neutral-900/40'
        }`}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          multiple
          accept=".ttf,.otf,.woff,.woff2"
          onChange={(e) => handleFilesUpload(e.target.files)}
          className="hidden"
        />

        <div className="w-14 h-14 rounded-2xl bg-amber-400/10 border border-amber-400/30 text-amber-400 flex items-center justify-center mb-3">
          <Upload size={26} className={isUploading ? 'animate-bounce' : ''} />
        </div>

        <h3 className="text-base font-black text-white uppercase tracking-tight font-brand-heading">
          {isUploading ? 'Instalando tipografías...' : 'Arrastra y suelta tus tipografías aquí'}
        </h3>
        <p className="text-xs text-neutral-400 mt-1 max-w-md">
          Puedes seleccionar uno o varios archivos a la vez. Formatos compatibles: <strong className="text-neutral-200">.TTF, .OTF, .WOFF, .WOFF2</strong> (hasta 15MB c/u).
        </p>

        <button
          type="button"
          className="mt-4 px-5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-amber-400 border border-neutral-700 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
        >
          {isUploading ? 'Procesando archivos...' : 'Explorar Archivos en tu Equipo'}
        </button>
      </div>

      {/* Live Interactive Font Tester Bar */}
      <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 flex flex-col md:flex-row items-center gap-4">
        <div className="flex-1 w-full">
          <label className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider block mb-1">
            Texto de prueba en vivo para comparar todas las tipografías:
          </label>
          <input
            type="text"
            value={testText}
            onChange={(e) => setTestText(e.target.value)}
            placeholder="Escribe cualquier frase para previsualizar..."
            className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="w-full md:w-48">
          <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 mb-1">
            <span>Tamaño muestra:</span>
            <span className="text-amber-400 font-bold">{testFontSize}px</span>
          </div>
          <input
            type="range"
            min={18}
            max={52}
            value={testFontSize}
            onChange={(e) => setTestFontSize(Number(e.target.value))}
            className="w-full accent-amber-400 cursor-pointer"
          />
        </div>
      </div>

      {/* Installed Fonts Library Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white uppercase tracking-tight font-brand-heading">
            Librería de Tipografías Instaladas ({fonts.length})
          </h3>
          <span className="text-[11px] text-neutral-500 font-mono">
            Haz clic en los botones de función para asignar a Titulares, Cuerpo o Citas.
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {fonts.map((font) => {
            const isHeading = brandConfig.activeHeadingFontId === font.id;
            const isBody = brandConfig.activeBodyFontId === font.id;
            const isAccent = brandConfig.activeAccentFontId === font.id;
            const fontCssFamily = `ExodoFont_${font.id.replace(/[^a-zA-Z0-9]/g, '_')}`;

            return (
              <div
                key={font.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                  isHeading
                    ? 'bg-neutral-900/90 border-amber-400 ring-2 ring-amber-400/20 shadow-xl'
                    : 'bg-neutral-950/70 border-neutral-800/90 hover:border-neutral-700'
                }`}
              >
                <div>
                  {/* Top Row: Name, Format, Badges */}
                  <div className="flex items-start justify-between gap-3 pb-3 border-b border-neutral-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-black text-white uppercase tracking-tight">
                          {font.name}
                        </h4>
                        <span className="px-2 py-0.5 rounded text-[9px] font-mono uppercase bg-neutral-900 text-amber-400 border border-neutral-800">
                          {font.format}
                        </span>
                      </div>
                      <p className="text-[10px] text-neutral-500 font-mono mt-0.5">
                        Archivo: {font.fileName}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap justify-end">
                      {isHeading && (
                        <span className="px-2 py-0.5 rounded bg-amber-400 text-black text-[9px] font-black uppercase tracking-wider">
                          Titulares
                        </span>
                      )}
                      {isBody && (
                        <span className="px-2 py-0.5 rounded bg-sky-400 text-black text-[9px] font-black uppercase tracking-wider">
                          Cuerpo
                        </span>
                      )}
                      {isAccent && (
                        <span className="px-2 py-0.5 rounded bg-purple-400 text-black text-[9px] font-black uppercase tracking-wider">
                          Versículos
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Visual Render Canvas */}
                  <div className="py-5 px-3 bg-neutral-900/40 rounded-xl my-3 border border-neutral-900 overflow-x-auto">
                    <p
                      style={{
                        fontFamily: `'${fontCssFamily}', sans-serif`,
                        fontSize: `${testFontSize}px`,
                        lineHeight: 1.15,
                      }}
                      className="text-white tracking-wide break-words"
                    >
                      {testText}
                    </p>
                  </div>
                </div>

                {/* Assignment Controls & Actions */}
                <div className="pt-3 border-t border-neutral-800/80 flex flex-wrap items-center justify-between gap-2">
                  
                  {/* Role Assignment Buttons */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setActiveFontRole(font.id, 'heading')}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
                        isHeading
                          ? 'bg-amber-400 text-black font-black shadow-sm'
                          : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800'
                      }`}
                      title="Asignar para encabezados y banners"
                    >
                      {isHeading ? '✓ En Titulares' : '+ Usar en Titulares'}
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveFontRole(font.id, 'body')}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
                        isBody
                          ? 'bg-sky-400 text-black font-black shadow-sm'
                          : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800'
                      }`}
                      title="Asignar para descripciones y fichas técnicas"
                    >
                      {isBody ? '✓ En Cuerpo' : '+ Usar en Cuerpo'}
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveFontRole(font.id, 'accent')}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
                        isAccent
                          ? 'bg-purple-400 text-black font-black shadow-sm'
                          : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800'
                      }`}
                      title="Asignar para citas bíblicas y sellos"
                    >
                      {isAccent ? '✓ En Versículos' : '+ Usar en Citas'}
                    </button>
                  </div>

                  {/* Download / Delete */}
                  <div className="flex items-center gap-1">
                    {font.url && (
                      <a
                        href={font.url}
                        download={font.fileName}
                        className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800 transition-colors"
                        title="Descargar archivo de fuente"
                      >
                        <Download size={13} />
                      </a>
                    )}

                    {!font.isPreset && (
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`¿Eliminar la tipografía "${font.name}"?`)) {
                            removeInstalledFont(font.id);
                            showToast(`Tipografía "${font.name}" eliminada.`);
                          }
                        }}
                        className="p-1.5 rounded-lg bg-neutral-900 hover:bg-red-950 text-neutral-500 hover:text-red-400 border border-neutral-800 transition-colors cursor-pointer"
                        title="Eliminar tipografía instalada"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>

                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* Real-world Preview Mockup */}
      <div className="p-6 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-base font-black text-white uppercase tracking-tight font-brand-heading">
              Simulador Visual de Tipografías en Vivo (Storefront Preview)
            </h4>
            <p className="text-xs text-neutral-400">
              Así es como interactúan las fuentes activas en las piezas y páginas de la tienda:
            </p>
          </div>
          <span className="px-2.5 py-1 rounded bg-[#0D253A] text-amber-300 text-[10px] font-mono border border-neutral-700">
            Render Dinámico
          </span>
        </div>

        <div className="p-6 rounded-xl bg-black border border-neutral-800 space-y-4">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold block">
              COLECCIÓN LA CALLE ES UN MUSEO • CARACAS
            </span>
            <h1 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight mt-1 font-brand-heading">
              INOCENTE POR CULPABLE
            </h1>
          </div>

          <div className="p-3.5 rounded-lg bg-neutral-900/60 border border-neutral-800">
            <p className="text-base sm:text-lg italic text-[#C8C3B3] font-brand-accent">
              "Al que no conoció pecado, por nosotros lo hizo pecado, para que nosotros fuésemos hechos justicia de Dios en él." — 2 Corintios 5:21
            </p>
          </div>

          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-brand-body max-w-3xl">
            Confeccionada en Caracas con 100% algodón peinado pesado de 240g/m² y estampado DTF textil de máxima durabilidad. Caída boxy oversize estructurada para soportar el ritmo implacable de la ciudad llevando el mensaje de la Cruz a todos lados.
          </p>

          <div className="flex items-center gap-3 pt-2">
            <span className="px-3 py-1.5 rounded-lg bg-amber-400 text-black text-xs font-black uppercase font-brand-heading tracking-wider">
              $28.00 USD / Bs. 1,288.00
            </span>
            <span className="text-xs text-neutral-400 font-mono">
              Tipografía Titular: <strong className="text-white">{activeHeadingFont?.name}</strong>
            </span>
          </div>
        </div>
      </div>

    </div>
  );
};
