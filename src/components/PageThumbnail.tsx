// Dans src/components/PageThumbnail.tsx

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Move, RotateCw, RotateCcw } from 'lucide-react';

// Utilisation directe de l'interface Page depuis les types
import { Page } from '../types';

interface PageThumbnailProps {
  page: Page;
  isSelected: boolean;
  onSelect: () => void;
  onPreview: () => void;
  onRotate?: (pageId: string, degrees: number) => void; // Corrigé pour accepter tous les degrés
}

export function PageThumbnail({ 
  page, 
  isSelected, 
  onSelect, 
  onPreview,
  onRotate 
}: PageThumbnailProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: page.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const [showRotateControls, setShowRotateControls] = useState(false);

  // Fonction pour gérer la rotation
  const handleRotate = (e: React.MouseEvent, degrees: number) => {
    e.stopPropagation(); // Empêcher le déclenchement du onPreview
    if (onRotate) {
      onRotate(page.id, degrees);
    }
  };

  // Calcul des rotations suivantes
  const getNextRotation = (current: number = 0, increment: number): number => {
    return (current + increment) % 360;
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className={`relative group rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all ${
        isSelected ? 'ring-2 ring-blue-500' : 'hover:ring-2 hover:ring-blue-200'
      }`}
      onMouseEnter={() => setShowRotateControls(true)}
      onMouseLeave={() => setShowRotateControls(false)}
    >
      <div className="absolute top-2 left-2 z-10">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onSelect}
          className="w-5 h-5 rounded-md border-2 border-gray-300 text-blue-600 focus:ring-blue-500 transition-all"
        />
      </div>
      
      <motion.div
        {...attributes}
        {...listeners}
        className="absolute top-2 right-2 z-10 cursor-move p-1.5 rounded-lg bg-white bg-opacity-90 shadow-md opacity-0 group-hover:opacity-100 transition-all"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Move size={16} className="text-gray-600" />
      </motion.div>

      {/* Contrôles de rotation */}
      {showRotateControls && onRotate && (
        <div className="absolute top-10 right-2 z-10 bg-white bg-opacity-90 rounded-lg shadow-md p-1 opacity-0 group-hover:opacity-100 transition-all flex flex-col gap-1">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => handleRotate(e, getNextRotation(page.rotation, 90))}
            className="p-1 rounded-lg text-gray-600 hover:bg-gray-100"
            title="Pivoter à 90° dans le sens horaire"
          >
            <RotateCw size={16} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => handleRotate(e, getNextRotation(page.rotation, 270))}
            className="p-1 rounded-lg text-gray-600 hover:bg-gray-100"
            title="Pivoter à 90° dans le sens anti-horaire"
          >
            <RotateCcw size={16} />
          </motion.button>
        </div>
      )}

      <motion.div
        onClick={onPreview}
        className="aspect-[3/4] cursor-pointer group-hover:brightness-95 transition-all"
        whileHover={{ scale: 1.02 }}
        style={{
          transform: `rotate(${page.rotation || 0}deg)`,
          transition: 'transform 0.3s ease'
        }}
      >
        <iframe
          src={page.thumbnail}
          className="w-full h-full pointer-events-none"
          title={`Page ${page.number}`}
        />
      </motion.div>

      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-3">
        <span className="text-sm font-medium text-white">
          Page {page.number} {page.rotation ? `(${page.rotation}°)` : ''}
        </span>
      </div>
    </motion.div>
  );
}