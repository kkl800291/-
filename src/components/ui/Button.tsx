import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { clsx } from 'clsx'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon?: ReactNode
  variant?: 'primary' | 'secondary' | 'ghost'
}

export function Button({ icon, variant = 'secondary', className, children, type = 'button', ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={clsx(
        'inline-flex min-h-10 items-center justify-center gap-2 rounded-[6px] border px-4 text-sm font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid focus-visible:ring-offset-2 focus-visible:ring-offset-graphite disabled:cursor-not-allowed disabled:opacity-45',
        variant === 'primary' && 'border-acid bg-acid text-ink shadow-[0_16px_32px_rgba(215,255,79,0.18)] hover:bg-[#c8f344]',
        variant === 'secondary' && 'border-white/20 bg-porcelain/10 text-paper hover:border-cyan/60 hover:bg-cyan/10',
        variant === 'ghost' && 'border-transparent bg-transparent text-paper/80 hover:bg-white/10 hover:text-paper',
        className
      )}
      {...props}
    >
      {icon}
      {children}
    </button>
  )
}
