import { CheckIcon } from '../../../Shared/Components/Icons'


export type ToolView = 'upload' | 'converting' | 'result'

export function FlowSteps({ view }: { view: ToolView }) {
  const currentStep = view === 'upload' ? 1 : view === 'converting' ? 2 : 3

  return (
    <div className="flow-steps" aria-label={`Step ${currentStep} of 3`}>
      {['Upload', 'Convert', 'Ready'].map((label, index) => {
        const step = index + 1
        const state = step < currentStep ? 'complete' : step === currentStep ? 'active' : 'upcoming'

        return (
          <div className={`flow-step flow-step--${state}`} key={label}>
            <span className="flow-step__number">{state === 'complete' ? <CheckIcon /> : step}</span>
            <span className="flow-step__label">{label}</span>
          </div>
        )
      })}
    </div>
  )
}
