export type ScrapedJob = {
  sourceBoard: string;
  sourceUrl: string;
  title: string;
  company: string;
  location: string | null;
  remote: boolean;
  salary: string | null;
  description: string;
  postedAt: Date | null;
};

export type ScraperOptions = {
  keywords: string[];
  location?: string;
  remoteOnly?: boolean;
  maxPages?: number; // default 3
};

export interface JobScraper {
  scrape(options: ScraperOptions): Promise<ScrapedJob[]>;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function randomDelay(minMs = 1500, maxMs = 3500): Promise<void> {
  return sleep(Math.floor(Math.random() * (maxMs - minMs) + minMs));
}

export function extractSalaryBounds(salaryStr: string | null): {
  salaryMin: number | null;
  salaryMax: number | null;
} {
  if (!salaryStr) return { salaryMin: null, salaryMax: null };

  const numbers = salaryStr.match(/[\d,]+/g)?.map((n) =>
    parseInt(n.replace(/,/g, ""), 10)
  );
  if (!numbers || numbers.length === 0)
    return { salaryMin: null, salaryMax: null };

  // Annualise if hourly (assume <500 = hourly rate)
  const annualise = (n: number) => (n < 500 ? n * 40 * 52 : n);

  return {
    salaryMin: annualise(Math.min(...numbers)),
    salaryMax: annualise(Math.max(...numbers)),
  };
}
