// utils.ts
import { ImageFile, Card } from './types';
import { getMmPerPx } from './constants';

export const createThumbnail = (
  img: HTMLImageElement,
  maxSize: number,
  quality: number
): string => {
  const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, img.width * scale);
  canvas.height = Math.max(1, img.height * scale);
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.imageSmoothingEnabled = quality > 0.5;
    ctx.imageSmoothingQuality = quality > 0.7 ? 'high' : 'low';
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  }
  return canvas.toDataURL('image/jpeg', quality);
};

export const getCardSizeInMm = (
  rectoId: string,
  rectos: ImageFile[],
  dpi: number = 72
): { width: number; height: number } => {
  const recto = rectos.find((r) => r.id === rectoId);
  if (!recto) return { width: 63, height: 88 };
  const mmPerPx = getMmPerPx(dpi);
  return { width: recto.width * mmPerPx, height: recto.height * mmPerPx };
};

export const getTotalCards = (cards: Card[]): number => {
  return cards.reduce((sum, card) => sum + card.quantity, 0);
};

export const getUnusedRectos = (
  rectos: ImageFile[],
  cards: Card[]
): ImageFile[] => {
  const usedRectoIds = new Set(cards.map((c) => c.rectoId));
  return rectos.filter((r) => !usedRectoIds.has(r.id));
};

export const generateId = (prefix: string): string => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
};
