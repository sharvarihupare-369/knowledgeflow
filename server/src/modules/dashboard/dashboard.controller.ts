import type { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { prisma } from '../../config/prisma.js';

export const getStats = asyncHandler(async (req: Request, res: Response) => {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - 7);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    collectionsCount,
    documentsCount,
    chunksCount,
    questionsAsked,
    questionsToday,
    questionsThisWeek,
    documentsThisWeek,
    recentUploads,
    topUsersByActivity,
    conversationsWithMessages,
    documentsWithChunks,
  ] = await Promise.all([
    prisma.collection.count(),
    prisma.document.count(),
    prisma.chunk.count(),

    // All-time questions
    prisma.message.count({ where: { role: 'USER' } }),

    // Questions asked today
    prisma.message.count({
      where: { role: 'USER', createdAt: { gte: startOfToday } },
    }),

    // Questions this week
    prisma.message.count({
      where: { role: 'USER', createdAt: { gte: startOfWeek } },
    }),

    // Documents uploaded this week
    prisma.document.count({
      where: { createdAt: { gte: startOfWeek } },
    }),

    // Recent uploads with collection info
    prisma.document.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { collection: { select: { name: true } } },
    }),

    // Top users by conversation/message count
    prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        _count: { select: { conversations: true } },
      },
      orderBy: { conversations: { _count: 'desc' } },
      take: 5,
    }),

    // Conversations with message count for activity chart
    prisma.conversation.findMany({
      where: { createdAt: { gte: startOfMonth } },
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' },
    }),

    // Documents with their chunk counts (to find most "embedded" docs)
    prisma.document.findMany({
      select: {
        id: true,
        title: true,
        originalName: true,
        _count: { select: { chunks: true } },
      },
      orderBy: { chunks: { _count: 'desc' } },
      take: 5,
    }),
  ]);

  // Build a daily activity chart for the last 7 days
  const activityByDay: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const key = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    activityByDay[key] = 0;
  }

  const weekMessages = await prisma.message.findMany({
    where: { role: 'USER', createdAt: { gte: startOfWeek } },
    select: { createdAt: true },
  });
  weekMessages.forEach((msg) => {
    const key = msg.createdAt.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    if (activityByDay[key] !== undefined) activityByDay[key]++;
  });

  const activityChart = Object.entries(activityByDay).map(([label, value]) => ({ label, value }));

  res.status(200).json({
    success: true,
    data: {
      stats: {
        collectionsCount,
        documentsCount,
        chunksCount,
        vectorsCount: chunksCount, // 1 chunk = 1 vector
        questionsAsked,
        questionsToday,
        questionsThisWeek,
        documentsThisWeek,
      },
      recentUploads,
      topUsers: topUsersByActivity.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        conversationCount: u._count.conversations,
      })),
      mostEmbeddedDocuments: documentsWithChunks.map((d) => ({
        id: d.id,
        title: d.title,
        originalName: d.originalName,
        chunkCount: d._count.chunks,
      })),
      activityChart,
    },
  });
});
