// index.tsx - Main Component (simplified structure)
'use client';
import React, { useState } from 'react';
import { Download, FolderOpen } from 'lucide-react';

// Import types
import { ImageFile, Card, PageMargins, TabType } from './types';

// Import constants
import {
  DEFAULT_MARGINS,
  DEFAULT_CARD_SPACING,
  DEFAULT_SCALE,
} from './constants';

// Import utils
import { getTotalCards } from './utils';

// Import hooks
import { useCardLayout } from './hooks/useCardLayout';

// Import components
import { UploadTab } from './components/UploadTab';
import { AssociateTab } from './components/AssociateTab';
import { LayoutTab } from './components/LayoutTab';
import { Toast } from './components/Toast';

export default function BoardGameCardManager() {
  // State
  const [rectos, setRectos] = useState<ImageFile[]>([]);
  const [versos, setVersos] = useState<ImageFile[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('upload');
  const [margins, setMargins] = useState<PageMargins>(DEFAULT_MARGINS);
  const [cardSpacing, setCardSpacing] = useState<number>(DEFAULT_CARD_SPACING);
  const [scale, setScale] = useState<number>(DEFAULT_SCALE);
  const [toasts, setToasts] = useState<string[]>([]);

  // Custom hook for layout calculation
  const layoutData = useCardLayout(cards, rectos, margins, cardSpacing);

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
    showToast('✅ Projet exporté avec succès !');
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
          showToast('❌ Fichier invalide ou corrompu');
          return;
        }

        setRectos(jsonData.rectos || []);
        setVersos(jsonData.versos || []);
        setCards(jsonData.cards || []);
        if (jsonData.margins) setMargins(jsonData.margins);
        if (jsonData.cardSpacing !== undefined)
          setCardSpacing(jsonData.cardSpacing);

        showToast('✅ Projet importé avec succès !');
      } catch (error) {
        showToast("❌ Erreur lors de l'import du fichier");
        console.error('Import error:', error);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-indigo-100">
          <h1 className="text-3xl sm:text-5xl font-bold text-indigo-900 mb-3">
            🎲 Gestionnaire de Cartes
          </h1>
          <p className="text-indigo-600 mb-6">
            Créez et préparez vos cartes pour impression
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-indigo-100 rounded-lg px-4 py-3 text-center">
              <div className="text-2xl font-bold text-indigo-800">
                {rectos.length}
              </div>
              <div className="text-indigo-600 text-sm">Rectos</div>
            </div>
            <div className="bg-purple-100 rounded-lg px-4 py-3 text-center">
              <div className="text-2xl font-bold text-purple-800">
                {versos.length}
              </div>
              <div className="text-purple-600 text-sm">Versos</div>
            </div>
            <div className="bg-emerald-100 rounded-lg px-4 py-3 text-center">
              <div className="text-2xl font-bold text-emerald-800">
                {cards.length}
              </div>
              <div className="text-emerald-600 text-sm">Associations</div>
            </div>
            <div className="bg-amber-100 rounded-lg px-4 py-3 text-center">
              <div className="text-2xl font-bold text-amber-800">
                {getTotalCards(cards)}
              </div>
              <div className="text-amber-600 text-sm">Total</div>
            </div>
          </div>

          {/* Export/Import Buttons */}
          <div className="mt-6 flex gap-4">
            <button
              onClick={exportProject}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold shadow-lg"
            >
              <Download className="w-5 h-5" />
              Exporter le projet
            </button>
            <label className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all font-semibold shadow-lg cursor-pointer">
              <FolderOpen className="w-5 h-5" />
              Importer un projet
              <input
                type="file"
                accept=".json"
                onChange={importProject}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-xl mb-8 overflow-hidden">
          <div className="flex border-b border-indigo-100">
            {[
              { id: 'upload', label: '📤 Upload' },
              { id: 'associate', label: '🔗 Association' },
              { id: 'layout', label: '🖨️ Impression' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex-1 py-4 px-6 font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'text-indigo-600 border-b-4 border-indigo-600 bg-indigo-50'
                    : 'text-gray-600 hover:text-indigo-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-indigo-100">
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
              layoutData={layoutData}
              showToast={showToast}
            />
          )}
        </div>

        {/* Toast Notifications */}
        <Toast messages={toasts} />
      </div>
    </div>
  );
}
