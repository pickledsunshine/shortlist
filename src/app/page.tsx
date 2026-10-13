import Link from "next/link";
import {
  Sparkles,
  Search,
  FileText,
  Users,
  ArrowRight,
  TrendingUp,
  CheckCircle,
  Clock,
} from "lucide-react";

// ─── Nav ─────────────────────────────────────────────────────────────────────

function Nav() {
  return (
    <header className="fixed top-0 inset-x-0 z-50 border-b border-[var(--color-border)] bg-white/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex flex-col gap-[3px]">
            <span className="block h-[2px] w-3 rounded-full bg-[var(--color-brand-emerald)]" />
            <span className="block h-[2px] w-5 rounded-full bg-[var(--color-brand-navy)]" />
            <span className="block h-[2px] w-5 rounded-full bg-[var(--color-brand-navy)]" />
          </div>
          <span
            className="text-[var(--color-brand-navy)] font-bold text-lg tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Shortlist
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <a href="#features" className="text-sm text-[var(--color-stone)] hover:text-[var(--color-ink)] transition-colors">
            Features
          </a>
          <a href="#how-it-works" className="text-sm text-[var(--color-stone)] hover:text-[var(--color-ink)] transition-colors">
            How it works
          </a>
          <Link
            href="/settings"
            className="px-4 py-1.5 bg-[var(--color-brand-navy)] text-white text-sm font-medium rounded-[var(--radius-btn)] hover:opacity-90 transition-opacity"
          >
            Open app
          </Link>
        </nav>
      </div>
    </header>
  );
}

// ─── Mock UI ──────────────────────────────────────────────────────────────────

function MockDashboard() {
  const jobs = [
    { title: "Senior Product Manager", company: "Stripe", score: 94, status: "Interviewing", statusColor: "#3B82F6", board: "LinkedIn" },
    { title: "Head of Product", company: "Notion", score: 89, status: "Applied", statusColor: "#10B981", board: "Indeed" },
    { title: "Product Lead", company: "Linear", score: 82, status: "New", statusColor: "#6366F1", board: "LinkedIn" },
  ];

  return (
    <div className="relative w-full max-w-xl mx-auto select-none pointer-events-none">
      {/* Browser chrome */}
      <div className="rounded-xl border border-[var(--color-border)] shadow-[var(--shadow-modal)] bg-[var(--color-background)] overflow-hidden">
        {/* Browser bar */}
        <div className="bg-white border-b border-[var(--color-border)] px-4 py-2.5 flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
            <div className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
            <div className="w-3 h-3 rounded-full bg-[#28C840]" />
          </div>
          <div className="flex-1 bg-[var(--color-background)] rounded-md px-3 py-1 text-xs text-[var(--color-stone)]">
            shortlist.app/jobs
          </div>
        </div>

        {/* App chrome */}
        <div className="flex h-72">
          {/* Sidebar */}
          <div className="w-40 bg-white border-r border-[var(--color-border)] py-3 flex flex-col">
            <div className="px-4 pb-3 border-b border-[var(--color-border)] mb-2">
              <div className="flex items-center gap-2">
                <div className="flex flex-col gap-[2px]">
                  <div className="h-[2px] w-2.5 rounded-full bg-[var(--color-brand-emerald)]" />
                  <div className="h-[2px] w-4 rounded-full bg-[var(--color-brand-navy)]" />
                  <div className="h-[2px] w-4 rounded-full bg-[var(--color-brand-navy)]" />
                </div>
                <span className="text-xs font-bold text-[var(--color-brand-navy)]" style={{ fontFamily: "var(--font-display)" }}>
                  Shortlist
                </span>
              </div>
            </div>
            {[
              { label: "Jobs", active: true },
              { label: "Applications", active: false },
              { label: "Settings", active: false },
            ].map((item) => (
              <div
                key={item.label}
                className={`mx-2 px-2 py-1.5 rounded-md text-xs font-medium mb-0.5 ${
                  item.active
                    ? "bg-[var(--color-sky-tint)] text-[var(--color-brand-navy)]"
                    : "text-[var(--color-stone)]"
                }`}
              >
                {item.label}
              </div>
            ))}
          </div>

          {/* Main content */}
          <div className="flex-1 p-3 overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[var(--color-brand-navy)]" style={{ fontFamily: "var(--font-display)" }}>
                Jobs
              </span>
              <div className="flex items-center gap-1 px-2 py-0.5 bg-[var(--color-brand-emerald)] rounded-md">
                <div className="w-2 h-2 rounded-full bg-white opacity-80 animate-pulse" />
                <span className="text-[10px] font-medium text-white">Scraping</span>
              </div>
            </div>

            <div className="space-y-1.5">
              {jobs.map((job) => (
                <div
                  key={job.title}
                  className="bg-white border border-[var(--color-border)] rounded-lg p-2.5 flex items-start justify-between gap-2"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[var(--color-ink)] truncate">{job.title}</p>
                    <p className="text-[10px] text-[var(--color-stone)]">{job.company}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--color-background)] text-[var(--color-stone)] border border-[var(--color-border)]">
                        {job.board}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-[10px] font-bold text-[var(--color-brand-emerald)]">
                      {job.score}%
                    </span>
                    <span
                      className="text-[9px] px-1.5 py-0.5 rounded-full font-medium"
                      style={{ backgroundColor: job.statusColor + "22", color: job.statusColor }}
                    >
                      {job.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating AI card */}
      <div className="absolute -bottom-4 -right-4 w-48 bg-white border border-[var(--color-border)] rounded-xl shadow-[var(--shadow-card-hover)] p-3">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-5 h-5 rounded-full bg-[var(--color-indigo-tint)] flex items-center justify-center">
            <Sparkles size={10} className="text-[var(--color-brand-indigo)]" />
          </div>
          <span className="text-xs font-semibold text-[var(--color-brand-indigo)]">AI adapting CV</span>
        </div>
        <div className="space-y-1">
          <div className="h-1.5 bg-[var(--color-brand-emerald)] rounded-full w-full" />
          <p className="text-[10px] text-[var(--color-stone)]">Tailoring for Stripe · 94% match</p>
        </div>
      </div>

      {/* Floating contact card */}
      <div className="absolute -top-4 -left-4 w-44 bg-white border border-[var(--color-border)] rounded-xl shadow-[var(--shadow-card-hover)] p-3">
        <p className="text-[10px] font-semibold text-[var(--color-stone)] uppercase tracking-wide mb-1.5">
          Contact found
        </p>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-[var(--color-sky-tint)] flex items-center justify-center text-[10px] font-bold text-[var(--color-brand-navy)]">
            S
          </div>
          <div>
            <p className="text-xs font-medium text-[var(--color-ink)]">Sarah Chen</p>
            <p className="text-[10px] text-[var(--color-brand-emerald)]">2nd · via Marcus</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="pt-28 pb-20 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--color-indigo-tint)] rounded-full mb-6">
            <Sparkles size={12} className="text-[var(--color-brand-indigo)]" />
            <span className="text-xs font-semibold text-[var(--color-brand-indigo)]">
              AI-powered job applications
            </span>
          </div>

          <h1
            className="text-5xl font-extrabold text-[var(--color-brand-navy)] leading-[1.1] mb-5"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Get on every{" "}
            <span className="relative inline-block">
              shortlist
              <span
                className="absolute bottom-1 left-0 w-full h-[3px] rounded-full bg-[var(--color-brand-emerald)]"
                aria-hidden
              />
            </span>
            .
          </h1>

          <p className="text-lg text-[var(--color-stone)] leading-relaxed mb-8 max-w-md">
            Shortlist automatically finds jobs that match your criteria,
            adapts your CV to each role, and drafts the perfect outreach to the
            right people — so you can focus on the interviews, not the admin.
          </p>

          <div className="flex items-center gap-3 flex-wrap">
            <Link
              href="/settings"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-brand-navy)] text-white font-semibold rounded-[var(--radius-btn)] hover:opacity-90 transition-opacity"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Start for free <ArrowRight size={16} />
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-[var(--color-border)] text-[var(--color-ink)] font-medium rounded-[var(--radius-btn)] hover:bg-[var(--color-sky-tint)] transition-colors text-sm"
            >
              See how it works
            </a>
          </div>

          <div className="flex items-center gap-5 mt-8">
            {[
              "No more generic CVs",
              "Automatic scraping",
              "AI cover letters",
            ].map((text) => (
              <div key={text} className="flex items-center gap-1.5">
                <CheckCircle size={13} className="text-[var(--color-brand-emerald)] shrink-0" />
                <span className="text-xs text-[var(--color-stone)]">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="hidden lg:block">
          <MockDashboard />
        </div>
      </div>
    </section>
  );
}

// ─── Features ─────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: Search,
    title: "Automatic job discovery",
    description:
      "Set your criteria once. Shortlist scrapes LinkedIn, Indeed, and Glassdoor on a schedule and surfaces only the roles that match — no more tab-hopping.",
    color: "var(--color-brand-navy)",
    bg: "var(--color-sky-tint)",
  },
  {
    icon: Sparkles,
    title: "AI CV adaptation",
    description:
      "For every job, Claude rewrites your CV to highlight the right experience and match the exact keywords in the job description. Never generic. Never fabricated.",
    color: "var(--color-brand-indigo)",
    bg: "var(--color-indigo-tint)",
  },
  {
    icon: FileText,
    title: "Tailored cover letters",
    description:
      "Generate a cover letter that references the specific role, mirrors the company's tone, and draws on your real experience. Download as DOCX in one click.",
    color: "var(--color-brand-emerald)",
    bg: "#ECFDF5",
  },
  {
    icon: Users,
    title: "LinkedIn contact finder",
    description:
      "For every company you apply to, Shortlist finds recruiters and hiring managers. Then drafts a personalised outreach message referencing mutual connections.",
    color: "#3B82F6",
    bg: "#EFF6FF",
  },
  {
    icon: TrendingUp,
    title: "Match scoring",
    description:
      "Each job gets an AI match score so you spend time on the roles you're most likely to land. Your adapted CV score shows how well it covers the requirements.",
    color: "#F59E0B",
    bg: "#FFFBEB",
  },
  {
    icon: Clock,
    title: "Application pipeline",
    description:
      "Kanban board to track every application from New to Offer. Drag cards to update status. Download your tailored CV and cover letter directly from the card.",
    color: "#059669",
    bg: "#D1FAE5",
  },
];

function Features() {
  return (
    <section id="features" className="py-20 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2
            className="text-3xl font-bold text-[var(--color-brand-navy)] mb-3"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Everything you need to land the role
          </h2>
          <p className="text-[var(--color-stone)] max-w-lg mx-auto">
            From finding the job to sending the application — Shortlist handles
            the tedious parts so you can focus on being your best in interviews.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map(({ icon: Icon, title, description, color, bg }) => (
            <div
              key={title}
              className="bg-[var(--color-background)] border border-[var(--color-border)] rounded-[var(--radius-card)] p-6 hover:shadow-[var(--shadow-card-hover)] transition-shadow"
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center mb-4"
                style={{ backgroundColor: bg }}
              >
                <Icon size={18} style={{ color }} />
              </div>
              <h3
                className="font-semibold text-[var(--color-ink)] mb-2"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {title}
              </h3>
              <p className="text-sm text-[var(--color-stone)] leading-relaxed">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── How it works ─────────────────────────────────────────────────────────────

const STEPS = [
  {
    n: "01",
    title: "Set your search criteria",
    description:
      "Upload your CV, define keywords, locations, and salary range. Choose which job boards to scrape and set a schedule — every 2, 6, 12, or 24 hours.",
  },
  {
    n: "02",
    title: "Review matching jobs",
    description:
      "New jobs appear in your dashboard, scored by how well they match your profile. Filter by board, status, or search. Hit 'Prepare Application' on any role.",
  },
  {
    n: "03",
    title: "Get your tailored documents",
    description:
      "AI adapts your CV and generates a cover letter for that specific role. Both are ready to download as DOCX in under a minute.",
  },
  {
    n: "04",
    title: "Reach out to the right people",
    description:
      "Shortlist finds recruiters and hiring managers at the company. Draft a personalised LinkedIn message with one click and send it yourself.",
  },
];

function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2
            className="text-3xl font-bold text-[var(--color-brand-navy)] mb-3"
            style={{ fontFamily: "var(--font-display)" }}
          >
            From job board to interview, fast
          </h2>
          <p className="text-[var(--color-stone)] max-w-md mx-auto">
            A typical application used to take an hour. With Shortlist it takes
            five minutes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map(({ n, title, description }, i) => (
            <div key={n} className="relative">
              {/* Connector line */}
              {i < STEPS.length - 1 && (
                <div className="hidden lg:block absolute top-5 left-full w-full h-px bg-[var(--color-border)] z-0" style={{ width: "calc(100% - 2.5rem)", left: "calc(100% - 1.25rem)" }} />
              )}
              <div className="relative z-10">
                <div className="w-10 h-10 rounded-full bg-[var(--color-brand-navy)] text-white text-sm font-bold flex items-center justify-center mb-4" style={{ fontFamily: "var(--font-display)" }}>
                  {n}
                </div>
                <h3
                  className="font-semibold text-[var(--color-ink)] mb-2"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {title}
                </h3>
                <p className="text-sm text-[var(--color-stone)] leading-relaxed">
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CTA Banner ───────────────────────────────────────────────────────────────

function CTABanner() {
  return (
    <section className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-[var(--color-brand-navy)] rounded-2xl px-10 py-14 text-center relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-[var(--color-brand-emerald)] translate-x-1/3 -translate-y-1/3" />
            <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white translate-x-1/3 translate-y-1/3" />
          </div>

          <div className="relative">
            <p className="text-white/60 text-sm font-medium mb-3 uppercase tracking-wide">
              Start today — it&apos;s free
            </p>
            <h2
              className="text-4xl font-extrabold text-white mb-4"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Ready to land your next role?
            </h2>
            <p className="text-white/70 mb-8 max-w-md mx-auto">
              Set up in minutes. Upload your CV, configure a search, and let
              Shortlist handle the rest.
            </p>
            <Link
              href="/settings"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-[var(--color-brand-emerald)] text-white font-semibold rounded-[var(--radius-btn)] hover:opacity-90 transition-opacity"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Open Shortlist <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="border-t border-[var(--color-border)] py-8 px-6">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="flex flex-col gap-[2px]">
            <span className="block h-[2px] w-3 rounded-full bg-[var(--color-brand-emerald)]" />
            <span className="block h-[2px] w-5 rounded-full bg-[var(--color-brand-navy)]" />
            <span className="block h-[2px] w-5 rounded-full bg-[var(--color-brand-navy)]" />
          </div>
          <span
            className="text-[var(--color-brand-navy)] font-bold tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Shortlist
          </span>
          <span className="text-[var(--color-stone)] text-sm ml-2">
            Apply smarter. Land faster.
          </span>
        </div>
        <p className="text-xs text-[var(--color-stone)]">
          © {new Date().getFullYear()} Shortlist · Built with Claude
        </p>
      </div>
    </footer>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <Nav />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <CTABanner />
      </main>
      <Footer />
    </div>
  );
}
