import { useState, useCallback } from 'react';
import { DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/core';

interface UseDragAndDropProps {
  onReorder: (oldIndex: number, newIndex: number) => void;
  pages: Array<{ id: string }>;
}

export function useDragAndDrop({ onReorder, pages }: UseDragAndDropProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const [dropPosition, setDropPosition] = useState<'before' | 'after' | null>(null);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setDropTargetId(over.id as string);
      
      // Utiliser l'ordre des éléments pour déterminer la position
      const activeIndex = pages.findIndex(page => page.id === active.id);
      const overIndex = pages.findIndex(page => page.id === over.id);
      
      // Si l'élément actif était avant l'élément survolé, placer après
      // Sinon, placer avant
      setDropPosition(activeIndex < overIndex ? 'after' : 'before');
    } else {
      setDropTargetId(null);
      setDropPosition(null);
    }
  }, [pages]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setActiveId(null);
    setDropTargetId(null);
    setDropPosition(null);
    
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = pages.findIndex((page) => page.id === active.id);
      const newIndex = pages.findIndex((page) => page.id === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        onReorder(oldIndex, newIndex);
      }
    }
  }, [pages, onReorder]);

  const handleDragCancel = useCallback(() => {
    setActiveId(null);
    setDropTargetId(null);
    setDropPosition(null);
  }, []);

  return {
    activeId,
    dropTargetId,
    dropPosition,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel
  };
}