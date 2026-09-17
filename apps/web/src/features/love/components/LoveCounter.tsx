import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../../auth/context/useAuth'
import { getLoveStatus, sendLove } from '../api'
import type { LoveStatus } from '../types'

const numberFormat = new Intl.NumberFormat()

export function LoveCounter() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const queryKey = ['site-love', user?.id ?? 'anonymous'] as const
  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: getLoveStatus,
    staleTime: 15_000,
    refetchInterval: 30_000,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
  })
  const mutation = useMutation({
    mutationFn: sendLove,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey })
      const previous = queryClient.getQueryData<LoveStatus>(queryKey)
      if (previous && !previous.loved) {
        queryClient.setQueryData<LoveStatus>(queryKey, { count: previous.count + 1, loved: true })
      }
      return { previous }
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) queryClient.setQueryData(queryKey, context.previous)
    },
    onSuccess: (status) => queryClient.setQueryData(queryKey, status),
  })
  const loved = Boolean(data?.loved)

  return (
    <section className="mx-auto mb-8 mt-4 w-[min(1120px,calc(100%_-_48px))] border-t border-[var(--border)] py-14 text-center max-[700px]:w-[calc(100%_-_32px)] max-[700px]:py-11" aria-labelledby="love-counter-title">
      <p className="m-0 text-[11px] font-bold uppercase tracking-[.14em] text-[var(--accent)]">Feeling the love? <span aria-hidden="true">❤️</span></p>
      <h2 className="mb-0 mt-3 text-[clamp(26px,3.2vw,38px)] leading-tight tracking-[-.04em]" id="love-counter-title" aria-live="polite">
        {data ? <><span className="love-count-number" key={data.count}>{numberFormat.format(data.count)}</span> people sent us some love</> : 'LoveMyDocument is counting the love…'}
      </h2>
      <button className={`love-button mt-7 inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full border px-5 text-sm font-semibold transition-[transform,color,background-color,border-color] active:scale-95 disabled:cursor-default ${loved ? 'is-loved border-[color-mix(in_srgb,var(--accent)_32%,var(--border))] bg-[color-mix(in_srgb,var(--accent)_9%,var(--surface))] text-[var(--accent)]' : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text)] hover:border-[color-mix(in_srgb,var(--accent)_45%,var(--border))] hover:bg-[color-mix(in_srgb,var(--accent)_5%,var(--surface))]'}`} type="button" disabled={isLoading || loved || mutation.isPending} aria-pressed={loved} onClick={() => mutation.mutate()}>
        <span className="text-lg leading-none" aria-hidden="true">{loved ? '♥' : '♡'}</span>
        {loved ? 'Loved' : mutation.isPending ? 'Sending love…' : 'Send some love'}
      </button>
      {mutation.isError && <p className="mb-0 mt-3 text-xs text-[var(--danger)]">We couldn’t save your love. Please try again.</p>}
    </section>
  )
}
