import { GoogleSignInButton } from '../components/GoogleSignInButton'
import { eyebrow, textLink } from '../../../shared/styles'

export function LoginPage({ onBack }: { onBack: () => void }) {
  return (
    <main className="grid min-h-[calc(100vh-62px)] place-items-center p-[30px]" aria-labelledby="login-title">
      <section className="w-[min(430px,100%)] rounded-3xl border border-[var(--border)] bg-[var(--surface-soft)] p-[38px] text-center shadow-[var(--panel-shadow)]">
        <div className="mx-auto mb-[22px] grid size-[54px] place-items-center rounded-2xl bg-[var(--accent)] text-[var(--accent-text)] [&_svg]:w-[27px]" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M7 7.5h8.5A3.5 3.5 0 0 1 19 11v1M17 9.5l2 2 2-2M17 16.5H8.5A3.5 3.5 0 0 1 5 13v-1M7 14.5l-2-2-2 2" /></svg></div>
        <p className={eyebrow}>Welcome to Multiple Tools</p>
        <h1 className="m-0 text-3xl tracking-[-.045em]" id="login-title">Log in to continue</h1>
        <p className="text-xs leading-[1.65] text-[var(--muted)]">Sign in securely with Google to create conversion jobs and access your files.</p>
        <div className="mt-6"><GoogleSignInButton /></div>
        <small className="mt-5 block text-[9px] leading-normal text-[var(--faint)]">We use your Google identity only to secure your account and conversion history.</small>
        <button className={`${textLink} mt-5`} type="button" onClick={onBack}>← Back to home</button>
      </section>
    </main>
  )
}
