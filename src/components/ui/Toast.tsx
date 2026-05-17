type ToastProps = {
  message: string
  tone?: 'info' | 'error'
}

export function Toast({ message, tone = 'info' }: ToastProps) {
  return (
    <div className={tone === 'error' ? 'rounded-md bg-coral px-4 py-3 text-sm text-white' : 'rounded-md bg-ink px-4 py-3 text-sm text-white'}>
      {message}
    </div>
  )
}
