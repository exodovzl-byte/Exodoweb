import { Order } from '../types';

/**
 * Request native Notification permission from browser/OS
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    console.warn('La API de Notificaciones no está soportada en este navegador.');
    return false;
  }

  try {
    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  } catch (error) {
    console.warn('Error al solicitar permiso de notificaciones:', error);
    return false;
  }
}

/**
 * Play a pleasant, modern chime using Web Audio API (zero external assets needed)
 */
export function playNotificationChime(): void {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    // First tone (587.33 Hz - D5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now);
    gain1.gain.setValueAtTime(0.15, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    // Second tone (880.00 Hz - A5)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880.0, now + 0.12);
    gain2.gain.setValueAtTime(0.2, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.55);
  } catch (e) {
    // Audio autoplay restrictions may ignore without user gesture
  }
}

/**
 * Send native push notification to desktop and mobile OS
 */
export async function sendNativeNotification(
  title: string,
  options?: {
    body?: string;
    icon?: string;
    badge?: string;
    tag?: string;
    data?: any;
    vibrate?: number[];
  }
): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  const hasPermission = Notification.permission === 'granted' || (await requestNotificationPermission());
  if (!hasPermission) {
    return false;
  }

  const notificationOptions = {
    body: options?.body || 'Nueva actualización en tu pedido de ÉXODO.',
    icon: options?.icon || '/pwa-192x192.png',
    badge: options?.badge || '/pwa-192x192.png',
    tag: options?.tag || 'exodo-order-alert',
    vibrate: options?.vibrate || [100, 50, 100, 50, 150],
    data: options?.data || { url: '/' },
  };

  try {
    // If ServiceWorker is active, prefer ServiceWorkerRegistration for better mobile background persistence
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      if (registration && registration.showNotification) {
        await registration.showNotification(title, notificationOptions as any);
        return true;
      }
    }

    // Fallback to standard Window Notification
    new Notification(title, notificationOptions);
    return true;
  } catch (error) {
    console.warn('Fallback al crear notificación nativa:', error);
    try {
      new Notification(title, notificationOptions);
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Format order into structured WhatsApp message for shop / workshop
 */
export function generateWhatsAppOrderUrl(order: Order, phone: string = '584140153904'): string {
  const cleanPhone = phone.replace(/[^0-9]/g, '');

  const itemsDetails = order.items
    .map((item, idx) => {
      let customInfo = '';
      if (item.customDesign) {
        const parts = [];
        if (item.customDesign.laminaMeasure) parts.push(`Medida: ${item.customDesign.laminaMeasure}`);
        if ((item.customDesign as any).printLocation) parts.push(`Ubicación: ${(item.customDesign as any).printLocation}`);
        if ((item.customDesign as any).printDimensionsCm) parts.push(`Área: ${(item.customDesign as any).printDimensionsCm}`);
        if (item.customDesign.verseText) parts.push(`Texto: "${item.customDesign.verseText}"`);
        if (parts.length > 0) customInfo = ` [${parts.join(' | ')}]`;
      }

      return (
        `${idx + 1}. *${item.product.name}* (x${item.quantity})` +
        `${item.selectedSize ? ` - Talla ${item.selectedSize}` : ''}` +
        `${item.fitType ? ` (${item.fitType})` : ''}` +
        `${item.selectedColor ? ` - Color ${item.selectedColor.name}` : ''}` +
        `${customInfo}` +
        ` → *$${(item.unitPrice * item.quantity).toFixed(2)}*`
      );
    })
    .join('\n');

  const text = 
    `🔥 *¡NUEVO PEDIDO REGISTRADO EN ÉXODO!* 🔥\n` +
    `🔖 *Código de Pedido:* ${order.orderCode}\n` +
    `📅 *Fecha:* ${new Date(order.createdAt).toLocaleString('es-VE')}\n\n` +
    `👤 *Cliente:* ${order.customerName}\n` +
    `📱 *WhatsApp:* ${order.customerPhone}\n` +
    `📍 *Dirección de Entrega:* ${order.shippingAddress}\n` +
    `🚚 *Método de Envío:* ${order.shippingAgency}\n\n` +
    `🛍️ *DETALLE DE PIEZAS:*\n${itemsDetails}\n\n` +
    `💵 *TOTAL A PAGAR:* *$${order.totalUSD.toFixed(2)} USD*\n` +
    `🇻🇪 *EQUIVALENTE VES:* *Bs. ${order.totalVES.toFixed(2)}* (Tasa BCV: ${order.exchangeRateBCV})\n` +
    `💳 *Método de Pago:* ${order.paymentMethod || 'Pago Móvil / Efectivo'}\n` +
    `🏦 *Referencia Pago Móvil:* ${order.pagoMovilRef || 'Adjunto comprobante'}\n` +
    `${order.notes ? `📝 *Notas del Cliente:* ${order.notes}\n` : ''}\n` +
    `✨ _Mensaje generado automáticamente desde la App de ÉXODO Urban Christian_`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
}

/**
 * High-level trigger for order purchase flow: Audio Chime + Native Push Notification
 */
export async function triggerOrderNotificationFlow(order: Order): Promise<void> {
  // 1. Play sound
  playNotificationChime();

  // 2. Dispatch native push notification to screen/phone
  await sendNativeNotification(`🛍️ ¡Pedido Confirmado! #${order.orderCode}`, {
    body: `Tu pedido por $${order.totalUSD.toFixed(2)} USD ha sido enviado a producción en Caracas.`,
    tag: `order-${order.orderCode}`,
    data: { url: `/?tracking=${order.orderCode}` },
  });
}
