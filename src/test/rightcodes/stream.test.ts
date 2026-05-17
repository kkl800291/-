import { describe, expect, it } from 'vitest'
import { encodeStreamEvent, extractImageUrlsFromText, extractNewImageUrlsFromText } from '@/lib/rightcodes/stream'

describe('extractImageUrlsFromText', () => {
  it('finds image urls in streamed text', () => {
    const urls = extractImageUrlsFromText('done https://cdn.example.com/result.png and https://cdn.example.com/next.webp')
    expect(urls).toEqual(['https://cdn.example.com/result.png', 'https://cdn.example.com/next.webp'])
  })

  it('returns an empty list when no image appears', () => {
    expect(extractImageUrlsFromText('working...')).toEqual([])
  })
})

describe('extractNewImageUrlsFromText', () => {
  it('returns only newly discovered urls and tracks seen urls', () => {
    const seen = new Set<string>()
    expect(extractNewImageUrlsFromText('https://cdn.example.com/a.png', seen)).toEqual(['https://cdn.example.com/a.png'])
    expect(extractNewImageUrlsFromText('again https://cdn.example.com/a.png and https://cdn.example.com/b.webp', seen)).toEqual([
      'https://cdn.example.com/b.webp'
    ])
    expect(extractNewImageUrlsFromText('repeat https://cdn.example.com/a.png https://cdn.example.com/b.webp', seen)).toEqual([])
  })
})

describe('encodeStreamEvent', () => {
  it('formats sse events', () => {
    expect(encodeStreamEvent('status', { message: 'ok' })).toBe('event: status\ndata: {"message":"ok"}\n\n')
  })
})
