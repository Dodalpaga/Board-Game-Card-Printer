// components/LayoutTab.tsx
import React, { useRef } from 'react';
import { Printer, AlertCircle } from 'lucide-react';
import jsPDF from 'jspdf';
import { ImageFile, Card, PageMargins, LayoutData } from '../types';
import { A4_WIDTH_MM, A4_HEIGHT_MM } from '../constants';
import { getCardSizeInMm, getTotalCards } from '../utils';
import { StatsPanel } from './StatsPanel';

interface LayoutTabProps {
  cards: Card[];
  rectos: ImageFile[];
  versos: ImageFile[];
  margins: PageMargins;
  setMargins: React.Dispatch<React.SetStateAction<PageMargins>>;
  cardSpacing: number;
  setCardSpacing: React.Dispatch<React.SetStateAction<number>>;
  scale: number;
  setScale: React.Dispatch<React.SetStateAction<number>>;
  layoutData: LayoutData;
  showToast: (message: string) => void;
}

export const LayoutTab: React.FC<LayoutTabProps> = ({
  cards,
  rectos,
  versos,
  margins,
  setMargins,
  cardSpacing,
  setCardSpacing,
  scale,
  setScale,
  layoutData,
  showToast,
}) => {
  const previewContainerRef = useRef<HTMLDivElement>(null);

  const getImage = (id: string, type: 'recto' | 'verso') =>
    type === 'recto'
      ? rectos.find((r) => r.id === id)
      : versos.find((v) => v.id === id);

  const calculatePages = () => {
    if (!layoutData || layoutData.layout.length === 0) return 0;
    return Math.max(...layoutData.layout.map((item) => item.page), 0) + 1;
  };

  const setUniformMargin = (value: number) =>
    setMargins({ top: value, right: value, bottom: value, left: value });

  const fitToContainer = () => {
    if (!previewContainerRef.current) return;
    const containerWidth = previewContainerRef.current.clientWidth - 64;
    const pageWidth = A4_WIDTH_MM;
    const newScale = Math.max(0.1, Math.min(2, pageWidth / containerWidth));
    setScale(parseFloat(newScale.toFixed(2)));
  };

  const exportToPDF = async () => {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const totalPages = calculatePages();
    let isFirstPage = true;

    for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
      const pageLayout = layoutData.layout.filter(
        (item) => item.page === pageIndex
      );

      // Recto page
      if (!isFirstPage) pdf.addPage();
      isFirstPage = false;

      for (const item of pageLayout) {
        const recto = getImage(item.card.rectoId, 'recto');
        if (recto) {
          const cardMm = getCardSizeInMm(item.card.rectoId, rectos);
          pdf.addImage(
            recto.url,
            'JPEG',
            item.x,
            item.y,
            cardMm.width,
            cardMm.height
          );
        }
      }

      // Verso page
      pdf.addPage();

      for (const item of pageLayout) {
        const verso = getImage(item.card.versoId, 'verso');
        if (verso) {
          const cardMm = getCardSizeInMm(item.card.rectoId, rectos);
          const x =
            A4_WIDTH_MM -
            margins.right -
            cardMm.width -
            (item.x - margins.left);
          pdf.addImage(
            verso.url,
            'JPEG',
            x,
            item.y,
            cardMm.width,
            cardMm.height
          );
        }
      }
    }

    pdf.save('cartes-impression.pdf');
    showToast('✅ PDF exporté avec succès !');
  };

  const renderPageLayout = (pageIndex: number, type: 'recto' | 'verso') => {
    const pageLayout = layoutData.layout.filter(
      (item) => item.page === pageIndex
    );
    const pageWidth = A4_WIDTH_MM / scale;
    const pageHeight = A4_HEIGHT_MM / scale;
    const scaledMargins = {
      top: margins.top / scale,
      left: margins.left / scale,
      right: margins.right / scale,
      bottom: margins.bottom / scale,
    };

    return (
      <div className="relative" style={{ marginTop: '32px' }}>
        <div className="absolute -top-8 left-0 bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-sm font-bold shadow-md">
          Page {pageIndex + 1} / {calculatePages()} -{' '}
          {type === 'recto' ? 'Recto' : 'Verso'}
        </div>

        <div
          className="bg-white shadow-2xl relative"
          style={{ width: `${pageWidth}px`, height: `${pageHeight}px` }}
        >
          <div className="absolute inset-0 border-4 border-gray-400 rounded-sm"></div>
          <div
            className="absolute border-2 border-red-500 border-dashed pointer-events-none"
            style={{
              top: `${scaledMargins.top}px`,
              left: `${scaledMargins.left}px`,
              right: `${scaledMargins.right}px`,
              bottom: `${scaledMargins.bottom}px`,
            }}
          />

          {pageLayout.map((item, idx) => {
            const { card } = item;
            const recto = getImage(card.rectoId, 'recto');
            if (!recto) return null;

            const cardMm = getCardSizeInMm(card.rectoId, rectos);
            const cardW = cardMm.width / scale;
            const cardH = cardMm.height / scale;

            const x =
              type === 'recto'
                ? item.x / scale
                : pageWidth -
                  scaledMargins.right -
                  cardW -
                  (item.x - margins.left) / scale;

            const y = item.y / scale;
            const image =
              type === 'recto' ? recto : getImage(card.versoId, 'verso');

            return (
              <div
                key={`${pageIndex}-${card.id}-${idx}`}
                className="absolute overflow-hidden border border-red-300"
                style={{
                  left: `${x}px`,
                  top: `${y}px`,
                  width: `${cardW}px`,
                  height: `${cardH}px`,
                }}
              >
                {image && (
                  <img
                    src={image.layoutPreviewUrl}
                    alt=""
                    className="w-full h-full object-cover"
                    style={{ imageRendering: 'pixelated' }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (cards.length === 0) {
    return (
      <div className="text-center py-20 text-gray-500">
        <AlertCircle className="w-24 h-24 mx-auto mb-6 text-gray-400" />
        <p className="text-lg">Créez d&apos;abord des cartes</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-indigo-900 flex items-center">
          <Printer className="w-8 h-8 mr-3" />
          Mise en page pour impression
        </h2>

        <button
          onClick={exportToPDF}
          className="flex items-center justify-center gap-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-5 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all font-bold text-xl shadow-2xl cursor-pointer"
        >
          <Printer className="w-8 h-8" />
          Exporter en PDF
        </button>
      </div>

      <div className="grid grid-cols-4 gap-8 h-[calc(100vh-400px)] min-h-[600px]">
        {/* Left Panel - Controls */}
        <div className="col-span-1 space-y-6 overflow-y-auto pr-4">
          {/* Zoom Controls */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl">
            <h3 className="text-lg font-bold text-indigo-900 mb-4">🔍 Zoom</h3>
            <div className="space-y-4">
              <div>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="2"
                  value={scale}
                  onChange={(e) => setScale(parseFloat(e.target.value) || 0.5)}
                  className="w-full px-3 py-2 border-2 border-purple-300 rounded-lg text-center font-semibold"
                />
                <input
                  type="range"
                  min="0.1"
                  max="2"
                  step="0.1"
                  value={scale}
                  onChange={(e) => setScale(parseFloat(e.target.value))}
                  className="w-full mt-3"
                />
              </div>
              <button
                onClick={fitToContainer}
                className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 transition-colors font-semibold"
              >
                Ajuster à la largeur
              </button>
            </div>
          </div>

          {/* Margin Controls */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl">
            <h3 className="text-lg font-bold text-indigo-900 mb-4">
              Marges A4 (mm)
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Uniforme
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="12.3"
                  onChange={(e) =>
                    setUniformMargin(parseFloat(e.target.value) || 12.3)
                  }
                  className="w-full px-3 py-2 border-2 border-indigo-300 rounded-lg text-center font-semibold"
                />
              </div>
              {['top', 'right', 'bottom', 'left'].map((side) => (
                <div key={side}>
                  <label className="block text-sm font-medium mb-2 capitalize">
                    {side}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={margins[side as keyof PageMargins]}
                    onChange={(e) =>
                      setMargins((p) => ({
                        ...p,
                        [side]: parseFloat(e.target.value) || 12.3,
                      }))
                    }
                    className="w-full px-3 py-2 border-2 border-indigo-300 rounded-lg text-center font-semibold"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Statistics Panel */}
          <StatsPanel
            perPage={layoutData.perPage}
            totalCards={getTotalCards(cards)}
            totalPages={calculatePages()}
            cardSpacing={cardSpacing}
            setCardSpacing={setCardSpacing}
          />
        </div>

        {/* Right Panel - Preview */}
        <div
          ref={previewContainerRef}
          className="col-span-3 overflow-y-auto bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl"
        >
          <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm z-10 px-8 py-6">
            <h3 className="text-xl font-bold text-indigo-900 text-center">
              Aperçu des pages A4
            </h3>
          </div>

          <div className="p-8">
            <div
              className="grid gap-8"
              style={{
                gridTemplateColumns: `repeat(auto-fit, minmax(${Math.max(
                  A4_WIDTH_MM / scale,
                  200
                )}px, 1fr))`,
                justifyItems: 'center',
              }}
            >
              {Array.from({ length: calculatePages() }, (_, i) => (
                <React.Fragment key={i}>
                  {renderPageLayout(i, 'recto')}
                  {renderPageLayout(i, 'verso')}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
