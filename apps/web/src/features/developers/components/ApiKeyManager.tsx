import { useEffect, useId, useState } from 'react'
import { useAuth } from '../../auth/context/useAuth'
import { Alert } from '../../../shared/components/ui/Alert'
import { CheckIcon, CloseIcon, CopyIcon, KeyIcon, LockIcon, PlusIcon, TrashIcon } from '../../../shared/components/icons/Icons'
import { createApiKey, listApiKeys, revokeApiKey, type ApiKeyRecord } from '../api'
import { cn, primaryAction } from '../../../shared/styles'

const SCOPE_OPTIONS = [
  { value: 'tools:read', description: 'View available conversion tools and their options.' },
  { value: 'jobs:create', description: 'Upload files and start new conversion jobs.' },
  { value: 'jobs:read', description: 'View job status, progress, and result metadata.' },
  { value: 'jobs:download', description: 'Download completed conversion output files.' },
] as const

const ALL_SCOPES = SCOPE_OPTIONS.map((scope) => scope.value)
const formatDate = (value: string) => new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(value))

const keyButton = 'inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-[var(--accent)] bg-[var(--accent)] px-4 text-xs font-semibold text-[var(--accent-text)] transition-colors hover:border-[var(--accent-strong)] hover:bg-[var(--accent-strong)] [&_svg]:w-3.5 [&_svg]:stroke-[2.2]'
const tableGrid = 'grid grid-cols-[minmax(150px,1.2fr)_minmax(140px,1fr)_minmax(105px,.7fr)_72px_72px] items-center gap-x-3.5'
const cellTitle = 'block overflow-hidden text-ellipsis whitespace-nowrap text-[13px]'
const cellMeta = 'mt-[5px] block overflow-hidden text-ellipsis whitespace-nowrap text-[10px] text-[var(--faint)]'

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
    <div className="mt-[26px] grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 rounded-[18px] border border-[var(--border)] bg-[var(--surface-soft)] p-5 max-[700px]:grid-cols-[auto_minmax(0,1fr)]">
      <div className="grid size-11 place-items-center rounded-[13px] bg-[var(--surface)] text-[var(--accent-strong)] shadow-[inset_0_0_0_1px_var(--border)] [&_svg]:w-5"><LockIcon /></div>
      <div><strong className="block text-sm">Sign in to manage API keys</strong><p className="mb-0 mt-[5px] text-[11px] leading-normal text-[var(--muted)]">Create secure, scoped keys for your server-side integrations.</p></div>
      <button className={`${primaryAction} min-h-[42px] shrink-0 max-[700px]:col-span-full max-[700px]:w-full`} type="button" disabled={status === 'loading'} onClick={onLogin}>{status === 'loading' ? 'Checking session…' : 'Log in to continue'}</button>
    </div>
  )

  const activeKeyCount = keys.filter((key) => !key.revoked_at).length

  return (
    <div className="mt-[30px] grid gap-3.5">
      {createdKey && (
        <div className="rounded-[18px] border border-[color-mix(in_srgb,var(--accent-strong)_55%,var(--border))] bg-[color-mix(in_srgb,var(--accent)_8%,var(--surface))] p-[18px] shadow-[0_12px_32px_color-mix(in_srgb,var(--accent)_9%,transparent)]" role="status">
          <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-[11px]">
            <span className="grid size-[30px] place-items-center rounded-full bg-[var(--accent)] text-[var(--accent-text)] [&_svg]:w-[15px] [&_svg]:stroke-[2.3]"><CheckIcon /></span>
            <div><strong className="block text-[13px]">API key created</strong><p className="mb-0 mt-[3px] text-[10px] text-[var(--muted)]">Copy it now. For your security, this secret will not be shown again.</p></div>
            <button className="grid size-[30px] cursor-pointer place-items-center rounded-[9px] border-0 bg-transparent text-[var(--muted)] hover:bg-[var(--surface-strong)] hover:text-[var(--text)] [&_svg]:w-[15px]" type="button" aria-label="Dismiss API key" onClick={() => setCreatedKey(null)}><CloseIcon /></button>
          </div>
          <div className="mt-3.5 flex items-center gap-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-2 pl-[13px]"><code className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-[11px] text-[var(--text)]">{createdKey}</code><button className="flex min-h-[34px] cursor-pointer items-center gap-[7px] rounded-[9px] border-0 bg-[var(--text)] px-3 text-[10px] font-extrabold text-[var(--surface)] [&_svg]:w-[13px]" type="button" onClick={() => void copy()}>{copied ? <CheckIcon /> : <CopyIcon />}{copied ? 'Copied' : 'Copy key'}</button></div>
        </div>
      )}

      {error && !isCreateOpen && <Alert>{error}</Alert>}

      <div className="overflow-hidden rounded-[19px] border border-[var(--border)] bg-[var(--surface)] shadow-[0_16px_42px_rgba(20,24,16,.05)]">
        <div className="flex min-h-[82px] items-center justify-between gap-[18px] px-5 py-[18px] max-[700px]:flex-col max-[700px]:items-start">
          <div className="flex min-w-0 items-center gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--surface-soft)] text-[var(--text)] [&_svg]:w-[19px]"><KeyIcon /></span><div><strong className="block text-base tracking-[-.01em]">Your API keys</strong><p className="mb-0 mt-1 text-xs text-[var(--muted)]">Only active keys are shown.</p></div></div>
          <div className="flex items-center gap-2 max-[700px]:w-full max-[700px]:[&>button]:flex-1 max-[700px]:[&>button]:justify-center"><button className={keyButton} type="button" onClick={() => { setError(null); setIsCreateOpen(true) }}><PlusIcon />Create API key</button></div>
        </div>

        <div className="border-y border-[var(--border)]" role="table" aria-label="API keys">
          <div className={`${tableGrid} min-h-[42px] bg-[var(--surface-soft)] px-5 text-[10px] font-[750] uppercase tracking-[.045em] text-[var(--muted)] max-[700px]:hidden`} role="row"><span role="columnheader">Name</span><span role="columnheader">Permissions</span><span role="columnheader">Created</span><span role="columnheader">Status</span><span role="columnheader" className="sr-only">Actions</span></div>
          {keys.length === 0 ? (
            <div className="flex min-h-[210px] flex-col items-center justify-center p-[30px] text-center"><span className="grid size-[46px] place-items-center rounded-[14px] bg-[var(--surface-soft)] text-[var(--muted)] [&_svg]:w-[21px]"><KeyIcon /></span><strong className="mt-[13px] text-[13px]">No API keys yet</strong><p className="mb-3.5 mt-[5px] text-[10px] text-[var(--muted)]">Create a key to authenticate your first integration.</p><button className={keyButton} type="button" onClick={() => setIsCreateOpen(true)}><PlusIcon />Create your first key</button></div>
          ) : keys.map((key) => (
            <article className={`${tableGrid} min-h-[78px] border-t border-[var(--border)] px-5 py-[13px] first:border-t-0 max-[700px]:grid-cols-[minmax(0,1fr)_auto] max-[700px]:gap-3 max-[700px]:p-4 [&>div]:min-w-0`} role="row" key={key.key_id}>
              <div className="flex items-center gap-2.5 max-[700px]:col-start-1" role="cell"><span className="grid size-8 shrink-0 place-items-center rounded-[9px] bg-[var(--surface-soft)] text-[var(--muted)] [&_svg]:w-3.5"><KeyIcon /></span><div><strong className={cellTitle}>{key.name}</strong><code className={`${cellMeta} font-mono`}>mt_live_••••{key.key_id.slice(-4)}</code></div></div>
              <div className="max-[700px]:col-start-1 max-[700px]:pl-[42px]" role="cell"><strong className={cellTitle}>{key.scopes.length} permissions</strong><small className={cellMeta}>{key.scopes.join(', ')}</small></div>
              <div className="max-[700px]:col-start-1 max-[700px]:pl-[42px]" role="cell"><strong className={cellTitle}>{formatDate(key.created_at)}</strong><small className={cellMeta}>{key.last_used_at ? `Used ${formatDate(key.last_used_at)}` : 'Never used'}</small></div>
              <div className="max-[700px]:col-start-2 max-[700px]:row-start-1 max-[700px]:self-start" role="cell"><span className={cn('inline-flex items-center gap-[7px] text-[11px] font-[750] text-[#198954] [&_i]:size-1.5 [&_i]:rounded-full [&_i]:bg-[#24b36b]', key.revoked_at && 'text-[var(--faint)] [&_i]:bg-[var(--faint)]')}><i />{key.revoked_at ? 'Revoked' : 'Active'}</span></div>
              <div className="text-right max-[700px]:col-start-2 max-[700px]:row-start-2 max-[700px]:row-span-2 max-[700px]:self-center" role="cell">{!key.revoked_at && <button className="inline-flex min-h-[34px] cursor-pointer items-center gap-1.5 rounded-lg border border-[color-mix(in_srgb,var(--danger)_38%,var(--border))] bg-transparent px-2.5 text-[11px] font-bold text-[var(--danger)] hover:bg-[color-mix(in_srgb,var(--danger)_8%,transparent)] disabled:cursor-wait disabled:opacity-55 [&_svg]:w-3" type="button" disabled={revokingKeyId === key.key_id} onClick={() => setKeyToRevoke(key)} aria-label={`Revoke ${key.name}`}><TrashIcon />{revokingKeyId === key.key_id ? 'Revoking…' : 'Revoke'}</button>}</div>
            </article>
          ))}
        </div>
        <div className="flex min-h-[50px] items-center justify-between gap-[15px] px-5 text-[11px] text-[var(--muted)] max-[700px]:flex-col max-[700px]:items-start max-[700px]:justify-center max-[700px]:py-3"><span className="inline-flex items-center gap-2 font-[750]"><i className="size-[7px] rounded-full bg-[#24b36b] shadow-[0_0_0_4px_color-mix(in_srgb,#24b36b_12%,transparent)]" />{activeKeyCount} active {activeKeyCount === 1 ? 'key' : 'keys'}</span><p className="m-0">Keep keys private and rotate them regularly.</p></div>
      </div>

      {isCreateOpen && (
        <div className="fixed inset-0 z-120 grid place-items-center overflow-y-auto bg-[rgba(7,8,7,.62)] p-6 backdrop-blur-[6px] max-[700px]:items-end max-[700px]:p-0" onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) setIsCreateOpen(false) }}>
          <section className="max-h-[calc(100vh-48px)] w-[min(650px,100%)] overflow-y-auto rounded-[18px] border border-[var(--border)] bg-[var(--surface)] shadow-[0_28px_90px_rgba(0,0,0,.32)] max-[700px]:max-h-[92vh] max-[700px]:w-full max-[700px]:rounded-b-none" role="dialog" aria-modal="true" aria-labelledby={dialogTitleId}>
            <header className="flex min-h-[66px] items-center justify-between gap-5 border-b border-[var(--border)] px-[22px] max-[700px]:px-[18px]"><h3 className="m-0 text-[17px] font-[750] tracking-[-.015em]" id={dialogTitleId}>Create API key</h3><button className="grid size-8 cursor-pointer place-items-center rounded-[9px] border-0 bg-transparent text-[var(--muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--text)] disabled:cursor-wait disabled:opacity-55 [&_svg]:w-[18px] [&_svg]:stroke-[2.2]" type="button" aria-label="Close dialog" disabled={busy} onClick={() => setIsCreateOpen(false)}><CloseIcon /></button></header>
            <form className="p-0" onSubmit={(event) => { event.preventDefault(); void create() }}>
              <div className="p-[22px] max-[700px]:px-[18px] max-[700px]:py-5">
                {error && <Alert className="mb-[18px]">{error}</Alert>}
                <label><span className="block text-sm font-[650] text-[var(--text)]">Name</span><input className="mt-2 h-11 w-full rounded-[10px] border border-[var(--border)] bg-[var(--surface-soft)] px-3 text-[13px] text-[var(--text)] outline-0 placeholder:text-[var(--faint)] focus:border-[var(--accent-strong)] focus:bg-[var(--surface)] focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--accent)_18%,transparent)]" autoFocus type="text" value={name} maxLength={100} onChange={(event) => setName(event.target.value)} placeholder="Token name" /></label>
                <fieldset className="mb-0 mt-[17px] border-0 p-0"><legend className="mb-[7px] block text-sm font-[650] text-[var(--text)]">Scopes</legend><div className="flex flex-col gap-2">{SCOPE_OPTIONS.map((scope) => <label className="relative grid w-fit max-w-full cursor-pointer grid-cols-[17px_minmax(0,1fr)] items-start gap-[9px]" key={scope.value}><input className="peer absolute opacity-0" type="checkbox" checked={scopes.includes(scope.value)} onChange={() => toggleScope(scope.value)} /><span className="mt-px grid size-[17px] place-items-center rounded border border-[var(--border)] bg-[var(--surface-soft)] text-transparent peer-checked:border-[var(--accent-strong)] peer-checked:bg-[var(--accent)] peer-checked:text-[var(--accent-text)] [&_svg]:w-[11px] [&_svg]:stroke-[2.5]"><CheckIcon /></span><span className="min-w-0"><strong className="block text-[13px] font-bold">{scope.value}</strong><small className="mt-[3px] block text-xs leading-[1.35] text-[var(--muted)]">{scope.description}</small></span></label>)}</div></fieldset>
              </div>
              <footer className="flex min-h-[66px] items-center justify-end gap-2 border-t border-[var(--border)] bg-[var(--surface-soft)] px-[22px] py-3 max-[700px]:px-[18px]"><button className="inline-flex h-[38px] min-w-[72px] cursor-pointer items-center justify-center rounded-[9px] border border-[var(--border)] bg-[var(--surface)] px-[15px] text-xs font-[750] text-[var(--text)] hover:bg-[var(--surface-strong)] disabled:cursor-not-allowed disabled:opacity-50" type="button" disabled={busy} onClick={() => setIsCreateOpen(false)}>Cancel</button><button className="inline-flex h-[38px] min-w-[72px] cursor-pointer items-center justify-center rounded-[9px] border border-[var(--accent)] bg-[var(--accent)] px-[15px] text-xs font-[750] text-[var(--accent-text)] shadow-[0_6px_18px_color-mix(in_srgb,var(--accent)_18%,transparent)] hover:border-[var(--accent-strong)] hover:bg-[var(--accent-strong)] disabled:cursor-not-allowed disabled:opacity-50" type="submit" disabled={busy || !name.trim() || scopes.length === 0}>{busy ? 'Creating…' : 'Create'}</button></footer>
            </form>
          </section>
        </div>
      )}

      {keyToRevoke && (
        <div className="fixed inset-0 z-120 grid place-items-center overflow-y-auto bg-[rgba(7,8,7,.62)] p-6 backdrop-blur-[6px] max-[700px]:p-[18px]" onMouseDown={(event) => { if (event.target === event.currentTarget && !revokingKeyId) setKeyToRevoke(null) }}>
          <section className="relative w-[min(430px,100%)] rounded-[20px] border border-[var(--border)] bg-[var(--surface)] p-7 text-center shadow-[0_28px_90px_rgba(0,0,0,.34)] max-[700px]:px-5 max-[700px]:pb-5 max-[700px]:pt-[25px]" role="alertdialog" aria-modal="true" aria-labelledby="revoke-key-title" aria-describedby="revoke-key-description">
            <button className="absolute right-3.5 top-3.5 grid size-8 cursor-pointer place-items-center rounded-[9px] border-0 bg-transparent text-[var(--muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--text)] disabled:cursor-wait disabled:opacity-55 [&_svg]:w-4" type="button" aria-label="Close revoke dialog" disabled={Boolean(revokingKeyId)} onClick={() => setKeyToRevoke(null)}><CloseIcon /></button>
            <span className="mx-auto mb-[17px] mt-0.5 grid size-12 place-items-center rounded-[14px] bg-[color-mix(in_srgb,var(--danger)_10%,var(--surface))] text-[var(--danger)] [&_svg]:w-[22px] [&_svg]:stroke-2"><TrashIcon /></span>
            <h3 className="m-0 text-[21px] font-[750] tracking-[-.025em]" id="revoke-key-title">Revoke API key?</h3>
            <p className="mb-0 mt-[9px] text-[13px] leading-normal text-[var(--muted)] [&_strong]:text-[var(--text)]" id="revoke-key-description">You are about to revoke <strong>{keyToRevoke.name}</strong>.</p>
            <div className="mt-5 rounded-xl border border-[color-mix(in_srgb,var(--danger)_22%,var(--border))] bg-[color-mix(in_srgb,var(--danger)_6%,var(--surface))] px-3.5 py-[13px] text-left"><strong className="block text-[11px] text-[var(--danger)]">This action cannot be undone.</strong><span className="mt-1 block text-[11px] leading-[1.45] text-[var(--muted)]">Applications using this key will immediately lose access.</span></div>
            <footer className="mt-[22px] grid grid-cols-2 gap-[9px]"><button className="inline-flex h-[42px] cursor-pointer items-center justify-center gap-[7px] rounded-[10px] border border-[var(--border)] bg-[var(--surface-soft)] text-xs font-[750] text-[var(--text)] hover:bg-[var(--surface-strong)] disabled:cursor-wait disabled:opacity-55" type="button" autoFocus disabled={Boolean(revokingKeyId)} onClick={() => setKeyToRevoke(null)}>Cancel</button><button className="inline-flex h-[42px] cursor-pointer items-center justify-center gap-[7px] rounded-[10px] border border-[var(--danger)] bg-[var(--danger)] text-xs font-[750] text-white shadow-[0_7px_20px_color-mix(in_srgb,var(--danger)_18%,transparent)] hover:brightness-105 disabled:cursor-wait disabled:opacity-55 [&_svg]:w-3.5" type="button" disabled={Boolean(revokingKeyId)} onClick={() => void revoke(keyToRevoke)}>{revokingKeyId ? 'Revoking…' : <><TrashIcon />Revoke key</>}</button></footer>
          </section>
        </div>
      )}
    </div>
  )
}
