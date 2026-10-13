import { createTRPCRouter } from "@/server/trpc";
import { jobsRouter } from "@/server/routers/jobs";
import { applicationsRouter } from "@/server/routers/applications";
import { searchProfilesRouter } from "@/server/routers/search-profiles";
import { aiRouter } from "@/server/routers/ai";
import { scraperRouter } from "@/server/routers/scraper";
import { contactsRouter } from "@/server/routers/contacts";

export const appRouter = createTRPCRouter({
  jobs: jobsRouter,
  applications: applicationsRouter,
  searchProfiles: searchProfilesRouter,
  ai: aiRouter,
  scraper: scraperRouter,
  contacts: contactsRouter,
});

export type AppRouter = typeof appRouter;
