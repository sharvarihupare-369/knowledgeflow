import { useRouter } from "next/navigation";
import { Folder, MoreHorizontal, FileText } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Collection } from "@/types";
import { formatDate } from "@/lib/formatters";

interface CollectionCardProps {
  collection: Collection;
}

export function CollectionCard({ collection }: CollectionCardProps) {
  const router = useRouter();

  return (
    <Card 
      onClick={() => router.push(`/workspace/collections/${collection.id}`)}
      className="flex h-[200px] cursor-pointer flex-col justify-between p-6 transition-all hover:border-blue-200 hover:shadow-md"
    >
      <div>
        <div className="flex items-center justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <Folder className="h-5 w-5" />
          </div>
          <button 
            className="text-zinc-400 hover:text-zinc-900"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <MoreHorizontal className="h-5 w-5" />
          </button>
        </div>
        <h2 className="mt-4 text-lg font-semibold text-zinc-900 truncate" title={collection.name}>{collection.name}</h2>
        <p className="mt-1 line-clamp-2 text-sm text-zinc-500" title={collection.description}>
          {collection.description || "No description provided."}
        </p>
      </div>
      
      <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-4 text-xs text-zinc-500">
        <div className="flex items-center gap-1.5 shrink-0">
          <FileText className="h-4 w-4" />
          <span>{collection._count?.documents || 0} documents</span>
        </div>
        <div className="truncate ml-2 text-right">Updated {formatDate(collection.updatedAt || collection.createdAt)}</div>
      </div>
    </Card>
  );
}
