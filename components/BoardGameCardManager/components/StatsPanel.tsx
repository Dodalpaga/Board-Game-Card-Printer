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
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Statistiques</h3>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Cartes / page</span>
          <span className="font-semibold text-gray-900">{perPage}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Total cartes</span>
          <span className="font-semibold text-gray-900">{totalCards}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Pages</span>
          <span className="font-semibold text-gray-900">{totalPages}</span>
        </div>
        <div className="flex justify-between items-center pt-2 border-t border-gray-200">
          <span className="text-gray-600">Feuilles A4</span>
          <span className="font-semibold text-gray-900">{totalPages * 2}</span>
        </div>
      </div>
    </div>
  );
};
