import { FileText, MoreHorizontal, Eye, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { DropdownMenu } from "@/components/ui/DropdownMenu";
import { Document } from "@/types";
import { formatBytes, formatDate, getStatusVariant } from "@/lib/formatters";
import { useDeleteDocument } from "@/hooks/useDocuments";
import { toast } from "sonner";

interface DocumentCardProps {
  document: Document;
}

export function DocumentCard({ document: doc }: DocumentCardProps) {
  const { mutate: deleteDocument } = useDeleteDocument();

  return (
    <Card className="flex flex-col justify-between p-6 h-auto">
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <FileText className="h-5 w-5" />
            </div>
            <div className="overflow-hidden">
              <h2 className="text-sm font-semibold text-zinc-900 truncate" title={doc.title}>{doc.title}</h2>
              <p className="text-xs text-blue-600 truncate" title={doc.originalName}>{doc.originalName}</p>
            </div>
          </div>
          <DropdownMenu 
            trigger={
              <button className="ml-2 shrink-0 rounded-md p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 transition-colors">
                <MoreHorizontal className="h-5 w-5" />
              </button>
            }
            items={[
              {
                label: "View",
                icon: <Eye className="h-4 w-4" />,
                onClick: () => {
                  const backendUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8080';
                  window.open(`${backendUrl}/${doc.filePath}`, '_blank');
                }
              },
              {
                label: "Delete",
                icon: <Trash2 className="h-4 w-4" />,
                className: "text-red-600 hover:bg-red-50 hover:text-red-700",
                onClick: () => {
                  if (confirm("Are you sure you want to delete this document?")) {
                    deleteDocument(doc.id, {
                      onSuccess: () => toast.success("Document deleted"),
                      onError: (err: any) => toast.error(err.response?.data?.message || "Failed to delete")
                    });
                  }
                }
              }
            ]}
          />
        </div>
      </div>
      
      <div className="mt-6 flex items-center justify-between">
        <Badge variant={getStatusVariant(doc.status) as any}>
          {doc.status.charAt(0).toUpperCase() + doc.status.slice(1).toLowerCase()}
        </Badge>
        <div className="text-xs text-zinc-500 truncate ml-2">
          {formatBytes(doc.fileSize)} • {formatDate(doc.updatedAt || doc.createdAt)}
        </div>
      </div>
    </Card>
  );
}
