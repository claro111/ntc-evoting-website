import { useState } from 'react';
import './DocumentViewerModal.css';

const DocumentViewerModal = ({ isOpen, onClose, documentUrl, documentName, voterName }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleLoad = () => {
    setLoading(false);
    setError(false);
  };

  const handleError = () => {
    setLoading(false);
    setError(true);
  };

  const getFileExtension = (url) => {
    if (!url) return '';
    
    // Handle Firebase Storage URLs with tokens
    const cleanUrl = url.split('?')[0]; // Remove query parameters
    const fileName = cleanUrl.split('/').pop(); // Get filename
    const extension = fileName.split('.').pop().toLowerCase();
    
    return extension;
  };

  const isImage = (url) => {
    const ext = getFileExtension(url);
    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(ext);
  };

  const isPDF = (url) => {
    const ext = getFileExtension(url);
    return ext === 'pdf' || url.includes('pdf') || documentName?.toLowerCase().includes('.pdf');
  };

  const renderDocumentContent = () => {
    if (!documentUrl) {
      return (
        <div className="document-error">
          <svg width="64" height="64" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p>No document available</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="document-error">
          <svg width="64" height="64" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p>Failed to load document</p>
          <button 
            className="retry-button"
            onClick={() => {
              setError(false);
              setLoading(true);
            }}
          >
            Retry
          </button>
        </div>
      );
    }

    if (isImage(documentUrl)) {
      return (
        <div className="document-content image-content">
          {loading && (
            <div className="document-loading">
              <div className="loading-spinner"></div>
              <p>Loading image...</p>
            </div>
          )}
          <div className="image-container">
            <img
              src={documentUrl}
              alt={documentName || 'Verification Document'}
              onLoad={handleLoad}
              onError={handleError}
              style={{ display: loading ? 'none' : 'block' }}
              className="document-image"
            />
          </div>
        </div>
      );
    }

    if (isPDF(documentUrl)) {
      return (
        <div className="document-content pdf-content">
          {loading && (
            <div className="document-loading">
              <div className="loading-spinner"></div>
              <p>Loading PDF...</p>
            </div>
          )}
          <iframe
            src={`${documentUrl}#view=FitH&zoom=125`}
            title={documentName || 'Verification Document'}
            onLoad={handleLoad}
            onError={handleError}
            style={{ display: loading ? 'none' : 'block' }}
            className="document-pdf"
            allow="fullscreen"
          />
        </div>
      );
    }

    // For Word documents, try to preview using Google Docs Viewer
    const isWordDoc = (url) => {
      const ext = getFileExtension(url);
      return ['doc', 'docx'].includes(ext);
    };

    if (isWordDoc(documentUrl)) {
      return (
        <div className="document-content pdf-content">
          {loading && (
            <div className="document-loading">
              <div className="loading-spinner"></div>
              <p>Loading document...</p>
            </div>
          )}
          <iframe
            src={`https://docs.google.com/gview?url=${encodeURIComponent(documentUrl)}&embedded=true`}
            title={documentName || 'Verification Document'}
            onLoad={handleLoad}
            onError={handleError}
            style={{ display: loading ? 'none' : 'block' }}
            className="document-pdf"
          />
        </div>
      );
    }

    // For other file types, show preview attempt and download option
    return (
      <div className="document-unsupported">
        <svg width="64" height="64" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p>Document Preview</p>
        <p className="file-type-info">File type: {getFileExtension(documentUrl).toUpperCase()}</p>
        <div className="document-actions">
          <a 
            href={documentUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="preview-button"
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Open in New Tab
          </a>
          <a 
            href={documentUrl} 
            download
            className="download-button"
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download
          </a>
        </div>
      </div>
    );
  };

  return (
    <div className="document-modal-overlay" onClick={onClose}>
      <div className="document-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="document-modal-header">
          <div className="document-modal-title">
            <h3>Verification Document</h3>
            <p>{voterName}</p>
            {documentName && <span className="document-name">{documentName}</span>}
          </div>
          <div className="document-modal-actions">
            {documentUrl && (
              <a 
                href={documentUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="open-external-button"
                title="Open in new tab"
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            )}
            <button className="document-modal-close" onClick={onClose}>
              <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="document-modal-body">
          {renderDocumentContent()}
        </div>
      </div>
    </div>
  );
};

export default DocumentViewerModal;