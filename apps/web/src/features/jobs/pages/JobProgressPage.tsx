import { JobProgress } from '../components/JobProgress'
import type { ConversionJob } from '../types'

export function JobProgressPage({ file, job }: { file: File | null; job: ConversionJob }) {
  return <main className="grid w-full place-items-center p-8 max-sm:p-5" aria-labelledby="conversion-title"><JobProgress file={file} job={job} /></main>
}
