// page.tsx - Main Component
'use client';
import React, { useState } from 'react';
import { Download, Upload as UploadIcon } from 'lucide-react';

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
import { useCardLayout } from '@/hooks/useCardLayout';

// Import components
import { UploadTab } from '@/components/UploadTab';
import { AssociateTab } from '@/components/AssociateTab';
import { LayoutTab } from '@/components/LayoutTab';
import { Toast } from '@/components/Toast';

export default function BoardGameCardManager() {
  // State
  const [rectos, setRectos] = useState<ImageFile[]>([]);
  const [versos, setVersos] = useState<ImageFile[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('upload');
  const [margins, setMargins] = useState<PageMargins>(DEFAULT_MARGINS);
  const [cardSpacing, setCardSpacing] = useState<number>(DEFAULT_CARD_SPACING);
  const [scale, setScale] = useState<number>(DEFAULT_SCALE);
  const [dpi, setDpi] = useState<number>(DEFAULT_DPI);
  const [toasts, setToasts] = useState<string[]>([]);

  // Custom hook for layout calculation with loading state
  const { layoutData, isCalculating } = useCardLayout(
    cards,
    rectos,
    margins,
    cardSpacing,
    dpi,
  );

  // Toast notification
  const showToast = (message: string) => {
    setToasts((prev) => [...prev, message]);
    setTimeout(() => setToasts((prev) => prev.slice(1)), 4000);
  };

  // Delete image handler
  const deleteImage = (id: string, type: 'recto' | 'verso') => {
    if (type === 'recto') {
      setRectos((prev) => prev.filter((img) => img.id !== id));
      setCards((prev) => prev.filter((card) => card.rectoId !== id));
    } else {
      setVersos((prev) => prev.filter((img) => img.id !== id));
      setCards((prev) => prev.filter((card) => card.versoId !== id));
    }
  };

  // Export/Import handlers
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
      } catch (error) {
        showToast("❌ Erreur lors de l'import");
        console.error('Import error:', error);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const tabs = [
    { id: 'upload', label: 'Images', count: rectos.length + versos.length },
    { id: 'associate', label: 'Associations', count: cards.length },
    { id: 'layout', label: 'Impression', count: getTotalCards(cards) },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1920px] mx-auto">
        {/* Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  Gestionnaire de Cartes
                </h1>
                <p className="text-sm text-gray-600 mt-0.5">
                  Préparez vos cartes pour l&apos;impression
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={exportProject}
                  disabled={cards.length === 0}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Exporter
                </button>
                <label className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer">
                  <UploadIcon className="w-4 h-4" />
                  Importer
                  <input
                    type="file"
                    accept=".json"
                    onChange={importProject}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <nav className="flex px-6 -mb-px">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className="ml-2 px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </header>

        {/* Tab Content */}
        <main className="p-6">
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
            />
          )}
        </main>

        {/* Toast Notifications */}
        <Toast messages={toasts} />
      </div>
    </div>
  );
}
