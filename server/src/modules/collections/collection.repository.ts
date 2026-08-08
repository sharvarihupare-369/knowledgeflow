import { prisma } from '../../config/prisma.js';
import type { createCollectionPayload, EditCollectionPayload } from '../../types/collections.js';
import { ApiError } from '../../validations/api-error.js';

export const createCollection = async (userId: string, payload: createCollectionPayload) => {
  const membership = await prisma.userOrganisationMembership.findFirst({
    where: {
      userId,
    },
  });
  if (!membership) {
    throw new ApiError(404, 'User is not associated with any organisation.');
  }
  if (membership.role !== 'ADMIN') {
    throw new ApiError(403, 'Only administrators can create collections.');
  }

  const existingCollection = await prisma.collection.findFirst({
    where: {
      organisationId: membership.orgId,
      name: payload.name,
    },
  });
  if (existingCollection) {
    throw new ApiError(409, 'Collection with this name already exists.');
  }

  return await prisma.collection.create({
    data: {
      name: payload.name,
      ...(payload.description ? { description: payload.description } : {}),
      organisationId: membership.orgId,
      createdBy: userId,
      usersWithAccess: {
        connect: { id: userId },
      },
    },
  });
};

export const getCollections = async (userId: string) => {
  const membership = await prisma.userOrganisationMembership.findFirst({
    where: {
      userId,
    },
  });
  if (!membership) {
    throw new ApiError(404, 'User is not associated with any organisation.');
  }
  return await prisma.collection.findMany({
    where: {
      organisationId: membership.orgId,
      ...(membership.role !== 'ADMIN' && {
        usersWithAccess: {
          some: { id: userId },
        },
      }),
    },
    include: {
      _count: {
        select: { documents: true },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};

export const editCollection = async (userId: string, id: string, payload: EditCollectionPayload) => {
  const membership = await prisma.userOrganisationMembership.findFirst({
    where: {
      userId,
    },
  });
  if (!membership) {
    throw new ApiError(404, 'User is not associated with any organisation.');
  }
  const collection = await prisma.collection.findFirst({
    where: {
      id,
      organisationId: membership.orgId,
    },
  });
  if (!collection) {
    throw new ApiError(404, 'Collection not found.');
  }

  return await prisma.collection.update({
    where: {
      id,
    },
    data: {
      ...(payload.name ? { name: payload.name } : {}),
      ...(payload.description ? { description: payload.description } : {}),
    },
  });
};

export const deleteCollection = async (userId: string, id: string) => {
  const membership = await prisma.userOrganisationMembership.findFirst({
    where: {
      userId,
    },
  });
  if (!membership) {
    throw new ApiError(404, 'User is not associated with any organisation.');
  }
  const collection = await prisma.collection.findFirst({
    where: {
      id,
      organisationId: membership.orgId,
    },
  });
  if (!collection) {
    throw new ApiError(404, 'Collection not found.');
  }

  return await prisma.collection.delete({
    where: {
      id,
    },
  });
};
