import { Queue, Worker, type Job } from "bullmq";
import IORedis from "ioredis";

// ─── Connection ───────────────────────────────────────────────────────────────

export function getRedisConnection() {
  return new IORedis(process.env.REDIS_URL ?? "redis://localhost:6379", {
    maxRetriesPerRequest: null,
  });
}

// ─── Queue names ──────────────────────────────────────────────────────────────

export const QUEUES = {
  SCRAPE: "scrape",
  ADAPT_CV: "adapt-cv",
  COVER_LETTER: "cover-letter",
} as const;

// ─── Job payloads ─────────────────────────────────────────────────────────────

export type ScrapePayload = {
  searchProfileId: string;
  board: "indeed" | "linkedin" | "glassdoor";
};

export type AdaptCVPayload = {
  applicationId: string;
  jobId: string;
  baseCvPath: string;
  jdText: string;
};

export type CoverLetterPayload = {
  applicationId: string;
  jobId: string;
  cvText: string;
  jdText: string;
  templatePath?: string;
};

// ─── Queue instances (singleton per process) ─────────────────────────────────

let _scrapeQueue: Queue | null = null;
let _adaptQueue: Queue | null = null;
let _coverLetterQueue: Queue | null = null;

export function getScrapeQueue(): Queue {
  if (!_scrapeQueue) {
    _scrapeQueue = new Queue(QUEUES.SCRAPE, {
      connection: getRedisConnection(),
      defaultJobOptions: { attempts: 2, backoff: { type: "exponential", delay: 5000 } },
    });
  }
  return _scrapeQueue;
}

export function getAdaptCVQueue(): Queue {
  if (!_adaptQueue) {
    _adaptQueue = new Queue(QUEUES.ADAPT_CV, {
      connection: getRedisConnection(),
      defaultJobOptions: { attempts: 2, backoff: { type: "exponential", delay: 3000 } },
    });
  }
  return _adaptQueue;
}

export function getCoverLetterQueue(): Queue {
  if (!_coverLetterQueue) {
    _coverLetterQueue = new Queue(QUEUES.COVER_LETTER, {
      connection: getRedisConnection(),
      defaultJobOptions: { attempts: 2, backoff: { type: "exponential", delay: 3000 } },
    });
  }
  return _coverLetterQueue;
}
