import type { TextareaHTMLAttributes } from 'react'
import { clsx } from 'clsx'

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={clsx(
        'min-h-36 resize-none rounded-md border border-line bg-white p-3 text-sm leading-6 text-ink outline-none focus:border-moss focus-visible:ring-2 focus-visible:ring-moss focus-visible:ring-offset-2',
        className
      )}
      {...props}
    />
  )
}
