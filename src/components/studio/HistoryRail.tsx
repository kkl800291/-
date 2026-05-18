'use client'

import { Trash2 } from 'lucide-react'

type HistoryItem = {
  id: string
  imageUrl: string
  localImageUrl?: string
  cachedImageKey?: string
  prompt: string
}

type HistoryRailProps = {
  items: HistoryItem[]
  onSelect: (item: HistoryItem) => void
  onDelete: (item: HistoryItem) => void
}

export function HistoryRail({ items, onDelete, onSelect }: HistoryRailProps) {
  return (
    <div className="grid content-start gap-3">
      <div className="border-b border-white/10 pb-3">
        <h2 className="font-mono text-[11px] font-semibold uppercase text-cyan">Archive</h2>
        <p className="mt-1 text-sm font-semibold text-paper">历史</p>
      </div>
      {items.length === 0 ? <p className="rounded-[6px] border border-dashed border-white/10 p-3 text-sm leading-6 text-paper/50">暂无生成记录</p> : null}
      <div className="grid grid-cols-2 gap-2 xl:grid-cols-1 2xl:grid-cols-2">
        {items.map((item) => (
          <div key={item.id} className="group relative">
            <button
              type="button"
              aria-label="选择历史图片"
              title="选择历史图片"
              onClick={() => onSelect(item)}
              className="block w-full overflow-hidden rounded-[7px] border border-white/10 bg-black/25 p-1 transition hover:border-acid/70 hover:bg-acid/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid focus-visible:ring-offset-2 focus-visible:ring-offset-graphite"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- History thumbnails reuse generated external URLs that cannot be known at build time for next/image configuration. */}
              <img src={item.localImageUrl || item.imageUrl} alt="" onError={() => onDelete(item)} className="aspect-square w-full rounded-[5px] object-cover opacity-90 transition group-hover:scale-[1.02] group-hover:opacity-100" />
            </button>
            <button
              type="button"
              aria-label="删除历史图片"
              title="删除历史图片"
              onClick={(event) => {
                event.stopPropagation()
                onDelete(item)
              }}
              className="absolute right-2 top-2 grid size-7 place-items-center rounded-[6px] border border-white/15 bg-black/70 text-paper/80 opacity-100 shadow-workbench transition hover:border-red-400/70 hover:bg-red-500/20 hover:text-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300 focus-visible:ring-offset-2 focus-visible:ring-offset-graphite md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100"
            >
              <Trash2 size={14} aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
