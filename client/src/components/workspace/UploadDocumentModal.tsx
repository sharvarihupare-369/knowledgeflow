import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useUploadDocument } from "@/hooks/useDocuments";
import { useCollections } from "@/hooks/useCollections";
import { toast } from "sonner";

interface UploadDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCollectionId?: string;
}

export function UploadDocumentModal({ isOpen, onClose, defaultCollectionId }: UploadDocumentModalProps) {
  const { data: collections = [] } = useCollections();
  const { mutate: uploadDocument, isPending } = useUploadDocument();
  
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [collectionId, setCollectionId] = useState(defaultCollectionId || "");

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error("Please select a file to upload");
      return;
    }
    const targetCollectionId = defaultCollectionId || collectionId;
    if (!targetCollectionId) {
      toast.error("Please select a collection");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("collectionId", targetCollectionId);
    if (title) formData.append("title", title);

    uploadDocument(formData, {
      onSuccess: () => {
        toast.success("Document uploaded successfully");
        setFile(null);
        setTitle("");
        if (!defaultCollectionId) setCollectionId("");
        onClose();
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || "Failed to upload document");
      }
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Upload Document">
      <form onSubmit={handleUpload} className="space-y-4 pt-2">
        <div>
          <label htmlFor="file" className="mb-1 block text-sm font-medium text-zinc-900">File</label>
          <input 
            id="file"
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="block w-full text-sm text-zinc-500 file:mr-4 file:rounded-md file:border-0 file:bg-zinc-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-zinc-900 hover:file:bg-zinc-200"
          />
        </div>
        <div>
          <label htmlFor="title" className="mb-1 block text-sm font-medium text-zinc-900">Title (optional)</label>
          <Input 
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Q3 Roadmap"
          />
        </div>
        {!defaultCollectionId && (
          <div>
            <label htmlFor="collection" className="mb-1 block text-sm font-medium text-zinc-900">Collection</label>
            <select
              id="collection"
              value={collectionId}
              onChange={(e) => setCollectionId(e.target.value)}
              className="flex h-11 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="" disabled>Select a collection</option>
              {collections.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        )}
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" onClick={onClose} className="bg-white text-zinc-900 hover:bg-zinc-100">
            Cancel
          </Button>
          <Button type="submit" isLoading={isPending} className="bg-blue-600 hover:bg-blue-700 text-white">
            Upload
          </Button>
        </div>
      </form>
    </Modal>
  );
}
