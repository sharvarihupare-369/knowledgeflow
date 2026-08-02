"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Upload, Trash2 } from "lucide-react";
import { useCollection, useDeleteCollection } from "@/hooks/useCollections";
import { useDocuments } from "@/hooks/useDocuments";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";
import Link from "next/link";
import { useUser } from "@/hooks/useUser";
import { DocumentTable } from "@/components/workspace/DocumentTable";
import { UploadDocumentModal } from "@/components/workspace/UploadDocumentModal";

export default function CollectionDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: user } = useUser();
  const { data: collection, isLoading: isCollectionLoading } = useCollection(id);
  const { data: documents = [], isLoading: isDocsLoading } = useDocuments(id);
  const { mutate: deleteCollection, isPending: isDeletingCollection } = useDeleteCollection();

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const handleDeleteCollection = () => {
    if (confirm("Are you sure you want to delete this collection and all its documents? This action cannot be undone.")) {
      deleteCollection(id, {
        onSuccess: () => {
          toast.success("Collection deleted");
          router.push('/workspace/collections');
        },
        onError: (err: any) => toast.error(err.response?.data?.message || "Failed to delete collection")
      });
    }
  };

  if (isCollectionLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-blue-600"></div>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold text-zinc-900">Collection not found</h2>
        <Link href="/workspace/collections" className="text-blue-600 mt-4 inline-block hover:underline">
          Return to collections
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Header */}
      <div>
        <Link href="/workspace/collections" className="mb-4 inline-flex items-center text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
          <ChevronLeft className="mr-1 h-4 w-4" /> Collections
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)]">{collection.name}</h1>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              {collection.description || "No description provided."} • {documents.length} documents
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={() => setIsUploadModalOpen(true)} className="bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm shadow-indigo-500/20 rounded-[10px]">
              <Upload className="mr-2 h-4 w-4" /> Upload Document
            </Button>
            <Button onClick={handleDeleteCollection} isLoading={isDeletingCollection} className="bg-transparent border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-[10px]">
              <Trash2 className="mr-2 h-4 w-4" /> Delete Collection
            </Button>
          </div>
        </div>
      </div>

      <DocumentTable 
        documents={documents} 
        isLoading={isDocsLoading} 
        user={user} 
      />

      <UploadDocumentModal 
        isOpen={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)} 
        defaultCollectionId={id} 
      />
    </div>
  );
}
