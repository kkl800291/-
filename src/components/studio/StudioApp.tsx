'use client'

import { useEffect, useRef, useState } from 'react'
import { readHistory, type StoredImage, writeHistory } from '@/lib/history'
import { cacheHistoryImage, createHistoryImageObjectUrl, deleteHistoryImageBlob } from '@/lib/historyImages'
import { RIGHTCODES_MODELS } from '@/lib/rightcodes/models'
import type { ImageGenerationRequest } from '@/lib/rightcodes/schema'
import { CanvasPreview } from './CanvasPreview'
import { ControlPanel } from './ControlPanel'
import { HistoryRail } from './HistoryRail'
import { PromptComposer } from './PromptComposer'
import { createImageDownloadHref } from './imageDownload'
import { drainSseBlocks, parseSseBlock, type StudioStreamEvent } from './sse'

const initialRequest: ImageGenerationRequest = {
  model: RIGHTCODES_MODELS[0].id,
  prompt: '',
  negativePrompt: '',
  resolution: RIGHTCODES_MODELS[0].defaultResolution,
  aspectRatio: '1:1',
  quality: 'high',
  count: 1,
  styleHint: ''
}

export function StudioApp() {
  const [request, setRequest] = useState<ImageGenerationRequest>(initialRequest)
  const [imageUrl, setImageUrl] = useState('')
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [history, setHistory] = useState<StoredImage[]>([])
  const [historyLoaded, setHistoryLoaded] = useState(false)
  const abortControllerRef = useRef<AbortController | null>(null)
  const inFlightRef = useRef(false)
  const requestIdRef = useRef(0)
  const generationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const elapsedIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const historyObjectUrlsRef = useRef<string[]>([])

  function replaceHistoryObjectUrls(nextUrls: string[]) {
    for (const objectUrl of historyObjectUrlsRef.current) {
      URL.revokeObjectURL(objectUrl)
    }
    historyObjectUrlsRef.current = nextUrls
  }

  function deleteHistoryItem(item: { id: string; imageUrl: string; localImageUrl?: string; cachedImageKey?: string }) {
    if (item.localImageUrl) {
      URL.revokeObjectURL(item.localImageUrl)
      historyObjectUrlsRef.current = historyObjectUrlsRef.current.filter((objectUrl) => objectUrl !== item.localImageUrl)
    }
    setHistory((items) => items.filter((historyItem) => historyItem.id !== item.id))
    setImageUrl((currentImageUrl) => (currentImageUrl === item.imageUrl || currentImageUrl === item.localImageUrl ? '' : currentImageUrl))
    void deleteHistoryImageBlob(item.cachedImageKey || item.id).catch(() => undefined)
  }

  useEffect(() => {
    let cancelled = false
    const persistedHistory = readHistory()

    setHistory(persistedHistory)
    setHistoryLoaded(true)

    async function hydrateCachedHistoryImages() {
      const nextObjectUrls: string[] = []
      const hydratedHistory = await Promise.all(
        persistedHistory.map(async (item) => {
          const cachedImageKey = item.cachedImageKey || item.id

          let localImageUrl = await createHistoryImageObjectUrl(cachedImageKey).catch(() => undefined)
          if (!localImageUrl) {
            await cacheHistoryImage(cachedImageKey, createImageDownloadHref(item.imageUrl)).catch(() => undefined)
            localImageUrl = await createHistoryImageObjectUrl(cachedImageKey).catch(() => undefined)
          }
          if (!localImageUrl) return item

          nextObjectUrls.push(localImageUrl)
          return { ...item, cachedImageKey, localImageUrl }
        })
      )

      if (cancelled) {
        for (const objectUrl of nextObjectUrls) URL.revokeObjectURL(objectUrl)
        return
      }

      replaceHistoryObjectUrls(nextObjectUrls)
      if (nextObjectUrls.length > 0) {
        setHistory(hydratedHistory)
      }
    }

    void hydrateCachedHistoryImages()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (historyLoaded) {
      writeHistory(history)
    }
  }, [history, historyLoaded])

  useEffect(() => {
    return () => {
      requestIdRef.current += 1
      abortControllerRef.current?.abort()
      abortControllerRef.current = null
      if (generationTimeoutRef.current) {
        clearTimeout(generationTimeoutRef.current)
        generationTimeoutRef.current = null
      }
      if (elapsedIntervalRef.current) {
        clearInterval(elapsedIntervalRef.current)
        elapsedIntervalRef.current = null
      }
      replaceHistoryObjectUrls([])
      inFlightRef.current = false
    }
  }, [])

  async function generate() {
    if (inFlightRef.current) return

    abortControllerRef.current?.abort()
    const abortController = new AbortController()
    const requestId = requestIdRef.current + 1
    requestIdRef.current = requestId
    abortControllerRef.current = abortController
    inFlightRef.current = true
    generationTimeoutRef.current = setTimeout(() => {
      abortController.abort()
    }, 95000)
    elapsedIntervalRef.current = setInterval(() => {
      if (requestIdRef.current === requestId) {
        setElapsedSeconds((seconds) => seconds + 1)
      }
    }, 1000)

    setLoading(true)
    setElapsedSeconds(0)
    setError('')
    setStatus('连接图片生成服务...')
    setImageUrl('')

    function isCurrentRequest() {
      return requestIdRef.current === requestId
    }

    function handleStreamEvent(streamEvent: StudioStreamEvent) {
      if (!isCurrentRequest()) return

      if (streamEvent.malformed) {
        if (streamEvent.event === 'error') throw new Error('生成失败')
        setStatus('收到无法解析的流事件，已跳过')
        return
      }

      const { data, event } = streamEvent
      const firstUrl = data.urls?.[0]

      if (event === 'status' && data.message) setStatus(data.message)
      if (event === 'images' && firstUrl) setImageUrl(firstUrl)
      if (event === 'done' && firstUrl) {
        const id = crypto.randomUUID()
        const cachedImageKey = id

        setImageUrl(firstUrl)
        setHistory((items) =>
          [
            {
              id,
              imageUrl: firstUrl,
              prompt: request.prompt,
              createdAt: new Date().toISOString(),
              cachedImageKey
            },
            ...items
          ].slice(0, 24)
        )
        void cacheHistoryImage(cachedImageKey, createImageDownloadHref(firstUrl)).catch(() => undefined)
      }
      if (event === 'error') throw new Error(data.message || '生成失败')
    }

    function processBuffer(nextBuffer: string, flush = false) {
      const { blocks, remainder } = drainSseBlocks(nextBuffer, flush)
      for (const block of blocks) {
        const streamEvent = parseSseBlock(block)
        if (streamEvent) handleStreamEvent(streamEvent)
      }
      return remainder
    }

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
        signal: abortController.signal
      })

      if (!isCurrentRequest()) return

      if (!response.ok || !response.body) {
        const detail = await response.json().catch(() => ({}))
        throw new Error((detail as { error?: string }).error || '生成请求失败')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          buffer = processBuffer(buffer)
        }

        buffer += decoder.decode()
        processBuffer(buffer, true)
      } finally {
        reader.releaseLock()
      }
    } catch (generationError) {
      if (!isCurrentRequest()) return
      const isAbortError = generationError instanceof Error && generationError.name === 'AbortError'
      if (isAbortError) {
        setError('生成超时了。服务商这次没有及时返回，请稍后重试或换一个更简单的提示词。')
      } else {
        setError(generationError instanceof Error ? generationError.message : '生成失败')
      }
    } finally {
      if (isCurrentRequest()) {
        if (generationTimeoutRef.current) {
          clearTimeout(generationTimeoutRef.current)
          generationTimeoutRef.current = null
        }
        if (elapsedIntervalRef.current) {
          clearInterval(elapsedIntervalRef.current)
          elapsedIntervalRef.current = null
        }
        setLoading(false)
        setStatus('')
        inFlightRef.current = false
        abortControllerRef.current = null
      }
    }
  }

  return (
    <main
      aria-label="上帝的画室创作台"
      className="relative grid min-h-screen gap-4 overflow-hidden px-3 py-3 text-paper md:px-5 md:py-5 xl:grid-cols-[340px_minmax(0,1fr)_220px]"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-16 border-b border-acid/20 bg-[linear-gradient(90deg,rgba(215,255,79,0.22)_0_1px,transparent_1px_18px)] opacity-40" />

      <aside
        aria-label="创作参数"
        className="studio-scrollbar relative order-2 rounded-[8px] border border-white/10 bg-panel/80 p-5 shadow-workbench backdrop-blur-xl xl:order-1 xl:sticky xl:top-5 xl:max-h-[calc(100vh-40px)] xl:overflow-auto"
      >
        <div className="mb-6 border-b border-white/10 pb-5">
          <p className="font-mono text-[11px] font-semibold uppercase text-acid">AI IMAGE ATELIER</p>
          <h1 className="mt-3 font-display text-3xl font-semibold text-porcelain md:text-4xl">上帝的画室</h1>
        </div>
        <ControlPanel value={request} onChange={setRequest} />
      </aside>

      <section aria-label="生成画布" className="relative order-1 grid content-start gap-4 xl:order-2 xl:min-h-[calc(100vh-40px)] xl:grid-rows-[minmax(0,1fr)_auto]">
        <CanvasPreview imageUrl={imageUrl} loading={loading} status={status} error={error} elapsedSeconds={elapsedSeconds} />
        <div className="rounded-[8px] border border-white/10 bg-panel/90 p-4 shadow-workbench backdrop-blur-xl md:p-5">
          <PromptComposer
            prompt={request.prompt}
            negativePrompt={request.negativePrompt}
            loading={loading}
            elapsedSeconds={elapsedSeconds}
            onPromptChange={(prompt) => setRequest((current) => ({ ...current, prompt }))}
            onNegativePromptChange={(negativePrompt) => setRequest((current) => ({ ...current, negativePrompt }))}
            onSubmit={generate}
          />
        </div>
      </section>

      <aside
        aria-label="生成历史"
        className="studio-scrollbar relative order-3 rounded-[8px] border border-white/10 bg-panel/75 p-4 shadow-workbench backdrop-blur-xl xl:max-h-[calc(100vh-40px)] xl:overflow-auto"
      >
        <HistoryRail
          items={history}
          onSelect={(item) => {
            setImageUrl(item.localImageUrl || item.imageUrl)
            setRequest((current) => ({ ...current, prompt: item.prompt }))
          }}
          onDelete={deleteHistoryItem}
        />
      </aside>
    </main>
  )
}
