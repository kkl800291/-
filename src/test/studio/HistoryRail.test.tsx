import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { HistoryRail } from '@/components/studio/HistoryRail'

globalThis.React = React

describe('HistoryRail', () => {
  it('renders image-only history entries without visible prompts', () => {
    const { container } = render(
      <HistoryRail
        items={[
          {
            id: 'history-image',
            imageUrl: 'https://cdn.example.com/history.png',
            prompt: 'This long prompt should not be visible in the right rail'
          }
        ]}
        onSelect={() => undefined}
        onDelete={() => undefined}
      />
    )

    expect(screen.getByRole('button', { name: '选择历史图片' })).toBeTruthy()
    expect(container.querySelector('img')?.getAttribute('src')).toBe('https://cdn.example.com/history.png')
    expect(screen.queryByText('This long prompt should not be visible in the right rail')).toBeNull()
  })

  it('passes the selected item back when a history image is clicked', () => {
    const onSelect = vi.fn()
    const item = {
      id: 'history-image',
      imageUrl: 'https://cdn.example.com/history.png',
      prompt: 'Prompt restored after selecting the image'
    }

    render(<HistoryRail items={[item]} onSelect={onSelect} onDelete={() => undefined} />)

    fireEvent.click(screen.getByRole('button', { name: '选择历史图片' }))

    expect(onSelect).toHaveBeenCalledWith(item)
  })

  it('deletes a history item without selecting it', () => {
    const onDelete = vi.fn()
    const onSelect = vi.fn()
    const item = {
      id: 'history-image',
      imageUrl: 'https://cdn.example.com/history.png',
      prompt: 'Prompt restored after selecting the image'
    }

    render(<HistoryRail items={[item]} onSelect={onSelect} onDelete={onDelete} />)

    fireEvent.click(screen.getByRole('button', { name: '删除历史图片' }))

    expect(onDelete).toHaveBeenCalledWith(item)
    expect(onSelect).not.toHaveBeenCalled()
  })

  it('removes a history item when its thumbnail cannot load', () => {
    const onDelete = vi.fn()
    const item = {
      id: 'history-image',
      imageUrl: 'https://cdn.example.com/missing.png',
      prompt: 'Broken image prompt'
    }

    const { container } = render(<HistoryRail items={[item]} onSelect={() => undefined} onDelete={onDelete} />)

    fireEvent.error(container.querySelector('img') as HTMLImageElement)

    expect(onDelete).toHaveBeenCalledWith(item)
  })
})
