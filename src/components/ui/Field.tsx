import type { ReactNode } from 'react'
import { clsx } from 'clsx'

type FieldProps = {
  label: string
  hint?: string
  error?: string
  htmlFor?: string
  hintId?: string
  errorId?: string
  className?: string
  children: ReactNode
}

export function Field({ label, hint, error, htmlFor, hintId, errorId, className, children }: FieldProps) {
  return (
    <div className={clsx('grid gap-2 text-sm', className)}>
      {htmlFor ? (
        <label htmlFor={htmlFor} className="inline-flex w-fit font-semibold text-paper">
          {label}
        </label>
      ) : (
        <span className="font-semibold text-paper">{label}</span>
      )}
      {children}
      {error ? (
        <span id={errorId} className="text-xs text-coral">
          {error}
        </span>
      ) : null}
      {hint && !error ? (
        <span id={hintId} className="text-xs leading-5 text-paper/50">
          {hint}
        </span>
      ) : null}
    </div>
  )
}
