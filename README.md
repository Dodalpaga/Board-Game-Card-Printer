# 🎲 Gestionnaire de Cartes pour Jeux de Société

Un outil web moderne et intuitif pour préparer vos cartes de jeu de société à l'impression professionnelle ou maison.  
Idéal pour les créateurs de prototypes, les éditeurs indépendants ou les passionnés de print-and-play.

## ✨ Fonctionnalités

- **Upload séparé** des faces recto et verso de vos cartes
- **Association flexible** : associez un verso commun à plusieurs rectos en un clic
- **Vérification automatique** des dimensions (recto et verso doivent avoir la même taille)
- **Gestion des quantités** par carte et duplication rapide
- **Mise en page optimisée** sur feuilles A4 avec :
  - Marges personnalisables (uniformes ou individuelles)
  - Espacement entre cartes réglable
  - Algorithme de placement intelligent (bin packing simplifié)
- **Aperçu en temps réel** des pages recto et verso (avec zoom)
- **Export PDF** prêt à imprimer (recto et verso alignés pour impression recto-verso parfaite)
- **Sauvegarde / Chargement de projet** au format JSON
- Interface entièrement responsive et agréable

## 🖥️ Technologies utilisées

- **Next.js 14** (App Router)
- **React 18**
- **TypeScript**
- **Tailwind CSS**
- **Lucide React** (icônes)
- **jsPDF** (génération PDF côté client)

## 🚀 Démarrage rapide

### Prérequis

- Node.js ≥ 18
- npm, yarn ou pnpm

### Installation

```bash
git clone https://github.com/votre-username/gestionnaire-cartes-jeu.git
cd gestionnaire-cartes-jeu

# Avec npm
npm install
npm run dev

# Ou avec pnpm
pnpm install
pnpm dev

# Ou avec yarn
yarn install
yarn dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## 📖 Guide d'utilisation

### 1. Upload des images

- Allez dans l'onglet **📤 Upload**
- Chargez vos images de recto dans la section "Rectos"
- Chargez vos images de verso dans la section "Versos"
- Formats supportés : JPG, PNG, WebP, etc.

> Astuce : préparez vos images à 300 DPI pour une impression optimale.

### 2. Association recto/verso

- Passez à l'onglet **🔗 Association**
- Sélectionnez un ou plusieurs rectos non utilisés
- Choisissez un verso commun
- Cliquez sur "Créer X carte(s)"
- Ajustez les quantités, changez de verso ou dupliquez les cartes existantes si besoin

### 3. Préparation de l'impression

- Allez dans l'onglet **🖨️ Impression**
- Ajustez :
  - Les marges (en mm)
  - L'espacement entre cartes
  - Le zoom d'aperçu
- Visualisez le placement automatique des cartes sur chaque page A4
- Cliquez sur **Exporter en PDF** quand tout est prêt

### 4. Sauvegarde du projet

- Boutons en haut de page :
  - **Exporter le projet** → sauvegarde un fichier `.json`
  - **Importer un projet** → restaure tout votre travail

## 🖨️ Conseils pour une impression parfaite

1. Utilisez du papier cartonné 250–300 g/m²
2. Imprimez en **recto-verso bord court** (ou "flip on short edge")
3. Vérifiez l'alignement avec une page test avant grande série
4. Pour une découpe précise : laissez un fond perdu (bleed) de 3 mm si possible

## 🤝 Contribution

Les contributions sont les bienvenues !  
N'hésitez pas à ouvrir une issue ou une pull request pour :

- Corriger un bug
- Proposer une nouvelle fonctionnalité
- Améliorer l'algorithme de placement
- Ajouter des tailles de page (Letter, custom...)

## 📄 Licence

MIT License – libre d'utilisation, modification et distribution.

---

**Profitez bien de vos créations !** 🎲✂️🖨️
