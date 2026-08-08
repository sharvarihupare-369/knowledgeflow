"use client";

import * as React from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Copy, Check, Loader2, Sparkles, Languages } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

export type DocumentAIMode = "summarize" | "translate" | null;

interface DocumentAIModalProps {
  documentId: string;
  documentTitle: string;
  mode: DocumentAIMode;
  isOpen: boolean;
  onClose: () => void;
}

const LANGUAGES = [
  "English",
  "Spanish",
  "French",
  "German",
  "Italian",
  "Portuguese",
  "Dutch",
  "Russian",
  "Chinese (Simplified)",
  "Japanese",
  "Korean",
  "Hindi",
  "Arabic",
];

export function DocumentAIModal({
  documentId,
  documentTitle,
  mode,
  isOpen,
  onClose,
}: DocumentAIModalProps) {
  const [content, setContent] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [targetLanguage, setTargetLanguage] = React.useState("English");
  const [isCopied, setIsCopied] = React.useState(false);

  const abortControllerRef = React.useRef<AbortController | null>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom while generating
  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [content]);

  // Cleanup on close
  React.useEffect(() => {
    if (!isOpen) {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      setContent("");
      setIsLoading(false);
      setTargetLanguage("English");
      setIsCopied(false);
    }
  }, [isOpen]);

  const generateContent = async () => {
    if (!documentId || !mode) return;

    setContent("");
    setIsLoading(true);
    abortControllerRef.current = new AbortController();

    try {
      const token = localStorage.getItem("token");
      const url = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"}/documents/${documentId}/${mode}`;
      
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ targetLanguage }),
        signal: abortControllerRef.current.signal,
      });

      if (!res.ok) {
        throw new Error(`Failed to generate: ${res.statusText}`);
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder("utf-8");

      if (!reader) throw new Error("No reader available");

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunkText = decoder.decode(value, { stream: true });
        const events = chunkText.split("\n\n");

        for (const event of events) {
          if (event.startsWith("data: ")) {
            try {
              const data = JSON.parse(event.slice(6));
              if (data.type === "chunk") {
                setContent((prev) => prev + data.text);
              } else if (data.type === "error") {
                toast.error(data.message || "An error occurred");
                setIsLoading(false);
                return;
              } else if (data.type === "done") {
                setIsLoading(false);
                return;
              }
            } catch (e) {
              // Ignore incomplete JSON chunks
            }
          }
        }
      }
    } catch (err: any) {
      if (err.name === "AbortError") {
        console.log("Stream aborted");
      } else {
        console.error(err);
        toast.error("An error occurred while communicating with AI");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
    toast.success("Copied to clipboard");
  };

  const isTranslate = mode === "translate";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isTranslate ? `Translate Document` : `Summarize Document`}
    >
      <div className="flex flex-col gap-4">
        {/* Header / Description */}
        <div className="text-sm text-[var(--text-secondary)] mb-2">
          {isTranslate ? (
            <>Select a target language to translate the first section of <b>{documentTitle}</b>.</>
          ) : (
            <>Generate an AI summary for the first section of <b>{documentTitle}</b>.</>
          )}
        </div>

        {/* Translation Controls */}
        {isTranslate && !content && !isLoading && (
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-[var(--text-primary)]">
              Target Language
            </label>
            <select
              value={targetLanguage}
              onChange={(e) => setTargetLanguage(e.target.value)}
              className="h-10 w-full rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] px-3 text-sm text-[var(--text-primary)] focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Generated Content Area */}
        {(content || isLoading) && (
          <div 
            ref={scrollRef}
            className="relative min-h-[200px] max-h-[400px] overflow-y-auto rounded-lg border border-[var(--border-default)] bg-[var(--bg-base)] p-4 text-sm text-[var(--text-primary)]"
          >
            {content ? (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown>{content}</ReactMarkdown>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center text-[var(--text-tertiary)]">
                <Loader2 className="mr-2 h-5 w-5 animate-spin text-indigo-500" />
                Thinking...
              </div>
            )}

            {/* Copy Button */}
            {content && !isLoading && (
              <button
                onClick={handleCopy}
                className="absolute right-2 top-2 rounded-md bg-[var(--bg-surface)] p-1.5 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] shadow-sm border border-[var(--border-default)] transition-colors"
                title="Copy text"
              >
                {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </button>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="mt-4 flex justify-end gap-3">
          <Button className="bg-transparent border border-[var(--border-default)] text-[var(--text-primary)] hover:bg-[var(--bg-surface-2)] shadow-none" onClick={onClose} disabled={isLoading}>
            {content || isLoading ? "Close" : "Cancel"}
          </Button>
          {!content && !isLoading && (
            <Button onClick={generateContent} className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white border-0">
              {isTranslate ? <Languages className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
              {isTranslate ? "Translate" : "Generate Summary"}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
