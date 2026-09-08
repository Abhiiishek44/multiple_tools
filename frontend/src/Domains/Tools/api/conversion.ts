export const CONVERSION_DURATION_MS = 2800

export function downloadConvertedFile(file: File, outputName: string) {
  const url = URL.createObjectURL(file)
  const anchor = document.createElement('a')

  anchor.href = url
  anchor.download = outputName
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}

