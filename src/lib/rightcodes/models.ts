export const RESOLUTIONS = ['1K', '2K', '4K'] as const
export const ASPECT_RATIOS = ['1:1', '16:9', '9:16', '4:3', '3:4', '3:2', '2:3'] as const
export const QUALITIES = ['standard', 'high', 'ultra'] as const

export type Resolution = (typeof RESOLUTIONS)[number]
export type AspectRatio = (typeof ASPECT_RATIOS)[number]
export type Quality = (typeof QUALITIES)[number]

export const RIGHTCODES_MODELS = [
  {
    id: 'gpt-image-2-vip',
    name: 'GPT Image 2 VIP',
    description: 'Official direct model with multi-resolution output support.',
    resolutions: ['1K', '2K', '4K'],
    defaultResolution: '2K',
    supportsReferenceImage: true
  },
  {
    id: 'gpt-image-2',
    name: 'GPT Image 2',
    description: 'Special price model with 1K output.',
    resolutions: ['1K'],
    defaultResolution: '1K',
    supportsReferenceImage: true
  },
  {
    id: 'nano-banana',
    name: 'Nano Banana',
    description: 'Gemini 2.5 Flash Image based model.',
    resolutions: ['1K'],
    defaultResolution: '1K',
    supportsReferenceImage: true
  },
  {
    id: 'nano-banana-2',
    name: 'Nano Banana 2',
    description: 'Second-generation Nano Banana model with higher resolution support.',
    resolutions: ['1K', '2K', '4K'],
    defaultResolution: '2K',
    supportsReferenceImage: true
  },
  {
    id: 'nano-banana-pro',
    name: 'Nano Banana Pro',
    description: 'Second-generation pro model with 1K, 2K, and 4K support.',
    resolutions: ['1K', '2K', '4K'],
    defaultResolution: '2K',
    supportsReferenceImage: true
  }
] as const satisfies ReadonlyArray<{
  id: string
  name: string
  description: string
  resolutions: readonly Resolution[]
  defaultResolution: Resolution
  supportsReferenceImage: boolean
}>

export type RightCodesModelId = (typeof RIGHTCODES_MODELS)[number]['id']

export type ModelCapability = {
  id: RightCodesModelId
  name: string
  description: string
  resolutions: readonly Resolution[]
  defaultResolution: Resolution
  supportsReferenceImage: boolean
}

export function getModelCapability(model: string): ModelCapability | undefined {
  const capability = RIGHTCODES_MODELS.find((item) => item.id === model)
  return capability
    ? {
        ...capability,
        resolutions: [...capability.resolutions]
      }
    : undefined
}
