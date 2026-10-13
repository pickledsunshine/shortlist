import { type InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", id, ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-[var(--color-ink)]">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        className={`w-full px-3 py-2 text-sm bg-[var(--color-surface)] border rounded-[var(--radius-btn)] outline-none transition-colors placeholder:text-[var(--color-stone)] focus:border-[var(--color-brand-navy)] focus:ring-2 focus:ring-[var(--color-brand-navy)]/10 ${
          error ? "border-[var(--color-brand-rose)]" : "border-[var(--color-border)]"
        } ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-[var(--color-brand-rose)]">{error}</p>}
    </div>
  )
);
Input.displayName = "Input";
