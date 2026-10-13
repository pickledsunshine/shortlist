import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/trpc";
import { prisma } from "@/lib/prisma";
import {
  scheduleProfile,
  removeAllProfileSchedules,
} from "@/lib/queue/scheduler";

const searchProfileInput = z.object({
  name: z.string().min(1),
  keywords: z.array(z.string()),
  excludeWords: z.array(z.string()).default([]),
  locations: z.array(z.string()).default([]),
  remoteOnly: z.boolean().default(false),
  salaryMin: z.number().optional(),
  salaryMax: z.number().optional(),
  boards: z.array(z.string()).default(["indeed", "linkedin", "glassdoor"]),
});

export const searchProfilesRouter = createTRPCRouter({
  list: publicProcedure.query(() =>
    prisma.searchProfile.findMany({ orderBy: { createdAt: "desc" } })
  ),

  create: publicProcedure
    .input(searchProfileInput)
    .mutation(({ input }) => prisma.searchProfile.create({ data: input })),

  update: publicProcedure
    .input(z.object({ id: z.string() }).merge(searchProfileInput.partial()))
    .mutation(({ input }) => {
      const { id, ...data } = input;
      return prisma.searchProfile.update({ where: { id }, data });
    }),

  // Toggle active AND sync the BullMQ repeat job
  toggleActive: publicProcedure
    .input(z.object({ id: z.string(), isActive: z.boolean() }))
    .mutation(async ({ input }) => {
      const profile = await prisma.searchProfile.update({
        where: { id: input.id },
        data: { isActive: input.isActive },
      });

      if (!input.isActive) {
        await removeAllProfileSchedules(input.id);
      } else if (profile.scrapeIntervalHours) {
        // Resume scheduling if an interval was already set
        await Promise.all(
          profile.boards.map((board) =>
            scheduleProfile(profile.id, board, profile.scrapeIntervalHours!)
          )
        );
      }

      return profile;
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      await removeAllProfileSchedules(input.id);
      return prisma.searchProfile.delete({ where: { id: input.id } });
    }),
});
