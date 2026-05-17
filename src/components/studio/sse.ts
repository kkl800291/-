export type StudioStreamData = {
  message?: string
  urls?: string[]
}

export type StudioStreamEvent =
  | {
      event: string
      data: StudioStreamData
      malformed?: false
    }
  | {
      event: string
      malformed: true
    }

function normalizeNewlines(value: string) {
  return value.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
}

export function drainSseBlocks(buffer: string, flush = false) {
  const normalized = normalizeNewlines(buffer)

  if (flush) {
    const block = normalized.trim()
    return {
      blocks: block ? [block] : [],
      remainder: ''
    }
  }

  const parts = normalized.split('\n\n')
  const remainder = parts.pop() ?? ''

  return {
    blocks: parts.filter((part) => part.trim().length > 0),
    remainder
  }
}

export function parseSseBlock(block: string): StudioStreamEvent | null {
  const dataLines: string[] = []
  let event = 'message'

  for (const line of normalizeNewlines(block).split('\n')) {
    if (!line || line.startsWith(':')) continue

    const separatorIndex = line.indexOf(':')
    const field = separatorIndex === -1 ? line : line.slice(0, separatorIndex)
    const rawValue = separatorIndex === -1 ? '' : line.slice(separatorIndex + 1)
    const value = rawValue.startsWith(' ') ? rawValue.slice(1) : rawValue

    if (field === 'event') event = value
    if (field === 'data') dataLines.push(value)
  }

  if (dataLines.length === 0) return null

  try {
    return {
      event,
      data: JSON.parse(dataLines.join('\n')) as StudioStreamData
    }
  } catch {
    return { event, malformed: true }
  }
}
