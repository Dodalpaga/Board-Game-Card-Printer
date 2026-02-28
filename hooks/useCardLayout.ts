// hooks/useCardLayout.ts
import { useMemo, useState, useEffect } from 'react';
import { Card, ImageFile, PageMargins, LayoutData } from '@/utils/types';
import { A4_WIDTH_MM, A4_HEIGHT_MM } from '@/utils/constants';
import { getCardSizeInMm } from '@/utils/utils';

export type CardAlignment = 'left' | 'center' | 'right';

// ─── Skyline Bin Packer ─────────────────────────────────────────────────────
//
// A "skyline" is a step function describing the current filled height at every
// X position across the page.  It is stored as a list of contiguous segments
// { x, y, width } sorted by x.
//
// To place a new rectangle we scan every skyline segment as a candidate
// left-edge, compute the minimum Y at which the rectangle fits (the maximum
// skyline height it would straddle), and pick the candidate with the lowest Y
// (ties broken by leftmost X).  After placement the skyline is updated and
// adjacent segments at equal height are merged.
//
// Bin dimensions are (availableWidth + spacing) × (availableHeight + spacing).
// Adding one spacing to each axis lets every card carry its own trailing gap
// while still guaranteeing that the real card content stays within the
// printable area:
//   placed x + realWidth  ≤ availableWidth   (because x + ew ≤ binWidth)
//   placed y + realHeight ≤ availableHeight  (same reasoning for Y)
// ────────────────────────────────────────────────────────────────────────────

type SkylineNode = { x: number; y: number; width: number };

interface PlacedCard {
  card: Card;
  /** Position in bin-local coordinates (does NOT include page margins). */
  x: number;
  y: number;
  /** Real card dimensions (mm), without the inter-card spacing. */
  w: number;
  h: number;
}

class SkylinePacker {
  private skyline: SkylineNode[];
  readonly binWidth: number;
  readonly binHeight: number;
  readonly placed: PlacedCard[] = [];

  constructor(
    availableWidth: number,
    availableHeight: number,
    spacing: number,
  ) {
    // Adding one spacing to the bin dimensions lets the trailing gap of the
    // last card in each row/column extend just past the printable boundary
    // without preventing placement.
    this.binWidth = availableWidth + spacing;
    this.binHeight = availableHeight + spacing;
    this.skyline = [{ x: 0, y: 0, width: this.binWidth }];
  }

  /**
   * Attempt to place a card.
   * @param card  - the card descriptor
   * @param w / h - real card size (mm)
   * @param ew/eh - effective size including inter-card spacing (mm)
   * @returns true if placed successfully
   */
  insert(card: Card, w: number, h: number, ew: number, eh: number): boolean {
    let bestY = Infinity;
    let bestX = 0;
    let bestIdx = -1;

    for (let i = 0; i < this.skyline.length; i++) {
      const y = this.fitAt(i, ew, eh);
      if (y !== null && y < bestY) {
        bestY = y;
        bestX = this.skyline[i].x;
        bestIdx = i;
      }
    }

    if (bestIdx === -1) return false;

    this.addLevel(bestIdx, bestX, bestY, ew, eh);
    this.placed.push({ card, x: bestX, y: bestY, w, h });
    return true;
  }

  /**
   * Returns the Y at which a rectangle of ew×eh can be placed starting at
   * skyline[i], or null if it does not fit.
   */
  private fitAt(i: number, ew: number, eh: number): number | null {
    const x = this.skyline[i].x;
    if (x + ew > this.binWidth + 0.001) return null;

    let maxY = 0;
    let covered = 0;

    for (let j = i; covered < ew - 0.001; j++) {
      if (j >= this.skyline.length) return null;
      maxY = Math.max(maxY, this.skyline[j].y);
      if (maxY + eh > this.binHeight + 0.001) return null;
      covered += this.skyline[j].width;
    }
    return maxY;
  }

  /** Update skyline after placing a rectangle at (x, y) with size ew×eh. */
  private addLevel(
    i: number,
    x: number,
    y: number,
    ew: number,
    eh: number,
  ): void {
    const newTop = y + eh;
    const rightEdge = x + ew;

    // Insert the new segment at position i.
    this.skyline.splice(i, 0, { x, y: newTop, width: ew });

    // Remove or trim every subsequent segment that falls under the new rect.
    let j = i + 1;
    while (j < this.skyline.length) {
      const node = this.skyline[j];
      if (node.x >= rightEdge - 0.001) break; // segment starts after the rect

      const overlapRight = Math.min(node.x + node.width, rightEdge);
      const remaining = node.x + node.width - overlapRight;

      if (remaining < 0.001) {
        // Fully consumed
        this.skyline.splice(j, 1);
      } else {
        // Partially consumed — trim its left side
        node.x = rightEdge;
        node.width = remaining;
        break;
      }
    }

    this.merge();
  }

  /** Merge adjacent segments that share the same height. */
  private merge(): void {
    for (let i = 0; i < this.skyline.length - 1; ) {
      if (Math.abs(this.skyline[i].y - this.skyline[i + 1].y) < 0.001) {
        this.skyline[i].width += this.skyline[i + 1].width;
        this.skyline.splice(i + 1, 1);
      } else {
        i++;
      }
    }
  }

  /**
   * Returns the actual bounding-box width of all placed cards (real widths,
   * no trailing spacing).  Used to compute alignment offsets.
   */
  contentWidth(): number {
    return this.placed.reduce((max, p) => Math.max(max, p.x + p.w), 0);
  }
}

// ─── Hook ───────────────────────────────────────────────────────────────────

export const useCardLayout = (
  cards: Card[],
  rectos: ImageFile[],
  margins: PageMargins,
  cardSpacing: number,
  dpi: number,
  alignment: CardAlignment = 'left',
): { layoutData: LayoutData; isCalculating: boolean } => {
  const [isCalculating, setIsCalculating] = useState(false);
  const [debouncedDpi, setDebouncedDpi] = useState(dpi);

  useEffect(() => {
    setIsCalculating(true);
    const timer = setTimeout(() => {
      setDebouncedDpi(dpi);
      setIsCalculating(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [dpi]);

  const layoutData = useMemo(() => {
    if (cards.length === 0) return { perPage: 0, layout: [] };

    const availableWidth = A4_WIDTH_MM - margins.left - margins.right;
    const availableHeight = A4_HEIGHT_MM - margins.top - margins.bottom;

    // ── Expand card instances according to quantity ──────────────────────
    const allInstances: Card[] = [];
    cards.forEach((card) => {
      for (let i = 0; i < card.quantity; i++) {
        allInstances.push(card);
      }
    });

    // ── Sort by decreasing height for better first-fit packing ───────────
    // Taller items are placed first so they anchor the left side of the page
    // and shorter items can fill the space beside them.
    const sorted = [...allInstances].sort((a, b) => {
      const ha = getCardSizeInMm(a.rectoId, rectos, debouncedDpi).height;
      const hb = getCardSizeInMm(b.rectoId, rectos, debouncedDpi).height;
      return hb - ha; // descending
    });

    // ── Pack into pages ──────────────────────────────────────────────────
    const pages: SkylinePacker[] = [];

    const newPage = () => {
      const p = new SkylinePacker(availableWidth, availableHeight, cardSpacing);
      pages.push(p);
      return p;
    };

    let currentPage = newPage();

    for (const card of sorted) {
      const { width, height } = getCardSizeInMm(
        card.rectoId,
        rectos,
        debouncedDpi,
      );

      if (width > availableWidth || height > availableHeight) {
        console.warn(
          `Card ${card.id} (${width.toFixed(1)}×${height.toFixed(1)} mm) ` +
            `exceeds the printable area and has been skipped.`,
        );
        continue;
      }

      // Effective dimensions include one inter-card gap on the right / bottom.
      const ew = width + cardSpacing;
      const eh = height + cardSpacing;

      // Try current page first; if it's full, open a new one.
      if (!currentPage.insert(card, width, height, ew, eh)) {
        currentPage = newPage();
        currentPage.insert(card, width, height, ew, eh);
      }
    }

    // ── Build the final layout with margin offsets & alignment ───────────
    //
    // Alignment is applied as a horizontal X offset per page, computed from
    // the page's actual content bounding-box width.
    //
    // For the verso (back) mirror the same layout logic used in LayoutTab:
    //   x_verso = A4_WIDTH_MM − margin.right − cardWidth − (x_recto − margin.left)
    // This hook only needs to store the recto positions; the verso mirroring
    // is handled in LayoutTab.renderPageLayout and exportToPDF — no change needed there.

    const layout: LayoutData['layout'] = [];

    pages.forEach((packer, pIdx) => {
      // Horizontal alignment offset
      let offsetX = 0;
      if (alignment !== 'left') {
        const cw = packer.contentWidth();
        if (alignment === 'center') {
          offsetX = (availableWidth - cw) / 2;
        } else {
          // right
          offsetX = availableWidth - cw;
        }
        offsetX = Math.max(0, offsetX);
      }

      packer.placed.forEach(({ card, x, y }) => {
        layout.push({
          // cards.find is safe: sorted contains only refs from allInstances
          card: cards.find((c) => c.id === card.id)!,
          x: margins.left + x + offsetX,
          y: margins.top + y,
          page: pIdx,
        });
      });
    });

    const perPage = pages[0]?.placed.length ?? 0;

    return { perPage, layout };
  }, [cards, rectos, margins, cardSpacing, debouncedDpi, alignment]);

  return { layoutData, isCalculating };
};
