"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Folder,
  FileText,
  Bot,
  Search,
  Settings,
  Zap,
  ChevronRight,
  Users,
  MailPlus
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@/hooks/useUser";
import { getInitials } from "@/lib/formatters";

const baseNavItems = [
  { name: "Dashboard",   href: "/workspace",             icon: LayoutDashboard },
  { name: "Collections", href: "/workspace/collections", icon: Folder },
  { name: "Documents",   href: "/workspace/documents",   icon: FileText },
  { name: "AI Chat",     href: "/workspace/chat",        icon: Bot },
  { name: "Search",      href: "/workspace/search",      icon: Search },
  { name: "Settings",    href: "/workspace/settings",    icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: user } = useUser();

  const navItems = user?.role === 'ADMIN' 
    ? [
        ...baseNavItems, 
        { name: "Invites", href: "/workspace/team", icon: MailPlus }
      ]
    : baseNavItems;

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn(
        "flex h-full w-64 flex-col",
        "glass border-r border-[var(--sidebar-border)]",
        "bg-[var(--sidebar-bg)]"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center px-5 border-b border-[var(--border-subtle)]">
        <Link href="/workspace" className="flex items-center gap-2.5 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 shadow-md shadow-indigo-500/25 group-hover:shadow-indigo-500/40 transition-shadow">
            <Zap className="h-4 w-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-[15px] font-semibold tracking-tight text-[var(--text-primary)]">
            KnowledgeFlow
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-5 px-3">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-[var(--text-tertiary)]">
          Workspace
        </p>
        <ul className="space-y-0.5">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/workspace" && pathname.startsWith(item.href));

            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm font-medium transition-all duration-150 z-10",
                    isActive
                      ? "text-indigo-700 dark:text-indigo-300"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)]"
                  )}
                >
                  {/* Active pill background */}
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute inset-0 rounded-[10px] bg-indigo-100 dark:bg-indigo-900/40 -z-10"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                    />
                  )}

                  <item.icon
                    className={cn(
                      "relative h-4 w-4 shrink-0 transition-colors",
                      isActive
                        ? "text-indigo-700 dark:text-indigo-300"
                        : "text-[var(--text-tertiary)] group-hover:text-[var(--text-secondary)]"
                    )}
                  />
                  <span className="relative">{item.name}</span>

                  {isActive && (
                    <ChevronRight className="relative ml-auto h-3 w-3 text-indigo-400" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Footer */}
      <div className="p-3 border-t border-[var(--border-subtle)]">
        <div className="flex items-center gap-3 rounded-[10px] px-3 py-2.5 hover:bg-[var(--bg-surface-hover)] transition-colors cursor-pointer group">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 text-xs font-semibold text-white shadow-sm">
            {user ? getInitials(user.name) : "…"}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-sm font-medium text-[var(--text-primary)]">
              {user?.name || "Loading…"}
            </p>
            <p className="truncate text-xs text-[var(--text-tertiary)]">
              {user?.email || ""}
            </p>
          </div>
        </div>
      </div>
    </motion.aside>
  );
}
