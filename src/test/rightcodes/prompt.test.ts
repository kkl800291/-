import { describe, expect, it } from 'vitest'
import { buildImagePrompt } from '@/lib/rightcodes/prompt'

describe('buildImagePrompt', () => {
  it('maps all fields into a canonical deterministic prompt', () => {
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

    expect(prompt).toBe(
      [
        'A ceramic tea set on a linen table',
        'Output requirements: resolution 4K, aspect ratio 16:9, quality ultra.',
        'Generate 1 image.',
        'Style direction: soft daylight, editorial still life.',
        'Avoid: blurry, warped text.'
      ].join('\n')
    )
  })

  it('includes seed when seed is 0', () => {
    const prompt = buildImagePrompt({
      model: 'gpt-image-2-vip',
      prompt: 'A test scene',
      negativePrompt: '',
      resolution: '1K',
      aspectRatio: '1:1',
      quality: 'high',
      count: 1,
      styleHint: '',
      seed: 0
    })

    expect(prompt).toContain('Use seed 0 if the model supports deterministic generation.')
  })

  it('omits seed when seed is undefined', () => {
    const prompt = buildImagePrompt({
      model: 'gpt-image-2-vip',
      prompt: 'A test scene',
      negativePrompt: '',
      resolution: '1K',
      aspectRatio: '1:1',
      quality: 'high',
      count: 1,
      styleHint: ''
    })

    expect(prompt).not.toContain('Use seed')
  })

  it('omits empty styleHint and negativePrompt', () => {
    const prompt = buildImagePrompt({
      model: 'gpt-image-2-vip',
      prompt: 'A test scene',
      negativePrompt: '',
      resolution: '1K',
      aspectRatio: '1:1',
      quality: 'high',
      count: 1,
      styleHint: ''
    })

    expect(prompt).toBe(
      [
        'A test scene',
        'Output requirements: resolution 1K, aspect ratio 1:1, quality high.',
        'Generate 1 image.'
      ].join('\n')
    )
  })

  it('pluralizes count when count is greater than 1', () => {
    const prompt = buildImagePrompt({
      model: 'gpt-image-2-vip',
      prompt: 'A test scene',
      negativePrompt: '',
      resolution: '1K',
      aspectRatio: '1:1',
      quality: 'high',
      count: 3,
      styleHint: ''
    })

    expect(prompt).toContain('Generate 3 images.')
  })

  it('avoids double punctuation in optional free text lines', () => {
    const prompt = buildImagePrompt({
      model: 'gpt-image-2-vip',
      prompt: 'A test scene',
      negativePrompt: 'warped text!',
      resolution: '1K',
      aspectRatio: '1:1',
      quality: 'high',
      count: 1,
      styleHint: 'soft daylight.'
    })

    expect(prompt).toContain('Style direction: soft daylight.')
    expect(prompt).toContain('Avoid: warped text!')
    expect(prompt).not.toContain('soft daylight..')
    expect(prompt).not.toContain('warped text!.')
  })
})
