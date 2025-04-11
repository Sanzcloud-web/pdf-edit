// Dans src/utils/pdfUtils.ts - Implémentation de la fonction de recadrage

import { PDFDocument } from 'pdf-lib';
import { Page } from '../types';

export async function extractPagesFromPDF(file: File): Promise<Page[]> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const pdfPages = pdfDoc.getPages();

  return Promise.all(
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
}

export async function mergePages(pages: Page[]): Promise<Uint8Array> {
  const mergedPdf = await PDFDocument.create();
  
  for (const page of pages) {
    const pdfDoc = await PDFDocument.load(page.data);
    const [copiedPage] = await mergedPdf.copyPages(pdfDoc, [0]);
    mergedPdf.addPage(copiedPage);
  }

  return mergedPdf.save();
}

export async function rotatePage(page: Page, degrees: number): Promise<Page> {
  const pdfDoc = await PDFDocument.load(page.data);
  const pdfPage = pdfDoc.getPages()[0];
  
  pdfPage.setRotation({
    type: 'degrees' as any,
    angle: degrees
  });
  
  const pdfBytes = await pdfDoc.save();
  
  return {
    ...page,
    data: pdfBytes,
    rotation: degrees,
    thumbnail: URL.createObjectURL(new Blob([pdfBytes], { type: 'application/pdf' }))
  };
}

// Implémentation améliorée de la fonction de recadrage
export async function cropPage(
  page: Page, 
  cropArea: { x: number, y: number, width: number, height: number }
): Promise<Page> {
  try {
    const pdfDoc = await PDFDocument.load(page.data);
    const pdfPage = pdfDoc.getPages()[0];
    
    // Obtenir les dimensions originales de la page
    const { } = pdfPage.getSize();
    
    // Créer un nouveau document PDF pour la page recadrée
    const croppedDoc = await PDFDocument.create();
    
    // Copier la page originale vers le nouveau document
    const [copiedPage] = await croppedDoc.copyPages(pdfDoc, [0]);
    
    // Ajuster les dimensions de la nouvelle page
    copiedPage.setSize(cropArea.width, cropArea.height);
    
    // Appliquer le recadrage en déplaçant le contenu
    // Cela fonctionne en "déplaçant" le contenu de la page dans la direction opposée au recadrage
    copiedPage.translateContent(-cropArea.x, -cropArea.y);
    
    // Si la page a une rotation, nous devons l'ajuster
    if (page.rotation) {
      copiedPage.setRotation({
        type: 'degrees' as any,
        angle: page.rotation
      });
    }
    
    // Ajouter la page recadrée au document
    croppedDoc.addPage(copiedPage);
    
    // Sauvegarder le document recadré
    const pdfBytes = await croppedDoc.save();
    
    // Retourner la page mise à jour
    return {
      ...page,
      data: pdfBytes,
      thumbnail: URL.createObjectURL(new Blob([pdfBytes], { type: 'application/pdf' }))
    };
  } catch (error) {
    console.error('Erreur lors du recadrage de la page:', error);
    throw new Error('Impossible de recadrer la page PDF');
  }
}