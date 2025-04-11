import { useState, useCallback } from 'react';
import { Page, ExportOptions } from '../types';
import { usePDFHistory } from './usePDFHistory';
import { mergePages } from '../utils/pdfUtils';
import { toast } from 'react-hot-toast';

export function usePDFManager() {
  const [pages, setPages] = useState<Page[]>([]);
  const [selectedPages, setSelectedPages] = useState<Set<string>>(new Set());
  const [deletedPages, setDeletedPages] = useState<Page[]>([]);
  const [previewPage, setPreviewPage] = useState<Page | null>(null);
  const { addToHistory, undo: undoHistory, redo: redoHistory, canUndo, canRedo } = usePDFHistory();

  const addPages = useCallback((newPages: Page[]) => {
    setPages(prevPages => {
      const updatedPages = [...prevPages, ...newPages];
      addToHistory(updatedPages);
      return updatedPages;
    });
  }, [addToHistory]);

  const reorderPages = useCallback((oldIndex: number, newIndex: number) => {
    setPages(prevPages => {
      const result = Array.from(prevPages);
      const [removed] = result.splice(oldIndex, 1);
      result.splice(newIndex, 0, removed);
      addToHistory(result);
      return result;
    });
  }, [addToHistory]);

  const handlePageSelect = useCallback((pageId: string) => {
    setSelectedPages((prev) => {
      const newSelected = new Set(prev);
      if (newSelected.has(pageId)) {
        newSelected.delete(pageId);
      } else {
        newSelected.add(pageId);
      }
      return newSelected;
    });
  }, []);

  const deleteSelectedPages = useCallback(() => {
    const pagesToDelete = pages.filter((page) => selectedPages.has(page.id));
    setDeletedPages(prev => [...prev, ...pagesToDelete]);
    setPages(prevPages => {
      const newPages = prevPages.filter((page) => !selectedPages.has(page.id));
      addToHistory(newPages);
      return newPages;
    });
    setSelectedPages(new Set());
    toast.success('Pages déplacées vers la corbeille');
  }, [pages, selectedPages, addToHistory]);

  const restorePage = useCallback((pageId: string) => {
    const pageToRestore = deletedPages.find(page => page.id === pageId);
    if (pageToRestore) {
      setDeletedPages(prev => prev.filter(page => page.id !== pageId));
      setPages(prev => {
        const newPages = [...prev, pageToRestore];
        addToHistory(newPages);
        return newPages;
      });
      toast.success('Page restaurée');
    }
  }, [deletedPages, addToHistory]);

  const permanentDeletePage = useCallback((pageId: string) => {
    setDeletedPages(prev => prev.filter(page => page.id !== pageId));
    toast.success('Page supprimée définitivement');
  }, []);

  const undo = useCallback(() => {
    const previousPages = undoHistory();
    if (previousPages) {
      setPages(previousPages);
    }
  }, [undoHistory]);

  const redo = useCallback(() => {
    const nextPages = redoHistory();
    if (nextPages) {
      setPages(nextPages);
    }
  }, [redoHistory]);

  const exportPDF = useCallback(async (options: ExportOptions, exportMode: 'all' | 'selection' = 'all') => {
    const pagesToExport = exportMode === 'all' 
      ? pages 
      : pages.filter(page => selectedPages.has(page.id));
    
    const pdfBytes = await mergePages(pagesToExport);
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = options.filename || 'merged.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success(`PDF ${exportMode === 'all' ? '' : 'sélectionné '}exporté avec succès`);
  }, [pages, selectedPages]);

  return {
    pages,
    selectedPages,
    deletedPages,
    previewPage,
    setPreviewPage,
    addPages,
    reorderPages,
    handlePageSelect,
    deleteSelectedPages,
    restorePage,
    permanentDeletePage,
    undo,
    redo,
    canUndo,
    canRedo,
    exportPDF,
    hasSelection: selectedPages.size > 0,
    hasPages: pages.length > 0
  };
}