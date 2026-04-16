//compressImage.ts
import imageCompression from 'browser-image-compression'

export interface CompressOptions {
  maxSizeMB?: number
  maxWidthOrHeight?: number
}

/**
 * Compresses an image File before upload.
 * Defaults: 500 KB max, 1920 px max dimension, web worker enabled.
 */
export async function compressImage(
  file: File,
  options: CompressOptions = {}
): Promise<File> {
  const { maxSizeMB = 0.5, maxWidthOrHeight = 1920 } = options

  const compressed = await imageCompression(file, {
    maxSizeMB,
    maxWidthOrHeight,
    useWebWorker: true,
    fileType: file.type as 'image/jpeg' | 'image/png' | 'image/webp',
  })

  // Preserve the original filename
  return new File([compressed], file.name, { type: compressed.type })
}
