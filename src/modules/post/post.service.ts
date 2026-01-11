import {
  CommentStatus,
  type Post,
  type PostStatus,
} from "../../../generated/prisma/client";
import type { PostWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";

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
export const postServices = {
  createPost,
  getAllPost,
  getByAuthorId,
};
