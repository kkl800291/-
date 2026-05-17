'use client'

import { useEffect, useRef, useState } from 'react'
import { readHistory, type StoredImage, writeHistory } from '@/lib/history'
import { RIGHTCODES_MODELS } from '@/lib/rightcodes/models'
import type { ImageGenerationRequest } from '@/lib/rightcodes/schema'
import { CanvasPreview } from './CanvasPreview'
import { ControlPanel } from './ControlPanel'
import { HistoryRail } from './HistoryRail'
import { PromptComposer } from './PromptComposer'
import { drainSseBlocks, parseSseBlock, type StudioStreamEvent } from './sse'

const initialRequest: ImageGenerationRequest = {
  model: RIGHTCODES_MODELS[0].id,
  prompt: '',
  negativePrompt: '',
  resolution: RIGHTCODES_MODELS[0].defaultResolution,
  aspectRatio: '1:1',
  quality: 'high',
  count: 1,
  styleHint: '',
  referenceImageUrl: ''
}

export function StudioApp() {
  const [request, setRequest] = useState<ImageGenerationRequest>(initialRequest)
  const [imageUrl, setImageUrl] = useState('')
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState<StoredImage[]>([])
  const abortControllerRef = useRef<AbortController | null>(null)
  const inFlightRef = useRef(false)
  const requestIdRef = useRef(0)

  useEffect(() => {
    setHistory(readHistory())
  }, [])

  useEffect(() => {
    writeHistory(history)
  }, [history])

  useEffect(() => {
    return () => {
      requestIdRef.current += 1
      abortControllerRef.current?.abort()
      abortControllerRef.current = null
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

    setLoading(true)
    setError('')
    setStatus('连接 Right Codes...')
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
        setImageUrl(firstUrl)
        setHistory((items) =>
          [
            {
              id: crypto.randomUUID(),
              imageUrl: firstUrl,
              prompt: request.prompt,
              createdAt: new Date().toISOString()
            },
            ...items
          ].slice(0, 24)
        )
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
      if (!isAbortError) setError(generationError instanceof Error ? generationError.message : '生成失败')
    } finally {
      if (isCurrentRequest()) {
        setLoading(false)
        setStatus('')
        inFlightRef.current = false
        abortControllerRef.current = null
      }
    }
  }

  return (
    <main className="grid min-h-screen gap-5 px-4 py-5 md:grid-cols-[320px_minmax(0,1fr)_180px] md:px-6">
      <aside className="rounded-lg border border-line bg-panel/90 p-5 shadow-workbench">
        <h1 className="mb-5 text-2xl font-bold">RightCodes Studio</h1>
        <ControlPanel value={request} onChange={setRequest} />
      </aside>

      <section className="grid content-start gap-5">
        <CanvasPreview imageUrl={imageUrl} loading={loading} status={status} error={error} />
        <div className="rounded-lg border border-line bg-panel/90 p-5 shadow-workbench">
          <PromptComposer
            prompt={request.prompt}
            negativePrompt={request.negativePrompt}
            loading={loading}
            onPromptChange={(prompt) => setRequest((current) => ({ ...current, prompt }))}
            onNegativePromptChange={(negativePrompt) => setRequest((current) => ({ ...current, negativePrompt }))}
            onSubmit={generate}
          />
        </div>
      </section>

      <HistoryRail items={history} onSelect={(item) => setImageUrl(item.imageUrl)} />
    </main>
  )
}
