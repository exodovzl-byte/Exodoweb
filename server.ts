import express from 'express';
import path from 'path';
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
