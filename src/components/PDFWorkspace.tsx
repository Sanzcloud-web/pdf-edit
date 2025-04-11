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
}

export function PDFWorkspace({
  pages,
  selectedPages,
  onPageSelect,
  onPreviewPage,
  onReorderPages
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

  return (
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
          className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6"
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
  );
}