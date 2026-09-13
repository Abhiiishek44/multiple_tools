import { GoogleSignInButton } from '../components/GoogleSignInButton'

export function LoginPage({ onBack }: { onBack: () => void }) {
  return (
    <main className="login-page" aria-labelledby="login-title">
      <section className="login-card">
        <div className="login-mark" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M7 7.5h8.5A3.5 3.5 0 0 1 19 11v1M17 9.5l2 2 2-2M17 16.5H8.5A3.5 3.5 0 0 1 5 13v-1M7 14.5l-2-2-2 2" /></svg></div>
        <p className="eyebrow">Welcome to Multiple Tools</p>
        <h1 id="login-title">Log in to continue</h1>
        <p>Sign in securely with Google to create conversion jobs and access your files.</p>
        <div className="google-login"><GoogleSignInButton /></div>
        <small>We use your Google identity only to secure your account and conversion history.</small>
        <button className="text-link" type="button" onClick={onBack}>← Back to home</button>
      </section>
    </main>
  )
}
