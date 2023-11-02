import { clerkClient } from "@clerk/nextjs";
import type { User } from "@clerk/nextjs/dist/types/server";
import { TRPCError } from "@trpc/server";
import z from "zod";

import {
  createTRPCRouter,
  publicProcedure,
  privateProcedure,
} from "~/server/api/trpc";

const userDataFilter = (user: User) => {
  return { id: user.id, username: user.username, imageUrl: user.imageUrl };
};

export const postRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const posts = await ctx.db.post.findMany({
      take: 100,
      orderBy: [{ createdAt: "desc" }],
    });

    const users = (
      await clerkClient.users.getUserList({
        userId: posts.map((post) => post.authorId),
        limit: 100,
      })
    ).map(userDataFilter);

    return posts.map((post) => {
      const author = users.find((user) => user.id == post.authorId);

      if (!author?.username) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Author for post not found :(",
        });
      }
      return {
        post,
        author: {
          ...author,
          username: author.username,
        },
      };
    });
  }),

  create: privateProcedure
    .input(
      z.object({
        content: z.string().emoji().min(1).max(256),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const authorId = ctx.currentUserId;

      const post = await ctx.db.post.create({
        data: {
          authorId,
          content: input.content,
        },
      });

      return post;
    }),
});
