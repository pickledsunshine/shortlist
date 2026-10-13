/**
 * Proxycurl API client — compliant LinkedIn data provider
 * Docs: https://nubela.co/proxycurl/docs
 * Cost: ~$0.01 per profile lookup, ~$0.03 per search
 *
 * Set PROXYCURL_API_KEY in .env to enable.
 * If not set, the contact finder falls back to manual entry.
 */

const BASE = "https://nubela.co/proxycurl/api";

export type ProxycurlPerson = {
  public_identifier: string;  // LinkedIn ID (slug)
  profile_pic_url: string | null;
  full_name: string;
  headline: string | null;
  occupation: string | null;
  summary: string | null;
  linkedin_profile_url: string;
};

export type ProxycurlSearchResult = {
  results: ProxycurlPerson[];
  next_page: string | null;
  total_result_count: number;
};

// Title keywords we target when searching for contacts at a company
const RECRUITER_KEYWORDS =
  "talent OR recruiter OR hiring OR people operations OR HR";

const MANAGER_KEYWORDS =
  "engineering manager OR head of product OR head of engineering OR " +
  "director OR VP engineering OR VP product OR CTO OR CPO";

async function proxycurlFetch<T>(
  path: string,
  params: Record<string, string>
): Promise<T> {
  const apiKey = process.env.PROXYCURL_API_KEY;
  if (!apiKey) throw new Error("PROXYCURL_API_KEY is not set");

  const url = new URL(`${BASE}${path}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${apiKey}` },
    next: { revalidate: 0 }, // never cache — credits are expensive
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Proxycurl ${res.status}: ${text}`);
  }

  return res.json() as Promise<T>;
}

/**
 * Search for people at a company by role type.
 * Returns up to `limit` results.
 */
export async function searchPeopleAtCompany(
  companyName: string,
  role: "recruiter" | "manager" | "any",
  limit = 5
): Promise<ProxycurlPerson[]> {
  const headline =
    role === "recruiter"
      ? RECRUITER_KEYWORDS
      : role === "manager"
      ? MANAGER_KEYWORDS
      : undefined;

  const params: Record<string, string> = {
    current_company_name: companyName,
    page_size: String(limit),
    enrich_profiles: "skip", // cheaper — basic data only
  };
  if (headline) params.headline = headline;

  const data = await proxycurlFetch<ProxycurlSearchResult>(
    "/search/person/",
    params
  );

  return data.results ?? [];
}

export function isProxycurlConfigured(): boolean {
  return Boolean(process.env.PROXYCURL_API_KEY);
}
