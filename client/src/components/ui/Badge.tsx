import * as React from "react"
import { cn } from "@/lib/utils"

export type BadgeVariant = "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "error";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "border-transparent bg-zinc-900 text-zinc-50 shadow hover:bg-zinc-900/80",
  secondary: "border-transparent bg-zinc-100 text-zinc-900 hover:bg-zinc-100/80",
  destructive: "border-transparent bg-red-500 text-zinc-50 shadow hover:bg-red-500/80",
  outline: "text-zinc-950",
  success: "border-green-200 bg-green-50 text-green-700",
  warning: "border-amber-200 bg-amber-50 text-amber-700",
  error: "border-red-200 bg-red-50 text-red-700",
}

function Badge({ className, variant = "default", children, ...props }: BadgeProps) {
  return (
    <div className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2", variantStyles[variant], className)} {...props}>
      {variant === 'success' && <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-green-500"></span>}
      {variant === 'warning' && <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-amber-500"></span>}
      {variant === 'error' && <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-red-500"></span>}
      {children}
    </div>
  )
}

export { Badge }
