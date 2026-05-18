import { z } from 'zod'
import {
  ASPECT_RATIOS,
  QUALITIES,
  RESOLUTIONS,
  getModelCapability,
  type AspectRatio,
  type Quality,
  type Resolution,
  type RightCodesModelId
} from './models'

export { getModelCapability }

export const imageGenerationRequestSchema = z
  .object({
    model: z.string(),
    prompt: z.string().trim().min(3, 'Prompt must be at least 3 characters.').max(4000),
    negativePrompt: z.string().trim().max(1000).optional().default(''),
    resolution: z.enum(RESOLUTIONS),
    aspectRatio: z.enum(ASPECT_RATIOS),
    quality: z.enum(QUALITIES),
    count: z.number().int().min(1).max(4).default(1),
    seed: z.number().int().min(0).max(4294967295).optional(),
    styleHint: z.string().trim().max(240).optional().default('')
  })
  .superRefine((value, context) => {
    const capability = getModelCapability(value.model)
    if (!capability) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Unknown Right Codes model: ${value.model}`,
        path: ['model']
      })
      return
    }

    if (!capability.resolutions.includes(value.resolution)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: `${capability.name} does not support ${value.resolution}.`,
        path: ['resolution']
      })
    }
  })
  .transform((value) => ({
    ...value,
    model: value.model as RightCodesModelId
  }))

export type ImageGenerationRequest = z.infer<typeof imageGenerationRequestSchema>
export type { AspectRatio, Quality, Resolution, RightCodesModelId }
