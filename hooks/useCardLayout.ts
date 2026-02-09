// hooks/useCardLayout.ts
import { useMemo, useState, useEffect } from 'react';
import { Card, ImageFile, PageMargins, LayoutData } from '@/utils/types';
import { A4_WIDTH_MM, A4_HEIGHT_MM } from '@/utils/constants';
import { getCardSizeInMm } from '@/utils/utils';

export const useCardLayout = (
  cards: Card[],
  rectos: ImageFile[],
  margins: PageMargins,
  cardSpacing: number,
  dpi: number,
): { layoutData: LayoutData; isCalculating: boolean } => {
  const [isCalculating, setIsCalculating] = useState(false);
  const [debouncedDpi, setDebouncedDpi] = useState(dpi);

  // Debounce DPI changes to avoid expensive recalculations
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

    // Create all card instances
    const allCardInstances: { card: Card; instanceId: string }[] = [];
    cards.forEach((card) => {
      for (let i = 0; i < card.quantity; i++) {
        allCardInstances.push({ card, instanceId: `${card.id}-${i}` });
      }
    });

    // Sort by height for better packing (tallest first)
    allCardInstances.sort((a, b) => {
      const sizeA = getCardSizeInMm(a.card.rectoId, rectos, debouncedDpi);
      const sizeB = getCardSizeInMm(b.card.rectoId, rectos, debouncedDpi);
      return sizeB.height - sizeA.height;
    });

    const pages: { card: Card; x: number; y: number }[][] = [[]];
    let currentPageIndex = 0;

    // Optimized card placement algorithm
    const placeCard = (
      card: Card,
      pageCards: { card: Card; x: number; y: number }[],
    ): boolean => {
      const { width, height } = getCardSizeInMm(
        card.rectoId,
        rectos,
        debouncedDpi,
      );

      // Try to place card with optimized grid search
      const stepSize = 5; // mm - coarser grid for performance

      for (
        let rowY = margins.top;
        rowY + height <= A4_HEIGHT_MM - margins.bottom;
        rowY += stepSize
      ) {
        for (
          let colX = margins.left;
          colX + width <= A4_WIDTH_MM - margins.right;
          colX += stepSize
        ) {
          // Check collision with existing cards
          const hasCollision = pageCards.some((placed) => {
            const pSize = getCardSizeInMm(
              placed.card.rectoId,
              rectos,
              debouncedDpi,
            );
            return !(
              colX + width + cardSpacing <= placed.x ||
              colX - cardSpacing >= placed.x + pSize.width ||
              rowY + height + cardSpacing <= placed.y ||
              rowY - cardSpacing >= placed.y + pSize.height
            );
          });

          if (!hasCollision) {
            pageCards.push({ card, x: colX, y: rowY });
            return true;
          }
        }
      }
      return false;
    };

    // Place all cards
    allCardInstances.forEach(({ card }) => {
      let placed = false;

      // Try current and existing pages first
      for (let i = currentPageIndex; i < pages.length; i++) {
        if (placeCard(card, pages[i])) {
          placed = true;
          if (i > currentPageIndex) currentPageIndex = i;
          break;
        }
      }

      // Create new page if needed
      if (!placed) {
        pages.push([]);
        placeCard(card, pages[pages.length - 1]);
        currentPageIndex = pages.length - 1;
      }
    });

    const perPage = pages[0]?.length || 0;
    const layout = pages.flatMap((page, pageIndex) =>
      page.map((placed) => {
        const card = cards.find((c) => c.id === placed.card.id)!;
        return {
          card,
          quantity: card.quantity,
          x: placed.x,
          y: placed.y,
          page: pageIndex,
        };
      }),
    );

    return { perPage, layout };
  }, [cards, rectos, margins, cardSpacing, debouncedDpi]);

  return { layoutData, isCalculating };
};
