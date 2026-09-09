import type { ReactNode } from 'react'

export function PageContainer({ children }: { children: ReactNode }) {
  return <main className="grid w-full items-center p-8 max-sm:items-start max-sm:p-5 max-sm:pt-6">{children}</main>
}
