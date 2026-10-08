import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";
import { controlClass } from "@/lib/ui";

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-ink">{label}</span>
      {hint ? <span className="mt-1 block text-sm text-muted">{hint}</span> : null}
      <div className="mt-2">{children}</div>
    </label>
  );
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={controlClass} />;
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${controlClass} min-h-28 resize-y`} />;
}

export function Notice({ children }: { children: ReactNode }) {
  return <p className="border-l-2 border-seal bg-seal-soft px-3 py-3 text-sm leading-relaxed text-ink">{children}</p>;
}

export function Choice({
  options,
  value,
  onChange,
  label,
}: {
  options: readonly string[];
  value: string;
  onChange: (next: string) => void;
  label: string;
}) {
  return (
    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={label}>
      {options.map((option) => {
        const on = value === option;
        return (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(option)}
            className={`min-h-11 rounded-md border px-3 text-sm font-medium ${on ? "border-ink bg-ink text-on-ink" : "border-line bg-card text-ink"}`}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}

export function MultiChoice({
  options,
  value,
  onChange,
  label,
}: {
  options: readonly string[];
  value: string[];
  onChange: (next: string[]) => void;
  label: string;
}) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label={label}>
      {options.map((option) => {
        const on = value.includes(option);
        return (
          <button
            key={option}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(on ? value.filter((item) => item !== option) : [...value, option])}
            className={`min-h-11 rounded-md border px-3 text-sm font-medium ${on ? "border-ink bg-ink text-on-ink" : "border-line bg-card text-ink"}`}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}

export function CheckRow({
  checked,
  onChange,
  children,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  children: ReactNode;
}) {
  return (
    <label className="flex items-start gap-3 py-1">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 size-5 accent-seal"
      />
      <span className="text-sm leading-relaxed text-ink">{children}</span>
    </label>
  );
}

export function ErrorLine({ children }: { children: ReactNode }) {
  return (
    <p className="text-sm font-medium text-seal" role="alert">
      {children}
    </p>
  );
}
