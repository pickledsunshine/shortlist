"use client";

import Link from "next/link";
import { Draggable } from "@hello-pangea/dnd";
import { TrendingUp, Download, FileText, Calendar } from "lucide-react";

type CardApplication = {
  id: string;
  status: string;
  appliedAt: Date | null;
  updatedAt: Date;
  notes: string | null;
  job: {
    id: string;
    title: string;
    company: string;
    location: string | null;
    matchScore: number | null;
    sourceBoard: string;
  };
  cvVersions: { filePath: string }[];
  coverLetters: { filePath: string | null }[];
};

function daysAgo(date: Date): string {
  const d = Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
  if (d === 0) return "Today";
  if (d === 1) return "Yesterday";
  return `${d}d ago`;
}

const boardColors: Record<string, string> = {
  indeed:    "bg-[#E8F0FE] text-[#1E3A8A]",
  linkedin:  "bg-[#EFF6FF] text-[#1D4ED8]",
  glassdoor: "bg-[#F0FDF4] text-[#166534]",
  other:     "bg-[var(--color-background)] text-[var(--color-stone)]",
};

export function ApplicationCard({
  application,
  index,
}: {
  application: CardApplication;
  index: number;
}) {
  const adaptedCV = application.cvVersions[0];
  const coverLetter = application.coverLetters[0];
  const filename = (path: string) => path.split(/[\\/]/).pop()!;

  return (
    <Draggable draggableId={application.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`bg-[var(--color-surface)] border rounded-[var(--radius-card)] p-4 cursor-grab active:cursor-grabbing transition-shadow select-none ${
            snapshot.isDragging
              ? "shadow-[var(--shadow-modal)] border-[var(--color-brand-navy)] rotate-1"
              : "border-[var(--color-border)] shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)]"
          }`}
        >
          {/* Title + match */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <Link
              href={`/jobs/${application.job.id}`}
              className="font-semibold text-sm text-[var(--color-brand-navy)] hover:underline leading-tight"
              onClick={(e) => e.stopPropagation()}
            >
              {application.job.title}
            </Link>
            {application.job.matchScore != null && (
              <span className="flex items-center gap-1 text-xs font-medium text-[var(--color-brand-emerald)] shrink-0">
                <TrendingUp size={11} />
                {application.job.matchScore}%
              </span>
            )}
          </div>

          {/* Company */}
          <p className="text-xs text-[var(--color-stone)] mb-3">
            {application.job.company}
            {application.job.location && ` · ${application.job.location}`}
          </p>

          {/* Board + date */}
          <div className="flex items-center justify-between">
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${
                boardColors[application.job.sourceBoard] ?? boardColors.other
              }`}
            >
              {application.job.sourceBoard}
            </span>
            <span className="flex items-center gap-1 text-xs text-[var(--color-stone)]">
              <Calendar size={10} />
              {daysAgo(application.appliedAt ?? application.updatedAt)}
            </span>
          </div>

          {/* Download links */}
          {(adaptedCV || coverLetter?.filePath) && (
            <div className="flex gap-2 mt-3 pt-3 border-t border-[var(--color-border)]">
              {adaptedCV && (
                <a
                  href={`/api/download/${filename(adaptedCV.filePath)}`}
                  download
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1 text-xs text-[var(--color-brand-navy)] hover:underline"
                >
                  <Download size={11} /> CV
                </a>
              )}
              {coverLetter?.filePath && (
                <a
                  href={`/api/download/${filename(coverLetter.filePath)}`}
                  download
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1 text-xs text-[var(--color-brand-navy)] hover:underline"
                >
                  <FileText size={11} /> Letter
                </a>
              )}
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
}
