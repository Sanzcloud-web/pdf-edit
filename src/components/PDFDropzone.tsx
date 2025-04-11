import React from 'react';
import { motion } from 'framer-motion';
import { Upload } from 'lucide-react';
import { usePDFImport } from '../hooks/usePDFImport';
import { Page } from '../types';

interface PDFDropzoneProps {
  onPagesImported: (pages: Page[]) => void;
}

export function PDFDropzone({ onPagesImported }: PDFDropzoneProps) {
  const { getRootProps, getInputProps, isDragActive } = usePDFImport({
    onPagesImported
  });

  return (
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
  );
}