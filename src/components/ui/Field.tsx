import type { ReactNode } from 'react'

type FieldProps = {
  label: string
  hint?: string
  error?: string
  htmlFor?: string
  hintId?: string
  errorId?: string
  children: ReactNode
}

export function Field({ label, hint, error, htmlFor, hintId, errorId, children }: FieldProps) {
  return (
    <div className="grid gap-2 text-sm">
      {htmlFor ? (
        <label htmlFor={htmlFor} className="font-semibold text-ink">
          {label}
        </label>
      ) : (
        <span className="font-semibold text-ink">{label}</span>
      )}
      {children}
      {error ? (
        <span id={errorId} className="text-xs text-coral">
          {error}
        </span>
      ) : null}
      {hint && !error ? (
        <span id={hintId} className="text-xs text-ink/55">
          {hint}
        </span>
      ) : null}
    </div>
  )
}
