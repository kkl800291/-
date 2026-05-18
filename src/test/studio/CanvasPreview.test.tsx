import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { CanvasPreview } from '@/components/studio/CanvasPreview'

globalThis.React = React

vi.mock('@/components/studio/ImageLightbox', () => ({
  ImageLightbox: ({
    imageUrl,
    onClose,
    open
  }: {
    imageUrl: string
    onClose: () => void
    open: boolean
  }) =>
    open ? (
      <div role="dialog" aria-label="图片预览" data-image-url={imageUrl}>
        <button type="button" aria-label="放大">
          放大
        </button>
        <button type="button" aria-label="关闭预览" onClick={onClose}>
          关闭
        </button>
      </div>
    ) : null
}))

describe('CanvasPreview', () => {
  it('opens and closes the image viewer from the generated image', () => {
    const imageUrl = 'https://cdn.example.com/generated.png'

    render(<CanvasPreview imageUrl={imageUrl} loading={false} status="" />)

    const previewButton = screen.getByRole('button', { name: '查看大图' })
    fireEvent.click(previewButton)

    expect(screen.getByRole('dialog', { name: '图片预览' })).toBeTruthy()
    expect(screen.getByRole('button', { name: '放大' })).toBeTruthy()
    expect(screen.getByRole('dialog', { name: '图片预览' }).getAttribute('data-image-url')).toBe(imageUrl)
    expect(screen.queryByRole('button', { name: '打开原图' })).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: '关闭预览' }))

    expect(screen.queryByRole('dialog', { name: '图片预览' })).toBeNull()
  })

  it('does not render a viewer entry point without an image', () => {
    render(<CanvasPreview loading={false} status="" />)

    expect(screen.queryByRole('button', { name: '查看大图' })).toBeNull()
    expect(screen.queryByRole('dialog', { name: '图片预览' })).toBeNull()
  })

  it('uses a code-only empty canvas state without the lab specimen image', () => {
    render(<CanvasPreview loading={false} status="" />)

    expect(screen.queryByRole('img', { name: '实验标本图' })).toBeNull()
    expect(screen.getByText('生成结果会显示在这里')).toBeTruthy()
  })

  it('shows a code loading animation while generation is running', () => {
    render(<CanvasPreview loading status="连接图片生成服务..." elapsedSeconds={12} />)

    expect(screen.getByRole('status', { name: '生成等待动画' })).toBeTruthy()
    expect(screen.getByText('连接图片生成服务... · 已等待 12s')).toBeTruthy()
    expect(screen.queryByRole('img', { name: '实验标本图' })).toBeNull()
  })
})
