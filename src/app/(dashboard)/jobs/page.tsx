"use client";

import { useEffect, useState } from "react";
import { MapPin, Search, Sparkles, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

const JOBS = [
  { title: "Senior Product Manager", company: "Northstar", location: "London · Hybrid", board: "LinkedIn", score: 94, salary: "£85k–£105k" },
  { title: "Product Lead", company: "Aperture", location: "Remote · UK", board: "Indeed", score: 89, salary: "£80k–£100k" },
  { title: "Growth Product Manager", company: "Lumio", location: "London · Hybrid", board: "Glassdoor", score: 82, salary: "£70k–£90k" },
  { title: "Product Strategy Manager", company: "Orbit", location: "Remote · Europe", board: "LinkedIn", score: 77, salary: "Competitive" },
];

export default function JobsPage() {
  const [search, setSearch] = useState("");
  const [profileName, setProfileName] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  useEffect(() => {
    const timer = window.setTimeout(() => {
      try { setProfileName(JSON.parse(localStorage.getItem("shortlist-demo-profiles") ?? "[]")[0]?.name ?? null); } catch { /* no saved profile */ }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  const jobs = JOBS.filter((job) => `${job.title} ${job.company}`.toLowerCase().includes(search.toLowerCase()));
  return <div>
    <div className="flex items-start justify-between gap-4 mb-6"><div><h1 className="text-2xl font-bold text-[var(--color-brand-navy)]" style={{ fontFamily: "var(--font-display)" }}>Your matches</h1><p className="text-sm text-[var(--color-stone)] mt-1">{profileName ? `Demo matches for ${profileName}` : "Example jobs — set your criteria to personalise the demo."}</p></div><Button onClick={() => setNotice("Demo refreshed — 4 matching jobs found.")}><Sparkles size={14} /> Refresh matches</Button></div>
    <div className="relative max-w-sm mb-5"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-stone)]" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search jobs or companies..." className="w-full pl-8 pr-3 py-2 text-sm bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-btn)] outline-none" /></div>
    {notice && <p className="text-sm text-[var(--color-brand-emerald)] mb-4">{notice}</p>}
    <div className="space-y-3">{jobs.map((job) => <article key={job.title} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-card)] p-5"><div className="flex items-start justify-between gap-4"><div><h2 className="font-semibold text-[var(--color-ink)]">{job.title}</h2><p className="text-sm text-[var(--color-stone)] mt-0.5">{job.company}</p></div><span className="flex items-center gap-1 text-sm font-semibold text-[var(--color-brand-emerald)]"><TrendingUp size={14} />{job.score}% match</span></div><div className="flex gap-4 mt-3 text-xs text-[var(--color-stone)]"><span>{job.board}</span><span className="flex items-center gap-1"><MapPin size={12} />{job.location}</span><span>{job.salary}</span></div></article>)}</div>
  </div>;
}
