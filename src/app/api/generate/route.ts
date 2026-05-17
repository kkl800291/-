import { NextResponse } from 'next/server'
import { createRightCodesChatStream } from '@/lib/rightcodes/client'
import { imageGenerationRequestSchema } from '@/lib/rightcodes/schema'
import { encodeStreamEvent, extractImageUrlsFromText, extractNewImageUrlsFromText } from '@/lib/rightcodes/stream'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  let payload: unknown
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 })
  }

  const parsed = imageGenerationRequestSchema.safeParse(payload)

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid generation request.', issues: parsed.error.flatten() },
      { status: 400 }
    )
  }

  let upstream: Response
  try {
    upstream = await createRightCodesChatStream(parsed.data)
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to start generation.' }, { status: 500 })
  }

  if (!upstream.ok || !upstream.body) {
    const detail = upstream.statusText || 'Upstream provider returned an error.'
    return NextResponse.json({ error: 'Right Codes request failed.', detail }, { status: upstream.status || 502 })
  }

  const encoder = new TextEncoder()
  const decoder = new TextDecoder()
  let reader: ReadableStreamDefaultReader<Uint8Array> | null = null

  const stream = new ReadableStream({
    async start(controller) {
      let combinedText = ''
      const emittedUrls = new Set<string>()

      controller.enqueue(encoder.encode(encodeStreamEvent('status', { message: 'Generation started.' })))

      reader = upstream.body!.getReader()

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) {
            const finalChunk = decoder.decode()
            if (finalChunk) {
              combinedText += finalChunk
              controller.enqueue(encoder.encode(encodeStreamEvent('chunk', { text: finalChunk })))
              const finalUrls = extractNewImageUrlsFromText(combinedText, emittedUrls)
              if (finalUrls.length > 0) {
                controller.enqueue(encoder.encode(encodeStreamEvent('images', { urls: finalUrls })))
              }
            }
            break
          }

          const chunk = decoder.decode(value, { stream: true })
          combinedText += chunk
          controller.enqueue(encoder.encode(encodeStreamEvent('chunk', { text: chunk })))

          const urls = extractNewImageUrlsFromText(combinedText, emittedUrls)
          if (urls.length > 0) {
            controller.enqueue(encoder.encode(encodeStreamEvent('images', { urls })))
          }
        }

        controller.enqueue(encoder.encode(encodeStreamEvent('done', { urls: extractImageUrlsFromText(combinedText) })))
      } catch (error) {
        controller.enqueue(
          encoder.encode(encodeStreamEvent('error', { message: error instanceof Error ? error.message : 'Stream failed.' }))
        )
      } finally {
        reader?.releaseLock()
        reader = null
        try {
          controller.close()
        } catch {
          // Stream may already be closed during cancellation.
        }
      }
    },
    async cancel(reason) {
      if (!reader) return
      try {
        await reader.cancel(reason)
      } catch {
        // Ignore cancellation errors from upstream stream.
      } finally {
        reader.releaseLock()
        reader = null
      }
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive'
    }
  })
}
