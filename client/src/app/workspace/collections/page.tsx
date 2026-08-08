"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Folder } from "lucide-react";
import { useCollections, useCreateCollection } from "@/hooks/useCollections";
import { useUser } from "@/hooks/useUser";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { CollectionCard } from "@/components/workspace/CollectionCard";
import { toast } from "sonner";

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
      className="h-[210px] rounded-[16px] p-5"
      style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)" }}
    >
      <div className="skeleton h-10 w-10 rounded-xl mb-4" />
      <div className="skeleton h-4 w-3/5 rounded mb-2" />
      <div className="skeleton h-3 w-4/5 rounded mb-1.5" />
      <div className="skeleton h-3 w-2/5 rounded" />
    </div>
  );
}

export default function CollectionsPage() {
  const { data: user } = useUser();
  const { data: collections = [], isLoading } = useCollections();
  const { mutate: createCollection, isPending } = useCreateCollection();
  const [isModalOpen, setIsModalOpen]           = useState(false);
  const [name, setName]                         = useState("");
  const [description, setDescription]           = useState("");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { toast.error("Collection name is required"); return; }
    createCollection(
      { name, description },
      {
        onSuccess: () => {
          toast.success("Collection created");
          setIsModalOpen(false);
          setName("");
          setDescription("");
        },
        onError: (error: any) =>
          toast.error(error.response?.data?.message || "Failed to create collection"),
      }
    );
  };

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
            Collections
          </h1>
          <p className="mt-1.5 text-sm text-[var(--text-secondary)]">
            Organize your company&apos;s knowledge into collections.
          </p>
        </div>
        {user?.role === 'ADMIN' && (
          <Button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 rounded-[12px] bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm shadow-indigo-500/20 transition-all hover:-translate-y-px"
          >
            <Plus className="h-4 w-4" />
            New Collection
          </Button>
        )}
      </motion.div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : collections.length === 0 ? (
        <motion.div
          variants={fadeUp}
          className="flex flex-col items-center justify-center rounded-[20px] border-2 border-dashed py-20 text-center"
          style={{ borderColor: "var(--border-default)" }}
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-500 mb-4">
            <Folder className="h-7 w-7" />
          </div>
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">No collections yet</h3>
          <p className="mt-1.5 max-w-xs text-sm text-[var(--text-secondary)]">
            {user?.role === 'ADMIN' ? "Create a collection to start organizing your documents." : "Ask an administrator to create a collection."}
          </p>
          {user?.role === 'ADMIN' && (
            <Button
              onClick={() => setIsModalOpen(true)}
              className="mt-6 rounded-[12px] bg-indigo-600 text-white hover:bg-indigo-700"
            >
              Create your first collection
            </Button>
          )}
        </motion.div>
      ) : (
        <motion.div
          variants={stagger}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {collections.map((c) => (
            <motion.div key={c.id} variants={fadeUp}>
              <CollectionCard collection={c} />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New collection">
        <form onSubmit={handleCreate} className="space-y-4 pt-1">
          <div>
            <label htmlFor="col-name" className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">
              Name
            </label>
            <Input
              id="col-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. HR Policies"
            />
          </div>
          <div>
            <label htmlFor="col-desc" className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">
              Description <span className="text-[var(--text-tertiary)]">(optional)</span>
            </label>
            <Input
              id="col-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Policies, onboarding guides…"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="rounded-[10px] bg-transparent border border-[var(--border-default)] text-[var(--text-primary)] shadow-none hover:bg-[var(--bg-surface-2)]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isPending}
              className="rounded-[10px] bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm shadow-indigo-500/20"
            >
              Create collection
            </Button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
}
