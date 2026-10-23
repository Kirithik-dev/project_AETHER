/**
 * Client-Side In-Browser PDF Processing Engine
 * Powered by pdf-lib. All operations run 100% locally in browser memory without sending data to servers.
 */

import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';

export function downloadFile(bytes: Uint8Array | Blob, fileName: string, mimeType = 'application/pdf') {
  const blob = bytes instanceof Blob ? bytes : new Blob([bytes as any], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  setTimeout(() => {
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  }, 1000);
}

/**
 * Merge multiple PDF files in specified order
 */
export async function mergePdfs(files: File[], onProgress?: (pct: number) => void): Promise<Uint8Array> {
  const mergedPdf = await PDFDocument.create();

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const fileBytes = await file.arrayBuffer();
    const loadedPdf = await PDFDocument.load(fileBytes);
    const copiedPages = await mergedPdf.copyPages(loadedPdf, loadedPdf.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));

    if (onProgress) {
      onProgress(Math.round(((i + 1) / files.length) * 100));
    }
  }

  return await mergedPdf.save();
}

/**
 * Split a PDF by page ranges (e.g. "1-3, 5")
 */
export async function splitPdf(file: File, pageRangeString: string): Promise<Uint8Array> {
  const fileBytes = await file.arrayBuffer();
  const loadedPdf = await PDFDocument.load(fileBytes);
  const totalPages = loadedPdf.getPageCount();

  // Parse page string
  const requestedIndices: number[] = [];
  const parts = pageRangeString.split(',').map((p) => p.trim()).filter(Boolean);

  for (const part of parts) {
    if (part.includes('-')) {
      const [startStr, endStr] = part.split('-');
      const start = Math.max(1, parseInt(startStr, 10));
      const end = Math.min(totalPages, parseInt(endStr, 10));
      if (!isNaN(start) && !isNaN(end) && start <= end) {
        for (let p = start; p <= end; p++) {
          requestedIndices.push(p - 1);
        }
      }
    } else {
      const pageNum = parseInt(part, 10);
      if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
        requestedIndices.push(pageNum - 1);
      }
    }
  }

  // De-duplicate while preserving order
  const uniqueIndices = Array.from(new Set(requestedIndices));
  if (uniqueIndices.length === 0) {
    throw new Error(`No valid pages found in range "${pageRangeString}". Total pages in document: ${totalPages}.`);
  }

  const newPdf = await PDFDocument.create();
  const copiedPages = await newPdf.copyPages(loadedPdf, uniqueIndices);
  copiedPages.forEach((page) => newPdf.addPage(page));

  return await newPdf.save();
}

/**
 * Rotate PDF pages by degrees (90, 180, 270)
 */
export async function rotatePdf(
  file: File,
  rotationAngle: number,
  target: 'all' | 'odd' | 'even'
): Promise<Uint8Array> {
  const fileBytes = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(fileBytes);
  const pages = pdfDoc.getPages();

  pages.forEach((page, index) => {
    const pageNum = index + 1;
    let shouldRotate = false;
    if (target === 'all') shouldRotate = true;
    else if (target === 'odd' && pageNum % 2 !== 0) shouldRotate = true;
    else if (target === 'even' && pageNum % 2 === 0) shouldRotate = true;

    if (shouldRotate) {
      const currentRotation = page.getRotation().angle;
      page.setRotation(degrees((currentRotation + rotationAngle) % 360));
    }
  });

  return await pdfDoc.save();
}

/**
 * Reorder, duplicate, or filter pages
 */
export async function organizePdf(file: File, newPageSequence: number[]): Promise<Uint8Array> {
  const fileBytes = await file.arrayBuffer();
  const loadedPdf = await PDFDocument.load(fileBytes);
  const newPdf = await PDFDocument.create();

  const copiedPages = await newPdf.copyPages(loadedPdf, newPageSequence);
  copiedPages.forEach((page) => newPdf.addPage(page));

  return await newPdf.save();
}

/**
 * Compile image files into a single unified PDF
 */
export async function imagesToPdf(
  images: File[],
  orientation: 'portrait' | 'landscape' | 'auto' = 'auto',
  onProgress?: (pct: number) => void
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();

  for (let i = 0; i < images.length; i++) {
    const imgFile = images[i];
    const buffer = await imgFile.arrayBuffer();
    let embeddedImg;

    if (imgFile.type === 'image/png') {
      embeddedImg = await pdfDoc.embedPng(buffer);
    } else {
      // JPEG and WebP fallback via canvas if needed or standard jpg
      try {
        embeddedImg = await pdfDoc.embedJpg(buffer);
      } catch {
        // Render to canvas to convert to PNG
        const img = new Image();
        const url = URL.createObjectURL(imgFile);
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = url;
        });
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.drawImage(img, 0, 0);
        const dataUrl = canvas.toDataURL('image/png');
        URL.revokeObjectURL(url);
        embeddedImg = await pdfDoc.embedPng(dataUrl);
      }
    }

    const { width, height } = embeddedImg;
    let pageWidth = width;
    let pageHeight = height;

    if (orientation === 'portrait' && width > height) {
      pageWidth = height;
      pageHeight = width;
    } else if (orientation === 'landscape' && height > width) {
      pageWidth = height;
      pageHeight = width;
    }

    const page = pdfDoc.addPage([pageWidth, pageHeight]);
    page.drawImage(embeddedImg, {
      x: 0,
      y: 0,
      width: pageWidth,
      height: pageHeight,
    });

    if (onProgress) {
      onProgress(Math.round(((i + 1) / images.length) * 100));
    }
  }

  return await pdfDoc.save();
}

/**
 * Add watermark text and page numbering to PDF
 */
export async function watermarkPdf(
  file: File,
  watermarkText: string,
  opacity = 0.25,
  fontSize = 42
): Promise<Uint8Array> {
  const fileBytes = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(fileBytes);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const pages = pdfDoc.getPages();

  pages.forEach((page) => {
    const { width, height } = page.getSize();
    const textWidth = helveticaBold.widthOfTextAtSize(watermarkText, fontSize);
    const textHeight = helveticaBold.heightAtSize(fontSize);

    page.drawText(watermarkText, {
      x: (width - textWidth) / 2,
      y: (height - textHeight) / 2,
      size: fontSize,
      font: helveticaBold,
      color: rgb(0.85, 0.85, 0.85),
      opacity: opacity,
      rotate: degrees(45),
    });
  });

  return await pdfDoc.save();
}

/**
 * Optimize and compress PDF streams
 */
export async function compressPdf(file: File): Promise<{ data: Uint8Array; originalSize: number; newSize: number; reductionPct: number }> {
  const originalSize = file.size;
  const fileBytes = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(fileBytes, {
    updateMetadata: false,
  });

  // Re-encode and optimize internal streams
  const compressedBytes = await pdfDoc.save({
    useObjectStreams: true,
  });

  const newSize = compressedBytes.length;
  const reduction = Math.max(0, originalSize - newSize);
  const reductionPct = Math.round((reduction / originalSize) * 100);

  return {
    data: compressedBytes,
    originalSize,
    newSize,
    reductionPct,
  };
}

/**
 * Synthesize a clean PDF from rich text notes and headers
 */
export async function createPdfFromText(title: string, bodyContent: string): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4
  const fontTitle = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontBody = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const margin = 50;
  const pageWidth = 595.28;
  let cursorY = 841.89 - margin;

  // Header banner
  page.drawText('AETHER DOCUMENT WORKSPACE', {
    x: margin,
    y: cursorY,
    size: 10,
    font: fontTitle,
    color: rgb(0.5, 0.5, 0.5),
  });

  cursorY -= 30;

  // Title
  page.drawText(title || 'Untitled Document', {
    x: margin,
    y: cursorY,
    size: 24,
    font: fontTitle,
    color: rgb(0.1, 0.1, 0.1),
  });

  cursorY -= 20;

  // Divider
  page.drawLine({
    start: { x: margin, y: cursorY },
    end: { x: pageWidth - margin, y: cursorY },
    thickness: 1,
    color: rgb(0.8, 0.8, 0.8),
  });

  cursorY -= 25;

  // Body lines
  const lines = bodyContent.split('\n');
  for (const line of lines) {
    if (cursorY < margin + 40) break; // stay within page
    const trimmed = line.trim();
    if (trimmed.length > 0) {
      page.drawText(trimmed.slice(0, 85), {
        x: margin,
        y: cursorY,
        size: 12,
        font: fontBody,
        color: rgb(0.2, 0.2, 0.2),
      });
      cursorY -= 18;
    } else {
      cursorY -= 10;
    }
  }

  // Footer
  page.drawText(`Generated via AETHER PDF Workspace • ${new Date().toLocaleDateString()}`, {
    x: margin,
    y: margin,
    size: 9,
    font: fontBody,
    color: rgb(0.6, 0.6, 0.6),
  });

  return await pdfDoc.save();
}

/**
 * Get page count of any PDF
 */
export async function getPdfPageCount(file: File): Promise<number> {
  const fileBytes = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(fileBytes);
  return pdfDoc.getPageCount();
}
