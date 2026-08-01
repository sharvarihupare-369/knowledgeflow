import type { Request, Response } from "express";
import { ApiError } from "../../validations/api-error.js";
import * as collectionService from './collection.service.js'

export const createCollection = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            throw new ApiError(401, "Unauthorized");
        }
        const userId = req.user.id;
        const result = await collectionService.createCollection(userId, req.body);
        res.status(201).json({
            success: true,
            message: "Collection Created Successfully",
            data: result
        })
    } catch (error) {
        console.error(error);
        if (error instanceof ApiError) {
            res.status(error.statusCode).json({
                success: false,
                message: error.message
            })
            return
        }
        res.status(500).json({ success: false, message: "Error while creating account." })
    }
}


export const getCollections = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            throw new ApiError(401, "Unauthorized");
        }
        const userId = req.user.id;
        const result = await collectionService.getCollections(userId);
        res.status(200).json({
            success: true,
            message: "Collection Fetched Successfully",
            data: result
        })
    } catch (error) {
        console.error(error);
        if (error instanceof ApiError) {
            res.status(error.statusCode).json({
                success: false,
                message: error.message
            })
            return
        }
        res.status(500).json({ success: false, message: "Error while creating account." })
    }
}


export const editCollection = async (req: Request, res: Response) => {
    try {
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
        })
    } catch (error) {
        console.error(error);
        if (error instanceof ApiError) {
            res.status(error.statusCode).json({
                success: false,
                message: error.message
            })
            return
        }
        res.status(500).json({ success: false, message: "Error while creating account." })
    }
}

export const deleteCollection = async (req: Request, res: Response) => {
    try {
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
        })
    } catch (error) {
        console.error(error);
        if (error instanceof ApiError) {
            res.status(error.statusCode).json({
                success: false,
                message: error.message
            })
            return
        }
        res.status(500).json({ success: false, message: "Error while creating account." })
    }
}