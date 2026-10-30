import React, { useState } from 'react';
import { X, ShieldCheck, Key, Lock, AlertCircle } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const AdminLoginModal: React.FC = () => {
  const { 
    isAdminLoginModalOpen, 
    setIsAdminLoginModalOpen, 
    adminLogin,
    setCurrentPage 
  } = useStore();

  const [accessKey, setAccessKey] = useState('');
  const [error, setError] = useState(false);

  if (!isAdminLoginModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = adminLogin(accessKey);
    if (success) {
      setError(false);
      setAccessKey('');
    } else {
      setError(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-neutral-950 border border-neutral-800 rounded-2xl shadow-2xl p-6 sm:p-8 my-auto text-center">
        
        {/* Close Button */}
        <button
          onClick={() => {
            setIsAdminLoginModalOpen(false);
            setError(false);
            setAccessKey('');
          }}
          className="absolute top-4 right-4 p-2 rounded-full bg-neutral-900 text-neutral-400 hover:text-white transition-colors border border-neutral-800"
        >
          <X size={16} />
        </button>

        {/* Shield Icon */}
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto mb-4">
          <ShieldCheck size={28} />
        </div>

        <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400 font-mono block">
          Acceso Restringido • Taller Caracas
        </span>
        <h3 className="text-xl font-black text-white uppercase tracking-tight mt-1 font-brand-heading">
          BACKOFFICE ADMINISTRADOR
        </h3>
        <p className="text-xs text-neutral-400 mt-2 mb-6">
          Ingresa la clave maestra del taller para gestionar el tablero Kanban, productos, tipografías y Google Sheets.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Key size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input
              type="password"
              autoFocus
              maxLength={10}
              placeholder="Clave de Acceso (2412)"
              value={accessKey}
              onChange={(e) => {
                setAccessKey(e.target.value);
                setError(false);
              }}
              className={`w-full pl-10 pr-4 py-3 bg-neutral-900 border rounded-xl text-center text-sm font-mono tracking-widest text-white placeholder-neutral-500 focus:outline-none transition-colors ${
                error
                  ? 'border-red-500 focus:border-red-500 ring-2 ring-red-500/20'
                  : 'border-neutral-800 focus:border-amber-400'
              }`}
            />
          </div>

          {error && (
            <div className="flex items-center justify-center gap-1.5 text-xs text-red-400 animate-in shake duration-200">
              <AlertCircle size={14} />
              <span>Clave incorrecta. Recuerda: 2412.</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-[#0D253A] hover:bg-[#15344f] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg active:scale-95 border border-neutral-700 cursor-pointer"
          >
            Desbloquear Panel
          </button>
        </form>

        <p className="mt-5 text-[10px] text-neutral-500 font-mono">
          ÉXODO Streetwear • Seguridad Interna
        </p>

      </div>
    </div>
  );
};
