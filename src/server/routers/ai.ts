import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/trpc";
import { getAdaptCVQueue, getCoverLetterQueue } from "@/lib/queue/jobs";
import { prisma } from "@/lib/prisma";

export const aiRouter = createTRPCRouter({
  // Queue a CV adaptation job
  adaptCV: publicProcedure
    .input(
      z.object({
        jobId: z.string(),
        baseCvVersionId: z.string(), // id of the base CvVersion to adapt
      })
    )
    .mutation(async ({ input }) => {
      const job = await prisma.job.findUniqueOrThrow({
        where: { id: input.jobId },
      });

      const baseCv = await prisma.cvVersion.findUniqueOrThrow({
        where: { id: input.baseCvVersionId },
      });

      // Ensure application exists
      const application = await prisma.application.upsert({
        where: { jobId: input.jobId },
        create: { jobId: input.jobId },
        update: {},
      });

      const queue = getAdaptCVQueue();
      const queueJob = await queue.add("adapt-cv", {
        applicationId: application.id,
        jobId: job.id,
        baseCvPath: baseCv.filePath,
        jdText: job.description,
      });

      return { queued: true, jobId: queueJob.id };
    }),

  // Queue a cover letter generation job
  generateCoverLetter: publicProcedure
    .input(
      z.object({
        jobId: z.string(),
        baseCvVersionId: z.string(),
        templatePath: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const job = await prisma.job.findUniqueOrThrow({
        where: { id: input.jobId },
      });

      const baseCv = await prisma.cvVersion.findUniqueOrThrow({
        where: { id: input.baseCvVersionId },
      });

      const application = await prisma.application.upsert({
        where: { jobId: input.jobId },
        create: { jobId: input.jobId },
        update: {},
      });

      const queue = getCoverLetterQueue();
      const queueJob = await queue.add("cover-letter", {
        applicationId: application.id,
        jobId: job.id,
        cvText: baseCv.rawText,
        jdText: job.description,
        templatePath: input.templatePath,
      });

      return { queued: true, jobId: queueJob.id };
    }),

  // Get the base CV versions (for the settings/upload page)
  listBaseCVs: publicProcedure.query(() =>
    prisma.cvVersion.findMany({
      where: { isBase: true },
      orderBy: { createdAt: "desc" },
    })
  ),
});
