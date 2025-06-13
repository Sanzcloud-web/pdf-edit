# Gestionnaire/Éditeur de PDF

Bienvenue sur ce projet open source permettant de créer et modifier des fichiers PDF directement depuis votre navigateur.

## Présentation

Cette application est développée avec **React**, **TypeScript**, **Vite** et **Tailwind CSS**. Elle offre une interface épurée pour manipuler facilement vos documents.

## Fonctionnalités

- **Import de pages** à partir d'un PDF existant.
- **Réorganisation par glisser-déposer** pour ordonner vos pages.
- **Rotation et redimensionnement** des pages selon vos besoins.
- **Ajout de texte et d'images** directement dans le document.
- **Gestion de la corbeille** pour restaurer des pages supprimées.
- **Export** du PDF complet ou d'une **sélection** de pages.
- **Historique d'annulation et de rétablissement**.

## Installation et utilisation

### Prérequis
- [Node.js](https://nodejs.org/) et npm installés.

### Mise en route
1. Installer les dépendances :
   ```bash
   npm install
   ```
2. Lancer le serveur de développement :
   ```bash
   npm run dev
   ```
   L'application sera disponible sur `http://localhost:5173`.
3. Construire la version de production :
   ```bash
   npm run build
   ```
4. Prévisualiser la production localement :
   ```bash
   npm run preview
   ```

## Structure du dépôt

- `src/components` – composants React de l'interface.
- `src/hooks` – hooks personnalisés.
- `src/utils` – fonctions utilitaires pour la manipulation des PDF.
- `src/types` – définitions TypeScript partagées.

## Licence

Ce projet n'inclut pas encore de licence spécifique. Ajoutez-en une si nécessaire.
