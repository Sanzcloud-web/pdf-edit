// Dans src/App.tsx - Mise à jour pour inclure les nouvelles fonctionnalités

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { X } from 'lucide-react';

// Hooks
import { usePDFManager } from './hooks/usePDFManager';

// Composants
import { PDFDropzone } from './components/PDFDropzone';
import { PDFWorkspace } from './components/PDFWorkspace';
import { TrashBin } from './components/TrashBin';
import { Toolbar } from './components/Toolbar';
import { Modal } from './components/Modal';
import { ExportModal } from './components/ExportModal';
import { CropModal } from './components/CropModal'; // Nouveau composant
import { AnnotationEditor } from './components/AnnotationEditor'; // Nouveau composant

function App() {
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
    rotatePDF, // Nouvelle fonction
    undo,
    redo,
    canUndo,
    canRedo,
    exportPDF,
    hasSelection,
    hasPages
  } = usePDFManager();

  const [showExportModal, setShowExportModal] = useState(false);
  const [exportMode, setExportMode] = useState<'all' | 'selection'>('all');
  
  // Nouveaux états pour les fonctionnalités
  const [thumbnailSize, setThumbnailSize] = useState(3);
  const [showCropModal, setShowCropModal] = useState(false);
  const [pageToCrop, setPageToCrop] = useState<string | null>(null);
  const [showAnnotationEditor, setShowAnnotationEditor] = useState(false);
  const [pageToAnnotate, setPageToAnnotate] = useState<string | null>(null);

  const handleExportSelection = () => {
    setExportMode('selection');
    setShowExportModal(true);
  };

  const handleExportAll = () => {
    setExportMode('all');
    setShowExportModal(true);
  };
  
  // Gestionnaires pour les nouvelles fonctionnalités
  const handleCropPage = (pageId: string) => {
    setPageToCrop(pageId);
    setShowCropModal(true);
  };
  
  const handleAnnotatePage = (pageId: string) => {
    setPageToAnnotate(pageId);
    setShowAnnotationEditor(true);
  };
  
  const handleApplyCrop = (cropArea: { x: number, y: number, width: number, height: number }) => {
    // Cette fonction serait implémentée dans usePDFManager et appelée ici
    console.log('Crop applied with:', cropArea);
    setShowCropModal(false);
  };
  
  const handleSaveAnnotation = (annotatedPdfData: Uint8Array) => {
    // Cette fonction serait implémentée dans usePDFManager et appelée ici
    console.log('Annotation saved');
    setShowAnnotationEditor(false);
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
              canUndo={canUndo}
              canRedo={canRedo}
              onExport={handleExportAll}
              onExportSelection={handleExportSelection}
              onDelete={deleteSelectedPages}
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
              onRotatePage={rotatePDF} // Ajout de la prop
              thumbnailSize={thumbnailSize} // Ajout de la prop
              onChangeThumbnailSize={setThumbnailSize} // Ajout de la prop
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
              <div className="flex items-center gap-2">
                {/* Ajout des boutons d'action pour le recadrage et les annotations */}
                <button
                  onClick={() => handleCropPage(previewPage.id)}
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 text-sm"
                >
                  Recadrer
                </button>
                <button
                  onClick={() => handleAnnotatePage(previewPage.id)}
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 text-sm"
                >
                  Annoter
                </button>
                <button
                  onClick={() => setPreviewPage(null)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>
            <iframe
              src={previewPage.thumbnail}
              className="w-full h-[80vh] rounded-lg"
              title={`Page ${previewPage.number}`}
            />
          </motion.div>
        </Modal>
      )}

      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExport={exportPDF}
        mode={exportMode}
      />
      
      {/* Nouveaux modals pour les fonctionnalités */}
      {showCropModal && pageToCrop && (
        <CropModal
          isOpen={showCropModal}
          onClose={() => setShowCropModal(false)}
          pageUrl={pages.find(p => p.id === pageToCrop)?.thumbnail || ''}
          onCrop={handleApplyCrop}
        />
      )}
      
      {showAnnotationEditor && pageToAnnotate && (
        <AnnotationEditor
          pdfUrl={pages.find(p => p.id === pageToAnnotate)?.thumbnail || ''}
          onSave={handleSaveAnnotation}
          onCancel={() => setShowAnnotationEditor(false)}
        />
      )}
    </div>
  );
}

export default App;