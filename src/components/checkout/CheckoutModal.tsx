import React, { useState } from 'react';
import { 
  X, 
  Check, 
  MessageCircle, 
  Truck, 
  Copy, 
  ShieldCheck, 
  ArrowRight, 
  CreditCard,
  Building,
  Smartphone,
  Sparkles
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Order } from '../../types';
import { requestNotificationPermission, generateWhatsAppOrderUrl } from '../../utils/notificationUtils';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenTracking: (code: string) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onOpenTracking,
}) => {
  const {
    cart,
    cartTotalUSD,
    cartTotalVES,
    exchangeRateBCV,
    createOrder,
    clearCart,
    currentUser,
  } = useStore();

  // Form states
  const [customerName, setCustomerName] = useState(currentUser?.fullName || '');
  const [customerPhone, setCustomerPhone] = useState(currentUser?.phone || '');
  const [shippingAddress, setShippingAddress] = useState(currentUser?.shippingAddress || '');
  const [shippingAgency, setShippingAgency] = useState<Order['shippingAgency']>('Delivery Motorizado Caracas');
  const [pagoMovilRef, setPagoMovilRef] = useState('');
  const [orderNotes, setOrderNotes] = useState('');

  // Post-submission state
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [copiedBankInfo, setCopiedBankInfo] = useState(false);
  const [copiedOrderCode, setCopiedOrderCode] = useState(false);

  if (!isOpen) return null;

  // Direct Pago Móvil Venezuelan Coordinates
  const pagoMovilData = {
    bank: 'Banesco Banco Universal (0134)',
    secondaryBank: 'Banco de Venezuela (0102)',
    rif: 'V-26.890.123',
    phone: '0414-0153904',
    beneficiary: 'ÉXODO Streetwear C.A.',
  };

  const handleCopyPagoMovil = () => {
    const text = `Pago Móvil ÉXODO Caracas\nBanco: ${pagoMovilData.bank}\nTeléfono: ${pagoMovilData.phone}\nC.I./RIF: ${pagoMovilData.rif}\nMonto en Bs: ${cartTotalVES.toFixed(2)}`;
    navigator.clipboard.writeText(text);
    setCopiedBankInfo(true);
    setTimeout(() => setCopiedBankInfo(false), 2000);
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !shippingAddress) {
      alert('Por favor completa tu nombre, teléfono y dirección de entrega.');
      return;
    }

    // Generate unique Venezuelan street order code
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const uniqueOrderCode = `EXD-${randomDigits}-CCS`;

    const newOrder: Order = {
      orderCode: uniqueOrderCode,
      customerName,
      customerPhone,
      shippingAddress,
      shippingAgency,
      items: [...cart],
      totalUSD: cartTotalUSD,
      totalVES: cartTotalVES,
      exchangeRateBCV,
      paymentStatus: pagoMovilRef.trim() ? 'Verificado' : 'Pendiente',
      productionStage: 'pedido_recibido',
      createdAt: new Date().toISOString(),
      notes: orderNotes,
      pagoMovilRef: pagoMovilRef.trim() || undefined,
    };

    // Solicitud de permiso para notificaciones push en navegador / móvil
    requestNotificationPermission().catch(() => {});

    createOrder(newOrder);
    setCompletedOrder(newOrder);
    clearCart();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      
      <div className="relative w-full max-w-3xl bg-neutral-950 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden my-auto">
        
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-neutral-900 text-neutral-400 hover:text-white transition-colors border border-neutral-800 z-10"
        >
          <X size={18} />
        </button>

        {/* COMPLETED SUCCESS STATE */}
        {completedOrder ? (
          <div className="p-6 sm:p-10 text-center space-y-6 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
              <Check size={32} />
            </div>

            <div>
              <span className="text-[11px] uppercase font-bold tracking-widest text-amber-400 font-mono">
                ¡Pedido Generado Exitosamente!
              </span>
              <h2 className="text-3xl font-black text-white uppercase tracking-tight mt-1 font-brand-heading">
                GRACIAS POR TU CONFIANZA
              </h2>
              <p className="text-xs text-neutral-300 mt-2 max-w-md mx-auto">
                Tu comprobante ha sido estructurado para WhatsApp. Nuestro taller en Caracas comenzará la confección y estampado DTF.
              </p>
            </div>

            {/* Unique Order Code Box */}
            <div className="p-5 rounded-xl bg-neutral-900 border border-amber-400/50 max-w-md mx-auto text-center space-y-2">
              <span className="text-[10px] text-neutral-400 uppercase font-mono tracking-wider block">
                Tu Código Único de Rastreo:
              </span>
              <div className="flex items-center justify-center gap-3">
                <span className="text-2xl sm:text-3xl font-black text-amber-400 tracking-widest font-mono">
                  {completedOrder.orderCode}
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(completedOrder.orderCode);
                    setCopiedOrderCode(true);
                    setTimeout(() => setCopiedOrderCode(false), 2000);
                  }}
                  className="p-1.5 rounded bg-neutral-800 text-neutral-300 hover:text-white"
                  title="Copiar código"
                >
                  {copiedOrderCode ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                </button>
              </div>
              <p className="text-[11px] text-neutral-400">
                Usa este código en cualquier momento en el botón "Rastrear" del menú principal para ver el avance en vivo en la barra Kanban.
              </p>
            </div>

            {/* Quick Actions & WhatsApp Direct Dispatch */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <a
                href={generateWhatsAppOrderUrl(completedOrder, '+584140153904')}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                <MessageCircle size={16} />
                <span>Enviar Comprobante por WhatsApp</span>
              </a>

              <button
                onClick={() => {
                  onClose();
                  onOpenTracking(completedOrder.orderCode);
                }}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#0D253A] hover:bg-[#15344f] text-white text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 border border-neutral-700"
              >
                <Truck size={15} className="text-amber-400" />
                <span>Rastrear en Portal Kanban</span>
              </button>

              <button
                onClick={onClose}
                className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-neutral-900 border border-neutral-750 text-neutral-300 hover:text-white text-xs font-bold uppercase tracking-wider transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        ) : (
          /* CHECKOUT FORM & PAGO MOVIL */
          <form onSubmit={handleSubmitOrder} className="p-6 sm:p-8 space-y-6">
            <div>
              <span className="text-[10px] font-mono text-amber-400 uppercase font-bold tracking-widest">
                Finalizar Compra • Taller Caracas
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight font-brand-heading">
                CHECKOUT & PAGO MÓVIL
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* LEFT: Shipping Details Form */}
              <div className="space-y-4">
                <p className="text-xs font-bold uppercase tracking-wider text-neutral-300 border-b border-neutral-800 pb-1">
                  1. Datos de Entrega
                </p>

                <div>
                  <label className="text-[11px] font-medium text-neutral-300 block mb-1">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Gabriel Mendoza"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-neutral-900 border border-neutral-800 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-medium text-neutral-300 block mb-1">
                    Teléfono / WhatsApp (Nombre de Usuario) *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="Ej. 0414-0153904"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-neutral-900 border border-neutral-800 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-medium text-neutral-300 block mb-1">
                    Método de Envío / Retiro *
                  </label>
                  <select
                    value={shippingAgency}
                    onChange={(e) => setShippingAgency(e.target.value as any)}
                    className="w-full p-2.5 rounded-lg bg-neutral-900 border border-neutral-800 text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="Delivery Motorizado Caracas">Delivery Motorizado Caracas (Mismo día / 24h)</option>
                    <option value="Retiro en Taller (Caracas)">Retiro en Taller ÉXODO (Caracas Centro)</option>
                    <option value="MRW">MRW (Cobro en Destino Nacional)</option>
                    <option value="Zoom">Zoom (Cobro en Destino Nacional)</option>
                    <option value="Tealca">Tealca (Cobro en Destino Nacional)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-medium text-neutral-300 block mb-1">
                    Dirección Exacta o Agencia *
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Calle, Edificio/Casa, Punto de referencia o código de agencia MRW/Zoom..."
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-neutral-900 border border-neutral-800 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-medium text-neutral-400 block mb-1">
                    Notas adicionales (Opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Instrucciones para el motorizado, tallaje, etc."
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    className="w-full p-2 rounded-lg bg-neutral-900 border border-neutral-800 text-xs text-white focus:outline-none focus:border-neutral-700"
                  />
                </div>
              </div>

              {/* RIGHT: Direct Pago Móvil Display */}
              <div className="space-y-4">
                <p className="text-xs font-bold uppercase tracking-wider text-neutral-300 border-b border-neutral-800 pb-1">
                  2. Datos de Pago Móvil (Venezuela)
                </p>

                {/* Direct Pago Móvil Card */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-[#0D253A] to-neutral-900 border border-neutral-700/80 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-neutral-700">
                    <span className="text-xs font-black text-amber-400 uppercase tracking-widest font-mono">
                      PAGO MÓVIL DIRECTO
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyPagoMovil}
                      className="flex items-center gap-1 text-[11px] text-neutral-300 hover:text-white px-2 py-1 rounded bg-black/40 border border-neutral-700"
                    >
                      {copiedBankInfo ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                      <span>{copiedBankInfo ? 'Copiado' : 'Copiar Datos'}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-neutral-400 uppercase font-mono block">Banco:</span>
                      <strong className="text-white text-xs">{pagoMovilData.bank}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-neutral-400 uppercase font-mono block">Teléfono:</span>
                      <strong className="text-white font-mono text-xs">{pagoMovilData.phone}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-neutral-400 uppercase font-mono block">C.I. / RIF:</span>
                      <strong className="text-white font-mono text-xs">{pagoMovilData.rif}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-neutral-400 uppercase font-mono block">Beneficiario:</span>
                      <strong className="text-white text-xs truncate block">{pagoMovilData.beneficiary}</strong>
                    </div>
                  </div>

                  {/* Amounts */}
                  <div className="pt-2 border-t border-neutral-700/80 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-neutral-400 uppercase font-mono block">Total USD:</span>
                      <span className="text-lg font-black text-white">${cartTotalUSD.toFixed(2)}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-neutral-400 uppercase font-mono block">Monto en Bolívares (BCV):</span>
                      <span className="text-xl font-black text-amber-400">Bs. {cartTotalVES.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-medium text-neutral-300 block mb-1">
                    Número de Referencia Pago Móvil (6 dígitos)
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. 849201"
                    value={pagoMovilRef}
                    onChange={(e) => setPagoMovilRef(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-neutral-900 border border-neutral-800 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                  />
                  <span className="text-[10px] text-neutral-500 mt-1 block">
                    También puedes enviar la captura de pantalla directamente al abrir WhatsApp.
                  </span>
                </div>

                {/* Items brief preview */}
                <div className="p-3 rounded-lg bg-neutral-900/60 border border-neutral-800 text-xs text-neutral-400">
                  <span className="font-bold text-neutral-300 block mb-1">
                    Resumen de Pedido ({cart.length} productos):
                  </span>
                  <div className="max-h-20 overflow-y-auto space-y-1 pr-1 font-mono text-[11px]">
                    {cart.map((item, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span className="truncate">{item.product.name} (x{item.quantity})</span>
                        <span className="text-white shrink-0">${(item.unitPrice * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>

            {/* ACTION BUTTON: [Enviar Comprobante a WhatsApp] */}
            <div className="pt-4 border-t border-neutral-800 space-y-2">
              <button
                type="submit"
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm uppercase tracking-wider rounded-xl transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageCircle size={18} />
                <span>Enviar Comprobante a WhatsApp (+58 414-0153904)</span>
              </button>

              <p className="text-[10px] text-center text-neutral-500">
                Al enviar el comprobante se te asignará inmediatamente tu Código Único de Pedido para monitoreo en vivo en el sistema Kanban.
              </p>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
