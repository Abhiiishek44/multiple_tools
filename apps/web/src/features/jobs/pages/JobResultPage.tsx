import type { ConversionTool } from '../../tools/types'
import { ResultCard } from '../components/ResultCard'
import type { ConversionJob } from '../types'

type Props = { file: File | null; tool: ConversionTool; job: ConversionJob; error: string | null; onDownload: () => void; onRestart: () => void }

export function JobResultPage(props: Props) {
  return <section aria-labelledby="result-title"><ResultCard {...props} /></section>
}
