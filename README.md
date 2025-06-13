# Gestionnaire/Éditeur de PDF

Ce projet est une application web permettant de gérer et modifier des documents PDF. Elle est développée avec **React**, **TypeScript**, **Vite** et **Tailwind CSS**.

## Fonctionnalités principales

- **Importation de pages** depuis un fichier PDF existant.
- **Réorganisation par glisser-déposer** des pages.
- **Rotation et redimensionnement** des pages.
- **Ajout de texte et d’images** directement dans le document.
- **Gestion de la corbeille** pour supprimer ou restaurer des pages.
- **Export** du document complet ou d’une **sélection** de pages.
- **Annulation et rétablissement** des modifications.

## Installation et utilisation

### Pré-requis

- [Node.js](https://nodejs.org/) et npm installés sur votre machine.

### Étapes

1. Installer les dépendances :
   ```bash
   npm install
   ```
2. Démarrer le serveur de développement :
   ```bash
   npm run dev
   ```
   L’application sera disponible sur `http://localhost:5173`.
3. Construire la version de production :
   ```bash
   npm run build
   ```
4. Prévisualiser la production localement :
   ```bash
   npm run preview
   ```

## Structure du dépôt

- `src/components` – composants React de l’interface utilisateur.
- `src/hooks` – hooks personnalisés pour la logique de l’application.
- `src/utils` – fonctions utilitaires pour la manipulation des PDF.
- `src/types` – définitions TypeScript partagées.

## Licence

Ce projet n’inclut pas encore de licence spécifique. Ajoutez-en une si nécessaire.
