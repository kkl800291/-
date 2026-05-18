import type { TextareaHTMLAttributes } from 'react'
import { clsx } from 'clsx'

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={clsx(
        'min-h-36 resize-none rounded-[6px] border border-white/20 bg-[#11151b] p-4 text-sm leading-6 text-paper outline-none transition placeholder:text-paper/40 focus:border-acid focus-visible:ring-2 focus-visible:ring-acid focus-visible:ring-offset-2 focus-visible:ring-offset-graphite',
        className
      )}
      {...props}
    />
  )
}
