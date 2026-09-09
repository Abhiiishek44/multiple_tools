import { GoogleSignInButton } from '../components/GoogleSignInButton'

export function LoginPage({ onBack }: { onBack: () => void }) {
  return (
    <main className="grid min-h-[calc(100vh-73px)] place-items-center bg-gradient-to-br from-slate-50 via-white to-blue-50 px-5 py-12" aria-labelledby="login-title">
      <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-[0_24px_70px_rgba(15,23,42,0.1)] sm:p-11">
        <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20" aria-hidden="true"><svg className="size-8 fill-none stroke-current stroke-[1.8]" viewBox="0 0 24 24"><path d="M7 7.5h8.5A3.5 3.5 0 0 1 19 11v1M17 9.5l2 2 2-2M17 16.5H8.5A3.5 3.5 0 0 1 5 13v-1M7 14.5l-2-2-2 2" /></svg></div>
        <span className="mt-7 block text-xs font-extrabold uppercase tracking-[0.18em] text-blue-600">Welcome to Convertly</span>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950" id="login-title">Log in to continue</h1>
        <p className="mx-auto mt-3 max-w-sm leading-7 text-slate-500">Sign in securely with Google to create conversion jobs and access your files.</p>
        <div className="mt-8"><GoogleSignInButton /></div>
        <p className="mt-6 text-xs leading-5 text-slate-400">We use your Google identity only to secure your account and conversion history.</p>
        <button className="mt-6 text-sm font-bold text-slate-500 transition hover:text-blue-600" type="button" onClick={onBack}>← Back to all tools</button>
      </section>
    </main>
  )
}
