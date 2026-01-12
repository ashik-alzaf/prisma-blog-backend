import type { NextFunction, Request, Response } from "express";
import { postServices } from "./post.service";
import type { PostStatus } from "../../../generated/prisma/enums";
import paginationSortingHelper from "../../helpers/paginationSortingHelper";
import { UserRole } from "../../middleware/auth.middleware";

const createPost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }
    const result = await postServices.createPost(req.body, userId);
    res.status(201).json({
      success: true,
      message: "Post created successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
const getAllPost = async (req: Request, res: Response) => {
  try {
    const { search } = req.query;
    const searchString = typeof search === "string" ? search : undefined;
    const tags = req.query.tags ? (req.query.tags as string).split(",") : [];
    const isFeatured: any = req.query.isFeatured
      ? req.query.isFeatured === "true"
        ? true
        : req.query.isFeatured === "false"
        ? false
        : undefined
      : undefined;
    const status = req.query.status as PostStatus;
    const authorId = req.query.authorId as string;
    const { page, skip, limit, sortBy, sortOrder } = paginationSortingHelper(
      req.query
    );
    const result = await postServices.getAllPost({
      search: searchString,
      tags,
      isFeatured,
      status,
      authorId,
      page,
      skip,
      limit,
      sortBy,
      sortOrder,
    });
    res.status(201).json({
      success: true,
      message: "Post get successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Created failed",
    });
    console.log(error);
  }
};

const getByAuthorId = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    if (!postId) {
      throw new Error("PostId is required");
    }
    const result = await postServices.getByAuthorId(postId);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "get failed",
    });
    console.log(error);
  }
};
const getMyPost = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      throw new Error("Your are unauthorized");
    }
    const result = await postServices.getMyPost(user.id);
    res.status(200).json(result);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "fetched failed";
    res.status(500).json({
      success: false,
      message: errorMessage,
    });
    console.log(error);
  }
};
const updatePost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    const { postId } = req.params;
    const isAdmin = user?.role === UserRole.ADMIN;
    if (!user) {
      throw new Error("Your are unauthorized");
    }
    const result = await postServices.updatePost(
      postId as string,
      req.body,
      user.id,
      isAdmin
    );
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
const deletePost = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    const { postId } = req.params;
    const isAdmin = user?.role === UserRole.ADMIN;
    if (!user) {
      throw new Error("Your are unauthorized");
    }
    const result = await postServices.deletePost(
      postId as string,
      user.id,
      isAdmin
    );
    res.status(200).json(result);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "delete failed";
    res.status(500).json({
      success: false,
      message: errorMessage,
    });
    console.log(error);
  }
};
const getStats = async (req: Request, res: Response) => {
  try {
    const result = await postServices.getStats();
    res.status(200).json(result);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "fetched failed";
    res.status(500).json({
      success: false,
      message: errorMessage,
    });
    console.log(error);
  }
};
export const postControllers = {
  createPost,
  getAllPost,
  getByAuthorId,
  getMyPost,
  updatePost,
  deletePost,
  getStats,
};
