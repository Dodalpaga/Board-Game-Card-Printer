// types.ts
export interface ImageFile {
  id: string;
  name: string;
  url: string;
  previewUrl: string;
  layoutPreviewUrl: string;
  width: number;
  height: number;
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

export interface LayoutItem {
  card: Card;
  quantity: number;
  x: number;
  y: number;
  page: number;
}

export interface LayoutData {
  perPage: number;
  layout: LayoutItem[];
}

export type TabType = 'upload' | 'associate' | 'layout';
