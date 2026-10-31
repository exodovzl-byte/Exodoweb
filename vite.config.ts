import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { defineConfig, Plugin } from 'vite';
import dotenv from 'dotenv';
import { generateStreetwearImage, editStreetwearImage } from './src/server/geminiHandler.ts';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function geminiApiPlugin(): Plugin {
  return {
    name: 'gemini-api-endpoints',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url === '/api/generate-image' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', async () => {
            try {
              const { prompt, aspectRatio } = JSON.parse(body || '{}');
              if (!prompt) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'Prompt es requerido' }));
                return;
              }
              const imageUrl = await generateStreetwearImage(prompt, aspectRatio);
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ imageUrl }));
            } catch (error: any) {
              console.error('API Error /api/generate-image:', error);
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: error?.message || 'Error generando imagen' }));
            }
          });
          return;
        }

        if (req.url === '/api/edit-image' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', async () => {
            try {
              const { imageBase64, mimeType, instructionPrompt } = JSON.parse(body || '{}');
              if (!imageBase64 || !instructionPrompt) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'Imagen e instrucciones son requeridas' }));
                return;
              }
              const imageUrl = await editStreetwearImage(imageBase64, mimeType || 'image/png', instructionPrompt);
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ imageUrl }));
            } catch (error: any) {
              console.error('API Error /api/edit-image:', error);
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: error?.message || 'Error editando imagen' }));
            }
          });
          return;
        }

        if (req.url === '/api/send-email' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', async () => {
            try {
              const { to, subject, type, data } = JSON.parse(body || '{}');
              const recipient = to || 'exodovzl@gmail.com';
              console.log(`[Vite Dev] 📧 Notificación de correo: "${subject}" enviada a ${recipient} (${type})`);
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({
                success: true,
                message: `Notificación enviada exitosamente a ${recipient}`,
                timestamp: new Date().toISOString()
              }));
            } catch (error: any) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Error procesando notificación de correo' }));
            }
          });
          return;
        }

        // Store state persistence for cross-device sync
        if (req.url === '/api/store-data') {
          const dataDir = path.resolve(__dirname, 'data');
          const storeFile = path.resolve(dataDir, 'store_state.json');

          if (req.method === 'GET') {
            try {
              if (fs.existsSync(storeFile)) {
                const raw = fs.readFileSync(storeFile, 'utf8');
                const parsed = JSON.parse(raw);
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: true, data: parsed, updatedAt: parsed.updatedAt }));
                return;
              }
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, data: null }));
            } catch (err: any) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Error leyendo datos de la tienda' }));
            }
            return;
          }

          if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', () => {
              try {
                if (!fs.existsSync(dataDir)) {
                  fs.mkdirSync(dataDir, { recursive: true });
                }
                let existing: any = {};
                if (fs.existsSync(storeFile)) {
                  try {
                    existing = JSON.parse(fs.readFileSync(storeFile, 'utf8'));
                  } catch (e) {}
                }
                const incoming = JSON.parse(body || '{}');
                const merged = {
                  ...existing,
                  ...incoming,
                  updatedAt: incoming.updatedAt || new Date().toISOString(),
                };
                fs.writeFileSync(storeFile, JSON.stringify(merged, null, 2), 'utf8');
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: true, updatedAt: merged.updatedAt }));
              } catch (err: any) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'Error guardando datos de la tienda' }));
              }
            });
            return;
          }
        }

        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), geminiApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
