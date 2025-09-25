'use client';
import React, { useState, useCallback } from 'react';
import FileUpload from '@/components/FileUpload';
import DocumentList from '@/components/DocumentList';
import { Cloud, Upload } from 'lucide-react';

export default function DocumentsPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleUploadSuccess = useCallback(() => setRefreshKey((k) => k + 1), []);
  const handleOneDriveUpload = () => alert('OneDrive upload integration coming soon!');

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };
  const handleDragLeave = () => setIsDragOver(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    // handle dropped files here if needed
  };
  const openFileDialog = () => {
    // trigger file input click inside FileUpload
    const input = document.querySelector<HTMLInputElement>('input[type=file]');
    if (input) {input.click();}
  };

  return (
    <>
      <style>{`
        :root {
          --upload-nudge: 0px; /* Adjust this to shift horizontally */
          --border-color: #ccc;
          --primary-color: #0078d4;
          --text-secondary: #666;
          --background-color: #f7f7f9;
        }
        body { font-family: Arial, sans-serif; background: #f7f7f9; color: #333; }
        .docs-container { max-width: 1000px; margin: 2rem auto; padding: 0 1rem; }
        .docs-header { text-align: center; margin-bottom: 2rem; }
        .docs-header h1 { font-size: 2rem; margin-bottom: 0.5rem; }

        .upload-card {
          background: #fff;
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 6px 18px rgba(10,20,30,0.06);
          margin-bottom: 1.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }
        .upload-title { font-weight: 700; margin-bottom: 1rem; color: #222; }

        /* Upload area centered */
        .upload-area {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          border: 2px dashed var(--border-color);
          border-radius: 0.5rem;
          padding: 2rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s ease;
          background-color: transparent;
          transform: translateX(var(--upload-nudge));
          min-height: 240px;
        }
        .upload-area.drag-over {
          background-color: var(--background-color);
          border-color: var(--primary-color);
        }
        .upload-area svg {
          color: var(--text-secondary);
          margin-bottom: 1rem;
          display: block;
        }
        .upload-area p {
          margin: 0.25rem 0;
        }

        /* OneDrive button styling */
        .onedrive-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background-color: #0078d4;
          color: #fff;
          border: none;
          padding: 0.65rem 1.2rem;
          border-radius: 8px;
          font-size: 0.95rem;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.14s ease-in-out, transform 0.12s;
          margin-top: 1.25rem;
          box-shadow: 0 6px 12px rgba(3,64,120,0.08);
        }
        .onedrive-btn:hover { background-color: #106ebe; transform: translateY(-2px); }

        .list-section { margin-top: 1.25rem; }
      `}</style>

      <div className="docs-container">
        <header className="docs-header">
          <h1>📄 Documents</h1>
          <p>Upload and manage your files. Your uploaded content will appear below.</p>
        </header>

        <section className="upload-section">
          <div className="upload-card">
           

            {/* Upload Area */}
            <div
              className={`upload-area ${isDragOver ? 'drag-over' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={openFileDialog}
            >
             
              {/* Actual file upload hidden inside */}
              <FileUpload onUploadSuccess={handleUploadSuccess} />
            </div>

            <button className="onedrive-btn" onClick={handleOneDriveUpload}>
              <Cloud size={18} />
              Upload from OneDrive
            </button>
          </div>
        </section>

        <section className="list-section">
          <DocumentList key={refreshKey} />
        </section>
      </div>
    </>
  );
}
