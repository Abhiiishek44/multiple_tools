import { CheckIcon } from '../../../shared/components/icons/Icons'
import { cn } from '../../../shared/styles'

export type JobView = 'create' | 'progress' | 'result'

export function FlowSteps({ view }: { view: JobView }) {
  const currentStep = view === 'create' ? 1 : view === 'progress' ? 2 : 3
  return <div className="relative mx-auto mt-9 grid w-[min(360px,100%)] grid-cols-3 before:absolute before:left-[16%] before:right-[16%] before:top-[13px] before:h-px before:bg-[var(--border)] before:content-['']" aria-label={`Step ${currentStep} of 3`}>{['Uploading', 'Queue', 'Completed'].map((label, index) => {
    const step = index + 1
    const state = step < currentStep ? 'complete' : step === currentStep ? 'active' : 'upcoming'
    return <div className={cn('relative flex flex-col items-center gap-[7px] text-[10px] text-[var(--faint)]', state === 'active' && 'font-bold text-[var(--text)]', state === 'complete' && 'text-[var(--accent-strong)]')} key={label}><span className={cn('z-1 grid size-[27px] place-items-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[9px] [&_svg]:w-3', state === 'active' && 'border-[var(--accent-strong)] bg-[var(--accent)] text-[var(--accent-text)]', state === 'complete' && 'border-[var(--accent-strong)]')}>{state === 'complete' ? <CheckIcon /> : step}</span><small>{label}</small></div>
  })}</div>
}
