import React, { useState } from 'react';
import { X, User, Phone, MapPin, Lock, LogOut, Check, Truck } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const AuthModal: React.FC = () => {
  const { 
    currentUser, 
    registerUser, 
    loginUser, 
    logoutUser, 
    isAuthModalOpen, 
    setIsAuthModalOpen,
    setIsTrackingModalOpen,
    setTrackingOrderCode 
  } = useStore();

  const [isRegister, setIsRegister] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!phone.trim()) {
      setError('El número de teléfono es obligatorio');
      return;
    }

    if (isRegister) {
      if (!fullName.trim() || !shippingAddress.trim()) {
        setError('Por favor completa todos los campos requeridos');
        return;
      }
      registerUser({
        phone: phone.trim(),
        fullName: fullName.trim(),
        shippingAddress: shippingAddress.trim(),
        password: password.trim() || undefined,
        registeredAt: new Date().toISOString(),
      });
    } else {
      const ok = loginUser(phone.trim(), password.trim() || undefined);
      if (!ok) {
        setError('Contraseña incorrecta para este número de teléfono.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-neutral-950 border border-neutral-800 rounded-2xl shadow-2xl p-6 sm:p-8 my-auto">
        
        {/* Close */}
        <button
          onClick={() => setIsAuthModalOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-full bg-neutral-900 text-neutral-400 hover:text-white transition-colors border border-neutral-800"
        >
          <X size={18} />
        </button>

        {currentUser ? (
          /* LOGGED IN USER PROFILE */
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-neutral-800">
              <div className="w-12 h-12 rounded-full bg-[#0D253A] border border-neutral-700 flex items-center justify-center text-amber-400 font-bold text-lg">
                {currentUser.fullName.charAt(0)}
              </div>
              <div>
                <h3 className="text-base font-bold text-white">{currentUser.fullName}</h3>
                <p className="text-xs text-neutral-400 font-mono">{currentUser.phone}</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-neutral-900/60 border border-neutral-800">
                <span className="text-[10px] text-neutral-500 uppercase font-mono block">Dirección de Envío Habitual:</span>
                <p className="text-neutral-200 mt-1 font-medium">{currentUser.shippingAddress}</p>
              </div>

              {(currentUser as any).orders && (currentUser as any).orders.length > 0 && (
                <div className="p-3.5 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-2">
                  <span className="text-[10px] text-amber-400 uppercase font-mono font-bold block">Tus Códigos de Pedido:</span>
                  <div className="flex flex-wrap gap-2">
                    {(currentUser as any).orders.map((code: string, idx: number) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setTrackingOrderCode(code);
                          setIsAuthModalOpen(false);
                          setIsTrackingModalOpen(true);
                        }}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#0D253A] text-white border border-neutral-700 text-xs font-mono hover:border-amber-400"
                      >
                        <Truck size={12} className="text-amber-400" />
                        <span>{code}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={logoutUser}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-red-900 hover:text-red-400 text-neutral-400 text-xs font-semibold uppercase tracking-wider transition-colors"
            >
              <LogOut size={15} />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        ) : (
          /* REGISTRATION & LOGIN FORM */
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <span className="text-[10px] font-mono text-amber-400 uppercase font-bold tracking-widest">
                Cuenta de Cliente ÉXODO
              </span>
              <h2 className="text-2xl font-black text-white uppercase tracking-tight mt-0.5 font-brand-heading">
                {isRegister ? 'REGISTRO DE CLIENTE' : 'INICIAR SESIÓN'}
              </h2>
              <p className="text-xs text-neutral-400 mt-1">
                Tu número de teléfono es tu usuario oficial para pedidos y rastreo.
              </p>
            </div>

            {/* Toggle Tab */}
            <div className="grid grid-cols-2 gap-1 p-1 bg-neutral-900 rounded-lg border border-neutral-800">
              <button
                type="button"
                onClick={() => {
                  setIsRegister(false);
                  setError(null);
                }}
                className={`py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${
                  !isRegister ? 'bg-[#0D253A] text-white shadow-md' : 'text-neutral-400 hover:text-white'
                }`}
              >
                Ingresar
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsRegister(true);
                  setError(null);
                }}
                className={`py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${
                  isRegister ? 'bg-[#0D253A] text-white shadow-md' : 'text-neutral-400 hover:text-white'
                }`}
              >
                Registrarse
              </button>
            </div>

            {error && (
              <p className="text-xs text-red-400 p-2.5 rounded bg-red-950/50 border border-red-800">
                {error}
              </p>
            )}

            {isRegister && (
              <div>
                <label className="text-[11px] font-medium text-neutral-300 block mb-1">
                  Nombre y Apellido *
                </label>
                <div className="relative">
                  <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                  <input
                    type="text"
                    required
                    placeholder="Ej. Gabriel Mendoza"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-neutral-900 border border-neutral-800 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-[11px] font-medium text-neutral-300 block mb-1">
                Número de Teléfono (Usuario) *
              </label>
              <div className="relative">
                <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                  type="tel"
                  required
                  placeholder="Ej. 0414-0153904"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-neutral-900 border border-neutral-800 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>
            </div>

            {isRegister && (
              <div>
                <label className="text-[11px] font-medium text-neutral-300 block mb-1">
                  Dirección de Envío Habitual *
                </label>
                <div className="relative">
                  <MapPin size={15} className="absolute left-3 top-3 text-neutral-500" />
                  <textarea
                    rows={2}
                    required
                    placeholder="Ciudad, Municipio, Urbanización, Punto de referencia o Agencia..."
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-[11px] font-medium text-neutral-300 block mb-1">
                Contraseña {isRegister ? '(Opcional pero recomendada)' : ''}
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-neutral-900 border border-neutral-800 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#C8C3B3] hover:bg-white text-black font-extrabold text-xs uppercase tracking-wider rounded-lg transition-all shadow-lg active:scale-95 cursor-pointer"
            >
              {isRegister ? 'Completar Registro' : 'Entrar a Mi Cuenta'}
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
