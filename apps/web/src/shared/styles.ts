export const themeTokens = [
  '[--canvas:#e8eae8] [--surface:#fff] [--surface-soft:#f3f4f2] [--surface-strong:#e6e9e5]',
  '[--text:#0b0b0b] [--muted:#626661] [--faint:#878c86] [--border:#dde1dc]',
  '[--accent:#e5322d] [--accent-strong:#c92520] [--accent-text:#fff] [--danger:#dc4444]',
  '[--panel-shadow:0_18px_55px_rgba(25,31,25,.09)] [color-scheme:light]',
  'in-data-[theme=dark]:[--canvas:#101210] in-data-[theme=dark]:[--surface:#191c19]',
  'in-data-[theme=dark]:[--surface-soft:#232723] in-data-[theme=dark]:[--surface-strong:#2d322d]',
  'in-data-[theme=dark]:[--text:#f5f5f1] in-data-[theme=dark]:[--muted:#aeb3ac]',
  'in-data-[theme=dark]:[--faint:#858b84] in-data-[theme=dark]:[--border:#353b35]',
  'in-data-[theme=dark]:[--accent:#f0443f] in-data-[theme=dark]:[--accent-strong:#ff625d]',
  'in-data-[theme=dark]:[--accent-text:#fff] in-data-[theme=dark]:[--panel-shadow:0_18px_55px_rgba(0,0,0,.28)]',
  'in-data-[theme=dark]:[color-scheme:dark]',
].join(' ')

export const iconDefaults = '[&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-[1.8] [&_svg]:[stroke-linecap:round] [&_svg]:[stroke-linejoin:round]'
export const focusDefaults = '[&_button:focus-visible]:outline-3 [&_button:focus-visible]:outline-offset-2 [&_button:focus-visible]:outline-[color-mix(in_srgb,var(--accent)_72%,transparent)] [&_input:focus-visible]:outline-3 [&_input:focus-visible]:outline-offset-2 [&_input:focus-visible]:outline-[color-mix(in_srgb,var(--accent)_72%,transparent)] [&_select:focus-visible]:outline-3 [&_select:focus-visible]:outline-offset-2 [&_select:focus-visible]:outline-[color-mix(in_srgb,var(--accent)_72%,transparent)]'

export const eyebrow = 'mb-2 text-[10px] font-[850] uppercase tracking-[.14em] text-[var(--accent-strong)]'
export const sectionTitle = 'm-0 text-[clamp(30px,3vw,40px)] font-[800] leading-[1.08] tracking-[-.045em] text-[var(--text)]'
export const contentSection = 'mx-auto w-[min(1120px,calc(100%_-_48px))] py-[72px] max-[700px]:w-[calc(100%_-_32px)] max-[700px]:py-[54px]'
export const textLink = 'cursor-pointer border-0 bg-transparent text-[13px] font-semibold text-[var(--muted)] transition-colors hover:text-[var(--text)]'
export const primaryAction = 'inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg border border-[var(--accent)] bg-[var(--accent)] px-[18px] text-[13px] font-semibold text-[var(--accent-text)] transition-colors hover:border-[var(--accent-strong)] hover:bg-[var(--accent-strong)] disabled:cursor-not-allowed disabled:border-[var(--border)] disabled:bg-[var(--surface-strong)] disabled:text-[var(--faint)] [&_svg]:size-[17px]'
export const secondaryAction = 'inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-[18px] text-[13px] font-semibold text-[var(--text)] transition-colors hover:border-[var(--faint)] hover:bg-[var(--surface-soft)]'
export const alert = 'rounded-[11px] border border-[color-mix(in_srgb,var(--danger)_30%,transparent)] bg-[color-mix(in_srgb,var(--danger)_8%,var(--surface))] px-[13px] py-[11px] text-[11px] text-[var(--danger)]'

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

export function toneClass(category: string) {
  switch (category.toLowerCase().replaceAll(' ', '-')) {
    case 'all-tools': return '[--tone:#e5322d]'
    case 'pdf': return '[--tone:#ef4d43]'
    case 'documents': return '[--tone:#369dd8]'
    case 'spreadsheets': return '[--tone:#f6a313]'
    case 'images': return '[--tone:#2caf67]'
    case 'ocr': return '[--tone:#9855b6]'
    default: return '[--tone:#626661]'
  }
}
