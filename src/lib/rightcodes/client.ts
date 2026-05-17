import 'server-only'
import { buildImagePrompt } from './prompt'
import type { ImageGenerationRequest } from './schema'

export function getRightCodesConfig() {
  const apiKey = process.env.RIGHTCODES_API_KEY
  const baseUrl = process.env.RIGHTCODES_BASE_URL || 'https://www.right.codes/draw'

  if (!apiKey) {
    throw new Error('RIGHTCODES_API_KEY is not configured.')
  }

  return {
    apiKey,
    baseUrl: baseUrl.replace(/\/$/, '')
  }
}

export async function createRightCodesChatStream(request: ImageGenerationRequest) {
  const { apiKey, baseUrl } = getRightCodesConfig()
  const prompt = buildImagePrompt(request)

  const content: Array<Record<string, unknown>> = [{ type: 'text', text: prompt }]

  if (request.referenceImageUrl) {
    content.push({
      type: 'image_url',
      image_url: {
        url: request.referenceImageUrl
      }
    })
  }

  return fetch(`${baseUrl}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: request.model,
      stream: true,
      messages: [
        {
          role: 'user',
          content
        }
      ]
    })
  })
}
