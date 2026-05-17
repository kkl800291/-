'use client'

type HistoryItem = {
  id: string
  imageUrl: string
  prompt: string
}

type HistoryRailProps = {
  items: HistoryItem[]
  onSelect: (item: HistoryItem) => void
}

export function HistoryRail({ items, onSelect }: HistoryRailProps) {
  return (
    <aside className="grid content-start gap-3">
      <h2 className="text-sm font-semibold text-ink/70">历史</h2>
      {items.length === 0 ? <p className="text-sm text-ink/50">暂无生成记录</p> : null}
      {items.map((item) => (
        <button key={item.id} type="button" onClick={() => onSelect(item)} className="overflow-hidden rounded-md border border-line bg-panel text-left transition hover:border-moss">
          {/* eslint-disable-next-line @next/next/no-img-element -- History thumbnails reuse generated external URLs that cannot be known at build time for next/image configuration. */}
          <img src={item.imageUrl} alt="" className="aspect-square w-full object-cover" />
          <span className="line-clamp-2 block p-2 text-xs text-ink/65">{item.prompt}</span>
        </button>
      ))}
    </aside>
  )
}
