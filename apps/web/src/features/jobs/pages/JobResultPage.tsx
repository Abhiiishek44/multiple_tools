import type { ConversionTool } from '../../tools/types'
import { ResultCard } from '../components/ResultCard'
import type { ConversionJob } from '../types'

type Props = { file: File | null; tool: ConversionTool; job: ConversionJob; error: string | null; onDownload: () => void; onRestart: () => void }

export function JobResultPage(props: Props) {
  return <main className="grid min-h-[calc(100vh-13rem)] place-items-center px-5 py-12" aria-labelledby="result-title"><ResultCard {...props} /></main>
}
