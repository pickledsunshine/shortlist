"use client";

import { useCallback } from "react";
import { DragDropContext, Droppable, type DropResult } from "@hello-pangea/dnd";
import { ApplicationCard } from "./application-card";
import { trpc } from "@/lib/trpc/client";

type Status =
  | "NEW"
  | "REVIEWED"
  | "APPLIED"
  | "INTERVIEWING"
  | "OFFER"
  | "REJECTED";

const COLUMNS: { status: Status; label: string; color: string; bg: string }[] = [
  { status: "NEW",          label: "New",          color: "#6366F1", bg: "#EEF2FF" },
  { status: "REVIEWED",     label: "Reviewed",     color: "#F59E0B", bg: "#FFFBEB" },
  { status: "APPLIED",      label: "Applied",      color: "#10B981", bg: "#ECFDF5" },
  { status: "INTERVIEWING", label: "Interviewing", color: "#3B82F6", bg: "#EFF6FF" },
  { status: "OFFER",        label: "Offer",        color: "#059669", bg: "#D1FAE5" },
  { status: "REJECTED",     label: "Rejected",     color: "#9CA3AF", bg: "#F9FAFB" },
];

import type { Application, Job, CvVersion, CoverLetter } from "@/generated/prisma/client";

type ApplicationWithRelations = Application & {
  job: Job;
  cvVersions: Pick<CvVersion, "filePath">[];
  coverLetters: Pick<CoverLetter, "filePath">[];
};

export function KanbanBoard({
  applications,
}: {
  applications: ApplicationWithRelations[];
}) {
  const utils = trpc.useUtils();
  const updateStatus = trpc.applications.updateStatus.useMutation({
    // Optimistic update — reorder in the cache immediately
    onMutate: async ({ id, status }) => {
      await utils.applications.listAll.cancel();
      const prev = utils.applications.listAll.getData();
      utils.applications.listAll.setData(undefined, (old) =>
        old?.map((a) => (a.id === id ? { ...a, status } : a))
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      utils.applications.listAll.setData(undefined, ctx?.prev);
    },
    onSettled: () => utils.applications.listAll.invalidate(),
  });

  const onDragEnd = useCallback(
    (result: DropResult) => {
      if (!result.destination) return;
      const newStatus = result.destination.droppableId as Status;
      const appId = result.draggableId;
      const app = applications.find((a) => a.id === appId);
      if (!app || app.status === newStatus) return;
      updateStatus.mutate({ id: appId, status: newStatus });
    },
    [applications, updateStatus]
  );

  const byStatus = (status: Status) =>
    applications.filter((a) => a.status === status);

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4 min-h-[60vh]">
        {COLUMNS.map(({ status, label, color, bg }) => {
          const cards = byStatus(status);
          return (
            <div key={status} className="flex flex-col shrink-0 w-64">
              {/* Column header */}
              <div
                className="flex items-center justify-between px-3 py-2.5 rounded-t-[var(--radius-card)] mb-0"
                style={{ backgroundColor: bg }}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <span
                    className="text-xs font-semibold"
                    style={{ color }}
                  >
                    {label}
                  </span>
                </div>
                <span
                  className="text-xs font-bold tabular-nums px-1.5 py-0.5 rounded-full"
                  style={{ backgroundColor: color + "22", color }}
                >
                  {cards.length}
                </span>
              </div>

              {/* Drop zone */}
              <Droppable droppableId={status}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 flex flex-col gap-3 p-2 rounded-b-[var(--radius-card)] min-h-[80px] transition-colors ${
                      snapshot.isDraggingOver
                        ? "bg-[var(--color-sky-tint)]"
                        : "bg-[var(--color-background)]"
                    }`}
                  >
                    {cards.map((app, i) => (
                      <ApplicationCard
                        key={app.id}
                        application={app}
                        index={i}
                      />
                    ))}
                    {provided.placeholder}
                    {cards.length === 0 && !snapshot.isDraggingOver && (
                      <p className="text-xs text-[var(--color-stone)] text-center py-6 opacity-60">
                        Drop here
                      </p>
                    )}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
}
