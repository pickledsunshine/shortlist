import Link from "next/link";
import { MapPin, Calendar, TrendingUp } from "lucide-react";
import { StatusBadge, BoardBadge } from "@/components/ui/badge";
import type { JobWithApplication } from "@/types";

function timeAgo(date: Date | null): string {
  if (!date) return "Unknown date";
  const diff = Date.now() - new Date(date).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export function JobCard({ job }: { job: JobWithApplication }) {
  const status = job.application?.status;

  return (
    <Link href={`/jobs/${job.id}`}>
      <article className="group bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-card)] p-5 hover:shadow-[var(--shadow-card-hover)] hover:bg-[var(--color-sky-tint)] transition-all cursor-pointer">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="font-semibold text-[var(--color-ink)] text-sm truncate group-hover:text-[var(--color-brand-navy)]">
              {job.title}
            </h3>
            <p className="text-[var(--color-stone)] text-sm mt-0.5">{job.company}</p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {job.matchScore != null && (
              <span className="flex items-center gap-1 text-xs font-medium text-[var(--color-brand-emerald)]">
                <TrendingUp size={12} />
                {job.matchScore}%
              </span>
            )}
            {status && <StatusBadge status={status} />}
          </div>
        </div>

        <div className="flex items-center gap-4 mt-3 flex-wrap">
          <BoardBadge board={job.sourceBoard} />
          {job.location && (
            <span className="flex items-center gap-1 text-xs text-[var(--color-stone)]">
              <MapPin size={11} />
              {job.location}
            </span>
          )}
          {job.salary && (
            <span className="text-xs text-[var(--color-stone)]">{job.salary}</span>
          )}
          <span className="flex items-center gap-1 text-xs text-[var(--color-stone)] ml-auto">
            <Calendar size={11} />
            {timeAgo(job.postedAt)}
          </span>
        </div>
      </article>
    </Link>
  );
}
