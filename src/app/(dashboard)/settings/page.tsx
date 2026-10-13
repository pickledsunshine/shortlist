"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle, Plus, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Profile = {
  id: string;
  name: string;
  keywords: string[];
  locations: string[];
  boards: string[];
  remoteOnly: boolean;
};

const PROFILE_KEY = "shortlist-demo-profiles";
const CV_KEY = "shortlist-demo-cv-name";
const BOARDS = ["indeed", "linkedin", "glassdoor"];

function loadProfiles(): Profile[] {
  try {
    return JSON.parse(localStorage.getItem(PROFILE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export default function SettingsPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [ready, setReady] = useState(false);
  const [cvName, setCvName] = useState<string | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [keywords, setKeywords] = useState("");
  const [locations, setLocations] = useState("");
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [boards, setBoards] = useState(["indeed"]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setCvName(localStorage.getItem(CV_KEY));
      setProfiles(loadProfiles());
      setReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  function chooseCv(file?: File) {
    if (!file) return;
    if (!/\.(pdf|docx)$/i.test(file.name)) {
      setMessage("Please choose a PDF or DOCX file.");
      return;
    }
    localStorage.setItem(CV_KEY, file.name);
    setCvName(file.name);
    setMessage("CV added to this demo.");
  }

  function saveProfile() {
    if (!name.trim() || !keywords.trim()) return;
    const profile: Profile = {
      id: crypto.randomUUID(),
      name: name.trim(),
      keywords: keywords.split(",").map((item) => item.trim()).filter(Boolean),
      locations: locations.split(",").map((item) => item.trim()).filter(Boolean),
      boards,
      remoteOnly,
    };
    const next = [profile, ...profiles];
    localStorage.setItem(PROFILE_KEY, JSON.stringify(next));
    setProfiles(next);
    setCreating(false);
    setName(""); setKeywords(""); setLocations(""); setRemoteOnly(false); setBoards(["indeed"]);
    setMessage("Search criteria saved. Open Jobs to see your demo matches.");
  }

  function removeProfile(id: string) {
    const next = profiles.filter((profile) => profile.id !== id);
    localStorage.setItem(PROFILE_KEY, JSON.stringify(next));
    setProfiles(next);
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--color-brand-navy)]" style={{ fontFamily: "var(--font-display)" }}>Set up your search</h1>
        <p className="text-sm text-[var(--color-stone)] mt-1">Demo mode: your details stay in this browser and no account is required.</p>
      </div>

      <div className="space-y-6 max-w-2xl">
        <section className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-card)] p-6">
          <h2 className="font-semibold text-[var(--color-ink)] mb-1">Your CV</h2>
          <p className="text-sm text-[var(--color-stone)] mb-4">Add a PDF or DOCX to complete the demo setup.</p>
          <button type="button" onClick={() => fileRef.current?.click()} className="w-full border-2 border-dashed border-[var(--color-border)] rounded-[var(--radius-card)] p-8 text-center hover:border-[var(--color-brand-navy)] hover:bg-[var(--color-sky-tint)] transition-colors">
            <Upload size={20} className="mx-auto mb-2 text-[var(--color-stone)]" />
            <p className="text-sm font-medium text-[var(--color-ink)]">Click to choose your CV</p>
            <p className="text-xs text-[var(--color-stone)] mt-1">PDF or DOCX</p>
          </button>
          <input ref={fileRef} type="file" accept=".docx,.pdf" className="hidden" onChange={(event) => chooseCv(event.target.files?.[0])} />
          {ready && cvName && <div className="flex items-center gap-3 mt-4 p-3 bg-[#ECFDF5] rounded-lg"><CheckCircle size={16} className="text-[var(--color-brand-emerald)]" /><span className="text-sm font-medium text-[var(--color-ink)]">{cvName}</span></div>}
        </section>

        <section className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-card)] p-6">
          <div className="flex items-center justify-between mb-4"><div><h2 className="font-semibold text-[var(--color-ink)]">Job criteria</h2><p className="text-sm text-[var(--color-stone)] mt-0.5">Tell Shortlist what roles to look for.</p></div><Button size="sm" onClick={() => setCreating(true)} disabled={creating}><Plus size={13} /> New profile</Button></div>
          {creating && <div className="p-4 bg-[var(--color-background)] border border-[var(--color-border)] rounded-[var(--radius-card)] space-y-4 mb-4">
            <Input label="Profile name" placeholder="Senior Product Manager — London" value={name} onChange={(event) => setName(event.target.value)} />
            <Input label="Keywords (comma-separated)" placeholder="product manager, strategy, B2B SaaS" value={keywords} onChange={(event) => setKeywords(event.target.value)} />
            <Input label="Locations (comma-separated)" placeholder="London, Remote" value={locations} onChange={(event) => setLocations(event.target.value)} />
            <label className="flex items-center gap-2 text-sm text-[var(--color-ink)]"><input type="checkbox" checked={remoteOnly} onChange={(event) => setRemoteOnly(event.target.checked)} /> Remote only</label>
            <div><p className="text-sm font-medium text-[var(--color-ink)] mb-2">Job boards</p><div className="flex gap-2">{BOARDS.map((board) => <button key={board} type="button" onClick={() => setBoards((current) => current.includes(board) ? current.filter((item) => item !== board) : [...current, board])} className={`px-3 py-1.5 text-xs font-medium rounded-full border capitalize ${boards.includes(board) ? "bg-[var(--color-brand-navy)] text-white border-[var(--color-brand-navy)]" : "border-[var(--color-border)] text-[var(--color-stone)]"}`}>{board}</button>)}</div></div>
            <div className="flex gap-2"><Button onClick={saveProfile} disabled={!name.trim() || !keywords.trim()}>Save criteria</Button><Button variant="ghost" onClick={() => setCreating(false)}>Cancel</Button></div>
          </div>}
          {ready && profiles.length === 0 && !creating && <p className="text-sm text-[var(--color-stone)] text-center py-6">Create a profile to see demo job matches.</p>}
          <div className="space-y-3">{profiles.map((profile) => <div key={profile.id} className="flex items-center gap-3 p-4 rounded-lg border border-[var(--color-brand-emerald)]/30 bg-[#ECFDF5]"><div className="flex-1"><p className="font-medium text-sm text-[var(--color-ink)]">{profile.name}</p><p className="text-xs text-[var(--color-stone)] mt-0.5">{profile.keywords.join(", ")}{profile.locations.length ? ` · ${profile.locations.join(", ")}` : ""}{profile.remoteOnly ? " · Remote only" : ""}</p></div><button onClick={() => removeProfile(profile.id)} className="text-[var(--color-stone)] hover:text-red-600"><Trash2 size={15} /></button></div>)}</div>
        </section>
        {message && <p className="text-sm text-[var(--color-brand-emerald)]">{message}</p>}
      </div>
    </div>
  );
}
