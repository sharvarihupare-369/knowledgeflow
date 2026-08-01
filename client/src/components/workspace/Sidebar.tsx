"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Folder, FileText, Bot, Search, Settings, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@/hooks/useUser";
import { getInitials } from "@/lib/formatters";

const navItems = [
  { name: "Dashboard", href: "/workspace", icon: LayoutDashboard },
  { name: "Collections", href: "/workspace/collections", icon: Folder },
  { name: "Documents", href: "/workspace/documents", icon: FileText },
  { name: "AI Chat", href: "/workspace/chat", icon: Bot },
  { name: "Search", href: "/workspace/search", icon: Search },
  { name: "Settings", href: "/workspace/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: user } = useUser();

  return (
    <div className="flex h-full w-64 flex-col border-r border-zinc-200 bg-zinc-50/50">
      <div className="flex h-16 items-center px-6 border-b border-zinc-200">
        <div className="flex items-center space-x-2 font-medium text-blue-600">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-600 text-white">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="text-xl font-semibold tracking-tight text-zinc-900">
            KnowledgeFlow AI
          </span>
        </div>
      </div>
      
      <div className="flex-1 py-6 px-3 space-y-1">
        <div className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Workspace
        </div>
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/workspace" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-zinc-100 text-zinc-900"
                  : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
              )}
            >
              <item.icon className={cn("h-4 w-4", isActive ? "text-blue-600" : "text-zinc-400")} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-zinc-200">
        <div className="flex items-center space-x-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-medium text-blue-700">
            {user ? getInitials(user.name) : "..."}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-sm font-medium text-zinc-900">{user?.name || "Loading..."}</p>
            <p className="truncate text-xs text-zinc-500">{user?.email || ""}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
