import { useState } from 'react';
import { getFileType, getFileIcon, canPreviewInline, getFilenameFromUrl } from '../utils/filePreview';
import './FilePreview.css';

const FilePreview = ({ 
  fileUrl, 
  fileName, 
  showDownloadLink = true, 
  maxHeight = '400px',
  className = '' 
}) => {
  const [imageError, setImageError] = useState(false);

  if (!fileUrl) return null;

  const fileType = getFileType(fileUrl);
  const displayName = fileName || getFilenameFromUrl(fileUrl);
  const fileIcon = getFileIcon(fileType);
  const canPreview = canPreviewInline(fileType);

  const handleImageError = () => {
    setImageError(true);
  };

  const renderPreview = () => {
    if (!canPreview || imageError) {
      return (
        <div className="file-preview-fallback">
          <div className="file-preview-icon">
            <span className="file-icon">{fileIcon}</span>
          </div>
          <div className="file-preview-info">
            <p className="file-name">{displayName}</p>
            <p className="file-type">Click to view or download</p>
          </div>
        </div>
      );
    }

    switch (fileType) {
      case 'image':
        return (
          <div className="file-preview-image-container">
            <img
              src={fileUrl}
              alt={displayName}
              className="file-preview-image"
              style={{ maxHeight }}
              onError={handleImageError}
            />
          </div>
        );

      case 'video':
        return (
          <div className="file-preview-video-container">
            <video
              controls
              className="file-preview-video"
              style={{ maxHeight }}
              preload="metadata"
            >
              <source src={fileUrl} />
              Your browser does not support the video tag.
            </video>
          </div>
        );

      case 'audio':
        return (
          <div className="file-preview-audio-container">
            <div className="audio-info">
              <span className="file-icon">{fileIcon}</span>
              <span className="file-name">{displayName}</span>
            </div>
            <audio
              controls
              className="file-preview-audio"
              preload="metadata"
            >
              <source src={fileUrl} />
              Your browser does not support the audio tag.
            </audio>
          </div>
        );

      case 'pdf':
        return (
          <div className="file-preview-pdf-container">
            <div className="pdf-header">
              <span className="file-icon">{fileIcon}</span>
              <span className="file-name">{displayName}</span>
            </div>
            <iframe
              src={`${fileUrl}#toolbar=1&navpanes=1&scrollbar=1`}
              className="file-preview-pdf"
              style={{ height: maxHeight }}
              title={displayName}
            />
          </div>
        );

      default:
        return (
          <div className="file-preview-fallback">
            <div className="file-preview-icon">
              <span className="file-icon">{fileIcon}</span>
            </div>
            <div className="file-preview-info">
              <p className="file-name">{displayName}</p>
              <p className="file-type">Preview not available</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className={`file-preview-container ${className}`}>
      <div className="file-preview-content">
        {renderPreview()}
      </div>
      
      {showDownloadLink && (
        <div className="file-preview-actions">
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="file-download-link"
            download={displayName}
          >
            <span className="download-icon">⬇️</span>
            Download {displayName}
          </a>
        </div>
      )}
    </div>
  );
};

export default FilePreview;