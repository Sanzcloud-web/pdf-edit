import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { PDFDocument } from 'pdf-lib';
import { Upload, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';
import { PageThumbnail } from './components/PageThumbnail';
import { Modal } from './components/Modal';
import { ExportOptions } from './components/ExportOptions';
import { Toolbar } from './components/Toolbar';
import { TrashBin } from './components/TrashBin';
import { DragOverlay as CustomDragOverlay } from './components/DragOverlay';
import { DropIndicator } from './components/DropIndicator';

interface Page {
  id: string;
  number: number;
  data: Uint8Array;
  thumbnail: string;
  deleted?: boolean;
}

function App() {
  const [pages, setPages] = useState<Page[]>([]);
  const [selectedPages, setSelectedPages] = useState<Set<string>>(new Set());
  const [previewPage, setPreviewPage] = useState<Page | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [deletedPages, setDeletedPages] = useState<Page[]>([]);
  const [history, setHistory] = useState<Page[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [exportMode, setExportMode] = useState<'all' | 'selection'>('all');
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const [dropPosition, setDropPosition] = useState<'before' | 'after' | null>(null);


  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const addToHistory = useCallback((newPages: Page[]) => {
    setHistory(prev => [...prev.slice(0, historyIndex + 1), newPages]);
    setHistoryIndex(prev => prev + 1);
  }, [historyIndex]);

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(prev => prev - 1);
      setPages(history[historyIndex - 1]);
      toast.success('Action annulée');
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(prev => prev + 1);
      setPages(history[historyIndex + 1]);
      toast.success('Action rétablie');
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    for (const file of acceptedFiles) {
      if (file.type === 'application/pdf') {
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const pdfPages = pdfDoc.getPages();

        const newPages = await Promise.all(
          pdfPages.map(async (_, index) => {
            const singlePageDoc = await PDFDocument.create();
            const [copiedPage] = await singlePageDoc.copyPages(pdfDoc, [index]);
            singlePageDoc.addPage(copiedPage);
            const pdfBytes = await singlePageDoc.save();

            return {
              id: `${file.name}-${index}`,
              number: index + 1,
              data: pdfBytes,
              thumbnail: URL.createObjectURL(new Blob([pdfBytes], { type: 'application/pdf' })),
            };
          })
        );

        setPages(prevPages => {
          const updatedPages = [...prevPages, ...newPages];
          addToHistory(updatedPages);
          return updatedPages;
        });
        toast.success(`${file.name} importé avec succès`);
      }
    }
  }, [addToHistory]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
  });

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleDragOver = (event: any) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setDropTargetId(over.id);
      
      // Calculer si l'indicateur doit être affiché avant ou après la page cible
      if (over.rect) {
        const overRect = over.rect;
        const middleY = overRect.top + overRect.height / 2;
        
        // Si le pointeur est au-dessus de la moitié supérieure, placer avant
        // Sinon, placer après
        if (event.clientY < middleY) {
          setDropPosition('before');
        } else {
          setDropPosition('after');
        }
      }
    } else {
      setDropTargetId(null);
      setDropPosition(null);
    }
  };

  const handleDragEnd = (event: any) => {
    setActiveId(null);
    setDropTargetId(null);
    setDropPosition(null);
    const { active, over } = event;
    if (active.id !== over.id) {
      setPages((pages) => {
        const oldIndex = pages.findIndex((page) => page.id === active.id);
        const newIndex = pages.findIndex((page) => page.id === over.id);
        const newPages = arrayMove(pages, oldIndex, newIndex);
        addToHistory(newPages);
        return newPages;
      });
    }
  };

  const handleDragCancel = () => {
    setActiveId(null);
    setDropTargetId(null);
    setDropPosition(null);
  };

  const handlePageSelect = (pageId: string) => {
    setSelectedPages((prev) => {
      const newSelected = new Set(prev);
      if (newSelected.has(pageId)) {
        newSelected.delete(pageId);
      } else {
        newSelected.add(pageId);
      }
      return newSelected;
    });
  };

  const handleDeleteSelected = () => {
    const pagesToDelete = pages.filter((page) => selectedPages.has(page.id));
    setDeletedPages(prev => [...prev, ...pagesToDelete]);
    setPages(prevPages => {
      const newPages = prevPages.filter((page) => !selectedPages.has(page.id));
      addToHistory(newPages);
      return newPages;
    });
    setSelectedPages(new Set());
    toast.success('Pages déplacées vers la corbeille');
  };

  const handleRestorePage = (pageId: string) => {
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
  };

  const handlePermanentDelete = (pageId: string) => {
    setDeletedPages(prev => prev.filter(page => page.id !== pageId));
    toast.success('Page supprimée définitivement');
  };

  const handleExport = async (options: { filename: string; quality: string }) => {
    const mergedPdf = await PDFDocument.create();
    const pagesToExport = exportMode === 'all' 
      ? pages 
      : pages.filter(page => selectedPages.has(page.id));
    
    for (const page of pagesToExport) {
      const pdfDoc = await PDFDocument.load(page.data);
      const [copiedPage] = await mergedPdf.copyPages(pdfDoc, [0]);
      mergedPdf.addPage(copiedPage);
    }

    const pdfBytes = await mergedPdf.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = options.filename || 'merged.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setShowExportModal(false);
    toast.success(`PDF ${exportMode === 'all' ? '' : 'sélectionné '}exporté avec succès`);
  };

  const handleExportSelection = () => {
    setExportMode('selection');
    setShowExportModal(true);
  };

  const handleExportAll = () => {
    setExportMode('all');
    setShowExportModal(true);
  };

  const activePage = activeId ? pages.find(page => page.id === activeId) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          <div className="flex justify-between items-center mb-8">
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text"
            >
              Gestionnaire de PDF
            </motion.h1>
            <Toolbar
              onUndo={undo}
              onRedo={redo}
              canUndo={historyIndex > 0}
              canRedo={historyIndex < history.length - 1}
              onExport={handleExportAll}
              onExportSelection={handleExportSelection}
              onDelete={handleDeleteSelected}
              hasSelection={selectedPages.size > 0}
              hasPages={pages.length > 0}
            />
          </div>

          <motion.div
            className="relative mb-8"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
                isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
              }`}
            >
            <input {...getInputProps()} />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Upload className="mx-auto mb-4 text-blue-500" size={48} />
              <p className="text-lg text-gray-600">
                Glissez-déposez des fichiers PDF ici, ou cliquez pour sélectionner
              </p>
            </motion.div>
            </div>
          </motion.div>

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
          onSelect={() => handlePageSelect(page.id)}
          onPreview={() => setPreviewPage(page)}
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

          {deletedPages.length > 0 && (
            <TrashBin
              deletedPages={deletedPages}
              onRestore={handleRestorePage}
              onDelete={handlePermanentDelete}
            />
          )}
        </motion.div>
      </div>

      {previewPage && (
        <Modal onClose={() => setPreviewPage(null)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-2xl shadow-2xl p-6 max-w-4xl w-full"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-gray-800">
                Page {previewPage.number}
              </h2>
              <button
                onClick={() => setPreviewPage(null)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <iframe
              src={previewPage.thumbnail}
              className="w-full h-[80vh] rounded-lg"
              title={`Page ${previewPage.number}`}
            />
          </motion.div>
        </Modal>
      )}

      {showExportModal && (
        <ExportOptions
          onExport={handleExport}
          onClose={() => setShowExportModal(false)}
        />
      )}
    </div>
  );
}

export default App;