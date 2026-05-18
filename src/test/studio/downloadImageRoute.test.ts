import { afterEach, describe, expect, it, vi } from 'vitest'
import { GET } from '@/app/api/download-image/route'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('GET /api/download-image', () => {
  it('returns a remote image as an attachment', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response('image-bytes', {
          headers: {
            'Content-Type': 'image/png'
          }
        })
      )
    )

    const response = await GET(new Request('http://localhost/api/download-image?url=https%3A%2F%2Fcdn.example.com%2Fgenerated.png&filename=result.png'))

    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toBe('image/png')
    expect(response.headers.get('Content-Disposition')).toBe('attachment; filename="result.png"')
    await expect(response.text()).resolves.toBe('image-bytes')
  })

  it('rejects non-http image urls', async () => {
    const response = await GET(new Request('http://localhost/api/download-image?url=file%3A%2F%2F%2Fetc%2Fpasswd'))

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({ error: 'Only http and https image URLs can be downloaded.' })
  })

  it('returns a bad gateway response when the remote image request fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network unavailable')))

    const response = await GET(new Request('http://localhost/api/download-image?url=https%3A%2F%2Fexpired.example.invalid%2Fmissing.png'))

    expect(response.status).toBe(502)
    await expect(response.json()).resolves.toEqual({ error: 'Unable to download image.' })
  })
})
