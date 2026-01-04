// constants.ts
export const A4_WIDTH_MM = 210;
export const A4_HEIGHT_MM = 297;

export const DEFAULT_MARGINS = {
  top: 5,
  right: 5,
  bottom: 5,
  left: 5,
};

export const DEFAULT_CARD_SPACING = 0.5;
export const DEFAULT_SCALE = 0.5;
export const DEFAULT_DPI = 72;

// Calculate mm per pixel based on DPI
// Formula: 25.4 mm per inch ÷ DPI
export const getMmPerPx = (dpi: number): number => 25.4 / dpi;
