import { clsx } from 'clsx'

type Option<T extends string> = {
  label: string
  value: T
  disabled?: boolean
}

type SegmentedControlProps<T extends string> = {
  value: T
  options: Option<T>[]
  onChange: (value: T) => void
}

export function SegmentedControl<T extends string>({ value, options, onChange }: SegmentedControlProps<T>) {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(64px,1fr))] gap-1 rounded-md border border-line bg-white/65 p-1">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          disabled={option.disabled}
          onClick={() => onChange(option.value)}
          className={clsx(
            'rounded px-3 py-2 text-sm font-semibold transition disabled:opacity-35',
            option.value === value ? 'bg-ink text-white' : 'text-ink/70 hover:bg-ink/5'
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
