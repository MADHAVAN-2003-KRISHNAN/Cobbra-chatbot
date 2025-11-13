
// These are loaded from CDN in index.html
declare const pdfjsLib: any;
declare const mammoth: any;
declare const XLSX: any;

let isWorkerInitialized = false;

const initializePdfWorker = () => {
    if (typeof pdfjsLib !== 'undefined' && !isWorkerInitialized) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.3.136/pdf.worker.min.mjs`;
        isWorkerInitialized = true;
    }
};

const extractPdfText = async (file: File): Promise<string> => {
    initializePdfWorker();
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
    let text = '';
    for (let i = 1; i <= pdf.numPages; i++) {
        try {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            text += content.items.map((item: any) => item.str).join(' ') + '\n';
        } catch (e) {
            console.warn(`Could not get text from page ${i}`, e);
        }
    }
    return text;
};

const extractDocxText = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
};

const extractXlsxText = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    let text = '';
    workbook.SheetNames.forEach((sheetName: string) => {
        const worksheet = workbook.Sheets[sheetName];
        const csv = XLSX.utils.sheet_to_csv(worksheet);
        text += `Sheet: ${sheetName}\n${csv}\n\n`;
    });
    return text;
};

export const extractTextFromFile = async (file: File): Promise<string> => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    switch (extension) {
        case 'pdf':
            if (typeof pdfjsLib === 'undefined') throw new Error("PDF processing library not loaded.");
            return extractPdfText(file);
        case 'docx':
            if (typeof mammoth === 'undefined') throw new Error("Word document processing library not loaded.");
            return extractDocxText(file);
        case 'xlsx':
            if (typeof XLSX === 'undefined') throw new Error("Excel processing library not loaded.");
            return extractXlsxText(file);
        default:
            throw new Error(`Unsupported file type: .${extension}`);
    }
};
