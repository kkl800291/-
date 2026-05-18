import { clsx } from 'clsx'

type Option<T extends string> = {
  label: string
  value: T
  disabled?: boolean
}

type SegmentedControlProps<T extends string> = {
  label: string
  value: T
  options: Option<T>[]
  onChange: (value: T) => void
}

export function SegmentedControl<T extends string>({ label, value, options, onChange }: SegmentedControlProps<T>) {
  return (
    <div aria-label={label} role="group" className="grid grid-cols-[repeat(auto-fit,minmax(64px,1fr))] gap-1 rounded-[7px] border border-white/10 bg-black/20 p-1">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          disabled={option.disabled}
          aria-pressed={option.value === value}
          onClick={() => onChange(option.value)}
          className={clsx(
            'rounded-[5px] px-3 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid focus-visible:ring-offset-2 focus-visible:ring-offset-graphite disabled:opacity-30',
            option.value === value ? 'bg-acid text-ink shadow-[0_8px_20px_rgba(215,255,79,0.16)]' : 'text-paper/70 hover:bg-white/10 hover:text-paper'
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
