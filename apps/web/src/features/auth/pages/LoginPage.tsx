import { GoogleSignInButton } from '../components/GoogleSignInButton'
import { BrandLogo } from '../../../shared/components/brand/BrandLogo'
import { LockIcon } from '../../../shared/components/icons/Icons'
import { textLink } from '../../../shared/styles'

export function LoginPage({ onBack }: { onBack: () => void }) {
  return (
    <main className="grid min-h-[calc(100vh-62px)] place-items-center bg-[var(--surface-soft)] p-6 max-[700px]:p-4" aria-labelledby="login-title">
      <section className="w-[min(460px,100%)] rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-[clamp(28px,5vw,44px)] text-center">
        <BrandLogo className="mx-auto h-9" />
        <div className="mx-auto my-7 h-px w-12 bg-[var(--border)]" aria-hidden="true" />
        <h1 className="m-0 text-[clamp(30px,4vw,38px)] font-[800] leading-[1.08] tracking-[-.045em]" id="login-title">Welcome back</h1>
        <p className="mx-auto mb-0 mt-3 max-w-[340px] text-sm leading-[1.65] text-[var(--muted)]">Continue with Google to manage API keys and your account securely.</p>
        <div className="mt-7"><GoogleSignInButton /></div>
        <div className="mt-6 flex items-center justify-center gap-2 border-t border-[var(--border)] pt-5 text-[11px] leading-[1.5] text-[var(--faint)] [&_svg]:size-3.5"><LockIcon /><span>Secure sign-in. We never access your Google files.</span></div>
        <button className={`${textLink} mt-5`} type="button" onClick={onBack}>Back to tools</button>
      </section>
    </main>
  )
}
