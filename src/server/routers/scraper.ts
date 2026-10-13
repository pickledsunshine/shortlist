import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/trpc";
import { getScrapeQueue } from "@/lib/queue/jobs";
import {
  scheduleProfile,
  removeAllProfileSchedules,
  getScheduledProfileIds,
} from "@/lib/queue/scheduler";
import { prisma } from "@/lib/prisma";

const INTERVAL_OPTIONS = [2, 6, 12, 24] as const;

export const scraperRouter = createTRPCRouter({
  // One-off manual trigger
  trigger: publicProcedure
    .input(
      z.object({
        searchProfileId: z.string().optional(),
        board: z.enum(["indeed", "linkedin", "glassdoor"]).default("indeed"),
      })
    )
    .mutation(async ({ input }) => {
      const profiles = input.searchProfileId
        ? await prisma.searchProfile.findMany({
            where: { id: input.searchProfileId, isActive: true },
          })
        : await prisma.searchProfile.findMany({ where: { isActive: true } });

      if (profiles.length === 0)
        return { queued: 0, message: "No active search profiles found" };

      const queue = getScrapeQueue();
      const jobs = await Promise.all(
        profiles.map((p) =>
          queue.add(
            "scrape",
            { searchProfileId: p.id, board: input.board },
            { jobId: `manual-${p.id}-${input.board}-${Date.now()}` }
          )
        )
      );

      return { queued: jobs.length, profiles: profiles.map((p) => p.name) };
    }),

  // Set auto-scrape interval for a profile (null = disable)
  setInterval: publicProcedure
    .input(
      z.object({
        profileId: z.string(),
        intervalHours: z.number().refine(
          (v) => (INTERVAL_OPTIONS as readonly number[]).includes(v),
          { message: "Must be 2, 6, 12, or 24" }
        ).nullable(),
      })
    )
    .mutation(async ({ input }) => {
      const profile = await prisma.searchProfile.update({
        where: { id: input.profileId },
        data: { scrapeIntervalHours: input.intervalHours },
      });

      if (input.intervalHours && profile.isActive) {
        // Schedule on all boards configured for this profile
        await Promise.all(
          profile.boards.map((board) =>
            scheduleProfile(profile.id, board, input.intervalHours!)
          )
        );
      } else {
        await removeAllProfileSchedules(input.profileId);
      }

      return profile;
    }),

  // Pause auto-scraping for a profile (keeps interval saved)
  pause: publicProcedure
    .input(z.object({ profileId: z.string() }))
    .mutation(async ({ input }) => {
      await prisma.searchProfile.update({
        where: { id: input.profileId },
        data: { isActive: false },
      });
      await removeAllProfileSchedules(input.profileId);
      return { paused: true };
    }),

  // Resume auto-scraping for a profile
  resume: publicProcedure
    .input(z.object({ profileId: z.string() }))
    .mutation(async ({ input }) => {
      const profile = await prisma.searchProfile.update({
        where: { id: input.profileId },
        data: { isActive: true },
      });

      if (profile.scrapeIntervalHours) {
        await Promise.all(
          profile.boards.map((board) =>
            scheduleProfile(profile.id, board, profile.scrapeIntervalHours!)
          )
        );
      }

      return { resumed: true };
    }),

  // Get schedule status for all profiles
  scheduleStatus: publicProcedure.query(async () => {
    const [profiles, scheduledIds, queue] = await Promise.all([
      prisma.searchProfile.findMany({ orderBy: { createdAt: "desc" } }),
      getScheduledProfileIds(),
      Promise.resolve(getScrapeQueue()),
    ]);

    const [waiting, active] = await Promise.all([
      queue.getWaitingCount(),
      queue.getActiveCount(),
    ]);

    return {
      profiles: profiles.map((p) => ({
        id: p.id,
        name: p.name,
        isActive: p.isActive,
        intervalHours: p.scrapeIntervalHours,
        isScheduled: scheduledIds.has(p.id),
        lastScrapedAt: p.lastScrapedAt,
      })),
      queue: { waiting, active },
    };
  }),

  // Queue stats only
  status: publicProcedure.query(async () => {
    const queue = getScrapeQueue();
    const [waiting, active, completed, failed] = await Promise.all([
      queue.getWaitingCount(),
      queue.getActiveCount(),
      queue.getCompletedCount(),
      queue.getFailedCount(),
    ]);
    return { waiting, active, completed, failed };
  }),
});
