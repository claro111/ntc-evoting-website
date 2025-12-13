import { useState, useRef } from 'react';
import FilePreview from './FilePreview';
import './FileUpload.css';

const FileUpload = ({
  onFileSelect,
  accept = "image/*",
  maxSize = 5 * 1024 * 1024, // 5MB default
  multiple = false,
  disabled = false,
  currentFile = null,
  placeholder = "Choose file...",
  className = "",
  showPreview = true,
  uploadType = "image" // "image", "document", "any"
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (disabled) return;
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelection(files[0]);
    }
  };

  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFileSelection(files[0]);
    }
  };

  const handleFileSelection = (file) => {
    // Validate file size
    if (file.size > maxSize) {
      const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
      alert(`File size must be less than ${maxSizeMB}MB`);
      return;
    }

    // Set preview for any file type if showPreview is enabled
    if (showPreview) {
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview(null);
    }

    // Call parent callback
    onFileSelect(file);
  };

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const clearFile = () => {
    // Clean up object URL if it exists
    if (preview && typeof preview === 'string' && preview.startsWith('blob:')) {
      URL.revokeObjectURL(preview);
    }
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onFileSelect(null);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) return '🖼️';
    if (fileType === 'application/pdf') return '📄';
    if (fileType.includes('word')) return '📝';
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return '📊';
    if (fileType.includes('zip')) return '🗜️';
    return '📎';
  };

  return (
    <div className={`file-upload-container ${className}`}>
      <div
        className={`file-upload-area ${dragActive ? 'drag-active' : ''} ${disabled ? 'disabled' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileChange}
          disabled={disabled}
          className="file-input-hidden"
        />

        {preview && currentFile ? (
          <div className="file-upload-preview">
            <div className="file-upload-preview-header">
              <span className="selected-file-label">Selected File:</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  clearFile();
                }}
                className="clear-file-btn"
                disabled={disabled}
                title="Remove file"
              >
                ✕
              </button>
            </div>
            <FilePreview
              fileUrl={preview}
              fileName={currentFile.name}
              maxHeight="200px"
              showDownloadLink={false}
              className="upload-preview"
            />
          </div>
        ) : currentFile ? (
          <div className="current-file">
            <div className="file-info">
              <span className="file-icon">{getFileIcon(currentFile.type || 'application/octet-stream')}</span>
              <div className="file-details">
                <span className="file-name">{currentFile.name || 'Current file'}</span>
                {currentFile.size && (
                  <span className="file-size">{formatFileSize(currentFile.size)}</span>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                clearFile();
              }}
              className="clear-file-btn"
              disabled={disabled}
            >
              ✕
            </button>
          </div>
        ) : (
          <div className="file-upload-prompt">
            <div className="upload-icon">
              {uploadType === 'image' ? '📷' : uploadType === 'document' ? '📄' : '📎'}
            </div>
            <div className="upload-text">
              <p className="upload-primary">{placeholder}</p>
              <p className="upload-secondary">
                Drag and drop or click to browse
              </p>
              <p className="upload-hint">
                Max size: {formatFileSize(maxSize)}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;