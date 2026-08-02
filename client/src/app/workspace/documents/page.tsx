"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Upload, FileText } from "lucide-react";
import { useDocuments } from "@/hooks/useDocuments";
import { Button } from "@/components/ui/Button";
import { DocumentCard } from "@/components/workspace/DocumentCard";
import { UploadDocumentModal } from "@/components/workspace/UploadDocumentModal";

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const fadeUp = {
  hidden:  { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] as const } },
};

function SkeletonCard() {
  return (
    <div
      className="h-[130px] rounded-[16px] p-5"
      style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)" }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="skeleton h-10 w-10 rounded-xl shrink-0" />
        <div className="flex-1 space-y-1.5">
          <div className="skeleton h-3 w-3/5 rounded" />
          <div className="skeleton h-3 w-2/5 rounded" />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="skeleton h-5 w-16 rounded-full" />
        <div className="skeleton h-3 w-24 rounded" />
      </div>
    </div>
  );
}

export default function DocumentsPage() {
  const { data: documents = [], isLoading } = useDocuments();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="visible"
      className="mx-auto max-w-6xl space-y-8"
    >
      {/* Page header */}
      <motion.div variants={fadeUp} className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)]">
            Documents
          </h1>
          <p className="mt-1.5 text-sm text-[var(--text-secondary)]">
            Everything your team has uploaded across all collections.
          </p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 rounded-[12px] bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm shadow-indigo-500/20 transition-all hover:-translate-y-px"
        >
          <Upload className="h-4 w-4" />
          Upload Document
        </Button>
      </motion.div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : documents.length === 0 ? (
        <motion.div
          variants={fadeUp}
          className="flex flex-col items-center justify-center rounded-[20px] border-2 border-dashed py-20 text-center"
          style={{ borderColor: "var(--border-default)" }}
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 dark:bg-sky-950/50 text-sky-500 mb-4">
            <FileText className="h-7 w-7" />
          </div>
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">No documents yet</h3>
          <p className="mt-1.5 max-w-xs text-sm text-[var(--text-secondary)]">
            Upload documents to start building your knowledge base.
          </p>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="mt-6 rounded-[12px] bg-indigo-600 text-white hover:bg-indigo-700"
          >
            Upload your first document
          </Button>
        </motion.div>
      ) : (
        <motion.div
          variants={stagger}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {documents.map((doc) => (
            <motion.div key={doc.id} variants={fadeUp}>
              <DocumentCard document={doc} />
            </motion.div>
          ))}
        </motion.div>
      )}

      <UploadDocumentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </motion.div>
  );
}
