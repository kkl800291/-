'use client'

import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Field } from '@/components/ui/Field'
import { Textarea } from '@/components/ui/Textarea'

type PromptComposerProps = {
  prompt: string
  negativePrompt: string
  loading: boolean
  elapsedSeconds?: number
  onPromptChange: (value: string) => void
  onNegativePromptChange: (value: string) => void
  onSubmit: () => void
}

export function PromptComposer({ prompt, negativePrompt, loading, elapsedSeconds = 0, onPromptChange, onNegativePromptChange, onSubmit }: PromptComposerProps) {
  return (
    <section className="grid gap-4">
      <Field label="提示词" htmlFor="studio-prompt">
        <Textarea
          id="studio-prompt"
          className="min-h-32"
          value={prompt}
          onChange={(event) => onPromptChange(event.target.value)}
          placeholder="例如：超现实玻璃温室里，一束冷白追光照在悬浮的银色花朵上，电影感，高细节"
        />
      </Field>
      <Field label="排除内容" htmlFor="studio-negative-prompt">
        <input
          id="studio-negative-prompt"
          className="min-h-11 rounded-[6px] border border-white/20 bg-[#11151b] px-3 text-sm text-paper outline-none transition placeholder:text-paper/40 focus:border-acid focus-visible:ring-2 focus-visible:ring-acid focus-visible:ring-offset-2 focus-visible:ring-offset-graphite"
          value={negativePrompt}
          onChange={(event) => onNegativePromptChange(event.target.value)}
          placeholder="例如：低清、变形、错误文字"
        />
      </Field>
      <Button variant="primary" icon={<Sparkles size={18} />} onClick={onSubmit} disabled={loading || prompt.trim().length < 3} className="min-h-12 justify-self-stretch">
        {loading ? `生成中 ${elapsedSeconds}s` : '生成图片'}
      </Button>
    </section>
  )
}
