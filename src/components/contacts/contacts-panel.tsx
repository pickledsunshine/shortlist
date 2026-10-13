"use client";

import { useState } from "react";
import { Users, Search, Plus, Copy, Check, ExternalLink, Trash2, Sparkles, X } from "lucide-react";
import { trpc } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type RoleFilter = "any" | "recruiter" | "manager";

// ─── Outreach message bubble ──────────────────────────────────────────────────

function OutreachBubble({
  contactId,
  jobId,
  existingMessage,
}: {
  contactId: string;
  jobId: string;
  existingMessage?: string;
}) {
  const [message, setMessage] = useState(existingMessage ?? "");
  const [copied, setCopied] = useState(false);
  const [senderName, setSenderName] = useState("");
  const [senderRole, setSenderRole] = useState("");
  const [showForm, setShowForm] = useState(!existingMessage);

  const draft = trpc.contacts.draftOutreach.useMutation({
    onSuccess: (data) => {
      setMessage(data.message);
      setShowForm(false);
    },
  });

  function copy() {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (showForm) {
    return (
      <div className="mt-3 p-3 bg-[var(--color-indigo-tint)] rounded-lg space-y-2">
        <p className="text-xs font-medium text-[var(--color-brand-indigo)]">
          ✦ Draft outreach message
        </p>
        <Input
          placeholder="Your name"
          value={senderName}
          onChange={(e) => setSenderName(e.target.value)}
        />
        <Input
          placeholder='Your role, e.g. "senior PM with 5 years in SaaS"'
          value={senderRole}
          onChange={(e) => setSenderRole(e.target.value)}
        />
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => draft.mutate({ contactId, jobId, senderName, senderRole })}
            loading={draft.isPending}
            disabled={!senderName || !senderRole}
          >
            <Sparkles size={12} /> Generate
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setShowForm(false)}>
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-3 p-3 bg-[var(--color-background)] rounded-lg border border-[var(--color-border)] space-y-2">
      <p className="text-xs leading-relaxed text-[var(--color-ink)] whitespace-pre-wrap">
        {message}
      </p>
      <div className="flex gap-2">
        <button
          onClick={copy}
          className="flex items-center gap-1 text-xs text-[var(--color-brand-navy)] hover:underline"
        >
          {copied ? <Check size={11} className="text-[var(--color-brand-emerald)]" /> : <Copy size={11} />}
          {copied ? "Copied!" : "Copy"}
        </button>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1 text-xs text-[var(--color-stone)] hover:text-[var(--color-ink)]"
        >
          <Sparkles size={11} /> Regenerate
        </button>
      </div>
    </div>
  );
}

// ─── Single contact row ───────────────────────────────────────────────────────

function ContactRow({
  contact,
  jobId,
  onDelete,
}: {
  contact: {
    id: string;
    name: string;
    title: string | null;
    linkedinUrl: string;
    degree: number | null;
    mutualConnection: string | null;
  };
  jobId: string;
  onDelete: () => void;
}) {
  const [showOutreach, setShowOutreach] = useState(false);

  return (
    <div className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-card)]">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="w-9 h-9 rounded-full bg-[var(--color-sky-tint)] flex items-center justify-center text-sm font-bold text-[var(--color-brand-navy)] shrink-0">
          {contact.name[0].toUpperCase()}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-[var(--color-ink)] truncate">
              {contact.name}
            </p>
            {contact.degree && (
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full font-medium shrink-0 ${
                  contact.degree === 1
                    ? "bg-[#ECFDF5] text-[#059669]"
                    : "bg-[#EEF2FF] text-[#6366F1]"
                }`}
              >
                {contact.degree === 1 ? "1st" : "2nd"}
              </span>
            )}
          </div>
          {contact.title && (
            <p className="text-xs text-[var(--color-stone)] truncate">{contact.title}</p>
          )}
          {contact.degree === 2 && contact.mutualConnection && (
            <p className="text-xs text-[var(--color-brand-emerald)] mt-0.5">
              via {contact.mutualConnection}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <a
            href={contact.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1 text-[var(--color-stone)] hover:text-[var(--color-brand-navy)] transition-colors"
            title="Open LinkedIn profile"
          >
            <ExternalLink size={14} />
          </a>
          <button
            onClick={onDelete}
            className="p-1 text-[var(--color-stone)] hover:text-[var(--color-brand-rose)] transition-colors"
            title="Remove contact"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Outreach toggle */}
      <div className="mt-3">
        {showOutreach ? (
          <OutreachBubble contactId={contact.id} jobId={jobId} />
        ) : (
          <button
            onClick={() => setShowOutreach(true)}
            className="flex items-center gap-1.5 text-xs text-[var(--color-brand-indigo)] hover:underline font-medium"
          >
            <Sparkles size={11} /> Draft outreach message
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Manual add form ──────────────────────────────────────────────────────────

function ManualAddForm({
  jobId,
  onDone,
}: {
  jobId: string;
  onDone: () => void;
}) {
  const utils = trpc.useUtils();
  const [form, setForm] = useState({
    name: "", title: "", linkedinUrl: "",
    degree: "" as "" | "1" | "2",
    mutualConnection: "",
  });

  const add = trpc.contacts.addManual.useMutation({
    onSuccess: () => {
      utils.jobs.byId.invalidate({ id: jobId });
      onDone();
    },
  });

  return (
    <div className="p-4 bg-[var(--color-background)] border border-[var(--color-border)] rounded-[var(--radius-card)] space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-[var(--color-stone)] uppercase tracking-wide">
          Add contact manually
        </p>
        <button onClick={onDone}>
          <X size={14} className="text-[var(--color-stone)]" />
        </button>
      </div>
      <Input
        placeholder="Full name *"
        value={form.name}
        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
      />
      <Input
        placeholder="Job title (optional)"
        value={form.title}
        onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
      />
      <Input
        placeholder="LinkedIn profile URL *"
        value={form.linkedinUrl}
        onChange={(e) => setForm((f) => ({ ...f, linkedinUrl: e.target.value }))}
      />
      <div className="grid grid-cols-2 gap-2">
        <select
          value={form.degree}
          onChange={(e) => setForm((f) => ({ ...f, degree: e.target.value as typeof f.degree }))}
          className="px-3 py-2 text-sm bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-btn)] outline-none focus:border-[var(--color-brand-navy)]"
        >
          <option value="">Degree (opt.)</option>
          <option value="1">1st degree</option>
          <option value="2">2nd degree</option>
        </select>
        <Input
          placeholder="Mutual connection"
          value={form.mutualConnection}
          onChange={(e) => setForm((f) => ({ ...f, mutualConnection: e.target.value }))}
          disabled={form.degree !== "2"}
        />
      </div>
      <Button
        size="sm"
        className="w-full"
        loading={add.isPending}
        disabled={!form.name || !form.linkedinUrl}
        onClick={() =>
          add.mutate({
            jobId,
            name: form.name,
            title: form.title || undefined,
            linkedinUrl: form.linkedinUrl,
            degree: form.degree ? Number(form.degree) : undefined,
            mutualConnection: form.mutualConnection || undefined,
          })
        }
      >
        Add contact
      </Button>
    </div>
  );
}

// ─── Main panel ───────────────────────────────────────────────────────────────

export function ContactsPanel({
  jobId,
  company,
  contacts,
}: {
  jobId: string;
  company: string;
  contacts: {
    id: string;
    name: string;
    title: string | null;
    linkedinUrl: string;
    degree: number | null;
    mutualConnection: string | null;
  }[];
}) {
  const utils = trpc.useUtils();
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("any");
  const [showManual, setShowManual] = useState(false);

  const { data: proxycurlEnabled } = trpc.contacts.isConfigured.useQuery();

  const findContacts = trpc.contacts.findForJob.useMutation({
    onSuccess: () => utils.jobs.byId.invalidate({ id: jobId }),
    onError: (err) => alert(`Contact search failed: ${err.message}`),
  });

  const deleteContact = trpc.contacts.delete.useMutation({
    onSuccess: () => utils.jobs.byId.invalidate({ id: jobId }),
  });

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-card)] p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users size={15} className="text-[var(--color-brand-navy)]" />
          <p className="text-xs font-semibold text-[var(--color-stone)] uppercase tracking-wide">
            Contacts at {company}
          </p>
        </div>
        <button
          onClick={() => setShowManual((v) => !v)}
          className="text-[var(--color-stone)] hover:text-[var(--color-brand-navy)] transition-colors"
          title="Add manually"
        >
          <Plus size={14} />
        </button>
      </div>

      {/* Proxycurl search */}
      {proxycurlEnabled ? (
        <div className="mb-4 space-y-2">
          <div className="flex gap-1">
            {(["any", "recruiter", "manager"] as RoleFilter[]).map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-2.5 py-1 text-xs font-medium rounded-full border capitalize transition-colors ${
                  roleFilter === r
                    ? "bg-[var(--color-brand-navy)] text-white border-transparent"
                    : "bg-[var(--color-surface)] text-[var(--color-stone)] border-[var(--color-border)]"
                }`}
              >
                {r === "any" ? "All roles" : r === "recruiter" ? "Recruiters" : "Managers"}
              </button>
            ))}
          </div>
          <Button
            size="sm"
            className="w-full"
            onClick={() => findContacts.mutate({ jobId, role: roleFilter })}
            loading={findContacts.isPending}
          >
            <Search size={12} />
            Find contacts at {company}
          </Button>
        </div>
      ) : (
        <div className="mb-4 p-3 bg-[var(--color-background)] rounded-lg border border-[var(--color-border)]">
          <p className="text-xs text-[var(--color-stone)] leading-relaxed">
            Add{" "}
            <code className="bg-[var(--color-border)] px-1 rounded text-xs">
              PROXYCURL_API_KEY
            </code>{" "}
            to{" "}
            <code className="bg-[var(--color-border)] px-1 rounded text-xs">.env</code>{" "}
            to auto-find contacts. Or add them manually.
          </p>
        </div>
      )}

      {/* Manual add form */}
      {showManual && (
        <div className="mb-4">
          <ManualAddForm jobId={jobId} onDone={() => setShowManual(false)} />
        </div>
      )}

      {/* Contact list */}
      {contacts.length === 0 ? (
        <p className="text-xs text-[var(--color-stone)] text-center py-4 opacity-70">
          No contacts yet
        </p>
      ) : (
        <div className="space-y-3">
          {contacts.map((c) => (
            <ContactRow
              key={c.id}
              contact={c}
              jobId={jobId}
              onDelete={() => deleteContact.mutate({ id: c.id })}
            />
          ))}
        </div>
      )}
    </div>
  );
}
