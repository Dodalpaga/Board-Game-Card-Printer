// components/AssociateTab.tsx
import React, { useState } from 'react';
import { Plus, Trash2, AlertCircle } from 'lucide-react';
import { ImageFile, Card } from '../types';
import { getUnusedRectos, generateId } from '../utils';

interface AssociateTabProps {
  rectos: ImageFile[];
  versos: ImageFile[];
  cards: Card[];
  setCards: React.Dispatch<React.SetStateAction<Card[]>>;
  showToast: (message: string) => void;
}

export const AssociateTab: React.FC<AssociateTabProps> = ({
  rectos,
  versos,
  cards,
  setCards,
  showToast,
}) => {
  const [selectedRectos, setSelectedRectos] = useState<string[]>([]);
  const [selectedVerso, setSelectedVerso] = useState<string>('');

  const getImage = (id: string, type: 'recto' | 'verso') =>
    type === 'recto'
      ? rectos.find((r) => r.id === id)
      : versos.find((v) => v.id === id);

  const changeVerso = (cardId: string, newVersoId: string) => {
    const card = cards.find((c) => c.id === cardId);
    if (!card) return;
    const recto = rectos.find((r) => r.id === card.rectoId);
    const verso = versos.find((v) => v.id === newVersoId);
    if (!recto || !verso) return;

    if (recto.width !== verso.width || recto.height !== verso.height) {
      showToast('⚠️ Les dimensions doivent être identiques');
      return;
    }

    setCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, versoId: newVersoId } : c)),
    );
  };

  const updateQuantity = (cardId: string, quantity: number) => {
    if (quantity < 1) quantity = 1;
    setCards((prev) =>
      prev.map((card) => (card.id === cardId ? { ...card, quantity } : card)),
    );
  };

  const deleteCard = (cardId: string) =>
    setCards((prev) => prev.filter((card) => card.id !== cardId));

  const createCards = () => {
    if (selectedRectos.length === 0 || !selectedVerso) {
      showToast('⚠️ Sélectionnez au moins un recto et un verso');
      return;
    }

    const verso = versos.find((v) => v.id === selectedVerso);
    if (!verso) return;

    let created = 0;
    selectedRectos.forEach((rectoId) => {
      const recto = rectos.find((r) => r.id === rectoId);
      if (!recto) return;

      if (recto.width !== verso.width || recto.height !== verso.height) {
        showToast(`⚠️ Dimensions incompatibles : ${recto.name}`);
        return;
      }

      const existingCard = cards.find(
        (c) => c.rectoId === rectoId && c.versoId === selectedVerso,
      );
      if (existingCard) {
        updateQuantity(existingCard.id, existingCard.quantity + 1);
      } else {
        const newCard: Card = {
          id: generateId('card'),
          rectoId,
          versoId: selectedVerso,
          quantity: 1,
        };
        setCards((prev) => [...prev, newCard]);
        created++;
      }
    });

    setSelectedRectos([]);
    setSelectedVerso('');
    if (created > 0) {
      showToast(
        `✅ ${created} carte${created > 1 ? 's' : ''} créée${created > 1 ? 's' : ''}`,
      );
    }
  };

  if (rectos.length === 0 || versos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <AlertCircle className="w-16 h-16 mb-4 text-gray-400" />
        <p className="text-lg font-medium text-gray-900">
          Ajoutez d'abord des images
        </p>
        <p className="text-sm text-gray-600 mt-1">
          Uploadez des rectos et des versos pour créer des cartes
        </p>
      </div>
    );
  }

  const unusedRectos = getUnusedRectos(rectos, cards);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Create New Cards */}
      {unusedRectos.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            Créer de nouvelles cartes
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Select Rectos */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-3">
                1. Sélectionner les rectos
              </label>
              <div className="grid grid-cols-4 gap-2 max-h-96 overflow-y-auto p-3 bg-gray-50 rounded-lg border border-gray-200">
                {unusedRectos.map((recto) => (
                  <button
                    key={recto.id}
                    onClick={() =>
                      setSelectedRectos((prev) =>
                        prev.includes(recto.id)
                          ? prev.filter((id) => id !== recto.id)
                          : [...prev, recto.id],
                      )
                    }
                    className={`relative rounded-lg overflow-hidden border-2 transition-all ${
                      selectedRectos.includes(recto.id)
                        ? 'border-gray-900 ring-2 ring-gray-900 ring-offset-2'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <img
                      src={recto.previewUrl}
                      alt={recto.name}
                      className="w-full aspect-[2.5/3.5] object-cover"
                    />
                    {selectedRectos.includes(recto.id) && (
                      <div className="absolute inset-0 bg-gray-900 bg-opacity-20 flex items-center justify-center">
                        <div className="bg-white rounded-full w-6 h-6 flex items-center justify-center">
                          <span className="text-gray-900 text-sm font-bold">
                            ✓
                          </span>
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
              {selectedRectos.length > 0 && (
                <p className="mt-2 text-sm text-gray-600">
                  {selectedRectos.length} recto
                  {selectedRectos.length > 1 ? 's' : ''} sélectionné
                  {selectedRectos.length > 1 ? 's' : ''}
                </p>
              )}
            </div>

            {/* Select Verso */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-3">
                2. Choisir un verso commun
              </label>
              <div className="grid grid-cols-4 gap-2">
                {versos.map((verso) => (
                  <button
                    key={verso.id}
                    onClick={() => setSelectedVerso(verso.id)}
                    className={`relative rounded-lg overflow-hidden border-2 transition-all ${
                      selectedVerso === verso.id
                        ? 'border-gray-900 ring-2 ring-gray-900 ring-offset-2'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <img
                      src={verso.previewUrl}
                      alt={verso.name}
                      className="w-full aspect-[2.5/3.5] object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={createCards}
              disabled={selectedRectos.length === 0 || !selectedVerso}
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Plus className="w-4 h-4" />
              Créer {selectedRectos.length > 0
                ? selectedRectos.length
                : ''}{' '}
              carte{selectedRectos.length > 1 ? 's' : ''}
            </button>
          </div>
        </div>
      )}

      {/* Existing Cards */}
      {cards.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Cartes créées ({cards.length})
          </h2>
          <div className="space-y-3">
            {cards.map((card) => {
              const recto = getImage(card.rectoId, 'recto');
              const currentVerso = getImage(card.versoId, 'verso');
              return (
                <div
                  key={card.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 flex items-center gap-6"
                >
                  {/* Recto */}
                  <div className="flex-shrink-0">
                    <p className="text-xs font-medium text-gray-600 mb-2">
                      Recto
                    </p>
                    <div className="w-20 aspect-[2.5/3.5] rounded overflow-hidden border border-gray-300">
                      <img
                        src={recto?.previewUrl}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  {/* Verso Selection */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-600 mb-2">
                      Verso
                    </p>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {versos.map((v) => (
                        <button
                          key={v.id}
                          onClick={() => changeVerso(card.id, v.id)}
                          className={`flex-shrink-0 w-16 aspect-[2.5/3.5] rounded overflow-hidden border-2 transition-all ${
                            card.versoId === v.id
                              ? 'border-gray-900 ring-2 ring-gray-900 ring-offset-1'
                              : 'border-gray-300 opacity-50 hover:opacity-100 hover:border-gray-400'
                          }`}
                        >
                          <img
                            src={v.previewUrl}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quantity */}
                  <div className="flex-shrink-0">
                    <label className="block text-xs font-medium text-gray-600 mb-2">
                      Quantité
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={card.quantity}
                      onChange={(e) =>
                        updateQuantity(card.id, parseInt(e.target.value) || 1)
                      }
                      className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    />
                  </div>

                  {/* Delete */}
                  <button
                    onClick={() => deleteCard(card.id)}
                    className="flex-shrink-0 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {cards.length === 0 && unusedRectos.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
          <AlertCircle className="w-16 h-16 mb-4 text-gray-400" />
          <p className="text-lg font-medium text-gray-900">
            Tous les rectos sont associés
          </p>
        </div>
      )}
    </div>
  );
};
