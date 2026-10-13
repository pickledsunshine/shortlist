import { type SelectHTMLAttributes, forwardRef } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, id, className = "", children, ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-[var(--color-ink)]">
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={id}
        className={`w-full px-3 py-2 text-sm bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-btn)] outline-none transition-colors focus:border-[var(--color-brand-navy)] focus:ring-2 focus:ring-[var(--color-brand-navy)]/10 cursor-pointer ${className}`}
        {...props}
      >
        {children}
      </select>
    </div>
  )
);
Select.displayName = "Select";
