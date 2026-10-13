import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/trpc";
import { prisma } from "@/lib/prisma";
import {
  searchPeopleAtCompany,
  isProxycurlConfigured,
} from "@/lib/linkedin/proxycurl";
import { draftOutreachMessage } from "@/lib/ai/outreach";

export const contactsRouter = createTRPCRouter({
  // Whether Proxycurl is configured (shown in UI)
  isConfigured: publicProcedure.query(() => isProxycurlConfigured()),

  // Find contacts at a company for a given job (Proxycurl)
  findForJob: publicProcedure
    .input(
      z.object({
        jobId: z.string(),
        role: z.enum(["recruiter", "manager", "any"]).default("any"),
      })
    )
    .mutation(async ({ input }) => {
      const job = await prisma.job.findUniqueOrThrow({
        where: { id: input.jobId },
      });

      const people = await searchPeopleAtCompany(
        job.company,
        input.role,
        6
      );

      const contacts = await Promise.all(
        people.map((p) =>
          prisma.contact.upsert({
            where: { linkedinUrl: p.linkedin_profile_url },
            create: {
              name: p.full_name,
              title: p.headline ?? p.occupation ?? null,
              company: job.company,
              linkedinUrl: p.linkedin_profile_url,
              jobId_fk: job.id,
            },
            update: {
              title: p.headline ?? p.occupation ?? null,
              jobId_fk: job.id,
            },
          })
        )
      );

      return contacts;
    }),

  // Add a contact manually (fallback when Proxycurl isn't configured)
  addManual: publicProcedure
    .input(
      z.object({
        jobId: z.string(),
        name: z.string().min(1),
        title: z.string().optional(),
        linkedinUrl: z.string().url(),
        degree: z.number().int().min(1).max(3).optional(),
        mutualConnection: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const job = await prisma.job.findUniqueOrThrow({
        where: { id: input.jobId },
      });

      return prisma.contact.create({
        data: {
          name: input.name,
          title: input.title ?? null,
          company: job.company,
          linkedinUrl: input.linkedinUrl,
          degree: input.degree ?? null,
          mutualConnection: input.mutualConnection ?? null,
          jobId_fk: input.jobId,
        },
      });
    }),

  // Delete a contact
  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ input }) =>
      prisma.contact.delete({ where: { id: input.id } })
    ),

  // Generate an AI outreach message for a contact
  draftOutreach: publicProcedure
    .input(
      z.object({
        contactId: z.string(),
        jobId: z.string(),
        senderName: z.string(),
        senderRole: z.string(), // e.g. "senior product manager with 6 years in fintech"
      })
    )
    .mutation(async ({ input }) => {
      const [contact, job] = await Promise.all([
        prisma.contact.findUniqueOrThrow({ where: { id: input.contactId } }),
        prisma.job.findUniqueOrThrow({ where: { id: input.jobId } }),
      ]);

      const application = await prisma.application.findUnique({
        where: { jobId: input.jobId },
      });

      const message = await draftOutreachMessage({
        contactName: contact.name,
        contactTitle: contact.title ?? "",
        company: job.company,
        jobTitle: job.title,
        mutualConnection: contact.mutualConnection ?? undefined,
        senderName: input.senderName,
        senderRole: input.senderRole,
      });

      // Store if we have an application
      if (application) {
        await prisma.outreachDraft.create({
          data: {
            message,
            contactId: contact.id,
            applicationId: application.id,
          },
        });
      }

      return { message };
    }),

  // Mark outreach as sent
  markSent: publicProcedure
    .input(z.object({ outreachDraftId: z.string() }))
    .mutation(({ input }) =>
      prisma.outreachDraft.update({
        where: { id: input.outreachDraftId },
        data: { sent: true },
      })
    ),
});
