"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Send, Sparkles, ChevronDown, MessageSquare, Plus, Trash2, Menu, Square } from "lucide-react";
import { useUser } from "@/hooks/useUser";
import { api } from "@/lib/api";
import { useConversations, useConversationMessages, useDeleteConversation, Conversation } from "@/hooks/useChat";
import { toast } from "sonner";
import { formatDate } from "@/lib/formatters";

type Message = {
  role: "USER" | "ASSISTANT";
  content: string;
};

type Source = {
  documentName: string;
  page?: number;
  chunkIndex?: number;
};


function TypingIndicator() {
  return (
    <div className="flex gap-1.5 px-1 py-2">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="h-2 w-2 rounded-full bg-indigo-400"
          animate={{ y: [0, -5, 0] }}
          transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

export function AIChat() {
  const { data: user } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [collections, setCollections] = useState<any[]>([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>("");
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleStopGeneration = () => {
    abortControllerRef.current?.abort();
  };

  const selectedCollection = collections.find(c => c.id === selectedCollectionId);
  const suggestions = (() => {
    if (!selectedCollection) return [
      "Summarize the key points",
      "What are the main takeaways?",
      "Can you explain this in detail?"
    ];

    const name = selectedCollection.name.toLowerCase();
    if (name.includes("engineering")) {
      return [
        "What is our frontend tech stack?",
        "Explain the CI/CD deployment process",
        "How do I set up the local development environment?",
      ];
    } else if (name.includes("hr") || name.includes("human resources")) {
      return [
        "What is our remote work policy?",
        "Summarize the employee benefits package",
        "How do I request time off?",
      ];
    } else if (name.includes("sales")) {
      return [
        "What is the Q3 sales strategy?",
        "List the top enterprise clients",
        "Summarize the new pricing model",
      ];
    }
    
    return [
      `Summarize the documents in ${selectedCollection.name}`,
      "What are the key policies mentioned?",
      "List the most important takeaways",
    ];
  })();

  // Fetch collections on mount
  useEffect(() => {
    api.get("/collections").then((res) => {
      if (res.data?.data?.length > 0) {
        setCollections(res.data.data);
        setSelectedCollectionId(res.data.data[0].id);
      }
    }).catch(() => {});
  }, []);

  // Fetch conversations for the selected collection
  const { data: conversations = [], isLoading: isLoadingConversations } = useConversations(selectedCollectionId);
  
  // Fetch messages when a conversation is selected
  const { data: historyMessages, isLoading: isLoadingHistory } = useConversationMessages(activeConversationId || undefined);
  
  const { mutate: deleteConversation } = useDeleteConversation();

  // Load history messages when activeConversationId changes
  useEffect(() => {
    if (activeConversationId && historyMessages && historyMessages.length > 0) {
      // Do not overwrite the local messages array if we are currently streaming a new response
      if (!isLoading) {
        setMessages(historyMessages);
        setSources(prev => prev.length === 0 ? prev : []); // Clear sources from previous questions
      }
    } else if (activeConversationId === null) {
      setMessages(prev => prev.length === 0 ? prev : []);
      setSources(prev => prev.length === 0 ? prev : []);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConversationId, historyMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleNewConversation = () => {
    setActiveConversationId(null);
    setMessages([]);
    setSources([]);
  };

  const handleDeleteConversation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this conversation?")) {
      deleteConversation(id, {
        onSuccess: () => {
          toast.success("Conversation deleted");
          if (activeConversationId === id) {
            handleNewConversation();
          }
        },
        onError: () => toast.error("Failed to delete conversation"),
      });
    }
  };

  const handleSend = async (text: string = input) => {
    if (!text.trim() || !selectedCollectionId || isLoading) return;

    const q = text;
    setInput("");
    setSources([]);
    setMessages((prev) => [
      ...prev,
      { role: "USER", content: q },
      { role: "ASSISTANT", content: "" },
    ]);
    setIsLoading(true);
    abortControllerRef.current = new AbortController();

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"}/chat/search`,
        {
          method: "POST",
          signal: abortControllerRef.current.signal,
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ 
            collectionId: selectedCollectionId, 
            question: q,
            conversationId: activeConversationId // Pass if continuing a conversation
          }),
        }
      );

      if (!res.body) throw new Error("No body");
      const reader  = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer    = "";
      let newConversationId = activeConversationId;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const data = JSON.parse(line.substring(6));
            if (data.type === "metadata") {
               if (data.sources) setSources(data.sources);
               if (data.conversationId && !activeConversationId) {
                 newConversationId = data.conversationId;
                 setActiveConversationId(data.conversationId);
               }
            }
            if (data.type === "chunk") {
              setMessages((prev) => {
                const msgs = [...prev];
                const last = msgs[msgs.length - 1];
                if (last?.role === "ASSISTANT") {
                  msgs[msgs.length - 1] = { ...last, content: last.content + data.text };
                }
                return msgs;
              });
            }
          } catch { /* ignore */ }
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return;
      }
      setMessages((prev) => {
        const msgs = [...prev];
        const last = msgs[msgs.length - 1];
        if (last?.role === "ASSISTANT" && !last.content) {
          msgs[msgs.length - 1] = { ...last, content: "Sorry, something went wrong. Please try again." };
        }
        return msgs;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const firstName = user?.name?.split(" ")[0] || "there";

  return (
    <div className="flex h-full overflow-hidden" style={{ background: "var(--bg-base)" }}>
      {/* Sidebar: Conversation History */}
      <AnimatePresence initial={false}>
        {isSidebarOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="flex flex-col border-r shrink-0"
            style={{ background: "var(--sidebar-bg)", borderColor: "var(--border-subtle)" }}
          >
            <div className="p-4 border-b" style={{ borderColor: "var(--border-subtle)" }}>
              <button
                onClick={handleNewConversation}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                New Chat
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-3 space-y-1">
              <p className="px-2 py-2 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">
                History
              </p>
              
              {isLoadingConversations ? (
                <div className="space-y-2 p-2">
                   <div className="skeleton h-8 w-full rounded" />
                   <div className="skeleton h-8 w-full rounded" />
                   <div className="skeleton h-8 w-full rounded" />
                </div>
              ) : conversations.length === 0 ? (
                <p className="px-2 text-sm text-[var(--text-tertiary)]">No recent chats.</p>
              ) : (
                conversations.map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => setActiveConversationId(conv.id)}
                    className={`group flex items-center justify-between rounded-lg px-3 py-2 cursor-pointer transition-colors ${
                      activeConversationId === conv.id
                        ? "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400"
                        : "text-[var(--text-secondary)] hover:bg-[var(--bg-surface-2)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <MessageSquare className="h-4 w-4 shrink-0" />
                      <div className="overflow-hidden">
                        <p className="truncate text-sm font-medium">{conv.title}</p>
                        <p className="truncate text-[10px] opacity-70">{formatDate(conv.createdAt)}</p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleDeleteConversation(conv.id, e)}
                      className="shrink-0 p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/40 text-[var(--text-tertiary)] transition-all"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Collection Selector Bar */}
        <div
          className="flex items-center gap-3 border-b px-4 py-3 shrink-0"
          style={{ background: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
        >
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1.5 rounded-md text-[var(--text-tertiary)] hover:bg-[var(--bg-surface-2)] hover:text-[var(--text-primary)] transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>
          
          <div className="h-4 w-px bg-[var(--border-default)] mx-1" />

          <span className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider shrink-0">
            Collection
          </span>
          <div className="relative">
            <select
              value={selectedCollectionId}
              onChange={(e) => {
                setSelectedCollectionId(e.target.value);
                handleNewConversation(); // Reset chat when changing collection
              }}
              className="appearance-none rounded-lg border py-1.5 pl-3 pr-7 text-sm font-medium text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer transition-all"
              style={{
                background: "var(--bg-surface-2)",
                borderColor: "var(--border-default)",
              }}
            >
              <option value="" disabled>Select a collection…</option>
              {collections.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--text-tertiary)]" />
          </div>
          {selectedCollection && (
            <span className="rounded-full bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 text-xs font-medium text-indigo-600 dark:text-indigo-400">
              Active
            </span>
          )}
        </div>

        {/* Message Area */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="mx-auto max-w-3xl space-y-6">
            {/* Empty state / greeting */}
            {messages.length === 0 && !isLoadingHistory && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-3"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 shadow-sm">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div
                  className="rounded-2xl rounded-tl-sm px-5 py-3.5 text-sm leading-relaxed text-[var(--text-primary)]"
                  style={{
                    background: "var(--bg-surface)",
                    border: "1px solid var(--border-default)",
                    boxShadow: "var(--shadow-xs)",
                  }}
                >
                  Hi <strong>{firstName}</strong> — ask me anything about your collections.
                  I&apos;ll cite the documents I used.
                </div>
              </motion.div>
            )}
            
            {isLoadingHistory && (
               <div className="flex justify-center p-4">
                 <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--border-default)] border-t-indigo-600" />
               </div>
            )}

            {/* Messages */}
            <AnimatePresence initial={false}>
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className={`flex items-start gap-3 ${msg.role === "USER" ? "flex-row-reverse" : ""}`}
                >
                  {msg.role === "ASSISTANT" && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 shadow-sm">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                  )}

                  <div
                    className={`max-w-[82%] rounded-2xl px-5 py-3.5 text-sm leading-relaxed ${
                      msg.role === "USER"
                        ? "rounded-tr-sm bg-indigo-600 text-white shadow-sm shadow-indigo-500/20"
                        : "rounded-tl-sm text-[var(--text-primary)] whitespace-pre-wrap"
                    }`}
                    style={
                      msg.role === "ASSISTANT"
                        ? {
                            background: "var(--bg-surface)",
                            border: "1px solid var(--border-default)",
                            boxShadow: "var(--shadow-xs)",
                          }
                        : {}
                    }
                  >
                    {msg.content || (
                      isLoading && idx === messages.length - 1 ? (
                        <TypingIndicator />
                      ) : null
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Source citations */}
            {sources.length > 0 && !isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-wrap gap-2 pl-11"
              >
                <span className="text-xs text-[var(--text-tertiary)] w-full mb-1">Sources cited:</span>
                {sources.map((s, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
                    style={{
                      background: "var(--bg-surface-2)",
                      border: "1px solid var(--border-default)",
                      color: "var(--text-secondary)",
                    }}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 shrink-0" />
                    {s.documentName}
                    {s.page != null && <span className="text-[var(--text-tertiary)]">p.{s.page}</span>}
                  </span>
                ))}
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div
          className="px-6 pb-6 pt-4 shrink-0"
          style={{
            background: "var(--bg-surface)",
            borderTop: "1px solid var(--border-subtle)",
          }}
        >
          <div className="mx-auto max-w-3xl space-y-3">
            {/* Suggestion pills (only when chat is fresh) */}
            {messages.length === 0 && !activeConversationId && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-wrap gap-2"
              >
                {suggestions.map((s, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    whileHover={{ y: -1 }}
                    onClick={() => handleSend(s)}
                    className="flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all"
                    style={{
                      background: "var(--bg-surface-2)",
                      borderColor: "var(--border-default)",
                      color: "var(--text-secondary)",
                    }}
                  >
                    <Sparkles className="h-3 w-3 text-indigo-500" />
                    {s}
                  </motion.button>
                ))}
              </motion.div>
            )}

            {/* Input row */}
            <div
              className="flex items-center gap-2 rounded-[14px] border p-2 transition-all focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-400"
              style={{
                background: "var(--bg-surface-2)",
                borderColor: "var(--border-default)",
              }}
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder={
                  selectedCollectionId
                    ? "Ask about your knowledge base…"
                    : "Select a collection first…"
                }
                disabled={isLoading || !selectedCollectionId}
                className="flex-1 bg-transparent px-2 py-1.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none disabled:opacity-60"
              />
              {isLoading ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleStopGeneration}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-red-600/90 text-white shadow-sm shadow-red-500/20 transition-colors hover:bg-red-700"
                >
                  <Square className="h-3.5 w-3.5 fill-current" />
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSend()}
                  disabled={!input.trim() || !selectedCollectionId}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-indigo-600 text-white shadow-sm shadow-indigo-500/20 transition-colors hover:bg-indigo-700 disabled:opacity-40"
                >
                  <Send className="h-4 w-4 ml-0.5" />
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
