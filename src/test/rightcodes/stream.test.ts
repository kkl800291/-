import { describe, expect, it } from 'vitest'
import { extractImageUrlsFromText } from '@/lib/rightcodes/stream'

describe('extractImageUrlsFromText', () => {
  it('finds image urls in streamed text', () => {
    const urls = extractImageUrlsFromText('done https://cdn.example.com/result.png and https://cdn.example.com/next.webp')
    expect(urls).toEqual(['https://cdn.example.com/result.png', 'https://cdn.example.com/next.webp'])
  })

  it('returns an empty list when no image appears', () => {
    expect(extractImageUrlsFromText('working...')).toEqual([])
  })
})
