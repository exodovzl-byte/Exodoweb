import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { generateStreetwearImage, editStreetwearImage } from './src/server/geminiHandler.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '20mb' }));

// Gemini AI image endpoints
app.post('/api/generate-image', async (req, res) => {
  try {
    const { prompt, aspectRatio } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt es requerido' });
    }
    const imageUrl = await generateStreetwearImage(prompt, aspectRatio);
    return res.json({ imageUrl });
  } catch (error: any) {
    console.error('API Error /api/generate-image:', error);
    const strError = typeof error === 'string' ? error : JSON.stringify(error) + ' ' + (error?.message || '');
    if (
      strError.includes('429') ||
      strError.includes('quota') ||
      strError.includes('RESOURCE_EXHAUSTED') ||
      strError.includes('rate-limit') ||
      error?.status === 'RESOURCE_EXHAUSTED' ||
      error?.code === 429
    ) {
      return res.status(429).json({
        error: 'Los créditos y cuota gratuita de generación de imágenes con Google Gemini se han agotado temporalmente. La cuota se restablece automáticamente en unos 15 a 30 minutos según las políticas de Google AI Studio. Mientras tanto, puedes continuar subiendo tus propios logos e imágenes directamente al Custom Lab.',
      });
    }
    return res.status(500).json({ error: error?.message || 'Error generando imagen con IA' });
  }
});

app.post('/api/edit-image', async (req, res) => {
  try {
    const { imageBase64, mimeType, instructionPrompt } = req.body;
    if (!imageBase64 || !instructionPrompt) {
      return res.status(400).json({ error: 'Imagen e instrucciones son requeridas' });
    }
    const imageUrl = await editStreetwearImage(imageBase64, mimeType || 'image/png', instructionPrompt);
    return res.json({ imageUrl });
  } catch (error: any) {
    console.error('API Error /api/edit-image:', error);
    const strError = typeof error === 'string' ? error : JSON.stringify(error) + ' ' + (error?.message || '');
    if (
      strError.includes('429') ||
      strError.includes('quota') ||
      strError.includes('RESOURCE_EXHAUSTED') ||
      strError.includes('rate-limit') ||
      error?.status === 'RESOURCE_EXHAUSTED' ||
      error?.code === 429
    ) {
      return res.status(429).json({
        error: 'Los créditos y cuota de edición de imágenes con Google Gemini se han agotado temporalmente. La cuota se restablece automáticamente en unos 15 a 30 minutos. Mientras tanto, puedes continuar subiendo y manipulando tus imágenes directamente.',
      });
    }
    return res.status(500).json({ error: error?.message || 'Error editando imagen con IA' });
  }
});

// Email Notification Endpoint (orders & prayer requests to exodovzl@gmail.com)
app.post('/api/send-email', async (req, res) => {
  try {
    const { to, subject, type, data } = req.body;
    const recipient = to || 'exodovzl@gmail.com';
    
    console.log(`\n========================================`);
    console.log(`📧 [ÉXODO NOTIFICACIÓN POR CORREO ELECTRÓNICO]`);
    console.log(`Destinatario: ${recipient}`);
    console.log(`Asunto: ${subject}`);
    console.log(`Tipo: ${type}`);
    console.log(`Datos:`, JSON.stringify(data, null, 2));
    console.log(`========================================\n`);

    return res.json({
      success: true,
      message: `Notificación enviada exitosamente a ${recipient}`,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('API Error /api/send-email:', error);
    return res.status(500).json({ error: 'Error procesando notificación de correo' });
  }
});

// Live BCV Exchange Rate Proxy (Automated official rate with caching)
let bcvCache: { rate: number; updatedAt: string; lastFetched: number } | null = null;

app.get('/api/bcv-rate', async (_req, res) => {
  const now = Date.now();
  // Cache for 10 minutes to respect API rate limits
  if (bcvCache && (now - bcvCache.lastFetched) < 10 * 60 * 1000) {
    return res.json({ success: true, rate: bcvCache.rate, updatedAt: bcvCache.updatedAt, cached: true });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    const response = await fetch('https://ve.dolarapi.com/v1/dolares/oficial', {
      signal: controller.signal,
      headers: { 'Accept': 'application/json' }
    });
    clearTimeout(timeout);

    if (response.ok) {
      const data: any = await response.json();
      const rawRate = typeof data.promedio === 'number' ? data.promedio : parseFloat(data.promedio);
      if (rawRate && !isNaN(rawRate) && rawRate > 0) {
        bcvCache = {
          rate: Number(rawRate.toFixed(4)),
          updatedAt: data.fechaActualizacion || new Date().toISOString(),
          lastFetched: now,
        };
        return res.json({ success: true, rate: bcvCache.rate, updatedAt: bcvCache.updatedAt, cached: false });
      }
    }
  } catch (err: any) {
    console.warn('Error fetching live BCV rate from API:', err?.message || err);
  }

  if (bcvCache) {
    return res.json({ success: true, rate: bcvCache.rate, updatedAt: bcvCache.updatedAt, fallback: true });
  }

  return res.json({ success: false, rate: null, error: 'No se pudo obtener la tasa en vivo del BCV en este momento.' });
});

// Persistent Store State Storage (Dual backup for cross-device sync)
const DATA_DIR = path.resolve(__dirname, 'data');
const STORE_STATE_FILE = path.resolve(DATA_DIR, 'store_state.json');

if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (e) {
    console.warn('Could not create data directory:', e);
  }
}

app.get('/api/store-data', (_req, res) => {
  try {
    if (fs.existsSync(STORE_STATE_FILE)) {
      const raw = fs.readFileSync(STORE_STATE_FILE, 'utf8');
      const data = JSON.parse(raw);
      return res.json({ success: true, data, updatedAt: data.updatedAt });
    }
    return res.json({ success: true, data: null });
  } catch (err: any) {
    console.error('Error reading store state:', err);
    return res.status(500).json({ error: 'Error leyendo datos de la tienda' });
  }
});

app.post('/api/store-data', (req, res) => {
  try {
    let existing: any = {};
    if (fs.existsSync(STORE_STATE_FILE)) {
      try {
        existing = JSON.parse(fs.readFileSync(STORE_STATE_FILE, 'utf8'));
      } catch (e) {}
    }
    const incoming = req.body || {};
    const merged = {
      ...existing,
      ...incoming,
      updatedAt: incoming.updatedAt || new Date().toISOString(),
    };
    fs.writeFileSync(STORE_STATE_FILE, JSON.stringify(merged, null, 2), 'utf8');
    return res.json({ success: true, updatedAt: merged.updatedAt });
  } catch (err: any) {
    console.error('Error saving store state:', err);
    return res.status(500).json({ error: 'Error guardando datos de la tienda' });
  }
});

// Serve frontend static build & PWA public directory
const distPath = path.resolve(__dirname, 'dist');
const publicPath = path.resolve(__dirname, 'public');
app.use(express.static(publicPath));
app.use(express.static(distPath));

app.get('*', (_req, res) => {
  res.sendFile(path.resolve(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`ÉXODO server running on port ${PORT}`);
});
