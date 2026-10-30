import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Check, 
  ShoppingBag, 
  Calendar, 
  User, 
  Phone, 
  MapPin, 
  DollarSign, 
  CreditCard,
  Package,
  Layers
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Order, CartItem, Product } from '../../types';

interface ManualOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ManualOrderModal: React.FC<ManualOrderModalProps> = ({ isOpen, onClose }) => {
  const { products, addManualOrder, exchangeRateBCV } = useStore();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('Caracas, Distrito Capital');
  const [shippingAgency, setShippingAgency] = useState<any>('Retiro en Taller (Caracas)');
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Custom or Selected Product
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [customItemName, setCustomItemName] = useState('');
  const [itemQuantity, setItemQuantity] = useState<number>(1);
  const [itemSize, setItemSize] = useState<string>('L');
  const [itemFit, setItemFit] = useState<'Corte Normal' | 'Oversize'>('Oversize');
  const [itemColor, setItemColor] = useState('Negro Pitch');
  const [unitPriceUSD, setUnitPriceUSD] = useState<string>('28.00');

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<'pago_movil' | 'binance' | 'efectivo'>('pago_movil');
  const [paymentStatus, setPaymentStatus] = useState<'Verificado' | 'Pendiente'>('Verificado');
  const [creditToAccount, setCreditToAccount] = useState<boolean>(true);
  const [initialStage, setInitialStage] = useState<string>('entregado');
  const [orderNotes, setOrderNotes] = useState('Pedido manual / histórico registrado por administración.');

  if (!isOpen) return null;

  const handleProductChange = (id: string) => {
    setSelectedProductId(id);
    const prod = products.find((p) => p.id === id);
    if (prod) {
      setUnitPriceUSD(prod.basePrice.toString());
      setCustomItemName(prod.name);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim()) {
      alert('Ingresa el nombre y teléfono del cliente.');
      return;
    }

    const price = parseFloat(unitPriceUSD);
    const totalUSD = (isNaN(price) ? 25 : price) * itemQuantity;
    const totalVES = totalUSD * exchangeRateBCV;
    const randomCode = `EXD-MAN-${Math.floor(1000 + Math.random() * 9000)}`;

    const chosenProduct = products.find((p) => p.id === selectedProductId) || products[0];

    const manualItem: CartItem = {
      cartId: `manual-item-${Date.now()}`,
      productId: chosenProduct.id,
      product: {
        ...chosenProduct,
        name: customItemName.trim() || chosenProduct.name,
      },
      quantity: itemQuantity,
      selectedSize: itemSize,
      selectedColor: { name: itemColor, hex: '#000000' },
      fitType: itemFit,
      unitPrice: isNaN(price) ? 25 : price,
    };

    const newOrder: Order = {
      orderCode: randomCode,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      shippingAddress: shippingAddress.trim(),
      shippingAgency,
      items: [manualItem],
      totalUSD,
      totalVES,
      exchangeRateBCV,
      paymentStatus,
      productionStage: initialStage,
      status: initialStage === 'entregado' ? 'entregado' : 'activo',
      deliveredAt: initialStage === 'entregado' ? new Date(orderDate).toISOString() : undefined,
      createdAt: new Date(orderDate).toISOString(),
      notes: orderNotes.trim(),
      paymentMethod,
      isHistorical: true,
    };

    addManualOrder(newOrder, creditToAccount);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-neutral-950 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl my-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-amber-400 text-black font-bold">
              <Plus size={20} />
            </span>
            <div>
              <h3 className="text-lg font-black text-white uppercase tracking-tight font-brand-heading">
                Registrar Pedido Manual / Histórico
              </h3>
              <p className="text-xs text-neutral-400">
                Añade ventas previas, pedidos por WhatsApp o ferias presenciales al sistema
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-neutral-500 hover:text-white rounded-xl">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Customer Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-neutral-300 uppercase block mb-1">Nombre del Cliente *</label>
              <input
                type="text"
                required
                placeholder="Ej. Samuel Morales"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full p-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white focus:border-amber-400"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-neutral-300 uppercase block mb-1">Teléfono (WhatsApp) *</label>
              <input
                type="text"
                required
                placeholder="0414 1234567"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full p-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs font-mono text-white focus:border-amber-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-neutral-300 uppercase block mb-1">Fecha del Pedido (Histórico):</label>
              <input
                type="date"
                value={orderDate}
                onChange={(e) => setOrderDate(e.target.value)}
                className="w-full p-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs font-mono text-white"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-neutral-300 uppercase block mb-1">Agencia / Modalidad de Entrega:</label>
              <select
                value={shippingAgency}
                onChange={(e) => setShippingAgency(e.target.value as any)}
                className="w-full p-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white"
              >
                <option value="Retiro en Taller (Caracas)">Retiro en Taller (Caracas)</option>
                <option value="Delivery Motorizado Caracas">Delivery Motorizado Caracas</option>
                <option value="MRW">MRW</option>
                <option value="Zoom">Zoom</option>
                <option value="Tealca">Tealca</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-neutral-300 uppercase block mb-1">Dirección de Entrega:</label>
            <input
              type="text"
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
              className="w-full p-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white"
            />
          </div>

          {/* Product selection */}
          <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 font-mono block">
              Detalle del Producto Vendido:
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Seleccionar Producto Catálogo:</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => handleProductChange(e.target.value)}
                  className="w-full p-2 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-white"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (${p.basePrice})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">O Nombre Personalizado:</label>
                <input
                  type="text"
                  placeholder="Ej. Franela Personalizada León de Judá"
                  value={customItemName}
                  onChange={(e) => setCustomItemName(e.target.value)}
                  className="w-full p-2 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-xs">
              <div>
                <label className="text-[10px] text-neutral-400 block mb-1">Cantidad:</label>
                <input
                  type="number"
                  min="1"
                  value={itemQuantity}
                  onChange={(e) => setItemQuantity(parseInt(e.target.value) || 1)}
                  className="w-full p-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="text-[10px] text-neutral-400 block mb-1">Talla:</label>
                <select
                  value={itemSize}
                  onChange={(e) => setItemSize(e.target.value)}
                  className="w-full p-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white"
                >
                  <option value="S">S</option>
                  <option value="M">M</option>
                  <option value="L">L</option>
                  <option value="XL">XL</option>
                  <option value="2XL">2XL</option>
                  <option value="3XL">3XL</option>
                  <option value="4XL">4XL</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-neutral-400 block mb-1">Corte:</label>
                <select
                  value={itemFit}
                  onChange={(e) => setItemFit(e.target.value as any)}
                  className="w-full p-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white"
                >
                  <option value="Oversize">Oversize 240g</option>
                  <option value="Corte Normal">Corte Normal</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-neutral-400 block mb-1">Precio Unitario ($):</label>
                <input
                  type="number"
                  step="0.01"
                  value={unitPriceUSD}
                  onChange={(e) => setUnitPriceUSD(e.target.value)}
                  className="w-full p-2 bg-neutral-950 border border-neutral-800 rounded-lg text-amber-400 font-bold"
                />
              </div>
            </div>
          </div>

          {/* Payment & Stage */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold uppercase text-neutral-400 block mb-1">Método de Pago:</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full p-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white"
              >
                <option value="pago_movil">Pago Móvil (Banco del Tesoro)</option>
                <option value="binance">Binance Pay (USDT)</option>
                <option value="efectivo">Efectivo USD / Divisas</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-neutral-400 block mb-1">Estado de Pago:</label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value as any)}
                className="w-full p-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white"
              >
                <option value="Verificado">Pago Verificado</option>
                <option value="Pendiente">Pendiente de Cobro</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-neutral-400 block mb-1">Fase OMS Inicial:</label>
              <select
                value={initialStage}
                onChange={(e) => setInitialStage(e.target.value)}
                className="w-full p-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white"
              >
                <option value="entregado">Ya Entregado al Cliente</option>
                <option value="listo_envio">Listo para Envío</option>
                <option value="estampado">En Estampado</option>
                <option value="confeccion">En Confección</option>
                <option value="pedido_recibido">Pedido Recibido</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 rounded-xl bg-neutral-900/60 border border-neutral-800">
            <input
              type="checkbox"
              id="creditAccountCheck"
              checked={creditToAccount}
              onChange={(e) => setCreditToAccount(e.target.checked)}
              className="accent-amber-400 w-4 h-4 rounded cursor-pointer"
            />
            <label htmlFor="creditAccountCheck" className="text-xs text-neutral-300 cursor-pointer">
              Acreditar ingreso automáticamente en la cuenta de <strong className="text-white">{paymentMethod === 'binance' ? 'Binance USDT' : 'Banco del Tesoro (Bs.)'}</strong>
            </label>
          </div>

          <div>
            <label className="text-xs font-bold uppercase text-neutral-400 block mb-1">Notas Internas:</label>
            <input
              type="text"
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              className="w-full p-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white"
            />
          </div>

          {/* Submit Buttons */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-neutral-900 text-neutral-400 text-xs font-bold uppercase"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black text-xs font-black uppercase tracking-wider shadow-lg"
            >
              Guardar Pedido en OMS
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
