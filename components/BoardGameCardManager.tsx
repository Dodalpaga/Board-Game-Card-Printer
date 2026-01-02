'use client';
import React, { useState, useRef, useMemo } from 'react';
import {
  Upload,
  Trash2,
  Copy,
  ImagePlus,
  AlertCircle,
  Printer,
  Download,
  FolderOpen,
} from 'lucide-react';
import jsPDF from 'jspdf';

interface ImageFile {
  id: string;
  name: string;
  url: string;
  previewUrl: string;
  layoutPreviewUrl: string;
  width: number;
  height: number;
}

interface Card {
  id: string;
  rectoId: string;
  versoId: string;
  quantity: number;
}

interface PageMargins {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;
const MM_PER_PX = 0.084666; // Approx 300 DPI: 25.4 mm / 300 ≈ 0.084666 mm/px

export default function BoardGameCardManager() {
  const [rectos, setRectos] = useState<ImageFile[]>([]);
  const [versos, setVersos] = useState<ImageFile[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [activeTab, setActiveTab] = useState<'upload' | 'associate' | 'layout'>(
    'upload'
  );
  const [margins, setMargins] = useState<PageMargins>({
    top: 12.3,
    right: 12.3,
    bottom: 12.3,
    left: 12.3,
  });
  const [cardSpacing, setCardSpacing] = useState<number>(2);
  const [scale, setScale] = useState<number>(0.5);
  const [toasts, setToasts] = useState<string[]>([]);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  const exportToPDF = async () => {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const totalPages = calculatePages();
    let isFirstPage = true;

    for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
      const pageLayout = layoutData.layout.filter(
        (item) => item.page === pageIndex
      );

      // Recto page
      if (!isFirstPage) pdf.addPage();
      isFirstPage = false;

      for (const item of pageLayout) {
        const recto = getImage(item.card.rectoId, 'recto');
        if (recto) {
          const cardMm = getCardSizeInMm(item.card.rectoId);
          pdf.addImage(
            recto.url,
            'JPEG',
            item.x,
            item.y,
            cardMm.width,
            cardMm.height
          );
        }
      }

      // Verso page
      pdf.addPage();

      for (const item of pageLayout) {
        const verso = getImage(item.card.versoId, 'verso');
        if (verso) {
          const cardMm = getCardSizeInMm(item.card.rectoId);
          const x =
            A4_WIDTH_MM -
            margins.right -
            cardMm.width -
            (item.x - margins.left);
          pdf.addImage(
            verso.url,
            'JPEG',
            x,
            item.y,
            cardMm.width,
            cardMm.height
          );
        }
      }
    }

    pdf.save('cartes-impression.pdf');
    showToast('✅ PDF exporté avec succès !');
  };

  const exportProject = () => {
    const projectData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      rectos: rectos,
      versos: versos,
      cards: cards,
      margins: margins,
      cardSpacing: cardSpacing,
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

  const showToast = (message: string) => {
    setToasts((prev) => [...prev, message]);
    setTimeout(() => setToasts((prev) => prev.slice(1)), 4000);
  };

  const createThumbnail = (
    img: HTMLImageElement,
    maxSize: number,
    quality: number
  ): string => {
    const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, img.width * scale);
    canvas.height = Math.max(1, img.height * scale);
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.imageSmoothingEnabled = quality > 0.5;
      ctx.imageSmoothingQuality = quality > 0.7 ? 'high' : 'low';
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    }
    return canvas.toDataURL('image/jpeg', quality);
  };

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'recto' | 'verso'
  ) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        const img = new Image();
        img.src = imageUrl;
        img.onload = () => {
          const previewUrl = createThumbnail(img, 300, 0.7);
          const layoutPreviewUrl = createThumbnail(img, 100, 0.3);

          const newImage: ImageFile = {
            id: `${type}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
            name: file.name,
            url: imageUrl,
            previewUrl,
            layoutPreviewUrl,
            width: img.naturalWidth,
            height: img.naturalHeight,
          };
          if (type === 'recto') setRectos((prev) => [...prev, newImage]);
          else setVersos((prev) => [...prev, newImage]);
        };
      };
      reader.readAsDataURL(file);
    });
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
      id: `card-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      rectoId: card.rectoId,
      versoId: card.versoId,
      quantity: card.quantity,
    };
    setCards((prev) => [...prev, newCard]);
  };

  const getTotalCards = () =>
    cards.reduce((sum, card) => sum + card.quantity, 0);

  const getImage = (id: string, type: 'recto' | 'verso') =>
    type === 'recto'
      ? rectos.find((r) => r.id === id)
      : versos.find((v) => v.id === id);

  const getUnusedRectos = () => {
    const usedRectoIds = new Set(cards.map((c) => c.rectoId));
    return rectos.filter((r) => !usedRectoIds.has(r.id));
  };

  const getCardSizeInMm = (
    rectoId: string
  ): { width: number; height: number } => {
    const recto = rectos.find((r) => r.id === rectoId);
    if (!recto) return { width: 63, height: 88 };
    return { width: recto.width * MM_PER_PX, height: recto.height * MM_PER_PX };
  };

  const calculateCardsPerPage = () => {
    if (cards.length === 0) return { perPage: 0, layout: [] };

    const availableWidth = A4_WIDTH_MM - margins.left - margins.right;
    const availableHeight = A4_HEIGHT_MM - margins.top - margins.bottom;

    const allCardInstances: { card: Card; instanceId: string }[] = [];
    cards.forEach((card) => {
      for (let i = 0; i < card.quantity; i++) {
        allCardInstances.push({ card, instanceId: `${card.id}-${i}` });
      }
    });

    allCardInstances.sort((a, b) => {
      const sizeA = getCardSizeInMm(a.card.rectoId);
      const sizeB = getCardSizeInMm(b.card.rectoId);
      return sizeB.height - sizeA.height;
    });

    const pages: { card: Card; x: number; y: number }[][] = [[]];
    let currentPageIndex = 0;

    const placeCard = (
      card: Card,
      pageCards: { card: Card; x: number; y: number }[]
    ): boolean => {
      const { width, height } = getCardSizeInMm(card.rectoId);

      for (
        let rowY = margins.top;
        rowY <= availableHeight + height;
        rowY += 1
      ) {
        for (
          let colX = margins.left;
          colX <= availableWidth + width;
          colX += 1
        ) {
          const fits = !pageCards.some((placed) => {
            const pSize = getCardSizeInMm(placed.card.rectoId);
            return !(
              colX + width + cardSpacing <= placed.x ||
              colX - cardSpacing >= placed.x + pSize.width ||
              rowY + height + cardSpacing <= placed.y ||
              rowY - cardSpacing >= placed.y + pSize.height
            );
          });

          if (
            fits &&
            colX + width <= A4_WIDTH_MM - margins.right &&
            rowY + height <= A4_HEIGHT_MM - margins.bottom
          ) {
            pageCards.push({ card, x: colX, y: rowY });
            return true;
          }
        }
      }
      return false;
    };

    allCardInstances.forEach(({ card }) => {
      let placed = false;
      for (let i = currentPageIndex; i < pages.length; i++) {
        if (placeCard(card, pages[i])) {
          placed = true;
          if (i > currentPageIndex) currentPageIndex = i;
          break;
        }
      }
      if (!placed) {
        pages.push([]);
        placeCard(card, pages[pages.length - 1]);
        currentPageIndex = pages.length - 1;
      }
    });

    const perPage = pages[0]?.length || 0;
    const layout: {
      card: Card;
      quantity: number;
      x: number;
      y: number;
      page: number;
    }[] = [];
    pages.forEach((page, pageIndex) => {
      page.forEach((placed) => {
        const card = cards.find((c) => c.id === placed.card.id)!;
        layout.push({
          card,
          quantity: card.quantity,
          x: placed.x,
          y: placed.y,
          page: pageIndex,
        });
      });
    });

    return { perPage, layout };
  };

  const layoutData = useMemo(
    () => calculateCardsPerPage(),
    [
      cards,
      rectos,
      versos,
      margins.top,
      margins.right,
      margins.bottom,
      margins.left,
      cardSpacing,
      calculateCardsPerPage,
    ]
  );

  const calculatePages = () => {
    if (!layoutData || layoutData.layout.length === 0) return 0;
    return Math.max(...layoutData.layout.map((item) => item.page), 0) + 1;
  };

  const setUniformMargin = (value: number) =>
    setMargins({ top: value, right: value, bottom: value, left: value });

  const fitToContainer = () => {
    if (!previewContainerRef.current) return;
    const containerWidth = previewContainerRef.current.clientWidth - 64;
    const pageWidth = A4_WIDTH_MM;
    const newScale = Math.max(0.1, Math.min(2, pageWidth / containerWidth));
    setScale(parseFloat(newScale.toFixed(2)));
  };

  const renderPageLayout = (pageIndex: number, type: 'recto' | 'verso') => {
    const pageLayout = layoutData.layout.filter(
      (item) => item.page === pageIndex
    );
    const pageWidth = A4_WIDTH_MM / scale;
    const pageHeight = A4_HEIGHT_MM / scale;
    const scaledMargins = {
      top: margins.top / scale,
      left: margins.left / scale,
      right: margins.right / scale,
      bottom: margins.bottom / scale,
    };

    return (
      <div className="relative" style={{ marginTop: '32px' }}>
        <div className="absolute -top-8 left-0 bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-sm font-bold shadow-md">
          Page {pageIndex + 1} / {calculatePages()} -{' '}
          {type === 'recto' ? 'Recto' : 'Verso'}
        </div>

        <div
          className="bg-white shadow-2xl relative"
          style={{ width: `${pageWidth}px`, height: `${pageHeight}px` }}
        >
          <div className="absolute inset-0 border-4 border-gray-400 rounded-sm"></div>
          <div
            className="absolute border-2 border-red-500 border-dashed pointer-events-none"
            style={{
              top: `${scaledMargins.top}px`,
              left: `${scaledMargins.left}px`,
              right: `${scaledMargins.right}px`,
              bottom: `${scaledMargins.bottom}px`,
            }}
          />

          {pageLayout.map((item, idx) => {
            const { card } = item;
            const recto = getImage(card.rectoId, 'recto');
            if (!recto) return null;

            const cardMm = getCardSizeInMm(card.rectoId);
            const cardW = cardMm.width / scale;
            const cardH = cardMm.height / scale;

            const x =
              type === 'recto'
                ? item.x / scale
                : pageWidth -
                  scaledMargins.right -
                  cardW -
                  (item.x - margins.left) / scale;

            const y = item.y / scale;
            const image =
              type === 'recto' ? recto : getImage(card.versoId, 'verso');

            return (
              <div
                key={`${pageIndex}-${card.id}-${idx}`}
                className="absolute overflow-hidden border border-red-300"
                style={{
                  left: `${x}px`,
                  top: `${y}px`,
                  width: `${cardW}px`,
                  height: `${cardH}px`,
                }}
              >
                {image && (
                  <img
                    src={image.layoutPreviewUrl}
                    alt=""
                    className="w-full h-full object-cover"
                    style={{ imageRendering: 'pixelated' }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const ImageCard = ({
    img,
    type,
    onDelete,
  }: {
    img: ImageFile;
    type: string;
    onDelete: () => void;
  }) => (
    <div className="relative group">
      <div className="aspect-[2.5/3.5] overflow-hidden rounded-xl border-2 border-gray-200 shadow-sm bg-white group-hover:shadow-lg transition-all">
        <img
          src={img.previewUrl}
          alt={img.name}
          className="w-full h-full object-cover"
        />
      </div>
      <button
        onClick={onDelete}
        className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
      >
        <Trash2 className="w-4 h-4" />
      </button>
      <p className="text-xs text-gray-600 mt-1.5 truncate text-center">
        {img.name}
      </p>
    </div>
  );

  const [selectedRectoForNewCard, setSelectedRectoForNewCard] = useState<
    string[]
  >([]);
  const [selectedVersoForNewCard, setSelectedVersoForNewCard] =
    useState<string>('');

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-indigo-100">
          <h1 className="text-3xl sm:text-5xl font-bold text-indigo-900 mb-3">
            🎲 Gestionnaire de Cartes
          </h1>
          <p className="text-indigo-600 mb-6">
            Créez et préparez vos cartes pour impression
          </p>
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
                {getTotalCards()}
              </div>
              <div className="text-amber-600 text-sm">Total</div>
            </div>
          </div>

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

        <div className="bg-white rounded-2xl shadow-xl mb-8 overflow-hidden">
          <div className="flex border-b border-indigo-100">
            {[
              { id: 'upload', label: '📤 Upload' },
              { id: 'associate', label: '🔗 Association' },
              { id: 'layout', label: '🖨️ Impression' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() =>
                  setActiveTab(tab.id as 'upload' | 'associate' | 'layout')
                }
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

        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-indigo-100">
          {activeTab === 'upload' && (
            <div className="space-y-12">
              {['recto', 'verso'].map((type) => (
                <div key={type}>
                  <h2 className="text-2xl font-bold text-indigo-900 mb-6">
                    {type === 'recto' ? 'Rectos' : 'Versos'} (
                    {type === 'recto' ? rectos.length : versos.length})
                  </h2>
                  <label className="flex flex-col items-center justify-center w-full h-32 border-4 border-dashed border-indigo-300 rounded-2xl cursor-pointer bg-indigo-50 hover:bg-indigo-100 transition-all group">
                    <Upload className="w-12 h-12 text-indigo-500 mb-3 group-hover:scale-110 transition-transform" />
                    <p className="text-lg text-indigo-700 font-medium text-center px-4">
                      Déposer ou cliquer pour ajouter des {type}s
                    </p>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      multiple
                      onChange={(e) =>
                        handleFileUpload(e, type as 'recto' | 'verso')
                      }
                    />
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-9 gap-6 mt-8">
                    {(type === 'recto' ? rectos : versos).map((img) => (
                      <ImageCard
                        key={img.id}
                        img={img}
                        type={type}
                        onDelete={() =>
                          deleteImage(img.id, type as 'recto' | 'verso')
                        }
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'associate' && (
            <div>
              <h2 className="text-2xl font-bold text-indigo-900 mb-8">
                Association Recto ↔ Verso
              </h2>
              {rectos.length === 0 || versos.length === 0 ? (
                <div className="text-center py-20 text-gray-500">
                  <ImagePlus className="w-24 h-24 mx-auto mb-6 text-gray-400" />
                  <p className="text-lg">
                    Veuillez uploader des images recto et verso
                  </p>
                </div>
              ) : (
                <div className="space-y-10">
                  <div className="bg-gradient-to-r from-indigo-100 to-purple-100 p-8 rounded-3xl">
                    <h3 className="text-xl font-bold text-indigo-900 mb-6">
                      Créer de nouvelles cartes
                    </h3>

                    {/* Liste des rectos non encore associés */}
                    {getUnusedRectos().length === 0 ? (
                      <div className="text-center py-12 text-gray-600">
                        <AlertCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                        <p>Tous les rectos sont déjà associés à une carte.</p>
                      </div>
                    ) : (
                      <>
                        <div className="grid md:grid-cols-2 gap-8">
                          <div>
                            <label className="block font-medium mb-4 text-lg">
                              1. Sélectionner un ou plusieurs Rectos (non
                              associés)
                            </label>
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 max-h-96 overflow-y-auto p-4 bg-white rounded-xl border-2 border-indigo-200">
                              {getUnusedRectos().map((recto) => (
                                <button
                                  key={recto.id}
                                  onClick={() =>
                                    setSelectedRectoForNewCard((prev) => {
                                      if (prev.includes(recto.id)) {
                                        return prev.filter(
                                          (id) => id !== recto.id
                                        );
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
                                  {selectedRectoForNewCard.includes(
                                    recto.id
                                  ) && (
                                    <div className="absolute inset-0 bg-indigo-500 bg-opacity-30 flex items-center justify-center">
                                      <div className="bg-white text-indigo-700 rounded-full w-8 h-8 flex items-center justify-center font-bold text-xl">
                                        ✓
                                      </div>
                                    </div>
                                  )}
                                </button>
                              ))}
                            </div>
                            <p className="mt-3 text-sm text-gray-600 text-center">
                              {selectedRectoForNewCard.length} recto(s)
                              sélectionné(s)
                            </p>
                          </div>

                          <div>
                            <label className="block font-medium mb-4 text-lg">
                              2. Choisir un Verso commun
                            </label>
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                              {versos.map((verso) => (
                                <button
                                  key={verso.id}
                                  onClick={() =>
                                    setSelectedVersoForNewCard(verso.id)
                                  }
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
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="mt-8 text-center">
                          <button
                            onClick={() => {
                              if (
                                selectedRectoForNewCard.length === 0 ||
                                !selectedVersoForNewCard
                              ) {
                                showToast(
                                  '⚠️ Veuillez sélectionner au moins un recto et un verso'
                                );
                                return;
                              }

                              const verso = versos.find(
                                (v) => v.id === selectedVersoForNewCard
                              );
                              if (!verso) return;

                              selectedRectoForNewCard.forEach((rectoId) => {
                                const recto = rectos.find(
                                  (r) => r.id === rectoId
                                );
                                if (!recto) return;

                                // Vérification des dimensions
                                if (
                                  recto.width !== verso.width ||
                                  recto.height !== verso.height
                                ) {
                                  showToast(
                                    `⚠️ Dimensions incompatibles avec ${recto.name}`
                                  );
                                  return;
                                }

                                // Si la combinaison existe déjà → on incrémente la quantité
                                const existingCard = cards.find(
                                  (c) =>
                                    c.rectoId === rectoId &&
                                    c.versoId === selectedVersoForNewCard
                                );
                                if (existingCard) {
                                  updateQuantity(
                                    existingCard.id,
                                    existingCard.quantity + 1
                                  );
                                } else {
                                  const newCard: Card = {
                                    id: `card-${Date.now()}-${Math.random()
                                      .toString(36)
                                      .slice(2)}`,
                                    rectoId,
                                    versoId: selectedVersoForNewCard,
                                    quantity: 1,
                                  };
                                  setCards((prev) => [...prev, newCard]);
                                }
                              });

                              // Réinitialiser la sélection
                              setSelectedRectoForNewCard([]);
                              setSelectedVersoForNewCard('');
                              showToast(
                                `✅ ${selectedRectoForNewCard.length} carte(s) créée(s) !`
                              );
                            }}
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
                            </div>
                            <div className="flex-1">
                              <p className="font-bold mb-3">Verso</p>
                              <div className="flex gap-3 flex-wrap">
                                {versos.map((v) => (
                                  <button
                                    key={v.id}
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
                                    updateQuantity(
                                      card.id,
                                      parseInt(e.target.value) || 1
                                    )
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
              )}
            </div>
          )}

          {activeTab === 'layout' && (
            <div>
              <h2 className="text-2xl font-bold text-indigo-900 mb-8 flex items-center">
                <Printer className="w-8 h-8 mr-3" />
                Mise en page pour impression
              </h2>

              {cards.length === 0 ? (
                <div className="text-center py-20 text-gray-500">
                  <AlertCircle className="w-24 h-24 mx-auto mb-6 text-gray-400" />
                  <p className="text-lg">Créez d&apos;abord des cartes</p>
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-8 h-[calc(100vh-400px)] min-h-[600px]">
                  <div className="col-span-1 space-y-6 overflow-y-auto pr-4">
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl">
                      <h3 className="text-lg font-bold text-indigo-900 mb-4">
                        🔍 Zoom
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Ratio (échelle 1:{scale})
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            min="0.1"
                            max="2"
                            value={scale}
                            onChange={(e) =>
                              setScale(parseFloat(e.target.value) || 0.5)
                            }
                            className="w-full px-3 py-2 border-2 border-purple-300 rounded-lg text-center font-semibold"
                          />
                          <input
                            type="range"
                            min="0.1"
                            max="2"
                            step="0.1"
                            value={scale}
                            onChange={(e) =>
                              setScale(parseFloat(e.target.value))
                            }
                            className="w-full mt-3"
                          />
                        </div>
                        <button
                          onClick={fitToContainer}
                          className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 transition-colors font-semibold"
                        >
                          Ajuster à la largeur
                        </button>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl">
                      <h3 className="text-lg font-bold text-indigo-900 mb-4">
                        Marges A4 (mm)
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Uniforme
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            placeholder="12.3"
                            onChange={(e) =>
                              setUniformMargin(
                                parseFloat(e.target.value) || 12.3
                              )
                            }
                            className="w-full px-3 py-2 border-2 border-indigo-300 rounded-lg text-center font-semibold"
                          />
                        </div>
                        {['top', 'right', 'bottom', 'left'].map((side) => (
                          <div key={side}>
                            <label className="block text-sm font-medium mb-2 capitalize">
                              {side}
                            </label>
                            <input
                              type="number"
                              step="0.1"
                              value={margins[side as keyof PageMargins]}
                              onChange={(e) =>
                                setMargins((p) => ({
                                  ...p,
                                  [side]: parseFloat(e.target.value) || 12.3,
                                }))
                              }
                              className="w-full px-3 py-2 border-2 border-indigo-300 rounded-lg text-center font-semibold"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-inner border border-indigo-200">
                      <h3 className="text-lg font-bold text-indigo-900 mb-4">
                        Statistiques
                      </h3>
                      <div className="space-y-4">
                        <div className="text-center p-4 bg-indigo-50 rounded-lg">
                          <p className="text-xs text-gray-600 mb-1">
                            Cartes par page
                          </p>
                          <p className="text-2xl font-bold text-indigo-600">
                            {layoutData.perPage}
                          </p>
                        </div>
                        <div className="text-center p-4 bg-emerald-50 rounded-lg">
                          <p className="text-xs text-gray-600 mb-1">
                            Total cartes
                          </p>
                          <p className="text-2xl font-bold text-emerald-600">
                            {getTotalCards()}
                          </p>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                          <p className="text-xs text-gray-600 mb-1">
                            Pages nécessaires
                          </p>
                          <p className="text-2xl font-bold text-purple-600">
                            {calculatePages()}
                          </p>
                          <p className="text-xs text-gray-500">
                            ({calculatePages() * 2} feuilles A4)
                          </p>
                        </div>
                        <div className="text-center p-4 bg-amber-50 rounded-lg">
                          <p className="text-xs text-gray-600 mb-1">
                            Espacement
                          </p>
                          <p className="text-2xl font-bold text-amber-600">
                            {cardSpacing} mm
                          </p>
                          <input
                            type="range"
                            min="0"
                            max="10"
                            step="0.5"
                            value={cardSpacing}
                            onChange={(e) =>
                              setCardSpacing(parseFloat(e.target.value))
                            }
                            className="w-full mt-3"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    ref={previewContainerRef}
                    className="col-span-3 overflow-y-auto bg-gray-100 rounded-2xl p-8"
                  >
                    <h3 className="text-xl font-bold text-indigo-900 mb-6 text-center sticky top-0 bg-gray-100 pb-4 z-10">
                      Aperçu des pages A4 (échelle 1:{scale})
                    </h3>
                    <div className="flex justify-center mb-8">
                      <button
                        onClick={exportToPDF}
                        className="flex items-center justify-center gap-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-5 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all font-bold text-xl shadow-2xl"
                      >
                        <Printer className="w-8 h-8" />
                        Exporter en PDF
                      </button>
                    </div>
                    <div
                      className="grid gap-8"
                      style={{
                        gridTemplateColumns: `repeat(auto-fit, minmax(${Math.max(
                          A4_WIDTH_MM / scale,
                          200
                        )}px, 1fr))`,
                        justifyItems: 'center',
                      }}
                    >
                      {Array.from({ length: calculatePages() }, (_, i) => (
                        <React.Fragment key={i}>
                          {renderPageLayout(i, 'recto')}
                          {renderPageLayout(i, 'verso')}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="fixed bottom-6 right-6 space-y-3 z-50">
          {toasts.map((msg, i) => (
            <div
              key={i}
              className="bg-indigo-600 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-pulse"
            >
              <AlertCircle className="w-6 h-6" />
              <span className="font-semibold">{msg}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
