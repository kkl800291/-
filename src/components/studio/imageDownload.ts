export function createImageDownloadHref(imageUrl: string, filename = 'rightcodes-image.png') {
  if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
    return imageUrl
  }

  const params = new URLSearchParams({
    url: imageUrl,
    filename
  })

  return `/api/download-image?${params.toString()}`
}
