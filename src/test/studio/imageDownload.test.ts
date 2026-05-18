import { describe, expect, it } from 'vitest'
import { createImageDownloadHref } from '@/components/studio/imageDownload'

describe('createImageDownloadHref', () => {
  it('routes http image downloads through the same-origin download endpoint', () => {
    const href = createImageDownloadHref('https://cdn.example.com/generated image.png?token=abc', 'custom-name.png')
    const url = new URL(href, 'http://localhost')

    expect(url.pathname).toBe('/api/download-image')
    expect(url.searchParams.get('url')).toBe('https://cdn.example.com/generated image.png?token=abc')
    expect(url.searchParams.get('filename')).toBe('custom-name.png')
  })

  it('keeps data urls downloadable without proxying them through the server', () => {
    const dataUrl = 'data:image/svg+xml,%3Csvg%3E%3C/svg%3E'

    expect(createImageDownloadHref(dataUrl, 'inline.svg')).toBe(dataUrl)
  })
})
