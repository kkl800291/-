import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/rightcodes/client', () => ({
  createRightCodesChatStream: vi.fn()
}))

import { POST } from '@/app/api/generate/route'
import { createRightCodesChatStream } from '@/lib/rightcodes/client'

const mockedCreateRightCodesChatStream = vi.mocked(createRightCodesChatStream)

function validRequestBody() {
  return {
    model: 'gpt-image-2-vip',
    prompt: 'A mountain at sunrise',
    negativePrompt: '',
    resolution: '2K',
    aspectRatio: '1:1',
    quality: 'high',
    count: 1,
    styleHint: ''
  }
}

async function readResponseBody(response: Response) {
  const reader = response.body?.getReader()
  if (!reader) return ''

  const decoder = new TextDecoder()
  let text = ''
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    text += decoder.decode(value, { stream: true })
  }
  text += decoder.decode()
  return text
}

describe('POST /api/generate', () => {
  beforeEach(() => {
    mockedCreateRightCodesChatStream.mockReset()
  })

  it('returns 400 for malformed json payloads', async () => {
    const request = new Request('http://localhost/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{"model":'
    })

    const response = await POST(request)
    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({ error: 'Invalid JSON body.' })
    expect(mockedCreateRightCodesChatStream).not.toHaveBeenCalled()
  })

  it('emits image events only for newly discovered urls', async () => {
    const encoder = new TextEncoder()
    const upstreamBody = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(encoder.encode('text https://cdn.example.com/a.png'))
        controller.enqueue(encoder.encode(' duplicate https://cdn.example.com/a.png and new https://cdn.example.com/b.webp'))
        controller.close()
      }
    })

    mockedCreateRightCodesChatStream.mockResolvedValue(
      new Response(upstreamBody, {
        status: 200
      })
    )

    const request = new Request('http://localhost/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validRequestBody())
    })

    const response = await POST(request)
    const body = await readResponseBody(response)

    expect(response.status).toBe(200)
    expect(body).toContain('event: images\ndata: {"urls":["https://cdn.example.com/a.png"]}\n\n')
    expect(body).toContain('event: images\ndata: {"urls":["https://cdn.example.com/b.webp"]}\n\n')
    expect(body).not.toContain('event: images\ndata: {"urls":["https://cdn.example.com/a.png","https://cdn.example.com/b.webp"]}\n\n')
  })
})
