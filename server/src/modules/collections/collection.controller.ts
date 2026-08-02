import type { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { ApiError } from "../../validations/api-error.js";
import * as collectionService from './collection.service.js'

export const createCollection = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
        throw new ApiError(401, "Unauthorized");
    }
    const userId = req.user.id;
    const result = await collectionService.createCollection(userId, req.body);
    res.status(201).json({
        success: true,
        message: "Collection Created Successfully",
        data: result
    });
});

export const getCollections = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
        throw new ApiError(401, "Unauthorized");
    }
    const userId = req.user.id;
    const result = await collectionService.getCollections(userId);
    res.status(200).json({
        success: true,
        message: "Collection Fetched Successfully",
        data: result
    });
});

export const editCollection = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
        throw new ApiError(401, "Unauthorized");
    }
    const userId = req.user.id;
    const id = req.params.id as string;
    const result = await collectionService.editCollection(userId, id, req.body);
    res.status(200).json({
        success: true,
        message: "Collection Edited Successfully",
        data: result
    });
});

export const deleteCollection = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
        throw new ApiError(401, "Unauthorized");
    }
    const userId = req.user.id;
    const id = req.params.id as string;
    const result = await collectionService.deleteCollection(userId, id);
    res.status(200).json({
        success: true,
        message: "Collection Deleted Successfully",
        data: result
    });
});