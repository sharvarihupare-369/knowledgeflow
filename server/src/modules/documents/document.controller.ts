import type { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import fs from 'fs/promises';
import { ApiError } from '../../validations/api-error.js';
import * as documentService from './document.service.js';
import { processDocumentBackground } from './document.worker.js';
import * as aiService from '../../services/ai.service.js';

export const uploadDocument = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, 'Unauthorized');
  }

  if (!req.file) {
    throw new ApiError(400, 'File is required');
  }

  const { collectionId, title } = req.body;
  if (!collectionId) {
    throw new ApiError(400, 'Collection ID is required');
  }

  try {
    console.log(`[AI LOG] Received document upload request for file: ${req.file.originalname}`);
    const documentData = {
      title: title || req.file.originalname,
      originalName: req.file.originalname,
      filePath: req.file.path,
      mimeType: req.file.mimetype,
      fileSize: req.file.size,
      collectionId: collectionId,
      uploadedBy: req.user.id,
    };

    const result = await documentService.uploadDocument(documentData, []);

    console.log(`[AI LOG] Triggering background job for document ID: ${result.id}`);
    // Start background processing
    processDocumentBackground(result.id, result.filePath, result.collectionId, result.mimeType, false).catch((err) => {
      console.error('[AI LOG] Background job failed abruptly:', err);
    });

    res.status(201).json({
      success: true,
      message: 'Document uploaded and is processing in background',
      data: result,
    });
  } catch (error) {
    if (req.file && req.file.path) {
      fs.unlink(req.file.path).catch((err) => console.error('Failed to delete temp file:', err));
    }
    throw error;
  }
});

export const getAllDocuments = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, 'Unauthorized');
  const collectionId = req.query.collectionId as string | undefined;
  const documents = await documentService.getAllDocuments(req.user.id, collectionId);
  res.status(200).json({ success: true, data: documents });
});

export const getDocumentById = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, 'Unauthorized');
  const id = req.params.id as string;
  const document = await documentService.getDocumentById(id, req.user.id);
  res.status(200).json({ success: true, data: document });
});

export const deleteDocument = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, 'Unauthorized');
  const id = req.params.id as string;
  await documentService.deleteDocument(id, req.user.id);
  res.status(200).json({ success: true, message: 'Document deleted successfully' });
});

export const reindexDocument = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, 'Unauthorized');
  const id = req.params.id as string;
  const document = await documentService.getDocumentById(id, req.user.id);

  processDocumentBackground(document.id, document.filePath, document.collectionId, document.mimeType, true).catch((err) => {
    console.error('Background job failed for reindex:', err);
  });

  res.status(200).json({ success: true, message: 'Document re-indexing started in background' });
});

export const summarizeDocument = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, 'Unauthorized');
  const id = req.params.id as string;

  // Verify ownership
  await documentService.getDocumentById(id, req.user.id);

  // Fetch first 15 chunks (approx 10,000 - 15,000 words depending on chunk size)
  const chunks = await documentService.getDocumentChunks(id, 15);
  if (!chunks || chunks.length === 0) {
    throw new ApiError(404, 'No content found for this document.');
  }

  const textContext = chunks.map((c) => c.content).join('\n\n');

  const stream = await aiService.generateSummaryStream(textContext);

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  let isClientDisconnected = false;
  req.on('close', () => {
    isClientDisconnected = true;
  });

  try {
    for await (const chunk of stream) {
      if (isClientDisconnected) break;
      if (chunk && chunk.response) {
        res.write(`data: ${JSON.stringify({ type: 'chunk', text: chunk.response })}\n\n`);
      }
    }
  } catch (error) {
    console.error('Error during summarization stream:', error);
    res.write(`data: ${JSON.stringify({ type: 'error', message: 'Stream interrupted' })}\n\n`);
  }

  res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
  res.end();
});

export const translateDocument = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, 'Unauthorized');
  const id = req.params.id as string;
  const { targetLanguage = 'English' } = req.body;

  // Verify ownership
  await documentService.getDocumentById(id, req.user.id);

  // Fetch first 15 chunks
  const chunks = await documentService.getDocumentChunks(id, 15);
  if (!chunks || chunks.length === 0) {
    throw new ApiError(404, 'No content found for this document.');
  }

  const textContext = chunks.map((c) => c.content).join('\n\n');

  const stream = await aiService.generateTranslationStream(textContext, targetLanguage);

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  let isClientDisconnected = false;
  req.on('close', () => {
    isClientDisconnected = true;
  });

  try {
    for await (const chunk of stream) {
      if (isClientDisconnected) break;
      if (chunk && chunk.response) {
        res.write(`data: ${JSON.stringify({ type: 'chunk', text: chunk.response })}\n\n`);
      }
    }
  } catch (error) {
    console.error('Error during translation stream:', error);
    res.write(`data: ${JSON.stringify({ type: 'error', message: 'Stream interrupted' })}\n\n`);
  }

  res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
  res.end();
});
