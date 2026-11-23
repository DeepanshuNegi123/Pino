import { useState, useEffect } from 'react';

/**
 * MaterialViewer component: Renders PDFs and PPTX presentations in a clean format.
 * - Handles CSP (Content Security Policy) restrictions gracefully.
 * - Fixes React style property conflict warnings.
 * - Provides both embedded view and fallback card with direct open & download.
 */
export default function MaterialViewer({ materials = [] }) {
  const [selectedId, setSelectedId] = useState(materials[0]?.id || null);
  const [viewMode, setViewMode] = useState('embed'); // 'embed' or 'card'

  // Whenever materials list changes (e.g. newly uploaded PDF added), auto-select first/newest item
  useEffect(() => {
    if (materials.length > 0) {
      setSelectedId(materials[0].id);
    }
  }, [materials]);

  const activeMaterial = materials.find((m) => m.id === selectedId) || materials[0];

  if (!materials.length) {
    return <div style={styles.empty}>No documents or slides attached to this course yet.</div>;
  }

  const isPdf = activeMaterial?.type?.toLowerCase() === 'pdf';

  // Microsoft Office Online viewer embed URL
  const officeViewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
    activeMaterial?.url || ''
  )}`;

  // Google Docs viewer as alternate embed option
  const googleViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(
    activeMaterial?.url || ''
  )}&embedded=true`;

  return (
    <div style={styles.container}>
      {/* 1. Header / Material Tabs */}
      <div style={styles.tabBar}>
        {materials.map((item) => {
          const isActive = item.id === (activeMaterial?.id);
          const itemIsPdf = item.type?.toLowerCase() === 'pdf';
          return (
            <button
              key={item.id}
              onClick={() => {
                setSelectedId(item.id);
                setViewMode('embed');
              }}
              style={{
                ...styles.tabBtn,
                ...(isActive ? styles.tabBtnActive : {})
              }}
            >
              <span style={styles.badge(itemIsPdf ? '#e74c3c' : '#e67e22')}>
                {itemIsPdf ? 'PDF' : 'PPTX'}
              </span>
              <span style={styles.tabTitle}>{item.title}</span>
            </button>
          );
        })}
      </div>

      {/* 2. Action Toolbar */}
      {activeMaterial && (
        <div style={styles.toolbar}>
          <div style={styles.toolbarInfo}>
            <span style={styles.badge(isPdf ? '#e74c3c' : '#e67e22')}>
              {isPdf ? 'PDF Document' : 'PPTX Presentation'}
            </span>
            <strong style={{ marginLeft: 8 }}>{activeMaterial.title}</strong>
          </div>

          <div style={styles.toolbarActions}>
            <button
              onClick={() => setViewMode(viewMode === 'embed' ? 'card' : 'embed')}
              style={styles.toggleBtn}
            >
              {viewMode === 'embed' ? 'Switch to Card View' : 'Switch to Embed View'}
            </button>
            <a
              href={activeMaterial.url}
              target="_blank"
              rel="noreferrer"
              style={styles.actionBtnSecondary}
            >
              ⤢ Open in New Tab
            </a>
            <a
              href={activeMaterial.url}
              target="_blank"
              rel="noreferrer"
              download
              style={styles.actionBtn}
            >
              ⬇ Download
            </a>
          </div>
        </div>
      )}

      {/* 3. Document / Presentation Display */}
      <div style={styles.viewerWrapper}>
        {viewMode === 'card' ? (
          // Clean Card View (always works even if third-party server blocks iframes with CSP)
          <div style={styles.cardPreview}>
            <h3 style={{ margin: '8px 0 4px', color: '#1e293b' }}>{activeMaterial.title}</h3>
            <p style={{ color: '#64748b', fontSize: '15px', maxWidth: '500px', margin: '0 auto 20px' }}>
              {isPdf
                ? 'This PDF document contains reading material and exercises.'
                : 'This PowerPoint (.pptx) contains lecture slides and presentation visuals.'}
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <a
                href={activeMaterial.url}
                target="_blank"
                rel="noreferrer"
                style={styles.cardActionPrimary}
              >
                ⤢ Open in Browser
              </a>
              <a
                href={activeMaterial.url}
                target="_blank"
                rel="noreferrer"
                download
                style={styles.cardActionSecondary}
              >
                ⬇ Download {isPdf ? 'PDF' : 'PPTX'}
              </a>
            </div>
          </div>
        ) : isPdf ? (
          // PDF Embedded Viewer using iframe (Chrome/Edge/Firefox built-in PDF reader)
          <iframe
            key={activeMaterial.url}
            src={activeMaterial.url}
            title={activeMaterial.title}
            style={styles.iframe}
          />
        ) : (
          // PPTX Embedded Viewer (Office Online Viewer)
          <div style={styles.pptxContainer}>
            <iframe
              key={activeMaterial.url}
              src={officeViewerUrl}
              title={activeMaterial.title}
              style={styles.iframe}
            />
            <div style={styles.localNotice}>
              <span>
                If the presentation preview is blocked by third-party CSP or running on localhost, click{' '}
                <a
                  href={googleViewerUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: '#1d4ed8', fontWeight: 600 }}
                >
                  View via Google Docs
                </a>{' '}
                or use <strong>"Open in New Tab"</strong>.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    borderRadius: '4px',
    border: '1px solid #e2e8f0',
    backgroundColor: '#ffffff',
    overflow: 'hidden',
    boxShadow: 'none',
    margin: '20px 0'
  },
  tabBar: {
    display: 'flex',
    gap: '8px',
    padding: '12px 16px',
    borderBottom: '1px solid #e2e8f0',
    backgroundColor: '#f8fafc',
    overflowX: 'auto'
  },
  tabBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 14px',
    borderRadius: '4px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#ffffff',
    cursor: 'pointer',
    fontSize: '15px',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap'
  },
  // Fixed: Use complete 'border' shorthand here instead of 'borderColor' to avoid React style conflict
  tabBtnActive: {
    backgroundColor: '#2563eb',
    color: '#ffffff',
    border: '1px solid #2563eb'
  },
  badge: (color) => ({
    padding: '2px 6px',
    borderRadius: '4px',
    backgroundColor: color,
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: '12px',
    display: 'inline-block'
  }),
  tabTitle: {
    fontWeight: 500
  },
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 16px',
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #f1f5f9',
    fontSize: '15px',
    flexWrap: 'wrap',
    gap: '10px'
  },
  toolbarInfo: {
    color: '#334155',
    display: 'flex',
    alignItems: 'center'
  },
  toolbarActions: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center'
  },
  toggleBtn: {
    padding: '6px 12px',
    backgroundColor: '#e2e8f0',
    color: '#1e293b',
    border: '1px solid #cbd5e1',
    borderRadius: '4px',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer'
  },
  actionBtn: {
    padding: '6px 12px',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    textDecoration: 'none',
    borderRadius: '4px',
    fontSize: '13px',
    fontWeight: 500,
    border: '1px solid #2563eb'
  },
  actionBtnSecondary: {
    padding: '6px 12px',
    backgroundColor: '#f8fafc',
    color: '#334155',
    textDecoration: 'none',
    borderRadius: '4px',
    fontSize: '13px',
    fontWeight: 500,
    border: '1px solid #cbd5e1'
  },
  viewerWrapper: {
    width: '100%',
    minHeight: '520px',
    height: '620px',
    backgroundColor: '#0f172a'
  },
  pptxContainer: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: '100%'
  },
  iframe: {
    width: '100%',
    height: '100%',
    border: 'none',
    backgroundColor: '#ffffff'
  },
  localNotice: {
    padding: '10px 16px',
    backgroundColor: '#fef3c7',
    color: '#92400e',
    fontSize: '13px',
    textAlign: 'center',
    borderTop: '1px solid #fde68a'
  },
  cardPreview: {
    height: '100%',
    backgroundColor: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
    textAlign: 'center'
  },
  cardIcon: {
    fontSize: '64px',
    marginBottom: '8px'
  },
  cardActionPrimary: {
    padding: '10px 20px',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    textDecoration: 'none',
    borderRadius: '4px',
    fontSize: '15px',
    fontWeight: 600
  },
  cardActionSecondary: {
    padding: '10px 20px',
    backgroundColor: '#f1f5f9',
    color: '#1e293b',
    textDecoration: 'none',
    borderRadius: '4px',
    fontSize: '15px',
    fontWeight: 600,
    border: '1px solid #cbd5e1'
  },
  fallbackNotice: {
    color: '#ffffff',
    textAlign: 'center',
    padding: '40px 20px'
  },
  empty: {
    padding: '30px',
    textAlign: 'center',
    color: '#64748b',
    border: '1px dashed #cbd5e1',
    borderRadius: '4px'
  }
};
