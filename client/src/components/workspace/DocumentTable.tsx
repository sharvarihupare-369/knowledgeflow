import { FileText, MoreHorizontal, Eye, Trash2 } from "lucide-react";
import { DropdownMenu } from "@/components/ui/DropdownMenu";
import { Badge } from "@/components/ui/Badge";
import { Document, User } from "@/types";
import { formatBytes, formatDate, getStatusVariant, getFileExtension } from "@/lib/formatters";
import { useDeleteDocument } from "@/hooks/useDocuments";
import { toast } from "sonner";

interface DocumentTableProps {
  documents: Document[];
  isLoading: boolean;
  user: User | undefined;
}

export function DocumentTable({ documents, isLoading, user }: DocumentTableProps) {
  const { mutate: deleteDocument } = useDeleteDocument();

  return (
    <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden w-full">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-zinc-500">
          <thead className="bg-zinc-50 text-xs font-medium text-zinc-500 uppercase border-b border-zinc-200">
            <tr>
              <th className="px-6 py-4">Document Name</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Size</th>
              <th className="px-6 py-4">Uploaded By</th>
              <th className="px-6 py-4">Upload Date</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center">
                  <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-zinc-200 border-t-blue-600"></div>
                </td>
              </tr>
            ) : documents.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-zinc-500">
                  No documents found.
                </td>
              </tr>
            ) : (
              documents.map(doc => (
                <tr key={doc.id} className="hover:bg-zinc-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3 overflow-hidden">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="overflow-hidden">
                        <p className="truncate font-medium text-zinc-900" title={doc.title}>{doc.title}</p>
                        <p className="truncate text-xs text-blue-600" title={doc.originalName}>{doc.originalName}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium">{getFileExtension(doc.originalName)}</td>
                  <td className="px-6 py-4">
                    <Badge variant={getStatusVariant(doc.status) as any}>
                      {doc.status.charAt(0).toUpperCase() + doc.status.slice(1).toLowerCase()}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">{formatBytes(doc.fileSize)}</td>
                  <td className="px-6 py-4">{user?.name || "User"}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{formatDate(doc.updatedAt || doc.createdAt)}</td>
                  <td className="px-6 py-4 text-right">
                    <DropdownMenu 
                      align="right"
                      trigger={
                        <button className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 transition-colors">
                          <MoreHorizontal className="h-4 w-4" />
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
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
