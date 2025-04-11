import { useState, useCallback } from 'react';
import { Page } from '../types';
import { toast } from 'react-hot-toast';

export function usePDFHistory() {
  const [history, setHistory] = useState<Page[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  const addToHistory = useCallback((newPages: Page[]) => {
    setHistory(prev => [...prev.slice(0, historyIndex + 1), newPages]);
    setHistoryIndex(prev => prev + 1);
  }, [historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(prev => prev - 1);
      toast.success('Action annulée');
      return history[historyIndex - 1];
    }
    return null;
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(prev => prev + 1);
      toast.success('Action rétablie');
      return history[historyIndex + 1];
    }
    return null;
  }, [history, historyIndex]);

  return {
    addToHistory,
    undo,
    redo,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1
  };
}