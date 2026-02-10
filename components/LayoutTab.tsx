// components/LayoutTab.tsx
'use client';
import React, { useRef, useState } from 'react';
import {
  Printer,
  AlertCircle,
  ZoomIn,
  ZoomOut,
  ChevronDown,
  ChevronUp,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from 'lucide-react';
import jsPDF from 'jspdf';
import { ImageFile, Card, PageMargins, LayoutData } from '@/utils/types';
import { CardAlignment } from '@/hooks/useCardLayout';
import { A4_WIDTH_MM, A4_HEIGHT_MM } from '@/utils/constants';
import { getCardSizeInMm, getTotalCards } from '@/utils/utils';
import { LoadingSpinner } from '@/components/LoadingSpinner';

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
  isCalculating: boolean;
  alignment: CardAlignment;
  setAlignment: React.Dispatch<React.SetStateAction<CardAlignment>>;
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
  isCalculating,
  alignment,
  setAlignment,
  showToast,
}) => {
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const [dpiInput, setDpiInput] = React.useState(dpi.toString());
  const [isExporting, setIsExporting] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    zoom: true,
    dpi: true,
    margins: true,
    alignment: true,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

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
    const newScale = Math.max(0.1, Math.min(2, A4_WIDTH_MM / containerWidth));
    setScale(parseFloat(newScale.toFixed(2)));
  };

  const exportToPDF = async () => {
    setIsExporting(true);
    try {
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
              recto.fullUrl,
              'JPEG',
              item.x,
              item.y,
              cardMm.width,
              cardMm.height,
            );
          }
        }

        // Verso page (horizontally mirrored for duplex)
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
              verso.fullUrl,
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
    } catch (error) {
      console.error('PDF export error:', error);
      showToast("❌ Erreur lors de l'export PDF");
    } finally {
      setIsExporting(false);
    }
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
          {/* Printable area guide */}
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

            // Verso pages are horizontally mirrored for duplex alignment
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
                    src={image.previewUrl}
                    alt=""
                    className="w-full h-full object-cover"
                    loading="lazy"
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

  const SectionHeader = ({
    title,
    section,
  }: {
    title: string;
    section: keyof typeof expandedSections;
  }) => (
    <button
      onClick={() => toggleSection(section)}
      className="flex items-center justify-between w-full text-sm font-semibold text-gray-900 mb-2 hover:text-gray-700"
    >
      <span>{title}</span>
      {expandedSections[section] ? (
        <ChevronUp className="w-4 h-4" />
      ) : (
        <ChevronDown className="w-4 h-4" />
      )}
    </button>
  );

  const alignmentOptions: {
    value: CardAlignment;
    label: string;
    Icon: React.FC<{ className?: string }>;
  }[] = [
    { value: 'left', label: 'Gauche', Icon: AlignLeft },
    { value: 'center', label: 'Centre', Icon: AlignCenter },
    { value: 'right', label: 'Droite', Icon: AlignRight },
  ];

  return (
    <div className="flex h-[calc(100vh-280px)] min-h-[700px] gap-6">
      {/* Left Sidebar - Controls */}
      <div className="w-80 flex-shrink-0 space-y-4">
        {/* Export Button */}
        <button
          onClick={exportToPDF}
          disabled={isExporting || isCalculating}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Printer className="w-5 h-5" />
          {isExporting ? 'Export en cours...' : 'Exporter en PDF'}
        </button>

        {/* Statistics */}
        <div className="bg-white border border-gray-200 rounded-lg p-3">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">
            Statistiques
          </h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="block text-xs text-gray-600">Cartes/page</span>
              <span className="block font-semibold text-gray-900">
                {layoutData.perPage}
              </span>
            </div>
            <div>
              <span className="block text-xs text-gray-600">Total cartes</span>
              <span className="block font-semibold text-gray-900">
                {getTotalCards(cards)}
              </span>
            </div>
            <div>
              <span className="block text-xs text-gray-600">Pages</span>
              <span className="block font-semibold text-gray-900">
                {totalPages}
              </span>
            </div>
            <div>
              <span className="block text-xs text-gray-600">Feuilles A4</span>
              <span className="block font-semibold text-indigo-600">
                {totalSheets}
              </span>
            </div>
          </div>
        </div>

        {/* Collapsible Sections */}
        <div className="space-y-3">
          {/* Alignment */}
          <div className="bg-white border border-gray-200 rounded-lg p-3">
            <SectionHeader title="Alignement (recto)" section="alignment" />
            {expandedSections.alignment && (
              <div className="space-y-2">
                <div className="grid grid-cols-3 gap-1">
                  {alignmentOptions.map(({ value, label, Icon }) => (
                    <button
                      key={value}
                      onClick={() => setAlignment(value)}
                      className={`flex flex-col items-center gap-1 px-2 py-2 rounded-lg border text-xs font-medium transition-all ${
                        alignment === value
                          ? 'bg-indigo-50 border-indigo-500 text-indigo-700 ring-1 ring-indigo-500'
                          : 'border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {label}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500">
                  Le verso est automatiquement mis en miroir.
                </p>
              </div>
            )}
          </div>

          {/* Zoom Controls */}
          <div className="bg-white border border-gray-200 rounded-lg p-3">
            <SectionHeader title="Zoom" section="zoom" />
            {expandedSections.zoom && (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setScale(Math.max(0.1, scale + 0.1))}
                    className="p-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors flex items-center justify-center"
                  >
                    <ZoomOut className="w-4 h-4 text-gray-700" />
                  </button>
                  <button
                    onClick={() => setScale(Math.min(2, scale - 0.1))}
                    className="p-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors flex items-center justify-center"
                  >
                    <ZoomIn className="w-4 h-4 text-gray-700" />
                  </button>
                </div>
                <button
                  onClick={fitToContainer}
                  className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded hover:bg-gray-50 transition-colors font-medium text-gray-700"
                >
                  Ajuster à la largeur
                </button>
              </div>
            )}
          </div>

          {/* DPI Settings */}
          <div className="bg-white border border-gray-200 rounded-lg p-3">
            <SectionHeader title="Résolution" section="dpi" />
            {expandedSections.dpi && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="1"
                    min="50"
                    max="600"
                    value={dpiInput}
                    onChange={(e) => setDpiInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') setDpi(parseFloat(dpiInput) || 72);
                    }}
                    className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-center text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="text-xs text-gray-600 font-medium">
                    DPI (pp/cm)
                  </span>
                </div>
                <button
                  onClick={() => setDpi(parseFloat(dpiInput) || 72)}
                  disabled={isCalculating}
                  className="w-full px-3 py-1.5 text-xs bg-gray-100 border border-gray-300 rounded hover:bg-gray-200 transition-colors font-medium text-gray-900 disabled:opacity-50"
                >
                  {isCalculating ? 'Calcul...' : 'Appliquer'}
                </button>
                <p className="text-xs text-gray-500">
                  72 DPI = écran • 300 DPI = impression
                </p>
              </div>
            )}
          </div>

          {/* Margins & Spacing */}
          <div className="bg-white border border-gray-200 rounded-lg p-3">
            <SectionHeader title="Marges & Espacement" section="margins" />
            {expandedSections.margins && (
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
                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs text-center text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  ))}
                </div>

                {/* Card Spacing */}
                <div className="pt-2 border-t border-gray-200">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Espacement entre cartes :{' '}
                    <span className="font-semibold text-gray-900">
                      {cardSpacing} mm
                    </span>
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
                  <div className="flex justify-between text-xs text-gray-400 mt-0.5">
                    <span>0 mm</span>
                    <span>10 mm</span>
                  </div>
                </div>
              </div>
            )}
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
            {isCalculating && (
              <span className="text-indigo-600 ml-2">• Calcul en cours...</span>
            )}
          </p>
        </div>

        <div className="p-8">
          {isCalculating ? (
            <LoadingSpinner message="Calcul de la mise en page..." />
          ) : (
            <div className="flex flex-col items-center gap-12">
              {Array.from({ length: calculatePages() }, (_, i) => (
                <React.Fragment key={i}>
                  {renderPageLayout(i, 'recto')}
                  {renderPageLayout(i, 'verso')}
                </React.Fragment>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
