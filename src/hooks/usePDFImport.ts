import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-hot-toast';
import { extractPagesFromPDF } from '../utils/pdfUtils';
import { Page } from '../types';

interface UsePDFImportProps {
  onPagesImported: (pages: Page[]) => void;
}

export function usePDFImport({ onPagesImported }: UsePDFImportProps) {
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      for (const file of acceptedFiles) {
        if (file.type === 'application/pdf') {
          try {
            const pages = await extractPagesFromPDF(file);
            onPagesImported(pages);
            toast.success(`${file.name} importé avec succès`);
          } catch (error) {
            toast.error(`Erreur lors de l'importation de ${file.name}`);
            console.error(error);
          }
        } else {
          toast.error(`${file.name} n'est pas un fichier PDF`);
        }
      }
    },
    [onPagesImported]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
  });

  return {
    getRootProps,
    getInputProps,
    isDragActive,
  };
}