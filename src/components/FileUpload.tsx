import React, { useState, useCallback, useRef } from 'react';
import { Upload, FileText, X, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { documentApi } from '@/services/documentApi';

interface FileUploadProps {
  onUploadSuccess: () => void;
}

function FileUpload({ onUploadSuccess }: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [uploadMessage, setUploadMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const validFiles = files.filter(file => 
      file.type === 'application/pdf' || 
      file.type === 'application/msword' ||
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.type === 'text/plain'
    );
    
    if (validFiles.length !== files.length) {
      setUploadMessage('Some files were skipped. Only PDF, DOC, DOCX, and TXT files are supported.');
      setUploadStatus('error');
    }
    
    setSelectedFiles(prev => [...prev, ...validFiles]);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => 
      file.type === 'application/pdf' || 
      file.type === 'application/msword' ||
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.type === 'text/plain'
    );
    
    if (validFiles.length !== files.length) {
      setUploadMessage('Some files were skipped. Only PDF, DOC, DOCX, and TXT files are supported.');
      setUploadStatus('error');
    }
    
    setSelectedFiles(prev => [...prev, ...validFiles]);
  }, []);


  const removeFileByFile = useCallback((fileToRemove: File) => {
    setSelectedFiles(prev => prev.filter(f => !(f.name === fileToRemove.name && f.size === fileToRemove.size)));
    setUploadStatus('idle');
    setUploadMessage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const clearAllFiles = useCallback(() => {
    setSelectedFiles([]);
    setUploadStatus('idle');
    setUploadMessage('');
    
    // Clear the file input value
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const handleUpload = useCallback(async () => {
    if (selectedFiles.length === 0) {return;}

    setIsUploading(true);
    setUploadStatus('idle');
    setUploadMessage('');

    try {
      await documentApi.uploadFiles(selectedFiles);
      setUploadStatus('success');
      setUploadMessage(`Successfully uploaded ${selectedFiles.length} file(s)`);
      setSelectedFiles([]);
      
      // Clear the file input value so the same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      onUploadSuccess();
      
      // Reset status after 3 seconds
      setTimeout(() => {
        setUploadStatus('idle');
        setUploadMessage('');
      }, 3000);
    } catch (error) {
      setUploadStatus('error');
      setUploadMessage(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  }, [selectedFiles, onUploadSuccess]);

  const openFileDialog = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const getFileIcon = (file: File) => {
    if (file.type === 'application/pdf') {return '📄';}
    if (file.type === 'application/msword') {return '📝';}
    if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {return '📝';}
    if (file.type === 'text/plain') {return '📄';}
    
return '📄';
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) {return '0 Bytes';}
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="card">
      <div style={{ marginBottom: '1.5rem' }}>
        <h3 className="section-title">Upload Resume Files</h3>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
          Drag and drop resume files here or click to browse. Supported formats: PDF, DOC, DOCX, TXT
        </p>
      </div>

      {/* Upload Area */}
      <div
        className={`upload-area ${isDragOver ? 'drag-over' : ''}`}
        style={{
          border: '2px dashed var(--border-color)',
          borderRadius: '0.5rem',
          padding: '2rem',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          backgroundColor: isDragOver ? 'var(--background-color)' : 'transparent',
          borderColor: isDragOver ? 'var(--primary-color)' : 'var(--border-color)'
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <Upload size={48} style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }} />
        <p style={{ fontSize: '1.125rem', fontWeight: '500', marginBottom: '0.5rem' }}>
          {isDragOver ? 'Drop files here' : 'Click to browse or drag files here'}
        </p>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Supported formats: PDF, DOC, DOCX, TXT
        </p>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.txt"
        style={{ display: 'none' }}
        multiple
        onChange={handleFileSelect}
      />

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <div style={{ marginTop: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h4 style={{ margin: 0 }}>Selected Files ({selectedFiles.length})</h4>
            <button
              className="btn btn-secondary"
              disabled={isUploading}
              style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
              onClick={clearAllFiles}
            >
              Clear All
            </button>
          </div>
          
          <div className="file-list">
            {selectedFiles.map((file) => (
              <div key={file.name + '-' + file.size} className="file-item" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem',
                backgroundColor: 'var(--background-color)',
                borderRadius: '0.375rem',
                marginBottom: '0.5rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '1.25rem' }}>{getFileIcon(file)}</span>
                  <div>
                    <div style={{ fontWeight: '500', fontSize: '0.875rem' }}>{file.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {formatFileSize(file.size)}
                    </div>
                  </div>
                </div>
           <button
             className="btn btn-danger"
             disabled={isUploading}
             style={{ padding: '0.25rem', minWidth: 'auto' }}
             onClick={() => removeFileByFile(file)}
           >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>

          {/* Upload Button */}
          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <button
              className="btn btn-primary"
              disabled={isUploading}
              style={{ 
                padding: '0.75rem 2rem', 
                fontSize: '1rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
              onClick={handleUpload}
            >
              {isUploading ? (
                <>
                  <Loader size={20} className="loading" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload size={20} />
                  Upload {selectedFiles.length} File{selectedFiles.length !== 1 ? 's' : ''}
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Status Messages */}
      {uploadStatus !== 'idle' && (
        <div style={{ 
          marginTop: '1.5rem',
          padding: '1rem',
          borderRadius: '0.375rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          backgroundColor: uploadStatus === 'success' ? 'var(--success-bg)' : 'var(--error-bg)',
          color: uploadStatus === 'success' ? 'var(--success-text)' : 'var(--error-text)',
          border: `1px solid ${uploadStatus === 'success' ? 'var(--success-border)' : 'var(--error-border)'}`
        }}>
          {uploadStatus === 'success' ? (
            <CheckCircle size={20} />
          ) : (
            <AlertCircle size={20} />
          )}
          <span>{uploadMessage}</span>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
