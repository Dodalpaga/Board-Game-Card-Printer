// components/LayoutTab.tsx
import React, { useRef } from 'react';
import { Printer, AlertCircle, ZoomIn, ZoomOut } from 'lucide-react';
import jsPDF from 'jspdf';
import { ImageFile, Card, PageMargins, LayoutData } from '../types';
import { A4_WIDTH_MM, A4_HEIGHT_MM } from '../constants';
import { getCardSizeInMm, getTotalCards } from '../utils';

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
  dpi: number;
  setDpi: React.Dispatch<React.SetStateAction<number>>;
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
  dpi,
  setDpi,
  layoutData,
  showToast,
}) => {
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const [dpiInput, setDpiInput] = React.useState(dpi.toString());

  const getImage = (id: string, type: 'recto' | 'verso') =>
    type === 'recto'
      ? rectos.find((r) => r.id === id)
      : versos.find((v) => v.id === id);

  const calculatePages = () => {
    if (!layoutData || layoutData.layout.length === 0) return 0;
    return Math.max(...layoutData.layout.map((item) => item.page), 0) + 1;
  };

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
        (item) => item.page === pageIndex,
      );

      // Recto page
      if (!isFirstPage) pdf.addPage();
      isFirstPage = false;

      for (const item of pageLayout) {
        const recto = getImage(item.card.rectoId, 'recto');
        if (recto) {
          const cardMm = getCardSizeInMm(item.card.rectoId, rectos, dpi);
          pdf.addImage(
            recto.url,
            'JPEG',
            item.x,
            item.y,
            cardMm.width,
            cardMm.height,
          );
        }
      }

      // Verso page
      pdf.addPage();

      for (const item of pageLayout) {
        const verso = getImage(item.card.versoId, 'verso');
        if (verso) {
          const cardMm = getCardSizeInMm(item.card.rectoId, rectos, dpi);
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
            cardMm.height,
          );
        }
      }
    }

    pdf.save('cartes-impression.pdf');
    showToast('✅ PDF exporté avec succès !');
  };

  const renderPageLayout = (pageIndex: number, type: 'recto' | 'verso') => {
    const pageLayout = layoutData.layout.filter(
      (item) => item.page === pageIndex,
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
      <div className="relative mb-8">
        <div className="absolute -top-6 left-0 bg-gray-900 text-white px-3 py-1 rounded text-xs font-medium">
          Page {pageIndex + 1} — {type === 'recto' ? 'Recto' : 'Verso'}
        </div>

        <div
          className="bg-white shadow-lg relative border border-gray-200"
          style={{ width: `${pageWidth}px`, height: `${pageHeight}px` }}
        >
          <div
            className="absolute border border-dashed border-gray-400 pointer-events-none"
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

            const cardMm = getCardSizeInMm(card.rectoId, rectos, dpi);
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
                className="absolute overflow-hidden border border-gray-300"
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
                    style={{ imageRendering: 'auto' }}
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

  const totalPages = calculatePages();
  const totalSheets = totalPages * 2;

  return (
    <div className="flex h-[calc(100vh-280px)] min-h-[700px] gap-6">
      {/* Left Sidebar - Controls */}
      <div className="w-72 flex-shrink-0 overflow-y-auto space-y-4">
        {/* Export Button */}
        <button
          onClick={exportToPDF}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-sm"
        >
          <Printer className="w-5 h-5" />
          Exporter en PDF
        </button>

        {/* Statistics */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            Statistiques
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Cartes / page</span>
              <span className="font-semibold text-gray-900">
                {layoutData.perPage}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total cartes</span>
              <span className="font-semibold text-gray-900">
                {getTotalCards(cards)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Pages</span>
              <span className="font-semibold text-gray-900">{totalPages}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-gray-200">
              <span className="text-gray-600">Feuilles A4</span>
              <span className="font-semibold text-indigo-600">
                {totalSheets}
              </span>
            </div>
          </div>
        </div>

        {/* Zoom Controls */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Zoom</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setScale(Math.max(0.1, scale - 0.1))}
                className="p-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              >
                <ZoomOut className="w-4 h-4 text-gray-700" />
              </button>
              <input
                type="number"
                step="0.1"
                min="0.1"
                max="2"
                value={scale}
                onChange={(e) => setScale(parseFloat(e.target.value) || 0.5)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded text-center font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <button
                onClick={() => setScale(Math.min(2, scale + 0.1))}
                className="p-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              >
                <ZoomIn className="w-4 h-4 text-gray-700" />
              </button>
            </div>
            <input
              type="range"
              min="0.1"
              max="2"
              step="0.1"
              value={scale}
              onChange={(e) => setScale(parseFloat(e.target.value))}
              className="w-full"
            />
            <button
              onClick={fitToContainer}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors font-medium text-gray-700"
            >
              Ajuster à la largeur
            </button>
          </div>
        </div>

        {/* DPI Settings */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            Résolution
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="1"
                min="50"
                max="600"
                value={dpiInput}
                onChange={(e) => setDpiInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setDpi(parseFloat(dpiInput) || 72);
                  }
                }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded text-center font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <span className="text-sm text-gray-600 font-medium">DPI</span>
            </div>
            <button
              onClick={() => setDpi(parseFloat(dpiInput) || 72)}
              className="w-full px-3 py-2 text-sm bg-gray-100 border border-gray-300 rounded hover:bg-gray-200 transition-colors font-medium text-gray-900"
            >
              Appliquer
            </button>
            <p className="text-xs text-gray-500">
              72 DPI = écran • 300 DPI = impression
            </p>
          </div>
        </div>

        {/* Margins & Spacing */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            Marges & Espacement
          </h3>
          <div className="space-y-3">
            {/* Uniform Margin */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Marges uniformes (mm)
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                placeholder="Ex: 5"
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  if (!isNaN(value) && value >= 0) {
                    setMargins({
                      top: value,
                      right: value,
                      bottom: value,
                      left: value,
                    });
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Individual Margins */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: 'top', label: 'Haut' },
                { key: 'right', label: 'Droite' },
                { key: 'bottom', label: 'Bas' },
                { key: 'left', label: 'Gauche' },
              ].map(({ key, label }) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    {label}
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={margins[key as keyof PageMargins]}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value);
                      setMargins((p) => ({
                        ...p,
                        [key]: Math.max(0, value || 0),
                      }));
                    }}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm text-center text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              ))}
            </div>

            {/* Card Spacing */}
            <div className="pt-3 border-t border-gray-200">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Espacement entre cartes: {cardSpacing} mm
              </label>
              <input
                type="range"
                min="0"
                max="10"
                step="0.5"
                value={cardSpacing}
                onChange={(e) => setCardSpacing(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Preview */}
      <div
        ref={previewContainerRef}
        className="flex-1 overflow-y-auto bg-gray-50 border border-gray-200 rounded-lg"
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 z-10 px-6 py-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Aperçu des pages A4
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {totalPages} page{totalPages > 1 ? 's' : ''} • {totalSheets} feuille
            {totalSheets > 1 ? 's' : ''}
          </p>
        </div>

        <div className="p-8">
          <div className="flex flex-col items-center gap-12">
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
  );
};
