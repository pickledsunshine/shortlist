import { chromium } from "playwright";
import type { JobScraper, ScrapedJob, ScraperOptions } from "./base";
import { randomDelay } from "./base";

// Glassdoor scraper — stub for Phase 2
// Glassdoor has aggressive bot detection; implement after Indeed is stable
export class GlassdoorScraper implements JobScraper {
  async scrape(_options: ScraperOptions): Promise<ScrapedJob[]> {
    console.warn("Glassdoor scraper not yet implemented");
    return [];
  }
}
