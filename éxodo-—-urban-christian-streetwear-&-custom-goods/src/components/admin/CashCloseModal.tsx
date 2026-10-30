import React, { useState } from 'react';
import { 
  FileCheck, 
  Printer, 
  Check, 
  X, 
  DollarSign, 
  Calendar, 
  User, 
  Clock, 
  CreditCard,
  Building2,
  Package,
  AlertCircle
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { DailyCashClose } from '../../types';

interface CashCloseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CashCloseModal: React.FC<CashCloseModalProps> = ({ isOpen, onClose }) => {
  const { orders, closeDailyCash, exchangeRateBCV } = useStore();

  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [closeNotes, setCloseNotes] = useState<string>('');
  const [savedClose, setSavedClose] = useState<DailyCashClose | null>(null);

  if (!isOpen) return null;

  // Filter orders for selected date
  const dayOrders = orders.filter((o) => {
    if (!o.createdAt) return false;
    return o.createdAt.startsWith(selectedDate);
  });

  const deliveredOrders = dayOrders.filter((o) => o.productionStage === 'entregado' || o.status === 'entregado');
  const cancelledOrders = dayOrders.filter((o) => o.status === 'cancelado');
  const activeOrders = dayOrders.filter((o) => o.status !== 'cancelado');

  const totalUSD = activeOrders.reduce((acc, o) => acc + (o.totalUSD || 0), 0);
  const totalVES = activeOrders.reduce((acc, o) => acc + (o.totalVES || 0), 0);

  const binanceOrders = activeOrders.filter((o) => o.paymentMethod === 'binance');
  const binanceUSD = binanceOrders.reduce((acc, o) => acc + (o.totalUSD || 0), 0);

  const tesoroOrders = activeOrders.filter((o) => o.paymentMethod !== 'binance');
  const tesoroVES = tesoroOrders.reduce((acc, o) => acc + (o.totalVES || 0), 0);

  const handleConfirmClose = () => {
    const report = closeDailyCash(selectedDate, closeNotes);
    setSavedClose(report);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-neutral-950 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl my-auto print:border-none print:shadow-none print:p-0 print:bg-white print:text-black">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800 print:hidden">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-amber-400 text-black font-bold">
              <FileCheck size={20} />
            </span>
            <div>
              <h3 className="text-lg font-black text-white uppercase tracking-tight font-brand-heading">
                Cierre de Caja Diario (Arqueo OMS)
              </h3>
              <p className="text-xs text-neutral-400">
                Verificación de ventas generadas y pedidos despachados en el día
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-neutral-500 hover:text-white rounded-xl">
            <X size={18} />
          </button>
        </div>

        {/* Date Selector & Filters */}
        <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2">
            <Calendar size={15} className="text-amber-400" />
            <label className="text-xs font-bold text-neutral-300 uppercase">Fecha de Cierre:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setSavedClose(null);
              }}
              className="px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs font-mono text-white focus:border-amber-400"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 text-xs font-mono transition-colors cursor-pointer"
            >
              <Printer size={13} />
              <span>Imprimir Ticket</span>
            </button>
          </div>
        </div>

        {/* PRINTABLE COMPROBANTE CONTAINER */}
        <div id="cash-close-report" className="space-y-5 p-4 rounded-2xl bg-neutral-900/50 border border-neutral-800/80 print:bg-white print:text-black print:border-black print:p-2">
          
          <div className="text-center pb-3 border-b border-neutral-800 print:border-black">
            <h2 className="text-xl font-black uppercase tracking-tight text-white print:text-black font-brand-heading">
              ÉXODO URBAN STREETWEAR
            </h2>
            <p className="text-[11px] text-neutral-400 print:text-gray-600 font-mono">
              RIF: J-50493821-0 • Taller Caracas, Venezuela
            </p>
            <p className="text-xs font-black text-amber-400 print:text-black font-mono mt-1">
              REPORTE DIARIO DE CIERRE DE CAJA — {selectedDate}
            </p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 rounded-xl bg-black/60 border border-neutral-800 print:bg-gray-100 print:border-gray-300">
              <span className="text-[10px] text-neutral-400 print:text-gray-600 uppercase font-mono block">Total Facturado</span>
              <span className="text-lg font-black text-amber-400 print:text-black font-mono block mt-0.5">
                ${totalUSD.toFixed(2)} USD
              </span>
              <span className="text-[9px] text-neutral-500 print:text-gray-500 font-mono">
                Bs. {totalVES.toFixed(2)}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-black/60 border border-neutral-800 print:bg-gray-100 print:border-gray-300">
              <span className="text-[10px] text-neutral-400 print:text-gray-600 uppercase font-mono block">Binance Pay (USDT)</span>
              <span className="text-lg font-black text-white print:text-black font-mono block mt-0.5">
                ${binanceUSD.toFixed(2)}
              </span>
              <span className="text-[9px] text-neutral-500 print:text-gray-500 font-mono">
                {binanceOrders.length} pagos
              </span>
            </div>

            <div className="p-3 rounded-xl bg-black/60 border border-neutral-800 print:bg-gray-100 print:border-gray-300">
              <span className="text-[10px] text-neutral-400 print:text-gray-600 uppercase font-mono block">Banco del Tesoro</span>
              <span className="text-lg font-black text-white print:text-black font-mono block mt-0.5">
                Bs. {tesoroVES.toFixed(2)}
              </span>
              <span className="text-[9px] text-neutral-500 print:text-gray-500 font-mono">
                Pago Móvil
              </span>
            </div>

            <div className="p-3 rounded-xl bg-black/60 border border-neutral-800 print:bg-gray-100 print:border-gray-300">
              <span className="text-[10px] text-neutral-400 print:text-gray-600 uppercase font-mono block">Despacho</span>
              <span className="text-lg font-black text-emerald-400 print:text-black font-mono block mt-0.5">
                {deliveredOrders.length} / {dayOrders.length}
              </span>
              <span className="text-[9px] text-neutral-500 print:text-gray-500 font-mono">
                Entregados
              </span>
            </div>
          </div>

          {/* Orders Itemized Table */}
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-300 print:text-black font-mono block mb-2">
              Desglose de Pedidos del Día ({dayOrders.length}):
            </span>
            <div className="overflow-x-auto rounded-xl border border-neutral-800 print:border-gray-300">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-neutral-950 text-neutral-400 print:bg-gray-200 print:text-black text-[10px] uppercase">
                  <tr>
                    <th className="py-2 px-3">Código</th>
                    <th className="py-2 px-3">Cliente</th>
                    <th className="py-2 px-3">Pago</th>
                    <th className="py-2 px-3">Estado</th>
                    <th className="py-2 px-3 text-right">Monto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800 print:divide-gray-200">
                  {dayOrders.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-neutral-500">
                        No hay pedidos registrados en la fecha seleccionada ({selectedDate}).
                      </td>
                    </tr>
                  ) : (
                    dayOrders.map((ord) => (
                      <tr key={ord.orderCode} className="hover:bg-neutral-900/30">
                        <td className="py-2 px-3 font-bold text-white print:text-black">{ord.orderCode}</td>
                        <td className="py-2 px-3 text-neutral-300 print:text-black">{ord.customerName}</td>
                        <td className="py-2 px-3 text-neutral-400 print:text-gray-700">{ord.paymentMethod || 'Pago Móvil'}</td>
                        <td className="py-2 px-3">
                          {ord.productionStage === 'entregado' ? (
                            <span className="text-emerald-400 font-bold">✓ Entregado</span>
                          ) : ord.status === 'cancelado' ? (
                            <span className="text-red-400 font-bold">Cancelado</span>
                          ) : (
                            <span className="text-amber-400">En Taller</span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-right font-black text-white print:text-black">
                          ${ord.totalUSD.toFixed(2)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Observations */}
          <div className="print:hidden">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 block mb-1">
              Observaciones / Novedades del Taller:
            </label>
            <input
              type="text"
              placeholder="Ej. Se completaron todas las entregas en Caracas sin retrasos..."
              value={closeNotes}
              onChange={(e) => setCloseNotes(e.target.value)}
              className="w-full p-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:border-amber-400"
            />
          </div>

          {savedClose && (
            <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-800 text-xs text-emerald-300 flex items-center gap-2">
              <Check size={16} />
              <span>✓ Cierre de caja registrado y guardado exitosamente en el historial del sistema.</span>
            </div>
          )}

        </div>

        {/* Action Buttons */}
        <div className="pt-5 flex items-center justify-end gap-3 print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-neutral-900 text-neutral-400 hover:text-white text-xs font-bold uppercase cursor-pointer"
          >
            Cerrar Ventana
          </button>
          
          <button
            onClick={handleConfirmClose}
            disabled={dayOrders.length === 0}
            className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black text-xs font-black uppercase tracking-wider shadow-lg transition-all disabled:opacity-40 cursor-pointer"
          >
            Confirmar Cierre de Caja del Día
          </button>
        </div>

      </div>
    </div>
  );
};
