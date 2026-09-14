import imageCompression from 'browser-image-compression'

export interface CompressionProgressCallback {
  (progress: number): void
}

/**
 * Compresses an image file if it exceeds moderate size limits,
 * preserving timestamp legibility and image clarity.
 */
export async function compressImageIfNeeded(
  file: File,
  onProgress?: CompressionProgressCallback
): Promise<File> {
  // If file is already smaller than 1.5MB, keep as is to avoid unnecessary reprocessing
  if (file.size <= 1.5 * 1024 * 1024) {
    return file
  }

  const options = {
    maxSizeMB: 1.5,
    maxWidthOrHeight: 2560,
    useWebWorker: true,
    fileType: file.type.includes('png') ? 'image/png' : 'image/jpeg',
    initialQuality: 0.88,
    onProgress: onProgress ? (p: number) => onProgress(p) : undefined,
  }

  try {
    const compressedFile = await imageCompression(file, options)
    // Return compressed file only if it is indeed smaller
    return compressedFile.size < file.size ? compressedFile : file
  } catch (error) {
    console.warn('Image compression fallback to original file:', error)
    return file
  }
}

