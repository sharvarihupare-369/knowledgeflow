import * as React from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

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
    <div className="flex min-h-screen bg-white">
      {/* Left side - Dark Gradient with Quote */}
      <div className="hidden w-1/2 flex-col justify-between bg-gradient-to-br from-[#182038] via-[#1a1b3a] to-[#2a1738] p-12 text-white lg:flex">
        <div className="flex items-center space-x-2 font-medium">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-white/10">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="text-xl font-semibold tracking-tight">
            KnowledgeFlow
          </span>
        </div>

        <div>
          <blockquote className="text-3xl leading-snug font-medium">
            "This platform gave our team the clarity we needed to ship faster
            and with more confidence."
          </blockquote>
          <div className="mt-6">
            <div className="font-semibold">Amelia Chen</div>
            <div className="text-sm text-gray-400">
              Head of Product, Lumen Labs
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form area */}
      <div className="flex w-full flex-col items-center justify-center p-8 lg:w-1/2">
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
                className={`h-1 flex-1 rounded ${step >= 1 ? "bg-zinc-900" : "bg-zinc-200"}`}
              />
              <div
                className={`h-1 flex-1 rounded ${step >= 2 ? "bg-zinc-900" : "bg-zinc-200"}`}
              />
              <div
                className={`h-1 flex-1 rounded ${step >= 3 ? "bg-zinc-900" : "bg-zinc-200"}`}
              />
            </div>
          )}

          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
              {title}
            </h1>
            <p className="mt-2 text-sm text-zinc-500">{subtitle}</p>
          </div>

          {children}
        </motion.div>
      </div>
    </div>
  );
}
