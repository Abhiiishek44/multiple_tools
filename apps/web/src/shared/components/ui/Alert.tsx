import type { ReactNode } from 'react'

type AlertProps = { children: ReactNode; className?: string }

export function Alert({ children, className = '' }: AlertProps) {
  return <div className={`alert ${className}`} role="alert">{children}</div>
}
