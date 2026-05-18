'use client'

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { clsx } from 'clsx'

type SelectOption = {
  value: string
  label: string
}

type SelectProps = {
  id?: string
  ariaLabel: string
  className?: string
  value: string
  options: SelectOption[]
  onChange: (value: string) => void
}

export function Select({ id, ariaLabel, className, value, options, onChange }: SelectProps) {
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const buttonRef = useRef<HTMLButtonElement | null>(null)
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([])

  const selectedIndex = useMemo(() => {
    const index = options.findIndex((option) => option.value === value)
    return index >= 0 ? index : 0
  }, [options, value])

  const selectedOption = options[selectedIndex] ?? options[0]

  useEffect(() => {
    setActiveIndex(selectedIndex)
  }, [selectedIndex])

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  useEffect(() => {
    if (!open) return
    const nextRef = optionRefs.current[activeIndex]
    nextRef?.focus()
  }, [activeIndex, open])

  function selectAt(index: number) {
    const option = options[index]
    if (!option) return
    onChange(option.value)
    setOpen(false)
    buttonRef.current?.focus()
  }

  function moveActiveIndex(direction: 1 | -1) {
    if (options.length === 0) return
    setActiveIndex((current) => {
      const nextIndex = current + direction
      if (nextIndex < 0) return options.length - 1
      if (nextIndex >= options.length) return 0
      return nextIndex
    })
  }

  function handleTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      setOpen(true)
      moveActiveIndex(event.key === 'ArrowDown' ? 1 : -1)
      return
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      setOpen((current) => !current)
    }
  }

  function handleOptionKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      moveActiveIndex(event.key === 'ArrowDown' ? 1 : -1)
      return
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      selectAt(activeIndex)
      return
    }

    if (event.key === 'Escape') {
      event.preventDefault()
      setOpen(false)
      buttonRef.current?.focus()
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={buttonRef}
        id={id}
        type="button"
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-controls={id ? `${id}-listbox` : undefined}
        aria-haspopup="listbox"
        role="combobox"
        className={clsx(
          'flex min-h-11 w-full items-center justify-between rounded-[6px] border border-white/20 bg-[#11151b] px-3 text-left text-sm text-paper outline-none transition hover:border-white/35 focus:border-acid focus-visible:ring-2 focus-visible:ring-acid focus-visible:ring-offset-2 focus-visible:ring-offset-graphite',
          open && 'border-acid shadow-[0_0_0_1px_rgba(215,255,79,0.25)]',
          className
        )}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={handleTriggerKeyDown}
      >
        <span className="truncate">{selectedOption?.label ?? ''}</span>
        <ChevronDown size={16} className={clsx('shrink-0 text-paper/80 transition-transform', open && 'rotate-180 text-acid')} aria-hidden="true" />
      </button>

      {open ? (
        <div
          id={id ? `${id}-listbox` : undefined}
          role="listbox"
          aria-label={ariaLabel}
          className="absolute left-0 top-[calc(100%+8px)] z-50 w-full overflow-hidden rounded-[8px] border border-white/15 bg-[#0f141a]/95 p-1.5 shadow-[0_18px_44px_rgba(0,0,0,0.55)] backdrop-blur"
        >
          {options.map((option, index) => {
            const selected = option.value === value
            const active = index === activeIndex
            return (
              <button
                key={option.value}
                ref={(element) => {
                  optionRefs.current[index] = element
                }}
                type="button"
                role="option"
                aria-selected={selected}
                className={clsx(
                  'flex w-full items-center gap-2 rounded-[6px] px-2.5 py-2 text-left text-base text-paper outline-none transition',
                  selected && 'bg-acid/12 text-acid',
                  active && !selected && 'bg-white/10'
                )}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => selectAt(index)}
                onKeyDown={handleOptionKeyDown}
              >
                <span className="grid w-4 place-items-center">{selected ? <Check size={15} aria-hidden="true" /> : null}</span>
                <span className="truncate">{option.label}</span>
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
