import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/rightcodes/client', () => ({
  createRightCodesDrawImageUrls: vi.fn()
}))

import { POST } from '@/app/api/generate/route'
import { createRightCodesDrawImageUrls } from '@/lib/rightcodes/client'

const mockedCreateRightCodesDrawImageUrls = vi.mocked(createRightCodesDrawImageUrls)

function validRequestBody() {
  return {
    model: 'gpt-image-2',
    prompt: 'A mountain at sunrise',
    negativePrompt: '',
    resolution: '1K',
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
    mockedCreateRightCodesDrawImageUrls.mockReset()
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
    expect(mockedCreateRightCodesDrawImageUrls).not.toHaveBeenCalled()
  })

  it('uses Right Codes draw for generation and emits direct image urls', async () => {
    mockedCreateRightCodesDrawImageUrls.mockResolvedValue(['https://cdn.example.com/generated.png'])

    const request = new Request('http://localhost/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validRequestBody())
    })

    const response = await POST(request)
    const body = await readResponseBody(response)

    expect(response.status).toBe(200)
    expect(body).toContain('event: status\ndata: {"message":"正在等待图片生成结果..."}\n\n')
    expect(body).toContain('event: images\ndata: {"urls":["https://cdn.example.com/generated.png"]}\n\n')
    expect(body).toContain('event: done\ndata: {"urls":["https://cdn.example.com/generated.png"]}\n\n')
    expect(mockedCreateRightCodesDrawImageUrls).toHaveBeenCalledOnce()
  })

  it('emits an error event when Right Codes draw generation fails after streaming starts', async () => {
    mockedCreateRightCodesDrawImageUrls.mockRejectedValue(new Error('Right Codes draw request failed with status 401.'))

    const request = new Request('http://localhost/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validRequestBody())
    })

    const response = await POST(request)
    const body = await readResponseBody(response)

    expect(response.status).toBe(200)
    expect(body).toContain('event: error\ndata: {"message":"Right Codes draw request failed with status 401."}\n\n')
  })
})
