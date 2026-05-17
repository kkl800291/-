'use client'

import { Download, ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/Button'

type CanvasPreviewProps = {
  imageUrl?: string
  loading: boolean
  status: string
  error?: string
}

export function CanvasPreview({ imageUrl, loading, status, error }: CanvasPreviewProps) {
  return (
    <section className="flex min-h-[520px] items-center justify-center rounded-lg border border-line bg-panel shadow-workbench">
      {imageUrl ? (
        <div className="grid w-full gap-4 p-4">
          <img src={imageUrl} alt="Generated result" className="mx-auto max-h-[68vh] rounded-md object-contain" />
          <Button icon={<Download size={17} />} onClick={() => window.open(imageUrl, '_blank')} className="justify-self-center">
            打开原图
          </Button>
        </div>
      ) : (
        <div className="grid max-w-sm place-items-center gap-3 p-8 text-center text-ink/65">
          <ImageIcon size={42} />
          <p>{error || status || (loading ? '正在等待模型返回图片...' : '生成结果会显示在这里')}</p>
        </div>
      )}
    </section>
  )
}
