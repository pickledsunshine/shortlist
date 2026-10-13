/**
 * Background worker process — run separately from Next.js:
 *   npx tsx src/lib/queue/worker.ts
 *
 * Handles: scraping, CV adaptation, cover letter generation, scheduled scrapes
 */
import "dotenv/config";
import { Worker, type Job } from "bullmq";
import { getRedisConnection, QUEUES } from "./jobs";
import { syncSchedules } from "./scheduler";
import type { ScrapePayload, AdaptCVPayload, CoverLetterPayload } from "./jobs";
import { prisma } from "@/lib/prisma";
import { IndeedScraper } from "@/lib/scraper/indeed";
import { extractSalaryBounds } from "@/lib/scraper/base";
import { parseJobDescription, scoreCV } from "@/lib/ai/jd-parser";
import { adaptCV } from "@/lib/ai/cv-adapter";
import { generateCoverLetter } from "@/lib/ai/cover-letter";
import { generateCVDocx, generateCoverLetterDocx } from "@/lib/ai/docx-generator";
import fs from "fs/promises";
import path from "path";
import mammoth from "mammoth";

const connection = getRedisConnection();

// ─── Scrape Worker ────────────────────────────────────────────────────────────

new Worker<ScrapePayload>(
  QUEUES.SCRAPE,
  async (job: Job<ScrapePayload>) => {
    const { searchProfileId, board } = job.data;
    job.log(`Starting ${board} scrape for profile ${searchProfileId}`);

    const profile = await prisma.searchProfile.findUniqueOrThrow({
      where: { id: searchProfileId },
    });

    let scraped: Awaited<ReturnType<IndeedScraper["scrape"]>> = [];

    if (board === "indeed") {
      const scraper = new IndeedScraper();
      scraped = await scraper.scrape({
        keywords: profile.keywords,
        location: profile.locations[0] ?? "",
        remoteOnly: profile.remoteOnly,
        maxPages: 3,
      });
    }

    let saved = 0;
    for (const raw of scraped) {
      // Skip if we already have this URL
      const exists = await prisma.job.findUnique({ where: { sourceUrl: raw.sourceUrl } });
      if (exists) continue;

      // Parse JD and compute match score
      let matchScore: number | undefined;
      try {
        const parsed = await parseJobDescription(raw.description);
        const score = await scoreCV(
          profile.keywords.join(" "), // rough proxy until user uploads CV
          parsed
        );
        matchScore = score;
      } catch {
        // Non-critical — don't fail the whole job
      }

      const { salaryMin, salaryMax } = extractSalaryBounds(raw.salary);

      await prisma.job.create({
        data: {
          ...raw,
          salaryMin,
          salaryMax,
          matchScore,
          searchProfileId,
        },
      });
      saved++;
    }

    // Stamp last scraped time on the profile
    await prisma.searchProfile.update({
      where: { id: searchProfileId },
      data: { lastScrapedAt: new Date() },
    }).catch(() => {}); // non-critical

    job.log(`Saved ${saved} new jobs from ${scraped.length} scraped`);
    return { scraped: scraped.length, saved };
  },
  { connection, concurrency: 1 }
);

// ─── CV Adapt Worker ──────────────────────────────────────────────────────────

new Worker<AdaptCVPayload>(
  QUEUES.ADAPT_CV,
  async (job: Job<AdaptCVPayload>) => {
    const { applicationId, baseCvPath, jdText } = job.data;
    job.log(`Adapting CV for application ${applicationId}`);

    // Read base CV text
    const ext = path.extname(baseCvPath).toLowerCase();
    let cvText: string;
    if (ext === ".docx") {
      const result = await mammoth.extractRawText({ path: baseCvPath });
      cvText = result.value;
    } else {
      cvText = await fs.readFile(baseCvPath, "utf8");
    }

    const parsedJD = await parseJobDescription(jdText);
    const adapted = await adaptCV(cvText, parsedJD, jdText);
    const matchScore = await scoreCV(cvText, parsedJD);

    const docxBuffer = await generateCVDocx(adapted);
    const outputPath = path.join("uploads", `cv_${applicationId}_adapted.docx`);
    await fs.writeFile(outputPath, docxBuffer);

    await prisma.cvVersion.create({
      data: {
        isBase: false,
        filePath: outputPath,
        rawText: JSON.stringify(adapted),
        matchScore,
        applicationId,
      },
    });

    // Update job match score
    await prisma.job.update({
      where: { id: job.data.jobId },
      data: { matchScore },
    });

    job.log(`CV adapted, match score: ${matchScore}, saved to ${outputPath}`);
    return { matchScore, filePath: outputPath };
  },
  { connection, concurrency: 2 }
);

// ─── Cover Letter Worker ──────────────────────────────────────────────────────

new Worker<CoverLetterPayload>(
  QUEUES.COVER_LETTER,
  async (job: Job<CoverLetterPayload>) => {
    const { applicationId, cvText, jdText, templatePath } = job.data;
    job.log(`Generating cover letter for application ${applicationId}`);

    let templateText: string | undefined;
    if (templatePath) {
      const ext = path.extname(templatePath).toLowerCase();
      if (ext === ".docx") {
        const result = await mammoth.extractRawText({ path: templatePath });
        templateText = result.value;
      } else {
        templateText = await fs.readFile(templatePath, "utf8");
      }
    }

    const parsedJD = await parseJobDescription(jdText);
    const letterText = await generateCoverLetter(cvText, parsedJD, jdText, templateText);

    // Extract candidate name from CV text (first line usually)
    const name = cvText.split("\n")[0].trim() || "Candidate";
    const docxBuffer = await generateCoverLetterDocx(letterText, name);
    const outputPath = path.join("uploads", `cover_${applicationId}.docx`);
    await fs.writeFile(outputPath, docxBuffer);

    await prisma.coverLetter.create({
      data: {
        content: letterText,
        templateUsed: !!templateText,
        filePath: outputPath,
        applicationId,
      },
    });

    job.log(`Cover letter saved to ${outputPath}`);
    return { filePath: outputPath };
  },
  { connection, concurrency: 2 }
);

// Sync scheduled repeat jobs with DB on startup
syncSchedules()
  .then(() => console.log("Workers started — listening for jobs..."))
  .catch((err) => {
    console.error("Scheduler sync failed:", err);
    console.log("Workers started — listening for jobs (scheduler sync failed)...");
  });
