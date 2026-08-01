"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useCollections, useCreateCollection } from "@/hooks/useCollections";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { CollectionCard } from "@/components/workspace/CollectionCard";
import { toast } from "sonner";

export default function CollectionsPage() {
  const { data: collections = [], isLoading } = useCollections();
  const { mutate: createCollection, isPending } = useCreateCollection();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [newCollectionDescription, setNewCollectionDescription] = useState("");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCollectionName.trim()) {
      toast.error("Collection name is required");
      return;
    }

    createCollection(
      { name: newCollectionName, description: newCollectionDescription },
      {
        onSuccess: () => {
          toast.success("Collection created successfully");
          setIsModalOpen(false);
          setNewCollectionName("");
          setNewCollectionDescription("");
        },
        onError: (error: any) => {
          toast.error(error.response?.data?.message || "Failed to create collection");
        }
      }
    );
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Collections</h1>
          <p className="mt-1 text-sm text-zinc-500">Organize your company's knowledge into collections.</p>
        </div>
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          New Collection
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-blue-600"></div>
        </div>
      ) : collections.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 p-12 text-center">
          <h3 className="text-lg font-medium text-zinc-900">No collections yet</h3>
          <p className="mt-2 text-sm text-zinc-500">Create a collection to start organizing your documents.</p>
          <Button onClick={() => setIsModalOpen(true)} className="mt-6 bg-blue-600 hover:bg-blue-700 text-white">
            Create your first collection
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map(collection => (
            <CollectionCard key={collection.id} collection={collection} />
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create new collection"
      >
        <form onSubmit={handleCreate} className="space-y-4 pt-2">
          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium text-zinc-900">Name</label>
            <Input 
              id="name"
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
              placeholder="e.g. HR Policies"
            />
          </div>
          <div>
            <label htmlFor="description" className="mb-1 block text-sm font-medium text-zinc-900">Description (optional)</label>
            <Input 
              id="description"
              value={newCollectionDescription}
              onChange={(e) => setNewCollectionDescription(e.target.value)}
              placeholder="Policies, onboarding guides..."
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="bg-white text-zinc-900 hover:bg-zinc-100">
              Cancel
            </Button>
            <Button type="submit" isLoading={isPending} className="bg-blue-600 hover:bg-blue-700 text-white">
              Create collection
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
