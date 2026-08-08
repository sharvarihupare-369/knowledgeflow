"use client";

import { Bell, Search, Sun, Moon } from "lucide-react";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useUser } from "@/hooks/useUser";
import { getInitials } from "@/lib/formatters";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { toast } from "sonner";

const pageTitles: Record<string, string> = {
  "/workspace": "Dashboard",
  "/workspace/collections": "Collections",
  "/workspace/documents": "Documents",
  "/workspace/chat": "AI Chat",
  "/workspace/search": "Search",
  "/workspace/settings": "Settings",
};

export function Header() {
  const pathname = usePathname();
  const { data: user } = useUser();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    if (isProfileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isProfileOpen]);

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
      localStorage.removeItem("token");
      router.push("/login");
      toast.success("Logged out successfully");
    } catch (error) {
      localStorage.removeItem("token");
      router.push("/login");
    }
  };

  // Resolve current page title
  const title =
    Object.entries(pageTitles)
      .reverse()
      .find(([key]) => pathname.startsWith(key))?.[1] ?? "Workspace";

  return (
    <header
      className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[var(--border-subtle)] px-6"
      style={{
        background: "var(--sidebar-bg)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
      }}
    >
      {/* Left: page title */}
      <div className="flex items-center gap-3">
        <div className="h-4 w-px bg-[var(--border-default)] hidden sm:block" />
        <h1 className="text-[15px] font-semibold text-[var(--text-primary)]">{title}</h1>
      </div>

      {/* Center: search */}
      {/* <div className="hidden md:flex flex-1 max-w-sm mx-8">
        <label className="relative w-full group">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--text-tertiary)] transition-colors group-focus-within:text-indigo-500" />
          <input
            type="text"
            placeholder="Search documents, collections…"
            className="h-9 w-full rounded-full border border-[var(--border-default)] bg-[var(--bg-surface-2)] pl-9 pr-4 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none transition-all focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/15"
          />
        </label>
      </div> */}

      {/* Right: controls */}
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        {mounted && (
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface-2)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition-all"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>
        )}

        {/* Notifications */}
        <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface-2)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition-all relative">
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-indigo-500" />
        </button>

        {/* Avatar with Dropdown */}
        <div className="relative" ref={profileRef}>
          <div
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 text-xs font-semibold text-white shadow-sm cursor-pointer hover:shadow-md transition-all ring-2 ring-transparent hover:ring-indigo-500/20"
          >
            {user ? getInitials(user.name) : "U"}
          </div>

          {isProfileOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 rounded-xl bg-white dark:bg-[#1C212B] shadow-lg ring-1 ring-black/5 dark:ring-white/10 overflow-hidden transform opacity-100 scale-100 transition-all origin-top-right">
              {/* User Info Header */}
              <div className="px-4 py-3 border-b border-zinc-100 dark:border-white/5">
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                  {user?.name || "Loading..."}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                  {user?.email || ""}
                </p>
              </div>

              {/* Menu Items */}
              <div className="py-1">
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    router.push("/workspace/settings");
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors"
                >
                  Settings
                </button>
                <div className="h-px bg-zinc-100 dark:bg-white/5 my-1" />
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors"
                >
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
