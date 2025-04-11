// Mise à jour de src/App.tsx

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';

// Hooks
import { usePDFManager } from './hooks/usePDFManager';

// Composants
import { PDFDropzone } from './components/PDFDropzone';
import { PDFWorkspace } from './components/PDFWorkspace';
import { TrashBin } from './components/TrashBin';
import { Toolbar } from './components/Toolbar';
import { Modal } from './components/Modal';
import { ExportModal } from './components/ExportModal';

function App() {
  // Hook principal de gestion PDF - important de le garder en premier
  const pdfManager = usePDFManager();
  
  // Extraire les propriétés du gestionnaire de PDF après l'appel du hook
  const {
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
    rotatePDF,
    resizeSinglePage,  // Nouvelle fonction
    resizePages,       // Nouvelle fonction
    undo,
    redo,
    canUndo,
    canRedo,
    exportPDF,
    hasSelection,
    hasPages
  } = pdfManager;

  // États locaux pour l'UI - garder le même ordre que précédemment
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportMode, setExportMode] = useState<'all' | 'selection'>('all');
  const [thumbnailSize, setThumbnailSize] = useState(3);

  // Gestionnaires d'événements
  const handleExportSelection = () => {
    setExportMode('selection');
    setShowExportModal(true);
  };

  const handleExportAll = () => {
    setExportMode('all');
    setShowExportModal(true);
  };
  
  const handleResizeAll = () => {
    resizePages('all');
  };
  
  const handleResizeSelection = () => {
    resizePages('selection');
  };
  
  

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
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
              canUndo={canUndo}
              canRedo={canRedo}
              onExport={handleExportAll}
              onExportSelection={handleExportSelection}
              onDelete={deleteSelectedPages}
              onResize={handleResizeAll}
              onResizeSelection={handleResizeSelection}
              hasSelection={hasSelection}
              hasPages={hasPages}
            />
          </div>

          <PDFDropzone onPagesImported={addPages} />

          {pages.length > 0 && (
            <PDFWorkspace
              pages={pages}
              selectedPages={selectedPages}
              onPageSelect={handlePageSelect}
              onPreviewPage={setPreviewPage}
              onReorderPages={reorderPages}
              onRotatePage={rotatePDF}
              onResizePage={resizeSinglePage} // Nouvelle prop
              thumbnailSize={thumbnailSize}
              onChangeThumbnailSize={setThumbnailSize}
            />
          )}

          {deletedPages.length > 0 && (
            <TrashBin
              deletedPages={deletedPages}
              onRestore={restorePage}
              onDelete={permanentDeletePage}
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
      </div>
      {/* Remplacer iframe par object */}
      <object
        data={previewPage.thumbnail}
        type="application/pdf"
        className="w-full h-[80vh] rounded-lg"
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
  </Modal>
)}

      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExport={exportPDF}
        mode={exportMode}
      />
  
    </div>
  );
}

export default App;