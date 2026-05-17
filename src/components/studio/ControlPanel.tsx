'use client'

import type { ImageGenerationRequest } from '@/lib/rightcodes/schema'
import { ASPECT_RATIOS, QUALITIES, RESOLUTIONS, RIGHTCODES_MODELS, getModelCapability } from '@/lib/rightcodes/models'
import { Field } from '@/components/ui/Field'
import { Select } from '@/components/ui/Select'
import { SegmentedControl } from '@/components/ui/SegmentedControl'

type ControlPanelProps = {
  value: ImageGenerationRequest
  onChange: (next: ImageGenerationRequest) => void
}

export function ControlPanel({ value, onChange }: ControlPanelProps) {
  const capability = getModelCapability(value.model) ?? RIGHTCODES_MODELS[0]

  function update(patch: Partial<ImageGenerationRequest>) {
    const next = { ...value, ...patch }
    const nextCapability = getModelCapability(next.model)
    if (nextCapability && !nextCapability.resolutions.includes(next.resolution)) {
      next.resolution = nextCapability.defaultResolution
    }
    onChange(next)
  }

  return (
    <section className="grid gap-5">
      <Field label="模型" htmlFor="studio-model">
        <Select id="studio-model" value={value.model} onChange={(event) => update({ model: event.target.value as ImageGenerationRequest['model'] })}>
          {RIGHTCODES_MODELS.map((model) => (
            <option key={model.id} value={model.id}>
              {model.name}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="分辨率" hint={capability.description}>
        <SegmentedControl
          value={value.resolution}
          options={RESOLUTIONS.map((resolution) => ({
            label: resolution,
            value: resolution,
            disabled: !capability.resolutions.includes(resolution)
          }))}
          onChange={(resolution) => update({ resolution })}
        />
      </Field>

      <Field label="比例">
        <SegmentedControl value={value.aspectRatio} options={ASPECT_RATIOS.map((ratio) => ({ label: ratio, value: ratio }))} onChange={(aspectRatio) => update({ aspectRatio })} />
      </Field>

      <Field label="质量">
        <SegmentedControl value={value.quality} options={QUALITIES.map((quality) => ({ label: quality, value: quality }))} onChange={(quality) => update({ quality })} />
      </Field>

      <Field label="数量">
        <input
          className="min-h-11 rounded-md border border-line bg-white px-3"
          type="number"
          min={1}
          max={4}
          value={value.count}
          onChange={(event) => {
            const parsed = Number(event.target.value)
            const count = Number.isNaN(parsed) ? 1 : Math.min(4, Math.max(1, parsed))
            update({ count })
          }}
        />
      </Field>

      <Field label="Seed">
        <input
          className="min-h-11 rounded-md border border-line bg-white px-3"
          type="number"
          min={0}
          value={value.seed ?? ''}
          onChange={(event) => update({ seed: event.target.value ? Number(event.target.value) : undefined })}
        />
      </Field>

      <Field label="风格">
        <input
          className="min-h-11 rounded-md border border-line bg-white px-3"
          value={value.styleHint}
          onChange={(event) => update({ styleHint: event.target.value })}
          placeholder="例如：电影感、产品摄影、日系插画"
        />
      </Field>

      <Field label="参考图 URL">
        <input
          className="min-h-11 rounded-md border border-line bg-white px-3"
          value={value.referenceImageUrl ?? ''}
          onChange={(event) => update({ referenceImageUrl: event.target.value })}
          placeholder="https://..."
        />
      </Field>
    </section>
  )
}
