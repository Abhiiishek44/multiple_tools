import type { ReactNode } from 'react'
import { alert, cn } from '../../styles'

type AlertProps = { children: ReactNode; className?: string }

export function Alert({ children, className = '' }: AlertProps) {
  return <div className={cn(alert, className)} role="alert">{children}</div>
}
