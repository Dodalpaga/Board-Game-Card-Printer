'use client';
import React, { useState } from 'react';
import { Download, Upload as UploadIcon, Layers, Bell } from 'lucide-react';

// Import types
import { ImageFile, Card, PageMargins, TabType } from '@/utils/types';

// Import constants
import {
  DEFAULT_MARGINS,
  DEFAULT_CARD_SPACING,
  DEFAULT_SCALE,
  DEFAULT_DPI,
} from '@/utils/constants';

// Import utils
import { getTotalCards } from '@/utils/utils';

// Import hooks
import { useCardLayout, CardAlignment } from '@/hooks/useCardLayout';

// Import components
import { UploadTab } from '@/components/UploadTab';
import { AssociateTab } from '@/components/AssociateTab';
import { LayoutTab } from '@/components/LayoutTab';
import { Toast } from '@/components/Toast';
import { Sidebar } from '@/components/Sidebar';

export default function BoardGameCardManager() {
  // State
  const [rectos, setRectos] = useState<ImageFile[]>([]);
  const [versos, setVersos] = useState<ImageFile[]>([]);
  const [alignment, setAlignment] = useState<CardAlignment>('left');
  const [cards, setCards] = useState<Card[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('upload');
  const [margins, setMargins] = useState<PageMargins>(DEFAULT_MARGINS);
  const [cardSpacing, setCardSpacing] = useState<number>(DEFAULT_CARD_SPACING);
  const [scale, setScale] = useState<number>(DEFAULT_SCALE);
  const [dpi, setDpi] = useState<number>(DEFAULT_DPI);
  const [toasts, setToasts] = useState<string[]>([]);

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
    const projectData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      rectos,
      versos,
      cards,
      margins,
      cardSpacing,
      dpi,
    };
    const dataStr = JSON.stringify(projectData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cartes-projet-${new Date().getTime()}.json`;
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
    reader.onload = (event) => {
      try {
        const jsonData = JSON.parse(event.target?.result as string);
        if (
          !jsonData.version ||
          !jsonData.rectos ||
          !jsonData.versos ||
          !jsonData.cards
        ) {
          showToast('❌ Fichier invalide');
          return;
        }
        setRectos(jsonData.rectos || []);
        setVersos(jsonData.versos || []);
        setCards(jsonData.cards || []);
        if (jsonData.margins) setMargins(jsonData.margins);
        if (jsonData.cardSpacing !== undefined)
          setCardSpacing(jsonData.cardSpacing);
        if (jsonData.dpi !== undefined) setDpi(jsonData.dpi);
        showToast('✅ Projet importé');
      } catch {
        showToast("❌ Erreur lors de l'import");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const tabLabels: Record<TabType, string> = {
    upload: 'Images',
    associate: 'Associations',
    layout: 'Impression',
  };

  const tabDescriptions: Record<TabType, string> = {
    upload: `Importez vos rectos et versos · ${rectos.length} recto${rectos.length !== 1 ? 's' : ''}, ${versos.length} verso${versos.length !== 1 ? 's' : ''}`,
    associate: `Associez les faces de vos cartes · ${cards.length} carte${cards.length !== 1 ? 's' : ''} créée${cards.length !== 1 ? 's' : ''}`,
    layout: `Configurez et exportez votre PDF · ${getTotalCards(cards)} carte${getTotalCards(cards) !== 1 ? 's' : ''} au total`,
  };

  return (
    <div style={{ display: 'flex', width: '100%', minHeight: '100vh' }}>
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab as TabType)}
        counts={{
          images: rectos.length + versos.length,
          cards: cards.length,
          totalCards: getTotalCards(cards),
        }}
      />

      {/* Main content */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          overflow: 'hidden',
        }}
      >
        {/* Top header bar */}
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
          }}
        >
          {/* Page title */}
          <div>
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 18,
                fontWeight: 700,
                color: 'var(--text-primary)',
                letterSpacing: '-0.02em',
                margin: 0,
              }}
            >
              {tabLabels[activeTab]}
            </h1>
            <p
              style={{
                fontSize: 12,
                color: 'var(--text-muted)',
                margin: 0,
                marginTop: 2,
              }}
            >
              {tabDescriptions[activeTab]}
            </p>
          </div>

          {/* Header actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={exportProject}
              disabled={cards.length === 0}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 7,
                padding: '7px 14px',
                borderRadius: 8,
                background: 'var(--bg-card)',
                border: '1px solid var(--border-default)',
                color:
                  cards.length === 0
                    ? 'var(--text-muted)'
                    : 'var(--text-secondary)',
                fontSize: 13,
                fontWeight: 500,
                cursor: cards.length === 0 ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s ease',
                fontFamily: 'var(--font-body)',
              }}
              onMouseEnter={(e) => {
                if (cards.length > 0) {
                  (e.currentTarget as HTMLElement).style.borderColor =
                    'var(--border-strong)';
                  (e.currentTarget as HTMLElement).style.color =
                    'var(--text-primary)';
                }
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor =
                  'var(--border-default)';
                (e.currentTarget as HTMLElement).style.color =
                  cards.length === 0
                    ? 'var(--text-muted)'
                    : 'var(--text-secondary)';
              }}
            >
              <Download size={14} />
              Exporter
            </button>

            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 7,
                padding: '7px 14px',
                borderRadius: 8,
                background: 'var(--bg-card)',
                border: '1px solid var(--border-default)',
                color: 'var(--text-secondary)',
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor =
                  'var(--border-strong)';
                (e.currentTarget as HTMLElement).style.color =
                  'var(--text-primary)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor =
                  'var(--border-default)';
                (e.currentTarget as HTMLElement).style.color =
                  'var(--text-secondary)';
              }}
            >
              <UploadIcon size={14} />
              Importer
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
