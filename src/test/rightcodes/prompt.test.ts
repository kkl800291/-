import { describe, expect, it } from 'vitest'
import { buildImagePrompt } from '@/lib/rightcodes/prompt'

describe('buildImagePrompt', () => {
  it('includes resolution, ratio, quality, and count', () => {
    const prompt = buildImagePrompt({
      model: 'gpt-image-2-vip',
      prompt: 'A ceramic tea set on a linen table',
      negativePrompt: 'blurry, warped text',
      resolution: '4K',
      aspectRatio: '16:9',
      quality: 'ultra',
      count: 1,
      styleHint: 'soft daylight, editorial still life'
    })

    expect(prompt).toContain('4K')
    expect(prompt).toContain('16:9')
    expect(prompt).toContain('ultra')
    expect(prompt).toContain('Avoid: blurry, warped text')
  })
})
