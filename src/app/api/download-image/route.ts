import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

const DEFAULT_FILENAME = 'rightcodes-image.png'

function sanitizeFilename(filename: string) {
  const sanitized = filename.replace(/[^a-zA-Z0-9._ -]/g, '_').trim()
  return sanitized || DEFAULT_FILENAME
}

function getDownloadUrl(request: Request) {
  const url = new URL(request.url)
  const imageUrl = url.searchParams.get('url')
  if (!imageUrl) return null

  try {
    const parsed = new URL(imageUrl)
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null
    return parsed
  } catch {
    return null
  }
}

export async function GET(request: Request) {
  const imageUrl = getDownloadUrl(request)
  if (!imageUrl) {
    return NextResponse.json({ error: 'Only http and https image URLs can be downloaded.' }, { status: 400 })
  }

  const filename = sanitizeFilename(new URL(request.url).searchParams.get('filename') || DEFAULT_FILENAME)
  const upstreamResponse = await fetch(imageUrl, { cache: 'no-store' }).catch(() => null)

  if (!upstreamResponse?.ok || !upstreamResponse.body) {
    return NextResponse.json({ error: 'Unable to download image.' }, { status: 502 })
  }

  return new Response(upstreamResponse.body, {
    headers: {
      'Content-Type': upstreamResponse.headers.get('Content-Type') || 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store'
    }
  })
}
