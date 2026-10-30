import React, { useState, useEffect } from 'react';
import { MessageCircle, X, Clock, Sun, Moon, Sparkles, Radio, CheckCircle2 } from 'lucide-react';

export const FloatingWhatsApp: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const phoneNumber = '+584140153904';

  // System Time Sensor State - updates every 1 second
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isSimulationActive, setIsSimulationActive] = useState(false);
  const [simulatedIsOpen, setSimulatedIsOpen] = useState(false);

  // Time sensor effect: updates every second to detect live hour changes
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Calculate Caracas / Local Commercial Business Hours (Lun - Sáb: 8:00 AM - 6:00 PM)
  const getBusinessStatus = () => {
    if (isSimulationActive) {
      return simulatedIsOpen;
    }

    // Get time in Caracas timezone (UTC-4) or fallback to local system time
    try {
      const caracasString = currentTime.toLocaleString('en-US', { timeZone: 'America/Caracas' });
      const caracasDate = new Date(caracasString);
      const day = caracasDate.getDay(); // 0 is Sunday, 1 is Monday ... 6 is Saturday
      const hour = caracasDate.getHours();
      
      const isWorkDay = day >= 1 && day <= 6; // Lunes a Sábado
      const isWorkHour = hour >= 8 && hour < 18; // 8:00 AM a 6:00 PM (18:00)

      return isWorkDay && isWorkHour;
    } catch {
      const day = currentTime.getDay();
      const hour = currentTime.getHours();
      return day >= 1 && day <= 6 && hour >= 8 && hour < 18;
    }
  };

  const isOnline = getBusinessStatus();

  // Format current system time with hours, minutes, and seconds
  const formattedTimeWithSeconds = currentTime.toLocaleTimeString('es-VE', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  const dayName = currentTime.toLocaleDateString('es-VE', { weekday: 'long' });

  const defaultMessage = isOnline
    ? encodeURIComponent('¡Hola ÉXODO Caracas! Estoy en la tienda web y quiero consultar sobre una prenda/pedido.')
    : encodeURIComponent('¡Hola ÉXODO! Dejo mi mensaje fuera de horario para que me respondan al abrir el taller a las 8:00 AM.');

  return (
    <div className="fixed bottom-20 lg:bottom-6 right-4 sm:right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="mb-3 w-84 sm:w-96 rounded-2xl bg-neutral-950 border border-neutral-700/80 p-5 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-3 duration-200 text-white">
          
          {/* Header */}
          <div className="flex items-start justify-between pb-3 border-b border-neutral-800">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-black tracking-tight text-[#C8C3B3] font-brand-heading">
                  ATENCIÓN ÉXODO CARACAS
                </span>
              </div>
              
              {/* SENSOR STATUS BADGE */}
              <div className="flex items-center gap-2 mt-1">
                {isOnline ? (
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-xs font-bold text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>En línea</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-950/80 border border-amber-500/40 text-xs font-bold text-amber-400">
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                    <span>Fuera de horario</span>
                  </span>
                )}
                <span className="text-[10px] text-neutral-400 font-mono">
                  {isSimulationActive ? '(Simulado)' : '(Sensor Auto)'}
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="text-neutral-400 hover:text-white p-1 rounded-md transition-colors"
              aria-label="Cerrar ventana"
            >
              <X size={16} />
            </button>
          </div>

          {/* Business Hours Info & System Sensor Details */}
          <div className="mt-3 p-3.5 rounded-xl bg-neutral-900/90 border border-neutral-800 text-xs space-y-2">
            
            {/* Live digital sensor clock */}
            <div className="flex items-center justify-between p-2 rounded-lg bg-black/60 border border-neutral-800 text-[11px] font-mono">
              <div className="flex items-center gap-1.5 text-neutral-300">
                <Clock size={13} className={isOnline ? 'text-emerald-400 animate-spin-slow' : 'text-amber-400'} />
                <span className="capitalize">{dayName}:</span>
              </div>
              <div className="text-right">
                <span className={`font-bold ${isOnline ? 'text-emerald-300' : 'text-amber-300'}`}>
                  {formattedTimeWithSeconds}
                </span>
                <span className="text-[9px] text-neutral-500 block">Hora Caracas (VET)</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-neutral-400 text-[11px] font-mono px-1">
              <span className="flex items-center gap-1">
                <span>Horario Comercial:</span>
              </span>
              <span className="text-neutral-200 font-bold">Lun-Sáb 8:00 AM - 6:00 PM</span>
            </div>

            <div className="p-2.5 rounded-lg border text-[11px] leading-relaxed transition-colors flex items-start gap-2 bg-neutral-950/70 border-neutral-800">
              {isOnline ? (
                <>
                  <CheckCircle2 size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                  <p className="text-neutral-300">
                    <strong className="text-emerald-400">¡Estamos en línea!</strong> Nuestro taller en Caracas está operativo confeccionando franelas de 240g y respondiendo consultas en vivo.
                  </p>
                </>
              ) : (
                <>
                  <Moon size={15} className="text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-neutral-300">
                    <strong className="text-amber-400">Fuera de horario comercial.</strong> El taller físico está en reposo. Deja tu mensaje y serás atendido prioritariamente a las 8:00 AM.
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Direct WhatsApp Action Button */}
          <a
            href={`https://wa.me/${phoneNumber}?text=${defaultMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`mt-4 flex items-center justify-center gap-2 w-full py-3 rounded-xl text-xs font-black tracking-wider uppercase transition-all shadow-lg active:scale-95 ${
              isOnline
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/30'
                : 'bg-amber-600 hover:bg-amber-500 text-black shadow-amber-900/30'
            }`}
          >
            <MessageCircle size={16} />
            <span>{isOnline ? 'Chatear con el Taller Ahora' : 'Dejar Mensaje para Mañana'}</span>
          </a>

          {/* Interactive Simulation Switch for Test / Verification */}
          <div className="mt-3 pt-2.5 border-t border-neutral-800/80 flex items-center justify-between text-[10px] text-neutral-500 font-mono">
            <span>Sensor de Horario:</span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setIsSimulationActive(true);
                  setSimulatedIsOpen(true);
                }}
                className={`px-2 py-0.5 rounded border transition-colors ${
                  isSimulationActive && simulatedIsOpen
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-700 font-bold'
                    : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white'
                }`}
                title="Forzar estado 'En línea' para pruebas"
              >
                En línea
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsSimulationActive(true);
                  setSimulatedIsOpen(false);
                }}
                className={`px-2 py-0.5 rounded border transition-colors ${
                  isSimulationActive && !simulatedIsOpen
                    ? 'bg-amber-950 text-amber-300 border-amber-700 font-bold'
                    : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white'
                }`}
                title="Forzar estado 'Fuera de horario' para pruebas"
              >
                Fuera horario
              </button>
              {isSimulationActive && (
                <button
                  type="button"
                  onClick={() => setIsSimulationActive(false)}
                  className="px-1 text-amber-400 hover:underline"
                  title="Restablecer sensor real automático del sistema"
                >
                  Auto
                </button>
              )}
            </div>
          </div>

        </div>
      )}

      {/* Floating Action Button with Status Pill Indicator */}
      <div className="flex items-center gap-2.5">
        
        {/* Visible status pill on floating button so user immediately sees live status */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold tracking-wide backdrop-blur-md border shadow-xl transition-all cursor-pointer ${
            isOnline
              ? 'bg-neutral-950/90 text-emerald-400 border-emerald-500/30 hover:border-emerald-500'
              : 'bg-neutral-950/90 text-amber-400 border-amber-500/30 hover:border-amber-500'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
          <span>{isOnline ? 'En línea' : 'Fuera de horario'}</span>
        </button>

        {/* Round WhatsApp Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`group relative flex items-center justify-center w-14 h-14 rounded-full text-white shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 ${
            isOnline
              ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
              : 'bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 shadow-black'
          }`}
          aria-label="Abrir WhatsApp Éxodo"
        >
          {/* Pulsing state badge */}
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            {isOnline ? (
              <>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-400 text-[9px] font-bold text-black items-center justify-center">
                  ●
                </span>
              </>
            ) : (
              <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-400 text-[9px] font-bold text-black items-center justify-center">
                ○
              </span>
            )}
          </span>
          <MessageCircle size={28} className="group-hover:rotate-6 transition-transform" />
        </button>
      </div>

    </div>
  );
};
