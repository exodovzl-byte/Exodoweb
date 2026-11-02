/**
 * Image compressor utility for client-side image processing.
 * Compresses images to lightweight WebP/PNG/JPEG before storing in state,
 * preventing QuotaExceededError in LocalStorage and Document size errors in Firestore.
 */

export async function compressImageFile(
  file: File,
  maxDimension = 1200,
  quality = 0.88
): Promise<string> {
  return new Promise((resolve, reject) => {
    // If SVG, read as text or DataURL directly as SVGs are vector and tiny
    if (file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg')) {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate proportional scale
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, width);
        canvas.height = Math.max(1, height);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        // Keep PNG transparency if original is PNG, else use high-efficiency JPEG
        const isPng = file.type === 'image/png' || file.name.toLowerCase().endsWith('.png');
        
        try {
          if (isPng) {
            // Test if canvas produces reasonably sized PNG
            const pngData = canvas.toDataURL('image/png', quality);
            // If PNG is under 600KB, use it to preserve crisp transparency
            if (pngData.length < 600000) {
              resolve(pngData);
              return;
            }
          }
          // Default to WebP/JPEG for optimal size
          const webpData = canvas.toDataURL('image/webp', quality);
          if (webpData.startsWith('data:image/webp')) {
            resolve(webpData);
            return;
          }
          const jpegData = canvas.toDataURL('image/jpeg', quality);
          resolve(jpegData);
        } catch {
          resolve(e.target?.result as string);
        }
      };
      img.onerror = () => resolve(e.target?.result as string);
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Error al leer el archivo de imagen'));
    reader.readAsDataURL(file);
  });
}
