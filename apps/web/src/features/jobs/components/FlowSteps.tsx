import { CheckIcon } from '../../../shared/components/icons/Icons'

export type JobView = 'create' | 'progress' | 'result'

export function FlowSteps({ view }: { view: JobView }) {
  const currentStep = view === 'create' ? 1 : view === 'progress' ? 2 : 3
  return <div className="relative mx-auto mt-6 grid w-[min(24rem,calc(100%_-_2.5rem))] grid-cols-3 before:absolute before:top-3.5 before:right-[16.66%] before:left-[16.66%] before:h-px before:bg-slate-200 max-sm:mt-4" aria-label={`Step ${currentStep} of 3`}>{['Upload', 'Convert', 'Ready'].map((label, index) => {
    const step = index + 1
    const state = step < currentStep ? 'complete' : step === currentStep ? 'active' : 'upcoming'
    const text = state === 'active' ? 'text-slate-900' : state === 'complete' ? 'text-blue-600' : 'text-slate-400'
    const circle = state === 'active' ? 'border-blue-600 bg-blue-600 text-white ring-4 ring-blue-100' : state === 'complete' ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-200 bg-white text-slate-400'
    return <div className={`relative flex flex-col items-center gap-2 text-xs font-semibold ${text}`} key={label}><span className={`z-10 grid size-7 place-items-center rounded-full border text-[11px] transition ${circle}`}>{state === 'complete' ? <CheckIcon className="size-3.5 fill-none stroke-current stroke-[2.3]" /> : step}</span><span>{label}</span></div>
  })}</div>
}
