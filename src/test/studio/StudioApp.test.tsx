import React from 'react'
import { render, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { StudioApp } from '@/components/studio/StudioApp'
import { STORAGE_KEY, type StoredImage } from '@/lib/history'

globalThis.React = React

vi.mock('@/components/studio/CanvasPreview', () => ({
  CanvasPreview: () => <div data-testid="canvas-preview" />
}))

vi.mock('@/components/studio/ControlPanel', () => ({
  ControlPanel: () => <div data-testid="control-panel" />
}))

vi.mock('@/components/studio/HistoryRail', () => ({
  HistoryRail: () => <div data-testid="history-rail" />
}))

vi.mock('@/components/studio/PromptComposer', () => ({
  PromptComposer: () => <div data-testid="prompt-composer" />
}))

afterEach(() => {
  window.localStorage.clear()
})

describe('StudioApp history persistence', () => {
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
})
