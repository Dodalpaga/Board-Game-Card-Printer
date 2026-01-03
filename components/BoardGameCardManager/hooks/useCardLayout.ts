// hooks/useCardLayout.ts
import { useMemo } from 'react';
import { Card, ImageFile, PageMargins, LayoutData } from '../types';
import { A4_WIDTH_MM, A4_HEIGHT_MM } from '../constants';
import { getCardSizeInMm } from '../utils';

export const useCardLayout = (
  cards: Card[],
  rectos: ImageFile[],
  margins: PageMargins,
  cardSpacing: number
): LayoutData => {
  return useMemo(() => {
    if (cards.length === 0) return { perPage: 0, layout: [] };

    const availableWidth = A4_WIDTH_MM - margins.left - margins.right;
    const availableHeight = A4_HEIGHT_MM - margins.top - margins.bottom;

    const allCardInstances: { card: Card; instanceId: string }[] = [];
    cards.forEach((card) => {
      for (let i = 0; i < card.quantity; i++) {
        allCardInstances.push({ card, instanceId: `${card.id}-${i}` });
      }
    });

    allCardInstances.sort((a, b) => {
      const sizeA = getCardSizeInMm(a.card.rectoId, rectos);
      const sizeB = getCardSizeInMm(b.card.rectoId, rectos);
      return sizeB.height - sizeA.height;
    });

    const pages: { card: Card; x: number; y: number }[][] = [[]];
    let currentPageIndex = 0;

    const placeCard = (
      card: Card,
      pageCards: { card: Card; x: number; y: number }[]
    ): boolean => {
      const { width, height } = getCardSizeInMm(card.rectoId, rectos);

      for (
        let rowY = margins.top;
        rowY <= availableHeight + height;
        rowY += 1
      ) {
        for (
          let colX = margins.left;
          colX <= availableWidth + width;
          colX += 1
        ) {
          const fits = !pageCards.some((placed) => {
            const pSize = getCardSizeInMm(placed.card.rectoId, rectos);
            return !(
              colX + width + cardSpacing <= placed.x ||
              colX - cardSpacing >= placed.x + pSize.width ||
              rowY + height + cardSpacing <= placed.y ||
              rowY - cardSpacing >= placed.y + pSize.height
            );
          });

          if (
            fits &&
            colX + width <= A4_WIDTH_MM - margins.right &&
            rowY + height <= A4_HEIGHT_MM - margins.bottom
          ) {
            pageCards.push({ card, x: colX, y: rowY });
            return true;
          }
        }
      }
      return false;
    };

    allCardInstances.forEach(({ card }) => {
      let placed = false;
      for (let i = currentPageIndex; i < pages.length; i++) {
        if (placeCard(card, pages[i])) {
          placed = true;
          if (i > currentPageIndex) currentPageIndex = i;
          break;
        }
      }
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
      })
    );

    return { perPage, layout };
  }, [cards, rectos, margins, cardSpacing]);
};
