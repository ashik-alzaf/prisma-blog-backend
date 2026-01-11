import type { Request, Response } from "express";
import { commentServices } from "./comment.service";

const createComment = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    req.body.authorId = user?.id;
    const result = await commentServices.createComment(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Created failed",
    });
    console.log(error);
  }
};
const getByCommentId = async (req: Request, res: Response) => {
  try {
    const { commentId } = req.params;
    if (!commentId) {
      throw new Error("CommentId is requried");
    }
    const result = await commentServices.getByCommentId(commentId);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Fetch failed",
    });
    console.log(error);
  }
};
const getCommentsByAuthor = async (req: Request, res: Response) => {
  try {
    const { authorId } = req.params;
    if (!authorId) {
      throw new Error("AuthorId is requried");
    }
    const result = await commentServices.getCommentsByAuthor(authorId);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Fetch failed",
    });
    console.log(error);
  }
};
const updateComment = async (req: Request, res: Response) => {
  try {
    const userId = req?.user?.id;
    const { commentId } = req.params;
    if (!commentId) {
      throw new Error("AuthorId is requried");
    }
    const result = await commentServices.updateComment(
      commentId,
      req.body,
      userId as string
    );
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "update failed",
    });
    console.log(error);
  }
};
const deleteComment = async (req: Request, res: Response) => {
  try {
    const userId = req?.user?.id;
    const { commentId } = req.params;
    if (!commentId) {
      throw new Error("AuthorId is requried");
    }
    const result = await commentServices.deleteComment(
      commentId,
      userId as string
    );
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "delete failed",
    });
    console.log(error);
  }
};
const moderateComment = async (req: Request, res: Response) => {
  try {
    const { commentId } = req.params;
    const result = await commentServices.moderateComment(
      commentId as string,
      req.body
    );
    res.status(200).json(result);
  } catch (error) {
    const errorMsg =
      error instanceof Error ? error.message : "status update failed";
    res.status(500).json({
      success: false,
      message: errorMsg,
    });
    console.log(error);
  }
};
export const commentControllers = {
  createComment,
  getByCommentId,
  getCommentsByAuthor,
  deleteComment,
  updateComment,
  moderateComment,
};
