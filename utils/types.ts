// utils/types.ts
export interface ImageFile {
  id: string;
  name: string;
  width: number;
  height: number;
  fullUrl: string; // Original quality for PDF export
  previewUrl: string; // Medium quality for detail views (400px, 0.8 quality)
  thumbnailUrl: string; // Low quality for grid views (150px, 0.6 quality)
  size?: number; // File size in bytes
}

export interface Card {
  id: string;
  rectoId: string;
  versoId: string;
  quantity: number;
}

export interface PageMargins {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export type TabType = 'upload' | 'associate' | 'layout';

export interface LayoutItem {
  card: Card;
  x: number;
  y: number;
  page: number;
}

export interface LayoutData {
  layout: LayoutItem[];
  perPage: number;
}

export interface LoadingState {
  isLoading: boolean;
  progress?: number;
  message?: string;
}
