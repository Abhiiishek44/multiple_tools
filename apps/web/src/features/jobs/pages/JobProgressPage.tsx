import { JobProgress } from '../components/JobProgress'
import type { ConversionJob } from '../types'

export function JobProgressPage({ file, job }: { file: File | null; job: ConversionJob }) {
  return <section aria-labelledby="conversion-title"><JobProgress file={file} job={job} /></section>
}
