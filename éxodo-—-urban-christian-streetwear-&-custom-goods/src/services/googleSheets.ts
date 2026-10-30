import { getAccessToken } from './firebaseAuth';
import { Order, Product } from '../types';

export interface CreateSheetResult {
  spreadsheetId: string;
  spreadsheetUrl: string;
  title: string;
}

/**
 * Creates a brand new Google Spreadsheet with orders data
 */
export async function createOrdersSpreadsheet(
  orders: Order[],
  title: string = `ÉXODO Pedidos — ${new Date().toLocaleDateString('es-VE')}`
): Promise<CreateSheetResult> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Debes iniciar sesión con Google para sincronizar con Google Sheets.');
  }

  // 1. Create Spreadsheet
  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title: title,
      },
      sheets: [
        {
          properties: {
            title: 'Control de Producción y Envíos',
            gridProperties: {
              frozenRowCount: 1,
            },
          },
        },
      ],
    }),
  });

  if (!createRes.ok) {
    const errorData = await createRes.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || `Error al crear hoja de cálculo (${createRes.status})`);
  }

  const sheetData = await createRes.json();
  const spreadsheetId = sheetData.spreadsheetId;
  const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  // 2. Format and Populate initial data
  const headers = [
    'Código de Pedido',
    'Fecha',
    'Cliente',
    'Teléfono (WhatsApp)',
    'Dirección de Envío',
    'Empresa de Envíos / Delivery',
    'Prendas y Especificaciones',
    'Total USD',
    'Total Bs (VES)',
    'Tasa BCV',
    'Estado de Pago',
    'Etapa Kanban OMS',
    'Referencia Pago Móvil',
  ];

  const rows = orders.map((ord) => [
    ord.orderCode,
    new Date(ord.createdAt).toLocaleString('es-VE'),
    ord.customerName,
    ord.customerPhone,
    ord.shippingAddress,
    ord.shippingAgency,
    ord.items
      .map(
        (it) =>
          `${it.product.name} (x${it.quantity})${it.selectedSize ? ` - Talla: ${it.selectedSize}` : ''}${
            it.fitType ? ` [${it.fitType}]` : ''
          }${it.selectedColor ? ` [${it.selectedColor.name}]` : ''}${
            it.selectedFinish ? ` [Acabado: ${it.selectedFinish}]` : ''
          }`
      )
      .join(' | '),
    `$${ord.totalUSD.toFixed(2)}`,
    `Bs ${ord.totalVES.toFixed(2)}`,
    ord.exchangeRateBCV.toFixed(2),
    ord.paymentStatus,
    ord.productionStage,
    ord.pagoMovilRef || 'En verificación',
  ]);

  const updateRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'Control de Producción y Envíos'!A1:M${
      rows.length + 1
    }?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [headers, ...rows],
      }),
    }
  );

  if (!updateRes.ok) {
    const errorData = await updateRes.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || 'Error al escribir filas en la hoja');
  }

  return {
    spreadsheetId,
    spreadsheetUrl,
    title,
  };
}

/**
 * Creates a catalog and inventory Google Spreadsheet
 */
export async function createInventorySpreadsheet(
  products: Product[],
  title: string = `ÉXODO Catálogo & Inventario — ${new Date().toLocaleDateString('es-VE')}`
): Promise<CreateSheetResult> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Debes iniciar sesión con Google para sincronizar el inventario.');
  }

  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title,
      },
      sheets: [
        {
          properties: {
            title: 'Inventario ÉXODO',
            gridProperties: {
              frozenRowCount: 1,
            },
          },
        },
      ],
    }),
  });

  if (!createRes.ok) {
    const errorData = await createRes.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || `Error al crear hoja de cálculo (${createRes.status})`);
  }

  const sheetData = await createRes.json();
  const spreadsheetId = sheetData.spreadsheetId;
  const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  const headers = [
    'ID',
    'Producto',
    'Categoría',
    'Colección',
    'Precio Base (USD)',
    'Precio Descuento (USD)',
    'Delta Oversize (+USD)',
    'Versículo Bíblico',
    'Stock Actual',
    'Especificación Material',
  ];

  const rows = products.map((p) => [
    p.id,
    p.name,
    p.category,
    p.collection,
    p.basePrice,
    p.discountPrice || 'Sin oferta',
    `+${p.oversizePriceDelta}`,
    p.scripture,
    p.stock,
    p.materialSpecs,
  ]);

  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'Inventario ÉXODO'!A1:J${
      rows.length + 1
    }?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [headers, ...rows],
      }),
    }
  );

  return {
    spreadsheetId,
    spreadsheetUrl,
    title,
  };
}
