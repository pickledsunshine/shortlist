import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/trpc";
import { prisma } from "@/lib/prisma";

export const applicationsRouter = createTRPCRouter({
  create: publicProcedure
    .input(z.object({ jobId: z.string() }))
    .mutation(async ({ input }) => {
      return prisma.application.upsert({
        where: { jobId: input.jobId },
        create: { jobId: input.jobId },
        update: {},
      });
    }),

  updateStatus: publicProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum(["NEW", "REVIEWED", "APPLIED", "INTERVIEWING", "OFFER", "REJECTED"]),
      })
    )
    .mutation(async ({ input }) => {
      return prisma.application.update({
        where: { id: input.id },
        data: {
          status: input.status,
          appliedAt: input.status === "APPLIED" ? new Date() : undefined,
        },
      });
    }),

  updateNotes: publicProcedure
    .input(z.object({ id: z.string(), notes: z.string() }))
    .mutation(async ({ input }) => {
      return prisma.application.update({
        where: { id: input.id },
        data: { notes: input.notes },
      });
    }),

  listAll: publicProcedure.query(async () => {
    return prisma.application.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        job: true,
        cvVersions: { where: { isBase: false }, orderBy: { createdAt: "desc" }, take: 1 },
        coverLetters: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    });
  }),

  stats: publicProcedure.query(async () => {
    const counts = await prisma.application.groupBy({
      by: ["status"],
      _count: { _all: true },
    });
    return Object.fromEntries(counts.map((c) => [c.status, c._count._all])) as
      Partial<Record<string, number>>;
  }),
});
