const IMAGE_URL_PATTERN = /https?:\/\/[^\s"'<>]+\.(?:png|jpe?g|webp|gif)(?:\?[^\s"'<>]+)?/gi

export function extractImageUrlsFromText(text: string) {
  return Array.from(new Set(text.match(IMAGE_URL_PATTERN) ?? []))
}

export function encodeStreamEvent(event: string, data: unknown) {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
}
