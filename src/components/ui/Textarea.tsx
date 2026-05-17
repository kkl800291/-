import type { TextareaHTMLAttributes } from 'react'
import { clsx } from 'clsx'

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={clsx(
        'min-h-36 resize-none rounded-md border border-line bg-white p-3 text-sm leading-6 text-ink outline-none focus:border-moss',
        className
      )}
      {...props}
    />
  )
}
