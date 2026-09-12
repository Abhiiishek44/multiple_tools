import { useEffect } from 'react'
import { getConversionJob } from '../api'
import type { ConversionJob } from '../types'
import { ApiError } from '../../../shared/api/errors'

type Options = {
  jobId?: string
  status?: ConversionJob['status']
  onUpdate: (job: ConversionJob) => void
  onFailure: (message: string) => void
  onUnauthorized: () => void
}

export function useJobPolling({ jobId, status, onUpdate, onFailure, onUnauthorized }: Options) {
  useEffect(() => {
    if (!jobId || (status !== 'QUEUED' && status !== 'RUNNING')) return
    let stopped = false
    let timer: number | undefined
    let consecutiveFailures = 0
    const poll = async () => {
      try {
        const updated = await getConversionJob(jobId)
        if (stopped) return
        consecutiveFailures = 0
        onUpdate(updated)
        if (updated.status === 'FAILED') onFailure(updated.error || 'The conversion failed. Please try another file.')
        else if (updated.status !== 'SUCCESS') timer = window.setTimeout(poll, 900)
      } catch (error) {
        if (stopped) return
        if (!(error instanceof ApiError && error.status === 401) && consecutiveFailures < 2) {
          consecutiveFailures += 1
          timer = window.setTimeout(poll, 1500)
          return
        }
        if (error instanceof ApiError && error.status === 401) onUnauthorized()
        onFailure(error instanceof Error ? error.message : 'Could not check conversion progress.')
      }
    }
    timer = window.setTimeout(poll, 500)
    return () => { stopped = true; if (timer) window.clearTimeout(timer) }
  }, [jobId, onFailure, onUnauthorized, onUpdate, status])
}

