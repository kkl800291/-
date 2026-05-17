import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { clsx } from 'clsx'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon?: ReactNode
  variant?: 'primary' | 'secondary' | 'ghost'
}

export function Button({ icon, variant = 'secondary', className, children, ...props }: ButtonProps) {
  return (
    <button
      className={clsx(
        'inline-flex min-h-10 items-center justify-center gap-2 rounded-md border px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-55',
        variant === 'primary' && 'border-moss bg-moss text-white hover:bg-[#176548]',
        variant === 'secondary' && 'border-line bg-panel text-ink hover:border-ink/40',
        variant === 'ghost' && 'border-transparent bg-transparent text-ink hover:bg-ink/5',
        className
      )}
      {...props}
    >
      {icon}
      {children}
    </button>
  )
}
