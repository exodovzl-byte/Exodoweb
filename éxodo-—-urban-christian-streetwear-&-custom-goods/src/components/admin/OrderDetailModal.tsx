import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Check, 
  CheckCircle2, 
  AlertTriangle, 
  Edit3, 
  Trash2, 
  Truck, 
  Phone, 
  MapPin, 
  Calendar, 
  DollarSign,
  Package,
  FileText,
  Clock,
  ShieldCheck,
  Ban
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Order, KanbanColumn } from '../../types';

interface OrderDetailModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  kanbanColumns: KanbanColumn[];
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  order,
  isOpen,
  onClose,
  kanbanColumns,
}) => {
  const { 
    updateOrderStatus, 
    updateOrderPaymentStatus, 
    markOrderDelivered, 
    cancelOrder, 
    updateOrder,
    exchangeRateBCV 
  } = useStore();

  const [isEditing, setIsEditing] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  // Editable Form State
  const [editCustomerName, setEditCustomerName] = useState('');
  const [editCustomerPhone, setEditCustomerPhone] = useState('');
  const [editShippingAddress, setEditShippingAddress] = useState('');
  const [editTotalUSD, setEditTotalUSD] = useState('');
  const [editNotes, setEditNotes] = useState('');

  if (!isOpen || !order) return null;

  const handleStartEdit = () => {
    setEditCustomerName(order.customerName);
    setEditCustomerPhone(order.customerPhone);
    setEditShippingAddress(order.shippingAddress);
    setEditTotalUSD(order.totalUSD.toString());
    setEditNotes(order.notes || '');
    setIsEditing(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    const newUSD = parseFloat(editTotalUSD);
    updateOrder(order.orderCode, {
      customerName: editCustomerName.trim(),
      customerPhone: editCustomerPhone.trim(),
      shippingAddress: editShippingAddress.trim(),
      totalUSD: isNaN(newUSD) ? order.totalUSD : newUSD,
      totalVES: isNaN(newUSD) ? order.totalVES : newUSD * exchangeRateBCV,
      notes: editNotes.trim(),
    });
    setIsEditing(false);
  };

  const handleConfirmCancel = () => {
    cancelOrder(order.orderCode, cancelReason || 'Cancelado por administración');
    setCancelModalOpen(false);
    onClose();
  };

  // Helper to trigger direct download of high-res artwork file
  const handleDownloadArtwork = (url: string, filename: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || `arte-exodo-${order.orderCode}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const isDelivered = order.productionStage === 'entregado' || order.status === 'entregado';
  const isCancelled = order.status === 'cancelado';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-neutral-950 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl my-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-neutral-800">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-xl font-black text-white font-mono">
                {order.orderCode}
              </span>
              {isCancelled ? (
                <span className="px-2.5 py-0.5 rounded-full bg-red-950 text-red-400 border border-red-800 text-[10px] font-mono font-bold uppercase">
                  Cancelado
                </span>
              ) : isDelivered ? (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-mono font-bold uppercase">
                  ✓ Entregado al Cliente
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-950 text-amber-400 border border-amber-800 text-[10px] font-mono font-bold uppercase">
                  En Producción
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              Fecha de creación: {new Date(order.createdAt).toLocaleDateString('es-VE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {!isEditing && (
              <button
                onClick={handleStartEdit}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-bold transition-colors cursor-pointer"
              >
                <Edit3 size={13} />
                <span>Editar</span>
              </button>
            )}
            <button onClick={onClose} className="p-2 text-neutral-500 hover:text-white rounded-xl">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Cancelled Banner if applicable */}
        {isCancelled && (
          <div className="p-4 rounded-2xl bg-red-950/60 border border-red-800/80 flex items-start gap-3 text-red-200 text-xs">
            <AlertTriangle size={18} className="text-red-400 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold">Este pedido se encuentra CANCELADO</strong>
              <p className="text-[11px] text-red-300 mt-0.5">
                Motivo registrado: {order.cancelReason || 'Sin motivo especificado'} • Fecha de cancelación: {order.cancelledAt ? new Date(order.cancelledAt).toLocaleString() : 'N/A'}
              </p>
            </div>
          </div>
        )}

        {/* Delivered Banner if applicable */}
        {isDelivered && (
          <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-800/80 flex items-start gap-3 text-emerald-200 text-xs">
            <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold">Producto Entregado con Éxito</strong>
              <p className="text-[11px] text-emerald-300 mt-0.5">
                Fecha de entrega confirmada: {order.deliveredAt ? new Date(order.deliveredAt).toLocaleString() : 'Confirmado'}
              </p>
            </div>
          </div>
        )}

        {/* EDIT FORM VIEW */}
        {isEditing ? (
          <form onSubmit={handleSaveEdit} className="space-y-4 p-5 rounded-2xl bg-neutral-900 border border-neutral-800">
            <h4 className="text-sm font-black text-white uppercase tracking-wider font-brand-heading">
              Modificar Datos del Pedido
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-neutral-400 block mb-1">Nombre del Cliente:</label>
                <input
                  type="text"
                  required
                  value={editCustomerName}
                  onChange={(e) => setEditCustomerName(e.target.value)}
                  className="w-full p-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs text-neutral-400 block mb-1">Teléfono:</label>
                <input
                  type="text"
                  required
                  value={editCustomerPhone}
                  onChange={(e) => setEditCustomerPhone(e.target.value)}
                  className="w-full p-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs font-mono text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-neutral-400 block mb-1">Dirección de Entrega:</label>
              <textarea
                rows={2}
                value={editShippingAddress}
                onChange={(e) => setEditShippingAddress(e.target.value)}
                className="w-full p-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-neutral-400 block mb-1">Monto Total ($ USD):</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={editTotalUSD}
                  onChange={(e) => setEditTotalUSD(e.target.value)}
                  className="w-full p-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs font-mono text-white"
                />
              </div>

              <div>
                <label className="text-xs text-neutral-400 block mb-1">Notas de Taller:</label>
                <input
                  type="text"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full p-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-xl bg-neutral-950 text-neutral-400 text-xs font-bold"
              >
                Cancelar Edición
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-amber-400 text-black text-xs font-black uppercase tracking-wider"
              >
                Guardar Modificaciones
              </button>
            </div>
          </form>
        ) : (
          /* READONLY VIEW */
          <div className="space-y-6">
            
            {/* Customer & Shipping Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-2">
                <span className="text-[10px] uppercase font-mono tracking-wider text-amber-400 font-bold block">
                  Cliente & Contacto
                </span>
                <p className="text-sm font-bold text-white">{order.customerName}</p>
                <p className="text-xs text-neutral-300 font-mono flex items-center gap-1.5">
                  <Phone size={13} className="text-neutral-500" />
                  <a href={`https://wa.me/${order.customerPhone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="hover:text-emerald-400 underline">
                    {order.customerPhone} (WhatsApp)
                  </a>
                </p>
                {order.notes && (
                  <p className="text-xs text-neutral-400 italic pt-1 border-t border-neutral-800">
                    "{order.notes}"
                  </p>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-2">
                <span className="text-[10px] uppercase font-mono tracking-wider text-sky-400 font-bold block">
                  Envío / Despacho
                </span>
                <p className="text-xs text-neutral-200 flex items-start gap-1.5">
                  <MapPin size={14} className="text-neutral-500 shrink-0 mt-0.5" />
                  <span>{order.shippingAddress}</span>
                </p>
                <p className="text-xs text-neutral-400 font-mono flex items-center gap-1.5">
                  <Truck size={13} className="text-neutral-500" />
                  <span>Agencia: <strong>{order.shippingAgency}</strong></span>
                </p>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="p-4 rounded-2xl bg-[#0D253A]/40 border border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-400 block">Total del Pedido:</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-amber-400 font-mono">${order.totalUSD.toFixed(2)} USD</span>
                  <span className="text-xs text-neutral-400 font-mono">Bs. {order.totalVES.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-400 block">Estado de Pago:</span>
                  <span className={`text-xs font-black uppercase font-mono ${order.paymentStatus === 'Verificado' ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {order.paymentStatus}
                  </span>
                </div>

                <button
                  onClick={() => updateOrderPaymentStatus(order.orderCode, order.paymentStatus === 'Verificado' ? 'Pendiente' : 'Verificado')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition-colors cursor-pointer ${
                    order.paymentStatus === 'Verificado'
                      ? 'bg-neutral-800 text-neutral-300 hover:text-white'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  }`}
                >
                  {order.paymentStatus === 'Verificado' ? 'Marcar Pendiente' : 'Validar Pago'}
                </button>
              </div>
            </div>

            {/* Order Items & High-Res Artwork Downloads */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-300 font-mono block">
                Artículos en Producción ({order.items?.length || 0}):
              </span>

              <div className="space-y-2.5">
                {order.items?.map((item, idx) => {
                  const customArt = item.customDesign?.customArtworkUrl || item.product?.images?.[0];
                  return (
                    <div key={idx} className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        {customArt ? (
                          <img src={customArt} alt="" className="w-14 h-14 object-contain rounded-lg bg-black p-1 border border-neutral-800" />
                        ) : (
                          <div className="w-14 h-14 rounded-lg bg-neutral-800 flex items-center justify-center text-neutral-500">
                            <Package size={20} />
                          </div>
                        )}

                        <div>
                          <h5 className="text-xs font-black text-white">{item.product?.name}</h5>
                          <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-neutral-400 font-mono">
                            <span>Cant: <strong>{item.quantity}</strong></span>
                            {item.selectedSize && <span>• Talla: <strong>{item.selectedSize}</strong></span>}
                            {item.fitType && <span>• ({item.fitType})</span>}
                            {item.selectedColor && <span>• Color: <strong>{item.selectedColor.name}</strong></span>}
                            {item.selectedFinish && <span>• Acabado: <strong>{item.selectedFinish}</strong></span>}
                          </div>
                          {item.customDesign?.verseText && (
                            <p className="text-[10px] text-amber-400 font-mono mt-0.5">
                              Texto: "{item.customDesign.verseText}"
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Direct High-Res Download Button */}
                      {customArt && (
                        <button
                          onClick={() => handleDownloadArtwork(customArt, `arte-${order.orderCode}-item-${idx + 1}.png`)}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-amber-400 border border-neutral-700 text-xs font-bold uppercase tracking-wider transition-colors shrink-0 cursor-pointer"
                          title="Descargar archivo en alta resolución para DTF o sublimación"
                        >
                          <Download size={14} />
                          <span>Descargar Arte HD</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Kanban Stage Change & Actions */}
            <div className="pt-4 border-t border-neutral-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-400 font-mono">Fase OMS:</span>
                <select
                  value={order.productionStage}
                  onChange={(e) => updateOrderStatus(order.orderCode, e.target.value)}
                  className="bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs font-bold text-white focus:border-amber-400"
                >
                  {kanbanColumns.map((col) => (
                    <option key={col.id} value={col.id}>
                      {col.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                {!isDelivered && !isCancelled && (
                  <button
                    onClick={() => markOrderDelivered(order.orderCode)}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    <CheckCircle2 size={15} />
                    <span>Marcar como Entregado</span>
                  </button>
                )}

                {!isCancelled && (
                  <button
                    onClick={() => setCancelModalOpen(true)}
                    className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-red-950/60 hover:bg-red-950 text-red-400 border border-red-800/80 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    <Ban size={14} />
                    <span>Cancelar Pedido</span>
                  </button>
                )}
              </div>
            </div>

          </div>
        )}

      </div>

      {/* CANCEL MODAL CONFIRMATION */}
      {cancelModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="w-full max-w-md bg-neutral-950 border border-red-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <h4 className="text-base font-black text-red-400 uppercase tracking-tight flex items-center gap-2">
              <AlertTriangle size={18} />
              <span>¿Cancelar Pedido {order.orderCode}?</span>
            </h4>
            <p className="text-xs text-neutral-300">
              Esta acción marcará el pedido como cancelado en el sistema OMS y notificará al equipo.
            </p>

            <div>
              <label className="text-xs font-bold uppercase text-neutral-400 block mb-1">Motivo de la cancelación:</label>
              <input
                type="text"
                placeholder="Ej. Falta de stock de talla, solicitud del cliente, etc."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full p-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                onClick={() => setCancelModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-neutral-900 text-neutral-400 text-xs font-bold"
              >
                Volver
              </button>
              <button
                onClick={handleConfirmCancel}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-black uppercase tracking-wider"
              >
                Confirmar Cancelación
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
