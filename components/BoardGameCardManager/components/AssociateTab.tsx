// components/AssociateTab.tsx
import React, { useState } from 'react';
import { ImagePlus, AlertCircle, Copy, Trash2 } from 'lucide-react';
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
  const [selectedRectoForNewCard, setSelectedRectoForNewCard] = useState<
    string[]
  >([]);
  const [selectedVersoForNewCard, setSelectedVersoForNewCard] =
    useState<string>('');

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
      showToast(
        '⚠️ Les dimensions du recto et du verso doivent être identiques !'
      );
      return;
    }

    setCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, versoId: newVersoId } : c))
    );
  };

  const updateQuantity = (cardId: string, quantity: number) => {
    if (quantity < 1) quantity = 1;
    setCards((prev) =>
      prev.map((card) => (card.id === cardId ? { ...card, quantity } : card))
    );
  };

  const deleteCard = (cardId: string) =>
    setCards((prev) => prev.filter((card) => card.id !== cardId));

  const duplicateCard = (cardId: string) => {
    const card = cards.find((c) => c.id === cardId);
    if (!card) return;
    const newCard: Card = {
      id: generateId('card'),
      rectoId: card.rectoId,
      versoId: card.versoId,
      quantity: card.quantity,
    };
    setCards((prev) => [...prev, newCard]);
  };

  const createCards = () => {
    if (selectedRectoForNewCard.length === 0 || !selectedVersoForNewCard) {
      showToast('⚠️ Veuillez sélectionner au moins un recto et un verso');
      return;
    }

    const verso = versos.find((v) => v.id === selectedVersoForNewCard);
    if (!verso) return;

    selectedRectoForNewCard.forEach((rectoId) => {
      const recto = rectos.find((r) => r.id === rectoId);
      if (!recto) return;

      if (recto.width !== verso.width || recto.height !== verso.height) {
        showToast(`⚠️ Dimensions incompatibles avec ${recto.name}`);
        return;
      }

      const existingCard = cards.find(
        (c) => c.rectoId === rectoId && c.versoId === selectedVersoForNewCard
      );
      if (existingCard) {
        updateQuantity(existingCard.id, existingCard.quantity + 1);
      } else {
        const newCard: Card = {
          id: generateId('card'),
          rectoId,
          versoId: selectedVersoForNewCard,
          quantity: 1,
        };
        setCards((prev) => [...prev, newCard]);
      }
    });

    setSelectedRectoForNewCard([]);
    setSelectedVersoForNewCard('');
    showToast(`✅ ${selectedRectoForNewCard.length} carte(s) créée(s) !`);
  };

  if (rectos.length === 0 || versos.length === 0) {
    return (
      <div className="text-center py-20 text-gray-500">
        <ImagePlus className="w-24 h-24 mx-auto mb-6 text-gray-400" />
        <p className="text-lg">Veuillez uploader des images recto et verso</p>
      </div>
    );
  }

  const unusedRectos = getUnusedRectos(rectos, cards);

  return (
    <div>
      <h2 className="text-2xl font-bold text-indigo-900 mb-8">
        Association Recto ↔ Verso
      </h2>

      <div className="space-y-10">
        {/* Create New Cards Section */}
        <div className="bg-gradient-to-r from-indigo-100 to-purple-100 p-8 rounded-3xl">
          <h3 className="text-xl font-bold text-indigo-900 mb-6">
            Créer de nouvelles cartes
          </h3>

          {unusedRectos.length === 0 ? (
            <div className="text-center py-12 text-gray-600">
              <AlertCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p>Tous les rectos sont déjà associés à une carte.</p>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 gap-8">
                {/* Select Rectos */}
                <div>
                  <label className="block font-medium mb-4 text-lg">
                    1. Sélectionner un ou plusieurs Rectos (non associés)
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 max-h-96 overflow-y-auto p-4 bg-white rounded-xl border-2 border-indigo-200">
                    {unusedRectos.map((recto) => (
                      <div key={recto.id} className="flex flex-col">
                        <button
                          onClick={() =>
                            setSelectedRectoForNewCard((prev) => {
                              if (prev.includes(recto.id)) {
                                return prev.filter((id) => id !== recto.id);
                              }
                              return [...prev, recto.id];
                            })
                          }
                          className={`relative rounded-xl overflow-hidden border-4 transition-all ${
                            selectedRectoForNewCard.includes(recto.id)
                              ? 'border-indigo-600 ring-4 ring-indigo-300 scale-105 shadow-lg'
                              : 'border-gray-300 hover:border-indigo-400'
                          }`}
                        >
                          <img
                            src={recto.previewUrl}
                            alt={recto.name}
                            className="w-full aspect-[2.5/3.5] object-cover"
                          />
                          {selectedRectoForNewCard.includes(recto.id) && (
                            <div className="absolute inset-0 bg-indigo-500 bg-opacity-30 flex items-center justify-center">
                              <div className="bg-white text-indigo-700 rounded-full w-8 h-8 flex items-center justify-center font-bold text-xl">
                                ✓
                              </div>
                            </div>
                          )}
                        </button>
                        <p className="text-xs text-gray-600 text-center mt-1 font-medium">
                          {recto.width} × {recto.height}
                        </p>
                      </div>
                    ))}
                  </div>
                  <p className="mt-3 text-sm text-gray-600 text-center">
                    {selectedRectoForNewCard.length} recto(s) sélectionné(s)
                  </p>
                </div>

                {/* Select Verso */}
                <div>
                  <label className="block font-medium mb-4 text-lg">
                    2. Choisir un Verso commun
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                    {versos.map((verso) => (
                      <div key={verso.id} className="flex flex-col">
                        <button
                          onClick={() => setSelectedVersoForNewCard(verso.id)}
                          className={`relative rounded-xl overflow-hidden border-4 transition-all ${
                            selectedVersoForNewCard === verso.id
                              ? 'border-purple-600 ring-4 ring-purple-300 scale-105'
                              : 'border-gray-300 hover:border-purple-400'
                          }`}
                        >
                          <img
                            src={verso.previewUrl}
                            alt={verso.name}
                            className="w-full aspect-[2.5/3.5] object-cover"
                          />
                        </button>
                        <p className="text-xs text-gray-600 text-center mt-1 font-medium">
                          {verso.width} × {verso.height}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-8 text-center">
                <button
                  onClick={createCards}
                  disabled={
                    selectedRectoForNewCard.length === 0 ||
                    !selectedVersoForNewCard
                  }
                  className="px-10 py-4 text-xl font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Créer{' '}
                  {selectedRectoForNewCard.length > 0
                    ? selectedRectoForNewCard.length
                    : ''}{' '}
                  carte(s)
                </button>
              </div>
            </>
          )}
        </div>

        {/* Existing Cards Section */}
        <div>
          <h3 className="text-xl font-bold text-indigo-900 mb-6">
            Cartes créées ({cards.length})
          </h3>
          <div className="space-y-6">
            {cards.map((card) => {
              const recto = getImage(card.rectoId, 'recto');
              return (
                <div
                  key={card.id}
                  className="bg-gray-50 p-6 rounded-3xl border-2 border-indigo-100 flex flex-col sm:flex-row gap-8 items-start"
                >
                  <div className="text-center">
                    <p className="font-bold mb-3">Recto</p>
                    <div className="w-32 aspect-[2.5/3.5] rounded-xl overflow-hidden border-4 border-indigo-500 shadow-md">
                      <img
                        src={recto?.previewUrl}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="text-xs text-gray-600 mt-2">
                      {recto?.width} × {recto?.height}
                    </p>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold mb-3">Verso</p>
                    <div className="flex gap-3 flex-wrap">
                      {versos.map((v) => (
                        <div key={v.id} className="flex flex-col">
                          <button
                            onClick={() => changeVerso(card.id, v.id)}
                            className={`relative ${
                              card.versoId === v.id
                                ? 'ring-4 ring-purple-600'
                                : 'opacity-60'
                            }`}
                          >
                            <div className="w-24 aspect-[2.5/3.5] rounded-xl overflow-hidden border-4 border-purple-400">
                              <img
                                src={v.previewUrl}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            </div>
                            {card.versoId === v.id && (
                              <div className="absolute -top-2 -right-2 bg-purple-600 text-white rounded-full w-7 h-7 flex items-center justify-center text-lg">
                                ✓
                              </div>
                            )}
                          </button>
                          <p className="text-xs text-gray-600 text-center mt-1">
                            {v.width} × {v.height}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-4 items-center">
                    <div className="bg-white px-4 py-3 rounded-xl shadow">
                      <label className="block text-sm text-gray-600 mb-1">
                        Quantité
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={card.quantity}
                        onChange={(e) =>
                          updateQuantity(card.id, parseInt(e.target.value) || 1)
                        }
                        className="w-20 px-3 py-2 border-2 border-indigo-300 rounded-lg text-center font-bold text-lg"
                      />
                    </div>
                    <button
                      onClick={() => duplicateCard(card.id)}
                      className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-lg"
                    >
                      <Copy className="w-6 h-6" />
                    </button>
                    <button
                      onClick={() => deleteCard(card.id)}
                      className="p-3 bg-red-600 text-white rounded-xl hover:bg-red-700 shadow-lg"
                    >
                      <Trash2 className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
