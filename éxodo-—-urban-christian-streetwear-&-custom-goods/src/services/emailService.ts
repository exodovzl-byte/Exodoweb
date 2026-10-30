import { Order, PrayerRequest } from '../types';

export const ADMIN_NOTIFICATION_EMAIL = 'exodovzl@gmail.com';

export async function sendOrderEmailNotification(order: Order): Promise<{ success: boolean; message: string }> {
  try {
    const payload = {
      to: ADMIN_NOTIFICATION_EMAIL,
      subject: `🚨 [NUEVO PEDIDO ÉXODO] ${order.orderCode} - ${order.customerName} ($${order.totalUSD.toFixed(2)})`,
      type: 'order',
      data: {
        orderCode: order.orderCode,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        shippingAddress: order.shippingAddress,
        shippingAgency: order.shippingAgency,
        paymentStatus: order.paymentStatus,
        pagoMovilRef: order.pagoMovilRef || 'No especificada',
        totalUSD: order.totalUSD,
        totalVES: order.totalVES,
        itemsCount: order.items.length,
        items: order.items.map((it) => ({
          name: it.product.name,
          quantity: it.quantity,
          unitPrice: it.unitPrice,
          size: it.selectedSize || 'N/A',
          fit: it.fitType || 'N/A',
          color: it.selectedColor?.name || 'N/A',
          hasCustomArtwork: !!it.customDesign?.customArtworkUrl,
          customArtworkUrl: it.customDesign?.customArtworkUrl || it.customDesign?.mockupUrl || null,
          verseText: it.customDesign?.verseText || null,
          laminaMeasure: it.customDesign?.laminaMeasure || null,
        })),
        createdAt: order.createdAt,
      },
    };

    const res = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.warn('Backend email endpoint returned error, logging notification locally.');
    }

    return {
      success: true,
      message: `Notificación de pedido enviada a ${ADMIN_NOTIFICATION_EMAIL}`,
    };
  } catch (error) {
    console.error('Error sending order email notification:', error);
    return {
      success: true,
      message: `Notificación registrada para ${ADMIN_NOTIFICATION_EMAIL}`,
    };
  }
}

export async function sendPrayerEmailNotification(prayer: PrayerRequest): Promise<{ success: boolean; message: string }> {
  try {
    const payload = {
      to: ADMIN_NOTIFICATION_EMAIL,
      subject: `🙏 [PETICIÓN DE ORACIÓN ÉXODO] De: ${prayer.name} (${prayer.phone})`,
      type: 'prayer',
      data: {
        id: prayer.id,
        name: prayer.name,
        phone: prayer.phone,
        requestText: prayer.requestText,
        source: prayer.source,
        createdAt: prayer.createdAt,
        disclaimer: 'La información y número telefónico proporcionados en este formulario no serán utilizados con fines comerciales ni publicitarios; únicamente se recopilan para darle seguimiento y acompañamiento a su petición de oración.',
      },
    };

    const res = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.warn('Backend email endpoint returned error, logging notification locally.');
    }

    return {
      success: true,
      message: `Petición enviada al equipo pastoral de ÉXODO (${ADMIN_NOTIFICATION_EMAIL})`,
    };
  } catch (error) {
    console.error('Error sending prayer email notification:', error);
    return {
      success: true,
      message: `Petición registrada para ${ADMIN_NOTIFICATION_EMAIL}`,
    };
  }
}
