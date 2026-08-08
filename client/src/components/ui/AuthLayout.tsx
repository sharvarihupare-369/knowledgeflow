import * as React from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  step?: 1 | 2 | 3;
}

export function AuthLayout({
  children,
  title,
  subtitle,
  step,
}: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen bg-white transition-colors dark:bg-[#0B1120]">
      {/* Left side - Dark Gradient with Quote */}
      <div className="hidden w-1/2 flex-col justify-between bg-gradient-to-br from-[#182038] via-[#1a1b3a] to-[#2a1738] p-12 text-white lg:flex">
        <div className="flex items-center space-x-2 font-medium">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-white/10">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="text-xl font-semibold tracking-tight">
            KnowledgeFlow AI
          </span>
        </div>

        <div>
          <blockquote className="text-3xl leading-snug font-medium">
            "KnowledgeFlow transformed how we interact with our documents. Finding precise answers now takes seconds, not hours."
          </blockquote>
          <div className="mt-6">
            <div className="font-semibold">Sharvari Hupare</div>
            <div className="text-sm text-gray-400">
              Founder & Software Engineer
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form area */}
      <div className="relative flex w-full flex-col items-center justify-center p-8 lg:w-1/2">
        <div className="absolute right-8 top-8">
          <ThemeToggle />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-[440px]"
        >
          {/* Stepper */}
          {step && (
            <div className="mb-8 flex space-x-2">
              <div
                className={`h-1 flex-1 rounded ${step >= 1 ? "bg-zinc-900 dark:bg-zinc-100" : "bg-zinc-200 dark:bg-zinc-800"}`}
              />
              <div
                className={`h-1 flex-1 rounded ${step >= 2 ? "bg-zinc-900 dark:bg-zinc-100" : "bg-zinc-200 dark:bg-zinc-800"}`}
              />
              <div
                className={`h-1 flex-1 rounded ${step >= 3 ? "bg-zinc-900 dark:bg-zinc-100" : "bg-zinc-200 dark:bg-zinc-800"}`}
              />
            </div>
          )}

          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              {title}
            </h1>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">{subtitle}</p>
          </div>

          {children}
        </motion.div>
      </div>
    </div>
  );
}
