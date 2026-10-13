/**
 * Indeed scraper using RSS feed — no Playwright, no bot detection.
 * Indeed exposes public RSS at: https://www.indeed.com/rss?q=...&l=...
 */
import type { JobScraper, ScrapedJob, ScraperOptions } from "./base";

export class IndeedScraper implements JobScraper {
  async scrape(options: ScraperOptions): Promise<ScrapedJob[]> {
    const { keywords, location = "", remoteOnly = false, maxPages = 3 } = options;
    const jobs: ScrapedJob[] = [];
    const seen = new Set<string>();

    const query = keywords.join(" ");
    const loc = remoteOnly ? "remote" : location;

    for (let start = 0; start < maxPages * 10; start += 10) {
      const url = `https://www.indeed.com/rss?q=${encodeURIComponent(query)}&l=${encodeURIComponent(loc)}&sort=date&start=${start}`;

      try {
        const res = await fetch(url, {
          headers: {
            "User-Agent": "Mozilla/5.0 (compatible; RSS reader)",
            "Accept": "application/rss+xml, application/xml, text/xml",
          },
        });

        if (!res.ok) break;
        const xml = await res.text();
        const items = parseRSS(xml);
        if (items.length === 0) break;

        for (const item of items) {
          if (seen.has(item.sourceUrl)) continue;
          seen.add(item.sourceUrl);
          jobs.push(item);
        }
      } catch {
        break;
      }
    }

    return jobs;
  }
}

function parseRSS(xml: string): ScrapedJob[] {
  const jobs: ScrapedJob[] = [];

  // Extract all <item> blocks
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const item = match[1];

    const title = stripCDATA(tag(item, "title"))
      .replace(/\s*-\s*[^-]+$/, "") // remove "- Company Name" suffix
      .trim();

    const link = stripCDATA(tag(item, "link")).trim();
    const description = stripHTML(stripCDATA(tag(item, "description"))).trim();
    const pubDate = tag(item, "pubDate").trim();

    // Indeed puts "company - location" in the source tag or description
    const source = stripCDATA(tag(item, "source")).trim();

    // Parse company + location from description header (first line usually)
    const { company, location } = parseCompanyLocation(description, source);

    if (!title || !link) continue;

    jobs.push({
      sourceBoard: "indeed",
      sourceUrl: cleanIndeedUrl(link),
      title,
      company,
      location: location || null,
      remote: location?.toLowerCase().includes("remote") ||
              description.toLowerCase().includes("fully remote") || false,
      salary: extractSalary(description),
      description,
      postedAt: pubDate ? new Date(pubDate) : null,
    });
  }

  return jobs;
}

function tag(xml: string, name: string): string {
  const m = xml.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)<\\/${name}>`, "i"));
  return m ? m[1] : "";
}

function stripCDATA(s: string): string {
  return s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").trim();
}

function stripHTML(s: string): string {
  return s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function cleanIndeedUrl(url: string): string {
  // Extract jk param to build canonical URL
  const jkMatch = url.match(/jk=([a-f0-9]+)/i);
  if (jkMatch) return `https://www.indeed.com/viewjob?jk=${jkMatch[1]}`;
  return url;
}

function parseCompanyLocation(description: string, source: string): {
  company: string;
  location: string;
} {
  // Indeed description often starts with: "Company Name\nLocation\n..."
  const lines = description.split(/\n/).map((l) => l.trim()).filter(Boolean);
  const company = source || lines[0] || "Unknown";
  const location = lines[1] || "";
  return { company, location };
}

function extractSalary(description: string): string | null {
  const m = description.match(
    /\$[\d,]+(?:\s*[-–]\s*\$[\d,]+)?(?:\s*(?:per\s+)?(?:hour|yr|year|annually|\/hr|\/year))?/i
  );
  return m ? m[0] : null;
}
