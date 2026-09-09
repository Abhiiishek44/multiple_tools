import type { ReactNode } from 'react'

type AlertProps = { children: ReactNode; className?: string }

export function Alert({ children, className = '' }: AlertProps) {
  return <div className={`rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 ${className}`} role="alert">{children}</div>
}
