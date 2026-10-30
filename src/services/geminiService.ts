export interface GenerateImageResponse {
  imageUrl?: string;
  error?: string;
}

export async function requestAiImage(prompt: string, aspectRatio: string = '1:1'): Promise<string> {
  const res = await fetch('/api/generate-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, aspectRatio }),
  });

  const data = await res.json();
  if (!res.ok || data.error) {
    throw new Error(data.error || 'Error al generar la imagen con IA');
  }

  return data.imageUrl;
}

export async function requestAiImageEdit(
  imageBase64: string,
  mimeType: string,
  instructionPrompt: string
): Promise<string> {
  const res = await fetch('/api/edit-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64, mimeType, instructionPrompt }),
  });

  const data = await res.json();
  if (!res.ok || data.error) {
    throw new Error(data.error || 'Error al editar la imagen con IA');
  }

  return data.imageUrl;
}
