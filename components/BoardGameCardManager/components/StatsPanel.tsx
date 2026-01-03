// components/StatsPanel.tsx
import React from 'react';

interface StatsPanelProps {
  perPage: number;
  totalCards: number;
  totalPages: number;
  cardSpacing: number;
  setCardSpacing: React.Dispatch<React.SetStateAction<number>>;
}

export const StatsPanel: React.FC<StatsPanelProps> = ({
  perPage,
  totalCards,
  totalPages,
  cardSpacing,
  setCardSpacing,
}) => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-inner border border-indigo-200">
      <h3 className="text-lg font-bold text-indigo-900 mb-4">Statistiques</h3>
      <div className="space-y-4">
        <div className="text-center p-4 bg-indigo-50 rounded-lg">
          <p className="text-xs text-gray-600 mb-1">Cartes par page</p>
          <p className="text-2xl font-bold text-indigo-600">{perPage}</p>
        </div>
        <div className="text-center p-4 bg-emerald-50 rounded-lg">
          <p className="text-xs text-gray-600 mb-1">Total cartes</p>
          <p className="text-2xl font-bold text-emerald-600">{totalCards}</p>
        </div>
        <div className="text-center p-4 bg-purple-50 rounded-lg">
          <p className="text-xs text-gray-600 mb-1">Pages nécessaires</p>
          <p className="text-2xl font-bold text-purple-600">{totalPages}</p>
          <p className="text-xs text-gray-500">
            ({totalPages * 2} feuilles A4)
          </p>
        </div>
        <div className="text-center p-4 bg-amber-50 rounded-lg">
          <p className="text-xs text-gray-600 mb-1">Espacement</p>
          <p className="text-2xl font-bold text-amber-600">{cardSpacing} mm</p>
          <input
            type="range"
            min="0"
            max="10"
            step="0.5"
            value={cardSpacing}
            onChange={(e) => setCardSpacing(parseFloat(e.target.value))}
            className="w-full mt-3"
          />
        </div>
      </div>
    </div>
  );
};
