export function formatFileSize(bytes: number) {
  if (bytes === 0) return '0 bytes'

  const units = ['bytes', 'KB', 'MB', 'GB']
  const unitIndex = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  const value = bytes / 1024 ** unitIndex

  return `${value.toFixed(unitIndex === 0 || value >= 10 ? 0 : 1)} ${units[unitIndex]}`
}

export function getFileExtension(file: File) {
  const extension = file.name.split('.').pop()
  if (extension && extension !== file.name) return extension.toUpperCase()

  return file.type.split('/').pop()?.toUpperCase() || 'FILE'
}

export function getConvertedFileName(name: string, outputExtension?: string) {
  const dotIndex = name.lastIndexOf('.')
  const extension = outputExtension?.toLowerCase()
  if (dotIndex <= 0) return extension ? `${name}-converted.${extension}` : `${name}-converted`

  return `${name.slice(0, dotIndex)}-converted${extension ? `.${extension}` : name.slice(dotIndex)}`
}
