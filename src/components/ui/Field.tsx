import type { ReactNode } from 'react'

type FieldProps = {
  label: string
  hint?: string
  error?: string
  children: ReactNode
}

export function Field({ label, hint, error, children }: FieldProps) {
  return (
    <label className="grid gap-2 text-sm">
      <span className="font-semibold text-ink">{label}</span>
      {children}
      {error ? <span className="text-xs text-coral">{error}</span> : null}
      {hint && !error ? <span className="text-xs text-ink/55">{hint}</span> : null}
    </label>
  )
}
