import { prisma } from '../../config/prisma.js';
import { MessageRole } from '@prisma/client';

export const createConversation = async (userId: string, collectionId: string, title: string) => {
  return await prisma.conversation.create({
    data: {
      title,
      collectionId,
      userId,
    },
  });
};

export const getConversationsByCollection = async (userId: string, collectionId: string, skip: number = 0, take: number = 20) => {
  const [conversations, total] = await prisma.$transaction([
    prisma.conversation.findMany({
      where: {
        userId,
        collectionId,
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take,
    }),
    prisma.conversation.count({
      where: {
        userId,
        collectionId,
        deletedAt: null,
      },
    }),
  ]);

  return { conversations, total };
};

export const getConversationById = async (userId: string, conversationId: string) => {
  return await prisma.conversation.findFirst({
    where: {
      id: conversationId,
      userId,
      deletedAt: null,
    },
    include: {
      messages: {
        orderBy: {
          createdAt: 'asc',
        },
      },
    },
  });
};

export const addMessage = async (conversationId: string, role: MessageRole, content: string) => {
  return await prisma.message.create({
    data: {
      conversationId,
      role,
      content,
    },
  });
};

export const deleteConversation = async (userId: string, conversationId: string) => {
  return await prisma.conversation.updateMany({
    where: {
      id: conversationId,
      userId,
    },
    data: {
      deletedAt: new Date(),
    },
  });
};
