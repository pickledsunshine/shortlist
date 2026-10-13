// All model types live in the generated client
export type {
  Job,
  Application,
  CvVersion,
  CoverLetter,
  Contact,
  OutreachDraft,
  SearchProfile,
} from "@/generated/prisma/client";

export { ApplicationStatus } from "@/generated/prisma/enums";

// ─── UI / View types ──────────────────────────────────────────────────────────

import type {
  Job,
  Application,
  CvVersion,
  CoverLetter,
  Contact,
  OutreachDraft,
} from "@/generated/prisma/client";

export type JobWithApplication = Job & {
  application: Application | null;
};

export type ApplicationWithRelations = Application & {
  job: Job;
  cvVersions: CvVersion[];
  coverLetters: CoverLetter[];
  outreachDrafts: (OutreachDraft & { contact: Contact })[];
};

export type JobBoard = "indeed" | "linkedin" | "glassdoor" | "other";

export type ScrapeJobPayload = {
  searchProfileId: string;
  board: JobBoard;
};

export type AdaptCvPayload = {
  jobId: string;
  baseCvText: string;
  jobDescription: string;
};

export type GenerateCoverLetterPayload = {
  jobId: string;
  jobDescription: string;
  cvText: string;
  templateText?: string;
};

export type FindContactsPayload = {
  jobId: string;
  company: string;
};
