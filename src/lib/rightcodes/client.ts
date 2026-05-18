import 'server-only'
import type { ImageGenerationRequest } from './schema'

export function getRightCodesConfig(options: { requireApiKey?: boolean } = {}) {
  const apiKey = process.env.RIGHTCODES_API_KEY || ''
  const baseUrl = process.env.RIGHTCODES_DRAW_BASE_URL || process.env.RIGHTCODES_BASE_URL || 'https://www.right.codes/draw'

  if (options.requireApiKey !== false && !apiKey) {
    throw new Error('RIGHTCODES_API_KEY is not configured.')
  }

  return {
    apiKey,
    baseUrl: baseUrl.replace(/\/$/, '')
  }
}

type RightCodesErrorResponse = {
  error?: string | {
    message?: string
  }
}

type RightCodesImageGenerationResponse = {
  data?: Array<{
    url?: unknown
    b64_json?: unknown
  }>
}

async function readRightCodesErrorMessage(response: Response) {
  const fallback = `Right Codes draw request failed with status ${response.status}.`

  try {
    const payload = (await response.json()) as RightCodesErrorResponse
    const error = payload.error
    if (typeof error === 'string' && error.trim()) return error.trim()
    if (typeof error === 'object' && error?.message?.trim()) return error.message.trim()
  } catch {
    return fallback
  }

  return fallback
}

const RESOLUTION_LONG_EDGE = {
  '1K': 1024,
  '2K': 2048,
  '4K': 4096
} as const satisfies Record<ImageGenerationRequest['resolution'], number>

const ASPECT_RATIO_VALUES = {
  '1:1': [1, 1],
  '16:9': [16, 9],
  '9:16': [9, 16],
  '4:3': [4, 3],
  '3:4': [3, 4],
  '3:2': [3, 2],
  '2:3': [2, 3]
} as const satisfies Record<ImageGenerationRequest['aspectRatio'], readonly [number, number]>

function getImageSize(request: ImageGenerationRequest) {
  const longEdge = RESOLUTION_LONG_EDGE[request.resolution]
  const [widthRatio, heightRatio] = ASPECT_RATIO_VALUES[request.aspectRatio]

  if (widthRatio >= heightRatio) {
    return `${longEdge}x${Math.round((longEdge * heightRatio) / widthRatio)}`
  }

  return `${Math.round((longEdge * widthRatio) / heightRatio)}x${longEdge}`
}

function readImageUrlsFromGenerationResponse(payload: RightCodesImageGenerationResponse) {
  return (payload.data ?? [])
    .map((item) => item.url)
    .filter((url): url is string => typeof url === 'string' && url.trim().length > 0)
}

type DrawLogContext = {
  requestId?: string
}

export async function createRightCodesDrawImageUrls(request: ImageGenerationRequest, context: DrawLogContext = {}) {
  const { apiKey, baseUrl } = getRightCodesConfig()
  const urls: string[] = []
  const requestId = context.requestId || 'n/a'

  for (let index = 0; index < request.count; index += 1) {
    const startedAt = Date.now()
    const payload = {
      model: request.model,
      prompt: request.prompt,
      image: [],
      size: getImageSize(request),
      response_format: 'url'
    }

    console.info(
      `[draw][${requestId}] upstream request start`,
      JSON.stringify({ seq: index + 1, total: request.count, model: payload.model, size: payload.size, promptLength: payload.prompt.length })
    )

    const response = await fetch(`${baseUrl}/v1/images/generations`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    console.info(
      `[draw][${requestId}] upstream request finish`,
      JSON.stringify({ seq: index + 1, status: response.status, durationMs: Date.now() - startedAt })
    )

    if (!response.ok) {
      throw new Error(await readRightCodesErrorMessage(response))
    }

    const responsePayload = (await response.json()) as RightCodesImageGenerationResponse
    urls.push(...readImageUrlsFromGenerationResponse(responsePayload))
  }

  if (urls.length === 0) {
    throw new Error('Right Codes draw response did not include image URLs.')
  }

  return urls
}
