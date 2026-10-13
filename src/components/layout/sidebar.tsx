"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Briefcase,
  FileText,
  Settings,
  Layers,
} from "lucide-react";

const nav = [
  { href: "/jobs",         label: "Jobs",         icon: Briefcase },
  { href: "/applications", label: "Applications",  icon: FileText  },
  { href: "/settings",     label: "Settings",      icon: Settings  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 shrink-0 bg-[var(--color-surface)] border-r border-[var(--color-border)] flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-[var(--color-border)]">
        <Link href="/jobs" className="flex items-center gap-2.5">
          <div className="flex flex-col gap-[3px]">
            <span className="block h-[2px] w-4 rounded-full bg-[var(--color-brand-emerald)]" />
            <span className="block h-[2px] w-6 rounded-full bg-[var(--color-brand-navy)]" />
            <span className="block h-[2px] w-6 rounded-full bg-[var(--color-brand-navy)]" />
          </div>
          <span
            className="text-[var(--color-brand-navy)] font-bold text-lg tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Shortlist
          </span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-[var(--radius-btn)] text-sm font-medium transition-colors ${
                active
                  ? "bg-[var(--color-sky-tint)] text-[var(--color-brand-navy)]"
                  : "text-[var(--color-stone)] hover:bg-[var(--color-background)] hover:text-[var(--color-ink)]"
              }`}
            >
              <Icon size={16} strokeWidth={1.75} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-[var(--color-border)]">
        <p className="text-xs text-[var(--color-stone)]">Shortlist v0.1</p>
      </div>
    </aside>
  );
}
