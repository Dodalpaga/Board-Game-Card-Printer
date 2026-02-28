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

  const toggleSection = (section: keyof typeof expandedSections) =>
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));

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

  /* ─── A4 page renderer ─────────────────────────────────────────
     NOTE: the outer sheet div gets the class `paper-page` so that
     globals.css keeps it "paper-colored" in both dark and light themes
     (var(--c-paper)), while the rest of the UI adapts normally.
  ─────────────────────────────────────────────────────────────── */
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
        {/* Page label */}
        <div
          style={{
            position: 'absolute',
            top: -26,
            left: 0,
            background: 'var(--bg-elevated)',
            color: 'var(--text-secondary)',
            border: '1px solid var(--border-default)',
            padding: '3px 12px',
            borderRadius: '6px 6px 0 0',
            fontSize: 11,
            fontWeight: 600,
            fontFamily: 'var(--font-display)',
            letterSpacing: '0.03em',
          }}
        >
          Page {pageIndex + 1} — {type === 'recto' ? 'Recto' : 'Verso'}
        </div>

        {/* A4 sheet — paper-page class keeps it paper-colored regardless of theme */}
        <div
          className="paper-page relative"
          style={{
            width: `${pageWidth}px`,
            height: `${pageHeight}px`,
            border: '1px solid var(--c-paper-border)',
          }}
        >
          {/* Printable area guide */}
          <div
            className="absolute border border-dashed pointer-events-none"
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

  /* ── Collapsible section header ── */
  const SectionHeader = ({
    title,
    section,
  }: {
    title: string;
    section: keyof typeof expandedSections;
  }) => (
    <button
      onClick={() => toggleSection(section)}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: 'var(--text-primary)',
        fontFamily: 'var(--font-display)',
        fontSize: 13,
        fontWeight: 600,
        letterSpacing: '-0.01em',
        marginBottom: 10,
        padding: 0,
      }}
    >
      <span>{title}</span>
      {expandedSections[section] ? (
        <ChevronUp size={14} style={{ color: 'var(--text-muted)' }} />
      ) : (
        <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
      )}
    </button>
  );

  /* ── Shared panel style ── */
  const panel: React.CSSProperties = {
    background: 'var(--bg-card)',
    border: '1px solid var(--border-default)',
    borderRadius: 12,
    padding: 14,
    transition: 'background 0.25s ease, border-color 0.25s ease',
  };

  /* ── Shared label style ── */
  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 11,
    fontWeight: 600,
    color: 'var(--text-muted)',
    marginBottom: 5,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    fontFamily: 'var(--font-display)',
  };

  /* ── Shared input style ── */
  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '7px 10px',
    borderRadius: 7,
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border-strong)',
    color: 'var(--text-primary)',
    fontSize: 13,
    fontFamily: 'var(--font-body)',
    outline: 'none',
    transition: 'border-color 0.15s, box-shadow 0.15s',
  };

  /* ── Shared mini button ── */
  const miniBtn = (active = false): React.CSSProperties => ({
    flex: 1,
    padding: '7px 0',
    borderRadius: 7,
    background: 'var(--bg-elevated)',
    border: `1px solid ${active ? 'var(--accent-cyan)' : 'var(--border-default)'}`,
    color: active ? 'var(--accent-cyan)' : 'var(--text-secondary)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.15s ease',
    fontSize: 13,
  });

  const alignmentOptions: {
    value: CardAlignment;
    label: string;
    Icon: React.FC<{ size?: number }>;
  }[] = [
    { value: 'left', label: 'Gauche', Icon: AlignLeft },
    { value: 'center', label: 'Centre', Icon: AlignCenter },
    { value: 'right', label: 'Droite', Icon: AlignRight },
  ];

  return (
    <div
      style={{
        display: 'flex',
        height: 'calc(100vh - 280px)',
        minHeight: 700,
        gap: 20,
      }}
    >
      {/* ────────── Left sidebar ────────── */}
      <div
        style={{
          width: 288,
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          overflowY: 'auto',
        }}
      >
        {/* Export */}
        <button
          onClick={exportToPDF}
          disabled={isExporting || isCalculating}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            padding: '11px 16px',
            borderRadius: 10,
            background:
              'linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))',
            color: '#070b14',
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: 14,
            border: 'none',
            cursor: isExporting || isCalculating ? 'not-allowed' : 'pointer',
            opacity: isExporting || isCalculating ? 0.5 : 1,
            boxShadow: '0 0 16px rgba(0,212,255,0.25)',
            transition: 'all 0.2s ease',
          }}
        >
          <Printer size={16} />
          {isExporting ? 'Export en cours…' : 'Exporter en PDF'}
        </button>

        {/* Stats */}
        <div style={panel}>
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 12,
              fontWeight: 700,
              color: 'var(--text-muted)',
              letterSpacing: '0.07em',
              textTransform: 'uppercase',
              marginBottom: 10,
            }}
          >
            Statistiques
          </div>
          <div
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}
          >
            {[
              { label: 'Cartes/page', value: layoutData.perPage },
              { label: 'Total cartes', value: getTotalCards(cards) },
              { label: 'Pages', value: totalPages },
              { label: 'Feuilles A4', value: totalSheets, accent: true },
            ].map(({ label, value, accent }) => (
              <div
                key={label}
                style={{
                  background: 'var(--bg-elevated)',
                  borderRadius: 8,
                  padding: '8px 10px',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    color: 'var(--text-muted)',
                    marginBottom: 2,
                  }}
                >
                  {label}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 20,
                    fontWeight: 800,
                    color: accent
                      ? 'var(--accent-cyan)'
                      : 'var(--text-primary)',
                    letterSpacing: '-0.03em',
                  }}
                >
                  {value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alignment */}
        <div style={panel}>
          <SectionHeader title="Alignement (recto)" section="alignment" />
          {expandedSections.alignment && (
            <>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3,1fr)',
                  gap: 6,
                  marginBottom: 8,
                }}
              >
                {alignmentOptions.map(({ value, label, Icon }) => {
                  const isActive = alignment === value;
                  return (
                    <button
                      key={value}
                      onClick={() => setAlignment(value)}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 4,
                        padding: '8px 6px',
                        borderRadius: 8,
                        background: isActive
                          ? 'rgba(0,212,255,0.1)'
                          : 'var(--bg-elevated)',
                        border: `1px solid ${isActive ? 'var(--accent-cyan)' : 'var(--border-default)'}`,
                        color: isActive
                          ? 'var(--accent-cyan)'
                          : 'var(--text-secondary)',
                        cursor: 'pointer',
                        fontSize: 11,
                        fontWeight: 600,
                        fontFamily: 'var(--font-display)',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <Icon size={14} />
                      {label}
                    </button>
                  );
                })}
              </div>
              <p
                style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}
              >
                Le verso est automatiquement mis en miroir.
              </p>
            </>
          )}
        </div>

        {/* Zoom */}
        <div style={panel}>
          <SectionHeader title="Zoom" section="zoom" />
          {expandedSections.zoom && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  onClick={() => setScale(Math.max(0.1, scale + 0.1))}
                  style={miniBtn()}
                  title="Zoom out"
                >
                  <ZoomOut size={15} />
                </button>
                <button
                  onClick={() => setScale(Math.min(2, scale - 0.1))}
                  style={miniBtn()}
                  title="Zoom in"
                >
                  <ZoomIn size={15} />
                </button>
              </div>
              <button
                onClick={fitToContainer}
                style={{
                  ...miniBtn(),
                  fontSize: 12,
                  fontFamily: 'var(--font-display)',
                  fontWeight: 600,
                }}
              >
                Ajuster à la largeur
              </button>
            </div>
          )}
        </div>

        {/* DPI */}
        <div style={panel}>
          <SectionHeader title="Résolution" section="dpi" />
          {expandedSections.dpi && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
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
                  style={{ ...inputStyle, textAlign: 'center', flex: 1 }}
                  onFocus={(e) => {
                    (e.target as HTMLInputElement).style.borderColor =
                      'var(--accent-cyan)';
                    (e.target as HTMLInputElement).style.boxShadow =
                      '0 0 0 3px rgba(0,212,255,0.12)';
                  }}
                  onBlur={(e) => {
                    (e.target as HTMLInputElement).style.borderColor =
                      'var(--border-strong)';
                    (e.target as HTMLInputElement).style.boxShadow = 'none';
                  }}
                />
                <span
                  style={{
                    fontSize: 11,
                    color: 'var(--text-muted)',
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                  }}
                >
                  DPI
                </span>
              </div>
              <button
                onClick={() => setDpi(parseFloat(dpiInput) || 72)}
                disabled={isCalculating}
                style={{
                  ...miniBtn(),
                  fontSize: 12,
                  fontFamily: 'var(--font-display)',
                  fontWeight: 600,
                  opacity: isCalculating ? 0.5 : 1,
                  cursor: isCalculating ? 'not-allowed' : 'pointer',
                }}
              >
                {isCalculating ? 'Calcul…' : 'Appliquer'}
              </button>
              <p
                style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}
              >
                72 DPI = écran · 300 DPI = impression
              </p>
            </div>
          )}
        </div>

        {/* Margins & Spacing */}
        <div style={panel}>
          <SectionHeader title="Marges & Espacement" section="margins" />
          {expandedSections.margins && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {/* Uniform */}
              <div>
                <label style={labelStyle}>Marges uniformes (mm)</label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  placeholder="Ex: 5"
                  style={inputStyle}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    if (!isNaN(v) && v >= 0)
                      setMargins({ top: v, right: v, bottom: v, left: v });
                  }}
                  onFocus={(e) => {
                    (e.target as HTMLInputElement).style.borderColor =
                      'var(--accent-cyan)';
                    (e.target as HTMLInputElement).style.boxShadow =
                      '0 0 0 3px rgba(0,212,255,0.12)';
                  }}
                  onBlur={(e) => {
                    (e.target as HTMLInputElement).style.borderColor =
                      'var(--border-strong)';
                    (e.target as HTMLInputElement).style.boxShadow = 'none';
                  }}
                />
              </div>

              {/* Individual */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 8,
                }}
              >
                {(
                  [
                    ['top', 'Haut'],
                    ['right', 'Droite'],
                    ['bottom', 'Bas'],
                    ['left', 'Gauche'],
                  ] as [keyof PageMargins, string][]
                ).map(([key, label]) => (
                  <div key={key}>
                    <label style={labelStyle}>{label}</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={margins[key]}
                      onChange={(e) => {
                        const v = parseFloat(e.target.value);
                        setMargins((p) => ({
                          ...p,
                          [key]: Math.max(0, v || 0),
                        }));
                      }}
                      style={{ ...inputStyle, textAlign: 'center' }}
                      onFocus={(e) => {
                        (e.target as HTMLInputElement).style.borderColor =
                          'var(--accent-cyan)';
                        (e.target as HTMLInputElement).style.boxShadow =
                          '0 0 0 3px rgba(0,212,255,0.12)';
                      }}
                      onBlur={(e) => {
                        (e.target as HTMLInputElement).style.borderColor =
                          'var(--border-strong)';
                        (e.target as HTMLInputElement).style.boxShadow = 'none';
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* Card spacing */}
              <div
                style={{
                  paddingTop: 10,
                  borderTop: '1px solid var(--border-subtle)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    marginBottom: 8,
                  }}
                >
                  <label style={{ ...labelStyle, margin: 0 }}>
                    Espacement entre cartes
                  </label>
                  <span
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontWeight: 700,
                      fontSize: 13,
                      color: 'var(--accent-cyan)',
                    }}
                  >
                    {cardSpacing} mm
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.5"
                  value={cardSpacing}
                  onChange={(e) => setCardSpacing(parseFloat(e.target.value))}
                  style={{
                    width: '100%',
                    accentColor: 'var(--accent-cyan)' as string,
                  }}
                />
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: 10,
                    color: 'var(--text-muted)',
                    marginTop: 3,
                  }}
                >
                  <span>0 mm</span>
                  <span>10 mm</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ────────── Right preview panel ────────── */}
      <div
        ref={previewContainerRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: 14,
          transition: 'background 0.25s ease, border-color 0.25s ease',
        }}
      >
        {/* Sticky header */}
        <div
          style={{
            position: 'sticky',
            top: 0,
            background: 'var(--bg-card)',
            borderBottom: '1px solid var(--border-default)',
            zIndex: 10,
            padding: '16px 24px',
            transition: 'background 0.25s ease',
          }}
        >
          <h3
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 16,
              fontWeight: 700,
              color: 'var(--text-primary)',
              margin: 0,
            }}
          >
            Aperçu des pages A4
          </h3>
          <p
            style={{
              fontSize: 13,
              color: 'var(--text-muted)',
              margin: '4px 0 0',
              fontFamily: 'var(--font-body)',
            }}
          >
            {totalPages} page{totalPages > 1 ? 's' : ''} · {totalSheets} feuille
            {totalSheets > 1 ? 's' : ''}
            {isCalculating && (
              <span style={{ color: 'var(--accent-cyan)', marginLeft: 8 }}>
                · Calcul en cours…
              </span>
            )}
          </p>
        </div>

        <div style={{ padding: 32 }}>
          {isCalculating ? (
            <LoadingSpinner message="Calcul de la mise en page…" />
          ) : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 48,
              }}
            >
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
