const ACCEPTED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/pjpeg',
  'image/x-png',
]

export function isValidImageType(file: File): boolean {
  if (file.type) {
    const mime = file.type.toLowerCase()
    if (ACCEPTED_MIME_TYPES.includes(mime)) {
      return true
    }
  }
  // Fallback for file extension check (e.g. on Windows where mime may be empty)
  const ext = file.name.split('.').pop()?.toLowerCase()
  if (ext && ['jpg', 'jpeg', 'png', 'webp'].includes(ext)) {
    return true
  }
  // If mime starts with image/ and is not a known non-image
  if (file.type && file.type.toLowerCase().startsWith('image/')) {
    return true
  }
  return false
}

export function getImageDimensions(file: File): Promise<{ width: number; height: number; previewUrl: string }> {
  return new Promise((resolve, reject) => {
    const previewUrl = URL.createObjectURL(file)
    const img = new Image()

    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight,
        previewUrl,
      })
    }

    img.onerror = () => {
      URL.revokeObjectURL(previewUrl)
      reject(new Error(`Failed to load image: ${file.name}`))
    }

    img.src = previewUrl
  })
}

export function revokePreviewUrl(url: string): void {
  if (url && url.startsWith('blob:')) {
    URL.revokeObjectURL(url)
  }
}

/**
 * Creates an oriented image data URL (taking rotation into account)
 * without losing crispness or modifying the timestamp embedded in the photo.
 */
export function getOrientedImageDataUrl(
  imgElement: HTMLImageElement,
  rotation: number,
  quality = 0.9
): Promise<{ dataUrl: string; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    try {
      const naturalW = imgElement.naturalWidth
      const naturalH = imgElement.naturalHeight
      const normalizedRot = ((rotation % 360) + 360) % 360

      const isRotated90or270 = normalizedRot === 90 || normalizedRot === 270
      const canvasWidth = isRotated90or270 ? naturalH : naturalW
      const canvasHeight = isRotated90or270 ? naturalW : naturalH

      const canvas = document.createElement('canvas')
      canvas.width = canvasWidth
      canvas.height = canvasHeight

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        throw new Error('Canvas 2D context not available')
      }

      ctx.save()
      ctx.translate(canvasWidth / 2, canvasHeight / 2)
      ctx.rotate((normalizedRot * Math.PI) / 180)
      ctx.drawImage(imgElement, -naturalW / 2, -naturalH / 2)
      ctx.restore()

      const dataUrl = canvas.toDataURL('image/jpeg', quality)
      resolve({
        dataUrl,
        width: canvasWidth,
        height: canvasHeight,
      })
    } catch (err) {
      reject(err)
    }
  })
}

