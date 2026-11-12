/**
 * Client-side canvas image compressor for SEENta
 * Resizes large camera photos to a max dimension and compresses to web-friendly JPEG/WebP data URL.
 * Strictly restricts uploads to JPG, PNG, and WebP for security.
 */

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const ALLOWED_EXTENSIONS = /\.(jpg|jpeg|png|webp)$/i;
const MAX_RAW_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export async function compressImage(file, maxDimension = 800, quality = 0.70) {
  return new Promise((resolve, reject) => {
    if (!file) {
      return reject(new Error('No file provided.'));
    }

    // Strict allowlist: Only JPG, PNG, and WebP are permitted for security
    const mime = (file.type || '').toLowerCase();
    const name = (file.name || '').toLowerCase();
    const isSvg = mime.includes('svg') || name.endsWith('.svg');
    const hasValidMime = ALLOWED_MIME_TYPES.includes(mime);
    const hasValidExt = ALLOWED_EXTENSIONS.test(name);

    if (!hasValidMime || !hasValidExt || isSvg) {
      return reject(new Error('Invalid file format. Only JPG, PNG, and WebP images are allowed for security reasons.'));
    }

    // Raw file size boundary check
    if (file.size > MAX_RAW_SIZE_BYTES) {
      return reject(new Error('File is too large. Maximum allowed size is 10MB per image.'));
    }

    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

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
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        // Fill white background in case of transparent PNG
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        // Try modern WebP first (25-35% smaller than JPEG), fallback to JPEG
        let dataUrl = canvas.toDataURL('image/webp', quality);
        if (!dataUrl.startsWith('data:image/webp')) {
          dataUrl = canvas.toDataURL('image/jpeg', quality);
        }
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('Corrupted or invalid image file.'));
      img.src = readerEvent.target.result;
    };
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.readAsDataURL(file);
  });
}
