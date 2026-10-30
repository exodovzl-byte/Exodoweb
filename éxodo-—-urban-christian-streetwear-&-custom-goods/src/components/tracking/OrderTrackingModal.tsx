import React, { useState, useEffect } from 'react';
import { 
  X, 
  Search, 
  Truck, 
  CheckCircle2, 
  Clock, 
  Package, 
  Scissors, 
  Flame, 
  Sparkles, 
  AlertCircle 
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Order } from '../../types';

interface OrderTrackingModalProps {
  initialCode?: string;
}

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({ initialCode = '' }) => {
  const { 
    isTrackingModalOpen, 
    setIsTrackingModalOpen, 
    findOrderByCode, 
    kanbanColumns,
    trackingOrderCode,
    setTrackingOrderCode 
  } = useStore();

  const [searchCode, setSearchCode] = useState(initialCode || trackingOrderCode || '');
  const [trackedOrder, setTrackedOrder] = useState<Order | null>(null);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (initialCode) {
      setSearchCode(initialCode);
      const found = findOrderByCode(initialCode);
      if (found) setTrackedOrder(found);
    } else if (trackingOrderCode) {
      setSearchCode(trackingOrderCode);
      const found = findOrderByCode(trackingOrderCode);
      if (found) setTrackedOrder(found);
    }
  }, [initialCode, trackingOrderCode, isTrackingModalOpen]);

  if (!isTrackingModalOpen) return null;

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchCode.trim()) return;
    setSearched(true);
    const order = findOrderByCode(searchCode.trim());
    setTrackedOrder(order || null);
  };

  // Determine active step index on Kanban progress bar
  const currentStageIndex = kanbanColumns.findIndex(
    (col) => col.id === trackedOrder?.productionStage
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-neutral-950 border border-neutral-800 rounded-2xl shadow-2xl p-6 sm:p-8 my-auto overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={() => {
            setIsTrackingModalOpen(false);
            setTrackingOrderCode('');
          }}
          className="absolute top-4 right-4 p-2 rounded-full bg-neutral-900 text-neutral-400 hover:text-white transition-colors border border-neutral-800"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 text-xs font-mono text-amber-400 uppercase font-bold tracking-widest">
            <Truck size={14} />
            <span>Portal de Seguimiento de Producción ÉXODO</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight mt-1 font-brand-heading">
            RASTREO DE PEDIDO EN VIVO
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Ingresa tu Código Único de Pedido (ej. <span className="text-amber-400 font-mono">EXD-2412-CCS</span>) recibido tras confirmar tu comprobante en WhatsApp.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex gap-2 mb-8">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input
              type="text"
              placeholder="Ingresa tu código: EXD-XXXX-CCS"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value.toUpperCase())}
              className="w-full pl-10 pr-3 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 font-mono uppercase tracking-wider"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-[#0D253A] hover:bg-[#193a57] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer shrink-0"
          >
            Consultar
          </button>
        </form>

        {/* Tracked Order Details */}
        {trackedOrder ? (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* Header info badge */}
            <div className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-800 flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-[10px] text-neutral-500 uppercase font-mono block">Código de Pedido:</span>
                <span className="text-xl font-black text-amber-400 font-mono tracking-widest">
                  {trackedOrder.orderCode}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-neutral-500 uppercase font-mono block">Cliente / Teléfono:</span>
                <span className="text-xs font-bold text-white">
                  {trackedOrder.customerName} ({trackedOrder.customerPhone})
                </span>
              </div>
              <div>
                <span className="text-[10px] text-neutral-500 uppercase font-mono block">Estado de Pago:</span>
                <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                  trackedOrder.paymentStatus === 'Verificado'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    : 'bg-amber-950 text-amber-300 border border-amber-800'
                }`}>
                  {trackedOrder.paymentStatus}
                </span>
              </div>
            </div>

            {/* KANBAN PROGRESS BAR */}
            <div className="p-5 rounded-xl bg-neutral-900/40 border border-neutral-800">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-300 block mb-6">
                Progreso en el Taller de Producción (Caracas)
              </span>

              {/* Progress Steps Horizontal Bar */}
              <div className="relative">
                {/* Connecting background bar */}
                <div className="absolute top-5 left-4 right-4 h-1 bg-neutral-800 -translate-y-1/2 z-0"></div>
                {/* Connecting filled bar */}
                <div
                  className="absolute top-5 left-4 h-1 bg-amber-400 -translate-y-1/2 z-0 transition-all duration-500"
                  style={{
                    width: `${Math.max(0, (currentStageIndex / (kanbanColumns.length - 1)) * 95)}%`,
                  }}
                ></div>

                <div className="relative z-10 flex justify-between items-start">
                  {kanbanColumns.map((col, index) => {
                    const isCompleted = index < currentStageIndex;
                    const isCurrent = index === currentStageIndex;

                    return (
                      <div
                        key={col.id}
                        className="flex flex-col items-center text-center max-w-[80px] sm:max-w-[110px]"
                      >
                        <div
                          className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                            isCompleted
                              ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                              : isCurrent
                              ? 'bg-amber-400 text-black ring-4 ring-amber-400/20 shadow-lg scale-110 font-black'
                              : 'bg-neutral-900 border border-neutral-700 text-neutral-500'
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle2 size={18} />
                          ) : (
                            <span>{index + 1}</span>
                          )}
                        </div>

                        <span
                          className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-tight mt-2 leading-tight ${
                            isCurrent
                              ? 'text-amber-400'
                              : isCompleted
                              ? 'text-white'
                              : 'text-neutral-500'
                          }`}
                        >
                          {col.title.replace(/^\d+\.\s*/, '')}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Items summary */}
            <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 text-xs">
              <span className="font-bold text-neutral-300 block mb-2">
                Prendas en Producción:
              </span>
              <div className="space-y-2">
                {trackedOrder.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between items-center text-neutral-300">
                    <span className="truncate">
                      • {it.product.name} (x{it.quantity})
                      {it.selectedSize ? ` - Talla: ${it.selectedSize}` : ''}
                      {it.fitType ? ` [${it.fitType}]` : ''}
                    </span>
                    <span className="font-mono text-white shrink-0 ml-2">
                      ${(it.unitPrice * it.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-3 pt-3 border-t border-neutral-800 flex justify-between text-neutral-400 text-[11px]">
                <span>Agencia / Destino: <strong className="text-white">{trackedOrder.shippingAgency}</strong></span>
                <span>Total: <strong className="text-amber-400 font-mono">${trackedOrder.totalUSD.toFixed(2)} USD</strong></span>
              </div>
            </div>

          </div>
        ) : searched ? (
          <div className="py-12 text-center space-y-3 bg-neutral-900/40 rounded-xl border border-neutral-800">
            <AlertCircle size={36} className="mx-auto text-amber-500" />
            <p className="text-sm font-bold text-white">
              No se encontró ningún pedido con el código "{searchCode}"
            </p>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto">
              Verifica haber escrito las letras y números correctamente (ej. EXD-2412-CCS) o consulta directamente a nuestro WhatsApp.
            </p>
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-neutral-500">
            Ingresa tu código arriba para visualizar el estado en tiempo real.
          </div>
        )}

      </div>
    </div>
  );
};
