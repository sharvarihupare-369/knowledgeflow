"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useUser } from "@/hooks/useUser";
import { useCollections } from "@/hooks/useCollections";
import { useDocuments } from "@/hooks/useDocuments";
import { Badge } from "@/components/ui/Badge";
import {
  Folder,
  FileText,
  Sparkles,
  Bot,
  File,
  ArrowUpRight,
  TrendingUp,
  MessageSquare,
  Users,
  Layers,
  Clock,
  BarChart2,
  Database,
} from "lucide-react";
import { formatDate, getStatusVariant } from "@/lib/formatters";
import { api } from "@/lib/api";

/* ------------------------------------------------------------------ */
/* Types                                                                 */
/* ------------------------------------------------------------------ */
type AnalyticsData = {
  stats: {
    collectionsCount: number;
    documentsCount: number;
    chunksCount: number;
    vectorsCount: number;
    questionsAsked: number;
    questionsToday: number;
    questionsThisWeek: number;
    documentsThisWeek: number;
  };
  recentUploads: any[];
  topUsers: { id: string; name: string; email: string; conversationCount: number }[];
  mostEmbeddedDocuments: { id: string; title: string; originalName: string; chunkCount: number }[];
  activityChart: { label: string; value: number }[];
};

/* ------------------------------------------------------------------ */
/* Animation variants                                                   */
/* ------------------------------------------------------------------ */
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } };
const fadeUp = {
  hidden:  { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] as const } },
};

/* ------------------------------------------------------------------ */
/* Mini Bar Chart                                                        */
/* ------------------------------------------------------------------ */
function MiniBarChart({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex items-end gap-1.5 h-16">
      {data.map((d, i) => (
        <div key={i} className="flex flex-col items-center gap-1 flex-1 group relative">
          {/* Tooltip */}
          <div className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center z-10 pointer-events-none">
            <div
              className="rounded-md px-2 py-1 text-[10px] font-medium whitespace-nowrap"
              style={{
                background: "var(--text-primary)",
                color: "var(--bg-surface)",
              }}
            >
              {d.label}: {d.value}
            </div>
            <div
              className="h-1.5 w-1.5 rotate-45 -mt-1"
              style={{ background: "var(--text-primary)" }}
            />
          </div>
          <motion.div
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ delay: i * 0.06, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as const }}
            style={{ originY: 1, height: `${Math.max((d.value / max) * 100, 8)}%` }}
            className="w-full rounded-t-[4px] bg-gradient-to-t from-indigo-600 to-violet-500 opacity-80 hover:opacity-100 transition-opacity"
          />
          <span className="text-[8px] text-[var(--text-tertiary)] truncate w-full text-center">
            {d.label.split(",")[0]}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Skeleton helpers                                                      */
/* ------------------------------------------------------------------ */
function SkeletonBlock({ h = "h-4", w = "w-full" }: { h?: string; w?: string }) {
  return <div className={`skeleton rounded ${h} ${w}`} />;
}

/* ------------------------------------------------------------------ */
/* Stat Card                                                             */
/* ------------------------------------------------------------------ */
function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  gradient,
  trend,
  loading,
}: {
  label: string;
  value: number | string;
  sub?: string;
  icon: React.ElementType;
  gradient: string;
  trend?: string;
  loading?: boolean;
}) {
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -2 }}
      className="relative overflow-hidden rounded-[16px] p-6"
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border-default)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <div className={`absolute right-0 top-0 h-24 w-24 rounded-full opacity-10 blur-2xl ${gradient}`} />
      <div className="flex items-start justify-between">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${gradient} text-white shadow-sm`}>
          <Icon className="h-5 w-5" />
        </div>
        {trend && (
          <span className="flex items-center gap-1 text-xs font-medium text-emerald-500">
            <TrendingUp className="h-3 w-3" />
            {trend}
          </span>
        )}
      </div>
      <div className="mt-4">
        {loading ? (
          <SkeletonBlock h="h-8" w="w-1/2" />
        ) : (
          <span className="block text-3xl font-bold text-[var(--text-primary)]">{value}</span>
        )}
        <span className="mt-1 text-sm text-[var(--text-secondary)]">{label}</span>
        {sub && <span className="mt-0.5 block text-xs text-[var(--text-tertiary)]">{sub}</span>}
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Main Page                                                             */
/* ------------------------------------------------------------------ */
export default function DashboardPage() {
  const { data: user } = useUser();
  const { data: collections = [] } = useCollections();
  const { data: documents = [] } = useDocuments();

  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  useEffect(() => {
    api
      .get("/dashboard/stats")
      .then((res) => setAnalytics(res.data.data))
      .catch(() => {})
      .finally(() => setAnalyticsLoading(false));
  }, []);

  const recentDocuments = [...documents]
    .sort(
      (a, b) =>
        new Date(b.updatedAt || b.createdAt).getTime() -
        new Date(a.updatedAt || a.createdAt).getTime()
    )
    .slice(0, 5);

  const topCollections = [...collections]
    .sort((a, b) => (b._count?.documents || 0) - (a._count?.documents || 0))
    .slice(0, 4);

  const firstName = user?.name?.split(" ")[0] || "there";
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const primaryStats = [
    {
      label: "Collections",
      value: analytics?.stats.collectionsCount ?? collections.length,
      icon: Folder,
      gradient: "bg-gradient-to-br from-indigo-500 to-violet-600",
      trend: `+${analytics?.stats.documentsThisWeek ?? 0} this week`,
    },
    {
      label: "Documents",
      value: analytics?.stats.documentsCount ?? documents.length,
      sub: `${analytics?.stats.documentsThisWeek ?? 0} uploaded this week`,
      icon: FileText,
      gradient: "bg-gradient-to-br from-sky-500 to-blue-600",
    },
    {
      label: "Ready to query",
      value: documents.filter((d) => d.status === "READY").length,
      icon: Sparkles,
      gradient: "bg-gradient-to-br from-emerald-500 to-teal-600",
    },
    {
      label: "Embeddings",
      value: analytics?.stats.vectorsCount ?? analytics?.stats.chunksCount ?? "—",
      sub: "Vectors in Qdrant",
      icon: Database,
      gradient: "bg-gradient-to-br from-purple-500 to-pink-600",
    },
  ];

  const aiStats = [
    {
      label: "Questions asked today",
      value: analytics?.stats.questionsToday ?? "—",
      icon: MessageSquare,
      gradient: "bg-gradient-to-br from-amber-500 to-orange-600",
      trend: analytics?.stats.questionsToday
        ? `${analytics.stats.questionsToday} today`
        : undefined,
    },
    {
      label: "Total questions",
      value: analytics?.stats.questionsAsked ?? "—",
      sub: `${analytics?.stats.questionsThisWeek ?? 0} this week`,
      icon: Bot,
      gradient: "bg-gradient-to-br from-rose-500 to-red-600",
    },
    {
      label: "Active users",
      value: analytics?.topUsers.length ?? "—",
      icon: Users,
      gradient: "bg-gradient-to-br from-cyan-500 to-sky-600",
    },
    {
      label: "AI conversations",
      value: analytics?.activityChart.reduce((s, d) => s + d.value, 0) ?? "—",
      sub: "Last 7 days",
      icon: Layers,
      gradient: "bg-gradient-to-br from-lime-500 to-green-600",
    },
  ];

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="visible"
      className="mx-auto max-w-6xl space-y-10"
    >
      {/* Page header */}
      <motion.div variants={fadeUp} className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)]">
            {greeting},{" "}
            <span className="gradient-text">{firstName}</span> 👋
          </h1>
          <p className="mt-1.5 text-sm text-[var(--text-secondary)]">
            Here&apos;s your knowledge base at a glance.
          </p>
        </div>
        <Link
          href="/workspace/collections"
          className="inline-flex items-center gap-2 rounded-[12px] bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm shadow-indigo-500/20 transition-all hover:bg-indigo-700 hover:-translate-y-px"
        >
          Browse collections
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </motion.div>

      {/* ── Knowledge Base Stats ── */}
      <section>
        <motion.h2
          variants={fadeUp}
          className="mb-4 text-xs font-semibold uppercase tracking-widest text-[var(--text-tertiary)]"
        >
          Knowledge Base
        </motion.h2>
        <motion.div
          variants={stagger}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {primaryStats.map((s) => (
            <StatCard key={s.label} {...s} loading={analyticsLoading} />
          ))}
        </motion.div>
      </section>

      {/* ── AI Usage Analytics ── */}
      <section>
        <motion.h2
          variants={fadeUp}
          className="mb-4 text-xs font-semibold uppercase tracking-widest text-[var(--text-tertiary)]"
        >
          AI Usage Analytics
        </motion.h2>
        <motion.div
          variants={stagger}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {aiStats.map((s) => (
            <StatCard key={s.label} {...s} loading={analyticsLoading} />
          ))}
        </motion.div>
      </section>

      {/* ── Activity Chart + Top Users ── */}
      <motion.div variants={stagger} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Activity Chart */}
        <motion.div variants={fadeUp} className="lg:col-span-2">
          <div
            className="rounded-[16px] p-6"
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border-default)",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <div className="mb-1 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                Questions Asked — Last 7 Days
              </h3>
              <span className="flex items-center gap-1 text-xs text-[var(--text-tertiary)]">
                <BarChart2 className="h-3.5 w-3.5" />
                Daily breakdown
              </span>
            </div>
            <p className="mb-5 text-xs text-[var(--text-tertiary)]">
              Total: <strong className="text-[var(--text-primary)]">{analytics?.stats.questionsThisWeek ?? "—"}</strong> questions this week
            </p>
            {analyticsLoading ? (
              <div className="flex items-end gap-1.5 h-16">
                {[40, 60, 30, 80, 50, 90, 70].map((h, i) => (
                  <div key={i} className="skeleton flex-1 rounded" style={{ height: `${h}%` }} />
                ))}
              </div>
            ) : analytics?.activityChart ? (
              <MiniBarChart data={analytics.activityChart} />
            ) : null}
          </div>
        </motion.div>

        {/* Top Users */}
        <motion.div variants={fadeUp}>
          <div
            className="h-full rounded-[16px] p-6"
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border-default)",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <div className="mb-4 flex items-center gap-2">
              <Users className="h-4 w-4 text-indigo-500" />
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">Top Users</h3>
            </div>
            {analyticsLoading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <SkeletonBlock h="h-7" w="w-7" />
                    <div className="flex-1 space-y-1">
                      <SkeletonBlock h="h-3" w="w-3/4" />
                      <SkeletonBlock h="h-2.5" w="w-1/2" />
                    </div>
                    <SkeletonBlock h="h-4" w="w-8" />
                  </div>
                ))}
              </div>
            ) : !analytics?.topUsers?.length ? (
              <p className="text-sm text-[var(--text-tertiary)]">No activity yet.</p>
            ) : (
              <ul className="space-y-2.5">
                {analytics.topUsers.map((u, i) => {
                  const initials = u.name
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase();
                  const gradients = [
                    "from-indigo-400 to-violet-500",
                    "from-sky-400 to-blue-500",
                    "from-emerald-400 to-teal-500",
                    "from-amber-400 to-orange-500",
                    "from-rose-400 to-red-500",
                  ];
                  return (
                    <motion.li
                      key={u.id}
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="flex items-center gap-3"
                    >
                      <div
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${gradients[i % gradients.length]} text-[10px] font-bold text-white`}
                      >
                        {initials}
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="truncate text-sm font-medium text-[var(--text-primary)]">
                          {u.name}
                        </p>
                        <p className="truncate text-xs text-[var(--text-tertiary)]">{u.email}</p>
                      </div>
                      <span className="shrink-0 rounded-full bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                        {u.conversationCount}
                      </span>
                    </motion.li>
                  );
                })}
              </ul>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* ── Most Embedded Documents + Recent Documents ── */}
      <motion.div variants={stagger} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Documents */}
        <motion.div variants={fadeUp} className="lg:col-span-2">
          <div
            className="overflow-hidden rounded-[16px]"
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border-default)",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <div
              className="flex items-center justify-between border-b px-6 py-4"
              style={{ borderColor: "var(--border-subtle)" }}
            >
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">Recent documents</h3>
              <Link
                href="/workspace/documents"
                className="flex items-center gap-1 text-xs font-medium text-indigo-500 hover:text-indigo-600"
              >
                View all <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
            <div>
              {recentDocuments.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-12 text-center">
                  <FileText className="h-8 w-8 text-[var(--text-tertiary)]" />
                  <p className="text-sm text-[var(--text-secondary)]">No documents yet.</p>
                </div>
              ) : (
                recentDocuments.map((doc, i) => (
                  <motion.div
                    key={doc.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center justify-between px-6 py-4 border-b last:border-0 hover:bg-[var(--bg-surface-2)] transition-colors"
                    style={{ borderColor: "var(--border-subtle)" }}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                        <File className="h-4 w-4" />
                      </div>
                      <div className="overflow-hidden">
                        <p className="truncate text-sm font-medium text-[var(--text-primary)]">{doc.title}</p>
                        <p className="truncate text-xs text-[var(--text-tertiary)]">
                          {formatDate(doc.updatedAt || doc.createdAt)}
                        </p>
                      </div>
                    </div>
                    <Badge variant={getStatusVariant(doc.status) as any} className="ml-4 shrink-0">
                      {doc.status.charAt(0) + doc.status.slice(1).toLowerCase()}
                    </Badge>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </motion.div>

        {/* Most Embedded Documents */}
        <motion.div variants={fadeUp}>
          <div
            className="h-full rounded-[16px] p-6"
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border-default)",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <div className="mb-4 flex items-center gap-2">
              <Layers className="h-4 w-4 text-purple-500" />
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">Most Embedded</h3>
            </div>
            <p className="mb-4 text-xs text-[var(--text-tertiary)]">
              Documents with the highest chunk / embedding count
            </p>
            {analyticsLoading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="space-y-1.5">
                    <SkeletonBlock h="h-3" w="w-3/4" />
                    <div className="skeleton h-1.5 w-full rounded-full" />
                  </div>
                ))}
              </div>
            ) : !analytics?.mostEmbeddedDocuments?.length ? (
              <p className="text-sm text-[var(--text-tertiary)]">No embeddings yet.</p>
            ) : (
              <ul className="space-y-3.5">
                {analytics.mostEmbeddedDocuments.map((doc, i) => {
                  const maxChunks = analytics.mostEmbeddedDocuments[0]?.chunkCount || 1;
                  const pct = Math.round((doc.chunkCount / maxChunks) * 100);
                  return (
                    <motion.li
                      key={doc.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.07 }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <p className="truncate text-xs font-medium text-[var(--text-primary)] flex-1 mr-2" title={doc.title}>
                          {doc.title}
                        </p>
                        <span className="shrink-0 text-xs font-semibold text-purple-500">
                          {doc.chunkCount}
                        </span>
                      </div>
                      <div
                        className="h-1.5 w-full overflow-hidden rounded-full"
                        style={{ background: "var(--bg-surface-2)" }}
                      >
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ delay: i * 0.07 + 0.2, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as const }}
                          className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                        />
                      </div>
                    </motion.li>
                  );
                })}
              </ul>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* ── Top Collections ── */}
      <motion.div variants={fadeUp}>
        <div
          className="rounded-[16px] p-6"
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border-default)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Folder className="h-4 w-4 text-indigo-500" />
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">Top Collections</h3>
            </div>
            <Link href="/workspace/collections" className="text-xs text-indigo-500 hover:text-indigo-600 flex items-center gap-1">
              View all <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          {topCollections.length === 0 ? (
            <p className="text-sm text-[var(--text-tertiary)]">No collections yet.</p>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {topCollections.map((c, i) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  whileHover={{ y: -2 }}
                >
                  <Link
                    href={`/workspace/collections/${c.id}`}
                    className="group flex flex-col gap-2 rounded-[12px] p-4 transition-all"
                    style={{
                      background: "var(--bg-surface-2)",
                      border: "1px solid var(--border-subtle)",
                    }}
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-500">
                      <Folder className="h-4 w-4" />
                    </div>
                    <p className="truncate text-sm font-semibold text-[var(--text-primary)] group-hover:text-indigo-500 transition-colors">
                      {c.name}
                    </p>
                    <p className="text-xs text-[var(--text-tertiary)]">
                      {c._count?.documents || 0} documents
                    </p>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}