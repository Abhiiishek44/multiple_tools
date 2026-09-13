import { useEffect, useId, useState } from 'react'
import { useAuth } from '../../auth/context/useAuth'
import { Alert } from '../../../shared/components/ui/Alert'
import { CheckIcon, CloseIcon, CopyIcon, KeyIcon, LockIcon, PlusIcon, TrashIcon } from '../../../shared/components/icons/Icons'
import { createApiKey, listApiKeys, revokeApiKey, type ApiKeyRecord } from '../api'

const SCOPE_OPTIONS = [
  { value: 'tools:read', description: 'View available conversion tools and their options.' },
  { value: 'jobs:create', description: 'Upload files and start new conversion jobs.' },
  { value: 'jobs:read', description: 'View job status, progress, and result metadata.' },
  { value: 'jobs:download', description: 'Download completed conversion output files.' },
] as const

const ALL_SCOPES = SCOPE_OPTIONS.map((scope) => scope.value)
const formatDate = (value: string) => new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(value))

export function ApiKeyManager({ onLogin }: { onLogin: () => void }) {
  const { status } = useAuth()
  const dialogTitleId = useId()
  const [keys, setKeys] = useState<ApiKeyRecord[]>([])
  const [name, setName] = useState('')
  const [scopes, setScopes] = useState<string[]>(ALL_SCOPES)
  const [createdKey, setCreatedKey] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [keyToRevoke, setKeyToRevoke] = useState<ApiKeyRecord | null>(null)
  const [busy, setBusy] = useState(false)
  const [revokingKeyId, setRevokingKeyId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status !== 'authenticated') return
    let active = true
    void listApiKeys()
      .then((result) => { if (active) setKeys(result.filter((key) => !key.revoked_at)) })
      .catch((reason: unknown) => { if (active) setError(reason instanceof Error ? reason.message : 'Could not load API keys.') })
    return () => { active = false }
  }, [status])

  useEffect(() => {
    if (!isCreateOpen && !keyToRevoke) return
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || busy || revokingKeyId) return
      setIsCreateOpen(false)
      setKeyToRevoke(null)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [busy, isCreateOpen, keyToRevoke, revokingKeyId])

  const toggleScope = (scope: string) => setScopes((current) => current.includes(scope) ? current.filter((item) => item !== scope) : [...current, scope])

  const create = async () => {
    if (!name.trim() || scopes.length === 0) return
    setBusy(true)
    setError(null)
    try {
      const result = await createApiKey(name.trim(), scopes)
      setCreatedKey(result.api_key)
      setKeys((current) => [result, ...current])
      setName('')
      setIsCreateOpen(false)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not create the API key.')
    } finally { setBusy(false) }
  }

  const revoke = async (key: ApiKeyRecord) => {
    setError(null)
    setRevokingKeyId(key.key_id)
    try {
      await revokeApiKey(key.key_id)
      setKeys((current) => current.filter((item) => item.key_id !== key.key_id))
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not revoke the API key.')
    } finally {
      setRevokingKeyId(null)
      setKeyToRevoke(null)
    }
  }

  const copy = async () => {
    if (!createdKey) return
    await navigator.clipboard.writeText(createdKey)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  if (status !== 'authenticated') return (
    <div className="key-signin">
      <div className="key-signin-icon"><LockIcon /></div>
      <div className="key-signin-copy"><strong>Sign in to manage API keys</strong><p>Create secure, scoped keys for your server-side integrations.</p></div>
      <button className="primary-action" type="button" disabled={status === 'loading'} onClick={onLogin}>{status === 'loading' ? 'Checking session…' : 'Log in to continue'}</button>
    </div>
  )

  const activeKeyCount = keys.filter((key) => !key.revoked_at).length

  return (
    <div className="key-console">
      {createdKey && (
        <div className="created-key" role="status">
          <div className="created-key-heading">
            <span><CheckIcon /></span>
            <div><strong>API key created</strong><p>Copy it now. For your security, this secret will not be shown again.</p></div>
            <button type="button" aria-label="Dismiss API key" onClick={() => setCreatedKey(null)}><CloseIcon /></button>
          </div>
          <div className="created-key-value"><code>{createdKey}</code><button type="button" onClick={() => void copy()}>{copied ? <CheckIcon /> : <CopyIcon />}{copied ? 'Copied' : 'Copy key'}</button></div>
        </div>
      )}

      {error && !isCreateOpen && <Alert>{error}</Alert>}

      <div className="key-manager">
        <div className="key-manager-header">
          <div className="key-manager-title"><span><KeyIcon /></span><div><strong>Your API keys</strong><p>Only active keys are shown.</p></div></div>
          <div className="key-manager-actions"><button type="button" onClick={() => { setError(null); setIsCreateOpen(true) }}><PlusIcon />Create API key</button></div>
        </div>

        <div className="key-table" role="table" aria-label="API keys">
          <div className="key-table-head" role="row"><span role="columnheader">Name</span><span role="columnheader">Permissions</span><span role="columnheader">Created</span><span role="columnheader">Status</span><span role="columnheader" className="sr-only">Actions</span></div>
          {keys.length === 0 ? (
            <div className="key-empty"><span><KeyIcon /></span><strong>No API keys yet</strong><p>Create a key to authenticate your first integration.</p><button type="button" onClick={() => setIsCreateOpen(true)}><PlusIcon />Create your first key</button></div>
          ) : keys.map((key) => (
            <article className="key-table-row" role="row" key={key.key_id}>
              <div className="key-name-cell" role="cell"><span><KeyIcon /></span><div><strong>{key.name}</strong><code>mt_live_••••{key.key_id.slice(-4)}</code></div></div>
              <div className="key-scopes-cell" role="cell"><strong>{key.scopes.length} permissions</strong><small>{key.scopes.join(', ')}</small></div>
              <div className="key-date-cell" role="cell"><strong>{formatDate(key.created_at)}</strong><small>{key.last_used_at ? `Used ${formatDate(key.last_used_at)}` : 'Never used'}</small></div>
              <div role="cell"><span className={`key-status ${key.revoked_at ? 'is-revoked' : ''}`}><i />{key.revoked_at ? 'Revoked' : 'Active'}</span></div>
              <div className="key-row-actions" role="cell">{!key.revoked_at && <button type="button" disabled={revokingKeyId === key.key_id} onClick={() => setKeyToRevoke(key)} aria-label={`Revoke ${key.name}`}><TrashIcon />{revokingKeyId === key.key_id ? 'Revoking…' : 'Revoke'}</button>}</div>
            </article>
          ))}
        </div>
        <div className="key-manager-footer"><span><i />{activeKeyCount} active {activeKeyCount === 1 ? 'key' : 'keys'}</span><p>Keep keys private and rotate them regularly.</p></div>
      </div>

      {isCreateOpen && (
        <div className="key-dialog-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) setIsCreateOpen(false) }}>
          <section className="key-dialog" role="dialog" aria-modal="true" aria-labelledby={dialogTitleId}>
            <header><h3 id={dialogTitleId}>Create API key</h3><button type="button" aria-label="Close dialog" disabled={busy} onClick={() => setIsCreateOpen(false)}><CloseIcon /></button></header>
            <form onSubmit={(event) => { event.preventDefault(); void create() }}>
              <div className="key-dialog-body">
                {error && <Alert>{error}</Alert>}
                <label className="key-name-field"><span>Name</span><input autoFocus type="text" value={name} maxLength={100} onChange={(event) => setName(event.target.value)} placeholder="Token name" /></label>
                <fieldset><legend>Scopes</legend><div className="key-scope-list">{SCOPE_OPTIONS.map((scope) => <label key={scope.value}><input type="checkbox" checked={scopes.includes(scope.value)} onChange={() => toggleScope(scope.value)} /><span className="scope-check"><CheckIcon /></span><span><strong>{scope.value}</strong><small>{scope.description}</small></span></label>)}</div></fieldset>
              </div>
              <footer><button className="key-cancel-button" type="button" disabled={busy} onClick={() => setIsCreateOpen(false)}>Cancel</button><button className="key-submit-button" type="submit" disabled={busy || !name.trim() || scopes.length === 0}>{busy ? 'Creating…' : 'Create'}</button></footer>
            </form>
          </section>
        </div>
      )}

      {keyToRevoke && (
        <div className="key-dialog-backdrop revoke-dialog-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget && !revokingKeyId) setKeyToRevoke(null) }}>
          <section className="revoke-dialog" role="alertdialog" aria-modal="true" aria-labelledby="revoke-key-title" aria-describedby="revoke-key-description">
            <button className="revoke-dialog-close" type="button" aria-label="Close revoke dialog" disabled={Boolean(revokingKeyId)} onClick={() => setKeyToRevoke(null)}><CloseIcon /></button>
            <span className="revoke-dialog-icon"><TrashIcon /></span>
            <h3 id="revoke-key-title">Revoke API key?</h3>
            <p id="revoke-key-description">You are about to revoke <strong>{keyToRevoke.name}</strong>.</p>
            <div className="revoke-dialog-warning"><strong>This action cannot be undone.</strong><span>Applications using this key will immediately lose access.</span></div>
            <footer><button className="revoke-cancel-button" type="button" autoFocus disabled={Boolean(revokingKeyId)} onClick={() => setKeyToRevoke(null)}>Cancel</button><button className="revoke-confirm-button" type="button" disabled={Boolean(revokingKeyId)} onClick={() => void revoke(keyToRevoke)}>{revokingKeyId ? 'Revoking…' : <><TrashIcon />Revoke key</>}</button></footer>
          </section>
        </div>
      )}
    </div>
  )
}
