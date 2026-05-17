import type { ImageGenerationRequest } from './schema'

export function buildImagePrompt(request: ImageGenerationRequest) {
  const lines = [
    request.prompt,
    '',
    `Output requirements: resolution ${request.resolution}, aspect ratio ${request.aspectRatio}, quality ${request.quality}.`,
    `Generate ${request.count} image${request.count === 1 ? '' : 's'}.`
  ]

  if (request.styleHint) {
    lines.push(`Style direction: ${request.styleHint}.`)
  }

  if (typeof request.seed === 'number') {
    lines.push(`Use seed ${request.seed} if the model supports deterministic generation.`)
  }

  if (request.negativePrompt) {
    lines.push(`Avoid: ${request.negativePrompt}.`)
  }

  return lines.filter(Boolean).join('\n')
}
