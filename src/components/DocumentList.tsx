import React, { useState, useEffect } from 'react';
import { Trash2, RefreshCw, AlertCircle } from 'lucide-react';
import { documentApi, Document } from '@/services/documentApi';

function DocumentList() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      const docs = await documentApi.getAll();
      setDocuments(docs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDocuments(); }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this document?')) {return;}
    try {
      setDeletingIds(prev => new Set(prev).add(id));
      await documentApi.deleteById(id);
      setDocuments(prev => prev.filter(doc => doc.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete document');
    } finally {
      setDeletingIds(prev => { const ns = new Set(prev); ns.delete(id); 
        
        return ns; });
    }
  };

  const getTitle = (doc: Document) =>
    doc.Name || doc.title || doc.filename || doc.fileName || 'Untitled Document';

  const getSummary = (doc: Document) =>
    doc.content ? (doc.content.length > 200 ? `${doc.content.slice(0,200)}...` : doc.content) : 'No content available';

  if (loading) {
    return (
      <>
        <style>{`
          .card.centered { text-align: center; padding: 2rem; background:#fff; border-radius:10px; box-shadow:0 2px 6px rgba(0,0,0,0.08);}
          .spin { animation: spin 1s linear infinite; }
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
        <div className="card centered">
          <RefreshCw className="spin" size={28} />
          <p>Loading documents...</p>
          <small>⏱️ Azure AI Search may take a minute</small>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <style>{`
          .card.error { background:#fff3f3; border:1px solid #e0b4b4; padding:1rem; border-radius:8px;}
          .error-message { display:flex; align-items:center; gap:0.5rem; color:#b00020; margin-bottom:1rem;}
        `}</style>
        <div className="card error">
          <div className="error-message">
            <AlertCircle size={20}/> <span>{error}</span>
          </div>
          <button onClick={fetchDocuments}>🔄 Try Again</button>
        </div>
      </>
    );
  }

  if (documents.length === 0) {
    return (
      <>
        <style>{`
          .card.empty { text-align:center; padding:2rem; background:#fff; border-radius:10px; box-shadow:0 2px 6px rgba(0,0,0,0.08);}
        `}</style>
        <div className="card empty">
          <div>📂</div>
          <h3>No documents found</h3>
          <p>Upload some documents to get started</p>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{`
        .card { background:#fff; padding:1.5rem; border-radius:10px; box-shadow:0 2px 6px rgba(0,0,0,0.08);}
        .list-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;}
        .doc-grid { display:grid; gap:1rem; }
        .doc-item { border:1px solid #e0e0e0; border-radius:8px; padding:1rem; background:#fafafa; transition:box-shadow 0.2s;}
        .doc-item:hover { box-shadow:0 2px 10px rgba(0,0,0,0.08);}
        .doc-top { display:flex; justify-content:space-between; align-items:center;}
        .doc-meta p { margin:0.25rem 0; font-size:0.9rem;}
        .doc-summary { margin-top:0.75rem; font-size:0.9rem; color:#555;}
        .delete-btn { background:none; border:none; color:#b00020; cursor:pointer;}
      `}</style>

      <div className="card">
        <div className="list-header">
          <h2>Documents ({documents.length})</h2>
          <button onClick={fetchDocuments}>🔄 Refresh</button>
        </div>
        <div className="doc-grid">
          {documents.map(doc => (
            <div key={doc.id} className="doc-item">
              <div className="doc-top">
                <h4>{getTitle(doc)}</h4>
                <button
                  className="delete-btn"
                  disabled={deletingIds.has(doc.id)}
                  onClick={() => handleDelete(doc.id)}
                >
                  {deletingIds.has(doc.id) ? '...' : <Trash2 size={16} />}
                </button>
              </div>
              <div className="doc-meta">
                {doc.Email && <p><strong>Email:</strong> {doc.Email}</p>}
                {doc.PhoneNo && <p><strong>Phone:</strong> {doc.PhoneNo}</p>}
                {doc.filename && <p><strong>File:</strong> {doc.filename}</p>}
              </div>
              <p className="doc-summary">{getSummary(doc)}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default DocumentList;
