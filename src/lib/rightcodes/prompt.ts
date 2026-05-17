import type { ImageGenerationRequest } from './schema'

function withTerminalPeriod(text: string) {
  return /[.!?]$/.test(text) ? text : `${text}.`
}

export function buildImagePrompt(request: ImageGenerationRequest) {
  const lines = [
    request.prompt,
    `Output requirements: resolution ${request.resolution}, aspect ratio ${request.aspectRatio}, quality ${request.quality}.`,
    `Generate ${request.count} image${request.count === 1 ? '' : 's'}.`
  ]

  if (request.styleHint) {
    lines.push(`Style direction: ${withTerminalPeriod(request.styleHint)}`)
  }

  if (typeof request.seed === 'number') {
    lines.push(`Use seed ${request.seed} if the model supports deterministic generation.`)
  }

  if (request.negativePrompt) {
    lines.push(`Avoid: ${withTerminalPeriod(request.negativePrompt)}`)
  }

  return lines.join('\n')
}
