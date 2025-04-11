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