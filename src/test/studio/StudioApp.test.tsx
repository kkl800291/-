import React from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { StudioApp } from '@/components/studio/StudioApp'
import { STORAGE_KEY, type StoredImage } from '@/lib/history'

globalThis.React = React

vi.mock('@/lib/historyImages', () => ({
  cacheHistoryImage: vi.fn().mockResolvedValue(undefined),
  createHistoryImageObjectUrl: vi.fn().mockResolvedValue(undefined),
  deleteHistoryImageBlob: vi.fn().mockResolvedValue(undefined)
}))

vi.mock('@/components/studio/CanvasPreview', () => ({
  CanvasPreview: () => <div data-testid="canvas-preview" />
}))

vi.mock('@/components/studio/ControlPanel', () => ({
  ControlPanel: () => <div data-testid="control-panel" />
}))

vi.mock('@/components/studio/HistoryRail', () => ({
  HistoryRail: ({
    items,
    onDelete,
    onSelect
  }: {
    items: StoredImage[]
    onSelect: (item: StoredImage) => void
    onDelete: (item: StoredImage) => void
  }) => (
    <div data-testid="history-rail">
      {items.map((item) => (
        <div key={item.id}>
          <button type="button" onClick={() => onSelect(item)}>
            选择历史图片
          </button>
          <button type="button" onClick={() => onDelete(item)}>
            删除历史图片
          </button>
        </div>
      ))}
    </div>
  )
}))

vi.mock('@/components/studio/PromptComposer', () => ({
  PromptComposer: ({ prompt }: { prompt: string }) => (
    <label>
      提示词
      <textarea readOnly value={prompt} />
    </label>
  )
}))

beforeEach(() => {
  const storage = new Map<string, string>()
  Object.defineProperty(window, 'localStorage', {
    configurable: true,
    value: {
      clear: () => storage.clear(),
      getItem: (key: string) => storage.get(key) ?? null,
      removeItem: (key: string) => storage.delete(key),
      setItem: (key: string, value: string) => storage.set(key, value)
    }
  })
})

afterEach(() => {
  window.localStorage.clear()
})

describe('StudioApp history persistence', () => {
  it('renders the redesigned studio landmarks', () => {
    render(<StudioApp />)

    expect(screen.getByRole('main', { name: '上帝的画室创作台' })).toBeTruthy()
    expect(screen.getByRole('complementary', { name: '创作参数' })).toBeTruthy()
    expect(screen.getByRole('region', { name: '生成画布' })).toBeTruthy()
    expect(screen.getByRole('complementary', { name: '生成历史' })).toBeTruthy()
  })

  it('preserves existing persisted history on initial mount', async () => {
    const existingHistory: StoredImage[] = [
      {
        id: 'existing-image',
        imageUrl: 'https://cdn.example.com/existing.png',
        prompt: 'Existing prompt',
        createdAt: '2026-05-17T09:00:00.000Z'
      }
    ]
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(existingHistory))

    render(<StudioApp />)

    await waitFor(() => {
      expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '[]')).toEqual(existingHistory)
    })
  })

  it('loads a selected history prompt into the prompt composer', async () => {
    const existingHistory: StoredImage[] = [
      {
        id: 'existing-image',
        imageUrl: 'https://cdn.example.com/existing.png',
        prompt: 'Existing prompt copied into the composer',
        createdAt: '2026-05-17T09:00:00.000Z'
      }
    ]
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(existingHistory))

    render(<StudioApp />)

    fireEvent.click(await screen.findByRole('button', { name: '选择历史图片' }))

    expect((screen.getByLabelText('提示词') as HTMLTextAreaElement).value).toBe('Existing prompt copied into the composer')
  })

  it('removes a deleted history image from persisted history', async () => {
    const existingHistory: StoredImage[] = [
      {
        id: 'existing-image',
        imageUrl: 'https://cdn.example.com/existing.png',
        prompt: 'Existing prompt',
        createdAt: '2026-05-17T09:00:00.000Z',
        cachedImageKey: 'existing-image'
      }
    ]
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(existingHistory))

    render(<StudioApp />)

    fireEvent.click(await screen.findByRole('button', { name: '删除历史图片' }))

    await waitFor(() => {
      expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '[]')).toEqual([])
    })
  })
})
