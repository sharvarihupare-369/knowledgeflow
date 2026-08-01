export interface User {
  id: string;
  name: string;
  email: string;
  companyName?: string;
  role?: string;
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  organisationId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    documents: number;
  };
}

export interface Document {
  id: string;
  title: string;
  originalName: string;
  filePath: string;
  mimeType: string;
  fileSize: number;
  status: 'READY' | 'PROCESSING' | 'FAILED';
  collectionId: string;
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
}
