import { useState } from 'react';

/**
 * AdminImportModal: Direct PDF Uploader.
 * Allows selecting/dropping any PDF and instantly attaching it to
 * the selected topic so it shows directly in the Notes section.
 */
export default function AdminImportModal({
  categories = [],
  activeTopicId,
  isOpen,
  onClose,
  onPdfUpload
}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [docTitle, setDocTitle] = useState('');
  const [targetCategory, setTargetCategory] = useState(categories[0]?.category || 'Quantitative Aptitude');
  const [targetTopicId, setTargetTopicId] = useState(activeTopicId || categories[0]?.topics[0]?.id || '');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  // Available topics for selected category
  const currentCat = categories.find((c) => c.category === targetCategory) || categories[0];
  const availableTopics = currentCat?.topics || [];

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        setErrorMsg('Please select a PDF document (.pdf)');
        return;
      }
      setErrorMsg('');
      setSelectedFile(file);
      if (!docTitle) {
        setDocTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleUploadSubmit = (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMsg('Please choose a PDF file to upload.');
      return;
    }

    const resolvedTopicId = targetTopicId || availableTopics[0]?.id;
    if (!resolvedTopicId) {
      setErrorMsg('Please choose a destination topic.');
      return;
    }

    // Create local object URL for instant, zero-latency browser PDF rendering
    const objectUrl = URL.createObjectURL(selectedFile);

    const newMaterial = {
      id: `mat-${Date.now()}`,
      title: (docTitle.trim() || selectedFile.name).endsWith('.pdf')
        ? docTitle.trim() || selectedFile.name
        : `${docTitle.trim() || selectedFile.name}.pdf`,
      type: 'pdf',
      url: objectUrl,
      size: `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`,
      uploadedAt: new Date().toISOString().split('T')[0]
    };

    onPdfUpload({
      categoryName: targetCategory,
      topicId: resolvedTopicId,
      file: selectedFile,
      customTitle: docTitle
    });

    onClose();
  };

  return (
    <div className="bix-modal-backdrop" onClick={onClose}>
      <div className="bix-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="bix-modal-header">
          <div>
            <h3 className="bix-modal-title">Upload PDF to Study Notes</h3>
            <p className="bix-modal-subtitle">
              Attach formula sheets, handwritten notes, or lecture PDFs directly to any topic directory.
            </p>
          </div>
          <button type="button" className="bix-modal-close" onClick={onClose}>
            Close
          </button>
        </div>

        <form onSubmit={handleUploadSubmit}>
          <div className="bix-modal-body">
            {/* Folder & Topic Selector */}
            <div className="bix-form-row">
              <div className="bix-form-group flex-1">
                <label className="bix-label">Category Folder</label>
                <select
                  className="bix-select"
                  value={targetCategory}
                  onChange={(e) => {
                    setTargetCategory(e.target.value);
                    const newCat = categories.find((c) => c.category === e.target.value);
                    if (newCat && newCat.topics.length > 0) {
                      setTargetTopicId(newCat.topics[0].id);
                    }
                  }}
                >
                  {categories.map((c) => (
                    <option key={c.category} value={c.category}>
                      {c.category}
                    </option>
                  ))}
                </select>
              </div>

              <div className="bix-form-group flex-1">
                <label className="bix-label">Destination Topic</label>
                <select
                  className="bix-select"
                  value={targetTopicId}
                  onChange={(e) => setTargetTopicId(e.target.value)}
                >
                  {availableTopics.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Document Title */}
            <div className="bix-form-group">
              <label className="bix-label">Document Display Title</label>
              <input
                type="text"
                className="bix-input"
                placeholder="e.g. Time & Work Formula Cheatsheet"
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
              />
            </div>

            {/* Dropzone */}
            <div className="bix-dropzone">
              <input
                type="file"
                id="pdf-file-upload"
                accept=".pdf,application/pdf"
                className="bix-file-input"
                onChange={handleFileChange}
              />
              <label htmlFor="pdf-file-upload" className="bix-dropzone-label">
                <span className="bix-dropzone-text">
                  {selectedFile ? (
                    <strong>Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</strong>
                  ) : (
                    <>Click to choose a <strong>PDF file</strong> or drag and drop here</>
                  )}
                </span>
                <span className="bix-dropzone-hint">
                  The PDF will be rendered in the Notes section with full zoom, search, and reading support.
                </span>
              </label>
            </div>

            {errorMsg && <div className="bix-status-banner" style={{ background: '#fff5f5', color: '#c92a2a', borderColor: '#ffc9c9' }}>{errorMsg}</div>}
          </div>

          {/* Footer Actions */}
          <div className="bix-modal-footer">
            <button type="button" className="bix-btn bix-btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="bix-btn bix-btn-primary"
              disabled={!selectedFile}
            >
              Upload & Show in Notes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
