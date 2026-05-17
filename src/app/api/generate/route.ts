import { NextResponse } from 'next/server'
import { createRightCodesChatStream } from '@/lib/rightcodes/client'
import { imageGenerationRequestSchema } from '@/lib/rightcodes/schema'
import { encodeStreamEvent, extractImageUrlsFromText } from '@/lib/rightcodes/stream'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  const parsed = imageGenerationRequestSchema.safeParse(await request.json())

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
    const detail = await upstream.text().catch(() => '')
    return NextResponse.json({ error: 'Right Codes request failed.', detail }, { status: upstream.status || 502 })
  }

  const encoder = new TextEncoder()
  const decoder = new TextDecoder()

  const stream = new ReadableStream({
    async start(controller) {
      let combinedText = ''

      controller.enqueue(encoder.encode(encodeStreamEvent('status', { message: 'Generation started.' })))

      const reader = upstream.body!.getReader()

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          combinedText += chunk
          controller.enqueue(encoder.encode(encodeStreamEvent('chunk', { text: chunk })))

          const urls = extractImageUrlsFromText(combinedText)
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
        controller.close()
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
