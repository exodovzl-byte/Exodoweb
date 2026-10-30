import { GoogleGenAI } from '@google/genai';

let aiInstance: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });
  }
  return aiInstance;
}

export async function generateStreetwearImage(prompt: string, aspectRatio: string = '1:1'): Promise<string> {
  const ai = getAiClient();
  
  // Model priority: gemini-3.1-flash-image, then gemini-2.5-flash-image
  const modelsToTry = ['gemini-3.1-flash-image', 'gemini-2.5-flash-image'];
  let lastError: any = null;

  for (const model of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model: model,
        contents: {
          parts: [
            {
              text: `Christian streetwear urban graphic design for apparel and stickers. Aesthetic: Venezuelan Caracas street grit, bold typography, Christian spiritual meaning, high contrast, DTF printing ready. Prompt: ${prompt}`,
            },
          ],
        },
        config: {
          imageConfig: {
            aspectRatio: (aspectRatio as any) || '1:1',
          },
        },
      });

      const parts = response.candidates?.[0]?.content?.parts || [];
      for (const part of parts) {
        if (part.inlineData?.data) {
          const mime = part.inlineData.mimeType || 'image/png';
          return `data:${mime};base64,${part.inlineData.data}`;
        }
      }
    } catch (err: any) {
      lastError = err;
      console.warn(`Model ${model} failed, trying next fallback:`, err?.message);
    }
  }

  throw lastError || new Error('No se pudo generar la imagen con los modelos disponibles.');
}

export async function editStreetwearImage(
  base64ImageData: string,
  mimeType: string,
  instructionPrompt: string
): Promise<string> {
  const ai = getAiClient();
  const modelsToTry = ['gemini-3.1-flash-image', 'gemini-2.5-flash-image'];
  let lastError: any = null;

  // Clean base64 if it has data URL prefix
  const cleanBase64 = base64ImageData.replace(/^data:image\/\w+;base64,/, '');

  for (const model of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model: model,
        contents: {
          parts: [
            {
              inlineData: {
                data: cleanBase64,
                mimeType: mimeType || 'image/png',
              },
            },
            {
              text: `Edit this urban Christian streetwear graphic according to the following instructions while keeping it suitable for apparel print and high resolution: ${instructionPrompt}`,
            },
          ],
        },
      });

      const parts = response.candidates?.[0]?.content?.parts || [];
      for (const part of parts) {
        if (part.inlineData?.data) {
          const mime = part.inlineData.mimeType || 'image/png';
          return `data:${mime};base64,${part.inlineData.data}`;
        }
      }
    } catch (err: any) {
      lastError = err;
      console.warn(`Edit model ${model} failed:`, err?.message);
    }
  }

  throw lastError || new Error('No se pudo editar la imagen con el modelo de IA.');
}
