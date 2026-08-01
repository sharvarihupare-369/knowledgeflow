"use client";

import { Bell, Search } from "lucide-react";
import { usePathname } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { getInitials } from "@/lib/formatters";

export function Header() {
  const pathname = usePathname();
  const { data: user } = useUser();
  let title = "Dashboard";
  
  if (pathname.includes("/collections")) title = "Collections";
  else if (pathname.includes("/documents")) title = "Documents";
  
  return (
    <header className="flex h-16 items-center justify-between border-b border-zinc-200 bg-white px-6">
      <div className="flex items-center space-x-4">
        <div className="flex items-center text-zinc-500">
           <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3 h-5 w-5"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="9" x2="9" y1="3" y2="21"/></svg>
           <h1 className="text-lg font-semibold text-zinc-900">{title}</h1>
        </div>
      </div>
      
      <div className="flex flex-1 items-center justify-center px-6">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input 
            type="text" 
            placeholder="Search documents, collections..." 
            className="h-10 w-full rounded-full border border-zinc-200 bg-zinc-50 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <button className="text-zinc-500 hover:text-zinc-900">
          <Bell className="h-5 w-5" />
        </button>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-700">
          {user ? getInitials(user.name) : "U"}
        </div>
      </div>
    </header>
  );
}
