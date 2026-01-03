# 🎲 Gestionnaire de Cartes pour Jeux de Société

Un outil web pour préparer vos cartes de jeu de société à l'impression. Idéal pour les créateurs de prototypes, éditeurs indépendants et passionnés de print-and-play.

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat&logo=next.js&logoColor=white)](https://nextjs.org/)

You can try the [Démo](https://dodalpaga.github.io/Board-Game-Card-Printer/) at https://dodalpaga.github.io/Board-Game-Card-Printer

## ✨ Fonctionnalités

- **Upload et gestion** des images recto/verso avec vérification automatique des dimensions
- **Association flexible** : associez plusieurs rectos à un verso commun
- **Mise en page optimisée** sur A4 avec algorithme de placement intelligent
- **Aperçu en temps réel** avec zoom et ajustement des marges
- **Export PDF** prêt à imprimer (recto-verso aligné)
- **Sauvegarde/chargement** de projet au format JSON

Tout est fait côté client !

## 🚀 Installation

```bash
git clone https://github.com/votre-username/gestionnaire-cartes-jeu.git
cd gestionnaire-cartes-jeu

npm install
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000)

## 📁 Structure du projet

```
src/components/BoardGameCardManager/
├── index.tsx                 # Composant principal
├── types.ts                  # Interfaces TypeScript
├── constants.ts              # Configuration
├── utils.ts                  # Fonctions utilitaires
├── hooks/
│   └── useCardLayout.ts      # Algorithme de placement
└── components/
    ├── ImageCard.tsx         # Carte image
    ├── Toast.tsx             # Notifications
    ├── StatsPanel.tsx        # Statistiques
    ├── UploadTab.tsx         # Interface d'upload
    ├── AssociateTab.tsx      # Gestion des associations
    └── LayoutTab.tsx         # Mise en page et export
```

### 🎯 Architecture modulaire

| Avant                    | Après                                       |
| ------------------------ | ------------------------------------------- |
| 1 fichier de 800+ lignes | 11 fichiers modulaires (~90 lignes/fichier) |
| Difficile à maintenir    | Composants réutilisables et testables       |

### 🧩 Modules principaux

- **`types.ts`** : Définitions TypeScript (ImageFile, Card, PageMargins, LayoutData)
- **`constants.ts`** : Dimensions A4, conversion DPI, valeurs par défaut
- **`utils.ts`** : Fonctions pures (createThumbnail, getCardSizeInMm, getTotalCards)
- **`useCardLayout.ts`** : Hook memoized pour le calcul de placement (bin-packing)
- **`UploadTab`** : Gestion de l'upload avec génération de miniatures optimisées
- **`AssociateTab`** : Création et gestion des associations recto/verso
- **`LayoutTab`** : Aperçu en temps réel et export PDF via jsPDF

## 📦 Dépendances

```json
{
  "dependencies": {
    "react": "^18.0.0",
    "next": "^14.0.0",
    "typescript": "^5.0.0",
    "lucide-react": "^0.263.1", // Icônes
    "jspdf": "^2.5.1" // Génération PDF
  }
}
```

**Bundle size** : ~200 KB (gzipped) ✅

## 📖 Utilisation

1. **Upload** : Ajoutez vos images recto et verso (JPG, PNG, WebP)
2. **Association** : Sélectionnez les rectos et associez-les à un verso commun
3. **Mise en page** : Ajustez les marges, l'espacement et visualisez le résultat
4. **Export** : Téléchargez le PDF prêt à imprimer en recto-verso

## 🖨️ Impression

- Papier cartonné **250-300 g/m²**
- Mode **recto-verso bord court**
- Images préparées à **300 DPI**
- Marges recommandées : **12-15 mm**

## 🤝 Contribution

Les contributions sont bienvenues ! N'hésitez pas à :

- Signaler un bug via les [Issues](https://github.com/votre-username/gestionnaire-cartes-jeu/issues)
- Proposer une fonctionnalité
- Soumettre une Pull Request

### Idées de contributions

- 🌍 Internationalisation (i18n)
- 📄 Support Letter US / formats custom
- 🎨 Mode sombre
- 🧪 Tests unitaires
- 📱 Version PWA

## 📄 Licence

MIT License - Libre d'utilisation, modification et distribution.

---

⭐ **N'oubliez pas de mettre une étoile si ce projet vous aide !** ⭐
