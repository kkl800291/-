import { describe, expect, it } from 'vitest'
import { getModelCapability, imageGenerationRequestSchema } from '@/lib/rightcodes/schema'

describe('image generation schema', () => {
  it('accepts a 4K request for gpt-image-2-vip', () => {
    const result = imageGenerationRequestSchema.parse({
      model: 'gpt-image-2-vip',
      prompt: 'A cinematic product photo of a handmade lamp',
      resolution: '4K',
      aspectRatio: '16:9',
      quality: 'high',
      count: 1
    })

    expect(result.resolution).toBe('4K')
  })

  it('rejects 4K for gpt-image-2 because that model is 1K only', () => {
    expect(() =>
      imageGenerationRequestSchema.parse({
        model: 'gpt-image-2',
        prompt: 'A quiet mountain cabin',
        resolution: '4K',
        aspectRatio: '1:1',
        quality: 'standard',
        count: 1
      })
    ).toThrow(/does not support 4K/)
  })

  it('returns model capabilities', () => {
    expect(getModelCapability('nano-banana-pro')?.resolutions).toEqual(['1K', '2K', '4K'])
  })
})
