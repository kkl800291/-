import { describe, expect, it } from 'vitest'
import { drainSseBlocks, parseSseBlock } from '@/components/studio/sse'

describe('drainSseBlocks', () => {
  it('normalizes CRLF separators and keeps incomplete trailing data buffered', () => {
    const result = drainSseBlocks('event: status\r\ndata: {"message":"ready"}\r\n\r\nevent: done\r\ndata:')

    expect(result.blocks).toEqual(['event: status\ndata: {"message":"ready"}'])
    expect(result.remainder).toBe('event: done\ndata:')
  })

  it('flushes a leftover block when the stream ends without a separator', () => {
    const result = drainSseBlocks('event: done\ndata: {"urls":["https://cdn.example.com/a.png"]}', true)

    expect(result.blocks).toEqual(['event: done\ndata: {"urls":["https://cdn.example.com/a.png"]}'])
    expect(result.remainder).toBe('')
  })
})

describe('parseSseBlock', () => {
  it('joins multiline data fields before parsing JSON', () => {
    const event = parseSseBlock('event: status\ndata: {"message":\ndata: "ready"}')

    expect(event).toEqual({ event: 'status', data: { message: 'ready' } })
  })

  it('marks malformed JSON as recoverable for non-error events', () => {
    const event = parseSseBlock('event: status\ndata: {"message":')

    expect(event).toEqual({ event: 'status', malformed: true })
  })
})
