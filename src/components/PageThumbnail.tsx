// Mise à jour de src/components/PageThumbnail.tsx

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Move, RotateCw, RotateCcw, Maximize2 } from 'lucide-react';

// Utilisation directe de l'interface Page depuis les types
import { Page } from '../types';

interface PageThumbnailProps {
  page: Page;
  isSelected: boolean;
  onSelect: () => void;
  onPreview: () => void;
  onRotate?: (pageId: string, degrees: number) => void;
  onResize?: (pageId: string) => void; // Nouvelle prop pour le redimensionnement
  isDragging?: boolean;
}

export function PageThumbnail({ 
  page, 
  isSelected, 
  onSelect, 
  onPreview,
  onRotate,
  onResize,
  isDragging = false
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
    opacity: isDragging ? 0 : 1
  };

  const [showControls, setShowControls] = useState(false);

  const handleRotate = (e: React.MouseEvent, degrees: number) => {
    e.stopPropagation();
    if (onRotate) {
      onRotate(page.id, degrees);
    }
  };
  
  const handleResize = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onResize) {
      onResize(page.id);
    }
  };

  const getNextRotation = (current: number = 0, increment: number): number => {
    return (current + increment) % 360;
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: isDragging ? 0 : 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className={`relative group rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all ${
        isSelected ? 'ring-2 ring-blue-500' : 'hover:ring-2 hover:ring-blue-200'
      }`}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
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

      {showControls && (
        <div className="absolute top-10 right-2 z-10 bg-white bg-opacity-90 rounded-lg shadow-md p-1 opacity-0 group-hover:opacity-100 transition-all flex flex-col gap-1">
          {onRotate && (
            <>
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
            </>
          )}
          
          {/* Nouveau bouton pour le redimensionnement */}
          {onResize && (
            <>
              <div className="w-full h-px bg-gray-200 my-1"></div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleResize}
                className="p-1 rounded-lg text-gray-600 hover:bg-gray-100"
                title="Redimensionner cette page"
              >
                <Maximize2 size={16} />
              </motion.button>
            </>
          )}
        </div>
      )}

      <motion.div
        onClick={onPreview}
        className="aspect-[3/4] cursor-pointer group-hover:brightness-95 transition-all bg-white"
        whileHover={{ scale: 1.02 }}
        style={{
          transform: `rotate(${page.rotation || 0}deg)`,
          transition: 'transform 0.3s ease'
        }}
      >
        {/* Remplacer iframe par object */}
        <object
          data={page.thumbnail}
          type="application/pdf"
          className="w-full h-full"
          style={{
            border: 'none',
            background: 'white'
          }}
        >
          <div className="flex items-center justify-center h-full bg-gray-100">
            <p className="text-gray-500">Impossible d'afficher le PDF</p>
          </div>
        </object>
      </motion.div>

      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-3">
        <span className="text-sm font-medium text-white">
          Page {page.number} {page.rotation ? `(${page.rotation}°)` : ''}
        </span>
      </div>
    </motion.div>
  );
}