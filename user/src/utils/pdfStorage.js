/**
 * pdfStorage.js: Browser-based IndexedDB storage for uploaded PDFs.
 * Allows storing real PDF files persistently in the browser so they
 * remain accessible in the Notes section even after page refresh or restart.
 */

const DB_NAME = 'pioneer_pdf_store';
const STORE_NAME = 'uploaded_pdfs';
const DB_VERSION = 1;

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Save an uploaded PDF File / Blob into IndexedDB
 */
export async function savePdfToStorage(topicId, file, customTitle) {
  const db = await openDB();
  const id = `pdf-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
  const title = (customTitle || file.name).trim();

  // Read file as ArrayBuffer or store Blob directly
  const record = {
    id,
    topicId,
    title: title.toLowerCase().endsWith('.pdf') ? title : `${title}.pdf`,
    type: 'pdf',
    blob: file, // IndexedDB natively supports storing raw Blobs/Files
    size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
    uploadedAt: new Date().toISOString().split('T')[0]
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.put(record);

    req.onsuccess = () => {
      // Create local URL for immediate rendering
      const url = URL.createObjectURL(file);
      resolve({
        id: record.id,
        topicId: record.topicId,
        title: record.title,
        type: 'pdf',
        url,
        size: record.size,
        uploadedAt: record.uploadedAt
      });
    };
    req.onerror = () => reject(req.error);
  });
}

/**
 * Load all user-uploaded PDFs from IndexedDB
 */
export async function loadAllSavedPdfs() {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();

      req.onsuccess = () => {
        const records = req.result || [];
        const materials = records.map((rec) => ({
          id: rec.id,
          topicId: rec.topicId,
          title: rec.title,
          type: 'pdf',
          url: URL.createObjectURL(rec.blob),
          size: rec.size,
          uploadedAt: rec.uploadedAt,
          isUserUploaded: true
        }));
        resolve(materials);
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Could not read from IndexedDB, falling back to empty:', err);
    return [];
  }
}

/**
 * Delete a PDF from IndexedDB by ID
 */
export async function deletePdfFromStorage(id) {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(id);
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return false;
  }
}
