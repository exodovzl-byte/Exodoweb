/**
 * Image compressor utility for client-side image processing.
 * Compresses images to lightweight WebP/PNG/JPEG before storing in state,
 * preventing QuotaExceededError in LocalStorage and Document size errors in Firestore.
 */

export async function compressImageFile(
  file: File,
  maxDimension = 900,
  quality = 0.82
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

        const isPng = file.type === 'image/png' || file.name.toLowerCase().endsWith('.png');
        
        try {
          // 1. WebP preserves alpha transparency for PNGs and produces tiny files (~35-60KB)
          const webpData = canvas.toDataURL('image/webp', quality);
          if (webpData.startsWith('data:image/webp') && webpData.length < 280000) {
            resolve(webpData);
            return;
          }

          // 2. If PNG, only keep if under 150KB to protect Firestore 1MB limit
          if (isPng) {
            const pngData = canvas.toDataURL('image/png');
            if (pngData.length < 150000) {
              resolve(pngData);
              return;
            }
          }

          // 3. High efficiency JPEG fallback
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
