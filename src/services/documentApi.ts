import axios from 'axios';

const API_BASE_URL = 'http://localhost:7071/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Accept': 'application/json',
  },
  timeout: 300000, // 5 minutes timeout
  withCredentials: false,
});
// CORS Test endpoint
export async function corsTest(method: 'GET' | 'POST', data?: any): Promise<any> {
  if (method === 'GET') {
    const response = await api.get('/cors-test');
    
return response.data;
  } else {
    const response = await api.post('/cors-test', data);
    
return response.data;
  }
}

// Document interface
export interface Document {
  id: string;
  title?: string;
  content?: string;
  fileName?: string;
  fileSize?: number;
  uploadDate?: string;
  [key: string]: any; // Allow for additional properties from Azure AI Search
}

// API functions
export const documentApi = {
  // Get all documents
  getAll: async (): Promise<Document[]> => {
    try {
      const response = await api.get('/documents');
      const normalize = (item: any): Document => {
        const normalized: Document = {
          id: item.id || item.documentId || item.key || '',
          title: item.Name || item.title || item.filename || item.fileName || undefined,
          content:
            item.content ||
            item.Experience ||
            item.ProfessionalExperience ||
            item.CurrentKeyResponsibility ||
            item.Summary ||
            undefined,
          fileName: item.filename || item.fileName || undefined,
          fileSize: item.fileSize || item.size || undefined,
          uploadDate:
            item.uploadDate ||
            item.createdAt ||
            item.timestamp ||
            item.date ||
            undefined,
        };
        
return { ...item, ...normalized } as Document;
      };
      const data = response.data;
      const list: any[] = Array.isArray(data) ? data : Array.isArray(data?.value) ? data.value : [];
      
return list.map(normalize);
    } catch (error: any) {
        if (error.response && error.response.data && error.response.data.error) {
          throw new Error(error.response.data.error.message || 'Error fetching documents');
        }
        throw new Error(error.message || 'Error fetching documents');
    }
  },

  // Upload multiple files for resume extraction
  uploadFiles: async (files: File[]): Promise<any> => {
    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('file', file);
      });
      const response = await api.post('/ResumeExtractor', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 300000,
      });
      
return response.data;
    } catch (error: any) {
        if (error.response && error.response.data && error.response.data.error) {
          throw new Error(error.response.data.error.message || 'Error uploading files');
        }
        throw new Error(error.message || 'Error uploading files');
    }
  },

  // Delete a document by ID
  deleteById: async (id: string): Promise<void> => {
    try {
      await api.delete(`/documents/${id}`);
    } catch (error) {
      throw new Error('Failed to delete document');
    }
  },
};

export default api;
