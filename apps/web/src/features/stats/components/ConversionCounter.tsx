import { useQuery } from '@tanstack/react-query'
import { getPublicStats } from '../api'

const numberFormat = new Intl.NumberFormat()

export function ConversionCounter() {
  const { data } = useQuery({
    queryKey: ['public-stats'],
    queryFn: getPublicStats,
    refetchInterval: 45_000,
    staleTime: 30_000,
    refetchIntervalInBackground: false,
  })

  return (
    <p className="m-0 flex min-h-5 items-center justify-center gap-1.5 text-[11px] font-medium text-[var(--muted)]" aria-live="polite">
      <span aria-hidden="true">❤️</span>
      {data ? <><span className="stats-number" key={data.successful_conversions}>{numberFormat.format(data.successful_conversions)}</span><span>documents loved so far</span></> : <span>Loading live conversion count…</span>}
    </p>
  )
}
