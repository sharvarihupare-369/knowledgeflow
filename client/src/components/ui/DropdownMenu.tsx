import * as React from "react"
import { createPortal } from "react-dom"
import { cn } from "@/lib/utils"

export interface DropdownMenuItem {
  label: React.ReactNode;
  onClick: () => void;
  className?: string;
  icon?: React.ReactNode;
}

export interface DropdownMenuProps {
  trigger: React.ReactNode;
  items: DropdownMenuItem[];
  align?: "left" | "right";
}

export function DropdownMenu({ trigger, items, align = "right" }: DropdownMenuProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLDivElement>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const [coords, setCoords] = React.useState({ top: 0, left: 0, width: 0 });

  React.useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
  }, [isOpen]);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        dropdownRef.current && !dropdownRef.current.contains(target) &&
        triggerRef.current && !triggerRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <>
      <div 
        ref={triggerRef}
        onClick={(e) => { 
          e.preventDefault(); 
          e.stopPropagation();
          setIsOpen(!isOpen); 
        }} 
        className="cursor-pointer inline-block"
      >
        {trigger}
      </div>

      {isOpen && typeof document !== "undefined" && createPortal(
        <div 
          ref={dropdownRef}
          style={{ 
            top: coords.top + 8, 
            left: align === "right" ? coords.left + coords.width - 160 : coords.left 
          }}
          className={cn(
            "absolute z-[9999] min-w-[160px] rounded-xl bg-white dark:bg-[#1e1e1e] py-2 shadow-lg border border-[var(--border-default)] focus:outline-none"
          )}
        >
          {items.map((item, idx) => (
            <button
              key={idx}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsOpen(false);
                item.onClick();
              }}
              className={cn("flex w-full items-center px-4 py-2 text-sm font-medium text-zinc-900 dark:text-zinc-100 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800", item.className)}
            >
              {item.icon && <span className="mr-3 text-zinc-500 dark:text-zinc-400">{item.icon}</span>}
              {item.label}
            </button>
          ))}
        </div>,
        document.body
      )}
    </>
  )
}
