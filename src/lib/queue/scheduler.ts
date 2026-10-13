/**
 * Manages BullMQ repeating jobs for automatic scraping.
 *
 * Each active SearchProfile with a scrapeIntervalHours value gets a
 * BullMQ repeat job that fires on that interval.
 *
 * Job key format: `schedule:{profileId}:{board}`
 * This lets us remove/replace per-profile without touching other jobs.
 */

import { getScrapeQueue } from "./jobs";
import { prisma } from "@/lib/prisma";
import type { ScrapePayload } from "./jobs";

const JOB_NAME = "scrape";

function repeatJobId(profileId: string, board: string) {
  return `schedule:${profileId}:${board}`;
}

/** Add (or replace) a repeat job for one profile+board pair. */
export async function scheduleProfile(
  profileId: string,
  board: string,
  intervalHours: number
): Promise<void> {
  const queue = getScrapeQueue();
  const intervalMs = intervalHours * 60 * 60 * 1000;
  const jobId = repeatJobId(profileId, board);

  // Remove any existing repeat job with this ID first
  await removeProfileSchedule(profileId, board);

  await queue.add(
    JOB_NAME,
    { searchProfileId: profileId, board: board as ScrapePayload["board"] } satisfies ScrapePayload,
    {
      repeat: { every: intervalMs },
      jobId,
      // Run first scrape immediately, then on interval
      delay: 0,
    }
  );
}

/** Remove the repeat job for one profile+board pair. */
export async function removeProfileSchedule(
  profileId: string,
  board: string
): Promise<void> {
  const queue = getScrapeQueue();
  const jobId = repeatJobId(profileId, board);

  const repeatableJobs = await queue.getRepeatableJobs();
  const match = repeatableJobs.find((j) => j.id === jobId);
  if (match) {
    await queue.removeRepeatableByKey(match.key);
  }
}

/** Remove ALL repeat jobs for a profile (all boards). */
export async function removeAllProfileSchedules(profileId: string): Promise<void> {
  const queue = getScrapeQueue();
  const repeatableJobs = await queue.getRepeatableJobs();
  const matches = repeatableJobs.filter((j) => j.id?.startsWith(`schedule:${profileId}:`));
  await Promise.all(matches.map((j) => queue.removeRepeatableByKey(j.key)));
}

/** Get IDs of all currently scheduled profiles (from BullMQ). */
export async function getScheduledProfileIds(): Promise<Set<string>> {
  const queue = getScrapeQueue();
  const repeatableJobs = await queue.getRepeatableJobs();
  const ids = new Set<string>();
  for (const j of repeatableJobs) {
    const match = j.id?.match(/^schedule:([^:]+):/);
    if (match) ids.add(match[1]);
  }
  return ids;
}

/**
 * Sync BullMQ repeat jobs with DB state.
 * Called once on worker startup and after any schedule change.
 *
 * - Profiles that are active + have an interval → ensure job exists
 * - Profiles that are inactive OR have no interval → ensure job removed
 */
export async function syncSchedules(): Promise<void> {
  const profiles = await prisma.searchProfile.findMany();
  const queue = getScrapeQueue();
  const existing = await queue.getRepeatableJobs();

  // Build a map of currently scheduled jobs: `profileId:board` → key
  const scheduledMap = new Map<string, string>();
  for (const j of existing) {
    const match = j.id?.match(/^schedule:([^:]+):(.+)$/);
    if (match) scheduledMap.set(`${match[1]}:${match[2]}`, j.key);
  }

  for (const profile of profiles) {
    const shouldSchedule = profile.isActive && profile.scrapeIntervalHours != null;

    for (const board of profile.boards) {
      const key = `${profile.id}:${board}`;
      const isScheduled = scheduledMap.has(key);

      if (shouldSchedule && !isScheduled) {
        // Add missing job
        await scheduleProfile(profile.id, board, profile.scrapeIntervalHours!);
        console.log(`[scheduler] Added: ${profile.name} on ${board} every ${profile.scrapeIntervalHours}h`);
      } else if (!shouldSchedule && isScheduled) {
        // Remove stale job
        await queue.removeRepeatableByKey(scheduledMap.get(key)!);
        console.log(`[scheduler] Removed: ${profile.name} on ${board}`);
      } else if (shouldSchedule && isScheduled) {
        // Check interval hasn't changed — if so, re-schedule
        const existingJob = existing.find((j) => j.id?.includes(key));
        if (existingJob && existingJob.every != null && Number(existingJob.every) !== profile.scrapeIntervalHours! * 3600000) {
          await scheduleProfile(profile.id, board, profile.scrapeIntervalHours!);
          console.log(`[scheduler] Updated interval: ${profile.name} on ${board}`);
        }
      }
    }
  }

  console.log("[scheduler] Sync complete.");
}
