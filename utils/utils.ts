// utils/utils.ts
import { ImageFile, Card } from '@/utils/types';
import { getMmPerPx } from '@/utils/constants';

// Async image thumbnail creation with quality optimization
export const createThumbnailAsync = (
  img: HTMLImageElement,
  maxSize: number,
  quality: number,
): Promise<string> => {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.floor(img.width * scale));
      canvas.height = Math.max(1, Math.floor(img.height * scale));

      const ctx = canvas.getContext('2d', { alpha: false });
      if (ctx) {
        ctx.imageSmoothingEnabled = quality > 0.5;
        ctx.imageSmoothingQuality = quality > 0.7 ? 'high' : 'medium';
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      }

      resolve(canvas.toDataURL('image/jpeg', quality));
    });
  });
};

// Process single image file with all thumbnail sizes
export const processImageFile = async (
  file: File,
  type: 'recto' | 'verso',
): Promise<ImageFile> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (event) => {
      const imageUrl = event.target?.result as string;
      const img = new Image();

      img.onload = async () => {
        try {
          // Create thumbnails asynchronously
          const [thumbnailUrl, previewUrl] = await Promise.all([
            createThumbnailAsync(img, 150, 0.6), // Grid view
            createThumbnailAsync(img, 400, 0.8), // Detail view
          ]);

          const newImage: ImageFile = {
            id: generateId(type),
            name: file.name,
            fullUrl: imageUrl, // Keep original for PDF
            previewUrl,
            thumbnailUrl,
            width: img.naturalWidth,
            height: img.naturalHeight,
            size: file.size,
          };

          resolve(newImage);
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () =>
        reject(new Error(`Failed to load image: ${file.name}`));
      img.src = imageUrl;
    };

    reader.onerror = () =>
      reject(new Error(`Failed to read file: ${file.name}`));
    reader.readAsDataURL(file);
  });
};

// Batch process images with progress callback
export const processImagesInBatches = async (
  files: File[],
  type: 'recto' | 'verso',
  onProgress?: (current: number, total: number) => void,
): Promise<ImageFile[]> => {
  const results: ImageFile[] = [];
  const batchSize = 3; // Process 3 at a time to avoid blocking

  for (let i = 0; i < files.length; i += batchSize) {
    const batch = files.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map((file) => processImageFile(file, type)),
    );
    results.push(...batchResults);

    if (onProgress) {
      onProgress(i + batch.length, files.length);
    }
  }

  return results;
};

export const getCardSizeInMm = (
  rectoId: string,
  rectos: ImageFile[],
  dpi: number = 72,
): { width: number; height: number } => {
  const recto = rectos.find((r) => r.id === rectoId);
  if (!recto) return { width: 63, height: 88 };
  const mmPerPx = getMmPerPx(dpi);
  return {
    width: parseFloat((recto.width * mmPerPx).toFixed(2)),
    height: parseFloat((recto.height * mmPerPx).toFixed(2)),
  };
};

export const getTotalCards = (cards: Card[]): number => {
  return cards.reduce((sum, card) => sum + card.quantity, 0);
};

export const getUnusedRectos = (
  rectos: ImageFile[],
  cards: Card[],
): ImageFile[] => {
  const usedRectoIds = new Set(cards.map((c) => c.rectoId));
  return rectos.filter((r) => !usedRectoIds.has(r.id));
};

export const generateId = (prefix: string): string => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
};

// Debounce function for expensive operations
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};
