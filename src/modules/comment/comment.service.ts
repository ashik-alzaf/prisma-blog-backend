import type { CommentStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";

const createComment = async (payload: {
  content: string;
  authorId: string;
  postId: string;
  parentId?: string;
}) => {
  await prisma.post.findUniqueOrThrow({
    where: {
      id: payload.postId,
    },
  });
  if (payload.parentId) {
    await prisma.comment.findFirstOrThrow({
      where: {
        id: payload.parentId,
      },
    });
  }

  return await prisma.comment.create({
    data: payload,
  });
};
const getByCommentId = async (id: string) => {
  return await prisma.comment.findUnique({
    where: {
      id,
    },
    include: {
      post: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });
};

const getCommentsByAuthor = async (authorId: string) => {
  const allComment = await prisma.comment.findMany({
    where: {
      authorId,
    },
    orderBy: { createdAt: "desc" },
    include: {
      post: {
        select: {
          id: true,
          title: true,
          content: true,
        },
      },
      _count: {
        select: {
          replies: true,
        },
      },
    },
  });
  const totalComment = await prisma.comment.count({
    where: {
      authorId,
    },
  });
  return { allComment, totalComment };
};
const updateComment = async (
  commentId: string,
  data: { content: string; status: CommentStatus },
  authorId: string
) => {
  const commentData = await prisma.comment.findFirst({
    where: {
      id: commentId,
      authorId,
    },
  });
  if (!commentData) {
    throw new Error("Your provided input is invalid");
  }
  return await prisma.comment.update({
    where: {
      id: commentData.id,
      authorId,
    },
    data,
  });
};
const deleteComment = async (commentId: string, authorId: string) => {
  const commentData = await prisma.comment.findFirst({
    where: {
      id: commentId,
      authorId,
    },
  });
  if (!commentData) {
    throw new Error("Your provided input is invalid");
  }
  return await prisma.comment.delete({
    where: {
      id: commentData.id,
    },
  });
};
const moderateComment = async (id: string, data: { status: CommentStatus }) => {
  const commentData = await prisma.comment.findUniqueOrThrow({
    where: {
      id,
    },
    select: {
      id: true,
      status: true,
    },
  });
  if (commentData?.status === data.status) {
    throw new Error(
      `Your Provided status ${data.status} is already up to date`
    );
  }
  return await prisma.comment.update({
    where: {
      id,
    },
    data,
  });
};
export const commentServices = {
  createComment,
  getByCommentId,
  getCommentsByAuthor,
  deleteComment,
  updateComment,
  moderateComment,
};
