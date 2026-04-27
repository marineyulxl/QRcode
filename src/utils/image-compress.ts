export type CompressOptions = {
  maxWidth?: number
  quality?: number
  mimeType?: string
}

export type CompressedImage = {
  file: File
  dataUrl: string
  width: number
  height: number
}

/**
 * 将图片压缩为 JPEG（默认最大边 1280、质量 0.82），返回新 File 与预览 data URL。
 */
export async function compressImageFile(
  file: File,
  options: CompressOptions = {},
): Promise<CompressedImage> {
  const maxWidth = options.maxWidth ?? 1280
  const quality = options.quality ?? 0.82
  const mimeType = options.mimeType ?? 'image/jpeg'

  const bitmap = await createImageBitmap(file)
  try {
    const scale = Math.min(1, maxWidth / bitmap.width)
    const width = Math.max(1, Math.round(bitmap.width * scale))
    const height = Math.max(1, Math.round(bitmap.height * scale))

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      throw new Error('浏览器不支持 Canvas，无法压缩图片')
    }

    ctx.drawImage(bitmap, 0, 0, width, height)

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => {
          if (b) resolve(b)
          else reject(new Error('图片压缩失败'))
        },
        mimeType,
        quality,
      )
    })

    const dataUrl = await blobToDataUrl(blob)
    const outName = stripExtension(file.name) + '.jpg'
    const outFile = new File([blob], outName, { type: mimeType })

    return { file: outFile, dataUrl, width, height }
  } finally {
    bitmap.close()
  }
}

function stripExtension(name: string): string {
  const i = name.lastIndexOf('.')
  if (i <= 0) return name
  return name.slice(0, i)
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') resolve(reader.result)
      else reject(new Error('读取图片失败'))
    }
    reader.onerror = () => reject(new Error('读取图片失败'))
    reader.readAsDataURL(blob)
  })
}

/** 将已压缩的 File 转为 data URL（提交占位用） */
export function fileToDataUrl(file: File): Promise<string> {
  return blobToDataUrl(file)
}
