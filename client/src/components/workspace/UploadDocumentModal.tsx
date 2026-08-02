import { useState, useCallback } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useUploadDocument } from "@/hooks/useDocuments";
import { useCollections } from "@/hooks/useCollections";
import { toast } from "sonner";
import { UploadCloud, File, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
  const [isDragging, setIsDragging] = useState(false);

  // Reset state when closing
  const handleClose = () => {
    setFile(null);
    setTitle("");
    if (!defaultCollectionId) setCollectionId("");
    setIsDragging(false);
    onClose();
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
    }
  }, []);

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
        handleClose();
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || "Failed to upload document");
      }
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Upload Document">
      <form onSubmit={handleUpload} className="space-y-5 pt-2">
        {/* Drag & Drop Zone */}
        <div>
          <label className="mb-2 block text-sm font-medium text-[var(--text-primary)]">File</label>
          <AnimatePresence mode="wait">
            {!file ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed py-10 px-4 text-center transition-colors ${
                  isDragging 
                    ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20" 
                    : "border-[var(--border-default)] hover:bg-[var(--bg-surface-2)]"
                }`}
              >
                <input
                  type="file"
                  className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                  onChange={(e) => e.target.files && setFile(e.target.files[0])}
                />
                <div className={`mb-3 flex h-12 w-12 items-center justify-center rounded-full transition-colors ${isDragging ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400" : "bg-[var(--bg-surface-2)] text-[var(--text-tertiary)]"}`}>
                  <UploadCloud className="h-6 w-6" />
                </div>
                <h4 className="text-sm font-semibold text-[var(--text-primary)]">
                  Click to upload or drag and drop
                </h4>
                <p className="mt-1 text-xs text-[var(--text-secondary)]">
                  PDF, TXT, MD, DOCX up to 10MB
                </p>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center justify-between rounded-xl border p-4 shadow-sm"
                style={{ background: "var(--bg-surface-2)", borderColor: "var(--border-default)" }}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400">
                    <File className="h-5 w-5" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="truncate text-sm font-medium text-[var(--text-primary)]">{file.name}</p>
                    <p className="text-xs text-[var(--text-secondary)]">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[var(--text-tertiary)] hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/40 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div>
          <label htmlFor="title" className="mb-2 block text-sm font-medium text-[var(--text-primary)]">
            Title <span className="text-[var(--text-tertiary)]">(optional)</span>
          </label>
          <Input 
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Q3 Roadmap"
          />
        </div>
        
        {!defaultCollectionId && (
          <div>
            <label htmlFor="collection" className="mb-2 block text-sm font-medium text-[var(--text-primary)]">Collection</label>
            <select
              id="collection"
              value={collectionId}
              onChange={(e) => setCollectionId(e.target.value)}
              className="flex h-11 w-full rounded-[10px] border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
              style={{ background: "var(--bg-surface)", borderColor: "var(--border-default)", color: "var(--text-primary)" }}
            >
              <option value="" disabled>Select a collection</option>
              {collections.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        )}
        
        <div className="flex justify-end gap-3 pt-4 border-t" style={{ borderColor: "var(--border-subtle)" }}>
          <Button type="button" onClick={handleClose} className="rounded-[10px] bg-transparent border border-[var(--border-default)] text-[var(--text-primary)] hover:bg-[var(--bg-surface-2)] shadow-none">
            Cancel
          </Button>
          <Button type="submit" isLoading={isPending} disabled={!file} className="rounded-[10px] bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm shadow-indigo-500/20 disabled:opacity-50">
            Upload Document
          </Button>
        </div>
      </form>
    </Modal>
  );
}
