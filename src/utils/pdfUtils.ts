// Dans src/utils/pdfUtils.ts - Correction du type de rotation

import { PDFDocument } from 'pdf-lib';
import { Page } from '../types';

export async function extractPagesFromPDF(file: File): Promise<Page[]> {
  // Code existant inchangé
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
  // Code existant inchangé
  const mergedPdf = await PDFDocument.create();
  
  for (const page of pages) {
    const pdfDoc = await PDFDocument.load(page.data);
    const [copiedPage] = await mergedPdf.copyPages(pdfDoc, [0]);
    mergedPdf.addPage(copiedPage);
  }

  return mergedPdf.save();
}

// Correction de la fonction de rotation
export async function rotatePage(page: Page, degrees: number): Promise<Page> {
  const pdfDoc = await PDFDocument.load(page.data);
  const pdfPage = pdfDoc.getPages()[0];
  
  // Utilisation d'un cast pour résoudre le problème de type
  pdfPage.setRotation({
    type: 'degrees' as any, // Contourne la vérification de type stricte
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

// Fonction pour le recadrage
export async function cropPage(
  page: Page, 
  cropArea: { x: number, y: number, width: number, height: number }
): Promise<Page> {
  const pdfDoc = await PDFDocument.load(page.data);
  // const pdfPage = pdfDoc.getPages()[0]; // Commenté car non utilisé
  
  // TODO: Implémentation du recadrage
  // Quelque chose comme:
  // console.log(`Recadrage à appliquer: x=${cropArea.x}, y=${cropArea.y}, largeur=${cropArea.width}, hauteur=${cropArea.height}`);
  
  const pdfBytes = await pdfDoc.save();
  
  return {
    ...page,
    data: pdfBytes,
    thumbnail: URL.createObjectURL(new Blob([pdfBytes], { type: 'application/pdf' }))
  };
}