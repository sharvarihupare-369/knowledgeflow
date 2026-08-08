"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search as SearchIcon, FileText, ArrowRight, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { Document } from "@/types";
import { formatBytes, formatDate } from "@/lib/formatters";
import { DocumentCard } from "@/components/workspace/DocumentCard";
import { useQuery } from "@tanstack/react-query";

const fadeUp = {
  hidden:  { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] as const } },
};

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } };

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");

  const { data: allDocuments = [], isLoading, isFetching } = useQuery({
    queryKey: ['search-documents'],
    queryFn: async () => {
      const { data } = await api.get(`/documents`);
      return data.data as Document[];
    }
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedQuery(query);
  };

  const results = allDocuments.filter(doc => 
    submittedQuery 
      ? doc.title.toLowerCase().includes(submittedQuery.toLowerCase()) || 
        doc.originalName.toLowerCase().includes(submittedQuery.toLowerCase())
      : true
  );

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="visible"
      className="mx-auto max-w-5xl space-y-8"
    >
      {/* Header */}
      <motion.div variants={fadeUp} className="text-center py-10">
        <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)]">
          Search everything
        </h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Find documents across all your collections instantly.
        </p>
      </motion.div>

      {/* Search Bar */}
      <motion.div variants={fadeUp} className="max-w-2xl mx-auto">
        <form 
          onSubmit={handleSearch}
          className="relative flex items-center p-2 rounded-2xl transition-all"
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border-strong)",
            boxShadow: "var(--shadow-md)",
          }}
        >
          <SearchIcon className="absolute left-4 h-5 w-5 text-[var(--text-tertiary)]" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (e.target.value === "") {
                setSubmittedQuery("");
              }
            }}
            placeholder="Search by title..."
            className="w-full bg-transparent pl-12 pr-4 py-3 text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none"
          />
          <button
            type="submit"
            disabled={isFetching}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
          </button>
        </form>
      </motion.div>

      {/* Results */}
      <div className="pt-8">
        {isFetching ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
             {[...Array(6)].map((_, i) => (
                <div key={i} className="skeleton h-[130px] rounded-[16px] w-full" />
             ))}
          </div>
        ) : (
           <div>
              {submittedQuery && (
                <p className="mb-6 text-sm text-[var(--text-secondary)]">
                   Found {results.length} result{results.length !== 1 ? 's' : ''} for "{submittedQuery}"
                </p>
              )}
              
              {results.length > 0 ? (
                 <motion.div
                    variants={stagger}
                    className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
                 >
                    {results.map((doc) => (
                       <motion.div key={doc.id} variants={fadeUp}>
                          <DocumentCard document={doc} />
                       </motion.div>
                    ))}
                 </motion.div>
              ) : (
                <div className="flex flex-col items-center py-20 text-center">
                   <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--bg-surface-2)] text-[var(--text-tertiary)] mb-4">
                      <SearchIcon className="h-8 w-8" />
                   </div>
                   <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                     {submittedQuery ? "No results found" : "No documents yet"}
                   </h3>
                   <p className="mt-1 text-sm text-[var(--text-secondary)] max-w-md">
                      {submittedQuery 
                        ? `We couldn't find anything matching "${submittedQuery}". Try adjusting your search terms.`
                        : "Upload some documents to see them here."}
                   </p>
                </div>
              )}
           </div>
        )}
      </div>
    </motion.div>
  );
}
