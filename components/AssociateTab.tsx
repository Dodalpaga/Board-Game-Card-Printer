// components/AssociateTab.tsx
import React, { useState } from 'react';
import { Plus, Trash2, AlertCircle, Info } from 'lucide-react';
import { ImageFile, Card } from '@/utils/types';
import { getUnusedRectos, generateId } from '@/utils/utils';
import { SelectableImageCard } from '@/components/SelectableImageCard';

interface AssociateTabProps {
  rectos: ImageFile[];
  versos: ImageFile[];
  cards: Card[];
  setCards: React.Dispatch<React.SetStateAction<Card[]>>;
  showToast: (message: string) => void;
}

// Lazy-loaded image component for verso selection
const LazyImage: React.FC<{ src: string; alt: string; className?: string }> =
  React.memo(({ src, alt, className }) => {
    const [isLoaded, setIsLoaded] = useState(false);

    return (
      <>
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-indigo-600 rounded-full animate-spin" />
          </div>
        )}
        <img
          src={src}
          alt={alt}
          className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200`}
          onLoad={() => setIsLoaded(true)}
          loading="lazy"
        />
      </>
    );
  });

LazyImage.displayName = 'LazyImage';

export const AssociateTab: React.FC<AssociateTabProps> = ({
  rectos,
  versos,
  cards,
  setCards,
  showToast,
}) => {
  const [selectedRectos, setSelectedRectos] = useState<string[]>([]);
  const [selectedVerso, setSelectedVerso] = useState<string>('');
  const [lastClickedIndex, setLastClickedIndex] = useState<number | null>(null);
  const unusedRectos = getUnusedRectos(rectos, cards);

  const getImage = (id: string, type: 'recto' | 'verso') =>
    type === 'recto'
      ? rectos.find((r) => r.id === id)
      : versos.find((v) => v.id === id);

  // Handle recto selection with shift-click support
  const handleRectoClick = (
    rectoId: string,
    index: number,
    e: React.MouseEvent,
  ) => {
    e.preventDefault();

    if (e.shiftKey && lastClickedIndex !== null) {
      // Shift-click: Select range
      const start = Math.min(lastClickedIndex, index);
      const end = Math.max(lastClickedIndex, index);
      const rangeIds = unusedRectos.slice(start, end + 1).map((r) => r.id);

      // Add range to selection (union)
      setSelectedRectos((prev) => {
        const newSelection = new Set([...prev, ...rangeIds]);
        return Array.from(newSelection);
      });
    } else if (e.ctrlKey || e.metaKey) {
      // Ctrl/Cmd-click: Toggle individual while keeping others
      setSelectedRectos((prev) =>
        prev.includes(rectoId)
          ? prev.filter((id) => id !== rectoId)
          : [...prev, rectoId],
      );
      setLastClickedIndex(index);
    } else {
      // Normal click: Toggle individual
      setSelectedRectos((prev) =>
        prev.includes(rectoId)
          ? prev.filter((id) => id !== rectoId)
          : [...prev, rectoId],
      );
      setLastClickedIndex(index);
    }
  };

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
    let incompatible = 0;

    selectedRectos.forEach((rectoId) => {
      const recto = rectos.find((r) => r.id === rectoId);
      if (!recto) return;

      if (recto.width !== verso.width || recto.height !== verso.height) {
        incompatible++;
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
    setLastClickedIndex(null);

    if (created > 0) {
      showToast(
        `✅ ${created} carte${created > 1 ? 's' : ''} créée${created > 1 ? 's' : ''}`,
      );
    }
    if (incompatible > 0) {
      showToast(
        `⚠️ ${incompatible} image${incompatible > 1 ? 's' : ''} ignorée${incompatible > 1 ? 's' : ''} (dimensions incompatibles)`,
      );
    }
  };

  // Clear selection helper
  const clearSelection = () => {
    setSelectedRectos([]);
    setLastClickedIndex(null);
  };

  if (rectos.length === 0 || versos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <AlertCircle className="w-16 h-16 mb-4 text-gray-400" />
        <p className="text-lg font-medium text-gray-900">
          Ajoutez d&apos;abord des images
        </p>
        <p className="text-sm text-gray-600 mt-1">
          Uploadez des rectos et des versos pour créer des cartes
        </p>
      </div>
    );
  }

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
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-900">
                  1. Sélectionner les rectos
                </label>
                {selectedRectos.length > 0 && (
                  <button
                    onClick={clearSelection}
                    className="text-xs text-gray-600 hover:text-gray-900 underline"
                  >
                    Tout désélectionner
                  </button>
                )}
              </div>

              {/* Selection hint */}
              <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-blue-900">
                  <span className="font-medium">Astuce :</span> Cliquez pour
                  sélectionner,
                  <span className="font-semibold"> Shift+Clic</span> pour
                  sélectionner une plage,
                  <span className="font-semibold"> Ctrl/Cmd+Clic</span> pour
                  ajouter
                </p>
              </div>

              <div className="grid grid-cols-4 gap-2 max-h-96 overflow-y-auto p-3 bg-gray-50 rounded-lg border border-gray-200">
                {unusedRectos.map((recto, index) => (
                  <SelectableImageCard
                    key={recto.id}
                    image={recto}
                    isSelected={selectedRectos.includes(recto.id)}
                    onSelect={(e) => handleRectoClick(recto.id, index, e)}
                  />
                ))}
              </div>

              {selectedRectos.length > 0 && (
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold text-green-600">
                      {selectedRectos.length}
                    </span>{' '}
                    recto
                    {selectedRectos.length > 1 ? 's' : ''} sélectionné
                    {selectedRectos.length > 1 ? 's' : ''}
                  </p>
                </div>
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
                        ? 'border-green-500 ring-2 ring-green-500 ring-offset-2 shadow-lg'
                        : 'border-gray-300 hover:border-gray-400 hover:shadow-md'
                    }`}
                  >
                    <div className="relative w-full aspect-[2.5/3.5]">
                      <LazyImage
                        src={verso.thumbnailUrl}
                        alt={verso.name}
                        className="w-full h-full object-cover"
                      />

                      {/* Selected indicator */}
                      {selectedVerso === verso.id && (
                        <div className="absolute top-1 right-1 bg-green-500 rounded-full p-1 shadow-lg">
                          <div className="w-4 h-4 flex items-center justify-center">
                            <span className="text-white text-xs font-bold">
                              ✓
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Subtle overlay */}
                      <div
                        className={`absolute inset-0 transition-opacity pointer-events-none ${
                          selectedVerso === verso.id
                            ? 'bg-green-500 bg-opacity-10'
                            : 'bg-gray-900 bg-opacity-0 hover:bg-opacity-5'
                        }`}
                      />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            {selectedRectos.length > 0 && (
              <button
                onClick={clearSelection}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler la sélection
              </button>
            )}
            <button
              onClick={createCards}
              disabled={selectedRectos.length === 0 || !selectedVerso}
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
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
                  className="bg-white border border-gray-200 rounded-lg p-4 flex items-center gap-6 hover:shadow-md transition-shadow"
                >
                  {/* Recto */}
                  <div className="flex-shrink-0">
                    <p className="text-xs font-medium text-gray-600 mb-2">
                      Recto
                    </p>
                    <div className="relative w-20 aspect-[2.5/3.5] rounded overflow-hidden border border-gray-300">
                      {recto && (
                        <LazyImage
                          src={recto.thumbnailUrl}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      )}
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
                          className={`flex-shrink-0 relative w-16 aspect-[2.5/3.5] rounded overflow-hidden border-2 transition-all ${
                            card.versoId === v.id
                              ? 'border-green-500 ring-2 ring-green-500 ring-offset-1'
                              : 'border-gray-300 opacity-50 hover:opacity-100 hover:border-gray-400'
                          }`}
                        >
                          <LazyImage
                            src={v.thumbnailUrl}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                          {card.versoId === v.id && (
                            <div className="absolute top-0.5 right-0.5 bg-green-500 rounded-full p-0.5">
                              <div className="w-3 h-3 flex items-center justify-center">
                                <span className="text-white text-[10px] font-bold">
                                  ✓
                                </span>
                              </div>
                            </div>
                          )}
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
                      className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  {/* Delete */}
                  <button
                    onClick={() => deleteCard(card.id)}
                    className="flex-shrink-0 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    aria-label="Supprimer la carte"
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
