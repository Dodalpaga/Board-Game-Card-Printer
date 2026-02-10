// components/AssociateTab.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, AlertCircle, Info, ArrowRight } from 'lucide-react';
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

const LazyImage: React.FC<{ src: string; alt: string; className?: string }> =
  React.memo(({ src, alt, className }) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const imgRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
      if (imgRef.current?.complete) setIsLoaded(true);
    }, []);

    return (
      <>
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-indigo-600 rounded-full animate-spin" />
          </div>
        )}
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          className={`absolute inset-0 ${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200`}
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

  const handleRectoClick = (
    rectoId: string,
    index: number,
    e: React.MouseEvent,
  ) => {
    e.preventDefault();
    if (e.shiftKey && lastClickedIndex !== null) {
      const start = Math.min(lastClickedIndex, index);
      const end = Math.max(lastClickedIndex, index);
      const rangeIds = unusedRectos.slice(start, end + 1).map((r) => r.id);
      setSelectedRectos((prev) => Array.from(new Set([...prev, ...rangeIds])));
    } else {
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
        setCards((prev) => [
          ...prev,
          {
            id: generateId('card'),
            rectoId,
            versoId: selectedVerso,
            quantity: 1,
          },
        ]);
        created++;
      }
    });

    setSelectedRectos([]);
    setSelectedVerso('');
    setLastClickedIndex(null);

    if (created > 0)
      showToast(
        `✅ ${created} carte${created > 1 ? 's' : ''} créée${created > 1 ? 's' : ''}`,
      );
    if (incompatible > 0)
      showToast(
        `⚠️ ${incompatible} image${incompatible > 1 ? 's' : ''} ignorée${incompatible > 1 ? 's' : ''} (dimensions incompatibles)`,
      );
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

  const canCreate = selectedRectos.length > 0 && !!selectedVerso;

  return (
    <div
      className="grid gap-4 h-[calc(100vh-220px)] min-h-[600px]"
      style={{
        gridTemplateColumns:
          unusedRectos.length > 0 ? '1fr auto 1fr auto 1.2fr' : '1fr',
      }}
    >
      {unusedRectos.length > 0 && (
        <>
          {/* ── Column 1: Rectos ── */}
          <div className="flex flex-col bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
              <div>
                <h2 className="text-sm font-semibold text-gray-900">
                  Rectos disponibles
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  {unusedRectos.length} image
                  {unusedRectos.length !== 1 ? 's' : ''}
                </p>
              </div>
              {selectedRectos.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                    {selectedRectos.length} sélectionné
                    {selectedRectos.length > 1 ? 's' : ''}
                  </span>
                  <button
                    onClick={() => {
                      setSelectedRectos([]);
                      setLastClickedIndex(null);
                    }}
                    className="text-xs text-gray-500 hover:text-gray-800 underline"
                  >
                    Tout désélectionner
                  </button>
                </div>
              )}
            </div>

            <div className="px-3 py-2 bg-blue-50 border-b border-blue-100 flex-shrink-0">
              <div className="flex items-start gap-1.5">
                <Info className="w-3.5 h-3.5 text-blue-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-blue-800">
                  Clic · <strong>Shift+Clic</strong> plage ·{' '}
                  <strong>Ctrl+Clic</strong> multiple
                </p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3">
              <div className="grid grid-cols-3 gap-2">
                {unusedRectos.map((recto, index) => (
                  <SelectableImageCard
                    key={recto.id}
                    image={recto}
                    isSelected={selectedRectos.includes(recto.id)}
                    onSelect={(e) => handleRectoClick(recto.id, index, e)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* ── Arrow 1 ── */}
          <div className="flex items-center justify-center">
            <ArrowRight
              className={`w-5 h-5 transition-colors ${selectedRectos.length > 0 ? 'text-green-500' : 'text-gray-300'}`}
            />
          </div>

          {/* ── Column 2: Versos + Create ── */}
          <div className="flex flex-col bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 flex-shrink-0">
              <h2 className="text-sm font-semibold text-gray-900">
                Verso commun
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {versos.length} verso{versos.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-3">
              <div className="grid grid-cols-3 gap-2">
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
                      {selectedVerso === verso.id && (
                        <div className="absolute top-1 right-1 bg-green-500 rounded-full p-1 shadow-lg z-10">
                          <span className="text-white text-xs font-bold">
                            ✓
                          </span>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Create button pinned to bottom */}
            <div className="p-3 border-t border-gray-200 flex-shrink-0">
              <button
                onClick={createCards}
                disabled={!canCreate}
                className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                {canCreate
                  ? `Créer ${selectedRectos.length} carte${selectedRectos.length > 1 ? 's' : ''}`
                  : 'Sélectionnez recto(s) + verso'}
              </button>
            </div>
          </div>

          {/* ── Arrow 2 ── */}
          <div className="flex items-center justify-center">
            <ArrowRight
              className={`w-5 h-5 transition-colors ${cards.length > 0 ? 'text-indigo-400' : 'text-gray-300'}`}
            />
          </div>
        </>
      )}

      {/* ── Column 3: Created Cards ── */}
      <div className="flex flex-col bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">
              Cartes créées
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {cards.length} carte{cards.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {cards.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-6 py-12 text-gray-400">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                <Plus className="w-6 h-6 text-gray-300" />
              </div>
              <p className="text-sm font-medium text-gray-500">Aucune carte</p>
              <p className="text-xs text-gray-400 mt-1">
                Associez un recto et un verso pour commencer
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {cards.map((card) => {
                const recto = getImage(card.rectoId, 'recto');
                return (
                  <div
                    key={card.id}
                    className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 transition-colors"
                  >
                    {/* Recto thumbnail */}
                    <div className="relative w-10 flex-shrink-0 aspect-[2.5/3.5] rounded overflow-hidden border border-gray-200">
                      {recto && (
                        <LazyImage
                          src={recto.thumbnailUrl}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>

                    {/* Recto name */}
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-xs font-medium text-gray-800 truncate"
                        title={recto?.name}
                      >
                        {recto?.name ?? '—'}
                      </p>
                      {/* Verso selector: small thumbnails */}
                      <div className="flex gap-1 mt-1.5 overflow-x-auto pb-0.5">
                        {versos.map((v) => (
                          <button
                            key={v.id}
                            onClick={() => changeVerso(card.id, v.id)}
                            title={v.name}
                            className={`flex-shrink-0 relative w-7 aspect-[2.5/3.5] rounded overflow-hidden border transition-all ${
                              card.versoId === v.id
                                ? 'border-green-500 ring-1 ring-green-500 ring-offset-1'
                                : 'border-gray-200 opacity-40 hover:opacity-80 hover:border-gray-400'
                            }`}
                          >
                            <LazyImage
                              src={v.thumbnailUrl}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Quantity */}
                    <input
                      type="number"
                      min="1"
                      value={card.quantity}
                      onChange={(e) =>
                        updateQuantity(card.id, parseInt(e.target.value) || 1)
                      }
                      className="w-14 px-2 py-1.5 border border-gray-300 rounded text-center text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent flex-shrink-0"
                    />

                    {/* Delete */}
                    <button
                      onClick={() => deleteCard(card.id)}
                      className="flex-shrink-0 p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                      aria-label="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
