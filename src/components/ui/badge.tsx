import { ApplicationStatus } from "@/generated/prisma/enums";

const statusStyles: Record<ApplicationStatus, string> = {
  NEW:          "bg-[#EEF2FF] text-[#6366F1]",
  REVIEWED:     "bg-[#FFFBEB] text-[#F59E0B]",
  APPLIED:      "bg-[#ECFDF5] text-[#10B981]",
  INTERVIEWING: "bg-[#EFF6FF] text-[#3B82F6]",
  OFFER:        "bg-[#ECFDF5] text-[#059669]",
  REJECTED:     "bg-[#F9FAFB] text-[#9CA3AF]",
};

const statusLabels: Record<ApplicationStatus, string> = {
  NEW:          "New",
  REVIEWED:     "Reviewed",
  APPLIED:      "Applied",
  INTERVIEWING: "Interviewing",
  OFFER:        "Offer",
  REJECTED:     "Rejected",
};

export function StatusBadge({ status }: { status: ApplicationStatus }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusStyles[status]}`}
    >
      {statusLabels[status]}
    </span>
  );
}

export function AiBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-[var(--color-indigo-tint)] text-[var(--color-brand-indigo)]">
      ✦ AI
    </span>
  );
}

export function BoardBadge({ board }: { board: string }) {
  const labels: Record<string, string> = {
    linkedin: "LinkedIn",
    indeed: "Indeed",
    glassdoor: "Glassdoor",
    other: "Other",
  };
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[var(--color-background)] text-[var(--color-stone)] border border-[var(--color-border)]">
      {labels[board] ?? board}
    </span>
  );
}
