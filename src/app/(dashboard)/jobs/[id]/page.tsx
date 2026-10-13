"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Download, Sparkles, FileText,
  MapPin, Calendar, ExternalLink, TrendingUp,
} from "lucide-react";
import { trpc } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { AiBadge, BoardBadge } from "@/components/ui/badge";
import { ContactsPanel } from "@/components/contacts/contacts-panel";

const STATUSES = [
  { value: "NEW",          label: "New"          },
  { value: "REVIEWED",     label: "Reviewed"     },
  { value: "APPLIED",      label: "Applied"      },
  { value: "INTERVIEWING", label: "Interviewing" },
  { value: "OFFER",        label: "Offer"        },
  { value: "REJECTED",     label: "Rejected"     },
] as const;

export default function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const utils = trpc.useUtils();

  const { data: job, isLoading } = trpc.jobs.byId.useQuery({ id });

  // Grab base CV for AI actions
  const { data: baseCVs } = trpc.ai.listBaseCVs.useQuery();
  const baseCvId = baseCVs?.[0]?.id;

  const updateStatus = trpc.applications.updateStatus.useMutation({
    onSuccess: () => utils.jobs.byId.invalidate({ id }),
  });

  const adaptCV = trpc.ai.adaptCV.useMutation({
    onSuccess: () => {
      utils.jobs.byId.invalidate({ id });
      alert("CV adaptation queued — check back in ~30 seconds.");
    },
  });

  const generateCoverLetter = trpc.ai.generateCoverLetter.useMutation({
    onSuccess: () => {
      utils.jobs.byId.invalidate({ id });
      alert("Cover letter queued — check back in ~30 seconds.");
    },
  });

  const createApplication = trpc.applications.create.useMutation({
    onSuccess: () => utils.jobs.byId.invalidate({ id }),
  });

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-64 bg-[var(--color-border)] rounded" />
        <div className="h-4 w-48 bg-[var(--color-border)] rounded" />
        <div className="h-96 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-card)]" />
      </div>
    );
  }

  if (!job) return <p>Job not found.</p>;

  const application = job.application;
  const adaptedCV = application?.cvVersions.find((v) => !v.isBase);
  const coverLetter = application?.coverLetters[0];

  const handleStatusChange = (status: string) => {
    if (!application) return;
    updateStatus.mutate({
      id: application.id,
      status: status as typeof STATUSES[number]["value"],
    });
  };

  return (
    <div className="max-w-5xl">
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm text-[var(--color-stone)] hover:text-[var(--color-ink)] mb-5 transition-colors"
      >
        <ArrowLeft size={14} /> Back to jobs
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        {/* ── Left: JD ──────────────────────────────────────────── */}
        <div className="space-y-5">
          {/* Header card */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-card)] p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h1
                  className="text-xl font-bold text-[var(--color-brand-navy)] mb-1"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {job.title}
                </h1>
                <p className="text-[var(--color-stone)]">{job.company}</p>
              </div>
              {job.matchScore != null && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-[#ECFDF5] text-[var(--color-brand-emerald)] text-sm font-semibold rounded-full shrink-0">
                  <TrendingUp size={14} />
                  {job.matchScore}% match
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-3 text-sm text-[var(--color-stone)]">
              <BoardBadge board={job.sourceBoard} />
              {job.location && (
                <span className="flex items-center gap-1">
                  <MapPin size={13} /> {job.location}
                </span>
              )}
              {job.salary && <span>{job.salary}</span>}
              {job.postedAt && (
                <span className="flex items-center gap-1">
                  <Calendar size={13} />
                  {new Date(job.postedAt).toLocaleDateString()}
                </span>
              )}
              <a
                href={job.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[var(--color-brand-navy)] hover:underline ml-auto"
              >
                View original <ExternalLink size={12} />
              </a>
            </div>
          </div>

          {/* JD text */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-card)] p-6">
            <h2 className="font-semibold text-[var(--color-ink)] mb-4">Job Description</h2>
            <div className="text-sm text-[var(--color-stone)] leading-relaxed whitespace-pre-wrap">
              {job.description}
            </div>
          </div>
        </div>

        {/* ── Right: Actions ────────────────────────────────────── */}
        <div className="space-y-4">
          {/* Status */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-card)] p-4">
            <p className="text-xs font-semibold text-[var(--color-stone)] uppercase tracking-wide mb-3">
              Status
            </p>
            {application ? (
              <Select
                value={application.status}
                onChange={(e) => handleStatusChange(e.target.value)}
              >
                {STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </Select>
            ) : (
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => createApplication.mutate({ jobId: id })}
                loading={createApplication.isPending}
              >
                Start Application
              </Button>
            )}
          </div>

          {/* CV Adaptation */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-card)] p-4 space-y-3">
            <p className="text-xs font-semibold text-[var(--color-stone)] uppercase tracking-wide">
              Adapted CV
            </p>

            {adaptedCV ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 p-2.5 bg-[var(--color-indigo-tint)] rounded-lg">
                  <AiBadge />
                  <span className="text-xs text-[var(--color-brand-indigo)] font-medium">
                    Ready — {adaptedCV.matchScore}% match
                  </span>
                </div>
                <a
                  href={`/api/download/${encodeURIComponent(adaptedCV.filePath.split(/[\\/]/).pop()!)}`}
                  download
                >
                  <Button variant="secondary" size="sm" className="w-full">
                    <Download size={13} /> Download DOCX
                  </Button>
                </a>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() => baseCvId && adaptCV.mutate({ jobId: id, baseCvVersionId: baseCvId })}
                  loading={adaptCV.isPending}
                  disabled={!baseCvId}
                >
                  <Sparkles size={13} /> Regenerate
                </Button>
              </div>
            ) : (
              <Button
                className="w-full"
                onClick={() => baseCvId && adaptCV.mutate({ jobId: id, baseCvVersionId: baseCvId })}
                loading={adaptCV.isPending}
                disabled={!baseCvId || !application}
                title={!baseCvId ? "Upload your CV in Settings first" : !application ? "Start application first" : ""}
              >
                <Sparkles size={14} /> Adapt my CV
              </Button>
            )}

            {!baseCvId && (
              <p className="text-xs text-[var(--color-stone)] text-center">
                Upload your CV in{" "}
                <a href="/settings" className="text-[var(--color-brand-navy)] underline">
                  Settings
                </a>{" "}
                first
              </p>
            )}
          </div>

          {/* Cover Letter */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-card)] p-4 space-y-3">
            <p className="text-xs font-semibold text-[var(--color-stone)] uppercase tracking-wide">
              Cover Letter
            </p>

            {coverLetter ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 p-2.5 bg-[var(--color-indigo-tint)] rounded-lg">
                  <AiBadge />
                  <span className="text-xs text-[var(--color-brand-indigo)] font-medium">
                    {coverLetter.templateUsed ? "Adapted from template" : "AI generated"}
                  </span>
                </div>
                {coverLetter.filePath && (
                  <a
                    href={`/api/download/${encodeURIComponent(coverLetter.filePath.split(/[\\/]/).pop()!)}`}
                    download
                  >
                    <Button variant="secondary" size="sm" className="w-full">
                      <Download size={13} /> Download DOCX
                    </Button>
                  </a>
                )}
                <div className="text-xs text-[var(--color-stone)] leading-relaxed bg-[var(--color-background)] rounded-lg p-3 max-h-48 overflow-y-auto">
                  {coverLetter.content}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() => baseCvId && generateCoverLetter.mutate({ jobId: id, baseCvVersionId: baseCvId })}
                  loading={generateCoverLetter.isPending}
                  disabled={!baseCvId}
                >
                  <Sparkles size={13} /> Regenerate
                </Button>
              </div>
            ) : (
              <Button
                className="w-full"
                onClick={() =>
                  baseCvId && generateCoverLetter.mutate({ jobId: id, baseCvVersionId: baseCvId })
                }
                loading={generateCoverLetter.isPending}
                disabled={!baseCvId || !application}
              >
                <FileText size={14} /> Generate Cover Letter
              </Button>
            )}
          </div>

          {/* Contacts */}
          <ContactsPanel
            jobId={id}
            company={job.company}
            contacts={job.contacts}
          />
        </div>
      </div>
    </div>
  );
}
