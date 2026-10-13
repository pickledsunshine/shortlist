import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/trpc";
import { prisma } from "@/lib/prisma";

export const jobsRouter = createTRPCRouter({
  list: publicProcedure
    .input(
      z.object({
        status: z.string().optional(),
        board: z.string().optional(),
        search: z.string().optional(),
        limit: z.number().min(1).max(100).default(50),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const { limit, cursor, board, search } = input;

      const items = await prisma.job.findMany({
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        where: {
          ...(board ? { sourceBoard: board } : {}),
          ...(search
            ? {
                OR: [
                  { title: { contains: search, mode: "insensitive" } },
                  { company: { contains: search, mode: "insensitive" } },
                ],
              }
            : {}),
        },
        orderBy: { scrapedAt: "desc" },
        include: { application: true },
      });

      let nextCursor: string | undefined;
      if (items.length > limit) {
        const next = items.pop();
        nextCursor = next?.id;
      }

      return { items, nextCursor };
    }),

  byId: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return prisma.job.findUniqueOrThrow({
        where: { id: input.id },
        include: {
          application: {
            include: {
              cvVersions: true,
              coverLetters: true,
              outreachDrafts: { include: { contact: true } },
            },
          },
          contacts: true,
        },
      });
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      return prisma.job.delete({ where: { id: input.id } });
    }),
});
