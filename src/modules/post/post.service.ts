import {
  CommentStatus,
  PostStatus,
  type Post,
} from "../../../generated/prisma/client";
import type { PostWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";
import { UserRole } from "../../middleware/auth.middleware";

const createPost = async (
  data: Omit<Post, "id" | "createdAt" | "updatedAt" | "authorId">,
  userId: string
) => {
  return await prisma.post.create({
    data: {
      ...data,
      authorId: userId,
    },
  });
};

const getAllPost = async ({
  search,
  tags,
  isFeatured,
  status,
  authorId,
  page,
  skip,
  limit,
  sortBy,
  sortOrder,
}: {
  search: string | undefined;
  tags: string[] | [];
  isFeatured: boolean | undefined;
  status: PostStatus | undefined;
  authorId: string | undefined;
  page: number;
  skip: number;
  limit: number;
  sortBy: string;
  sortOrder: string;
}) => {
  const andConditions: PostWhereInput[] = [];
  if (search) {
    andConditions.push({
      OR: [
        {
          title: {
            contains: search as string,
            mode: "insensitive",
          },
        },
        {
          content: {
            contains: search as string,
            mode: "insensitive",
          },
        },
        {
          tags: {
            has: search as string,
          },
        },
      ],
    });
  }
  if (tags?.length > 0) {
    andConditions.push({
      tags: {
        hasEvery: tags as string[],
      },
    });
  }
  if (typeof isFeatured === "boolean") {
    andConditions.push({
      isFeatured,
    });
  }
  if (status) {
    andConditions.push({
      status,
    });
  }
  if (authorId) {
    andConditions.push({
      authorId,
    });
  }
  const allPost = await prisma.post.findMany({
    skip,
    take: limit,
    orderBy:
      sortBy && sortOrder
        ? {
            [sortBy]: sortOrder,
          }
        : { createdAt: "desc" },
    where: {
      AND: andConditions,
    },
  });
  const total = await prisma.post.count({
    where: {
      AND: andConditions,
    },
  });
  return {
    post_data: allPost,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getByAuthorId = async (id: string) => {
  return await prisma.$transaction(async (tx) => {
    await tx.post.update({
      where: {
        id,
      },
      data: {
        veiws: {
          increment: 1,
        },
      },
    });
    return await tx.post.findUnique({
      where: {
        id,
      },
      include: {
        comments: {
          where: {
            parentId: null,
            status: CommentStatus.APPROVED,
          },
          orderBy: { createdAt: "desc" },
          include: {
            replies: {
              where: {
                status: CommentStatus.APPROVED,
              },
              orderBy: { createdAt: "asc" },
              include: {
                replies: {
                  where: {
                    status: CommentStatus.APPROVED,
                  },
                  orderBy: { createdAt: "asc" },
                },
              },
            },
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
    });
  });
};
const getMyPost = async (authorId: string) => {
  const userInfo = await prisma.user.findUnique({
    where: {
      id: authorId,
    },
    select: {
      id: true,
      status: true,
    },
  });
  if (userInfo?.status !== "ACTIVE") {
    throw new Error("User is Inactive");
  }
  const postData = await prisma.post.findMany({
    where: {
      authorId,
    },
    include: {
      _count: {
        select: {
          comments: true,
        },
      },
    },
  });
  // const total = await prisma.post.count({
  //   where: {
  //     authorId,
  //   },
  // });
  const total = await prisma.post.aggregate({
    _count: {
      id: true,
    },
    where: {
      authorId,
    },
  });
  return { postData, total };
};

const updatePost = async (
  postId: string,
  data: Partial<Post>,
  authorId: string,
  isAdmin: boolean
) => {
  const postInfo = await prisma.post.findUniqueOrThrow({
    where: {
      id: postId,
    },
    select: {
      id: true,
      authorId: true,
    },
  });

  if (!isAdmin && postInfo.authorId !== authorId) {
    throw new Error("Your are not owner/create of the post");
  }
  if (!isAdmin) {
    delete data.isFeatured;
  }
  return await prisma.post.update({
    where: {
      id: postId,
    },
    data,
  });
};
const deletePost = async (
  postId: string,
  authorId: string,
  isAdmin: boolean
) => {
  const postInfo = await prisma.post.findUniqueOrThrow({
    where: {
      id: postId,
    },
    select: {
      id: true,
      authorId: true,
    },
  });
  if (!isAdmin && postInfo.authorId !== authorId) {
    throw new Error("Your are not owner/create of the post");
  }
  return await prisma.post.delete({
    where: {
      id: postInfo.id,
    },
  });
};

const getStats = async () => {
  return await prisma.$transaction(async (tx) => {
    const [
      postCount,
      publishedPost,
      draftPost,
      arcrivedPost,
      veiwPost,
      totalComment,
      approvedComment,
      rejectComment,
      totalAdmin,
      totalUser,
    ] = await Promise.all([
      await tx.post.count(),
      await tx.post.count({ where: { status: PostStatus.PUBLISHED } }),
      await tx.post.count({ where: { status: PostStatus.DRAFT } }),
      await tx.post.count({ where: { status: PostStatus.ARCRIVED } }),
      await tx.post.aggregate({ _sum: { veiws: true } }),
      await tx.comment.count(),
      await tx.comment.count({ where: { status: CommentStatus.APPROVED } }),
      await tx.comment.count({ where: { status: CommentStatus.REJECT } }),
      await tx.user.count({ where: { role: UserRole.ADMIN } }),
      await tx.user.count({ where: { role: UserRole.USER } }),
    ]);

    return {
      postCount,
      publishedPost,
      draftPost,
      arcrivedPost,
      veiwPost: veiwPost._sum.veiws,
      totalComment,
      approvedComment,
      rejectComment,
      totalAdmin,
      totalUser,
    };
  });
};
export const postServices = {
  createPost,
  getAllPost,
  getByAuthorId,
  getMyPost,
  updatePost,
  deletePost,
  getStats,
};
