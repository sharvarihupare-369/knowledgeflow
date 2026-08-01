"use client";

import Link from "next/link";
import { useUser } from "@/hooks/useUser";
import { useCollections } from "@/hooks/useCollections";
import { useDocuments } from "@/hooks/useDocuments";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Folder, FileText, Sparkles, Bot, File } from "lucide-react";
import { formatDate, getStatusVariant } from "@/lib/formatters";

export default function DashboardPage() {
  const { data: user } = useUser();
  const { data: collections = [] } = useCollections();
  const { data: documents = [] } = useDocuments();

  // Sort documents by recent
  const recentDocuments = [...documents].sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime()).slice(0, 5);
  
  // Sort collections by document count
  const topCollections = [...collections].sort((a, b) => (b._count?.documents || 0) - (a._count?.documents || 0)).slice(0, 5);

  const getFirstName = (name?: string) => name ? name.split(' ')[0] : 'there';

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Good afternoon, {getFirstName(user?.name)}</h1>
          <p className="mt-1 text-sm text-zinc-500">Here's what's happening across your company knowledge base.</p>
        </div>
        <Link 
          href="/workspace/collections"
          className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          Browse collections
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between text-zinc-500">
              <span className="text-sm font-medium">Collections</span>
              <Folder className="h-4 w-4" />
            </div>
            <div className="mt-4 text-3xl font-bold text-zinc-900">{collections.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between text-zinc-500">
              <span className="text-sm font-medium">Documents</span>
              <FileText className="h-4 w-4" />
            </div>
            <div className="mt-4 text-3xl font-bold text-zinc-900">{documents.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between text-zinc-500">
              <span className="text-sm font-medium">Ready to query</span>
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="mt-4 text-3xl font-bold text-zinc-900">
              {documents.filter(d => d.status === 'READY').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between text-zinc-500">
              <span className="text-sm font-medium">AI questions this week</span>
              <Bot className="h-4 w-4" />
            </div>
            <div className="mt-4 text-3xl font-bold text-zinc-900">128</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="h-full">
            <div className="flex items-center justify-between border-b border-zinc-100 p-6">
              <h2 className="font-semibold text-zinc-900">Recent documents</h2>
              <Link href="/workspace/documents" className="text-sm font-medium text-blue-600 hover:text-blue-700">View all</Link>
            </div>
            <div className="divide-y divide-zinc-100">
              {recentDocuments.length === 0 ? (
                <div className="p-6 text-center text-sm text-zinc-500">No documents uploaded yet.</div>
              ) : (
                recentDocuments.map(doc => (
                  <div key={doc.id} className="flex items-center justify-between p-6 hover:bg-zinc-50/50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-blue-600">
                        <File className="h-5 w-5" />
                      </div>
                      <div className="overflow-hidden">
                        <div className="text-sm font-medium text-zinc-900 truncate" title={doc.title}>{doc.title}</div>
                        <div className="text-xs text-zinc-500 truncate">
                          {user?.name || "Uploaded"} • {formatDate(doc.updatedAt || doc.createdAt)}
                        </div>
                      </div>
                    </div>
                    <Badge variant={getStatusVariant(doc.status) as any} className="ml-4 shrink-0">
                      {doc.status.charAt(0).toUpperCase() + doc.status.slice(1).toLowerCase()}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        <div>
          <Card className="h-full">
            <div className="border-b border-zinc-100 p-6">
              <h2 className="font-semibold text-zinc-900">Top collections</h2>
            </div>
            <div className="divide-y divide-zinc-100 p-6">
              {topCollections.length === 0 ? (
                <div className="text-center text-sm text-zinc-500">No collections yet.</div>
              ) : (
                <div className="space-y-4">
                  {topCollections.map(collection => (
                    <Link key={collection.id} href={`/workspace/collections/${collection.id}`} className="flex items-center justify-between group">
                      <span className="text-sm font-medium text-zinc-900 group-hover:text-blue-600 transition-colors truncate">{collection.name}</span>
                      <span className="text-sm text-blue-600 shrink-0 ml-4">{collection._count?.documents || 0}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}