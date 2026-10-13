export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-card)] p-16 text-center flex flex-col items-center gap-4">
      {/* Logo mark */}
      <div className="flex flex-col gap-[4px] items-center opacity-30">
        <span className="block h-[3px] w-4 rounded-full bg-[var(--color-brand-emerald)]" />
        <span className="block h-[3px] w-7 rounded-full bg-[var(--color-brand-navy)]" />
        <span className="block h-[3px] w-7 rounded-full bg-[var(--color-brand-navy)]" />
      </div>
      <div>
        <h3
          className="font-semibold text-[var(--color-brand-navy)] mb-1"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {title}
        </h3>
        <p className="text-sm text-[var(--color-stone)] max-w-xs">{description}</p>
      </div>
      {action}
    </div>
  );
}
