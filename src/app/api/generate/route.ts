import { NextResponse } from 'next/server'
import { createRightCodesDrawImageUrls } from '@/lib/rightcodes/client'
import { imageGenerationRequestSchema } from '@/lib/rightcodes/schema'
import { encodeStreamEvent } from '@/lib/rightcodes/stream'

export const runtime = 'nodejs'

function createStreamResponse(stream: ReadableStream) {
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive'
    }
  })
}

export async function POST(request: Request) {
  const requestId = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID().slice(0, 8)
    : Math.random().toString(36).slice(2, 10)

  let payload: unknown
  try {
    payload = await request.json()
  } catch {
    console.warn(`[draw][${requestId}] invalid JSON body`)
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 })
  }

  const parsed = imageGenerationRequestSchema.safeParse(payload)

  if (!parsed.success) {
    console.warn(`[draw][${requestId}] request schema validation failed`, JSON.stringify(parsed.error.flatten()))
    return NextResponse.json(
      { error: 'Invalid generation request.', issues: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      console.info(
        `[draw][${requestId}] generation started`,
        JSON.stringify({
          model: parsed.data.model,
          resolution: parsed.data.resolution,
          aspectRatio: parsed.data.aspectRatio,
          quality: parsed.data.quality,
          count: parsed.data.count,
          promptLength: parsed.data.prompt.length
        })
      )
      try {
        controller.enqueue(encoder.encode(encodeStreamEvent('status', { message: 'Generation started.' })))
        controller.enqueue(encoder.encode(encodeStreamEvent('status', { message: '正在等待图片生成结果...' })))

        const urls = await createRightCodesDrawImageUrls(parsed.data, { requestId })

        controller.enqueue(encoder.encode(encodeStreamEvent('images', { urls })))
        controller.enqueue(encoder.encode(encodeStreamEvent('done', { urls })))
        console.info(`[draw][${requestId}] generation succeeded`, JSON.stringify({ imageCount: urls.length }))
      } catch (error) {
        const message = error instanceof Error && error.message.trim() ? error.message : '图片生成失败，请稍后重试。'
        console.error(`[draw][${requestId}] generation failed`, message)
        controller.enqueue(
          encoder.encode(encodeStreamEvent('error', { message }))
        )
      } finally {
        controller.close()
      }
    }
  })

  return createStreamResponse(stream)
}
