"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, MoreHorizontal, Eye, Trash2, RefreshCw } from "lucide-react";
import { DropdownMenu } from "@/components/ui/DropdownMenu";
import { Badge } from "@/components/ui/Badge";
import { Document, User } from "@/types";
import { formatBytes, formatDate, getStatusVariant, getFileExtension } from "@/lib/formatters";
import { useDeleteDocument, useReindexDocument } from "@/hooks/useDocuments";
import { toast } from "sonner";

interface DocumentTableProps {
  documents: Document[];
  isLoading: boolean;
  user: User | undefined;
}

function SkeletonRow() {
  return (
    <tr>
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="skeleton h-9 w-9 rounded-xl shrink-0" />
          <div className="space-y-1.5 flex-1">
            <div className="skeleton h-3 w-40 rounded" />
            <div className="skeleton h-2.5 w-28 rounded" />
          </div>
        </div>
      </td>
      {[...Array(5)].map((_, i) => (
        <td key={i} className="px-6 py-4"><div className="skeleton h-3 w-16 rounded" /></td>
      ))}
      <td className="px-6 py-4" />
    </tr>
  );
}

export function DocumentTable({ documents, isLoading, user }: DocumentTableProps) {
  const { mutate: deleteDocument } = useDeleteDocument();
  const { mutate: reindexDocument, isPending: isReindexing } = useReindexDocument();
  const [reindexingId, setReindexingId] = useState<string | null>(null);

  const handleReindex = (id: string) => {
    setReindexingId(id);
    reindexDocument(id, {
      onSuccess: () => { toast.success("Document re-indexed successfully"); setReindexingId(null); },
      onError: (err: any) => { toast.error(err.response?.data?.message || "Re-index failed"); setReindexingId(null); },
    });
  };

  return (
    <div
      className="overflow-hidden rounded-[16px] w-full"
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border-default)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead style={{ background: "var(--bg-surface-2)", borderBottom: "1px solid var(--border-subtle)" }}>
            <tr>
              {["Document", "Type", "Status", "Size", "Uploaded By", "Date", ""].map((h) => (
                <th
                  key={h}
                  className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <AnimatePresence mode="popLayout">
              {isLoading ? (
                <>
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                </>
              ) : documents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <FileText className="h-8 w-8 text-[var(--text-tertiary)]" />
                      <p className="text-sm text-[var(--text-secondary)]">No documents in this collection yet.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                documents.map((doc, i) => (
                  <motion.tr
                    key={doc.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="transition-colors"
                    style={{ borderBottom: "1px solid var(--border-subtle)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-surface-2)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "")}
                  >
                    {/* Document name */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                          <FileText className="h-4 w-4" />
                        </div>
                        <div className="overflow-hidden">
                          <p className="truncate font-medium text-[var(--text-primary)] max-w-[180px]" title={doc.title}>
                            {doc.title}
                          </p>
                          <p className="truncate text-xs text-indigo-500 max-w-[180px]" title={doc.originalName}>
                            {doc.originalName}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Type */}
                    <td className="px-6 py-4">
                      <span className="rounded-md px-2 py-0.5 text-xs font-semibold" style={{ background: "var(--bg-surface-2)", color: "var(--text-secondary)" }}>
                        {getFileExtension(doc.originalName)}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {doc.status === "PROCESSING" && (
                          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400" />
                        )}
                        <Badge variant={getStatusVariant(doc.status) as any}>
                          {doc.status.charAt(0) + doc.status.slice(1).toLowerCase()}
                        </Badge>
                      </div>
                    </td>

                    {/* Size */}
                    <td className="px-6 py-4 text-[var(--text-secondary)]">{formatBytes(doc.fileSize)}</td>

                    {/* Uploaded by */}
                    <td className="px-6 py-4 text-[var(--text-secondary)]">{user?.name || "—"}</td>

                    {/* Date */}
                    <td className="px-6 py-4 whitespace-nowrap text-[var(--text-secondary)]">
                      {formatDate(doc.updatedAt || doc.createdAt)}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <DropdownMenu
                        align="right"
                        trigger={
                          <button className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--text-tertiary)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)] transition-all">
                            {reindexingId === doc.id ? (
                              <RefreshCw className="h-4 w-4 animate-spin text-indigo-500" />
                            ) : (
                              <MoreHorizontal className="h-4 w-4" />
                            )}
                          </button>
                        }
                        items={[
                          {
                            label: "View file",
                            icon: <Eye className="h-4 w-4" />,
                            onClick: () => {
                              const base = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:8080";
                              window.open(`${base}/${doc.filePath}`, "_blank");
                            },
                          },
                          {
                            label: "Re-index",
                            icon: <RefreshCw className="h-4 w-4" />,
                            onClick: () => handleReindex(doc.id),
                          },
                          {
                            label: "Delete",
                            icon: <Trash2 className="h-4 w-4" />,
                            className: "text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-600",
                            onClick: () => {
                              if (confirm("Are you sure you want to delete this document? This cannot be undone.")) {
                                deleteDocument(doc.id, {
                                  onSuccess: () => toast.success("Document deleted"),
                                  onError: (err: any) => toast.error(err.response?.data?.message || "Failed to delete"),
                                });
                              }
                            },
                          },
                        ]}
                      />
                    </td>
                  </motion.tr>
                ))
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
}
