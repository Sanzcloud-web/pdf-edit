// Mise à jour de src/components/PDFWorkspace.tsx

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { Maximize, Minimize } from 'lucide-react';
import { PageThumbnail } from './PageThumbnail';
import { DropIndicator } from './DropIndicator';
import { DragOverlay as CustomDragOverlay } from './DragOverlay';
import { useDragAndDrop } from '../hooks/useDragAndDrop';
import { Page } from '../types';

interface PDFWorkspaceProps {
  pages: Page[];
  selectedPages: Set<string>;
  onPageSelect: (pageId: string) => void;
  onPreviewPage: (page: Page) => void;
  onReorderPages: (oldIndex: number, newIndex: number) => void;
  onRotatePage?: (pageId: string, degrees: number) => void;
  onResizePage?: (pageId: string) => void; // Nouvelle prop
  thumbnailSize?: number;
  onChangeThumbnailSize?: (size: number) => void;
}

export function PDFWorkspace({
  pages,
  selectedPages,
  onPageSelect,
  onPreviewPage,
  onReorderPages,
  onRotatePage,
  onResizePage, // Nouvelle prop
  thumbnailSize = 3,
  onChangeThumbnailSize = () => {}
}: PDFWorkspaceProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const {
    activeId,
    dropTargetId,
    dropPosition,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel
  } = useDragAndDrop({
    onReorder: onReorderPages,
    pages
  });

  const activePage = activeId ? pages.find(page => page.id === activeId) : null;

  // Calculer la classe de grille en fonction de la taille
  const getGridClass = () => {
    switch(thumbnailSize) {
      case 1: return "grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-4";
      case 2: return "grid grid-cols-2 md:grid-cols-5 lg:grid-cols-7 gap-5";
      case 3: return "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6"; // Taille actuelle
      case 4: return "grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6";
      case 5: return "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8";
      default: return "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6";
    }
  };

  return (
    <>
      {/* Contrôle de taille des miniatures */}
      <div className="flex items-center justify-end mb-4">
        <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-2">
          <Minimize className="text-gray-600" size={16} />
          <input
            type="range"
            min="1"
            max="5"
            value={thumbnailSize}
            onChange={(e) => onChangeThumbnailSize(parseInt(e.target.value))}
            className="w-32"
          />
          <Maximize className="text-gray-600" size={16} />
        </div>
      </div>
      
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <SortableContext items={pages.map((p) => p.id)} strategy={rectSortingStrategy}>
          <motion.div
            className={getGridClass()}
            layout
          >
            <AnimatePresence>
              {pages.map((page, index) => (
                <React.Fragment key={page.id}>
                  {/* Affiche l'indicateur avant la page si nécessaire */}
                  {dropTargetId === page.id && dropPosition === 'before' && (
                    <DropIndicator isVisible={true} />
                  )}
                  
                  <PageThumbnail
                    page={page}
                    isSelected={selectedPages.has(page.id)}
                    onSelect={() => onPageSelect(page.id)}
                    onPreview={() => onPreviewPage(page)}
                    onRotate={onRotatePage}
                    onResize={onResizePage} // Nouvelle prop
                    // Ajouter cette prop pour indiquer si cette page est en cours de glissement
                    isDragging={activeId === page.id}
                  />
                  
                  {/* Affiche l'indicateur après la page si nécessaire */}
                  {dropTargetId === page.id && dropPosition === 'after' && (
                    <DropIndicator isVisible={true} />
                  )}
                  
                  {/* Affiche un indicateur à la fin si nous survolons la dernière page */}
                  {index === pages.length - 1 && dropTargetId === page.id && dropPosition === 'after' && (
                    <DropIndicator isVisible={true} />
                  )}
                </React.Fragment>
              ))}
            </AnimatePresence>
          </motion.div>
        </SortableContext>

        <DragOverlay>
          {activePage && (
            <CustomDragOverlay
              thumbnail={activePage.thumbnail}
              pageNumber={activePage.number}
            />
          )}
        </DragOverlay>
      </DndContext>
    </>
  );
}