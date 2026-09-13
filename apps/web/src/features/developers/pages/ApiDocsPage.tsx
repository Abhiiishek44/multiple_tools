import { ApiKeyManager } from '../components/ApiKeyManager'

export function ApiDocsPage({ onLogin }: { onLogin: () => void }) {
  return (
    <main className="api-keys-page">
      <header className="api-keys-page-heading">
        <div>
          <h1>Create and manage API keys</h1>
          <p>Use API keys to authenticate server-side requests. Create a separate key for each application and revoke it when it is no longer needed.</p>
        </div>
      </header>
      <ApiKeyManager onLogin={onLogin} />
    </main>
  )
}
