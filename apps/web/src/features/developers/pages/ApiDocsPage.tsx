import { ApiKeyManager } from '../components/ApiKeyManager'

export function ApiDocsPage({ onLogin }: { onLogin: () => void }) {
  return (
    <main className="mx-auto min-h-full w-[min(1120px,calc(100%_-_48px))] pb-[70px] pt-[52px] max-[700px]:w-[calc(100%_-_24px)] max-[700px]:pb-[46px] max-[700px]:pt-8">
      <header className="max-w-[720px]">
        <div>
          <h1 className="m-0 text-[clamp(30px,3.4vw,42px)] leading-[1.12] tracking-[-.035em] max-[700px]:text-[31px]">Create and manage API keys</h1>
          <p className="mb-0 mt-[13px] max-w-[680px] text-sm leading-[1.65] text-[var(--muted)] max-[700px]:mt-2.5 max-[700px]:text-[13px]">Use API keys to authenticate server-side requests. Create a separate key for each application and revoke it when it is no longer needed.</p>
        </div>
      </header>
      <ApiKeyManager onLogin={onLogin} />
    </main>
  )
}
