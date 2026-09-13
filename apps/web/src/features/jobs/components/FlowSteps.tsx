import { CheckIcon } from '../../../shared/components/icons/Icons'

export type JobView = 'create' | 'progress' | 'result'

export function FlowSteps({ view }: { view: JobView }) {
  const currentStep = view === 'create' ? 1 : view === 'progress' ? 2 : 3
  return <div className="flow-steps" aria-label={`Step ${currentStep} of 3`}>{['Upload', 'Convert', 'Ready'].map((label, index) => {
    const step = index + 1
    const state = step < currentStep ? 'complete' : step === currentStep ? 'active' : 'upcoming'
    return <div className={state} key={label}><span>{state === 'complete' ? <CheckIcon /> : step}</span><small>{label}</small></div>
  })}</div>
}
