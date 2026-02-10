// hooks/useCardLayout.ts
import { useMemo, useState, useEffect } from 'react';
import { Card, ImageFile, PageMargins, LayoutData } from '@/utils/types';
import { A4_WIDTH_MM, A4_HEIGHT_MM } from '@/utils/constants';
import { getCardSizeInMm } from '@/utils/utils';

export type CardAlignment = 'left' | 'center' | 'right';

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

    // Expand all card instances (respecting quantity)
    const allInstances: Card[] = [];
    cards.forEach((card) => {
      for (let i = 0; i < card.quantity; i++) {
        allInstances.push(card);
      }
    });

    // ─── Shelf/row-based packing ────────────────────────────────────────────
    // A "shelf" is a horizontal row. Cards are placed left-to-right.
    // When a card doesn't fit on the current shelf, we start a new one.
    // When a shelf doesn't fit on the current page, we start a new page.
    //
    // Shelf structure: { cards: Card[], totalWidth, maxHeight }
    // After all shelves are built, we apply alignment to compute final X positions.

    type ShelfCard = { card: Card };
    type Shelf = { cards: ShelfCard[]; totalWidth: number; maxHeight: number };

    const pages: Shelf[][] = [[]]; // pages[i] = array of shelves on page i

    // Current page/shelf state
    let pageIndex = 0;
    let currentShelf: Shelf = { cards: [], totalWidth: 0, maxHeight: 0 };
    let currentShelfY = margins.top; // Y of current shelf top edge

    const startNewShelf = () => {
      // Commit the current shelf to the current page
      if (currentShelf.cards.length > 0) {
        pages[pageIndex].push(currentShelf);
        currentShelfY += currentShelf.maxHeight + cardSpacing;
      }
      currentShelf = { cards: [], totalWidth: 0, maxHeight: 0 };
    };

    const startNewPage = () => {
      startNewShelf(); // Flush current shelf
      pages.push([]);
      pageIndex++;
      currentShelfY = margins.top;
    };

    for (const card of allInstances) {
      const { width, height } = getCardSizeInMm(
        card.rectoId,
        rectos,
        debouncedDpi,
      );

      // Guard: if a single card is wider or taller than the available area, skip
      if (width > availableWidth || height > availableHeight) {
        console.warn(
          `Card ${card.id} (${width.toFixed(1)}×${height.toFixed(1)} mm) exceeds printable area.`,
        );
        continue;
      }

      // Width needed on this shelf (include inter-card spacing if not the first)
      const spacingBefore = currentShelf.cards.length > 0 ? cardSpacing : 0;
      const neededWidth = currentShelf.totalWidth + spacingBefore + width;

      // Does the card fit horizontally on the current shelf?
      if (neededWidth > availableWidth) {
        // Start a new shelf
        startNewShelf();

        // Does the new shelf fit vertically on the current page?
        if (currentShelfY + height > A4_HEIGHT_MM - margins.bottom) {
          startNewPage();
        }
      } else {
        // Check if current shelf height (after adding this card) still fits
        const newShelfHeight = Math.max(currentShelf.maxHeight, height);
        if (currentShelfY + newShelfHeight > A4_HEIGHT_MM - margins.bottom) {
          startNewShelf();
          if (currentShelfY + height > A4_HEIGHT_MM - margins.bottom) {
            startNewPage();
          }
        }
      }

      // Place card on current shelf
      const spacer = currentShelf.cards.length > 0 ? cardSpacing : 0;
      currentShelf.totalWidth += spacer + width;
      currentShelf.maxHeight = Math.max(currentShelf.maxHeight, height);
      currentShelf.cards.push({ card });
    }

    // Flush the last shelf
    if (currentShelf.cards.length > 0) {
      pages[pageIndex].push(currentShelf);
    }

    // ─── Compute final (x, y) positions with alignment ─────────────────────
    const layout: LayoutData['layout'] = [];

    pages.forEach((shelves, pIdx) => {
      let y = margins.top;

      shelves.forEach((shelf) => {
        // Compute starting X based on alignment
        let startX: number;
        if (alignment === 'left') {
          startX = margins.left;
        } else if (alignment === 'right') {
          startX = A4_WIDTH_MM - margins.right - shelf.totalWidth;
        } else {
          // center
          startX = margins.left + (availableWidth - shelf.totalWidth) / 2;
        }

        let x = startX;

        shelf.cards.forEach(({ card }, cardIdx) => {
          if (cardIdx > 0) x += cardSpacing;

          const cardMm = getCardSizeInMm(card.rectoId, rectos, debouncedDpi);

          layout.push({
            card: cards.find((c) => c.id === card.id)!,
            x,
            y,
            page: pIdx,
          });

          x += cardMm.width;
        });

        y += shelf.maxHeight + cardSpacing;
      });
    });

    const perPage = pages[0]
      ? pages[0].reduce((sum, shelf) => sum + shelf.cards.length, 0)
      : 0;

    return { perPage, layout };
  }, [cards, rectos, margins, cardSpacing, debouncedDpi, alignment]);

  return { layoutData, isCalculating };
};
