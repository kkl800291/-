import type { SelectHTMLAttributes } from 'react'
import { clsx } from 'clsx'

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={clsx('min-h-11 rounded-md border border-line bg-white px-3 text-sm text-ink outline-none focus:border-moss', className)}
      {...props}
    />
  )
}
