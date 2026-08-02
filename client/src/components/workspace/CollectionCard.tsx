"use client";

import { useRouter } from "next/navigation";
import { Folder, FileText, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import { Collection } from "@/types";
import { formatDate } from "@/lib/formatters";

interface CollectionCardProps {
  collection: Collection;
}

export function CollectionCard({ collection }: CollectionCardProps) {
  const router = useRouter();

  return (
    <motion.div
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.99 }}
      transition={{ duration: 0.15 }}
      onClick={() => router.push(`/workspace/collections/${collection.id}`)}
      className="group relative flex h-[210px] cursor-pointer flex-col justify-between overflow-hidden rounded-[16px] p-5 transition-all duration-200"
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border-default)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      {/* Gradient blob on hover */}
      <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-10" />

      {/* Top row */}
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 transition-colors group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/60">
          <Folder className="h-5 w-5" />
        </div>
        <div className="flex h-7 w-7 items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 transition-opacity text-[var(--text-tertiary)]">
          <ArrowUpRight className="h-4 w-4" />
        </div>
      </div>

      {/* Body */}
      <div className="mt-3 flex-1">
        <h2
          className="text-base font-semibold text-[var(--text-primary)] truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors"
          title={collection.name}
        >
          {collection.name}
        </h2>
        <p
          className="mt-1.5 line-clamp-2 text-sm text-[var(--text-secondary)]"
          title={collection.description}
        >
          {collection.description || "No description provided."}
        </p>
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between border-t pt-3 text-xs text-[var(--text-tertiary)]"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <div className="flex items-center gap-1.5">
          <FileText className="h-3.5 w-3.5" />
          <span>{collection._count?.documents || 0} docs</span>
        </div>
        <span>Updated {formatDate(collection.updatedAt || collection.createdAt)}</span>
      </div>
    </motion.div>
  );
}
