'use client'

import { useEffect, useState } from 'react'
import { Maximize2 } from 'lucide-react'
import { ImageLightbox } from './ImageLightbox'

type CanvasPreviewProps = {
  imageUrl?: string
  loading: boolean
  status: string
  error?: string
  elapsedSeconds?: number
  downloadName?: string
}

export function CanvasPreview({ imageUrl, loading, status, error, elapsedSeconds = 0, downloadName }: CanvasPreviewProps) {
  const [viewerOpen, setViewerOpen] = useState(false)
  const loadingStatus = [status || '正在等待模型返回图片...', elapsedSeconds > 0 ? `已等待 ${elapsedSeconds}s` : ''].filter(Boolean).join(' · ')

  useEffect(() => {
    if (!imageUrl) setViewerOpen(false)
  }, [imageUrl])

  return (
    <section className="relative flex min-h-[520px] items-center justify-center overflow-hidden rounded-[8px] border border-white/10 bg-[#07090c] shadow-glow xl:min-h-0">
      {imageUrl ? (
        <div className="grid h-full w-full p-3 md:p-4">
          <button
            type="button"
            aria-label="查看大图"
            title="查看大图"
            onClick={() => setViewerOpen(true)}
            className="group relative mx-auto grid h-full max-h-[70vh] max-w-full place-items-center overflow-hidden rounded-[7px] border border-transparent bg-black p-0 transition hover:border-acid/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid focus-visible:ring-offset-2 focus-visible:ring-offset-graphite"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- Generated image URLs are arbitrary external provider URLs, so next/image remote allowlisting is not practical here. */}
            <img src={imageUrl} alt="生成图片" className="max-h-[70vh] max-w-full object-contain" />
            <span className="pointer-events-none absolute inset-0 grid place-items-center bg-black/0 text-porcelain opacity-0 transition group-hover:bg-black/28 group-hover:opacity-100 group-focus-visible:bg-black/28 group-focus-visible:opacity-100">
              <span className="grid size-12 place-items-center rounded-full bg-ink/80 shadow-workbench">
                <Maximize2 size={22} aria-hidden="true" />
              </span>
            </span>
          </button>
          <ImageLightbox imageUrl={imageUrl} open={viewerOpen} onClose={() => setViewerOpen(false)} downloadName={downloadName} />
        </div>
      ) : (
        <div className="relative grid min-h-[520px] w-full place-items-center overflow-hidden bg-[radial-gradient(circle_at_50%_42%,rgba(87,215,247,0.16),transparent_34%),linear-gradient(135deg,rgba(215,255,79,0.08),transparent_24%),#07090c]">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(244,240,231,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(244,240,231,0.05)_1px,transparent_1px)] bg-[size:72px_72px]" />
          <div className="absolute inset-x-0 top-1/2 h-px bg-cyan/25" />
          <div className="absolute inset-y-0 left-1/2 w-px bg-acid/20" />
          <div className="absolute h-56 w-56 rounded-full border border-cyan/15" />
          <div className="absolute h-80 w-80 rounded-full border border-acid/10" />

          {loading ? (
            <div role="status" aria-label="生成等待动画" className="relative mx-6 grid max-w-md place-items-center gap-5 rounded-[8px] border border-white/10 bg-graphite/75 p-6 text-center shadow-workbench backdrop-blur-md">
              <div aria-hidden="true" className="relative size-40">
                <div className="absolute inset-0 rounded-full border border-cyan/20" />
                <div className="absolute inset-3 animate-spin rounded-full border border-transparent border-r-acid/60 border-t-acid [animation-duration:1.4s]" />
                <div className="absolute inset-8 animate-[spin_2.6s_linear_infinite_reverse] rounded-full border border-transparent border-b-cyan border-l-cyan/60" />
                <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-acid to-transparent opacity-80" />
                <div className="absolute top-1/2 h-px w-full -translate-y-1/2 bg-gradient-to-r from-transparent via-cyan to-transparent opacity-70" />
                <div className="absolute left-1/2 top-1/2 size-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-acid shadow-[0_0_34px_rgba(215,255,79,0.78)]" />
                <div className="absolute left-6 top-8 size-2 animate-pulse rounded-full bg-cyan" />
                <div className="absolute bottom-10 right-5 size-2 animate-pulse rounded-full bg-vermilion [animation-delay:250ms]" />
                <div className="absolute bottom-5 left-12 h-3 w-8 animate-pulse rounded-full border border-acid/50 [animation-delay:500ms]" />
              </div>
              <div className="grid gap-2">
                <span className="font-mono text-[11px] font-semibold uppercase text-cyan">RENDERING</span>
                <p className="text-sm leading-6 text-paper/80">{loadingStatus}</p>
              </div>
            </div>
          ) : (
            <div className="relative mx-6 grid max-w-md place-items-center gap-4 text-center">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 -z-10 rounded-[14px] bg-[radial-gradient(circle_at_50%_42%,rgba(73,188,224,0.18),transparent_62%)] blur-xl"
              />
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan/35 bg-[#070d14]/70 px-3 py-1.5">
                <span className="inline-block size-1.5 rounded-full bg-cyan shadow-[0_0_10px_rgba(87,215,247,0.9)]" />
                <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-cyan">{error ? 'INTERRUPTED' : 'EMPTY CANVAS'}</span>
              </div>
              <p
                className={
                  error
                    ? 'rounded-[10px] border border-coral/40 bg-[#170f10]/60 px-5 py-3 text-sm leading-6 text-coral shadow-[0_12px_28px_rgba(0,0,0,0.3)]'
                    : 'rounded-[10px] border border-white/10 bg-[#060b12]/58 px-5 py-3 text-sm leading-6 text-paper/80 shadow-[0_12px_28px_rgba(0,0,0,0.3)]'
                }
              >
                {error || '生成结果会显示在这里'}
              </p>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
