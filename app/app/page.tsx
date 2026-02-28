'use client';
import React, { useRef, useEffect } from 'react';
import { Download, Upload as UploadIcon } from 'lucide-react';

import { ImageFile, Card, PageMargins, TabType } from '@/utils/types';
import {
  DEFAULT_MARGINS,
  DEFAULT_CARD_SPACING,
  DEFAULT_SCALE,
  DEFAULT_DPI,
} from '@/utils/constants';
import { getTotalCards } from '@/utils/utils';
import { useCardLayout, CardAlignment } from '@/hooks/useCardLayout';
import { useTheme, LIGHT_VARS } from '@/hooks/useTheme';

import { UploadTab } from '@/components/UploadTab';
import { AssociateTab } from '@/components/AssociateTab';
import { LayoutTab } from '@/components/LayoutTab';
import { Toast } from '@/components/Toast';
import { Sidebar } from '@/components/Sidebar';

export default function BoardGameCardManager() {
  const [rectos, setRectos] = React.useState<ImageFile[]>([]);
  const [versos, setVersos] = React.useState<ImageFile[]>([]);
  const [alignment, setAlignment] = React.useState<CardAlignment>('left');
  const [cards, setCards] = React.useState<Card[]>([]);
  const [activeTab, setActiveTab] = React.useState<TabType>('upload');
  const [margins, setMargins] = React.useState<PageMargins>(DEFAULT_MARGINS);
  const [cardSpacing, setCardSpacing] =
    React.useState<number>(DEFAULT_CARD_SPACING);
  const [scale, setScale] = React.useState<number>(DEFAULT_SCALE);
  const [dpi, setDpi] = React.useState<number>(DEFAULT_DPI);
  const [toasts, setToasts] = React.useState<string[]>([]);

  const { theme, toggle: toggleTheme } = useTheme();

  /* ─────────────────────────────────────────────────────────────────
     THE KEY FIX:
     We apply CSS custom properties DIRECTLY on the wrapper element
     using style.setProperty(). This is 100% reliable:
       - No CSS cascade gaps (parent layout, body, html stay unaffected)
       - No specificity battles
       - The variables cascade to ALL descendants automatically
       - Removing them reverts to :root dark defaults instantly
  ───────────────────────────────────────────────────────────────── */
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    if (theme === 'light') {
      Object.entries(LIGHT_VARS).forEach(([prop, val]) =>
        el.style.setProperty(prop, val),
      );
    } else {
      // Remove overrides → fall back to :root dark defaults
      Object.keys(LIGHT_VARS).forEach((prop) => el.style.removeProperty(prop));
    }
  }, [theme]);

  const { layoutData, isCalculating } = useCardLayout(
    cards,
    rectos,
    margins,
    cardSpacing,
    dpi,
    alignment,
  );

  const showToast = (message: string) => {
    setToasts((prev) => [...prev, message]);
    setTimeout(() => setToasts((prev) => prev.slice(1)), 4000);
  };

  const deleteImage = (id: string, type: 'recto' | 'verso') => {
    if (type === 'recto') {
      setRectos((prev) => prev.filter((img) => img.id !== id));
      setCards((prev) => prev.filter((card) => card.rectoId !== id));
    } else {
      setVersos((prev) => prev.filter((img) => img.id !== id));
      setCards((prev) => prev.filter((card) => card.versoId !== id));
    }
  };

  const exportProject = () => {
    const data = JSON.stringify(
      {
        version: '1.0',
        exportDate: new Date().toISOString(),
        rectos,
        versos,
        cards,
        margins,
        cardSpacing,
        dpi,
      },
      null,
      2,
    );
    const url = URL.createObjectURL(
      new Blob([data], { type: 'application/json' }),
    );
    const link = Object.assign(document.createElement('a'), {
      href: url,
      download: `cartes-projet-${Date.now()}.json`,
    });
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('✅ Projet exporté');
  };

  const importProject = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const d = JSON.parse(ev.target?.result as string);
        if (!d.version || !d.rectos || !d.versos || !d.cards) {
          showToast('❌ Fichier invalide');
          return;
        }
        setRectos(d.rectos);
        setVersos(d.versos);
        setCards(d.cards);
        if (d.margins) setMargins(d.margins);
        if (d.cardSpacing != null) setCardSpacing(d.cardSpacing);
        if (d.dpi != null) setDpi(d.dpi);
        showToast('✅ Projet importé');
      } catch {
        showToast("❌ Erreur lors de l'import");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const TAB_LABELS: Record<TabType, string> = {
    upload: 'Images',
    associate: 'Associations',
    layout: 'Impression',
  };
  const TAB_DESC: Record<TabType, string> = {
    upload: `${rectos.length} recto${rectos.length !== 1 ? 's' : ''} · ${versos.length} verso${versos.length !== 1 ? 's' : ''}`,
    associate: `${cards.length} carte${cards.length !== 1 ? 's' : ''} créée${cards.length !== 1 ? 's' : ''}`,
    layout: `${getTotalCards(cards)} carte${getTotalCards(cards) !== 1 ? 's' : ''} au total`,
  };

  return (
    <div
      ref={wrapperRef}
      className="app-content"
      style={{
        display: 'flex',
        width: '100%',
        minHeight: '100vh',
        background: 'var(--bg-base)',
        fontFamily: 'var(--font-body)',
        /* smooth transition when vars are swapped */
        transition: 'background 0.3s ease',
      }}
    >
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab as TabType)}
        counts={{
          images: rectos.length + versos.length,
          cards: cards.length,
          totalCards: getTotalCards(cards),
        }}
        theme={theme}
        onThemeToggle={toggleTheme}
      />

      {/* Main column */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          overflow: 'hidden',
        }}
      >
        {/* Header bar */}
        <header
          style={{
            background: 'var(--bg-surface)',
            borderBottom: '1px solid var(--border-default)',
            padding: '0 28px',
            height: 68,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
            transition: 'background 0.3s ease, border-color 0.3s ease',
          }}
        >
          <div>
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 18,
                fontWeight: 700,
                color: 'var(--text-primary)',
                letterSpacing: '-0.02em',
                margin: 0,
                transition: 'color 0.3s ease',
              }}
            >
              {TAB_LABELS[activeTab]}
            </h1>
            <p
              style={{
                fontSize: 12,
                color: 'var(--text-muted)',
                margin: 0,
                marginTop: 2,
                fontFamily: 'var(--font-body)',
                transition: 'color 0.3s ease',
              }}
            >
              {TAB_DESC[activeTab]}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <HeaderBtn
              onClick={exportProject}
              disabled={cards.length === 0}
              icon={<Download size={13} />}
              label="Exporter"
            />
            <label style={{ cursor: 'pointer' }}>
              <HeaderBtn
                as="span"
                icon={<UploadIcon size={13} />}
                label="Importer"
              />
              <input
                type="file"
                accept=".json"
                onChange={importProject}
                style={{ display: 'none' }}
              />
            </label>
          </div>
        </header>

        {/* Tab content */}
        <main
          style={{
            flex: 1,
            padding: '24px 28px',
            overflowY: 'auto',
            overflowX: 'hidden',
            background: 'var(--bg-base)',
            transition: 'background 0.3s ease',
          }}
        >
          {activeTab === 'upload' && (
            <UploadTab
              rectos={rectos}
              versos={versos}
              setRectos={setRectos}
              setVersos={setVersos}
              deleteImage={deleteImage}
            />
          )}
          {activeTab === 'associate' && (
            <AssociateTab
              rectos={rectos}
              versos={versos}
              cards={cards}
              setCards={setCards}
              showToast={showToast}
            />
          )}
          {activeTab === 'layout' && (
            <LayoutTab
              cards={cards}
              rectos={rectos}
              versos={versos}
              margins={margins}
              setMargins={setMargins}
              cardSpacing={cardSpacing}
              setCardSpacing={setCardSpacing}
              scale={scale}
              setScale={setScale}
              dpi={dpi}
              setDpi={setDpi}
              layoutData={layoutData}
              isCalculating={isCalculating}
              showToast={showToast}
              alignment={alignment}
              setAlignment={setAlignment}
            />
          )}
        </main>
      </div>

      <Toast messages={toasts} />
    </div>
  );
}

/* ── Small reusable header action button ── */
function HeaderBtn({
  onClick,
  disabled,
  icon,
  label,
  as: Tag = 'button',
}: {
  onClick?: () => void;
  disabled?: boolean;
  icon: React.ReactNode;
  label: string;
  as?: 'button' | 'span';
}) {
  return (
    <Tag
      {...(Tag === 'button' ? { onClick, disabled } : {})}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '7px 14px',
        borderRadius: 8,
        background: 'var(--bg-card)',
        border: '1px solid var(--border-default)',
        color: disabled ? 'var(--text-muted)' : 'var(--text-secondary)',
        fontSize: 13,
        fontWeight: 500,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'all 0.15s ease',
        fontFamily: 'var(--font-body)',
        userSelect: 'none',
        whiteSpace: 'nowrap',
      }}
      onMouseEnter={(e) => {
        if (disabled) return;
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = 'var(--border-strong)';
        el.style.color = 'var(--text-primary)';
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = 'var(--border-default)';
        el.style.color = disabled
          ? 'var(--text-muted)'
          : 'var(--text-secondary)';
      }}
    >
      {icon}
      {label}
    </Tag>
  );
}
