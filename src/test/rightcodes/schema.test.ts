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

  it('rejects 2K and 4K requests for the discounted gpt-image-2 model', () => {
    const result = imageGenerationRequestSchema.safeParse({
      model: 'gpt-image-2',
      prompt: 'A quiet mountain cabin',
      resolution: '4K',
      aspectRatio: '1:1',
      quality: 'standard',
      count: 1
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('GPT Image 2 does not support 4K.')
    }
  })

  it('returns model capabilities', () => {
    expect(getModelCapability('nano-banana-pro')?.resolutions).toEqual(['1K', '2K', '4K'])
  })

  it('rejects unknown model with custom message', () => {
    const result = imageGenerationRequestSchema.safeParse({
      model: 'unknown-model',
      prompt: 'A quiet mountain cabin',
      resolution: '1K',
      aspectRatio: '1:1',
      quality: 'standard',
      count: 1
    })

    expect(result.success).toBe(false)
    if (result.success) {
      return
    }

    expect(result.error.issues[0]?.path).toEqual(['model'])
    expect(result.error.issues[0]?.message).toMatch(/Unknown Right Codes model/)
  })

  it('applies defaults for optional fields', () => {
    const result = imageGenerationRequestSchema.parse({
      model: 'gpt-image-2-vip',
      prompt: 'A cinematic product photo of a handmade lamp',
      resolution: '2K',
      aspectRatio: '16:9',
      quality: 'high'
    })

    expect(result.negativePrompt).toBe('')
    expect(result.styleHint).toBe('')
    expect(result.count).toBe(1)
  })
})
