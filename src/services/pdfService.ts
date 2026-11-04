import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

interface TextItem {
  str: string;
}

function isTextItem(item: unknown): item is TextItem {
  return typeof item === 'object' && item !== null && 'str' in item && typeof (item as { str: unknown }).str === 'string';
}

export async function extractTextFromPdf(file: File): Promise<string> {
  // If an external extraction API is configured via environment variables, use that
  const customApiUrl = import.meta.env.VITE_PDF_EXTRACT_API_URL;
  if (customApiUrl) {
    const formData = new FormData();
    formData.append('pdfFile', file);
    const response = await fetch(customApiUrl, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) {
      throw new Error(`Extraction failed: ${response.statusText}`);
    }
    const data = await response.json();
    return data.text || '';
  }

  // Default: Fast, secure, 100% client-side in-browser text extraction
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
  const pdfDoc = await loadingTask.promise;
  const pageTexts: string[] = [];

  for (let i = 1; i <= pdfDoc.numPages; i++) {
    const page = await pdfDoc.getPage(i);
    const textContent = await page.getTextContent();
    const pageString = textContent.items
      .filter(isTextItem)
      .map((item) => item.str)
      .join(' ');

    if (pageString.trim()) {
      pageTexts.push(pageString.trim());
    }
  }

  const combinedText = pageTexts.join('\n\n');
  if (!combinedText.trim()) {
    throw new Error('No readable text found in this PDF.');
  }

  return combinedText;
}
