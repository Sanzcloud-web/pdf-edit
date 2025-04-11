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

/**
 * Redimensionne toutes les pages d'un PDF à la taille de la première page
 * en conservant le ratio d'aspect de chaque page
 * @param pdfBytes Données binaires du PDF d'entrée
 * @returns Données binaires du PDF redimensionné
 */
export async function resizePDFToFirstPage(pdfBytes: Uint8Array): Promise<Uint8Array> {
  try {
    // Ouvrir le PDF d'entrée
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pages = pdfDoc.getPages();
    
    if (pages.length === 0) {
      throw new Error("Le PDF ne contient aucune page");
    }
    
    // Obtenir la taille de la première page
    const firstPage = pages[0];
    const firstPageWidth = firstPage.getWidth();
    const firstPageHeight = firstPage.getHeight();
    
    // Créer un nouveau document pour le résultat
    const outputPdf = await PDFDocument.create();
    
    // Pour chaque page du PDF original
    for (const page of pages) {
      // Obtenir les dimensions actuelles de la page
      const pageWidth = page.getWidth();
      const pageHeight = page.getHeight();
      
      // Calculer le facteur de mise à l'échelle
      const scaleX = firstPageWidth / pageWidth;
      const scaleY = firstPageHeight / pageHeight;
      
      // Utiliser le plus petit facteur pour conserver le ratio
      const scale = Math.min(scaleX, scaleY);
      
      // Copier la page dans le nouveau document
      const [copiedPage] = await outputPdf.copyPages(pdfDoc, [pages.indexOf(page)]);
      
      // Redimensionner la page
      if (scale !== 1) {
        // Calculer les nouvelles dimensions
        const newWidth = pageWidth * scale;
        const newHeight = pageHeight * scale;
        
        // Calculer les décalages pour centrer le contenu
        const offsetX = (firstPageWidth - newWidth) / 2;
        const offsetY = (firstPageHeight - newHeight) / 2;
        
        // Appliquer la transformation
        copiedPage.scale(scale, scale);
        
        // Ajuster la taille de la mediabox pour correspondre à la première page
        copiedPage.setMediaBox(0, 0, firstPageWidth, firstPageHeight);
        
        // Positionner le contenu au centre
        if (offsetX > 0 || offsetY > 0) {
          copiedPage.translateContent(offsetX, offsetY);
        }
      }
      
      // Ajouter la page au nouveau document
      outputPdf.addPage(copiedPage);
    }
    
    // Retourner le PDF redimensionné
    return outputPdf.save();
  } catch (error) {
    console.error("Erreur lors du redimensionnement du PDF:", error);
    throw error;
  }
}

/**
 * Redimensionne un PDF à partir de ses données binaires et renvoie un objet Page
 * pour l'utiliser dans l'application
 * @param page Page à redimensionner
 * @returns Page redimensionnée
 */
export async function resizePage(page: Page): Promise<Page> {
  try {
    const pdfBytes = await resizePDFToFirstPage(page.data);
    
    return {
      ...page,
      data: pdfBytes,
      thumbnail: URL.createObjectURL(new Blob([pdfBytes], { type: 'application/pdf' }))
    };
  } catch (error) {
    console.error("Erreur lors du redimensionnement de la page:", error);
    throw error;
  }
}

/**
 * Redimensionne toutes les pages d'un PDF à la taille de la première page
 * à partir d'un tableau de Pages
 * @param pages Tableau de Pages à redimensionner
 * @returns Tableau de Pages redimensionnées
 */
export async function resizeAllPages(pages: Page[]): Promise<Page[]> {
  if (pages.length === 0) return [];
  
  // Obtenir les dimensions de la première page pour servir de référence
  const resizedPages: Page[] = [];
  
  // Collecter tous les PDF dans un seul document
  const mergedPdf = await PDFDocument.create();
  for (const page of pages) {
    const pdfDoc = await PDFDocument.load(page.data);
    const [copiedPage] = await mergedPdf.copyPages(pdfDoc, [0]);
    mergedPdf.addPage(copiedPage);
  }
  
  // Redimensionner le document entier
  const mergedPdfBytes = await mergedPdf.save();
  const resizedPdfBytes = await resizePDFToFirstPage(mergedPdfBytes);
  
  // Séparer à nouveau le document en pages individuelles
  const resizedPdfDoc = await PDFDocument.load(resizedPdfBytes);
  const resizedPdfPages = resizedPdfDoc.getPages();
  
  // Créer de nouveaux objets Page
  for (let i = 0; i < resizedPdfPages.length; i++) {
    const singlePageDoc = await PDFDocument.create();
    const [copiedPage] = await singlePageDoc.copyPages(resizedPdfDoc, [i]);
    singlePageDoc.addPage(copiedPage);
    const pdfBytes = await singlePageDoc.save();
    
    resizedPages.push({
      ...pages[i],
      data: pdfBytes,
      thumbnail: URL.createObjectURL(new Blob([pdfBytes], { type: 'application/pdf' }))
    });
  }
  
  return resizedPages;
}