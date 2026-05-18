'use client'

import Lightbox from 'yet-another-react-lightbox'
import Download from 'yet-another-react-lightbox/plugins/download'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'
import { createImageDownloadHref } from './imageDownload'

type ImageLightboxProps = {
  imageUrl: string
  open: boolean
  onClose: () => void
  downloadName?: string
}

export function ImageLightbox({ imageUrl, open, onClose, downloadName = 'rightcodes-image.png' }: ImageLightboxProps) {
  const downloadHref = createImageDownloadHref(imageUrl, downloadName)

  return (
    <Lightbox
      open={open}
      close={onClose}
      index={0}
      slides={[
        {
          src: imageUrl,
          alt: '生成图片预览',
          download: {
            url: downloadHref,
            filename: downloadName
          }
        }
      ]}
      plugins={[Zoom, Download]}
      labels={{
        Lightbox: '图片预览',
        Close: '关闭预览',
        Download: '下载图片',
        'Zoom in': '放大',
        'Zoom out': '缩小',
        Slide: '图片',
        Carousel: '图片查看器',
        'Photo gallery': '图片查看器',
        '{index} of {total}': '第 {index} 张，共 {total} 张'
      }}
      carousel={{ finite: true, imageFit: 'contain', padding: 24 }}
      animation={{ fade: 180, swipe: 220, zoom: 180 }}
      controller={{ closeOnBackdropClick: true }}
      zoom={{
        maxZoomPixelRatio: 1.5,
        zoomInMultiplier: 1.75,
        doubleClickMaxStops: 3,
        keyboardMoveDistance: 80,
        wheelZoomDistanceFactor: 120,
        scrollToZoom: true,
        pinchZoomV4: true
      }}
      styles={{
        container: { backgroundColor: 'rgba(7, 9, 12, 0.95)' },
        toolbar: { padding: '12px' },
        button: { color: '#F4F0E7' }
      }}
    />
  )
}
