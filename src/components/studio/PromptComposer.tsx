'use client'

import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Field } from '@/components/ui/Field'
import { Textarea } from '@/components/ui/Textarea'

type PromptComposerProps = {
  prompt: string
  negativePrompt: string
  loading: boolean
  onPromptChange: (value: string) => void
  onNegativePromptChange: (value: string) => void
  onSubmit: () => void
}

export function PromptComposer({ prompt, negativePrompt, loading, onPromptChange, onNegativePromptChange, onSubmit }: PromptComposerProps) {
  return (
    <section className="grid gap-4">
      <Field label="提示词" htmlFor="studio-prompt">
        <Textarea id="studio-prompt" value={prompt} onChange={(event) => onPromptChange(event.target.value)} placeholder="描述你想生成的画面..." />
      </Field>
      <Field label="排除内容" htmlFor="studio-negative-prompt">
        <input
          id="studio-negative-prompt"
          className="min-h-11 rounded-md border border-line bg-white px-3"
          value={negativePrompt}
          onChange={(event) => onNegativePromptChange(event.target.value)}
          placeholder="例如：低清、变形、错误文字"
        />
      </Field>
      <Button variant="primary" icon={<Sparkles size={18} />} onClick={onSubmit} disabled={loading || prompt.trim().length < 3}>
        {loading ? '生成中' : '生成图片'}
      </Button>
    </section>
  )
}
