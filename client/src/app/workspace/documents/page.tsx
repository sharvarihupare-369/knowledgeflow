"use client";

import { useState } from "react";
import { Upload } from "lucide-react";
import { useDocuments } from "@/hooks/useDocuments";
import { Button } from "@/components/ui/Button";
import { DocumentCard } from "@/components/workspace/DocumentCard";
import { UploadDocumentModal } from "@/components/workspace/UploadDocumentModal";

export default function DocumentsPage() {
  const { data: documents = [], isLoading } = useDocuments();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Documents</h1>
          <p className="mt-1 text-sm text-zinc-500">Everything your team has uploaded across all collections.</p>
        </div>
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
        >
          <Upload className="h-4 w-4" />
          Upload Document
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-blue-600"></div>
        </div>
      ) : documents.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 p-12 text-center">
          <h3 className="text-lg font-medium text-zinc-900">No documents yet</h3>
          <p className="mt-2 text-sm text-zinc-500">Upload documents to start building your knowledge base.</p>
          <Button onClick={() => setIsModalOpen(true)} className="mt-6 bg-blue-600 hover:bg-blue-700 text-white">
            Upload your first document
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {documents.map(doc => (
            <DocumentCard key={doc.id} document={doc} />
          ))}
        </div>
      )}

      <UploadDocumentModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
}
