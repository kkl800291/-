import { afterEach, describe, expect, it, vi } from 'vitest'
import { createRightCodesDrawImageUrls } from '@/lib/rightcodes/client'

const request = {
  model: 'gpt-image-2' as const,
  prompt: 'A mountain at sunrise',
  negativePrompt: '',
  resolution: '1K' as const,
  aspectRatio: '1:1' as const,
  quality: 'high' as const,
  count: 1,
  styleHint: ''
}

describe('createRightCodesDrawImageUrls', () => {
  const originalEnv = process.env

  afterEach(() => {
    process.env = originalEnv
    vi.restoreAllMocks()
  })

  it('requests Right Codes draw image URLs using the documented image generation endpoint', async () => {
    process.env = { ...originalEnv, RIGHTCODES_API_KEY: 'test-key' }
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          data: [{ url: 'https://cdn.example.com/generated.png' }]
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    )

    const urls = await createRightCodesDrawImageUrls(request)

    expect(urls).toEqual(['https://cdn.example.com/generated.png'])
    expect(fetchMock).toHaveBeenCalledWith(
      'https://www.right.codes/draw/v1/images/generations',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          model: 'gpt-image-2',
          prompt: 'A mountain at sunrise',
          image: [],
          size: '1024x1024',
          response_format: 'url'
        })
      })
    )
  })

  it('throws when Right Codes draw rejects the API key', async () => {
    process.env = { ...originalEnv, RIGHTCODES_API_KEY: 'test-key' }
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 }))

    await expect(createRightCodesDrawImageUrls(request)).rejects.toThrow('Unauthorized')
  })

  it('surfaces structured Right Codes draw error messages', async () => {
    process.env = { ...originalEnv, RIGHTCODES_API_KEY: 'test-key' }
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          error: {
            message: 'The current model has a high load, please use another model',
            type: 'upstream_error',
            param: '',
            code: null
          }
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    )

    await expect(createRightCodesDrawImageUrls(request)).rejects.toThrow('The current model has a high load, please use another model')
  })

  it('throws when Right Codes draw omits image URLs', async () => {
    process.env = { ...originalEnv, RIGHTCODES_API_KEY: 'test-key' }
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ data: [{}] }), { status: 200 })
    )

    await expect(createRightCodesDrawImageUrls(request)).rejects.toThrow('Right Codes draw response did not include image URLs.')
  })
})
