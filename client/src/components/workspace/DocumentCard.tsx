"use client";

import React, { useState } from "react";
import { FileText, MoreHorizontal, Eye, Trash2, RefreshCw, AlignLeft, Languages } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/Badge";
import { DropdownMenu } from "@/components/ui/DropdownMenu";
import { Document } from "@/types";
import { formatBytes, formatDate, getStatusVariant } from "@/lib/formatters";
import { useDeleteDocument, useReindexDocument } from "@/hooks/useDocuments";
import { toast } from "sonner";
import { DocumentAIModal, DocumentAIMode } from "./DocumentAIModal";

interface DocumentCardProps {
  document: Document;
}

export function DocumentCard({ document: doc }: DocumentCardProps) {
  const { mutate: deleteDocument } = useDeleteDocument();
  const { mutate: reindexDocument } = useReindexDocument();
  
  const [aiMode, setAiMode] = useState<DocumentAIMode>(null);

  return (
    <>
      <motion.div
        whileHover={{ y: -2 }}
        transition={{ duration: 0.15 }}
        className="flex flex-col justify-between rounded-[16px] p-5 transition-shadow duration-200"
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border-default)",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400">
              <FileText className="h-5 w-5" />
            </div>
            <div className="overflow-hidden">
              <h2
                className="truncate text-sm font-semibold text-[var(--text-primary)]"
                title={doc.title}
              >
                {doc.title}
              </h2>
              <p
                className="truncate text-xs text-indigo-500 dark:text-indigo-400"
                title={doc.originalName}
              >
                {doc.originalName}
              </p>
            </div>
          </div>
          <DropdownMenu
            trigger={
              <button className="shrink-0 flex h-7 w-7 items-center justify-center rounded-lg text-[var(--text-tertiary)] hover:bg-[var(--bg-surface-2)] hover:text-[var(--text-primary)] transition-all">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            }
            items={[
              {
                label: "View",
                icon: <Eye className="h-4 w-4" />,
                onClick: () => {
                  const backendUrl =
                    process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") ||
                    "http://localhost:8080";
                  window.open(`${backendUrl}/${doc.filePath}`, "_blank");
                },
              },
              {
                label: "Summarize",
                icon: <AlignLeft className="h-4 w-4" />,
                onClick: () => setAiMode("summarize"),
              },
              {
                label: "Translate",
                icon: <Languages className="h-4 w-4" />,
                onClick: () => setAiMode("translate"),
              },
              {
                label: "Re-index",
                icon: <RefreshCw className="h-4 w-4" />,
                onClick: () => {
                  reindexDocument(doc.id, {
                    onSuccess: () => toast.success("Document re-indexed successfully"),
                    onError: (err: any) =>
                      toast.error(
                        err.response?.data?.message || "Re-index failed"
                      ),
                  });
                },
              },
              {
                label: "Delete",
                icon: <Trash2 className="h-4 w-4" />,
                className: "text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-600",
                onClick: () => {
                  if (confirm("Are you sure you want to delete this document?")) {
                    deleteDocument(doc.id, {
                      onSuccess: () => toast.success("Document deleted"),
                      onError: (err: any) =>
                        toast.error(
                          err.response?.data?.message || "Failed to delete"
                        ),
                    });
                  }
                },
              },
            ]}
          />
        </div>

        {/* Footer */}
        <div className="mt-5 flex items-center justify-between">
          <Badge variant={getStatusVariant(doc.status) as any}>
            {doc.status.charAt(0) + doc.status.slice(1).toLowerCase()}
          </Badge>
          <span className="ml-2 truncate text-xs text-[var(--text-tertiary)]">
            {formatBytes(doc.fileSize)} · {formatDate(doc.updatedAt || doc.createdAt)}
          </span>
        </div>
      </motion.div>

      <DocumentAIModal
        isOpen={aiMode !== null}
        onClose={() => setAiMode(null)}
        mode={aiMode}
        documentId={doc.id}
        documentTitle={doc.title}
      />
    </>
  );
}
