"use client";

import { trpc } from "@/lib/trpc/client";
import { KanbanBoard } from "@/components/applications/kanban-board";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-card)] px-5 py-4">
      <p className="text-2xl font-bold tabular-nums" style={{ color }}>
        {value}
      </p>
      <p className="text-xs text-[var(--color-stone)] mt-0.5">{label}</p>
    </div>
  );
}

export default function ApplicationsPage() {
  const { data: applications = [], isLoading } =
    trpc.applications.listAll.useQuery(undefined, { refetchOnWindowFocus: false });

  const { data: stats = {} } = trpc.applications.stats.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  const total = applications.length;
  const active =
    (stats["REVIEWED"] ?? 0) +
    (stats["APPLIED"] ?? 0) +
    (stats["INTERVIEWING"] ?? 0);
  const interviews = stats["INTERVIEWING"] ?? 0;
  const offers = stats["OFFER"] ?? 0;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1
            className="text-2xl font-bold text-[var(--color-brand-navy)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Applications
          </h1>
          <p className="text-sm text-[var(--color-stone)] mt-1">
            Drag cards between columns to update status
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-7">
        <StatCard label="Total applications" value={total}      color="var(--color-brand-navy)"    />
        <StatCard label="Active pipeline"    value={active}     color="var(--color-brand-emerald)" />
        <StatCard label="Interviewing"       value={interviews} color="#3B82F6"                    />
        <StatCard label="Offers"             value={offers}     color="#059669"                    />
      </div>

      {/* Board */}
      {isLoading ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="shrink-0 w-64 h-72 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-card)] animate-pulse"
            />
          ))}
        </div>
      ) : total === 0 ? (
        <EmptyState
          title="No applications yet"
          description='Find a job you like, open it, and click "Start Application" to begin tracking it here.'
          action={
            <Button
              variant="secondary"
              size="sm"
              onClick={() => (window.location.href = "/jobs")}
            >
              Browse jobs
            </Button>
          }
        />
      ) : (
        <KanbanBoard applications={applications} />
      )}
    </div>
  );
}
