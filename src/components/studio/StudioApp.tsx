'use client'

import { useEffect, useState } from 'react'
import { RIGHTCODES_MODELS } from '@/lib/rightcodes/models'
import type { ImageGenerationRequest } from '@/lib/rightcodes/schema'
import { CanvasPreview } from './CanvasPreview'
import { ControlPanel } from './ControlPanel'
import { HistoryRail } from './HistoryRail'
import { PromptComposer } from './PromptComposer'

type HistoryItem = {
  id: string
  imageUrl: string
  prompt: string
}

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

function parseHistory(stored: string): HistoryItem[] {
  try {
    const parsed = JSON.parse(stored)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (item): item is HistoryItem =>
        Boolean(item) &&
        typeof item === 'object' &&
        typeof (item as { id?: unknown }).id === 'string' &&
        typeof (item as { imageUrl?: unknown }).imageUrl === 'string' &&
        typeof (item as { prompt?: unknown }).prompt === 'string'
    )
  } catch {
    return []
  }
}

export function StudioApp() {
  const [request, setRequest] = useState<ImageGenerationRequest>(initialRequest)
  const [imageUrl, setImageUrl] = useState('')
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState<HistoryItem[]>([])

  useEffect(() => {
    const stored = window.localStorage.getItem('rightcodes-history')
    if (stored) setHistory(parseHistory(stored).slice(0, 24))
  }, [])

  useEffect(() => {
    window.localStorage.setItem('rightcodes-history', JSON.stringify(history.slice(0, 24)))
  }, [history])

  async function generate() {
    setLoading(true)
    setError('')
    setStatus('连接 Right Codes...')
    setImageUrl('')

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      })

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
          const events = buffer.split('\n\n')
          buffer = events.pop() ?? ''

          for (const eventBlock of events) {
            const dataLine = eventBlock.split('\n').find((line) => line.startsWith('data: '))
            const eventLine = eventBlock.split('\n').find((line) => line.startsWith('event: '))
            if (!dataLine || !eventLine) continue

            const event = eventLine.replace('event: ', '')
            const data = JSON.parse(dataLine.replace('data: ', '')) as { message?: string; urls?: string[] }

            if (event === 'status' && data.message) setStatus(data.message)
            if (event === 'images' && data.urls?.[0]) setImageUrl(data.urls[0])
            const firstUrl = data.urls?.[0]
            if (event === 'done' && firstUrl) {
              setImageUrl(firstUrl)
              setHistory((items) => [{ id: crypto.randomUUID(), imageUrl: firstUrl, prompt: request.prompt }, ...items].slice(0, 24))
            }
            if (event === 'error') throw new Error(data.message || '生成失败')
          }
        }
      } finally {
        reader.releaseLock()
      }
    } catch (generationError) {
      setError(generationError instanceof Error ? generationError.message : '生成失败')
    } finally {
      setLoading(false)
      setStatus('')
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
